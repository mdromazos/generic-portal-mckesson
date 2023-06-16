package com.informatica.mdm.portal.metadata.service.impl;

import java.util.Iterator;
import java.util.Map;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.service.CacheService;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;

@Service
public class CacheServiceImpl implements CacheService {

	private final static Logger log = LoggerFactory.getLogger(CacheServiceImpl.class);

	@Autowired
	Map<CacheModel, JsonNode> externalConfigCache;
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	@Override
	public Map<CacheModel, JsonNode> clearCache(CacheModel cacheModel) throws PortalConfigException {
		
		log.info("Refresh metadata cache for model {}", cacheModel);
		try {
			
			Iterator<CacheModel> cacheIterator = externalConfigCache.keySet().iterator();
			while(cacheIterator.hasNext()) {
				CacheModel systemCache = cacheIterator.next();
				if(!cacheModel.getOrsId().isEmpty() && cacheModel.getOrsId().equals(systemCache.getOrsId())) {
					cacheIterator.remove();
					continue;
				}else if(!cacheModel.getUsername().isEmpty() && cacheModel.getUsername().equals(systemCache.getUsername())) {
					cacheIterator.remove();
					continue;
				} else if(!cacheModel.getExternalType().isEmpty() && cacheModel.getExternalType().equals(systemCache.getExternalType())) {
					cacheIterator.remove();
					continue;
				} else if(!cacheModel.getExternalName().isEmpty() && cacheModel.getExternalName().equals(systemCache.getExternalName())) {
					cacheIterator.remove();
					continue;
				} else if(!cacheModel.getUrlContext().isEmpty() && cacheModel.getUrlContext().equals(systemCache.getUrlContext())) {
					cacheIterator.remove();
					continue;
				}
			}
			
		} catch (Exception e) {
			log.error("Error on clearing cache for model {}, with error {}", cacheModel, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.PORTAL614,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL614), e.getMessage());
		}
		
		return externalConfigCache;
	}


}
