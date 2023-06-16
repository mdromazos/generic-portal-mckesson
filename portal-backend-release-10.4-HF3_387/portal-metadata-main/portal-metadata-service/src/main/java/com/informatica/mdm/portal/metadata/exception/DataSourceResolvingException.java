package com.informatica.mdm.portal.metadata.exception;

import com.informatica.mdm.portal.metadata.exception.PortalConfigException;

public class DataSourceResolvingException extends PortalConfigException {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public DataSourceResolvingException(String errorCode, String errorMessage, String errorCause) {
		super(errorCode, errorMessage, errorCause);
	}
}
