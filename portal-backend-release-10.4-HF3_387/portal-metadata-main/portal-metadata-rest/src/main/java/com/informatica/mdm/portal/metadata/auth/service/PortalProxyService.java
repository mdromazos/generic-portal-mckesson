package com.informatica.mdm.portal.metadata.auth.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;

public interface PortalProxyService {

	Object invokeApi(JsonNode payloadNode, HttpServletRequest request, HttpServletResponse response)
			throws PortalConfigException;

	boolean validateProxy(JsonNode payloadNode, String mdmSessionId)
			throws PortalConfigException;

	JsonNode invokeProxyByTrustedApp(JsonNode payloadNode, String orsId,
			HttpServletRequest httpRequest) throws PortalConfigException;

	JsonNode uploadFileViaProxy(JsonNode payloadNode, MultipartFile file,
			HttpServletRequest httpRequest) throws PortalConfigException;

	ResponseEntity<byte[]> downloadFileViaProxy(JsonNode payloadNode,
			HttpServletRequest httpRequest) throws PortalConfigException;
	
}
