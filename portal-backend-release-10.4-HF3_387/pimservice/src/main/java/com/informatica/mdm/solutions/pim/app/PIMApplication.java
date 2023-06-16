package com.informatica.mdm.solutions.pim.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
@ComponentScan("com.informatica.mdm.solutions.pim")
@SpringBootApplication
@Import({PIMServiceConfig.class,WebConfig.class})
public class PIMApplication extends SpringBootServletInitializer{

	public static void main(String[] args) {
		SpringApplication pimApplication = new SpringApplication(PIMApplication.class);
		pimApplication.run(args);
	}
	
	@Override
	  protected SpringApplicationBuilder configure(SpringApplicationBuilder builder){
	    return builder.sources(PIMApplication.class).initializers(new CustomApplicationInitializer());
	  }
}
