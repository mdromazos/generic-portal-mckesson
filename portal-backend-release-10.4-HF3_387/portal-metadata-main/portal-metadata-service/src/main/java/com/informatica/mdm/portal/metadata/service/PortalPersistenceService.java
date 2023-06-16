package com.informatica.mdm.portal.metadata.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;

import java.util.List;
import java.util.Map;

public interface PortalPersistenceService {
	
	JsonNode publishPortalConfig(Credentials credentials, JsonNode portalNode)
			throws PortalConfigException;

	JsonNode getDatabases(Credentials credentials)
			throws PortalConfigException;

	JsonNode getPublishedPortalConfig(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException;

	ArrayNode getPortals(Credentials credentials, Boolean withConfig)
			throws PortalConfigException;

	JsonNode savePortalConfigInDraft(Credentials credentials, JsonNode portalNode)
			throws PortalConfigException;
	
	ArrayNode getORSRoles(Credentials credentials, String orsID)
			throws PortalConfigException;

	JsonNode getPortalConfigDraftByVersion(Credentials credentials, String portalId, String orsID, Integer version)
			throws PortalConfigException;

	JsonNode getPortalConfigDraft(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException;

	JsonNode getPublishedPortalConfigByVersion(Credentials credentials, String portalId, String orsID, Integer version)
			throws PortalConfigException;

	JsonNode deleteDraftPortalConfig(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException;

	void deletePublishedPortalConfig(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException;

	Long getSequence(Credentials credentials, String orsID)
			throws PortalConfigException;

	Boolean isDraftPortalNameExist(Credentials credentials, String portalName, String orsId)
			throws PortalConfigException;

	Boolean isPublishedPortalNameExist(Credentials credentials, String portalName, String orsId)
			throws PortalConfigException;

	Boolean isPublishedPortalNameExistById(Credentials credentials, String portalId, String portalName, String orsId)
			throws PortalConfigException;

	Boolean isDraftPortalNameExistById(Credentials credentials, String portalName, String portalId, String orsId)
			throws PortalConfigException;

	Boolean isPortalNameExist(Credentials credentials, String portalName, String orsId) throws PortalConfigException;

	Boolean isPortalNameExistById(Credentials credentials, String portalId, String portalName, String orsId)
			throws PortalConfigException;
	
	JsonNode savePortalRuntimeConfig(Credentials credentials, JsonNode portalNode, String orsId, String portalId)
			throws PortalConfigException;

	JsonNode getPortalRuntimeConfig(Credentials credentials, String orsId, String portalId)
			throws PortalConfigException;

    JsonNode savePortalSSOConfig(Credentials credentials, JsonNode portalNode, String orsId, String portalId)
            throws PortalConfigException;

    JsonNode getPortalSSOConfig(Credentials credentials, String orsId, String portalId)
            throws PortalConfigException;
	
	Object getBundles(Credentials credentials, String orsId, String portalId)
			throws PortalConfigException;
	
	JsonNode saveBundles(Credentials credentials, byte[] bytes, String orsId, String portalId)
			throws PortalConfigException;

	Object getErrors(Credentials credentials, String orsId, String portalId)
			throws PortalConfigException;

	JsonNode saveErrors(Credentials credentials, byte[] bytes, String orsId, String portalId)
			throws PortalConfigException;

	JsonNode saveDraftBundles(Credentials credentials, byte[] bytes, String orsId, String portalId)
			throws PortalConfigException;

	JsonNode saveDraftErrors(Credentials credentials, byte[] bytes, String orsId, String portalId)
			throws PortalConfigException;

	Object getDraftBundles(Credentials credentials, String orsId, String portalId)
			throws PortalConfigException;

	Object getDraftErrors(Credentials credentials, String orsId, String portalId)
			throws PortalConfigException;

	JsonNode updatePortalState(Credentials credentials, JsonNode portalNode)
			throws PortalConfigException;

	String getPublishedPortalStatus(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException;

	Boolean isDraftPortalExistById(Credentials credentials, String portalId,
			String orsId) throws PortalConfigException;

	Boolean isPublishedPortalExistById(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException;
	
	Boolean isPortalAssociatedWithBuyerSide(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException;
	
	ArrayNode getHubUser(String userName) throws PortalConfigException;

	void upgradeMetamodel(ArrayNode portals, Credentials credentials,
			String tableName) throws PortalConfigException;

	void tableDefinition(String tableName, String orsId,
			Credentials credentials) throws PortalConfigException;

    JsonNode savePreference(String appId, String userId, String orsId,
							String id, JsonNode payloadNode) throws PortalConfigException;

	JsonNode getPreference(String appId, String userId, String orsId,  String id)
			throws PortalConfigException;

    void deletePreference(String appId, String userId, String orsId,  String id)
            throws PortalConfigException;
}
