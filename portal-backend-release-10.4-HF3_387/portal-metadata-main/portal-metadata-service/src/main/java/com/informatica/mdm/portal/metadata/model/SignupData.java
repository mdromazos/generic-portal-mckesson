package com.informatica.mdm.portal.metadata.model;

import com.google.gson.JsonObject;

public class SignupData {
	
	private JsonObject BEData;
	private JsonObject userData;
	
	public JsonObject getBEData() {
		return BEData;
	}
	public void setBEData(JsonObject BEData) {
		this.BEData = BEData;
	}
	public JsonObject getUserData() {
		return userData;
	}
	public void setUserData(JsonObject userData) {
		this.userData = userData;
	}

}
