package com.informatica.mdm.portal.metadata.model;

import java.util.Map;

public class LoginData {
	
	private String username;
	private String password;
	private String uniqueFieldPath;
	private Map<String,String> projections;
	private String orsId;
	private String beName;
	private String recordIdField;
	private boolean isStateEnabled;
	private Integer sessionTimeOut;
	private String provider;
	private String sessionIndex;
	private String samlNameId;

	public String getSamlNameId() {
		return samlNameId;
	}
	public void setSamlNameId(String samlNameId) {
		this.samlNameId = samlNameId;
	}
	public String getProvider() {
		return provider;
	}
	public void setProvider(String provider) {
		this.provider = provider;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username.trim();
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getUniqueFieldPath() {
		return uniqueFieldPath;
	}
	public void setUniqueFieldPath(String uniqueFieldPath) {
		this.uniqueFieldPath = uniqueFieldPath;
	}
	public String getOrsId() {
		return orsId;
	}
	public void setOrsId(String orsId) {
		this.orsId = orsId;
	}
	public String getBeName() {
		return beName;
	}
	public void setBeName(String beName) {
		this.beName = beName;
	}
	public String getRecordIdField() {
		return recordIdField;
	}
	public void setRecordIdField(String recordIdField) {
		this.recordIdField = recordIdField;
	}
	
	public Map<String, String> getProjections() {
		return projections;
	}
	public void setProjections(Map<String, String> projections) {
		this.projections = projections;
	}	
	public Integer getSessionTimeOut() {
		return sessionTimeOut;
	}
	public void setSessionTimeout(Integer sessionTimeOut) {
		this.sessionTimeOut = sessionTimeOut;
	}
	public boolean getIsStateEnabled() {
		return isStateEnabled;
	}
	public void setIsStateEnabled(boolean isStateEnabled) {
		this.isStateEnabled = isStateEnabled;
	}

	public String getSessionIndex() {
		return sessionIndex;
	}

	public void setSessionIndex(String sessionIndex) {
		this.sessionIndex = sessionIndex;
	}
}
