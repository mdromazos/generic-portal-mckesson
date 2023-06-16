package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.sql.DataSource;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.MultiDataSource;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;
import com.informatica.mdm.portal.metadata.model.InitiateEmailResponse;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.repository.PortalRepo;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.informatica.mdm.portal.metadata.util.QueryComponent;
import com.informatica.mdm.portal.metadata.util.QueryWrapper;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@PrepareForTest({PortalConfigUtil.class})
public class ChangePasswordServiceImplTest 
{
	@Mock
	private HttpServletRequest request;
	
	@Mock
	MultiDataSource multiDataSource;
	
	@Mock
	JdbcTemplate jdbcTemplate;

	@Mock
	DataSource dataSource;

	@Mock
	Connection connection;
	
	@Mock
	Credentials credentials;
	
	@Mock
	PortalRepo portalRepo;
	
	@Mock 
	PortalUIService portalUIService;
	
	@Mock
	PortalRestConfig restConfig;
	
	@Mock
	RestTemplate restTemplate;
	
	@Mock
	ResponseEntity<String> responseNode;
	
	@Mock
	ObjectMapper mapper;
	
	@InjectMocks
	ChangePasswordServiceImpl changePasswordService;
	
	List<Map<String,Object>> resetPassTab;
	QueryWrapper queryWrapper;
	JsonNode runtimeConfigNode, filterBeNode;
	
	ObjectMapper objectMapper;
	
	@Mock
	EmailNotificationService emailNotificationService;
	
	private static final String runtimeConfig = "[{\r\n" + 
			"		\"name\": \"Session Section\",\r\n" + 
			"		\"desc\": \"Session Section\",\r\n" + 
			"		\"configuration\": [{\r\n" + 
			"				\"key\": \"session.timeout\",\r\n" + 
			"				\"desc\": \"Server Idle Time\",\r\n" + 
			"				\"value\": 420,\r\n" + 
			"				\"type\": \"Integer\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}, {\r\n" + 
			"				\"key\": \"session.timeout.warning\",\r\n" + 
			"				\"desc\": \"Timeout Warning Before Logout\",\r\n" + 
			"				\"value\": 60,\r\n" + 
			"				\"type\": \"Integer\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}\r\n" + 
			"		]\r\n" + 
			"	}, {\r\n" + 
			"		\"name\": \"Login Section\",\r\n" + 
			"		\"desc\": \"Login Section\",\r\n" + 
			"		\"configuration\": [{\r\n" + 
			"				\"key\": \"uniqueFieldPath\",\r\n" + 
			"				\"desc\": \"Unique Field Projection\",\r\n" + 
			"				\"value\": \"Contacts.contacts.prtlUsrNm\",\r\n" + 
			"				\"type\": \"String\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}, {\r\n" + 
			"				\"key\": \"recordIdField\",\r\n" + 
			"				\"desc\": \"Record Id\",\r\n" + 
			"				\"value\": \"rowidObject\",\r\n" + 
			"				\"type\": \"String\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}, {\r\n" + 
			"				\"key\": \"BEPathRole\",\r\n" + 
			"				\"desc\": \"BE Role Projections\",\r\n" + 
			"				\"value\": \"Contacts.contacts.prtlUsrRle.roleCode\",\r\n" + 
			"				\"type\": \"String\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}, {\r\n" + 
			"				\"key\": \"BEPathState\",\r\n" + 
			"				\"desc\": \"BE State Projections\",\r\n" + 
			"				\"value\": \"Status.prtyStsVal.partyStatusValue\",\r\n" + 
			"				\"type\": \"String\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}\r\n" + 
			"		]\r\n" + 
			"	}, {\r\n" + 
			"		\"name\": \"Password Section\",\r\n" + 
			"		\"desc\": \"Password Section\",\r\n" + 
			"		\"configuration\": [{\r\n" + 
			"				\"key\": \"passwordResetLinkExpiry\",\r\n" + 
			"				\"desc\": \"Password Reset Link Expiry Time, format: 1:5:5\",\r\n" + 
			"				\"value\": \"1:0:0\",\r\n" + 
			"				\"type\": \"String\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}, {\r\n" + 
			"				\"key\": \"passwordPolicy\",\r\n" + 
			"				\"desc\": \"Portal Password Policy\",\r\n" + 
			"				\"value\": \"Valid passwords must be between 4 and 9 characters in length\",\r\n" + 
			"				\"type\": \"String\",\r\n" + 
			"				\"isMandatory\": true\r\n" + 
			"			}\r\n" + 
			"		]\r\n" + 
			"	}\r\n" + 
			"]\r\n" + 
			"";
	
	private static final String SECURITY_PAYLOAD = "infaPortal/admin===3846373930463144313733394346394141384145384242413439323842343646423731333642373930313945433239393032363543463044313636323142314439333434333642333835304245413433343843343138314339304535433143324434454344443";
	
	private static final String BE_DATA = "{\"link\":[{\"href\":\"http://inwasdb201:8080/cmx/file/inwasdb201-sip104-RC3_ORS/IMAGE/Supplier.svg/content\",\"rel\":\"icon\"}],\"rowidObject\":\"8             \",\"effectivePeriod\":{},\"label\":\"Supplier qwerty\",\"fullNm\":\"qwerty\",\"prtyBoClassCd\":\"Organization\",\"onlnSellFlg\":\"Y\",\"extId\":\"143\",\"draftInd\":\"N\",\"countryOfIncorporation\":{\"rowidObject\":\"40228         \",\"label\":\"Lookup Country\",\"countryCode\":\"US\",\"countryDesc\":\"United States\"},\"ProductsAndServices\":{\"link\":[],\"firstRecord\":1,\"recordCount\":2,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"12            \",\"label\":\"Products And Services\",\"prdctSrvcCd\":{\"rowidObject\":\"3             \",\"label\":\"Lookup Products and Services\",\"parentProductServiceCode\":\"101\",\"productAndServiceCode\":\"102\",\"productAndServiceDesc\":\"Canon\"},\"ProductServiceAnswers\":{\"link\":[],\"firstRecord\":1,\"recordCount\":2,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"10            \",\"label\":\"Product Service Answers\",\"answer\":\"ghgh\",\"question\":{\"rowidObject\":\"3             \",\"label\":\"Lookup Questions\",\"questionDesc\":\"text?\",\"questionCode\":\"03\",\"activeInd\":\"Y\",\"answerType\":\"Text\",\"mandatoryInd\":\"Y\"}},{\"rowidObject\":\"11            \",\"label\":\"Product Service Answers\",\"answer\":\"n\",\"question\":{\"rowidObject\":\"4             \",\"label\":\"Lookup Questions\",\"questionDesc\":\"lookup\",\"questionCode\":\"04\",\"activeInd\":\"Y\",\"answerType\":\"Lookup\",\"lookupOptions\":\"\\\"y\\\",\\\"n\\\"\",\"mandatoryInd\":\"N\"}}]}},{\"rowidObject\":\"13            \",\"label\":\"Products And Services\",\"prdctSrvcCd\":{\"rowidObject\":\"7             \",\"label\":\"Lookup Products and Services\",\"parentProductServiceCode\":\"104\",\"productAndServiceCode\":\"106\",\"productAndServiceDesc\":\"Sony\"},\"ProductServiceAnswers\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"12            \",\"label\":\"Product Service Answers\",\"answer\":\"j\",\"question\":{\"rowidObject\":\"7             \",\"label\":\"Lookup Questions\",\"questionDesc\":\"lookup\",\"questionCode\":\"08\",\"activeInd\":\"Y\",\"answerType\":\"Lookup\",\"lookupOptions\":\"\\\"j\\\",\\\"l\\\"\",\"mandatoryInd\":\"N\"}}]}}]},\"PortalStatus\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"3             \",\"label\":\"Portal Status\",\"prtyStsVal\":\"Approved\",\"prtyStsTyp\":\"Onboarding Status\"}]},\"PrimaryAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"3             \",\"label\":\"Primary Address\",\"hmRelTypCd\":\"Organization Address\",\"hierarchyCd\":\"Supplier Hierarchy\",\"prmryInd\":\"Y\",\"pstlAddrTyp\":\"Shipping\",\"PostalAddress\":{\"rowidObject\":\"6             \",\"label\":\"Postal Address\",\"pstlAddrBoClassCd\":\"Addr\",\"vldtnMsg\":\"Valid Address\",\"enrchdInd\":\"N\",\"addrRsltnCd\":\"00000000000000000000\",\"rsltPrcntg\":\"100.00\",\"pstlCd\":\"94063-5596\",\"county\":\"SAN MATEO\",\"addrLn1\":\"2100 SEAPORT BLVD\",\"city\":\"REDWOOD CITY\",\"cntryCd\":{\"rowidObject\":\"40228         \",\"label\":\"Lookup Country\",\"countryCode\":\"US\",\"countryDesc\":\"United States\"},\"state\":{\"rowidObject\":\"6             \",\"label\":\"Lookup State\",\"stateCode\":\"CA\",\"stateDesc\":\"California\"}}}]},\"AlternateId\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"3             \",\"label\":\"Alternate Id\",\"altIdVal\":\"123456789\",\"altIdTyp\":{\"rowidObject\":\"40002         \",\"label\":\"Lookup Alternate Id Type\",\"idTyp\":\"DUNS ID\",\"idTypDesc\":\"Duns Id Number\"}}]},\"DunsNumber\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"3             \",\"label\":\"DUNS Number\",\"DunsNumber\":\"123456789\",\"idType\":\"DUNS ID\"}]},\"Contacts\":{\"link\":[],\"firstRecord\":1,\"recordCount\":2,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"4             \",\"label\":\"Contacts\",\"hmRelTypCd\":\"Employs\",\"hierarchyCd\":\"Supplier Hierarchy\",\"contacts\":{\"rowidObject\":\"9             \",\"effectivePeriod\":{},\"label\":\"Contacts\",\"lstNm\":\"Singh\",\"prtyBoClassCd\":\"Person\",\"fullNm\":\"Yuvraj Singh\",\"frstNm\":\"Yuvraj\",\"prtlUsrNm\":\"yusingh@informatica.com\",\"prtlUsrInd\":\"Y\",\"prtlUsrRle\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Portal User Role\",\"roleCode\":\"Supplier Administrators\",\"roleDesc\":\"Supplier Administrators\"},\"ContactElectronicAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"5             \",\"label\":\"Electronic Address\",\"etrncAddr\":\"yusingh@informatica.com\",\"hygnSts\":\"Safe US\",\"dfltInd\":\"Y\",\"netPrtctCd\":\"N\",\"etrncAddrTyp\":{\"rowidObject\":\"40001         \",\"label\":\"Lookup Electronic Address Type\",\"addrTyp\":\"Email\",\"addrTypDesc\":\"Email\"}}]},\"ContactPrimaryEmailAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"5             \",\"label\":\"Contact Primary Address\",\"email\":\"yusingh@informatica.com\",\"hygnSts\":\"Safe US\",\"dfltInd\":\"Y\",\"netPrtctCd\":\"N\",\"etrncAddrTyp\":\"Email\"}]}}},{\"rowidObject\":\"5             \",\"label\":\"Contacts\",\"hmRelTypCd\":\"Employs\",\"hierarchyCd\":\"Supplier Hierarchy\",\"contacts\":{\"rowidObject\":\"10            \",\"effectivePeriod\":{},\"label\":\"Contacts\",\"lstNm\":\"Chopraaa\",\"prtyBoClassCd\":\"Person\",\"fullNm\":\"Radhikaaaaa Chopraaa\",\"frstNm\":\"Radhikaaaaa\",\"prtlUsrNm\":\"radhikachopra85@gmail.com\",\"prtlUsrInd\":\"Y\",\"prtlUsrRle\":{\"rowidObject\":\"2             \",\"label\":\"Lookup Portal User Role\",\"roleCode\":\"Supplier Users\",\"roleDesc\":\"Supplier Users\"},\"ContactElectronicAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"6             \",\"label\":\"Electronic Address\",\"etrncAddr\":\"radhikachopra85@gmail.com\",\"hygnSts\":\"Safe US\",\"dfltInd\":\"Y\",\"netPrtctCd\":\"N\",\"etrncAddrTyp\":{\"rowidObject\":\"40001         \",\"label\":\"Lookup Electronic Address Type\",\"addrTyp\":\"Email\",\"addrTypDesc\":\"Email\"}}]},\"ContactPrimaryEmailAddress\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"6             \",\"label\":\"Contact Primary Address\",\"email\":\"radhikachopra85@gmail.com\",\"hygnSts\":\"Safe US\",\"dfltInd\":\"Y\",\"netPrtctCd\":\"N\",\"etrncAddrTyp\":\"Email\"}]}}}]},\"Status\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"3             \",\"label\":\"Status\",\"prtyStsVal\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Value\",\"partyStatusValue\":\"Approved\",\"partyStatusValDesc\":\"Approved\"},\"prtyStsTyp\":{\"rowidObject\":\"1             \",\"label\":\"Lookup Party Status Type\",\"partyStatusTypeCode\":\"Onboarding Status\",\"partyStatusTypeDesc\":\"Onboarding Status\"}}]},\"Address\":{\"link\":[],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":10,\"searchToken\":\"multi\",\"item\":[{\"rowidObject\":\"3             \",\"label\":\"Address\",\"hmRelTypCd\":\"Organization Address\",\"hierarchyCd\":\"Supplier Hierarchy\",\"prmryInd\":\"Y\",\"pstlAddrTyp\":{\"rowidObject\":\"40006         \",\"label\":\"Lookup Postal Address Type\",\"addressTypeDesc\":\"Shipping\",\"addressType\":\"Shipping\"},\"PostalAddress\":{\"rowidObject\":\"6             \",\"label\":\"Postal Address\",\"pstlAddrBoClassCd\":\"Addr\",\"vldtnMsg\":\"Valid Address\",\"enrchdInd\":\"N\",\"addrRsltnCd\":\"00000000000000000000\",\"rsltPrcntg\":\"100.00\",\"pstlCd\":\"94063-5596\",\"county\":\"SAN MATEO\",\"addrLn1\":\"2100 SEAPORT BLVD\",\"city\":\"REDWOOD CITY\",\"cntryCd\":{\"rowidObject\":\"40228         \",\"label\":\"Lookup Country\",\"countryCode\":\"US\",\"countryDesc\":\"United States\"},\"state\":{\"rowidObject\":\"6             \",\"label\":\"Lookup State\",\"stateCode\":\"CA\",\"stateDesc\":\"California\"}}}]}}";
	
	
	@Before
    public void setUp() throws Exception 
	{
		MockitoAnnotations.initMocks(this);
		changePasswordService.setCmxUrl("http://localhost:8080/");
		PowerMockito.mockStatic(PortalConfigUtil.class);
        objectMapper = new ObjectMapper();
		Map<String, Object> resetPassRow = new HashMap<>();
		resetPassRow.put(DatabaseConstants.COLUMN_USER_ID, "testuser");
		resetPassRow.put(DatabaseConstants.COLUMN_HASH_VALUE, "121212");
		resetPassRow.put(DatabaseConstants.COLUMN_MILLISEC, "121212");
		resetPassRow.put(DatabaseConstants.COLUMN_EMAIL_ID, "testuser@mail.com");
		
		List<Map<String,Object>> resetPassTab = new ArrayList<>();
		resetPassTab.add(resetPassRow);
		
		QueryComponent userNameFilter = new QueryComponent(DatabaseConstants.COLUMN_HASH_VALUE, "121212");
		List<QueryComponent> filter = new ArrayList<QueryComponent>();
		filter.add(userNameFilter);
		
		List<String> projections = new ArrayList<String>();
		projections.add(DatabaseConstants.COLUMN_USER_ID);
		projections.add(DatabaseConstants.COLUMN_HASH_VALUE);
		projections.add(DatabaseConstants.COLUMN_MILLISEC);
		projections.add(DatabaseConstants.COLUMN_EMAIL_ID);
		
		queryWrapper = new QueryWrapper();
		queryWrapper.setTableName(DatabaseConstants.TABLE_FORGOT_PASSWORD_LINK_EXPIRY);
		queryWrapper.setProjections(projections);
		queryWrapper.setFilter(filter);
		Mockito.when(multiDataSource.getCurrentJdbcTemplate(Mockito.any(DataSourceModel.class))).thenReturn(jdbcTemplate);
		Mockito.when(jdbcTemplate.getDataSource()).thenReturn(dataSource);
		Mockito.when(dataSource.getConnection()).thenReturn(connection);
		Mockito.doNothing().when(portalRepo).setJdbcTemplate(jdbcTemplate);
		Mockito.when(portalRepo.isTableExist(DatabaseConstants.TABLE_FORGOT_PASSWORD_LINK_EXPIRY)).thenReturn(true);
		Mockito.when(portalRepo.getPortalDetails(Mockito.any(QueryWrapper.class))).thenReturn(resetPassTab);
		runtimeConfigNode = objectMapper.readTree(runtimeConfig);
		filterBeNode = objectMapper.readTree(BE_DATA);
		
	}
	
	
	@Test
	public void testChangePassword() throws Exception
	{
		String orsId = "orcl-Supplier";
		String mdmSessionId = "mdmSessionId";
		String changePassJson = "{\"oldPassword\" : \"test11\", \"newPassword\" : \"test11\"}";
		InitiateEmailResponse initiateEmailRes = new InitiateEmailResponse();
		initiateEmailRes.setStatus("Success");
		
		Mockito.when(request.getScheme()).thenReturn("http");
		Mockito.when(request.getServerName()).thenReturn("localhost");
		Mockito.when(request.getServerPort()).thenReturn(8080);
		Mockito.when(PortalConfigUtil.getSecurityPayloadForRest(PortalServiceConstants.TRUSTED_APP + "/" + "testuser", null, "changePasswordUsingPOST")).thenReturn(SECURITY_PAYLOAD);
		
		HttpHeaders headers = new HttpHeaders();
		String authCookie = ExternalConfigConstants.AUTH_MDM_ATTRIBUTE + "=" + mdmSessionId;
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, "ict");
		headers.add(ExternalConfigConstants.AUTH_COOKIE, authCookie);
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		
		Mockito.when(PortalConfigUtil.executeRest("http://localhost:8080/cmx/user/password", HttpMethod.POST,
				changePassJson, headers, restTemplate)).thenReturn(responseNode);
		Mockito.when(responseNode.getStatusCode()).thenReturn(HttpStatus.OK);
		Mockito.when(portalUIService.getRuntimeConfig(null, "1", restConfig)).thenReturn(runtimeConfigNode);
		assertNotNull(changePasswordService.changePassword(credentials, mdmSessionId, orsId, "1", changePassJson, request,"ict"));
		changePassJson = "{\"newPassword\" : \"test11\",\"ForgotPwdlinkHashValue\" : \"577a347022ae49f4902cc9de45e1e0a8\", \"ChangePasswordIsNewUser\":true}";
		headers.clear();
		headers.add("X-MDM-AUTH-PAYLOAD", "infaPortal/admin===3846373930463144313733394346394141384145384242413439323842343646423731333642373930313945433239393032363543463044313636323142314439333434333642333835304245413433343843343138314339304535433143324434454344443");
		headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
		Mockito.when(PortalConfigUtil.executeRest(Mockito.anyString(), Mockito.any(HttpMethod.class),
				Mockito.anyString(), Mockito.any(HttpHeaders.class), Mockito.any(RestTemplate.class))).thenReturn(responseNode);
		Mockito.when(emailNotificationService.sendEmail(Mockito.anyString(), Mockito.isNull(), Mockito.anyString(),
				Mockito.any(), Mockito.anyString())).thenReturn(initiateEmailRes);
		assertNotNull(changePasswordService.changePassword(credentials, mdmSessionId, orsId, null, changePassJson, request,"ict"));
	}
	
	@Test
	public void testFilterBENode() {
		
		changePasswordService = Mockito.spy(ChangePasswordServiceImpl.class);
		MockitoAnnotations.initMocks(this);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(mapper.createArrayNode()).thenAnswer(new Answer<ArrayNode>() {
			public ArrayNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createArrayNode();
		     }
		});
		boolean flag = changePasswordService.filterByUniqueField("Contacts.contacts.ContactElectronicAddress.etrncAddr", filterBeNode, "yusingh@informatica.com", 0);
		assertTrue(flag);
	}
}
