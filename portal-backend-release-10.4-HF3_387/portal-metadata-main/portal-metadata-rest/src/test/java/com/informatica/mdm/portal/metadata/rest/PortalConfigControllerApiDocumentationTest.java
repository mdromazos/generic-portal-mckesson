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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

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
public class PortalConfigControllerApiDocumentationTest {

	@Autowired
    private MockMvc mockMvc;
	
	@Mock
	PortalConfigService portalConfigService;
	
	@Mock
	HttpServletRequest request;
	
	@Mock
	Credentials credentials;
	
	JsonNode portalNode, databaseNode, portalIdNode, 
	portalIdVersionNode, headerNode, pageNode, pagesNode;
	
	JsonNode arrayNode;
	
	ArrayNode portalsNode;
	
	String dataBases = "[{\"databaseId\":\"orcl-supplier\",\"label\":\"supplier\"}]";
	String portalId = "{\"portalId\":\"867345\"}";
	String portalIdVersion = "{\"portalId\":\"867345\",\"version\":1}";
	String portals = "[{\"portalName\":\"Supplier Portal\",\"portalId\":\"9853446\",\"createdBy\":\"supplier_user\",\"createdDate\":\"2014-10-05T15:23:01Z\",\"lastUpdatedBy\":\"supplier_user\",\"lastUpdatedDate\":\"2014-10-05T15:23:01Z\", \"databaseId\":\"orcl-SUPPLIER_HUB\", \"isDraft\":false}]";
	
	@InjectMocks
	PortalConfigController portalController;
	
	@Rule
	public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");
	
	private RestDocumentationResultHandler documentationHandler;
	
	private static final String PAGE_NODE_VALUE = "{\"layout\":{\"sections\":[{\"displayIcon\":\"rectangle\",\"isDefault\":false,\"containers\":[{\"components\":[{\"configName\":\"SupplierView\",\"componentType\":\"BeFormComponent\",\"beFormSections\":[{\"beFormFields\":[{\"configName\":\"SupplierView\",\"name\":\"fullNm\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"fullNm\\\")]\",\"configType\":\"BEView\",\"many\":false,\"required\":false,\"order\":0},{\"configName\":\"SupplierView\",\"name\":\"crncy\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"crncy\\\")]\",\"configType\":\"BEView\",\"many\":false,\"required\":false,\"order\":0}],\"order\":0}],\"attributeSelector\":\"$\",\"configType\":\"BEView\",\"maxColumns\":0}],\"style\":{\"width\":1}}],\"sectionType\":\"Section-Type 1\"}]},\"bevName\":\"SupplierView\",\"isReadOnly\":false,\"roles\":[\"Supplier Users\",\"Supplier Administrators\",\"EntityManager\"],\"name\":\"Accustom Page - Record\",\"type\":\"Record Page\",\"maxColumns\":1}";
	private static final String HEADER_NODE_VALUE = "{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"}";
	private static final String PAGES_ARRAY_NODE = "[{\"id\":\"2\",\"name\":\"moanaPage\"},{\"id\":\"3\",\"name\":\"neemoPage\"},{\"id\":\"4\",\"name\":\"freddiePage\"}]";
	private static final String PORTAL_NODE = "{\"portalName\":\"Supplier Portal\",\"isStateEnabled\":true,\"navigationType\":0,\"sourceSystem\": 0,\"beName\": \"Supplier\",\"portalTitle\": \"Supplier Portal\",\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"bevName\":\"SupplierView\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\"}";

    
    @Before
    public void init() throws IOException {
    	MockitoAnnotations.initMocks(this);
    	PowerMockito.mockStatic(PortalRestUtil.class);
    	portalNode = new ObjectMapper().readTree(PORTAL_NODE);
    	databaseNode = new ObjectMapper().readTree(dataBases);
    	portalIdNode = new ObjectMapper().readTree(portalId);
    	headerNode = new ObjectMapper().readTree(HEADER_NODE_VALUE);
    	portalIdVersionNode = new ObjectMapper().readTree(portalIdVersion);
    	portalsNode = new ObjectMapper().createArrayNode();
    	pageNode = new ObjectMapper().readTree(PAGE_NODE_VALUE);
    	pagesNode = new ObjectMapper().readTree(PAGES_ARRAY_NODE);
    	new ObjectMapper().readTree(portals).elements().forEachRemaining(portalsNode::add);
    	
    	arrayNode = new ObjectMapper().createArrayNode();
    	ObjectNode objectNode1 = pageNode.deepCopy();
    	objectNode1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "Page One");
    	((ArrayNode) arrayNode).add(objectNode1);
    	ObjectNode objectNode2 = pageNode.deepCopy();
    	objectNode2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "Page Two");
    	((ArrayNode) arrayNode).add(objectNode2);
    	ObjectNode objectNode3 = pageNode.deepCopy();
    	objectNode3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "Page Three");
    	((ArrayNode) arrayNode).add(objectNode3);
    	
    	this.documentationHandler = document("PortalControllerApiDocumentation/{method-name}",
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
	public void getDatabases() throws Exception {
		Mockito.when(portalConfigService.getDatabases(Mockito.any())).thenReturn(databaseNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.get("/infa-portal/config/databases").contextPath("/infa-portal")
				.contentType(MediaType.APPLICATION_JSON_VALUE))
			.andExpect(status().isOk())
			.andDo(this.documentationHandler.document
					(responseFields(
							fieldWithPath("[]").description("Array of available ORS Database Schema"),
							fieldWithPath("[]."+PortalMetadataContants.DATABASE_ID).description("ORS Schema ID"),
							fieldWithPath("[]."+PortalMetadataContants.DATABASE_LABEL).description("ORS Schema Name")
							)));
	}

	@Test
	public void getPortals() throws Exception {
		
		ObjectNode filterNode = new ObjectMapper().createObjectNode();
		filterNode.put(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE, true);
		List<String> projections = new ArrayList<String>();
		projections.add(PortalMetadataContants.PORTAL_ID);
		projections.add(PortalMetadataContants.PORTAL_NAME);
		projections.add(PortalMetadataContants.CREATED_BY);
		projections.add(PortalMetadataContants.CREATED_DATE);
		projections.add(PortalMetadataContants.LAST_UPDATED_BY);
		projections.add(PortalMetadataContants.LAST_UPDATED_DATE);
		projections.add(PortalMetadataContants.DATABASE_ID);
		projections.add(PortalMetadataContants.PORTAL_STATE_ATTRIBUTE);
		Mockito.when(portalConfigService.getPortalConfigModel(Mockito.any(), Mockito.any(),Mockito.anyString())).thenReturn(portalsNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(PortalRestUtil.getCookieValue(Mockito.any(), Mockito.any())).thenReturn("ict");
		this.mockMvc.perform(RestDocumentationRequestBuilders.get("/infa-portal/config/{path}",  "portals").contextPath("/infa-portal")
					.param("sort", PortalMetadataContants.LAST_UPDATED_DATE)
					.param("sortOrder", PortalMetadataContants.SORT_ORDER_DESC)
					.param("filter", filterNode.toString())
					.param("projections", projections.toString())
					.param("depth", "1"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(responseFields(
						fieldWithPath("[]").description("Array of available Portal Config"),
						fieldWithPath("[]."+PortalMetadataContants.PORTAL_ID).description("Portal Config ID"),
						fieldWithPath("[]."+PortalMetadataContants.PORTAL_NAME).description("Portal Config Name"),
						fieldWithPath("[]."+PortalMetadataContants.CREATED_BY).description("Portal Config created by the user"),
						fieldWithPath("[]."+PortalMetadataContants.CREATED_DATE).description("Portal Config created date"),
						fieldWithPath("[]."+PortalMetadataContants.LAST_UPDATED_BY).description("Portal Config last updated by the user"),
						fieldWithPath("[]."+PortalMetadataContants.LAST_UPDATED_DATE).description("Portal Config last updated date"),
						fieldWithPath("[]."+PortalMetadataContants.DATABASE_ID).description("ORS Database schema this Portal belongs to"),
						fieldWithPath("[]."+PortalMetadataContants.PORTAL_STATE_ATTRIBUTE).description("State of the Portal Config")
						),
				requestParameters(
						parameterWithName("sort").description("Field on which sorting needs to be applied"),
						parameterWithName("sortOrder").description("Sorting Order 'Desc' or 'Asc'"),
						parameterWithName("filter").description("Filter by applied on specified attribute : Input is in JsonFormat"),
						parameterWithName("projections").description("Filed Selectors to specify the fileds to be retrieved: Input is in Array of fields"),
						parameterWithName("depth").description("Integer Value specify object depth needs to fetched")
								)	
						));
	}

	@Test
	public void getPortal() throws Exception {
		
		@SuppressWarnings("unused")
		ObjectNode filterNode = new ObjectMapper().createObjectNode();
		List<String> projections = new ArrayList<String>();
		projections.add(PortalMetadataContants.PORTAL_ID);
		projections.add(PortalMetadataContants.PORTAL_NAME);
		projections.add(PortalMetadataContants.HEADER_ATTRIBUTE);
		projections.add(PortalMetadataContants.FOOTER_ATTRIBUTE);
		projections.add(PortalMetadataContants.SIGNUP_ATTRIBUTE);
		projections.add(PortalMetadataContants.LOGIN_ATTRIBUTE);
		projections.add(PortalMetadataContants.DATABASE_ID);
		projections.add(PortalMetadataContants.DATABASE_ID);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "9483");
		Mockito.when(portalConfigService.getPortalConfigModel(Mockito.any(), Mockito.any(),Mockito.anyString())).thenReturn(portalNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(PortalRestUtil.getCookieValue(Mockito.any(), Mockito.any())).thenReturn("ict");
		this.mockMvc.perform(RestDocumentationRequestBuilders
				.get("/infa-portal/config/{path}",  "portals/portalId").contextPath("/infa-portal")
				.param("sort", PortalMetadataContants.LAST_UPDATED_DATE)
				.param("sortOrder", PortalMetadataContants.SORT_ORDER_DESC)
				.param("filter", filterNode.toString())
				.param("projections", projections.toString())
				.param("depth", "1")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1")
				.contentType(MediaType.APPLICATION_JSON_VALUE))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(pathParameters
						(
								parameterWithName("path").description("Path based on the Designed Model,"
										+ " root node should start with 'portals' ex: 'portals/{portalId}' ")
						 ),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
										),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Portal Config ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_NAME).description("Portal Config Name"),
						fieldWithPath("isStateEnabled").description("Representing is Portal being state enabled"),
						fieldWithPath("navigationType").description("Portal Config Navigation Type"),
						fieldWithPath("sourceSystem").description("Portal Config Source System"),
						fieldWithPath("portalTitle").description("Portal Config Title"),
						fieldWithPath("beName").description("Business Entity Name"),
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
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE+"."+"bevName").description("BE View for this portal"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE).description("Portal Login Information"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"backgroundImage").description("Portal Login Page Background Image"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"title").description("Portal Login title"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"isCaptchaEnabled").description("Capcha Enabling attribute"),
						fieldWithPath(PortalMetadataContants.DATABASE_ID).description("ORS Database schema this Portal belongs to")),
				
				requestParameters(
						parameterWithName("sort").description("Field on which sorting needs to be applied"),
						parameterWithName("sortOrder").description("Sorting Order 'Desc' or 'Asc'"),
						parameterWithName("filter").description("Filter by applied on specified attribute for Collection Object Retrieve : Input is in JsonFormat"),
						parameterWithName("projections").description("Filed Selectors to specify the fileds to be retrieved: Input is in Array Fields"),
						parameterWithName("depth").description("Integer Value specify object depth needs to fetched")
								)
				
				));
	}

	@Test
	public void createPortal() throws Exception {
		
		Mockito.when(request.getRequestURI()).thenReturn("portals");
		Mockito.when(portalConfigService.createPortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post("/infa-portal/config/{path}",  "portals").contextPath("/infa-portal")
				.contentType(MediaType.APPLICATION_JSON_VALUE)
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.content(portalNode.toString()))
		.andExpect(status().isCreated())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath(PortalMetadataContants.PORTAL_NAME).description("Portal Config Name"),
						fieldWithPath("isStateEnabled").description("Representing is Portal being state enabled"),
						fieldWithPath("navigationType").description("Portal Config Navigation Type"),
						fieldWithPath("sourceSystem").description("Portal Config Source System"),
						fieldWithPath("portalTitle").description("Portal Config Title"),
						fieldWithPath("beName").description("Business Entity Name"),
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
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE+"."+"bevName").description("BE View for this portal"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE).description("Portal Login Information"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"backgroundImage").description("Portal Login Page Background Image"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"title").description("Portal Login title"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"isCaptchaEnabled").description("Capcha Enabling attribute"),
						fieldWithPath(PortalMetadataContants.DATABASE_ID).description("ORS Database schema this Portal belongs to")),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
								),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
										+ " root node should start with 'portals' ex: 'portals' ")
							),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void updatePortal() throws Exception {
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		Mockito.when(request.getRequestURI()).thenReturn("portals/1");
		Mockito.when(portalConfigService.patchUpdatePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.patch("/infa-portal/config/{path}",  "portals/portalId").contextPath("/infa-portal")
				.contentType(MediaType.APPLICATION_JSON_VALUE)
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1")
				.content(portalNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Portal Config ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_NAME).description("Portal Config Name"),
						fieldWithPath("isStateEnabled").description("Representing is Portal being state enabled"),
						fieldWithPath("navigationType").description("Portal Config Navigation Type"),
						fieldWithPath("sourceSystem").description("Portal Config Source System"),
						fieldWithPath("portalTitle").description("Portal Config Title"),
						fieldWithPath("beName").description("Business Entity Name"),
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
						fieldWithPath(PortalMetadataContants.SIGNUP_ATTRIBUTE+"."+"bevName").description("BE View for this portal"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE).description("Portal Login Information"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"backgroundImage").description("Portal Login Page Background Image"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"title").description("Portal Login title"),
						fieldWithPath(PortalMetadataContants.LOGIN_ATTRIBUTE+"."+"isCaptchaEnabled").description("Capcha Enabling attribute"),
						fieldWithPath(PortalMetadataContants.DATABASE_ID).description("ORS Database schema this Portal belongs to")),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
								),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
										+ " root node should start with 'portals' ex: 'portals/{portalId}' ")
							),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void getPortalReferenceData() throws Exception {
		JsonNode referenceData = new ObjectMapper().createObjectNode();
		Mockito.when(portalConfigService.getReferenceDataByUri(Mockito.anyString())).thenReturn(referenceData);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.get
				("/infa-portal/config/reference/portals/{name}", "sections")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(
				pathParameters(
						parameterWithName("name").description("The reference data name to be fetched and values as of now are (sections, states)")
						)
				));
	}
	
	@Test
	public void createPortalConfigModelCollection() throws Exception {
		
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages");
		Mockito.when(portalConfigService.createPortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/config/{path}",  "portals/portalId/pages")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(arrayNode.toString()))
		.andExpect(status().isCreated())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("[].name").description("Page Name"),
						fieldWithPath("[].type").description("Page Type"),
						fieldWithPath("[].maxColumns").description("Max Allowed Column in a page"),
						fieldWithPath("[].roles").description("Role Mappings"),
						fieldWithPath("[].isReadOnly").description("Read Only Page Identifier"),
						fieldWithPath("[].bevName").description("Business Entity View Name"),
						fieldWithPath("[].layout").description("Page Layout"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections")).description("Page Section List"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "displayIcon")).description("Section Display Icon"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "isDefault")).description("Section Default state"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "sectionType")).description("Section Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers")).description("Section Container List"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components")).description("Container Component"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "configName")).description("External Config Name"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "componentType")).description("External Component Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "attributeSelector")).description("External Field Selector"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "configType")).description("External Config Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "maxColumns")).description("Allowed Max Columns"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections")).description("BE Form Sections"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "order")).description("Form Section order"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.")).description("BE Form Fields"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "configName")).description("External Config Name"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "name")).description("Field Name"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "attributeSelector")).description("External Field Selector"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "configType")).description("External Config Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "many")).description("Is One to many field"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "required")).description("Is Mandatory field"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "order")).description("Field Order Representation"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "style")).description("Container Layout Style"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "style", ".", "width")).description("Container width")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/pages' ")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void createPortalConfigModelCollectionObject() throws Exception {
		
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages");
		Mockito.when(portalConfigService.createPortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/config/{path}",  "portals/portalId/pages")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(pageNode.toString()))
		.andExpect(status().isCreated())
		.andDo(this.documentationHandler.document
				(requestFields(
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
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' 'portals/{portalId}/pages' ")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void createPortalConfigModelObject() throws Exception {
		
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/header");
		Mockito.when(portalConfigService.createPortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/config/{path}",  "portals/portalId/header")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(headerNode.toString()))
		.andExpect(status().isCreated())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("backgroundColor").description("Portal Header Background color"),
						fieldWithPath("fontColor").description("Portal Header font color"),
						fieldWithPath("logo").description("Portal Header logo")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' 'portals/{portalId}/header',"
								+ " 'portals/{portalId}/pages/{pageId}/layout'")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void publishPortalConfigModel() throws Exception {
		
		ObjectNode emptyNode = new ObjectMapper().createObjectNode();
		Mockito.when(request.getRequestURI()).thenReturn("portals/1");
		Mockito.when(portalConfigService.createPortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.post
				("/infa-portal/config/{path}",  "portals/portalId")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal").param("action", "publish")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier").content(emptyNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' : 'portals/{portalId}'")
						),
				requestParameters(
						parameterWithName("action").description("Used while publish the portal config: action = 'publish'")
								),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void updatePortalConfigModelCollection() throws Exception {
		
		AtomicInteger id = new AtomicInteger(0);
		arrayNode.forEach(node -> ((ObjectNode) node).put(PortalMetadataContants.ID_ATTRIBUTE, id.incrementAndGet()));
		arrayNode.forEach(node -> ((ObjectNode) node).put(PortalMetadataContants.DEFAULT_VALUE_ORDER, id.get()));
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages");
		Mockito.when(portalConfigService.updatePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.put
				("/infa-portal/config/{path}",  "portals/portalId/pages")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(arrayNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("[].id").description("Page Identifier"),
						fieldWithPath("[].order").description("Page Order"),
						fieldWithPath("[].name").description("Page Name"),
						fieldWithPath("[].type").description("Page Type"),
						fieldWithPath("[].maxColumns").description("Max Allowed Column in a page"),
						fieldWithPath("[].roles").description("Role Mappings"),
						fieldWithPath("[].isReadOnly").description("Read Only Page Identifier"),
						fieldWithPath("[].bevName").description("Business Entity View Name"),
						fieldWithPath("[].layout").description("Page Layout"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections")).description("Page Section List"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "displayIcon")).description("Section Display Icon"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "isDefault")).description("Section Default state"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "sectionType")).description("Section Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers")).description("Section Container List"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components")).description("Container Component"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "configName")).description("External Config Name"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "componentType")).description("External Component Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "attributeSelector")).description("External Field Selector"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "configType")).description("External Config Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "maxColumns")).description("Allowed Max Columns"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections")).description("BE Form Sections"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "order")).description("Form Section order"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.")).description("BE Form Fields"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "configName")).description("External Config Name"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "name")).description("Field Name"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "attributeSelector")).description("External Field Selector"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "configType")).description("External Config Type"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "many")).description("Is One to many field"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "required")).description("Is Mandatory field"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "components.", "[].", "beFormSections.", "[].", "beFormFields.", "[].", "order")).description("Field Order Representation"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "style")).description("Container Layout Style"),
						fieldWithPath(StringUtils.join("[].layout", ".", "sections", ".", "[].", "containers.", "[].", "style", ".", "width")).description("Container width")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/pages' ")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void updatePortalConfigModelCollectionObject() throws Exception {
		
		((ObjectNode) pageNode).put(PortalMetadataContants.ID_ATTRIBUTE, 1);
		((ObjectNode) pageNode).put(PortalMetadataContants.DEFAULT_VALUE_ORDER, 1);
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages");
		Mockito.when(portalConfigService.updatePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.put
				("/infa-portal/config/{path}",  "portals/portalId/pages/pageId")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(pageNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
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
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/pages/{pageId}' ")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void updatePortalConfigModelObject() throws Exception {
		
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/header");
		Mockito.when(portalConfigService.updatePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.put
				("/infa-portal/config/{path}",  "portals/portalId/header")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(headerNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("backgroundColor").description("Portal Header Background color"),
						fieldWithPath("fontColor").description("Portal Header font color"),
						fieldWithPath("logo").description("Portal Header logo")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/header',"
								+ " 'portals/{portalId}/pages/{pageId}/layout'")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void patchUpdatePortalConfigModelCollection() throws Exception {
		
		AtomicInteger id = new AtomicInteger(0);
		pagesNode.forEach(node -> ((ObjectNode) node).put(PortalMetadataContants.ID_ATTRIBUTE, id.incrementAndGet()));
		pagesNode.forEach(node -> ((ObjectNode) node).put(PortalMetadataContants.DEFAULT_VALUE_ORDER, id.get()));
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages");
		Mockito.when(portalConfigService.patchUpdatePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.patch
				("/infa-portal/config/{path}",  "portals/portalId/pages")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(pagesNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("[].id").description("Page Identifier"),
						fieldWithPath("[].order").description("Page Order"),
						fieldWithPath("[].name").description("Page Name")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/pages' ")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void patchUpdatePortalConfigModelCollectionObject() throws Exception {
		
		pageNode = pagesNode.get(0);
		((ObjectNode) pageNode).put(PortalMetadataContants.ID_ATTRIBUTE, 1);
		((ObjectNode) pageNode).put(PortalMetadataContants.DEFAULT_VALUE_ORDER, 1);
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages");
		Mockito.when(portalConfigService.patchUpdatePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.patch
				("/infa-portal/config/{path}",  "portals/portalId/pages")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(pageNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("id").description("Page Identifier"),
						fieldWithPath("name").description("Page Name"),
						fieldWithPath("order").description("Page Order")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/pages' ")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void patchUpdatePortalConfigModelObject() throws Exception {
		
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/header");
		Mockito.when(portalConfigService.patchUpdatePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(portalIdVersionNode);
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		this.mockMvc.perform(RestDocumentationRequestBuilders.patch
				("/infa-portal/config/{path}",  "portals/portalId/header")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(headerNode.toString()))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(requestFields(
						fieldWithPath("backgroundColor").description("Portal Header Background color"),
						fieldWithPath("fontColor").description("Portal Header font color"),
						fieldWithPath("logo").description("Portal Header logo")
						),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
							),
				pathParameters(
						parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/header',"
								+ " 'portals/{portalId}/pages/{pageId}/layout'")
						),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void deletePortalConfigModel() throws Exception {
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1");
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(portalConfigService.deletePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(new ObjectMapper().createObjectNode());
		this.mockMvc.perform(RestDocumentationRequestBuilders.delete
				("/infa-portal/config/{path}",  "portals/portalId")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.param("action", PortalMetadataContants.PORTAL_DISCARD_ACTION)
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(pathParameters
						(parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}'")),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
								),
				requestParameters(
						parameterWithName("action").description("Represents Discard to determine whether to delete draft record or all instance of portal config")
								)
				));
	}
	
	@Test
	public void deleteFromPortalConfigModelForObject() throws Exception {
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/header");
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(portalConfigService.deletePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.delete
				("/infa-portal/config/{path}",  "portals/portalId/header")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(pathParameters
						(parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/header'")),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
								),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void deleteFromPortalConfigModelForCollection() throws Exception {
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages");
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(portalConfigService.deletePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.delete
				("/infa-portal/config/{path}",  "portals/portalId/pages")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(pathParameters
						(parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/pages'")),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
								),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}
	
	@Test
	public void deleteFromPortalConfigModelForCollectionObject() throws Exception {
		
		Mockito.when(request.getRequestURI()).thenReturn("portals/1/pages/1");
		Mockito.when(PortalRestUtil.getCredentials(request,PortalRestConstants.CONFIG_UI_COOKIE)).thenReturn(credentials);
		Mockito.when(portalConfigService.deletePortalConfigModel(Mockito.any(), Mockito.any(), Mockito.any(),Mockito.any(HttpServletRequest.class))).thenReturn(portalIdVersionNode);
		this.mockMvc.perform(RestDocumentationRequestBuilders.delete
				("/infa-portal/config/{path}",  "portals/portalId/pages/pagesId")
				.contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1")
				.header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier"))
		.andExpect(status().isOk())
		.andDo(this.documentationHandler.document
				(pathParameters
						(parameterWithName("path").description("Path based on the Designed Model,"
								+ " root node should start with 'portals' ex: 'portals/{portalId}/pages/{pagesId}'")),
				requestHeaders(
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION).description("The version of the portal config to be retrieve"),
						headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID).description("The ors ID to which the config had to be retrieve")
								),
				responseFields(
						fieldWithPath(PortalMetadataContants.PORTAL_ID).description("Returns the saved Portal ID"),
						fieldWithPath(PortalMetadataContants.PORTAL_VERSION).description("Returns the saved version of Portal")
						)
				));
	}

}
