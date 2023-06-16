package com.informatica.mdm.portal.metadata.rest;

import static org.springframework.restdocs.headers.HeaderDocumentation.headerWithName;
import static org.springframework.restdocs.headers.HeaderDocumentation.requestHeaders;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessRequest;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessResponse;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.pathParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.junit.Before;
import org.junit.Rule;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.OverrideAutoConfiguration;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.restdocs.JUnitRestDocumentation;
import org.springframework.restdocs.cli.CliDocumentation;
import org.springframework.restdocs.http.HttpDocumentation;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.restdocs.mockmvc.RestDocumentationResultHandler;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.app.PortalApplication;
import com.informatica.mdm.portal.metadata.auth.service.PortalProxyService;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@OverrideAutoConfiguration(enabled = false)
@SpringBootTest(classes={PortalApplication.class})
@PrepareForTest({PortalRestUtil.class})
public class GlobalConfigControllerApiDocumentationTest {

	@Autowired
    private MockMvc mockMvc;
	
	@Mock
	private PortalUIService portalUIService;
	
	@Mock
	private PortalProxyService portalProxyService;
	
	@Mock
	HttpServletRequest request;
	
	@Mock
	Credentials credentials;
	
	@InjectMocks
	GlobalConfigController globalController;
	
	JsonNode portalNode, runtimeNode, payloadNode, responseNode;
	
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");
	
	private RestDocumentationResultHandler documentationHandler;
	
	private static final String PORTAL_NODE = "{\"portalName\":\"Supplier Portal\",\"isStateEnabled\":true,\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\"}";

	private static final String RUNTIME_NODE = "[{\"name\":\"SignUp Section\",\"desc\":\"SignUp Section\",\"configuration\":[{\"key\":\"username\",\"desc\":\"Username\",\"value\":\"admin\",\"type\":\"String\"},{\"key\":\"fullName\",\"desc\":\"Full Name\",\"value\":\"Entity\",\"type\":\"String\"}]},{\"name\":\"Login Section\",\"desc\":\"Login Section\",\"configuration\":[{\"key\":\"uniqueFieldPath\",\"desc\":\"uniqueFieldPath\",\"value\":\"Contacts.contacts.prtlUsrNm\",\"type\":\"String\"},{\"key\":\"recordIdField\",\"desc\":\"recordIdField\",\"value\":\"rowidObject\",\"type\":\"String\"}]}]";
    
    @Before
    public void init() throws IOException {
    	MockitoAnnotations.initMocks(this);
    	PowerMockito.mockStatic(PortalRestUtil.class);
    	globalController.setCmxUrl("http://localhost:8080");
    	portalNode = new ObjectMapper().readTree(PORTAL_NODE);
    	runtimeNode = new ObjectMapper().readTree(RUNTIME_NODE);
    	responseNode = new ObjectMapper().createObjectNode();
    	payloadNode = new ObjectMapper().createObjectNode();
    	((ObjectNode) payloadNode).put("httpMethod", "GET");
		((ObjectNode) payloadNode).put("apiUrl", "cmx/lookup/localhost-orcl-SUPPLIER_HUB/id-label/Supplier/Address/PostalAddress/pstlAddrBoClassCd");
		((ObjectNode) payloadNode).put("restType", "lookup");
    	this.documentationHandler = document("GlobalConfigControllerApiDocumentation/{method-name}",
    			preprocessRequest(prettyPrint(), removeHeaders("Host", "Content-Length")),
    			preprocessResponse(prettyPrint(), removeHeaders("Content-Length")));
    	
    	this.mockMvc = MockMvcBuilders.standaloneSetup(globalController).
    			apply(MockMvcRestDocumentation.documentationConfiguration(restDocumentation)
    					.uris()
    					.and().snippets()
    					.withDefaults(CliDocumentation.curlRequest(),
                        HttpDocumentation.httpRequest(),
                        HttpDocumentation.httpResponse()))
    			.alwaysDo(this.documentationHandler)
                .build();
    }

	@Test
	public void getPortal() throws Exception {
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "9483");
		Mockito.when(portalUIService.getGlobalPortal(Mockito.any(), Mockito.anyString(), Mockito.anyString(),Mockito.anyString(), Mockito.any(),Mockito.any())).thenReturn(portalNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders
				.get("/infa-portal/global/portals/{portalId}","45654").contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.contentType(MediaType.APPLICATION_JSON_VALUE))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(pathParameters
						(parameterWithName(PortalMetadataContants.PORTAL_ID).description("The portal ID to which the config had to be retrieve")),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
										),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Portal Config ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_NAME).description("Portal Config Name"),
						fieldWithPath("isStateEnabled").description("Representing is Portal being state enabled"),
						fieldWithPath("navigationType").description("Portal Config Navigation Type"),
						fieldWithPath(PortalMetadataContants.HEADER_ATTRIBUTE).description("Portal Header Information"),
						fieldWithPath(PortalMetadataContants.HEADER_ATTRIBUTE+"."+"backgroundColor").description("Portal Header Background color"),
						fieldWithPath(PortalMetadataContants.HEADER_ATTRIBUTE+"."+"fontColor").description("Portal Header font color"),
						fieldWithPath(PortalMetadataContants.HEADER_ATTRIBUTE+"."+"logo").description("Portal Header logo"),
						fieldWithPath(PortalMetadataContants.FOOTER_ATTRIBUTE).description("Portal Footer Information"),
						fieldWithPath(PortalMetadataContants.FOOTER_ATTRIBUTE+"."+"footerText").description("Footer Text"),
						fieldWithPath(PortalMetadataContants.FOOTER_ATTRIBUTE+"."+"backgroundColor").description("Portal Footer Background color"),
						fieldWithPath(PortalMetadataContants.FOOTER_ATTRIBUTE+"."+"fontColor").description("Portal Footer font color"),
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE).description("Portal Signup Information"),
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE+"."+"backgroundImage").description("Portal Sign Up Page Background Image"),
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE+"."+"welcomeText").description("Portal Signup Welcome text"),
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE+"."+"title").description("Portal Signup title"),
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE+"."+"beViewName").description("BE View for this portal"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE).description("Portal Login Information"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"backgroundImage").description("Portal Login Page Background Image"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"title").description("Portal Login title"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"isCaptchaEnabled").description("Capcha Enabling attribute"),
						fieldWithPath(PortalMetadataContants.DATABASE_ID).description("ORS Database schema this Portal belongs to"))
				));
	}
	
	@Test
	public void getRuntimeConfig() throws Exception {

		Mockito.when(
				portalUIService.getRuntimeConfig(Mockito.any(), Mockito.any(), Mockito.any(PortalRestConfig.class)))
				.thenReturn(runtimeNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.get("/infa-portal/global/runtime/portals/{portalId}", "45654")
				.contextPath("/infa-portal").header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.contentType(MediaType.APPLICATION_JSON_VALUE)).andExpect(status().isOk())
				.andDo(this.documentationHandler.document(
						pathParameters(parameterWithName(PortalMetadataContants.PORTAL_ID)
								.description("The portal ID for which runtime config had to be retrieve")),
						requestHeaders(headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)
								.description("The ors ID for which runtime config had to be retrieve")),
						responseFields(fieldWithPath("[].name").description("Runtime Section Name"),
								fieldWithPath("[].desc").description("Runtime Section Description"),
								fieldWithPath("[].configuration").description("Runtime Section Configuration"),
								fieldWithPath("[].configuration.[].key").description("Runtime Property Key"),
								fieldWithPath("[].configuration.[].desc").description("Runtime Property Description"),
								fieldWithPath("[].configuration.[].value").description("Runtime Property values"),
								fieldWithPath("[].configuration.[].type").description("Runtime Property datatype"))));
	}
	
	@Test
	public void globalProxy() throws Exception {

		Mockito.when(portalProxyService.invokeProxyByTrustedApp(Mockito.any(JsonNode.class), Mockito.any(), Mockito.any()))
				.thenReturn(responseNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post("/infa-portal/global/proxy")
				.contextPath("/infa-portal").header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.contentType(MediaType.APPLICATION_JSON_VALUE).content(payloadNode.toString())).andExpect(status().isOk())
				.andDo(this.documentationHandler.document(
						requestFields(fieldWithPath("apiUrl").description("BE's Api url"),
								fieldWithPath("httpMethod").description("Http Method type of BE's api"),
								fieldWithPath("restType").description("Rest Type to Encrypt the Request based on BE's api. Ex: lookup, list")),
						requestHeaders(headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)
								.description("The ors ID for which runtime config had to be retrieve"))));
	}
	
}
