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
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.app.PortalApplication;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@OverrideAutoConfiguration(enabled = false)
@SpringBootTest(classes={PortalApplication.class})
@PrepareForTest({PortalRestUtil.class})
public class PortalUIControllerApiDocumentationTest {

	@Autowired
    private MockMvc mockMvc;
	
	@Mock
	private PortalUIService portalUIService;
	
	@Mock
	HttpServletRequest request;
	
	@Mock
	Credentials credentials;
	
	@InjectMocks
	PortalUIController portalController;
	
	JsonNode pagesNode, pageNode, userNode, stateUpdateNode, userPreferenceNode, userPreferencePayloadNode, createUserResponseNode;
	ArrayNode usersArrayNode;
	
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");
	
	private RestDocumentationResultHandler documentationHandler;
	
	private static final String PAGE_NODE_VALUE = "{\"layout\":{\"sections\":[{\"displayIcon\":\"rectangle\",\"isDefault\":false,\"containers\":[{\"components\":[{\"configName\":\"SupplierView\",\"componentType\":\"BeFormComponent\",\"beFormSections\":[{\"beFormFields\":[{\"configName\":\"SupplierView\",\"name\":\"fullNm\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"fullNm\\\")]\",\"configType\":\"BEView\",\"many\":false,\"required\":false,\"order\":0},{\"configName\":\"SupplierView\",\"name\":\"crncy\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"crncy\\\")]\",\"configType\":\"BEView\",\"many\":false,\"required\":false,\"order\":0}],\"order\":0}],\"attributeSelector\":\"$\",\"configType\":\"BEView\",\"maxColumns\":0}],\"style\":{\"width\":1}}],\"sectionType\":\"Section-Type 1\"}]},\"bevName\":\"SupplierView\",\"isReadOnly\":false,\"roles\":[\"Supplier Users\",\"Supplier Administrators\",\"EntityManager\"],\"name\":\"Accustom Page - Record\",\"type\":\"Record Page\",\"maxColumns\":1}";
	private static final String PAGES_ARRAY_NODE = "[{\"id\":\"2\",\"name\":\"moanaPage\"},{\"id\":\"3\",\"name\":\"neemoPage\"},{\"id\":\"4\",\"name\":\"freddiePage\"}]";
	private static final String STATE_NODE_VALUE = "{\"rowidObject\":\"100005\",\"portalState\":\"Approved\",\"interactionId\":\"140005022000\"}";
	private static final String USERS_ARRAY_NODE = "{\"userName\":\"bon@infa.com\",\"firstName\":\"bon\",\"lastName\":\"Das\",\"email\":\"bon@infa.com\"}";
	private static final String userPreference = "{\"a60020774f1a432eafaa8f7d9e6ccdc2\": {\r\n\t\t\"PREFERENCE_TYPE\": \"WizardCompletedSteps\",\r\n\t\t\"USER_PREFERENCE\": {\r\n\t\t\t\"WizardId\": \"876\",\r\n\t\t\t\"completedSteps\": [\r\n\t\t\t\t123,\r\n\t\t\t\t456,\r\n\t\t\t\t789\r\n\t\t\t]\r\n\t\t}\r\n\t}\r\n}";
	private static  final String userPreferencePayload = "{\r\n\t\t\"PREFERENCE_TYPE\": \"WizardCompletedSteps\",\r\n\t\t\"USER_PREFERENCE\": {\r\n\t\t\t\"WizardId\": \"876\",\r\n\t\t\t\"completedSteps\": [\r\n\t\t\t\t123,\r\n\t\t\t\t456,\r\n\t\t\t\t789\r\n\t\t\t]\r\n\t\t}\r\n\t}";
	private static final String createUserResponse = "{\"Status\":\"Email sent to fisom5@gmail.com\",\"passwordLink\":\"http://localhost:8080/portal-ui/2/orcl-TCR_HUB/resetPasswordNewUser?hash=e83d5c8124a7ff6c5b1e62808834d6f8\"}";
	@Before
    public void init() throws IOException {
    	MockitoAnnotations.initMocks(this);
    	PowerMockito.mockStatic(PortalRestUtil.class);
    	pagesNode = new ObjectMapper().readTree(PAGES_ARRAY_NODE);
    	pageNode = new ObjectMapper().readTree(PAGE_NODE_VALUE);
    	userNode = new ObjectMapper().createObjectNode();
    	userPreferenceNode = new ObjectMapper().readTree(userPreference);
		userPreferencePayloadNode = new ObjectMapper().readTree(userPreferencePayload);
		createUserResponseNode = new ObjectMapper().readTree(createUserResponse);
    	((ObjectNode) userNode).put("BEData", "BE Data Payload");
    	((ObjectNode) userNode).put("userData", "User Data Payload");
    	stateUpdateNode = new ObjectMapper().readTree(STATE_NODE_VALUE);
    	usersArrayNode =  new ObjectMapper().createArrayNode().add(new ObjectMapper().readTree(USERS_ARRAY_NODE));
    	this.documentationHandler = document("PortalUIControllerApiDocumentation/{method-name}",
    			preprocessRequest(prettyPrint(), removeHeaders("Host", "Content-Length")),
    			preprocessResponse(prettyPrint(), removeHeaders("Content-Length")));
    	
    	this.mockMvc = MockMvcBuilders.standaloneSetup(portalController).
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
	public void getPortalChild() throws Exception {
		Mockito.when(portalUIService.getPortalConfigModel(Mockito.any(), Mockito.any(),Mockito.anyString())).thenReturn(pagesNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(PortalRestUtil.getCookieValue(Mockito.any(), Mockito.any())).thenReturn("ict");
		this.mockMvc.perform(RestDocumentationRequestBuilders.get
				("/infa-portal/portals/{path}", "portalId/pages")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
													+ " root node should start with 'portals' ex: '{portalId}/pages' ")
								),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
										),
				responseFields(

						fieldWithPath("[].name").description("Page Name"),
						fieldWithPath("[].id").description("Page Id")
						
						)
				));
	}
	
	@Test
	public void getPortalGrandChild() throws Exception {
		
		((ObjectNode) pageNode).put(PortalMetadataContants.ID_ATTRIBUTE, 1);
		((ObjectNode) pageNode).put(PortalMetadataContants.DEFAULT_VALUE_ORDER, 1);
		Mockito.when(portalUIService.getPortalConfigModel(Mockito.any(), Mockito.any(),Mockito.anyString())).thenReturn(pageNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(PortalRestUtil.getCookieValue(Mockito.any(), Mockito.any())).thenReturn("ict");
		this.mockMvc.perform(RestDocumentationRequestBuilders.get
				("/infa-portal/portals/{path}", "portalId/pages/pageId")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(
				pathParameters(
					parameterWithName("path").description("Path based on the Designed Model,"
										+ " root node should start with 'portals' ex: '{portalId}/pages/pageId' ")
							),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
										),
				responseFields(
						fieldWithPath("id").description("Page Identifier"),
						fieldWithPath("order").description("Page Order"),
						fieldWithPath("name").description("Page Name"),
						fieldWithPath("type").description("Page Type"),
						fieldWithPath("maxColumns").description("Max Allowed Column in a page"),
						fieldWithPath("roles").description("Role Mappings"),
						fieldWithPath("isReadOnly").description("Read Only Page Identifier"),
						fieldWithPath("bevName").description("Business Entity View Name"),
						fieldWithPath("layout").description("Page Layout"),
						fieldWithPath(StringUtils.join("layout", ".", "sections")).description("Page Section List"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "displayIcon")).description("Section Display Icon"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "isDefault")).description("Section Default state"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "sectionType")).description("Section Type"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers")).description("Section Container List"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components")).description("Container Component"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "configName")).description("External Config Name"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "componentType")).description("External Component Type"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "attributeSelector")).description("External Field Selector"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "configType")).description("External Config Type"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "maxColumns")).description("Allowed Max Columns"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections")).description("BE Form Sections"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "order")).description("Form Section order"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.")).description("BE Form Fields"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "configName")).description("External Config Name"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "name")).description("Field Name"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "attributeSelector")).description("External Field Selector"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "configType")).description("External Config Type"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "many")).description("Is One to many field"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "required")).description("Is Mandatory field"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "order")).description("Field Order Representation"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "style")).description("Container Layout Style"),
						fieldWithPath(StringUtils.join("layout", ".", "sections", ".", "[].", "containers.", "[].", "style", ".", "width")).description("Container width")
						
						)
				));
	}
	
	@Test
	public void addUser() throws Exception {

		Mockito.when(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn("mdmsessionid");
		Mockito.when(portalUIService.addUser(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(createUserResponseNode);
		this.mockMvc
				.perform(RestDocumentationRequestBuilders.post("/infa-portal/portals/entities/{beName}/users?systemName=Admin", "SupplierView").contextPath("/infa-portal")
						.contentType(MediaType.APPLICATION_JSON_VALUE).content(userNode.toString()))
				.andExpect(status().isCreated())
				.andDo(this.documentationHandler.document(
						requestFields(fieldWithPath("BEData").description("Payload Data for BE if any"),
								fieldWithPath("userData").description("Payload Data for User Creation")),
						requestParameters(
								parameterWithName("systemName").description("Source System Value")
										),
						responseFields(fieldWithPath("Status").description("Sent email status"),
								fieldWithPath("passwordLink").description("password link"))
						));
	}
	
	@Test
	public void deleteUser() throws Exception {

		((ObjectNode) userNode).remove("userData");
		Mockito.when(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn("mdmsessionid");
		Mockito.doNothing().when(portalUIService).deleteUser(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());
		this.mockMvc
				.perform(RestDocumentationRequestBuilders.delete("/infa-portal/portals/entities/{beName}/users/{username}?systemName=Admin", "SupplierView", "username").contextPath("/infa-portal")
						.contentType(MediaType.APPLICATION_JSON_VALUE).content(userNode.toString()))
				.andExpect(status().isOk())
				.andDo(this.documentationHandler.document(
						requestFields(fieldWithPath("BEData").description("Payload Data for Delete Contacts from BE if any")),
						requestParameters(
								parameterWithName("systemName").description("Source System Value")
										)
						));
	}

	@Test
	public void updateState() throws Exception {
		Mockito.doNothing().when(portalUIService).updatePortalStatus(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any());
		this.mockMvc
		.perform(RestDocumentationRequestBuilders.post("/infa-portal/portals/state/{portalId}?systemName=Admin", "2").contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, "admin@payload")
				.header(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID, "2")
				.contentType(MediaType.APPLICATION_JSON_VALUE).content(stateUpdateNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document(
				requestFields(fieldWithPath("rowidObject").description("Payload Data for rowidObject"),
						fieldWithPath("portalState").description("Payload Data for State value"),
						fieldWithPath("interactionId").description("Payload Data for interactionId if any")),
				requestParameters(
						parameterWithName("systemName").description("Source System Value")
								)
				));
	}
	
	@Test
	public void getHubUser() throws Exception {
		Mockito.when(portalUIService.getHubUser(Mockito.any())).thenReturn(usersArrayNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.get
				("/infa-portal/portals/entities/{beName}/users?username={user}", "SupplierView", "bon@infa.com")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalServiceConstants.AUTH_SECURITY_PAYLOAD, "admin@payload")
				.header(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID, "2")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
										),
				requestParameters(
						parameterWithName("username").description("User Name to filter else Return all users without param")
								),
				responseFields(
						fieldWithPath("[].userName").description("User Name"),
						fieldWithPath("[].firstName").description("User First Name"),
						fieldWithPath("[].lastName").description("User Last Name"),
						fieldWithPath("[].email").description("User Email Address")						
						)
				));
		
	}

	@Test
	public void savePreference() throws Exception {
		Mockito.when(portalUIService.savePortalPreference(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(userPreferenceNode);
		this.mockMvc
				.perform(RestDocumentationRequestBuilders.post("/infa-portal/portals/preferences/users/{userId}/", "abc@mail.com")
						.contextPath("/infa-portal")
						.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
						.header("Cookie", "ict-ui-localhost-orcl-C360-2=71c7f; portalsessionid-localhost-orcl-C360-2=-6KOXpyYs51;")
						.header(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID, "2")
						.contentType(MediaType.APPLICATION_JSON_VALUE).content(userPreferencePayloadNode.toString()))
				.andExpect(status().isOk())
				.andDo(this.documentationHandler.document
						(requestHeaders(
								headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID).description("The portal id for which user preference has to be saved"),
								headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors id for which user preference has to be saved"))
						));
	}

	@Test
	public void updatePreference() throws Exception {

		Mockito.when(portalUIService.savePortalPreference(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(userPreferenceNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.put
				("/infa-portal/portals/preferences/users/{userId}/{id}",  "abc@mail.com","a60020774f1a432eafaa8f7d9e6ccdc2")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(userPreferencePayloadNode.toString()))
				.andExpect(status().isOk())
				.andDo(this.documentationHandler.document
						(requestHeaders(
								headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The portal id for which user preference has to be update"),
								headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be update"))
						));
	}

    @Test
    public void getUserPreference() throws Exception {
        Mockito.when(portalUIService.getPortalPreference(Mockito.any(),Mockito.any(),Mockito.any(),Mockito.any())).thenReturn(userPreferenceNode);
        this.mockMvc.perform(RestDocumentationRequestBuilders.get
                ("/infa-portal/portals/preferences/users/{userId}/?id={id}", "abc@mail.com","a60020774f1a432eafaa8f7d9e6ccdc2")
                .header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
                .header(PortalServiceConstants.HEADER_ATTRIBUTE_PORTAL_ID, "2")
                .header("Cookie", "ict-ui-localhost-orcl-C360-2=71c7f; portalsessionid-localhost-orcl-C360-2=-6KOXpyYs51;")
                .contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal"))
                .andExpect(status().isOk())
                .andDo(this.documentationHandler.document
                        (
                                requestHeaders(
                                        headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the preference had to be retrieve"),
										headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_ID).description("The portal ID to which the preference had to be retrieve")
								),
                                requestParameters(
                                        parameterWithName("id").description("Id to filter else Return all preference without param")
                                )
                        ));

    }

}
