package com.informatica.mdm.portal.metadata.service;

import java.util.List;

import org.springframework.core.io.Resource;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;

public interface EcorePortalService {

	JsonNode appendPortalConfigModel(List<String> path, JsonNode parentNode,
			JsonNode payloadNode, Boolean updateFlag, String collectionIdentifier) throws MetaModelException;

	JsonNode patchUpdatePortalConfigModel(List<String> path, JsonNode parentNode,
			JsonNode payloadNode,
			String collectionIdentifier) throws MetaModelException;

	JsonNode deleteFromPortalConfigModel(List<String> traversePath,
			JsonNode portalConfigNode) throws MetaModelException;
	
	String savePortalToResource(JsonNode jsonObject,
			String username) throws MetaModelException;

	JsonNode getPortalFromResource(String portalId, String username,
			Integer version, String orsId) throws MetaModelException;
	
	JsonNode mapToEcoreJson(JsonNode uiPortal,
			String eClass) throws MetaModelException;

	void deletePortalFromResourceSet(String portalId,
			String username, String orsId) throws MetaModelException;

	JsonNode getReferenceDataByUri(String referenceDataName)
			throws MetaModelException;

	void loadReferenceData(Resource resource) throws MetaModelException;

}
