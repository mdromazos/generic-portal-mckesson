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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RestController
@RequestMapping(value = "/portals")
public class PortalUIController {
	
	private final static Logger log = LoggerFactory.getLogger(PortalUIController.class);

	@Autowired
	private PortalUIService portalUIService;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}
	
    @GetMapping(path = "/**", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> getPortalConfigModel(@RequestParam(required = false) Integer depth,
                                         @RequestParam(required = false) String filter,
                                         @RequestParam(required = false) String sort,
                                         @RequestParam(required = false) String sortOrder,
                                         @RequestParam(required = false) Integer currentPage,
                                         @RequestParam(required = false) Integer pageSize,
                                         @RequestParam(required = false) List<String> projections,
                                         @RequestParam(required = false) Boolean resolveExtConfig,
                                         HttpServletRequest request) throws PortalConfigException, IOException {

        log.info("Fetch portal UI config model");
        List<String> portalNodes = PortalRestUtil.parsePortalUrl(request.getRequestURI());
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        String portalId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
        PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, null,
                portalNodes, filter, sort, sortOrder, depth, currentPage, pageSize, projections, resolveExtConfig);

        log.info("Portal Nodes to fetch: {}, Ors: {}", portalNodes, orsId);
        restConfig.setInitialApiUrl(portalCmxUrl);
        restConfig.setLocale(PortalRestUtil.getCookieValue(request, "selectedLocale"));

        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
        restConfig.setMdmSessionId(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId));
        String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_UI+"-"+orsId+"-"+portalId);
        JsonNode portal = portalUIService.getPortalConfigModel(credentials, restConfig,ict);
        return new ResponseEntity<>(portal, HttpStatus.OK);
    }
    
    @PostMapping(path = "/entities/{beName}/users", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> createUser(@RequestBody JsonNode payloadNode,
    										   @PathVariable String beName, @RequestParam String systemName,
    										   HttpServletRequest request) throws PortalConfigException {
    	
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	JsonNode userResponse = portalUIService.addUser(request, orsId, beName, payloadNode, systemName);
    	return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
    }
    
    @DeleteMapping(path = "/entities/{beName}/users/{username}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteUser(@RequestBody JsonNode payloadNode, @PathVariable String beName,
    									@PathVariable String username, @RequestParam String systemName,
    										   HttpServletRequest request) throws PortalConfigException {
    	
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	portalUIService.deleteUser(request, orsId, username, beName, payloadNode, systemName);
    	return new ResponseEntity<>(HttpStatus.OK);
    }
    
    @GetMapping(path = "/{portalId}/locales", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> getPortalLocales(@PathVariable String portalId,
            										HttpServletRequest request) throws PortalConfigException {
    	
    	log.info("Get Available locales for portal id {}", portalId);
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
    	JsonNode locales = portalUIService.getAvailableLocales(credentials, orsId, portalId);
    	return new ResponseEntity<>(locales, HttpStatus.OK);
    }
    
    @PostMapping(path = "/state/{portalId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> updateState(@RequestBody JsonNode payloadNode,
    										   @PathVariable String portalId, @RequestParam String systemName,
    										   HttpServletRequest request) throws PortalConfigException {
    	
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	portalUIService.updatePortalStatus(request, orsId, systemName, payloadNode);
    	return new ResponseEntity<>(HttpStatus.OK);
    }
    
    @GetMapping(path = "entities/{beName}/users", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getUsers(@PathVariable String beName, @RequestParam(required = false) String username, 
			HttpServletResponse response, HttpServletRequest request) throws PortalConfigException {

		log.info("Portal Config - Invoking Fetch Users API");
		ArrayNode users = portalUIService.getHubUser(username);
		log.info("Portal Config - Invoking Fetched Users {}", users);
		return new ResponseEntity<>(users, HttpStatus.OK);
	}

    @PostMapping(path = "preferences/users/{userId}/", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> savePreference(@RequestBody JsonNode payloadNode,
                                                     @PathVariable String userId,
                                                     HttpServletRequest request) throws PortalConfigException {

        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);

		String appId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);

        JsonNode savedPreference = portalUIService.savePortalPreference(appId, userId, orsId, null, payloadNode);

        return new ResponseEntity<>(savedPreference, HttpStatus.OK);
    }

	@PutMapping(path = "preferences/users/{userId}/{id}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JsonNode> updatePreference(@RequestBody JsonNode payloadNode,
													  @PathVariable String userId,
													  @PathVariable String id,
													  HttpServletRequest request) throws PortalConfigException {

		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String appId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);

		JsonNode savedPreference = portalUIService.savePortalPreference(appId, userId, orsId, id, payloadNode);

		return new ResponseEntity<>(savedPreference, HttpStatus.OK);
	}

	@GetMapping(path = "preferences/users/{userId}/", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getUserPreference(@PathVariable String userId, @RequestParam(required = false) String id,
									  HttpServletResponse response, HttpServletRequest request) throws PortalConfigException {

		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String appId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);

		JsonNode userPreference = portalUIService.getPortalPreference(appId, userId, orsId, id);

		return new ResponseEntity<>(userPreference, HttpStatus.OK);
	}

    @DeleteMapping(path = "preferences/users/{userId}/", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteUserPreference(@PathVariable String userId, @RequestParam(required = false) String id,
                                                         HttpServletRequest request,HttpServletResponse response)
			throws PortalConfigException, IOException {

        log.info("Delete portal user preferences");

        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        String appId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);

        log.info("Portal Preferences to delete user: {}, Ors: {}, Portal Id : {}", userId, orsId, appId);

        portalUIService.deletePortalPreference(appId, userId, orsId, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
