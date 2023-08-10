package com.informatica.mdm.portal.metadata.service.impl;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.UUID;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatus.Series;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.delos.cmx.server.admin.AdminLogin;
import com.delos.cmx.server.admin.Result;
import com.delos.cmx.server.datalayer.ConnectionData;
import com.delos.cmx.server.datalayer.repository.ReposException;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.delos.cmx.server.datalayer.repository.security.PasswordValidationPattern;
import com.delos.cmx.server.datalayer.repository.security.ReposUser;
import com.delos.util.StringUtil;
import com.delos.util.base64.Base64;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.gson.Gson;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.ecore.validator.EcoreValidator;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.RecordRegistrationException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.UserRegistrationException;
import com.informatica.mdm.portal.metadata.model.PasswordPolicy;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.model.SignupData;
import com.informatica.mdm.portal.metadata.service.ChangePasswordService;
import com.informatica.mdm.portal.metadata.service.EcoreMapperService;
import com.informatica.mdm.portal.metadata.service.ExternalConfigService;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.JsonUtil;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.mifmif.common.regex.Generex;
import com.siperian.sam.BaseSecurityCredential;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import com.siperian.sif.client.CertificateHelper;

import java.util.Arrays;

@Service
public class PortalUIServiceImpl implements PortalUIService {

	private static Map<String, String> regexMap = new HashMap<>();
	private static final String emailRegex = "^[\\w-_\\.+]*[\\w-_\\.]\\@([\\w]+\\.)+[\\w]+[\\w]$";

	private static final String DEFAULT = "default";
	private static final String DEPTH_ONE = "1";

	static {

		regexMap.put("Any character(s)", ".*");
		regexMap.put("Alpha character(s)", "[A-Za-z]+");
		regexMap.put("Alphanumeric character(s)", "[A-Za-z0-9]+");
		regexMap.put("Numeric character(s)", "[0-9]+");
		regexMap.put("Non-Alphanumeric character(s)", "[^A-Za-z0-9]+");
		regexMap.put("Non-Alpha character(s)", "[^A-Za-z]+");
		regexMap.put("Non-Numeric character(s)", "[^0-9]+");
		regexMap.put("default", ".*");

	}
	private final static Logger log = LoggerFactory.getLogger(PortalUIServiceImpl.class);

	@Autowired
	private PortalPersistenceService portalPersistenceService;

	@Autowired
	ObjectMapper mapper;

	@Autowired
	private EcoreValidator configValidator;

	@Autowired
	private ExternalConfigFactory externalConfigFactory;

	@Autowired
	RestTemplate restTemplate;

	@Autowired
	private EmailNotificationService emailNotificationService;

	private static final int BUFFER_SIZE = 8192;

	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	@Autowired
	@Qualifier(value = "externalErrorProperties")
	private Map<String, Map<String, Properties>> externalErrorProperties;

	@Autowired
	@Qualifier(value = "externalBundleProperties")
	private Map<String, Map<String, Properties>> externalBundleProperties;

	@Value("${cmx.home}")
	private String cmxHome;

	@Value("${cmx.appserver.type}")
	private String appServerType;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}

	@Autowired
	private ChangePasswordService passwordService;

	@Autowired
	private EcoreMapperService mapperService;

	@Autowired
	private ExternalConfigService externalConfigService;

	@Override
	public JsonNode getGlobalPortal(Credentials credentials, String portalId, String orsId, String initialUrl,
			String selectedLocale,String ict) throws PortalConfigException {

		ObjectNode portalNode = null;
		JsonNode publishedPortalConfig = portalPersistenceService.getPublishedPortalConfig(credentials, portalId, orsId);

		log.info("STATUS: " + publishedPortalConfig.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText());
		Properties externalBundleProperty = null != externalBundleProperties.get(portalId) ? externalBundleProperties
				.get(portalId).get(null != selectedLocale ? selectedLocale : PortalServiceConstants.DEFAULT_LOCALE)
				: null;

		if (null != externalBundleProperty) {
			enrichBundles(publishedPortalConfig, externalBundleProperty);
		}

		// NEW
		JsonNode portalConfigNode = mapper.createObjectNode();
		((ObjectNode) portalConfigNode)
			.set(PortalMetadataContants.GENERAL_SETTINGS, publishedPortalConfig.get(PortalMetadataContants.GENERAL_SETTINGS));
		((ObjectNode) portalConfigNode)
			.put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE, publishedPortalConfig.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText());
		String prettyPrint = portalConfigNode.toPrettyString();
		log.info("PRETTY PRINT: " + prettyPrint);

		String trustedUser = getTrustedAppUser(portalId, orsId);
		log.info("Global Api BE Trusted user name is {}", trustedUser);

		String securityPayload = PortalConfigUtil.getSecurityPayloadForRest(
				PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, "getObjectMetadataUsingGET");

		credentials = new Credentials(PortalServiceConstants.TRUSTED_APP, securityPayload);
		log.info("BEFORE INVOKE EXTERNAL CONFIG SERVICE");
		externalConfigFactory.invokeExternalConfigService(portalConfigNode, credentials, orsId, securityPayload, true,
				initialUrl, selectedLocale,ict);
		log.info("AFTER INVOKE EXTERNAL CONFIG SERVICE");

		try {
			if (null != portalConfigNode) {
				portalNode = mapper.createObjectNode();

				Iterator<Entry<String, JsonNode>> fields = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
						.fields();
				while (fields.hasNext()) {
					Entry<String, JsonNode> processNode = fields.next();
					if (processNode.getValue().isObject()) {
						portalNode.putObject(processNode.getKey()).setAll((ObjectNode) processNode.getValue());
					} else if (processNode.getValue().isValueNode()) {
						populateValueNode(portalNode, processNode.getKey(), processNode.getValue());
					} else if (processNode.getValue().isArray()) {
						portalNode.putArray(processNode.getKey()).addAll((ArrayNode) processNode.getValue());
					}
				}
				log.info("AFTER SET GENERAL");
				portalNode.put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE,
						portalConfigNode.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText());
			}
			return portalNode;
		} catch (Exception e) {
			log.error("Error on get Portal Config for portal id {}", portalId);
			throw new PortalConfigException(e);
		}
	}

	private static void populateValueNode(JsonNode responseNode, String key, JsonNode value) {

		if (value.isTextual()) {
			((ObjectNode) responseNode).put(key, value.asText());
		} else if (value.isNumber()) {
			((ObjectNode) responseNode).put(key, value.asInt());
		} else if (value.isBoolean()) {
			((ObjectNode) responseNode).put(key, value.asBoolean());
		} else {
			((ObjectNode) responseNode).putPOJO(key, value);
		}
	}

	@Override
	public JsonNode getRuntimeConfig(Credentials credentials, String portalId, PortalRestConfig restConfig)
			throws PortalConfigException {

		JsonNode runtimeConfigNode = portalPersistenceService.getPortalRuntimeConfig(credentials, restConfig.getOrs(),
				portalId);

		log.info(
				"Portal UI - Apply Filter on Retrieved Runtime Configuration for portalId {}, with orsId {} and filter {}",
				portalId, restConfig.getOrs(), restConfig.getFilter());

		if (null != restConfig.getFilter()) {
			log.info("Portal UI - Portal Config Runtime Configuration apply filter {} ", restConfig.getFilter());
			runtimeConfigNode = JsonUtil.applyFilter(runtimeConfigNode, restConfig.getFilter());
		}

		log.info(
				"Portal UI - Apply Projections - Retrieved Runtime Configuration for portalId {}, with orsId {} and filter {}",
				portalId, restConfig.getOrs(), restConfig.getProjections());

		if (!runtimeConfigNode.isMissingNode() && null != restConfig.getProjections()
				&& !restConfig.getProjections().isEmpty()) {
			log.info("Portal UI - Portal Config Runtime Configuration apply projections {}",
					restConfig.getProjections());
			runtimeConfigNode = JsonUtil.applyProjections(runtimeConfigNode, restConfig.getProjections());
		}

		return runtimeConfigNode;
	}

	@Override
	public JsonNode getBundleFromLocale(Credentials credentials, String portalId, String orsId, String locale)
			throws PortalConfigException {
		JsonNode jsonNode = null;
		Object bundles = portalPersistenceService.getBundles(credentials, orsId, portalId);
		if (bundles == null) {
			log.error("Error on Fetching bundles for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG611,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG611),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG611));
		}
		ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream((byte[]) bundles));
		ZipEntry entry = null;
		byte[] defaultLocaleByteArray = null;
		byte[] localeByteArray = null;
		try {
			while ((entry = zis.getNextEntry()) != null) {
				String fileName = entry.getName();
				ByteArrayOutputStream fos = new ByteArrayOutputStream();
				final byte[] buf = new byte[BUFFER_SIZE];
				int length;
				while ((length = zis.read(buf, 0, buf.length)) >= 0) {
					fos.write(buf, 0, length);
				}
				if (fileName.equalsIgnoreCase(PortalServiceConstants.DEFAULT_BUNDLE_PROPETIES)) {
					defaultLocaleByteArray = fos.toByteArray();
				}
				if (fileName.equalsIgnoreCase(String.format(PortalServiceConstants.LOCALE_FILE_FORMAT, locale))) {
					localeByteArray = fos.toByteArray();
				}
			}
			if (localeByteArray != null) {
				Gson gson = new Gson();
				Properties props = new Properties();
				props.load(new ByteArrayInputStream(localeByteArray));
				String res1 = gson.toJson(props);
				jsonNode = mapper.readTree(res1);
			} else {
				Gson gson = new Gson();
				Properties props = new Properties();
				props.load(new ByteArrayInputStream(defaultLocaleByteArray));
				String res1 = gson.toJson(props);
				jsonNode = mapper.readTree(res1);
			}
		} catch (IOException e) {
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG611,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG611), e.getMessage());
		}
		return jsonNode;
	}

	/*
	 * Retrieve portal configuration Supports List<Object> types, Object types and
	 * plain attribute types Perform a order by for List Objects
	 */
	@Override
	public JsonNode getPortalConfigModel(Credentials credentials, PortalRestConfig restConfig,String ict)
			throws PortalConfigException {

		List<String> pathNodes = restConfig.getPortalNodes();
		JsonNode portalConfigNode = null;

		configValidator.validateConfigPath(pathNodes);

		if (pathNodes.size() > 1) {
			if (StringUtils.isNotEmpty(pathNodes.get(1))) {

				String portalId = pathNodes.get(1);
				log.info("Portal UI Get Portal for portal Id {} ", portalId);

				portalConfigNode = portalPersistenceService.getPublishedPortalConfig(credentials, portalId,
						restConfig.getOrs());

				Properties externalBundleProperty = null != externalBundleProperties.get(portalId)
						? externalBundleProperties.get(portalId)
								.get(null != restConfig.getLocale() ? restConfig.getLocale()
										: PortalServiceConstants.DEFAULT_LOCALE)
						: null;

				if (null != externalBundleProperty) {
					log.info("Enriching Bundles for portalId {}", portalId);
					enrichBundles(portalConfigNode, externalBundleProperty);
				}

				if (null == portalConfigNode.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE)
						|| !PortalMetadataContants.PORTAL_STATUS_START.equalsIgnoreCase(
								portalConfigNode.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText())) {
					log.info("Portal with id {}, is not in run state", portalId);
					throw new ResourceNotFoundException(ErrorCodeContants.PORTAL613,
							errorCodeProperties.getProperty(ErrorCodeContants.PORTAL613),
							errorCodeProperties.getProperty(ErrorCodeContants.PORTAL613));
				}

				List<String> traversePath = pathNodes.stream().skip(2).collect(Collectors.toList());

				log.info("Portal UI Get Portal for portal Id {}, with path {} ", portalId, traversePath);

				portalConfigNode = JsonUtil.getPortalConfigModelByPath(portalConfigNode, traversePath);

				if (portalConfigNode.isMissingNode() || portalConfigNode.isEmpty(null)) {
					if (mapperService.isEStructuralFeatureList(traversePath)) {
						log.error("List Structural feature with emptyNode for path {}", pathNodes);
						return portalConfigNode;
					}
					log.error("Invalid path {} ", pathNodes);
					throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716),
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
				}

				if (null != restConfig.getFilter()) {
					log.info("Portal UI Get Portal for portal Id {}, apply filter {} ", portalId,
							restConfig.getFilter());
					portalConfigNode = JsonUtil.applyFilter(portalConfigNode, restConfig.getFilter());
				}

				if (!portalConfigNode.isMissingNode()) {
					log.info("Portal UI Get Portal for portal Id {}, apply depth {} ", portalId, restConfig.getDepth());
					portalConfigNode = JsonUtil.applyDepth(portalConfigNode,
							!traversePath.isEmpty() ? traversePath.get(traversePath.size() - 1) : "",
							restConfig.getDepth());
				}

				if (!portalConfigNode.isMissingNode() && portalConfigNode.isArray()) {
					log.info("Portal UI Get Portal for portal Id {}, apply sort {} with sortOrder {}", portalId,
							restConfig.getSort(), restConfig.getSortOrder());
					portalConfigNode = JsonUtil.applySort(portalConfigNode, restConfig.getSort(),
							restConfig.getSortOrder());
				}

				if (!portalConfigNode.isMissingNode() && null != restConfig.getProjections()
						&& !restConfig.getProjections().isEmpty()) {
					log.info("Portal UI Get Portal for portal Id {}, apply projections {}", portalId,
							restConfig.getProjections());
					portalConfigNode = JsonUtil.applyProjections(portalConfigNode, restConfig.getProjections());
				}

				if (restConfig.getResolveExtConfig()) {
					externalConfigFactory.invokeExternalConfigService(portalConfigNode, credentials,
							restConfig.getOrs(), restConfig.getMdmSessionId(), true, restConfig.getInitialApiUrl(),
							restConfig.getLocale(),ict);
				}

			}

		} else {
			log.error("Invalid path {} with error {} ", pathNodes,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
			throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
		}
		return portalConfigNode;
	}

	private void enrichBundles(JsonNode portalConfigNode, Properties externalBundleProperty) {

		Set<Object> fieldKeys = externalBundleProperty.keySet();
		for (Object fieldKey : fieldKeys) {
			log.info("Enriching Bundles traversing for key {}", fieldKey);
			JsonNode filteredNode = portalConfigNode;
			String[] propKeys = ((String) fieldKey).split("\\.");
			for (String propKey : propKeys) {
				log.info("Enriching Bundles Mapping for key {}", propKey);
				filteredNode = mappedNode(filteredNode, propKey);
				if (null == filteredNode || filteredNode.isEmpty(null)) {
					log.info("No Node found for mapKey {} in jsonNode {}", propKey, filteredNode);
					break;
				}
			}
			if (null != filteredNode && !filteredNode.isEmpty(null)) {
				log.info("Enriching Bundles for key {} with value {}", fieldKey,
						externalBundleProperty.getProperty((String) fieldKey));
				((ObjectNode) filteredNode).put(propKeys[propKeys.length - 1],
						externalBundleProperty.getProperty((String) fieldKey));
			}
		}
	}

	private JsonNode mappedNode(JsonNode portalConfigNode, String searchKey) {

		JsonNode filteredNode = null;
		if (portalConfigNode.isObject()) {
			if (portalConfigNode.has(searchKey) && portalConfigNode.get(searchKey).isValueNode()) {
				return portalConfigNode;
			} else if (portalConfigNode.has(searchKey)
					&& (portalConfigNode.get(searchKey).isObject() || portalConfigNode.get(searchKey).isArray())) {
				return portalConfigNode.get(searchKey);
			}
			Iterator<Entry<String, JsonNode>> objectFields = portalConfigNode.fields();
			while (objectFields.hasNext()) {
				Entry<String, JsonNode> fieldEntry = objectFields.next();
				filteredNode = mappedNode(fieldEntry.getValue(), searchKey);
				if (null != filteredNode && !filteredNode.isEmpty(null)) {
					return filteredNode;
				}
			}
		} else if (portalConfigNode.isArray()) {
			for (JsonNode arrNode : portalConfigNode) {
				if (arrNode.has(PortalMetadataContants.KEY_ATTRIBUTE)
						&& arrNode.get(PortalMetadataContants.KEY_ATTRIBUTE).asText().equalsIgnoreCase(searchKey)) {
					return arrNode;
				}
				filteredNode = mappedNode(arrNode, searchKey);
			}
		}
		return filteredNode;
	}

	@Override
	public void persistUser(Credentials credentials, String orsId, String beName, SignupData jsonBody,
			HttpServletRequest request, String systemName) throws PortalConfigException {

		String selectedLocale = null, username = null, portalId = null;
		String trustedUser = null;
		try {

			selectedLocale = PortalConfigUtil.getCookieValue(request, PortalServiceConstants.PORTAL_LOCALE);

			portalId = request.getHeader(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID);

			username = jsonBody.getUserData().get("userName").getAsString();
			String email = jsonBody.getUserData().get("email").getAsString();
			if (!email.matches(emailRegex)) {
				throw new PortalConfigException(ErrorCodeContants.PORTAL627,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL627), "Email id format is not valid");
			}

			trustedUser = getTrustedAppUser(portalId, orsId);
			log.info("Signup Trusted user name is {}", trustedUser);

			String createUserSecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
					PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, "", "createUserUsingPOST");
			boolean userCreated = createUser(portalCmxUrl, jsonBody.getUserData().toString(), createUserSecurityPayload,
					selectedLocale, portalId, username, false);
			log.info("Username: {} is created successfully", username);

			String rowidObject = null;
			if (userCreated) {
				log.info("Creating BE: {}", beName);
				String writeBESecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
						PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, "createEntityUsingPOST");
				rowidObject = createBE(portalCmxUrl, jsonBody.getBEData().toString(), beName, orsId, writeBESecurityPayload,
						selectedLocale, portalId, systemName);
				log.info("BE created successfully: for beName{}, and rowidObject {}", beName, rowidObject);
				try {

					Map<String, String> emailProperties = new HashMap<String, String>();
					emailProperties.put(PortalServiceConstants.EMAIL_LOGIN_NAME, username);
					emailNotificationService.sendEmail(orsId, portalId,
							PortalMetadataContants.EMAIL_TEMPLATE_SIGNUP_REGISTRATION, emailProperties, email);
				} catch (Exception e) {
					log.error("Unable to send registration successful email : " + e.getMessage());
				}
			}

		} catch (RecordRegistrationException e) {
			log.error(e.getMessage());

			log.info("Rolling back: since BE creation failed deleting username {}", username);
			String deleteUserSecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
					PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, "", "deleteUserUsingDELETE");
			deleteUser(portalCmxUrl, username, deleteUserSecurityPayload, selectedLocale, portalId);
			log.info("Deleted username {}", username, " successfully");

			throw e;
		} catch (PortalConfigException e) {
			log.error(e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
	}

	private String createBE(String baseURL, String beJson, String beName, String orsId, String securityPayload,
			String selectedLocale, String portalId, String systemName) throws RecordRegistrationException {

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get(PortalServiceConstants.DEFAULT_LOCALE)
					: null;
		}

		String rowidObject = "";
		String url = String.format(PortalServiceConstants.CREATE_BE_URL, baseURL, orsId, beName, systemName);
		log.info("BE Create for api url {}, beName {} ", baseURL, beName);
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<String> response;
		headers.clear();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		if (StringUtils.isNotEmpty(selectedLocale)) {
			headers.add(ExternalConfigConstants.AUTH_COOKIE,
					StringUtils.join(PortalServiceConstants.BES_LOCALE, selectedLocale));
		}
		try {
			response = PortalConfigUtil.executeRest(url, HttpMethod.POST, beJson, headers, restTemplate);
			if (response.getStatusCode().series() == Series.SUCCESSFUL) {
				JSONObject jsonObject = new JSONObject(response.getBody());
				rowidObject = (String) ((JSONObject) jsonObject.get(beName)).get("rowidObject");
			} else if(response.getStatusCode().series() == Series.SERVER_ERROR || response.getStatusCode().series() == Series.CLIENT_ERROR) {
				log.error("Validation Error on invoking Signup create BE api for payload {}, for apiUrl {}, with exception {}, {}, ",
						beJson, url, response.getStatusCode().getReasonPhrase(), response.getBody());
				throw new RecordRegistrationException(ErrorCodeContants.PORTAL621,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL621), response.getStatusCode().getReasonPhrase(),
						response.getBody(), externalErrorProperty);
			}
		} catch (HttpServerErrorException | HttpClientErrorException e) {
			log.error("Error on invoking Signup create BE api for payload {}, for apiUrl {}, with exception {}, {}, ",
					beJson, url, e.getMessage(), e.getResponseBodyAsString());
			throw new RecordRegistrationException(ErrorCodeContants.PORTAL621,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL621), e.getMessage(),
					e.getResponseBodyAsString(), externalErrorProperty);
		} catch (RecordRegistrationException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error on invoking Signup create BE api for beName {}", beName, e.getMessage());
			throw new RecordRegistrationException(ErrorCodeContants.PORTAL621,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL621), e.getMessage());
		}
		return rowidObject;
	}

	private boolean createUser(String baseURL, String userData, String securityPayload, String selectedLocale,
			String portalId , String userName , boolean isWorkflow) throws UserRegistrationException {

		HttpHeaders headers = new HttpHeaders();

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get(PortalServiceConstants.DEFAULT_LOCALE)
					: null;
		}

		String url = String.format(PortalServiceConstants.CREATE_USER_URL, baseURL);
		log.info("Create User for api url {} ", baseURL);
		ResponseEntity<String> response;
		headers.clear();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		if (StringUtils.isNotEmpty(selectedLocale)) {
			headers.add(ExternalConfigConstants.AUTH_COOKIE,
					StringUtils.join(PortalServiceConstants.BES_LOCALE, selectedLocale));
		}
		try {
			response = PortalConfigUtil.executeRest(url, HttpMethod.POST, userData, headers, restTemplate);
		} catch (HttpServerErrorException | HttpClientErrorException e) {
			if (isWorkflow) {
				try {
					ArrayNode users = getHubUser(userName);
					if(users == null) {
						log.error(
								"Validation Error on invoking create User api for payload {}, for apiUrl {}, with exception {}, with custom error {}, ",
								userData, url, e.getMessage(), e.getResponseBodyAsString());
						throw new UserRegistrationException(ErrorCodeContants.PORTAL629,
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL629), e.getMessage(),
								e.getResponseBodyAsString(), externalErrorProperty);
					}
					return true;
				} catch (PortalConfigException e1) {
					log.error("Exception occurred while fetching hub users");
					throw new UserRegistrationException(ErrorCodeContants.PORTAL633,
							errorCodeProperties.getProperty(ErrorCodeContants.PORTAL633), e1.getMessage());
				}

			} else {
				log.error(
						"Validation Error on invoking create User api for payload {}, for apiUrl {}, with exception {}, with custom error {}, ",
						userData, url, e.getMessage(), e.getResponseBodyAsString());
				throw new UserRegistrationException(ErrorCodeContants.PORTAL629,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL629), e.getMessage(),
						e.getResponseBodyAsString(), externalErrorProperty);
			}

		} catch (Exception e) {
			if (isWorkflow) {
				try {
					ArrayNode users = getHubUser(userName);
					if (users == null) {
						log.error("Error on invoking create User api for userData {}", userData, e.getMessage());
						throw new UserRegistrationException(ErrorCodeContants.PORTAL623,
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL623), e.getMessage());
					}
					return true;
				} catch (PortalConfigException e1) {
					log.error("Exception occurred while fetching hub users");
					throw new UserRegistrationException(ErrorCodeContants.PORTAL633,
							errorCodeProperties.getProperty(ErrorCodeContants.PORTAL633), e1.getMessage());
				}

			} else {
				log.error("Error on invoking create User api for userData {}", userData, e.getMessage());
				throw new UserRegistrationException(ErrorCodeContants.PORTAL623,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL623), e.getMessage());
			}

		}

		if (response.getStatusCode() != HttpStatus.OK) {
			throw new UserRegistrationException(ErrorCodeContants.PORTAL623,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL623), response.getStatusCode().toString());
		}

		return true;
	}

	private void deleteUser(String baseURL, String userId, String securityPayload, String selectedLocale,
			String portalId) throws UserRegistrationException {

		HttpHeaders headers = new HttpHeaders();

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get(PortalServiceConstants.DEFAULT_LOCALE)
					: null;
		}

		String url = String.format(PortalServiceConstants.DELETE_USER_URL, baseURL, userId);
		log.info("Delete User for api url {} ", baseURL);
		ResponseEntity<String> response;
		headers.clear();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		if (StringUtils.isNotEmpty(selectedLocale)) {
			headers.add(ExternalConfigConstants.AUTH_COOKIE,
					StringUtils.join(PortalServiceConstants.BES_LOCALE, selectedLocale));
		}
		try {
			response = PortalConfigUtil.executeRest(url, HttpMethod.DELETE, null, headers, restTemplate);
			if (response.getStatusCode() != HttpStatus.OK) {
				throw new PortalConfigException(ErrorCodeContants.PORTAL624,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL624),
						response.getStatusCode().toString());
			}
		} catch (HttpServerErrorException | HttpClientErrorException e) {
			log.error(
					"Error on invoking delete User api for userId {}, for apiUrl {}, with exception {}, with custom error {}, ",
					userId, url, e.getMessage(), e.getResponseBodyAsString());
			throw new UserRegistrationException(ErrorCodeContants.PORTAL624,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL624), e.getMessage(),
					e.getResponseBodyAsString(), externalErrorProperty);
		} catch (Exception e) {
			log.error("Error on invoking delete User api for userId {}", userId, e.getMessage());
			throw new UserRegistrationException(ErrorCodeContants.PORTAL624,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL624), e.getMessage());
		}
	}

	public boolean updateBE(String baseURL, String beJson, String beName, String orsId, String securityPayload,
			String rowidObject, String selectedLocale, String portalId, String interactionId, String systemName)
			throws RecordRegistrationException {

		boolean updateFlag = false;
		String url = null;

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get(PortalServiceConstants.DEFAULT_LOCALE)
					: null;
		}

		if (interactionId != null) {
			url = String.format(PortalServiceConstants.UPDATE_BE_URL_PENDING, baseURL, orsId, beName, rowidObject,
					systemName, interactionId);
		} else {
			url = String.format(PortalServiceConstants.UPDATE_BE_URL, baseURL, orsId, beName, rowidObject, systemName);
		}
		log.info("BE Update for api url {}, beName {} ", baseURL, beName);
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<String> response;
		headers.clear();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		if (StringUtils.isNotEmpty(selectedLocale)) {
			headers.add(ExternalConfigConstants.AUTH_COOKIE,
					StringUtils.join(PortalServiceConstants.BES_LOCALE, selectedLocale));
		}
		try {
			response = PortalConfigUtil.executeRest(url, HttpMethod.POST, beJson, headers, restTemplate);
			if (response.getStatusCode().series() == Series.SUCCESSFUL) {
				updateFlag = true;
			} else if(response.getStatusCode().series() == Series.SERVER_ERROR || response.getStatusCode().series() == Series.CLIENT_ERROR) {
				log.error("Validation Error on invoking AddUser update BE api for payload {}, for apiUrl {}, with exception {}, {}, ",
						beJson, url, response.getStatusCode().getReasonPhrase(), response.getBody());
				throw new RecordRegistrationException(ErrorCodeContants.PORTAL625,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL625), response.getStatusCode().getReasonPhrase(),
						response.getBody(), externalErrorProperty);
			}
		} catch (RecordRegistrationException e) {
			throw e;
		} catch (HttpServerErrorException | HttpClientErrorException e) {
			log.error("Error on invoking AddUser update BE api for payload {}, for apiUrl {}, with exception {}, {}, ",
					beJson, url, e.getMessage(), e.getResponseBodyAsString());
			throw new RecordRegistrationException(ErrorCodeContants.PORTAL625,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL625), e.getMessage(),
					e.getResponseBodyAsString(), externalErrorProperty);
		} catch (Exception e) {
			log.error("Error on invoking AddUser update BE api for beName {}", beName, e.getMessage());
			throw new RecordRegistrationException(ErrorCodeContants.PORTAL625,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL625), e.getMessage());
		}

		return updateFlag;
	}

	@Override
	public JsonNode addUser(HttpServletRequest request, String orsId, String beName, JsonNode payloadData,
			String systemName) throws PortalConfigException {
	
		JsonNode jsonNode = null;
		if (null == payloadData.get(PortalMetadataContants.USER_DATA)) {
			log.error("Add User userData payload is empty");
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501));
		}

		String selectedLocale = null, username = null, portalId = null, trustedUser = null;
		boolean isExternalUserManagementEnabled = false, isWorkflow = false;
		
		try {

			portalId = request.getHeader(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID);
			String portalSessionId = PortalConfigUtil.getCookieValue(request,
					ExternalConfigConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
			String authMDMPayload = request.getHeader(PortalServiceConstants.AUTH_SECURITY_PAYLOAD);

			// to read portal configurations
			JsonNode portalConfigNode = portalPersistenceService.getPublishedPortalConfig(null, portalId, orsId);
			
			// to check for isExternalUser Attrib. is present in configurations
			boolean isExternalUserAttribCheck = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).has(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED);
			if (isExternalUserAttribCheck) {
				isExternalUserManagementEnabled = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
						.get(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED).asBoolean();
			}
			log.info("Add User : isExternalUserManagementEnabled : {}", isExternalUserManagementEnabled);
			if (isExternalUserManagementEnabled) {
				((ObjectNode) payloadData.get(PortalMetadataContants.USER_DATA))
						.put(PortalMetadataContants.EXTERNAL_USER, true);
			} else {
				String generatedPassword = null;
				if (!StringUtil.isEmpty(portalSessionId)) {
					generatedPassword = generateRandomPassword(portalSessionId);
					log.info("Add User : Generated Password {}", generatedPassword);
				} else {
					if (!StringUtil.isEmpty(authMDMPayload)) {
						if (null == payloadData.get("passwordPolicy")) {
							log.error("Password policy is empty");
							throw new PortalConfigException(ErrorCodeContants.CONFIG501,
									errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501),
									errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501));
						} else {
							PasswordPolicy passwordPolicy = mapper.convertValue(payloadData.get("passwordPolicy"),
									PasswordPolicy.class);
							generatedPassword = generateRandomPassword(passwordPolicy);
							log.info("Add User : Generated Password {}", generatedPassword);
						}
					} else {
						log.error("Auth Security payload is empty");
						throw new PortalConfigException(ErrorCodeContants.CONFIG501,
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501),
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501));
					}
				}
				((ObjectNode) payloadData.get(PortalMetadataContants.USER_DATA)).put(PortalMetadataContants.PASSWORD,
						generatedPassword);
			}

			trustedUser = getTrustedAppUser(portalId, orsId);
			log.info("Add User Trusted user name is {}", trustedUser);
			selectedLocale = PortalConfigUtil.getCookieValue(request, PortalServiceConstants.PORTAL_LOCALE);

			username = payloadData.get(PortalMetadataContants.USER_DATA).get("userName").asText();
			String email = payloadData.get(PortalMetadataContants.USER_DATA).get("email").asText();
			String createUserSecurityPayload = null;
			if (!StringUtil.isEmpty(authMDMPayload)) {
				createUserSecurityPayload = authMDMPayload;
			} else {
				createUserSecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
						PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, "", "createUserUsingPOST");
			}
			if (payloadData.has(PortalServiceConstants.ADD_USER_IS_WORKFLOW) && !payloadData.get(PortalServiceConstants.ADD_USER_IS_WORKFLOW).isEmpty(null)) {
				isWorkflow = payloadData.get(PortalServiceConstants.ADD_USER_IS_WORKFLOW).asBoolean();
			}
			log.info("Add User: {} username creation for url {} ", username, portalCmxUrl);
	        boolean userCreated = createUser(portalCmxUrl, payloadData.get(PortalMetadataContants.USER_DATA).toString(),
					createUserSecurityPayload, selectedLocale, portalId , username, isWorkflow);

			log.info("Add user : Username: {} is created successfully", username);

			boolean beUpdateFlag = false;
			if (userCreated && null != payloadData.get(PortalServiceConstants.BE_DATA)) {

				log.info("Add User : BE Update for api url {}, beName {} ", portalCmxUrl, beName);
				String rowidObject = payloadData.get(PortalServiceConstants.BE_DATA).get("rowidObject").asText();
				String beViewUrl = String.format(PortalServiceConstants.UPDATE_BE_URL, portalCmxUrl, orsId, beName,
						rowidObject, systemName);
				beUpdateFlag = updateBEViaProxy(beViewUrl, portalSessionId, selectedLocale,
						payloadData.get(PortalServiceConstants.BE_DATA), portalId);
				log.info("Add User : BE Updated for api url {}, beName {} is updated {} ", beViewUrl, beName,
						beUpdateFlag);

			}
			if (!isExternalUserManagementEnabled) {
				ObjectNode mailNode = mapper.createObjectNode();
				mailNode.put(PortalServiceConstants.CHANGEPASSWORD_ISNEWUSER, true);
				mailNode.put(PortalServiceConstants.RESETPASSWORD_USERNAME, username);
				mailNode.put(PortalServiceConstants.CHANGEPASSWORD_EMAIL, email);
				if (payloadData.has(PortalServiceConstants.FORGOT_PASSWORD_URL)
						&& !payloadData.get(PortalServiceConstants.FORGOT_PASSWORD_URL).isEmpty(null)) {
					mailNode.put(PortalServiceConstants.FORGOT_PASSWORD_URL,
							payloadData.get(PortalServiceConstants.FORGOT_PASSWORD_URL).asText());
				}
				if (payloadData.has(PortalServiceConstants.ADD_USER_SEND_EMAIL) && !payloadData.get(PortalServiceConstants.ADD_USER_SEND_EMAIL).isEmpty(null)) {
			    	 mailNode.put(PortalServiceConstants.ADD_USER_SEND_EMAIL, payloadData.get(PortalServiceConstants.ADD_USER_SEND_EMAIL).asBoolean());
			     }
			          
				log.info("Add User : Generate Email for userData {} ", mailNode);
				Map<String, Object> resp = passwordService.generateForgotPasswordLink(orsId, portalId, mailNode.toString(), request);
				jsonNode = this.mapper.valueToTree(resp);
			}
		} catch (RecordRegistrationException e) {

			log.info("Rolling back: since BE Update failed deleting username {}", username);
			String deleteUserSecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
					PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, "", "deleteUserUsingDELETE");
			deleteUser(portalCmxUrl, username, deleteUserSecurityPayload, selectedLocale, portalId);
			log.info("Deleted username {}", username, " successfully");

			throw e;
		} catch (UserRegistrationException e) {
			log.error(e.getMessage());
			e.setErrorCode(ErrorCodeContants.PORTAL634);
			e.setErrorMessage(errorCodeProperties.getProperty(ErrorCodeContants.PORTAL634));
			throw e;
		} catch (PortalConfigException e) {
			log.error(e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		return jsonNode;

	}

	public String generateRandomPassword(String mdmSessionId) throws PortalConfigException {

		String randomPassword = null;
		try {

			BaseSecurityCredential baseSecurityCredentials = new BaseSecurityCredential();
			byte[] securityPayload = ("mdm.session.id||" + mdmSessionId).getBytes();
			baseSecurityCredentials.setPayload(securityPayload);
			ReposUser globalUser = getGlobalUser(baseSecurityCredentials);
			Integer maxPasswordLength = globalUser.getMaximumPasswordLength();
			Integer minPasswordLength = globalUser.getMinimumPasswordLength();
			PasswordValidationPattern passwordPattern = globalUser.getPasswordValidationPattern();
			Integer uniqueLength = passwordPattern.getMinimumUniqueCharacters();
			String passwordBeginPattern = passwordPattern.getPasswordBeginningPattern();
			String passwordMidPattern = passwordPattern.getPasswordMiddlePattern();
			String passwordEndPattern = passwordPattern.getPasswordEndPattern();
			passwordBeginPattern = passwordBeginPattern.replace("+", "{" + uniqueLength + ",}");
			String regex = passwordBeginPattern + passwordMidPattern + passwordEndPattern;
			Generex genrex = new Generex(regex.toString());
			randomPassword = genrex.random(minPasswordLength, maxPasswordLength);

		} catch (Exception e) {
			log.error("Error on generation of Random Password");
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		return randomPassword;
	}

	public String generateRandomPassword(PasswordPolicy passwordPolicy) throws PortalConfigException {
		String randomPassword = null;
		try {
			Integer maxPasswordLength = passwordPolicy.getMaximumPasswordLength();
			Integer minPasswordLength = passwordPolicy.getMinimumPasswordLength();
			Integer uniqueLength = passwordPolicy.getMinimumUniqueCharacters();
			String passwordBeginPattern = passwordPolicy.getPasswordBeginningPattern();
			String passwordMidPattern = passwordPolicy.getPasswordMiddlePattern();
			String passwordEndPattern = passwordPolicy.getPasswordEndPattern();
			if (!passwordPolicy.isPatternValidationEnabled()) {
				uniqueLength=0;
				passwordBeginPattern = regexMap.get(DEFAULT);
				passwordMidPattern = regexMap.get(DEFAULT);
				passwordEndPattern = regexMap.get(DEFAULT);
			}else {
				if (regexMap.containsKey(passwordBeginPattern)) {
					passwordBeginPattern = regexMap.get(passwordBeginPattern);
				} else {
					passwordBeginPattern = regexMap.get(DEFAULT);
				}
				if (regexMap.containsKey(passwordMidPattern)) {
					passwordMidPattern = regexMap.get(passwordMidPattern);
				} else {
					passwordMidPattern = regexMap.get(DEFAULT);
				}
				if (regexMap.containsKey(passwordEndPattern)) {
					passwordEndPattern = regexMap.get(passwordEndPattern);
				} else {
					passwordEndPattern = regexMap.get(DEFAULT);
				}
			}
			passwordBeginPattern = passwordBeginPattern.replace("+", "{" + uniqueLength + ",}");
			String regex = passwordBeginPattern + passwordMidPattern + passwordEndPattern;
			Generex genrex = new Generex(regex.toString());
			randomPassword = genrex.random(minPasswordLength, maxPasswordLength);
		} catch (Exception e) {
			log.error("Error on generation of Random Password");
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		return randomPassword;
	}

	@SuppressWarnings("unchecked")
	public ReposUser getGlobalUser(BaseSecurityCredential baseSecurityCredentials)
			throws ReposException, AccessException {

		log.info("Fetching Global User ");
		AdminLogin adminLogin = HubClient.getInstance().getAdminLoginBean();
		ConnectionData connectionData = adminLogin.loginUser(baseSecurityCredentials);
		Result usersResult = adminLogin.getUsers(connectionData);
		List<ReposUser> allUsers = (List<ReposUser>) usersResult.getResultData();
		ReposUser globalUser = allUsers.stream().filter(user -> ReposUser.GLOBAL_USER.equalsIgnoreCase(user.getName()))
				.findFirst().get();
		return globalUser;
	}

	@Override
	public void deleteUser(HttpServletRequest request, String orsId, String username, String beName,
			JsonNode payloadData, String systemName) throws PortalConfigException {

		log.info("Delete User for username {} in orsId {} with payload {}", username, orsId, payloadData);

		try {

			String portalId = request.getHeader(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID);
			String selectedLocale = PortalConfigUtil.getCookieValue(request, PortalServiceConstants.PORTAL_LOCALE);
			String portalSessionId = PortalConfigUtil.getCookieValue(request,
					ExternalConfigConstants.PORTAL_UI_COOKIE + "-" + orsId + "-" + portalId);
			log.info("Delete User: deleting username {}", username);
			String trustedUser = getTrustedAppUser(portalId, orsId);
			log.info("Delete User Trusted user name is {}", trustedUser);
			String deleteUserSecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
					PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, "", "deleteUserUsingDELETE");
			deleteUser(portalCmxUrl, username, deleteUserSecurityPayload, selectedLocale, portalId);
			log.info("Delete User: Deleted username {}", username, " successfully");

			if (null != payloadData.get(PortalServiceConstants.BE_DATA)) {

				log.info("Delete User : BE Update for api url {}, beName {} ", portalCmxUrl, beName);
				String rowidObject = payloadData.get(PortalServiceConstants.BE_DATA).get("rowidObject").asText();
				String beViewUrl = String.format(PortalServiceConstants.UPDATE_BE_URL, portalCmxUrl, orsId, beName,
						rowidObject, systemName);
				boolean beUpdateFlag = updateBEViaProxy(beViewUrl, portalSessionId, selectedLocale,
						payloadData.get(PortalServiceConstants.BE_DATA), portalId);
				log.info("Delete User : BE Updated for api url {}, beName {} is updated {} ", portalCmxUrl, beName,
						beUpdateFlag);
				if (!beUpdateFlag) {
					throw new RecordRegistrationException(ErrorCodeContants.CONFIG501,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501),
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501));
				}
			}

		} catch (RecordRegistrationException | UserRegistrationException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error(e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}

	}

	public boolean updateBEViaProxy(String beViewUrl, String mdmSessionId, String selectedLocale, JsonNode payloadNode,
			String portalId) throws RecordRegistrationException {

		log.info("Add User: Update BE View Data Via Proxy Api for beViewUrl", beViewUrl);
		boolean updateFlag = false;

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get(PortalServiceConstants.DEFAULT_LOCALE)
					: null;
		}

		try {

			HttpHeaders headers = new HttpHeaders();
			String cookie = generateEncryptedCookie(mdmSessionId, appServerType);
			if (StringUtils.isNotEmpty(selectedLocale)) {
				cookie = StringUtils.join(cookie, "; selectedLocale=", selectedLocale);
			}
			headers.add(HttpHeaders.COOKIE, cookie);

			HttpEntity<?> request = new HttpEntity<Object>(payloadNode, headers);
			ResponseEntity<String> response = restTemplate.exchange(beViewUrl, HttpMethod.POST, request,
                    String.class);
			if (response.getStatusCode().series() == Series.SUCCESSFUL) {
				updateFlag = true;
			} else if(response.getStatusCode().series() == Series.SERVER_ERROR || response.getStatusCode().series() == Series.CLIENT_ERROR) {
				log.error("Error on invoking AddUser update BE api for payload {}, for apiUrl {}, with exception {}, {}, ",
						payloadNode, beViewUrl, response.getStatusCode().getReasonPhrase(), response.getBody());
				throw new RecordRegistrationException(ErrorCodeContants.PORTAL625,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL625), response.getStatusCode().getReasonPhrase(),
						response.getBody(), externalErrorProperty);
			}

		} catch (RecordRegistrationException e) {
			throw e;
		} catch (HttpServerErrorException | HttpClientErrorException e) {
			log.error("Error on invoking AddUser update BE api for payload {}, for apiUrl {}, with exception {}, {}, ",
					payloadNode, beViewUrl, e.getMessage(), e.getResponseBodyAsString());
			throw new RecordRegistrationException(ErrorCodeContants.PORTAL625,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL625), e.getMessage(),
					e.getResponseBodyAsString(), externalErrorProperty);
		} catch (Exception e) {
			log.error("Error on invoking AddUser update BE api for payload {}", payloadNode, e.getMessage());
			throw new RecordRegistrationException(ErrorCodeContants.PORTAL625,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL625), e.getMessage());
		}

		return updateFlag;
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
	public JsonNode getAvailableLocales(Credentials credentials, String orsId, String portalId)
			throws PortalConfigException {

		log.info("Portal UI - Get Available Locales for portalId {}, for orsId {}", portalId, orsId);
		Object bundles = portalPersistenceService.getBundles(credentials, orsId, portalId);
		ArrayNode locales = mapper.createArrayNode();
		ZipEntry entry = null;

		try {

			if (bundles != null) {
				log.info("Portal UI - Get Available Locales - processing bundles for portalId {}, for orsId {}",
						portalId, orsId);
				ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream((byte[]) bundles));
				while ((entry = zis.getNextEntry()) != null) {
					Locale locale = null;
					String fileName = entry.getName();
					log.info("Portal UI - Get Available Locales for portalId {}, for orsId {}, for fileName {}",
							portalId, orsId, fileName);
					String splittedFileName = fileName.split("\\.")[0];
					String localeKey = splittedFileName.split("_").length == 1 ? PortalServiceConstants.DEFAULT_LOCALE
							: splittedFileName.substring(splittedFileName.indexOf("_") + 1, splittedFileName.length());
					log.info("Portal UI - Get Available Locales for portalId {}, for orsId {}, for localeKey {}",
							portalId, orsId, localeKey);
					String[] localeKeyArr = localeKey.split("_");
					log.info("Portal UI - Get Available Locales for portalId {}, for orsId {}, for localeKey {}",
							portalId, orsId, localeKeyArr);
					if (localeKeyArr.length == 1) {
						locale = new Locale(localeKeyArr[0]);
					} else if (localeKeyArr.length == 2) {
						locale = new Locale(localeKeyArr[0], localeKeyArr[1]);
					}
					ObjectNode localNode = mapper.createObjectNode();
					localNode.put(PortalServiceConstants.LOCALE_KEY, localeKey);
					localNode.put(PortalServiceConstants.LOCALE_DISPLAY_NAME, locale.getDisplayLanguage(locale));
					locales.add(localNode);
					log.info("Portal UI - Get Available Locales for portalId {}, for orsId {}, for locale {}", portalId,
							orsId, localNode);
				}
			}

		} catch (Exception e) {
			log.error("Error on loading Custom Error Properties for portalId {} with error message {} ", portalId,
					e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.PORTAL617,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL617), e.getMessage());
		}

		return locales;
	}

	@Override
	public String getTrustedAppUser(String portalId, String orsId) throws PortalConfigException {

		String trustedUser = null;
		try {

			List<String> projections = new ArrayList<String>();
			projections.add(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
			String filter = "{\"name\":\"Portal Administrator User\"}";
			PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, filter, projections);
			JsonNode runtimeConfig = getRuntimeConfig(null, portalId, restConfig);
			if (null != runtimeConfig && !runtimeConfig.isEmpty(null)) {
				JsonNode trustedAppUserNode = runtimeConfig.get(0)
						.get(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
				trustedUser = StreamSupport.stream(trustedAppUserNode.spliterator(), false)
						.filter(node -> node.get(PortalServiceConstants.RUNTIME_CONFIG_KEY).asText()
								.equalsIgnoreCase(PortalServiceConstants.RUNTIME_CONFIG_USERNAME))
						.map(map -> map.get(PortalServiceConstants.RUNTIME_CONFIG_VALUE).asText()).findFirst().get();
			}

		} catch (PortalConfigException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching trusted app username for portalId {}, and orsId{},  with error message {} ",
					portalId, orsId, e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}

		return trustedUser;
	}

	@Override
	public void updatePortalStatus(HttpServletRequest request, String orsId, String systemName, JsonNode payloadNode)
			throws PortalConfigException {
		
		String selectedLocale = null, portalId = null, trustedUser = null, interactionId = null, rowidObject = null,
				dataType = null, key = null;

		try {
			portalId = request.getHeader(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID);
			String authMDMPayload = request.getHeader(PortalServiceConstants.AUTH_SECURITY_PAYLOAD);
			selectedLocale = PortalConfigUtil.getCookieValue(request, PortalServiceConstants.PORTAL_LOCALE);

			JsonNode portalConfigNode = portalPersistenceService.getPublishedPortalConfig(null, portalId, orsId);

			boolean isStateEnabled = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
					.get(PortalMetadataContants.STATE_ENABLED).asBoolean();
			if (!isStateEnabled) {
				return;
			}

			rowidObject = payloadNode.get(PortalServiceConstants.ROW_ID_OBJECT).asText();
			if (payloadNode.has(PortalServiceConstants.INTERRACTION_ID)) {
				interactionId = payloadNode.get(PortalServiceConstants.INTERRACTION_ID).asText();
			}

			trustedUser = getTrustedAppUser(portalId, orsId);

			String getObjectMetadataSecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
					PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, "getObjectMetadataUsingGET");

			String statePath = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
					.get(PortalMetadataContants.USER_MANAGEMENT_ATTRIBUTE)
					.get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE).get(PortalMetadataContants.PORTAL_USER_STATE)
					.get(PortalMetadataContants.CODE_ATTRIBUTE).asText();
			String beViewName = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
					.get(PortalMetadataContants.USER_MANAGEMENT_ATTRIBUTE)
					.get(PortalMetadataContants.PORTAL_BE_VIEW_NAME).asText();

			JsonNode beViewNode = externalConfigService.getBEViewMetaDataByTrustedApp(beViewName, orsId, portalCmxUrl,
					getObjectMetadataSecurityPayload, selectedLocale);

			ArrayNode rootfieldArray = (ArrayNode) beViewNode.get(PortalServiceConstants.OBJECT)
					.get(PortalServiceConstants.FIELD);
			for (JsonNode field : rootfieldArray) {
				if (field.get(PortalServiceConstants.NAME).asText().equalsIgnoreCase(statePath)) {
					dataType = field.get(PortalServiceConstants.DATATYPE).asText();
					if (dataType.equalsIgnoreCase(PortalServiceConstants.LOOKUP)) {
						key = field.get(PortalServiceConstants.LOOKUP).get(PortalServiceConstants.KEY).asText();
					}
				}

			}
			ResponseEntity<String> readBEResponse = null;
			if (interactionId != null) {

				String readEntitySecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
						PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, "previewPromoteUsingGET");
				readBEResponse = previewBE(portalCmxUrl, beViewName, orsId, readEntitySecurityPayload, rowidObject,
						selectedLocale, portalId, interactionId, DEPTH_ONE);
			} else {
				String readEntitySecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
						PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, "readEntityUsingGET");
				readBEResponse = readBE(portalCmxUrl, beViewName, orsId, readEntitySecurityPayload, rowidObject,
						selectedLocale, portalId, DEPTH_ONE);
			}

			String responsebody = readBEResponse.getBody();
			JsonNode payload = mapper.readTree(responsebody);
			JsonNode lookupObjectOriginal = mapper.createObjectNode();
			if (payload.has(statePath)) {

				if (payload.get(statePath).isObject()) {

					populateValueNode(lookupObjectOriginal, key, payload.get(statePath).get(key));
					populateValueNode(lookupObjectOriginal, statePath, lookupObjectOriginal);
					populateValueNode(payload, PortalServiceConstants.ORIGINAL_KEY, lookupObjectOriginal);

					((ObjectNode) payload).remove(statePath);
					JsonNode lookupObject = mapper.createObjectNode();
					populateValueNode(lookupObject, key, payloadNode.get(PortalServiceConstants.PORTAL_STATE));
					populateValueNode(payload, statePath, lookupObject);
				} else {
					populateValueNode(lookupObjectOriginal, statePath, payload.get(statePath));
					populateValueNode(payload, PortalServiceConstants.ORIGINAL_KEY, lookupObjectOriginal);
					((ObjectNode) payload).set(statePath, payloadNode.get(PortalServiceConstants.PORTAL_STATE));
				}

			} else {
				((ObjectNode) lookupObjectOriginal).set(statePath, null);
				populateValueNode(payload, PortalServiceConstants.ORIGINAL_KEY, lookupObjectOriginal);
				if (dataType.equalsIgnoreCase(PortalServiceConstants.LOOKUP)) {
					JsonNode lookupObject = mapper.createObjectNode();
					populateValueNode(lookupObject, key, payloadNode.get(PortalServiceConstants.PORTAL_STATE));
					populateValueNode(payload, statePath, lookupObject);
				} else {
					populateValueNode(payload, statePath, payloadNode.get(PortalServiceConstants.PORTAL_STATE));
				}

			}
			((ObjectNode) payload).remove(PortalServiceConstants.HUB_STATE);
			String updateEntitySecurityPayload = null;
			if (!StringUtil.isEmpty(authMDMPayload)) {
				updateEntitySecurityPayload = authMDMPayload;
			} else {
				updateEntitySecurityPayload = PortalConfigUtil.getSecurityPayloadForRest(
						PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, "updateEntityUsingPOST");
			}

			updateBE(portalCmxUrl, payload.toString(), beViewName, orsId, updateEntitySecurityPayload, rowidObject,
					selectedLocale, portalId, interactionId, systemName);

		} catch (RecordRegistrationException e) {
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG913,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG913), e.getMessage());
		} catch (PortalConfigException e) {
			log.error(e.getMessage());
			throw e;
		} catch (Exception e) {
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG913,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG913), e.getMessage());
		}

	}

	private ResponseEntity<String> readBE(String baseURL, String beName, String orsId, String securityPayload,
			String rowidObject, String selectedLocale, String portalId, String depth) throws PortalConfigException {

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get(PortalServiceConstants.DEFAULT_LOCALE)
					: null;
		}

		String url = String.format(PortalServiceConstants.READ_BE_URL, baseURL, orsId, beName, rowidObject, depth);

		log.info("BE Read for api url {}, beName {} ", baseURL, beName);
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<String> response;
		headers.clear();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		if (StringUtils.isNotEmpty(selectedLocale)) {
			headers.add(ExternalConfigConstants.AUTH_COOKIE,
					StringUtils.join(PortalServiceConstants.BES_LOCALE, selectedLocale));
		}
		try {
			response = PortalConfigUtil.executeRest(url, HttpMethod.GET, null, headers, restTemplate);

		} catch (Exception e) {
			log.error("Error on invoking Read BE api for beName {}", beName, e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.PORTAL633,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL633), e.getMessage());
		}

		if (response.getStatusCode() == HttpStatus.OK) {
			return response;
		} else {
			throw new PortalConfigException(ErrorCodeContants.PORTAL633,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL633), "");
		}

	}

	private ResponseEntity<String> previewBE(String baseURL, String beName, String orsId, String securityPayload,
			String rowidObject, String selectedLocale, String portalId, String interactionId, String depth)
			throws PortalConfigException {

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get(PortalServiceConstants.DEFAULT_LOCALE)
					: null;
		}

		String url = String.format(PortalServiceConstants.PREVIEW_BE_URL, baseURL, orsId, beName, rowidObject,
				interactionId, depth);

		log.info("BE preview for api url {}, beName {} ", baseURL, beName);
		HttpHeaders headers = new HttpHeaders();
		ResponseEntity<String> response;
		headers.clear();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		if (StringUtils.isNotEmpty(selectedLocale)) {
			headers.add(ExternalConfigConstants.AUTH_COOKIE,
					StringUtils.join(PortalServiceConstants.BES_LOCALE, selectedLocale));
		}
		try {
			response = PortalConfigUtil.executeRest(url, HttpMethod.GET, null, headers, restTemplate);

		} catch (Exception e) {
			log.error("Error on invoking Preview BE api for beName {}", beName, e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.PORTAL633,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL633), e.getMessage());
		}

		if (response.getStatusCode() == HttpStatus.OK) {
			return response;
		} else {
			throw new PortalConfigException(ErrorCodeContants.PORTAL633,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL633), "");
		}

	}

	@Override
	public ArrayNode getHubUser(String userName) throws PortalConfigException {
		ArrayNode users = portalPersistenceService.getHubUser(userName);
		return users;
	}

	@Override
	public JsonNode savePortalPreference(String appId, String userId,
										 String orsId, String id, JsonNode payloadNode) throws PortalConfigException {

		JsonNode responseNode;
		ObjectNode payload = mapper.createObjectNode();
		if(null != id) {
			payload.set(id, payloadNode);
		}
		else {
			log.info("generating payload with UniqueId");
			String randomId = UUID.randomUUID().toString().replace("-", "");
			payload.set(randomId, payloadNode);
		}
		responseNode = portalPersistenceService.savePreference(appId, userId, orsId, id, payload);

		return responseNode;
	}

	@Override
	public JsonNode getPortalPreference(String appId, String userId, String orsId, String id)
			throws PortalConfigException {

		JsonNode responseNode;
		responseNode = portalPersistenceService.getPreference(appId, userId, orsId, id);
		return responseNode;
	}

    @Override
    public void deletePortalPreference(String appId, String userId, String orsId, String id)
            throws PortalConfigException {

	    log.info("Deleting user preferences for user {}, orsId {}, portal Id {}, ", userId, orsId, appId);
        portalPersistenceService.deletePreference(appId, userId, orsId, id);
    }
}
