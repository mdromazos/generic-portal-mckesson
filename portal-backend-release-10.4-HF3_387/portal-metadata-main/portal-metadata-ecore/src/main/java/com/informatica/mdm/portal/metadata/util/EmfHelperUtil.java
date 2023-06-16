package com.informatica.mdm.portal.metadata.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Map.Entry;
import java.util.stream.StreamSupport;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.emf.common.util.BasicEList;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EReference;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.impl.EReferenceImpl;
import org.eclipse.emf.ecore.util.EDataTypeEList;
import org.eclipse.emf.ecore.util.EcoreEList;
import org.eclipse.emf.ecore.util.EcoreUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.exception.MetaModelException;

public class EmfHelperUtil {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmfHelperUtil.class);
    
    private static Properties errorCodeProperties;
    
    public static final String DATE_FORMAT = "dd MMM yyyy HH:mm:ss zzz";

    public Properties getErrorCodeProperties() {
		return errorCodeProperties;
	}

	public static void setErrorCodeProperties(Properties errorCodeProperties) {
		EmfHelperUtil.errorCodeProperties = errorCodeProperties;
	}

	public static EClass getEClass(EFactory factory, String className) {
        return (EClass) factory.getEPackage().getEClassifier(className);
    }
    
    public static EObject newEObject(EFactory factory, String className) {
        EClass eClass = getEClass(factory, className);
        if (eClass == null) {
            throw new IllegalArgumentException("Can't find class with the name " + className);
        }
        return factory.create(eClass);
    }

    //creates base object with default values
    public static EObject createDefaultEObject(EPackage ePackage, String eClassName) {

        EClass eClass = (EClass) ePackage.getEClassifier(eClassName);
        EObject eObject = ePackage.getEFactoryInstance().create(eClass);
        eClass.getEAllStructuralFeatures().stream()
                .filter(eStructuralFeature -> !(eStructuralFeature instanceof EReferenceImpl))
                .forEach(eStructuralFeature -> {
                    LOGGER.info(eStructuralFeature.getName() + " - " + eStructuralFeature.getDefaultValue());
                    eObject.eSet(eStructuralFeature, eStructuralFeature.getDefaultValue());
                });
        return eObject;
    }

    //public static EObject

    //creates base object with default values
    public static EObject mapJsonToEObject(EFactory factory, String className, EObject eObject, JsonNode jsonData) throws MetaModelException {

        EClass eClass = getEClass(factory, className);
        if(eObject == null) {
            eObject = newEObject(factory, className);
        }
        EObject finalEObject = eObject;
        
        Iterator<Entry<String, JsonNode>> fieldIterator = jsonData.fields();
        while(fieldIterator.hasNext()) {

        	Entry<String, JsonNode> field = fieldIterator.next();
        	EStructuralFeature eStructuralFeature = eClass.getEStructuralFeature(field.getKey());
        	if(!field.getKey().equalsIgnoreCase(PortalMetadataContants.META_ECLASS_STRING)
        			&& !field.getKey().equalsIgnoreCase(PortalMetadataContants.METADATA_ATTRIBUTE)) {
        		if(null == eStructuralFeature) {
            		LOGGER.error("Invalid model for attribute {} ", field.getKey());
            		throw new MetaModelException(ErrorCodeContants.CONFIG724,
            				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG724), field.getKey());
            	}else if(eStructuralFeature.isChangeable()) {
            		LOGGER.info(eStructuralFeature.getName() + " - " + field.getValue());
                    if(eStructuralFeature instanceof EReferenceImpl) {
                    	String subClassName = eStructuralFeature.getEType().getName();
                    	
                    	if(eStructuralFeature.isMany()) {
                    		JsonNode arrayNode = field.getValue();
                    		EList<EObject> ecoreList = new BasicEList<EObject>();
                    		for(JsonNode jsonNode : arrayNode) {
                    			generateUniqueIdentifier(jsonNode);
                    			generateUniqueKey(jsonNode);
                    			String nodeClassName = "";
                    			if(subClassName.equalsIgnoreCase(PortalMetadataContants.COMPONENT_ECLASS)) {
                    				nodeClassName = jsonNode.get(PortalMetadataContants.COMPONENT_TYPE).asText();
                            	}else {
                            		nodeClassName = subClassName;
                            	}
                    			ecoreList.add(mapJsonToEObject(factory, nodeClassName, null, jsonNode));
                    		}
                    		finalEObject.eSet(eStructuralFeature, ecoreList);
                    	}else {
                    		if(subClassName.equalsIgnoreCase(PortalMetadataContants.COMPONENT_ECLASS)) {
                    			subClassName = field.getValue().get(PortalMetadataContants.COMPONENT_TYPE).asText();
                        	}
                    		finalEObject.eSet(eStructuralFeature, mapJsonToEObject(factory, subClassName, null, field.getValue()));
                    	}
                    } else {
                    	populateEcoreValueNode(eStructuralFeature, field.getValue(), finalEObject);
                    }
            	}
        	}
        
        }
        
        return finalEObject;
    }
    
    public static void generateUniqueIdentifier(JsonNode portalNode) {
    	
    	if(!portalNode.has(PortalMetadataContants.ID_ATTRIBUTE)) {
    		String randomId = EcoreUtil.generateUUID();
    		((ObjectNode) portalNode).put(PortalMetadataContants.ID_ATTRIBUTE, randomId);
    	}
    }
    
    public static void generateUniqueKey(JsonNode portalNode) {
    	
    	if(!portalNode.has(PortalMetadataContants.KEY_ATTRIBUTE) && (portalNode.has(PortalMetadataContants.PAGE_NAME_ATTRIBUTE))) {
    		String randomId = EcoreUtil.generateUUID();
    		randomId = randomId.replaceAll("/^_*/", "");
    		((ObjectNode) portalNode).put(PortalMetadataContants.KEY_ATTRIBUTE,
    				portalNode.get(PortalMetadataContants.PAGE_NAME_ATTRIBUTE).asText() + "_" + randomId);
    	} else if(!portalNode.has(PortalMetadataContants.KEY_ATTRIBUTE) && (portalNode.has(PortalMetadataContants.TITLE_ATTRIBUTE))) {
    		String randomId = EcoreUtil.generateUUID();
    		randomId = randomId.replaceAll("/^_*/", "");
    		((ObjectNode) portalNode).put(PortalMetadataContants.KEY_ATTRIBUTE,
    				portalNode.get(PortalMetadataContants.TITLE_ATTRIBUTE).asText() + "_" + randomId);
    	}
    }
    
    @SuppressWarnings("unchecked")
	private static void populateEcoreValueNode(EStructuralFeature eStructuralFeature, JsonNode jsonData, EObject finalEObject) {
    	if(eStructuralFeature.isMany()) {
    		JsonNode arrayNode = jsonData;
    		arrayNode.forEach(node -> {
    			((EDataTypeEList<Object>)finalEObject.eGet(eStructuralFeature)).add(getValueNode(node));
    		});
    		
    	}else {
    		if(eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_STRING)) {
    			finalEObject.eSet(eStructuralFeature, String.valueOf(getValueNode(jsonData)));
    		} else if(eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_BOOLEAN)) {
    			finalEObject.eSet(eStructuralFeature, getValueNode(jsonData));
    		} else if (eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_DATE)) {
    			finalEObject.eSet(eStructuralFeature, String.valueOf(getValueNode(jsonData)));
    		} else if(eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_INTEGER)) {
    			finalEObject.eSet(eStructuralFeature, getValueNode(jsonData));
    		}
    		
    	}
    }
    
    public static void setEObjectAttribute(EObject object, String attribute, Object value) {
        EStructuralFeature feature = object.eClass().getEStructuralFeature(attribute);
        if (feature == null) {
            throw new IllegalArgumentException("Can't find attribute " + attribute + " in object " + object);
        }
        object.eSet(feature, value);
    }
    
    @SuppressWarnings("unchecked")
	public static JSONObject mapEObjectToJson(EObject portalObject, List<EStructuralFeature> eStructuralFeatures) {

    	JSONObject jsonObject = new JSONObject();
		for(EStructuralFeature eStructuralFeature : eStructuralFeatures) {
    		if(eStructuralFeature instanceof EReferenceImpl) {
    			Object eObject =  portalObject.eGet(eStructuralFeature);
    			if(eObject instanceof EcoreEList) {
    				EList<EObject> eObjects = (EcoreEList<EObject>) eObject;
    				JSONArray array = new JSONArray();
    				eObjects.forEach(lEobject -> {
    					array.put(mapEObjectToJson(lEobject, lEobject.eClass().getEAllStructuralFeatures()));
    					});
    				jsonObject.put(eStructuralFeature.getName(), array);
    			}else if(eObject instanceof EObject) {
    				EObject objq = (EObject)eObject;
            		if(objq!=null)
            			jsonObject.put(eStructuralFeature.getName(), mapEObjectToJson(objq, objq.eClass().getEAllStructuralFeatures()));
    			}
    				
    		} else {
    		Object object = portalObject.eGet(eStructuralFeature);
    		if(object==null)
    			continue;
    		populateValueNodeFromEcore(eStructuralFeature, jsonObject, object);
    		}
    	}
		return jsonObject;
    }
    
	@SuppressWarnings("unchecked")
	private static void populateValueNodeFromEcore(EStructuralFeature eStructuralFeature, JSONObject jsonObject,
			Object object) {

		if (object instanceof EList) {
			JSONArray array = new JSONArray();
			((EList<String>) object).forEach(obj -> {
				array.put(obj);
			});
			jsonObject.put(eStructuralFeature.getName(), array);
		} else {
			if (eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_STRING))
				jsonObject.put(eStructuralFeature.getName(), (String) object);
			if (eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_BOOLEAN))
				jsonObject.put(eStructuralFeature.getName(), (Boolean) object);
			if (eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_DATE))
				jsonObject.put(eStructuralFeature.getName(), formatDate((Date) object));
			if (eStructuralFeature.getEType().getName().equalsIgnoreCase(PortalMetadataContants.ECLASS_INTEGER))
				jsonObject.put(eStructuralFeature.getName(), (Integer) object);
		}

	}
    
    public static boolean isVersionMatch(Integer version, EObject portalEObject) {
    	Integer resourceVersion = new Integer((String) getVersion(portalEObject));
    	if(null != resourceVersion && resourceVersion.equals(version)) {
    		return true;
    	}
    	return false;
    }
    
    public static Object getVersion(EObject portalEObject) {
    	return portalEObject.eGet(portalEObject.eClass().getEStructuralFeature(PortalMetadataContants.PORTAL_VERSION));
    }
    
    public static String getResourceKey(String username, String orsId, String portalId) {
    	return StringUtils.join(username, "_", orsId, "_", portalId);
    }
    
    @SuppressWarnings("unchecked")
	public static Integer getIdentifier(EObject portalEObject, String eAttribute) {
    	EList<EObject> ecoreList = (EList<EObject>) portalEObject.eGet(portalEObject.eClass().getEStructuralFeature(eAttribute));
    	return ecoreList.size() + 1;
    }
    
    public static EStructuralFeature getClassNameForAttribute(EFactory factory, String attribute) {
    	EClass eClass = getEClass(factory, PortalMetadataContants.PORTAL_ECLASS);
    	return eClass.getEStructuralFeature(attribute);
    }
    
    public static EStructuralFeature getClassNameForPathttribute(EFactory factory, List<String> path) {
    	EStructuralFeature structuralFeature = null;
    	EClass eClass = getEClass(factory, PortalMetadataContants.PORTAL_ECLASS);
    	
    	Iterator<String> pathIterator = path.iterator();
		while (pathIterator.hasNext()) {
			String key = pathIterator.next();
			structuralFeature = eClass.getEStructuralFeature(key);
			if (structuralFeature.isMany()) {
				if(pathIterator.hasNext())
					pathIterator.next();
			}
			eClass = getEClass(factory, structuralFeature.getEType().getName());
		}
    	return structuralFeature;
    }
    
    public static EStructuralFeature getClassNameByAttribute(EFactory factory, String eClassName, String attributeName) {
    	EStructuralFeature estructuralFeature = null;
    	EClass eClass = getEClass(factory, eClassName);
    	for(EStructuralFeature eStructuralFeature: eClass.getEStructuralFeatures()) {
    		if(null != estructuralFeature) {
    			break;
    		}
    		if(eStructuralFeature instanceof EReferenceImpl) {
    			if(attributeName.equals(eStructuralFeature.getName())) {
    				estructuralFeature = eStructuralFeature;
    			}else if(null == estructuralFeature) {
    				estructuralFeature = getClassNameByAttribute(factory, eStructuralFeature.getEType().getName(), attributeName);
    			}
    		}
    	}
        return estructuralFeature;
    }
    
	
	public static String formatDate(Date date) {
		DateFormat df = new SimpleDateFormat(DATE_FORMAT);
		return null != date ? df.format(date) : null;
	}
	
	public static Date formatStringToDate(String date) {
		DateFormat df = new SimpleDateFormat(DATE_FORMAT);
		try {
			return null != date ? df.parse(date) : null;
		} catch (ParseException e) {
			LOGGER.error("Date parse exception");
			throw new RuntimeException(e.getMessage());
		}
	}
	
	@SuppressWarnings("unchecked")
	public static EObjectWrapper traverseToPathStructuralFeature(EObject tempParentEObject, List<String> path) throws MetaModelException {
		
		EObjectWrapper eObjectWrapper = new EObjectWrapper();
		EStructuralFeature pathStructuralFeature = null;
		int skipIdentifier = 0;
		String collectionId = null;

		Iterator<String> pathIterator = path.iterator();
		while (pathIterator.hasNext()) {

			String childKey = pathIterator.next();
			pathStructuralFeature = tempParentEObject.eClass().getEStructuralFeature(childKey);

			if (skipIdentifier < path.size() - 1) {
				if (pathStructuralFeature instanceof EReference) {
					if (pathStructuralFeature.isMany()) {

						if (pathIterator.hasNext()) {
							String childId = pathIterator.next();
							if (!StringUtils.isEmpty(childId)) {
								
								if(pathIterator.hasNext()) {
									EList<EObject> eObjects = (EcoreEList<EObject>) tempParentEObject
											.eGet(pathStructuralFeature);
									tempParentEObject = StreamSupport.stream(eObjects.spliterator(), false)
											.filter(child -> child
													.eGet(child.eClass()
															.getEStructuralFeature(PortalMetadataContants.ID_ATTRIBUTE))
													.equals(childId))
											.findFirst().orElse(null);
								}

							} else {
								LOGGER.error(
										"Ecore - Identifier is required for Collections for path {} with nodekey {}",
										path, childKey);
								throw new MetaModelException(ErrorCodeContants.CONFIG720,
										errorCodeProperties.getProperty(ErrorCodeContants.CONFIG720),
										errorCodeProperties.getProperty(ErrorCodeContants.CONFIG720));
							}
							collectionId = childId;
						} else {
							LOGGER.error("Ecore - Identifier is required for Collections for path {} with nodekey {}",
									path, childKey);
							throw new MetaModelException(ErrorCodeContants.CONFIG720,
									errorCodeProperties.getProperty(ErrorCodeContants.CONFIG720),
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG720));
						}
					} else {
						tempParentEObject = (EObject) tempParentEObject.eGet(pathStructuralFeature);
					}
				} else {
					LOGGER.error("Ecore - Not a Reference Object for path {} with nodekey {}", path, childKey);
					throw new MetaModelException(ErrorCodeContants.CONFIG719,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG719), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG719));
				}
			}

			skipIdentifier++;
		}
		
		eObjectWrapper.setTempParentEObject(tempParentEObject);
		eObjectWrapper.setTraversedStructuralFeature(pathStructuralFeature);
		eObjectWrapper.setCollectionId(collectionId);
		return eObjectWrapper;
		
	}
	
	@SuppressWarnings("unchecked")
	public static EObject patchUpdateEObject(EObject existingEObject, JsonNode jsonData, EFactory factory)
			throws MetaModelException {

		Iterator<Entry<String, JsonNode>> fieldIterator = jsonData.fields();
		while (fieldIterator.hasNext()) {
			Entry<String, JsonNode> field = fieldIterator.next();
			EStructuralFeature eStructuralFeature = existingEObject.eClass().getEStructuralFeature(field.getKey());
			if(!field.getKey().equalsIgnoreCase(PortalMetadataContants.META_ECLASS_STRING)
        			&& !field.getKey().equalsIgnoreCase(PortalMetadataContants.METADATA_ATTRIBUTE)) {
				
				if (null == eStructuralFeature) {
					LOGGER.error("Invalid model for attribute {} ", field.getKey());
					throw new MetaModelException(ErrorCodeContants.CONFIG724,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG724), field.getKey());
				} else if (eStructuralFeature.isChangeable()) {
					LOGGER.info(eStructuralFeature.getName() + " - " + field.getValue());
					if (eStructuralFeature instanceof EReferenceImpl) {
						String subClassName = eStructuralFeature.getEType().getName();
						if (!eStructuralFeature.isMany()) {
							if (subClassName.equalsIgnoreCase(PortalMetadataContants.COMPONENT_ECLASS)) {
								subClassName = field.getValue().get(PortalMetadataContants.COMPONENT_TYPE).asText();
							}
							EObject referenceEObject = null == existingEObject.eGet(eStructuralFeature)
									? newEObject(factory, subClassName)
									: ((EObject) existingEObject.eGet(eStructuralFeature));
							existingEObject.eSet(eStructuralFeature,
									patchUpdateEObject(referenceEObject, field.getValue(), factory));
						} else {
							JsonNode arrayNode = field.getValue();
							EList<EObject> listEObject = (EList<EObject>) existingEObject.eGet(eStructuralFeature);
							for (JsonNode jsonNode : arrayNode) {
								generateUniqueIdentifier(jsonNode);
								generateUniqueKey(jsonNode);
								EObject referenceEObject = StreamSupport
										.stream((listEObject).spliterator(),
												false)
										.filter(child -> child
												.eGet(child.eClass().getEStructuralFeature(PortalMetadataContants.ID_ATTRIBUTE))
												.equals(EmfHelperUtil.getValueNode(jsonNode.get(PortalMetadataContants.ID_ATTRIBUTE))))
										.findFirst().orElse(null);
								
								String nodeClassName = "";
								if(null == referenceEObject) {
									if(subClassName.equalsIgnoreCase(PortalMetadataContants.COMPONENT_ECLASS)) {
	                    				nodeClassName = jsonNode.get(PortalMetadataContants.COMPONENT_TYPE).asText();
	                            	}else {
	                            		nodeClassName = subClassName;
	                            	}
									((EList<EObject>) existingEObject.eGet(eStructuralFeature)).add(patchUpdateEObject(newEObject(factory, nodeClassName), jsonNode, factory));
								}else {
									patchUpdateEObject(referenceEObject, jsonNode, factory);
								}
							}
						}
					} else {
						populateEcoreValueNode(eStructuralFeature, field.getValue(), existingEObject);
					}

				}
				
			}
			
		}

		return existingEObject;
	}
	
	public static Object getValueNode(JsonNode dataNode) {

		Object response = null;
		if (dataNode.isTextual()) {
			response = dataNode.asText();
		} else if (dataNode.isNumber()) {
			response = dataNode.asInt();
		} else if (dataNode.isBoolean()) {
			response = dataNode.asBoolean();
		} else {
			response = dataNode.asText();
		}
		return response;
	}
	
}
