package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.any;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.ecore.validator.EcoreValidator;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.exception.PortalAlreadyExistException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.SAMLException;
import com.informatica.mdm.portal.metadata.model.CacheModel;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.service.CacheService;
import com.informatica.mdm.portal.metadata.service.EcoreMapperService;
import com.informatica.mdm.portal.metadata.service.ExternalConfigService;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.JsonUtil;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sif.message.Field;
import com.siperian.sif.message.Record;
import com.siperian.sif.message.mrm.DeleteRequest;
import com.siperian.sif.message.mrm.DeleteResponse;
import com.siperian.sif.message.mrm.SearchQueryRequest;
import com.siperian.sif.message.mrm.SearchQueryResponse;
import com.siperian.sif.client.SiperianClient;

@RunWith(PowerMockRunner.class)
@PrepareForTest({PortalConfigUtil.class,SiperianClient.class})
@PowerMockIgnore("javax.management.*")
public class PortalConfigServiceImplTest {

	@Mock
	EcorePortalServiceImpl metaModelService;
	
	@Mock
	PortalPersistenceServiceImpl portalService;
	
	@Mock
	ExternalConfigService externalConfigService;
	
	@Mock
	EcoreMapperService mapperService;
	
	@Mock
	EcoreValidator validator;
	
	@Mock
	ObjectMapper mapper;
	
	@Mock
	Credentials credentials;
	
	@Mock
	JsonNode existingPortalNode;
	
	ObjectNode portalObjectNode;
	
	@Mock
	ArrayNode portalArrayNode;
	
	@Mock
	RestTemplate restTemplate;
	
	@Mock
	ResponseEntity<JsonNode> externalMetadataResponse;
	
	@Mock
	ResponseEntity<JsonNode> beViewListResponse;
	
	@Mock
	PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver;
	
	@Mock
	Resource resource, samlresource;
	
	@Mock
	private Properties errorCodeProperties;
	
	@Mock
	Map<CacheModel, JsonNode> externalConfigCache;
	
	@Mock
	CacheService cacheService;
	
	SiperianClient sipClient = null;
	
	PortalRestConfig restConfig = null; 
	
	@InjectMocks
	PortalConfigServiceImpl portalConfigServiceImpl;
	
	
	String version = StringUtils.join("{", "\"", PortalMetadataContants.PORTAL_VERSION, "\"", ":\"1\",", "\"", PortalMetadataContants.PORTAL_ID, "\"", ":\"1\"}");
	JsonNode versionNode, portalNode, portalHeaderNode, portalChildNode, portalGrandChildNode, samlConfigNode, runtimeConfigNode,runtimeWithsamlConfigNode, localisationNode,portalConfigNode,searchResNode,emptySearchResNode;
	ObjectMapper objectMapper;
	private static final String ICT = "d09be064ace8347FNBdfa111ae6b5aeb50c0TewA78bce55d0e6f1855a6d090e307b";
	
	private static final String PAGE_NODE_VALUE = "{\"name\":\"freddieKeugerPage\",\"title\":\"first\",\"type\":true,\"accessType\":0,\"layout\":{\"sections\":[{\"displayIcon\":\"icon image\",\"isDefault\":false,\"orientation\":\"orien\",\"customStyle\":\"custom-style\",\"backgroundColor\":\"bg-color\",\"containers\":[{\"content\":\"container\",\"style\":{\"width\":1}}]}]}}";
	private static final String HEADER_NODE_VALUE = "{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"}";
	private static final String PAGES_ARRAY_NODE = "[{\"id\":\"2\",\"name\":\"moanaPage\"},{\"id\":\"3\",\"name\":\"neemoPage\"},{\"id\":\"4\",\"name\":\"freddiePage\"}]";
	private static final String PORTAL_NODE = "{\"portalName\":\"Supplier Portal\",\"status\":\"Stopped\",\"isStateEnabled\":true,\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\"}";
	private static final String PAGE_NODE_VALUE2 = "{\"name\":\"freddieKeugerPage\",\"title\":\"second\",\"type\":true,\"accessType\":0,\"layout\":{\"sections\":[{\"title\":\"section 1\",\"name\":\"section1\",\"displayIcon\":\"icon image\",\"isDefault\":true,\"orientation\":\"orien\",\"customStyle\":\"custom-style\",\"backgroundColor\":\"bg-color\",\"containers\":[{\"content\":\"container\",\"style\":{\"width\":1}}]}]}}";
	private static final String beViewLookup = "{\"link\":[],\"firstRecord\":1,\"pageSize\":10,\"item\":[{\"operations\":{\"read\":{\"allowed\":true},\"search\":{\"allowed\":false},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"objectType\":\"ENTITY\",\"timeline\":false,\"viewOf\":\"ProductRelatedQuestions\",\"object\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/ProductRelatedQuestionsView.json?action=meta\",\"rel\":\"entity\"}],\"field\":[{\"name\":\"qstn\",\"label\":\"Question\",\"dataType\":\"String\",\"length\":255,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"actvInd\",\"label\":\"Active Indicator\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupFlag.json?action=list&order=flgDesc\",\"rel\":\"list\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupFlag.json?action=list&order=flgDesc&idlabel=flgCd%3AflgDesc\",\"rel\":\"lookup\"}],\"object\":\"LookupFlag\",\"key\":\"flgCd\",\"value\":\"flgDesc\"}},{\"name\":\"ansTyp\",\"label\":\"Answer Type\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupAnswerType.json?action=list&order=ansTypCdDesc&idlabel=ansTypCd%3AansTypCdDesc\",\"rel\":\"lookup\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupAnswerType.json?action=list&order=ansTypCdDesc\",\"rel\":\"list\"}],\"object\":\"LookupAnswerType\",\"key\":\"ansTypCd\",\"value\":\"ansTypCdDesc\"}},{\"name\":\"consolidationInd\",\"label\":\"Consolidation Ind\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"creator\",\"label\":\"Creator\",\"dataType\":\"String\",\"length\":50,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"interactionId\",\"label\":\"Interaction Id\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"updatedBy\",\"label\":\"Updated By\",\"dataType\":\"String\",\"length\":50,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"lastUpdateDate\",\"label\":\"Last Update Date\",\"dataType\":\"Date\",\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"lastRowidSystem\",\"label\":\"Last Rowid System\",\"dataType\":\"String\",\"length\":14,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"dirtyIndicator\",\"label\":\"Dirty Indicator\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"deletedBy\",\"label\":\"Deleted By\",\"dataType\":\"String\",\"length\":50,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"deletedInd\",\"label\":\"Deleted Indicator\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"hubStateInd\",\"label\":\"Hub State Ind\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"deletedDate\",\"label\":\"Deleted Date\",\"dataType\":\"Date\",\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"rowidObject\",\"label\":\"Rowid Object\",\"dataType\":\"String\",\"length\":14,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"cmDirtyInd\",\"label\":\"Content metadata dirty Ind\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"createDate\",\"label\":\"Create Date\",\"dataType\":\"Date\",\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"key\",\"dataType\":\"Key\",\"length\":0,\"totalDigits\":0,\"fractionDigits\":0,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":false,\"sortable\":false}],\"name\":\"ProductRelatedQuestionsView\",\"label\":\"Product Related Questions\",\"many\":false}},{\"operations\":{\"read\":{\"allowed\":true},\"search\":{\"allowed\":true},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"objectType\":\"ENTITY\",\"timeline\":false,\"viewOf\":\"Supplier\",\"object\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/SupplierView.json?action=meta\",\"rel\":\"entity\"}],\"field\":[{\"name\":\"fullNm\",\"label\":\"Full Name\",\"dataType\":\"String\",\"length\":100,\"required\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"dbaNm\",\"label\":\"Doing Business As Name\",\"dataType\":\"String\",\"length\":100,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"lglFrm\",\"label\":\"Legal Form\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc&idlabel=legalFormCode%3AlegalFormDesc\",\"rel\":\"lookup\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupLegalForm.json?action=list&order=legalFormDesc\",\"rel\":\"list\"}],\"object\":\"LookupLegalForm\",\"key\":\"legalFormCode\",\"value\":\"legalFormDesc\"}},{\"name\":\"naicsCd\",\"label\":\"Naics Code\",\"dataType\":\"String\",\"length\":20,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"sicCd\",\"label\":\"Sic Code\",\"dataType\":\"String\",\"length\":20,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"indstryTyp\",\"label\":\"Industry Type\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupIndustryType.json?action=list&order=indstryTypDesc\",\"rel\":\"list\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupIndustryType.json?action=list&order=indstryTypDesc&idlabel=indstryTypCd%3AindstryTypDesc\",\"rel\":\"lookup\"}],\"object\":\"LookupIndustryType\",\"key\":\"indstryTypCd\",\"value\":\"indstryTypDesc\"}},{\"name\":\"bsnsTyp\",\"label\":\"Business Type\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupBusinessType.json?action=list&order=businessTypeDesc\",\"rel\":\"list\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupBusinessType.json?action=list&order=businessTypeDesc&idlabel=businessTypeCode%3AbusinessTypeDesc\",\"rel\":\"lookup\"}],\"object\":\"LookupBusinessType\",\"key\":\"businessTypeCode\",\"value\":\"businessTypeDesc\"}},{\"name\":\"numOfEmp\",\"label\":\"Number Of Employees\",\"dataType\":\"Integer\",\"length\":38,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"ownrshpTyp\",\"label\":\"Ownership Type\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupOwnershipType.json?action=list&order=ownershipTypeDesc\",\"rel\":\"list\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupOwnershipType.json?action=list&order=ownershipTypeDesc&idlabel=ownershipTypeCode%3AownershipTypeDesc\",\"rel\":\"lookup\"}],\"object\":\"LookupOwnershipType\",\"key\":\"ownershipTypeCode\",\"value\":\"ownershipTypeDesc\"}},{\"name\":\"yrOfEstblshmnt\",\"label\":\"Year Of Establishment\",\"dataType\":\"Integer\",\"length\":38,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"tckrSymbl\",\"label\":\"Ticker Symbol\",\"dataType\":\"String\",\"length\":50,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"exchngNm\",\"label\":\"Exchange Name\",\"dataType\":\"String\",\"length\":100,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"pymntMthd\",\"label\":\"Payment Method\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupPaymentMethod.json?action=list&order=pymntMthdDesc&idlabel=pymntMthdCd%3ApymntMthdDesc\",\"rel\":\"lookup\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupPaymentMethod.json?action=list&order=pymntMthdDesc\",\"rel\":\"list\"}],\"object\":\"LookupPaymentMethod\",\"key\":\"pymntMthdCd\",\"value\":\"pymntMthdDesc\"}},{\"name\":\"crncy\",\"label\":\"Currency\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupCurrency.json?action=list&order=currencyDesc\",\"rel\":\"list\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupCurrency.json?action=list&order=currencyDesc&idlabel=currencyCode%3AcurrencyDesc\",\"rel\":\"lookup\"}],\"object\":\"LookupCurrency\",\"key\":\"currencyCode\",\"value\":\"currencyDesc\"}},{\"name\":\"splrTyp\",\"label\":\"Supplier Type\",\"dataType\":\"lookup\",\"readOnly\":false,\"required\":false,\"system\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true,\"lookup\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupSupplierType.json?action=list&order=splrTypDesc&idlabel=splrTyp%3AsplrTypDesc\",\"rel\":\"lookup\"},{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/LookupSupplierType.json?action=list&order=splrTypDesc\",\"rel\":\"list\"}],\"object\":\"LookupSupplierType\",\"key\":\"splrTyp\",\"value\":\"splrTypDesc\"}},{\"name\":\"onlnCtlgFlg\",\"label\":\"Online Catalog Flag\",\"dataType\":\"Boolean\",\"length\":0,\"totalDigits\":0,\"fractionDigits\":0,\"trust\":false,\"applyNullValues\":false,\"filterable\":false,\"sortable\":false},{\"name\":\"onlnSellFlg\",\"label\":\"Online Sell Flag\",\"dataType\":\"Boolean\",\"length\":0,\"totalDigits\":0,\"fractionDigits\":0,\"trust\":false,\"applyNullValues\":false,\"filterable\":false,\"sortable\":false},{\"name\":\"extId\",\"label\":\"External Identifier\",\"dataType\":\"String\",\"length\":50,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"imageUrl\",\"label\":\"Image URL\",\"dataType\":\"String\",\"length\":255,\"required\":false,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"consolidationInd\",\"label\":\"Consolidation Ind\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"creator\",\"label\":\"Creator\",\"dataType\":\"String\",\"length\":50,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"interactionId\",\"label\":\"Interaction Id\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"updatedBy\",\"label\":\"Updated By\",\"dataType\":\"String\",\"length\":50,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"lastUpdateDate\",\"label\":\"Last Update Date\",\"dataType\":\"Date\",\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"lastRowidSystem\",\"label\":\"Last Rowid System\",\"dataType\":\"String\",\"length\":14,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"dirtyIndicator\",\"label\":\"Dirty Indicator\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"deletedBy\",\"label\":\"Deleted By\",\"dataType\":\"String\",\"length\":50,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"deletedInd\",\"label\":\"Deleted Indicator\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"hubStateInd\",\"label\":\"Hub State Ind\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"deletedDate\",\"label\":\"Deleted Date\",\"dataType\":\"Date\",\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"rowidObject\",\"label\":\"Rowid Object\",\"dataType\":\"String\",\"length\":14,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"cmDirtyInd\",\"label\":\"Content metadata dirty Ind\",\"dataType\":\"Integer\",\"length\":38,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"createDate\",\"label\":\"Create Date\",\"dataType\":\"Date\",\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":true,\"sortable\":true},{\"name\":\"key\",\"dataType\":\"Key\",\"length\":0,\"totalDigits\":0,\"fractionDigits\":0,\"readOnly\":true,\"system\":true,\"trust\":false,\"applyNullValues\":false,\"filterable\":false,\"sortable\":false}],\"name\":\"SupplierView\",\"label\":\"Supplier\",\"many\":false}},{\"operations\":{\"read\":{\"allowed\":true},\"search\":{\"allowed\":false},\"create\":{\"allowed\":true},\"update\":{\"allowed\":true},\"merge\":{\"allowed\":false},\"delete\":{\"allowed\":true},\"unmerge\":{\"allowed\":false}},\"objectType\":\"ENTITY\",\"timeline\":false,\"viewOf\":\"Supplier\",\"object\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/ProductRelatedQuestionsView.json?action=meta\",\"rel\":\"entity\"}],\"name\":\"ProductRelatedQuestionsView\",\"label\":\"Product Related Questions\",\"many\":false}}]}";
	private static final String runtimeConfig = "[{\"name\":\"Login Section\",\"desc\":\"Login Section\",\"configuration\":[{\"key\":\"uniqueFieldPath\",\"desc\":\"uniqueFieldPath\",\"value\":\"Contacts.contacts.prtlUsrNm\",\"type\":\"String\"},{\"key\":\"recordIdField\",\"desc\":\"recordIdField\",\"value\":\"rowidObject\",\"type\":\"String\"}]},{\"name\":\"Session Section\",\"desc\":\"Session Settings\",\"label\":\"Session Settings\",\"configuration\":[{\"key\":\"session.timeout\",\"desc\":\"Number of minutes to wait before an idle session times out.\",\"label\":\"Session Timeout Interval\",\"value\":420,\"type\":\"Integer\",\"isMandatory\":true},{\"key\":\"session.timeout.warning\",\"desc\":\"Number of minutes before a session times out you want to display a warning message.\",\"label\":\"Session Timeout Warning Time\",\"value\":60,\"type\":\"Integer\",\"isMandatory\":true}]},{\"name\":\"Password Section\",\"desc\":\"Password Settings\",\"label\":\"Password Settings\",\"configuration\":[{\"key\":\"passwordResetLinkExpiry\",\"desc\":\"Time Period after which the password reset link must expire. Use the hh:mm:ss format.\",\"label\":\"Password Reset Link Expiry Time\",\"value\":\"1:0:0\",\"type\":\"String\",\"isMandatory\":true},{\"key\":\"passwordPolicy\",\"desc\":\"Password policy for the portal. The policy appears in the sign up page.\",\"label\":\"Password Policy\",\"value\":\"Valid passwords must be between 4 and 9 characters in length\",\"type\":\"String\",\"isMandatory\":true}]},{\"name\":\"Portal Administrator User\",\"desc\":\"Portal Administrator User\",\"label\":\"Portal Administrator User\",\"configuration\":[{\"key\":\"username\",\"desc\":\"User name with administrative privileges to access the portal.\",\"label\":\"Username\",\"value\":\"admin\",\"type\":\"String\",\"isMandatory\":true}]},{\"name\":\"Service provider metadata properties\",\"desc\":\"Service provider metadata properties\",\"label\":\"Service provider metadata properties\",\"configuration\":[{\"key\":\"EntityID\",\"desc\":\"Used to communicate with SP and IDP\",\"label\":\"EntityID\",\"value\":\"GENERIC_PORTAL_<ORS_ID>_<PORTAL_ID>\",\"type\":\"String\",\"isMandatory\":true},{\"key\":\"SignAuthRequest\",\"desc\":\"Boolean attribute\",\"label\":\"SignAuthRequest\",\"value\":true,\"type\":\"boolean\",\"isMandatory\":true},{\"key\":\"SignLogoutRequest\",\"desc\":\"Boolean attribute\",\"label\":\"SignLogoutRequest\",\"value\":false,\"type\":\"boolean\",\"isMandatory\":true},{\"key\":\"AssertionConsumerServiceURL\",\"desc\":\"End point to which SAML responses are to be sent by the IdP\",\"label\":\"AssertionConsumerServiceURL\",\"value\":\"https://<host>:<port>/infa-portal/portals/SSO/ORS_ID/PORTAL_ID\",\"type\":\"String\",\"isMandatory\":true}]}]";
	private static final String samlConfig = "[{\"name\":\"SAML Service provider metadata properties\",\"desc\":\"SAML Service provider metadata properties\",\"label\":\"SAML Service provider metadata properties\",\"configuration\":[{\"key\":\"EntityID\",\"desc\":\"Used to communicate with SP and IDP\",\"label\":\"EntityID\",\"value\":\"GENERIC_PORTAL_<ORS_ID>_<PORTAL_ID>\",\"type\":\"String\",\"isMandatory\":true},{\"key\":\"SignAuthRequest\",\"desc\":\"Boolean attribute\",\"label\":\"SignAuthRequest\",\"value\":true,\"type\":\"boolean\",\"isMandatory\":true},{\"key\":\"SignLogoutRequest\",\"desc\":\"Boolean attribute\",\"label\":\"SignLogoutRequest\",\"value\":false,\"type\":\"boolean\",\"isMandatory\":true},{\"key\":\"AssertionConsumerServiceURL\",\"desc\":\"End point to which SAML responses are to be sent by the IdP\",\"label\":\"AssertionConsumerServiceURL\",\"value\":\"https://<host>:<port>/infa-portal/portals/SSO/ORS_ID/PORTAL_ID\",\"type\":\"String\",\"isMandatory\":true}]},{\"name\":\"SAML Identity provider metadata properties\",\"desc\":\"SAML Identity provider metadata properties\",\"label\":\"SAML Identity provider metadata properties\",\"configuration\":[{\"key\":\"EntityID\",\"desc\":\"Used to communicate with SP and IDP\",\"label\":\"EntityID\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleSignOnServiceURLRedirect\",\"desc\":\"Single SignOn Service URL Redirect\",\"label\":\"Single SignOn Service URL Redirect\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleSignOnServiceURLPOST\",\"desc\":\"Single SignOn Service URL POST\",\"label\":\"Single SignOn Service URL POST\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleLogoutServiceURL\",\"desc\":\"Single Logout Service URL\",\"label\":\"Single Logout Service URL\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"Certificate\",\"desc\":\"X509Certificate for IdP\",\"label\":\"X509Certificate for IdP\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"BindingType \",\"desc\":\"Single SignOn Service URL Binding Type\",\"label\":\"Single SignOn Service URL Binding Type\",\"value\":\"Redirect\",\"type\":\"String\",\"isMandatory\":false}]}]";
	private static final String runtimeWithsamlConfig = "[{\"name\":\"Session Section\",\"desc\":\"Session Settings\",\"label\":\"Session Settings\",\"configuration\":[{\"key\":\"session.timeout\",\"desc\":\"Number of minutes to wait before an idle session times out.\",\"label\":\"Session Timeout Interval\",\"value\":420,\"type\":\"Integer\",\"isMandatory\":true},{\"key\":\"session.timeout.warning\",\"desc\":\"Number of minutes before a session times out you want to display a warning message.\",\"label\":\"Session Timeout Warning Time\",\"value\":60,\"type\":\"Integer\",\"isMandatory\":true}]},{\"name\":\"Password Section\",\"desc\":\"Password Settings\",\"label\":\"Password Settings\",\"configuration\":[{\"key\":\"passwordResetLinkExpiry\",\"desc\":\"Time Period after which the password reset link must expire. Use the hh:mm:ss format.\",\"label\":\"Password Reset Link Expiry Time\",\"value\":\"1:0:0\",\"type\":\"String\",\"isMandatory\":true},{\"key\":\"passwordPolicy\",\"desc\":\"Password policy for the portal. The policy appears in the sign up page.\",\"label\":\"Password Policy\",\"value\":\"Valid passwords must be between 4 and 9 characters in length\",\"type\":\"String\",\"isMandatory\":true}]},{\"name\":\"Portal Administrator User\",\"desc\":\"Portal Administrator User\",\"label\":\"Portal Administrator User\",\"configuration\":[{\"key\":\"username\",\"desc\":\"User name with administrative privileges to access the portal.\",\"label\":\"Username\",\"value\":\"admin\",\"type\":\"String\",\"isMandatory\":true}]},{\"name\":\"SAML Identity provider metadata properties\",\"desc\":\"SAML Identity provider metadata properties\",\"label\":\"SAML Identity provider metadata properties\",\"configuration\":[{\"key\":\"EntityID\",\"desc\":\"Used to communicate with SP and IDP\",\"label\":\"EntityID\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleSignOnServiceURLRedirect\",\"desc\":\"Single SignOn Service URL Redirect\",\"label\":\"Single SignOn Service URL Redirect\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleSignOnServiceURLPOST\",\"desc\":\"Single SignOn Service URL POST\",\"label\":\"Single SignOn Service URL POST\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"SingleLogoutServiceURL\",\"desc\":\"Single Logout Service URL\",\"label\":\"Single Logout Service URL\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"Certificate\",\"desc\":\"X509Certificate for IdP\",\"label\":\"X509Certificate for IdP\",\"value\":\"\",\"type\":\"String\",\"isMandatory\":false},{\"key\":\"BindingType \",\"desc\":\"Single SignOn Service URL Binding Type\",\"label\":\"Single SignOn Service URL Binding Type\",\"value\":\"Redirect\",\"type\":\"String\",\"isMandatory\":false}]}]";
	private static final String LOCALISATION_NODE  = "{\"eClass\":\"http://www.informatica.com/mdm/config/model/v1#//Portal\",\"portalId\":\"600283\",\"portalName\":\"Localisation Bug\",\"portalTitle\":\"Localisation Bug\",\"databaseId\":\"localhost-orcl-SUPPLIER_HUB\",\"beName\":\"Supplier\",\"sourceSystem\":\"Admin\",\"isStateEnabled\":true,\"version\":15,\"hasPublished\":true,\"stateSettings\":{\"table\":\"LookupPartyStatusValue\",\"column\":\"partyStatusValue\"},\"roleSettings\":{\"referenceEntity\":\"LookupPortalUserRole\",\"fieldName\":\"roleCode\"},\"header\":{\"fontColor\":\"#28112e\",\"backgroundColor\":\"#582c64\"},\"footer\":{\"footerText\":\"Footer\",\"fontColor\":\"#2d1433\",\"backgroundColor\":\"#2d1137\"},\"signup\":{\"title\":\"Registration Screen\",\"welcomeText\":\"Welcome To Registration\",\"bevName\":\"SupplierView\",\"userRole\":\"Supplier Administrators\",\"userState\":\"Approved\",\"maxColumns\":2},\"login\":{\"title\":\"Login Screen\",\"fieldMapping\":{\"username\":\"Contacts.contacts.prtlUsrNm\",\"email\":\"Contacts.contacts.ContactElectronicAddress.etrncAddr\",\"userRole\":\"Contacts.contacts.prtlUsrRle.roleCode\",\"userState\":\"Status.prtyStsVal.partyStatusValue\",\"portalAssociation\":\"portalAssc.portalId\"}},\"pages\":[{\"id\":\"600286\",\"key\":\"RecordPage__3zvOAEhVEeqHC7vbHaDLBw\",\"name\":\"RecordPage\",\"bevName\":\"SupplierView\",\"maxColumns\":2,\"type\":\"Record Page\",\"layout\":{\"sections\":[{\"id\":\"__Br-QEhcEeqMnKdcLjwcWw\",\"displayIcon\":\"rectangle\",\"containers\":[{\"id\":\"__B714EhcEeqMnKdcLjwcWw\",\"components\":[{\"eClass\":\"http://www.informatica.com/mdm/config/model/v1#//BeFormComponent\",\"id\":\"_F6ossEhVEeq3qsZl1MEnIQ\",\"componentType\":\"BeFormComponent\",\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$\",\"beFormSections\":[{\"id\":\"_F63WMEhVEeq3qsZl1MEnIQ\",\"key\":\"RecordSection__F63WMUhVEeq3qsZl1MEnIQ\",\"name\":\"RecordSection\",\"beFormFields\":[{\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"fullNm\\\")]\",\"id\":\"_F7ExkEhVEeq3qsZl1MEnIQ\",\"key\":\"fullNm__F7ExkUhVEeq3qsZl1MEnIQ\",\"name\":\"fullNm\",\"fieldType\":\"textField\",\"hierarchyName\":\"fullNm\",\"required\":true},{\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"bsnsTyp\\\")]\",\"id\":\"_F7av0EhVEeq3qsZl1MEnIQ\",\"key\":\"bsnsTyp__F7av0UhVEeq3qsZl1MEnIQ\",\"name\":\"bsnsTyp\",\"fieldType\":\"dropdown\",\"hierarchyName\":\"bsnsTyp\"},{\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"crncy\\\")]\",\"id\":\"_F7j5wEhVEeq3qsZl1MEnIQ\",\"key\":\"crncy__F7j5wUhVEeq3qsZl1MEnIQ\",\"name\":\"crncy\",\"fieldType\":\"dropdown\",\"hierarchyName\":\"crncy\"},{\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"lglFrm\\\")]\",\"id\":\"_F7u44EhVEeq3qsZl1MEnIQ\",\"key\":\"lglFrm__F7u44UhVEeq3qsZl1MEnIQ\",\"name\":\"lglFrm\",\"fieldType\":\"dropdown\",\"hierarchyName\":\"lglFrm\"},{\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"naicsCd\\\")]\",\"id\":\"_F74C0EhVEeq3qsZl1MEnIQ\",\"key\":\"naicsCd__F74C0UhVEeq3qsZl1MEnIQ\",\"name\":\"naicsCd\",\"fieldType\":\"textField\",\"hierarchyName\":\"naicsCd\"}]},{\"id\":\"__EDVwEhcEeqMnKdcLjwcWw\",\"key\":\"RecordSection2___EDVwUhcEeqMnKdcLjwcWw\",\"name\":\"RecordSection2\",\"order\":1,\"beFormFields\":[{\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"bsnsTyp\\\")]\",\"id\":\"__EFK8EhcEeqMnKdcLjwcWw\",\"key\":\"bsnsTyp___EFK8UhcEeqMnKdcLjwcWw\",\"name\":\"bsnsTyp\",\"fieldType\":\"dropdown\",\"hierarchyName\":\"bsnsTyp\"},{\"configName\":\"SupplierView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"fullNm\\\")]\",\"id\":\"__ENGwEhcEeqMnKdcLjwcWw\",\"key\":\"fullNm___ENGwUhcEeqMnKdcLjwcWw\",\"name\":\"fullNm\",\"fieldType\":\"textField\",\"hierarchyName\":\"fullNm\",\"required\":true}]}]}],\"style\":{\"width\":1}}],\"sectionType\":\"Section-Type 1\"}]},\"order\":1,\"roles\":[\"ApplicationAdministrator\",\"Supplier Administrators\"]}],\"userManagement\":{\"bevName\":\"SupplierView\",\"fieldMapping\":{\"firstName\":\"Contacts.frstNm\",\"lastName\":\"Contacts.lstNm\",\"username\":\"Contacts.prtlUsrNm\",\"email\":\"Contacts.prfxNm\",\"userRole\":\"Contacts.prtlUsrRle\",\"userState\":\"extId\"},\"sectionHeading\":\"User Mapping Section\"},\"status\":\"Stopped\",\"isDraft\":false}";
	private static final String GENERAL_SETTINGS_NODE = "{\"generalSettings\":{\"portalName\":\"Supplier Portal\",\"portalTitle\":\"Supplier Portal\",\"databaseId\":\"orcl-SUPPLIER_HUB_1\",\"beName\":\"Supplier\",\"sourceSystem\":\"Portal\",\"isStateEnabled\":true,\"stateSettings\":{\"referenceEntity\":\"LookupPartyStatusValue\",\"fieldName\":\"partyStatusValue\"},\"roleSettings\":{\"referenceEntity\":\"LookupPortalUserRole\",\"fieldName\":\"roleCode\"},\"header\":{\"fontColor\":\"#000000\"},\"footer\":{\"footerText\":\"Copyright 1993-2020 Informatica LLC. All Rights\",\"fontColor\":\"#000000\"},\"signup\":{\"backgroundImage\":\"http://<host>:<port>/portal-ui/images/signup.jpg\",\"title\":\"Sign Up Form\",\"welcomeText\":\"Fill in the fields to create a supplier account.\",\"bevName\":\"SupplierRegistrationView\",\"userRole\":\"Supplier Administrators\",\"userState\":\"Registered\",\"maxColumns\":2,\"beFormComponent\":{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$\",\"beFormSections\":[{\"id\":\"_beu3MEqNEeqOZOqLd8MgeA\",\"key\":\"__beu3MUqNEeqOZOqLd8MgeA\",\"name\":\"Company Details\",\"beFormFields\":[{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"fullNm\\\")]\",\"id\":\"_bezIoEqNEeqOZOqLd8MgeA\",\"key\":\"fullNm__bezIoUqNEeqOZOqLd8MgeA\",\"name\":\"fullNm\",\"fieldType\":\"textField\",\"hierarchyName\":\"fullNm\",\"required\":true},{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"TaxId\\\")]\",\"id\":\"_be090EqNEeqOZOqLd8MgeA\",\"key\":\"TaxId__be090UqNEeqOZOqLd8MgeA\",\"name\":\"TaxId\",\"fieldType\":\"textField\",\"hierarchyName\":\"TaxId\"},{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"DunsNumber\\\")]\",\"id\":\"_be2L8EqNEeqOZOqLd8MgeA\",\"key\":\"DunsNumber__be2L8UqNEeqOZOqLd8MgeA\",\"name\":\"DunsNumber\",\"fieldType\":\"textField\",\"hierarchyName\":\"DunsNumber\",\"required\":true},{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"cmpnyStreetAddr\\\")]\",\"id\":\"_be52UEqNEeqOZOqLd8MgeA\",\"key\":\"cmpnyStreetAddr__be52UUqNEeqOZOqLd8MgeA\",\"name\":\"cmpnyStreetAddr\",\"fieldType\":\"textField\",\"hierarchyName\":\"cmpnyStreetAddr\",\"required\":true},{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"city\\\")]\",\"id\":\"_be7EcEqNEeqOZOqLd8MgeA\",\"key\":\"city__be7EcUqNEeqOZOqLd8MgeA\",\"name\":\"city\",\"fieldType\":\"textField\",\"hierarchyName\":\"city\",\"required\":true},{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"pstlCode\\\")]\",\"id\":\"_be8SkEqNEeqOZOqLd8MgeA\",\"key\":\"pstlCode__be8SkUqNEeqOZOqLd8MgeA\",\"name\":\"pstlCode\",\"fieldType\":\"textField\",\"hierarchyName\":\"pstlCode\"},{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"country\\\")]\",\"id\":\"_be85oEqNEeqOZOqLd8MgeA\",\"key\":\"country__be85oUqNEeqOZOqLd8MgeA\",\"name\":\"country\",\"fieldType\":\"dropdown\",\"hierarchyName\":\"country\",\"required\":true},{\"configName\":\"SupplierRegistrationView\",\"configType\":\"BEView\",\"attributeSelector\":\"$.object.field[?(@.name==\\\"state\\\")]\",\"id\":\"_be9gsEqNEeqOZOqLd8MgeA\",\"key\":\"state__be9gsUqNEeqOZOqLd8MgeA\",\"name\":\"state\",\"fieldType\":\"dropdown\",\"hierarchyName\":\"state\",\"required\":true}]}]},\"registrationEmailTemplate\":\"OnboardingRegistration\"},\"login\":{\"title\":\"Log In\",\"backgroundImage\":\"http://<host>:<port>/portal-ui/images/login.jpg\",\"fieldMapping\":{\"userName\":{\"code\":\"Contacts.contacts.prtlUsrNm\",\"label\":\"userName\"},\"email\":{\"code\":\"Contacts.contacts.ContactElectronicAddress.etrncAddr\",\"label\":\"email\"},\"userRole\":{\"code\":\"Contacts.contacts.prtlUsrRle.roleCode\",\"label\":\"userRole\"},\"userState\":{\"code\":\"Status.prtyStsVal.partyStatusValue\",\"label\":\"userState\"},\"portalAssociation\":{\"code\":\"portalAssc.portalId\",\"label\":\"portalAssociation\"}},\"resetPasswordEmailTemplate\":\"resetPassword\",\"resetPasswordEmailSuccessTemplate\":\"resetPasswordSuccessful\"},\"userManagement\":{\"bevName\":\"SupplierRegistrationView\",\"fieldMapping\":{\"firstName\":{\"code\":\"Contacts.frstNm\",\"label\":\"First Name\"},\"lastName\":{\"code\":\"Contacts.lstNm\",\"label\":\"Last Name\"},\"userName\":{\"code\":\"Contacts.prtlUsrNm\",\"label\":\"User Name\"},\"email\":{\"code\":\"Contacts.prtlUsrNm\",\"label\":\"Email Address\"},\"userRole\":{\"code\":\"Contacts.prtlUsrRle\",\"label\":\"User Role\"},\"userState\":{\"code\":\"prtlSts\",\"label\":\"userState\"},\"countryDialingCode\":{\"code\":\"Contacts.prfxNum\",\"label\":\"Country Dialing Code\"},\"phoneNumber\":{\"code\":\"Contacts.primaryPhnNumber\",\"label\":\"Phone Number\"},\"jobTitle\":{\"code\":\"Contacts.title\",\"label\":\"Title\"},\"portalAssociation\":{\"code\":\"portalAssc\",\"label\":\"portalAssociation\"}},\"userRoles\":[\"Supplier Administrators\"],\"userStates\":[\"Approved\"],\"createAdditionalUsers\":true,\"inviteEmailTemplate\":\"setPassword\",\"resetPasswordEmailSuccessTemplate\":\"setPasswordSuccessful\",\"hasSameEmailAndUsername\":true,\"sectionHeading\":\"Contact Details\",\"hasUserRole\":true}}}"; 
	private static final String EMPTY_SEARCH_RESPONSE = "{\"link\":[],\"firstRecord\":1,\"recordCount\":0,\"pageSize\":100,\"searchToken\":\"SVR1.MLWS\",\"facet\":[],\"item\":[]}";
	private static final String SEARCH_RESPONSE = "{\"link\":[{\"href\":\"http://localhost:8080/cmx/cs/orcl-SUPPLIER_HUB_1/Supplier.json?action=query&depth=10&firstRecord=101&recordsToReturn=100&searchToken=SVR1.MJQ5\",\"rel\":\"next\"}],\"firstRecord\":1,\"recordCount\":1,\"pageSize\":100,\"searchToken\":\"SVR1.MJQ5\",\"facet\":[],\"item\":[{\"Supplier\":{\"link\":[{\"href\":\"http://localhost:8080/cmx/request/hm_icons/org_Small.jpg?ors=orcl-SUPPLIER_HUB_1\",\"rel\":\"icon\"}],\"rowidObject\":\"240022\",\"effectivePeriod\":{},\"label\":\"uyrtersr\",\"fullNm\":\"uyrtersr\",\"prtyBoClassCd\":\"Organization\",\"draftInd\":\"N\",\"portalAssc\":{\"rowidObject\":\"1\",\"label\":\"Lookup InfaPortal Association\",\"portalId\":\"140007\",\"portalName\":\"Reinvite\",\"beName\":\"Supplier\"}}}]}";
	
	@Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        PowerMockito.mockStatic(PortalConfigUtil.class);
        ReflectionTestUtils.setField(portalConfigServiceImpl, "metamodelVersion", "1.0.1");
        sipClient = PowerMockito.mock(SiperianClient.class);
        ReflectionTestUtils.setField(portalConfigServiceImpl, "siperianClient",sipClient);
        objectMapper = new ObjectMapper();
        versionNode = objectMapper.readTree(version);
        portalObjectNode = objectMapper.createObjectNode();
        portalObjectNode.put(PortalMetadataContants.PORTAL_ID, "1");
        portalObjectNode.putObject(PortalMetadataContants.GENERAL_SETTINGS).put(PortalMetadataContants.DATABASE_ID, "orcl-SUPPLIER");
        portalObjectNode.put(PortalMetadataContants.PORTAL_VERSION, 1L);
        ((ObjectNode) portalObjectNode.get(PortalMetadataContants.GENERAL_SETTINGS)).put(PortalMetadataContants.PORTAL_NAME, "Supplier Portal");
        ((ObjectNode) portalObjectNode.get(PortalMetadataContants.GENERAL_SETTINGS)).put(PortalMetadataContants.PORTAL_TITLE, "Supplier Portal Title");
        ((ObjectNode) portalObjectNode.get(PortalMetadataContants.GENERAL_SETTINGS)).put(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED, false);
        portalNode = objectMapper.readTree(PORTAL_NODE);
        ((ObjectNode) portalNode).putObject(PortalMetadataContants.GENERAL_SETTINGS).put(PortalMetadataContants.DATABASE_ID, "orcl-SUPPLIER");
        ((ObjectNode) portalNode.get(PortalMetadataContants.GENERAL_SETTINGS)).put(PortalMetadataContants.PORTAL_NAME, "Supplier Portal");
        ((ObjectNode) portalNode.get(PortalMetadataContants.GENERAL_SETTINGS)).put(PortalMetadataContants.PORTAL_TITLE, "Supplier Portal Title");
        portalChildNode = objectMapper.readTree(PAGES_ARRAY_NODE);
        portalGrandChildNode = objectMapper.readTree(PAGE_NODE_VALUE);
        portalHeaderNode = objectMapper.readTree(HEADER_NODE_VALUE);
        runtimeConfigNode = objectMapper.readTree(runtimeConfig);
        samlConfigNode = objectMapper.readTree(samlConfig);
        runtimeWithsamlConfigNode = objectMapper.readTree(runtimeWithsamlConfig);
        localisationNode = objectMapper.readTree(LOCALISATION_NODE);
        portalConfigNode = objectMapper.readTree(GENERAL_SETTINGS_NODE);
        emptySearchResNode = objectMapper.readTree(EMPTY_SEARCH_RESPONSE);
        searchResNode = objectMapper.readTree(SEARCH_RESPONSE);
        Mockito.doNothing().when(validator).validateConfigPath(Mockito.any());
        JsonUtil.setErrorCodeProperties(errorCodeProperties);
        Mockito.when(errorCodeProperties.getProperty(Mockito.any())).thenReturn("Exception Occured");
    }
 
	
	@Test
	public void testCreatePortalConfig() throws PortalConfigException, IOException, Exception {
		Mockito.when(portalService.savePortalConfigInDraft(credentials, portalNode)).thenReturn(versionNode);
		Mockito.when(portalService.isPortalNameExist(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(metaModelService.savePortalToResource(portalNode, "username")).thenReturn("portalID");
		Mockito.when(metaModelService.mapToEcoreJson(Mockito.any(JsonNode.class), Mockito.anyString())).thenReturn(portalNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		assertNotNull(portalConfigServiceImpl.savePortalConfigInDraft(credentials, portalObjectNode));
	}
	
	@Test(expected = MetaModelException.class)
	public void testSavePortalToResourceException() throws PortalConfigException, IOException, Exception {
		Mockito.when(credentials.getUsername()).thenReturn("username");
		Mockito.when(metaModelService.savePortalToResource(portalNode, "username")).thenThrow(MetaModelException.class);
		portalConfigServiceImpl.savePortalToResource(portalNode, credentials);
	}
	
	@Test(expected = PortalAlreadyExistException.class)
	public void testCreatePortalConfigEdgeCase() throws PortalConfigException, IOException, Exception {
		Mockito.when(portalService.savePortalConfigInDraft(credentials, portalNode)).thenReturn(versionNode);
		Mockito.when(portalService.isPortalNameExist(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(true);
		Mockito.when(metaModelService.savePortalToResource(portalNode, "username")).thenReturn("portalID");
		Mockito.when(metaModelService.mapToEcoreJson(Mockito.any(JsonNode.class), Mockito.anyString())).thenReturn(portalNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		portalConfigServiceImpl.savePortalConfigInDraft(credentials, portalObjectNode);
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testCreatePortalConfigException() throws PortalConfigException, IOException, Exception {
		Mockito.when(portalService.savePortalConfigInDraft(credentials, portalNode)).thenThrow(PortalConfigServiceException.class);
		Mockito.when(portalService.isPortalNameExist(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(metaModelService.savePortalToResource(portalNode, "username")).thenReturn("portalID");
		Mockito.when(metaModelService.mapToEcoreJson(Mockito.any(JsonNode.class), Mockito.anyString())).thenReturn(portalNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		portalConfigServiceImpl.savePortalConfigInDraft(credentials, portalObjectNode);
	}
	
	@Test(expected = PortalAlreadyExistException.class)
	public void testPublishPortalConfig() throws PortalConfigException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		Mockito.when(portalService.getPortalConfigDraft(credentials, "1", "orcl-SUPPLIER")).thenReturn(portalObjectNode);
		Mockito.when(portalService.isPublishedPortalNameExistById(credentials, "1", "Supplier Portal", "orcl-SUPPLIER")).thenReturn(true);
		portalConfigServiceImpl.publishPortalConfig(credentials, "1", "orcl-SUPPLIER", restConfig,request);
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testPublishPortalConfigException() throws PortalConfigException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		Mockito.when(portalService.getPortalConfigDraft(credentials, "1", "orcl-SUPPLIER")).thenThrow(PortalConfigServiceException.class);
		portalConfigServiceImpl.publishPortalConfig(credentials, "1", "orcl-SUPPLIER", restConfig,request);
	}

	@Test
	public void testSavePortalToResource() throws PortalConfigException, IOException {
		Mockito.when(metaModelService.savePortalToResource(Mockito.any(JsonNode.class), Mockito.any())).thenReturn("portalID");
		assertNotNull(portalConfigServiceImpl.savePortalToResource(portalNode, credentials));
	}
	
	@Test
	public void testGetPortal() throws PortalConfigException, MetaModelException {
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		Mockito.when(portalService.getPortalConfigDraftByVersion(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(Integer.class))).thenReturn(portalNode);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalNode);
		assertNotNull(portalConfigServiceImpl.getPortalConfig(credentials, "portalID", "orsID", 1));
	}
	
	@Test(expected = ResourceNotFoundException.class)
	public void testGetPortalConfigException() throws PortalConfigException, MetaModelException {
		Mockito.when(credentials.getUsername()).thenReturn("admin");
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(null);
		Mockito.when(portalService.getPortalConfigDraftByVersion(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(Integer.class))).thenReturn(null);
		Mockito.when(portalService.getPublishedPortalConfigByVersion(credentials, "portalID", "orsID", 1)).thenThrow(ResourceNotFoundException.class);
		portalConfigServiceImpl.getPortalConfig(credentials, "portalID", "orsID", 1);
	}
	
	@Test
	public void testGetPortalWithDB() throws PortalConfigException, MetaModelException, IOException {
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(String.class), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(null);
		Mockito.when(portalService.getPortalConfigDraftByVersion(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(Integer.class))).thenReturn(null);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(null);
		Mockito.when(metaModelService.savePortalToResource(Mockito.any(JsonNode.class), Mockito.any())).thenReturn("portalID");
		Mockito.when(credentials.getUsername()).thenReturn("username");
		assertNull(portalConfigServiceImpl.getPortalConfig(credentials, "portalID", "orsID", 1));
	}

	@Test
	public void testPublishPortal() throws PortalConfigException, MetaModelException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		Mockito.when(portalService.getPortalConfigDraft(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalService.isPublishedPortalNameExistById(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(portalService.publishPortalConfig(credentials, portalObjectNode)).thenReturn(versionNode);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		portalConfigServiceImpl.publishPortalConfig(credentials, "portalID", "localhost-SUPPPLIER-ORCL", restConfig,request);
		verify(portalService).publishPortalConfig(Mockito.any(Credentials.class), Mockito.any());
	}
	
	@Test
	public void testPublishPortalWithRuntimeConfig() throws PortalConfigException, MetaModelException, IOException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		Mockito.when(PortalConfigUtil.loadFileFromClasspath(PortalMetadataContants.RUNTIME_CONFIG_PATH,
				pathMatchingResourcePatternResolver)).thenReturn(resource);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenThrow(ResourceNotFoundException.class);
		Mockito.when(pathMatchingResourcePatternResolver.getResource(PortalMetadataContants.RUNTIME_CONFIG_PATH)).thenReturn(resource);
		Mockito.when(resource.getFilename()).thenReturn("runtime.json");
		Mockito.when(mapper.readTree(resource.getInputStream())).thenReturn(runtimeConfigNode);
		Mockito.when(portalService.savePortalRuntimeConfig(credentials, runtimeConfigNode, "localhost-SUPPPLIER-ORCL", "portalID")).thenReturn(versionNode);
		Mockito.when(portalService.getPortalConfigDraft(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalService.isPublishedPortalNameExistById(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(portalService.publishPortalConfig(credentials, portalObjectNode)).thenReturn(versionNode);
		portalConfigServiceImpl.publishPortalConfig(credentials, "portalID", "localhost-SUPPPLIER-ORCL", restConfig, request);
		verify(portalService).publishPortalConfig(Mockito.any(Credentials.class), Mockito.any());
	}
	
	@Test
	public void testPublishPortalWithRuntimeConfigSsoEnabled() throws PortalConfigException, MetaModelException, IOException {
		
		((ObjectNode) portalObjectNode.get(PortalMetadataContants.GENERAL_SETTINGS)).put(PortalMetadataContants.IS_EXTERNAL_USER_MANAGEMENT_ENABLED, true);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		Mockito.when(PortalConfigUtil.loadFileFromClasspath(PortalMetadataContants.RUNTIME_CONFIG_PATH,
				pathMatchingResourcePatternResolver)).thenReturn(resource);
		Mockito.when(PortalConfigUtil.loadFileFromClasspath(PortalMetadataContants.SAML_CONFIG_PATH,
				pathMatchingResourcePatternResolver)).thenReturn(samlresource);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenThrow(ResourceNotFoundException.class);
		Mockito.when(pathMatchingResourcePatternResolver.getResource(PortalMetadataContants.SAML_CONFIG_PATH)).thenReturn(resource);
		Mockito.when(resource.getFilename()).thenReturn("saml.json");
		Mockito.when(mapper.readTree(resource.getInputStream())).thenReturn(runtimeConfigNode);
		Mockito.when(mapper.readTree(samlresource.getInputStream())).thenReturn(samlConfigNode);
		Mockito.when(portalService.savePortalRuntimeConfig(credentials, samlConfigNode, "localhost-SUPPPLIER-ORCL", "portalID")).thenReturn(versionNode);
		Mockito.when(portalService.getPortalConfigDraft(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalService.isPublishedPortalNameExistById(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(portalService.publishPortalConfig(credentials, portalObjectNode)).thenReturn(versionNode);		
		portalConfigServiceImpl.publishPortalConfig(credentials, "portalID", "localhost-SUPPPLIER-ORCL", restConfig, request);
		verify(portalService).publishPortalConfig(Mockito.any(Credentials.class), Mockito.any());
	}
	
	@Test
	public void testGetDatabases() throws PortalConfigException {
		Mockito.when(portalService.getDatabases(Mockito.any(Credentials.class))).thenReturn(portalNode);
		assertNotNull(portalConfigServiceImpl.getDatabases(credentials));
	}

	@Test
	public void testGetPortals() throws PortalConfigException {
		Mockito.when(portalService.getPortals(Mockito.any(Credentials.class), Mockito.anyBoolean())).thenReturn(portalArrayNode);
		assertNotNull(portalConfigServiceImpl.getPortals(credentials));
	}
	
	@Test
	public void testDeleteDraftPortalConfig() throws PortalConfigException, Exception {
		PortalRestConfig portalRestConfig = new PortalRestConfig("localhost-SUPPPLIER-ORCL",1, new ArrayList());
        Mockito.when(portalService.deleteDraftPortalConfig(Mockito.any(Credentials.class), 
				Mockito.anyString(), Mockito.anyString())).thenReturn(versionNode);
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		Mockito.doNothing().when(metaModelService).deletePortalFromResourceSet(Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class));
		portalConfigServiceImpl.deletePortalConfig(credentials, "1", PortalMetadataContants.PORTAL_DISCARD_ACTION,portalRestConfig,request);
		verify(portalService, atLeastOnce()).deleteDraftPortalConfig(credentials, "1", "localhost-SUPPPLIER-ORCL");
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testDeleteDraftPortalConfigException() throws PortalConfigException, Exception {
		Mockito.doThrow(PortalConfigServiceException.class).when(portalService).deleteDraftPortalConfig(Mockito.any(Credentials.class), 
				Mockito.anyString(), Mockito.anyString());
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		PortalRestConfig portalRestConfig = new PortalRestConfig("localhost-SUPPPLIER-ORCL",1, new ArrayList());
		portalConfigServiceImpl.deletePortalConfig(credentials, "1", PortalMetadataContants.PORTAL_DISCARD_ACTION,portalRestConfig,request);
	}
	
	@Test
	public void testDeletePublishedPortalConfig() throws PortalConfigException, Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		Mockito.doNothing().when(portalService).deletePublishedPortalConfig(Mockito.any(Credentials.class), 
				Mockito.anyString(), Mockito.anyString());
		Mockito.doNothing().when(metaModelService).deletePortalFromResourceSet(Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class));
		PortalRestConfig portalRestConfig = new PortalRestConfig("localhost-SUPPPLIER-ORCL",1, new ArrayList());
		portalRestConfig.setMdmSessionId("mdmsession.id||4u94343M3eRTD232343EMCNTJT23243AF");
		portalRestConfig.setLocale("en");
		portalRestConfig.setInitialApiUrl("localhost:8080");
		ResponseEntity<String> responseEntity = new ResponseEntity<>(EMPTY_SEARCH_RESPONSE, HttpStatus.OK);
		SearchQueryResponse searchQueryResponse = new SearchQueryResponse();
		Record record = new Record();
        record.setField(new Field(DatabaseConstants.COLUMN_ROWID_OBJECT,"40001"));
        searchQueryResponse.addRecord(record);
        PowerMockito.when(sipClient.process(any(SearchQueryRequest.class))).thenReturn(searchQueryResponse);
        PowerMockito.when(sipClient.process(any(DeleteRequest.class))).thenReturn(new DeleteResponse());
        Mockito.when(mapper.readTree(EMPTY_SEARCH_RESPONSE)).thenReturn(emptySearchResNode);
		Mockito.when(portalService.getPublishedPortalConfig(credentials, "1", "localhost-SUPPPLIER-ORCL")).thenReturn(portalConfigNode);
		Mockito.when(externalConfigService.searchBERecord(Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class),Mockito.any(HttpServletRequest.class))).thenReturn(responseEntity);
		portalConfigServiceImpl.deletePortalConfig(credentials, "1", PortalMetadataContants.PORTAL_PUBLISHED_STATE,portalRestConfig,request);
		verify(portalService, atLeastOnce()).deletePublishedPortalConfig(credentials, "1", "localhost-SUPPPLIER-ORCL");
	}
	
	@Test
	public void testCannotDeletePortalWithAssociatedRecords() throws PortalConfigException, Exception {
		Mockito.doNothing().when(portalService).deletePublishedPortalConfig(Mockito.any(Credentials.class), 
				Mockito.anyString(), Mockito.anyString());
		Mockito.doNothing().when(metaModelService).deletePortalFromResourceSet(Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class));
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		PortalRestConfig portalRestConfig = new PortalRestConfig("localhost-SUPPPLIER-ORCL",1, new ArrayList());
		portalRestConfig.setMdmSessionId("mdmsession.id||4u94343M3eRTD232343EMCNTJT23243AF");
		portalRestConfig.setLocale("en");
		portalRestConfig.setInitialApiUrl("localhost:8080");
		ResponseEntity<String> responseEntity = new ResponseEntity<>(SEARCH_RESPONSE, HttpStatus.OK);
		Mockito.when(mapper.readTree(SEARCH_RESPONSE)).thenReturn(searchResNode);
		Mockito.when(portalService.getPublishedPortalConfig(credentials, "1", "localhost-SUPPPLIER-ORCL")).thenReturn(portalConfigNode);
		Mockito.when(externalConfigService.searchBERecord(Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class),Mockito.any(HttpServletRequest.class))).thenReturn(responseEntity);
		boolean failed = false;
		try {
		portalConfigServiceImpl.deletePortalConfig(credentials, "1", PortalMetadataContants.PORTAL_PUBLISHED_STATE,portalRestConfig,request);
		}catch(Exception e) {
			failed = true;
		}
		assertTrue(failed);
	}
	
	@Test
	public void testGetReferenceDataByUri() throws PortalConfigException {
		Mockito.when(metaModelService.getReferenceDataByUri("states")).thenReturn(new ObjectMapper().createObjectNode());
		assertNotNull(portalConfigServiceImpl.getReferenceDataByUri("states"));
	}
	
	@Test(expected = MetaModelException.class)
	public void testGetReferenceDataByUriException() throws PortalConfigException {
		Mockito.when(metaModelService.getReferenceDataByUri("states")).thenThrow(MetaModelException.class);
		portalConfigServiceImpl.getReferenceDataByUri("states");
	}
	
	@Test
	public void testGetPortalConfigModelForArray() throws PortalConfigException, IOException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        String filter = "{\"states\": [\"Approved\",\"Registered\"]}";
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setSort("order");
        restConfig.setDepth(0);
        restConfig.setVersion(1);
        restConfig.setResolveExtConfig(false);
        restConfig.setFilter(objectMapper.readTree(filter));
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		List<String> states = new ArrayList<String>();
		states.add("Approved");
		states.add("Registered");
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		ArrayNode arr1States = ((ObjectNode) arr1).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr1States.add("Approved");
		arr1States.add("Registered");
		
		ArrayNode arr3States = ((ObjectNode) arr3).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr3States.add("Approved");
		arr3States.add("Registered");
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr1.put("order", "4");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr2.put("order", "2");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.put("order", "3");
		arr3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		assertEquals(responseNode.size(), 2);
	}
	
	@Test(expected = ResourceNotFoundException.class)
	public void testGetPortalConfigModelMissigNode() throws PortalConfigException {
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setSort("order");
        restConfig.setDepth(1);
        restConfig.setVersion(1);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
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
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
	}
	
	@Test
	public void testGetPortalConfigModelForArrayObject() throws PortalConfigException, IOException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        portalNodes.add("3");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setDepth(1);
        restConfig.setVersion(1);
        restConfig.setResolveExtConfig(false);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		Mockito.when(portalService.getPublishedPortalStatus(Mockito.any(Credentials.class), Mockito.anyString(), Mockito.anyString())).thenReturn(PortalMetadataContants.PORTAL_STATUS_STOP);
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		assertEquals(responseNode.get(PortalMetadataContants.PAGE_NAME_ATTRIBUTE).asText(), "neemoPage");
	}
	
	@Test
	public void testGetPortalConfigModelForObject() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals(1)");
        portalNodes.add("header");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setDepth(1);
        restConfig.setVersion(1);
        restConfig.setResolveExtConfig(false);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		assertNotNull(responseNode);
	}
	
	@Test
	public void testGetPortalConfigModelForAttribute() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        portalNodes.add("3");
        portalNodes.add("name");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setDepth(1);
        restConfig.setVersion(1);
        restConfig.setResolveExtConfig(false);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		assertNotNull(responseNode.get(PortalMetadataContants.PAGE_NAME_ATTRIBUTE));
	}

	@Test(expected = ResourceNotFoundException.class)
	public void testGetPortalConfigModelException() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals(1)");
		portalNodes.add("header");
        portalNodes.add("pages(3)");
        portalNodes.add("name");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setDepth(1);
        restConfig.setVersion(1);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
	}
	
	@Test
	public void testCreatePortalConfigModelList() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setVersion(2);
        List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode payloadNode = portalNode.deepCopy();
		ArrayNode arrayNode = ((ObjectNode) payloadNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(portalService.getSequence(credentials, "orcl-Supplier")).thenReturn(1L);
		Mockito.when(metaModelService.appendPortalConfigModel(traversePath, portalNode, arrayNode, false, null)).thenReturn(payloadNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class))).thenReturn(payloadNode);
		Mockito.when(mapperService.isEStructuralFeatureList(traversePath)).thenReturn(true);
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		JsonNode responseNode = portalConfigServiceImpl.createPortalConfigModel(credentials, restConfig, arrayNode, null,request);
		assertNotNull(responseNode);
	}
	
	@Test
	public void testCreatePortalConfigModelForPublish() throws PortalConfigException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        //Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		Mockito.when(portalService.getPortalConfigDraft(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalService.isPublishedPortalNameExistById(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		Mockito.when(portalService.publishPortalConfig(credentials, portalObjectNode)).thenReturn(versionNode);
		Mockito.when(portalService.getBundles(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(null);
		Mockito.when(portalService.saveBundles(Mockito.any(Credentials.class), Mockito.any(byte[].class),Mockito.any(String.class), Mockito.any(String.class))).thenReturn(versionNode);
		portalConfigServiceImpl.createPortalConfigModel(credentials, restConfig, new ObjectMapper().createObjectNode(), PortalMetadataContants.PORTAL_CONFIG_URI_PUBLISH_ACTION,request);
		verify(portalService).publishPortalConfig(Mockito.any(Credentials.class), Mockito.any());
	}
	
	@Test
	public void testCreatePortalConfigModelListObject() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setVersion(2);
        List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode payloadNode = portalNode.deepCopy();
		ArrayNode arrayNode = ((ObjectNode) payloadNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		arrayNode.add(arr1);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(portalService.getSequence(credentials, "orcl-Supplier")).thenReturn(1L);
		Mockito.when(metaModelService.appendPortalConfigModel(traversePath, portalNode, arr1, false, null)).thenReturn(payloadNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class))).thenReturn(payloadNode);
		Mockito.when(mapperService.isEStructuralFeatureList(traversePath)).thenReturn(true);
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		JsonNode responseNode = portalConfigServiceImpl.createPortalConfigModel(credentials, restConfig, arr1, null,request);
		assertNotNull(responseNode);
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testCreatePortalConfigModelException() throws PortalConfigException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		List<String> portalNodes = new ArrayList<String>();
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setVersion(2);
        List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode payloadNode = portalNode.deepCopy();
		ArrayNode arrayNode = ((ObjectNode) payloadNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		arrayNode.add(arr1);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(portalService.getSequence(credentials, "orcl-Supplier")).thenReturn(1L);
		Mockito.when(metaModelService.appendPortalConfigModel(traversePath, portalNode, arr1, false, null)).thenReturn(payloadNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class))).thenReturn(payloadNode);
		Mockito.when(mapperService.isEStructuralFeatureList(traversePath)).thenReturn(true);
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		JsonNode responseNode = portalConfigServiceImpl.createPortalConfigModel(credentials, restConfig, new ObjectMapper().createObjectNode(), null,request);
		assertNotNull(responseNode);
	}
	
	@Test
	public void testUpdatePortalConfigModel() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setVersion(2);
        List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode payloadNode = portalNode.deepCopy();
		ArrayNode arrayNode = ((ObjectNode) payloadNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		arrayNode.add(arr1);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(portalService.getSequence(credentials, "orcl-Supplier")).thenReturn(1L);
		Mockito.when(metaModelService.appendPortalConfigModel(traversePath, portalNode, arr1, true, PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(payloadNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class))).thenReturn(payloadNode);
		Mockito.when(mapperService.isEStructuralFeatureList(traversePath)).thenReturn(true);
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		JsonNode responseNode = portalConfigServiceImpl.updatePortalConfigModel(credentials, restConfig, arr1);
		assertNotNull(responseNode);
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testUpdatePortalConfigModelException() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setVersion(2);
        List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode payloadNode = portalNode.deepCopy();
		ArrayNode arrayNode = ((ObjectNode) payloadNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		arrayNode.add(arr1);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(portalService.getSequence(credentials, "orcl-Supplier")).thenReturn(1L);
		Mockito.when(metaModelService.appendPortalConfigModel(traversePath, portalNode, arr1, true, PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(payloadNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class))).thenReturn(payloadNode);
		Mockito.when(mapperService.isEStructuralFeatureList(traversePath)).thenReturn(true);
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		JsonNode responseNode = portalConfigServiceImpl.updatePortalConfigModel(credentials, restConfig, new ObjectMapper().createObjectNode());
		assertNotNull(responseNode);
	}
	
	@Test
	public void testPatchUpdatePortalConfigModel() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setVersion(2);
        List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode payloadNode = portalNode.deepCopy();
		ArrayNode arrayNode = ((ObjectNode) payloadNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		arrayNode.add(arr1);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(portalService.getSequence(credentials, "orcl-Supplier")).thenReturn(1L);
		Mockito.when(metaModelService.patchUpdatePortalConfigModel(traversePath, portalNode, arr1, PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(payloadNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class))).thenReturn(payloadNode);
		Mockito.when(mapperService.isEStructuralFeatureList(traversePath)).thenReturn(true);
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		JsonNode responseNode = portalConfigServiceImpl.patchUpdatePortalConfigModel(credentials, restConfig, arr1);
		assertNotNull(responseNode);
	}
	
	@Test(expected = PortalConfigServiceException.class)
	public void testPatchUpdatePortalConfigModelException() throws PortalConfigException {
		
		List<String> portalNodes = new ArrayList<String>();
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setVersion(2);
        List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode payloadNode = portalNode.deepCopy();
		ArrayNode arrayNode = ((ObjectNode) payloadNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		arrayNode.add(arr1);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
		        return new ObjectMapper().createObjectNode();
		     }
		});
		Mockito.when(portalService.getSequence(credentials, "orcl-Supplier")).thenReturn(1L);
		Mockito.when(metaModelService.patchUpdatePortalConfigModel(traversePath, portalNode, arr1, PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(payloadNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class))).thenReturn(payloadNode);
		Mockito.when(mapperService.isEStructuralFeatureList(traversePath)).thenReturn(true);
		//Mockito.when(validationService.validatePath(Mockito.any())).thenReturn(PortalMetadataContants.PATH_VALIDATE_WITH_ID);
		JsonNode responseNode = portalConfigServiceImpl.patchUpdatePortalConfigModel(credentials, restConfig, new ObjectMapper().createObjectNode());
		assertNotNull(responseNode);
	}
	
	@Test
	public void testIsPortalNameExist() throws PortalConfigException {
		
		PortalPersistenceServiceImpl persistenceService = Mockito.spy(new PortalPersistenceServiceImpl());
		Mockito.doReturn(false).when(persistenceService).isDraftPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier");
		Mockito.doReturn(false).when(persistenceService).isPublishedPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier");
		assertFalse(persistenceService.isPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testIsPortalNameExistTrue() throws PortalConfigException {
		
		PortalPersistenceServiceImpl persistenceService = Mockito.spy(new PortalPersistenceServiceImpl());
		Mockito.doReturn(true).when(persistenceService).isDraftPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier");
		Mockito.doReturn(false).when(persistenceService).isPublishedPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier");
		assertTrue(persistenceService.isPortalNameExist(credentials, "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testIsPortalNameExistById() throws PortalConfigException {
		
		PortalPersistenceServiceImpl persistenceService = Mockito.spy(new PortalPersistenceServiceImpl());
		Mockito.doReturn(false).when(persistenceService).isDraftPortalNameExistById(credentials, "Freddy Keuger Portal", "1", "orcl-Supplier");
		Mockito.doReturn(false).when(persistenceService).isPublishedPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier");
		assertFalse(persistenceService.isPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testIsPortalNameExistByIdTrue() throws PortalConfigException {
		
		PortalPersistenceServiceImpl persistenceService = Mockito.spy(new PortalPersistenceServiceImpl());
		Mockito.doReturn(true).when(persistenceService).isDraftPortalNameExistById(credentials, "Freddy Keuger Portal", "1", "orcl-Supplier");
		Mockito.doReturn(false).when(persistenceService).isPublishedPortalNameExistById(credentials, "Freddy Keuger Portal", "1", "orcl-Supplier");
		assertTrue(persistenceService.isPortalNameExistById(credentials, "1", "Freddy Keuger Portal", "orcl-Supplier"));
	}
	
	@Test
	public void testDeletePortalConfigModel() throws PortalConfigException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
		portalNodes.add(PortalMetadataContants.PAGE_ATTRIBUTE);
		restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
		restConfig.setVersion(2);
		List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(),
				Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode updatedNode = portalNode.deepCopy();
		((ObjectNode) updatedNode).remove(PortalMetadataContants.PAGE_ATTRIBUTE);
		Mockito.when(metaModelService.deleteFromPortalConfigModel(traversePath, portalNode)).thenReturn(updatedNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class)))
				.thenReturn(updatedNode);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
				return new ObjectMapper().createObjectNode();
			}
		});
		portalConfigServiceImpl.deletePortalConfigModel(credentials, restConfig, null,request);
		verify(metaModelService, atLeastOnce()).deleteFromPortalConfigModel(traversePath, portalNode);
	}

	@Test(expected = ResourceNotFoundException.class)
	public void testDeletePortalConfigModelException() throws PortalConfigException {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
		restConfig.setVersion(2);
		List<String> traversePath = restConfig.getPortalNodes().stream()
				.skip(2)
				.collect(Collectors.toList());
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(),
				Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_VERSION, "1");
		JsonNode updatedNode = portalNode.deepCopy();
		((ObjectNode) updatedNode).remove(PortalMetadataContants.PAGE_ATTRIBUTE);
		Mockito.when(metaModelService.deleteFromPortalConfigModel(traversePath, portalNode)).thenReturn(updatedNode);
		Mockito.when(portalService.savePortalConfigInDraft(Mockito.any(Credentials.class), Mockito.any(JsonNode.class)))
				.thenReturn(updatedNode);
		Mockito.when(mapper.createObjectNode()).thenAnswer(new Answer<ObjectNode>() {
			public ObjectNode answer(InvocationOnMock invocation) {
				return new ObjectMapper().createObjectNode();
			}
		});
		portalConfigServiceImpl.deletePortalConfigModel(credentials, restConfig, null,request);
		verify(metaModelService, atLeastOnce()).deleteFromPortalConfigModel(traversePath, portalNode);
	}
	
	@Test
	public void testGetPortalConfigModelWithFilterAsArray() throws PortalConfigException, IOException {
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        String filter = "{\"states\": [\"Approved\",\"Registered\"]}";
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setSort("order");
        restConfig.setDepth(0);
        restConfig.setVersion(1);
        restConfig.setFilter(objectMapper.readTree(filter));
        restConfig.setResolveExtConfig(false);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		List<String> states = new ArrayList<String>();
		states.add("Approved");
		states.add("Registered");
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		ArrayNode arr1States = ((ObjectNode) arr1).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr1States.add("Approved");
		arr1States.add("Registered");
		
		ArrayNode arr3States = ((ObjectNode) arr3).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr3States.add("Approved");
		arr3States.add("Registered");
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr1.put("order", "4");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr2.put("order", "2");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.put("order", "3");
		arr3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		assertEquals(responseNode.size(), 2);
	}
	
	@Test
	public void testGetPortalConfigModelWithFilterWithMultiKey() throws PortalConfigException, IOException {
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        String filter = "{\"states\":[\"Approved\",\"Registered\"],\"layout\":{\"sections\":{\"isDefault\":false}}}";
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setSort("order");
        restConfig.setDepth(0);
        restConfig.setVersion(1);
        restConfig.setFilter(objectMapper.readTree(filter));
        restConfig.setResolveExtConfig(false);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		List<String> states = new ArrayList<String>();
		states.add("Approved");
		states.add("Registered");
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = (ObjectNode) new ObjectMapper().readTree(PAGE_NODE_VALUE2);
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		ArrayNode arr1States = ((ObjectNode) arr1).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr1States.add("Approved");
		arr1States.add("Registered");
		
		ArrayNode arr3States = ((ObjectNode) arr3).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr3States.add("Approved");
		arr3States.add("Registered");
		
		ArrayNode arr2States = ((ObjectNode) arr2).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr2States.add("Approved");
		arr2States.add("Registered");
		
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr1.put("order", "4");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr2.put("order", "2");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.put("order", "3");
		arr3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		assertEquals(responseNode.size(), 2);
	}
	
	@Test
	public void testGetPortalConfigModelCollectionWithProjections() throws PortalConfigException, IOException {
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        String filter = "{\"states\": [\"Approved\",\"Registered\"]}";
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setSort("order");
        restConfig.setDepth(0);
        restConfig.setVersion(1);
        restConfig.setResolveExtConfig(false);
        restConfig.setFilter(objectMapper.readTree(filter));
        List<String> projections = new ArrayList<String>();
        projections.add(PortalMetadataContants.PAGE_NAME_ATTRIBUTE);
        restConfig.setProjections(projections);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		List<String> states = new ArrayList<String>();
		states.add("Approved");
		states.add("Registered");
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		ArrayNode arr1States = ((ObjectNode) arr1).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr1States.add("Approved");
		arr1States.add("Registered");
		
		ArrayNode arr3States = ((ObjectNode) arr3).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr3States.add("Approved");
		arr3States.add("Registered");
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr1.put("order", "4");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr2.put("order", "2");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.put("order", "3");
		arr3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		Iterator<String> projectedFields = ((ObjectNode) responseNode.get(0)).fieldNames();
		assertEquals(projectedFields.next(), PortalMetadataContants.PAGE_NAME_ATTRIBUTE);
	}
	
	@Test
	public void testGetPortalConfigModelObjectWithProjection() throws PortalConfigException {
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("header");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setDepth(1);
        restConfig.setVersion(1);
        restConfig.setResolveExtConfig(false);
        List<String> projections = new ArrayList<String>();
        projections.add("backgroundColor");
        restConfig.setProjections(projections);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.putPOJO(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		Iterator<String> projectedFields = ((ObjectNode) responseNode).fieldNames();
		assertEquals(projectedFields.next(), "backgroundColor");
	}
	
	@Test
	public void testGetPortalConfigModelValueNodeWithProjections() throws PortalConfigException, IOException {
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
		portalNodes.add("1");
        portalNodes.add("pages");
        portalNodes.add("4");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setSort("order");
        restConfig.setDepth(0);
        restConfig.setVersion(1);
        restConfig.setResolveExtConfig(false);
        List<String> projections = new ArrayList<String>();
        projections.add(PortalMetadataContants.PAGE_NAME_ATTRIBUTE);
        restConfig.setProjections(projections);
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		ArrayNode arrayNode = ((ObjectNode) portalNode).putArray(PortalMetadataContants.PAGE_ATTRIBUTE);
		List<String> states = new ArrayList<String>();
		states.add("Approved");
		states.add("Registered");
		ObjectNode arr1 = portalGrandChildNode.deepCopy();
		ObjectNode arr2 = portalGrandChildNode.deepCopy();
		ObjectNode arr3 = portalGrandChildNode.deepCopy();
		ArrayNode arr1States = ((ObjectNode) arr1).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr1States.add("Approved");
		arr1States.add("Registered");
		
		ArrayNode arr3States = ((ObjectNode) arr3).putArray(PortalMetadataContants.STATE_ATTRIBUTE);
		arr3States.add("Approved");
		arr3States.add("Registered");
		arr1.put(PortalMetadataContants.ID_ATTRIBUTE, "2");
		arr1.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "moanaPage");
		arr1.put("order", "4");
		arr2.put(PortalMetadataContants.ID_ATTRIBUTE, "3");
		arr2.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "neemoPage");
		arr2.put("order", "2");
		arr3.put(PortalMetadataContants.ID_ATTRIBUTE, "4");
		arr3.put("order", "3");
		arr3.put(PortalMetadataContants.PAGE_NAME_ATTRIBUTE, "freddiePage");
		arrayNode.add(arr1);
		arrayNode.add(arr2);
		arrayNode.add(arr3);
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
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		Iterator<String> projectedFields = ((ObjectNode) responseNode).fieldNames();
		assertEquals(projectedFields.next(), PortalMetadataContants.PAGE_NAME_ATTRIBUTE);
	}
	
	@Test
	public void testGetPortalConfigModelValueNodeWithPagination() throws PortalConfigException, IOException {
		ArrayNode portals = new ObjectMapper().createArrayNode();
		ObjectNode portal = new ObjectMapper().createObjectNode();
		portal.put(PortalMetadataContants.PORTAL_NAME, "Portal-Type-1");
		portal.put(PortalMetadataContants.PORTAL_ID, "1");
		portals.add(portal);
		ObjectNode portal2 = new ObjectMapper().createObjectNode();
		portal2.put(PortalMetadataContants.PORTAL_NAME, "Portal-Type-2");
		portal2.put(PortalMetadataContants.PORTAL_ID, "2");
		portals.add(portal2);
		ObjectNode portal3 = new ObjectMapper().createObjectNode();
		portal3.put(PortalMetadataContants.PORTAL_NAME, "Portal-Type-3");
		portal3.put(PortalMetadataContants.PORTAL_ID, "3");
		portals.add(portal3);
		ObjectNode portal4 = new ObjectMapper().createObjectNode();
		portal4.put(PortalMetadataContants.PORTAL_NAME, "Portal-Type-4");
		portal4.put(PortalMetadataContants.PORTAL_ID, "4");
		portals.add(portal4);
		List<String> portalNodes = new ArrayList<String>();
		portalNodes.add("portals");
        restConfig = new PortalRestConfig("orcl-Supplier", 1, portalNodes);
        restConfig.setDepth(1);
        restConfig.setPageSize(2);
        restConfig.setCurrentPage(1);
	
        Mockito.when(portalService.getPortals(Mockito.any(Credentials.class), Mockito.anyBoolean())).thenReturn(portals);
        
		JsonNode responseNode = portalConfigServiceImpl.getPortalConfigModel(credentials, restConfig,"ict");
		assertEquals(responseNode.size(), 2);
	}
	
	@Test
	public void testGetBEViewByName() throws PortalConfigException, IOException {
		HttpServletRequest httpRequest = Mockito.mock(HttpServletRequest.class);
		JsonNode beViewLookUpNode = objectMapper.readTree(beViewLookup);
		String authCookie = "mdmsessionid" + "=" + "mdmSessionId";
		HttpHeaders headers = new HttpHeaders();
		headers.add("Cookie", authCookie);
		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, ICT);
		HttpEntity<?> request = new HttpEntity<String>(headers);
		String apiUrl = "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_HUB/meta/view.json?recordsToReturn=100";
		Mockito.when(restTemplate.exchange(apiUrl, HttpMethod.GET, request, JsonNode.class))
				.thenReturn(externalMetadataResponse);
		Mockito.when(externalMetadataResponse.getBody()).thenReturn(beViewLookUpNode);
		Mockito.when(mapper.createArrayNode()).thenReturn(objectMapper.createArrayNode());
		Mockito.when(PortalConfigUtil.getCookieValue(httpRequest, PortalServiceConstants.MDM_CSRF_TOKEN_CONFIG)).thenReturn(ICT);
		JsonNode beBiewArray = portalConfigServiceImpl.getBEViewByName("Supplier", "mdmSessionId",
				"localhost-orcl-SUPPLIER_HUB", "http://localhost:8080",httpRequest);
		assertEquals("SupplierView", beBiewArray.get(1).asText());
	}
	
	@Test
	public void testGetRuntimeConfig() throws PortalConfigException, IOException {
		
		Mockito.when(portalService.getPortalRuntimeConfig(credentials, "localhost-orcl-SUPPLIER_HUB", "1")).thenReturn(runtimeConfigNode);
		List<String> projections = new ArrayList<String>();
		projections.add("name");
		projections.add("value");
		projections.add("configuration");
		String filter = "{\"name\": [\"Login Section\"]}";
		PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig("localhost-orcl-SUPPLIER_HUB", null, null, filter,
				  null, null, null, null, null, projections, false);
		JsonNode responseNode = portalConfigServiceImpl.getRuntimeConfig(credentials, "1", restConfig);
		assertEquals("uniqueFieldPath", responseNode.get(0).get("configuration").get(0).get("key").asText());
	}
	
	@Test
	public void testSaveRuntimeConfig() throws PortalConfigException {
		
		Mockito.when(portalService.savePortalRuntimeConfig(credentials, runtimeConfigNode, "localhost-orcl-SUPPLIER_HUB", "1")).thenReturn(versionNode);
		assertNotNull(versionNode);
	}
	
	@Test
	public void testUpdatePortalState() throws PortalConfigException, MetaModelException {
		
		Mockito.when(metaModelService.getPortalFromResource(Mockito.any(String.class), Mockito.any(), Mockito.any(Integer.class), Mockito.any(String.class))).thenReturn(portalNode);
		Mockito.when(portalService.getPortalConfigDraftByVersion(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(Integer.class))).thenReturn(portalNode);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalNode);
		
		Mockito.when(portalService.savePortalConfigInDraft(credentials, portalNode)).thenReturn(versionNode);
		Mockito.when(portalService.isPortalNameExist(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(metaModelService.savePortalToResource(portalNode, "username")).thenReturn("portalID");
		Mockito.when(metaModelService.mapToEcoreJson(Mockito.any(JsonNode.class), Mockito.anyString())).thenReturn(portalObjectNode);
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		
		Mockito.when(mapper.createObjectNode()).thenReturn(portalObjectNode);
		Mockito.when(portalService.isPublishedPortalNameExistById(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(false);
		Mockito.when(portalService.getPortalConfigDraft(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		Mockito.when(portalService.publishPortalConfig(Mockito.any(), Mockito.any())).thenReturn(portalObjectNode);
		Mockito.when(portalService.getPublishedPortalConfig(Mockito.any(Credentials.class), Mockito.any(String.class), Mockito.any(String.class))).thenReturn(portalObjectNode);
		Mockito.when(cacheService.clearCache(Mockito.any())).thenReturn(externalConfigCache);
		portalConfigServiceImpl.updatePortalStatus(credentials, "portalID", "localhost-SUPPPLIER-ORCL", "Start");
		
		verify(portalService).updatePortalState(Mockito.any(Credentials.class), Mockito.any());
	}
	
	@Test
	public void testGenerateProps() throws PortalConfigException {
		
		PortalConfigServiceImpl portalConfigService = Mockito.spy(new PortalConfigServiceImpl());
		Properties props = new Properties();
		props.setProperty(PortalMetadataContants.PORTAL_NAME, localisationNode.get(PortalMetadataContants.PORTAL_NAME).asText());
		props.setProperty(PortalMetadataContants.PORTAL_TITLE, localisationNode.get(PortalMetadataContants.PORTAL_TITLE).asText());
		portalConfigService.generateProps(localisationNode, props, "");
		assertNotNull(props);

	}
	
	@Test
	public void testIsPortalExistByIdForDraft() throws PortalConfigException {
		
		Mockito.when(portalService.isDraftPortalExistById(credentials, "portalId", "orsId")).thenReturn(true);
		assertTrue(portalConfigServiceImpl.isPortalExistById(credentials, "portalId", "orsId", PortalMetadataContants.PORTAL_STATE_DRAFT));
	}
	
	@Test
	public void testIsPortalExistByIdForPublished() throws PortalConfigException {
		
		Mockito.when(portalService.isPublishedPortalExistById(credentials, "portalId", "orsId")).thenReturn(true);
		assertFalse(portalConfigServiceImpl.isPortalExistById(credentials, "portalId", "orsId", PortalMetadataContants.PORTAL_STATE_DRAFT));
	}
	
}
