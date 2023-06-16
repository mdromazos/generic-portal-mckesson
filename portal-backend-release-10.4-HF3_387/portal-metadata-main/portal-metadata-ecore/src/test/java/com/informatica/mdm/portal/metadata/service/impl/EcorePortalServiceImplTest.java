package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.eclipse.emf.common.util.BasicEList;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.modules.junit4.PowerMockRunner;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.service.EcoreMapperService;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;

@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
public class EcorePortalServiceImplTest {

	@InjectMocks
	EcorePortalServiceImpl ecorePortalServiceImpl;
	
	@Mock
	EcoreMapperService ecoreMapperService;
	
	@Mock
	ResourceSet jsonResourceSet;
	
	@Mock
	ObjectMapper mapper;

	JsonNode portalNode, portalChildNode,
	portalGrandChildNode, sectionReferenceData;
	
	@Mock
	Resource portalResource;
	
	@Mock
	EList<Resource> resourceList;
	
	@Mock
	EObject portalEobject;
	
	@Mock
	EObject childEobject;
	
	@Mock
	EList<EObject> eList;
	
	@Mock
	EClass eClass;
	
	@Mock
	File file;
	
	@Mock
	EStructuralFeature eStructuralFeature;
	
	@Mock
	private Properties errorCodeProperties;
	
	ObjectMapper objectMapper;
	
	private static final String PAGE_NODE_VALUE = "{\"name\":\"freddieKeugerPage\",\"type\":true,\"accessType\":0,\"layout\":{\"sections\":[{\"displayIcon\":\"icon image\",\"isDefault\":false,\"orientation\":\"orien\",\"customStyle\":\"custom-style\",\"backgroundColor\":\"bg-color\",\"containers\":[{\"content\":\"container\",\"style\":{\"width\":1}}]}]}}";
	private static final String PAGES_ARRAY_NODE = "[{\"id\":\"2\",\"name\":\"moanaPage\"},{\"id\":\"3\",\"name\":\"neemoPage\"},{\"id\":\"4\",\"name\":\"freddiePage\"}]";
	private static final String PORTAL_NODE = "{\"portalName\":\"Supplier Portal\",\"isStateEnabled\":true,\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\"}";
	private static final String REFERENCE_DATA_SECTIONS = "[{\"eClass\":\"http://www.informatica.com/mdm/config/model/v1#//LayoutSection\",\"sectionType\":\"Section-Type 1\",\"displayIcon\":\"rectangle\",\"containers\":[{\"eClass\":\"http://www.informatica.com/mdm/config/model/v1#//SectionContainer\",\"style\":{\"eClass\":\"http://www.informatica.com/mdm/config/model/v1#//LayoutStyle\",\"width\":1}}]}]";

	
	@Before
	public void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		objectMapper = new ObjectMapper();
		portalNode = objectMapper.readTree(PORTAL_NODE);
        portalChildNode = objectMapper.readTree(PAGES_ARRAY_NODE);
        portalGrandChildNode = objectMapper.readTree(PAGE_NODE_VALUE);
        sectionReferenceData = objectMapper.readTree(REFERENCE_DATA_SECTIONS);
        when(errorCodeProperties.getProperty(Mockito.anyString())).thenReturn("Exception Occured");
	}

	@Test
	public void testSavePortalToResource() throws IOException, MetaModelException {
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(null);
		Mockito.when(jsonResourceSet.createResource(Mockito.any(URI.class))).thenReturn(portalResource);
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS)).thenReturn(portalEobject);
		Mockito.when(portalResource.getContents()).thenReturn(eList);
		assertNotNull(ecorePortalServiceImpl.savePortalToResource(portalNode, "username"));
	}
	
	@Test(expected = MetaModelException.class)
	public void testSavePortalToResourceException() throws IOException, MetaModelException {
		((ObjectNode) portalNode).put(PortalMetadataContants.PORTAL_ID, "1");
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(null);
		Mockito.when(jsonResourceSet.createResource(Mockito.any(URI.class))).thenReturn(portalResource);
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS)).thenReturn(portalEobject);
		ecorePortalServiceImpl.savePortalToResource(portalNode, "username");
	}

	@Test
	public void testGetPortalFromResource() throws MetaModelException, IOException {
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		doNothing().when(portalResource).load(null);
		Mockito.when(portalResource.getContents()).thenReturn(eList);
		Mockito.when(eList.get(0)).thenReturn(portalEobject);
		Mockito.when(ecoreMapperService.mapPortalJsonFromEObject(portalEobject)).thenReturn(portalNode);
		Mockito.when(portalEobject.eGet(eStructuralFeature)).thenReturn("1");
		Mockito.when(portalEobject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.PORTAL_VERSION)).thenReturn(eStructuralFeature);
		assertNotNull(ecorePortalServiceImpl.getPortalFromResource("portalID", "username", 1, "orcl-Supplier"));
	}
	
	@Test
	public void testGetPortalFromResourceVersionMismatch() throws MetaModelException, IOException {
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		doNothing().when(portalResource).load(null);
		Mockito.when(portalResource.getContents()).thenReturn(eList);
		Mockito.when(eList.get(0)).thenReturn(portalEobject);
		Mockito.when(ecoreMapperService.mapPortalJsonFromEObject(portalEobject)).thenReturn(portalNode);
		Mockito.when(portalEobject.eGet(eStructuralFeature)).thenReturn("2");
		Mockito.when(portalEobject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.PORTAL_VERSION)).thenReturn(eStructuralFeature);
		assertNull(ecorePortalServiceImpl.getPortalFromResource("portalID", "username", 1, "orcl-Supplier"));
	}
	
	@Test(expected = MetaModelException.class)
	public void testGetPortalFromResourceException() throws MetaModelException, IOException {
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		ecorePortalServiceImpl.getPortalFromResource("portalID", "username", 1, "orcl-Supplier");
	}
	
	@Test(expected = MetaModelException.class)
	public void testMapToEcoreJsonException() throws MetaModelException, IOException, Exception {
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS)).thenReturn(portalEobject);
		Mockito.when(mapper.valueToTree(Mockito.any())).thenThrow(IllegalArgumentException.class);
		ecorePortalServiceImpl.mapToEcoreJson(portalNode,PortalMetadataContants.PORTAL_ECLASS);
	}
	
	@Test
	public void testMapToEcoreJson() throws MetaModelException, IOException, Exception {
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS)).thenReturn(portalEobject);
		Mockito.when(mapper.valueToTree(Mockito.any())).thenReturn(portalNode);
		assertNotNull(ecorePortalServiceImpl.mapToEcoreJson(portalNode,PortalMetadataContants.PORTAL_ECLASS));
	}
	
	@Test
	public void testDeletePortalFromResourceSet() throws Exception {
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		Mockito.doNothing().when(portalResource).load(null);
		Mockito.when(jsonResourceSet.getResources()).thenReturn(resourceList);
		Mockito.when(resourceList.remove(portalResource)).thenReturn(true);
		ecorePortalServiceImpl.deletePortalFromResourceSet("portald", "username", "orcl-Supplier");
		verify(resourceList, atLeastOnce()).remove(portalResource);
	}
	
	@Test(expected = MetaModelException.class)
	public void testDeletePortalFromResourceSetException() throws Exception {
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		Mockito.doNothing().when(portalResource).load(null);
		Mockito.when(jsonResourceSet.getResources()).thenReturn(null);
		ecorePortalServiceImpl.deletePortalFromResourceSet("portald", "username", "orcl-Supplier");
	}
	
	@Test
	public void testGetReferenceDataByUriStates() throws MetaModelException {
		
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		ecoreList.add(childEobject);
		Mockito.when(portalResource.getContents()).thenReturn(ecoreList);
		Mockito.when(mapper.createArrayNode()).thenReturn(objectMapper.createArrayNode());
		Mockito.when(ecoreMapperService.mapPortalJsonFromEObjectByEClass(childEobject,
				PortalMetadataContants.STATE_ECLASS)).thenReturn(sectionReferenceData);
		assertEquals(ecorePortalServiceImpl.getReferenceDataByUri(PortalMetadataContants.STATE_ATTRIBUTE).size(), 1);
	}
	
	@Test
	public void testGetReferenceDataByUriSections() throws MetaModelException {
		
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		ecoreList.add(childEobject);
		Mockito.when(portalResource.getContents()).thenReturn(ecoreList);
		Mockito.when(mapper.createArrayNode()).thenReturn(objectMapper.createArrayNode());
		Mockito.when(ecoreMapperService.mapPortalJsonFromEObjectByEClass(childEobject,
				PortalMetadataContants.SECTION_ECLASS)).thenReturn(sectionReferenceData);
		assertEquals(ecorePortalServiceImpl.getReferenceDataByUri("sections").size(), 1);
	}
	
	@Test(expected = MetaModelException.class)
	public void testGetReferenceDataByUriException() throws MetaModelException {
		
		Mockito.when(jsonResourceSet.getResource(Mockito.any(URI.class), Mockito.anyBoolean())).thenReturn(portalResource);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		ecoreList.add(childEobject);
		Mockito.when(portalResource.getContents()).thenReturn(ecoreList);
		Mockito.when(mapper.createArrayNode()).thenReturn(objectMapper.createArrayNode());
		Mockito.when(ecoreMapperService.mapPortalJsonFromEObjectByEClass(childEobject,
				PortalMetadataContants.STATE_ECLASS)).thenThrow(MetaModelException.class);
		ecorePortalServiceImpl.getReferenceDataByUri(PortalMetadataContants.STATE_ATTRIBUTE);
	}
	
	@Test
	public void testLoadReferenceData() throws MetaModelException, Exception {
		
		Mockito.when(jsonResourceSet.createResource(Mockito.any(URI.class))).thenReturn(portalResource);
		Mockito.when(file.getName()).thenReturn("sections.json");
		Mockito.when(ecoreMapperService.mapEObjectFromJson(((ArrayNode) sectionReferenceData).get(0),
				PortalMetadataContants.SECTION_ECLASS)).thenReturn(childEobject);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		Mockito.when(portalResource.getContents()).thenReturn(ecoreList);
		org.springframework.core.io.Resource resource = Mockito.mock(org.springframework.core.io.Resource.class);
		InputStream inputStream = Mockito.mock(InputStream.class);
		Mockito.when(resource.getFilename()).thenReturn("sections.json");
		Mockito.when(resource.getInputStream()).thenReturn(inputStream);
		Mockito.when(mapper.readTree(inputStream)).thenReturn(sectionReferenceData);
		ecorePortalServiceImpl.loadReferenceData(resource);
		verify(ecoreMapperService, atLeastOnce()).mapEObjectFromJson(((ArrayNode) sectionReferenceData).get(0),
				PortalMetadataContants.SECTION_ECLASS);
	}
	
	@Test(expected = MetaModelException.class)
	public void testLoadReferenceDataMMException() throws MetaModelException, Exception {
		
		Mockito.when(jsonResourceSet.createResource(Mockito.any(URI.class))).thenReturn(portalResource);
		Mockito.when(mapper.readTree(file)).thenReturn(sectionReferenceData);
		Mockito.when(file.getName()).thenReturn("sections.json");
		Mockito.when(ecoreMapperService.mapEObjectFromJson(((ArrayNode) sectionReferenceData).get(0),
				PortalMetadataContants.SECTION_ECLASS)).thenThrow(MetaModelException.class);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		org.springframework.core.io.Resource resource = Mockito.mock(org.springframework.core.io.Resource.class);
		ecorePortalServiceImpl.loadReferenceData(resource);
		Mockito.when(portalResource.getContents()).thenReturn(ecoreList);
		ecorePortalServiceImpl.loadReferenceData(resource);
	}
	
	@Test(expected = MetaModelException.class)
	public void testLoadReferenceDataException() throws MetaModelException, Exception {
		
		Mockito.when(jsonResourceSet.createResource(Mockito.any(URI.class))).thenReturn(null);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		Mockito.when(portalResource.getContents()).thenReturn(ecoreList);
		org.springframework.core.io.Resource resource = Mockito.mock(org.springframework.core.io.Resource.class);
		ecorePortalServiceImpl.loadReferenceData(resource);
		ecorePortalServiceImpl.loadReferenceData(resource);
	}
	
	@Test
	public void testAppendPortalConfigModel() throws MetaModelException {
		
		List<String> path = new ArrayList<String>();
		path.add("pages");
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS)).thenReturn(portalEobject);
		Mockito.when(portalEobject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.PAGE_ATTRIBUTE)).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		ecoreList.add(childEobject);
		Mockito.when(portalEobject.eGet(eStructuralFeature)).thenReturn(ecoreList);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ATTRIBUTE);
		Mockito.when(ecoreMapperService.updatePortalConfig(eStructuralFeature, portalEobject, portalGrandChildNode, PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(portalEobject);
		Mockito.doNothing().when(childEobject).eSet(eStructuralFeature, childEobject);
		Mockito.when(mapper.valueToTree(portalEobject)).thenReturn(portalNode);
		assertNotNull(ecorePortalServiceImpl.appendPortalConfigModel(path, portalNode, portalGrandChildNode, false, PortalMetadataContants.ID_ATTRIBUTE));
	}
	
	@Test
	public void testAppendPortalConfigModelUpdate() throws MetaModelException {
		
		List<String> path = new ArrayList<String>();
		path.add("pages");
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS)).thenReturn(portalEobject);
		Mockito.when(portalEobject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.PAGE_ATTRIBUTE)).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		ecoreList.add(childEobject);
		Mockito.when(portalEobject.eGet(eStructuralFeature)).thenReturn(ecoreList);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ATTRIBUTE);
		Mockito.when(ecoreMapperService.updatePortalConfig(eStructuralFeature, portalEobject, portalGrandChildNode, PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(portalEobject);
		Mockito.doNothing().when(childEobject).eSet(eStructuralFeature, childEobject);
		Mockito.when(mapper.valueToTree(portalEobject)).thenReturn(portalNode);
		assertNotNull(ecorePortalServiceImpl.appendPortalConfigModel(path, portalNode, portalGrandChildNode, true, PortalMetadataContants.ID_ATTRIBUTE));
	}
	
	@Test
	public void testPatchUpdatePortalConfigModel() throws MetaModelException {
		
		List<String> path = new ArrayList<String>();
		path.add("pages");
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS)).thenReturn(portalEobject);
		Mockito.when(portalEobject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.PAGE_ATTRIBUTE)).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		ecoreList.add(childEobject);
		Mockito.when(portalEobject.eGet(eStructuralFeature)).thenReturn(ecoreList);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ATTRIBUTE);
		Mockito.when(ecoreMapperService.patchUpdatePortalConfig(eStructuralFeature, portalEobject, portalGrandChildNode, PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(portalEobject);
		Mockito.doNothing().when(childEobject).eSet(eStructuralFeature, childEobject);
		Mockito.when(mapper.valueToTree(portalEobject)).thenReturn(portalNode);
		assertNotNull(ecorePortalServiceImpl.patchUpdatePortalConfigModel(path, portalNode, portalGrandChildNode, PortalMetadataContants.ID_ATTRIBUTE));
	}
	
	@Test
	public void testDeletePortalConfigModel() throws MetaModelException {

		List<String> path = new ArrayList<String>();
		path.add(PortalMetadataContants.PAGE_ATTRIBUTE);
		Mockito.when(ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS))
				.thenReturn(portalEobject);
		Mockito.when(portalEobject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.PAGE_ATTRIBUTE))
				.thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		EList<EObject> ecoreList = new BasicEList<EObject>();
		ecoreList.add(childEobject);
		Mockito.when(portalEobject.eGet(eStructuralFeature)).thenReturn(ecoreList);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ATTRIBUTE);
		Mockito.doNothing().when(ecoreMapperService).deleteFromPortalConfigModel(eStructuralFeature, portalEobject,
				null);
		Mockito.doNothing().when(childEobject).eSet(eStructuralFeature, childEobject);
		Mockito.when(mapper.valueToTree(portalEobject)).thenReturn(portalNode);
		ecorePortalServiceImpl.deleteFromPortalConfigModel(path, portalNode);
		verify(ecoreMapperService, atLeastOnce()).deleteFromPortalConfigModel(eStructuralFeature, portalEobject, null);
	}

}
