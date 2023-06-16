package com.informatica.mdm.portal.metadata.config;

import java.util.function.Function;

import javax.sql.DataSource;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.jdbc.core.JdbcTemplate;

import com.informatica.mdm.portal.metadata.config.MultiDataSource;
import com.informatica.mdm.portal.metadata.config.PortalAppConfig;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
public class PortalAppConfigTest {

	@Mock
	MultiDataSource multiDataSource;
	
	@Mock
	PortalAppConfig portalPersistenceConfig;
	
	@Mock
	Function<DataSourceModel, DataSource> datasourceResolver;
	
	@Mock
	Function<DataSource, JdbcTemplate> jdbcTemplateResolver;
	
	@Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
    }
	
	@Test
	public void testPortalPersistenceConfig() throws Exception {
		PowerMockito.whenNew(PortalAppConfig.class).withArguments(Mockito.any(MultiDataSource.class)).thenReturn(portalPersistenceConfig);
		Mockito.doNothing().when(multiDataSource).setDatasourceResolver(datasourceResolver);
		Mockito.doNothing().when(multiDataSource).setJdbcTemplateResolver(jdbcTemplateResolver);
		@SuppressWarnings("unused")
		PortalAppConfig portalConfig = new PortalAppConfig(multiDataSource);
		PowerMockito.verifyNew(PortalAppConfig.class).withArguments(Mockito.any(MultiDataSource.class));
	}

}
