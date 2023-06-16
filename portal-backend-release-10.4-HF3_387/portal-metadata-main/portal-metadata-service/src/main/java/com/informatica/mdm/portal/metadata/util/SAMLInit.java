/*
 * SAMLInit - Library initialization routines.
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
package com.informatica.mdm.portal.metadata.util;

import org.opensaml.DefaultBootstrap;
import org.opensaml.xml.ConfigurationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.informatica.mdm.portal.metadata.exception.SAMLException;

/**
 * Library initialization routines.
 *
 * Applications must call SAMLInit.initialize() before anything else!
 */
public class SAMLInit {
	private static boolean bootStrapped = false;
	private final static Logger log = LoggerFactory.getLogger(SAMLInit.class);
	
    protected SAMLInit()
    {
    }

    public static void initialize()
        throws SAMLException
    {
    	if (!bootStrapped) {
    		try {
                DefaultBootstrap.bootstrap();
            } catch (ConfigurationException e) {
                throw new SAMLException(e);
            }
    	}
        
    }
    

}
