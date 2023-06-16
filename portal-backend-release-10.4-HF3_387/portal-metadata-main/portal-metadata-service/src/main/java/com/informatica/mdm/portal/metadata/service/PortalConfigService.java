package com.informatica.mdm.portal.metadata.service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.SAMLException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;

public interface PortalConfigService {
	
	JsonNode createPortalConfigModel(Credentials credentials, PortalRestConfig restConfig,
			JsonNode payloadNode, String action,HttpServletRequest request) throws PortalConfigException;

	JsonNode updatePortalConfigModel(Credentials credentials,
			PortalRestConfig restConfig, JsonNode payloadNode)
					throws PortalConfigException;

	JsonNode patchUpdatePortalConfigModel(Credentials credentials,
			PortalRestConfig restConfig, JsonNode payloadNode)
					throws PortalConfigException;
	
	JsonNode deletePortalConfigModel(Credentials credentials,
			PortalRestConfig restConfig, String portalState,HttpServletRequest request)
					throws PortalConfigException;
	
	JsonNode getPortalConfigModel(Credentials credentials,
			PortalRestConfig restConfig,String ict) throws PortalConfigException;
	
	ArrayNode getPortals(Credentials credentials)
			throws PortalConfigException;
	
	String savePortalToResource(JsonNode jsonObject,
			Credentials credentials) throws PortalConfigException;

	JsonNode publishPortalConfig(Credentials credentials,
			String portalId, String orsId, PortalRestConfig restConfig,HttpServletRequest request) throws PortalConfigException;

	JsonNode getPortalConfig(Credentials credentials,
			String portalId, String orsID, Integer version)
			throws PortalConfigException;
	
	ArrayNode getPortalsWithBlob(Credentials credentials)
			throws PortalConfigException;

	JsonNode savePortalConfigInDraft(Credentials credentials,
			JsonNode portalNode) throws PortalConfigException;

	JsonNode deletePortalConfig(Credentials credentials, String portalId,
			 String action,PortalRestConfig restConfig,HttpServletRequest request) throws PortalConfigException;
	
	JsonNode getDatabases(Credentials credentials)
			throws PortalConfigException;

	JsonNode getReferenceDataByUri(String name)
			throws PortalConfigException;
	
	JsonNode getBEViewByName(String beViewName, String mdmSessionId,
			String orsId, String initialUrl,HttpServletRequest request) throws PortalConfigException;

	JsonNode saveRuntimeConfig(Credentials credentials, JsonNode runtimeConfig,
			String portalId, String orsId) throws PortalConfigException;

	JsonNode saveSSOConfig(Credentials credentials, JsonNode ssoConfig, String portalId, String orsId)
            throws PortalConfigException;

	JsonNode getRuntimeConfig(Credentials credentials,
			String portalId, PortalRestConfig restConfig) throws PortalConfigException;

    JsonNode getSSOConfig(Credentials credentials,
                          String portalId, PortalRestConfig restConfig) throws PortalConfigException;
	
	ByteArrayOutputStream exportPortal(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException;
	
	JsonNode importPortal(Credentials credentials, MultipartFile file,
			String orsId, HttpServletRequest request,
			String portalName, boolean isExistingPortal, boolean isExternalUserManagementEnabled,  String systemName, String existingPortalId,String ict) throws PortalConfigException;
	
	Object getBundles(Credentials credentials, String orsId,
			String portalId)  throws PortalConfigException;
	
	JsonNode saveBundles(Credentials credentials, MultipartFile file,
			String orsId, String portalId) throws PortalConfigException;

	JsonNode updatePortalStatus(Credentials credentials, String portalId,
			String orsId, String action) throws PortalConfigException;

	boolean isPortalExistById(Credentials credentials,
			String portalId, String orsId, String state) throws PortalConfigException;

	String generateSpMetadataXml(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException;

	JsonNode saveIdpConfig(Credentials credentials, MultipartFile file, String portalId, String orsId) 
			throws PortalConfigException;
	
	String getSamlServiceProviderEntityId(String portalId, String orsId );

}
