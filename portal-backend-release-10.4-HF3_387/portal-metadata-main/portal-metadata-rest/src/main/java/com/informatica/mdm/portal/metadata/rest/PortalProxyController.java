package com.informatica.mdm.portal.metadata.rest;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.portal.metadata.auth.service.PortalProxyService;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RestController
@RequestMapping(value = "/proxy")
public class PortalProxyController {

	private final static Logger log = LoggerFactory.getLogger(PortalProxyController.class);

	@Autowired
	private PortalProxyService portalProxyService;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	@PostMapping(path = "/**")
	public ResponseEntity<?> invokeProxy(@RequestBody JsonNode payloadNode, HttpServletRequest request, HttpServletResponse response)
			throws PortalConfigException {
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		Object responseNode = null;
		log.info("Invoking Proxy API");
		String mdmSessionId = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
		if (portalProxyService.validateProxy(payloadNode, mdmSessionId)) {
			responseNode = portalProxyService.invokeApi(payloadNode, request, response);
		} else {
			log.error("Proxy Validation failed for payload {}", payloadNode);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606));
		}
		return new ResponseEntity<>(responseNode, HttpStatus.OK);
	}

	@PostMapping(path = "/file/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JsonNode> uploadFileApiViaProxy(@RequestParam("file") @Valid @NotNull MultipartFile file,
			@RequestParam("payload") @Valid @NotNull String payload, HttpServletRequest request)
			throws PortalConfigException, IOException {
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		JsonNode responseNode = null;
		log.info("Invoking Proxy API for File Operation");
		String mdmSessionId = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
		String decodedPayload = java.net.URLDecoder.decode(payload, StandardCharsets.UTF_8.name());
		JsonNode payloadNode = mapper.readTree(decodedPayload);
		if (portalProxyService.validateProxy(payloadNode, mdmSessionId)) {
			responseNode = portalProxyService.uploadFileViaProxy(payloadNode, file, request);
		} else {
			log.error("Proxy Validation failed for payload {}", payloadNode);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606));
		}

		return new ResponseEntity<>(responseNode, HttpStatus.OK);
	}

	@PostMapping(path = "/file/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
	public ResponseEntity<?> downloadFileApiViaProxy(@RequestBody JsonNode payloadNode, HttpServletRequest request)
			throws PortalConfigException, IOException {
		String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		ResponseEntity<byte[]> responseNode = null;
		log.info("Invoking Proxy API for File Operation");
		String mdmSessionId = PortalRestUtil.getCookieValue(request,
				PortalRestConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
		if (portalProxyService.validateProxy(payloadNode, mdmSessionId)) {
			responseNode = portalProxyService.downloadFileViaProxy(payloadNode, request);
		} else {
			log.error("Proxy Validation failed for payload {}", payloadNode);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606));
		}

		ResponseEntity<String> responseEntity = ResponseEntity.ok().headers(responseNode.getHeaders())
							.body(Base64.getEncoder().encodeToString(responseNode.getBody()));
		return responseEntity;
	}

}
