package com.informatica.mdm.portal.metadata.util;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;

import com.delos.cmx.server.datalayer.repository.ReposException;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.informatica.mdm.portal.metadata.config.DataSourceClient;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;

public class PersistenceResolver {

	private final static Logger log = LoggerFactory.getLogger(PersistenceResolver.class);
	
	public static DataSource dataSourceResolver(DataSourceModel dataSourceModel) {

		DataSource datasource;
		try {
			datasource = DataSourceClient.getDatasource(dataSourceModel).getDatasource();
			return datasource;
		} catch (AccessException | ReposException e) {
			String msg = "[!] Could not read ORS from admin login bean";
			log.error(msg);
			throw new RuntimeException(msg, e);
		}
	}

	public static JdbcTemplate jdbcResolver(DataSource datasource) {

		JdbcTemplate jdbcTemplate = new JdbcTemplate(datasource);
		return jdbcTemplate;
	}
	
}
