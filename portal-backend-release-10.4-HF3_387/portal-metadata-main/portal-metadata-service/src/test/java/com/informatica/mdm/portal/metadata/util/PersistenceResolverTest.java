package com.informatica.mdm.portal.metadata.util;

import static org.junit.Assert.assertNotNull;

import javax.sql.DataSource;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.jdbc.core.JdbcTemplate;

import com.delos.cmx.server.datalayer.repository.ReposException;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.informatica.mdm.portal.metadata.config.DataSourceClient;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@PrepareForTest({DataSourceClient.class, PersistenceResolver.class})
public class PersistenceResolverTest {

	@Mock
	DataSource datasource;
	
	@Mock
	DataSourceModel datasourceModel;
	
	@Mock
	JdbcTemplate jdbcTemplate;
	
	@Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
    }
	
	@Test
	public void testDataSourceResolver() throws AccessException, ReposException {
		PowerMockito.mockStatic(DataSourceClient.class);
		PowerMockito.when(DataSourceClient.getDatasource(Mockito.any(DataSourceModel.class))).thenReturn(datasourceModel);
		Mockito.when(datasourceModel.getDatasource()).thenReturn(datasource);
		assertNotNull(PersistenceResolver.dataSourceResolver(datasourceModel));
	}

	@Test
	public void testJdbcResolver() throws Exception {
		PowerMockito.whenNew(JdbcTemplate.class).withArguments(Mockito.any(DataSource.class)).thenReturn(jdbcTemplate);
		assertNotNull(PersistenceResolver.jdbcResolver(datasource));
	}

}
