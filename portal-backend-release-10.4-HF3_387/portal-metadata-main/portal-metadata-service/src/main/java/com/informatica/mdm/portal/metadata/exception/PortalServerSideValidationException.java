package com.informatica.mdm.portal.metadata.exception;

import java.io.IOException;
import java.util.Properties;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class PortalServerSideValidationException extends PortalConfigException {

	private static final long serialVersionUID = 1L;
	
	private JsonNode errorNode;

	public JsonNode getErrorNode() {
		return errorNode;
	}

	public void setErrorNode(JsonNode errorNode) {
		this.errorNode = errorNode;
	}
	
	public PortalServerSideValidationException(String errorCode, Properties errorCodeProperties,
			String errorCause, String errorResp, Properties externalErrorProperties, Properties beErrorMapping) {
		
		this(errorCode, errorCodeProperties.getProperty(errorCode), errorCause, errorResp, externalErrorProperties, beErrorMapping, errorCodeProperties);
	}

	public PortalServerSideValidationException(String errorCode, String errorMessage,
					String errorCause, String errorResp, Properties externalErrorProperties, Properties beErrorMapping, Properties errorCodeProperties) {
		
		super(errorCode, errorMessage, errorCause);
		
		ObjectMapper mapper = new ObjectMapper();
		errorNode = mapper.createArrayNode();
		try {
			JsonNode errorResponse = mapper.readTree(errorResp);
			if(errorResponse.isObject()) {
				String siperianErrorCode = errorResponse.get("errorCode").asText();
				
				if(null != beErrorMapping && null != siperianErrorCode) {
					String customErrorCode = beErrorMapping.getProperty(siperianErrorCode);
					if(!StringUtils.isEmpty(customErrorCode)) {
						this.setErrorCode(customErrorCode);
						this.setErrorMessage(errorCodeProperties.getProperty(customErrorCode));
					}
				}
				if(null != errorResponse.get("details") && errorResponse.get("details").isObject()) {
					JsonNode errorDetails = errorResponse.get("details");
					if(null != errorDetails.get("error") && errorDetails.get("error").isArray()) {
						ArrayNode errors = ((ArrayNode) errorDetails.get("error"));
						for(JsonNode error : errors) {
                            ObjectNode errNode = mapper.createObjectNode();
                            String validationErrorCode = error.get("code").asText("");
                            String errorContent = error.get("message").asText("");
                            String errorDesc = errorContent;
                            String errCode = errorCode;
                            if(null != externalErrorProperties) {
                                for(Object propsKey : externalErrorProperties.keySet()) {
                                    if(errorContent.contains(propsKey.toString())
                                            || validationErrorCode.equals(propsKey.toString())) {
                                        errorDesc = externalErrorProperties.getProperty((String) propsKey);
                                        errCode = (String) propsKey;
                                        break;
                                    }
                                }
                            }
							
							errNode.put("code", errCode);
							errNode.put("message", errorDesc);
							errNode.put("defaultMessage", errorContent);
							errNode.putArray("field").addAll((ArrayNode) error.get("field"));
							((ArrayNode) errorNode).add(errNode);
						}
					} else {
						ObjectNode errNode = mapper.createObjectNode(); 
						errNode.put("code", errorResponse.get("errorCode").asText());
						errNode.put("message", errorResponse.get("errorMessage").asText());
						errNode.put("defaultMessage", errorCause);
						((ArrayNode) errorNode).add(errNode);
					}
				} else {
					
					ObjectNode errNode = mapper.createObjectNode(); 
					errNode.put("code", errorResponse.get("errorCode").asText());
					errNode.put("message", errorResponse.get("errorMessage").asText());
					errNode.put("defaultMessage", errorCause);
					((ArrayNode) errorNode).add(errNode);
				}
			}
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}
