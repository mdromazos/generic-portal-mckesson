package com.informatica.mdm.portal.metadata.exception;

public class ResourceNotFoundException extends PortalConfigException {

	private static final long serialVersionUID = 1L;

	public ResourceNotFoundException(String errorCode, String errorMessage, String debugMessage) {
		super(errorCode, errorMessage, debugMessage);
	}

}
