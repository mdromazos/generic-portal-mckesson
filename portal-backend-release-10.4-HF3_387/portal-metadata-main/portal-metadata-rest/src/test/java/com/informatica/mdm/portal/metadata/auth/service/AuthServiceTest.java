package com.informatica.mdm.portal.metadata.auth.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.http.conn.routing.HttpRoute;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.delos.cmx.server.admin.AdminLogin;
import com.delos.cmx.server.datalayer.ConnectionData;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.delos.cmx.server.datalayer.repository.security.ReposUser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.auth.service.impl.AuthServiceImpl;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.model.LoginData;
import com.informatica.mdm.portal.metadata.service.CacheService;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sam.BaseSecurityCredential;
import com.siperian.sif.client.SiperianClient;
import com.siperian.sif.message.mrm.AuthenticateRequest;
import com.siperian.sif.message.mrm.AuthenticateResponse;

@RunWith(PowerMockRunner.class)
@PrepareForTest({HubClient.class,PortalRestUtil.class,PortalConfigUtil.class, SiperianClient.class})
@PowerMockIgnore("javax.management.*")
public class AuthServiceTest {
	
	private static final String SCHEME = "http";
	private static final String HOST = "localhost";
	private static final int PORT = 8080;
	private static final String SECURITY_PAYLOAD = "infaPortal/admin===3846373930463144313733394346394141384145384242413439323842343646423731333642373930313945433239393032363543463044313636323142314439333434333642333835304245413433343843343138314339304535433143324434454344443";
	private static final String body = "{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":100,\"searchToken\":\"SVR1.RG2O\",\"facet\":[],\"item\":[{\"Supplier\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/request/hm_icons/org_Small.jpg?ors=localhost-orcl-SUPPLIER_HUB\",\"rel\":\"icon\"}],\"rowidObject\":\"560001        \",\"effectivePeriod\":{},\"label\":\"Supplier multiloginissue infa\",\"fullNm\":\"multiloginissue infa\",\"prtyBoClassCd\":\"Organization\",\"lglFrm\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Legal Form\",\"legalFormDesc\":\"Corporation\",\"legalFormCode\":\"Corporation\"},\"Contacts\":{\"link\":[],\"firstRecord\":1,\"recordCount\":5,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"440001        \",\"label\":\"Contacts\",\"hmRelTypCd\":\"Employs\",\"hierarchyCd\":\"Supplier Hierarchy\",\"contacts\":{\"rowidObject\":\"560002        \",\"effectivePeriod\":{},\"label\":\"Contacts\",\"lstNm\":\"infa\",\"prtyBoClassCd\":\"Person\",\"fullNm\":\"multiloginissue infa\",\"frstNm\":\"multiloginissue\",\"prtlUsrNm\":\"multiloginissue@infa.com\",\"prtlUsrRle\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Portal User Role\",\"roleCode\":\"Supplier Administrators\",\"roleDesc\":\"Supplier Administrators\"},\"ContactElectronicAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"80001         \",\"label\":\"ContactElectronicAddress\",\"etrncAddr\":\"multiloginissue@infa.com\",\"etrncAddrTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Electronic Address Type\",\"addrTyp\":\"Email\",\"addrTypDesc\":\"Email\"}}]}}},{\"rowidObject\":\"440002        \",\"label\":\"Contacts\",\"hmRelTypCd\":\"Employs\",\"hierarchyCd\":\"Supplier Hierarchy\",\"contacts\":{\"rowidObject\":\"560003        \",\"effectivePeriod\":{},\"label\":\"Contacts\",\"lstNm\":\"infa\",\"prtyBoClassCd\":\"Person\",\"fullNm\":\"multiloginissueuser1 infa\",\"frstNm\":\"multiloginissueuser1\",\"prtlUsrNm\":\"multiloginissueuser1@infa.com\",\"prtlUsrRle\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Portal User Role\",\"roleCode\":\"Supplier Administrators\",\"roleDesc\":\"Supplier Administrators\"},\"ContactElectronicAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"80002         \",\"label\":\"ContactElectronicAddress\",\"etrncAddr\":\"multiloginissueuser1@infa.com\",\"etrncAddrTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Electronic Address Type\",\"addrTyp\":\"Email\",\"addrTypDesc\":\"Email\"}}]}}},{\"rowidObject\":\"440003        \",\"label\":\"Contacts\",\"hmRelTypCd\":\"Employs\",\"hierarchyCd\":\"Supplier Hierarchy\",\"contacts\":{\"rowidObject\":\"560004        \",\"effectivePeriod\":{},\"label\":\"Contacts\",\"lstNm\":\"infa\",\"prtyBoClassCd\":\"Person\",\"fullNm\":\"multiloginissueuser2 infa\",\"frstNm\":\"multiloginissueuser2\",\"prtlUsrNm\":\"multiloginissueuser2@infa.com\",\"prtlUsrRle\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Portal User Role\",\"roleCode\":\"Supplier Administrators\",\"roleDesc\":\"Supplier Administrators\"},\"ContactElectronicAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"80003         \",\"label\":\"ContactElectronicAddress\",\"etrncAddr\":\"multiloginissueuser2@infa.com\",\"etrncAddrTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Electronic Address Type\",\"addrTyp\":\"Email\",\"addrTypDesc\":\"Email\"}}]}}},{\"rowidObject\":\"440004        \",\"label\":\"Contacts\",\"hmRelTypCd\":\"Employs\",\"hierarchyCd\":\"Supplier Hierarchy\",\"contacts\":{\"rowidObject\":\"560005        \",\"effectivePeriod\":{},\"label\":\"Contacts\",\"lstNm\":\"infa\",\"prtyBoClassCd\":\"Person\",\"fullNm\":\"multiloginissueuser3 infa\",\"frstNm\":\"multiloginissueuser3\",\"prtlUsrNm\":\"multiloginissueuser3@infa.com\",\"prtlUsrRle\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Portal User Role\",\"roleCode\":\"Supplier Administrators\",\"roleDesc\":\"Supplier Administrators\"},\"ContactElectronicAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"80004         \",\"label\":\"ContactElectronicAddress\",\"etrncAddr\":\"multiloginissueuser3@infa.com\",\"etrncAddrTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Electronic Address Type\",\"addrTyp\":\"Email\",\"addrTypDesc\":\"Email\"}}]}}},{\"rowidObject\":\"440005        \",\"label\":\"Contacts\",\"hmRelTypCd\":\"Employs\",\"hierarchyCd\":\"Supplier Hierarchy\",\"contacts\":{\"rowidObject\":\"560006        \",\"effectivePeriod\":{},\"label\":\"Contacts\",\"lstNm\":\"infa\",\"prtyBoClassCd\":\"Person\",\"fullNm\":\"multiloginissueuser4 infa\",\"frstNm\":\"multiloginissueuser4\",\"prtlUsrNm\":\"infallc@mail.com\",\"prtlUsrRle\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Portal User Role\",\"roleCode\":\"Supplier Administrators\",\"roleDesc\":\"Supplier Administrators\"},\"ContactElectronicAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"80005         \",\"label\":\"ContactElectronicAddress\",\"etrncAddr\":\"multiloginissueuser4@infa.com\",\"etrncAddrTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Electronic Address Type\",\"addrTyp\":\"Email\",\"addrTypDesc\":\"Email\"}}]}}}]},\"Status\":{\"link\":[],\"firstRecord\":1,\"recordCount\":5,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"260001        \",\"label\":\"Status\",\"prtyStsVal\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Value\",\"partyStatusValue\":\"Approved\",\"partyStatusValDesc\":\"Approved\"},\"prtyStsTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Type\",\"partyStatusTypeCode\":\"Onboarding Status\",\"partyStatusTypeDesc\":\"Onboarding Status\"}},{\"rowidObject\":\"260002        \",\"label\":\"Status\",\"prtyStsVal\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Value\",\"partyStatusValue\":\"Approved\",\"partyStatusValDesc\":\"Approved\"},\"prtyStsTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Type\",\"partyStatusTypeCode\":\"Onboarding Status\",\"partyStatusTypeDesc\":\"Onboarding Status\"}},{\"rowidObject\":\"260003        \",\"label\":\"Status\",\"prtyStsVal\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Value\",\"partyStatusValue\":\"Approved\",\"partyStatusValDesc\":\"Approved\"},\"prtyStsTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Type\",\"partyStatusTypeCode\":\"Onboarding Status\",\"partyStatusTypeDesc\":\"Onboarding Status\"}},{\"rowidObject\":\"260004        \",\"label\":\"Status\",\"prtyStsVal\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Value\",\"partyStatusValue\":\"Approved\",\"partyStatusValDesc\":\"Approved\"},\"prtyStsTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Type\",\"partyStatusTypeCode\":\"Onboarding Status\",\"partyStatusTypeDesc\":\"Onboarding Status\"}},{\"rowidObject\":\"260005        \",\"label\":\"Status\",\"prtyStsVal\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Value\",\"partyStatusValue\":\"Approved\",\"partyStatusValDesc\":\"Approved\"},\"prtyStsTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Type\",\"partyStatusTypeCode\":\"Onboarding Status\",\"partyStatusTypeDesc\":\"Onboarding Status\"}}]}}}]}";
	private static final String url = "http://localhost:8080/cmx/cs/orcl-SUPPLIER_HUB/Supplier.json?action=query&recordStates=ACTIVE,PENDING&recordsToReturn=100&returnTotal=true&filter=Contacts.contacts.prtlUsrNm='infallc@mail.com'&children=Status.depth=2,Contacts.depth=3";
	private static final String loginResponse = "{\"message\":null,\"interactionId\":null,\"userId\":\"INST.0\",\"username\":\"admin\",\"roleNames\":[],\"passwordExpires\":false,\"passwordExpirationDate\":null,\"externalAuthentication\":false,\"administrator\":true}";
	private static final String ENCRYPTED_PWD = "WHRvm85wC16vQDAg+4Q3sSeTv65QZB1eQxagaoSqjTgWUr1jA3hXEWb73LmDHIOS23589Mddjho1HV5Gnzp9Fk4Oy/sXgz7EVresI8tgH205OQ95t7LRDdgSMwHhN81Ml/NuxXIElTacTHccoBa+DOZHn4VAEfMc54wJ6TBXC0E";
	
	@InjectMocks
	AuthServiceImpl authService;
	
	private HubClient hubClient;
	
	private ConnectionData connectionData;
	
	private ReposUser reposUser;
	
	private AdminLogin adminLogin;
	
	private LoginData loginData;
	
	private ResponseEntity<String> responseEntity;
	
/*	@Mock
	PoolingHttpClientConnectionManager poolingConnectionManager ;
*/	
	@Mock
	private ObjectMapper mapper;
	
	@Mock
	private RestTemplate restTemplate;
	
	@Mock
	private SiperianClient siperianClient;
	
	@Mock
	private AuthenticateResponse response;
	
	@Mock
	private Credentials credentials;
	
	@Mock
	private CacheService cacheService;
	
	@Mock
	private PortalUIService portalUIService;
	
	JsonNode beNode;
	
	@SuppressWarnings("unchecked")
	@Before
	public void setUp() throws Exception {
		hubClient = mock(HubClient.class);
		connectionData = mock(ConnectionData.class);
		authService.setCmxUrl("http://localhost:8080");
		reposUser = mock(ReposUser.class);
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(PortalConfigUtil.class);
		PowerMockito.mockStatic(PortalRestUtil.class);
		adminLogin = mock(AdminLogin.class);
		responseEntity = mock(ResponseEntity.class);
		when(HubClient.getInstance()).thenReturn(hubClient);
		when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
		when(adminLogin.loginUser(any(BaseSecurityCredential.class))).thenReturn(connectionData);
		when(connectionData.getConnectedUser()).thenReturn(reposUser);
		when(PortalConfigUtil.getSecurityPayloadForRest(Mockito.anyString(), Mockito.anyString(), Mockito.anyString())).thenReturn(SECURITY_PAYLOAD);
		HttpHeaders headers = new HttpHeaders();
		headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD,SECURITY_PAYLOAD);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		when(PortalConfigUtil.executeRest(url, HttpMethod.GET, null, headers, restTemplate)).thenReturn(responseEntity);
		when(responseEntity.getStatusCode()).thenReturn(HttpStatus.OK);
		when(responseEntity.getBody()).thenReturn(body);
		loginData = new LoginData();
		loginData.setBeName("Supplier");
		loginData.setOrsId("orcl-SUPPLIER_HUB");
		loginData.setPassword("password");
		loginData.setRecordIdField("rowidObject");
		loginData.setUniqueFieldPath("Contacts.contacts.prtlUsrNm");
		loginData.setUsername("infallc@mail.com");
		loginData.setIsStateEnabled(true);
		Map<String,String> projections = new HashMap<>();
		projections.put("BEPathRole", "Contacts.contacts.prtlUsrRle.roleCode");
		projections.put("BEPathState", "Status.prtyStsVal.partyStatusValue");
		loginData.setProjections(projections);
		beNode = new ObjectMapper().readTree(body);
	}
	
	
	@Test
	public void testSuccessLogin() throws Exception {
		
		AuthenticateRequest authenticateRequest = new AuthenticateRequest();
		List<String> roles = new ArrayList<String>();
		roles.add(PortalRestConstants.ROLE_APP_ADMIN);
		authenticateRequest.setSecurityPayload((PortalRestConstants.PAYLOAD_MDM_SESSION + "sessionId").getBytes());
		when(siperianClient.process(any(AuthenticateRequest.class))).thenReturn(response);
		when(response.getRoleNames()).thenReturn(roles);
		when(connectionData.getConnectedUser()).thenReturn(reposUser);
		when(reposUser.isAdministrator()).thenReturn(true);
		String initialUrl = SCHEME+"://"+HOST+":"+PORT;
		HttpHeaders headers = new HttpHeaders();
		headers.add(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, "ict");
		ResponseEntity<String> responseEntityObj = new ResponseEntity<String>(loginResponse, headers,HttpStatus.OK);
		Mockito.when(mapper.createObjectNode()).thenReturn(new ObjectMapper().createObjectNode());
		Mockito.when(PortalRestUtil.getEncryptedPassword(Mockito.anyString())).thenReturn(ENCRYPTED_PWD);
		Map<String,Object> userData = new HashMap<>();
		userData.put("csrf_token", "06925beb-8be7-47cd-871b-31583a81afde");
		Mockito.when(PortalConfigUtil.executeRest(Mockito.anyString(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(responseEntityObj);
		authService.login("username", "password", "sessionId",false, userData,initialUrl);
		
	}
	
	@Test
	public void testLoginFail() throws AccessException {
		when(reposUser.isAdministrator()).thenReturn(false);
		boolean exception = false;
		try {
			Mockito.when(PortalRestUtil.getEncryptedPassword(Mockito.anyString())).thenReturn(ENCRYPTED_PWD);
			Map<String,Object> userData = new HashMap<>();
			userData.put("csrf_token", "06925beb-8be7-47cd-871b-31583a81afde");
			String initialUrl = SCHEME+"://"+HOST+":"+PORT;
			HttpHeaders headers = new HttpHeaders();
			headers.add(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, "ict");
			ResponseEntity<String> responseEntityObj = new ResponseEntity<String>(loginResponse, headers,HttpStatus.OK);
			Mockito.when(PortalRestUtil.getEncryptedPassword(Mockito.anyString())).thenReturn(ENCRYPTED_PWD);
			Mockito.when(PortalConfigUtil.executeRest(Mockito.anyString(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(responseEntityObj);
			authService.login("username", "password", "sessionId",false,userData,initialUrl);
		}catch(Exception e) {
			exception = true;
		}
		assertTrue(exception);
	}
	
	@Test
	public void testLogout() throws Exception {
		HttpServletRequest request = mock(HttpServletRequest.class);
		HttpHeaders headers = new HttpHeaders();
		headers.add(PortalRestConstants.MDM_CSRF_TOKEN_HEADER, "ict");
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		headers.add(PortalRestConstants.MDM_SESSION_ID_COOKIE,"mdmSessionId");
		PowerMockito.mockStatic(PortalRestUtil.class);
		@SuppressWarnings("unchecked")
		Map<CacheModel, JsonNode> cache = Mockito.mock(Map.class);
		when(PortalRestUtil.getCookieValue(any(HttpServletRequest.class), Mockito.anyString()))
				.thenReturn("mdmSessionId");
		when(PortalRestUtil.getCredentials(Mockito.any(HttpServletRequest.class), Mockito.anyString()))
				.thenReturn(credentials);
		Mockito.when(credentials.getUsername()).thenReturn("username");
		Mockito.when(cacheService.clearCache(Mockito.any(CacheModel.class))).thenReturn(cache);
		doNothing().when(adminLogin).invalidateSession("mdmSessionId");
		Mockito.when(request.getScheme()).thenReturn("http");
		Mockito.when(request.getServerPort()).thenReturn(8080);
		Mockito.when(request.getServerName()).thenReturn("localhost");
		ResponseEntity<String> responseEntityObj = new ResponseEntity<String>(HttpStatus.OK);
		Mockito.when(PortalConfigUtil.executeRest(Mockito.anyString(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(responseEntityObj);
		authService.logout(request, "mdmSessionId","ict");
	}
	
	@Test
	public void testGetUserInfo() throws PortalConfigException, Exception {
		
		HttpServletRequest request = mock(HttpServletRequest.class);
		when(request.getScheme()).thenReturn(SCHEME);
		when(request.getServerName()).thenReturn(HOST);
		when(request.getServerPort()).thenReturn(PORT);
		Mockito.when(mapper.readTree(Mockito.anyString())).thenReturn(beNode);
		Mockito.when(portalUIService.getTrustedAppUser(Mockito.any(), Mockito.any())).thenReturn("admin");
		//Mockito.when(poolingConnectionManager.getMaxPerRoute(Mockito.any(HttpRoute.class))).thenReturn(2);
		//Mockito.doNothing().when(poolingConnectionManager).setMaxPerRoute(Mockito.any(HttpRoute.class), Mockito.anyInt());
		Map<String,Object> userInfo = authService.getUserInfo(loginData, loginData.getOrsId(), "1");
		assertEquals((String)userInfo.get("recordId"),"560001        ");
		assertEquals((String)userInfo.get("roleCode"),"Supplier Administrators");
		assertEquals((String)userInfo.get("partyStatusValue"),"Approved");
		
	}
	
	@Test
	public void testAuthenticate() throws Exception {
		
		Credentials credentials = new Credentials("mdmsessionId".getBytes());
		AuthenticateRequest authenticateRequest = new AuthenticateRequest();
		authenticateRequest.setSecurityPayload("mdmsessionId".getBytes());
		when(siperianClient.process(any(AuthenticateRequest.class))).thenReturn(response);
		authService.authenticate(credentials);
		verify(siperianClient, atLeastOnce()).process(any(AuthenticateRequest.class));
	}
	
	@Test
	public void testAuthoriseRuntimeUser() throws Exception {
		
		Credentials credentials = new Credentials("mdmsessionId".getBytes());
		AuthenticateRequest authenticateRequest = new AuthenticateRequest();
		authenticateRequest.setSecurityPayload("mdmsessionId".getBytes());
		when(siperianClient.process(any(AuthenticateRequest.class))).thenReturn(response);
		List<String> roles = new ArrayList<String>();
		roles.add(PortalRestConstants.ROLE_APP_ADMIN);
		when(response.getRoleNames()).thenReturn(roles);
		when(response.isAdministrator()).thenReturn(false);
		assertTrue(authService.authorise(credentials, roles));
	}
	
	@Test
	public void testAuthoriseConfigUser() throws Exception {
		
		Credentials credentials = new Credentials("mdmsessionId".getBytes());
		AuthenticateRequest authenticateRequest = new AuthenticateRequest();
		authenticateRequest.setSecurityPayload("mdmsessionId".getBytes());
		when(siperianClient.process(any(AuthenticateRequest.class))).thenReturn(response);
		List<String> roles = new ArrayList<String>();
		when(response.getRoleNames()).thenReturn(roles);
		when(response.isAdministrator()).thenReturn(true);
		assertTrue(authService.authorise(credentials, roles));
	}
	
}
