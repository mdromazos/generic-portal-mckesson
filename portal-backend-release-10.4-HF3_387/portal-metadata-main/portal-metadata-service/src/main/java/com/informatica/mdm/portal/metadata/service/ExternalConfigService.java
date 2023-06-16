package com.informatica.mdm.portal.metadata.service;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;

public interface ExternalConfigService {

	JsonNode getBEViewMetaData(Credentials credentials, String beViewName, String orsId, String beViewUrl,
			String mdmSessionId, String selectedLocale,String ict) throws PortalConfigException;

	JsonNode enrichConfigExternalData(JsonNode portalConfigNode, Credentials credentials, String orsId,
			String mdmSessionId, String initialUrl, String selectedLocale, boolean byProxy,String ict) throws PortalConfigException;

	JsonNode enrichUIExternalData(JsonNode portalConfigNode, Credentials credentials, String orsId,
			String mdmSessionId, String initialUrl, String selectedLocale,String ict) throws PortalConfigException;

	JsonNode getBEViewMetaDataByTrustedApp(String beViewName, String orsId, String beViewUrl, String securityPayload,
			String selectedLocale) throws PortalConfigException;
	
	ResponseEntity<String> searchBERecord( String beName, String orsId,
			String baseURL, String securityPayload, String selectedLocale, String filterKey, String filterVlaue,HttpServletRequest request)
			throws PortalConfigException;
	
	ResponseEntity<String> createBERecord(String payload, String beName, String orsId,
				String beViewUrl, String securityPayload, String sourceSystem)
				throws PortalConfigException;

}
