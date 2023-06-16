package com.informatica.mdm.portal.metadata.repository;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.Portal;
import com.informatica.mdm.portal.metadata.util.DatabaseColumns;
import com.informatica.mdm.portal.metadata.util.QueryWrapper;

public interface PortalRepo {

	public List<Map<String, Object>> getPortalDetails(QueryWrapper queryWrapper)
			throws PortalConfigException;
	
	public JsonNode getPortalConfiguration(QueryWrapper queryWrapper)
			throws PortalConfigException;
	
	public JsonNode updatePortalConfig(QueryWrapper queryWrapper, Long portalId)
			throws PortalConfigException;
	
	public JsonNode savePortalConfig(Portal portal, String tableName)
			throws PortalConfigException;
	
	public boolean deletePortalConfig(QueryWrapper queryWrapper)
			throws PortalConfigException;
	
	public ArrayNode getPortals(String orsID, String username,
			Boolean isBlob, String tableName) throws PortalConfigException;
	
	boolean isTableExist(String tableName)
			throws PortalConfigException;
	
	void createPortalEntity(String tableName)
			throws PortalConfigException;
	
	public ArrayNode getRoles()
			throws PortalConfigException;
	
	public Long getSequenceNextValue()
			throws PortalConfigException;

	public void setJdbcTemplate(JdbcTemplate jdbcTemplate);

	public Boolean isPortalConfigExistByName(QueryWrapper queryWrapper)
			throws PortalConfigException;

	public void save(QueryWrapper queryWrapper)
			throws PortalConfigException;

	public void update(QueryWrapper queryWrapper)
			throws PortalConfigException;
	
	public ArrayNode getUsers( ) throws PortalConfigException;

	public List<DatabaseColumns> getTableColumns(String tableName)
			throws PortalConfigException;

	public void updatePortalDefinition(String tableName,
			List<DatabaseColumns> addColumns) throws PortalConfigException;
	 
}
