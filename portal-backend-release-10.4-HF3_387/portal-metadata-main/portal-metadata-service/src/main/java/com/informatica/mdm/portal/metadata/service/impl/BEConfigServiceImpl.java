package com.informatica.mdm.portal.metadata.service.impl;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.delos.util.base64.Base64;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.service.ExternalConfigService;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.jayway.jsonpath.Configuration;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.spi.json.JacksonJsonProvider;
import com.jayway.jsonpath.spi.mapper.JacksonMappingProvider;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import com.siperian.sif.client.CertificateHelper;

@Service
@Qualifier("beViewService")
public class BEConfigServiceImpl implements ExternalConfigService {

	private final static Logger log = LoggerFactory.getLogger(BEConfigServiceImpl.class);

	@Autowired
	RestTemplate restTemplate;

	@Autowired
	Map<CacheModel, JsonNode> externalConfigCache;

	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	@Value("${cmx.home}")
	private String cmxHome;

	@Value("${cmx.appserver.type}")
	private String appServerType;

	@Autowired
	private ObjectMapper mapper;

	@Override
	public JsonNode getBEViewMetaData(Credentials credentials, String beViewName, String orsId, String beViewUrl,
			String mdmSessionId, String selectedLocale,String ict) throws PortalConfigException {

		log.info("Portal Configuration Get BE View Data for beViewName {}, for databaseId {}", beViewName, orsId);
		String apiUrl = StringUtils.join(beViewUrl, "/cmx/cs/", orsId, "/", beViewName, ".json?action=meta");
		String authCookie = ExternalConfigConstants.AUTH_MDM_ATTRIBUTE + "=" + mdmSessionId;
		HttpHeaders headers = new HttpHeaders();
		if (StringUtils.isNotEmpty(selectedLocale)) {
			authCookie = StringUtils.join(authCookie, ";selectedLocale=", selectedLocale);
		}
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, ict);
		headers.add(HttpHeaders.COOKIE, authCookie);
		HttpEntity<?> request = new HttpEntity<String>(headers);
		ResponseEntity<JsonNode> beViewData = restTemplate.exchange(apiUrl, HttpMethod.GET, request, JsonNode.class);

		return beViewData.getBody();
	}

	public JsonNode getBEViewMetaDataViaProxy(Credentials credentials, String beViewName, String orsId,
			String beViewUrl, String mdmSessionId, String selectedLocale) throws PortalConfigException {
		
		log.info("Portal Configuration Get BE View Data Via Proxy Api for beViewName {}, for databaseId {}", beViewName,
				orsId);
		JsonNode response = mapper.createObjectNode();
		String apiUrl = null;
		try {

			apiUrl = StringUtils.join(beViewUrl, "/cmx/cs/", orsId, "/", beViewName, ".json?action=meta");

			HttpHeaders headers = new HttpHeaders();
			String cookie = generateEncryptedCookie(mdmSessionId, appServerType);
			if (StringUtils.isNotEmpty(selectedLocale)) {
				cookie = StringUtils.join(cookie, "; selectedLocale=", selectedLocale);
			}
			headers.add(HttpHeaders.COOKIE, cookie);

			HttpEntity<?> request = new HttpEntity<String>(headers);
			ResponseEntity<JsonNode> beViewData = restTemplate.exchange(apiUrl, HttpMethod.GET, request,
					JsonNode.class);
			response = beViewData.getBody();

		} catch (Exception e) {
			log.error("Error on invoking proxy api for apiUrl {}", apiUrl, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), e.getMessage());
		}

		return response;
	}

	private String generateEncryptedCookie(String portalsessionid, String serverType) throws InvalidKeyException,
			NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException {

		String cookie = null;
		if (PortalServiceConstants.APP_SERVER_WEBLOGIC.equalsIgnoreCase(serverType)) {

			cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", Base64.encodeBytes(
					DatatypeConverter.printHexBinary(encryptSecurityPayload(portalsessionid)).getBytes(), 8));
		} else {

			cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
					Base64.encodeBytes(
							DatatypeConverter.printHexBinary(encryptSecurityPayload(portalsessionid)).getBytes(), 8),
					"\"");
		}

		return cookie;
	}

	@Override
	public JsonNode getBEViewMetaDataByTrustedApp(String beViewName, String orsId, String beViewUrl,
			String securityPayload, String selectedLocale) throws PortalConfigException {

		log.info("Portal Configuration Get BE View Data By Trusted App for beViewName {}, for databaseId {}",
				beViewName, orsId);
		String apiUrl = StringUtils.join(beViewUrl, "/cmx/cs/", orsId, "/", beViewName, ".json?action=meta");
		
		HttpHeaders headers = new HttpHeaders();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		if (StringUtils.isNotEmpty(selectedLocale)) {
			headers.add(HttpHeaders.COOKIE, StringUtils.join("selectedLocale=", selectedLocale));
		}
		ResponseEntity<String> response = PortalConfigUtil.executeRest(apiUrl, HttpMethod.GET, null, headers,
				restTemplate);
		ObjectMapper mapper = new ObjectMapper();
		JsonNode beViewNode = null;

		try {
			beViewNode = mapper.readTree(response.getBody());
		} catch (IOException e) {
			log.error("Error on getBeViewDataByTrustedApp for BE Name {}, and orsId {}, with apiUrl {}", beViewName,
					orsId, apiUrl);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}

		return beViewNode;
	}

	@Override
	public JsonNode enrichConfigExternalData(JsonNode portalConfigNode, Credentials credentials, String orsId,
			String mdmSessionId, String initialUrl, String selectedLocale, boolean byProxy,String ict)
			throws PortalConfigException {

		log.info("Portal Configuration - Enrich External Data for Database {} ", orsId);

		String beViewName = portalConfigNode.get(ExternalConfigConstants.CONFIG_NAME).asText();
		String externalType = portalConfigNode.get(ExternalConfigConstants.CONFIG_TYPE).asText();

		/*
		 * String uniqueKey = StringUtils.join(initialUrl,
		 * ExternalConfigConstants.CACHE_DELIMETER, credentials.getUsername(),
		 * ExternalConfigConstants.CACHE_DELIMETER, externalType,
		 * ExternalConfigConstants.CACHE_DELIMETER, beViewName);
		 */

		CacheModel beCache = new CacheModel(orsId, credentials.getUsername(), externalType, beViewName, initialUrl,
				selectedLocale);

		JsonNode beViewNode = externalConfigCache.get(beCache);
		if (null == beViewNode) {

			if (PortalServiceConstants.TRUSTED_APP.equalsIgnoreCase(credentials.getUsername())) {
				beViewNode = getBEViewMetaDataByTrustedApp(beViewName, orsId, initialUrl, mdmSessionId, selectedLocale);
			} else if (byProxy) {
				beViewNode = getBEViewMetaDataViaProxy(credentials, beViewName, orsId, initialUrl, mdmSessionId,
						selectedLocale);
			} else {
				beViewNode = getBEViewMetaData(credentials, beViewName, orsId, initialUrl, mdmSessionId,
						selectedLocale,ict);
			}

			externalConfigCache.put(beCache, beViewNode);
		}

		log.info("Portal Configuration - Enrich BE View Data for Database {}, with beViewName {}", orsId, beViewName);

		enrichMappedBEViewData(portalConfigNode, beViewNode);

		return portalConfigNode;
	}

	private JsonNode enrichMappedBEViewData(JsonNode portalConfigNode, JsonNode beViewNode)
			throws PortalConfigServiceException {

		String fieldJsonPath = portalConfigNode.get(ExternalConfigConstants.CONFIG_ATTRIBUTE_SELECTOR).asText();

		Configuration jacksonConfig = Configuration.builder().mappingProvider(new JacksonMappingProvider())
				.jsonProvider(new JacksonJsonProvider()).build();

		JsonNode externalConfigdata = JsonPath.using(jacksonConfig).parse(beViewNode.toString()).read(fieldJsonPath,
				JsonNode.class);
		if (null == externalConfigdata || externalConfigdata.isEmpty(null)) {
			log.warn("External Metadata Config not found for field {}", portalConfigNode);
			return portalConfigNode;
		}
		externalConfigdata = externalConfigdata.isArray() ? externalConfigdata.get(0) : externalConfigdata;
		enrichFilteredBEViewData(portalConfigNode, externalConfigdata);
		return portalConfigNode;
	}

	@Override
	public JsonNode enrichUIExternalData(JsonNode portalConfigNode, Credentials credentials, String orsId,
			String mdmSessionId, String initialUrl, String selectedLocale,String ict) throws PortalConfigException {

		log.info("Portal UI Configuration - Enrich External Data for Database {} ", orsId);

		portalConfigNode = enrichConfigExternalData(portalConfigNode, credentials, orsId, mdmSessionId, initialUrl,
				selectedLocale, true,ict);

		log.info("Portal UI Configuration - Post Config Enrich External Data for Database {} ", orsId);

		if (portalConfigNode.isObject()) {
			if (portalConfigNode.hasNonNull(ExternalConfigConstants.CONFIG_TYPE)
					&& portalConfigNode.hasNonNull(ExternalConfigConstants.CONFIG_ATTRIBUTE)) {
				String externalConfigType = portalConfigNode.get(ExternalConfigConstants.CONFIG_TYPE).asText();
				log.info("Portal UI Configuration - Enrich UI Wrapper on External Data for externalName {}",
						externalConfigType);
				// ((ObjectNode) portalConfigNode).remove(ExternalConfigConstants.CONFIG_NAME);
				// ((ObjectNode) portalConfigNode).remove(ExternalConfigConstants.CONFIG_TYPE);
				((ObjectNode) portalConfigNode).remove(ExternalConfigConstants.CONFIG_ATTRIBUTE_SELECTOR);
				boolean required = null != ((ObjectNode) portalConfigNode)
						.get(ExternalConfigConstants.REQUIRED_ATTRIBUTE)
								? ((ObjectNode) portalConfigNode).get(ExternalConfigConstants.REQUIRED_ATTRIBUTE)
										.asBoolean()
								: false;
				ObjectNode externalConfigdata = (ObjectNode) portalConfigNode
						.get(ExternalConfigConstants.CONFIG_ATTRIBUTE);
				((ObjectNode) portalConfigNode).setAll(externalConfigdata);
				((ObjectNode) portalConfigNode).remove(ExternalConfigConstants.CONFIG_ATTRIBUTE);
				((ObjectNode) portalConfigNode).put(ExternalConfigConstants.REQUIRED_ATTRIBUTE, required);
			}
		}

		return portalConfigNode;
	}

	private void enrichFilteredBEViewData(JsonNode portalConfigNode, JsonNode externalFieldNode) {

		JsonNode externalFieldNodeClone = externalFieldNode.deepCopy();
		if (externalFieldNodeClone.hasNonNull(ExternalConfigConstants.BE_FIELD)) {
			((ObjectNode) externalFieldNodeClone).remove(ExternalConfigConstants.BE_FIELD);
		}

		if (externalFieldNodeClone.has(ExternalConfigConstants.BE_CHILD)) {
			((ObjectNode) externalFieldNodeClone).remove(ExternalConfigConstants.BE_CHILD);
		}

		if (externalFieldNodeClone.hasNonNull(ExternalConfigConstants.BE_CONTENT_METADATA)) {
			((ObjectNode) externalFieldNodeClone).remove(ExternalConfigConstants.BE_CONTENT_METADATA);
		}

		if (externalFieldNodeClone.hasNonNull(ExternalConfigConstants.BE_OBJECT)) {
			((ObjectNode) externalFieldNodeClone).remove(ExternalConfigConstants.BE_OBJECT);
		}

		log.info("Portal Configuration - Enriched BE View Data is {} ", externalFieldNodeClone);
		ObjectNode enrichNode = ((ObjectNode) portalConfigNode).putObject(ExternalConfigConstants.CONFIG_ATTRIBUTE);
		enrichNode.setAll((ObjectNode) externalFieldNodeClone);

	}

	private byte[] encryptSecurityPayload(String mdmsessionid) throws InvalidKeyException, NoSuchAlgorithmException,
			NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException {

		PkiUtilProvider pkiUtilProvider = PkiUtilProvider.getInstance(cmxHome);
		PKIUtil pkiUtil = pkiUtilProvider.getPkiUtil();
		Certificate certificate = pkiUtil.getCertificate(PortalServiceConstants.HUB);
		PublicKey publicKey = certificate.getPublicKey();
		CertificateHelper certificateHelper = CertificateHelper.getInstance(cmxHome);
		PrivateKey privateKey = pkiUtil.getPrivateKey(PortalServiceConstants.TRUSTED_APP);
		byte[] encryptedWithPrivateKey = certificateHelper.encrypt(mdmsessionid.getBytes(), privateKey);
		byte[] encryptedWithPublicKey = certificateHelper.encrypt(encryptedWithPrivateKey, publicKey);

		return encryptedWithPublicKey;

	}

	@Override
	public ResponseEntity<String> createBERecord(String payload, String beName, String orsId,String beViewUrl, 
			String securityPayload, String sourceSystem)
			throws PortalConfigException {

		ResponseEntity<String> response = null ;
		try {
			String apiUrl = StringUtils.join(beViewUrl, "/cmx/cs/", orsId, "/", beName, "?systemName="+sourceSystem);
			log.info("Create Entity api url {}", apiUrl);
			HttpHeaders headers = new HttpHeaders();
			String ICT = PortalConfigUtil.getSessionAttribute(securityPayload, PortalServiceConstants.MDM_CSRF_TOKEN_CONFIG);
			String authCookie = ExternalConfigConstants.AUTH_MDM_ATTRIBUTE + "=" + securityPayload;
			headers.add(HttpHeaders.COOKIE, authCookie);
			headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, ICT);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			response = PortalConfigUtil.executeRest(apiUrl, HttpMethod.POST, payload, headers, restTemplate);
			
		} catch (Exception e) {
			throw new PortalConfigException(ErrorCodeContants.CONFIG615,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG615), e.getMessage());
		}
		
		if (response.getStatusCode() == HttpStatus.OK) {
			return response;
		} else {
			log.error("Failed to process BE create record : " + response.getStatusCode());
			throw new PortalConfigException(ErrorCodeContants.CONFIG615,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG615), "Failed to create business entity record");
		}
	}

	@Override
	public ResponseEntity<String> searchBERecord( String beName, String orsId,
			String baseURL, String securityPayload, String selectedLocale, String filterKey, String filterVlaue,HttpServletRequest httpRequest)
			throws PortalConfigException {

		ResponseEntity<String> response = null;
		try {
			StringBuilder children = new StringBuilder("");
			String[] filterKeyPath = filterKey.split(PortalServiceConstants.DOT);
			if(filterKeyPath.length>1) {
			children = children.append(PortalServiceConstants.AND).append(PortalServiceConstants.CHILDREN).append(PortalServiceConstants.EQUALS)
			.append(filterKeyPath[0]).append(".").append(PortalServiceConstants.DEPTH).append(PortalServiceConstants.EQUALS).append(filterKeyPath.length-1);
			}
			String url = String.format(PortalServiceConstants.SEARCH_BE_URL, baseURL, orsId, beName, filterKey,
					filterVlaue,children.toString());
			log.info("Srarch Entity api url {}", url);
			String ICT = PortalConfigUtil.getCookieValue(httpRequest,PortalServiceConstants.MDM_CSRF_TOKEN_CONFIG);
			HttpHeaders headers = new HttpHeaders();
			String authCookie = ExternalConfigConstants.AUTH_MDM_ATTRIBUTE + "=" + securityPayload;
			if (StringUtils.isNotEmpty(selectedLocale)) {
				authCookie = StringUtils.join(authCookie, ";selectedLocale=", selectedLocale);
			}
			headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, ICT);
			headers.add(HttpHeaders.COOKIE, authCookie);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			response = PortalConfigUtil.executeRest(url, HttpMethod.GET, null, headers, restTemplate);
		
		}  catch (Exception e) {
			throw new PortalConfigException(ErrorCodeContants.CONFIG615,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG615), e.getMessage());
		}
		if (response.getStatusCode() == HttpStatus.OK) {
			return response;
		} else {
			throw new PortalConfigException(ErrorCodeContants.CONFIG604,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG604), "Failed to search business entity record\"");
		}

	}
}
