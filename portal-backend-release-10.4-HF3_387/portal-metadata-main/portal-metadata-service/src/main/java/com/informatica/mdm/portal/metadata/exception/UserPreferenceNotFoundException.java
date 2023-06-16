package com.informatica.mdm.portal.metadata.exception;

public class UserPreferenceNotFoundException extends PortalConfigException {
    /**
     *
     */
    private static final long serialVersionUID = 1L;

    public UserPreferenceNotFoundException(String errorCode, String errorMessage, String errorCause) {
        super(errorCode, errorMessage, errorCause);
    }
}