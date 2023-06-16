package com.informatica.mdm.portal.metadata.repository;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.sql.DataSource;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowMapperResultSetExtractor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.model.Portal;
import com.informatica.mdm.portal.metadata.util.DatabaseColumns;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.QueryComponent;
import com.informatica.mdm.portal.metadata.util.QueryWrapper;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
public class PortalMSSqlRepoImplTest {

	@Mock
	ObjectMapper objectMapper;

	@Mock
	JdbcTemplate jdbctemplate;

	@InjectMocks
	PortalMSSqlRepoImpl portalRepo;
	
	@Mock
	DataSource datasource;
	
	@Mock
	Connection connection;
	
	@Mock
	PreparedStatement statement;
	
	@Mock
	DatabaseMetaData tableMetadata;
	
	@Mock
	ResultSet resultset;
	
	@Mock
	private Properties errorCodeProperties;
	
	String portalSampleData = "{\"portalName\":\"Supplier Portal\",\"portalId\":\"9853446\",\"isStateEnabled\":true,\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"portalName\":\"Supplier Portal\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\",\"version\":1}";

	List<Map<String, Object>> portals = null;
	
	Portal portal = null;
	
	@Before
	public void setUp() throws Exception {
		
		MockitoAnnotations.initMocks(this);
		portals = new ArrayList<Map<String,Object>>();
        Map<String, Object> portal1 = new HashMap<String, Object>();
        portal1.put(DatabaseConstants.COLUMN_PORTAL_ID, "portalID-1");
        portal1.put(DatabaseConstants.COLUMN_PORTAL_NAME, "portalName-1");
        portal1.put(DatabaseConstants.COLUMN_CREATED_BY, "createdBy-1");
        portal1.put(DatabaseConstants.COLUMN_CREATED_DATE, new Timestamp(Calendar.getInstance().getTime().getTime()));
        portal1.put(DatabaseConstants.COLUMN_LAST_UPDATED_BY, "lastUpdatedBy-1");
        portal1.put(DatabaseConstants.COLUMN_LAST_UPDATED_DATE, new Timestamp(Calendar.getInstance().getTime().getTime()));
        portal1.put(DatabaseConstants.COLUMN_CONFIGURATION, portalSampleData.getBytes());
        portal1.put(DatabaseConstants.COLUMN_VERSION, "1");
        portal1.put(DatabaseConstants.COLUMN_SSO_CONFIGURATION, null);
        portal1.put(DatabaseConstants.COLUMN_BASE_VERSION, "1");
        portal1.put(PortalMetadataContants.DATABASE_ID, "orcl-Supplier");
        portals.add(portal1);
        Map<String, Object> portal2 = new HashMap<String, Object>();
        portal2.put(DatabaseConstants.COLUMN_PORTAL_ID, "portalID-2");
        portal2.put(DatabaseConstants.COLUMN_PORTAL_NAME, "portalName-2");
        portal2.put(DatabaseConstants.COLUMN_CREATED_BY, "createdBy-2");
        portal2.put(DatabaseConstants.COLUMN_CREATED_DATE, new Timestamp(Calendar.getInstance().getTime().getTime()));
        portal2.put(DatabaseConstants.COLUMN_LAST_UPDATED_BY, "lastUpdatedBy-2");
        portal2.put(DatabaseConstants.COLUMN_LAST_UPDATED_DATE, new Timestamp(Calendar.getInstance().getTime().getTime()));
        portal2.put(DatabaseConstants.COLUMN_CONFIGURATION, portalSampleData.getBytes());
        portal2.put(DatabaseConstants.COLUMN_VERSION, "2");
        portal2.put(DatabaseConstants.COLUMN_SSO_CONFIGURATION, portalSampleData.getBytes());
        portal2.put(DatabaseConstants.COLUMN_BASE_VERSION, "1");
        portal2.put(PortalMetadataContants.DATABASE_ID, "orcl-Supplier");
        portals.add(portal2);
        
        Mockito.doNothing().when(statement).close();
		Mockito.doNothing().when(connection).close();
		Mockito.doNothing().when(resultset).close();
		Mockito.when(errorCodeProperties.getProperty(Mockito.anyString())).thenReturn("Exception Occured");
		
		portal = new Portal();
		portal.setPortalId(1L);
		portal.setPortalName("Portal Name");
		portal.setUserName("admin");
		portal.setVersion(2);
		portal.setBaseVersion(1);
		portal.setMetadata(portalSampleData.getBytes());
		portal.setCreatedBy("admin");
		portal.setLastUpdateBy("admin");
		portal.setCreatedDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()));
		portal.setLastUpdatedDate(PortalConfigUtil.formatDate(Calendar.getInstance().getTime()));
		
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

	}

	@SuppressWarnings("unchecked")
	@Test
	public void testGetDraftPortalConfiguration() throws PortalConfigException, IOException {

		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 
				"1"));
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
				"admin"));
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_VERSION, 
				"1"));
		List<Map<String, Object>> response = new ArrayList<Map<String, Object>>();
		Map<String, Object> configResponse = new HashMap<String, Object>();
		configResponse.put(DatabaseConstants.COLUMN_CONFIGURATION, portalSampleData.getBytes());
		response.add(configResponse);
		
		List<String> projections = new ArrayList<String>();
		projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		queryWrapper.setProjections(projections);
		queryWrapper.setFilter(filter);
		
		Mockito.when(jdbctemplate.query(Mockito.any(PreparedStatementCreator.class),
				Mockito.any(RowMapperResultSetExtractor.class))).thenReturn(response);
		Mockito.when(objectMapper.readTree(Mockito.anyString())).thenReturn(new ObjectMapper().readTree(portalSampleData));
		JsonNode portalConfigNode = portalRepo.getPortalConfiguration(queryWrapper);
		assertEquals("9853446", portalConfigNode.get(PortalMetadataContants.PORTAL_ID).asText());

	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testGetPublishedPortalConfiguration() throws PortalConfigException, IOException {

		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 
				"1"));
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_VERSION, 
				"1"));
		
		List<Map<String, Object>> response = new ArrayList<Map<String, Object>>();
		Map<String, Object> configResponse = new HashMap<String, Object>();
		configResponse.put(DatabaseConstants.COLUMN_CONFIGURATION, portalSampleData.getBytes());
		response.add(configResponse);
		
		List<String> projections = new ArrayList<String>();
		projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
		queryWrapper.setProjections(projections);
		queryWrapper.setFilter(filter);
		
		Mockito.when(jdbctemplate.query(Mockito.any(PreparedStatementCreator.class),
				Mockito.any(RowMapperResultSetExtractor.class))).thenReturn(response);
		Mockito.when(objectMapper.readTree(Mockito.anyString())).thenReturn(new ObjectMapper().readTree(portalSampleData));
		JsonNode portalConfigNode = portalRepo.getPortalConfiguration(queryWrapper);
		assertEquals("9853446", portalConfigNode.get(PortalMetadataContants.PORTAL_ID).asText());

	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testGetDraftPortals() throws PortalConfigException, IOException {
		
		Mockito.when(jdbctemplate.query(Mockito.any(PreparedStatementCreator.class),
				Mockito.any(RowMapperResultSetExtractor.class))).thenReturn(portals);
		JsonNode portals = portalRepo.getPortals("orcl-Supplier", "admin", true, DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		assertEquals(true, portals.get(0).get(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE).asBoolean());
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testGetPublishedPortals() throws PortalConfigException, IOException {

		Mockito.when(jdbctemplate.query(Mockito.any(PreparedStatementCreator.class),
				Mockito.any(RowMapperResultSetExtractor.class))).thenReturn(portals);
		JsonNode portals = portalRepo.getPortals("orcl-Supplier", "admin", true,
				DatabaseConstants.TABLE_PORTAL_CONFIG);
		assertEquals(false, portals.get(0).get(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE).asBoolean());
	}
	
	@Test
	public void testSavePortalConfigDraft() throws PortalConfigException, IOException, SQLException {

		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		Mockito.when(statement.getGeneratedKeys()).thenReturn(resultset);
		Mockito.when(resultset.next()).thenReturn(true);
		Mockito.when(resultset.getLong(1)).thenReturn(new Long(1));
		
		JsonNode versionNode = portalRepo.savePortalConfig(portal, DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		assertEquals(1L, versionNode.get(PortalMetadataContants.PORTAL_ID).asLong());
	}
	
	@Test
	public void testSavePortalConfigPublished() throws PortalConfigException, IOException, SQLException {

		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		Mockito.when(statement.getGeneratedKeys()).thenReturn(resultset);
		Mockito.when(resultset.next()).thenReturn(true);
		Mockito.when(resultset.getLong(1)).thenReturn(new Long(1));
		
		JsonNode versionNode = portalRepo.savePortalConfig(portal, DatabaseConstants.TABLE_PORTAL_CONFIG);
		assertEquals(1L, versionNode.get(PortalMetadataContants.PORTAL_ID).asLong());
	}
	
	@Test
	public void testUpdatePortalConfigDraft() throws PortalConfigException, IOException, SQLException {

		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		
		QueryWrapper updateWrapper = portalUpdateWrapper(portal, DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		JsonNode versionNode = portalRepo.updatePortalConfig(updateWrapper, portal.getPortalId());
		assertEquals(1L, versionNode.get(PortalMetadataContants.PORTAL_ID).asLong());
	}
	
	@Test
	public void testUpdatePortalConfigPublished() throws PortalConfigException, IOException, SQLException {

		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		
		QueryWrapper updateWrapper = portalUpdateWrapper(portal, DatabaseConstants.TABLE_PORTAL_CONFIG);
		JsonNode versionNode = portalRepo.updatePortalConfig(updateWrapper, portal.getPortalId());
		assertEquals(1L, versionNode.get(PortalMetadataContants.PORTAL_ID).asLong());
	}
	
	private QueryWrapper portalUpdateWrapper(Portal portal, String tableName) throws PortalConfigServiceException {
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME,
				portal.getPortalName()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_VERSION,
				portal.getVersion()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CONFIGURATION,
				portal.getMetadata()));
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
				portal.getLastUpdateBy()));
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
				PortalConfigUtil.formatDate(portal.getLastUpdatedDate())));
		
		
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
	
	@Test
	public void testDeletePortalConfigDraft() throws PortalConfigException, IOException, SQLException {
		
		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		Mockito.when(statement.executeUpdate()).thenReturn(1);
		
		List<QueryComponent> deleteFilter = new ArrayList<QueryComponent>();
		
		deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 1L));
		deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, "admin"));

		QueryWrapper deleteQueryWrapper = new QueryWrapper();
		deleteQueryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		deleteQueryWrapper.setFilter(deleteFilter);
		deleteQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);
		
		portalRepo.deletePortalConfig(deleteQueryWrapper);
		verify(statement, atLeastOnce()).executeUpdate();
		
	}
	
	@Test
	public void testDeletePortalConfigPublished() throws PortalConfigException, IOException, SQLException {
		
		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		Mockito.when(statement.executeUpdate()).thenReturn(1);
		
		List<QueryComponent> deleteFilter = new ArrayList<QueryComponent>();
		
		deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 1L));
		deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, "admin"));

		QueryWrapper deleteQueryWrapper = new QueryWrapper();
		deleteQueryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
		deleteQueryWrapper.setFilter(deleteFilter);
		deleteQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);
		
		portalRepo.deletePortalConfig(deleteQueryWrapper);
		verify(statement, atLeastOnce()).executeUpdate();
		
	}
	
	public void testDeletePortalConfigException() throws PortalConfigException, IOException, SQLException {
		
		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		Mockito.when(statement.executeUpdate()).thenReturn(0);
		
		List<QueryComponent> deleteFilter = new ArrayList<QueryComponent>();
		
		deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 1L));
		deleteFilter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, "admin"));

		QueryWrapper deleteQueryWrapper = new QueryWrapper();
		deleteQueryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		deleteQueryWrapper.setFilter(deleteFilter);
		deleteQueryWrapper.setQueryType(DatabaseConstants.DELETE_QUERY_TYPE);
		
		assertFalse(portalRepo.deletePortalConfig(deleteQueryWrapper));
		
	}
	
	@Test
	public void testIsTableExist() throws PortalConfigException, Exception {
		
		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.getMetaData()).thenReturn(tableMetadata);
		Mockito.doNothing().when(connection).close();
		Mockito.doNothing().when(resultset).close();
		Mockito.when(tableMetadata.getTables(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(resultset);
		Mockito.when(resultset.next()).thenReturn(true);
		assertTrue(portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG));
		
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testIsTableExistException() throws PortalConfigException, Exception {
		
		
		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.getMetaData()).thenReturn(tableMetadata);
		Mockito.doNothing().when(connection).close();
		Mockito.doNothing().when(resultset).close();
		Mockito.when(tableMetadata.getTables(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(resultset);
		Mockito.when(resultset.next()).thenThrow(SQLException.class);
		assertTrue(portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG));
		
	}
	
	@Test
	public void testIsTableExistFalse() throws PortalConfigException, Exception {
		
		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.getMetaData()).thenReturn(tableMetadata);
		Mockito.doNothing().when(connection).close();
		Mockito.doNothing().when(resultset).close();
		Mockito.when(tableMetadata.getTables(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(resultset);
		Mockito.when(resultset.next()).thenReturn(false);
		assertFalse(portalRepo.isTableExist(DatabaseConstants.TABLE_PORTAL_CONFIG));
		
	}
	
	@Test
	public void testGetRoles() throws PortalConfigException {
		
		List<Map<String, Object>> roles = new ArrayList<Map<String, Object>>();
		Map<String, Object> roles1 = new HashMap<String, Object>();
		Map<String, Object> roles2 = new HashMap<String, Object>();
		roles1.put(DatabaseConstants.COLUMN_ROLE_NAME, "DataSteward");
		roles2.put(DatabaseConstants.COLUMN_ROLE_NAME, "CommodityManager");
		roles.add(roles1);
		roles.add(roles2);
		Mockito.when(jdbctemplate.queryForList(Mockito.anyString())).thenReturn(roles);
		ArrayNode roleNode = portalRepo.getRoles();
		assertEquals(roleNode.size(), roles.size());
		
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testIsPortalConfigExistByName() throws PortalConfigException {
		
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 
				"1"));
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
				"admin"));
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME, 
				"Neemo Portal Verse"));
		
		List<String> projections = new ArrayList<String>();
		projections.add(DatabaseConstants.COLUMN_CONFIGURATION);
		
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		queryWrapper.setProjections(projections);
		queryWrapper.setFilter(filter);
		
		List<Map<String, Object>> response = new ArrayList<Map<String, Object>>();
		Map<String, Object> configResponse = new HashMap<String, Object>();
		configResponse.put(DatabaseConstants.COLUMN_CONFIGURATION, portalSampleData.getBytes());
		response.add(configResponse);
		Mockito.when(jdbctemplate.query(Mockito.any(PreparedStatementCreator.class),
				Mockito.any(RowMapperResultSetExtractor.class))).thenReturn(response);
		Boolean isPortalExist = portalRepo.isPortalConfigExistByName(queryWrapper);
		assertTrue(isPortalExist);
		
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testIsNotPortalConfigExistByName() throws PortalConfigException {
		
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID, 
				"1"));
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, 
				"admin"));
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME, 
				"Neemo Portal Verse"));
		
		List<String> projections = new ArrayList<String>();
		
		List<Map<String, Object>> response = new ArrayList<Map<String, Object>>();
		Map<String, Object> configResponse = new HashMap<String, Object>();
		configResponse.put(DatabaseConstants.COLUMN_CONFIGURATION, portalSampleData.getBytes());
		response.add(configResponse);
		
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		queryWrapper.setProjections(projections);
		queryWrapper.setFilter(filter);
		
		Mockito.when(jdbctemplate.query(Mockito.any(PreparedStatementCreator.class),
				Mockito.any(RowMapperResultSetExtractor.class))).thenReturn(response);
		Boolean isPortalExist = portalRepo.isPortalConfigExistByName(queryWrapper);
		assertTrue(isPortalExist);
		
	}
	
	@Test
	public void testUpdateRuntimeConfig() throws PortalConfigException, IOException, SQLException {

		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		
		ObjectMapper mapper = new ObjectMapper();
		ObjectNode runtimeNode = mapper.createObjectNode();
		runtimeNode.put("label", "External Url");
		runtimeNode.put("key", "ext");
		runtimeNode.put("value", "http://localhost:8080/cm/cs");
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
				"admin"));
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
				PortalConfigUtil.formatDate(Calendar.getInstance().getTime())));
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_RUNTIME_CONFIGURATION,
				runtimeNode.toString().getBytes()));
		
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
				Long.valueOf("1")));
		
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG);
		queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
		queryWrapper.setSetClause(fieldMapping);
		queryWrapper.setFilter(filter);
		JsonNode versionNode = portalRepo.updatePortalConfig(queryWrapper, portal.getPortalId());
		assertEquals(1L, versionNode.get(PortalMetadataContants.PORTAL_ID).asLong());
	}
	
	@Test
	public void testSaveData() throws PortalConfigException, IOException, SQLException {

		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME,
				portal.getPortalName()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_VERSION,
				portal.getVersion()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CONFIGURATION,
				portal.getMetadata()));
		
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
		queryWrapper.setSetClause(fieldMapping);
		
		portalRepo.save(queryWrapper);
		verify(statement, atLeastOnce()).executeUpdate();
	}
	
	@Test
	public void testUpdateData() throws PortalConfigException, IOException, SQLException {

		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.prepareStatement(Mockito.anyString())).thenReturn(statement);
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_NAME,
				portal.getPortalName()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_VERSION,
				portal.getVersion()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CONFIGURATION,
				portal.getMetadata()));
		
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
				Long.valueOf(portal.getPortalId())));

		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP);
		queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
		queryWrapper.setSetClause(fieldMapping);
		queryWrapper.setFilter(filter);
		
		portalRepo.update(queryWrapper);
		verify(statement, atLeastOnce()).executeUpdate();
	}
	
	@Test
	public void testUpdateTableDefinition() throws PortalConfigException, IOException, SQLException {
		
		String query = "ALTER TABLE C_SOLUTIONS_PORTAL_CONFIG ADD METAMODEL_VERSION nVARCHAR(50)";
		Mockito.when(jdbctemplate.getDataSource()).thenReturn(datasource);
		Mockito.when(datasource.getConnection()).thenReturn(connection);
		Mockito.when(connection.createStatement()).thenReturn(statement);
		List<DatabaseColumns> columns = new ArrayList<DatabaseColumns>();
		DatabaseColumns columnType = new DatabaseColumns(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION, "String", 50);
		columns.add(columnType);
		portalRepo.updatePortalDefinition(DatabaseConstants.TABLE_PORTAL_CONFIG, columns);
		verify(statement, atLeastOnce()).execute(query);
	}
	
}
