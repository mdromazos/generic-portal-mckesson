
package com.informatica.mdm.portal.metadata.auth.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

	 @Autowired
     PortalUIInterceptor portalInterceptor;
	 
	 @Autowired
	 PortalConfigInterceptor portalConfigInterceptor;
	 
	 @Autowired
	 AuthorizationInterceptor authorizationInterceptor;
	 
	 @Override
	public void addInterceptors(InterceptorRegistry registry) {

		registry.addInterceptor(portalInterceptor).excludePathPatterns(PortalRestConstants.CONFIG_UI)
				.excludePathPatterns(PortalRestConstants.ERROR_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.REST_DOC_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.PORTAL_SESSION_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.PORTAL_LOGIN_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.PORTAL_LOGOUT_MAPPING_URL)
				//.excludePathPatterns(PortalRestConstants.PORTAL_PROXY_URL)
				.excludePathPatterns(PortalRestConstants.RUNTIME_URI)
                .excludePathPatterns(PortalRestConstants.SAML_URI);
		registry.addInterceptor(portalConfigInterceptor)
				.excludePathPatterns(PortalRestConstants.CONFIG_LOGIN_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.CONFIG_LOGOUT_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.ERROR_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.REST_DOC_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.PORTALS)
				.excludePathPatterns(PortalRestConstants.CONFIG_SESSION_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.GLOBAL_CONFIG_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.PORTAL_PROXY_URL);
		registry.addInterceptor(authorizationInterceptor)
				.excludePathPatterns(PortalRestConstants.CONFIG_LOGIN_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.CONFIG_LOGOUT_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.ERROR_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.REST_DOC_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.PORTALS)
				.excludePathPatterns(PortalRestConstants.CONFIG_SESSION_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.GLOBAL_CONFIG_MAPPING_URL)
				.excludePathPatterns(PortalRestConstants.PORTAL_PROXY_URL);
	}

	@Override
	protected void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler(PortalRestConstants.REST_DOC_MAPPING_URL)
				.addResourceLocations(PortalRestConstants.CLASSPATH_RESOURCE_LOCATIONS);
		super.addResourceHandlers(registry);
	}

	@Override
	public void configurePathMatch(PathMatchConfigurer configurer) {
	    super.configurePathMatch(configurer);

	    configurer.setUseSuffixPatternMatch(false);
	}

    // @Override
	// @Bean
    // public RequestMappingHandlerAdapter createRequestMappingHandlerAdapter() {
    //     RequestMappingHandlerAdapter requestMappingHandlerAdapter = super.createRequestMappingHandlerAdapter();

    //     List<ResponseBodyAdvice<?>> responseBodyAdvices = new ArrayList<>();
    //     responseBodyAdvices.add(new PortalLogoAdvice());
    //     requestMappingHandlerAdapter.setResponseBodyAdvice(responseBodyAdvices);

    //     return requestMappingHandlerAdapter;
	// }

}

