package com.informatica.mdm.portal.metadata.service.impl;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.service.ExternalConfigService;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;

@Service
public class ExternalConfigFactory {

	private final static Logger log = LoggerFactory.getLogger(ExternalConfigFactory.class);

	@Autowired
	@Qualifier("beViewService")
	ExternalConfigService beViewService;

	@Autowired
	Map<CacheModel, JsonNode> externalConfigCache;

	public void setBeViewService(ExternalConfigService beViewService) {
		this.beViewService = beViewService;
	}

	public JsonNode invokeExternalConfigService(JsonNode portalConfigNode, Credentials credentials, String orsId,
			String mdmSessionId, Boolean isPortalUI, String initialUrl, String selectedLocale,String ict) throws PortalConfigException {

		if (portalConfigNode.isArray()) {
			log.info("Portal Configuration - Enrich External Data for Database {}, in an ArrayNode ");
			for (JsonNode node : portalConfigNode) {
				interceptExternalConfig(node, credentials, orsId, mdmSessionId, isPortalUI, initialUrl, selectedLocale,ict);
			}
		} else if (portalConfigNode.isObject()) {
			log.info("Portal Configuration - Enrich External Data for Database {}, in an ObjectNode ");
			interceptExternalConfig(portalConfigNode, credentials, orsId, mdmSessionId, isPortalUI, initialUrl, selectedLocale,ict);
		}
		return portalConfigNode;

	}

	private void interceptExternalConfig(JsonNode portalConfigNode, Credentials credentials, String orsId,
			String mdmSessionId, Boolean isPortalUI, String initialUrl, String selectedLocale,String ict) throws PortalConfigException {

		Iterator<Entry<String, JsonNode>> fields = portalConfigNode.fields();
		while (fields.hasNext()) {
			Entry<String, JsonNode> fieldEntry = fields.next();
			if (fieldEntry.getValue().isArray()) {
				Iterator<JsonNode> arrIterator = fieldEntry.getValue().iterator();
				while(arrIterator.hasNext()) {
					JsonNode iterateNode = arrIterator.next();
				//for (JsonNode iterateNode : fieldEntry.getValue()) {
					if (iterateNode.has(ExternalConfigConstants.CONFIG_TYPE)) {
						String externalConfigType = iterateNode.get(ExternalConfigConstants.CONFIG_TYPE).asText();
						log.info("Portal Configuration - Enrich External Data for externalName {}",
								externalConfigType);
						enrichExternalData(iterateNode, externalConfigType, credentials, orsId, mdmSessionId,
								isPortalUI, initialUrl, selectedLocale,ict);
						if(!iterateNode.has(ExternalConfigConstants.CONFIG_ATTRIBUTE)
								&& !iterateNode.has(ExternalConfigConstants.OPERATION_ATTRIBUTE)) {
							arrIterator.remove();
						}
					}
					interceptExternalConfig(iterateNode, credentials, orsId, mdmSessionId, isPortalUI, initialUrl, selectedLocale,ict);
				}
			} else if (fieldEntry.getValue().isObject()) {
				if (fieldEntry.getValue().has(ExternalConfigConstants.CONFIG_TYPE)) {
					String externalConfigType = fieldEntry.getValue().get(ExternalConfigConstants.CONFIG_TYPE)
							.asText();
					log.info("Portal Configuration - Enrich External Data for externalName {}", externalConfigType);
					enrichExternalData(fieldEntry.getValue(), externalConfigType, credentials, orsId, mdmSessionId,
							isPortalUI, initialUrl, selectedLocale,ict);
					if(!fieldEntry.getValue().has(ExternalConfigConstants.CONFIG_ATTRIBUTE)
							&& !fieldEntry.getValue().has(ExternalConfigConstants.OPERATION_ATTRIBUTE)) {
						((ObjectNode) portalConfigNode).remove(fieldEntry.getKey());
					}
				}
				interceptExternalConfig(fieldEntry.getValue(), credentials, orsId, mdmSessionId, isPortalUI, initialUrl, selectedLocale,ict);
			}
		}
	}

	private void enrichExternalData(JsonNode portalConfigNode, String externalConfigType, Credentials credentials,
			String orsId, String mdmSessionId, Boolean isPortalUI, String initialUrl, String selectedLocale,String ict) throws PortalConfigException {

		switch (externalConfigType) {
		case ExternalConfigConstants.CONFIG_TYPE_BE:
			log.info("Injected beViewService for externalMetaType {}", externalConfigType);
			if (isPortalUI) {
				beViewService.enrichUIExternalData(portalConfigNode, credentials, orsId, mdmSessionId, initialUrl, selectedLocale,ict);
			} else {
				beViewService.enrichConfigExternalData(portalConfigNode, credentials, orsId, mdmSessionId, initialUrl, selectedLocale, false,ict);
			}
		default:
			break;
		}

	}

}
