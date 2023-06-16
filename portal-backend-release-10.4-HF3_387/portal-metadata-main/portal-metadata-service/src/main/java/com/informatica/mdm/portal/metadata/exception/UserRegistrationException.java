package com.informatica.mdm.portal.metadata.exception;

import java.io.IOException;
import java.util.Properties;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class UserRegistrationException extends PortalConfigException {

	private static final long serialVersionUID = 1L;

	private JsonNode errorNode;

	public JsonNode getErrorNode() {
		return errorNode;
	}

	public void setErrorNode(JsonNode errorNode) {
		this.errorNode = errorNode;
	}
	
	public UserRegistrationException(String errorCode, String errorMessage, String errorCause) {
		super(errorCode, errorMessage, errorCause);
	}
	
	public UserRegistrationException(String errorCode, String errorMessage, String errorCause, String errorResp,
			Properties externalErrorProperties) {

		super(errorCode, errorMessage, errorCause);

		ObjectMapper mapper = new ObjectMapper();
		errorNode = mapper.createArrayNode();
		try {
			JsonNode errorResponse = mapper.readTree(errorResp);
			if (errorResponse.isObject()) {
				if (null != errorResponse.get("details") && errorResponse.get("details").isObject()) {
					JsonNode errorDetails = errorResponse.get("details");
					if (null != errorDetails.get("error") && errorDetails.get("error").isArray()) {
						ArrayNode errors = ((ArrayNode) errorDetails.get("error"));
						for (JsonNode error : errors) {
							ObjectNode errNode = mapper.createObjectNode();
							String errorContent = error.get("message").asText("");
							String errorDesc = errorMessage;
							String errCode = errorCode;
							if (null != externalErrorProperties) {
								for (Object propsKey : externalErrorProperties.keySet()) {
									if (errorContent.contains(propsKey.toString())) {
										errorDesc = externalErrorProperties.getProperty((String) propsKey);
										errCode = (String) propsKey;
										break;
									}
								}
							}

							errNode.put("code", errCode);
							errNode.put("message", errorDesc);
							errNode.put("defaultMessage", errorContent);
//							errNode.putArray("field").addAll((ArrayNode) error.get("field"));
                            errNode.putArray("field").add(error.get("field").get(0));
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
