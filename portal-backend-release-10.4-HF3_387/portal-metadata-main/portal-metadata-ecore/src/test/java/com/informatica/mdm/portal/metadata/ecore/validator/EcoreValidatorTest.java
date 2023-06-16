/**
 * 
 */
package com.informatica.mdm.portal.metadata.ecore.validator;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.util.EcoreUtil;
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.util.EmfHelperUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;


@RunWith(PowerMockRunner.class)
@PrepareForTest({EmfHelperUtil.class, EcoreUtil.class})
@PowerMockIgnore("javax.management.*")
public class EcoreValidatorTest {

	@InjectMocks
	EcoreValidator validator;
	
	@Mock
	EPackage.Registry registry;
	
	@Mock
	ObjectMapper objectMapper;
	
	EFactory eFactory;
	
	EObject portalObject;
	
	EClass eClass;
	
	EStructuralFeature eStructuralFeature;
	
	@Before
	public void setUp() throws IOException, MetaModelException {
		MockitoAnnotations.initMocks(EcoreValidatorTest.class);
		eFactory = mock(EFactory.class);
		portalObject = mock(EObject.class);
		eClass = mock(EClass.class);
		eStructuralFeature = mock(EStructuralFeature.class);
		when(registry.getEFactory(any(String.class))).thenReturn(eFactory);
		PowerMockito.mockStatic(EmfHelperUtil.class);
		PowerMockito.mockStatic(EcoreUtil.class);
		PowerMockito.doNothing().when(EmfHelperUtil.class);
		EmfHelperUtil.setEObjectAttribute(any(EObject.class), any(String.class), any(Object.class));
		when(EmfHelperUtil.getEClass(any(EFactory.class), any(String.class))).thenReturn(eClass);
	}
	
	@Test
	public void testValidatePathWithMetaModel() {
		
		List<String> path = new ArrayList<String>();
		path.add(PortalMetadataContants.PORTAL_ATTRIBUTE);
		path.add("1");
		path.add(PortalMetadataContants.PAGE_ATTRIBUTE);
		path.add("2");
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(EmfHelperUtil.getEClass(eFactory, PortalMetadataContants.ROOT_ECLASS)).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(Mockito.any())).thenReturn(eStructuralFeature);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.ROOT_ECLASS);
		assertTrue(validator.validatePathWithMetaModel(path));
	}
	
	@Test
	public void testValidatePathWithMetaModelFalse() {
		
		List<String> path = new ArrayList<String>();
		path.add(PortalMetadataContants.PORTAL_ATTRIBUTE);
		path.add("1");
		path.add(PortalMetadataContants.PAGE_ATTRIBUTE);
		path.add("2");
		Mockito.when(registry.getEFactory(PortalMetadataContants.NS_URI)).thenReturn(eFactory);
		Mockito.when(EmfHelperUtil.getEClass(eFactory, PortalMetadataContants.ROOT_ECLASS)).thenReturn(eClass);
		Mockito.when(eClass.getEStructuralFeature(Mockito.any())).thenReturn(null);
		Mockito.when(eStructuralFeature.isMany()).thenReturn(false);
		Mockito.when(eStructuralFeature.getEType()).thenReturn(eClass);
		Mockito.when(eClass.getName()).thenReturn(PortalMetadataContants.ROOT_ECLASS);
		assertFalse(validator.validatePathWithMetaModel(path));
	}
	
}
