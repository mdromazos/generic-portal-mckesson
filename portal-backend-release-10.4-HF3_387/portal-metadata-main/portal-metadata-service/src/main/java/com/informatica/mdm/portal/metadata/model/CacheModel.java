package com.informatica.mdm.portal.metadata.model;

import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

public class CacheModel {

	private String orsId;
	private String username;
	private String externalType;
	private String externalName;
	private String urlContext;
	private String selectedLocale;

	public CacheModel(String orsId, String username, String externalType, String externalName, String urlContext) {

		this.orsId = null == orsId ? "" : orsId;
		this.username = null == username ? "" : username;
		this.externalType = null == externalType ? "" : externalType;
		this.externalName = null == externalName ? "" : externalName;
		this.urlContext = null == urlContext ? "" : urlContext;
	}
	
	public CacheModel(String orsId, String username, String externalType, String externalName, String urlContext, String selectedLocale) {

		this.orsId = null == orsId ? "" : orsId;
		this.username = null == username ? "" : username;
		this.externalType = null == externalType ? "" : externalType;
		this.externalName = null == externalName ? "" : externalName;
		this.urlContext = null == urlContext ? "" : urlContext;
		this.selectedLocale = null == selectedLocale ? PortalServiceConstants.DEFAULT_LOCALE : selectedLocale;
	}

	public String getSelectedLocale() {
		return selectedLocale;
	}

	public String getOrsId() {
		return orsId;
	}

	public String getUsername() {
		return username;
	}

	public String getExternalType() {
		return externalType;
	}

	public String getExternalName() {
		return externalName;
	}

	public String getUrlContext() {
		return urlContext;
	}

	@Override
	public int hashCode() {

		int prime = 31;
		int result = 1;
		result = prime * result + ((orsId == null) ? 0 : orsId.hashCode());
		result = prime * result + ((username == null) ? 0 : username.hashCode());
		result = prime * result + ((externalType == null) ? 0 : externalType.hashCode());
		result = prime * result + ((externalName == null) ? 0 : externalName.hashCode());
		result = prime * result + ((urlContext == null) ? 0 : urlContext.hashCode());
		result = prime * result + ((selectedLocale == null) ? 0 : selectedLocale.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object object) {

		if (null == object) {
			return false;
		}

		CacheModel cache = (CacheModel) object;

		if (this.getUsername().equalsIgnoreCase(cache.getUsername())
				&& this.getUrlContext().equalsIgnoreCase(cache.getUrlContext())
				&& this.getOrsId().equalsIgnoreCase(cache.getOrsId())
				&& this.getExternalType().equalsIgnoreCase(cache.getExternalType())
				&& this.getExternalName().equalsIgnoreCase(cache.getExternalName())
				&& this.getSelectedLocale().equalsIgnoreCase(cache.getSelectedLocale())) {
			return true;
		}
		return false;
	}

}
