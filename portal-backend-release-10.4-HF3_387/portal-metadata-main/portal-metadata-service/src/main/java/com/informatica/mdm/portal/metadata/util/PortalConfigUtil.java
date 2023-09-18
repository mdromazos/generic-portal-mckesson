package com.informatica.mdm.portal.metadata.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.Properties;
import java.util.Iterator;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.delos.cmx.server.MDMSessionException;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.siperian.sif.client.CertificateHelper;
@Component
public class PortalConfigUtil {
	
	private static Properties errorCodeProperties;
	
	private final static Logger log = LoggerFactory.getLogger(PortalConfigUtil.class);
	
	public static Properties properties = null;
	private static PortalPersistenceService portalPersistenceService;
    private static ObjectMapper objectMapper;

    @Autowired
    public void setPortalPersistenceService(PortalPersistenceService portalPersistenceService) {
        this.portalPersistenceService = portalPersistenceService;
    }

    @Autowired
    public void setObjectMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
	
	public static Properties getErrorCodeProperties() {
		return errorCodeProperties;
	}

	public static void setErrorCodeProperties(Properties errorCodeProperties) {
		PortalConfigUtil.errorCodeProperties = errorCodeProperties;
	}

	public static String formatDate(Date date) {
		
		DateFormat df = new SimpleDateFormat(PortalServiceConstants.DATE_FORMAT);
		return null != date ? df.format(date) : null;
	}
	
	public static String formatToApplicationDate(Date date) {
		
		DateFormat df = new SimpleDateFormat(PortalServiceConstants.APPLICATION_DATE_FORMAT);
		return null != date ? df.format(date) : null;
	}
	
	public static Date formatDate(String dateString) throws PortalConfigServiceException {
		
		DateFormat formatter = new SimpleDateFormat(PortalServiceConstants.DATE_FORMAT);
		Date date = null;
		try {
			date =  null != dateString ? formatter.parse(dateString) : null;
		} catch (ParseException e) {
			log.error("Error on formatting date string {} ", dateString, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}
		return date;
	}
	
	public static Date formatApplicationDate(String dateString) {
		
		DateFormat formatter = new SimpleDateFormat(PortalServiceConstants.APPLICATION_DATE_FORMAT);
		Date date = null;
		try {
			date =  null != dateString ? formatter.parse(dateString) : null;
		} catch (ParseException e) {
			log.error("Error on formatting date string {} ", dateString, e.getMessage());
		}
		return date;
	}
	
	public static String getServerHomeDirectory() {
		
		String result = null;
		try {
			InitialContext context = getInitialContext();
			Context con = (Context) context.lookup(PortalServiceConstants.SIPERIAN);
			result = (String) con.lookup(PortalServiceConstants.SIPERIAN_HOME);
		} catch (NamingException e) {
		}
		return result;
	}
	
	protected static InitialContext getInitialContext() {
		
		InitialContext result = null;
		try {
			result = new InitialContext();
		} catch (NamingException e) {
			
		}
		return result;
	}
	
	public static void initializeHubServerPropertiesStorage() {
		
		String propertyfilePath = getServerHomeDirectory() + File.separator + PortalServiceConstants.CMX_PROPERTIES;
		if (properties == null) {
			properties = new Properties();
			FileInputStream fis = null;
			try {
				fis = new FileInputStream(propertyfilePath);
				properties.load(fis);
			}catch(IOException e) {
				
			}finally {
				try {
					if (fis != null) {
						fis.close();
					}
				} catch (Exception e) {
					
				}
			}
		}		
	}

	public static String getSecurityPayloadForRest(String userName, String orsId, String requestName)
			throws PortalConfigException {

		String securityPayload = "";
		try {
			log.debug("Generating securitypayload using infaPortal application user");
			CertificateHelper certificateHelper = new CertificateHelper(getServerHomeDirectory());
			String applicationName = "";
			String user = "";
			if (userName.contains("/")) {
				String[] userApplication = userName.split("/");
				applicationName = userApplication[0];
				user = userApplication[1];
			} else {
				applicationName = "infaPortal";
				user = userName;
			}
			securityPayload = certificateHelper.getSecurityPayloadForRestAsHttpHeader("", orsId, requestName,
					applicationName, applicationName + "/" + user);
			log.debug("Securitypayload generated successfully");
		} catch (Exception e) {
			log.error("Unable to generate securitypayload : " + e.getMessage());
			throw new PortalConfigException(e);
		}
		return securityPayload;
	}
	
	
	public static String getSecurityPayload(String userName, String orsId, String requestName)
			throws PortalConfigException {

		String securityPayload = "";
		try {
			log.debug("Generating securitypayload using infaPortal application user");
			CertificateHelper certificateHelper = new CertificateHelper(getServerHomeDirectory());
			String applicationName = "";
			String user = "";
			if (userName.contains("/")) {
				String[] userApplication = userName.split("/");
				applicationName = userApplication[0];
				user = userApplication[1];
			} else {
				applicationName = "infaPortal";
				user = userName;
			}
			securityPayload = certificateHelper.getEncryptedSecurityPayload("", orsId, requestName,
					applicationName, applicationName + "/" + user);
			log.debug("Securitypayload generated successfully");
		} catch (Exception e) {
			log.error("Unable to generate securitypayload : " + e.getMessage());
			throw new PortalConfigException(e);
		}
		return securityPayload;
	}
	
	public static ResponseEntity<String> executeRest(String url, HttpMethod httpMethod, String body,
			HttpHeaders headers, RestTemplate restTemplate) {

		ResponseEntity<String> response;
		HttpEntity<?> request = null;
		if (body != null && !body.isEmpty()) {
			request = new HttpEntity<Object>(body, headers);
		} else {
			request = new HttpEntity<Object>(headers);
		}
		response = restTemplate.exchange(url, httpMethod, request, String.class);
		return response;
	}
	
	public static Resource loadFileFromClasspath(String path,
			PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver) {

		Resource resource = pathMatchingResourcePatternResolver.getResource(path);
		log.info("Runtime Config processing the file {}", resource.getFilename());
		return resource;
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
	
	public static Map<String,Object> getUserSessionData(String sessionId) throws MDMSessionException{
		HubClient hubClient = HubClient.getInstance();
		Map<String, Object> userSession = (Map<String, Object>) hubClient.getAdminLoginBean()
				.getSessionAttribute(sessionId, PortalServiceConstants.USER_SESSION_ATTRIB);
		return userSession;
	}
	
	public static String getSessionAttribute(String sessionId,String attibName) throws MDMSessionException{
		HubClient hubClient = HubClient.getInstance();
		Map<String, Object> userSession = (Map<String, Object>) hubClient.getAdminLoginBean()
				.getSessionAttribute(sessionId, PortalServiceConstants.USER_SESSION_ATTRIB);
		return userSession.get(attibName)!=null ? (String)userSession.get(attibName):null;
	}
	
	public static String stateEvaluation(String publishedState, String draftState) {

		if (null == publishedState) {
			return draftState;
		}

		if (draftState.equals(PortalMetadataContants.PORTAL_STATUS_INVALID)
				|| (draftState.equals(PortalMetadataContants.PORTAL_STATUS_STOP)
						&& publishedState.equals(PortalMetadataContants.PORTAL_STATUS_INVALID))) {
			return draftState;
		} else {
			return publishedState;
		}
	}

    public static JsonNode updateModelInPreference (String randomId, String portalId, String orsId, String userName ,
													JsonNode valueNode, Timestamp timestamp, int version, String locale)
            throws PortalConfigException {
        boolean addProfile = true;
        JsonNode finalPreferenceNode = portalPersistenceService.getPreference(portalId, userName, orsId, null);

        if(!finalPreferenceNode.isEmpty(null)){
            Iterator<String> keys = finalPreferenceNode.fieldNames();
            String key;
            JsonNode node;
            while (keys.hasNext()) {
                key= keys.next();
                node = finalPreferenceNode.get(key);
                if (node.has(PortalServiceConstants.PREFERENCE_TYPE) &&
                        node.get(PortalServiceConstants.PREFERENCE_TYPE).asText().equals(PortalServiceConstants.PREFERENCE_TYPE_VALUE_MODEL)) {
                    ((ObjectNode) node).remove(PortalServiceConstants.USER_PREFERENCE) ;
                    ObjectNode userPrefNode = objectMapper.createObjectNode();
                    if( null != node && !node.isEmpty(null) ) {
						userPrefNode.put(PortalServiceConstants.PREFERENCE_PORTAL_VERSION, version);
						userPrefNode.put(PortalServiceConstants.PREFERENCE_PORTAL_DB_CHANGE, timestamp.getTime());
						userPrefNode.put(PortalServiceConstants.PREFERENCE_PORTAL_LOCALE, locale);
                        userPrefNode.set(PortalServiceConstants.PREFERENCE_PORTAL_CONFIG, valueNode);
                    }
                    ((ObjectNode) node).set(PortalServiceConstants.USER_PREFERENCE,userPrefNode);
                    randomId = key;
                    addProfile =false;
                    break;
                }

            }
        }
        if (addProfile) {
            ObjectNode profileNode = objectMapper.createObjectNode();
            profileNode.put(PortalServiceConstants.PREFERENCE_TYPE, PortalServiceConstants.PREFERENCE_TYPE_VALUE_MODEL);
            ObjectNode userPrefNode = objectMapper.createObjectNode();
            if( null != valueNode && !valueNode.isEmpty(null) ) {
				userPrefNode.put(PortalServiceConstants.PREFERENCE_PORTAL_VERSION, version);
				userPrefNode.put(PortalServiceConstants.PREFERENCE_PORTAL_DB_CHANGE, timestamp.getTime());
				userPrefNode.put(PortalServiceConstants.PREFERENCE_PORTAL_LOCALE, locale);
                userPrefNode.set(PortalServiceConstants.PORTAL_CONFIG, valueNode);
            }
            profileNode.set(PortalServiceConstants.USER_PREFERENCE, userPrefNode);
            ((ObjectNode) finalPreferenceNode).set(randomId, profileNode);
        }
        log.info("finalPreferenceNode {}", finalPreferenceNode);
        JsonNode savedPreference = portalPersistenceService.savePreference(portalId, userName, orsId, null, finalPreferenceNode);
        return savedPreference;
    }

	public static Timestamp toTimestamp(Object obj) {
		if (obj == null) {
			return null;
		}
		if (obj instanceof String) {
			return Timestamp.valueOf((String) obj);
		}
		if (obj instanceof Timestamp) {
			return (Timestamp) obj;
		}
		if (obj instanceof java.sql.Date) {
			java.sql.Date date = (java.sql.Date) obj;
			return new Timestamp(date.getTime());
		}
		throw new ArithmeticException();
	}
}	