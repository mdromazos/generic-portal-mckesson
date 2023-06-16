package com.informatica.mdm.portal.metadata.rest;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.auth.service.AuthService;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RestController
@RequestMapping(value = "/config")
public class PortalConfigLoginController {

	private final static Logger log = LoggerFactory.getLogger(PortalConfigLoginController.class);
	
	@Autowired
	AuthService authService;
	
	@Autowired
	PortalPersistenceService portalPersistenceService;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}

	@GetMapping(path = "/session", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> isSessionValid(HttpServletResponse response, HttpServletRequest request,
			@RequestParam String action) throws PortalLoginException {

		log.info("Portal Config - Invoking Session Valid API");
		String mdmSessionId = PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_CONFIG);
		boolean isValid = PortalRestUtil.isSessionValid(request,mdmSessionId,ict);
		log.info("Portal Config - Invoking Session Valid API isValid {}", isValid);
		if (isValid)
			return new ResponseEntity<>(HttpStatus.OK);
		else
			return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}
	
	@GetMapping(path = "/roles", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getORSRoles(HttpServletResponse response, HttpServletRequest request)
			throws PortalConfigException {

		log.info("Portal Config - Invoking Fetch Roles API");
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		ArrayNode roles = portalPersistenceService.getORSRoles(credentials, orsId);
		log.info("Portal Config - Invoking Fetched Roles {}", roles);
		return new ResponseEntity<>(roles, HttpStatus.OK);
	}


	@RequestMapping(value = "/login", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, Object>> login(@RequestBody String jsonObj, HttpServletRequest request,
			HttpServletResponse response) throws PortalLoginException {

		log.info("Portal Config - Invoking Login API");
		JSONObject obj = new JSONObject(jsonObj);
		String userName = obj.get(PortalRestConstants.USERNAME).toString().trim();
		String password = obj.get(PortalRestConstants.PASSWORD).toString();
		String sessionId = request.getSession().getId();
		if (sessionId != null)
			sessionId += '-' + System.currentTimeMillis();
		log.info("Portal Config - Invoking Login for username {}", userName);
		Map<String, Object> userInfo = new HashMap<String, Object>();
		Map<String, Object> userNode = authService.login(userName, password, sessionId, false, userInfo,portalCmxUrl);
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.MDM_CSRF_TOKEN_CONFIG, (String)userNode.get(PortalRestConstants.MDM_CSRF_TOKEN_HEADER), 
				PortalRestConstants.CONFIG_UI_PATH, true, true));
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.CONFIG_UI_COOKIE, sessionId,
				PortalRestConstants.CONFIG_UI_PATH, true, true));
		response.setHeader(PortalRestConstants.MDM_CSRF_TOKEN_CONFIG,(String)userNode.get(PortalRestConstants.MDM_CSRF_TOKEN_HEADER));
		userNode.remove(PortalRestConstants.MDM_CSRF_TOKEN_HEADER);
		return new ResponseEntity<>(userNode, HttpStatus.OK);
	}

	@RequestMapping(value = "/logout", method = RequestMethod.PUT)
	public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response)
			throws PortalLoginException {

		log.info("Portal Config - Invoking Logout API");
		Cookie cookie = PortalRestUtil.createCookie(PortalRestConstants.CONFIG_UI_COOKIE, StringUtils.EMPTY,
				PortalRestConstants.CONFIG_UI_PATH, false, true);
		Cookie mdmcsrfCookie = PortalRestUtil.createCookie(PortalRestConstants.MDM_CSRF_TOKEN_CONFIG, StringUtils.EMPTY,
				PortalRestConstants.PORTAL_UI_PATH, false, true);
		String mdmSessionId = PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_CONFIG);
		boolean isValid = PortalRestUtil.isSessionValid(request,mdmSessionId,ict);
		log.info("Portal Config - Logout API is isSessionValid {}", isValid);
		if (isValid) {
			cookie.setMaxAge(0);
			mdmcsrfCookie.setMaxAge(0);
			response.addCookie(cookie);
			response.addCookie(mdmcsrfCookie);
			log.info("Portal Config - Invoking Logout Service");
			authService.logout(request, PortalRestConstants.CONFIG_UI_COOKIE,ict);
		}

		return new ResponseEntity<>(HttpStatus.OK);
	}

}
