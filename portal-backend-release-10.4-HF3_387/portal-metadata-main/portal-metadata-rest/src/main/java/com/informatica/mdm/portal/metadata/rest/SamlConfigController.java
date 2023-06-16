package com.informatica.mdm.portal.metadata.rest;


import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalConfigService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping(value = "/sso")
public class SamlConfigController {

    private final static Logger log = LoggerFactory.getLogger(SamlConfigController.class);

    @Autowired
    private PortalConfigService portalConfigService;

    @GetMapping(path = "/portals/{portalId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> getSSOConfigModel(@PathVariable(required = true) String portalId,
                                                          @RequestParam(required = false) String filter,
                                                          @RequestParam(required = false) List<String> projections,
                                                          HttpServletRequest request) throws PortalConfigException, IOException {

        log.info("Fetch SSO config ");
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);

        log.info("SSO Config Nodes to fetch for portalId: {}, ORS: {}", portalId, orsId);

        Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
        PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, filter, projections);
        JsonNode runtimeConfig = portalConfigService.getSSOConfig(credentials, portalId, restConfig);
        return new ResponseEntity<>(runtimeConfig, HttpStatus.OK);
    }

    @PutMapping(path = "/portals/{portalId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> persistSSOConfigModel(@PathVariable(required = true) String portalId,
                                                          @RequestBody JsonNode ssoConfigNode,
                                                          HttpServletRequest request) throws PortalConfigException {

        log.info("Update a portal sso config node");
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);

        log.info("SSO Config Nodes to update for portalId: {}, Ors: {}", portalId, orsId);

        Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
        JsonNode updatedVersion = portalConfigService.saveSSOConfig(credentials, ssoConfigNode, portalId, orsId);
        return new ResponseEntity<>(updatedVersion, HttpStatus.OK);
    }

	@PostMapping(path = "/portals/{portalId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JsonNode> uploadIdpXMLFile(@RequestParam("file") @Valid @NotNull MultipartFile file,
			@PathVariable(required = true) String portalId, HttpServletRequest request)
			throws PortalConfigException, IOException {

		log.info("portal config node postMapping");
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);

		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		JsonNode ssoConfigNode = portalConfigService.saveIdpConfig(credentials, file, portalId, orsId);
		return new ResponseEntity<>(ssoConfigNode, HttpStatus.OK);
	}
    
	@GetMapping(path = "/portals/{portalId}/download", produces = "application/xml")
	public ResponseEntity<InputStreamResource> downloadSpMetadataXml(@PathVariable(required = true) String portalId, HttpServletRequest request) throws PortalConfigException, IOException {
		
		log.info("portal config node GetMapping to download SPmetadata Xml");
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		log.info("SSO Config Nodes to update for portalId: {}, Ors: {}", portalId, orsId);

		String fileName = portalConfigService.getSamlServiceProviderEntityId(portalId, orsId);
		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		String spMetadataXmlString = portalConfigService.generateSpMetadataXml(credentials, portalId, orsId);
		InputStream inputStream = new ByteArrayInputStream(spMetadataXmlString.getBytes());
		InputStreamResource resource = new InputStreamResource(inputStream);

		HttpHeaders headers = new HttpHeaders();
		headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
		headers.add("Pragma", "no-cache");
		headers.add("Expires", "0");
		headers.add(HttpHeaders.CONTENT_DISPOSITION,
				"attachment;filename=" + fileName.concat(".").concat(PortalRestConstants.XML_EXT));
		ResponseEntity<InputStreamResource> responseEntity = ResponseEntity.ok().headers(headers)
				.contentType(MediaType.parseMediaType("application/xml")).body(resource);
		log.info("{}.xml file is downloading...", fileName);
		return responseEntity;
	}
}
