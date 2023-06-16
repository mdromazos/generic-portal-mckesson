package com.informatica.mdm.portal.metadata.exception;

public class PortalLoginException extends PortalConfigException {

	private static final long serialVersionUID = 1L;

	public PortalLoginException(String errorCode, String errorMessage, String errorCause) {
		super(errorCode, errorMessage, errorCause);
	}

}
