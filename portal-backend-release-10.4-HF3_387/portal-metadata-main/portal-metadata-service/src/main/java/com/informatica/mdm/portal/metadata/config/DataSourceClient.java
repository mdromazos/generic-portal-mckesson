package com.informatica.mdm.portal.metadata.config;

import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.jdbc.datasource.lookup.JndiDataSourceLookup;

import com.delos.cmx.server.admin.AdminLogin;
import com.delos.cmx.server.datalayer.ConnectionData;
import com.delos.cmx.server.datalayer.repository.ReposException;
import com.delos.cmx.server.datalayer.repository.database.ReposDatabase;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.delos.util.StringUtil;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sam.BaseSecurityCredential;

public class DataSourceClient {
	
	public static Map<String, DataSourceModel> datasourceCache = new HashMap<>();

	public static DataSourceModel getDatasource(DataSourceModel dataSourceModel)
			throws AccessException, ReposException {
		
		datasourceCache = new HashMap<>();
		if (dataSourceModel.getCredentials() != null) {
			AdminLogin adminLogin = HubClient.getInstance().getAdminLoginBean();
			dataSourceModel = getOrsDataSource(dataSourceModel, adminLogin);
		} else {
			dataSourceModel = getOrsDataSourceFromJndi(dataSourceModel);
		}
		datasourceCache.put(dataSourceModel.getOrsID(), dataSourceModel);
		return dataSourceModel;
	}

	public static DataSourceModel getOrsDataSource(DataSourceModel dataSourceModel, 
			AdminLogin adminLogin) throws AccessException, ReposException {
		
		datasourceCache = new HashMap<>();
		getOrsDataSources(dataSourceModel, adminLogin);
		return datasourceCache.get(dataSourceModel.getOrsID());
	}

	public static DataSourceModel getOrsDataSourceFromJndi(DataSourceModel dataSourceModel) {
		
		datasourceCache = new HashMap<>();
		DataSourceModel dataSourceModelWithJndi = new DataSourceModel(dataSourceModel.getOrsID(), null);
		PortalConfigUtil.initializeHubServerPropertiesStorage();
		if( PortalConfigUtil.properties.getProperty(PortalServiceConstants.CMX_APP_SERVER_TYPE).equalsIgnoreCase(PortalServiceConstants.JBOSS)  ) {
			dataSourceModelWithJndi.setDatasource(getDataSource(PortalServiceConstants.DATASOURCE_JBOSS_PREFIX, dataSourceModel.getOrsID()));
		}else {
			dataSourceModelWithJndi.setDatasource(getDataSource("",dataSourceModel.getOrsID()));
		}
		datasourceCache.put(dataSourceModel.getOrsID(),dataSourceModelWithJndi);
		return dataSourceModelWithJndi;
	}
	
	public static Map<String, DataSourceModel> getOrsDataSources(DataSourceModel dataSourceModel, 
			AdminLogin adminLogin) throws AccessException, ReposException {
		
		datasourceCache = new HashMap<>();
		ConnectionData connectionData = adminLogin
				.loginUser(createBaseSecurityCredential(dataSourceModel.getCredentials()));
		@SuppressWarnings("unchecked")
		Map<String, ReposDatabase> databaseMap = (Map<String, ReposDatabase>) adminLogin.getAllDatabases(connectionData)
				.getResultData();
		for (ReposDatabase database : databaseMap.values()) {
			datasourceCache.put(database.getDataObject().getDatabaseId(), getDataSource(database, dataSourceModel));
		}
		return datasourceCache;
	}

	public static BaseSecurityCredential createBaseSecurityCredential(Credentials credentials) {
		
		return createBaseSecurityCredential(credentials.getUsername(), credentials.getPassword(),
				credentials.getPayload());
	}

	private static BaseSecurityCredential createBaseSecurityCredential(String username, String password,
			byte[] payload) {
		
		BaseSecurityCredential baseCredential = new BaseSecurityCredential();
		baseCredential.setUsername(username);
		if(StringUtils.isNotEmpty(password)) {
			baseCredential.setPassword(password);
		} else {
			baseCredential.setPayload(payload);
		}
		return baseCredential;
	}

	private static DataSourceModel getDataSource(ReposDatabase database, DataSourceModel dataSourceModel) {
		DataSourceModel orsModel = new DataSourceModel(database.getDataObject().getDatabaseId(),
				dataSourceModel.getCredentials());
		orsModel.setDatabaseName(database.getDataObject().getDisplayName());
		DataSource dataSource = DataSourceBuilder.create().username(database.getConnectingUserName())
				.password(StringUtil.decryptWithHubPrivateKey(database.getConnectingPassword(false)))
				.url(database.getConnectUrl())
				.driverClassName(database.getDatabaseType().getJdbcDriverClassName()).build();
		orsModel.setDatasource(dataSource);
		return orsModel;
	}
	
	private static DataSource getDataSource(String prefix, String databaseId) {
		return new JndiDataSourceLookup().getDataSource(getDataSourceJndiName(prefix, databaseId));
	}
	
	private static String getDataSourceJndiName(String prefix, String databaseId) {
		return new StringBuilder()
				.append(prefix)
				.append(String.format(PortalServiceConstants.DATASOURCE_NAME_FORMAT, databaseId.toLowerCase()))
				.toString();
	}

}
