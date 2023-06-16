package com.informatica.mdm.portal.metadata.util;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.delos.cmx.server.MDMSessionException;
import com.delos.cmx.server.datalayer.ConnectionData;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.delos.util.base64.Base64;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.siperian.sam.BaseSecurityCredential;
import com.siperian.sif.client.CertificateHelper;

@Component
public class PortalRestUtil {
	
	private static RestTemplate restTemplate;
	private static String portalCmxUrl;
	
	@Autowired
	public void setRestTemplate(RestTemplate restTemplate) {
		this.restTemplate=restTemplate;
	}

	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}
	
	private final static Logger log = LoggerFactory.getLogger(PortalConfigException.class);

	public static boolean isSessionValid(HttpServletRequest request,String sessionId,String ict) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.add(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, ict);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			headers.add("Cookie", PortalRestConstants.MDM_SESSION_ID_COOKIE+"="+sessionId);
			String url = String.format(PortalRestConstants.MDM_SESSION_URL,portalCmxUrl ,PortalRestConstants.SESSION_VALIDATE_ACTION);
			ResponseEntity<String> response = PortalConfigUtil.executeRest(url, HttpMethod.POST, null, headers, restTemplate);
			if(response.getStatusCode()==HttpStatus.OK)
				return true;
		} catch(Exception e) { 
			log.error("Error while validating session {}",e.getMessage());
		}
		return false;
	}
	public static String getCookieValue(HttpServletRequest request, String cookieName) {

		String result = null;
		try{
			Cookie[] cookies = request.getCookies();
			if (cookies != null) {
				for (Cookie cookie : cookies){
					if (cookie.getName().equals(cookieName)) {
						result = cookie.getValue();
						break;
					}
				}
			}
		} catch(Exception e) { }
		return result;
	}

	public static String getCookieValue(HttpServletRequest request, String cookieName, String encoding) {

		String result = null;
		try{
			Cookie[] cookies = request.getCookies();
			if (cookies != null) {
				for (Cookie cookie : cookies){
					if (cookie.getName().equals(cookieName)) {
						result =  URLDecoder.decode(cookie.getValue(), encoding);
						break;
					}
				}
			}
		} catch(Exception e) { }
		return result;
	}
	
	public static Cookie createCookie(String name, String value,
			String uri, boolean isSession, boolean httpOnly) {

		Cookie cookie = new Cookie(name, value);
		cookie.setPath(uri);
		if (isSession) {
			cookie.setMaxAge(-1);
		}
		setHttpOnlyCookie(cookie, httpOnly);
		return cookie;
	}

	//Only for UI cookie , DONT use for token . Problem will create for weblogic
	public static Cookie createCookie(String name, String value,
									  String uri, boolean isSession, boolean httpOnly , String encoding) {

		Cookie cookie = null;
		try {
			cookie = new Cookie(name, URLEncoder.encode(value, encoding).replace("+", "%20"));
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			cookie = new Cookie(name, value);
		}
		cookie.setPath(uri);
		if (isSession) {
			cookie.setMaxAge(-1);
		}
		setHttpOnlyCookie(cookie, httpOnly);
		return cookie;
	}
	
	private static void setHttpOnlyCookie(Cookie obj, boolean value) {
        try {
            Method setHttpOnly = obj.getClass()
            		.getMethod(PortalRestConstants.COOKIE_HTTP_SET_METHOD, boolean.class);
            setHttpOnly.invoke(obj, value);
        } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
            // ignore exception It's normal case that method is not available
        }
    }
	
	public static Credentials getCredentials(HttpServletRequest request,String cookieName) throws PortalConfigException {
		HubClient hubClient = HubClient.getInstance();
		BaseSecurityCredential baseSecurityCredentials = new BaseSecurityCredential();
		byte[] securityPayload = (PortalRestConstants.PAYLOAD_MDM_SESSION
				+ getCookieValue(request, cookieName)).getBytes();
		baseSecurityCredentials.setPayload(securityPayload);
		ConnectionData connectionData;
		try {
			connectionData = hubClient.getAdminLoginBean().loginUser(baseSecurityCredentials);
		} catch (AccessException e) {
			log.error("Error on authentication ");
			throw new PortalConfigException(e);
		}
		Credentials credentials = new Credentials(connectionData.getConnectedUser().getUserName(), 
				securityPayload);
		return credentials;
	}

	public static List<String> parseConfigUrl(String url) {

	    String partialUrl = StringUtils.substringAfter(url, PortalRestConstants.PORTAL_CONFIG_URI);
        List<String> urlPath = Arrays.asList(StringUtils.split(partialUrl, "/"));
        return urlPath;
    }
	
	public static List<String> parsePortalUrl(String url) {

	    String partialUrl = StringUtils.substringAfter(url, PortalRestConstants.PORTAL_UI_URI);
        List<String> urlPath = Arrays.asList(StringUtils.split(partialUrl, "/"));
        return urlPath;
    }
	
	public static Map<String,Object> getUserSessionData(String sessionId) throws MDMSessionException{
		HubClient hubClient = HubClient.getInstance();
		Map<String, Object> userSession = (Map<String, Object>) hubClient.getAdminLoginBean()
				.getSessionAttribute(sessionId, PortalRestConstants.USER_SESSION_ATTRIB);
		return userSession;
	}
	
	public static String getEncryptedPassword(String password) throws InvalidKeySpecException, NoSuchAlgorithmException, InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException {
		CertificateHelper certificateHelper = CertificateHelper.getInstance();
		PublicKey publicKey = certificateHelper.getPublicKey(PortalRestConstants.HUB);
		password = Base64.encodeBytes(certificateHelper.encrypt(password.getBytes(StandardCharsets.UTF_8), publicKey),Base64.DONT_BREAK_LINES);
		 return password;      
	}
}
