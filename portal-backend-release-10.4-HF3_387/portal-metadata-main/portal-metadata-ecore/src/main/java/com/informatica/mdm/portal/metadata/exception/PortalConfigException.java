package com.informatica.mdm.portal.metadata.exception;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;

public class PortalConfigException extends Exception {

	private final static Logger log = LoggerFactory.getLogger(PortalConfigException.class);
	
	private static final long serialVersionUID = 1L;
	
	private String errorCode;
	
	private String errorMessage;
	
	private List<String> errorCauses;
	
	private JsonNode responseNode;

	public String getErrorCode() {
		return errorCode;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public PortalConfigException(String errorCode, String errorMessage, String errorCause) {
		super();
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.setErrorCauses(errorCause);
	}
	
	public PortalConfigException(String errorCode, String errorMessage, String errorCause, JsonNode responseNode) {
		super();
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.setErrorCauses(errorCause);
		this.responseNode = responseNode;
	}

	public PortalConfigException(Exception e) {
		super(e);
		log.error(e.getMessage());
	}

	public JsonNode getResponseNode() {
		return responseNode;
	}

	public List<String> getErrorCauses() {
		return errorCauses;
	}

	public void setErrorCauses(String errorCause) {
		if(null == this.errorCauses) {
			this.errorCauses = new ArrayList<String>();
		}
		this.errorCauses.add(errorCause);
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

}
