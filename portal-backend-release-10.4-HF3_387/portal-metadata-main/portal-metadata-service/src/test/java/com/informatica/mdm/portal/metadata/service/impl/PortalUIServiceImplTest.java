package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.IOException;
import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.DatatypeConverter;

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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.delos.util.base64.Base64;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import com.siperian.sif.client.CertificateHelper;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@PrepareForTest({PortalConfigUtil.class, PkiUtilProvider.class, CertificateHelper.class, DatatypeConverter.class, Base64.class})
public class PortalUIServiceImplTest {

	@Mock
	PortalPersistenceService portalService;
	
	@Mock
	Credentials credentials;
	
	@Mock
	ObjectMapper mapper;
	
	@Mock
	RestTemplate restTemplate;
	
	@Mock
	ResponseEntity<String> responseNode;
	
	@Mock
    ResponseEntity<String> response;
	
	@Mock
	ExternalConfigFactory configfactory;
	
	@Mock
	private Properties errorCodeProperties;
	
	@Mock
	private Map<String, Map<String, Properties>> externalErrorProperties;
	
	@Mock
	private Map<String, Properties> externalErrorProperty;
	
	@Mock
	private HttpServletRequest request;
	
	@Mock
	PkiUtilProvider pkutilProvider;
	
	@Mock
	CertificateHelper certificateHelper;
	
	@Mock
	HttpServletRequest httpRequest;
	
	@Mock
	PKIUtil pkiUtil;
	
	@Mock
	Certificate certificate;
	
	@Mock
	PublicKey publicKey;
	
	@Mock
	PrivateKey privateKey;
	
	@InjectMocks
	PortalUIServiceImpl portalUIService;
	
	JsonNode portalNode, portalChildNode, portalGrandChildNode, runtimeConfigNode, userNode, beNode, runtimeNode, userPreferenceNode;
	
	
	ObjectMapper objectMapper;
	
	private static final String PAGE_NODE_VALUE = "{\"name\":\"freddieKeugerPage\",\"type\":true,\"accessType\":0,\"layout\":{\"sections\":[{\"displayIcon\":\"icon image\",\"isDefault\":false,\"orientation\":\"orien\",\"customStyle\":\"custom-style\",\"backgroundColor\":\"bg-color\",\"containers\":[{\"content\":\"container\",\"style\":{\"width\":1}}]}]}}";
	private static final String PAGES_ARRAY_NODE = "[{\"id\":\"2\",\"name\":\"moanaPage\"},{\"id\":\"3\",\"name\":\"neemoPage\"},{\"id\":\"4\",\"name\":\"freddiePage\"}]";
	private static final String PORTAL_NODE = "{\"portalName\":\"Supplier Portal\",\"portalTitle\":\"Supplier Portal\",\"isStateEnabled\":true,\"beName\":\"Supplier\",\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\"}";
	private static final String SECURITY_PAYLOAD = "infaPortal/admin===3846373930463144313733394346394141384145384242413439323842343646423731333642373930313945433239393032363543463044313636323142314439333434333642333835304245413433343843343138314339304535433143324434454344443";
	private static final String runtimeConfig = "[{\"key\":\"SignUp Section\",\"desc\":\"SignUp Section\",\"configuration\":[{\"key\":\"username\",\"desc\":\"Username\",\"value\":\"admin\",\"type\":\"String\"},{\"key\":\"fullName\",\"desc\":\"Full Name\",\"value\":\"Entity\",\"type\":\"String\"}]},{\"key\":\"Login Section\",\"desc\":\"Login Section\",\"configuration\":[{\"key\":\"uniqueFieldPath\",\"desc\":\"uniqueFieldPath\",\"value\":\"Contacts.contacts.prtlUsrNm\",\"type\":\"String\"},{\"key\":\"recordIdField\",\"desc\":\"recordIdField\",\"value\":\"rowidObject\",\"type\":\"String\"}]}]";
	private static final String runtimeData = "[{\"name\":\"Session Section\",\"desc\":\"Session Settings\",\"label\":\"Session Settings\",\"configuration\":[{\"key\":\"session.timeout\",\"desc\":\"Number of minutes to wait before an idle session times out.\",\"label\":\"Session Timeout Interval\",\"value\":420,\"type\":\"Integer\",\"isMandatory\":true},{\"key\":\"session.timeout.warning\",\"desc\":\"Number of seconds before a session times out you want to display a warning message.\",\"label\":\"Session Timeout Warning Time\",\"value\":60,\"type\":\"Integer\",\"isMandatory\":true}]},{\"name\":\"Password Section\",\"desc\":\"Password Settings\",\"label\":\"Password Settings\",\"configuration\":[{\"key\":\"passwordResetLinkExpiry\",\"desc\":\"Time Period after which the password reset link must expire. Use the hh:mm:ss format.\",\"label\":\"Password Reset Link Expiry Time\",\"value\":\"1:0:0\",\"type\":\"String\",\"isMandatory\":true},{\"key\":\"passwordPolicy\",\"desc\":\"Password policy for the portal. The policy appears in the sign up page.\",\"label\":\"Password Policy\",\"value\":\"Valid passwords must be between 4 and 9 characters in length\",\"type\":\"String\",\"isMandatory\":true}]},{\"name\":\"Portal Administrator User\",\"desc\":\"Portal Administrator User\",\"label\":\"Portal Administrator User\",\"configuration\":[{\"key\":\"username\",\"desc\":\"User name with administrative privileges to access the portal.\",\"label\":\"Username\",\"value\":\"admin\",\"type\":\"String\",\"isMandatory\":true}]}]";
    private static final String userPreference = "{\"a60020774f1a432eafaa8f7d9e6ccdc2\": {\r\n\t\t\"PREFERENCE_TYPE\": \"WizardCompletedSteps\",\r\n\t\t\"USER_PREFERENCE\": {\r\n\t\t\t\"WizardId\": \"876\",\r\n\t\t\t\"completedSteps\": [\r\n\t\t\t\t123,\r\n\t\t\t\t456,\r\n\t\t\t\t789\r\n\t\t\t]\r\n\t\t}\r\n\t}\r\n}";

	@Before
    public void setUp() throws Exception {
		
        MockitoAnnotations.initMocks(this);
        PowerMockito.mockStatic(PkiUtilProvider.class);
		PowerMockito.mockStatic(CertificateHelper.class);
		PowerMockito.mockStatic(DatatypeConverter.class);
        objectMapper = new ObjectMapper();
        userNode = objectMapper.createObjectNode();
        beNode = objectMapper.createObjectNode();
        ((ObjectNode) beNode).put("rowidObject", "123");
        ((ObjectNode) userNode).set("BEData", beNode);
        portalNode = objectMapper.readTree(PORTAL_NODE);
        ObjectNode genSettings = ((ObjectNode) portalNode).putObject(PortalMetadataContants.GENERAL_SETTINGS);
		genSettings.put(PortalMetadataContants.PORTAL_NAME, "Supplier Portal");
		genSettings.put(PortalMetadataContants.DATABASE_ID, "orcl-localhost-Supplier");
		genSettings.put(PortalMetadataContants.PORTAL_TITLE, "Supplier Portal");
        portalChildNode = objectMapper.readTree(PAGES_ARRAY_NODE);
        portalGrandChildNode = objectMapper.readTree(PAGE_NODE_VALUE);
        runtimeConfigNode = objectMapper.readTree(runtimeConfig);
        runtimeNode = objectMapper.readTree(runtimeData);
        userPreferenceNode = objectMapper.readTree((userPreference));
        PowerMockito.mockStatic(PortalConfigUtil.class);
        Mockito.when(PortalConfigUtil.getSecurityPayloadForRest(Mockito.anyString(),
        		Mockito.anyString(), Mockito.anyString())).thenReturn(SECURITY_PAYLOAD);
        Mockito.when(configfactory.invokeExternalConfigService(Mockito.any(JsonNode.class), Mockito.any(),
        		Mockito.anyString(), Mockito.anyString(), Mockito.any(), Mockito.anyString(), Mockito.any(),Mockito.anyString())).thenReturn(portalNode);
        Mockito.when(errorCodeProperties.getProperty(Mockito.anyString())).thenReturn("Exception Occured");
        Mockito.when(PkiUtilProvider.getInstance(Mockito.any())).thenReturn(pkutilProvider);
		Mockito.when(pkutilProvider.getPkiUtil()).thenReturn(pkiUtil);
		Mockito.when(pkiUtil.getCertificate(Mockito.any())).thenReturn(certificate);
		Mockito.when(certificate.getPublicKey()).thenReturn(publicKey);
		Mockito.when(pkiUtil.getPrivateKey(Mockito.any())).thenReturn(privateKey);
		Mockito.when(CertificateHelper.getInstance(Mockito.any())).thenReturn(certificateHelper);
		Mockito.when(certificateHelper.encrypt(Mockito.any(byte[].class), Mockito.any(Key.class))).thenReturn("ecncryptedPayload".getBytes());
		Mockito.when(DatatypeConverter.printHexBinary(Mockito.any(byte[].class))).thenReturn("ecncryptedPayload");
		Mockito.when(externalErrorProperties.get(Mockito.any())).thenReturn(externalErrorProperty);
		PowerMockito.when(PortalConfigUtil.getCookieValue(Mockito.any(HttpServletRequest.class), Mockito.anyString())).thenReturn("mdmSessionId");
		
    }
 
	@Test
	public void testGetGlobalPortal() throws PortalConfigException {
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_SOURCE_SYSTEM_NAME, "admin");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_STATUS_ATTRIBUTE, PortalMetadataContants.PORTAL_STATUS_START);
		((ObjectNode) portalNode).putObject(PortalMetadataContants.USER_MANAGEMENT_ATTRIBUTE).setAll(objectMapper.createObjectNode());
		Mockito.when(portalService.getPublishedPortalConfig(credentials, "1", "orcl-Supplier")).thenReturn(portalNode); 
		Mockito.when(mapper.createArrayNode()).thenReturn(objectMapper.createArrayNode());
		Mockito.when(mapper.createObjectNode()).thenReturn(objectMapper.createObjectNode());
		Mockito.when(portalService.getPortalRuntimeConfig(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(runtimeNode);
		assertNotNull(portalUIService.getGlobalPortal(credentials, "1", "orcl-Supplier","http://localhost:8080", "de","ict"));
	}
	
	@Test
	public void testGetPortalEdgeCase() throws PortalConfigException {
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		Mockito.when(portalService.getPublishedPortalConfig(credentials, "1", "orcl-Supplier")).thenReturn(null); 
		Mockito.when(mapper.createArrayNode()).thenReturn(objectMapper.createArrayNode());
		Mockito.when(mapper.createObjectNode()).thenReturn(objectMapper.createObjectNode());
		Mockito.when(portalService.getPortalRuntimeConfig(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(runtimeNode);
		assertNull(portalUIService.getGlobalPortal(credentials, "1", "orcl-Supplier", "http://localhost:8080", "de","ict"));
	}
	
	@Test
	public void testGetRuntimeConfig() throws PortalConfigException, IOException {
		
		Mockito.when(portalService.getPortalRuntimeConfig(credentials, "localhost-orcl-SUPPLIER_HUB", "1")).thenReturn(runtimeConfigNode);
		List<String> projections = new ArrayList<String>();
		projections.add("key");
		projections.add("value");
		projections.add("configuration");
		String filter = "{\"key\": [\"Login Section\"]}";
		PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig("localhost-orcl-SUPPLIER_HUB", null, null, filter,
				  null, null, null, null, null, projections, false);
		JsonNode responseNode = portalUIService.getRuntimeConfig(credentials, "1", restConfig);
		assertEquals("uniqueFieldPath", responseNode.get(0).get("configuration").get(0).get("key").asText());
	}
	
	@Test
	public void testDeleteUser() throws PortalConfigException {

		Mockito.when(PortalConfigUtil.getSecurityPayloadForRest(Mockito.anyString(), Mockito.anyString(),
				Mockito.anyString())).thenReturn("mdmsessionid");
		Mockito.when(request.getScheme()).thenReturn("http");
		Mockito.when(request.getServerName()).thenReturn("localhost");
		Mockito.when(request.getServerPort()).thenReturn(8080);
		HttpHeaders headers = new HttpHeaders();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, "mdmsessionid");
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		Mockito.when(PortalConfigUtil.executeRest(Mockito.anyString(), Mockito.any(HttpMethod.class),
				Mockito.any(), Mockito.any(HttpHeaders.class), Mockito.any(RestTemplate.class))).thenReturn(responseNode);
		Mockito.when(request.getHeader(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID)).thenReturn("portalId");
		Mockito.when(responseNode.getStatusCode()).thenReturn(HttpStatus.OK);
		HttpHeaders headersBE = new HttpHeaders();
		String cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
				Base64.encodeBytes(
						"ecncryptedPayload".getBytes(), 8),
				"\"");
		headersBE.add("Cookie", cookie);
		Mockito.when(restTemplate.exchange(Mockito.anyString(),
				Mockito.any(HttpMethod.class), Mockito.any(HttpEntity.class), Mockito.eq(String.class))).thenReturn(response);
		Mockito.when(response.getStatusCode()).thenReturn(HttpStatus.OK);
        Mockito.when(portalService.getPortalRuntimeConfig(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(runtimeNode);
		portalUIService.deleteUser(request, "orcl-Supplier_hub", "roberto@infa", "SupplierView", userNode, "admin");

	}
	
	@Test
	public void testGetTrustedAppUser() throws IOException, PortalConfigException {
		
		List<String> projections = new ArrayList<String>();
		projections.add(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
        Mockito.when(portalService.getPortalRuntimeConfig(null, "orcl-Supplier", "1")).thenReturn(runtimeNode);
        String trustedUser = portalUIService.getTrustedAppUser("1", "orcl-Supplier");
        assertEquals("admin", trustedUser);
	}

    @Test
    public void testSavePortalPreference() throws Exception {
		Mockito.when(mapper.createObjectNode()).thenReturn(objectMapper.createObjectNode());
        Mockito.when(portalService.savePreference(Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.any())).thenReturn(userPreferenceNode);
        assertEquals(userPreferenceNode,portalUIService.savePortalPreference("4", "abc@mail.com", "localhost-orcl-c360", "123", userPreferenceNode));
	}


    @Test
    public void testGetPortalPreference() throws Exception {
        Mockito.when(portalService.getPreference("4", "abc@mail.com", "localhost-orcl-c360", null)).thenReturn(userPreferenceNode);
        assertEquals(userPreferenceNode,portalUIService.getPortalPreference("4", "abc@mail.com", "localhost-orcl-c360", null));
    }

}
