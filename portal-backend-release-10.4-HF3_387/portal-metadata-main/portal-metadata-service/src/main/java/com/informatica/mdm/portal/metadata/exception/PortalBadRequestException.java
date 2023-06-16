package com.informatica.mdm.portal.metadata.exception;

import com.informatica.mdm.portal.metadata.exception.PortalConfigException;

public class PortalBadRequestException extends PortalConfigException {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public PortalBadRequestException(String errorCode, String errorMessage, String errorCause) {
		super(errorCode, errorMessage, errorCause);
	}
}
