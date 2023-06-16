/*
 * SAMLException - Library-specific exceptions
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Copyright (c) 2014 LastPass, Inc.
 */
package com.informatica.mdm.portal.metadata.exception;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;

public class SAMLException extends Exception
{
	private final static Logger log = LoggerFactory.getLogger(SAMLException.class);
    private static final long serialVersionUID = 1L;
	
	private String errorCode;
	
	private String errorMessage;
	
	private List<String> errorCauses;
	
	private JsonNode responseNode;

	public String getErrorCode() {
		return errorCode;
	}

	public String getErrorMessage() {
		return errorMessage;
	}
	
	public SAMLException(String reason)
    {
        super(reason);
    }

	public SAMLException(String errorCode, String errorMessage, String errorCause) {
		super();
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.setErrorCauses(errorCause);
	}
	
	public SAMLException(String errorCode, String errorMessage, String errorCause, JsonNode responseNode) {
		super();
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.setErrorCauses(errorCause);
		this.responseNode = responseNode;
	}

	public SAMLException(Exception e) {
		super(e);
		log.error(e.getMessage());
	}

	public JsonNode getResponseNode() {
		return responseNode;
	}

	public List<String> getErrorCauses() {
		return errorCauses;
	}

	public void setErrorCauses(String errorCause) {
		if(null == this.errorCauses) {
			this.errorCauses = new ArrayList<String>();
		}
		this.errorCauses.add(errorCause);
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}
}
