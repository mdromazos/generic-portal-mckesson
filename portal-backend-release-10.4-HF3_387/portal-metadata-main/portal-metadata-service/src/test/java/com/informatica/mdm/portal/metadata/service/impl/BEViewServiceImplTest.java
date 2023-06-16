package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.util.Map;

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
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.delos.cmx.server.admin.AdminLogin;
import com.delos.util.base64.Base64;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import com.siperian.sif.client.CertificateHelper;

@RunWith(PowerMockRunner.class)
@PrepareForTest({HubClient.class, PkiUtilProvider.class, CertificateHelper.class, DatatypeConverter.class, Base64.class, PortalConfigUtil.class})
@PowerMockIgnore("javax.management.*")
public class BEViewServiceImplTest {

	@Mock
	RestTemplate restTemplate;

	@Mock
	Credentials credentials;

	@Mock
	ObjectMapper mapper;
	
	@Mock
	HubClient hubClient;
	
	@Mock
	AdminLogin adminLogin;
	
	@Mock
	PkiUtilProvider pkutilProvider;
	
	@Mock
	PKIUtil pkiUtil;
	
	@Mock
	Certificate certificate;
	
	@Mock
	PublicKey publicKey;
	
	@Mock
	PrivateKey privateKey;
	
	@Mock
	CertificateHelper certificateHelper;

	@Mock
	ResponseEntity<JsonNode> externalMetadataResponse;

	@Mock
	Map<CacheModel, JsonNode> externalMetadataCache;

	@InjectMocks
	BEConfigServiceImpl beViewService;

	JsonNode portalConfigNode, beViewNode;

	String portalConfig = "{\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"fullNm\\\")]\",\"configName\":\"Supplier\",\"fieldType\":\"dropdown\",\"order\":0}";

	String beView = "{\"operations\":{\"read\":{\"allowed\":true},\"search\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"objectType\":\"ENTITY\",\"timeline\":true,\"object\":{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"field\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"searchable\":{\"filterable\":true,\"facet\":false},\"name\":\"fullNm\",\"label\":\"Full Name\",\"dataType\":\"String\",\"length\":100,\"required\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"searchable\":{\"filterable\":true,\"facet\":false},\"name\":\"naicsCd\",\"label\":\"Naics Code\",\"dataType\":\"String\",\"length\":20,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"name\":\"lglFrm\",\"label\":\"Legal Form\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc&idlabel=legalFormCode%3AlegalFormDesc\",\"rel\":\"lookup\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc\",\"rel\":\"list\"}],\"object\":\"LookupLegalForm\",\"key\":\"legalFormCode\",\"value\":\"legalFormDesc\"}}],\"contentMetadata\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"delete\":{\"allowed\":true}},\"name\":\"XREF\"}],\"name\":\"Supplier\",\"label\":\"Supplier\",\"existsFormat\":\"{label} {fullNm}\",\"many\":false}}";

	String portalConfigOneToMany = "{\"configType\":\"BEView\",\"attributeSelector\":\"$.object.child[?(@.name==\\\"Contracts\\\")].child[?(@.name==\\\"Contracts\\\")].field[?(@.name==\\\"cntrctBoClassCd\\\")]\",\"configName\":\"Supplier\",\"fieldType\":\"textBox\"}";

	String beViewOneToMany = "{\"operations\":{\"read\":{\"allowed\":true},\"search\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"objectType\":\"ENTITY\",\"timeline\":true,\"object\":{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"field\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"searchable\":{\"filterable\":true,\"facet\":false},\"name\":\"fullNm\",\"label\":\"Full Name\",\"dataType\":\"String\",\"length\":100,\"required\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"searchable\":{\"filterable\":true,\"facet\":false},\"name\":\"naicsCd\",\"label\":\"Naics Code\",\"dataType\":\"String\",\"length\":20,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"name\":\"lglFrm\",\"label\":\"Legal Form\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc&idlabel=legalFormCode%3AlegalFormDesc\",\"rel\":\"lookup\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc\",\"rel\":\"list\"}],\"object\":\"LookupLegalForm\",\"key\":\"legalFormCode\",\"value\":\"legalFormDesc\"}}],\"child\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"child\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"field\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"allowedValues\":[\"Contract\"],\"name\":\"cntrctBoClassCd\",\"label\":\"Contract Class\",\"dataType\":\"String\",\"length\":255,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true}],\"contentMetadata\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"delete\":{\"allowed\":true}},\"name\":\"XREF\"}],\"name\":\"Contracts\",\"label\":\"Contracts\",\"many\":true}],\"name\":\"Contracts\",\"label\":\"Contracts\",\"many\":true}],\"contentMetadata\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"delete\":{\"allowed\":true}},\"name\":\"XREF\"}],\"name\":\"Supplier\",\"label\":\"Supplier\",\"existsFormat\":\"{label} {fullNm}\",\"many\":false}}";

	ObjectMapper objectMapper;

	@Before
	public void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(PkiUtilProvider.class);
		PowerMockito.mockStatic(CertificateHelper.class);
		PowerMockito.mockStatic(DatatypeConverter.class);
		PowerMockito.mockStatic(PortalConfigUtil.class);
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
		objectMapper = new ObjectMapper();
	}

	@Test
	public void testEnrichExternalMetaData() throws PortalConfigException, IOException {
		beViewNode = objectMapper.readTree(beView);
		portalConfigNode = objectMapper.readTree(portalConfig);
		String authCookie = "mdmsessionid" + "=" + "mdmSessionId";
		HttpHeaders headers = new HttpHeaders();
		authCookie = StringUtils.join(authCookie, ";selectedLocale=", "de");
		headers.add("Cookie", authCookie);
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, "ict");
		HttpEntity<?> request = new HttpEntity<String>(headers);
		String apiUrl = "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/Supplier.json?action=meta";
		Mockito.when(restTemplate.exchange(apiUrl, HttpMethod.GET, request, JsonNode.class))
				.thenReturn(externalMetadataResponse);
		Mockito.when(externalMetadataResponse.getBody()).thenReturn(beViewNode);
		JsonNode enrichedNode = beViewService.enrichConfigExternalData(portalConfigNode, credentials,
				"localhost-orcl-SUPPLIER_HUB", "mdmSessionId", "http://localhost:8080", "de", false,"ict");
		assertNotNull(enrichedNode.get("metadata"));
	}

	@Test
	public void testEnrichExternalMetaDataOneToMany() throws PortalConfigException, IOException {
		beViewNode = objectMapper.readTree(beViewOneToMany);
		portalConfigNode = objectMapper.readTree(portalConfigOneToMany);
		String authCookie = "mdmsessionid" + "=" + "mdmSessionId";
		HttpHeaders headers = new HttpHeaders();
		authCookie = StringUtils.join(authCookie, ";selectedLocale=", "de");
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER,"ict");
		headers.add("Cookie", authCookie);
		HttpEntity<?> request = new HttpEntity<String>(headers);
		String apiUrl = "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/Supplier.json?action=meta";
		Mockito.when(restTemplate.exchange(apiUrl, HttpMethod.GET, request, JsonNode.class))
				.thenReturn(externalMetadataResponse);
		Mockito.when(externalMetadataResponse.getBody()).thenReturn(beViewNode);
		JsonNode enrichedNode = beViewService.enrichConfigExternalData(portalConfigNode, credentials,
				"localhost-orcl-SUPPLIER_HUB", "mdmSessionId", "http://localhost:8080", "de", false,"ict");
		assertNotNull(enrichedNode.get("metadata"));
	}

	@Test
	public void testEnrichExternalMetaDataForUI() throws PortalConfigException, IOException {
		beViewNode = objectMapper.readTree(beView);
		portalConfigNode = objectMapper.readTree(portalConfig);
		HttpHeaders headers = new HttpHeaders();
		String cookie = StringUtils.join(ExternalConfigConstants.AUTH_PAYLOAD_COOKIE, "=", "\"",
				Base64.encodeBytes(
						"ecncryptedPayload".getBytes(), 8),
				"\"");
		cookie = StringUtils.join(cookie, "; selectedLocale=", "de");
		headers.add("Cookie", cookie);
		HttpEntity<?> request = new HttpEntity<String>(headers);
		String apiUrl = "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/Supplier.json?action=meta";
		Mockito.when(restTemplate.exchange(apiUrl, HttpMethod.GET, request, JsonNode.class))
				.thenReturn(externalMetadataResponse);
		Mockito.when(externalMetadataResponse.getBody()).thenReturn(beViewNode);
		JsonNode enrichedNode = beViewService.enrichUIExternalData(portalConfigNode, credentials,
				"localhost-orcl-SUPPLIER_HUB", "mdmSessionId", "http://localhost:8080", "de","ict");
		assertNotNull(enrichedNode.get("operations"));
	}

}
