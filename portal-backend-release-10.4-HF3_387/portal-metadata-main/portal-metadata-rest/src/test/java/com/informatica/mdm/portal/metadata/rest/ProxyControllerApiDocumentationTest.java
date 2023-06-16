package com.informatica.mdm.portal.metadata.rest;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessRequest;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessResponse;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
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
import org.springframework.http.ResponseEntity;
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
import com.informatica.mdm.portal.metadata.app.PortalApplication;
import com.informatica.mdm.portal.metadata.auth.service.PortalProxyService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@OverrideAutoConfiguration(enabled = false)
@SpringBootTest(classes = { PortalApplication.class })
@PrepareForTest({ PortalRestUtil.class })
public class ProxyControllerApiDocumentationTest {

	@Autowired
	private MockMvc mockMvc;

	@Mock
	PortalProxyService proxyService;

	@Mock
	HttpServletRequest request;

	@InjectMocks
	PortalProxyController proxyController;

	ObjectMapper objectMapper;

	JsonNode payloadNode, responseNode;
	
	@Mock
	ResponseEntity<byte[]> resource;

	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");

	private RestDocumentationResultHandler documentationHandler;

	@Before
	public void init() throws IOException {

		MockitoAnnotations.initMocks(this);
		PowerMockito.mockStatic(PortalRestUtil.class);

		objectMapper = new ObjectMapper();
		payloadNode = objectMapper.createObjectNode();
		((ObjectNode) payloadNode).put("apiUrl",
				"cmx/cs/orcl-SUPPLIER_HUB/SupplierView/120001?depth=10&systemName=Admin");
		((ObjectNode) payloadNode).put("httpMethod", "POST");
		((ObjectNode) payloadNode).put("proxyAttribute", "120001");
		((ObjectNode) payloadNode).put("payload", "BE's Payload Data");
		
		responseNode = objectMapper.createObjectNode();

		this.documentationHandler = document("ProxyControllerApiDocumentation/{method-name}",
				preprocessRequest(prettyPrint(), removeHeaders("Host", "Content-Length")),
				preprocessResponse(prettyPrint(), removeHeaders("Content-Length")));

		this.mockMvc = MockMvcBuilders.standaloneSetup(proxyController)
				.apply(MockMvcRestDocumentation.documentationConfiguration(restDocumentation).uris().and().snippets()
						.withDefaults(CliDocumentation.curlRequest(), HttpDocumentation.httpRequest(),
								HttpDocumentation.httpResponse()))
				.alwaysDo(this.documentationHandler).build();
	}

	@Test
	public void invokeProxy() throws Exception {

		Mockito.when(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn("mdmsessionid");
		Mockito.when(proxyService.validateProxy(Mockito.any(JsonNode.class), Mockito.any())).thenReturn(true);
		Mockito.when(proxyService.invokeApi(Mockito.any(JsonNode.class), Mockito.any(),Mockito.any())).thenReturn(responseNode);
		this.mockMvc
				.perform(RestDocumentationRequestBuilders.post("/infa-portal/proxy").contextPath("/infa-portal")
						.contentType(MediaType.APPLICATION_JSON_VALUE).content(payloadNode.toString()))
				.andExpect(status().isOk())
				.andDo(this.documentationHandler.document(
						requestFields(fieldWithPath("apiUrl").description("BE's Api url"),
								fieldWithPath("httpMethod").description("Http Method type of BE's api"),
								fieldWithPath("proxyAttribute")
										.description("Id used while Login to the Portal(recordId)"),
								fieldWithPath("payload").description("BE's Payload in case of POST/Put Api"))));
	}
	
	@Test
	public void uploadFileViaProxy() throws Exception {

		((ObjectNode) payloadNode).remove("payload");
		Mockito.when(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn("mdmsessionid");
		Mockito.when(proxyService.validateProxy(Mockito.any(JsonNode.class), Mockito.any())).thenReturn(true);
		Mockito.when(proxyService.uploadFileViaProxy(Mockito.any(JsonNode.class), Mockito.any(), Mockito.any())).thenReturn(responseNode);
		this.mockMvc
				.perform(RestDocumentationRequestBuilders.post("/infa-portal/proxy/file/upload").contextPath("/infa-portal")
						.contentType(MediaType.APPLICATION_JSON_VALUE).param("payload", "payloadData").content(payloadNode.toString()))
				.andExpect(status().isOk())
				.andDo(this.documentationHandler.document(
						requestFields(fieldWithPath("apiUrl").description("BE's Api url"),
								fieldWithPath("httpMethod").description("Http Method type of BE's api"),
								fieldWithPath("proxyAttribute")
										.description("Id used while Login to the Portal(recordId)")),
						requestParameters(
								parameterWithName("payload").description("Represents Payload Data as String parameter")
										)
						));
	}
	
	@Test
	public void downloadFileViaProxy() throws Exception {

		((ObjectNode) payloadNode).remove("payload");
		Mockito.when(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn("mdmsessionid");
		Mockito.when(proxyService.validateProxy(Mockito.any(JsonNode.class), Mockito.any())).thenReturn(true);
		Mockito.when(proxyService.downloadFileViaProxy(Mockito.any(JsonNode.class), Mockito.any())).thenReturn(resource);
		Mockito.when(resource.getBody()).thenReturn("content".getBytes());
		this.mockMvc
				.perform(RestDocumentationRequestBuilders.post("/infa-portal/proxy/file/download").contextPath("/infa-portal")
						.contentType(MediaType.APPLICATION_JSON_VALUE).content(payloadNode.toString()))
				.andExpect(status().isOk())
				.andDo(this.documentationHandler.document(
						requestFields(fieldWithPath("apiUrl").description("BE's Api url"),
								fieldWithPath("httpMethod").description("Http Method type of BE's api"),
								fieldWithPath("proxyAttribute")
										.description("Id used while Login to the Portal(recordId)"))));
	}

}
