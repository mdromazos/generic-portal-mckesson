package com.informatica.mdm.portal.metadata.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.model.PortalModelCache;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.CacheService;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;

@Component
public class AsyncServiceImpl {
    @Autowired
    @Qualifier(value = "errorCodeProperties")
    private Properties errorCodeProperties;

    private String portalCmxUrl;

    @Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
        portalCmxUrl=url;
        if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
            portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
        }
    }
    private final static Logger log = LoggerFactory.getLogger(AsyncServiceImpl.class);

    @Autowired
    private PortalPersistenceService portalPersistenceService;
    @Autowired
    private ExternalConfigFactory externalConfigFactory;
    @Autowired
    Map<PortalModelCache, JsonNode> portalModelCache;
    @Autowired
    private CacheService cacheService;
    @Async
    public void processPortalModel (Credentials credentials, String portalId, PortalRestConfig restConfig, String ict) throws PortalConfigException {

        long startTime = System.currentTimeMillis();
        JsonNode portalConfigNode = portalPersistenceService.getPublishedPortalConfig( credentials, portalId, restConfig.getOrs());
        Timestamp lastChange = portalPersistenceService.getDBChangeTimestamp(restConfig.getOrs());
        externalConfigFactory.invokeExternalConfigService(portalConfigNode, credentials,
                restConfig.getOrs(), restConfig.getMdmSessionId(), true, restConfig.getInitialApiUrl(),
                restConfig.getLocale(), ict);
        String randomId = UUID.randomUUID().toString().replace("-", "");
        PortalConfigUtil.updateModelInPreference(randomId, portalId, restConfig.getOrs(), credentials.getUsername(),
                portalConfigNode, lastChange , portalConfigNode.get(PortalMetadataContants.PORTAL_VERSION).asInt() , restConfig.getLocale());

        //Cache Information
        PortalModelCache removeModel = new PortalModelCache(restConfig.getOrs(), null,null,null,null);
        cacheService.clearPortalCache(removeModel);
        PortalModelCache cacheModel = new PortalModelCache(restConfig.getOrs(), restConfig.getRole(), Long.toString(lastChange.getTime()),
                portalId, restConfig.getLocale());
        portalModelCache.put(cacheModel, portalConfigNode);

        log.info("Full Portal Processed in " ,restConfig.getRole(), (System.currentTimeMillis() - startTime));

    }
}
