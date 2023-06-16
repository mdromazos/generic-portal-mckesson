package com.informatica.mdm.portal.metadata.model;

import java.io.Serializable;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

public class LoginPayload implements Serializable{

	private static final long serialVersionUID = 1L;
	private String username;
	private UserPassword password;
	private Map<String, Object> userInfo;

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Map<String, Object> getUserInfo() {
		return userInfo;
	}

	public void setUserInfo(Map<String, Object> userInfo) {
		this.userInfo = userInfo;
	}

	public UserPassword getPassword() {
		return password;
	}

	public void setPassword(UserPassword password) {
		this.password = password;
	}
	
	public String toString() {
		return new Gson().toJson(this, LoginPayload.class);
	}
}
