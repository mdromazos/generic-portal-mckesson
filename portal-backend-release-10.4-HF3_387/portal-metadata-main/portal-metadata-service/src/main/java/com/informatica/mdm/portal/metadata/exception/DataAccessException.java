package com.informatica.mdm.portal.metadata.exception;
/***
 * Data access layer exception used in email notification service
 * @author spandit
 *
 */
public class DataAccessException extends PortalConfigException {

	private static final long serialVersionUID = 1L;

	public DataAccessException(String errorCode, String errorMessage, String debugMessage) {
		super(errorCode, errorMessage, debugMessage);
	}
}