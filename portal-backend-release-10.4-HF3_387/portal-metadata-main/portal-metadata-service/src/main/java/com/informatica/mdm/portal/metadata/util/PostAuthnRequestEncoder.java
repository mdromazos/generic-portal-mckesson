package com.informatica.mdm.portal.metadata.util;

import java.io.InputStream;
import org.apache.commons.collections.ExtendedProperties;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.apache.velocity.runtime.resource.Resource;
import org.apache.velocity.runtime.resource.loader.ResourceLoader;
import org.opensaml.common.binding.SAMLMessageContext;
import org.opensaml.saml2.binding.encoding.HTTPPostEncoder;
import org.opensaml.ws.message.MessageContext;
import org.opensaml.ws.message.encoder.MessageEncodingException;

public class PostAuthnRequestEncoder extends HTTPPostEncoder {

	private static PostAuthnRequestEncoder theInstance;
	  
	  private static class SamlResourceVelocityLoader extends ResourceLoader {
	    private SamlResourceVelocityLoader() {}
	    
	    public void init(ExtendedProperties configuration) {}
	    
	    public InputStream getResourceStream(String source) throws ResourceNotFoundException {
	      return HTTPPostEncoder.class.getClassLoader()
	        .getResourceAsStream(source);
	    }
	    
	    public boolean isSourceModified(Resource resource) {
	      return false;
	    }
	    
	    public long getLastModified(Resource resource) {
	      return 0L;
	    }
	  }
	  
	  public static synchronized PostAuthnRequestEncoder getInstance() {
	    if (theInstance == null) {
	      VelocityEngine engine = new VelocityEngine();
	      engine.setProperty("resource.loader", "classpath");
	      engine.setProperty("classpath.resource.loader.instance", 
	          new SamlResourceVelocityLoader());
	      engine.init();
	      theInstance = new PostAuthnRequestEncoder(engine, "/templates/saml2-post-binding.vm");
	    } 
	    return theInstance;
	  }
	  
	  public PostAuthnRequestEncoder(VelocityEngine engine, String templateId) {
	    super(engine, templateId);
	  }
	  
	  public void createEncodedAndSignedAuthenticationForm(SAMLMessageContext messageContext) throws MessageEncodingException {
	    doEncode((MessageContext)messageContext);
	  }
}
