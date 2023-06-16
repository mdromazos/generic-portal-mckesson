package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

import java.math.BigInteger;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.sql.DataSource;

import org.apache.commons.lang3.StringUtils;
import org.emfjson.jackson.resource.JsonResourceFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import com.delos.cmx.server.admin.AdminLogin;
import com.delos.cmx.server.datalayer.repository.ReposException;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.DataSourceClient;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.config.MultiDataSource;
import com.informatica.mdm.portal.metadata.exception.DataSourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.DataSourceResolvingException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;
import com.informatica.mdm.portal.metadata.model.Portal;
import com.informatica.mdm.portal.metadata.repository.PortalOracleRepoImpl;
import com.informatica.mdm.portal.metadata.util.DatabaseColumns;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.QueryWrapper;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@PrepareForTest({HubClient.class, DataSourceClient.class, PortalConfigUtil.class, PortalMetadataContants.class})
public class PortalPersistenceServiceImplTest {
	
	@Mock
	Map<String, DataSource> portalDatasources;
	
	@Mock
	MultiDataSource multiDataSource;
	
	@Mock
	PortalOracleRepoImpl portalRepo;
	
	@Mock
	ObjectMapper objectMapper;
	
	@Mock
	HubClient hubClient;
	
	@Mock
	Map<String, DataSourceModel> datasource;
	
	@Mock
	ArrayNode roles;
	
	@Mock
	DataSourceModel dataSourceModel;
	
	@Mock
	Set<String> databases;
	
	@Mock
	AdminLogin adminLogin;
	
	@Mock
	Credentials credentials;
	
	@Mock
	JdbcTemplate jdbcTemplate;

	@Mock
	DataSource dataSource;

	@Mock
	Connection connection;
	
	@Mock
	JsonNode portalNode;
	
	@Mock
	private Properties errorCodeProperties;
	
	private JsonNode portalMockData;
	
	Map<String, Object> versions;
	
	List<Map<String, Object>> versionList;
	
	private ArrayNode portalsMockData, draftPortalsMockData, emptyArrayNode;
	
	String userPortal = "{\"portalName\":\"Supplier Portal\",\"status\":\"Running\",\"hasPublished\":false,\"portalId\":\"9853446\",\"isStateEnabled\":true,\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"portalName\":\"Supplier Portal\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\",\"version\":1, \"createdBy\":\"admin\", \"createdDate\":\"createdDate\"}";
	
	String version = StringUtils.join("{", "\"", PortalMetadataContants.PORTAL_ID, "\"", ":9853446}");
	
	String userPortalId = "{\"portalName\":\"Supplier Portal\",\"status\":\"Running\",\"hasPublished\":true,\"isStateEnabled\":true,\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"portalName\":\"Supplier Portal\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\",\"version\":1}";

	String userPreference = "{\r\n\t\"a60020774f1a432eafaa8f7d9e6ccdc2\": {\r\n\t\t\"PREFERENCE_TYPE\": \"WizardCompletedSteps\",\r\n\t\t\"USER_PREFERENCE\": {\r\n\t\t\t\"WizardId\": \"876\",\r\n\t\t\t\"completedSteps\": [\r\n\t\t\t\t123,\r\n\t\t\t\t456,\r\n\t\t\t\t789\r\n\t\t\t]\r\n\t\t}\r\n\t}\r\n}";

	String userPreferencePayload = "{\r\n\t\"a60020774f1a432eafaa8f7d9e6fgfdgfdccdc2\": {\r\n\t\t\"PREFERENCE_TYPE\": \"WizardCompletedSteps\",\r\n\t\t\"USER_PREFERENCE\": {\r\n\t\t\t\"WizardId\": \"753\",\r\n\t\t\t\"completedSteps\": [\r\n\t\t\t\t859,\r\n\t\t\t\t369,\r\n\t\t\t\t147\r\n\t\t\t]\r\n\t\t}\r\n\t}\r\n}";

	JsonNode userPortalNode, userPortalNodeId, versionNode, userPreferenceNode, userPreferencePayloadNode;
	ObjectNode portalObjectNode;
	
	@InjectMocks
	PortalPersistenceServiceImpl portalPersistenceImpl;
	
	List<Object> parameters = null;
	
	@Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
		
        ReflectionTestUtils.setField(portalPersistenceImpl, "metamodelVersion", "1.0.1");
		  datasource = new HashMap<String, DataSourceModel>();
		  datasource.put("supplier", new DataSourceModel("supplier", credentials));
		  datasource.put("cmx_system", new DataSourceModel("supplier", credentials));
		  
		  roles = new ObjectMapper().createArrayNode();
		  
		  ObjectNode roleOne = new ObjectMapper().createObjectNode();
		  roleOne.put("roleName", "DataSteward");
		  ObjectNode roleTwo = new ObjectMapper().createObjectNode();
		  roleTwo.put("roleName", "CommodityManager");
		  
		  roles.add(roleOne);
		  roles.add(roleTwo);
		  
		  
		  JSONObject portalData = new JSONObject();
		  portalData.put(PortalMetadataContants.PORTAL_ID, "uuid");
		  portalData.put(PortalMetadataContants.PORTAL_NAME, "config_portal_1");
		  portalData.put(PortalMetadataContants.DATABASE, datasource);
		  portalData.put(PortalMetadataContants.DATABASE_ID, "supplier1");
		  portalData.put(PortalMetadataContants.CONFIGURATION, userPortalNode);
		  portalData.put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, "1.0.1");
		  portalData.put(PortalMetadataContants.PORTAL_VERSION, 1);
		  JsonResourceFactory factory = new JsonResourceFactory(new ObjectMapper());
	      ObjectMapper mapper = factory.getMapper();
		  portalMockData = mapper.valueToTree(portalData.toString());
		  
		  userPortalNode = mapper.readTree(userPortal);
		  
		  ObjectNode portalData2 = new ObjectMapper().createObjectNode();
		  draftPortalsMockData = new ObjectMapper().createArrayNode();
		  portalData2.put(PortalMetadataContants.PORTAL_ID, "uuid2");
		  portalData2.put(PortalMetadataContants.PORTAL_NAME, "config_portal_2");
		  portalData2.putPOJO(PortalMetadataContants.DATABASE, datasource);
		  portalData2.put(PortalMetadataContants.DATABASE_ID, "supplier2");
		  portalData2.put(PortalMetadataContants.LAST_UPDATED_DATE, "23 Jan 2020 16:35:49");
		  portalData2.put(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE, false);
		  portalData2.putObject(PortalMetadataContants.CONFIGURATION).setAll((ObjectNode) userPortalNode);
		  portalData2.put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, "1.0.1");
		  portalData2.put(PortalMetadataContants.PORTAL_VERSION, 1);
		  draftPortalsMockData.add(portalData2);
		  ObjectNode portalData1 = new ObjectMapper().createObjectNode();
		  portalData1.put(PortalMetadataContants.PORTAL_ID, "uuid1");
		  portalData1.put(PortalMetadataContants.PORTAL_NAME, "config_portal_1");
		  portalData1.putPOJO(PortalMetadataContants.DATABASE, datasource);
		  portalData1.put(PortalMetadataContants.DATABASE_ID, "supplier1");
		  portalData1.put(PortalMetadataContants.LAST_UPDATED_DATE, "23 Jan 2020 16:34:21");
		  portalData1.put(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE, true);
		  portalData1.putObject(PortalMetadataContants.CONFIGURATION).setAll((ObjectNode) userPortalNode);
		  portalData1.put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, "1.0.1");
		  portalData1.put(PortalMetadataContants.PORTAL_VERSION, 1);
		  ObjectNode portalData3 = new ObjectMapper().createObjectNode();
		  portalData3.put(PortalMetadataContants.PORTAL_ID, "uuid3");
		  portalData3.put(PortalMetadataContants.PORTAL_NAME, "config_portal_3");
		  portalData3.putPOJO(PortalMetadataContants.DATABASE, datasource);
		  portalData3.put(PortalMetadataContants.DATABASE_ID, "supplier1");
		  portalData3.put(PortalMetadataContants.LAST_UPDATED_DATE, "23 Jan 2020 16:35:59");
		  portalData3.put(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE, false);
		  portalData3.putObject(PortalMetadataContants.CONFIGURATION).setAll((ObjectNode) userPortalNode);
		  portalData3.put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, "1.0.1");
		  portalData3.put(PortalMetadataContants.PORTAL_VERSION, 1);
		  draftPortalsMockData.add(portalData1);
		  draftPortalsMockData.add(portalData3);
		  
		  JSONArray portalArray = new JSONArray();
		  portalArray.put(portalData);
		  portalsMockData = mapper.valueToTree(portalArray.toList());
		  ((ObjectNode) userPortalNode).put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, "1.0.1");
		  ObjectNode genSettings = ((ObjectNode) userPortalNode).putObject(PortalMetadataContants.GENERAL_SETTINGS);
		  genSettings.put(PortalMetadataContants.PORTAL_NAME, "Supplier Portal");
		  genSettings.put(PortalMetadataContants.DATABASE_ID, "orcl-localhost-Supplier");
		  genSettings.put(PortalMetadataContants.PORTAL_TITLE, "Supplier Portal");
		  userPortalNodeId = mapper.readTree(userPortalId);
		  ObjectNode userGenSettings = ((ObjectNode) userPortalNodeId).putObject(PortalMetadataContants.GENERAL_SETTINGS);
		  userGenSettings.put(PortalMetadataContants.PORTAL_NAME, "Supplier Portal");
		  userGenSettings.put(PortalMetadataContants.DATABASE_ID, "orcl-localhost-Supplier");
		  userGenSettings.put(PortalMetadataContants.PORTAL_TITLE, "Supplier Portal");
		  versionNode = mapper.readTree(version);
		  emptyArrayNode = mapper.createArrayNode();
		  portalObjectNode = mapper.createObjectNode();
		  versions = new HashMap<String, Object>();
		  versionList = new ArrayList<Map<String,Object>>();

		  userPreferenceNode = mapper.readTree(userPreference);
		  userPreferencePayloadNode = mapper.readTree(userPreferencePayload);
		  
		  parameters = new ArrayList<Object>();
		  Mockito.when(errorCodeProperties.getProperty(Mockito.anyString())).thenReturn("Exception Occured");

		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
    }

	@Test
	public void testGetPortals() throws Exception {
		
		Mockito.when(objectMapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(objectMapper.createArrayNode()).thenAnswer(new Answer<ArrayNode>() {
			public ArrayNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createArrayNode();
		     }
		});
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(DataSourceClient.class);
		PowerMockito.when(HubClient.getInstance()).thenReturn(hubClient);
		PowerMockito.when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		PowerMockito.when(
				DataSourceClient.getOrsDataSources(Mockito.any(DataSourceModel.class), Mockito.any(AdminLogin.class)))
				.thenReturn(datasource);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class)))
				.thenReturn(jdbcTemplate);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		//Mockito.when(objectMapper.createArrayNode()).thenReturn(emptyArrayNode);
		//Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(portalRepo.getPortals(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(),
				Mockito.anyString())).thenReturn(portalsMockData);
		Mockito.when(portalRepo.getPortals(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(),
				Mockito.anyString())).thenReturn(draftPortalsMockData);
		assertNotNull(portalPersistenceImpl.getPortals(credentials, false));
		
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testGetPortalsConfigException() throws Exception {
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(DataSourceClient.class);
		PowerMockito.when(HubClient.getInstance()).thenReturn(hubClient);
		PowerMockito.when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		PowerMockito.when(DataSourceClient.getOrsDataSources(Mockito.any(DataSourceModel.class), Mockito.any(AdminLogin.class))).thenReturn(datasource);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.getPortals(credentials, false);
	}
	
	@Test
	public void testGetPortalsWithMerge() throws Exception {

		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(DataSourceClient.class);
		PowerMockito.when(HubClient.getInstance()).thenReturn(hubClient);
		PowerMockito.when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		PowerMockito.when(
				DataSourceClient.getOrsDataSources(Mockito.any(DataSourceModel.class), Mockito.any(AdminLogin.class)))
				.thenReturn(datasource);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class)))
				.thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(objectMapper.createArrayNode()).thenReturn(emptyArrayNode);
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalRepo.getPortals(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(),
				Mockito.anyString())).thenReturn(portalsMockData);
		Mockito.when(portalRepo.getPortals(Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(),
				Mockito.anyString())).thenReturn(draftPortalsMockData);
		assertNotNull(portalPersistenceImpl.getPortals(credentials, false));

	}
	
	@Test
	public void testGetPortalsWithNoTable() throws Exception {

		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(DataSourceClient.class);
		PowerMockito.when(HubClient.getInstance()).thenReturn(hubClient);
		PowerMockito.when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		PowerMockito.when(
				DataSourceClient.getOrsDataSources(Mockito.any(DataSourceModel.class), Mockito.any(AdminLogin.class)))
				.thenReturn(datasource);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class)))
				.thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.when(objectMapper.createArrayNode()).thenReturn(emptyArrayNode);
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalRepo.getPortals("localhost-ORCL-Supplier", "admin", false,
				DatabaseConstants.TABLE_PORTAL_CONFIG)).thenReturn(portalsMockData);
		Mockito.when(portalRepo.getPortals("localhost-ORCL-Supplier", "admin", false,
				DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP)).thenReturn(draftPortalsMockData);
		assertNotNull(portalPersistenceImpl.getPortals(credentials, false));

	}

	@Test
	public void testPublishPortalConfig() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		versions.put(DatabaseConstants.COLUMN_VERSION, new BigInteger("1"));
		versions.put(DatabaseConstants.COLUMN_BASE_VERSION, new BigInteger("1"));
		versionList.add(versions);
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong())).thenReturn(versionNode);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		portalPersistenceImpl.publishPortalConfig(credentials, userPortalNode);
		verify(portalRepo, atLeastOnce()).updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong());
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testPublishPortalConfigException() throws Exception {
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(DataSourceClient.class);
		PowerMockito.when(HubClient.getInstance()).thenReturn(hubClient);
		PowerMockito.when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		PowerMockito.when(DataSourceClient.getOrsDataSources(Mockito.any(DataSourceModel.class), Mockito.any(AdminLogin.class))).thenReturn(datasource);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.publishPortalConfig(credentials, userPortalNode);
	}
	
	@Test
	public void testPublishPortalWithTableCreation() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		versions.put(DatabaseConstants.COLUMN_VERSION, new BigInteger("1"));
		versions.put(DatabaseConstants.COLUMN_BASE_VERSION, new BigInteger("1"));
		versionList.add(versions);
		Mockito.when(PortalConfigUtil.formatDate(Mockito.any(Date.class))).thenReturn("portalDate");
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.savePortalConfig(Mockito.any(Portal.class), Mockito.anyString())).thenReturn(versionNode);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		portalPersistenceImpl.publishPortalConfig(credentials, userPortalNode);
		verify(portalRepo, atLeastOnce()).updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong());
	}
	
	@Test
	public void testPublishPortalWithNoBaseVersion() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		Mockito.when(PortalConfigUtil.formatDate(Mockito.any(Date.class))).thenReturn("portalDate");
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.savePortalConfig(Mockito.any(Portal.class), Mockito.anyString())).thenReturn(versionNode);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		portalPersistenceImpl.publishPortalConfig(credentials, userPortalNode);
		verify(portalRepo, atLeastOnce()).savePortalConfig(Mockito.any(Portal.class), Mockito.anyString());
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testPublishPortalConfigConflict1() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		versions.put(DatabaseConstants.COLUMN_VERSION, new BigInteger("2"));
		versions.put(DatabaseConstants.COLUMN_BASE_VERSION, new BigInteger("1"));
		versionList.add(versions);
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong())).thenReturn(versionNode);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		portalPersistenceImpl.publishPortalConfig(credentials, userPortalNode);
		verify(portalRepo, atLeastOnce()).updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong());
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testPublishPortalConfigConflict2() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		versions.put(DatabaseConstants.COLUMN_VERSION, new BigInteger("1"));
		versions.put(DatabaseConstants.COLUMN_BASE_VERSION, new BigInteger("2"));
		versionList.add(versions);
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.savePortalConfig(Mockito.any(Portal.class), Mockito.anyString())).thenReturn(versionNode);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		portalPersistenceImpl.publishPortalConfig(credentials, userPortalNode);
	}
	
	@Test
	public void testPublishPortalWithNewEntry() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		Mockito.when(PortalConfigUtil.formatDate(Mockito.any(Date.class))).thenReturn("portalDate");
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.savePortalConfig(Mockito.any(Portal.class), Mockito.anyString())).thenReturn(versionNode);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		portalPersistenceImpl.publishPortalConfig(credentials, userPortalNode);
		verify(portalRepo, atLeastOnce()).savePortalConfig(Mockito.any(Portal.class), Mockito.anyString());
	}

	@Test
	public void testGetDatabases() throws AccessException, ReposException, SQLException, DataSourceNotFoundException, DataSourceResolvingException, PortalConfigException {
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(DataSourceClient.class);
		@SuppressWarnings("unchecked")
		Map<String, DataSourceModel> datasourceMock = Mockito.mock(Map.class);
		PowerMockito.when(HubClient.getInstance()).thenReturn(hubClient);
		PowerMockito.when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		PowerMockito.when(DataSourceClient.getOrsDataSources(Mockito.any(DataSourceModel.class), Mockito.any(AdminLogin.class))).thenReturn(datasource);
		Mockito.when(datasourceMock.get(Mockito.anyString())).thenReturn(dataSourceModel);
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(objectMapper.createArrayNode()).thenReturn(emptyArrayNode);
		Mockito.when(dataSourceModel.getOrsID()).thenReturn("orsID");
		Mockito.when(dataSourceModel.getDatabaseName()).thenReturn("orsname");
		Mockito.when(objectMapper.valueToTree(Mockito.any(List.class))).thenReturn(portalMockData);
		assertNotNull(portalPersistenceImpl.getDatabases(credentials));
	}
	
	@Test
	public void testGetRoles() throws AccessException, ReposException, SQLException, DataSourceNotFoundException, DataSourceResolvingException, PortalConfigException {
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(DataSourceClient.class);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(portalRepo.getRoles()).thenReturn(roles);
		assertEquals(portalPersistenceImpl.getORSRoles(credentials, "orcl-Supplier").size(), roles.size());
	}
	
	@Test
	public void testGetPublishedPortalConfig() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(portalMockData);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		assertNotNull(portalPersistenceImpl.getPublishedPortalConfig(credentials, "portalID", "orsID"));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testGetPublishedPortalConfigException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.getPublishedPortalConfig(credentials, "portalID", "orsID");
	}
	
	@Test
	public void testGetPublishedPortalConfigWithNoTable() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(portalMockData);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		assertNull(portalPersistenceImpl.getPublishedPortalConfig(credentials, "portalID", "orsID"));
	}
	
	@Test
	public void testGetPublishedPortalConfigByVersion() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(portalMockData);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		assertNotNull(portalPersistenceImpl.getPublishedPortalConfigByVersion(credentials, "portalID", "orsID", 1));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testGetPublishedPortalConfigByVersionException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.getPublishedPortalConfigByVersion(credentials, "portalID", "orsID", 1);
	}
	
	@Test(expected = ResourceNotFoundException.class)
	public void testGetPublishedPortalConfigByVersionWithNoTable() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(portalMockData);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		assertNull(portalPersistenceImpl.getPublishedPortalConfigByVersion(credentials, "portalID", "orsID", 1));
	}
	
	@Test
	public void testDraftPortalConfig() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		Mockito.when(PortalConfigUtil.formatDate(Mockito.any(Date.class))).thenReturn("portalDate");
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalRepo.savePortalConfig(Mockito.any(Portal.class), Mockito.anyString())).thenReturn(versionNode);
		portalPersistenceImpl.savePortalConfigInDraft(credentials, userPortalNode);
		verify(portalRepo, atLeastOnce()).savePortalConfig(Mockito.any(Portal.class), Mockito.anyString());
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testDraftPortalConfigPortalConfigException() throws Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		Mockito.when(PortalConfigUtil.formatDate(Mockito.any(Date.class))).thenReturn("portalDate");
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.savePortalConfigInDraft(credentials, userPortalNode);
	}
	
	@Test
	public void testDraftPortalConfigUpdate() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		versions.put(DatabaseConstants.COLUMN_VERSION, new BigInteger("1"));
		versions.put(DatabaseConstants.COLUMN_BASE_VERSION, new BigInteger("1"));
		versionList.add(versions);
		Mockito.when(PortalConfigUtil.formatDate(Mockito.any(Date.class))).thenReturn("portalDate");
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalRepo.updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong())).thenReturn(versionNode);
		portalPersistenceImpl.savePortalConfigInDraft(credentials, userPortalNode);
		verify(portalRepo, atLeastOnce()).updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong());
	}
	
	@Test
	public void testSavePortalConfigWithTableCreation() throws PortalConfigException, Exception {
		PowerMockito.mockStatic(PortalConfigUtil.class);
		Mockito.when(PortalConfigUtil.formatDate(Mockito.any(Date.class))).thenReturn("portalDate");
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalNode.toString()).thenReturn(portalMockData.toString());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.doNothing().when(portalRepo).createPortalEntity(Mockito.anyString());
		Mockito.when(portalNode.isMissingNode()).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("portalUsername");
		Mockito.when(portalRepo.getPortalDetails(Mockito.any())).thenReturn(versionList);
		Mockito.when(portalRepo.savePortalConfig(Mockito.any(Portal.class), Mockito.anyString())).thenReturn(versionNode);
		portalPersistenceImpl.savePortalConfigInDraft(credentials, userPortalNodeId);
		verify(portalRepo, atLeastOnce()).savePortalConfig(Mockito.any(Portal.class), Mockito.anyString());
	}
	
	@Test
	public void testGetPortalConfigDraftByVersion() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(userPortalNodeId);
		Mockito.when(credentials.getUsername()).thenReturn("username");
		assertNotNull(portalPersistenceImpl.getPortalConfigDraftByVersion(credentials, "portalID", "orsID", 1));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testGetPortalConfigDraftByVersionException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.getPortalConfigDraftByVersion(credentials, "portalID", "orsID", 1);
	}
	
	@Test
	public void testGetPortalConfigDraft() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(userPortalNodeId);
		assertNotNull(portalPersistenceImpl.getPortalConfigDraft(credentials, "portalID", "orsID"));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testGetPortalConfigDraftException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.getPortalConfigDraft(credentials, "portalID", "orsID");
	}
	
	@Test
	public void testDeletePortalConfigDraft() throws Exception {
		
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		
		Mockito.when(objectMapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
				return new ObjectMapper().createObjectNode();
			}
		});
		
		((ObjectNode) versionNode).put(PortalMetadataContants.PORTAL_VERSION, 1L);
		
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(versionNode);
		portalPersistenceImpl.deleteDraftPortalConfig(credentials, "1", "orsID");
		verify(portalRepo, atLeastOnce()).deletePortalConfig(Mockito.any(QueryWrapper.class));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testDeletePortalConfigDraftException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.deleteDraftPortalConfig(credentials, "1", "orsID");
	}
	
	@Test
	public void testDeletePortalConfigPublished() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.deletePortalConfig(Mockito.any(QueryWrapper.class))).thenReturn(true);
		portalPersistenceImpl.deletePublishedPortalConfig(credentials, "1", "orsID");
		verify(portalRepo, atLeastOnce()).deletePortalConfig(Mockito.any(QueryWrapper.class));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testDeletePortalConfigPublishedException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.deletePublishedPortalConfig(credentials, "1", "orsID");
	}
	
	@Test
	public void testIsPublishedPortalNameExistById() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		parameters.add("1");
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isPublishedPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testIsPublishedPortalNameExistByIdException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.isPublishedPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier");
	}
	
	@Test
	public void testIsPublishedPortalNameExistByIdWithNoTable() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		parameters.add("1");
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isPublishedPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testIsDraftPortalNameExistById() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		parameters.add("admin");
		parameters.add("1");
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isDraftPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testIsDraftPortalNameExistByIdException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.isDraftPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier");
	}
	
	@Test
	public void testIsDraftPortalNameExistByIdWithNoTable() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		parameters.add("admin");
		parameters.add("1");
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isDraftPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testIsPublishedPortalNameExist() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isPublishedPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testIsPublishedPortalNameExistException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.isPublishedPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier");
	}
	
	@Test
	public void testIsPublishedPortalNameExistWithNoTable() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isPublishedPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testIsDraftPortalNameExist() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		parameters.add("admin");
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isDraftPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testIsDraftPortalNameExistException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.isDraftPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier");
	}
	
	@Test
	public void testIsDraftPortalNameExistWithNoTable() throws Exception {
		parameters.add("Freddy Keuger Portal".toUpperCase());
		parameters.add("admin");
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		Mockito.when(portalRepo.isPortalConfigExistByName(Mockito.any(QueryWrapper.class))).thenReturn(false);
		assertFalse(portalPersistenceImpl.isDraftPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testGetPageSequenceNextValue() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getSequenceNextValue()).thenReturn(1L);
		assertNotNull(portalPersistenceImpl.getSequence(credentials, "orcl-Supplier"));
	}
	
	@Test(expected = DataSourceNotFoundException.class)
	public void testGetPageSequenceNextValueException() throws Exception {
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenThrow(DataSourceNotFoundException.class);
		portalPersistenceImpl.getSequence(credentials, "orcl-Supplier");
	}
	
	@Test
	public void testSaveRuntimeConfig() throws PortalConfigException, SQLException {
		
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		ObjectMapper mapper = new ObjectMapper();
		ObjectNode runtimeNode = mapper.createObjectNode();
		runtimeNode.put("label", "External Url");
		runtimeNode.put("key", "ext");
		runtimeNode.put("value", "http://localhost:8080/cm/cs");
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(portalRepo.updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong())).thenReturn(versionNode);
		JsonNode versionNode = portalPersistenceImpl.savePortalRuntimeConfig(credentials, runtimeNode, "orcl-Supplier", "9853446");
		assertEquals("9853446", versionNode.get(PortalMetadataContants.PORTAL_ID).asText());
	}
	
	@Test
	public void testGetPublishedPortalStatus() throws Exception {
		
		Map<String, Object> data = new HashMap<String, Object>();
		data.put(DatabaseConstants.COLUMN_PORTAL_STATUS, PortalMetadataContants.PORTAL_STATUS_START);
		versionList.add(data);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalDetails(Mockito.any(QueryWrapper.class))).thenReturn(versionList);
		assertEquals(PortalMetadataContants.PORTAL_STATUS_START, portalPersistenceImpl.getPublishedPortalStatus(credentials, "portalID", "orsID"));
	}
	
	@Test
	public void testUpdatePublishedPortalStatus() throws Exception {
		
		Map<String, Object> data = new HashMap<String, Object>();
		data.put(DatabaseConstants.COLUMN_PORTAL_STATUS, PortalMetadataContants.PORTAL_STATUS_START);
		data.put(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION, "1.0.1");
		((ObjectNode) userPortalNodeId).put(PortalMetadataContants.PORTAL_ID, 1L);
		((ObjectNode) userPortalNodeId).put(PortalMetadataContants.PORTAL_METAMODEL_VERSION, "1.0.1");
		versionList.add(data);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalDetails(Mockito.any(QueryWrapper.class))).thenReturn(versionList);
		portalPersistenceImpl.updatePortalState(credentials, userPortalNodeId);
		verify(portalRepo, atLeastOnce()).updatePortalConfig(Mockito.any(QueryWrapper.class), Mockito.anyLong());
	}
	
	@Test
	public void testIsDraftPortalExistById() throws Exception {
		
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(portalNode);
		assertTrue(portalPersistenceImpl.isDraftPortalExistById(credentials, "portalID", "orsID"));
	}
	
	@Test
	public void testIsPublishedPortalExistById() throws Exception {
		
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getPortalConfiguration(Mockito.any(QueryWrapper.class))).thenReturn(portalNode);
		assertTrue(portalPersistenceImpl.isPublishedPortalExistById(credentials, "portalID", "orsID"));
	}
	
	@Test
	public void testTableDefinition() throws Exception {
		
		List<DatabaseColumns> addColumns = new ArrayList<DatabaseColumns>();
		DatabaseColumns columnMetaVersion = new DatabaseColumns(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION, "String", 50);
        DatabaseColumns columnSSOConfiguration = new DatabaseColumns(DatabaseConstants.COLUMN_SSO_CONFIGURATION, "Blob", null);
		addColumns.add(columnMetaVersion);
        addColumns.add(columnSSOConfiguration);
		
		List<DatabaseColumns> dbTypes = new ArrayList<DatabaseColumns>();
		DatabaseColumns portalId = new DatabaseColumns(DatabaseConstants.COLUMN_PORTAL_ID, "Number", 20);
		dbTypes.add(portalId);
		
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.getTableColumns(DatabaseConstants.TABLE_PORTAL_CONFIG)).thenReturn(dbTypes);
		portalPersistenceImpl.tableDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, "orcl-Supplier", credentials);
		verify(portalRepo, atLeastOnce()).updatePortalDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, addColumns);
	}

    @Test
    public void testSavePreferenceWithCreateRow() throws Exception {

		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		portalPersistenceImpl.savePreference("4", "abc@mail.com", "localhost-orcl-c360", null, userPreferencePayloadNode);
		verify(portalRepo, atLeastOnce()).createPortalEntity(DatabaseConstants.TABLE_USER_PREFERENCE);
		verify(portalRepo, atLeastOnce()).save(Mockito.any(QueryWrapper.class));
    }

	@Test
	public void testSavePreferenceWithUpdateRow() throws Exception {

		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(objectMapper.readTree(Mockito.anyString())).thenReturn(userPreferenceNode);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		versions.put(DatabaseConstants.COLUMN_USER_PREFERENCE,userPreference.getBytes());
		versionList.add(versions);
		Mockito.when(portalRepo.getPortalDetails(Mockito.any(QueryWrapper.class))).thenReturn(versionList);
		portalPersistenceImpl.savePreference("4", "abc@mail.com", "localhost-orcl-c360", null, userPreferencePayloadNode);
		verify(portalRepo, atLeastOnce()).update(Mockito.any(QueryWrapper.class));
	}

	@Test
	public void testGetPreferenceWithTableExists() throws Exception {

		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(objectMapper.readTree(Mockito.anyString())).thenReturn(userPreferenceNode);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(true);
		versions.put(DatabaseConstants.COLUMN_USER_PREFERENCE,userPreference.getBytes());
		versionList.add(versions);
		Mockito.when(portalRepo.getPortalDetails(Mockito.any(QueryWrapper.class))).thenReturn(versionList);
		//without id
		assertEquals(userPreferenceNode, portalPersistenceImpl.getPreference("4", "abc@mail.com", "localhost-orcl-c360", null));
		verify(portalRepo, atLeastOnce()).isTableExist(DatabaseConstants.TABLE_USER_PREFERENCE);
		verify(portalRepo, atLeastOnce()).getPortalDetails(Mockito.any(QueryWrapper.class));
		//with id
		assertEquals(userPreferenceNode, portalPersistenceImpl.getPreference("4", "abc@mail.com", "localhost-orcl-c360", "a60020774f1a432eafaa8f7d9e6ccdc2"));
	}

	@Test
	public void testGetPreferenceWithoutTableExists() throws Exception {

		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.when(objectMapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalRepo.isTableExist(Mockito.anyString())).thenReturn(false);
		assertEquals(portalObjectNode, portalPersistenceImpl.getPreference("4", "abc@mail.com", "localhost-orcl-c360", null));
		verify(portalRepo, atLeastOnce()).isTableExist(DatabaseConstants.TABLE_USER_PREFERENCE);
	}

}
