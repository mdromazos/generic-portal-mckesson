package com.informatica.mdm.portal.metadata.config;

import org.eclipse.emf.ecore.EPackage;
import org.eclipse.emf.ecore.EcorePackage;
import org.eclipse.emf.ecore.resource.ResourceSet;
import org.eclipse.emf.ecore.resource.impl.ResourceSetImpl;
import org.eclipse.emf.ecore.xmi.impl.EcoreResourceFactoryImpl;
import org.emfjson.jackson.module.EMFModule;
import org.emfjson.jackson.resource.JsonResourceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class EmfServiceConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmfServiceConfig.class);

    @Bean("pathMatchingResourcePatternResolver")
    public PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver() {
        return new PathMatchingResourcePatternResolver();
    }

    @Bean("registry")
    public EPackage.Registry registry() {
        return EPackage.Registry.INSTANCE;
    }

    @Bean
    public ObjectMapper objectMapper() {

        ObjectMapper mapper = new ObjectMapper();
        EMFModule module = new EMFModule();
        mapper.registerModule(module);
        JsonResourceFactory factory = new JsonResourceFactory(mapper);
        ObjectMapper objectMapper = factory.getMapper();
        return objectMapper;
    }

    @Bean("ecoreResourceSet")
    public ResourceSet ecoreResourceSet() {
        ResourceSet resourceSet = new ResourceSetImpl();
        resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap()
                .put("*", new EcoreResourceFactoryImpl());
        return resourceSet;
    }

    @Bean("jsonResourceSet")
    public ResourceSet jsonResourceSet() {
        ResourceSet resourceSet = new ResourceSetImpl();
        resourceSet.getResourceFactoryRegistry().getExtensionToFactoryMap()
                .put("*", new JsonResourceFactory(objectMapper()));
        resourceSet.getPackageRegistry()
                .put(EcorePackage.eNS_URI, EcorePackage.eINSTANCE);
        return resourceSet;
    }
}
