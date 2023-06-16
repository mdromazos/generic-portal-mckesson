package com.informatica.mdm.portal.metadata.rest;

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
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

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
import com.informatica.mdm.portal.metadata.auth.service.AuthService;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.informatica.mdm.portal.metadata.service.CacheService;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@OverrideAutoConfiguration(enabled = false)
@SpringBootTest(classes={PortalApplication.class})
@PrepareForTest({PortalRestUtil.class, PortalConfigUtil.class})
public class PortalLoginControllerApiDocumentationTest {

	@Autowired
    private MockMvc mockMvc;
	
	@Mock
	HttpServletRequest request;
	
	@Mock
	HttpSession session;
	
	@Mock
	Cookie cookie;
	
	@Mock
	Credentials credentials;
	
	@Mock
	AuthService authService;
	
	@Mock
	Map<CacheModel, JsonNode> externalConfigCache;
	
	@Mock
	CacheService cacheService;
	
	@InjectMocks
	PortalLoginController loginController;
	
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");
	
	private RestDocumentationResultHandler documentationHandler;
    
	JsonNode loginNode,projections;
	Map<String,Object> userResponseNode;
	LoginData loginData;
	
    @Before
    public void init() throws IOException {
    	MockitoAnnotations.initMocks(this);
    	PowerMockito.mockStatic(PortalRestUtil.class);
    	PowerMockito.mockStatic(PortalConfigUtil.class);
    	loginNode = new ObjectMapper().createObjectNode();
    	((ObjectNode) loginNode).put("username", "admin");
    	((ObjectNode) loginNode).put("password", "admin");
    	((ObjectNode) loginNode).put("beName", "Supplier");
    	((ObjectNode) loginNode).put("orsId", "orsId");
    	((ObjectNode) loginNode).put("uniqueFieldPath", "Contacts.contacts.prtlUsrNm");
    	((ObjectNode) loginNode).put("recordIdField", "Contacts.contacts.prtlUsrNm");
    	projections =  new ObjectMapper().createObjectNode();
    	((ObjectNode) projections).put("BEPathRole", "Contacts.contacts.prtlUsrRle.roleCode");
    	((ObjectNode) projections).put("BEPathState", "Status.prtyStsVal.partyStatusValue");
    	((ObjectNode) projections).put("BEPathPortalAssociation", "portalAssc.portalId");
    	((ObjectNode) loginNode).putObject("projections").setAll((ObjectNode) projections);
    	((ObjectNode) loginNode).put(PortalRestConstants.SESSION_TIMEOUT, 2);
    	userResponseNode = new HashMap<>();
    	userResponseNode.put(PortalMetadataContants.AUTHENTICATION_USER_NAME, "admin");
    	userResponseNode.put("roleCode", "Portal Administrator");
    	userResponseNode.put("partyStatusValue", "registered");
    	userResponseNode.put("recordId", "20001");
    	userResponseNode.put(PortalRestConstants.SESSION_TIMEOUT, 2);
    	userResponseNode.put(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, "ict");
    	this.documentationHandler = document("PortalLoginControllerApiDocumentation/{method-name}",
    			preprocessRequest(prettyPrint(), removeHeaders("Host", "Content-Length")),
    			preprocessResponse(prettyPrint(), removeHeaders("Content-Length")));
    	
    	this.mockMvc = MockMvcBuilders.standaloneSetup(loginController).
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
	public void login() throws Exception {
		Mockito.when(request.getSession()).thenReturn(session);
		Mockito.when(session.getId()).thenReturn("sessionId");
		Mockito.when(PortalRestUtil.createCookie
				(Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyBoolean()))
				.thenReturn(cookie);
		Mockito.when(authService.login(Mockito.anyString(), Mockito.anyString(), Mockito.anyString(),Mockito.anyBoolean(),Mockito.any(),Mockito.any())).thenReturn(userResponseNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/portals/login/{portalId}", "1")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.content(loginNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("username").description("Username with admin role"),
						fieldWithPath("password").description("Password of the user"),
						fieldWithPath("beName").description("BE name"),
						fieldWithPath("orsId").description("orsId"),
						fieldWithPath("uniqueFieldPath").description("Path of unique field"),
						fieldWithPath("recordIdField").description("Path of record id field"),
						fieldWithPath("projections.BEPathRole").description("Path of role field"),
						fieldWithPath("projections.BEPathState").description("Path of state field"),
						fieldWithPath("projections.BEPathPortalAssociation").description("Path of portal association field"),
						fieldWithPath(PortalRestConstants.SESSION_TIMEOUT).description("Session Timeout")
						),
				pathParameters(
						parameterWithName(PortalMetadataContants.PORTAL_ID).description("The portal ID of the portal config which has been published")
						),
				responseFields(
						fieldWithPath("roleCode").description("Field name of role"),
						fieldWithPath("partyStatusValue").description("Field Name of status"),
						fieldWithPath("recordId").description("Field Name of rowidObject"),
						fieldWithPath(PortalMetadataContants.AUTHENTICATION_USER_NAME).description("Full Name of the User")
						)
				));
	}
	
	@Test
	public void logout() throws Exception {
		Mockito.when(PortalRestUtil.createCookie
				(Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyBoolean()))
				.thenReturn(cookie);
		Mockito.doNothing().when(authService).logout(request,"PORTAL_UI_SESSIONID","ict-ui");
		Mockito.when(PortalRestUtil.getCredentials(Mockito.any(), Mockito.any())).thenReturn(credentials);
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(cacheService.clearCache(Mockito.any())).thenReturn(externalConfigCache);
		this.mockMvc.perform(RestDocumentationRequestBuilders.put
				("/infa-portal/portals/logout/{portalId}", "1")
				.contentType(MediaType.APPLICATION_JSON_VALUE).requestAttr("username", "admin").contextPath("/infa-portal")
				.requestAttr("password", "admin"))
		.andExpect(status().isOk()).andDo(this.documentationHandler.document
				(pathParameters(
						parameterWithName(PortalMetadataContants.PORTAL_ID).description("The portal ID of the portal config which has been published")
						)
				));
	}
	
	@Test
	public void isSessionValid() throws Exception {
		Mockito.when(PortalRestUtil.getCookieValue(Mockito.any(HttpServletRequest.class), Mockito.anyString())).thenReturn("mdmsessionId");
		Mockito.when(PortalRestUtil.isSessionValid(Mockito.any(HttpServletRequest.class),Mockito.anyString(),Mockito.anyString())).thenReturn(true);
		this.mockMvc.perform(RestDocumentationRequestBuilders.get
				("/infa-portal/portals/session/{portalId}", "1").param("action", "session")
				.contentType(MediaType.APPLICATION_JSON_VALUE).requestAttr("username", "admin").contextPath("/infa-portal")
				.requestAttr("password", "admin"))
		.andExpect(status().isOk());
	}

}
