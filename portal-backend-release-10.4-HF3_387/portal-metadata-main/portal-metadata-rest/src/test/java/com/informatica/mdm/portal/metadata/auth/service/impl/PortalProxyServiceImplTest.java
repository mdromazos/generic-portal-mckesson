package com.informatica.mdm.portal.metadata.auth.service.impl;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.DatatypeConverter;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.delos.cmx.server.MDMSessionException;
import com.delos.cmx.server.admin.AdminLogin;
import com.delos.util.base64.Base64;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import com.siperian.sif.client.CertificateHelper;

@RunWith(PowerMockRunner.class)
@PrepareForTest({HubClient.class, PkiUtilProvider.class, CertificateHelper.class, DatatypeConverter.class, Base64.class, PortalConfigUtil.class, IOUtils.class, PortalRestUtil.class})
@PowerMockIgnore("javax.management.*")
public class PortalProxyServiceImplTest {

	@Mock
	RestTemplate restTemplate;
	
	@Mock
	HubClient hubClient;
	
	@Mock
	AdminLogin adminLogin;
	
	@Mock
	ResponseEntity<JsonNode> responseNode;
	
	@Mock
	ResponseEntity<String> response;
	
	@Mock
	PkiUtilProvider pkutilProvider;
	
	@Mock
	HttpServletRequest httpRequest;

    @Mock
    HttpServletResponse httpResponse;
	
	@Mock
	PKIUtil pkiUtil;
	
	@Mock
	private Map<String, Map<String, Properties>> externalErrorProperties;
	
	@Mock
	private Map<String, Properties> externalErrorProperty;
	
	@Mock
	Certificate certificate;
	
	@Mock
	PublicKey publicKey;
	
	@Mock
	PrivateKey privateKey;
	
	@Mock
	HttpHeaders httpHeaders;
	
	@Mock
	MultipartFile file;
	
	@Mock
	Resource resource;
	
	@Mock
	InputStream inputStream;
	
	@Mock
	CertificateHelper certificateHelper;
	
	@Mock
	ObjectMapper mapper;
	
	@Mock
	PortalUIService portalUIService;
	
	@InjectMocks
	PortalProxyServiceImpl portalProxyService;
	
	HashMap<String, Object> userSession;
	ObjectNode payloadNode;
	ObjectMapper objectMapper;
	
	@Before
	public void setUp() throws Exception {
		
		MockitoAnnotations.initMocks(this);
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(PkiUtilProvider.class);
		PowerMockito.mockStatic(CertificateHelper.class);
		PowerMockito.mockStatic(DatatypeConverter.class);
		PowerMockito.mockStatic(PortalConfigUtil.class);
		PowerMockito.mockStatic(PortalRestUtil.class);
		PowerMockito.mockStatic(IOUtils.class);
		//PowerMockito.mockStatic(Base64.class);
		objectMapper = new ObjectMapper();
		Mockito.when(HubClient.getInstance()).thenReturn(hubClient);
		Mockito.when(PkiUtilProvider.getInstance(Mockito.any())).thenReturn(pkutilProvider);
		Mockito.when(pkutilProvider.getPkiUtil()).thenReturn(pkiUtil);
		Mockito.when(pkiUtil.getCertificate(Mockito.any())).thenReturn(certificate);
		Mockito.when(certificate.getPublicKey()).thenReturn(publicKey);
		Mockito.when(pkiUtil.getPrivateKey(Mockito.any())).thenReturn(privateKey);
		Mockito.when(CertificateHelper.getInstance(Mockito.any())).thenReturn(certificateHelper);
		Mockito.when(certificateHelper.encrypt(Mockito.any(byte[].class), Mockito.any(Key.class))).thenReturn("ecncryptedPayload".getBytes());
		Mockito.when(DatatypeConverter.printHexBinary(Mockito.any(byte[].class))).thenReturn("ecncryptedPayload");
		Mockito.when(httpRequest.getScheme()).thenReturn("http");
		Mockito.when(httpRequest.getServerName()).thenReturn("localhost");
		Mockito.when(httpRequest.getServerPort()).thenReturn(8080);
		PowerMockito.when(PortalRestUtil.getCookieValue(httpRequest, "selectedLocale")).thenReturn("de");
		PowerMockito.when(PortalRestUtil.getCookieValue(Mockito.any(HttpServletRequest.class), Mockito.any(String.class))).thenReturn("mdmSessionId");
		Cookie [] cookie = {};
		Mockito.when(httpRequest.getCookies()).thenReturn(cookie);
		Mockito.when(externalErrorProperties.get(Mockito.any())).thenReturn(externalErrorProperty);
		Mockito.when(externalErrorProperty.get(Mockito.any())).thenReturn(null);
		userSession = new HashMap<String, Object>();
		userSession.put(PortalRestConstants.RECORD_ID, "10041");
		payloadNode = objectMapper.createObjectNode();
		payloadNode.put("proxyAttribute", "10041");
		payloadNode.put("apiUrl", "cmx/cs/orcl-SUPPLIER_HUB/SupplierView/120001?depth=10&systemName=Admin");
		
	}
	
	@Test
	public void testInvokeApiPost() throws PortalConfigException, IOException {

		payloadNode.put("httpMethod", "POST");
		HttpHeaders headers = new HttpHeaders();
		String cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
				Base64.encodeBytes(
						"ecncryptedPayload".getBytes(), 8),
				"\"");
		cookie = StringUtils.join(cookie, "; selectedLocale=", "de");
		headers.add("Cookie", cookie);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON, MediaType.ALL));
		
		HttpEntity<?> request = new HttpEntity<Object>(payloadNode.get("payload"), headers);
		Mockito.when(restTemplate.exchange(Mockito.anyString(),
				Mockito.any(HttpMethod.class), Mockito.any(HttpEntity.class), Mockito.eq(String.class))).thenReturn(response);
		Mockito.when(response.getStatusCode()).thenReturn(HttpStatus.OK);
		JsonNode responseNode = objectMapper.createObjectNode();
		Mockito.when(response.getBody()).thenReturn("value");
		Mockito.when(response.getHeaders()).thenReturn(httpHeaders);
		Mockito.when(httpHeaders.getContentType()).thenReturn(MediaType.APPLICATION_JSON);
		Mockito.when(mapper.readTree(Mockito.anyString())).thenReturn(responseNode);
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)).thenReturn("orcl-Supplier_hub");
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID)).thenReturn("12345");
		assertNotNull(portalProxyService.invokeApi(payloadNode, httpRequest,httpResponse));
		
	}
	
	@Test
	public void testInvokeApiGet() throws PortalConfigException, IOException {

		payloadNode.put("httpMethod", "GET");
		HttpHeaders headers = new HttpHeaders();
		String cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
				Base64.encodeBytes(
						"ecncryptedPayload".getBytes(), 8),
				"\"");
		cookie = StringUtils.join(cookie, "; selectedLocale=", "de");
		headers.add("Cookie", cookie);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON, MediaType.ALL));
		HttpEntity<?> request = new HttpEntity<Object>(headers);
		Mockito.when(restTemplate.exchange(Mockito.anyString(),
				Mockito.any(HttpMethod.class), Mockito.any(HttpEntity.class), Mockito.eq(String.class))).thenReturn(response);
		Mockito.when(response.getStatusCode()).thenReturn(HttpStatus.OK);
		JsonNode responseNode = objectMapper.createObjectNode();
		Mockito.when(response.getBody()).thenReturn("value");
		Mockito.when(response.getHeaders()).thenReturn(httpHeaders);
		Mockito.when(httpHeaders.getContentType()).thenReturn(MediaType.APPLICATION_JSON);
		Mockito.when(mapper.readTree(Mockito.anyString())).thenReturn(responseNode);
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)).thenReturn("orcl-Supplier_hub");
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID)).thenReturn("12345");
		assertNotNull(portalProxyService.invokeApi(payloadNode, httpRequest,httpResponse));
		
	}

	@Test
	public void testValidateProxy() throws PortalConfigException, MDMSessionException {
		Mockito.when(PortalRestUtil.getUserSessionData(Mockito.anyString())).thenReturn(userSession);
		assertTrue(portalProxyService.validateProxy(payloadNode, "mdmsessionid"));
		
	}
	
	@Test
	public void testValidateProxyFalse() throws PortalConfigException, MDMSessionException {
		Mockito.when(PortalRestUtil.getUserSessionData(Mockito.anyString())).thenReturn(userSession);
		payloadNode.put("proxyAttribute", "10042");
		assertFalse(portalProxyService.validateProxy(payloadNode, "mdmsessionid"));
		
	}
	
	@Test
	public void testInvokeProxyByTrustedApp() throws PortalConfigException {

		payloadNode.put("httpMethod", "GET");
		payloadNode.put("apiUrl",
				"cmx/lookup/orcl-Supplier_Hub/id-label/Supplier/Address/PostalAddress/pstlAddrBoClassCd");
		payloadNode.put("restType", "lookup");
		HttpHeaders headers = new HttpHeaders();
		Mockito.when(portalUIService.getTrustedAppUser(Mockito.any(), Mockito.any())).thenReturn("admin");
		Mockito.when(PortalConfigUtil.getSecurityPayloadForRest(PortalServiceConstants.TRUSTED_APP + "/admin",
				"orcl-Supplier_Hub", "readLookupsAsIdAndLabelUsingGET")).thenReturn("ecncryptedPayload");
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, "ecncryptedPayload");
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		headers.add("Cookie", StringUtils.join("selectedLocale=", "de"));
		HttpEntity<?> request = new HttpEntity<Object>(headers);
		Mockito.when(restTemplate.exchange(
				Mockito.anyString(),
				Mockito.any(HttpMethod.class), Mockito.any(HttpEntity.class), Mockito.eq(JsonNode.class)))
				.thenReturn(responseNode);
		Mockito.when(responseNode.getStatusCode()).thenReturn(HttpStatus.OK);
		JsonNode response = objectMapper.createObjectNode();
		Mockito.when(responseNode.getBody()).thenReturn(response);
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)).thenReturn("orcl-Supplier_hub");
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID)).thenReturn("12345");
		assertNotNull(portalProxyService.invokeProxyByTrustedApp(payloadNode, "orcl-Supplier_Hub", httpRequest));

	}
	
	@Test
	public void testFileUploadViaProxy() throws PortalConfigException, IOException {

		payloadNode.put("apiUrl", "cmx/file/localhost-orcl-SUPPLIER_HUB/TEMP/TEMP_SVR1.O0GI/content");
		payloadNode.put("httpMethod", "PUT");
		HttpHeaders headers = new HttpHeaders();
		String cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
				Base64.encodeBytes(
						"ecncryptedPayload".getBytes(), 8),
				"\"");
		cookie = StringUtils.join(cookie, "; selectedLocale=", "de");
		headers.add("Cookie", cookie);
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));
		
		Mockito.when(file.getResource()).thenReturn(resource);
		Mockito.when(resource.getInputStream()).thenReturn(inputStream);
		Mockito.when(IOUtils.toByteArray(inputStream)).thenReturn("file".getBytes());
		
		HttpEntity<?> request = new HttpEntity<byte[]>("file".getBytes(), headers);
		Mockito.when(restTemplate.exchange(Mockito.anyString(),
				Mockito.any(HttpMethod.class), Mockito.any(HttpEntity.class), Mockito.eq(JsonNode.class))).thenReturn(responseNode);
		Mockito.when(responseNode.getStatusCode()).thenReturn(HttpStatus.OK);
		Mockito.when(responseNode.getBody()).thenReturn(new ObjectMapper().createObjectNode());
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)).thenReturn("orcl-Supplier_hub");
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID)).thenReturn("12345");
		assertNotNull(portalProxyService.uploadFileViaProxy(payloadNode, file, httpRequest));
		
	}
	
	@Test
	public void downloadFileViaProxy() throws PortalConfigException, IOException {

		payloadNode.put("httpMethod", "GET");
		payloadNode.put("apiUrl", "cmx/file/localhost-orcl-SUPPLIER_HUB/DB/DB_SVR1.O0GI/content");
		HttpHeaders headers = new HttpHeaders();
		String cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
				Base64.encodeBytes(
						"ecncryptedPayload".getBytes(), 8),
				"\"");
		cookie = StringUtils.join(cookie, "; selectedLocale=", "de");
		headers.add("Cookie", cookie);
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));
		HttpEntity<?> request = new HttpEntity<Resource>(headers);
		@SuppressWarnings("unchecked")
		ResponseEntity<byte[]> resourceResponse = Mockito.mock(ResponseEntity.class);
		Mockito.when(restTemplate.exchange(Mockito.anyString(),
				Mockito.any(HttpMethod.class), Mockito.any(HttpEntity.class), Mockito.eq(byte[].class))).thenReturn(resourceResponse);
		Mockito.when(resourceResponse.getStatusCode()).thenReturn(HttpStatus.OK);
		Mockito.when(resourceResponse.getBody()).thenReturn("file".getBytes());
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)).thenReturn("orcl-Supplier_hub");
		Mockito.when(httpRequest.getHeader(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID)).thenReturn("12345");
		assertNotNull(portalProxyService.downloadFileViaProxy(payloadNode, httpRequest));
		
	}

}
