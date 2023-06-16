package com.informatica.mdm.solutions.pim.model;

public class BadRequestException extends PIMServiceException{

	private static final long serialVersionUID = 1L;
	
	public BadRequestException(String errorCode, String errorMessage, String errorCause) {
		super(errorCode, errorMessage, errorCause);
	}

}
