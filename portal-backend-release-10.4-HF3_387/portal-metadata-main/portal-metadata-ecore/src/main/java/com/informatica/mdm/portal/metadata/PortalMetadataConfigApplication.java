/*
package com.informatica.mdm.metadata;

import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.metadata.resource.Resource;
import org.eclipse.emf.metadata.resource.ResourceSet;
import org.eclipse.emf.metadata.resource.util.ResourceSetImpl;
import org.emfjson.jackson.resource.JsonResourceFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PortalMetadataConfigApplication {

	public static void main(String[] args) {

		ResourceSet resourceSet = new ResourceSetImpl();
		resourceSet.getResourceFactoryRegistry()
				.getExtensionToFactoryMap()
				.put("json", new JsonResourceFactory());

		Resource resource = resourceSet.createResource
				(URI.createFileURI("src/main/resources/data.json"));

		SpringApplication.run(PortalMetadataConfigApplication.class, args);
	}

}
*/
