package com.informatica.mdm.portal.metadata.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.app.PortalApplication;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.PortalConfigService;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.restdocs.JUnitRestDocumentation;
import org.springframework.restdocs.cli.CliDocumentation;
import org.springframework.restdocs.http.HttpDocumentation;
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.restdocs.mockmvc.RestDocumentationResultHandler;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import static org.springframework.restdocs.headers.HeaderDocumentation.headerWithName;
import static org.springframework.restdocs.headers.HeaderDocumentation.requestHeaders;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.pathParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@AutoConfigureRestDocs
@AutoConfigureMockMvc
@OverrideAutoConfiguration(enabled = false)
@SpringBootTest(classes={PortalApplication.class})
@PrepareForTest({PortalRestUtil.class})
public class SamlConfigControllerApiDocumentationTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private PortalConfigService portalConfigService;

    @InjectMocks
    SamlConfigController samlController;

    JsonNode ssoNode, responseNode;

    @Mock
    HttpServletRequest request;

    @Rule
    public JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");

    private RestDocumentationResultHandler documentationHandler;

    private static final String SSO_NODE = "[{\"name\":\"SAML Service provider metadata properties\",\"desc\":\"SAML Service provider metadata properties\",\"label\":\"SAML Service provider metadata properties\",\"configuration\":[{\"key\":\"EntityID\",\"desc\":\"Used to communicate with SP and IDP\",\"label\":\"EntityID\",\"value\":\"GENERIC_PORTAL_localhost-orcl-C360_80003\",\"type\":\"String\",\"isMandatory\":true},{\"key\":\"SignAuthRequest\",\"desc\":\"Boolean attribute\",\"label\":\"SignAuthRequest\",\"value\":true,\"type\":\"boolean\",\"isMandatory\":true},{\"key\":\"SignLogoutRequest\",\"desc\":\"Boolean attribute\",\"label\":\"SignLogoutRequest\",\"value\":false,\"type\":\"boolean\",\"isMandatory\":true},{\"key\":\"AssertionConsumerServiceURL\",\"desc\":\"End point to which SAML responses are to be sent by the IdP\",\"label\":\"AssertionConsumerServiceURL\",\"value\":\"http:/localhost:8080/infa-portal/portals/SSO/localhost-orcl-C360/80003\",\"type\":\"String\",\"isMandatory\":true}]},{\"name\":\"SAML Identity provider metadata properties\",\"desc\":\"SAML Identity provider metadata properties\",\"label\":\"SAML Identity provider metadata properties\",\"configuration\":[{\"key\":\"EntityID\",\"desc\":\"Used to communicate with SP and IDP\",\"label\":\"EntityID\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleSignOnServiceURLRedirect\",\"desc\":\"Single SignOn Service URL Redirect\",\"label\":\"Single SignOn Service URL Redirect\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleSignOnServiceURLPOST\",\"desc\":\"Single SignOn Service URL POST\",\"label\":\"Single SignOn Service URL POST\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleLogoutServiceURL\",\"desc\":\"Single Logout Service URL\",\"label\":\"Single Logout Service URL\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"Certificate\",\"desc\":\"X509Certificate for IdP\",\"label\":\"X509Certificate for IdP\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"BindingType\",\"desc\":\"Single SignOn Service URL Binding Type\",\"label\":\"Single SignOn Service URL Binding Type\",\"value\":\"Redirect\",\"type\":\"String\",\"isMandatory\":false}]}]";
    private static final String IDP_XML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><md:EntityDescriptor entityID=\"http://www.okta.com/exku7ydqisZkTcfS45d6\" xmlns:md=\"urn:oasis:names:tc:SAML:2.0:metadata\"><md:IDPSSODescriptor WantAuthnRequestsSigned=\"false\" protocolSupportEnumeration=\"urn:oasis:names:tc:SAML:2.0:protocol\"><md:KeyDescriptor use=\"signing\"><ds:KeyInfo xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\"><ds:X509Data><ds:X509Certificate>CERT</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat><md:SingleSignOnService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST\" Location=\"https://dev-25198609.okta.com/app/dev-25198609_portal_2/exku7ydqisZkTcfS45d6/sso/saml\"/><md:SingleSignOnService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\" Location=\"https://dev-25198609.okta.com/app/dev-25198609_portal_2/exku7ydqisZkTcfS45d6/sso/saml\"/></md:IDPSSODescriptor></md:EntityDescriptor>";
    private static final String SP_FILE_CONTENT = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><md:EntityDescriptor cacheDuration=\"PT10M4.800S\" entityID=\"GENERIC_PORTAL_orcl-TCR_HUB_920017\" validUntil=\"2021-06-30T09:16:33.126Z\" xmlns:md=\"urn:oasis:names:tc:SAML:2.0:metadata\"><md:SPSSODescriptor AuthnRequestsSigned=\"true\" WantAssertionsSigned=\"false\" protocolSupportEnumeration=\"urn:oasis:names:tc:SAML:2.0:protocol\"><md:SingleLogoutService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\" Location=\"http://inw1pf0ydcch:8080/infa-portal/portals/login/saml/orcl-TCR_HUB/920017\"/><md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</md:NameIDFormat><md:AssertionConsumerService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST\" Location=\"http://inw1pf0ydcch:8080/infa-portal/portals/login/saml/orcl-TCR_HUB/920017\" index=\"0\"/></md:SPSSODescriptor></md:EntityDescriptor>";

    @Before
    public void init() throws IOException {
        MockitoAnnotations.initMocks(this);
        PowerMockito.mockStatic(PortalRestUtil.class);
        ssoNode = new ObjectMapper().readTree(SSO_NODE);
        responseNode = new ObjectMapper().createObjectNode();
        ((ObjectNode) responseNode).put(PortalMetadataContants.PORTAL_ID, "43424");
        this.documentationHandler = document("SamlConfigControllerApiDocumentation/{method-name}",
                preprocessRequest(prettyPrint(), removeHeaders("Host", "Content-Length")),
                preprocessResponse(prettyPrint(), removeHeaders("Content-Length")));

        this.mockMvc = MockMvcBuilders.standaloneSetup(samlController).
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
    public void getSSOConfig() throws Exception {

        Mockito.when(
                portalConfigService.getSSOConfig(Mockito.any(), Mockito.any(), Mockito.any(PortalRestConfig.class)))
                .thenReturn(ssoNode);
        this.mockMvc.perform(RestDocumentationRequestBuilders.get("/infa-portal/sso/portals/{portalId}", "45654")
                .contextPath("/infa-portal").header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
                .contentType(MediaType.APPLICATION_JSON_VALUE)).andExpect(status().isOk())
                .andDo(this.documentationHandler.document(
                        pathParameters(parameterWithName(PortalMetadataContants.PORTAL_ID)
                                .description("The portal ID for which sso config had to be retrieve")),
                        requestHeaders(headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)
                                .description("The ors ID for which sso config had to be retrieve")),
                        responseFields(fieldWithPath("[].name").description("SSO Section Name"),
                                fieldWithPath("[].desc").description("SSO Section Description"),
                                fieldWithPath("[].label").description("SSO Section Label"),
                                fieldWithPath("[].configuration").description("SSO Section Configuration"),
                                fieldWithPath("[].configuration.[].key").description("SSO Property Key"),
                                fieldWithPath("[].configuration.[].desc").description("SSO Property Description"),
                                fieldWithPath("[].configuration.[].label").description("SSO Property Label"),
                                fieldWithPath("[].configuration.[].isMandatory").description("SSO Property Mandatory Indicator"),
                                fieldWithPath("[].configuration.[].value").description("SSO Property values"),
                                fieldWithPath("[].configuration.[].type").description("SSO Property datatype"))));
    }

    @Test
    public void persistSSOConfig() throws Exception {

        Mockito.when(portalConfigService.saveSSOConfig(Mockito.any(), Mockito.any(JsonNode.class),
                Mockito.anyString(), Mockito.anyString())).thenReturn(responseNode);
        this.mockMvc.perform(RestDocumentationRequestBuilders.put("/infa-portal/sso/portals/{portalId}", "45654")
                .contentType(MediaType.APPLICATION_JSON_VALUE).contextPath("/infa-portal")
                .header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
                .header(PortalRestConstants.HEADER_ATTRIBUTE_PORTAL_VERSION, "1").content(ssoNode.toString()))
                .andExpect(status().isOk())
                .andDo(this.documentationHandler.document(
                        requestFields(fieldWithPath("[].name").description("SSO Section Name"),
                                fieldWithPath("[].desc").description("SSO Section Description"),
                                fieldWithPath("[].label").description("SSO Section Label"),
                                fieldWithPath("[].configuration").description("SSO Section Configuration"),
                                fieldWithPath("[].configuration.[].key").description("SSO Property Key"),
                                fieldWithPath("[].configuration.[].desc").description("SSO Property Description"),
                                fieldWithPath("[].configuration.[].label").description("SSO Property Label"),
                                fieldWithPath("[].configuration.[].isMandatory").description("SSO Property Mandatory Indicator"),
                                fieldWithPath("[].configuration.[].value").description("SSO Property values"),
                                fieldWithPath("[].configuration.[].type").description("SSO Property datatype")),
                        requestHeaders(headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)
                                .description("The ors ID to which the config had to be saved")),
                        pathParameters(parameterWithName(PortalMetadataContants.PORTAL_ID)
                                .description("The portal ID for which sso config had to be saved")),
                        responseFields(fieldWithPath(PortalMetadataContants.PORTAL_ID)
                                .description("Portal ID for which SSO Config persisted"))));
    }

    @Test
    public void uploadIdpXMLFile() throws Exception {

        MockMultipartFile idpFile
                = new MockMultipartFile(
                "file",
                "idp.xml",
                MediaType.APPLICATION_XML_VALUE,
                IDP_XML.getBytes()
        );
        Mockito.when(portalConfigService.saveIdpConfig(Mockito.any(), Mockito.any(),
                Mockito.anyString(), Mockito.anyString())).thenReturn(ssoNode);
        Mockito.when(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn("mdmsessionid");
        this.mockMvc.perform(RestDocumentationRequestBuilders.fileUpload("/infa-portal/sso/portals/{portalId}/upload", "45654")
                .file(idpFile)
                .contextPath("/infa-portal")
                .header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier"))
                .andExpect(status().isOk())
                .andDo(this.documentationHandler.document(
                        pathParameters(parameterWithName(PortalMetadataContants.PORTAL_ID)
                                .description("The portal ID for which sso config had to be retrieve")),
                        requestHeaders(headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)
                                .description("The ors ID for which sso config had to be retrieve")),
                        responseFields(fieldWithPath("[].name").description("SSO Section Name"),
                                fieldWithPath("[].desc").description("SSO Section Description"),
                                fieldWithPath("[].label").description("SSO Section Label"),
                                fieldWithPath("[].configuration").description("SSO Section Configuration"),
                                fieldWithPath("[].configuration.[].key").description("SSO Property Key"),
                                fieldWithPath("[].configuration.[].desc").description("SSO Property Description"),
                                fieldWithPath("[].configuration.[].label").description("SSO Property Label"),
                                fieldWithPath("[].configuration.[].isMandatory").description("SSO Property Mandatory Indicator"),
                                fieldWithPath("[].configuration.[].value").description("SSO Property values"),
                                fieldWithPath("[].configuration.[].type").description("SSO Property datatype"))));
    }

    @Test
    public void downloadSPXMLFile() throws Exception {
        Mockito.when(
                portalConfigService.getSamlServiceProviderEntityId(Mockito.any(), Mockito.any()))
                .thenReturn("GENERIC_PORTAL_orcl-Supplier_45654");
        Mockito.when(
                portalConfigService.generateSpMetadataXml(Mockito.any(), Mockito.any(), Mockito.any()))
                .thenReturn(SP_FILE_CONTENT);
        Mockito.when(PortalRestUtil.getCookieValue(request, PortalRestConstants.PORTAL_UI_COOKIE)).thenReturn("mdmsessionid");
        this.mockMvc.perform(RestDocumentationRequestBuilders.get("/infa-portal/sso/portals/{portalId}/download", "45654")
        .contextPath("/infa-portal")
                .header(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID, "orcl-Supplier")
                .contentType(MediaType.APPLICATION_XML_VALUE))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_XML_VALUE))
                .andDo(this.documentationHandler.document(
                        pathParameters(parameterWithName(PortalMetadataContants.PORTAL_ID)
                                .description("The portal ID for which sso config had to be retrieve")),
                        requestHeaders(headerWithName(PortalRestConstants.HEADER_ATTRIBUTE_ORS_ID)
                                .description("The ors ID for which sso config had to be retrieve"))));
    }


}
