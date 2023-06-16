package com.informatica.mdm.portal.metadata.exception;

public enum ServiceExceptionCode {

    INTERNAL_ERROR(1000, "Internal error"),
    CANT_LOAD_CONFIGURATION_FILE(1001, "Can't load configuration file"),
    CANT_LOAD_METAMODEL_FROM_FILE(1002, "Can't load metamodel from file: {0}"),
    CANT_LOAD_MODEL_FROM_FILE(1003, "Can't load model from file: {0}"),
    ONLY_ONE_EPACKAGE_IS_EXPECTED_IN_METAMODEL(1004, "In the root of the file {0} should be only one EPackage"),
    ONLY_ONE_EOBJECT_IS_EXPECTED_IN_MODEL(1005, "In the root of the file {0} should be only one EObject"),
    CANT_LOAD_MODEL_INTO_FILE(1006, "Can't save model into file: {0}"),
    CANT_WRITE_INTO_TEMPORARY_FILE(1007, "Can't write into temporary file: {0}"),
    CONTEXT_IS_NOT_INITIALIZED_PROPERLY(1008, "Context is not initialized properly, it should point to filename, resource or byte[]"),
    ERROR_WHILE_READING_BYTES_FROM_RESOURCE(1009, "Error while reading bytes from the resource"),
    CANT_CREATE_TEMPORARY_FILE(1010, "Can't create temporary file"),
    ERROR_WHILE_WRITING_BYTES_TO_RESOURCE(1011, "Error while writting bytes to the resource"),
    ERROR_INVALID_URL(1012, "Invalid URL");

    private final int code;

    private final String internalMessage;

    ServiceExceptionCode(int code, String internalMessage) {
        this.code = code;
        this.internalMessage = internalMessage;
    }

    public int getCode() {
        return code;
    }

    public String getInternalMessage() {
        return internalMessage;
    }
}
