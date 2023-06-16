package com.informatica.mdm.portal.metadata.model;

import javax.sql.DataSource;

import com.informatica.mdm.cs.server.rest.Credentials;

public class DataSourceModel {
	private String orsID;
	private Credentials credentials;
	private DataSource datasource;
	private String databaseName;
	private String jndiName;

	public DataSourceModel(String orsID, Credentials credentials) {
		super();
		this.orsID = orsID;
		this.credentials = credentials;
	}

	public String getOrsID() {
		return orsID;
	}

	public void setOrsID(String orsID) {
		this.orsID = orsID;
	}

	public Credentials getCredentials() {
		return credentials;
	}

	public void setCredentials(Credentials credentials) {
		this.credentials = credentials;
	}

	public DataSource getDatasource() {
		return datasource;
	}

	public void setDatasource(DataSource datasource) {
		this.datasource = datasource;
	}

	public String getDatabaseName() {
		return databaseName;
	}

	public void setDatabaseName(String databaseName) {
		this.databaseName = databaseName;
	}
	
	public String getJndiName() {
		return jndiName;
	}

	public void setJndiName(String jndiName) {
		this.jndiName = jndiName;
	}
}
