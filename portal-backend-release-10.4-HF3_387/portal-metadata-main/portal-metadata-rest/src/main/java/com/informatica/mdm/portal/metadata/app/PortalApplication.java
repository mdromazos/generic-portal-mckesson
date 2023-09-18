package com.informatica.mdm.portal.metadata.app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;

import com.informatica.mdm.portal.metadata.auth.config.WebMvcConfig;
import com.informatica.mdm.portal.metadata.config.EmfServiceConfig;
import com.informatica.mdm.portal.metadata.config.PortalAppConfig;
import com.informatica.mdm.portal.metadata.config.PropertyLoader;
import org.springframework.scheduling.annotation.EnableAsync;

@EntityScan("com.informatica.mdm.portal.metadata.domain")
@ComponentScan("com.informatica.mdm.portal")
@SpringBootApplication
@EnableAsync
@Import({ PropertyLoader.class, PortalAppConfig.class, EmfServiceConfig.class, WebMvcConfig.class })
@EnableAutoConfiguration(exclude = JmxAutoConfiguration.class)
public class PortalApplication extends SpringBootServletInitializer {

	private final static Logger log = LoggerFactory.getLogger(PortalApplication.class);

	public static void main(String[] args) {
		log.info("PortalApplication Initiliazed");
		SpringApplication portalApplication = new SpringApplication(PortalApplication.class);
		portalApplication.run(args);
	}

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(PortalApplication.class).initializers(new CustomApplicationInitializer());
	}
	
}
