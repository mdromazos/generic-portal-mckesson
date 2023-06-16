package com.informatica.mdm.portal.metadata.auth.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.auth.service.AuthService;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.informatica.mdm.portal.metadata.model.LoginPayload;
import com.informatica.mdm.portal.metadata.model.UserPassword;
import com.informatica.mdm.portal.metadata.service.CacheService;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sif.client.SiperianClient;
import com.siperian.sif.message.Password;
import com.siperian.sif.message.mrm.AuthenticateRequest;
import com.siperian.sif.message.mrm.AuthenticateResponse;

@Service
public class AuthServiceImpl implements AuthService {
	
	private final static Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
	
	/*@Autowired
	PoolingHttpClientConnectionManager poolingConnectionManager ;*/
	
	@Autowired
	RestTemplate restTemplate;
	
	@Autowired
	SiperianClient siperianClient;
		
	@Autowired
	CacheService cacheService;
	
	@Autowired
	PortalUIService portalUIService;
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}

	private final static Object lock = new Object();
	
	@Override
	public Map<String, Object> login(String username, String password, String sessionId, boolean isPortal,
			Map<String, Object> userData,String initialUrl) throws PortalLoginException {
		Map<String, Object> userInfo = new HashMap<>();
		try {
			LoginPayload loginPayload = getLoginPayload(userData, username, password);
			String url = String.format(PortalRestConstants.MDM_LOGIN_URL, initialUrl);
			HttpHeaders headers = new HttpHeaders();
			headers.add(PortalRestConstants.SESSION_TO_REGISTER, sessionId);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			ResponseEntity<String> response = PortalConfigUtil.executeRest(url, HttpMethod.POST, loginPayload.toString(), headers, restTemplate);
			if(response.getStatusCode()==HttpStatus.UNAUTHORIZED) {
				throw new PortalLoginException(ErrorCodeContants.PORTAL630,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL630), response.getBody());
			}
			userInfo.put(PortalRestConstants.MDM_CSRF_TOKEN_HEADER,response.getHeaders().getFirst(PortalRestConstants.MDM_CSRF_TOKEN_HEADER));
			JsonNode jsonNode = new ObjectMapper().readTree(response.getBody());
			Credentials credentials = new Credentials(username,
					(PortalRestConstants.PAYLOAD_MDM_SESSION + sessionId).getBytes());
			log.info("authorising the credentials with config {}, roles {}", isPortal,
					PortalRestConstants.ROLE_APP_ADMIN, PortalRestConstants.ROLE_ADMIN);
			List<String> checkRoles = new ArrayList<String>();
			checkRoles.add(PortalRestConstants.ROLE_APP_ADMIN);
			if (!authorise(credentials, checkRoles) && !isPortal) {
				log.info("User doesn't have enough privilege for Config UI");
				throw new PortalLoginException(ErrorCodeContants.PORTAL628,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL628), "Not enough permissions to access config ui");
			}
			userInfo.put(PortalMetadataContants.AUTHENTICATION_USER_NAME, jsonNode.get(PortalRestConstants.USERNAME).asText());
			return userInfo;
		} catch (AccessException e) {
			log.error("Error on Login for portal {}, with username {}, with errorMessage {}", isPortal, username, e.getMessage());
			throw new PortalLoginException(e.getErrorCode(), e.getLocalizedMessage(), e.getMessage());
		} catch (PortalLoginException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error on Login for portal {}, with username {}, with errorMessage {}", isPortal, username, e.getMessage());
			throw new PortalLoginException(ErrorCodeContants.CONFIG603,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG603), e.getMessage());
		}
	}

	@Override
	public void logout(HttpServletRequest request,String cookieName,String ict) throws PortalLoginException {
		try {
			Credentials credentials = PortalRestUtil.getCredentials(request, cookieName);
			String mdmSessionId = PortalRestUtil.getCookieValue(request, cookieName);
			HttpHeaders headers = new HttpHeaders();
			headers.add(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, ict);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			headers.add("Cookie", PortalRestConstants.MDM_SESSION_ID_COOKIE+"="+mdmSessionId);
			String url = String.format(PortalRestConstants.MDM_SESSION_URL,portalCmxUrl, PortalRestConstants.SESSION_LOGOUT_ACTION);
			ResponseEntity<String> response = PortalConfigUtil.executeRest(url, HttpMethod.POST, null, headers, restTemplate);
			if(response.getStatusCode()!=HttpStatus.OK)
				throw new Exception("Error on PortalUI Logout with error");
			CacheModel cacheParam = new CacheModel(null, credentials.getUsername(), null, null, null);
			log.info("Portal UI : Clear Metadata Cache for username {}", credentials.getUsername());
			cacheService.clearCache(cacheParam);
		} catch (Exception e) {
			log.error("Error on PortalUI Logout with error {}", e.getMessage());
			throw new PortalLoginException(ErrorCodeContants.CONFIG603,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG603), e.getMessage());
		}
	}

	@Override
	public Map<String, Object> getUserInfo(LoginData loginData, String orsId, String portalId)
			throws PortalLoginException {

		log.info("Login - Search BE Data for login details {}", loginData);
		Map<String, Object> userInfo = new HashMap<>();
		String beName = loginData.getBeName();
		String recordIdField = loginData.getRecordIdField();
		/*HttpRoute route = new HttpRoute(new HttpHost(serverName,port,scheme));
		int set = poolingConnectionManager.getMaxPerRoute(route);
		if(set == 2) {
			synchronized(lock) {
				if(2 == poolingConnectionManager.getMaxPerRoute(route)) {
					poolingConnectionManager.setMaxPerRoute(route, 50);
				}				
			}			
		}*/
		try {
			
			String trustedUser = portalUIService.getTrustedAppUser(portalId, orsId);
			log.info("Search BE Trusted user name is {}", trustedUser);
			ResponseEntity<String> response = searchBE(portalCmxUrl, loginData, trustedUser);
			log.info("Login - Search BE successfully retrieved Entity");
			String body = response.getBody();
			ObjectMapper mapper = new ObjectMapper();
			JsonNode responseNode = mapper.readTree(body);
			
			if(null == responseNode || responseNode.isEmpty(null) || !responseNode.has(PortalRestConstants.ITEM) || responseNode.get(PortalRestConstants.ITEM).size()==0) {
				log.error("PortalUI Login serach BE is empty response for loginData", loginData);
				throw new PortalLoginException(ErrorCodeContants.PORTAL630,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL630),
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL630));
			}
			
			if (responseNode.has(PortalRestConstants.ITEM)) {
				JsonNode beNode = responseNode.get(PortalRestConstants.ITEM).get(0).get(beName);
				filterByUniqueField(loginData.getUniqueFieldPath(), beNode, loginData.getUsername(), 0);
				log.info("Login - Search BE Data Filtered for uniqueFieldValue {}, with uniqueFieldPath {} and filteredResponse {}",
									loginData.getUsername(), loginData.getUniqueFieldPath(), beNode);
				if (StringUtils.isEmpty(recordIdField)) {
					recordIdField = PortalRestConstants.ROWID_OBJECT;
				}
				Object recordId = applyProjections(beNode, recordIdField, 0);
				log.info("Login - Search BE Record Id value {}, for recordIdPath {}", recordId, recordIdField);
				userInfo.put(PortalRestConstants.RECORD_ID, recordId);
				Map<String, String> projections = loginData.getProjections();
				
				//For Multiple Portal Association
				if (projections.containsKey(PortalRestConstants.BE_PATH_PORTAL_ASSC)) {
					filterByUniqueField( projections.get(PortalRestConstants.BE_PATH_PORTAL_ASSC) , beNode, portalId , 0);
				}
				
				for (String field : projections.keySet()) {
					String[] fields = projections.get(field).split(PortalRestConstants.DOT);
					Object projectionValue = applyProjections(beNode, projections.get(field), 0);
					log.info("Login - Search BE Projection value {}, for projectionPath {}", projectionValue,
							projections.get(field));
					if (field.equalsIgnoreCase(PortalRestConstants.BE_PATH_PORTAL_ASSC) &&( null == projectionValue 
							|| Integer.valueOf((String) projectionValue) != Integer.parseInt(portalId))) {
						throw new PortalLoginException(ErrorCodeContants.PORTAL632,
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL632),
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL632));
					}
					if (loginData.getIsStateEnabled() && field.equalsIgnoreCase(PortalRestConstants.BE_PATH_STATE_NAME)
							&& null == projectionValue) {
						throw new PortalLoginException(ErrorCodeContants.CONFIG605,
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG605),
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG605));
					}
					if (field.equalsIgnoreCase(PortalRestConstants.BE_PATH_STATE_NAME)) {
						userInfo.put(PortalRestConstants.STATUS_CODE, projectionValue);
					}else if (field.equalsIgnoreCase(PortalRestConstants.BE_PATH_ROLE_NAME)) {
						userInfo.put(PortalRestConstants.ROLE_CODE, projectionValue);
					}else {
						userInfo.put(fields[fields.length - 1], projectionValue);
					}
					
				}
			} else {
				log.error("Login - Search BE empty beNode {}",  responseNode);
				throw new PortalLoginException(ErrorCodeContants.PORTAL630,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL630), errorCodeProperties.getProperty(ErrorCodeContants.PORTAL630));
			}

			userInfo.put("username", loginData.getUsername());
		} catch (PortalLoginException e) {
			throw e;
		} catch (Exception e) {
			log.info("Portal UI - Error on fetching user session details for login data", loginData);
			throw new PortalLoginException(ErrorCodeContants.CONFIG603,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG603), e.getMessage());
		}

		log.info("Login - Userinfo details {}", userInfo);
		return userInfo;
	}
	
	private boolean filterByUniqueField(String uniqueFieldPath, JsonNode beNode, String uniqueFieldValue,
			Integer beIndex) throws PortalLoginException {

		boolean flag = false;
		String[] fields = uniqueFieldPath.split(PortalRestConstants.DOT);

		if (beIndex < fields.length) {
			beNode = beNode.get(fields[beIndex]);
			if(null != beNode && !beNode.isEmpty(null)) {

				if (beNode.has(PortalRestConstants.ITEM)) {
					beNode = beNode.get(PortalRestConstants.ITEM);
					Iterator<JsonNode> iterateNode = beNode.iterator();
					while (iterateNode.hasNext()) {
						Integer counter = new Integer(beIndex);
						JsonNode bePathNode = iterateNode.next();
						if (!filterByUniqueField(uniqueFieldPath, bePathNode, uniqueFieldValue, ++counter)) {
							iterateNode.remove();
						}
					}
				} else if (beNode.isObject()) {
					flag = filterByUniqueField(uniqueFieldPath, beNode, uniqueFieldValue, ++beIndex);
				} else if (beNode.isValueNode()) {
					flag = uniqueFieldValue.equalsIgnoreCase(beNode.asText());
				}
			}
		}

		return flag;
	}
	
	private Object applyProjections(JsonNode beNode, String projectionPath, Integer beIndex)
			throws PortalLoginException {

		Object projectionValue = null;
		String[] fields = projectionPath.split(PortalRestConstants.DOT);
		if (beIndex < fields.length) {
			beNode = beNode.get(fields[beIndex]);
			log.info("Login - Search BE node is empty for projection path {}, with index {}, for beNode {}",
					projectionPath, beIndex, beNode);
			if (null != beNode && !beNode.isEmpty(null)) {
				if (beNode.has(PortalRestConstants.ITEM)) {
					beNode = beNode.get(PortalRestConstants.ITEM);
					if (null == beNode || beNode.isEmpty(null)) {
						log.error(
								"Login - Search BE node is empty for projection path {}, with index {}, for beNode {}",
								projectionPath, beIndex, beNode);
						throw new PortalLoginException(ErrorCodeContants.PORTAL630,
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL630),
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL630));
					}
					Iterator<JsonNode> iterateNode = beNode.iterator();
					while (iterateNode.hasNext()) {
						Integer counter = new Integer(beIndex);
						JsonNode bePathNode = iterateNode.next();
						projectionValue = applyProjections(bePathNode, projectionPath, ++counter);
					}
				} else if (beNode.isObject()) {
					projectionValue = applyProjections(beNode, projectionPath, ++beIndex);
				} else if (beNode.isValueNode()) {
					projectionValue = beNode.asText();
				}
			}
		}
		return projectionValue;
	}

	private ResponseEntity<String> searchBE(String baseURL, LoginData loginData, String trustedUser) throws PortalLoginException {

		ResponseEntity<String> response = null;
		try {
			String children=childrenParamBuilder(loginData);
			String url = String.format(PortalRestConstants.SEARCH_BE_URL, baseURL, loginData.getOrsId(),
					loginData.getBeName(), loginData.getUniqueFieldPath(), loginData.getUsername(),children);
			log.info("Read Entity api url {}", url);
			String searchBEPayload = PortalConfigUtil.getSecurityPayloadForRest(
					PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, loginData.getOrsId(), "querySearchUsingGET");
			HttpHeaders headers = new HttpHeaders();
			headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, searchBEPayload);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			response = PortalConfigUtil.executeRest(url, HttpMethod.GET, null, headers, restTemplate);
		} catch (Exception e) {
			throw new PortalLoginException(ErrorCodeContants.CONFIG604,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG604), "");
		}

		if (response.getStatusCode() == HttpStatus.OK) {
			return response;
		} else {
			throw new PortalLoginException(ErrorCodeContants.CONFIG604,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG604), "");
		}
	}
	
	private String childrenParamBuilder(LoginData loginData) {
		StringBuilder children = new StringBuilder("");
		Map<String,Integer> childDepthMap = new HashMap<>();
		loginData.getProjections().values().forEach(fieldPath -> {
			String[] pathArray = fieldPath.split(PortalServiceConstants.DOT);
			if(pathArray.length>1) {
				if(childDepthMap.containsKey(pathArray[0])) {
					childDepthMap.put(pathArray[0], Math.max(pathArray.length-1, childDepthMap.get(pathArray[0])));
				}else {
					childDepthMap.put(pathArray[0], pathArray.length-1);
				}
			}
		});
		if(!childDepthMap.isEmpty()) {
			children.append(PortalRestConstants.AND).append(PortalRestConstants.CHILDREN).append(PortalRestConstants.EQUALS);
			childDepthMap.keySet().forEach(key -> { children.append(key).append(".").append(PortalRestConstants.DEPTH)
				.append(PortalRestConstants.EQUALS).append(childDepthMap.get(key)).append(PortalRestConstants.COMA); });
		}
		if(children.length()!=0)
		children.deleteCharAt(children.length()-1);
		return children.toString();
	}
	
	@Override
	public boolean authorise(Credentials credentials, List<String> role) throws PortalLoginException {

		boolean isValidRole = false;
		log.info("Validate user for role {}", role);
		try {

			AuthenticateResponse response = authenticate(credentials);
			List<?> roles = response.getRoleNames();
			log.info("Available roles via siperian api {}", roles);
			isValidRole = roles.containsAll(role) || response.isAdministrator();
			log.info("Validated flag {}, against role {}", isValidRole, role);
			
		} catch (Exception e) {
			log.error("Error on fetching user roles via siperian api");
			throw new PortalLoginException(ErrorCodeContants.CONFIG609,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG609), e.getMessage());
		}
		return isValidRole;
	}
	
	@Override
	public AuthenticateResponse authenticate(Credentials credentials) {
		
		AuthenticateRequest authRequest = new AuthenticateRequest();
		if(StringUtils.isNotEmpty(credentials.getPassword())) {
			Password password = new Password(credentials.getPassword());
			authRequest.setPassword(password);
		} else {
			authRequest.setSecurityPayload(credentials.getPayload());
		}
		
		log.info("Invoking siperian api to fetch the roles");
		AuthenticateResponse response = (AuthenticateResponse) siperianClient.process(authRequest);
		
		return response;
	}
	
	@Override
	public void refreshSession(HttpServletRequest request,
			String portalSessionId, Integer sessionTimeOut,String ict) throws PortalLoginException {

		try {
			log.info("Invoking Refresh Session Service with timeout {}", sessionTimeOut);
			HttpHeaders headers = new HttpHeaders();
			headers.add(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, ict);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			headers.add("Cookie", PortalRestConstants.MDM_SESSION_ID_COOKIE+"="+portalSessionId);
			log.info("Invoking Refresh Session Service with timeout {} ", sessionTimeOut);
			String url = String.format(PortalRestConstants.MDM_SESSION_URL, portalCmxUrl,PortalRestConstants.SESSION_REFRESH_ACTION);
			ResponseEntity<String> response = PortalConfigUtil.executeRest(url, HttpMethod.POST, null, headers, restTemplate);
			if(response.getStatusCode()!=HttpStatus.OK) {
				log.error("Error on Refresh Session with timeout {}", sessionTimeOut);
				throw new PortalLoginException(ErrorCodeContants.PORTAL620,
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL620),
						errorCodeProperties.getProperty(ErrorCodeContants.PORTAL620));	
			}
		} catch (PortalLoginException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error on Refresh Session with timeout {}", sessionTimeOut);
			throw new PortalLoginException(ErrorCodeContants.PORTAL619,
					errorCodeProperties.getProperty(ErrorCodeContants.PORTAL619), e.getMessage());
		}
	}
	
	private LoginPayload getLoginPayload(Map<String, Object> userInfo,String username,String passwordString) throws Exception {
		LoginPayload loginPayload = new LoginPayload();
		loginPayload.setUsername(username);
		String encryptedPassword = PortalRestUtil.getEncryptedPassword(passwordString);
		UserPassword password = new UserPassword(encryptedPassword,true);
		loginPayload.setPassword(password);
		loginPayload.setUserInfo(userInfo);
		return loginPayload;
	}
		
}
