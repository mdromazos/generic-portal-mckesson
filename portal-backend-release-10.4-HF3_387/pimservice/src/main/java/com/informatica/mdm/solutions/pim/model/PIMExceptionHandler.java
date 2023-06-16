package com.informatica.mdm.solutions.pim.model;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@ControllerAdvice
public class PIMExceptionHandler  extends ResponseEntityExceptionHandler {

	@Autowired
	ObjectMapper mapper;
	
	@ExceptionHandler({PIMServiceException.class})
	public ResponseEntity<JsonNode> handleException(HttpServletRequest request,PIMServiceException exception){
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorMessage", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCause", exception.getErrorCause());
		exceptionNode.putPOJO("status", HttpStatus.INTERNAL_SERVER_ERROR);
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@ExceptionHandler({BadRequestException.class})
	public ResponseEntity<JsonNode> handleBadRequestException(HttpServletRequest request,BadRequestException exception){
		ObjectNode exceptionNode = mapper.createObjectNode();
		exceptionNode.put("errorCode", exception.getErrorCode());
		exceptionNode.put("errorMessage", exception.getErrorMessage());
		exceptionNode.putPOJO("errorCause", exception.getErrorCause());
		exceptionNode.putPOJO("status", HttpStatus.BAD_REQUEST);
		return new ResponseEntity<JsonNode>(exceptionNode, HttpStatus.BAD_REQUEST);
	}
}
