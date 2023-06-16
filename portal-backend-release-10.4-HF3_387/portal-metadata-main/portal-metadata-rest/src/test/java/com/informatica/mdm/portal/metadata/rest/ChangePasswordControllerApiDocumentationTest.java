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

import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.app.PortalApplication;
import com.informatica.mdm.portal.metadata.service.ChangePasswordService;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore( {"javax.management.*"})
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@OverrideAutoConfiguration(enabled = false)
@SpringBootTest(classes={PortalApplication.class})
@PrepareForTest({PortalRestUtil.class})
public class ChangePasswordControllerApiDocumentationTest 
{
	@Autowired
    private MockMvc mockMvc;
	
	@Mock
	HttpServletRequest request;
	
	@Mock
	HttpSession session;
	
	@Mock
	Cookie cookie;
	
	@Mock
	ChangePasswordService changePwdService;
	
	@InjectMocks
	ChangePasswordController changePwdController;
	
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");
	
	private RestDocumentationResultHandler documentationHandler;
	
	@Mock
	Credentials credentials;
	
	Map<String,Object> resp, forgotPassResp, generateLinkResp;
	
	String changePassJson, forgotPassJson, forgotAndchangePassJson;
	
	@Before
	public void init() throws IOException
	{
		MockitoAnnotations.initMocks(this);
    	PowerMockito.mockStatic(PortalRestUtil.class);
    	
		resp = new HashMap<String, Object>();
		forgotPassResp = new HashMap<>();
		generateLinkResp = new HashMap<>();
		
		resp.put(PortalServiceConstants.CHANGEPASSWORD_RESPONSE_STATUS, "Password changed successfully");
		
		forgotPassResp.put(PortalServiceConstants.CHANGEPASSWORD_RESPONSE_EMAIL_STATUS, "Email sent to aa@test.com");
		
		generateLinkResp.put(PortalServiceConstants.CHANGEPASSWORD_RESPONSE_STATUS, "Email sent to aa@test.com");
		
		changePassJson = "{\"oldPassword\" : \"test11\", \"newPassword\" : \"test11\"}";
		
		forgotAndchangePassJson = "{\"ForgotPwdlinkHashValue\" : \"8bb9aa551ca5d204c1cff50df09981a0\", \"newPassword\" : \"test11\",\"ChangePasswordIsNewUser\":\"false\"}";
		
		forgotPassJson = "{\""+PortalServiceConstants.CHANGEPASSWORD_EMAIL+"\":\"spandit@informatica.com\" }";
		
		this.documentationHandler = document("PortalLoginControllerApiDocumentation/{method-name}",
    			preprocessRequest(prettyPrint(), removeHeaders("Host", "Content-Length")),
    			preprocessResponse(prettyPrint(), removeHeaders("Content-Length")));
    	
		this.mockMvc = MockMvcBuilders.standaloneSetup(changePwdController).
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
	public void changePassword() throws Exception
	{
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(PortalRestUtil.getCookieValue(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn("mdmsessionId");
		Mockito.when(changePwdService.changePassword(Mockito.any(), Mockito.anyString(), Mockito.anyString(),Mockito.anyString(),Mockito.anyString(),Mockito.any(),Mockito.any())).thenReturn(resp);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/portals/{portalId}/changepassword", "1")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.content(changePassJson))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath(PortalServiceConstants.CHANGEPASSWORD_OLD).description("Old password of the user"),
						fieldWithPath(PortalServiceConstants.CHANGEPASSWORD_NEW).description("New password of the user")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("portalId").description("Portal config Id")
						)
				));
	}
	
	@Test
	public void generateForgotPasswordLink() throws Exception
	{
		Mockito.when(changePwdService.generateForgotPasswordLink(Mockito.anyString(),Mockito.anyString(),Mockito.anyString(),Mockito.any())).thenReturn(generateLinkResp);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/global/portals/{portalId}/forgotpasswordlink", "1")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.content(forgotPassJson))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath(PortalServiceConstants.CHANGEPASSWORD_EMAIL).description("email id to which the reset password mail will be sent")
						),
				responseFields(
						fieldWithPath(PortalServiceConstants.CHANGEPASSWORD_RESPONSE_STATUS).description("Status of the change password operation")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("portalId").description("Portal config Id")
						)
				));
	}
	
	@Test
	public void verifyLinkAndChangePassword() throws Exception
	{
		Mockito.when(changePwdService.changePassword(Mockito.any(), Mockito.anyString(), Mockito.anyString(),Mockito.anyString(),Mockito.anyString(),Mockito.any(),Mockito.any())).thenReturn(forgotPassResp);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/global/portals/{portalId}/forgotpassword", "1")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.content(forgotAndchangePassJson))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath(PortalServiceConstants.CHANGEPASSWORD_LINKHASHVALUE).description("hash value provided in the reset email"),
						fieldWithPath(PortalServiceConstants.CHANGEPASSWORD_NEW).description("New password for the user"),
						fieldWithPath(PortalServiceConstants.CHANGEPASSWORD_ISNEWUSER).description("If the request is for a new user or an existing user")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("portalId").description("Portal config Id")
						)
				));
	}
}
