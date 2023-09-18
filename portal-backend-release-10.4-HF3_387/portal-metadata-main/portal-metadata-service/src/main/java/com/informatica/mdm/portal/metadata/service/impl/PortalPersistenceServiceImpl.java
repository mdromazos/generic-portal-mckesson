package com.informatica.mdm.portal.metadata.service.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.stream.StreamSupport;

import com.informatica.mdm.portal.metadata.exception.*;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.DataSourceClient;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.config.MultiDataSource;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.UserPreferenceNotFoundException;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;
import com.informatica.mdm.portal.metadata.model.Portal;
import com.informatica.mdm.portal.metadata.repository.PortalRepo;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.util.DatabaseColumns;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.DatabaseObjectTypes;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.informatica.mdm.portal.metadata.util.QueryComponent;
import com.informatica.mdm.portal.metadata.util.QueryWrapper;
import com.siperian.sif.client.SiperianClient;
import com.siperian.sif.message.RollBackStrategy;
import com.siperian.sif.message.ValidationStatusType;
import com.siperian.sif.message.mrm.ApplyChangeListRequest;
import com.siperian.sif.message.mrm.ApplyChangeListResponse;
import com.siperian.sif.message.mrm.GetValidationStatusRequest;
import com.siperian.sif.message.mrm.GetValidationStatusResponse;

@Service
//@Transactional
public class PortalPersistenceServiceImpl implements PortalPersistenceService {

	private final static Logger log = LoggerFactory.getLogger(PortalPersistenceServiceImpl.class);

	@Autowired
	private MultiDataSource multiDataSource;

	@Autowired
	private PortalRepo portalRepo;

	@Autowired
	private ObjectMapper objectMapper;
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	@Autowired
    SiperianClient siperianClient;
	
	@Value("${cmx.server.masterdatabase.type}")
	private String dbName;
	
	@Value("${generic.portal.metamodel.version}")
	private String metamodelVersion;


	@Override
	public ArrayNode getPortals(Credentials credentials, Boolean withConfig) throws PortalConfigException {

		log.info("Get Available Portal Configuration ");
		ArrayNode responseArray = objectMapper.createArrayNode();

		try {

			ArrayNode mergedPortalArray = objectMapper.createArrayNode();
			Map<String, DataSourceModel> datasource = getDatasourceMap(credentials);
			Set<String> dataSourceKeys = datasource.keySet();
			for (String orsId : dataSourceKeys) {
				JdbcTemplate jdbcTemplate = null;
				try {
					DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
					jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
					portalRepo.setJdbcTemplate(jdbcTemplate);
					ArrayNode portalArray = null;

					if (portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP)) {

						tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP, orsId, credentials);

						log.info("Get Available Published Portal Configuration ");
						portalArray = portalRepo.getPortals(orsId, credentials.getUsername(), withConfig,
								DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
						upgradeMetamodel(portalArray, credentials, DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);

						for(JsonNode draftNode : portalArray) {
							String publishedStatus = getPublishedPortalStatus(credentials, draftNode.get(PortalMetadataContants.PORTAL_ID).asText(), orsId);
							JsonNode draftConfiguration = objectMapper.readTree(draftNode.get(PortalMetadataContants.CONFIGURATION).asText());
							String portalStatus = null != draftConfiguration && null != draftConfiguration.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE)
									? PortalConfigUtil.stateEvaluation(publishedStatus, draftConfiguration.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText()) : publishedStatus;
							((ObjectNode) draftNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE,
									null == portalStatus ? PortalMetadataContants.PORTAL_STATUS_STOP : portalStatus);
						}

						if(!withConfig) {
							portalArray.forEach(node -> ((ObjectNode) node).remove(PortalMetadataContants.CONFIGURATION));
						}

						mergedPortalArray.addAll(portalArray);
					}



					if (portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
						final List<String> draftPortalIds = portalArray
								.findValuesAsText(PortalMetadataContants.PORTAL_ID);

						tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, orsId, credentials);

						log.info("Get Available Draft Portal Configuration ");
						ArrayNode publishedPortals = portalRepo.getPortals(orsId, credentials.getUsername(), withConfig, DatabaseConstants.TABLE_PORTAL_CONFIG);
						upgradeMetamodel(publishedPortals, credentials, DatabaseConstants.TABLE_PORTAL_CONFIG);

						if(!withConfig) {
							publishedPortals.forEach(node -> {
								((ObjectNode) node).remove(PortalMetadataContants.CONFIGURATION);
								((ObjectNode) node).remove(PortalMetadataContants.PORTAL_METAMODEL_VERSION);
							});
						}

						publishedPortals.elements().forEachRemaining(portalNode -> {
							if (!draftPortalIds
									.contains(portalNode.get(PortalMetadataContants.PORTAL_ID).asText())) {
								mergedPortalArray.add(portalNode);
							} else {
								mergedPortalArray.forEach(node -> {
									if (node.get(PortalMetadataContants.PORTAL_ID).asText()
											.equals(portalNode.get(PortalMetadataContants.PORTAL_ID).asText())) {
										((ObjectNode) node).set(PortalMetadataContants.PORTAL_SSO_ATTRIBUTE,
												portalNode.get(PortalMetadataContants.PORTAL_SSO_ATTRIBUTE));
									}
								});
							}
						});
					}

				}
				finally {
					try {
						if(null != jdbcTemplate)
							jdbcTemplate.getDataSource().getConnection().close();
					} catch (SQLException throwables) {
						log.error("Error while closing jdbc connection");
					}
				}

			}

			Comparator<JsonNode> portalDatabaseIdComparator = Comparator.comparing(node -> node
							.get(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE).asBoolean(),
					Comparator.nullsFirst(Comparator.reverseOrder()));

			Comparator<JsonNode> portalComparator = portalDatabaseIdComparator.thenComparing(node -> PortalConfigUtil
							.formatApplicationDate(node.get(PortalMetadataContants.LAST_UPDATED_DATE).asText()).getTime(),
					Comparator.nullsFirst(Comparator.reverseOrder()));

			responseArray = StreamSupport.stream(mergedPortalArray.spliterator(), false)
					.sorted(portalComparator)
					.map(node-> ((ObjectNode) node).put(PortalMetadataContants.PORTAL_VERSION, node.get(PortalMetadataContants.PORTAL_VERSION).asText()))
					.collect(objectMapper::createArrayNode, ArrayNode::add, ArrayNode::addAll);

		} catch (PortalConfigException e) {
			log.error("Error on fetching all portal config ");
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching all portal config ");
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG315,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG315), e.getMessage());
		}
		return responseArray;
	}
	
	@Override
	public void upgradeMetamodel(ArrayNode portals, Credentials credentials, String tableName)
			throws PortalConfigException {

		log.info("Upgrade Portal MetaModel version for tableName {}, for username {}", tableName,
				credentials.getUsername());
		for (JsonNode portalNode : portals) {
			try {
				JsonNode portal = null != portalNode.get(PortalMetadataContants.CONFIGURATION) ? objectMapper.readTree(portalNode.get(PortalMetadataContants.CONFIGURATION).asText()) : null;
				//((ObjectNode) portal).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE, portalNode.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText());
				String metaVersion = null != portal && null != portal.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION) ? portal.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION).asText() : "";
				if (null != portal && metaVersion.compareTo(metamodelVersion) != 0) {

					((ObjectNode) portal).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE,
							PortalMetadataContants.PORTAL_STATUS_INVALID);
					((ObjectNode) portal).put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, metamodelVersion);
					((ObjectNode) portalNode).putObject(PortalMetadataContants.CONFIGURATION)
							.setAll((ObjectNode) portal);

					if (tableName.equals(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
						log.info("Upgrade Published Portal MetaModel version for portal {}", portal);
						((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE,
								PortalMetadataContants.PORTAL_STATUS_INVALID);
						((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_METAMODEL_VERSION,
								metamodelVersion);
						updatePortalState(credentials, portal);
					} else if (tableName.equals(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP)) {
						log.info("Upgrade Draft Portal MetaModel version for portal {}", portal);
						savePortalConfigInDraft(credentials, portal);
					}
				}
			} catch (JsonMappingException e) {
				log.error("Error on upgrading portal {}", portalNode.get(PortalMetadataContants.CONFIGURATION));
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG801,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG801), e.getMessage());
			} catch (JsonProcessingException e) {
				log.error("Error on upgrading portal {}", portalNode.get(PortalMetadataContants.CONFIGURATION));
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG801,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG801), e.getMessage());
			}
		}
	}

	@Override
	public JsonNode publishPortalConfig(Credentials credentials, JsonNode portalNode) throws PortalConfigException {

		Long portalId = portalNode.get(PortalMetadataContants.PORTAL_ID).asLong();
		Integer version = portalNode.get(PortalMetadataContants.PORTAL_VERSION).asInt();
		Integer updatedVersion = version + 1;
		boolean updatedFlag = false;
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, updatedVersion);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE, false);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_PUBLISHED_ATTRIBUTE, true);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE, PortalMetadataContants.PORTAL_STATUS_STOP);
		
		log.info("Publish Portal Configuration for portal id {} and version {} ", portalId, version);
		JdbcTemplate jdbcTemplate = null;
		try {

			Portal portal = new Portal();
			portal.setPortalId(portalId);
			portal.setPortalName(portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_NAME).asText());
			portal.setLastUpdateBy(credentials.getUsername());
			portal.setLastUpdatedDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()));
			portal.setMetadata(portalNode.toString().getBytes());
			portal.setVersion(updatedVersion);
			portal.setPortalStatus(portalNode.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText());
			portal.setMetamodelVersion(portalNode.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION).asText());

			DataSourceModel dataSourceModel = new DataSourceModel(
					portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText(), credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			if (!portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
				portalRepo.createPortalEntity(DatabaseConstants.TABLE_PORTAL_CONFIG);
			}else {
				tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, dataSourceModel.getOrsID(), credentials);
			}

			Object errorBundles = getDraftErrors(credentials, portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText(), ""+portalId);
			if(null != errorBundles) {
				portal.setErrorConfig((byte[]) errorBundles);
			}
			
			QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, portalId);

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalIdFilter);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
			projections.add(DatabaseConstants.COLUMN_VERSION);

			QueryWrapper queryWrapperConfig = new QueryWrapper();
			queryWrapperConfig.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapperConfig.setProjections(projections);
			queryWrapperConfig.setFilter(filter);

			List<Map<String, Object>> baseVersions = portalRepo.getPortalDetails(queryWrapperConfig);
			Map<String, Object> baseVersion = null != baseVersions && !baseVersions.isEmpty() ? baseVersions.get(0)
					: null;

			projections.add(DatabaseConstants.COLUMN_BASE_VERSION);

			QueryComponent usernameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME,
					credentials.getUsername());

			filter.add(usernameFilter);

			QueryWrapper queryWrapperCache = new QueryWrapper();
			queryWrapperCache.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapperCache.setProjections(projections);
			queryWrapperCache.setFilter(filter);

			List<Map<String, Object>> userVersions = portalRepo.getPortalDetails(queryWrapperCache);
			Map<String, Object> userVersion = null != userVersions && !userVersions.isEmpty() ? userVersions.get(0)
					: null;

			if (null != baseVersion && !baseVersion.isEmpty()) {
				
				if (new BigInteger(baseVersion.get(DatabaseConstants.COLUMN_VERSION).toString()).compareTo(
						new BigInteger(userVersion.get(DatabaseConstants.COLUMN_BASE_VERSION).toString())) == 0) {
					
					log.info("Publish Portal Configuration Update Action for portal id {} and version {} ", portalId, version);
					updatedFlag = true;
					
				} else if ((new BigInteger(baseVersion.get(DatabaseConstants.COLUMN_VERSION).toString())).compareTo(
						(new BigInteger(userVersion.get(DatabaseConstants.COLUMN_BASE_VERSION).toString()))) > 0) {
					
					log.error("Published Portal Config version has higher version than current user base version {} ",
							portalId);
					throw new PortalConfigServiceException(ErrorCodeContants.CONFIG317,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG317), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG317));
					
				} else {
					
					log.error(
							"Published Portal Config version can't be less than currently user base version for portal {} ",
							portalId);
					throw new PortalConfigServiceException(ErrorCodeContants.CONFIG316,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG316), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG316));
					
				}

			} else {
				
				log.info("Publish Portal Configuration Create Action for portal id {} and version {} ", portalId, version);
				portal.setCreatedBy(credentials.getUsername());
				portal.setCreatedDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()));
			}
			
			log.info("Delete Draft Portal Config for portal id {} ", portalId);
			List<QueryComponent> deleteFilter = new ArrayList<QueryComponent>();
			
			deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, portalId));
			deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, credentials.getUsername()));

			QueryWrapper deleteQueryWrapper = new QueryWrapper();
			deleteQueryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			deleteQueryWrapper.setFilter(deleteFilter);
			deleteQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);

			boolean deleteFlag = portalRepo.deletePortalConfig(deleteQueryWrapper);
			if(!deleteFlag) {
				log.error("Portal Not found for portal Id {} ", deleteQueryWrapper.getFilter());
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
			}
			
			if (updatedFlag) {
				
				QueryWrapper updateWrapper = portalUpdateWrapper(portal, DatabaseConstants.TABLE_PORTAL_CONFIG);
				portalRepo.updatePortalConfig(updateWrapper, portal.getPortalId());
				log.info("Publish Portal Configuration Updated for portal id {} and version {} ", portalId, version);
				
			} else {
				
				portalRepo.savePortalConfig(portal, DatabaseConstants.TABLE_PORTAL_CONFIG);
				log.info("Publish Portal Configuration Created for portal id {} and version {} ", portalId, version);
				
			}

		} catch (PortalConfigException e) {
			log.error(
					"Error on publishing portal config for portal id {} with user {} for database id {} for version {}",
					portalId, credentials.getUsername(), portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText(),
					version);
			throw e;
		} catch (Exception e) {
			log.error(
					"Error on publishing portal config for portal id {} with user {} for database id {} for version {}",
					portalId, credentials.getUsername(), portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText(),
					version);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return portalNode;
	}
	
	@Override
	public ArrayNode getHubUser( String userName) throws PortalConfigServiceException {
		ArrayNode userArray = null;
        JdbcTemplate jdbcTemplate = null;
        try {
			String mrmHome = PortalConfigUtil.getServerHomeDirectory();
			Properties properties = new Properties();
			properties.load(new FileInputStream(new File(mrmHome + PortalServiceConstants.BUILD_PROP)));
			String masterSchemaName = "cmx_system";
			DataSourceModel dataSourceModel = new DataSourceModel(masterSchemaName, null);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			userArray = portalRepo.getUsers();
			if(null != userName) {
				for(JsonNode user:userArray) {
					if(user.get(PortalServiceConstants.USER_NAME).asText().equalsIgnoreCase(userName)) {
						return objectMapper.createArrayNode().add(user);
					}
				}
				return null;
			}

			
		} catch (Exception e) {
			log.error("Error on fetching users from master database");
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG403,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG403), e.getMessage());
		}
		finally {
            try {
				if(null != jdbcTemplate)
                	jdbcTemplate.getDataSource().getConnection().close();
            } catch (SQLException throwables) {
                log.error("Error while closing jdbc connection");
            }
        }
		
		return userArray;
		
	}

	@Override
	public JsonNode getDatabases(Credentials credentials) throws PortalConfigException {
		
		ArrayNode orsList = objectMapper.createArrayNode();
		
		try {
			
			Map<String, DataSourceModel> datasourceMap = getDatasourceMap(credentials);
			datasourceMap.keySet().forEach((databaseId) -> {
				log.info("Get Database for database id {} ", databaseId);
				ObjectNode orsNode = objectMapper.createObjectNode();
				orsNode.put(PortalMetadataContants.DATABASE_ID, datasourceMap.get(databaseId).getOrsID());
				orsNode.put(PortalMetadataContants.DATABASE_LABEL, datasourceMap.get(databaseId).getDatabaseName());
				orsList.add(orsNode);
			});

		} catch (PortalConfigException e) {
			log.error("Error on retrieving ors databases ", credentials.getUsername());
			throw e;
		} catch (Exception e) {
			log.error("Error on retrieving ors databases");
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG403,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG403), e.getMessage());
		}
		return orsList;
	}

	private Map<String, DataSourceModel> getDatasourceMap(Credentials credentials) throws PortalConfigException {
		
		HubClient hubClient = HubClient.getInstance();
		Map<String, DataSourceModel> datasource = null;
		DataSourceModel dataSourceModel = new DataSourceModel(null, credentials);
		
		try {
			datasource = DataSourceClient.getOrsDataSources(dataSourceModel, hubClient.getAdminLoginBean());
			datasource.remove("cmx_system");
		} catch (Exception e) {
			log.error("Error on retrieving ors databases");
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG403,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG403), e.getMessage());
		}
		return datasource;
	}
	
	@Override
	public JsonNode getPublishedPortalConfigByVersion(Credentials credentials, String portalId, String orsID,
			Integer version) throws PortalConfigException {

		JsonNode portalNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {

			log.info("Retrieve Portal Configuration for portal id {}, for databaseID {} and version {} ", portalId,
					orsID, version);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			if (portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {

				tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, orsID, credentials);
				
				QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, portalId);

				QueryComponent versionFilter = new QueryComponent(DatabaseConstants.COLUMN_VERSION, version);

				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(portalIdFilter);
				filter.add(versionFilter);
				
				log.info("Retrieve Portal Configuration for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG, filter);
				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
				queryWrapper.setProjections(projections);
				queryWrapper.setFilter(filter);

				portalNode = portalRepo.getPortalConfiguration(queryWrapper);
				if (null == portalNode) {
					log.error("Portal Not found for portal Id {} ", portalId);
					throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
				}
			} else {
				log.error("Portal Not found for portal Id {} and version {} ", portalId, version);
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
			}

		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error(
					"Error on fetching published portal config for portal id {} with user {} for database id {} for version {}",
					portalId, credentials.getUsername(), orsID, version);
			throw e;
		} catch (Exception e) {
			log.error(
					"Error on fetching published portal config for portal id {} with user {} for database id {} for version {}",
					portalId, credentials.getUsername(), orsID, version);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return portalNode;
	}

	@Override
	public JsonNode getPublishedPortalConfig(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException {
		
		JsonNode portalNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			
			log.info("Retrieve Portal Configuration for portal id {}, for databaseID {} ", portalId, orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			if (portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
				
				tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, orsID, credentials);
				
				QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
						portalId);
				
				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(portalIdFilter);
				
				log.info("Retrieve Portal Configuration for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG, filter);
				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
				queryWrapper.setProjections(projections);
				queryWrapper.setFilter(filter);
				
				portalNode = portalRepo.getPortalConfiguration(queryWrapper);
				if (null == portalNode) {
					log.error("Portal Not found for portal Id {} ", portalId);
					throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
				}
			}
			
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on fetching published portal config for portal id {} with user {} for database id {} ",
					portalId, credentials.getUsername(), orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching published portal config for portal id {} with user {} for database id {} ",
					portalId, credentials.getUsername(), orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null !=jdbcTemplate )
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return portalNode;
	}

	@Override
	public JsonNode savePortalConfigInDraft(Credentials credentials, JsonNode portalNode) throws PortalConfigException {

		JdbcTemplate jdbcTemplate = null;
		try {
			
			if(null == portalNode.get(PortalMetadataContants.PORTAL_PUBLISHED_ATTRIBUTE) || !portalNode.get(PortalMetadataContants.PORTAL_PUBLISHED_ATTRIBUTE).asBoolean()) {
				((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE, PortalMetadataContants.PORTAL_STATUS_STOP);
			}
			
			Portal userPortal = new Portal();
			Boolean updateFlag = false;
			Integer baseVersion = PortalMetadataContants.BASE_VERSION_COUNTER;
			userPortal.setPortalName(portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_NAME).asText());
			userPortal.setLastUpdateBy(credentials.getUsername());
			userPortal.setLastUpdatedDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()));
			userPortal.setUserName(credentials.getUsername());

			DataSourceModel dataSourceModel = new DataSourceModel(
					portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText(), credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			if (!portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP)) {
				portalRepo.createPortalEntity(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			} else {
				tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP, dataSourceModel.getOrsID(), credentials);
			}
			
			Integer version = PortalMetadataContants.BASE_VERSION_COUNTER;

			if (portalNode.has(PortalMetadataContants.PORTAL_ID)) {
				Long portalId = portalNode.get(PortalMetadataContants.PORTAL_ID).asLong();
				version = portalNode.get(PortalMetadataContants.PORTAL_VERSION).asInt();
							
				QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
						portalId);
				
				QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME,
						credentials.getUsername());
				
				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(portalIdFilter);
				filter.add(userNameFilter);

				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
				projections.add(DatabaseConstants.COLUMN_VERSION);

				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
				queryWrapper.setProjections(projections);
				queryWrapper.setFilter(filter);

				if (!portalRepo.getPortalDetails(queryWrapper).isEmpty()) {
					updateFlag = true;
				} else {
					baseVersion = portalNode.get(PortalMetadataContants.PORTAL_VERSION).asInt();
					userPortal.setBaseVersion(baseVersion);
					userPortal.setCreatedBy(credentials.getUsername());
					userPortal.setCreatedDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()));
				}
				userPortal.setPortalId(portalId);

			} else {
				
				Long portalIdSequence = portalRepo.getSequenceNextValue();
				((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, String.valueOf(portalIdSequence));
				userPortal.setPortalId(portalIdSequence);
				userPortal.setCreatedBy(credentials.getUsername());
				userPortal.setCreatedDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()));
				userPortal.setBaseVersion(baseVersion);
			}
			
			version = version + 1;
			userPortal.setVersion(version);
			((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, version);
			((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE, true);
			userPortal.setMetadata(portalNode.toString().getBytes(StandardCharsets.UTF_8));
			JsonNode versionNode = null;
			if (updateFlag) {
				QueryWrapper updateWrapper = portalUpdateWrapper(userPortal, DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
				versionNode = portalRepo.updatePortalConfig(updateWrapper, userPortal.getPortalId());
			} else {
				versionNode = portalRepo.savePortalConfig(userPortal, DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			}
			
			((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID,
					versionNode.get(PortalMetadataContants.PORTAL_ID).asText());

		} catch (PortalConfigException e) {
			log.error("Error on saving draft portal config with user {} for database id {}", credentials.getUsername(),
					portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText());
			throw e;
		} catch (Exception e) {
			log.error("Error on saving draft portal config with user {} for database id {}", credentials.getUsername(),
					portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return portalNode;

	}

	@Override
	public JsonNode getPortalConfigDraft(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException {

		JsonNode portalNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			
			log.info("Retrieve Portal Configuration for portal id {}, for databaseID {} ", portalId, orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
					portalId);
			
			QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
					credentials.getUsername());
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalIdFilter);
			filter.add(userNameFilter);
			
			log.info("Retrieve Portal Configuration for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP, filter);
			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			portalNode = portalRepo.getPortalConfiguration(queryWrapper);
			if (null == portalNode) {
				log.error("Portal Not found for portal Id {} ", portalId);
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
			}
			
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on fetching draft portal config for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching draft portal config for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return portalNode;
	}

	@Override
	public JsonNode getPortalConfigDraftByVersion(Credentials credentials, String portalId, String orsID,
			Integer version) throws PortalConfigException {

		JsonNode portalNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			
			log.info("Retrieve Portal Configuration for portal id {}, for databaseID {} and version {} ", portalId, orsID, version);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 
					portalId);
			
			QueryComponent versionFilter = new QueryComponent(DatabaseConstants.COLUMN_VERSION, 
					version);
			
			QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
					credentials.getUsername());
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalIdFilter);
			filter.add(versionFilter);
			filter.add(userNameFilter);
			
			log.info("Retrieve Portal Configuration for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP, filter);
			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			portalNode = portalRepo.getPortalConfiguration(queryWrapper);
			
		} catch (PortalConfigException e) {
			log.error(
					"Error on fetching draft portal config for portal id {} with user {} for database id {} for version {}",
					portalId, credentials.getUsername(), orsID, version);
			throw e;
		} catch (Exception e) {
			log.error(
					"Error on fetching draft portal config for portal id {} with user {} for database id {} for version {}",
					portalId, credentials.getUsername(), orsID, version);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return portalNode;
	}

	@Override
	public void deletePublishedPortalConfig(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException {

		JdbcTemplate jdbcTemplate = null;
		try {

			log.info("Delete Published Portal Configuration for portal id {}, for databaseID {} ", portalId, orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			log.info("Delete Published Portal Config for portal id {} ", portalId);
			List<QueryComponent> deleteFilter = new ArrayList<QueryComponent>();

			deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, portalId));

			QueryWrapper deleteQueryWrapper = new QueryWrapper();
			deleteQueryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			deleteQueryWrapper.setFilter(deleteFilter);
			deleteQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);
			log.info("Delete Portal Config - Published for portalId {}", portalId);
			boolean deletePublishedFlag = portalRepo.deletePortalConfig(deleteQueryWrapper);
			if(!deletePublishedFlag) {
				log.error("Portal Not found for portal Id {} ", deleteQueryWrapper.getFilter());
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
			}
			log.info("Deleted Portal Config - Published for portalId {}, isDeleted {}", portalId, deletePublishedFlag);

			QueryWrapper deleteDraftQueryWrapper = new QueryWrapper();
			deleteDraftQueryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			deleteDraftQueryWrapper.setFilter(deleteFilter);
			deleteDraftQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);
			log.info("Delete Portal Config - Draft for portalId {}", portalId);
			boolean deleteDraftFlag = portalRepo.deletePortalConfig(deleteDraftQueryWrapper);
			log.info("Deleted Portal Config - Draft for portalId {}, isDeleted {}", portalId, deleteDraftFlag);

			if (!deletePublishedFlag && !deleteDraftFlag) {
				log.error("Portal Not found for portal Id {} ", deleteQueryWrapper.getFilter());
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
			}

		} catch (PortalConfigException e) {
			log.error("Error on deletion of published portal config for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on deletion of published portal config for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null!=jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
	}

	@Override
	public JsonNode deleteDraftPortalConfig(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException {

		ObjectNode versionNode = objectMapper.createObjectNode();
		JdbcTemplate jdbcTemplate = null;
		try {

			log.info("Delete Published Portal Configuration for portal id {}, for databaseID {} ", portalId, orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			log.info("Delete Draft Portal Config for portal id {} ", portalId);
			List<QueryComponent> deleteFilter = new ArrayList<QueryComponent>();
			
			deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, portalId));
			deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, credentials.getUsername()));

			QueryWrapper deleteQueryWrapper = new QueryWrapper();
			deleteQueryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			deleteQueryWrapper.setFilter(deleteFilter);
			deleteQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);

			boolean deleteFlag = portalRepo.deletePortalConfig(deleteQueryWrapper);
			if(!deleteFlag) {
				log.error("Portal Not found for portal Id {} ", deleteQueryWrapper.getFilter());
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
			}

			if(portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
				
				tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, orsID, credentials);
				
				QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, portalId);

				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(portalIdFilter);

				log.info("Retrieve Portal Configuration for table {}, with filter {} ",
						DatabaseConstants.TABLE_PORTAL_CONFIG, filter);
				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
				queryWrapper.setProjections(projections);
				queryWrapper.setFilter(filter);

				JsonNode portalNode = portalRepo.getPortalConfiguration(queryWrapper);

				if (null != portalNode) {
					versionNode.put(PortalMetadataContants.PORTAL_ID, portalId);
					versionNode.put(PortalMetadataContants.PORTAL_VERSION,
							portalNode.get(PortalMetadataContants.PORTAL_VERSION).asLong());
				}
				
			}

		} catch (PortalConfigException e) {
			log.error("Error on deletion of draft portal config for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on deletion of draft portal config for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return versionNode;
	}

	@Override
	public Long getSequence(Credentials credentials, String orsID) throws PortalConfigException {

		JdbcTemplate jdbcTemplate = null;
		try {
			
			log.info("Retrieve Sequence for databaseID {} ", orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			return portalRepo.getSequenceNextValue();
			
		} catch (PortalConfigException e) {
			log.error("Error on fetching sequence value for database id {} ", orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching sequence value for database id {} ", orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
	}

	@Override
	public Boolean isDraftPortalNameExist(Credentials credentials, String portalName, String orsId)
			throws PortalConfigException {
		JdbcTemplate jdbcTemplate = null;
		try {

			QueryComponent portalNameFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME, 
					portalName.toUpperCase());
			
			QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
					credentials.getUsername());
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalNameFilter);
			filter.add(userNameFilter);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);

			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			if (!portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP)) {
				return false;
			}
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			return portalRepo.isPortalConfigExistByName(queryWrapper);
			
		} catch (PortalConfigException e) {
			log.error("Error on fetching page sequence value for database id {} ", orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching draft portal by portal name ", orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

	}

	@Override
	public Boolean isDraftPortalNameExistById(Credentials credentials, String portalName, String portalId, String orsId)
			throws PortalConfigException {

		JdbcTemplate jdbcTemplate = null;
		try {

			QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
					portalId);
			portalIdFilter.setOperator(DatabaseConstants.NEGATION_LITERAL);
			
			QueryComponent portalNameFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME,
					portalName.toUpperCase());
			
			QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
					credentials.getUsername());
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalIdFilter);
			filter.add(portalNameFilter);
			filter.add(userNameFilter);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);

			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			if (!portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP)) {
				return false;
			}
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			return portalRepo.isPortalConfigExistByName(queryWrapper);
			
		} catch (PortalConfigException e) {
			log.error("Error on fetching page sequence value for database id {} ", orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching draft portal by portal name ", orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

	}

	@Override
	public Boolean isPublishedPortalNameExist(Credentials credentials, String portalName, String orsId)
			throws PortalConfigException {

		JdbcTemplate jdbcTemplate = null;
		try {

			QueryComponent portalNameFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME, 
					portalName.toUpperCase());
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalNameFilter);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);

			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			if (!portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
				return false;
			}
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			return portalRepo.isPortalConfigExistByName(queryWrapper);
			
		} catch (PortalConfigException e) {
			log.error("Error on fetching page sequence value for database id {} ", orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching published portal by portal name ", orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

	}

	@Override
	public Boolean isPublishedPortalNameExistById(Credentials credentials, String portalId, String portalName,
			String orsId) throws PortalConfigException {

		JdbcTemplate jdbcTemplate = null;
		try {

			QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
					portalId);
			portalIdFilter.setOperator(DatabaseConstants.NEGATION_LITERAL);
			
			QueryComponent portalNameFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME, 
					portalName.toUpperCase());
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalIdFilter);
			filter.add(portalNameFilter);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);

			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			if (!portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
				return false;
			}
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			return portalRepo.isPortalConfigExistByName(queryWrapper);
			
		} catch (PortalConfigException e) {
			log.error("Error on fetching page sequence value for database id {} ", orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching published portal by portal name ", orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

	}

	@Override
	public Boolean isPortalNameExist(Credentials credentials, String portalName, String orsId)
			throws PortalConfigException {

		Boolean flag = isDraftPortalNameExist(credentials, portalName, orsId);
		if (flag) {
			return flag;
		} else {
			flag = isPublishedPortalNameExist(credentials, portalName, orsId);
			return flag;
		}
	}

	@Override
	public Boolean isPortalNameExistById(Credentials credentials, String portalId, String portalName, String orsId)
			throws PortalConfigException {

		Boolean flag = isDraftPortalNameExistById(credentials, portalName, portalId, orsId);
		if (flag) {
			return flag;
		} else {
			flag = isPublishedPortalNameExistById(credentials, portalId, portalName, orsId);
			return flag;
		}
	}
	
	@Override
	public Boolean isDraftPortalExistById(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException {

		JsonNode portalNode = null;
		boolean flag = false;
		JdbcTemplate jdbcTemplate = null;
		try {
			
			log.info("Check is Draft Portal Exist for portal id {}, for databaseID {}, for userName {} ", portalId, orsId, credentials.getUsername());
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			
			QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
					portalId);
			
			QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
					credentials.getUsername());
			userNameFilter.setOperator(DatabaseConstants.NEGATION_LITERAL);
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalIdFilter);
			filter.add(userNameFilter);
			
			log.info("Check is Draft Portal Exist for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP, filter);
			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			portalNode = portalRepo.getPortalConfiguration(queryWrapper);
			
			flag = null != portalNode;
			
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on checking is draft portal exist for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on checking is draft portal exist for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		
		return flag;
	}
	
	@Override
	public Boolean isPublishedPortalExistById(Credentials credentials, String portalId, String orsId)
			throws PortalConfigException {

		JsonNode portalNode = null;
		boolean flag = false;
		JdbcTemplate jdbcTemplate = null;
		try {
			
			log.info("Check is Draft Portal Exist for portal id {}, for databaseID {}, for userName {} ", portalId, orsId, credentials.getUsername());
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			
			QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
					portalId);
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(portalIdFilter);
			
			log.info("Check is Draft Portal Exist for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG, filter);
			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			portalNode = portalRepo.getPortalConfiguration(queryWrapper);
			
			flag = null != portalNode;
			
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on checking is draft portal exist for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on checking is draft portal exist for portal id {} with user {} for database id {}",
					portalId, credentials.getUsername(), orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		
		return flag;
	}

	@Override
	public ArrayNode getORSRoles(Credentials credentials, String orsID) throws PortalConfigException {
		
		ArrayNode roles = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			
			log.info("Retrieve Roles for databaseID {} and version {} ", orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			roles = portalRepo.getRoles();

		} catch (Exception e) {
			log.error("Error on fetching roles for database id {}", orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG403,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG403), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return roles;
	}

	@Override
	public JsonNode savePortalRuntimeConfig(Credentials credentials, JsonNode runtimeNode, String orsId, String portalId) throws PortalConfigException {

		JsonNode versionNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			
			List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
					credentials.getUsername()));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
					PortalConfigUtil.formatDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()))));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_RUNTIME_CONFIGURATION,
					runtimeNode.toString().getBytes()));
			
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
					Long.valueOf(portalId)));
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
			queryWrapper.setSetClause(fieldMapping);
			queryWrapper.setFilter(filter);
			
			versionNode = portalRepo.updatePortalConfig(queryWrapper, Long.valueOf(portalId));
			
		} catch (PortalConfigException e) {
			log.error("Error on persisting runtime config for portalId with database id {}", portalId, orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on persisting runtime config for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return versionNode;
	}
	
	@Override
	public JsonNode saveBundles(Credentials credentials, byte[] bytes, String orsId, String portalId) throws PortalConfigException {
		JsonNode versionNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {
		DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
		jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
		portalRepo.setJdbcTemplate(jdbcTemplate);
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
				credentials.getUsername()));
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
				PortalConfigUtil.formatDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()))));
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES,
				bytes));
		
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
				Long.valueOf(portalId)));
		
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
		queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
		queryWrapper.setSetClause(fieldMapping);
		queryWrapper.setFilter(filter);
		
		versionNode = portalRepo.updatePortalConfig(queryWrapper, Long.valueOf(portalId));
		}catch (PortalConfigException e) {
			log.error("Error on persisting runtime config for portalId with database id {}", portalId, orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on persisting runtime config for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return versionNode;
	}
	
	@Override
	public JsonNode saveDraftBundles(Credentials credentials, byte[] bytes, String orsId, String portalId)
			throws PortalConfigException {
		JsonNode versionNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY, credentials.getUsername()));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
					PortalConfigUtil.formatDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()))));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES, bytes));

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));

			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
			queryWrapper.setSetClause(fieldMapping);
			queryWrapper.setFilter(filter);

			versionNode = portalRepo.updatePortalConfig(queryWrapper, Long.valueOf(portalId));
		} catch (PortalConfigException e) {
			log.error("Error on persisting runtime config for portalId with database id {}", portalId, orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on persisting runtime config for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return versionNode;
	}
	
	@Override
	public JsonNode saveErrors(Credentials credentials, byte[] bytes, String orsId, String portalId) throws PortalConfigException {
		
		JsonNode versionNode = null;
		JdbcTemplate jdbcTemplate = null;

		try {
		DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
		jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
		portalRepo.setJdbcTemplate(jdbcTemplate);
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
				credentials.getUsername()));
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
				PortalConfigUtil.formatDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()))));
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_ERROR_PROPERTIES,
				bytes));
		
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
				Long.valueOf(portalId)));
		
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
		queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
		queryWrapper.setSetClause(fieldMapping);
		queryWrapper.setFilter(filter);
		
		versionNode = portalRepo.updatePortalConfig(queryWrapper, Long.valueOf(portalId));
		
		}catch (PortalConfigException e) {
			log.error("Error on persisting errors config for portalId with database id {}", portalId, orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on persisting errors config for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		
		return versionNode;
		
	}
	
	@Override
	public JsonNode saveDraftErrors(Credentials credentials, byte[] bytes, String orsId, String portalId)
			throws PortalConfigException {

		JsonNode versionNode = null;
		JdbcTemplate jdbcTemplate = null;

		try {
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY, credentials.getUsername()));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
					PortalConfigUtil.formatDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()))));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_ERROR_PROPERTIES, bytes));

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));

			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
			queryWrapper.setSetClause(fieldMapping);
			queryWrapper.setFilter(filter);

			versionNode = portalRepo.updatePortalConfig(queryWrapper, Long.valueOf(portalId));

		} catch (PortalConfigException e) {
			log.error("Error on persisting errors config for portalId with database id {}", portalId, orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on persisting errors config for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return versionNode;

	}
	
	@Override
	public JsonNode getPortalRuntimeConfig(Credentials credentials, String orsId, String portalId)
			throws PortalConfigException {

		JsonNode runtimeConfigNode = null;
		JdbcTemplate jdbcTemplate = null;
		try {

			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_RUNTIME_CONFIGURATION);

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));

			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);

			List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
			if (!response.isEmpty() && !response.get(0).isEmpty()
					&& null != response.get(0).get(DatabaseConstants.COLUMN_RUNTIME_CONFIGURATION)) {
				String runtimeConfig = new String(
						(byte[]) response.get(0).get(DatabaseConstants.COLUMN_RUNTIME_CONFIGURATION));
				runtimeConfigNode = objectMapper.readTree(runtimeConfig);
			} else {
				log.error("Portal Not found for portal Id {} ", portalId);
				throw new ResourceNotFoundException(ErrorCodeContants.CONFIG302,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302));
			}

		} catch (PortalConfigException e) {
			log.error("Error on Fetching runtime config for portalId with database id {}", portalId, orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on Fetching runtime config for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return runtimeConfigNode;
	}

    @Override
    public JsonNode getPortalSSOConfig(Credentials credentials, String orsId, String portalId)
            throws PortalConfigException {

        JsonNode ssoConfigNode = null;
		JdbcTemplate jdbcTemplate = null;
        try {

            DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
            jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
            portalRepo.setJdbcTemplate(jdbcTemplate);

            List<String> projections = new ArrayList<String>();
            projections.add(DatabaseConstants.COLUMN_SSO_CONFIGURATION);

            List<QueryComponent> filter = new ArrayList<QueryComponent>();
            filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));

            QueryWrapper queryWrapper = new QueryWrapper();
            queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
            queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
            queryWrapper.setProjections(projections);
            queryWrapper.setFilter(filter);

            List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
            if (!response.isEmpty() && !response.get(0).isEmpty()
                    && null != response.get(0).get(DatabaseConstants.COLUMN_SSO_CONFIGURATION)) {
                String ssoConfig = new String(
                        (byte[]) response.get(0).get(DatabaseConstants.COLUMN_SSO_CONFIGURATION));
                ssoConfigNode = objectMapper.readTree(ssoConfig);
            } else {
                log.error("Portal Not found for portal Id {} ", portalId);
                throw new ResourceNotFoundException(ErrorCodeContants.CONFIG321,
                        errorCodeProperties.getProperty(ErrorCodeContants.CONFIG321), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG321));
            }

        } catch (PortalConfigException e) {
            log.error("Error on Fetching sso config for portalId with database id {}", portalId, orsId);
            throw e;
        } catch (Exception e) {
            log.error("Error on Fetching sso config for portalId with database id {}", portalId, orsId);
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG1000,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1000), e.getMessage());
        }
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
        return ssoConfigNode;
    }

    @Override
    public JsonNode savePortalSSOConfig(Credentials credentials, JsonNode ssoNode, String orsId, String portalId)
            throws PortalConfigException {

        JsonNode versionNode = null;
		JdbcTemplate jdbcTemplate = null;
        try {

            DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
            jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
            portalRepo.setJdbcTemplate(jdbcTemplate);

            List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
            fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
                    credentials.getUsername()));
            fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
                    PortalConfigUtil.formatDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()))));
            fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_SSO_CONFIGURATION,
                    ssoNode.toString().getBytes()));

            List<QueryComponent> filter = new ArrayList<QueryComponent>();
            filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
                    Long.valueOf(portalId)));

            QueryWrapper queryWrapper = new QueryWrapper();
            queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
            queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
            queryWrapper.setSetClause(fieldMapping);
            queryWrapper.setFilter(filter);

            versionNode = portalRepo.updatePortalConfig(queryWrapper, Long.valueOf(portalId));

        } catch (PortalConfigException e) {
            log.error("Error on persisting sso config for portalId with database id {}", portalId, orsId);
            throw e;
        } catch (Exception e) {
            log.error("Error on persisting sso config for portalId with database id {}", portalId, orsId);
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG1000,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1000), e.getMessage());
        }
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
        return versionNode;
    }
	
	@Override
	public Object getBundles(Credentials credentials, String orsId, String portalId) throws PortalConfigException {
		Object bundleBlob = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES);

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
			if (!response.isEmpty() && !response.get(0).isEmpty()
					&& null != response.get(0).get(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES)) {
				bundleBlob =  response.get(0).get(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES);
			} else {
				log.error("Bundles Not found for portal Id {} ", portalId);
			}
		} catch(Exception e) {
			log.error("Error on Fetching bundles for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return bundleBlob;
	}
	
	@Override
	public Object getDraftBundles(Credentials credentials, String orsId, String portalId) throws PortalConfigException {
		Object bundleBlob = null;
		JdbcTemplate jdbcTemplate = null;
		try {
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES);

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
			if (!response.isEmpty() && !response.get(0).isEmpty()
					&& null != response.get(0).get(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES)) {
				bundleBlob =  response.get(0).get(DatabaseConstants.COLUMN_BUNDLE_PROPERTIES);
			} else {
				log.error("Bundles Not found for portal Id {} ", portalId);
			}
		} catch(Exception e) {
			log.error("Error on Fetching bundles for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return bundleBlob;
	}
	
	@Override
	public Object getErrors(Credentials credentials, String orsId, String portalId) throws PortalConfigException {

		Object errorBlob = null;
		JdbcTemplate jdbcTemplate = null;

		try {

			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_ERROR_PROPERTIES);

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));

			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);

			List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
			if (!response.isEmpty() && !response.get(0).isEmpty()
					&& null != response.get(0).get(DatabaseConstants.COLUMN_ERROR_PROPERTIES)) {
				errorBlob = response.get(0).get(DatabaseConstants.COLUMN_ERROR_PROPERTIES);
			} else {
				log.error("Bundles Not found for portal Id {} ", portalId);
			}

		} catch (Exception e) {
			log.error("Error on Fetching error bundles for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return errorBlob;

	}
	
	@Override
	public Object getDraftErrors(Credentials credentials, String orsId, String portalId) throws PortalConfigException {

		Object errorBlob = null;
		JdbcTemplate jdbcTemplate = null;
		try {

			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_ERROR_PROPERTIES);

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));

			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
			queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);

			List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
			if (!response.isEmpty() && !response.get(0).isEmpty()
					&& null != response.get(0).get(DatabaseConstants.COLUMN_ERROR_PROPERTIES)) {
				errorBlob = response.get(0).get(DatabaseConstants.COLUMN_ERROR_PROPERTIES);
			} else {
				log.error("Bundles Not found for portal Id {} ", portalId);
			}

		} catch (Exception e) {
			log.error("Error on Fetching error bundles for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return errorBlob;

	}
	
	private QueryWrapper portalUpdateWrapper(Portal portal, String tableName) throws PortalConfigServiceException {
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME,
				portal.getPortalName()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_VERSION,
				portal.getVersion()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CONFIGURATION,
				portal.getMetadata()));
		
		if(null != portal.getErrorConfig()) {
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_ERROR_PROPERTIES,
					portal.getErrorConfig()));
		}
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
				portal.getLastUpdateBy()));
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
				PortalConfigUtil.formatDate(portal.getLastUpdatedDate())));
		
		if(DatabaseConstants.TABLE_PORTAL_CONFIG.equalsIgnoreCase(tableName)) {
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_STATUS,
					portal.getPortalStatus()));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION,
					portal.getMetamodelVersion()));
		}
		
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
				Long.valueOf(portal.getPortalId())));

		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(tableName);
		queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
		queryWrapper.setSetClause(fieldMapping);
		queryWrapper.setFilter(filter);
		return queryWrapper;
	}
	
	@Override
	public JsonNode updatePortalState(Credentials credentials, JsonNode portalNode)
			throws PortalConfigException {

		JsonNode versionNode = null;
		JdbcTemplate jdbcTemplate = null;
		String orsId = null, portalId = null, portalState = null, metamodelVersion = null;

		try {
			
			orsId = portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText();
			portalId = portalNode.get(PortalMetadataContants.PORTAL_ID).asText();
			portalState = portalNode.get(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE).asText();
			metamodelVersion = portalNode.get(PortalMetadataContants.PORTAL_METAMODEL_VERSION).asText();
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY, credentials.getUsername()));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
					PortalConfigUtil.formatDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()))));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_STATUS, portalState));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION, metamodelVersion));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CONFIGURATION,
					portalNode.toString().getBytes()));

			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, Long.valueOf(portalId)));

			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
			queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
			queryWrapper.setSetClause(fieldMapping);
			queryWrapper.setFilter(filter);

			versionNode = portalRepo.updatePortalConfig(queryWrapper, Long.valueOf(portalId));

		} catch (PortalConfigException e) {
			log.error("Error on updating portal state for portalId with database id {}", portalId, orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on updating portal state for portalId with database id {}", portalId, orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return versionNode;

	}
	
	@Override
	public String getPublishedPortalStatus(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException {
		
		String portalStatus = null;
		JdbcTemplate jdbcTemplate = null;
		
		try {
			
			log.info("Retrieve Portal Status for portal id {}, for databaseID {} ", portalId, orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			if (portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {
				
				tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, orsID, credentials);
				
				QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
						portalId);
				
				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(portalIdFilter);
				
				log.info("Retrieve Portal Status for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG, filter);
				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_PORTAL_STATUS);
				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
				queryWrapper.setProjections(projections);
				queryWrapper.setFilter(filter);
				
				List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
				if (null != response && !response.isEmpty()) {
					log.error("Portal Status found for portal Id {} ", portalId);
					portalStatus = (String) response.get(0).get(DatabaseConstants.COLUMN_PORTAL_STATUS);
				}
			}
			
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on fetching published portal status for portal id {} with user {} for database id {} ",
					portalId, credentials.getUsername(), orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching published portal status for portal id {} with user {} for database id {} ",
					portalId, credentials.getUsername(), orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return portalStatus;
	}
	
	@Override
	public Boolean isPortalAssociatedWithBuyerSide(Credentials credentials, String portalId, String orsId) 
			throws PortalConfigException {
		boolean portalAssoc = false;
		if (portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_ASSC)) {
			portalAssoc = true ;
		} else {
			getORSStatus(orsId, credentials);
			ClassLoader classLoader = getClass().getClassLoader();

	        try (InputStream inputStream = classLoader.getResourceAsStream(PortalServiceConstants.PORTAL_ASSC_DELTA_XML)) {

	            String changeListXml = IOUtils.toString(inputStream, StandardCharsets.UTF_8);
	            portalAssoc = applyDeltaChangeList(changeListXml, orsId, credentials);

	        } catch (IOException e) {
	        	log.error(e.getMessage());
	        	throw new PortalConfigException(ErrorCodeContants.CONFIG501,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
	        }
			
		}
		
		return portalAssoc;
	}
	
	@Override
	public void tableDefinition(String tableName, String orsId, Credentials credentials) throws PortalConfigException {
		
		DataSourceModel dataSourceModel = new DataSourceModel(orsId, credentials);
		JdbcTemplate jdbcTemplate = null;
		try {
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			List<DatabaseColumns> dbColumns = portalRepo.getTableColumns(tableName);
			List<DatabaseColumns> dbTypes = DatabaseObjectTypes.valueOf(tableName).getObjectType();
			List<DatabaseColumns> addColumns = DatabaseColumns.getAddColumns(dbColumns, dbTypes);
			if(!dbTypes.equals(dbColumns) && !addColumns.isEmpty()) {
				portalRepo.updatePortalDefinition(tableName, addColumns);
			}
		} catch (SQLException e) {
			log.error("Error on Update portal Entity Definition for tableName {}, for orsId {}", tableName, orsId,
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
	}
	
	private void getORSStatus(String sourceOrsId , Credentials credentials) throws PortalConfigException  {
		
		try {
			GetValidationStatusRequest request = new GetValidationStatusRequest();
			request.setUsername(credentials.getUsername());
			request.setSecurityPayload(credentials.getPayload());
			request.setOrsId(sourceOrsId);
			GetValidationStatusResponse response = (GetValidationStatusResponse) siperianClient.process(request);
			if (response.getValidationStatus().equals(ValidationStatusType.INVALID)
					|| response.getValidationStatus().equals(ValidationStatusType.UNKNOWN))
			{
				log.error(sourceOrsId + "is in either invalid/unknown state, can't proceed with publish portal");
				throw new PortalConfigException(ErrorCodeContants.CONFIG614,
	    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG614), sourceOrsId + "is in either invalid/unknown state");
			}
			
		} catch(Exception e)
    	{
    		log.error(e.getMessage());
    		throw new PortalConfigException(ErrorCodeContants.CONFIG613,
    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG613), e.getMessage());
    		
    	}
		
	}
	
	private boolean applyDeltaChangeList(String changeListXml, String orsId, Credentials credentials) throws PortalConfigException {
		
		try {
				 ApplyChangeListResponse response = null;
				 boolean isRollbackToLast = false;
				 boolean validateDataIntegrity = false;
				 ApplyChangeListRequest request = new ApplyChangeListRequest();
				 request.setRollbackStrategy(isRollbackToLast ? RollBackStrategy.ROLLBACK_TO_LAST_CHANGE : RollBackStrategy.FULL_ROLLBACK);
				 request.setOrsId(orsId);
				 request.setUsername(credentials.getUsername());
				 request.setSecurityPayload(credentials.getPayload());
				 request.setValidateDataIntegrity(validateDataIntegrity);
				 request.setChangeListXml(changeListXml);
				 response = (ApplyChangeListResponse) siperianClient.process(request);
				 if (response.isSuccess()) {
					 return true;
				 }
			
		}  catch(Exception e)
    	{
    		log.error(e.getMessage());
    		throw new PortalConfigException(ErrorCodeContants.CONFIG613,
    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG613), e.getMessage());
    		
    	}
		 
         return false;
	}

    @Override
    public JsonNode savePreference(String appId,  String userId, String orsId, String id,
								   JsonNode payloadNode) throws PortalConfigException {

        DataSourceModel dataSourceModel = new DataSourceModel(orsId, null);
		JdbcTemplate jdbcTemplate = null;
        try {
            jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
            portalRepo.setJdbcTemplate(jdbcTemplate);

            Boolean tableExists = portalRepo.isTableExist(DatabaseConstants.TABLE_USER_PREFERENCE);
            Boolean createRow= false;
			Boolean updateRow= false;

			JsonNode userPreferenceNode = null;

            if (!tableExists) {
                portalRepo.createPortalEntity(DatabaseConstants.TABLE_USER_PREFERENCE);
				createRow = true;
            } else {
				userPreferenceNode = getPreference(appId, userId, orsId, null);
				if (userPreferenceNode.size() != 0) {
					if ((id != null && !userPreferenceNode.has(id))) {
						throw new UserPreferenceNotFoundException(ErrorCodeContants.CONFIG320,
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG320),
								"Id {} not found in the user preference");
					} else {
						updateRow = true;
						((ObjectNode) userPreferenceNode).setAll((ObjectNode) payloadNode);
					}
				} else {
					createRow = true;
				}
            }

			List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_USER_PREFERENCE);

            if(createRow) {
                fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_APP_TYPE,
						PortalMetadataContants.USER_PREFERENCE_PORTAL_APPLICATION_TYPE));
                fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_APP_ID,
                        appId));
                fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_OWNER,
                        userId));
                fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CREATED_DATE,
                        Calendar.getInstance().getTime()));
                fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
                        Calendar.getInstance().getTime()));
                fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_USER_PREFERENCE,
                        payloadNode.toString().getBytes(StandardCharsets.UTF_8)));

                queryWrapper.setSetClause(fieldMapping);

                portalRepo.save(queryWrapper);
            }
            if(updateRow) {

				fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
						Calendar.getInstance().getTime()));
				fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_USER_PREFERENCE,
						userPreferenceNode.toString().getBytes(StandardCharsets.UTF_8)));

				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(new QueryComponent(DatabaseConstants.COLUMN_APP_ID, Long.valueOf(appId)));
				filter.add(new QueryComponent(DatabaseConstants.COLUMN_APP_TYPE, PortalMetadataContants.USER_PREFERENCE_PORTAL_APPLICATION_TYPE));
				filter.add(new QueryComponent(DatabaseConstants.COLUMN_OWNER, userId));

				queryWrapper.setSetClause(fieldMapping);
				queryWrapper.setFilter(filter);

				portalRepo.update(queryWrapper);
			}

        } catch (UserPreferenceNotFoundException e) {
			log.error("user preference update Error : Id {} not found! ", id, e.getMessage());
			throw e;
		} catch (SQLException e) {
            log.error("Error on saving user preference ",e.getMessage());
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
        } catch(Exception e) {
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
                errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
        }
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

        return payloadNode;
    }


	@Override
	public Timestamp getDBChangeTimestamp(String orsId) throws PortalConfigException {
		Timestamp timestamp = null ;
        DataSourceModel dataSourceModel = new DataSourceModel(orsId, null);
        JdbcTemplate jdbcTemplate = null;
        try {
            jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
            portalRepo.setJdbcTemplate(jdbcTemplate);
            Boolean isTableExists = portalRepo.isTableExist(DatabaseConstants.TABLE_REPOS_DB_RELEASE);
            if (isTableExists) {
				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_LAST_CHANGE_DATE);
				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_REPOS_DB_RELEASE);
				queryWrapper.setProjections(projections);
				queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);

				List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
				if (!response.isEmpty() && !response.get(0).isEmpty()
						&& null != response.get(0).get(DatabaseConstants.COLUMN_LAST_CHANGE_DATE)) {
					timestamp = PortalConfigUtil.toTimestamp(
							response.get(0).get(DatabaseConstants.COLUMN_LAST_CHANGE_DATE));
				} else {
					log.error("Resource Not found for table {}  and  column {} in for {}", DatabaseConstants.TABLE_REPOS_DB_RELEASE,
							DatabaseConstants.COLUMN_LAST_CHANGE_DATE , orsId);
				}
			}

        }catch (SQLException e) {
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
        } catch(Exception e) {
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
        }
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}

		return timestamp;
	}

	@Override
	public int getPublishedPortalVersion(Credentials credentials, String portalId, String orsID)
			throws PortalConfigException {

		int portalVersion = 0;
		JdbcTemplate jdbcTemplate = null;

		try {

			log.info("Retrieve Portal Status for portal id {}, for databaseID {} ", portalId, orsID);
			DataSourceModel dataSourceModel = new DataSourceModel(orsID, credentials);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);

			if (portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG)) {

				tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, orsID, credentials);

				QueryComponent portalIdFilter = new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
						portalId);

				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(portalIdFilter);

				log.info("Retrieve Portal Status for table {}, with filter {} ", DatabaseConstants.TABLE_PORTAL_CONFIG, filter);
				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_VERSION);
				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
				queryWrapper.setProjections(projections);
				queryWrapper.setFilter(filter);

				List<Map<String, Object>> response = portalRepo.getPortalDetails(queryWrapper);
				if (null != response && !response.isEmpty()) {
					log.error("Portal Status found for portal Id {} ", portalId);
					portalVersion = Integer.parseInt( response.get(0).get(DatabaseConstants.COLUMN_VERSION).toString());
				}
			}

		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (PortalConfigException e) {
			log.error("Error on fetching published portal status for portal id {} with user {} for database id {} ",
					portalId, credentials.getUsername(), orsID);
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching published portal status for portal id {} with user {} for database id {} ",
					portalId, credentials.getUsername(), orsID);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return portalVersion;
	}

	@Override
	public JsonNode getPreference(String appId,  String userId, String orsId, String id) throws PortalConfigException {

		DataSourceModel dataSourceModel = new DataSourceModel(orsId, null);

		JsonNode userPreferenceNode = objectMapper.createObjectNode();
		JdbcTemplate jdbcTemplate = null;
		try {
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			Boolean isTableExists = portalRepo.isTableExist(DatabaseConstants.TABLE_USER_PREFERENCE);

			if (isTableExists) {
				List<String> projections = new ArrayList<String>();
				projections.add(DatabaseConstants.COLUMN_USER_PREFERENCE);

				List<QueryComponent> filter = new ArrayList<QueryComponent>();
				filter.add(new QueryComponent(DatabaseConstants.COLUMN_APP_ID, Long.valueOf(appId)));
				filter.add(new QueryComponent(DatabaseConstants.COLUMN_APP_TYPE, PortalMetadataContants.USER_PREFERENCE_PORTAL_APPLICATION_TYPE));
				filter.add(new QueryComponent(DatabaseConstants.COLUMN_OWNER, userId));

				QueryWrapper queryWrapper = new QueryWrapper();
				queryWrapper.setTableName(DatabaseConstants.TABLE_USER_PREFERENCE);
				queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
				queryWrapper.setProjections(projections);
				queryWrapper.setFilter(filter);

				List<Map<String, Object>> response;
				response = portalRepo.getPortalDetails(queryWrapper);

				if (!response.isEmpty() && !response.get(0).isEmpty()
						&& null != response.get(0).get(DatabaseConstants.COLUMN_USER_PREFERENCE)) {

					String userPreference = new String((byte[]) response.get(0).get(DatabaseConstants.COLUMN_USER_PREFERENCE), StandardCharsets.UTF_8);
					userPreferenceNode = objectMapper.readTree(userPreference);

					if(null != id) {
						if(userPreferenceNode.has(id)) {
							JsonNode tempNode = objectMapper.createObjectNode();
							((ObjectNode) tempNode).set(id,userPreferenceNode.get(id));
							userPreferenceNode = tempNode;
						} else {
							userPreferenceNode = objectMapper.createObjectNode();
						}
					}
				}
			}

		} catch (SQLException e) {
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch(Exception e) {
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG602,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG602), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}


		return userPreferenceNode;
	}

	@Override
    public void deletePreference(String appId, String userId, String orsId,  String id)
            throws PortalConfigException {

	    JdbcTemplate jdbcTemplate = null;
	    try {

            DataSourceModel dataSourceModel = new DataSourceModel(orsId, null);
            jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
            portalRepo.setJdbcTemplate(jdbcTemplate);

            Boolean isTableExists = portalRepo.isTableExist(DatabaseConstants.TABLE_USER_PREFERENCE);

            if(isTableExists) {

                List<QueryComponent> deleteFilter = new ArrayList<QueryComponent>();
                deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_APP_ID, Long.valueOf(appId)));
                deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_APP_TYPE, PortalMetadataContants.USER_PREFERENCE_PORTAL_APPLICATION_TYPE));
                deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_OWNER, userId));

                QueryWrapper deleteQueryWrapper = new QueryWrapper();
                deleteQueryWrapper.setTableName(DatabaseConstants.TABLE_USER_PREFERENCE);
                deleteQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);
                deleteQueryWrapper.setFilter(deleteFilter);

                boolean deletePreferencesFlag = portalRepo.deletePortalConfig(deleteQueryWrapper);

                if(!deletePreferencesFlag) {
					log.error("No Portal preferences found for user {}, portal Id {} , ors {}", userId, appId, orsId);
				} else {
					log.info("Deleted Portal preferences for user {}, portal Id {} , ors {}", userId, appId, orsId);
				}
            }

        } catch (PortalConfigException e) {
            log.error("Error on deletion of portal preferences for portal id {} with user {} for database id {}",
                    appId, userId, orsId);
            throw e;
        } catch (Exception e) {
            log.error("Error on deletion of portal preferences for portal id {} with user {} for database id {}",
                    appId, userId, orsId);
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
        }
        finally {
            try {
                if(null!=jdbcTemplate)
                    jdbcTemplate.getDataSource().getConnection().close();
            } catch (SQLException throwables) {
                log.error("Error while closing jdbc connection");
            }
        }
    }

}
