package com.informatica.mdm.portal.metadata.config;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.sql.DataSource;

import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.jdbc.datasource.lookup.JndiDataSourceLookup;

import com.delos.cmx.server.admin.AdminLogin;
import com.delos.cmx.server.admin.Result;
import com.delos.cmx.server.datalayer.ConnectionData;
import com.delos.cmx.server.datalayer.access.ReposDatabaseDataObject;
import com.delos.cmx.server.datalayer.repository.ReposException;
import com.delos.cmx.server.datalayer.repository.database.ReposDatabase;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.delos.util.database.DatabaseType;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.DataSourceClient;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sam.BaseSecurityCredential;

@RunWith(PowerMockRunner.class)
@PrepareForTest({DataSourceClient.class,HubClient.class})
@PowerMockIgnore("javax.management.*")
public class DataSourceClientTest {

	static Map<String, DataSourceModel> datasourceCache = new HashMap<String, DataSourceModel>();
	static DataSourceModel dataSourceModel1 = null;
	static DataSourceModel dataSourceModel2 = null;
	static Credentials credentials;
	static private HubClient hubClient;
	static private AdminLogin adminLogin;
	static private ConnectionData connectionData;
	static Map<String,ReposDatabase> reposDbMap = new HashMap<String, ReposDatabase>();
	static Result result;
	static ReposDatabase database;
	static ReposDatabaseDataObject databaseDataObject;
	static DatabaseType databaseType;
	static Properties properties;
	static DataSource dataSource;
	
	@BeforeClass
	public static void setUp() throws Exception {
		properties = new Properties();
		properties.setProperty(PortalServiceConstants.CMX_APP_SERVER_TYPE, PortalServiceConstants.JBOSS);
		PortalConfigUtil.properties = properties;
		dataSource = mock(DataSource.class);
		credentials = new Credentials("username", "password");
		dataSourceModel1 = new DataSourceModel("SUPPLIER_HUB", credentials);
		dataSourceModel2 = new DataSourceModel("TCR_HUB", credentials);
		datasourceCache.put("SUPPLIER_HUB", dataSourceModel1);
		DataSourceClient.datasourceCache = datasourceCache;
		database = mock(ReposDatabase.class);
		hubClient = mock(HubClient.class);
		adminLogin = mock(AdminLogin.class);
		connectionData = mock(ConnectionData.class);
		databaseDataObject = mock(ReposDatabaseDataObject.class);
		databaseType = mock(DatabaseType.class);
		result = mock(Result.class);
		reposDbMap.put("SUPPLIER_HUB", database);
		PowerMockito.mockStatic(HubClient.class);
		when(HubClient.getInstance()).thenReturn(hubClient);
		when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		when(adminLogin.loginUser(any(BaseSecurityCredential.class))).thenReturn(connectionData);
		when(adminLogin.getAllDatabases(connectionData)).thenReturn(result);
		when(result.getResultData()).thenReturn(reposDbMap);
		when(database.getDataObject()).thenReturn(databaseDataObject).thenReturn(databaseDataObject);
		when(databaseDataObject.getDatabaseId()).thenReturn("TCR_HUB").thenReturn("TCR_HUB");
		when(database.getDatabaseType()).thenReturn(databaseType);
		when(databaseType.getJdbcDriverClassName()).thenReturn("oracle.jdbc.driver.OracleDriver");
	}
	
	@Test
	@Ignore
	public void testGetDatasource() throws AccessException, ReposException {
		DataSourceModel dsm = DataSourceClient.getDatasource(dataSourceModel1);
		assertEquals(dsm.getOrsID(),"SUPPLIER_HUB");
		DataSourceModel dsm1 = DataSourceClient.getDatasource(dataSourceModel2);
		assertEquals(dsm1.getOrsID(),"TCR_HUB");
	}
	
	@Test
	@Ignore
	public void testGetDataSourceWithJndi() throws Exception {
		JndiDataSourceLookup jndiDataSourceLookup = mock(JndiDataSourceLookup.class);
		PowerMockito.whenNew(JndiDataSourceLookup.class).withNoArguments().thenReturn(jndiDataSourceLookup);
		when(jndiDataSourceLookup.getDataSource(any(String.class))).thenReturn(dataSource);
		DataSourceModel dataSourceModel3 = new DataSourceModel("orcl-Customer_360", null);
		DataSourceModel dsm = DataSourceClient.getDatasource(dataSourceModel3);
		assertEquals(dsm.getDatasource(), dataSource);
	}
	
	
}
