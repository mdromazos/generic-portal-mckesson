package com.informatica.mdm.solutions.pim.app;

import java.io.File;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePropertySource;
import com.informatica.mdm.solutions.pim.model.IPIMConstants;

public class CustomApplicationInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

	private final static Logger log = LoggerFactory.getLogger(CustomApplicationInitializer.class);
	
	@Override
	public void initialize(ConfigurableApplicationContext applicationContext) {

		ConfigurableEnvironment environment = applicationContext.getEnvironment();
		String propertyfilePath = PIMServiceConfig.getServerHomeDirectory() + File.separator
				+ IPIMConstants.CMX_PROPERTIES;
		Resource path = new FileSystemResource(propertyfilePath);
		try {
			ResourcePropertySource resource = new ResourcePropertySource(path);
			environment.getPropertySources().addFirst(resource);
		} catch (IOException e) {
			log.error("CustomApplicationInitializer - Exception while initialising properties {}", e.getMessage());
		}

	}

}
