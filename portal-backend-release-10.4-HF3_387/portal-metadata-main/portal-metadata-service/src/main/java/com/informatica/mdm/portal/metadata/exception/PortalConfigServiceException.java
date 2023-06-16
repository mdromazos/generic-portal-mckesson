package com.informatica.mdm.portal.metadata.exception;

public class PortalConfigServiceException extends PortalConfigException {

	private static final long serialVersionUID = 1L;

	public PortalConfigServiceException(String errorCode, String errorMessage, String errorCause) {
		super(errorCode, errorMessage, errorCause);
	}

}
