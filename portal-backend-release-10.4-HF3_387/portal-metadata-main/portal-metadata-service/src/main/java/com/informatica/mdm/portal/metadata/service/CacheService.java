package com.informatica.mdm.portal.metadata.service;

import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.CacheModel;

public interface CacheService {
	
	public Map<CacheModel, JsonNode> clearCache(CacheModel cacheModel)
			throws PortalConfigException;
	
}
