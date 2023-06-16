package com.informatica.mdm.portal.metadata.auth.config;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.auth.service.AuthService;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.siperian.sif.message.mrm.AuthenticateResponse;

@Component
public class AuthorizationInterceptor implements HandlerInterceptor {

	private final static Logger log = LoggerFactory.getLogger(AuthorizationInterceptor.class);
	
	@Autowired
	private AuthService authService;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object obj)
			throws PortalConfigException {

		boolean flag = false;
		log.info("Authorizing the user role for api request {}", request.getRequestURI());
		String mdmSessionId = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_SESSION_ID_COOKIE);
		Credentials credentials = new Credentials((PortalRestConstants.PAYLOAD_MDM_SESSION + mdmSessionId).getBytes());
		AuthenticateResponse authenticateResponse = authService.authenticate(credentials);
		List<?> roles = authenticateResponse.getRoleNames();
		if (request.getRequestURI().startsWith(PortalRestConstants.RUNTIME_CONFIG_URI) ||
                request.getRequestURI().startsWith(PortalRestConstants.SAML_CONFIG_URI)) {
			log.info("Authorizing request for user role {} for api request {}", roles, request.getRequestURI());
			flag = authenticateResponse.isAdministrator() || roles.contains(PortalRestConstants.ROLE_APP_ADMIN);
		} else if (request.getRequestURI().startsWith(PortalRestConstants.PORTAL_CONFIG_URI)) {
			log.info("Authorizing Portal Config request for user role {} for api request {}", roles, request.getRequestURI());
			flag = authenticateResponse.isAdministrator();
		}

		if (!flag) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		}

		return flag;

	}
}
