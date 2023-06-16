package com.informatica.mdm.portal.metadata.util;

import org.opensaml.common.SAMLObject;
import org.opensaml.common.SAMLRuntimeException;
import org.opensaml.common.binding.BasicSAMLMessageContext;
import org.opensaml.common.binding.SAMLMessageContext;
import org.opensaml.saml2.binding.encoding.HTTPRedirectDeflateEncoder;
import org.opensaml.saml2.core.AuthnRequest;
import org.opensaml.saml2.core.LogoutRequest;
import org.opensaml.ws.message.encoder.MessageEncodingException;
import org.opensaml.xml.security.credential.Credential;

public class Encoder extends HTTPRedirectDeflateEncoder {
  
	public String buildRedirectURL(Credential signingCredential, String relayState, AuthnRequest request) throws MessageEncodingException {
    SAMLMessageContext<?, AuthnRequest, ?> messageContext = createMessageContext(signingCredential, relayState, 
        request);
    String encodedSamlMessage = "";
    try {
      encodedSamlMessage = deflateAndBase64Encode((SAMLObject)request);
    } catch (MessageEncodingException mce) {
      throw new SAMLRuntimeException(mce);
    } 
    return buildRedirectURL(messageContext, request.getDestination(), encodedSamlMessage);
  }
  
private SAMLMessageContext<?, AuthnRequest, ?> createMessageContext(Credential signingCredential, String relayState, AuthnRequest request) {
    BasicSAMLMessageContext basicSAMLMessageContext = new BasicSAMLMessageContext();
    basicSAMLMessageContext.setOutboundSAMLMessage((SAMLObject)request);
    basicSAMLMessageContext.setRelayState(relayState);
    basicSAMLMessageContext.setOutboundSAMLMessageSigningCredential(signingCredential);
    return (SAMLMessageContext<?, AuthnRequest, ?>)basicSAMLMessageContext;
  }

public String buildLogoutRedirectURL(Credential signingCredential, String nameIdString,
		LogoutRequest logoutRequest) throws MessageEncodingException  {
	SAMLMessageContext<?, LogoutRequest, ?> messageContext = createLogoutMessageContext(signingCredential, nameIdString, 
			logoutRequest);
	    String encodedSamlMessage = "";
	    try {
	      encodedSamlMessage = deflateAndBase64Encode((SAMLObject)logoutRequest);
	    } catch (MessageEncodingException mce) {
	      throw new SAMLRuntimeException(mce);
	    } 
	    return buildRedirectURL(messageContext, logoutRequest.getDestination(), encodedSamlMessage);
}
private SAMLMessageContext<?, LogoutRequest, ?> createLogoutMessageContext(Credential signingCredential, String nameIdString, LogoutRequest logoutRequest) {
    BasicSAMLMessageContext basicSAMLMessageContext = new BasicSAMLMessageContext();
    basicSAMLMessageContext.setOutboundSAMLMessage((SAMLObject)logoutRequest);
    basicSAMLMessageContext.setOutboundSAMLMessageSigningCredential(signingCredential);
    return (SAMLMessageContext<?, LogoutRequest, ?>)basicSAMLMessageContext;
  }
}
