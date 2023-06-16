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
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalConfigService;
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
public class RuntimeControllerApiDocumentationTest {

	@Autowired
    private MockMvc mockMvc;
	
	@Mock
	private PortalConfigService portalConfigService;
	
	@Mock
	HttpServletRequest request;
	
	@Mock
	Credentials credentials;
	
	@InjectMocks
	RuntimeConfigController runtimeController;
	
	JsonNode runtimeNode, responseNode;
	
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");
	
	private RestDocumentationResultHandler documentationHandler;
	
	private static final String RUNTIME_NODE = "[{\"name\":\"SignUp Section\",\"desc\":\"SignUp Section\",\"configuration\":[{\"key\":\"username\",\"desc\":\"Username\",\"value\":\"admin\",\"type\":\"String\"},{\"key\":\"fullName\",\"desc\":\"Full Name\",\"value\":\"Entity\",\"type\":\"String\"}]},{\"name\":\"Login Section\",\"desc\":\"Login Section\",\"configuration\":[{\"key\":\"uniqueFieldPath\",\"desc\":\"uniqueFieldPath\",\"value\":\"Contacts.contacts.prtlUsrNm\",\"type\":\"String\"},{\"key\":\"recordIdField\",\"desc\":\"recordIdField\",\"value\":\"rowidObject\",\"type\":\"String\"}]}]";

    
    @Before
    public void init() throws IOException {
    	MockitoAnnotations.initMocks(this);
    	PowerMockito.mockStatic(PortalRestUtil.class);
    	runtimeNode = new ObjectMapper().readTree(RUNTIME_NODE);
    	responseNode = new ObjectMapper().createObjectNode();
    	((ObjectNode) responseNode).put(PortalMetadataContants.PORTAL_ID, "43424");
    	this.documentationHandler = document("RuntimeControllerApiDocumentation/{method-name}",
    			preprocessRequest(prettyPrint(), removeHeaders("Host", "Content-Length")),
    			preprocessResponse(prettyPrint(), removeHeaders("Content-Length")));
    	
    	this.mockMvc = MockMvcBuilders.standaloneSetup(runtimeController).
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
	public void getRuntimeConfig() throws Exception {

		Mockito.when(
				portalConfigService.getRuntimeConfig(Mockito.any(), Mockito.any(), Mockito.any(PortalRestConfig.class)))
				.thenReturn(runtimeNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.get("/infa-portal/runtime/portals/{portalId}", "45654")
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
	public void persistRuntimeConfig() throws Exception {

		Mockito.when(portalConfigService.saveRuntimeConfig(Mockito.any(), Mockito.any(JsonNode.class),
				Mockito.anyString(), Mockito.anyString())).thenReturn(responseNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.put("/infa-portal/runtime/portals/{portalId}", "45654")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(runtimeNode.toString()))
				.andExpect(status().isOk())
				.andDo(this.documentationHandler.document(
						requestFields(fieldWithPath("[].name").description("Runtime Section Name"),
								fieldWithPath("[].desc").description("Runtime Section Description"),
								fieldWithPath("[].configuration").description("Runtime Section Configuration"),
								fieldWithPath("[].configuration.[].key").description("Runtime Property Key"),
								fieldWithPath("[].configuration.[].desc").description("Runtime Property Description"),
								fieldWithPath("[].configuration.[].value").description("Runtime Property values"),
								fieldWithPath("[].configuration.[].type").description("Runtime Property datatype")),
						requestHeaders(headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)
								.description("The ors ID to which the config had to be retrieve")),
						pathParameters(parameterWithName(PortalMetadataContants.PORTAL_ID)
								.description("The portal ID for which runtime config had to be retrieve")),
						responseFields(fieldWithPath(PortalMetadataContants.PORTAL_ID)
								.description("Portal ID for which Runtime Config persisted"))));
	}

}
