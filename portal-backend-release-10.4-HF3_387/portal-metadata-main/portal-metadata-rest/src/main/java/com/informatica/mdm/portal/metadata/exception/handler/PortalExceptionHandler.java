package com.informatica.mdm.portal.metadata.exception.handler;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.exception.DataSourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.DataSourceResolvingException;
import com.informatica.mdm.portal.metadata.exception.PortalAlreadyExistException;
import com.informatica.mdm.portal.metadata.exception.PortalBadRequestException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.exception.PortalServerSideValidationException;
import com.informatica.mdm.portal.metadata.exception.RecordRegistrationException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.UserRegistrationException;
import com.informatica.mdm.portal.metadata.exception.UserPreferenceNotFoundException;

@ControllerAdvice
public class PortalExceptionHandler extends ResponseEntityExceptionHandler {

	@Autowired
	ObjectMapper mapper;

	@ExceptionHandler({ DataSourceNotFoundException.class })
	public ResponseEntity<JsonNode> handleDataSource(HttpServletRequest request,
			DataSourceNotFoundException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.INTERNAL_SERVER_ERROR);
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler({ DataSourceResolvingException.class })
	public ResponseEntity<JsonNode> handleDataSourceReslover(HttpServletRequest request,
			DataSourceResolvingException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.INTERNAL_SERVER_ERROR);
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler({ ResourceNotFoundException.class })
	public ResponseEntity<JsonNode> handleNotFound(HttpServletRequest request, ResourceNotFoundException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.NOT_FOUND);
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler({ PortalAlreadyExistException.class })
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request, PortalAlreadyExistException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.INTERNAL_SERVER_ERROR);
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@ExceptionHandler({ PortalBadRequestException.class })
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request, PortalBadRequestException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.BAD_REQUEST);
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler({ PortalLoginException.class })
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request, PortalLoginException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.UNAUTHORIZED);
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.UNAUTHORIZED);
	}

	@ExceptionHandler({ PortalServerSideValidationException.class })
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request, PortalServerSideValidationException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.BAD_REQUEST);
		exceptionNode.putArray("errorData").addAll((ArrayNode) exception.getErrorNode());
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler({ UserRegistrationException.class })
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request, UserRegistrationException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.BAD_REQUEST);
		exceptionNode.putArray("errorData").addAll((ArrayNode) exception.getErrorNode());
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler({ RecordRegistrationException.class })
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request, RecordRegistrationException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.BAD_REQUEST);
		exceptionNode.putArray("errorData").addAll((ArrayNode) exception.getErrorNode());
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler({ PortalConfigException.class })
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request, PortalConfigException exception) {
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorSummary", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
		exceptionNode.putPOJO("status", HttpStatus.INTERNAL_SERVER_ERROR);
		exceptionNode.put("path", request.getRequestURI());
		exceptionNode.put("host", request.getServerName());
		exceptionNode.put("port", request.getServerPort());
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.INTERNAL_SERVER_ERROR);
	}

    @ExceptionHandler({ UserPreferenceNotFoundException.class })
    public ResponseEntity<JsonNode> handleException(HttpServletRequest request, UserPreferenceNotFoundException exception) {
        ObjectNode exceptionNode = mapper.createObjectNode();
        exceptionNode.put("errorCode", exception.getErrorCode());
        exceptionNode.put("errorSummary", exception.getErrorMessage());
        exceptionNode.putPOJO("errorCauses", exception.getErrorCauses());
        exceptionNode.putPOJO("status", HttpStatus.INTERNAL_SERVER_ERROR);
        exceptionNode.put("path", request.getRequestURI());
        exceptionNode.put("host", request.getServerName());
        exceptionNode.put("port", request.getServerPort());
        return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
