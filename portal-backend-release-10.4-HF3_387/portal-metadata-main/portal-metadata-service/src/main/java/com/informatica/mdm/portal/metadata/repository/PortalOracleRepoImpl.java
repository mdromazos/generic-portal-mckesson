package com.informatica.mdm.portal.metadata.repository;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.RowMapperResultSetExtractor;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.model.Portal;
import com.informatica.mdm.portal.metadata.util.DatabaseColumns;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.informatica.mdm.portal.metadata.util.QueryComponent;
import com.informatica.mdm.portal.metadata.util.QueryWrapper;


@Repository
@ConditionalOnProperty(name = "cmx.server.masterdatabase.type", havingValue = "ORACLE")
public class PortalOracleRepoImpl implements PortalRepo{

	private static final Logger log = LoggerFactory.getLogger(PortalOracleRepoImpl.class);
	
	public static final String INSERT_QUERY = "INSERT INTO $TABLE_NAME$ ($SETTERS$) VALUES ($PARAMS$)";
	public static final String UPDATE_QUERY = "UPDATE $TABLE_NAME$ SET $SETTERS$ $FILTER$";
	public static final String DELETE_QUERY = "DELETE FROM $TABLE_NAME$ $FILTER$";
	public static final String SELECT_QUERY = "SELECT $PROJECTIONS$ FROM $TABLE_NAME$ $FILTER$ $SORT$";
	private static final String QUERY_GET_NEXT_SEQ = "SELECT KEY_COUNT FROM C_REPOS_SEQUENCE "
            +"WHERE SEQUENCE_NAME='C_REPOS_ID_SEQ' FOR UPDATE";
	
	public static final String ALTER_QUERY = "ALTER TABLE $TABLE_NAME$ ADD $COLUMNS$";
	
	private JdbcTemplate jdbcTemplate;
	
	@Autowired
	private ObjectMapper objectMapper;
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	@Override
	public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public List<Map<String, Object>> getPortalDetails(QueryWrapper queryWrapper) throws PortalConfigException {

		List<Map<String, Object>> response = null;

		queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
		queryWrapper.setIntialQuery(SELECT_QUERY);
		String query = constructQuery(queryWrapper);
		
		log.info("Retrieve Action for query {} ", query);
		
		try {

			response = jdbcTemplate.query(new PreparedStatementCreator() {

				@Override
				public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
					PreparedStatement statement = connection.prepareStatement(query);
					log.info("Retrieve Action Statement prepare for filter {} ", queryWrapper.getFilter());
					statement = prepareStatement(queryWrapper.getFilter(), statement);
					return statement;
				}
			}, new RowMapperResultSetExtractor<>(getColumnMapRowMapper()));

		} catch (Exception e) {
			log.error("Error on retrive of portal config for projections {}, with filter {}, with sort {} ",
					queryWrapper.getProjections(), queryWrapper.getFilter(), queryWrapper.getSortFields(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG302,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG302), e.getMessage());
		}

		return response;
	}

	@Override
	public JsonNode getPortalConfiguration(QueryWrapper queryWrapper) throws PortalConfigException {

		log.info("Retrieve Portal Configuration for table {}, with filter {} ", queryWrapper.getTableName(),
				queryWrapper.getFilter());

		List<Map<String, Object>> response = getPortalDetails(queryWrapper);
		log.info("Retrieve Portal Configuration response {} ", response);
		if (response.isEmpty()) {
			return null;
		}
		String portalConfig = new String((byte[]) response.get(0).get(DatabaseConstants.COLUMN_CONFIGURATION), StandardCharsets.UTF_8);
		JsonNode portalConfigNode = null;
		try {
			portalConfigNode = objectMapper.readTree(portalConfig);
		} catch (IOException e) {
			log.error("Error on retrieving portal config for table {}, with where clause {} ",
					queryWrapper.getTableName(), queryWrapper.getFilter(), e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		return portalConfigNode;
	}
	
	@Override
	public ArrayNode getPortals(String orsID, String username, Boolean isBlob, String tableName) throws PortalConfigException {

		ArrayNode portalArray = objectMapper.createArrayNode();
		
		try {
			
			log.info("Retrieve Available Portals for databaseId {}, username {}, with blob {} and tableName {} ", orsID,
					username, isBlob, tableName);
			boolean draftIndicator = tableName.equals(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP) ? true : false;
			Map<String, String> fieldMapping = new HashMap<String, String>();
			fieldMapping.put(DatabaseConstants.COLUMN_PORTAL_ID, PortalMetadataContants.PORTAL_ID);
			fieldMapping.put(DatabaseConstants.COLUMN_PORTAL_NAME, PortalMetadataContants.PORTAL_NAME);
			fieldMapping.put(DatabaseConstants.COLUMN_CREATED_BY, PortalMetadataContants.CREATED_BY);
			fieldMapping.put(DatabaseConstants.COLUMN_CREATED_DATE, PortalMetadataContants.CREATED_DATE);
			fieldMapping.put(DatabaseConstants.COLUMN_LAST_UPDATED_BY, PortalMetadataContants.LAST_UPDATED_BY);
			fieldMapping.put(DatabaseConstants.COLUMN_LAST_UPDATED_DATE, PortalMetadataContants.LAST_UPDATED_DATE);
			fieldMapping.put(DatabaseConstants.COLUMN_SSO_CONFIGURATION, PortalMetadataContants.PORTAL_SSO_CONFIGURATION);
			
			//if(isBlob) {
				fieldMapping.put(DatabaseConstants.COLUMN_CONFIGURATION, PortalMetadataContants.CONFIGURATION);
			//}
			fieldMapping.put(DatabaseConstants.COLUMN_VERSION, PortalMetadataContants.PORTAL_VERSION);
			
			List<QueryComponent> filter = null;
			if(draftIndicator) {
				fieldMapping.put(DatabaseConstants.COLUMN_BASE_VERSION, PortalMetadataContants.PORTAL_BASE_VERSION);
				QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_USER_NAME, username);
				filter = new ArrayList<QueryComponent>();
				filter.add(userNameFilter);
			} else {
				fieldMapping.put(DatabaseConstants.COLUMN_PORTAL_STATUS, PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE);
				fieldMapping.put(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION, PortalMetadataContants.PORTAL_METAMODEL_VERSION);
			}
			
			Set<String> keySet = fieldMapping.keySet();
			List<String> projections = new ArrayList<String>(keySet);
			
			List<QueryComponent> sortAttributes = new ArrayList<QueryComponent>();
			sortAttributes.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
					DatabaseConstants.SORT_ORDER_DESC));
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(tableName);
			queryWrapper.setProjections(projections);
			queryWrapper.setSortFields(sortAttributes);
			queryWrapper.setFilter(filter);
			List<Map<String, Object>> portals = getPortalDetails(queryWrapper);
			log.info("Retrieve All available Portal Configuration response {} ", portals);
			portals.forEach(portal -> {
				ObjectNode portalNode = objectMapper.createObjectNode();
				for (String column : keySet) {
					populateValueNode(portal.get(column), portalNode, fieldMapping.get(column));
				}
				portalNode.put(PortalMetadataContants.DATABASE_ID, orsID);
				portalNode.put(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE, draftIndicator);

				boolean hasSSO = portalNode.has(PortalMetadataContants.PORTAL_SSO_CONFIGURATION);
				portalNode.put(PortalMetadataContants.PORTAL_SSO_ATTRIBUTE, hasSSO);

				boolean hasPublished =  tableName.equals(DatabaseConstants.TABLE_PORTAL_CONFIG) ? true :
					portalNode.get(PortalMetadataContants.PORTAL_BASE_VERSION).asLong() > 0;
				portalNode.put(PortalMetadataContants.PORTAL_PUBLISHED_ATTRIBUTE, hasPublished);

				portalNode.remove(PortalMetadataContants.PORTAL_SSO_CONFIGURATION);
				portalNode.remove(PortalMetadataContants.PORTAL_BASE_VERSION);
				portalArray.add(portalNode);
			});
			
		} catch (PortalConfigException e) {
			log.error("Error on retrive all portal config for orsId {}, with username {} ",
					orsID, username, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG315,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG315), e.getMessage());
		} catch (Exception e) {
			log.error("Error on retrive all portal config for orsId {}, with username {} ",
					orsID, username, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG315,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG315), e.getMessage());
		}

		return portalArray;
	}
	
	@Override
	public JsonNode savePortalConfig(Portal portal, String tableName) throws PortalConfigException {

		ObjectNode versionNode = objectMapper.createObjectNode();
		
		log.info("Save Action for table {}, with portal data {} ", tableName, portal);
		
		List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
		
		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_ID,
				portal.getPortalId()));

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

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CREATED_BY,
				portal.getCreatedBy()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_BY,
				portal.getLastUpdateBy()));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_CREATED_DATE,
				PortalConfigUtil.formatDate(portal.getCreatedDate())));

		fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_LAST_UPDATED_DATE,
				PortalConfigUtil.formatDate(portal.getLastUpdatedDate())));

		if (tableName.equalsIgnoreCase(DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP)) {
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_BASE_VERSION,
					portal.getBaseVersion()));

			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_USER_NAME,
					portal.getUserName()));
		}
		
		if(DatabaseConstants.TABLE_PORTAL_CONFIG.equalsIgnoreCase(tableName)) {
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_STATUS,
					portal.getPortalStatus()));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION,
					portal.getMetamodelVersion()));
		}
		
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(tableName);
		queryWrapper.setQueryType(DatabaseConstants.INSERT_QUERY_TYPE);
		queryWrapper.setSetClause(fieldMapping);
		queryWrapper.setIntialQuery(INSERT_QUERY);
		String query = constructQuery(queryWrapper);

		log.info("Save Portal Configuration query {} ", query);
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultset = null;
		try {

			connection = jdbcTemplate.getDataSource().getConnection();
			statement = connection.prepareStatement(query);
			log.info("Save Action Prepare statement for table {}, with portal data {} and setter clause {} ", tableName,
					portal, queryWrapper.getSetClause());
			statement = prepareStatement(queryWrapper.getSetClause(), statement);
			statement.executeUpdate();
			versionNode.put(PortalMetadataContants.PORTAL_ID, portal.getPortalId());

		} catch (SQLException e) {
			log.error("Error on save portal config for tableName {}, with field {} ", tableName, fieldMapping,
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on save portal config for tableName {}, with field {} ", tableName, fieldMapping,
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG303,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG303), e.getMessage());
		} finally {
			try {
				if (null != statement) {
					statement.close();
				}
				if (null != connection) {
					connection.close();
				}
				if (null != resultset) {
					resultset.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection of save portal config for tableName {}, with field {} ", tableName,
						fieldMapping, e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}

		return versionNode;
	}
	
	@Override
	public JsonNode updatePortalConfig(QueryWrapper queryWrapper, Long portalId) throws PortalConfigException {

		ObjectNode versionNode = objectMapper.createObjectNode();
		
		log.info("Update Action for table {}, with portal data {} ", queryWrapper.getTableName(), queryWrapper);
		
		queryWrapper.setIntialQuery(UPDATE_QUERY);
		String query = constructQuery(queryWrapper);
		log.info("Update Portal Configuration query {} ", query);

		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultset = null;
		try {

			connection = jdbcTemplate.getDataSource().getConnection();
			statement = connection.prepareStatement(query);
			List<QueryComponent> statementValues = new ArrayList<QueryComponent>();
			statementValues.addAll(queryWrapper.getSetClause());
			statementValues.addAll(queryWrapper.getFilter());
			log.info("Update Action Prepare statement for table {}, with portal data {} and setter clause {} ",
					queryWrapper.getTableName(), queryWrapper, statementValues);
			statement = prepareStatement(statementValues, statement);
			statement.executeUpdate();
			versionNode.put(PortalMetadataContants.PORTAL_ID, portalId);

		} catch (SQLException e) {
			log.error("Error on save portal config for tableName {}, with field {} ", queryWrapper.getTableName(), queryWrapper.getSetClause(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on save portal config for tableName {}, with field {} ", queryWrapper.getTableName(), queryWrapper.getSetClause(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG303,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG303), e.getMessage());
		} finally {
			try {
				if (null != statement) {
					statement.close();
				}
				if (null != connection) {
					connection.close();
				}
				if (null != resultset) {
					resultset.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection of save portal config for tableName {}, with field {} ", queryWrapper.getTableName(),
						queryWrapper.getSetClause(), e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}

		return versionNode;
	}

	@Override
	public boolean deletePortalConfig(QueryWrapper queryWrapper) throws PortalConfigException {
		
		boolean flag = false;
		log.info("Delete Action for table {} ", queryWrapper.getTableName());
		queryWrapper.setIntialQuery(DELETE_QUERY);
		
		String query = constructQuery(queryWrapper);
		log.info("Delete Action for query {} ", query);
		
		Connection connection = null;
		PreparedStatement statement = null;
		
		try {
			
			connection = jdbcTemplate.getDataSource().getConnection();
			statement = connection.prepareStatement(query);
			log.info("Delete Action for query {}, with filter {} ", query, queryWrapper.getFilter());
			statement = prepareStatement(queryWrapper.getFilter(), statement);
			int deleted = statement.executeUpdate();
			flag = 0 < deleted;
			
		} catch (SQLException e) {
			log.error("Error on deletion of portal config for filter {} ", queryWrapper.getFilter(), e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on deletion of portal config for filter {} ", queryWrapper.getFilter(), e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG305,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG305), e.getMessage());
		} finally {
			try {
				if(null != statement) {
					statement.close();
				}
				if(null != connection) {
					connection.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection of delete portal config for filter {} ", queryWrapper.getFilter(), e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}
		return flag;
	}
	
	@Override
	public Boolean isPortalConfigExistByName(QueryWrapper queryWrapper) throws PortalConfigException {

		List<Map<String, Object>> response = null;

		queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
		queryWrapper.setIntialQuery(SELECT_QUERY);
		String query = constructQuery(queryWrapper);
		String finalQuery = query.replace(DatabaseConstants.COLUMN_PORTAL_NAME,
				"UPPER(" + DatabaseConstants.COLUMN_PORTAL_NAME + ")");

		log.info("Is Portal Configuration Exists for query {} ", finalQuery);
		try {

			response = jdbcTemplate.query(new PreparedStatementCreator() {

				@Override
				public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
					PreparedStatement statement = connection.prepareStatement(finalQuery);
					log.info("Is Portal Configuration Prepare Statement Exists for query {}, with filter {} ",
							finalQuery, queryWrapper.getFilter());
					statement = prepareStatement(queryWrapper.getFilter(), statement);
					return statement;
				}
			}, new RowMapperResultSetExtractor<>(getColumnMapRowMapper()));

		} catch (Exception e) {
			log.error("Error on retrieve of portal config for projections {} with filter {} ",
					queryWrapper.getProjections(), queryWrapper.getFilter(), e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG315,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG315), e.getMessage());
		}

		if (!response.isEmpty() && null != response.get(0).get(DatabaseConstants.COLUMN_CONFIGURATION)) {
			return true;
		}

		return false;
	}

	@Override
	public void createPortalEntity(String tableName) throws PortalConfigException {

		Connection connection = null;
		Statement statement = null;
		String query = null;

		if (DatabaseConstants.TABLE_PORTAL_CONFIG_TEMP.equalsIgnoreCase(tableName)) {
			query = DatabaseConstants.QUERY_CREATE_USER_PORTAL_ENTITY_ORACLE;
		} else if (DatabaseConstants.TABLE_PORTAL_CONFIG.equalsIgnoreCase(tableName)) {
			query = DatabaseConstants.QUERY_CREATE_PORTAL_ENTITY_ORACLE;
		} else if (DatabaseConstants.TABLE_FORGOT_PASSWORD_LINK_EXPIRY.equalsIgnoreCase(tableName)) {
			query = DatabaseConstants.QUERY_CREATE_PASSWORD_EXPIRY_ORACLE;
		} else if (DatabaseConstants.TABLE_USER_PREFERENCE.equalsIgnoreCase(tableName)) {
            query = DatabaseConstants.QUERY_CREATE_USER_PREFERENCE_ORACLE;
        }

		try {

			log.info("Create Table Portal Configuration Exists for query {} ", query);
			
			connection = jdbcTemplate.getDataSource().getConnection();
			statement = connection.createStatement();
			statement.execute(query);

		} catch (SQLException e) {
			log.error("Error on execution of portal config sql {} ", query, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on execution of portal config sql {} ", query, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		} finally {
			try {
				if (null != statement) {
					statement.close();
				}
				if (null != connection) {
					connection.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection of Create portal config Entity for query {} ", query,
						e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}

	}
	
	@Override
	public void updatePortalDefinition(String tableName, List<DatabaseColumns> addColumns) throws PortalConfigException {

		Connection connection = null;
		Statement statement = null;

		String query = new String(ALTER_QUERY);
		query = query.replace("$TABLE_NAME$", tableName);
		String columnQuery = "";
		Integer size = 0;
        Integer columnSize;
		for(DatabaseColumns column:addColumns) {
			String columnType = "";
			if(column.getColumnType().equals("String")) {
				columnType = "VARCHAR";
			} else if(column.getColumnType().equals("Number")) {
				columnType = "NUMBER";
			} else if(column.getColumnType().equals("Timestamp")) {
				columnType = "TIMESTAMP";
			} else if(column.getColumnType().equals("Blob")) {
                columnType = "BLOB";
            }

			columnSize = column.getColumnSize();
            if(columnSize != null) {
                columnQuery = columnQuery + column.getColumnName() + " " + columnType + "(" + columnSize + ")";
            } else {
                columnQuery = columnQuery + column.getColumnName() + " " + columnType;
            }

			size++;
			if(size < addColumns.size()) {
				columnQuery = columnQuery + ",";
			}
		}
		query = query.replace("$COLUMNS$", columnQuery);

		try {

			log.info("Update Table Portal Configuration for query {} ", query);
			
			connection = jdbcTemplate.getDataSource().getConnection();
			statement = connection.createStatement();
			statement.execute(query);

		} catch (SQLException e) {
			log.error("Error on execution of update portal config sql {} ", query, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on execution of update portal config sql {} ", query, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		} finally {
			try {
				if (null != statement) {
					statement.close();
				}
				if (null != connection) {
					connection.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection of Update portal Entity Definition for query {} ", query,
						e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}

	}
	
	@Override
	public Long getSequenceNextValue() throws PortalConfigException {

		PreparedStatement ps = null;
		ResultSet rs = null;
		Connection connection = null;
		Long sequence = null;

		try {

			connection = jdbcTemplate.getDataSource().getConnection();
			ps = connection.prepareStatement(QUERY_GET_NEXT_SEQ, ResultSet.TYPE_FORWARD_ONLY,
					ResultSet.CONCUR_UPDATABLE);

			rs = ps.executeQuery();
			if (rs.next()) {
				int nxt = rs.getInt(1) + 1;
				rs.updateInt(1, nxt);
				sequence = Long.valueOf(nxt);
				rs.updateRow();
				
			} else {
				log.error("Error on retrieving sequence");
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401));
			}
			
		} catch (SQLException e) {
			log.error("Error on retrieving sequence {} ", e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on retrieving sequence {} ", e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		} finally {
			try {
				if (rs != null)
					rs.close();
				if (ps != null)
					ps.close();
				if (connection != null)
					connection.close();
			} catch (Exception e) {
				log.error("Error on close connection of retrieving sequence {} ", e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
			}
		}

		return sequence;
	}

	@Override
	public ArrayNode getRoles() throws PortalConfigException {
		
		ArrayNode roleArray = objectMapper.createArrayNode();
		
		List<String> projections = new ArrayList<String>();
		projections.add(DatabaseConstants.COLUMN_ROLE_NAME);
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_ROLES);
		queryWrapper.setProjections(projections);
		queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
		queryWrapper.setIntialQuery(SELECT_QUERY);
		String query = constructQuery(queryWrapper);
		
		log.info("Retrieve Roles for query {} ", query);
		
		List<Map<String, Object>> roles = jdbcTemplate.queryForList(query);
		roles.forEach((role) -> {
			ObjectNode jsonData = objectMapper.createObjectNode();
			jsonData.put(PortalMetadataContants.PORTAL_ROLE_NAME,
					role.get(DatabaseConstants.COLUMN_ROLE_NAME).toString());
			roleArray.add(jsonData);
		});
		
		return roleArray;
		
	}
	
	@Override
	public boolean isTableExist(String tableName) throws PortalConfigException {
		
		Connection connection = null;
		DatabaseMetaData tableMetadata = null;
		ResultSet resultset = null;
		try {
			
			log.info("Is Table Exists for table {} ", tableName);
			connection = jdbcTemplate.getDataSource().getConnection();
			tableMetadata = connection.getMetaData();
			resultset = tableMetadata.getTables(null, null, tableName, null);
			if(resultset.next()) {
				return true;
			}
			
		} catch (SQLException e) {
			log.error("Error on checking is portal table exist {} ", tableName, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on checking is portal table exist {} ", tableName, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		} finally {
			try {
				if(null != resultset) {
					resultset.close();
				}
				if(null != connection) {
					connection.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection while checking is portal table exist {} ", tableName, e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}
		return false;
	}
	
	@Override
	public List<DatabaseColumns> getTableColumns(String tableName) throws PortalConfigException {
		
		Connection connection = null;
		DatabaseMetaData tableMetadata = null;
		ResultSet resultset = null;
		List<DatabaseColumns> columns = new ArrayList<DatabaseColumns>();
		
		try {
			
			log.info("Retrieve Column Metadata for table {} ", tableName);
			connection = jdbcTemplate.getDataSource().getConnection();
			tableMetadata = connection.getMetaData();
			resultset = tableMetadata.getColumns(null, null, tableName, null);
			while(resultset.next()) {
				DatabaseColumns column = new DatabaseColumns(resultset.getString("COLUMN_NAME"), resultset.getString("TYPE_NAME"), resultset.getInt("COLUMN_SIZE"));
				columns.add(column);
			}
			
		} catch (SQLException e) {
			log.error("Error on Retrieve Column Metadata for table {} ", tableName, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on Retrieve Column Metadata for table {} ", tableName, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		} finally {
			try {
				if(null != resultset) {
					resultset.close();
				}
				if(null != connection) {
					connection.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection while Retrieve Column Metadata for table {} ", tableName, e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}
		return columns;
	}
	
	@Override
	public void save(QueryWrapper queryWrapper) throws PortalConfigServiceException {
		
		log.info("Save Data for queryDetails {} ", queryWrapper);
		queryWrapper.setQueryType(DatabaseConstants.INSERT_QUERY_TYPE);
		queryWrapper.setIntialQuery(INSERT_QUERY);
		String query = constructQuery(queryWrapper);

		log.info("Save Data for tablename {}, query {} ", queryWrapper.getTableName(), query);
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultset = null;
		try {

			connection = jdbcTemplate.getDataSource().getConnection();
			statement = connection.prepareStatement(query);
			log.info("Save Action Prepare statement for table {}, setter clause {} ", queryWrapper.getTableName(),
					queryWrapper.getSetClause());
			statement = prepareStatement(queryWrapper.getSetClause(), statement);
			statement.executeUpdate();

		} catch (SQLException e) {
			log.error("Error on save for tableName {}, with field {} ", queryWrapper.getTableName(), queryWrapper.getSetClause(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on save for tableName {}, with field {} ", queryWrapper.getTableName(), queryWrapper.getSetClause(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG303,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG303), e.getMessage());
		} finally {
			try {
				if (null != statement) {
					statement.close();
				}
				if (null != connection) {
					connection.close();
				}
				if (null != resultset) {
					resultset.close();
				};
			} catch (SQLException e) {
				log.error("Error on close connection of save for tableName {}, with field {} ", queryWrapper.getTableName(),
						queryWrapper.getSetClause(), e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}
		
	}
	
	@Override
	public void update(QueryWrapper queryWrapper) throws PortalConfigException {

		log.info("Update Action for table {}, with portal data {} ", queryWrapper.getTableName(), queryWrapper);
		
		queryWrapper.setIntialQuery(UPDATE_QUERY);
		queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
		String query = constructQuery(queryWrapper);
		log.info("Update Portal Configuration query {} ", query);

		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultset = null;
		try {

			connection = jdbcTemplate.getDataSource().getConnection();
			statement = connection.prepareStatement(query);
			List<QueryComponent> statementValues = new ArrayList<QueryComponent>();
			statementValues.addAll(queryWrapper.getSetClause());
			statementValues.addAll(queryWrapper.getFilter());
			log.info("Update Action Prepare statement for table {}, with filter {} and setter clause {} ",
					queryWrapper.getTableName(), queryWrapper.getFilter(), statementValues);
			statement = prepareStatement(statementValues, statement);
			statement.executeUpdate();

		} catch (SQLException e) {
			log.error("Error on update for tableName {}, with field {} ", queryWrapper.getTableName(), queryWrapper.getSetClause(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
		} catch (Exception e) {
			log.error("Error on update for tableName {}, with field {} ", queryWrapper.getTableName(), queryWrapper.getSetClause(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG303,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG303), e.getMessage());
		} finally {
			try {
				if (null != statement) {
					statement.close();
				}
				if (null != connection) {
					connection.close();
				}
				if (null != resultset) {
					resultset.close();
				}
			} catch (SQLException e) {
				log.error("Error on close connection of update for tableName {}, with field {} ", queryWrapper.getTableName(),
						queryWrapper.getSetClause(), e.getMessage());
				throw new PortalConfigServiceException(ErrorCodeContants.CONFIG401,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG401), e.getMessage());
			}
		}

	}

	private static PreparedStatement prepareStatement(List<QueryComponent> statementValue, PreparedStatement statement)
			throws SQLException {

		Integer statementIndex = 0;
		if (null != statementValue && !statementValue.isEmpty()) {
			for (QueryComponent queryValue : statementValue) {
				if (queryValue.getValue() instanceof String) {
					statement.setString(++statementIndex, queryValue.getValue().toString());
				} else if (queryValue.getValue() instanceof Number) {
					statement.setLong(++statementIndex, Long.valueOf("" + queryValue.getValue()));
				} else if (queryValue.getValue() instanceof byte[]) {
					statement.setBytes(++statementIndex, (byte[]) queryValue.getValue());
				} else if (queryValue.getValue() instanceof Date) {
					statement.setTimestamp(++statementIndex,
							java.sql.Timestamp.valueOf(PortalConfigUtil.formatDate((Date) queryValue.getValue())));
				}
			}
		}
		
		return statement;
	}
	
	
	private String constructQuery(QueryWrapper queryWrapper) {
		
		String query = queryWrapper.getIntialQuery();
		String queryType = queryWrapper.getQueryType();
		query = query.replace(DatabaseConstants.TABLE_NAME_WILDCARD, queryWrapper.getTableName());
		
		if(DatabaseConstants.SELECT_QUERY_TYPE.equalsIgnoreCase(queryType)) {
			query = query.replace(DatabaseConstants.PROJECTIONS_WILDCARD, QueryWrapper.applyProjections(queryWrapper));
			query = query.replace(DatabaseConstants.FILTER_WILDCARD, QueryWrapper.applyFilter(queryWrapper));
			query = query.replace(DatabaseConstants.SORT_WILDCARD, QueryWrapper.applySort(queryWrapper));
		}else if(DatabaseConstants.INSERT_QUERY_TYPE.equalsIgnoreCase(queryType)) {
			Map<String, String> fieldParam = QueryWrapper.applySetter(queryWrapper);
			query = query.replace(DatabaseConstants.SETTERS_WILDCARD, fieldParam.get(DatabaseConstants.SETTER_QUERY_KEY));
			query = query.replace(DatabaseConstants.PARAMS_WILDCARD, fieldParam.get(DatabaseConstants.SETTER_QUERY_PARAM));
		}else if(DatabaseConstants.UPDATE_QUERY_TYPE.equalsIgnoreCase(queryType)) {
			query = query.replace(DatabaseConstants.SETTERS_WILDCARD, QueryWrapper.applySetter(queryWrapper).get(DatabaseConstants.SETTER_QUERY_KEY));
			query = query.replace(DatabaseConstants.FILTER_WILDCARD, QueryWrapper.applyFilter(queryWrapper));
		} else if(DatabaseConstants.DELETE_QUERY_TYPE.equalsIgnoreCase(queryType)) {
			query = query.replace(DatabaseConstants.FILTER_WILDCARD, QueryWrapper.applyFilter(queryWrapper));
		}
		
		return query.toString();
		
	}
	
	private RowMapper<Map<String, Object>> getColumnMapRowMapper() {
		return new ColumnMapRowMapper();
	}
	
	private static void populateValueNode(Object value, JsonNode portalNode, String key) {

		if(value == null)
			return;
		if (value instanceof String) {
			((ObjectNode) portalNode).put(key, value.toString());
		} else if (value instanceof Date) {
			((ObjectNode) portalNode).put(key,
					PortalConfigUtil.formatToApplicationDate(new Date(((Timestamp) value).getTime())));
		} else if (value instanceof byte[]) {
			((ObjectNode) portalNode).put(key, new String((byte[]) value, StandardCharsets.UTF_8));
		} else {
			((ObjectNode) portalNode).putPOJO(key, value);
		}
	}

	@Override
	public ArrayNode getUsers() throws PortalConfigException {
		
		
		List<Map<String, Object>> response = null;
		ArrayNode userArray = objectMapper.createArrayNode();
		
		QueryComponent applicationInd = new QueryComponent(DatabaseConstants.COLUMN_USERS_APPLICATION_IND, 0);
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(applicationInd);
		List<String> projections = new ArrayList<String>();
		projections.add(DatabaseConstants.COLUMN_USERS_USER_NAME);
		projections.add(DatabaseConstants.COLUMN_USERS_FIRST_NAME);
		projections.add(DatabaseConstants.COLUMN_USERS_LAST_NAME);
		projections.add(DatabaseConstants.COLUMN_USERS_EMAIL);
		QueryWrapper queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_REPOS_USERS);
		queryWrapper.setProjections(projections);
		queryWrapper.setFilter(filter);

		queryWrapper.setQueryType(DatabaseConstants.SELECT_QUERY_TYPE);
		queryWrapper.setIntialQuery(SELECT_QUERY);
		String query = constructQuery(queryWrapper);
		
		log.info("Retrieve Action for query {} ", query);
		
		try {
			log.info("Retrieve user details response {} ", response);
			response = jdbcTemplate.query(new PreparedStatementCreator() {

				@Override
				public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
					PreparedStatement statement = connection.prepareStatement(query);
					log.info("Retrieve Action Statement prepare for filter {} ", queryWrapper.getFilter());
					statement = prepareStatement(queryWrapper.getFilter(), statement);
					return statement;
				}
			}, new RowMapperResultSetExtractor<>(getColumnMapRowMapper()));
			
			if (response.isEmpty()) {
				return null;
			}
			
			response.forEach((user) -> {
				ObjectNode jsonData = objectMapper.createObjectNode();
				jsonData.put( PortalServiceConstants.USER_NAME, user.get(DatabaseConstants.COLUMN_USERS_USER_NAME).toString());
				if(user.get(DatabaseConstants.COLUMN_USERS_FIRST_NAME) != null) {
					jsonData.put(PortalServiceConstants.FIRST_NAME , user.get(DatabaseConstants.COLUMN_USERS_FIRST_NAME).toString());
				} else {
					jsonData.putNull(PortalServiceConstants.FIRST_NAME);
				}
				if(user.get(DatabaseConstants.COLUMN_USERS_LAST_NAME) != null) {
					jsonData.put(PortalServiceConstants.LAST_NAME,user.get(DatabaseConstants.COLUMN_USERS_LAST_NAME).toString());
				} else {
					jsonData.putNull(PortalServiceConstants.LAST_NAME);
				}
				if(user.get(DatabaseConstants.COLUMN_USERS_EMAIL) != null) {
					jsonData.put(PortalServiceConstants.EMAIL,user.get(DatabaseConstants.COLUMN_USERS_EMAIL).toString());
				} else {
					jsonData.putNull(PortalServiceConstants.EMAIL);
				}
				userArray.add(jsonData);
			});

		} catch (Exception e) {
			log.error("Error on retrive of users for projections {}, with filter {}, with sort {} ",
					queryWrapper.getProjections(), queryWrapper.getFilter(), queryWrapper.getSortFields(),
					e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG319,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG319), e.getMessage());
		}

		return userArray;
	}

}
