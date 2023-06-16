package com.informatica.mdm.portal.metadata.service.impl;

import java.util.List;
import java.util.Properties;
import java.util.stream.StreamSupport;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.service.EcoreMapperService;
import com.informatica.mdm.portal.metadata.util.EmfHelperUtil;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;

@Service
public class EcoreMapperServiceImpl implements EcoreMapperService {

	private final static Logger log = LoggerFactory.getLogger(EcoreMapperServiceImpl.class);
	
    @Autowired
    private EPackage.Registry registry;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

    @SuppressWarnings("unchecked")
    @Override
	public void appendPortalConfig(EStructuralFeature pathStructuralFeature, EObject tempParentEObject, JsonNode payloadNode) throws MetaModelException {
    	
    	if(pathStructuralFeature.isMany()) {
			if(payloadNode.isArray()) {
				for(JsonNode pNode : payloadNode) {
					EmfHelperUtil.generateUniqueKey(pNode);
					EObject payloadEObject = mapEObjectFromJson(pNode,
							pathStructuralFeature.getEType().getName());
					((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).add(payloadEObject);
				}
			}else {
				EmfHelperUtil.generateUniqueKey(payloadNode);
				EObject payloadEObject = mapEObjectFromJson(payloadNode,
						pathStructuralFeature.getEType().getName());
				((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).add(payloadEObject);
			}
		}else {
			EObject payloadEObject = mapEObjectFromJson(payloadNode,
					pathStructuralFeature.getEType().getName());
			if(null != tempParentEObject.eGet(pathStructuralFeature)) {
				log.error("Child config creation already exist for path {} ", pathStructuralFeature);
				throw new MetaModelException(ErrorCodeContants.CONFIG722,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG722), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG722));
			}
			tempParentEObject.eSet(pathStructuralFeature, payloadEObject);
		}
    	
    }
    
    @SuppressWarnings("unchecked")
    @Override
	public EObject updatePortalConfig(EStructuralFeature pathStructuralFeature, EObject tempParentEObject, JsonNode payloadNode, String collectionIdentifier) throws MetaModelException {
    	
    	if(null == pathStructuralFeature) {
    		EObject payloadEObject = mapEObjectFromJson(payloadNode,
					PortalMetadataContants.PORTAL_ECLASS);
    		tempParentEObject = payloadEObject;
    	}
    	else if(pathStructuralFeature.isMany()) {
			if(payloadNode.isArray()) {
				for(JsonNode pNode : payloadNode) {
					EmfHelperUtil.generateUniqueKey(pNode);
					EObject payloadEObject = mapEObjectFromJson(pNode,
							pathStructuralFeature.getEType().getName());
					
					Boolean idExist = ((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).removeIf(child -> child
							.eGet(child.eClass().getEStructuralFeature(collectionIdentifier))
							.equals(payloadEObject.eGet(payloadEObject.eClass().getEStructuralFeature(collectionIdentifier))));
					
					if(!idExist) {
						log.error("Collection Identifier not exist for path {} ", pathStructuralFeature);
						throw new MetaModelException(ErrorCodeContants.CONFIG721,
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG721), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG721));
					}
					
					((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).add(payloadEObject);
				}
			}else {
				
				if(StringUtils.isEmpty(collectionIdentifier)) {
	    			log.error("Collection Identifier is empty for path {} ", pathStructuralFeature);
					throw new MetaModelException(ErrorCodeContants.CONFIG718,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG718), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG718));
	    		}
				EmfHelperUtil.generateUniqueKey(payloadNode);
				EObject payloadEObject = mapEObjectFromJson(payloadNode,
						pathStructuralFeature.getEType().getName());
				Boolean idExist = ((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).removeIf(child -> child
								.eGet(child.eClass().getEStructuralFeature(collectionIdentifier))
								.equals(payloadEObject.eGet(payloadEObject.eClass().getEStructuralFeature(collectionIdentifier))));
				if(!idExist) {
					log.error("Collection Identifier not exist for path {} ", pathStructuralFeature);
					throw new MetaModelException(ErrorCodeContants.CONFIG721,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG721), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG721));
				}
				((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).add(payloadEObject);
			}
		}else {
			EObject payloadEObject = mapEObjectFromJson(payloadNode,
					pathStructuralFeature.getEType().getName());
			if(null == tempParentEObject.eGet(pathStructuralFeature)) {
				log.error("Child config Update not exist for path {} ", pathStructuralFeature);
				throw new MetaModelException(ErrorCodeContants.CONFIG723,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG723), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG723));
			}
			tempParentEObject.eSet(pathStructuralFeature, payloadEObject);
		}
    	return tempParentEObject;
    }
    
	@SuppressWarnings("unchecked")
	@Override
	public EObject patchUpdatePortalConfig(EStructuralFeature pathStructuralFeature, EObject tempParentEObject,
			JsonNode payloadNode, String collectionIdentifier) throws MetaModelException {

		EFactory eFactory = registry.getEFactory(PortalMetadataContants.NS_URI);
		if(null == pathStructuralFeature) {
			tempParentEObject = EmfHelperUtil.patchUpdateEObject(tempParentEObject, payloadNode, eFactory);
    	}
		else if (pathStructuralFeature.isMany()) {
			if (StringUtils.isEmpty(collectionIdentifier)) {
				log.error("Collection Identifier is empty for path {} whose structural feature is List ", pathStructuralFeature);
				throw new MetaModelException(ErrorCodeContants.CONFIG718,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG718), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG718));
			}
			if (payloadNode.isArray()) {
				if (((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).isEmpty()) {
					log.error("Ecore existing List Object not found for update with structural feature of path {} ",
							pathStructuralFeature);
					throw new MetaModelException(ErrorCodeContants.CONFIG717,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717));
				}
				for (JsonNode pNode : payloadNode) {

					EObject existingEObject = StreamSupport
							.stream(((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).spliterator(),
									false)
							.filter(child -> child.eGet(child.eClass().getEStructuralFeature(collectionIdentifier))
									.equals(EmfHelperUtil.getValueNode(pNode.get(collectionIdentifier))))
							.findFirst().orElse(null);

					if (null == existingEObject) {
						log.error(
								"Ecore existing List Object not found for update with structural feature of path {} ",
								pathStructuralFeature);
						throw new MetaModelException(ErrorCodeContants.CONFIG717,
								errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717));
					}

					existingEObject = EmfHelperUtil.patchUpdateEObject(existingEObject, pNode, eFactory);

				}
			} else {

				EObject existingEObject = StreamSupport
						.stream(((EList<EObject>) tempParentEObject.eGet(pathStructuralFeature)).spliterator(), false)
						.filter(child -> child.eGet(child.eClass().getEStructuralFeature(collectionIdentifier))
								.equals(EmfHelperUtil.getValueNode(payloadNode.get(collectionIdentifier))))
						.findFirst().orElse(null);

				if (null == existingEObject) {
					log.error("Ecore existing List Object not found for update with structural feature of path {} ",
							pathStructuralFeature);
					throw new MetaModelException(ErrorCodeContants.CONFIG717,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717));
				}

				existingEObject = EmfHelperUtil.patchUpdateEObject(existingEObject, payloadNode, eFactory);
			}
		} else {

			EObject existingEObject = (EObject) tempParentEObject.eGet(pathStructuralFeature);
			if(null == existingEObject) {
				log.error("Ecore existing Object not found for update with structural feature of path {} ",
						pathStructuralFeature);
				throw new MetaModelException(ErrorCodeContants.CONFIG717,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG717));
			}
			existingEObject = EmfHelperUtil.patchUpdateEObject(existingEObject, payloadNode, eFactory);

		}
		
		return tempParentEObject;
	}

	@SuppressWarnings("unchecked")
	@Override
	public void deleteFromPortalConfigModel(EStructuralFeature traversedStructuralFeature, EObject deleteEObject, String collectionId)
			throws MetaModelException {

		if(traversedStructuralFeature.isMany()) {
			if(StringUtils.isEmpty(collectionId)) {
				((EList<EObject>) deleteEObject.eGet(traversedStructuralFeature)).removeIf
									(successorEObject -> successorEObject.eCrossReferences().isEmpty());
			}else {
				EObject existingEObject = StreamSupport
						.stream(((EList<EObject>) deleteEObject.eGet(traversedStructuralFeature)).spliterator(), false)
						.filter(child -> child.eGet(child.eClass().getEStructuralFeature(PortalMetadataContants.ID_ATTRIBUTE))
								.equals(collectionId))
						.findFirst().orElse(null);
				deleteEObjectFromModel(traversedStructuralFeature, existingEObject);
			}
		}else {
			deleteEObjectFromModel(traversedStructuralFeature, (EObject) deleteEObject.eGet(traversedStructuralFeature));
		}
	}
	
    @Override
    public EObject mapEObjectFromJson(JsonNode portalData, String eClass) throws MetaModelException {
    	
    	try {
    		EFactory eFactory = registry.getEFactory(PortalMetadataContants.NS_URI);
            EObject eObject = EmfHelperUtil.mapJsonToEObject(
                    eFactory, eClass, null, portalData);
            return eObject;
    	}catch (Exception e) {
    		log.error("Failed to map JsonNode data to Ecore EObject");
			throw new MetaModelException(ErrorCodeContants.CONFIG701,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG701), e.getMessage());
		}
    }
    
	@Override
	public JsonNode mapPortalJsonFromEObject(EObject portalEObject) throws MetaModelException {

		try {
			EFactory eFactory = registry.getEFactory(PortalMetadataContants.NS_URI);
			EClass eClass = EmfHelperUtil.getEClass(eFactory, PortalMetadataContants.PORTAL_ECLASS);
			List<EStructuralFeature> lis = eClass.getEAllStructuralFeatures();
			JSONObject jsonObject = EmfHelperUtil.mapEObjectToJson(portalEObject, lis);
			return objectMapper.readTree(jsonObject.toString());
		} catch (Exception e) {
			log.error("Failed to map Ecore EObject to JsonNode ");
			throw new MetaModelException(ErrorCodeContants.CONFIG703,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG703), e.getMessage());
		}
	}
    
	@Override
	public JsonNode mapPortalJsonFromEObjectByEClass(EObject portalEObject, String eClassName) throws MetaModelException {

		try {
			EFactory eFactory = registry.getEFactory(PortalMetadataContants.NS_URI);
			EClass eClass = EmfHelperUtil.getEClass(eFactory, eClassName);
			List<EStructuralFeature> lis = eClass.getEAllStructuralFeatures();
			JSONObject jsonObject = EmfHelperUtil.mapEObjectToJson(portalEObject, lis);
			return objectMapper.readTree(jsonObject.toString());
		} catch (Exception e) {
			log.error("Failed to map Ecore EObject to JsonNode ");
			throw new MetaModelException(ErrorCodeContants.CONFIG703,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG703), e.getMessage());
		}
	}
    
    @Override
    public boolean isEStructuralFeatureList(List<String> path) throws MetaModelException {
    	try {
    		EFactory eFactory = registry.getEFactory(PortalMetadataContants.NS_URI);
        	return EmfHelperUtil.getClassNameForPathttribute(eFactory, path).isMany();
    	}catch (Exception e) {
    		log.error("Error on check if attribute {} is Elist ", path);
			throw new MetaModelException(ErrorCodeContants.CONFIG704,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG704), e.getMessage());
		}
    }
	
	private void deleteEObjectFromModel(EStructuralFeature traversedStructuralFeature, EObject deleteEObject) throws MetaModelException {
		
		if (deleteEObject.eCrossReferences().isEmpty()) {
			EcoreUtil.delete(deleteEObject);
		} else {
			log.error("Cross Referenced object can't be deleted for structural feature of path {} ",
					traversedStructuralFeature);
			throw new MetaModelException(ErrorCodeContants.CONFIG725,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG725), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG725));
		}
	}
    
}
