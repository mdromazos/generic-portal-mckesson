package com.informatica.mdm.portal.metadata.service;

import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.model.PortalModelCache;

public interface CacheService {
	
	public Map<CacheModel, JsonNode> clearCache(CacheModel cacheModel)
			throws PortalConfigException;

	public Map<PortalModelCache, JsonNode> clearPortalCache(PortalModelCache cacheModel) throws PortalConfigException;
}
