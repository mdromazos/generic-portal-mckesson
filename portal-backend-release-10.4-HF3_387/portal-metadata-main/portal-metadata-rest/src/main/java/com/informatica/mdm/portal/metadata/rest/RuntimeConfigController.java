package com.informatica.mdm.portal.metadata.rest;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalConfigService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

@RestController
@RequestMapping(value = "/runtime")
public class RuntimeConfigController {

	private final static Logger log = LoggerFactory.getLogger(RuntimeConfigController.class);

	@Autowired
	private PortalConfigService portalConfigService;

	@GetMapping(path = "/portals/{portalId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JsonNode> getRuntimeConfigModel(@PathVariable(required = true) String portalId,
														 @RequestParam(required = false) String filter,
														 @RequestParam(required = false) List<String> projections,
			HttpServletRequest request) throws PortalConfigException, IOException {

		log.info("Fetch runtime config ");
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);

		log.info("Runtime Config Nodes to fetch for portalId: {}, Ors: {}", portalId, orsId);

		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, filter, projections);
		JsonNode runtimeConfig = portalConfigService.getRuntimeConfig(credentials, portalId, restConfig);
		return new ResponseEntity<>(runtimeConfig, HttpStatus.OK);
	}

	@PutMapping(path = "/portals/{portalId}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JsonNode> persistRuntimeConfigModel(@PathVariable(required = true) String portalId,
															@RequestBody JsonNode runtimeConfigNode,
			HttpServletRequest request) throws PortalConfigException {

		log.info("Update a portal config node");
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);

		log.info("Runtime Config Nodes to update for portalId: {}, Ors: {}", portalId, orsId);

		Credentials credentials = PortalRestUtil.getCredentials(request, PortalRestConstants.CONFIG_UI_COOKIE);
		JsonNode updatedVersion = portalConfigService.saveRuntimeConfig(credentials, runtimeConfigNode, portalId, orsId);
		return new ResponseEntity<>(updatedVersion, HttpStatus.OK);
	}

}
