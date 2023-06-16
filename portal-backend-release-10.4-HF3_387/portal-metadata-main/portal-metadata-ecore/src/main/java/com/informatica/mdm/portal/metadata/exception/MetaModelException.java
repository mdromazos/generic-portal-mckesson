package com.informatica.mdm.portal.metadata.exception;

/**
 * ServiceException indicates some problem with the service.
 * ServiceException must refer to ServiceExceptionCode which identifies unique place where error has happened.
 * The code can be optionally translated in errorCodes bundle, in this case
 * service returns correspondent message along with the error code.
 * For non-translated errors service returns some default message.
 * 
 * This class is abstract to force core and v10 modules to override it.
 * 
 * @author klyzo
 */
public class MetaModelException extends PortalConfigException {

    private static final long serialVersionUID = 1L;
    
    public MetaModelException(String errorCode, String errorMessage, String errorCause) {
 		super(errorCode, errorMessage, errorCause);
 	}
    
}
