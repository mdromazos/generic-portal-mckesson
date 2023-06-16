package com.informatica.mdm.portal.metadata.service.impl;

import java.util.List;
import java.util.Properties;

import org.eclipse.emf.common.util.BasicEList;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.service.EcoreMapperService;
import com.informatica.mdm.portal.metadata.service.EcorePortalService;
import com.informatica.mdm.portal.metadata.util.EObjectWrapper;
import com.informatica.mdm.portal.metadata.util.EmfHelperUtil;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;

@Service
public class EcorePortalServiceImpl implements EcorePortalService {
	
	private final static Logger log = LoggerFactory.getLogger(EcorePortalServiceImpl.class);
	
	private final String nsURI = "http://www.informatica.com/mdm/config/model/v1";
	
	@Autowired
    private ObjectMapper mapper;
	
	@Autowired
	EcoreMapperService ecoreMapperService;
	
	@Autowired
	@Qualifier(value="jsonResourceSet")
	private ResourceSet jsonResourceSet;
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	
	/*
	 Append Ecore Object with upsert for existing configuration
	 Supports List<Object> types, Object types and uni-object of List
	 */
	@Override
	public JsonNode appendPortalConfigModel(List<String> path, JsonNode parentNode, JsonNode payloadNode, Boolean updateFlag, String collectionIdentifier)
			throws MetaModelException {
		try {
			
			EObject updatedEObject = null;
			EObject parentEObject = ecoreMapperService.mapEObjectFromJson(parentNode, PortalMetadataContants.PORTAL_ECLASS);
			EObject tempParentEObject = parentEObject;
			EObjectWrapper eObjectWrapper = EmfHelperUtil.traverseToPathStructuralFeature(tempParentEObject, path);
			if(updateFlag) {
				log.info("Ecore - Update action for child config {} ", path);
				updatedEObject = ecoreMapperService.updatePortalConfig(eObjectWrapper.getTraversedStructuralFeature(),
						eObjectWrapper.getTempParentEObject(), payloadNode, collectionIdentifier);
			}else {
				log.info("Ecore - Create action for child config {} ", path);
				ecoreMapperService.appendPortalConfig(eObjectWrapper.getTraversedStructuralFeature(),
						eObjectWrapper.getTempParentEObject(), payloadNode);
			}
			
			return null == eObjectWrapper.getTraversedStructuralFeature() ? mapper.valueToTree(updatedEObject) : mapper.valueToTree(parentEObject);
			
		} catch (MetaModelException e) {
			throw e;
		} catch (Exception e) {
			log.error("Append Child config Error for path {} ", path);
			throw new MetaModelException(ErrorCodeContants.CONFIG715,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG715), e.getMessage());
		}
		
	}
	
	/*
	 Patch Update Ecore with patch data for existing configuration
	 Supports List<Object> types, Object types and uni-object of List
	 */
	@Override
	public JsonNode patchUpdatePortalConfigModel(List<String> path, JsonNode parentNode, JsonNode payloadNode, String collectionIdentifier)
			throws MetaModelException {
		try {
			
			EObject parentEObject = ecoreMapperService.mapEObjectFromJson(parentNode, PortalMetadataContants.PORTAL_ECLASS);
			EObject tempParentEObject = parentEObject;
			EObjectWrapper eObjectWrapper = EmfHelperUtil.traverseToPathStructuralFeature(tempParentEObject, path);
			log.info("Ecore - Patch Update action for child config {} ", path);
			EObject updatedEObject = ecoreMapperService.patchUpdatePortalConfig(eObjectWrapper.getTraversedStructuralFeature(),
					eObjectWrapper.getTempParentEObject(), payloadNode, collectionIdentifier);
			
			return null == eObjectWrapper.getTraversedStructuralFeature() ? mapper.valueToTree(updatedEObject) : mapper.valueToTree(parentEObject);
			
		} catch (MetaModelException e) {
			throw e;
		} catch (Exception e) {
			log.error("Create Child config Error for path {} ", path);
			throw new MetaModelException(ErrorCodeContants.CONFIG715,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG715), e.getMessage());
		}
		
	}

	/*
	 Delete from the Ecore Model - certain config
	 Supports List<Object> types, Object types and uni-object of List
	 */
	@Override
	public JsonNode deleteFromPortalConfigModel(List<String> traversePath, JsonNode parentNode) throws MetaModelException {

		try {

			EObject parentEObject = ecoreMapperService.mapEObjectFromJson(parentNode,
					PortalMetadataContants.PORTAL_ECLASS);
			EObject tempParentEObject = parentEObject;
			EObjectWrapper eObjectWrapper = EmfHelperUtil.traverseToPathStructuralFeature(tempParentEObject,
					traversePath);
			log.info("Ecore - Delete action for child config {} ", traversePath);
			ecoreMapperService.deleteFromPortalConfigModel(eObjectWrapper.getTraversedStructuralFeature(),
					eObjectWrapper.getTempParentEObject(), eObjectWrapper.getCollectionId());

			return mapper.valueToTree(parentEObject);

		} catch (MetaModelException e) {
			throw e;
		} catch (Exception e) {
			log.error("Delete Child config Error for path {} ", traversePath);
			throw new MetaModelException(ErrorCodeContants.CONFIG715,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG715), e.getMessage());
		}
	}
	
	@Override
	public String savePortalToResource(JsonNode portalNode, String username) throws MetaModelException  {

		try {
			String portalId = portalNode.get(PortalMetadataContants.PORTAL_ID).asText();
			String orsId = null != portalNode.get(PortalMetadataContants.GENERAL_SETTINGS) ?
					portalNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.DATABASE_ID).asText() : "";

	        log.info("Json Serialization to Emf Resource initiated for portalID "+portalId);

			Resource portalResource = jsonResourceSet.getResource(URI.createURI(
					nsURI+"/"+ EmfHelperUtil.getResourceKey(username, orsId, portalId)), false);
			if(null == portalResource) {
				portalResource = jsonResourceSet.createResource(URI.createURI(
						nsURI+"/"+ EmfHelperUtil.getResourceKey(username, orsId, portalId)));
			}
			
			EObject portalObject = ecoreMapperService.mapEObjectFromJson(portalNode, PortalMetadataContants.PORTAL_ECLASS);
			portalResource.getContents().clear();
			portalResource.getContents().add(portalObject);
			log.info("Json serialized to Emf Resource for portalID "+portalId);
			return portalId;
		} catch (Exception e) {
			log.error("Failed to save Ecore Resource for portal id {} ");
			throw new MetaModelException(ErrorCodeContants.CONFIG707,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG707), e.getMessage());
		}
	}
	
	
	@Override
	public JsonNode getPortalFromResource(String portalId, String username, Integer version, String orsId) throws MetaModelException  {
		log.info("Retrive portal json Emf Resource for portalID "+portalId);
		JsonNode portalNode = null;
		Resource portalResource = jsonResourceSet.getResource(URI.createURI(
				nsURI+"/"+ EmfHelperUtil.getResourceKey(username, orsId, portalId)), false);
		if(null != portalResource) {
			try {
				portalResource.load(null);
				if(portalResource.getContents().isEmpty()) {
					return null;
				}
				EObject portalEobject = portalResource.getContents().get(0);
				if(!EmfHelperUtil.isVersionMatch(version, portalEobject)) {
					return null;
				}
				log.info("Retrived portal json Emf Resource for portalID "+portalId);
				portalNode = ecoreMapperService.mapPortalJsonFromEObject(portalEobject);
			} catch (Exception e) {
				log.error("Failed to retieve Ecore Resource for portal id {} ", portalId);
				throw new MetaModelException(ErrorCodeContants.CONFIG706,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG706), e.getMessage());
			}
		}
		return portalNode;
	}
	
	@Override
	public void deletePortalFromResourceSet(String portalId, String username, String orsId) throws MetaModelException {
		Resource portalResource = jsonResourceSet.getResource(URI.createURI(
				nsURI+"/"+ EmfHelperUtil.getResourceKey(username, orsId, portalId)), false);
		if(null != portalResource) {
			try {
				portalResource.load(null);
				jsonResourceSet.getResources().remove(portalResource);
			}catch (Exception e) {
				log.error("Failed to delete Ecore Resource for portal id {} ", portalId);
				throw new MetaModelException(ErrorCodeContants.CONFIG708,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG708), e.getMessage());
			}
		}
	}


	@Override
	public JsonNode mapToEcoreJson(JsonNode uiPortal, String eClass) throws MetaModelException {
		
		EObject portalObject = ecoreMapperService.mapEObjectFromJson(uiPortal, eClass);
		try {
			JsonNode portalNode = mapper.valueToTree(portalObject);
			return portalNode;
		} catch (Exception e) {
			log.error("Failed to map Ecore EObject to JsonNode ");
			throw new MetaModelException(ErrorCodeContants.CONFIG701,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG701), e.getMessage());
		}
		
	}
	
	@Override
	public void loadReferenceData(org.springframework.core.io.Resource resource) throws MetaModelException {
		
		try {
			String fileName = resource.getFilename().split("\\.")[0];
			log.info("Json Serialization for reference data "+fileName);

			Resource referenceDataResource = jsonResourceSet.createResource(URI.createURI(fileName));
			JsonNode referenceDataNode = mapper.readTree(resource.getInputStream());
			EList<EObject> referenceDataEObjects = new BasicEList<EObject>();
			if(referenceDataNode.isArray()) {
				for (JsonNode node : referenceDataNode) {
					String referenceClassName = node.get("eClass").asText();
					String [] referenceClassNames = referenceClassName.split("//");
					referenceClassName = referenceClassNames[referenceClassNames.length - 1];
					EObject referenceDataEObject = ecoreMapperService.mapEObjectFromJson(node, referenceClassName);
					referenceDataEObjects.add(referenceDataEObject);
				}
			}
			
			referenceDataResource.getContents().addAll(referenceDataEObjects);
		} catch (MetaModelException e) {
			log.error("Failed to load reference data");
			throw e;
		} catch (Exception e) {
			log.error("Failed to load reference data");
			throw new MetaModelException(ErrorCodeContants.CONFIG711,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG711), e.getMessage());
		}
		
	}
	
	@Override
	public JsonNode getReferenceDataByUri(String referenceDataName) throws MetaModelException {
		
		try {
			ArrayNode referenceDataNodes = null; 
			Resource referenceDataResource = jsonResourceSet.getResource(URI.createURI(referenceDataName), false);
			String className = referenceDataName.equals("states") ? PortalMetadataContants.STATE_ECLASS 
					: referenceDataName.equals("sections") ? PortalMetadataContants.SECTION_ECLASS: null;
			if(null != referenceDataResource && null != className) {
				List<EObject> referenceDatas = referenceDataResource.getContents();
				referenceDataNodes = mapper.createArrayNode();
				for (EObject referenceData : referenceDatas) {
					JsonNode referenceDataNode = ecoreMapperService.mapPortalJsonFromEObjectByEClass(referenceData, className);
					referenceDataNodes.add(referenceDataNode);
				}
			}
			return referenceDataNodes;
		} catch (Exception e) {
			log.error("Failed merge portal Child EObject to Portal EObject");
			throw new MetaModelException(ErrorCodeContants.CONFIG712,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG712), e.getMessage());
		}
		
	}
	
}
