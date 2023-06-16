package com.informatica.mdm.portal.metadata.config;

import java.io.File;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

@Configuration
public class PropertyLoader {

	@Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfig() {
		
		String propertyfilePath = PortalConfigUtil.getServerHomeDirectory() + File.separator
				+ PortalServiceConstants.CMX_PROPERTIES;
		
		PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
		Resource propertyResource = new FileSystemResource(propertyfilePath);
		configurer.setLocation(propertyResource);
		return configurer;
		
    }
	
}
