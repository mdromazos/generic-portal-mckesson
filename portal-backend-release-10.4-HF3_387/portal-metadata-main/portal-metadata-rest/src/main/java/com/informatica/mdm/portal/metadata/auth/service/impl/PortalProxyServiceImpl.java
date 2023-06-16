package com.informatica.mdm.portal.metadata.auth.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.util.Arrays;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.DatatypeConverter;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus.Series;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.delos.cmx.server.MDMSessionException;
import com.delos.util.base64.Base64;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.portal.metadata.auth.service.PortalProxyService;
import com.informatica.mdm.portal.metadata.exception.PortalBadRequestException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.PortalServerSideValidationException;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.BEProxyEnum;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import com.siperian.sif.client.CertificateHelper;

@Service
public class PortalProxyServiceImpl implements PortalProxyService {

	@Autowired
	private RestTemplate restTemplate;

	private final static Logger log = LoggerFactory.getLogger(PortalProxyServiceImpl.class);

	@Value("${cmx.home}")
	private String cmxHome;
	
	@Value("${cmx.appserver.type}")
	private String appServerType;
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	@Autowired
	@Qualifier(value = "beErrorMapping")
	private Properties beErrorMapping;
	
	@Autowired
	@Qualifier(value = "externalErrorProperties")
	private Map<String, Map<String, Properties>> externalErrorProperties;
	
	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private PortalUIService portalUIService;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}

	@Override
	public Object invokeApi(JsonNode payloadNode, HttpServletRequest httpRequest, HttpServletResponse httpResponse) throws PortalConfigException {

		String orsId = httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalId = httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		String portalsessionid = PortalRestUtil.getCookieValue(httpRequest, PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
		String selectedLocale = PortalRestUtil.getCookieValue(httpRequest, PortalServiceConstants.PORTAL_LOCALE);
		ResponseEntity<String> response = null;
		
		Properties externalErrorProperty = null != externalErrorProperties.get(portalId) ?
							externalErrorProperties.get(portalId).get(selectedLocale) : null;
							
		if(null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId) ?
					externalErrorProperties.get(portalId).get("en") : null;
		}
		
		if(StringUtils.isEmpty(portalsessionid)) {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG607,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607));
		}
		String apiUrl = StringUtils.join(portalCmxUrl, payloadNode.get(PortalRestConstants.PORTAL_PROXY_URL_ATTIBUTE).asText());
		String httpMethod = payloadNode.get(PortalRestConstants.PORTAL_PROXY_METHOD_ATTIBUTE).asText();

		try {

			apiUrl = java.net.URLDecoder.decode(apiUrl, StandardCharsets.UTF_8.name());
			log.info("Proxy API - BE's Api Call for url {} with httpMethod {} ", apiUrl, httpMethod);
			
			HttpHeaders headers = new HttpHeaders();
			String cookie = generateEncryptedCookie(portalsessionid, appServerType);
			if(StringUtils.isNotEmpty(selectedLocale)) {
				cookie = StringUtils.join(cookie, "; ", PortalServiceConstants.BES_LOCALE, selectedLocale);
			}
			if(null != httpRequest.getCookies()) {
				String encryptcmxjsessionid = PortalRestUtil.getCookieValue(httpRequest,
						PortalRestConstants.PORTAL_UI_FILE + "-" + orsId + "-" + portalId);
				log.info("Encrypted fileupload jsessionid recevided from request: "+ encryptcmxjsessionid);
				if(null != encryptcmxjsessionid) {
					String cmxjsession = decryptWithPortalPrivateKey(encryptcmxjsessionid);
					if(StringUtils.isNotEmpty(cmxjsession)) {
						cookie = StringUtils.join(cookie, "; ", cmxjsession);
					}
				}
			}

			headers.add(HttpHeaders.COOKIE, cookie);
			
			JsonNode requestHeaders = payloadNode.get(PortalRestConstants.PORTAL_PROXY_HEADER_ATTRIBUTE);
			if (null != requestHeaders && !requestHeaders.isNull()) {
				Iterator<Entry<String, JsonNode>> requestHeaderIter = requestHeaders.fields();
				while (requestHeaderIter.hasNext()) {
					Entry<String, JsonNode> requestHeader = requestHeaderIter.next();
					headers.add(requestHeader.getKey(), requestHeader.getValue().asText());
				}
			}
			
			if(null != httpRequest.getCookies()) {
				Arrays.asList(httpRequest.getCookies()).forEach(c -> headers.get(HttpHeaders.COOKIE).add(c.getName() +"="+c.getValue()));
			}

			HttpEntity<?> request = null;
			
			headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON, MediaType.ALL));

			if (HttpMethod.GET.name().equalsIgnoreCase(httpMethod)
					|| HttpMethod.DELETE.name().equalsIgnoreCase(httpMethod)) {
				request = new HttpEntity<String>(headers);
			} else if (HttpMethod.POST.name().equalsIgnoreCase(httpMethod)
					|| HttpMethod.PUT.name().equalsIgnoreCase(httpMethod)) {
				request = new HttpEntity<Object>(payloadNode.get(PortalRestConstants.PORTAL_PROXY_PAYLOAD_ATTIBUTE),
						headers);
			} else {
				log.error("Invalid http method for recordId {}, as method type {}",
						payloadNode.get(PortalRestConstants.PORTAL_PROXY_RECORD_ATTIBUTE).asText(), httpMethod);
				throw new PortalBadRequestException(ErrorCodeContants.CONFIG606,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606));
			}

			response = restTemplate.exchange(apiUrl, HttpMethod.resolve(httpMethod), request, String.class);
			
			if (response.getStatusCode().series() == Series.SERVER_ERROR || response.getStatusCode().series() == Series.CLIENT_ERROR) {
				log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}, with exception {}, {}, ", payloadNode,
						httpMethod, apiUrl, response.getStatusCode().getReasonPhrase(), response.getBody());
				throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
						response.getStatusCode().getReasonPhrase(), response.getBody(), externalErrorProperty, beErrorMapping);
			}

			if (response.getHeaders().containsKey("set-cookie")) {
				String cmxsessionId = response.getHeaders().get("set-cookie").get(0);
				log.info("Response cmxjsessionId: "+cmxsessionId);
				if (cmxsessionId.startsWith("JSESSIONID")) {
					String encryptedCmxsessionId = encryptWithPortalPublicKey(cmxsessionId);
					httpResponse.addCookie(
							PortalRestUtil.createCookie(PortalRestConstants.PORTAL_UI_FILE+ "-" + orsId + "-" + portalId,
									encryptedCmxsessionId, PortalRestConstants.PORTAL_UI_PATH, true, true));
				}
			}
			
			if (response.getHeaders().containsKey("BES-interactionId")) {
				httpResponse.setHeader("BES-interactionId", response.getHeaders().get("BES-interactionId").get(0));
			}
			
			if (response.getHeaders().containsKey("BES-processId")) {
				httpResponse.setHeader("BES-processId", response.getHeaders().get("BES-processId").get(0));
			}

			if(response.getHeaders().getContentType().getType().equals(MediaType.APPLICATION_JSON.getType())) {
				return mapper.readTree(response.getBody());
			} else {
				return response.getBody();
			}
			

		} catch (PortalServerSideValidationException e) {
			throw e;
		} catch (HttpServerErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}, with exception {}, {}, ", payloadNode,
					httpMethod, apiUrl, e.getMessage(), e.getResponseBodyAsString());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (HttpClientErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}, with exception {}, {}, ", payloadNode,
					httpMethod, apiUrl, e.getMessage(), e.getResponseBodyAsString());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (Exception e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), e.getMessage());
		}

	}
	
	
	@Override
	public JsonNode uploadFileViaProxy(JsonNode payloadNode, MultipartFile file, HttpServletRequest httpRequest) throws PortalConfigException {

		String orsId = httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalId = httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		String portalsessionid = PortalRestUtil.getCookieValue(httpRequest, PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
		String selectedLocale = PortalRestUtil.getCookieValue(httpRequest, PortalServiceConstants.PORTAL_LOCALE);
		
		if(StringUtils.isEmpty(portalsessionid)) {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG607,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607));
		}
		
		ResponseEntity<JsonNode> responseNode = null;
		String apiUrl = StringUtils.join(portalCmxUrl, payloadNode.get(PortalRestConstants.PORTAL_PROXY_URL_ATTIBUTE).asText());
		String httpMethod = payloadNode.get(PortalRestConstants.PORTAL_PROXY_METHOD_ATTIBUTE).asText();

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get("en")
					: null;
		}
		
		try {

			apiUrl = java.net.URLDecoder.decode(apiUrl, StandardCharsets.UTF_8.name());
			log.info("Proxy File Upload API - BE's Api Call for url {} with httpMethod {} ", apiUrl, httpMethod);

			HttpHeaders headers = new HttpHeaders();
			String cookie = generateEncryptedCookie(portalsessionid, appServerType);
			if(StringUtils.isNotEmpty(selectedLocale)) {
				cookie = StringUtils.join(cookie, "; ", PortalServiceConstants.BES_LOCALE, selectedLocale);
			}
			if(null != httpRequest.getCookies()) {
				String encryptcmxjsessionid = PortalRestUtil.getCookieValue(httpRequest,
						PortalRestConstants.PORTAL_UI_FILE + "-" + orsId + "-" + portalId);
				log.info("Encrypted fileupload jsessionid recevided from request in upload api: "+ encryptcmxjsessionid);
				if(null != encryptcmxjsessionid) {
					String cmxjsession = decryptWithPortalPrivateKey(encryptcmxjsessionid);
					log.info("Requested fileupload jsessionid: "+ cmxjsession);
					if(StringUtils.isNotEmpty(cmxjsession)) {
						cookie = StringUtils.join(cookie, "; ", cmxjsession);
					}
				}
			}
			headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
			headers.add(HttpHeaders.COOKIE, cookie);

			JsonNode requestHeaders = payloadNode.get(PortalRestConstants.PORTAL_PROXY_HEADER_ATTRIBUTE);
			if (null != requestHeaders && !requestHeaders.isNull()) {
				Iterator<Entry<String, JsonNode>> requestHeaderIter = requestHeaders.fields();
				while (requestHeaderIter.hasNext()) {
					Entry<String, JsonNode> requestHeader = requestHeaderIter.next();
					headers.add(requestHeader.getKey(), requestHeader.getValue().asText());
				}
			}

			HttpEntity<?> request = null;
			headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));
			if(null != httpRequest.getCookies()) {
				Arrays.asList(httpRequest.getCookies()).forEach(c -> headers.get(HttpHeaders.COOKIE).add(c.getName() +"="+c.getValue()));
			}
			
			if (HttpMethod.PUT.name().equalsIgnoreCase(httpMethod)) {
				request = new HttpEntity<byte[]>(IOUtils.toByteArray(file.getResource().getInputStream()),
						headers);
			} else {
				log.error("Invalid http method for recordId {}, as method type {}",
						payloadNode.get(PortalRestConstants.PORTAL_PROXY_RECORD_ATTIBUTE).asText(), httpMethod);
				throw new PortalBadRequestException(ErrorCodeContants.CONFIG606,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606));
			}
			
			responseNode = restTemplate.exchange(apiUrl, HttpMethod.resolve(httpMethod), request, JsonNode.class);
			
			if (responseNode.getStatusCode().series() == Series.SERVER_ERROR || responseNode.getStatusCode().series() == Series.CLIENT_ERROR) {
				log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
						httpMethod, apiUrl, responseNode.getStatusCode().getReasonPhrase());
				throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
						responseNode.getStatusCode().getReasonPhrase(), responseNode.getBody().asText(), externalErrorProperty, beErrorMapping);
			}

		} catch (PortalServerSideValidationException e) {
			throw e;
		} catch (HttpServerErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (HttpClientErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (Exception e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), e.getMessage());
		}

		return responseNode.getBody();

	}
	
	/* (non-Javadoc)
	 * @see com.informatica.mdm.portal.metadata.auth.service.PortalProxyService#downloadFileViaProxy(com.fasterxml.jackson.databind.JsonNode, javax.servlet.http.HttpServletRequest)
	 */
	@Override
	public ResponseEntity<byte[]> downloadFileViaProxy(JsonNode payloadNode, HttpServletRequest httpRequest) throws PortalConfigException {

		String orsId = httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID);
		String portalId = httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		String portalsessionid = PortalRestUtil.getCookieValue(httpRequest, PortalRestConstants.PORTAL_UI_COOKIE+"-"+orsId+"-"+portalId);
		String selectedLocale = PortalRestUtil.getCookieValue(httpRequest, PortalServiceConstants.PORTAL_LOCALE);
		
		if(StringUtils.isEmpty(portalsessionid)) {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG607,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607));
		}
		
		ResponseEntity<byte[]> responseNode = null;
		String apiUrl = StringUtils.join(portalCmxUrl, payloadNode.get(PortalRestConstants.PORTAL_PROXY_URL_ATTIBUTE).asText());
		String httpMethod = payloadNode.get(PortalRestConstants.PORTAL_PROXY_METHOD_ATTIBUTE).asText();

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get("en")
					: null;
		}
		
		try {

			apiUrl = java.net.URLDecoder.decode(apiUrl, StandardCharsets.UTF_8.name());
			log.info("Proxy File Download File API - BE's Api Call for url {} with httpMethod {} ", apiUrl, httpMethod);

			HttpHeaders headers = new HttpHeaders();
			String cookie = generateEncryptedCookie(portalsessionid, appServerType);
			if(StringUtils.isNotEmpty(selectedLocale)) {
				cookie = StringUtils.join(cookie, "; ", PortalServiceConstants.BES_LOCALE, selectedLocale);
			}
			headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
			headers.add(HttpHeaders.COOKIE, cookie);

			JsonNode requestHeaders = payloadNode.get(PortalRestConstants.PORTAL_PROXY_HEADER_ATTRIBUTE);
			if (null != requestHeaders && !requestHeaders.isNull()) {
				Iterator<Entry<String, JsonNode>> requestHeaderIter = requestHeaders.fields();
				while (requestHeaderIter.hasNext()) {
					Entry<String, JsonNode> requestHeader = requestHeaderIter.next();
					headers.add(requestHeader.getKey(), requestHeader.getValue().asText());
				}
			}
			
			if(null != httpRequest.getCookies()) {
				Arrays.asList(httpRequest.getCookies()).forEach(c -> headers.get(HttpHeaders.COOKIE).add(c.getName() +"="+c.getValue()));
			}

			headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));
			HttpEntity<?> request = null;

			if (HttpMethod.GET.name().equalsIgnoreCase(httpMethod)) {
				request = new HttpEntity<String>(headers);
			} else {
				log.error("Invalid http method for recordId {}, as method type {}",
						payloadNode.get(PortalRestConstants.PORTAL_PROXY_RECORD_ATTIBUTE).asText(), httpMethod);
				throw new PortalBadRequestException(ErrorCodeContants.CONFIG606,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606));
			}
			
			responseNode = restTemplate.exchange(apiUrl, HttpMethod.resolve(httpMethod), request, byte[].class);
			
			if (responseNode.getStatusCode().series() == Series.SERVER_ERROR || responseNode.getStatusCode().series() == Series.CLIENT_ERROR) {
				log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
						httpMethod, apiUrl, responseNode.getStatusCode().getReasonPhrase());
				throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
						responseNode.getStatusCode().getReasonPhrase(), responseNode.getBody().toString(), externalErrorProperty, beErrorMapping);
			}

		} catch (PortalServerSideValidationException e) {
			throw e;
		} catch (HttpServerErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (HttpClientErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (Exception e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), e.getMessage());
		}

		return responseNode;

	}

	@Override
	public boolean validateProxy(JsonNode payloadNode, String mdmSessionId) throws PortalConfigException {

		boolean flag = false;
		
		if(StringUtils.isEmpty(mdmSessionId)) {
			throw new PortalBadRequestException(ErrorCodeContants.CONFIG607,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG607));
		}

		try {
			Map<String, Object> userSession = PortalRestUtil.getUserSessionData(mdmSessionId);
			log.info("Validate Proxy on session {} ", userSession);
			String recordId = (String) userSession.get(PortalRestConstants.RECORD_ID);
			if (payloadNode.get(PortalRestConstants.PORTAL_PROXY_RECORD_ATTIBUTE).asText()
					.equalsIgnoreCase(recordId.trim())) {
				log.info("Validated Proxy for recordId {} ", recordId);
				flag = true;
			}
		} catch (MDMSessionException e) {
			log.error("Error on validating proxy api for recordId {}",
					payloadNode.get(PortalRestConstants.PORTAL_PROXY_RECORD_ATTIBUTE).asText(), e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), e.getMessage());
		}

		return flag;

	}

	private byte[] encryptSecurityPayload(String mdmsessionid) throws InvalidKeyException, NoSuchAlgorithmException,
			NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException {

		PkiUtilProvider pkiUtilProvider = PkiUtilProvider.getInstance(cmxHome);
		PKIUtil pkiUtil = pkiUtilProvider.getPkiUtil();
		Certificate certificate = pkiUtil.getCertificate(PortalServiceConstants.HUB);
		PublicKey publicKey = certificate.getPublicKey();
		CertificateHelper certificateHelper = CertificateHelper.getInstance(cmxHome);
		PrivateKey privateKey = pkiUtil.getPrivateKey(PortalServiceConstants.TRUSTED_APP);
		byte[] encryptedWithPrivateKey = certificateHelper.encrypt(mdmsessionid.getBytes(), privateKey);
		byte[] encryptedWithPublicKey = certificateHelper.encrypt(encryptedWithPrivateKey, publicKey);

		return encryptedWithPublicKey;

	}

	@Override
	public JsonNode invokeProxyByTrustedApp(JsonNode payloadNode, String orsId, HttpServletRequest httpRequest)
			throws PortalConfigException {

		ResponseEntity<JsonNode> responseNode = null;
		String portalId = httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID);
		String selectedLocale = PortalRestUtil.getCookieValue(httpRequest, PortalServiceConstants.PORTAL_LOCALE);
		String apiUrl = StringUtils.join(portalCmxUrl, payloadNode.get(PortalRestConstants.PORTAL_PROXY_URL_ATTIBUTE).asText());
		String httpMethod = payloadNode.get(PortalRestConstants.PORTAL_PROXY_METHOD_ATTIBUTE).asText();
		String restType = StringUtils.join(payloadNode.get(PortalRestConstants.PORTAL_PROXY_REST_ATTIBUTE).asText());

		Properties externalErrorProperty = null != externalErrorProperties.get(portalId)
				? externalErrorProperties.get(portalId).get(selectedLocale)
				: null;

		if (null == externalErrorProperty) {
			externalErrorProperty = null != externalErrorProperties.get(portalId)
					? externalErrorProperties.get(portalId).get("en")
					: null;
		}
		
		try {

			apiUrl = java.net.URLDecoder.decode(apiUrl, StandardCharsets.UTF_8.name());
			log.info("Proxy Trusted LookUp API - BE's Api Call for url {}, with http method {} ", apiUrl, httpMethod);
			String restValue = BEProxyEnum.valueByCode(restType);

			String trustedUser = portalUIService.getTrustedAppUser(portalId, orsId);
			log.info("Proxy Api BE Trusted user name is {}", trustedUser);
			String securityPayload = PortalConfigUtil
					.getSecurityPayloadForRest(PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, restValue);

			HttpHeaders headers = new HttpHeaders();
			headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, securityPayload);
			headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
			headers.add(HttpHeaders.COOKIE, StringUtils.join(PortalServiceConstants.BES_LOCALE, selectedLocale));
			
			JsonNode requestHeaders = payloadNode.get(PortalRestConstants.PORTAL_PROXY_HEADER_ATTRIBUTE);
			if (null != requestHeaders && !requestHeaders.isNull()) {
				Iterator<Entry<String, JsonNode>> requestHeaderIter = requestHeaders.fields();
				while (requestHeaderIter.hasNext()) {
					Entry<String, JsonNode> requestHeader = requestHeaderIter.next();
					headers.add(requestHeader.getKey(), requestHeader.getValue().asText());
				}
			}
			
			log.info("Proxy Trusted LookUp API - BE's Api Call for url {}, with restKey {} ", apiUrl, restValue);

			HttpEntity<?> request = null;
			
			if (HttpMethod.GET.name().equalsIgnoreCase(httpMethod)) {
				request = new HttpEntity<String>(headers);
			} else {
				log.error("Invalid http method for proxy tusted app for url {}, as method type {}",
						apiUrl, httpMethod);
				throw new PortalBadRequestException(ErrorCodeContants.CONFIG606,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606));
			}

			responseNode = restTemplate.exchange(apiUrl, HttpMethod.resolve(httpMethod), request, JsonNode.class);
			
			if (responseNode.getStatusCode().series() == Series.SERVER_ERROR || responseNode.getStatusCode().series() == Series.CLIENT_ERROR) {
				log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
						httpMethod, apiUrl, responseNode.getStatusCode().getReasonPhrase());
				throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
						responseNode.getStatusCode().getReasonPhrase(), responseNode.getBody().asText(), externalErrorProperty, beErrorMapping);
			}

		} catch (PortalServerSideValidationException e) {
			throw e;
		} catch (HttpServerErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (HttpClientErrorException e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalServerSideValidationException(ErrorCodeContants.CONFIG606, errorCodeProperties,
					e.getMessage(), e.getResponseBodyAsString(), externalErrorProperty, beErrorMapping);
		} catch (Exception e) {
			log.error("Error on invoking proxy api for payload {}, with method type {}, for apiUrl {}", payloadNode,
					httpMethod, apiUrl, e.getMessage());
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG606,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG606), e.getMessage());
		}

		return responseNode.getBody();

	}
	
	private String generateEncryptedCookie(String portalsessionid, String serverType) throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException {
		
		String cookie = null;
		 if(PortalServiceConstants.APP_SERVER_WEBLOGIC.equalsIgnoreCase(serverType)) {
			
			cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", 
					Base64.encodeBytes(
							DatatypeConverter.printHexBinary(encryptSecurityPayload(portalsessionid)).getBytes(), 8));
		} else {
			
			cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
					Base64.encodeBytes(
							DatatypeConverter.printHexBinary(encryptSecurityPayload(portalsessionid)).getBytes(), 8),
					"\"");
		}
		
		return cookie;
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

	private  String decryptWithPortalPrivateKey(String input){
		CertificateHelper certificateHelper = CertificateHelper.getInstance(cmxHome);
		PrivateKey portalPrivateKey = certificateHelper.getPrivateKey(PortalServiceConstants.TRUSTED_APP);
		String decryptedValue = "";
		try {
			decryptedValue = new String(certificateHelper.decrypt(Base64.decode(input), portalPrivateKey), StandardCharsets.UTF_8);

		} catch (InvalidKeyException | NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException
				 | BadPaddingException e) {
			log.error("Unable to encrypt ", e);
		}
		return decryptedValue ;
	}

}
