package com.informatica.mdm.portal.metadata.ecore.validator;

import java.util.Iterator;
import java.util.List;
import java.util.Properties;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EFactory;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EStructuralFeature;
import org.eclipse.emf.ecore.impl.EReferenceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.util.EmfHelperUtil;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;

@Component
public class EcoreValidator {

	private final static Logger log = LoggerFactory.getLogger(EcoreValidator.class);
	
    @Autowired
    private EPackage.Registry registry;
    
    @Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;
	
	public void validateConfigPath(List<String> path) throws PortalConfigException {
		
		log.info("validate path uri {} ", path);
		
		if (path.isEmpty()) {
			log.error("Path is empty");
			throw new MetaModelException(ErrorCodeContants.CONFIG716,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
		}
		
		if(validatePathWithMetaModel(path)) {
			log.info("Valid MetaModel path {}", path);
		} else {
			log.error("Invalid MetaModel path {} ", path);
			throw new MetaModelException(ErrorCodeContants.CONFIG716,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
		}
		
	}
	
	public Boolean validatePathWithMetaModel(List<String> path) {

		EStructuralFeature structuralFeature = null;
		EFactory eFactory = registry.getEFactory(PortalMetadataContants.NS_URI);
		EClass eClass = EmfHelperUtil.getEClass(eFactory, PortalMetadataContants.ROOT_ECLASS);
		Iterator<String> pathIterator = path.iterator();
		while (pathIterator.hasNext()) {
			String key = pathIterator.next();
			structuralFeature = eClass.getEStructuralFeature(key);
			if (null == structuralFeature) {
				return false;
			} else if (structuralFeature instanceof EReferenceImpl) {
				eClass = EmfHelperUtil.getEClass(eFactory, structuralFeature.getEType().getName());
				if (structuralFeature.isMany()) {
					if (pathIterator.hasNext()) {
						if (null != eClass.getEStructuralFeature(pathIterator.next())) {
							return false;
						}
					}
				}
			}
		}
		return true;
	}
	
}
