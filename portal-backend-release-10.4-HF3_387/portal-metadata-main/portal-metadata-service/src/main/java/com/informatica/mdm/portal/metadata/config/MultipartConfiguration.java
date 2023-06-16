package com.informatica.mdm.portal.metadata.config;

import javax.servlet.MultipartConfigElement;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.servlet.MultipartProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MultipartProperties.class)
public class MultipartConfiguration {

	@Value("${cmx.file.max_file_size_mb}")
	private Integer maxFileSize;
	
	private final MultipartProperties multipartProperties;

    public MultipartConfiguration(MultipartProperties multipartProperties) {
        this.multipartProperties = multipartProperties;
    }

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigElement multipartConfigElement = multipartProperties.createMultipartConfig();
        return new UpdatableMultipartConfigElement(multipartConfigElement.getLocation(), maxFileSize * 2 * 1024 * 1024,
        		maxFileSize * 10 * 1024 * 1024, multipartConfigElement.getFileSizeThreshold());
    }
}