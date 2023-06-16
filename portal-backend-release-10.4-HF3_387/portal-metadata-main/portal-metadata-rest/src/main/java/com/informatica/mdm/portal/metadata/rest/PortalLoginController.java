package com.informatica.mdm.portal.metadata.rest;

import com.informatica.mdm.portal.metadata.auth.service.AuthService;
import com.informatica.mdm.portal.metadata.auth.service.AuthenticationDispatchService;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.exception.PortalLogoutException;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping(value = "/portals")
public class PortalLoginController {

	private final static Logger log = LoggerFactory.getLogger(PortalLoginController.class);

	@Autowired
	AuthService authService;

	@Autowired
	AuthenticationDispatchService authenticationDispatchService;

	private String portalCmxUrl;

	@Value("${portal.cmx.url}")
	public void setCmxUrl(String url) {
		portalCmxUrl = url;
		if (null != portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl = portalCmxUrl.substring(0, portalCmxUrl.length() - 1);
		}
	}

	@GetMapping(path = "/session/{portalId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> isSessionValid(HttpServletResponse response, HttpServletRequest request,
			@RequestParam String action, @PathVariable String portalId) throws PortalLoginException {

		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		log.info("PortalUI - Invoking Session Valid API");
		String mdmSessionId = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
		String ict = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.MDM_CSRF_TOKEN_UI + "-" + orsId + "-" + portalId);
		boolean isValid = PortalRestUtil.isSessionValid(request, mdmSessionId, ict);
		log.info("PortalUI - Invoking Session Valid API isValid {}", isValid);
		if (isValid)
			return new ResponseEntity<>(HttpStatus.OK);
		else
			return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	}

	@RequestMapping(value = "/login/{provider}/{orsId}/{portalId}", method = RequestMethod.GET)
	public ResponseEntity<?> verifySSO(HttpServletRequest request, HttpServletResponse response,
			@PathVariable String provider, @PathVariable String orsId, @PathVariable String portalId,
			@RequestParam(required = false) Boolean validate) throws PortalLoginException {
		log.info("PortalUI - Invoking custom authentication sso api");
		authenticationDispatchService.dispatch(request, response, provider, orsId, portalId, validate);
		return new ResponseEntity<>(HttpStatus.OK);

	}

	@RequestMapping(value = "/login/{portalId}", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, Object>> login(@RequestBody LoginData loginData, HttpServletRequest request,
			HttpServletResponse response, @PathVariable String portalId) throws PortalLoginException {
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		Map<String, Object> userInfo = commonLoginService(loginData, request, response, portalId, orsId);
		return new ResponseEntity<>(userInfo, HttpStatus.OK);
	}

	@RequestMapping(value = "/login/saml/{orsId}/{portalId}", method = RequestMethod.POST)
	public void verifyPOSTSSO(HttpServletRequest request, HttpServletResponse response, @PathVariable String orsId,
			@PathVariable String portalId) throws PortalLoginException {
		Map<String, Object> userInfo = null;
		LoginData loginData = authenticationDispatchService.process(request, response, orsId, portalId);
		if (null != loginData) {
			try {
				userInfo = commonLoginService(loginData, request, response, portalId, orsId);
				response.addCookie(PortalRestUtil.createCookie(
						PortalRestConstants.PORTAL_UI_PROVIDER + "-" + orsId + "-" + portalId, "SAML",
						PortalRestConstants.PORTAL_UI_PATH, true, true));
				response.addCookie(
						PortalRestUtil.createCookie(PortalRestConstants.NAME_ID + "-" + orsId + "-" + portalId,
								loginData.getSamlNameId(), PortalRestConstants.PORTAL_UI_PATH, true, true));
				authenticationDispatchService.loginSuccessRedirectHandler(request, response, portalId, orsId, userInfo);
			} catch (PortalLoginException e) {
				authenticationDispatchService.redirectLoginPage(request, response, orsId, portalId, "PORTAL632");
			}
			return;
		}
		authenticationDispatchService.redirectLoginPage(request, response, orsId, portalId, null);
	}

	private Map<String, Object> commonLoginService(LoginData loginData, HttpServletRequest request,
			HttpServletResponse response, String portalId, String orsId) throws PortalLoginException {

		log.info("PortalUI - Invoking Login API");
		String userName = loginData.getUsername();
		String password = loginData.getPassword();
		Map<String, Object> userInfo = authService.getUserInfo(loginData, orsId, portalId);
		log.info("PortalUI - Login userInfo {}", userInfo);
		String sessionId;
		if (StringUtils.isNotEmpty(loginData.getSessionIndex())) {
			sessionId = loginData.getSessionIndex();
		} else {
			sessionId = request.getSession().getId();
		}
		if (sessionId != null)
			sessionId += '-' + System.currentTimeMillis();
		log.info("PortalUI - Invoking Login for username {}", userName);
		userInfo.put(PortalRestConstants.SESSION_TIMEOUT, loginData.getSessionTimeOut() * 60);
		Map<String, Object> userNode = authService.login(userName, password, sessionId, true, userInfo, portalCmxUrl);
		response.addCookie(
				PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId,
						sessionId, PortalRestConstants.PORTAL_UI_PATH, true, true));
		response.addCookie(
				PortalRestUtil.createCookie(PortalRestConstants.MDM_CSRF_TOKEN_UI + "-" + orsId + "-" + portalId,
						(String) userNode.get(PortalRestConstants.MDM_CSRF_TOKEN_HEADER),
						PortalRestConstants.PORTAL_UI_PATH, true, true));
		userInfo.putAll(userNode);
		userInfo.remove(PortalRestConstants.SESSION_TIMEOUT);
		userInfo.remove(PortalRestConstants.MDM_CSRF_TOKEN_HEADER);
		return userInfo;
	}

	@RequestMapping(value = "/logout/{portalId}", method = RequestMethod.PUT)
	public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response,
			@PathVariable String portalId) throws PortalLogoutException, PortalLoginException {

		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		log.info("PortalUI - Invoking Logout API");
		Cookie cookie = PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId,
				StringUtils.EMPTY, PortalRestConstants.PORTAL_UI_PATH, false, true);
		Cookie mdmcsrfCookie = PortalRestUtil.createCookie(
				PortalRestConstants.MDM_CSRF_TOKEN_UI + "-" + orsId + "-" + portalId, StringUtils.EMPTY,
				PortalRestConstants.PORTAL_UI_PATH, false, true);
		String mdmSessionId = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
		String ict = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.MDM_CSRF_TOKEN_UI + "-" + orsId + "-" + portalId);
		String samlNameId = PortalRestUtil.getCookieValue(request, PortalRestConstants.NAME_ID + "-" + orsId + "-" + portalId);
		boolean isValid = PortalRestUtil.isSessionValid(request, mdmSessionId, ict);
		log.info("PortalUI - Logout API is isSessionValid {}", isValid);
		if (isValid) {
			cookie.setMaxAge(0);
			mdmcsrfCookie.setMaxAge(0);
			response.addCookie(cookie);
			response.addCookie(mdmcsrfCookie);
			log.info("PortalUI - Invoking Logout Service");
			authService.logout(request, PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId, ict);
			if (samlNameId != null) {
				log.info("PortalUI - Invoking SAML Logout Service");
				Map<String, String> samlLogoutUrl = authenticationDispatchService.dispatchLogout(request, response,
						samlNameId, orsId, portalId);
				if(samlLogoutUrl!=null)
					return new ResponseEntity<>(samlLogoutUrl, HttpStatus.OK);
			}
		}

		return new ResponseEntity<>(HttpStatus.OK);
	}

	@RequestMapping(value = "/session/{portalId}/{sessionTimeOut}", method = RequestMethod.POST)
	public ResponseEntity<Map<String, Object>> refreshSession(HttpServletRequest request, HttpServletResponse response,
			@PathVariable Integer sessionTimeOut, @PathVariable String portalId) throws PortalLoginException {

		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		log.info("PortalUI - Invoking Refresh Session API");
		String portalSessionId = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
		String ict = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.MDM_CSRF_TOKEN_UI + "-" + orsId + "-" + portalId);
		authService.refreshSession(request, portalSessionId, sessionTimeOut, ict);
		return new ResponseEntity<>(HttpStatus.OK);
	}

}
