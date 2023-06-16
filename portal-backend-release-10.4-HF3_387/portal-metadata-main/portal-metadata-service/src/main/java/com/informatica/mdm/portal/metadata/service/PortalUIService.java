package com.informatica.mdm.portal.metadata.service;

import javax.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.model.SignupData;

public interface PortalUIService {
	
	JsonNode getGlobalPortal(Credentials credentials, String portalId,
			String orsId, String initialUrl, String selectedLocale,String ict) throws PortalConfigException;

	JsonNode getPortalConfigModel(Credentials credentials,
			PortalRestConfig restConfig,String ict) throws PortalConfigException;
	
	void persistUser(Credentials credentials, String orsId, String beName,
			SignupData jsonBody, HttpServletRequest request, String systemName) throws Exception;

	JsonNode getRuntimeConfig(Credentials credentials, String portalId,
			PortalRestConfig restConfig) throws PortalConfigException;
	
	JsonNode getBundleFromLocale(Credentials credentials,String portalId,
			String orsId,String locale) throws PortalConfigException;
	
	JsonNode addUser(HttpServletRequest request, String orsId, String beName,
			JsonNode userData, String systemName) throws PortalConfigException;

	void deleteUser(HttpServletRequest request, String orsId,
			String username, String beName, JsonNode payloadNode, String systemName) throws PortalConfigException;

	JsonNode getAvailableLocales(Credentials credentials, String orsId,
			String portalId) throws PortalConfigException;

	String getTrustedAppUser(String portalId, String orsId) throws PortalConfigException;
	
	void updatePortalStatus (HttpServletRequest request , String orsId, String systemName, JsonNode payloadNode) 
			throws PortalConfigException;
	
	ArrayNode getHubUser(String userName) throws PortalConfigException;

    JsonNode savePortalPreference(String appId, String userId, String orsId,
                                  String id, JsonNode payloadNode) throws PortalConfigException;

    JsonNode getPortalPreference(String appId, String userId, String orsId, String id)
            throws PortalConfigException;

    void deletePortalPreference(String appId, String userId, String orsId, String id)
            throws PortalConfigException;
}
