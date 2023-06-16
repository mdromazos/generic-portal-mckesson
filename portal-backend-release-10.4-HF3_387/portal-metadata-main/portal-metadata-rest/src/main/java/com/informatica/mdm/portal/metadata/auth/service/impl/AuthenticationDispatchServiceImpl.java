package com.informatica.mdm.portal.metadata.auth.service.impl;

import com.delos.util.base64.Base64;
import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.auth.service.AuthenticationDispatchService;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalLoginException;
import com.informatica.mdm.portal.metadata.exception.PortalLogoutException;
import com.informatica.mdm.portal.metadata.exception.SAMLException;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.model.SAMLConfig;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.service.SAMLService;
import com.informatica.mdm.portal.metadata.util.*;
import com.siperian.sif.client.CertificateHelper;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.util.*;
import java.util.stream.StreamSupport;

@Service
public class AuthenticationDispatchServiceImpl implements AuthenticationDispatchService {

	@Value("${cmx.home}")
	private String cmxHome;

	@Autowired
	SAMLService samlService;

	@Autowired
	private PortalPersistenceService portalPersistenceService;

	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	private final static Logger log = LoggerFactory.getLogger(AuthenticationDispatchServiceImpl.class);

	@Override
	public void dispatch(HttpServletRequest httpRequest, HttpServletResponse httpResponse, String provider,
			String orsId, String portalId, Boolean validate) throws PortalLoginException {
		if (("saml").equalsIgnoreCase(provider)) {
			SAMLConfig samlConfig = null;
			boolean isValid = true;
			try {
				samlConfig = samlService.getSAMLConfigurationForPortal(portalId, orsId);
				if (null != validate && validate.booleanValue()) {
					if (StringUtils.isEmpty(samlConfig.getSpEntityId()) || StringUtils.isEmpty(samlConfig.getAcsURL())
							|| StringUtils.isEmpty(samlConfig.getSsoSvcBinding())
							|| StringUtils.isEmpty(samlConfig.getSigningCertificate())
							|| StringUtils.isEmpty(samlConfig.getIdpEntityId())
							|| StringUtils.isEmpty(samlConfig.getSsoSvcURL())) {
						isValid = false;
					}
					if (!isValid) {
						throw new PortalLoginException(ErrorCodeContants.CONFIG1113,
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1113),
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1113));
					}
					return;

				}
				String samlResponse = httpRequest.getParameter(PortalRestConstants.SAML_RESPONSE);
				if (samlResponse != null)
					redirectLoginPage(httpRequest, httpResponse, orsId, portalId, null);

				samlService.buildAndEncodeAuthnRequestForm(provider, httpRequest, httpResponse, samlConfig);
				return;
			} catch (SAMLException e) {
				log.error("Failed to invoke IDP url " + e.getMessage());
				throw new PortalLoginException(ErrorCodeContants.CONFIG1110,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1110), e.getMessage());
			} catch (PortalConfigException e) {
				throw new PortalLoginException(ErrorCodeContants.CONFIG1113,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1113),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1113));
			}
		} else {
			log.error("Unsupported provider:" + provider);
			throw new PortalLoginException(ErrorCodeContants.CONFIG1111,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1111),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1111));
		}

	}

	@Override
	public Map<String, String> dispatchLogout(HttpServletRequest httpRequest, HttpServletResponse httpResponse, String nameIdString, String orsId,
			String portalId) throws PortalLogoutException {
		Map<String, String> samlLogoutUrl = null;
		if (StringUtils.isNotEmpty(nameIdString)) {
			SAMLConfig samlConfig = null;
			try {
				samlConfig = samlService.getSAMLConfigurationForPortal(portalId, orsId);

				if (StringUtils.isEmpty(samlConfig.getSloSvcURL()) || StringUtils.isEmpty(samlConfig.getSloSvcBinding())
						|| StringUtils.isEmpty(samlConfig.getSpEntityId())) {
					log.info("SAML Logout Service URL mandatory fields are missing, returning null");
					return samlLogoutUrl; // Returning null
				}

				samlLogoutUrl = samlService.buildAndEncodeLogoutRequestForm(nameIdString, httpRequest, httpResponse, samlConfig);
				log.info("SAML Logout Service URL found");
				return samlLogoutUrl;
			} catch (SAMLException e) {
				log.error("Failed to invoke IDP Logout url " + e.getMessage());
				throw new PortalLogoutException(ErrorCodeContants.CONFIG1201,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1201), e.getMessage());
			} catch (PortalConfigException e) {
				throw new PortalLogoutException(ErrorCodeContants.CONFIG1113,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1113),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1113));
			}
		} else {
			log.error("nameID not found:" + nameIdString);
			throw new PortalLogoutException(ErrorCodeContants.CONFIG1105,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1105),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1105));
		}
	}
	@Override
	public LoginData process(HttpServletRequest httpRequest, HttpServletResponse httpResponse, String orsId,
			String portalId) throws PortalLoginException {
		AttributeSet aset;
		LoginData loginData = null;
		try {
			SAMLConfig samlConfig = samlService.getSAMLConfigurationForPortal(portalId, orsId);
			String authResponse = httpRequest.getParameter(PortalRestConstants.SAML_RESPONSE);
			aset = samlService.validateResponse(authResponse, samlConfig);
			String userName = aset.getNameId();			
			Map<String, List<String>> attributes = aset.getAttributes();
			if(StringUtils.isNotBlank(samlConfig.getNameIDField())
					&& !samlConfig.getNameIDField().equals(PortalRestConstants.SAML_NAMEID)) {
				userName = attributes.get(samlConfig.getNameIDField()).get(0);
			}
			log.info("User name : " + userName);
			String relaySate = samlService.getRelayState(httpRequest, "SAML");
			log.info("relaySate  : " + relaySate);
			String sessionIndex = aset.getSessionIndex();
			loginData = getLoginData(orsId, portalId, userName);
			loginData.setSessionIndex(sessionIndex);
			loginData.setSamlNameId(aset.getNameId());
		} catch (Exception e) { // TODO Auto-generated catch block
			log.error("Error while processing SAML Response" + e.getMessage());
			return null;
		}
		return loginData;

	}

	@Override
	public void loginSuccessRedirectHandler(HttpServletRequest request, HttpServletResponse response, String portalId,
											String orsId, Map<String, Object> userInfo) throws PortalLoginException {
		//Portal UI Cookie Settings
		String userName = userInfo.get(PortalRestConstants.USERNAME).toString();
		String pathUI = PortalRestConstants.PORTAL_UI_PATH + PortalRestConstants.PORTAL_UI_CONTEXT
				+ PortalRestConstants.PORTAL_UI_PATH+ portalId + PortalRestConstants.PORTAL_UI_PATH + orsId;
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE_EMAIL, userName,
                pathUI, true, false , StandardCharsets.UTF_8.toString()));
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE_USERNAME, userName,
                pathUI, true, false, StandardCharsets.UTF_8.toString()));
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE_STATE, (String)userInfo.get(PortalRestConstants.STATUS_CODE).toString(),
                pathUI, true, false, StandardCharsets.UTF_8.toString()));
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE_ROWID, ((String)userInfo.get(PortalRestConstants.RECORD_ID).toString()).trim(),
                pathUI, true, false, StandardCharsets.UTF_8.toString()));
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE_ROLE, (String)userInfo.get(PortalRestConstants.ROLE_CODE).toString(),
                pathUI, true, false, StandardCharsets.UTF_8.toString()));
		response.addCookie(PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_COOKIE_ORS, orsId,
                PortalRestConstants.PORTAL_UI_PATH, true, false, StandardCharsets.UTF_8.toString()));

        SAMLConfig samlConfig = null;
        try {
            samlConfig = samlService.getSAMLConfigurationForPortal(portalId, orsId);
        } catch (PortalConfigException e) {
            throw new PortalLoginException(ErrorCodeContants.CONFIG1000,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1000), e.getErrorMessage());
        }
        String samlRedirectURL = samlConfig.getSamlRedirectURL();
        String url = String.format(PortalRestConstants.PORTAL_SHELL_URL,samlRedirectURL,portalId,orsId);
        log.info("Re-direct to {}", url);
		try {
			response.sendRedirect(url);
		} catch (IOException e) {
			log.error("Error while Re-direct to {} with error message {}", url,e.getMessage());
			throw new PortalLoginException(ErrorCodeContants.CONFIG1112,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1112), e.getMessage());
		}
	}

	@Override
	public void redirectLoginPage(HttpServletRequest httpRequest, HttpServletResponse httpResponse, String orsId, String portalId, String errorCode) throws PortalLoginException {
        SAMLConfig samlConfig = null;
        try {
            samlConfig = samlService.getSAMLConfigurationForPortal(portalId, orsId);
        } catch (PortalConfigException e) {
            throw new PortalLoginException(ErrorCodeContants.CONFIG1000,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1000), e.getErrorMessage());
        }
        String samlRedirectURL = samlConfig.getSamlRedirectURL();
        String url = String.format(PortalRestConstants.DEFAUT_PORTAL_LOGIN_URL,samlRedirectURL,portalId,orsId);
        log.info("Re-direct to {}", url);
        if (null != errorCode) {
            url = url + "?errorcode=" + errorCode;
        }

        if(null!=samlConfig) {
            if (StringUtils.isNotEmpty(samlConfig.getLogoutPageURL()))
                url = samlConfig.getLogoutPageURL();
        }
        try {
            log.info("Re-direct to {}", url);
            httpResponse.sendRedirect(url);
        } catch (IOException e) {
            log.error("Error while Re-direct to {} with error message {}", url,e.getMessage());
            throw new PortalLoginException(ErrorCodeContants.CONFIG1109,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1109), e.getMessage());
        }
	}

	private LoginData getLoginData(String orsId, String portalId, String userName) throws PortalConfigException {
		JsonNode portalConfigNode = portalPersistenceService.getPublishedPortalConfig(null, portalId, orsId);
		LoginData loginData = new LoginData();
		loginData.setOrsId(orsId);
		loginData.setUsername(userName);
		try {
			loginData.setPassword(createEncryptedPassword(userName));
		} catch (InvalidKeyException | NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException
				| BadPaddingException e) {
			// TODO Auto-generated catch block
			log.error(e.getMessage());
			throw new PortalConfigException(e);		
		}
		boolean isStateEnabled = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
				.get(PortalMetadataContants.STATE_ENABLED).asBoolean();
		loginData.setIsStateEnabled(isStateEnabled);
		String beName = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
				.get(PortalMetadataContants.BE_NAME).asText();
		loginData.setBeName(beName);
		loginData.setRecordIdField(PortalRestConstants.ROWID_OBJECT);
		String uniqueFieldPath = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
				.get(PortalMetadataContants.LOGIN_ATTRIBUTE).get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE)
				.get(PortalMetadataContants.FIELD_MAPPING_USER_NAME).get(PortalMetadataContants.CODE_ATTRIBUTE)
				.asText();
		loginData.setUniqueFieldPath(uniqueFieldPath);
		String sessionTimeOut = getSessionTimeOut(portalId, orsId);
		loginData.setSessionTimeout(Integer.parseInt(sessionTimeOut));
		Map<String, String> projections = new HashMap<String, String>();

		String portalAssociation = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
				.get(PortalMetadataContants.LOGIN_ATTRIBUTE).get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE)
				.get(PortalMetadataContants.FIELD_MAPPING_PORTAL_ASSC_FIELD).get(PortalMetadataContants.CODE_ATTRIBUTE)
				.asText();
		projections.put(PortalRestConstants.BE_PATH_PORTAL_ASSC, portalAssociation);

		String userRole = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
				.get(PortalMetadataContants.LOGIN_ATTRIBUTE).get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE)
				.get(PortalMetadataContants.FIELD_MAPPING_USER_ROLE).get(PortalMetadataContants.CODE_ATTRIBUTE)
				.asText();
		projections.put(PortalRestConstants.BE_PATH_ROLE_NAME, userRole);
		if (isStateEnabled) {
			String userState = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS)
					.get(PortalMetadataContants.LOGIN_ATTRIBUTE).get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE)
					.get(PortalMetadataContants.FIELD_MAPPING_USER_STATE).get(PortalMetadataContants.CODE_ATTRIBUTE)
					.asText();
			projections.put(PortalRestConstants.BE_PATH_STATE_NAME, userState);
		}
		loginData.setProjections(projections);
		return loginData;

	}

	public String getTrustedAppUser(String portalId, String orsId) throws PortalConfigException {

		String trustedUser = null;
		try {

			List<String> projections = new ArrayList<String>();
			projections.add(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
			PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, PortalRestConstants.RUNTIME_PORTAL_ADMIN_FILTER, projections);
			JsonNode runtimeConfig = getRuntimeConfig(null, portalId, restConfig);
			if (null != runtimeConfig && !runtimeConfig.isEmpty(null)) {
				JsonNode trustedAppUserNode = runtimeConfig.get(0)
						.get(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
				trustedUser = StreamSupport.stream(trustedAppUserNode.spliterator(), false)
						.filter(node -> node.get(PortalServiceConstants.RUNTIME_CONFIG_KEY).asText()
								.equalsIgnoreCase(PortalServiceConstants.RUNTIME_CONFIG_USERNAME))
						.map(map -> map.get(PortalServiceConstants.RUNTIME_CONFIG_VALUE).asText()).findFirst().get();
			}

		} catch (PortalConfigException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching trusted app username for portalId {}, and orsId{},  with error message {} ",
					portalId, orsId, e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}

		return trustedUser;
	}

	public String getSessionTimeOut(String portalId, String orsId) throws PortalConfigException {

		String trustedUser = null;
		try {

			List<String> projections = new ArrayList<String>();
			projections.add(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
			PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, PortalRestConstants.RUNTIME_SESSION_FILTER, projections);
			JsonNode runtimeConfig = getRuntimeConfig(null, portalId, restConfig);
			if (null != runtimeConfig && !runtimeConfig.isEmpty(null)) {
				JsonNode trustedAppUserNode = runtimeConfig.get(0)
						.get(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
				trustedUser = StreamSupport.stream(trustedAppUserNode.spliterator(), false)
						.filter(node -> node.get(PortalServiceConstants.RUNTIME_CONFIG_KEY).asText()
								.equalsIgnoreCase(PortalServiceConstants.RUNTIME_CONFIG_SESSION_TIMEOUT))
						.map(map -> map.get(PortalServiceConstants.RUNTIME_CONFIG_VALUE).asText()).findFirst().get();
			}

		} catch (PortalConfigException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error on fetching trusted app username for portalId {}, and orsId{},  with error message {} ",
					portalId, orsId, e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG501,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG501), e.getMessage());
		}

		return trustedUser;
	}

	private JsonNode getRuntimeConfig(Credentials credentials, String portalId, PortalRestConfig restConfig)
			throws PortalConfigException {

		JsonNode runtimeConfigNode = portalPersistenceService.getPortalRuntimeConfig(credentials, restConfig.getOrs(),
				portalId);

		log.info(
				"Portal UI - Apply Filter on Retrieved Runtime Configuration for portalId {}, with orsId {} and filter {}",
				portalId, restConfig.getOrs(), restConfig.getFilter());

		if (null != restConfig.getFilter()) {
			log.info("Portal UI - Portal Config Runtime Configuration apply filter {} ", restConfig.getFilter());
			runtimeConfigNode = JsonUtil.applyFilter(runtimeConfigNode, restConfig.getFilter());
		}

		log.info(
				"Portal UI - Apply Projections - Retrieved Runtime Configuration for portalId {}, with orsId {} and filter {}",
				portalId, restConfig.getOrs(), restConfig.getProjections());

		if (!runtimeConfigNode.isMissingNode() && null != restConfig.getProjections()
				&& !restConfig.getProjections().isEmpty()) {
			log.info("Portal UI - Portal Config Runtime Configuration apply projections {}",
					restConfig.getProjections());
			runtimeConfigNode = JsonUtil.applyProjections(runtimeConfigNode, restConfig.getProjections());
		}

		return runtimeConfigNode;
	}

	private String createEncryptedPassword(String userName) throws InvalidKeyException, NoSuchAlgorithmException,
	NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException {

		long milliTime = Calendar.getInstance().getTimeInMillis();
		String timems = Long.toString(milliTime);
		//String password = userName + "_" + timems;
		String encryptPassword = encryptWithPortalPublicKey(timems);
		return encryptPassword;

	}

	private  String encryptWithPortalPublicKey(String input){
		CertificateHelper certificateHelper = CertificateHelper.getInstance(cmxHome);
		PublicKey publicKey = certificateHelper.getPublicKey(PortalServiceConstants.TRUSTED_APP);
    	String encryptedValue = "";
    	try {
    		encryptedValue=  Base64.encodeBytes(certificateHelper.encrypt(input.getBytes(StandardCharsets.UTF_8), publicKey),Base64.DONT_BREAK_LINES);
		} catch (InvalidKeyException | NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException
				| BadPaddingException e) {
			log.error("Unable to encrypt ", e);
		}
    	return encryptedValue ;
    }

}
