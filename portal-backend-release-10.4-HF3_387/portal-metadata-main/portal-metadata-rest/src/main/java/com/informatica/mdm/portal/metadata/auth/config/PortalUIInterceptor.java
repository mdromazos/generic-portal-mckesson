package com.informatica.mdm.portal.metadata.auth.config;

import java.io.UnsupportedEncodingException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.delos.util.StringUtil;
import com.informatica.mdm.portal.metadata.exception.PortalBadRequestException;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sif.client.CertificateHelper;

@Component
public class PortalUIInterceptor implements HandlerInterceptor {

	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

    private final static Logger log = LoggerFactory.getLogger(PortalUIInterceptor.class);
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object obj)
			throws UnsupportedEncodingException, ServletException, AccessException, PortalBadRequestException, Exception {
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		String portalSessionId = PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
		String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_UI+"-"+orsId+"-"+portalId);
		log.info("Validating mdm session for uri {}", request.getRequestURI());
		Boolean flag = false;
		
		if(request.getRequestURI().matches(PortalRestConstants.ADD_USERS_URI) || 
				request.getRequestURI().matches(PortalRestConstants.UPDATE_STATE_URI) || request.getRequestURI().matches(PortalRestConstants.USER_PREFERENCE_URI)) {
			flag = validateDatabaseId(orsId);
			if(flag &&  StringUtils.isEmpty(portalSessionId)) {
				String mdmAuthPayload = request.getHeader(PortalServiceConstants.AUTH_SECURITY_PAYLOAD);
				if(!StringUtils.isEmpty(mdmAuthPayload)) {
					String[] splitted = mdmAuthPayload.split(CertificateHelper.AUTH_SECURITY_REST_PAYLOAD_DELIMETER);
					if (splitted != null && splitted.length > 1) {
						if(validateCertificate(splitted[0], splitted[1], orsId)) {
							return true;
						}
					}
					
				} else {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					return false;
				}
			}else {
				if(flag) {
					flag = isValidSession(portalSessionId, response,request,ict);
					}
			}
		}
		else if(request.getRequestURI().startsWith(PortalRestConstants.GLOBAL_CONFIG_URI)) {
			flag = validateDatabaseId(orsId);
		}else if ((request.getRequestURI().startsWith(PortalRestConstants.PORTAL_URI)
				&& (request.getMethod().equalsIgnoreCase(RequestMethod.GET.name())
						|| request.getMethod().equalsIgnoreCase(RequestMethod.POST.name())
						|| request.getMethod().equalsIgnoreCase(RequestMethod.DELETE.name())))){
			flag = validateDatabaseId(orsId);
			if(flag) {
			flag = isValidSession(portalSessionId, response,request,ict);
			}
		}
		else {
			flag = isValidSession(portalSessionId, response,request,ict);
		}
		return flag;
	}

	private boolean validateDatabaseId(String orsId) throws PortalBadRequestException {
		if (StringUtils.isEmpty(orsId)) {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG101,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG101), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG101));
		}
		return StringUtils.isNotEmpty(orsId);
	}
	
	private boolean isValidSession(String portalSessionId,HttpServletResponse response,HttpServletRequest request,String ict) {
		if (!PortalRestUtil.isSessionValid(request,portalSessionId,ict)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			return false;
		}
		return true;
	}
	
	private boolean validateCertificate(String username, String payload, String orsId) throws Exception {
		String applicationName = null;
		try {
			String originalUsername = username;
			if (originalUsername != null && originalUsername.contains("/")) {
				String[] userInst = originalUsername.split("/");
				if (userInst[1] != null && !StringUtil.isEmpty(userInst[1])) {
					applicationName = userInst[0];
					username = userInst[1];
				} else if (userInst[0] != null && !StringUtil.isEmpty(userInst[0])) {
					username = userInst[0];
				}
			}
			CertificateHelper certificateHelper = CertificateHelper.getInstance();
			PrivateKey privateKey = certificateHelper.getPrivateKey(PortalRestConstants.HUB);
			if(StringUtil.isEmpty(applicationName)) {
				throw new Exception("Certificate key is null");
			}
			PublicKey publicKey = certificateHelper.getPublicKey(applicationName);
			return certificateHelper.validateCertificate(payload.getBytes(), privateKey, publicKey, "", orsId, "",username);
		} catch (Exception e) {
			return false;
		}
	}

}
