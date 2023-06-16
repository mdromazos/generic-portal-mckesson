/**
 * 
 */
package com.informatica.mdm.portal.metadata.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.eclipse.emf.common.util.BasicEList;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.json.JSONObject;
import org.junit.Before;
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.util.EmfHelperUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;

/**
 * @author pvinodbh
 *
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({EmfHelperUtil.class, EcoreUtil.class})
@PowerMockIgnore("javax.management.*")
public class EcoreMapperServiceImplTest {

	@InjectMocks
	EcoreMapperServiceImpl ecoreMapperServiceImpl;
	
	@Mock
	EPackage.Registry registry;
	
	@Mock
	ObjectMapper objectMapper;
	
	@Mock
	private Properties errorCodeProperties;
	
	EFactory eFactory;
	
	EObject portalObject;
	
	EClass eClass;
	
	EStructuralFeature eStructuralFeature;
	
	EList<EStructuralFeature> lis;
	
	JsonNode portalNode, portalGrandChildNode, portalArrayNode;
	
	private static final String PAGE_NODE_VALUE = "{\"name\":\"freddieKeugerPage\",\"type\":true,\"accessType\":0,\"layout\":{\"sections\":[{\"displayIcon\":\"icon image\",\"isDefault\":false,\"orientation\":\"orien\",\"customStyle\":\"custom-style\",\"backgroundColor\":\"bg-color\",\"containers\":[{\"content\":\"container\",\"style\":{\"width\":1}}]}]}}";
	private static final String PAGES_ARRAY_NODE = "[{\"id\":\"2\",\"name\":\"moanaPage\"},{\"id\":\"3\",\"name\":\"neemoPage\"},{\"id\":\"4\",\"name\":\"freddiePage\"}]";
	private static final String PORTAL_NODE = "{\"portalName\":\"Supplier Portal\",\"isStateEnabled\":true,\"navigationType\":0,\"header\":{\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\",\"logo\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\"},\"footer\":{\"footerText\":\"Supplier 360. Powered by Informatica. All Rights Reserved. 2019\",\"backgroundColor\":\"#000000\",\"fontColor\":\"#FFFFFF\"},\"signup\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"welcomeText\":\"Supplier Portal\",\"title\":\"Sign up to Supplier Portal\",\"beViewName\":\"Supplier\"},\"login\":{\"backgroundImage\":\"https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg\",\"title\":\"Login to Supplier Portal\",\"isCaptchaEnabled\":true},\"databaseId\":\"orcl-SUPPLIER_HUB\"}";

	
	@SuppressWarnings("unchecked")
	@Before
	public void setUp() throws IOException, MetaModelException {
		MockitoAnnotations.initMocks(EcoreMapperServiceImplTest.class);
		portalNode = new ObjectMapper().readTree(PORTAL_NODE);
		portalArrayNode = new ObjectMapper().readTree(PAGES_ARRAY_NODE);
		portalGrandChildNode = new ObjectMapper().readTree(PAGE_NODE_VALUE);
		eFactory = mock(EFactory.class);
		portalObject = mock(EObject.class);
		eClass = mock(EClass.class);
		eStructuralFeature = mock(EStructuralFeature.class);
		lis = mock(EList.class);
		when(registry.getEFactory(any(String.class))).thenReturn(eFactory);
		PowerMockito.mockStatic(EmfHelperUtil.class);
		PowerMockito.mockStatic(EcoreUtil.class);
		when(EmfHelperUtil.mapJsonToEObject(any(EFactory.class), any(String.class), any(), any(JsonNode.class))).thenReturn(portalObject);
		PowerMockito.doNothing().when(EmfHelperUtil.class);
		EmfHelperUtil.setEObjectAttribute(any(EObject.class), any(String.class), any(Object.class));
		when(EmfHelperUtil.getEClass(any(EFactory.class), any(String.class))).thenReturn(eClass);
		when(eClass.getEAllStructuralFeatures()).thenReturn(lis);
		when(EmfHelperUtil.mapEObjectToJson(any(), any())).thenReturn(new JSONObject(portalNode.toString()));
		when(objectMapper.readTree(portalNode.toString())).thenReturn(portalNode);
		when(errorCodeProperties.getProperty(Mockito.anyString())).thenReturn("Exception Occured");
	}
	
	@Test
	public void testMapPortalJsonFromEObject() throws MetaModelException {
		Mockito.when(ecoreMapperServiceImpl.mapPortalJsonFromEObject(portalObject)).thenReturn(portalNode);
		assertTrue(portalNode.equals(portalNode));
		PowerMockito.verifyStatic(EmfHelperUtil.class,Mockito.times(1));
		EmfHelperUtil.mapEObjectToJson(any(), any());
	}
	
	@Test
	public void testMapPortalJsonFromEObjectByEClass() throws MetaModelException {
		Mockito.when(ecoreMapperServiceImpl.mapPortalJsonFromEObjectByEClass(portalObject, PortalMetadataContants.PAGE_ECLASS)).thenReturn(portalGrandChildNode);
		assertTrue(portalGrandChildNode.equals(portalGrandChildNode));
		PowerMockito.verifyStatic(EmfHelperUtil.class,Mockito.times(1));
		EmfHelperUtil.mapEObjectToJson(any(), any());
	}
	
	@Test
	public void testMapEObjectFromJson() throws MetaModelException {
		EObject portalEObject = ecoreMapperServiceImpl.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS);
		assertEquals(portalObject, portalEObject);
		PowerMockito.verifyStatic(EmfHelperUtil.class, Mockito.times(1));
		EmfHelperUtil.mapJsonToEObject(any(EFactory.class), any(String.class), any(), any(JsonNode.class));
	}
	
	@Test(expected = MetaModelException.class)
	public void testMapEObjectFromJsonException() throws MetaModelException {
		Mockito.when(EmfHelperUtil.getEClass(eFactory, PortalMetadataContants.PAGE_ATTRIBUTE)).thenReturn(eClass);
		Mockito.when(eClass.getEAllStructuralFeatures()).thenReturn(null);
		Mockito.when(EmfHelperUtil.mapEObjectToJson(Mockito.any(), Mockito.any())).thenReturn(null);
		ecoreMapperServiceImpl.mapPortalJsonFromEObject(portalObject);
	}
	
	@Test(expected = MetaModelException.class)
	public void testMapPortalJsonFromEObjectByEClassException() throws MetaModelException {
		Mockito.when(EmfHelperUtil.getEClass(eFactory, PortalMetadataContants.PAGE_ATTRIBUTE)).thenReturn(eClass);
		Mockito.when(eClass.getEAllStructuralFeatures()).thenReturn(null);
		Mockito.when(EmfHelperUtil.mapEObjectToJson(Mockito.any(), Mockito.any())).thenReturn(null);
		ecoreMapperServiceImpl.mapPortalJsonFromEObjectByEClass(portalObject, PortalMetadataContants.PAGE_ECLASS);
	}
	
	@Test
	public void testIsListByPath() throws MetaModelException {
		List<String> path = new ArrayList<String>();
		path.add("pages");
		Mockito.when(EmfHelperUtil.getClassNameForPathttribute(eFactory, path)).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		assertTrue(ecoreMapperServiceImpl.isEStructuralFeatureList(path));
	}
	
	@Test(expected = MetaModelException.class)
	public void testIsListByPathException() throws MetaModelException {
		List<String> path = new ArrayList<String>();
		path.add("pages");
		Mockito.when(EmfHelperUtil.getClassNameForPathttribute(eFactory, path)).thenReturn(null);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		assertTrue(ecoreMapperServiceImpl.isEStructuralFeatureList(path));
	}
	
	@Test
	public void testAppendPortalConfigObject() throws MetaModelException {
		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(eFactory, PortalMetadataContants.PAGE_ECLASS, portalObject, portalGrandChildNode)).thenReturn(payloadObject);
		Mockito.doNothing().when(portalObject).eSet(Mockito.any(), Mockito.any());
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.HEADER_ECLASS);
		ecoreMapperServiceImpl.appendPortalConfig(eStructuralFeature, portalObject, portalGrandChildNode);
		verify(portalObject, atLeastOnce()).eSet(Mockito.any(), Mockito.any());
	}
	
	@Test
	public void testAppendPortalConfigList() throws MetaModelException {
		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(payloadObject);
		EList<EObject> eList = new BasicEList<EObject>();
		Mockito.when(portalObject.eGet(Mockito.any())).thenReturn(eList);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ECLASS);
		ecoreMapperServiceImpl.appendPortalConfig(eStructuralFeature, portalObject, portalArrayNode);
		verify(portalObject, atLeastOnce()).eGet(Mockito.any());
	}
	
	@Test
	public void testAppendPortalConfigListObject() throws MetaModelException {
		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(payloadObject);
		EList<EObject> eList = new BasicEList<EObject>();
		Mockito.when(portalObject.eGet(Mockito.any())).thenReturn(eList);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ECLASS);
		ecoreMapperServiceImpl.appendPortalConfig(eStructuralFeature, portalObject, portalGrandChildNode);
		verify(portalObject, atLeastOnce()).eGet(Mockito.any());
	}
	
	@Test
	public void testUpdatePortalConfigObject() throws MetaModelException {
		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(eFactory, PortalMetadataContants.PAGE_ECLASS, portalObject, portalGrandChildNode)).thenReturn(payloadObject);
		Mockito.doNothing().when(portalObject).eSet(Mockito.any(), Mockito.any());
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.HEADER_ECLASS);
		Mockito.when(portalObject.eGet(Mockito.any())).thenReturn(payloadObject);
		ecoreMapperServiceImpl.updatePortalConfig(eStructuralFeature, portalObject, portalGrandChildNode, PortalMetadataContants.ID_ATTRIBUTE);
		verify(portalObject, atLeastOnce()).eSet(Mockito.any(), Mockito.any());
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testUpdatePortalConfigList() throws MetaModelException {
		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(payloadObject);
		EList<EObject> eList = mock(EList.class);
		Mockito.doNothing().when(portalObject).eSet(Mockito.any(), Mockito.any());
		Mockito.when(portalObject.eGet(Mockito.any())).thenReturn(eList);
		Mockito.when(eList.removeIf(Mockito.any())).thenReturn(true);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ECLASS);
		ecoreMapperServiceImpl.updatePortalConfig(eStructuralFeature, portalObject, portalArrayNode, PortalMetadataContants.ID_ATTRIBUTE);
		verify(portalObject, atLeastOnce()).eGet(Mockito.any());
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testUpdatePortalConfigListObject() throws MetaModelException {
		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(payloadObject);
		EList<EObject> eList = mock(EList.class);
		Mockito.when(portalObject.eGet(Mockito.any())).thenReturn(eList);
		Mockito.when(eList.removeIf(Mockito.any())).thenReturn(true);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ECLASS);
		ecoreMapperServiceImpl.updatePortalConfig(eStructuralFeature, portalObject, portalGrandChildNode, PortalMetadataContants.ID_ATTRIBUTE);
		verify(portalObject, atLeastOnce()).eGet(Mockito.any());
	}
	
	@Test
	public void testPatchUpdatePortalConfigObject() throws MetaModelException {
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(portalObject.eGet(eStructuralFeature)).thenReturn(portalObject);
		Mockito.when(EmfHelperUtil.patchUpdateEObject(portalObject, portalNode, eFactory)).thenReturn(portalObject);
		ecoreMapperServiceImpl.patchUpdatePortalConfig(eStructuralFeature, portalObject, portalNode, null);
		PowerMockito.verifyStatic(EmfHelperUtil.class, Mockito.times(1));
		EmfHelperUtil.patchUpdateEObject(portalObject, portalNode, eFactory);
	}
	
	@Test(expected = MetaModelException.class)
	public void testPatchUpdatePortalConfigObjectException() throws MetaModelException {
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(portalObject.eGet(eStructuralFeature)).thenReturn(null);
		Mockito.when(EmfHelperUtil.patchUpdateEObject(portalObject, portalArrayNode, eFactory)).thenReturn(portalObject);
		ecoreMapperServiceImpl.patchUpdatePortalConfig(eStructuralFeature, portalObject, portalArrayNode, null);
	}
	
	@Test(expected = MetaModelException.class)
	public void testPatchUpdatePortalConfigListException() throws MetaModelException {
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		EList<EObject> eList = new BasicEList<EObject>();
		eList.add(portalObject);
		Mockito.when(portalObject.eGet(eStructuralFeature)).thenReturn(eList);
		Mockito.when(portalObject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.equals(EmfHelperUtil.getValueNode(Mockito.any()))).thenReturn(true);
		Mockito.when(EmfHelperUtil.patchUpdateEObject(portalObject, portalArrayNode, eFactory)).thenReturn(portalObject);
		ecoreMapperServiceImpl.patchUpdatePortalConfig(eStructuralFeature, portalObject, portalArrayNode, PortalMetadataContants.ID_ATTRIBUTE);
	}
	
	@Test(expected = MetaModelException.class)
	public void testPatchUpdatePortalConfigListCollectonIdentifier() throws MetaModelException {
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		ecoreMapperServiceImpl.patchUpdatePortalConfig(eStructuralFeature, portalObject, portalArrayNode, null);
	}
	
	@Test(expected = MetaModelException.class)
	public void testPatchUpdatePortalConfigListObjectException() throws MetaModelException {
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		EList<EObject> eList = new BasicEList<EObject>();
		eList.add(portalObject);
		Mockito.when(portalObject.eGet(eStructuralFeature)).thenReturn(eList);
		Mockito.when(portalObject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.equals(EmfHelperUtil.getValueNode(Mockito.any()))).thenReturn(true);
		Mockito.when(EmfHelperUtil.patchUpdateEObject(portalObject, portalGrandChildNode, eFactory)).thenReturn(portalObject);
		ecoreMapperServiceImpl.patchUpdatePortalConfig(eStructuralFeature, portalObject, portalGrandChildNode, PortalMetadataContants.ID_ATTRIBUTE);
	}
	
	@Test(expected = MetaModelException.class)
	public void testPatchUpdatePortalConfigListEmpty() throws MetaModelException {
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		EList<EObject> eList = new BasicEList<EObject>();
		Mockito.when(portalObject.eGet(eStructuralFeature)).thenReturn(eList);
		Mockito.when(portalObject.eClass()).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(PortalMetadataContants.ID_ATTRIBUTE)).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.equals(EmfHelperUtil.getValueNode(Mockito.any()))).thenReturn(true);
		Mockito.when(EmfHelperUtil.patchUpdateEObject(portalObject, portalArrayNode, eFactory)).thenReturn(portalObject);
		ecoreMapperServiceImpl.patchUpdatePortalConfig(eStructuralFeature, portalObject, portalArrayNode, PortalMetadataContants.ID_ATTRIBUTE);
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testDeletePortalConfigModelCollections() throws MetaModelException {

		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(true);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any()))
				.thenReturn(payloadObject);
		EList<EObject> eList = mock(EList.class);
		Mockito.doNothing().when(portalObject).eSet(Mockito.any(), Mockito.any());
		Mockito.when(portalObject.eGet(Mockito.any())).thenReturn(eList);
		Mockito.when(eList.removeIf(Mockito.any())).thenReturn(true);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(portalObject.eCrossReferences()).thenReturn(eList);
		Mockito.when(eList.isEmpty()).thenReturn(true);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ECLASS);
		ecoreMapperServiceImpl.deleteFromPortalConfigModel(eStructuralFeature, portalObject, null);
		verify(eList, atLeastOnce()).removeIf(Mockito.any());
	}

	@SuppressWarnings("unchecked")
	@Test
	public void testDeletePortalConfigModelObject() throws MetaModelException {

		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any()))
				.thenReturn(payloadObject);
		EList<EObject> eList = mock(EList.class);
		Mockito.doNothing().when(portalObject).eSet(Mockito.any(), Mockito.any());
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ECLASS);
		Mockito.when(portalObject.eGet(eStructuralFeature)).thenReturn(portalObject);
		Mockito.when(portalObject.eCrossReferences()).thenReturn(eList);
		Mockito.when(eList.isEmpty()).thenReturn(true);
		ecoreMapperServiceImpl.deleteFromPortalConfigModel(eStructuralFeature, portalObject, null);
		PowerMockito.verifyStatic(EcoreUtil.class, atLeastOnce());
		EcoreUtil.delete(portalObject);
	}

	@SuppressWarnings("unchecked")
	@Test(expected = MetaModelException.class)
	public void testDeletePortalConfigModelException() throws MetaModelException {

		EObject payloadObject = mock(EObject.class);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(EmfHelperUtil.mapJsonToEObject(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any()))
				.thenReturn(payloadObject);
		Mockito.doNothing().when(portalObject).eSet(Mockito.any(), Mockito.any());
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		EList<EObject> eList = mock(EList.class);
		Mockito.when(portalObject.eCrossReferences()).thenReturn(eList);
		Mockito.when(portalObject.eGet(eStructuralFeature)).thenReturn(portalObject);
		Mockito.when(eList.isEmpty()).thenReturn(false);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.PAGE_ECLASS);
		ecoreMapperServiceImpl.deleteFromPortalConfigModel(eStructuralFeature, portalObject, null);
	}
	
}
