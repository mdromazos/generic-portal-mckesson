package com.informatica.mdm.portal.metadata.exception;

public class PortalLogoutException extends PortalConfigException{
	
	private static final long serialVersionUID = 1L;

	public PortalLogoutException(String errorCode, String errorMessage, String errorCause) {
		super(errorCode, errorMessage, errorCause);
	}
}
