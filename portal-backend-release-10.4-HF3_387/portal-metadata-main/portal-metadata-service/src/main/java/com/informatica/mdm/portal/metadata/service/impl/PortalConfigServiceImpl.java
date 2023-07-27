package com.informatica.mdm.portal.metadata.service.impl;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.OptionalInt;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.delos.cmx.server.MDMSessionException;
import com.delos.util.StringUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.ecore.validator.EcoreValidator;
import com.informatica.mdm.portal.metadata.exception.PortalAlreadyExistException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.SAMLException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.model.IdPConfig;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.CacheService;
import com.informatica.mdm.portal.metadata.service.EcoreMapperService;
import com.informatica.mdm.portal.metadata.service.EcorePortalService;
import com.informatica.mdm.portal.metadata.service.ExternalConfigService;
import com.informatica.mdm.portal.metadata.service.PortalConfigService;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.service.SAMLService;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.JsonUtil;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.informatica.mdm.portal.metadata.util.SAMLInit;
import com.siperian.sif.client.SiperianClient;
import com.siperian.sif.message.Field;
import com.siperian.sif.message.Record;
import com.siperian.sif.message.RecordKey;
import com.siperian.sif.message.SiperianObjectType;
import com.siperian.sif.message.mrm.DeleteRequest;
import com.siperian.sif.message.mrm.PutRequest;
import com.siperian.sif.message.mrm.PutResponse;
import com.siperian.sif.message.mrm.SearchQueryRequest;
import com.siperian.sif.message.mrm.SearchQueryResponse;

@Service
public class PortalConfigServiceImpl implements PortalConfigService {

	private final static Logger log = LoggerFactory.getLogger(PortalConfigServiceImpl.class);

	private static final int BUFFER_SIZE = 8192;

	private static final String[] locales = { "", "de", "es", "fr", "ja", "ko", "pt_BR", "ru", "zh_CN" };

	@Autowired
	private EcorePortalService metaModelService;

	@Autowired
	private PortalPersistenceService portalService;
	
	@Autowired
	private SAMLService samlService;

	@Autowired
	private EcoreMapperService mapperService;

	@Autowired
	private EcoreValidator configValidator;

	@Autowired
	private ExternalConfigFactory externalConfigFactory;

	@Autowired
	ObjectMapper mapper;
	
	@Autowired
	private PortalPersistenceService portalPersistenceService;

	@Autowired
	RestTemplate restTemplate;

	@Autowired
	private PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver;

	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	@Autowired
	Map<CacheModel, JsonNode> externalConfigCache;

	@Autowired
	@Qualifier(value = "externalErrorProperties")
	private Map<String, Map<String, Properties>> externalErrorProperties;

	@Autowired
	@Qualifier(value = "externalBundleProperties")
	private Map<String, Map<String, Properties>> externalBundleProperties;

	@Autowired
	private CacheService cacheService;

	@Autowired
	private ExternalConfigService externalConfigService;

	@Autowired
	SiperianClient siperianClient;
	
	@Value("${generic.portal.metamodel.version}")
	private String metamodelVersion;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}

	@Override
	public JsonNode savePortalConfigInDraft(Credentials credentials, JsonNode portalNode) throws PortalConfigException {
		JsonNode versionNode = mapper.createObjectNode();
		try {

			String metaVersion = null != portalNode && null != portalNode.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION) ? portalNode.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION).asText() : "";
			if (null != portalNode && metaVersion.compareTo(metamodelVersion) > 0) {
				
				log.info("Import Portal Metamodel version {} can't be higher than application Metamodel version {} for portalId {}", metaVersion,
						metamodelVersion, portalNode.get(PortalMetadataContants.PORTAL_ID));
				throw new PortalConfigException(ErrorCodeContants.CONFIG914,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG914), "Import Portal Metamodel version {} can't be higher than application Metamodel version");
			}
			
			Boolean flag = portalService.isPortalNameExist(credentials,
					portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_NAME)
							.asText(),
					portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID)
							.asText());
			if (flag) {
				throw new PortalAlreadyExistException(ErrorCodeContants.CONFIG318,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG318),
						portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_NAME)
								.asText());
			}

			JsonNode eObjectNode = metaModelService.mapToEcoreJson(portalNode, PortalMetadataContants.PORTAL_ECLASS);
			portalNode = portalService.savePortalConfigInDraft(credentials, eObjectNode);
		} catch (PortalAlreadyExistException e) {
			log.error("Portal with name already exists");
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on create Portal Config ");
			throw e;
		} catch (Exception e) {
			log.error("Error on save Draft Portal Config");
			throw new PortalConfigException(e);
		}
		((ObjectNode) versionNode).putPOJO(PortalMetadataContants.PORTAL_VERSION,
				portalNode.get(PortalMetadataContants.PORTAL_VERSION));
		((ObjectNode) versionNode).putPOJO(PortalMetadataContants.PORTAL_ID,
				portalNode.get(PortalMetadataContants.PORTAL_ID));
		savePortalToResource(portalNode, credentials);
		return versionNode;
	}

	@Override
	public String savePortalToResource(JsonNode portalNode, Credentials credentials) throws PortalConfigException {
		String portalID = null;
		try {
			if (null != portalNode) {
				portalID = metaModelService.savePortalToResource(portalNode, credentials.getUsername());
			}
		} catch (PortalConfigException e) {
			log.error("Error on save Portal Config to Emf Resource ");
			throw e;
		} catch (Exception e) {
			log.error("Error on save Model to Emf Resource");
			throw new PortalConfigException(e);
		}
		return portalID;
	}

	@Override
	public JsonNode getPortalConfig(Credentials credentials, String portalId, String orsID, Integer version)
			throws PortalConfigException {
		JsonNode portalConfigData = null;
		try {
			portalConfigData = metaModelService.getPortalFromResource(portalId, credentials.getUsername(), version,
					orsID);
			if (null == portalConfigData) {
				portalConfigData = portalService.getPortalConfigDraftByVersion(credentials, portalId, orsID, version);
				if (null == portalConfigData) {
					portalConfigData = portalService.getPublishedPortalConfigByVersion(credentials, portalId, orsID,
							version);
				}

				savePortalToResource(portalConfigData, credentials);
				portalConfigData = metaModelService.getPortalFromResource(portalId, credentials.getUsername(), version,
						orsID);
			}

			if (null != portalConfigData) {
				String publishedState = portalService.getPublishedPortalStatus(credentials, portalId, orsID);
				String portalStatus = PortalConfigUtil.stateEvaluation(publishedState, portalConfigData.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText());
				((ObjectNode) portalConfigData).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE,
						null == portalStatus ? PortalMetadataContants.PORTAL_STATUS_STOP : portalStatus);
			}

		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on retrieving config for portal Id {} and orsId {} ", portalId, orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on retrieving portal Config for Portal id: {} ", portalId);
			throw new PortalConfigException(e);
		}
		return portalConfigData;
	}

	@Override
	public JsonNode publishPortalConfig(Credentials credentials, String portalId, String orsId,
			PortalRestConfig restConfig,HttpServletRequest request) throws PortalConfigException {
		JsonNode versionNode = mapper.createObjectNode();
		JsonNode portalNode = null;
		try {

			boolean isNotPublished = isNotPublishedAlready(credentials, portalId, orsId);

			JsonNode portalObject = portalService.getPortalConfigDraft(credentials, portalId, orsId);

			Boolean flag = portalService.isPublishedPortalNameExistById(credentials, portalId, portalObject
					.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_NAME).asText(),
					orsId);
			if (flag) {
				throw new PortalAlreadyExistException(ErrorCodeContants.CONFIG318,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG318),
						portalObject.get(PortalMetadataContants.GENERAL_SETTINGS)
								.get(PortalMetadataContants.PORTAL_NAME).asText());
			}
			//Portal Association
			boolean buyerSideAssc = portalService.isPortalAssociatedWithBuyerSide(credentials, portalId, orsId);

			if (buyerSideAssc) {
				JsonNode responseNode = null;
				JsonNode portalAssociationNode = portalObject.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.LOGIN_ATTRIBUTE).get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE).get(PortalMetadataContants.PORTAL_ASSC_FIELD);
				if(portalAssociationNode!=null && !portalAssociationNode.isEmpty(null)) {
					String portalAssociation= portalAssociationNode.get(PortalMetadataContants.CODE_ATTRIBUTE).asText();
					log.info("Searching records associated with the portal   {} ",portalId);
					ResponseEntity<String> searchResponse = externalConfigService.searchBERecord(
							PortalServiceConstants.BE_NAME_BUYER_SIDE_ASDC, restConfig.getOrs(),
							restConfig.getInitialApiUrl(), restConfig.getMdmSessionId(), restConfig.getLocale(), "portalId",
							portalId,request);
					responseNode = mapper.readTree(searchResponse.getBody());
				}
				if (null == responseNode || responseNode.isEmpty(null)
						|| responseNode.get(PortalServiceConstants.BE_RECORD_COUNT_ATTRIBUTE).asInt() == 0) {

					String sourceSystem = portalObject.get(PortalMetadataContants.GENERAL_SETTINGS)
							.get(PortalMetadataContants.PORTAL_SOURCE_SYSTEM_NAME).asText();

					insertPortalIdBuyerSideLookUptable(portalId,
							portalObject.get(PortalMetadataContants.GENERAL_SETTINGS)
									.get(PortalMetadataContants.PORTAL_NAME).asText(),
							portalObject.get(PortalMetadataContants.GENERAL_SETTINGS)
									.get(PortalMetadataContants.BE_NAME).asText(),
							orsId, credentials, sourceSystem);
				}
			}
			
			//SSO 
			boolean isSSOEnabled = false ;
			JsonNode genaralSettings = portalObject.get(PortalMetadataContants.GENERAL_SETTINGS);			
			if (genaralSettings.has(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED)) {
				isSSOEnabled = genaralSettings.get(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED).asBoolean() ;
			}
			
			((ObjectNode) portalObject).put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, metamodelVersion);
			portalNode = portalService.publishPortalConfig(credentials, portalObject);					
			savePortalToResource(portalNode, credentials);

			//save Runtime and SSO
			if (isNotPublished) {
				persistIntialRuntimeConfig(credentials, portalId, orsId);
				if(isSSOEnabled) {
					updateAndPersistSSOConfig(credentials, portalId, orsId);
				}
			}
				
			//Update Bundle
			persistInitialBundles(credentials, portalId, orsId, portalObject);

		} catch (PortalAlreadyExistException e) {
			log.error("Portal with name already exists");
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on publish Portal Config for portal id {} ", portalId);
			throw e;
		} catch (Exception e) {
			log.error("Error on publish portal model to database for Portal id: " + portalId);
			throw new PortalConfigException(e);
		}
		((ObjectNode) versionNode).putPOJO(PortalMetadataContants.PORTAL_VERSION,
				portalNode.get(PortalMetadataContants.PORTAL_VERSION));
		((ObjectNode) versionNode).putPOJO(PortalMetadataContants.PORTAL_ID,
				portalNode.get(PortalMetadataContants.PORTAL_ID));
		return versionNode;
	}

	@Override
	public JsonNode getDatabases(Credentials credentials) throws PortalConfigException {
		return portalService.getDatabases(credentials);
	}

	@Override
	public ArrayNode getPortals(Credentials credentials) throws PortalConfigException {
		return portalService.getPortals(credentials, false);
	}

	@Override
	public ArrayNode getPortalsWithBlob(Credentials credentials) throws PortalConfigException {
		return portalService.getPortals(credentials, true);
	}

	@Override
	public JsonNode deletePortalConfig(Credentials credentials, String portalId, String type,PortalRestConfig restConfig,HttpServletRequest request)
			throws PortalConfigException {

		JsonNode versionNode = null;

		try {
			String orsId = restConfig.getOrs();
			if (StringUtils.isNotEmpty(type) && type.equalsIgnoreCase(PortalMetadataContants.PORTAL_DISCARD_ACTION)) {
				log.info("Discard Delete Portal Config for portalId {} with orsId {}, with action {} ", portalId, orsId,
						type);
				versionNode = portalService.deleteDraftPortalConfig(credentials, portalId, orsId);
			} else if (StringUtils.isNotEmpty(type)
					&& type.equalsIgnoreCase(PortalMetadataContants.PORTAL_FORCE_DELETE_ACTION)) {
				
				log.info("Deleting portal from association lookup with portal id   {} ",portalId);
				deletePortalFromAssociationLookup(portalId, restConfig, credentials,request);
				
				log.info("Force Delete Portal Config for portalId {} with orsId {}, with action {} ", portalId, orsId,
						type);
				portalService.deletePublishedPortalConfig(credentials, portalId, orsId);
			} else {

				boolean isDraft = isPortalExistById(credentials, portalId, orsId,
						PortalMetadataContants.PORTAL_STATE_DRAFT);
				log.info("Delete Portal Config for portalId {} with orsId {}, with action {}, with isDraft {} ",
						portalId, orsId, type, isDraft);
				if (isDraft) {
					log.warn("Error on Delete Portal Config for portalId {} with orsId {}, with action {} ", portalId,
							orsId, type);
					throw new PortalConfigException(ErrorCodeContants.PORTAL626,
							errorCodeProperties.getProperty(ErrorCodeContants.PORTAL626),
							errorCodeProperties.getProperty(ErrorCodeContants.PORTAL626));
				} else {
					log.info("Deleting portal from association lookup with portal id   {} ",portalId);
					deletePortalFromAssociationLookup(portalId, restConfig, credentials,request);
					portalService.deletePublishedPortalConfig(credentials, portalId, orsId);
				}
			}
			metaModelService.deletePortalFromResourceSet(portalId, credentials.getUsername(), orsId);

		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on delete portal model for Portal id: "+ portalId);
			throw e;
		} catch (Exception e) {
			log.error("Error on delete portal model for Portal id: " + portalId);
			throw new PortalConfigException(e);
		}
		return versionNode;
	}

	@Override
	public JsonNode getReferenceDataByUri(String name) throws PortalConfigException {

		JsonNode referenceData = null;
		try {
			referenceData = metaModelService.getReferenceDataByUri(name);
		} catch (PortalConfigException e) {
			log.error("Error on get Reference data for {} ", name);
			throw e;
		} catch (Exception e) {
			log.error("Error on retrieving static data for {}", name);
			throw new PortalConfigException(e);
		}
		return referenceData;
	}

	/*
	 * Retrieve portal configuration Supports List<Object> types, Object types and
	 * plain attribute types Perform a order by for List Objects
	 */
	@Override
	public JsonNode getPortalConfigModel(Credentials credentials, PortalRestConfig restConfig,String ict)
			throws PortalConfigException {

		log.info("Portal Config action GET invoked");
		List<String> pathNodes = restConfig.getPortalNodes();
		JsonNode portalConfigNode = null;

		configValidator.validateConfigPath(pathNodes);

		if (1 == pathNodes.size()) {
			if (restConfig.getDepth() == 1) {
				log.info("Portal Config Get all Portals Without Config Blob ");
				portalConfigNode = getPortals(credentials);
			} else {
				log.info("Portal Config Get all Portals With Config Blob ");
				portalConfigNode = getPortalsWithBlob(credentials);
			}

			if (null != restConfig.getFilter()) {
				log.info("Portal Config Get all Portals apply filter {} ", restConfig.getFilter());
				portalConfigNode = JsonUtil.applyFilter(portalConfigNode, restConfig.getFilter());
			}

			if (!portalConfigNode.isMissingNode() && portalConfigNode.isArray()) {
				log.info("Portal Config Get all Portals apply sort {}, with sortOrder {}", restConfig.getSort(),
						restConfig.getSortOrder());
				portalConfigNode = JsonUtil.applySort(portalConfigNode, restConfig.getSort(),
						restConfig.getSortOrder());
			}

			if (!portalConfigNode.isMissingNode() && null != restConfig.getProjections()
					&& !restConfig.getProjections().isEmpty()) {
				log.info("Portal Config Get all Portals apply projections {}", restConfig.getProjections());
				portalConfigNode = JsonUtil.applyProjections(portalConfigNode, restConfig.getProjections());
			}

			if (!portalConfigNode.isMissingNode() && 0 != restConfig.getPageSize()
					&& 0 != restConfig.getCurrentPage()) {
				log.info("Portal Config Get all Portals apply pagination with currentPage {}, pagesSize {}",
						restConfig.getCurrentPage(), restConfig.getPageSize());
				portalConfigNode = JsonUtil.applyPagination(portalConfigNode, restConfig.getPageSize(),
						restConfig.getCurrentPage());
			}

		} else {

			String portalId = pathNodes.get(1);
			log.info("Portal Config Get Portal for portal Id {} ", portalId);
			portalConfigNode = getPortalConfig(credentials, portalId, restConfig.getOrs(), restConfig.getVersion());

			List<String> traversePath = pathNodes.stream().skip(2).collect(Collectors.toList());

			log.info("Portal Config Get Portal for portal Id {}, with path {} ", portalId, traversePath);

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
				log.info("Portal Config Get Portal for portal Id {}, apply filter {} ", portalId,
						restConfig.getFilter());
				portalConfigNode = JsonUtil.applyFilter(portalConfigNode, restConfig.getFilter());
			}

			if (!portalConfigNode.isMissingNode() && restConfig.getDepth() != 0) {
				log.info("Portal Config Get Portal for portal Id {}, apply depth {} ", portalId, restConfig.getDepth());
				portalConfigNode = JsonUtil.applyDepth(portalConfigNode,
						!traversePath.isEmpty() ? traversePath.get(traversePath.size() - 1) : "",
						restConfig.getDepth());
			}

			if (!portalConfigNode.isMissingNode() && portalConfigNode.isArray()) {
				log.info("Portal Config Get Portal for portal Id {}, apply sort {}, with sortOrder {}", portalId,
						restConfig.getSort(), restConfig.getSortOrder());
				portalConfigNode = JsonUtil.applySort(portalConfigNode, restConfig.getSort(),
						restConfig.getSortOrder());
			}

			if (!portalConfigNode.isMissingNode() && null != restConfig.getProjections()
					&& !restConfig.getProjections().isEmpty()) {
				log.info("Portal Config Get Portal for portal Id {}, apply projections {}", portalId,
						restConfig.getProjections());
				portalConfigNode = JsonUtil.applyProjections(portalConfigNode, restConfig.getProjections());
			}

			if (restConfig.getResolveExtConfig()) {
				externalConfigFactory.invokeExternalConfigService(portalConfigNode, credentials, restConfig.getOrs(),
						restConfig.getMdmSessionId(), false, restConfig.getInitialApiUrl(), restConfig.getLocale(),ict);
			}

		}

		return portalConfigNode;
	}

	/*
	 * Append portal configuration with new configuration Supports List<Object>
	 * types, Object types and uni-object of List Retrieve and populate unique id
	 * for List if its required prior creation Populate default value prior creation
	 */
	@Override
	public JsonNode createPortalConfigModel(Credentials credentials, PortalRestConfig restConfig, JsonNode payloadNode,
			String action,HttpServletRequest request) throws PortalConfigException {

		log.info("Portal Config action POST invoked");
		if (payloadNode.isEmpty(null)
				&& !PortalMetadataContants.PORTAL_CONFIG_URI_PUBLISH_ACTION.equalsIgnoreCase(action)) {
			log.error("Payload Data can't be empty for create api's for path {} ", restConfig.getPortalNodes());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG802,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG802),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG802));
		}

		JsonNode responseNode = mapper.createObjectNode();
		List<String> path = restConfig.getPortalNodes();
		try {
			configValidator.validateConfigPath(path);
			log.info("Create action with valid path {} ", path);

			if (1 == path.size() && StringUtils.isEmpty(action)) {
				log.info("Create action for new Portal Config");
				responseNode = savePortalConfigInDraft(credentials, payloadNode);

			} else if (path.size() > 1) {

				String portalId = path.get(1);
				if (PortalMetadataContants.PORTAL_CONFIG_URI_PUBLISH_ACTION.equalsIgnoreCase(action)) {
					log.info("Publish action for portal Id {} ", portalId);
					return publishPortalConfig(credentials, portalId, restConfig.getOrs(), restConfig,request);
				}

				log.info("Portal Config Create Child Config Portal for portal Id {} ", portalId);
				JsonNode portalConfigNode = getPortalConfig(credentials, portalId, restConfig.getOrs(),
						restConfig.getVersion());

				List<String> traversePath = path.stream().skip(2).collect(Collectors.toList());
				log.info("Create action for portal Id {}, on child config {} ", portalId, traversePath);

				populateSequence(traversePath, payloadNode, credentials, restConfig.getOrs());

				populateOrderValue(traversePath, portalConfigNode, payloadNode,
						PortalMetadataContants.DEFAULT_VALUE_ORDER);

				JsonNode mergedPortalNode = metaModelService.appendPortalConfigModel(traversePath, portalConfigNode,
						payloadNode, false, null);

				log.info("Create action for portal Id {}, on child config {} appended Ecore ", portalId, traversePath);
				mergedPortalNode = portalService.savePortalConfigInDraft(credentials, mergedPortalNode);

				((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_VERSION,
						mergedPortalNode.get(PortalMetadataContants.PORTAL_VERSION));
				((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_ID,
						mergedPortalNode.get(PortalMetadataContants.PORTAL_ID));
				savePortalToResource(mergedPortalNode, credentials);
			} else {
				log.error("Invalid MetaModel path {} ", path);
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
			}

		} catch (PortalConfigException e) {
			throw e;
		} catch (Exception e) {
			log.error("Create Config Error for path {} ", restConfig.getPortalNodes());
			throw new PortalConfigException(ErrorCodeContants.CONFIG715,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG715), e.getMessage());
		}
		return responseNode;
	}

	/*
	 * Retrieve and populate unique id for List if its required prior creation
	 */
	private void populateSequence(List<String> path, JsonNode payloadNode, Credentials credentials, String orsId)
			throws PortalConfigException {

		log.info("Create action - populate sequence ");
		if (mapperService.isEStructuralFeatureList(path)) {
			if (payloadNode.isArray()) {
				log.info("Create action - populate sequence for ArrayNode ");
				for (JsonNode node : payloadNode) {
					Long childId = portalService.getSequence(credentials, orsId);
					((ObjectNode) node).put(PortalMetadataContants.ID_ATTRIBUTE, childId);
				}
			} else {
				log.info("Create action - populate sequence for Object Node ");
				Long childId = portalService.getSequence(credentials, orsId);
				((ObjectNode) payloadNode).put(PortalMetadataContants.ID_ATTRIBUTE, childId);
			}
		}
	}

	/*
	 * Populate default value prior creation
	 */
	private void populateOrderValue(List<String> path, JsonNode portalNode, JsonNode payloadNode,
			String defaultAttribute) throws PortalConfigException {

		log.info("Create action - populate default order value ");
		if (!StringUtils.isEmpty(defaultAttribute)) {
			AtomicInteger maxOrderBy = new AtomicInteger(0);
			JsonNode pathNode = JsonUtil.getPortalConfigModelByPath(portalNode, path);
			if (mapperService.isEStructuralFeatureList(path)) {
				OptionalInt max = StreamSupport.stream(pathNode.spliterator(), false)
						.mapToInt(node -> node.get(defaultAttribute).asInt()).max();
				if (max.isPresent()) {
					maxOrderBy.set(max.getAsInt());
				}
				log.info("Create action - populate sequence with max value {} ", maxOrderBy.get());
				if (payloadNode.isArray()) {
					log.info("Create action - populate Default Order value for ArrayNode ");
					payloadNode.forEach(pNode -> {
						((ObjectNode) pNode).put(defaultAttribute, maxOrderBy.incrementAndGet());
					});
				} else {
					log.info("Create action - populate sequence for Object Node ");
					((ObjectNode) payloadNode).put(defaultAttribute, maxOrderBy.incrementAndGet());
				}
			}
		}
	}

	/*
	 * Bulk Upsert Update portal configuration with updated configuration Supports
	 * List<Object> types, Object types and uni-object of List
	 */
	@Override
	public JsonNode updatePortalConfigModel(Credentials credentials, PortalRestConfig restConfig, JsonNode payloadNode)
			throws PortalConfigException {

		log.info("Portal Config action PUT invoked");
		JsonNode responseNode = mapper.createObjectNode();
		String portalId = null;
		List<String> path = restConfig.getPortalNodes();
		if (payloadNode.isEmpty(null)) {
			log.error("Payload Data can't be empty for create, update or patch update api's with path {} ",
					restConfig.getPortalNodes());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG802,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG802),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG802));
		}

		try {

			configValidator.validateConfigPath(path);

			if (path.size() > 1) {
				log.info("Update action with valid path ");
				portalId = path.get(1);
				JsonNode portalConfigNode = getPortalConfig(credentials, portalId, restConfig.getOrs(),
						restConfig.getVersion());
				List<String> traversePath = path.stream().skip(2).collect(Collectors.toList());
				log.info("Create action for portal Id {}, on child config {} ", portalId, traversePath);

				log.info("Update action for portal Id {}, on child config {} ", portalId, traversePath);

				JsonNode mergedPortalNode = metaModelService.appendPortalConfigModel(traversePath, portalConfigNode,
						payloadNode, true, PortalMetadataContants.ID_ATTRIBUTE);
				mergedPortalNode = portalService.savePortalConfigInDraft(credentials, mergedPortalNode);

				((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_VERSION,
						mergedPortalNode.get(PortalMetadataContants.PORTAL_VERSION));
				((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_ID,
						mergedPortalNode.get(PortalMetadataContants.PORTAL_ID));
				savePortalToResource(mergedPortalNode, credentials);

			} else {
				log.error("Invalid path {} ", path);
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
			}

		} catch (PortalConfigException e) {
			throw e;
		} catch (Exception e) {
			log.error("Create Child config Error for portalId {} with path {} ", portalId, restConfig.getPortalNodes());
			throw new PortalConfigException(ErrorCodeContants.CONFIG715,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG715), e.getMessage());
		}
		return responseNode;
	}

	/*
	 * Patch Updates/Delta Update Update portal configuration with patch update on
	 * existing configuration Supports List<Object> types, Object types and
	 * uni-object of List
	 */
	@Override
	public JsonNode patchUpdatePortalConfigModel(Credentials credentials, PortalRestConfig restConfig,
			JsonNode payloadNode) throws PortalConfigException {

		log.info("Portal Config action PATCH invoked");
		JsonNode responseNode = mapper.createObjectNode();
		String portalId = null;
		List<String> path = restConfig.getPortalNodes();
		if (payloadNode.isEmpty(null)) {
			log.error("Payload Data can't be empty for create, update or patch update api's with path {} ",
					restConfig.getPortalNodes());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG802,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG802),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG802));
		}
		try {

			configValidator.validateConfigPath(path);
			if (path.size() > 1) {

				log.info("Update action with valid path ");
				portalId = path.get(1);
				JsonNode portalConfigNode = getPortalConfig(credentials, portalId, restConfig.getOrs(),
						restConfig.getVersion());
				List<String> traversePath = path.stream().skip(2).collect(Collectors.toList());

				log.info("Patch Update action for portal Id {}, on child config {} ", portalId, traversePath);

				JsonNode mergedPortalNode = metaModelService.patchUpdatePortalConfigModel(traversePath,
						portalConfigNode, payloadNode, PortalMetadataContants.ID_ATTRIBUTE);
				mergedPortalNode = portalService.savePortalConfigInDraft(credentials, mergedPortalNode);

				((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_VERSION,
						mergedPortalNode.get(PortalMetadataContants.PORTAL_VERSION));
				((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_ID,
						mergedPortalNode.get(PortalMetadataContants.PORTAL_ID));
				savePortalToResource(mergedPortalNode, credentials);

			} else {
				log.error("Invalid path {} ", path);
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
			}

		} catch (PortalConfigException e) {
			throw e;
		} catch (Exception e) {
			log.error("Create Child config Error for portalId {} with path {} ", portalId, restConfig.getPortalNodes());
			throw new PortalConfigException(ErrorCodeContants.CONFIG715,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG715), e.getMessage());
		}
		return responseNode;
	}

	/*
	 * Delete Portal Configuration Delete entire config or part of the config
	 * Supports List<Object> types, Object types and uni-object of List
	 */
	@Override
	public JsonNode deletePortalConfigModel(Credentials credentials, PortalRestConfig restConfig, String deleteAction,HttpServletRequest request)
			throws PortalConfigException {

		log.info("Portal Config action DELETE invoked");
		String portalId = null;
		try {

			JsonNode responseNode = mapper.createObjectNode();
			List<String> path = restConfig.getPortalNodes();
			configValidator.validateConfigPath(path);
			if (path.size() > 1) {
				log.info("Delete action with valid path {}", path);
				portalId = path.get(1);

				if (path.size() == 2) {
					log.info("Delete action for portal Id {} ", portalId);
					responseNode = deletePortalConfig(credentials, portalId, deleteAction,restConfig,request);
				} else {

					JsonNode portalConfigNode = getPortalConfig(credentials, portalId, restConfig.getOrs(),
							restConfig.getVersion());

					List<String> traversePath = path.stream().skip(2).collect(Collectors.toList());

					log.info("Delete action for portal Id {}, on child config {} ", portalId, traversePath);

					JsonNode mergedPortalNode = metaModelService.deleteFromPortalConfigModel(traversePath,
							portalConfigNode);
					mergedPortalNode = portalService.savePortalConfigInDraft(credentials, mergedPortalNode);

					((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_VERSION,
							mergedPortalNode.get(PortalMetadataContants.PORTAL_VERSION));
					((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_ID,
							mergedPortalNode.get(PortalMetadataContants.PORTAL_ID));
					savePortalToResource(mergedPortalNode, credentials);
				}

			} else {
				log.error("Invalid path for delete config {} ", path);
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
			}
			return responseNode;

		} catch (PortalConfigException e) {
			throw e;
		} catch (Exception e) {
			log.error("Delete Portal config Error for portalId {} with path {} ", portalId,
					restConfig.getPortalNodes());
			throw new PortalConfigException(ErrorCodeContants.CONFIG715,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG715), e.getMessage());
		}
	}

	@Override
	public JsonNode getBEViewByName(String beName, String mdmSessionId, String orsId, String initialUrl,HttpServletRequest httpRequest)
			throws PortalConfigException {

		log.info("Portal Configuration Get BE View Data for beViewName {}, for databaseId {}", beName, orsId);
		String apiUrl = StringUtils.join(initialUrl, "/cmx/cs/", orsId, "/meta/", "view.json?recordsToReturn=100");
		String ict = PortalConfigUtil.getCookieValue(httpRequest, PortalServiceConstants.MDM_CSRF_TOKEN_CONFIG);
		String authCookie = ExternalConfigConstants.AUTH_MDM_ATTRIBUTE + "=" + mdmSessionId;
		HttpHeaders headers = new HttpHeaders();
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER,ict);
		headers.add(ExternalConfigConstants.AUTH_COOKIE, authCookie);
		HttpEntity<?> request = new HttpEntity<String>(headers);
		ResponseEntity<JsonNode> beViewData = restTemplate.exchange(apiUrl, HttpMethod.GET, request, JsonNode.class);
		JsonNode beViewNode = beViewData.getBody();
		ArrayNode beViewArray = StreamSupport
				.stream(beViewNode.get(ExternalConfigConstants.BE_ITEM).spliterator(), false)
				.filter(object -> object.get(ExternalConfigConstants.BE_VIEW_OF).asText("").equalsIgnoreCase(beName))
				.map(map -> map.get(ExternalConfigConstants.BE_OBJECT))
				.map(objectMap -> objectMap.get(ExternalConfigConstants.BE_NAME).asText()).sorted()
				.collect(mapper::createArrayNode, ArrayNode::add, ArrayNode::addAll);

		return beViewArray;
	}

	@Override
	public JsonNode saveRuntimeConfig(Credentials credentials, JsonNode runtimeConfig, String portalId, String orsId)
			throws PortalConfigException {

		log.info("Persist Runtime Configuration for portalId {}, with orsId {} ", portalId, orsId);
		JsonNode versionNode = portalService.savePortalRuntimeConfig(credentials, runtimeConfig, orsId, portalId);
		return versionNode;
	}
	@Override
	public String getSamlServiceProviderEntityId(String portalId, String orsId ) {
		
		String entityId = StringUtils.capitalize(PortalServiceConstants.SP_METADAT_PREFIX.concat(PortalServiceConstants.SP_METADAT_DELIM)
				.concat(orsId).concat(PortalServiceConstants.SP_METADAT_DELIM).concat(portalId));
		return entityId;
	}
	
    @Override
    public String generateSpMetadataXml(Credentials credentials, String portalId, String orsId)
            throws PortalConfigException {
    	
        log.info("Construct SP metadata for portalId {}, with orsId {} ", portalId, orsId);
        String spMetadataXmlString=null;
		try {
			spMetadataXmlString = samlService.getSpMetadataXml(portalId, orsId);
		} catch (SAMLException e) {
			log.error("SAML Exception unable to parse entityDescriptor, error messaage : {}", e.getLocalizedMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1001,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1001), e.getMessage());
		} catch (PortalConfigException e) {
			log.error("unable to construct spMetadataXml because it is empty");
			throw new PortalConfigException(ErrorCodeContants.CONFIG1013,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1013), "");
		} catch (IOException e) {
			log.error("SAML Exception unable to transform nodeToString error messaage : {}", e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1015,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1015), e.getMessage());
		}
        return spMetadataXmlString;
    }
    

	@Override
	public JsonNode saveIdpConfig(Credentials credentials, MultipartFile file, String portalId, String orsId) throws PortalConfigException {

		log.info("Persist IDP Configuration for portalId {}, with orsId {} ", portalId, orsId);
		JsonNode idpConfigNode = null;
		JsonNode ssoConfigNode = portalPersistenceService.getPortalSSOConfig(credentials, orsId, portalId);
		try {
			
			idpConfigNode = samlService.getIdpConfig(credentials, file, portalId, orsId, ssoConfigNode);
		} catch (SAMLException e) {
			log.error("SAML Exception unable to parse metadata xml with error messaage : {}", e.getErrorMessage());
			throw new PortalConfigException(e.getErrorCode(), errorCodeProperties.getProperty(e.getErrorCode()),
					errorCodeProperties.getProperty(e.getErrorMessage()));
		} catch (PortalConfigException e) {
			log.error("Save IDP Config : Error on saving Saml IDP config for portalID {} with error message : {}",
					portalId, e.getErrorMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1006,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1006),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1007));
		} catch (IOException e) {
			log.error("unable to write file {}", e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1009,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1009), e.getMessage());
		}
		return idpConfigNode;
	}

    @Override
    public JsonNode saveSSOConfig(Credentials credentials, JsonNode ssoConfig, String portalId, String orsId)
            throws PortalConfigException {

        log.info("Persist SSO Configuration for portalId {}, with orsId {} ", portalId, orsId);
        JsonNode versionNode = portalService.savePortalSSOConfig(credentials, ssoConfig, orsId, portalId);
        return versionNode;
    }

	@Override
	public JsonNode getRuntimeConfig(Credentials credentials, String portalId, PortalRestConfig restConfig)
			throws PortalConfigException {

		log.info("Portal Config - Retrieve Runtime Configuration for portalId {}, with orsId {} ", portalId,
				restConfig.getOrs());
		JsonNode runtimeConfigNode = portalService.getPortalRuntimeConfig(credentials, restConfig.getOrs(), portalId);

		log.info(
				"Portal Config - Apply Filter - Retrieved Runtime Configuration for portalId {}, with orsId {} and filter {}",
				portalId, restConfig.getOrs(), restConfig.getFilter());

		if (null != restConfig.getFilter()) {
			log.info("Portal Config - Runtime Configuration apply filter {} ", restConfig.getFilter());
			runtimeConfigNode = JsonUtil.applyFilter(runtimeConfigNode, restConfig.getFilter());
		}

		log.info(
				"Portal Config - Apply Projections on Retrieved Runtime Configuration for portalId {}, with orsId {} and filter {}",
				portalId, restConfig.getOrs(), restConfig.getProjections());

		if (!runtimeConfigNode.isMissingNode() && null != restConfig.getProjections()
				&& !restConfig.getProjections().isEmpty()) {
			log.info("Portal Config - Runtime Configuration apply projections {}", restConfig.getProjections());
			runtimeConfigNode = JsonUtil.applyProjections(runtimeConfigNode, restConfig.getProjections());
		}

		return runtimeConfigNode;
	}

    @Override
    public JsonNode getSSOConfig(Credentials credentials, String portalId, PortalRestConfig restConfig)
            throws PortalConfigException {

        log.info("Portal Config - Retrieve SSO Configuration for portalId {}, with orsId {} ", portalId,
                restConfig.getOrs());
        JsonNode ssoConfigNode = portalService.getPortalSSOConfig(credentials, restConfig.getOrs(), portalId);

        log.info(
                "Portal Config - Apply Filter - Retrieved SSO Configuration for portalId {}, with orsId {} and filter {}",
                portalId, restConfig.getOrs(), restConfig.getFilter());

        if (null != restConfig.getFilter()) {
            log.info("Portal Config - SSO Configuration apply filter {} ", restConfig.getFilter());
            ssoConfigNode = JsonUtil.applyFilter(ssoConfigNode, restConfig.getFilter());
        }

        log.info(
                "Portal Config - Apply Projections on Retrieved SSO Configuration for portalId {}, with orsId {} and filter {}",
                portalId, restConfig.getOrs(), restConfig.getProjections());

        if (!ssoConfigNode.isMissingNode() && null != restConfig.getProjections()
                && !restConfig.getProjections().isEmpty()) {
            log.info("Portal Config - SSO Configuration apply projections {}", restConfig.getProjections());
            ssoConfigNode = JsonUtil.applyProjections(ssoConfigNode, restConfig.getProjections());
        }

        return ssoConfigNode;
    }

	@Override
	public ByteArrayOutputStream exportPortal(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException {

		log.info("Export Portal Configuration for portalId {}, orsId {} ", portalId, orsId);
		JsonNode responseNode = mapper.createObjectNode();
		JsonNode portalConfig = portalService.getPublishedPortalConfig(credentials, portalId, orsId);
		log.info("Export Portal Configuration: Get Published Portal for portalId {}, orsId {} ", portalId, orsId);
		// ((ObjectNode) portalConfig).remove(PortalMetadataContants.PORTAL_ID);
		((ObjectNode) responseNode).putObject(PortalServiceConstants.PORTAL_CONFIG).setAll((ObjectNode) portalConfig);
		// JsonNode runtimeConfig = null;
		// runtimeConfig = portalService.getPortalRuntimeConfig(credentials, orsId,
		// portalId);
		// ((ObjectNode)
		// responseNode).putArray(PortalServiceConstants.RUNTIME_CONFIG).addAll((ArrayNode)
		// runtimeConfig);
		log.info("Export Portal Configuration: Get Bundles for portalId {}, orsId {} ", portalId, orsId);
		Object bundles = portalService.getBundles(credentials, orsId, portalId);
		log.info("Export Portal Configuration: Get Errors for portalId {}, orsId {} ", portalId, orsId);
		Object errors = portalService.getErrors(credentials, orsId, portalId);
		ByteArrayOutputStream bos = null;
		ZipOutputStream zos = null;
		try {
			bos = new ByteArrayOutputStream();
			zos = new ZipOutputStream(bos);
			log.info("Export Portal Configuration: Stream Portal Configuration for portalId {}, orsId {} ", portalId,
					orsId);
			String jsonFileName = String.format(PortalServiceConstants.FILE_NAME, portalId,
					responseNode.get(PortalServiceConstants.PORTAL_CONFIG).get(PortalMetadataContants.GENERAL_SETTINGS)
							.get(PortalMetadataContants.DATABASE_ID).asText(),
					PortalServiceConstants.JSON_EXT);
			ZipEntry firstEntry = new ZipEntry(jsonFileName);
			zos.putNextEntry(firstEntry);
			InputStream josnInputStream = new ByteArrayInputStream(responseNode.toString().getBytes());
			IOUtils.copy(josnInputStream, zos);
			zos.flush();
			zos.closeEntry();
			bos.flush();
			log.info("Export Portal Configuration: Write Portal Configuration Byte Array for portalId {}, orsId {} ",
					portalId, orsId);
			log.info("Export Portal Configuration: Write Bundles Configuration Byte Array for portalId {}, orsId {} ",
					portalId, orsId);
			readZipFile(bundles, zos, bos, "bundles");
			log.info("Export Portal Configuration: Write Errors Configuration Byte Array for portalId {}, orsId {} ",
					portalId, orsId);
			readZipFile(errors, zos, bos, "errors");

		} catch (Exception e) {
			log.error("Error on Export Portal Configuration for portalId {}, orsId {} ", portalId, orsId);
			throw new PortalConfigException(ErrorCodeContants.CONFIG610,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG610), e.getMessage());
		} finally {
			try {
				bos.close();
				zos.close();
			} catch (Exception e) {
				log.error("Error on closing stream Export Portal Configuration for portalId {}, orsId {} ", portalId,
						orsId);
				throw new PortalConfigException(ErrorCodeContants.CONFIG610,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG610), e.getMessage());
			}
		}

		return bos;
	}

	private void readZipFile(Object bundles, ZipOutputStream zos, ByteArrayOutputStream bos, String dirName)
			throws Exception {

		log.info("Write Configuration Byte Array for directory Name {} ", dirName);

		ZipEntry entry = null;
		ZipEntry dirEntry = new ZipEntry(dirName + "/");
		zos.putNextEntry(dirEntry);
		zos.flush();
		bos.flush();
		zos.closeEntry();

		if (bundles != null) {
			ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream((byte[]) bundles));
			while ((entry = zis.getNextEntry()) != null) {
				String fileName = entry.getName();
				log.info("Write Configuration Byte Array for directory Name {}, with fileName {} ", dirName, fileName);
				ZipEntry secondEntry = new ZipEntry(dirName + "/" + fileName);
				zos.putNextEntry(secondEntry);
				final byte[] buf = new byte[BUFFER_SIZE];
				int length;
				while ((length = zis.read(buf, 0, buf.length)) >= 0) {
					zos.write(buf, 0, length);
				}
				zos.flush();
				bos.flush();
				zos.closeEntry();
			}
		}

	}

	@Override
	public JsonNode importPortal(Credentials credentials, MultipartFile file, String orsId, HttpServletRequest request,
			String portalName, boolean isExistingPortal, boolean isExternalUserManagementEnabled, String systemName, String exitingPortalId,String ict) throws PortalConfigException {

		log.info("Import Portal for orsId {} and portalName {} ", orsId, portalName);
		JsonNode responseNode = mapper.createObjectNode();
		try {

			ZipInputStream zis = new ZipInputStream(file.getInputStream());
			ZipEntry entry = null;
			byte[] jsonByteArray = null;
			byte[] bundlesByteArray = null, errorsByteArray = null;
			ByteArrayOutputStream bundleBos = null, errorBos = null;
			ZipOutputStream bundleZos = null, errorZos = null;
			while ((entry = zis.getNextEntry()) != null) {

				if (entry.isDirectory()) {
					if ("bundles/".equalsIgnoreCase(entry.getName())) {
						log.info("Import Portal for orsId {} and portalName {}, with directory name {} ", orsId,
								portalName, entry.getName());
						bundleBos = new ByteArrayOutputStream();
						bundleZos = new ZipOutputStream(bundleBos);
						continue;
					} else if ("errors/".equalsIgnoreCase(entry.getName())) {
						log.info("Import Portal for orsId {} and portalName {}, with directory name {} ", orsId,
								portalName, entry.getName());
						errorBos = new ByteArrayOutputStream();
						errorZos = new ZipOutputStream(errorBos);
						continue;
					}
				}

				String fileName = entry.getName();
				ByteArrayOutputStream fos = new ByteArrayOutputStream();
				final byte[] buf = new byte[BUFFER_SIZE];
				int length;

				while ((length = zis.read(buf, 0, buf.length)) >= 0) {
					fos.write(buf, 0, length);
				}
				if (fileName.contains(PortalServiceConstants.JSON_EXT)) {
					jsonByteArray = fos.toByteArray();
				} else if (fileName.contains("bundles/")) {

					String fName = fileName.split("/")[1];
					log.info("Import Portal for orsId {} and portalName {}, with directory filename {} ", orsId,
							portalName, entry.getName());
					ZipEntry firstEntry = new ZipEntry(fName);
					bundleZos.putNextEntry(firstEntry);
					InputStream bundlesInputStream = new ByteArrayInputStream(fos.toByteArray());
					IOUtils.copy(bundlesInputStream, bundleZos);
					bundleZos.flush();
					bundleZos.closeEntry();
					bundleBos.flush();
					bundlesByteArray = bundleBos.toByteArray();

				} else if (fileName.contains("errors/")) {

					String fName = fileName.split("/")[1];
					log.info("Import Portal for orsId {} and portalName {}, with directory filename {} ", orsId,
							portalName, entry.getName());
					ZipEntry firstEntry = new ZipEntry(fName);
					errorZos.putNextEntry(firstEntry);
					InputStream bundlesInputStream = new ByteArrayInputStream(fos.toByteArray());
					IOUtils.copy(bundlesInputStream, errorZos);
					errorZos.flush();
					errorZos.closeEntry();
					errorBos.flush();
					errorsByteArray = errorBos.toByteArray();

				}
			}
			if (jsonByteArray != null) {

				log.info("Import Portal : save portal config for orsId {}, portalName {}, systemName {} ", orsId,
						portalName, systemName);
				JsonNode jsonObject = mapper.readTree(jsonByteArray);
				
				responseNode = savePortalConfig(jsonObject, credentials, orsId, request, portalName, isExistingPortal, isExternalUserManagementEnabled,
						systemName, exitingPortalId,ict);
				String portalId = responseNode.get(PortalMetadataContants.PORTAL_ID).asText();
				if (bundlesByteArray != null) {
					log.info("Import Portal : save portal bundles for orsId {}, portalName {} ", orsId, portalName);
					portalService.saveDraftBundles(credentials, bundlesByteArray, orsId, portalId);
				}
				if (errorsByteArray != null) {
					log.info("Import Portal : save portal errors for orsId {}, portalName {} ", orsId, portalName);
					portalService.saveDraftErrors(credentials, errorsByteArray, orsId, portalId);
				}

			} else {
				log.info("Import Portal : Error on import for orsId {}, portalName {} ", orsId, portalName);
				throw new PortalConfigException(ErrorCodeContants.CONFIG608,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG608), "");
			}

		}catch (PortalAlreadyExistException e) {
			log.error("Portal with name already exists");
			throw e;
		}  
		catch (PortalConfigException e) {
			log.error("Import Portal : Error on import for orsId {}, portalName {}, with error message {}", orsId,
					portalName, e.getMessage());
				throw e;
		} catch (Exception e) {
			log.error("Import Portal : Error on import for orsId {}, portalName {}, with error message {}", orsId,
					portalName, e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG608,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG608), e.getMessage());
		}

		return responseNode;
	}

	@Override
	public Object getBundles(Credentials credentials, String orsId, String portalId) throws PortalConfigException {

		log.info("Download bundles and errors for portalId {}, with orsId {}", portalId, orsId);

		Object bundles = portalService.getBundles(credentials, orsId, portalId);
		Object errors = portalService.getErrors(credentials, orsId, portalId);
		log.info("Stream bundles and errors for portalId {}, with bundles {} and errors {}", portalId, bundles, errors);
		ByteArrayOutputStream bos = null;
		ZipOutputStream zos = null;
		try {
			bos = new ByteArrayOutputStream();
			zos = new ZipOutputStream(bos);
			log.info("Write bundles to ByteArray for portalId {}, with bundles {} ", portalId, bundles);
			readZipFile((byte[]) bundles, zos, bos, "bundles");
			log.info("Write Errors to ByteArray for portalId {}, with bundles {} ", portalId, bundles);
			readZipFile((byte[]) errors, zos, bos, "errors");

		} catch (Exception e) {
			log.error("Error on download bundles and Errors for portalId {}, with exception {} ", portalId,
					e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG610,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG610), e.getMessage());
		} finally {
			try {
				bos.close();
				zos.close();
			} catch (Exception e) {
				log.error("Error on close stream for download bundles and Errors for portalId {}, with exception {} ",
						portalId, e.getMessage());
				throw new PortalConfigException(ErrorCodeContants.CONFIG610,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG610), e.getMessage());
			}
		}

		if (null == bundles && null == errors) {
			log.info("Empty bundles and Errors to download for portalId {} ", portalId);
			throw new PortalConfigServiceException(ErrorCodeContants.PORTAL616,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL616),
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL616));
		}

		return bos;
	}

	@Override
	public JsonNode saveBundles(Credentials credentials, MultipartFile file, String orsId, String portalId)
			throws PortalConfigException {

		log.info("Upload Bundles and errors for orsId {} and portalId {} ", orsId, portalId);
		JsonNode responseNode = mapper.createObjectNode();
		try {

			ZipInputStream zis = new ZipInputStream(file.getInputStream());
			ZipEntry entry = null;
			byte[] bundlesByteArray = null, errorsByteArray = null;
			ByteArrayOutputStream bundleBos = null, errorBos = null;
			ZipOutputStream bundleZos = null, errorZos = null;
			while ((entry = zis.getNextEntry()) != null) {

				if (entry.isDirectory()) {
					if ("bundles/".equalsIgnoreCase(entry.getName())) {
						log.info("Upload Bundles and errors for orsId {} and portalId {} , with entry name {} ", orsId,
								portalId, entry.getName());
						bundleBos = new ByteArrayOutputStream();
						bundleZos = new ZipOutputStream(bundleBos);
						continue;
					} else if ("errors/".equalsIgnoreCase(entry.getName())) {
						log.info("Upload Bundles and errors for orsId {} and portalId {} , with entry name {} ", orsId,
								portalId, entry.getName());
						errorBos = new ByteArrayOutputStream();
						errorZos = new ZipOutputStream(errorBos);
						continue;
					}
				}

				String fileName = entry.getName();
				ByteArrayOutputStream fos = new ByteArrayOutputStream();
				final byte[] buf = new byte[BUFFER_SIZE];
				int length;

				while ((length = zis.read(buf, 0, buf.length)) >= 0) {
					fos.write(buf, 0, length);
				}
				if (fileName.contains("bundles/")) {

					String fName = fileName.split("/")[1];
					log.info("Upload Bundles : write Byte Array for orsId {} and portalId {} , with filename {} ",
							orsId, portalId, entry.getName());
					ZipEntry firstEntry = new ZipEntry(fName);
					bundleZos.putNextEntry(firstEntry);
					InputStream bundlesInputStream = new ByteArrayInputStream(fos.toByteArray());
					IOUtils.copy(bundlesInputStream, bundleZos);
					bundleZos.flush();
					bundleZos.closeEntry();
					bundleBos.flush();
					bundlesByteArray = bundleBos.toByteArray();

				} else if (fileName.contains("errors/")) {

					String fName = fileName.split("/")[1];
					log.info("Upload : errors Byte Array for orsId {} and portalId {} , with filename {} ", orsId,
							portalId, entry.getName());
					ZipEntry firstEntry = new ZipEntry(fName);
					errorZos.putNextEntry(firstEntry);
					InputStream bundlesInputStream = new ByteArrayInputStream(fos.toByteArray());
					IOUtils.copy(bundlesInputStream, errorZos);
					errorZos.flush();
					errorZos.closeEntry();
					errorBos.flush();
					errorsByteArray = errorBos.toByteArray();

				}
			}

			if (bundlesByteArray != null) {
				log.info("Upload Bundles : Persist for orsId {} and portalId {}  ", orsId, portalId);
				responseNode = portalService.saveBundles(credentials, bundlesByteArray, orsId, portalId);
			}
			if (errorsByteArray != null) {
				log.info("Upload errors: Persist for orsId {} and portalId {} ", orsId, portalId);
				responseNode = portalService.saveErrors(credentials, errorsByteArray, orsId, portalId);
			}

		} catch (Exception e) {
			log.error("Error on Upload errors and bundles for orsId {} and portalId {} with error message {}", orsId,
					portalId, e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG608,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG608), e.getMessage());
		}

		return responseNode;
	}

	@Override
	public JsonNode updatePortalStatus(Credentials credentials, String portalId, String orsId, String action)
			throws PortalConfigException {

		log.info("Portal Status: update with action {}, for portalId {}, version {} and orsId {}", action, portalId,
				orsId);
		JsonNode responseNode = mapper.createObjectNode();
		JsonNode portalNode = portalService.getPublishedPortalConfig(credentials, portalId, orsId);

		log.info("Portal Status: Get current config with action {}, for portalId {}, version {} and orsId {}", action,
				portalId, orsId);
		String portalState = null;
		if (PortalMetadataContants.PORTAL_STATUS_START_ACTION.equalsIgnoreCase(action)) {
			portalState = PortalMetadataContants.PORTAL_STATUS_START;
		} else if (PortalMetadataContants.PORTAL_STATUS_STOP_ACTION.equalsIgnoreCase(action)) {
			portalState = PortalMetadataContants.PORTAL_STATUS_STOP;
		}

		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE, portalState);
		log.info("Portal Status: Update config with action {}, for portalId {}, and orsId {}", action, portalId, orsId);
		portalService.updatePortalState(credentials, portalNode);
		log.info("Portal Status: Updated config with action {}, for portalId {}, and orsId {}", action, portalId,
				orsId);

		Object errorBundles = portalService.getErrors(credentials, orsId, portalId);

		Object bundles = portalService.getBundles(credentials, orsId, portalId);

		if (PortalMetadataContants.PORTAL_STATUS_START.equalsIgnoreCase(portalState)) {
			if (null != errorBundles) {
				loadErrorProperties(errorBundles, portalId);
			}
			if (null != bundles) {
				loadBundleProperties(bundles, portalId);
			}
		} else if (PortalMetadataContants.PORTAL_STATUS_STOP.equalsIgnoreCase(portalState)) {
			CacheModel cacheParam = new CacheModel(orsId, null, null, null, null);
			cacheService.clearCache(cacheParam);
			externalErrorProperties.remove(portalId);
			externalBundleProperties.remove(portalId);
		}

		((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_VERSION,
				portalNode.get(PortalMetadataContants.PORTAL_VERSION));
		((ObjectNode) responseNode).putPOJO(PortalMetadataContants.PORTAL_ID,
				portalNode.get(PortalMetadataContants.PORTAL_ID));

		log.info("Portal Status: Published config with action {}, for portalId {}, and orsId {}", action, portalId,
				orsId);

		return responseNode;
	}

	private JsonNode savePortalConfig(JsonNode jsonObject, Credentials credentials, String orsId,
			HttpServletRequest request, String portalName, boolean isExistingPortal, boolean isExternalUserManagementEnabled, String systemName, String exitingPortalId,String ict)
			throws PortalConfigException {

		String selectedLocale = PortalConfigUtil.getCookieValue(request, "selectedLocale");
		JsonNode responseNode = mapper.createObjectNode();
		Boolean flag = false;
		try {
			JsonNode portalNode = jsonObject.get(PortalServiceConstants.PORTAL_CONFIG);
			((ObjectNode) portalNode.get(PortalMetadataContants.GENERAL_SETTINGS))
					.put(PortalMetadataContants.DATABASE_ID, orsId);
			((ObjectNode) portalNode.get(PortalMetadataContants.GENERAL_SETTINGS))
					.put(PortalMetadataContants.PORTAL_SOURCE_SYSTEM_NAME, systemName);
			if (!isExistingPortal) {
				((ObjectNode) portalNode).remove(PortalMetadataContants.PORTAL_ID);
				flag = portalService.isPortalNameExist(credentials, portalName, portalNode
						.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText());
			} else {
				((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, exitingPortalId);
				isExternalUserManagementEnabled = getExistingExternalUserManagementFlag(credentials, exitingPortalId, orsId, portalNode);
				populateSystemFields(credentials, exitingPortalId, orsId, portalNode);
				flag = portalService.isPortalNameExistById(credentials, portalNode.get(PortalMetadataContants.PORTAL_ID).asText(), portalName, portalNode
						.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText());
			}

			if (flag) {
				throw new PortalAlreadyExistException(ErrorCodeContants.CONFIG318,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG318),
						portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_NAME)
								.asText());
			}
			String mdmSessionId = new String(credentials.getPayload()).split("\\|\\|")[1];
			if (beValidation(credentials, orsId, portalNode.get(PortalMetadataContants.GENERAL_SETTINGS)
					.get(PortalMetadataContants.BE_NAME).asText(), request, mdmSessionId, portalCmxUrl,ict)) {

				((ObjectNode) portalNode.get(PortalMetadataContants.GENERAL_SETTINGS))
						.put(PortalMetadataContants.PORTAL_NAME, portalName);
				((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE,
						PortalMetadataContants.PORTAL_STATUS_STOP);
				((ObjectNode) portalNode.get(PortalMetadataContants.GENERAL_SETTINGS))
				.put(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED, isExternalUserManagementEnabled);
				
				if(isExternalUserManagementEnabled ) {
					((ObjectNode) portalNode.get(PortalMetadataContants.GENERAL_SETTINGS))
					.put(PortalMetadataContants.DISABLE_SIGNUP, Boolean.TRUE);
				}
				
				JsonNode validatePortalNode = portalNode.deepCopy();

				externalConfigFactory.invokeExternalConfigService(validatePortalNode, credentials, orsId, mdmSessionId,
						false, portalCmxUrl, selectedLocale,ict);
				
				String metaVersion = null != portalNode && null != portalNode.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION) ? portalNode.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION).asText() : "";
				
				if (null != portalNode && metaVersion.compareTo(metamodelVersion) > 0) {
					
					log.info("Import Portal Metamodel version {} can't be higher than application Metamodel version {} for portalId {}", metaVersion,
							metamodelVersion, portalNode.get(PortalMetadataContants.PORTAL_ID));
					throw new PortalConfigException(ErrorCodeContants.CONFIG914,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG914), "Import Portal Metamodel version {} can't be higher than application Metamodel version");
				}
				
				
				if (null != portalNode && metaVersion.compareTo(metamodelVersion) != 0) {
					((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE,
							PortalMetadataContants.PORTAL_STATUS_INVALID);
					((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_METAMODEL_VERSION,
							metamodelVersion);
				}			

				JsonNode portalConfigNode = portalService.savePortalConfigInDraft(credentials, portalNode);

				// JsonNode portalConfigNode = portalService.publishPortalConfig(credentials,
				// portalNode);

				((ObjectNode) responseNode).set(PortalMetadataContants.PORTAL_ID,
						portalConfigNode.get(PortalMetadataContants.PORTAL_ID));
				((ObjectNode) responseNode).set(PortalMetadataContants.PORTAL_VERSION,
						portalConfigNode.get(PortalMetadataContants.PORTAL_VERSION));
				((ObjectNode) responseNode).put(PortalMetadataContants.PORTAL_NAME, portalName);
				/*
				 * portalService.savePortalRuntimeConfig(credentials,
				 * jsonObject.get(PortalServiceConstants.RUNTIME_CONFIG), orsId,
				 * portalConfigNode.get(PortalMetadataContants.PORTAL_ID).asText());
				 */
			} else {
				throw new PortalConfigException(ErrorCodeContants.CONFIG608,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG608), "");
			}

		} catch (PortalAlreadyExistException e) {
			log.error("Portal with name already exists");
			throw e;
		} catch (PortalConfigException e) {
			log.error("Import Portal : Error on import for orsId {}, portalName {}, with error message {}", orsId,
					portalName, e.getMessage());
				throw e;
		} 
		catch (Exception e) {
			throw new PortalConfigException(ErrorCodeContants.CONFIG608,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG608), e.getMessage());
		}
		return responseNode;
	}
	
	
	private boolean getExistingExternalUserManagementFlag(Credentials credentials, String exitingPortalId, String orsId, JsonNode portalNode) throws PortalConfigException {
		
		JsonNode existingPortalNode = null;
		boolean existingExternalUserManagementFlag = false;
		try {
			existingPortalNode = portalService.getPortalConfigDraft(credentials, exitingPortalId, orsId);
		} catch (ResourceNotFoundException e) {
			log.debug("Import Portal to get existing ExternalUserManagementFlag value, fetching from publish table for portalId {}, orsId {}",exitingPortalId, orsId);
			existingPortalNode = portalService.getPublishedPortalConfig(credentials, exitingPortalId, orsId);
		}
        if (existingPortalNode.get(PortalMetadataContants.GENERAL_SETTINGS)
                .has(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED)) {
            existingExternalUserManagementFlag = existingPortalNode.get(PortalMetadataContants.GENERAL_SETTINGS)
                    .get(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED).asBoolean();
        }
		
		return existingExternalUserManagementFlag;
	}
	
	private void populateSystemFields(Credentials credentials, String exitingPortalId, String orsId, JsonNode portalNode) throws PortalConfigException {
		
		JsonNode existingPortalNode = null;
		
		try {
			existingPortalNode = portalService.getPortalConfigDraft(credentials, exitingPortalId, orsId);
		} catch (ResourceNotFoundException e) {
			log.debug("Import Portal populate system field, fetching from publish table for portalId {}, orsId {}",exitingPortalId, orsId);
			existingPortalNode = portalService.getPublishedPortalConfig(credentials, exitingPortalId, orsId);
		}
		
		((ObjectNode) portalNode).set(PortalMetadataContants.PORTAL_VERSION, existingPortalNode.get(PortalMetadataContants.PORTAL_VERSION));
	}
	

	private boolean beValidation(Credentials credentials, String orsId, String beName, HttpServletRequest request,
			String mdmSessionId, String initialUrl,String ict) throws MDMSessionException {
		String url = String.format(PortalMetadataContants.BE_META_URL, initialUrl, orsId);
		HttpHeaders headers = new HttpHeaders();
		String cookie = PortalMetadataContants.MDM_SESSION_ID + "=" + mdmSessionId;
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, ict);
		headers.add("Cookie", cookie);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		ResponseEntity<String> response = PortalConfigUtil.executeRest(url, HttpMethod.GET, null, headers,
				restTemplate);
		if (response.getStatusCode() == HttpStatus.OK) {
			String body = response.getBody();
			JSONObject jsonBody = new JSONObject(body);
			if (jsonBody.has(PortalMetadataContants.ITEM)) {
				JSONArray jsonArray = jsonBody.getJSONArray(PortalMetadataContants.ITEM);
				for (int i = 0; i < jsonArray.length(); i++) {
					String name = jsonArray.getJSONObject(i).getJSONObject(ExternalConfigConstants.BE_OBJECT)
							.getString(PortalMetadataContants.PAGE_NAME_ATTRIBUTE);
					if (name.equalsIgnoreCase(beName))
						return true;
				}
			}
		}
		return false;
	}

	private boolean isNotPublishedAlready(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException, IOException {

		boolean flag = false;
		JsonNode portalNode = null;
		try {
			portalNode = portalService.getPublishedPortalConfig(credentials, portalId, orsId);
		} catch (ResourceNotFoundException e) {
			flag = true;
		}
		flag = null == portalNode;
		return flag;
	}

	private void persistIntialRuntimeConfig(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException, IOException {

		Resource resource = PortalConfigUtil.loadFileFromClasspath(PortalMetadataContants.RUNTIME_CONFIG_PATH,
				pathMatchingResourcePatternResolver);
		JsonNode runtimeNode = mapper.readTree(resource.getInputStream());
		saveRuntimeConfig(credentials, runtimeNode, portalId, orsId);
	}
	
	private void updateAndPersistSSOConfig (Credentials credentials, String portalId, String orsId)
			throws SAMLException, IOException, PortalConfigException {

        JsonNode samlNode = getSAMLConfigWithPortalDetails( portalId, orsId);
        saveSSOConfig(credentials, samlNode, portalId, orsId);
		
	}
	
	public JsonNode getSAMLConfigWithPortalDetails(String portalId, String orsId) throws SAMLException, IOException {

		Resource samlResource = PortalConfigUtil.loadFileFromClasspath(PortalMetadataContants.SAML_CONFIG_PATH,
				pathMatchingResourcePatternResolver);
		JsonNode node = mapper.readTree(samlResource.getInputStream());

		String entityId = getSamlServiceProviderEntityId(portalId, orsId);
		// https://<host>:<port>/infa-portal/portals/login/saml/ORS_ID/PORTAL_ID
		String acsURL = String.format(PortalServiceConstants.SSO_ACS_URL, portalCmxUrl, orsId, portalId);

        if(node.has(PortalMetadataContants.SERVICE_PROVIDER_METADATA_PROPERTIES)) {
            JsonNode spMetaData = node.get(PortalMetadataContants.SERVICE_PROVIDER_METADATA_PROPERTIES);
            JsonNode configurationNode = spMetaData.get(PortalMetadataContants.CONFIGURATION);

            if(configurationNode.has(PortalMetadataContants.SSO_SP_KEY_ENTITY_ID)) {
				((ObjectNode) configurationNode.get(PortalMetadataContants.SSO_SP_KEY_ENTITY_ID))
						.put(PortalMetadataContants.VALUE_ATTRIBUTE, entityId);
			}
            if(configurationNode.has(PortalMetadataContants.SSO_SP_KEY_ACSURL)) {
				((ObjectNode) configurationNode.get(PortalMetadataContants.SSO_SP_KEY_ACSURL))
						.put(PortalMetadataContants.VALUE_ATTRIBUTE, acsURL);
			}
        }
        if(node.has(PortalMetadataContants.GENERAL_PROPERTIES_METADATA_PROPERTIES)) {
            JsonNode generalProps = node.get(PortalMetadataContants.GENERAL_PROPERTIES_METADATA_PROPERTIES);
            JsonNode configurationNode = generalProps.get(PortalMetadataContants.CONFIGURATION);
            if(configurationNode.has(PortalMetadataContants.SSO_GP_KEY_SAMLREDIRECTURL)) {
                ((ObjectNode) configurationNode.get(PortalMetadataContants.SSO_GP_KEY_SAMLREDIRECTURL))
                        .put(PortalMetadataContants.VALUE_ATTRIBUTE, portalCmxUrl);
            }

        }

        return node;
	}
	private void persistInitialBundles(Credentials credentials, String portalId, String orsId, JsonNode jsonNode)
			throws PortalConfigException, IOException {
		Object bundles = portalService.getBundles(credentials, orsId, portalId);
		ByteArrayOutputStream bos = null;
		ZipOutputStream zos = null;
		Properties newProps = new Properties();
		Map<String, Properties> propertiesMap = new HashMap<>();
		if (bundles != null) {
			propertiesMap = getCurrentProperties(bundles);
		}
		newProps.setProperty(PortalMetadataContants.PORTAL_NAME,
				jsonNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_NAME).asText());
		newProps.setProperty(PortalMetadataContants.PORTAL_TITLE, jsonNode.get(PortalMetadataContants.GENERAL_SETTINGS)
				.get(PortalMetadataContants.PORTAL_TITLE).asText());
		generateProps(jsonNode, newProps, "");
		try {
			bos = new ByteArrayOutputStream();
			zos = new ZipOutputStream(bos);
			for (int index = 0; index < locales.length; index++) {
				String fileName = null;
				if (StringUtil.isEmpty(locales[index])) {
					fileName = PortalServiceConstants.DEFAULT_BUNDLE_PROPETIES;
				} else {
					fileName = String.format(PortalServiceConstants.LOCALE_FILE_FORMAT, locales[index]);
				}
				ZipEntry entry = new ZipEntry(fileName);
				zos.putNextEntry(entry);
				if (StringUtil.isEmpty(locales[index])) {
					newProps.store(zos, null);
				} else {
					if (bundles == null) {
						Properties props = new Properties();
						for (Object key : newProps.keySet()) {
							props.put(key, "");
						}
						props.store(zos, null);
						zos.flush();
						zos.closeEntry();
						bos.flush();
						continue;
					}
					Properties oldProps = propertiesMap.get(fileName);
					@SuppressWarnings("unchecked")
					Enumeration<String> enums = (Enumeration<String>) oldProps.propertyNames();
					while (enums.hasMoreElements()) {
						String key = enums.nextElement();
						if (!newProps.containsKey(key)) {
							oldProps.remove(key);
						}
					}
					for (Object key : newProps.keySet()) {
						if (!oldProps.containsKey(key)) {
							oldProps.put(key, "");
						}
					}
					oldProps.store(zos, null);
				}
				zos.flush();
				zos.closeEntry();
				bos.flush();
			}
			portalService.saveBundles(credentials, bos.toByteArray(), orsId, portalId);
		} catch (Exception e) {
			throw new PortalConfigException(ErrorCodeContants.CONFIG612,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG612), "");
		} finally {
			try {
				bos.close();
				zos.close();
			} catch (Exception e) {
				throw new PortalConfigException(ErrorCodeContants.CONFIG612,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG612), "");
			}
		}
	}

	// generate localisation properties its not generic needs to be re-visited
	public void generateProps(JsonNode jsonNode, Properties props, String prefix) {

		Iterator<String> fieldIterator = jsonNode.fieldNames();
		while (fieldIterator.hasNext()) {
			String fieldName = fieldIterator.next();
			if (!fieldName.equalsIgnoreCase(PortalMetadataContants.BE_FORM_FIELDS_ATTRIBUTE)
					&& !fieldName.equalsIgnoreCase(PortalMetadataContants.META_ECLASS_STRING)) {

				JsonNode iterNode = jsonNode.get(fieldName);
				if (iterNode.isArray()) {
					String key = new String(prefix);
					if (key.isEmpty()) {
						key = fieldName;
					} else if (jsonNode.has(PortalMetadataContants.KEY_ATTRIBUTE)) {
						key = key + "." + fieldName;
					}
					for (JsonNode node : iterNode) {

						JsonNode keyNode = node.get(PortalMetadataContants.KEY_ATTRIBUTE);
						if (keyNode != null && !keyNode.asText().equals("") && !keyNode.isMissingNode()
								&& !keyNode.isNull()) {
							String uniqueKey = keyNode.asText();
							JsonNode nameNode = node.get(PortalMetadataContants.PAGE_NAME_ATTRIBUTE);
							JsonNode titleNode = node.get(PortalMetadataContants.TITLE_ATTRIBUTE);
							if (titleNode != null && !titleNode.asText().equals("") && !titleNode.isMissingNode()
									&& !titleNode.isNull()) {
								String title = titleNode.asText();
								props.setProperty(key + "." + uniqueKey + "." + PortalMetadataContants.TITLE_ATTRIBUTE,
										title);
								generateProps(node, props, key + "." + uniqueKey);
							} else if (nameNode != null && !nameNode.asText().equals("") && !nameNode.isMissingNode()
									&& !nameNode.isNull()) {
								String title = nameNode.asText();
								props.setProperty(
										key + "." + uniqueKey + "." + PortalMetadataContants.PAGE_NAME_ATTRIBUTE,
										title);
								generateProps(node, props, key + "." + uniqueKey);
							}
						} else {
							generateProps(node, props, key);
						}
					}
				} else if (iterNode.isObject()) {
					String key = new String(prefix);
					if (iterNode.has(PortalMetadataContants.TITLE_ATTRIBUTE)
							|| iterNode.has(PortalMetadataContants.PAGE_NAME_ATTRIBUTE)
							|| iterNode.has(PortalMetadataContants.WELCOME_TEXT_ATTRIBUTE)
							|| iterNode.has(PortalMetadataContants.FOOTER_TEXT_ATTRIBUTE)
							|| iterNode.has(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE)
							|| fieldName.equalsIgnoreCase(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE)
							|| iterNode.has(PortalMetadataContants.LABEL_ATTRIBUTE)) {
						if (key.isEmpty()) {
							key = fieldName;
						} else if (jsonNode.has(PortalMetadataContants.KEY_ATTRIBUTE)
								|| fieldName.equalsIgnoreCase(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE)
								|| iterNode.has(PortalMetadataContants.LABEL_ATTRIBUTE)) {
							key = key + "." + fieldName;
						}
					}
					generateProps(iterNode, props, key);
				} else if (iterNode.isValueNode() && (fieldName.equalsIgnoreCase(PortalMetadataContants.TITLE_ATTRIBUTE)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.WELCOME_TEXT_ATTRIBUTE)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.FOOTER_TEXT_ATTRIBUTE)
						|| iterNode.has(PortalMetadataContants.PAGE_NAME_ATTRIBUTE)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.LABEL_ATTRIBUTE)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.OVERVIEW_TITLE)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.OVERVIEW_BODY)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.OVERVIEW_HEADING)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.SECTION_HEADING)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.HEADING)
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.BODY))
						|| fieldName.equalsIgnoreCase(PortalMetadataContants.DESCRIPTION_ATTRIBUTE)) {
					props.setProperty(prefix + "." + fieldName, iterNode.asText());
				}
			}
		}
	}

	private Map<String, Properties> getCurrentProperties(Object bundles) throws IOException {
		Map<String, Properties> propertiesMap = new HashMap<>();
		ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream((byte[]) bundles));
		ZipEntry entry = null;
		while ((entry = zis.getNextEntry()) != null) {
			Properties props = new Properties();
			String fileName = entry.getName();
			ByteArrayOutputStream fos = new ByteArrayOutputStream();
			final byte[] buf = new byte[BUFFER_SIZE];
			int length;
			while ((length = zis.read(buf, 0, buf.length)) >= 0) {
				fos.write(buf, 0, length);
			}
			props.load(new ByteArrayInputStream(fos.toByteArray()));
			propertiesMap.put(fileName, props);
		}
		return propertiesMap;
	}

	private void loadErrorProperties(Object bundles, String portalId) throws PortalConfigException {

		Map<String, Properties> propertiesMap = new HashMap<>();
		ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream((byte[]) bundles));
		ZipEntry entry = null;
		try {

			while ((entry = zis.getNextEntry()) != null) {
				Properties props = new Properties();
				String fileName = entry.getName();
				log.info("Loading External Error Code - processing the file {}", fileName);
				String splittedFileName = fileName.split("\\.")[0];
				String locale = splittedFileName.split("_").length == 1 ? "en"
						: splittedFileName.substring(splittedFileName.indexOf("_") + 1, splittedFileName.length());
				ByteArrayOutputStream fos = new ByteArrayOutputStream();
				final byte[] buf = new byte[BUFFER_SIZE];
				int length;
				while ((length = zis.read(buf, 0, buf.length)) >= 0) {
					fos.write(buf, 0, length);
				}
				props.load(new ByteArrayInputStream(fos.toByteArray()));
				log.info("Loading External Error Properties with locale {}", locale);
				propertiesMap.put(locale, props);
			}

		} catch (Exception e) {
			log.error("Error on loading Custom Error Properties for portalId {} with error message {} ", portalId,
					e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.PORTAL615,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL615), e.getMessage());
		}

		externalErrorProperties.put(portalId, propertiesMap);
	}

	private void loadBundleProperties(Object bundles, String portalId) throws PortalConfigException {

		Map<String, Properties> propertiesMap = new HashMap<>();
		ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream((byte[]) bundles));
		ZipEntry entry = null;
		try {

			while ((entry = zis.getNextEntry()) != null) {
				Properties props = new Properties();
				String fileName = entry.getName();
				log.info("Loading External Bundle locale Code - processing the file {}", fileName);
				String splittedFileName = fileName.split("\\.")[0];
				String locale = splittedFileName.split("_").length == 1 ? "en"
						: splittedFileName.substring(splittedFileName.indexOf("_") + 1, splittedFileName.length());
				ByteArrayOutputStream fos = new ByteArrayOutputStream();
				final byte[] buf = new byte[BUFFER_SIZE];
				int length;
				while ((length = zis.read(buf, 0, buf.length)) >= 0) {
					fos.write(buf, 0, length);
				}
				props.load(new ByteArrayInputStream(fos.toByteArray()));
				log.info("Loading External Error Properties with locale {}", locale);
				propertiesMap.put(locale, props);
			}

		} catch (Exception e) {
			log.error("Error on loading Custom Bundle Properties for portalId {} with error message {} ", portalId,
					e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.PORTAL615,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL615), e.getMessage());
		}

		externalBundleProperties.put(portalId, propertiesMap);
	}

	@Override
	public boolean isPortalExistById(Credentials credentials, String portalId, String orsId, String state)
			throws PortalConfigException {

		if (!StringUtils.isEmpty(state) && PortalMetadataContants.PORTAL_STATE_DRAFT.equals(state)) {
			return portalService.isDraftPortalExistById(credentials, portalId, orsId);
		} else {
			return portalService.isPublishedPortalExistById(credentials, portalId, orsId);
		}

	}

	private void insertPortalIdBuyerSideLookUptable(String portalId, String PortalName, String beName, String orsId,
			Credentials credentials, String sourceSystem) throws PortalConfigException {
		try {
			PutRequest putRequest = new PutRequest();
			RecordKey recordKey = new RecordKey();
			recordKey.setSystemName(sourceSystem);
			Record record = new Record();
			record.setSiperianObjectUid(SiperianObjectType.BASE_OBJECT.makeUid(DatabaseConstants.TABLE_PORTAL_ASSC));
			record.setField(new Field(DatabaseConstants.COLUMN_ASSC_PORTAL_ID, portalId));
			record.setField(new Field(DatabaseConstants.COLUMN_ASSC_PORTAL_NAME, PortalName));
			record.setField(new Field(DatabaseConstants.COLUMN_ASSC_PORTAL_BE_NAME, beName));
			putRequest.setRecordKey(recordKey);
			putRequest.setRecord(record);
			putRequest.setUsername(credentials.getUsername());
			putRequest.setSecurityPayload(credentials.getPayload());
			putRequest.setOrsId(orsId);
			putRequest.setGenerateSourceKey(true);
			PutResponse response = (PutResponse) siperianClient.process(putRequest);
			if (response.getActionType().equalsIgnoreCase("Insert")) {
				log.info("Lookup data inserted in to Table. RowId : " + response.getRecordKey().getRowid());
			}
		} catch (Exception e) {

			log.error("Failed to insert data into lookup table : " + e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG615,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG615),
					"Failed to insert data into lookup table");
		}

	}
	
	private void deletePortalFromAssociationLookup(String portalId,PortalRestConfig restConfig,Credentials credentials,HttpServletRequest request) throws PortalConfigException, Exception {
		boolean doesRecordExists = false;
		try {
			log.info("Getting portal config for portal id {} ",portalId);
			JsonNode portalConfigNode = portalService.getPublishedPortalConfig(credentials, portalId, restConfig.getOrs());
			String beName = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.BE_NAME).asText();
			JsonNode portalAssociationNode = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.LOGIN_ATTRIBUTE).get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE).get(PortalMetadataContants.PORTAL_ASSC_FIELD);
			JsonNode responseNode = null;
			if(portalAssociationNode!=null && !portalAssociationNode.isEmpty(null)) {
				String portalAssociation= portalAssociationNode.get(PortalMetadataContants.CODE_ATTRIBUTE).asText();
				log.info("Searching records associated with the portal   {} ",portalId);
				ResponseEntity<String> searchResponse = externalConfigService.searchBERecord(
					beName, restConfig.getOrs(),
					restConfig.getInitialApiUrl(), restConfig.getMdmSessionId(), restConfig.getLocale(), portalAssociation,
					portalId,request);
				responseNode = mapper.readTree(searchResponse.getBody());
			}
			if (null == responseNode || responseNode.isEmpty(null) || !responseNode.has(PortalServiceConstants.ITEM) 
					|| responseNode.get(PortalServiceConstants.ITEM).size()==0 ) {
				log.info("There are no records associated with the portal id {} it is safe to delete",portalId);
				String sourceSystem = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
						.get(PortalMetadataContants.PORTAL_SOURCE_SYSTEM_NAME).asText();
				String rowidObject = getPortalAsscRowid(restConfig.getOrs(), credentials, portalId);
				if(rowidObject!=null)
				removeFromAssociationLookup(restConfig.getOrs(),credentials,rowidObject,sourceSystem);
				return;
			}else {
				doesRecordExists=true;
				log.error("Can not delete portal as there are records associated with it");
				throw new PortalConfigException(ErrorCodeContants.CONFIG915,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG915), "Can not delete portal as there are records associated with it");
			}
		}catch(PortalConfigException e) {
			if(doesRecordExists)
				throw e;
			else {
				log.error("Error while deleting portal from portal association lookup");
				log.error(e.getMessage());
				throw e;
			}
		}catch(Exception e) {
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG916,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG916), e.getMessage());
		}
		
	}
	
	private void removeFromAssociationLookup(String orsId,Credentials credentials,String rowidObject,String sourceSystem) throws PortalConfigException{
		try {
		DeleteRequest deleteRequest = new DeleteRequest();
		deleteRequest.setOrsId(orsId);
		ArrayList<RecordKey> recordKeys = new ArrayList<>();
		RecordKey recordKey = new RecordKey();
		recordKey.setRowid(rowidObject);
		recordKey.setSystemName(sourceSystem);
		recordKeys.add(recordKey);
		deleteRequest.setRecordKeys(recordKeys);
		deleteRequest.setSiperianObjectUid(SiperianObjectType.BASE_OBJECT.makeUid(DatabaseConstants.TABLE_PORTAL_ASSC));
		deleteRequest.setUsername(credentials.getUsername());
		deleteRequest.setSecurityPayload(credentials.getPayload());
		siperianClient.process(deleteRequest);
		}catch(Exception e) {
			log.error("Failed to delete portal entry from Portal Association Lookup");
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG916,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG916), e.getMessage());
		}
	}
	
	private String getPortalAsscRowid(String orsId,Credentials credentials,String portalId) throws PortalConfigException {
		try {
		SearchQueryRequest request = new SearchQueryRequest();
		request.setOrsId(orsId);
		request.setSiperianObjectUid(SiperianObjectType.BASE_OBJECT.makeUid(DatabaseConstants.TABLE_PORTAL_ASSC));
		request.setFilterCriteria(DatabaseConstants.COLUMN_ASSC_PORTAL_ID+"="+portalId);
		request.setSecurityPayload(credentials.getPayload());
		SearchQueryResponse response = (SearchQueryResponse)siperianClient.process(request);
		List<Record> records = response.getRecords();
		if(records.size()>0) {
			Record record = records.get(0);
			return record.getField(DatabaseConstants.COLUMN_ROWID_OBJECT).getStringValue();
		}
		}catch(Exception e) {
			log.error("Failed to get rowid corresponding to portalId from Portal Association Lookup");
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG916,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG916), e.getMessage());
		}
		return null;
	}

}
