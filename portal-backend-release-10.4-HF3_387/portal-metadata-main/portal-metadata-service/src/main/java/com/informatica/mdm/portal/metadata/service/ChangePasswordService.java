package com.informatica.mdm.portal.metadata.service;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;


import com.informatica.mdm.cs.server.rest.Credentials;

public interface ChangePasswordService {

	Map<String,Object> changePassword(Credentials credentials, String mdmSessionId, String orsId , String portalId, String changePassJson,
             HttpServletRequest request,String ict) throws Exception;

    
	Map<String,Object> generateForgotPasswordLink(String orsId,String portalId, String resetPassJson, HttpServletRequest request)
    		throws Exception;
    
   
}
