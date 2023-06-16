package com.informatica.mdm.portal.metadata.model;

public class Portal {

    private byte[] metadata;
    
    private Long portalId;
    
    private String portalName;
    
    private String createdBy;
    
    private String lastUpdateBy;
    
    private String createdDate;
    
    private String lastUpdatedDate;
    
    private Integer version;
    
    private Integer baseVersion;
    
    private String metamodelVersion;
    
    private String userName;
    
    private String portalStatus;
    
    private byte[] errorConfig;
    
    private byte[] bundleConfig;

	public byte[] getMetadata() {
		return metadata;
	}

	public void setMetadata(byte[] metadata) {
		this.metadata = metadata;
	}

	public String getPortalName() {
		return portalName;
	}

	public void setPortalName(String portalName) {
		this.portalName = portalName;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public String getLastUpdateBy() {
		return lastUpdateBy;
	}

	public void setLastUpdateBy(String lastUpdateBy) {
		this.lastUpdateBy = lastUpdateBy;
	}

	public String getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(String createdDate) {
		this.createdDate = createdDate;
	}

	public String getLastUpdatedDate() {
		return lastUpdatedDate;
	}

	public void setLastUpdatedDate(String lastUpdatedDate) {
		this.lastUpdatedDate = lastUpdatedDate;
	}

	public Long getPortalId() {
		return portalId;
	}

	public void setPortalId(Long portalId) {
		this.portalId = portalId;
	}

	public Integer getVersion() {
		return version;
	}

	public void setVersion(Integer version) {
		this.version = version;
	}

	public Integer getBaseVersion() {
		return baseVersion;
	}

	public void setBaseVersion(Integer baseVersion) {
		this.baseVersion = baseVersion;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPortalStatus() {
		return portalStatus;
	}

	public void setPortalStatus(String portalStatus) {
		this.portalStatus = portalStatus;
	}

	public byte[] getErrorConfig() {
		return errorConfig;
	}

	public void setErrorConfig(byte[] errorConfig) {
		this.errorConfig = errorConfig;
	}

	public byte[] getBundleConfig() {
		return bundleConfig;
	}

	public String getMetamodelVersion() {
		return metamodelVersion;
	}

	public void setMetamodelVersion(String metamodelVersion) {
		this.metamodelVersion = metamodelVersion;
	}

	public void setBundleConfig(byte[] bundleConfig) {
		this.bundleConfig = bundleConfig;
	}

}
