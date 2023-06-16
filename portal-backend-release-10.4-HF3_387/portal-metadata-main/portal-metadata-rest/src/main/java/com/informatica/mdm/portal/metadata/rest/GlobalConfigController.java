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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.gson.Gson;
import com.informatica.mdm.portal.metadata.auth.service.PortalProxyService;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.model.SignupData;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RestController
@RequestMapping(value = "/global")
public class GlobalConfigController {
	
	private final static Logger log = LoggerFactory.getLogger(GlobalConfigController.class);
	
	@Autowired
	private PortalUIService portalUIService;
	
	@Autowired
	private PortalProxyService portalProxyService;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}
	
	@RequestMapping(value= {"/portals/{portalId}"} ,method = RequestMethod.GET)
	public ResponseEntity<JsonNode> getGlobalConfiguration(@PathVariable String portalId, HttpServletResponse response, 
					HttpServletRequest request) throws PortalConfigException{
		
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String selectedLocale = PortalRestUtil.getCookieValue(request, "selectedLocale");
		JsonNode portalObject = portalUIService.getGlobalPortal(null, portalId, orsId, portalCmxUrl, selectedLocale,null);
		return new ResponseEntity<>(portalObject, HttpStatus.OK);
	}
	
	@RequestMapping(value = {"/portals/signup/{beName}"}, method= RequestMethod.POST)
	public ResponseEntity<?> signUp(@PathVariable String beName, @RequestBody String jsonBody, 
					@RequestParam String systemName, HttpServletResponse response,
					HttpServletRequest request) throws Exception {
		
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		SignupData signupData = new Gson().fromJson(jsonBody, SignupData.class);
		portalUIService.persistUser(null, orsId, beName, signupData, request, systemName);
		return new ResponseEntity<>(HttpStatus.CREATED);
		
	}
	
	@RequestMapping(value = "/proxy", method= RequestMethod.POST)
	public ResponseEntity<JsonNode> globalProxy(@RequestBody JsonNode payloadNode,
												HttpServletResponse response, 
												HttpServletRequest request) throws Exception {
		
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		JsonNode responseNode = portalProxyService.invokeProxyByTrustedApp(payloadNode, orsId, request);
		return new ResponseEntity<>(responseNode, HttpStatus.OK);
		
	}
	
	@RequestMapping(value= {"/runtime/portals/{portalId}"} ,method = RequestMethod.GET)
	public ResponseEntity<JsonNode> getGlobalRuntimeConfig(@PathVariable String portalId,
														   @RequestParam(required = false) String filter,
														   @RequestParam(required = false) List<String> projections,
														   HttpServletResponse response, HttpServletRequest request)
														   throws PortalConfigException, IOException {
		
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, filter, projections);
		JsonNode portalObject = portalUIService.getRuntimeConfig(null, portalId, restConfig);
		return new ResponseEntity<>(portalObject, HttpStatus.OK);
	}
	
	@GetMapping(path = "portals/{portalId}/bundles", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> downloadBundles(@PathVariable String portalId,HttpServletRequest request,HttpServletResponse response) throws PortalConfigException{
		String locale = PortalRestUtil.getCookieValue(request, PortalRestConstants.LOCALE);
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	JsonNode responseNode = portalUIService.getBundleFromLocale(null, portalId,orsId, locale);
    	return new ResponseEntity<>(responseNode,HttpStatus.OK);
    }
	
    @GetMapping(path = "/portals/{portalId}/locales", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> getPortalLocales(@PathVariable String portalId,
            										HttpServletRequest request) throws PortalConfigException {
    	
    	log.info("Global Api - Get Available locales for portal id {}", portalId);
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	JsonNode locales = portalUIService.getAvailableLocales(null, orsId, portalId);
    	return new ResponseEntity<>(locales, HttpStatus.OK);
    }
	
}
