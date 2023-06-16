package com.informatica.mdm.portal.metadata.config;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.informatica.mdm.portal.metadata.util.EmfHelperUtil;
import com.informatica.mdm.portal.metadata.util.JsonUtil;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;

@Configuration
public class ErrorProperties {
	
	private final static Logger log = LoggerFactory.getLogger(ErrorProperties.class);
	
	public static final String ERROR_PROPERTIES_PATH = "error/bundles/error.properties";
	
	public static final String ERROR_MAPPING_PATH = "error/bundles/error-mapping.properties";
	
	@Autowired
    private PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver;

	@Bean(name = "errorCodeProperties")
	public Properties loadProperties() throws Exception {
		
		Properties properties = new Properties();
		Resource resource = pathMatchingResourcePatternResolver.getResource(ERROR_PROPERTIES_PATH);
		log.info("Laoding Error Code - processing the file {}", resource.getFilename());
		properties.load(resource.getInputStream());
		JsonUtil.setErrorCodeProperties(properties);
		EmfHelperUtil.setErrorCodeProperties(properties);
		PortalConfigUtil.setErrorCodeProperties(properties);
		return properties;
	}
	
	@Bean(name = "beErrorMapping")
	public Properties loadErrorMapping() throws Exception {
		
		Properties properties = new Properties();
		Resource resource = pathMatchingResourcePatternResolver.getResource(ERROR_MAPPING_PATH);
		log.info("Laoding Mapping Error Code - processing the file {}", resource.getFilename());
		properties.load(resource.getInputStream());
		JsonUtil.setErrorCodeProperties(properties);
		EmfHelperUtil.setErrorCodeProperties(properties);
		PortalConfigUtil.setErrorCodeProperties(properties);
		return properties;
	}
	
	@Bean(name = "externalErrorProperties")
	public Map<String, Map<String, Properties>> loadMetadataProperties() throws Exception {
		
		Map<String, Map<String, Properties>> errorProperties = new HashMap<String, Map<String,Properties>>();
		return errorProperties;
	}
	
}