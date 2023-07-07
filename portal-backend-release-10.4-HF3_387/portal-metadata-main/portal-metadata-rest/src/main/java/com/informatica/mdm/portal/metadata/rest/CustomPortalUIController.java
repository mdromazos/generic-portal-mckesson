package com.informatica.mdm.portal.metadata.rest;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.informatica.mdm.portal.metadata.auth.service.AuthService;
import com.informatica.mdm.portal.metadata.auth.service.AuthenticationDispatchService;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.exception.PortalLogoutException;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

import com.informatica.mdm.portal.metadata.config.HubClient;


import javax.servlet.http.Cookie;
import java.util.Map;
import java.io.PrintWriter;
import java.io.StringWriter;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.Serializable;

@RestController
@RequestMapping(value = "/portals")
public class CustomPortalUIController {
	
	private final static Logger log = LoggerFactory.getLogger(PortalUIController.class);

	@Autowired
	private PortalUIService portalUIService;

    @Autowired
	AuthService authService;

	@Autowired
	AuthenticationDispatchService authenticationDispatchService;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}


    @PostMapping(path = "/active/supplier/{portalId}/{recordId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateActiveSupplier(@RequestBody LoginData loginData, HttpServletRequest request,
            HttpServletResponse response, @PathVariable String portalId, @PathVariable String recordId) throws PortalLoginException {
        
        log.info("ENTER SET ACTIVE SUPPLIER");
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        log.info("ORS ID: " + orsId);
        // Map<String, Object> userInfo = commonLoginService(loginData, request, response, portalId, orsId, recordId);
        String mdmSessionId = PortalRestUtil.getCookieValue(request,
            PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
        log.info("MDM SESSION ID: " + mdmSessionId);
        try {
            HubClient hubClient = HubClient.getInstance();
            log.info("HUB CLIENT: " + hubClient);
            log.info("ADMIN LOGIN BEAN: " + hubClient.getAdminLoginBean());
            
            Map<String, Object> userSession = (Map<String, Object>) hubClient.getAdminLoginBean()
            .getSessionAttribute(mdmSessionId, PortalRestConstants.USER_SESSION_ATTRIB);
            userSession.put(PortalRestConstants.RECORD_ID, recordId);
            log.info("USER SESSION: " + ((Object)userSession));

            // ObjectMapper mapper = new ObjectMapper();
            // String userSessionStr = mapper.writerWithDefaultPrettyPrinter()
            //     .writeValueAsString(userSession);

            hubClient.getAdminLoginBean().putSessionAttribute(mdmSessionId, PortalRestConstants.USER_SESSION_ATTRIB, 
                ((java.io.Serializable)userSession));
        } catch (Exception e) {
            StringWriter writer = new StringWriter();
            PrintWriter printWriter = new PrintWriter( writer );
            e.printStackTrace( printWriter );
            printWriter.flush();

            String stackTrace = writer.toString();
            log.error(stackTrace);
        }

        return new ResponseEntity<>("", HttpStatus.OK);
    }

    // private Map<String, Object> commonLoginService(LoginData loginData, HttpServletRequest request,
    //         HttpServletResponse response, String portalId, String orsId, String recordId) throws PortalLoginException {

    //     log.info("PortalUI - Invoking Login API");
    //     String userName = loginData.getUsername();
    //     String password = loginData.getPassword();
    //     Map<String, Object> userInfo = authService.getUserInfo(loginData, orsId, portalId);
    //     userInfo.put(PortalRestConstants.RECORD_ID, recordId);

    //     log.info("PortalUI - Login userInfo {}", userInfo);
    //     String sessionId;
    //     if (StringUtils.isNotEmpty(loginData.getSessionIndex())) {
    //         sessionId = loginData.getSessionIndex();
    //     } else {
    //         sessionId = request.getSession().getId();
    //     }
    //     if (sessionId != null)
    //         sessionId += '-' + System.currentTimeMillis();
    //     log.info("PortalUI - Invoking Login for username {}", userName);
    //     userInfo.put(PortalRestConstants.SESSION_TIMEOUT, loginData.getSessionTimeOut() * 60);
    //     Map<String, Object> userNode = authService.login(userName, password, sessionId, true, userInfo, portalCmxUrl);
    //     response.addCookie(
    //             PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId,
    //                     sessionId, PortalRestConstants.PORTAL_UI_PATH, true, true));
    //     response.addCookie(
    //             PortalRestUtil.createCookie(PortalRestConstants.MDM_CSRF_TOKEN_UI + "-" + orsId + "-" + portalId,
    //                     (String) userNode.get(PortalRestConstants.MDM_CSRF_TOKEN_HEADER),
    //                     PortalRestConstants.PORTAL_UI_PATH, true, true));
    //     userInfo.putAll(userNode);
    //     userInfo.remove(PortalRestConstants.SESSION_TIMEOUT);
    //     userInfo.remove(PortalRestConstants.MDM_CSRF_TOKEN_HEADER);
    //     return userInfo;
    // }

}