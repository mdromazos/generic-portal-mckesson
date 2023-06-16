package com.informatica.mdm.portal.metadata.service;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.SAMLException;
import com.informatica.mdm.portal.metadata.model.SAMLConfig;
import com.informatica.mdm.portal.metadata.util.AttributeSet;

public interface SAMLService {

	void buildAndEncodeAuthnRequestForm(String relayState, HttpServletRequest httpRequest, HttpServletResponse httpResponse,
			SAMLConfig samlConfig) throws SAMLException;
	
	Map<String, String> buildAndEncodeLogoutRequestForm(String nameIdString, HttpServletRequest httpRequest, HttpServletResponse httpResponse,
			SAMLConfig samlConfig) throws SAMLException;

	AttributeSet validateResponse(String authnResponse, SAMLConfig samlConfig) throws SAMLException;

	String getRelayState(HttpServletRequest request, String defaultRelayState);
	
	SAMLConfig getSAMLConfigurationForPortal(String portalId, String orsId) throws PortalConfigException;
	
	JsonNode getIdpConfig(Credentials credentials, MultipartFile file,
			String portalId, String orsId, JsonNode ssoConfigNode) throws SAMLException, PortalConfigException, IOException;
	
	String getSpMetadataXml(String portalId, String orsId) throws SAMLException, PortalConfigException, IOException;

}
