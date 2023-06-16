package com.informatica.mdm.portal.metadata.rest;


import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.service.ChangePasswordService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RestController
public class ChangePasswordController
{
    @Autowired
    private ChangePasswordService changePasswordService;
    
    @RequestMapping(value = {"/portals/{portalId}/changepassword"}, method= RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String,Object>> changePassword(@PathVariable String portalId,@RequestBody String changePassJson, HttpServletResponse response,
                                    HttpServletRequest request) throws Exception {

        
        String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
        Credentials credentials = PortalRestUtil.getCredentials(request,PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
        String mdmSessionId = PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
        String ict = PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_CSRF_TOKEN_UI+"-"+orsId+"-"+portalId);
		Map<String,Object> resp = changePasswordService.changePassword(credentials, mdmSessionId,orsId, null,changePassJson, request,ict);
        
        return new ResponseEntity<>(resp, HttpStatus.OK);

    }

    @RequestMapping(value = {"/global/portals/{portalId}/forgotpasswordlink"}, method= RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String,Object>> generateForgotPasswordLink(@PathVariable String portalId ,@RequestBody String resetPassJson, HttpServletResponse response,
            HttpServletRequest request) throws Exception 
    {
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
    	Map<String,Object> res = changePasswordService.generateForgotPasswordLink(orsId, portalId,resetPassJson,request);
    	return new ResponseEntity<>(res, HttpStatus.OK);
    }
    

    @RequestMapping(value = {"/global/portals/{portalId}/forgotpassword"}, method= RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String,Object>> verifyLinkAndChangePassword(@PathVariable String portalId,@RequestBody String changePassJson, HttpServletResponse response,
            HttpServletRequest request) throws Exception 
    {
    	String orsId = request.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		
    	Map<String,Object> res = changePasswordService.changePassword(null, null,orsId, portalId, changePassJson, request,null);
		return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
}
