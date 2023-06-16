package com.informatica.mdm.portal.metadata.rest;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessRequest;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessResponse;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
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
public class PortalConfigLoginControllerApiDocumentationTest {

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
	PortalConfigLoginController loginController;
	
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");
	
	private RestDocumentationResultHandler documentationHandler;
    
	JsonNode loginNode;
	Map<String,Object> userResponseNode;
	
    @Before
    public void init() throws IOException {
    	MockitoAnnotations.initMocks(this);
    	PowerMockito.mockStatic(PortalRestUtil.class);
    	PowerMockito.mockStatic(PortalConfigUtil.class);
    	loginNode = new ObjectMapper().createObjectNode();
    	((ObjectNode) loginNode).put("username", "admin");
    	((ObjectNode) loginNode).put("password", "admin");
    	userResponseNode = new HashMap<>();
    	userResponseNode.put(PortalMetadataContants.AUTHENTICATION_USER_NAME, "admin");
    	userResponseNode.put(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, "ict");
    	this.documentationHandler = document("PortalConfigLoginControllerApiDocumentation/{method-name}",
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
		Mockito.when(authService.login(Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(),Mockito.any(),Mockito.any())).thenReturn(userResponseNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/config/login")
				.contentType(MediaType.APPLICATION_JSON_VALUE).requestAttr("username", "admin").contextPath("/infa-portal")
				.requestAttr("password", "admin").content(loginNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("username").description("Username with admin role"),
						fieldWithPath("password").description("Password of the user")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.AUTHENTICATION_USER_NAME).description("Full Name of the User")
						)
				));
	}
	
	@Test
	public void logout() throws Exception {
		Mockito.when(PortalRestUtil.createCookie
				(Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyBoolean(), Mockito.anyBoolean()))
				.thenReturn(cookie);
		Mockito.doNothing().when(authService).logout(request,"CONFIG_UI_SESSIONID","ict-config");
		Mockito.when(PortalRestUtil.getCredentials(Mockito.any(), Mockito.any())).thenReturn(credentials);
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(cacheService.clearCache(Mockito.any())).thenReturn(externalConfigCache);
		this.mockMvc.perform(RestDocumentationRequestBuilders.put
				("/infa-portal/config/logout")
				.contentType(MediaType.APPLICATION_JSON_VALUE).requestAttr("username", "admin").contextPath("/infa-portal")
				.requestAttr("password", "admin"))
		.andExpect(status().isOk());
	}
	
	@Test
	public void isSessionValid() throws Exception {
		Mockito.when(PortalRestUtil.getCookieValue(Mockito.any(HttpServletRequest.class), Mockito.anyString())).thenReturn("mdmsessionId");
		Mockito.when(PortalRestUtil.isSessionValid(Mockito.any(HttpServletRequest.class),Mockito.anyString(),Mockito.anyString())).thenReturn(true);
		this.mockMvc.perform(RestDocumentationRequestBuilders.get
				("/infa-portal/config/session").param("action", "session")
				.contentType(MediaType.APPLICATION_JSON_VALUE).requestAttr("username", "admin").contextPath("/infa-portal")
				.requestAttr("password", "admin"))
		.andExpect(status().isOk());
	}

}
