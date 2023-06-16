package com.informatica.mdm.portal.metadata.auth.config;

import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.informatica.mdm.portal.metadata.exception.PortalBadRequestException;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@Component
public class PortalConfigInterceptor implements HandlerInterceptor {

	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		String configSessionId = PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_CONFIG);
		if(!PortalRestUtil.isSessionValid(request,configSessionId,ict)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			return false;
		}
		Boolean flag = false;
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalVersion = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION);
		if(StringUtils.isNotEmpty(portalVersion) && !StringUtils.isNumeric(portalVersion)) {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG102,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG102), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG102));
		}
		
		flag = handlePortalUri(request, orsId, portalVersion);
		if(flag) {
			return flag;
		} else {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG716,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
		}
	}
	
	private boolean handlePortalUri(HttpServletRequest request, String orsId, String portalVersion) throws PortalBadRequestException {

		boolean flag = false;

		if (request.getRequestURI().matches(PortalRestConstants.REFERENCE_URI_REGEX)
				|| PortalRestConstants.DATABASE_URI.equalsIgnoreCase(request.getRequestURI())) {
			flag = true;

		}else if(request.getRequestURI().startsWith(PortalRestConstants.RUNTIME_CONFIG_URI)
                || request.getRequestURI().startsWith(PortalRestConstants.SAML_CONFIG_URI)) {
			flag = validateDatabaseId(orsId);
		} else if (request.getRequestURI().equalsIgnoreCase(
				StringUtils.join(PortalRestConstants.PORTAL_CONFIG_URI, PortalMetadataContants.PORTAL_ATTRIBUTE))) {

			if (request.getMethod().equalsIgnoreCase(RequestMethod.POST.name())) {
				flag = validateDatabaseId(orsId);
			} else if (request.getMethod().equalsIgnoreCase(RequestMethod.GET.name())) {
				flag = true;
			}

		} else if (request.getRequestURI().equalsIgnoreCase(PortalRestConstants.PORTAL_CONFIG_URI_ROLES)  
				|| request.getRequestURI().matches(PortalRestConstants.BE_LOOKUP_URI) || request.getRequestURI().matches(PortalRestConstants.EXPORT_URI)
				|| request.getRequestURI().matches(PortalRestConstants.IMPORT_URI) || request.getRequestURI().matches(PortalRestConstants.BUNDLES_URI)
				|| request.getRequestURI().matches(PortalRestConstants.PORTAL_STATUS_URI) || request.getRequestURI().matches(PortalRestConstants.PORTAL_STATE_URI)) {

			flag = validateDatabaseId(orsId);

		} else if (request.getRequestURI().startsWith(
				StringUtils.join(PortalRestConstants.PORTAL_CONFIG_URI, PortalMetadataContants.PORTAL_ATTRIBUTE))) {
			if ((request.getMethod().equalsIgnoreCase(RequestMethod.POST.name())
					&& PortalMetadataContants.PORTAL_CONFIG_URI_PUBLISH_ACTION.equalsIgnoreCase(request.getParameter(PortalMetadataContants.PORTAL_CONFIG_URI_ACTION_PARAM)))
					|| request.getMethod().equalsIgnoreCase(RequestMethod.DELETE.name())) {
				flag = validateDatabaseId(orsId);
			} else {
				flag = validateDatabaseId(orsId) && validateVersion(portalVersion);
			}
			
		}else if(request.getRequestURI().startsWith(PortalRestConstants.CONFIG_UI_LOGOUT)) {
			flag=true;
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
	
	private boolean validateVersion(String portalVersion) throws PortalBadRequestException {
		
		if (StringUtils.isEmpty(portalVersion)) {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG100,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG100), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG100));
		}
		return StringUtils.isNotEmpty(portalVersion);
	}
	
}
