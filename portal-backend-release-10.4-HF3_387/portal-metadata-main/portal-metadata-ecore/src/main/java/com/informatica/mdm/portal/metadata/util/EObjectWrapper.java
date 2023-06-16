package com.informatica.mdm.portal.metadata.util;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EStructuralFeature;

public class EObjectWrapper {
	
	private EStructuralFeature traversedStructuralFeature;
	private EObject tempParentEObject;
	private String collectionId;

	public EStructuralFeature getTraversedStructuralFeature() {
		return traversedStructuralFeature;
	}

	public void setTraversedStructuralFeature(EStructuralFeature traversedStructuralFeature) {
		this.traversedStructuralFeature = traversedStructuralFeature;
	}

	public EObject getTempParentEObject() {
		return tempParentEObject;
	}

	public void setTempParentEObject(EObject tempParentEObject) {
		this.tempParentEObject = tempParentEObject;
	}

	public String getCollectionId() {
		return collectionId;
	}

	public void setCollectionId(String collectionId) {
		this.collectionId = collectionId;
	}
	
}
