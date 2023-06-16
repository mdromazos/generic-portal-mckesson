package com.informatica.mdm.portal.metadata.auth.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.exception.PortalLogoutException;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.informatica.mdm.portal.metadata.model.SAMLConfig;

import java.io.IOException;
import java.util.Map;

public interface AuthenticationDispatchService {

	void dispatch(HttpServletRequest request, HttpServletResponse response, String provider, String orsId, String portalId , Boolean validate) throws PortalLoginException;
	
	Map<String, String> dispatchLogout(HttpServletRequest request, HttpServletResponse response, String userName, String orsId, String portalId) throws PortalLogoutException;

	LoginData process(HttpServletRequest request, HttpServletResponse response, String orsId, String portalId) throws PortalLoginException;

	void loginSuccessRedirectHandler(HttpServletRequest request, HttpServletResponse response, String portalId, String orsId,
									 Map<String, Object> userInfo) throws PortalLoginException;

	void redirectLoginPage(HttpServletRequest request, HttpServletResponse response, String orsId, String portalId, String errorCode) throws PortalLoginException;
}
