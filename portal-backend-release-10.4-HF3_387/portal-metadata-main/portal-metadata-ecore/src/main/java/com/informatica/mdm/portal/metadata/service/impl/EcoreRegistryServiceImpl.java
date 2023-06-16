package com.informatica.mdm.portal.metadata.service.impl;

import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.emf.common.util.BasicDiagnostic;
import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.EClassifier;
import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.util.BasicExtendedMetaData;
import org.eclipse.emf.ecore.util.ExtendedMetaData;
import org.eclipse.emf.ecore.xmi.XMLResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import com.informatica.mdm.portal.metadata.exception.MetaModelException;
import com.informatica.mdm.portal.metadata.service.EcorePortalService;
import com.informatica.mdm.portal.metadata.service.EcoreRegistryService;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.validator.ECoreValidator;
import com.siperian.common.io.IOUtil;

@Service("ecoreRegistryService")
public class EcoreRegistryServiceImpl implements EcoreRegistryService {
	
	@Autowired
    private PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver;

    @Autowired
    @Qualifier("ecoreResourceSet")
    private ResourceSet ecoreResourceSet;

    @Autowired
    private EPackage.Registry registry;

    @Autowired
    private ECoreValidator eCoreValidator;
    
    @Autowired
    private EcorePortalService ecorePortalService;
    
    @Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

    private static final Logger LOGGER = LoggerFactory.getLogger(EcoreRegistryServiceImpl.class);

    
    @PostConstruct
    public void deployEcoreModels() throws MetaModelException {
    	deployEcoreModels(PortalMetadataContants.CORE_ECORE_MODEL);
    	loadReferenceDataToResource(PortalMetadataContants.REFERENCE_DATA_PATH);
    }
    
    @Override
    public List<EPackage> deployEcoreModels(String ecoreLocation) throws MetaModelException {

        List<EPackage> allPackages = new ArrayList<>();
        try {
            org.springframework.core.io.Resource ecoreFileResource =
                    pathMatchingResourcePatternResolver.getResource(ecoreLocation);

            byte[] ecoreFileBytes = IOUtil.readToBytes(ecoreFileResource.getInputStream());
            ByteArrayInputStream inputStream = new ByteArrayInputStream(ecoreFileBytes);
            
            if(StringUtils.isNotEmpty(ecoreFileResource.getFilename())) {
                LOGGER.info("Found core meta-model definition on classpath: {}", ecoreFileResource.getFilename());
                Map<String, Object> options = new HashMap<>();
                ExtendedMetaData ext = new BasicExtendedMetaData(
                        ExtendedMetaData.ANNOTATION_URI,
                        EPackage.Registry.INSTANCE, new HashMap<>());
                options.put(XMLResource.OPTION_EXTENDED_META_DATA, ext);

                URI uri = URI.createURI("http://www.informatica.com/mdm/config/model/v1");

                Resource resource = ecoreResourceSet.createResource(uri);
                try {
                    resource.load(inputStream, options);
                } catch (IOException e) {
                	throw new MetaModelException(ErrorCodeContants.CONFIG702,
                			errorCodeProperties.getProperty(ErrorCodeContants.CONFIG702), e.getMessage());
                } finally {
                    inputStream.reset();
                }
                EPackage metaModelPackage = (EPackage) resource.getContents().get(0);
                resource.setURI(URI.createURI(metaModelPackage.getNsURI()));

                registerEPackage(metaModelPackage);
                allPackages.add(metaModelPackage);
                metaModelPackage.getEClassifiers().forEach((EClassifier classifier) -> LOGGER.info("EClassifier :: {}", classifier.getName()));
            }
        } catch (FileNotFoundException ex) {
            LOGGER.warn("Core meta-model definition not found on classpath.", ex);
        } catch (IOException ex) {
            LOGGER.warn("Error in performing file operation on the core meta-model.", ex);
        }
        return validateEPackages(allPackages);
    }

    public void registerEPackage(EPackage ePackage) {
        final String nsURI = ePackage.getNsURI();
        if(!registry.containsKey(nsURI)) {
            registry.put(nsURI, ePackage);
            LOGGER.info("Ecore package registered: {}", nsURI);
        } else {
            LOGGER.warn("Ecore package {} already registered. If this message appears in production, please log an issue.", nsURI);
        }
    }

    public void unregisterEPackage(EPackage ePackage) {
        final String nsURI = ePackage.getNsURI();
        if(registry.containsKey(nsURI)) {
            registry.remove(nsURI);
            LOGGER.info("Ecore package un-registered: {}", nsURI);
        }
    }

    public List<EPackage> validateEPackages(List<EPackage> ePackages) {
        List<EPackage> validPackages = new ArrayList<>();
        for(EPackage ePackage : ePackages) {
            try {
                if (ePackage != null && isValidEPackage(ePackage)) {
                    validPackages.add(ePackage);
                }
            } catch (Exception ex) {
                unregisterEPackage(ePackage);
                LOGGER.error("Invalid ECore package error: ", ex);
            }
        }
        return Collections.unmodifiableList(validPackages);
    }

    public boolean isValidEPackage(EPackage ePackage) {
        Diagnostic diagnostic = eCoreValidator.validateEPackage(ePackage);
        if(BasicDiagnostic.OK != diagnostic.getSeverity()) {
            return false;
        }
        return true;
    }
    
    public void loadReferenceDataToResource(String path) throws MetaModelException {
    	
    	try {
    		org.springframework.core.io.Resource[] resources = pathMatchingResourcePatternResolver.getResources(path);
    		for(org.springframework.core.io.Resource resource:resources) {
    			if(resource.getFilename().endsWith(".json")) {
    				LOGGER.info("Reference Data processing for file {}", resource.getFilename());
        			ecorePortalService.loadReferenceData(resource);
    			}
    		}
		} catch (IOException e) {
			LOGGER.error("Couldn't load reference data", e);
		}
    }
    
}
