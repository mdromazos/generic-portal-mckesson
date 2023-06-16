package com.informatica.mdm.portal.metadata.service;

import java.util.List;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EStructuralFeature;

import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;

public interface EcoreMapperService {

	void appendPortalConfig(EStructuralFeature pathStructuralFeature,
			EObject tempParentEObject, JsonNode payloadNode)
			throws MetaModelException;

	EObject updatePortalConfig(EStructuralFeature pathStructuralFeature,
			EObject tempParentEObject, JsonNode payloadNode, String collectionIdentifier)
			throws MetaModelException;

	EObject patchUpdatePortalConfig(EStructuralFeature pathStructuralFeature, EObject tempParentEObject,
			JsonNode payloadNode, String collectionIdentifier) throws MetaModelException;

	void deleteFromPortalConfigModel(EStructuralFeature traversedStructuralFeature,
			EObject tempParentEObject, String collectionId) throws MetaModelException;
	
    JsonNode mapPortalJsonFromEObject(EObject portalEObject)
    		throws MetaModelException;

	EObject mapEObjectFromJson(JsonNode portalData, String eClass)
			throws MetaModelException;

	JsonNode mapPortalJsonFromEObjectByEClass(EObject portalEObject,
			String eClassName) throws MetaModelException;

	boolean isEStructuralFeatureList(List<String> path)
			throws MetaModelException;

}
