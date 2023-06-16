package com.informatica.mdm.solutions.pim.app;

import java.security.PrivateKey;
import java.security.PublicKey;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.HandlerInterceptor;

import com.delos.util.StringUtil;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.solutions.pim.model.IPIMConstants;
import com.informatica.mdm.solutions.pim.model.RestConstants;
import com.siperian.sif.client.CertificateHelper;
import com.siperian.sif.client.SiperianClient;
import com.siperian.sif.message.mrm.AuthenticateRequest;
import com.siperian.sif.message.mrm.AuthenticateResponse;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {

	private final static Logger log = LoggerFactory.getLogger(AuthenticationInterceptor.class);

	@Autowired
	@Qualifier(value = "sipClient")
	SiperianClient siperianClient;
	
	@Autowired
	RestTemplate restTemplate;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object obj)
			throws Exception {
		String orsId = getCookieByName(request,RestConstants.ORS_ID);
		String portalId = request.getHeader(RestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		if (StringUtil.isEmpty(orsId)) {
			log.error("Please provide ors Id");
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			return false;
		}
		try {
			String payload = getCookieByName(request, RestConstants.AUTH_PAYLOAD);
			String portalSessionId = getCookieByName(request, RestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
			if (!StringUtil.isEmpty(payload)) {
				String[] splitted = payload.split(CertificateHelper.AUTH_SECURITY_REST_PAYLOAD_DELIMETER);
				if (splitted != null && splitted.length > 1) {
					if(validateCertificate(splitted[0], splitted[1], orsId)) {
						return true;
					}else {
						response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
						return false;
					}
				}
			}
			else if(!StringUtil.isEmpty(portalSessionId)) {
				String ict = getCookieByName(request, IPIMConstants.MDM_CSRF_TOKEN_UI+"-"+orsId+"-"+portalId);
				if(!isSessionValid(request,portalSessionId,ict)) {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					return false;
				}
				return true;
				
			}
		} catch (Exception e) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			log.error(e.getMessage());
			return false;
		}
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		return false;
	}

	private String getCookieByName(HttpServletRequest request, String cookieName) {
		String cookieValue = null;
		Cookie[] cookies = request.getCookies();
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if (cookie.getName().equals(cookieName)) {
					cookieValue = cookie.getValue();
					break;
				}
			}
		}
		return cookieValue;
	}

	private boolean validateCertificate(String username, String payload, String orsId)
			throws Exception {
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
			PrivateKey privateKey = certificateHelper.getPrivateKey(RestConstants.HUB);
			if(StringUtil.isEmpty(applicationName)) {
				throw new Exception("Certificate key is null");
			}
			PublicKey publicKey = certificateHelper.getPublicKey(applicationName);
			return certificateHelper.validateCertificate(payload.getBytes(), privateKey, publicKey, "", orsId, "",username);
		} catch (Exception e) {
			log.error("Unable to validate certificate : "  + e.getMessage());
			return false;
		}
	}
	
	private AuthenticateResponse authenticate(Credentials credentials) {
		AuthenticateRequest authRequest = new AuthenticateRequest();
		if(!StringUtil.isEmpty(credentials.getUsername())) {
			authRequest.setUsername(credentials.getUsername());
		}
		authRequest.setSecurityPayload(credentials.getPayload());
		AuthenticateResponse response = (AuthenticateResponse) siperianClient.process(authRequest);
		return response;
	}
	
	private boolean isSessionValid(HttpServletRequest request,String sessionId,String ict) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.add(IPIMConstants.MDM_CSRF_TOKEN_HEADER, ict);
			headers.add(IPIMConstants.CONTENT_TYPE, IPIMConstants.APPLICATION_JSON);
			headers.add("Cookie", IPIMConstants.MDM_SESSION_ID_COOKIE+"="+sessionId);
			String url = String.format(IPIMConstants.MDM_SESSION_URL,portalCmxUrl ,IPIMConstants.SESSION_VALIDATE_ACTION);
			ResponseEntity<String> response;
			HttpEntity<?> httpRequest = null;
			httpRequest = new HttpEntity<Object>(headers);
			response = restTemplate.exchange(url, HttpMethod.POST, httpRequest, String.class);
			if(response.getStatusCode()==HttpStatus.OK)
				return true;
		} catch(Exception e) { 
			log.error("Error while validating session {}",e.getMessage());
		}
		return false;
	}
}
