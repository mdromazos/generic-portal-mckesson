package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertNotNull;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
public class ExternalMetadataFactoryTest {

	@InjectMocks
	ExternalConfigFactory externalMetadataFactory;

	@InjectMocks
	BEConfigServiceImpl beViewService;

	@Mock
	Credentials credentials;

	@Mock
	RestTemplate restTemplate;

	@Mock
	ResponseEntity<JsonNode> externalMetadataResponse;

	@Mock
	Map<CacheModel, JsonNode> externalMetadataCache;

	ObjectMapper objectMapper;

	String pageBEViewMetadataNode = "{\"id\":\"1\",\"name\":\"yyy\",\"type\":\"Custom Page\",\"layout\":{\"sections\":[{\"displayIcon\":\"rectangle\",\"containers\":[{\"style\":{\"width\":1},\"components\":[{\"configName\":\"Supplier\",\"configType\":\"BEView\",\"attributeSelector\":\"$\",\"bevFormSections\":[{\"name\":\"Section 1\",\"bevFormFields\":[{\"configName\":\"Supplier\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"lglFrm\\\")]\",\"fieldType\":\"dropdown\"},{\"configName\":\"Supplier\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"naicsCd\\\")]\",\"fieldType\":\"textarea\"}]},{\"name\":\"Section 2\",\"order\":1,\"bevFormFields\":[{\"configName\":\"Supplier\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"fullNm\\\")]\",\"fieldType\":\"textBox\"}]}]}]}],\"sectionType\":\"Section-Type 1\"}]},\"order\":1,\"roles\":[\"Proxy Role\"]}";

	String beView = "{\"operations\":{\"read\":{\"allowed\":true},\"search\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"objectType\":\"ENTITY\",\"timeline\":true,\"object\":{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"field\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"searchable\":{\"filterable\":true,\"facet\":false},\"name\":\"fullNm\",\"label\":\"Full Name\",\"dataType\":\"String\",\"length\":100,\"required\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"searchable\":{\"filterable\":true,\"facet\":false},\"name\":\"naicsCd\",\"label\":\"Naics Code\",\"dataType\":\"String\",\"length\":20,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true}},\"name\":\"lglFrm\",\"label\":\"Legal Form\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc&idlabel=legalFormCode%3AlegalFormDesc\",\"rel\":\"lookup\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc\",\"rel\":\"list\"}],\"object\":\"LookupLegalForm\",\"key\":\"legalFormCode\",\"value\":\"legalFormDesc\"}}],\"contentMetadata\":[{\"operations\":{\"read\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"delete\":{\"allowed\":true}},\"name\":\"XREF\"}],\"name\":\"Supplier\",\"label\":\"Supplier\",\"many\":false}}";

	JsonNode pageNode, beViewNode;

	@Before
	public void setUp() throws Exception {

		MockitoAnnotations.initMocks(this);
		objectMapper = new ObjectMapper();

		String authCookie = "mdmsessionid" + "=" + "mdmSessionId";
		authCookie = StringUtils.join(authCookie, ";selectedLocale=", "de");
		HttpHeaders headers = new HttpHeaders();
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, "ict");
		headers.add("Cookie", authCookie);
		HttpEntity<?> request = new HttpEntity<String>(headers);
		String apiUrl = "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/Supplier.json?action=meta";
		Mockito.when(restTemplate.exchange(apiUrl, HttpMethod.GET, request, JsonNode.class))
				.thenReturn(externalMetadataResponse);
		externalMetadataFactory.setBeViewService(beViewService);
	}

	@Test
	public void testinvokeExternalMetadataServiceForConfig() throws PortalConfigException, IOException {
		beViewNode = objectMapper.readTree(beView);
		pageNode = objectMapper.readTree(pageBEViewMetadataNode);

		Mockito.when(externalMetadataResponse.getBody()).thenReturn(beViewNode);

		JsonNode enrichedNode = externalMetadataFactory.invokeExternalConfigService(pageNode, credentials,
				"localhost-orcl-SUPPLIER_HUB", "mdmSessionId", false, "http://localhost:8080","de","ict");
		assertNotNull(enrichedNode.get("layout").get("sections").get(0).get("containers").get(0).get("components")
				.get(0).get("metadata"));
	}

}
