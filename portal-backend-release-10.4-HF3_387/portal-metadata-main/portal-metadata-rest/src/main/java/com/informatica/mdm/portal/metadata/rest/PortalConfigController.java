package com.informatica.mdm.portal.metadata.rest;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalConfigService;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

@RestController
@RequestMapping(value = "/config")
public class PortalConfigController {

    private final static Logger log = LoggerFactory.getLogger(PortalConfigController.class);

    @Autowired
    private PortalConfigService portalConfigService;
    
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

        log.info("Fetch portal config model");
        List<String> portalNodes = PortalRestUtil.parseConfigUrl(request.getRequestURI());
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        Integer version = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION) != null
        		? Integer.valueOf(request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION)) : null;

        PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, version,
                portalNodes, filter, sort, sortOrder, depth, currentPage, pageSize, projections, resolveExtConfig);

        log.info("Portal Nodes to fetch: {}, Ors: {}, Version: {}", portalNodes, orsId, version);
        String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_CONFIG);
        restConfig.setInitialApiUrl(portalCmxUrl);
        restConfig.setLocale(PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_LOCAL_COOKIE));

        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
        restConfig.setMdmSessionId(PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_COOKIE));
        JsonNode portal = portalConfigService.getPortalConfigModel(credentials, restConfig,ict);
        return new ResponseEntity<>(portal, HttpStatus.OK);
    }

    @PostMapping(path = "/**", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> createPortalConfigModel(@RequestBody JsonNode payloadNode,
    											 @RequestParam(required = false) String action,
                                                 HttpServletRequest request) throws PortalConfigException {

        log.info("Creating Portal Config node..");

        List<String> portalNodes = PortalRestUtil.parseConfigUrl(request.getRequestURI());
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        Integer version = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION) != null
        		? Integer.valueOf(request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION)) : null;

        PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, version, portalNodes);
        restConfig.setInitialApiUrl(portalCmxUrl);
        restConfig.setLocale(PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_LOCAL_COOKIE));
        

        log.info("Portal Nodes to create: {}, Ors: {}, Version: {}", portalNodes, orsId, version);

        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
        restConfig.setMdmSessionId(PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_COOKIE));
        JsonNode updatedVersion = portalConfigService.createPortalConfigModel(credentials, restConfig, payloadNode, action,request);
        if(StringUtils.isNotEmpty(action) && PortalMetadataContants.PORTAL_CONFIG_URI_PUBLISH_ACTION.equalsIgnoreCase(action)) {
        	return new ResponseEntity<>(updatedVersion, HttpStatus.OK);
        }else {
        	return new ResponseEntity<>(updatedVersion, HttpStatus.CREATED);
        }
    }

    @PutMapping(path = "/**", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> updatePortalConfigModel(@RequestBody JsonNode payloadNode,
                                                HttpServletRequest request) throws PortalConfigException {

        log.info("Update a portal config node");
        List<String> portalNodes = PortalRestUtil.parseConfigUrl(request.getRequestURI());
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        Integer version = Integer.valueOf(request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION));

        PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, version, portalNodes);

        log.info("Portal Nodes to update: {}, Ors: {}, Version: {}", portalNodes, orsId, version);

        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
        JsonNode updatedVersion = portalConfigService.updatePortalConfigModel(credentials, restConfig, payloadNode);
        return new ResponseEntity<>(updatedVersion, HttpStatus.OK);
    }

    @PatchMapping(path = "/**", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> patchUpdatePortalConfigModel(@RequestBody JsonNode payloadNode,
                                                 HttpServletRequest request) throws PortalConfigException {

        log.info("Patch update on portal config node");

        List<String> portalNodes = PortalRestUtil.parseConfigUrl(request.getRequestURI());
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        Integer version = Integer.valueOf(request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION));

        PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, version, portalNodes);

        log.info("Portal Nodes to patch update: {}, Ors: {}, Version: {}", portalNodes, orsId, version);

        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
        JsonNode updatedVersion = portalConfigService.patchUpdatePortalConfigModel(credentials, restConfig, payloadNode);
        return new ResponseEntity<>(updatedVersion, HttpStatus.OK);
    }
    
    @DeleteMapping(path = "/**", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> deletePortalConfigModel(HttpServletRequest request,
    										@RequestParam(required = false) String action)
    										throws PortalConfigException, IOException {

        log.info("Delete portal config model");
        List<String> portalNodes = PortalRestUtil.parseConfigUrl(request.getRequestURI());
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        Integer version = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION) != null
        		? Integer.valueOf(request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION)) : null;

        PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, version, portalNodes);
        restConfig.setInitialApiUrl(portalCmxUrl);
        log.info("Portal Nodes to delete: {}, Ors: {} ", portalNodes, orsId);

        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
        restConfig.setMdmSessionId(PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_COOKIE));
        JsonNode portal = portalConfigService.deletePortalConfigModel(credentials, restConfig, action,request);
        return new ResponseEntity<>(portal, HttpStatus.OK);
    }
    
    @GetMapping(path = "/databases", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> getDatabases(HttpServletResponse response, HttpServletRequest request)
            throws PortalConfigException {

        log.info("Fetch all ors schema as reference data");
        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
        JsonNode databases = portalConfigService.getDatabases(credentials);
        return new ResponseEntity<>(databases, HttpStatus.OK);
    }

    @GetMapping(path = "/reference/portals/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> getStaticData(@PathVariable String name)
            throws PortalConfigException {

        log.info("Fetch static data for {}", name);
        JsonNode portal = portalConfigService.getReferenceDataByUri(name);
        return new ResponseEntity<>(portal, HttpStatus.OK);
    }
    
    @GetMapping(path = "/entity/{beName}/view", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> getBEViewLookUp(@PathVariable String beName,
    									 HttpServletRequest request) throws PortalConfigException {

        log.info("Fetch LookUp data for beName {}", beName);
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        String authCookie = PortalRestUtil.getCookieValue(request, PortalRestConstants.CONFIG_UI_COOKIE);
        JsonNode beViewList = portalConfigService.getBEViewByName(beName, authCookie, orsId, portalCmxUrl,request);
        return new ResponseEntity<>(beViewList, HttpStatus.OK);
    }
    
	@GetMapping(path = "portals/{portalId}/export", produces = "application/zip")
	public ResponseEntity<InputStreamResource> exportPortal(@PathVariable String portalId, HttpServletRequest request,
			HttpServletResponse response) throws PortalConfigException, IOException {
		
		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		ByteArrayOutputStream bos = portalConfigService.exportPortal(credentials, portalId, orsId);
		InputStream inputStream = new ByteArrayInputStream(bos.toByteArray());
		InputStreamResource resource = new InputStreamResource(inputStream);
		String fileName = String.format(PortalServiceConstants.FILE_NAME, portalId, orsId, PortalRestConstants.ZIP_EXT);
		HttpHeaders headers = new HttpHeaders();
		headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
		headers.add("Pragma", "no-cache");
		headers.add("Expires", "0");
		headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + fileName);
		ResponseEntity<InputStreamResource> responseEntity = ResponseEntity.ok().headers(headers)
				.contentType(MediaType.parseMediaType("application/zip")).body(resource);
		return responseEntity;
	}
    
    @PostMapping(path = "portals/import", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> importPortal(@RequestParam MultipartFile file, @RequestParam(required = false) boolean isExistingPortal, 
    									  @RequestParam(required = true) boolean isExternalUserManagementEnabled,
    									  @RequestParam(required = false) String portalId,
    									  @RequestParam("portalName") String portalName, @RequestParam("systemName") String systemName, HttpServletRequest request,
    									  HttpServletResponse response) throws PortalConfigException {
    	
		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_CONFIG);
		JsonNode reponse = portalConfigService.importPortal(credentials, file, orsId, request, portalName, isExistingPortal, isExternalUserManagementEnabled, systemName, portalId,ict);
		return new ResponseEntity<>(reponse, HttpStatus.OK);
    }
    
	@GetMapping(path = "portals/{portalId}/bundles", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> downloadBundles(@PathVariable String portalId, HttpServletRequest request,
			HttpServletResponse response) throws PortalConfigException {
		
		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		ByteArrayOutputStream bundles = (ByteArrayOutputStream) portalConfigService.getBundles(credentials, orsId,
				portalId);
		InputStream inputStream = new ByteArrayInputStream(bundles.toByteArray());
		InputStreamResource resource = new InputStreamResource(inputStream);
		String fileName = String.format(PortalServiceConstants.FILE_NAME, portalId, PortalRestConstants.BUNDLES,
				PortalRestConstants.ZIP_EXT);
		HttpHeaders headers = new HttpHeaders();
		headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
		headers.add("Pragma", "no-cache");
		headers.add("Expires", "0");
		headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + fileName);
		ResponseEntity<InputStreamResource> responseEntity = ResponseEntity.ok().headers(headers)
				.contentType(MediaType.parseMediaType("application/zip")).body(resource);
		return responseEntity;
	}
    
	@PostMapping(path = "portals/{portalId}/bundles", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> saveBundles(@RequestParam MultipartFile file, @PathVariable String portalId,
			HttpServletRequest request, HttpServletResponse response) throws PortalConfigException, IOException {
		
		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		JsonNode jsonNode = portalConfigService.saveBundles(credentials, file, orsId, portalId);
		return new ResponseEntity<JsonNode>(jsonNode, HttpStatus.OK);
	}
    
    
    @PutMapping(path = "/portals/{portalId}/status", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> portalStatusUpdate(@PathVariable String portalId, @RequestParam(required = true) String action,
                                                 HttpServletRequest request) throws PortalConfigException {
    	
    	log.info("Portal Status Update for portalId {}", portalId);
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        
        log.info("Portal Status Update for orsId {}, portalId {} and version {}", orsId, portalId);
        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
        
        JsonNode responseNode = portalConfigService.updatePortalStatus(credentials, portalId, orsId, action);
        log.info("Updated Portal Status for orsId {} with response {}", orsId, responseNode);
        
        return new ResponseEntity<JsonNode>(responseNode, HttpStatus.OK);
    }
    
    @GetMapping(path = "/portals/{portalId}/state", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> isPortalExist(@PathVariable String portalId, @RequestParam(required = true) String value,
			HttpServletRequest request, HttpServletResponse response) throws PortalConfigException {
    	
    	log.info("Invoking Config API - Is Portal Exist for portalId {}", portalId);
    	
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE);
    	
    	log.info("Invoking Config API - Is Portal Exist for portalId {} and orsId {}", portalId, orsId);
    	boolean flag  = portalConfigService.isPortalExistById(credentials, portalId, orsId, value);
    	log.info("Invoking Config API - Is Portal Exist for portalId {} and orsId {} with value {}", portalId, orsId, flag);
    	return new ResponseEntity<>(flag, HttpStatus.OK);
    }
}
