package com.informatica.mdm.portal.metadata.config;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import com.informatica.mdm.portal.metadata.exception.DataSourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.DataSourceResolvingException;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;

@Configuration
public class MultiDataSource {
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	private final Logger log = LoggerFactory.getLogger(MultiDataSource.class);

	private final Map<Object, Object> multiDataSources = new ConcurrentHashMap<>();
	
	private final Map<Object, Object> jdbcTemplates = new ConcurrentHashMap<>();

	public void setDatasourceResolver(Function<DataSourceModel, DataSource> datasourceResolver) {
		this.datasourceResolver = datasourceResolver;
	}

	public Map<Object, Object> getMultiDataSources() {
		return multiDataSources;
	}

	private Function<DataSourceModel, DataSource> datasourceResolver;

	public void setJdbcTemplateResolver(Function<DataSource, JdbcTemplate> jdbcTemplateResolver) {
		this.jdbcTemplateResolver = jdbcTemplateResolver;
	}

	private Function<DataSource, JdbcTemplate> jdbcTemplateResolver;

	public DataSource getCurrentDataSource(DataSourceModel mDatasource)
			throws SQLException, DataSourceNotFoundException, DataSourceResolvingException {
		DataSource datasource = null;
		if (datasourceIsAbsent(mDatasource)) {
			if (datasourceResolver != null) {
				try {
					datasource = datasourceResolver.apply(mDatasource);
					log.debug("[d] Datasource properties resolved for ors ID '{}'", mDatasource.getOrsID());
				} catch (Exception e) {
					throw new DataSourceResolvingException(ErrorCodeContants.CONFIG403, errorCodeProperties.getProperty(ErrorCodeContants.CONFIG403), mDatasource.getOrsID());
				}

				addDataSource(mDatasource.getOrsID(), datasource);
				return datasource;
			} else {
				throw new DataSourceNotFoundException(ErrorCodeContants.CONFIG402, errorCodeProperties.getProperty(ErrorCodeContants.CONFIG402), mDatasource.getOrsID());
			}
		}
		log.debug("Data Source for orsID. {}", mDatasource.getOrsID());
		return (DataSource) multiDataSources.get(mDatasource.getOrsID());
	}

	public JdbcTemplate getCurrentJdbcTemplate(DataSourceModel mDatasource)
			throws SQLException, DataSourceNotFoundException, DataSourceResolvingException {
		if(jdbcIsAbsent(mDatasource)) {
			DataSource dataSource = getCurrentDataSource(mDatasource);
			JdbcTemplate jdbcTemplate = jdbcTemplateResolver.apply(dataSource);
			jdbcTemplates.put(mDatasource.getOrsID(), jdbcTemplate);
			return jdbcTemplate;
		}
		log.debug("Jdbc Template for orsID.", mDatasource.getOrsID());
		return (JdbcTemplate) jdbcTemplates.get(mDatasource.getOrsID());
	}

	private boolean datasourceIsAbsent(DataSourceModel mDatasource) {
		return !multiDataSources.containsKey(mDatasource.getOrsID());
	}
	
	private boolean jdbcIsAbsent(DataSourceModel mDatasource) {
		return !jdbcTemplates.containsKey(mDatasource.getOrsID());
	}

	private void addDataSource(String orsId, DataSource datasource) {

		// Check that new connection is 'live'. If not - throw exception
		try (Connection c = datasource.getConnection()) {
			multiDataSources.put(orsId, datasource);
			log.debug("[d] Datasource '{}' added. {}", orsId);
		} catch (Exception e) {
			log.error("No active connection found for datasource {} ", orsId);
		}
	}

}
