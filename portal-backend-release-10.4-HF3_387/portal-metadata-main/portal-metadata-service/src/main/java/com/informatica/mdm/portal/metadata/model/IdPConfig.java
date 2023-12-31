package com.informatica.mdm.portal.metadata.model;

import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.cert.CertificateException;

import java.io.File;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.InputStream;

import org.opensaml.Configuration;
import org.opensaml.xml.parse.BasicParserPool;
import org.opensaml.xml.io.UnmarshallerFactory;
import org.opensaml.saml2.metadata.EntityDescriptor;
import org.opensaml.saml2.metadata.IDPSSODescriptor;
import org.opensaml.saml2.metadata.SingleSignOnService;
import org.opensaml.saml2.metadata.KeyDescriptor;
import org.opensaml.saml2.metadata.SingleLogoutService;
import org.opensaml.xml.signature.KeyInfo;
import org.opensaml.xml.signature.X509Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.opensaml.xml.signature.X509Certificate;
import org.opensaml.xml.security.credential.UsageType;
import org.opensaml.common.xml.SAMLConstants;

import javax.xml.bind.DatatypeConverter;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.informatica.mdm.portal.metadata.exception.SAMLException;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;


/**
 * IdpConfig contains information about the SAML 2.0 Identity Provider
 * that authenticates users for a service.  Generally, it will be
 * initialized by loading the metadata file from disk.
 */

public class IdPConfig
{
	
	
	private final static Logger log = LoggerFactory.getLogger(IdPConfig.class);
    /**
     * Default constructor.  Applications may use this if the
     * configuration information comes from some outside source.
     */
    public IdPConfig()
    {
    }

    /**
     * Construct a new IdpConfig from a metadata XML file.
     *
     * @param metadataFile File where the metadata lives
     *
     * @throws SAMLException if an error condition occurs while trying to parse and process
     *              the metadata
     */
    public IdPConfig(File metadataFile)
        throws SAMLException
    {
        FileInputStream inputStream;
        try {
            inputStream = new FileInputStream(metadataFile);        
        } 
        catch (java.io.IOException e) {
            throw new SAMLException(e);
        }
        
        try {
            init(inputStream);
        } finally {
            try {
                inputStream.close();
            }
            catch (java.io.IOException e) {
                //Ignore
            }
        }
    }

    /**
     * Construct a new IdpConfig from a metadata XML input stream.
     *
     * @param inputStream An input stream containing a metadata XML document
     *
     * @throws SAMLException if an error condition occurs while trying to parse and process
     *              the metadata
     */
    public IdPConfig(InputStream inputStream)
        throws SAMLException
    {
        init(inputStream);
    }

    private void init(InputStream inputStream)
            throws SAMLException
    {
        BasicParserPool parsers = new BasicParserPool();
        parsers.setNamespaceAware(true);

        EntityDescriptor edesc;

        try {
            Document doc = parsers.parse(inputStream);
            Element root = doc.getDocumentElement();

            UnmarshallerFactory unmarshallerFactory =
                Configuration.getUnmarshallerFactory();

            edesc = (EntityDescriptor) unmarshallerFactory
                .getUnmarshaller(root)
                .unmarshall(root);
        }
        catch (org.opensaml.xml.parse.XMLParserException e) {
            throw new SAMLException(e);
        }
        catch (org.opensaml.xml.io.UnmarshallingException e) {
            throw new SAMLException(e);
        }        

        // fetch idp information
        IDPSSODescriptor idpDesc = edesc.getIDPSSODescriptor(
            "urn:oasis:names:tc:SAML:2.0:protocol");
        
        if (edesc.getEntityID() == null) {
            log.error("No acceptable entityID found");
            throw new SAMLException(ErrorCodeContants.CONFIG1002,"entityID is Empty", "entityID is Empty");
        }
        if (idpDesc == null) {
            log.error("No IDP SSO descriptor found");
            throw new SAMLException(ErrorCodeContants.CONFIG1007,"IDP SSO descriptor is Empty", "IDP SSO descriptor is Empty");
        }
        // get the login http-redirect binding
        String loginUrlRedirect = null;        
        for (SingleSignOnService svc: idpDesc.getSingleSignOnServices()) {
            if (svc.getBinding().equals(SAMLConstants.SAML2_REDIRECT_BINDING_URI)) {
            	loginUrlRedirect = svc.getLocation();
                break;
            }
        }
        // get the login http-post binding
        String loginUrlPost = null;
        for (SingleSignOnService svc: idpDesc.getSingleSignOnServices()) {
            if (svc.getBinding().equals(SAMLConstants.SAML2_POST_BINDING_URI)) {
            	loginUrlPost = svc.getLocation();
                break;
            }
        }
     // get the logout http-redirect binding
        String logoutUrlRedirect = null;
        for (SingleLogoutService svc: idpDesc.getSingleLogoutServices()) {
            if (svc.getBinding().equals(SAMLConstants.SAML2_REDIRECT_BINDING_URI)) {
            	logoutUrlRedirect = svc.getLocation();
                break;
            }
        }
     // get the logout http-post binding
        String logoutUrlPost = null;
        for (SingleLogoutService svc: idpDesc.getSingleLogoutServices()) {
            if (svc.getBinding().equals(SAMLConstants.SAML2_POST_BINDING_URI)) {
            	logoutUrlPost = svc.getLocation();
                break;
            }
        }

        if (loginUrlRedirect == null) {
        	log.error("No acceptable Single Sign-on Service found for loginUrlRedirect");
        	throw new SAMLException(ErrorCodeContants.CONFIG1004,"loginUrlRedirect is Empty", "loginUrlRedirect is Empty");
        }
        if (loginUrlPost == null) {
        	log.error("No acceptable Single Sign-on Service found for loginUrlPost");
        	throw new SAMLException(ErrorCodeContants.CONFIG1005,"loginUrlPost is Empty","loginUrlPost is Empty");
        }
        // extract the first signing cert from the file
        Certificate cert = null;
        String certString= null;
        find_cert_loop:
        for (KeyDescriptor kdesc: idpDesc.getKeyDescriptors()) {
            if (kdesc.getUse() != UsageType.SIGNING)
                continue;

            KeyInfo ki = kdesc.getKeyInfo();
            if (ki == null)
                continue;

            for (X509Data x509data: ki.getX509Datas()) {
                for (X509Certificate xcert: x509data.getX509Certificates()) {
                    try {
                        cert = certFromString(xcert.getValue());
                        break find_cert_loop;
                    } catch (CertificateException e) {
                        // keep trying certs; if we don't have one we'll
                        // throw a SAMLException at the end.
                    }
                }
            }
        }
        
        if (cert == null) {
        	log.error("No valid signing cert found");
        	throw new SAMLException(ErrorCodeContants.CONFIG1003,"Certificate not found","Certificate not found");        	
        }
        find_certString_loop:
            for (KeyDescriptor kdesc: idpDesc.getKeyDescriptors()) {
                if (kdesc.getUse() != UsageType.SIGNING)
                    continue;

                KeyInfo ki = kdesc.getKeyInfo();
                if (ki == null)
                    continue;

                for (X509Data x509data: ki.getX509Datas()) {
                    for (X509Certificate xcert: x509data.getX509Certificates()) {
                        certString = xcert.getValue();                        	
						break find_certString_loop;
                    }
                }
            }
        
        if (certString == null) {
        	log.error("No valid signing certString found");
        	throw new SAMLException(ErrorCodeContants.CONFIG1003,"Certificate String not found","Certificate String not found");
        }
        this.setEntityId(edesc.getEntityID());
        this.setLoginUrlRedirect(loginUrlRedirect);
        this.setLoginUrlPost(loginUrlPost);
        this.setCert(cert);
        this.setCertString(certString);
        this.setLogoutUrlRedirect(logoutUrlRedirect);
        this.setLogoutUrlPost(logoutUrlPost);
    }

    private Certificate certFromString(String b64data)
        throws CertificateException
    {
        byte[] decoded = DatatypeConverter.parseBase64Binary(b64data);
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        return cf.generateCertificate(new ByteArrayInputStream(decoded));
    }
    
    
    /** To whom requests are addressed */
    private String entityId;

    /** Where the AuthnRequest is sent (SSOLoginService endpoint) */
    private String loginUrlRedirect;
    private String loginUrlPost;
    private String logoutUrlRedirect;
    private String logoutUrlPost;

    /**
     * get the IdP logout URL Post.
    */
	public String getLogoutUrlPost() {
		return logoutUrlPost;
	}
	
	/**
     * Set the IdP logout URL Post.
    */
	public void setLogoutUrlPost(String logoutUrlPost) {
		this.logoutUrlPost = logoutUrlPost;
	}


	/** Certificate used to validate assertions */
    private Certificate cert;
    
    /** Certificate string used to store saml config */
    private String certString;

    public String getCertString() {
		return certString;
	}

	public void setCertString(String certString) {
		this.certString = certString;
	}

	/**
     * Set the Idp Entity Id.
     */
    public void setEntityId(String entityId)
    {
        this.entityId = entityId;
    }

    /**
     * Get the Idp Entity Id.
     */
    public String getEntityId()
    {
        return this.entityId;
    }

    /**
     * Set the IdP login URL.  The login URL is where the
     * user is redirected from the SP to initiate the
     * authentication process.
     */
    public void setLoginUrlRedirect(String loginUrlRedirect)
    {
        this.loginUrlRedirect = loginUrlRedirect;
    }

    /**
     * Get the IdP login URL.
     */
    public String getLoginUrlRedirect()
    {
        return this.loginUrlRedirect;
    }
    
    /**
     * Get the IdP logout URL Redirect.
     */
    public String getLogoutUrlRedirect() {
		return logoutUrlRedirect;
	}

    /**
     * Set the IdP logout URL Redirect.
     */
	public void setLogoutUrlRedirect(String logoutUrlRedirect) {
		this.logoutUrlRedirect = logoutUrlRedirect;
	}

    /**
     * Set the IdP public key certificate.
     * The certificate is used to validate signatures
     * in the assertion.
     */
    public void setCert(Certificate cert)
    {
        this.cert = cert;
    }

    /**
     * Get the Idp public key certificate.
     */
    public Certificate getCert()
    {
        return this.cert;
    }

	public String getLoginUrlPost() {
		return loginUrlPost;
	}

	public void setLoginUrlPost(String loginUrlPost) {
		this.loginUrlPost = loginUrlPost;
	}
}
