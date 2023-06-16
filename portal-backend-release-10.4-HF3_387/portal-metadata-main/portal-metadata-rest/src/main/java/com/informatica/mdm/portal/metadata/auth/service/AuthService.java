package com.informatica.mdm.portal.metadata.auth.service;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.siperian.sif.message.mrm.AuthenticateResponse;

public interface AuthService {

	public Map<String, Object> login(String username, String password, String sessionId,
			boolean isPortal, Map<String, Object> userInfo,String initialUrl) throws PortalLoginException;

	public void logout(HttpServletRequest request,
			String cookieName,String ictCookie) throws PortalLoginException;

	public Map<String, Object> getUserInfo(LoginData loginData,
			String orsId, String portalId) throws PortalLoginException;

	public boolean authorise(Credentials credentials,
			List<String> role) throws PortalLoginException;

	public AuthenticateResponse authenticate(Credentials credentials);
	
	void refreshSession(HttpServletRequest request,
			String portalSessionId, Integer sessionTimeOut,String ict) throws PortalLoginException;

}

