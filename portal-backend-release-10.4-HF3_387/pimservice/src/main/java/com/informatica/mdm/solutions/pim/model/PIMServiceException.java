package com.informatica.mdm.solutions.pim.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PIMServiceException extends Exception {

	private static final long serialVersionUID = 1L;

	private final static Logger log = LoggerFactory.getLogger(PIMServiceException.class);
	
	private String errorCode;
	
	private String errorMessage;
	
	private String errorCause;

	public PIMServiceException(String errorCode, String errorMessage, String errorCause) {
		super();
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.errorCause = errorCause;
	}

	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public String getErrorCause() {
		return errorCause;
	}

	public void setErrorCause(String errorCause) {
		this.errorCause = errorCause;
	}
	
}
