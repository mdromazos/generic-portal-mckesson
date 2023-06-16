package com.informatica.mdm.portal.metadata.model;

public class SAMLConfig {
	
	private String				spEntityId;
	private String				idpEntityId;
	private String				acsURL;
	private String				issuerURL;
	private String				ssoSvcURL;
	private	String				ssoSvcBinding;
	private String				sloSvcURL;
	private	String				sloSvcBinding;
	private String				nameIDField;
	private String				signingCertificate;
	private boolean				encryptWithSigningCert;
	private String				encryptionCertificate;
	private String				logoutPageURL;
	private int					clockSkew; 			//in seconds
	private boolean				signAuthRequest;
	private boolean				signAssertion; 		//Assertions sent back using POST binding must always be signed.
	private boolean				signLogoutRequest;
	private String				nameIDFormat;
    private String				samlRedirectURL;
	

	public static final int DEFAULT_CLOCK_SKEW = 180; //in seconds
	
	public enum Binding {
		HTTP_POST("urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"),
		HTTP_REDIRECT("urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect");
		
		private String value;
		
		Binding(String v) {
			value = v;
		}
		
		public static Binding getBinding(String bindingValue) {
			for(Binding v : values()) {
				if(v.getBindingValue().equalsIgnoreCase(bindingValue))
					return v;
			}
			return null;
		}
		
		public String getBindingValue() {
			return value;
		}
	};
	
	
	public SAMLConfig() {
		ssoSvcBinding = Binding.HTTP_POST.getBindingValue();
		sloSvcBinding = Binding.HTTP_POST.getBindingValue();
		clockSkew = SAMLConfig.DEFAULT_CLOCK_SKEW;
		
		
		nameIDField = "NameID";
		
		signAuthRequest = true;
		signLogoutRequest = true;
		signAssertion = true;
	}


	public String getIssuerURL() {
		return issuerURL;
	}


	public void setIssuerURL(String issuerURL) {
		this.issuerURL = issuerURL;
	}


	public String getSsoSvcURL() {
		return ssoSvcURL;
	}


	public void setSsoSvcURL(String ssoSvcURL) {
		this.ssoSvcURL = ssoSvcURL;
	}


	public String getSsoSvcBinding() {
		return ssoSvcBinding;
	}


	public void setSsoSvcBinding(String ssoSvcBinding) {
		this.ssoSvcBinding = ssoSvcBinding;
	}


	public String getSloSvcURL() {
		return sloSvcURL;
	}


	public void setSloSvcURL(String sloSvcURL) {
		this.sloSvcURL = sloSvcURL;
	}


	public String getSloSvcBinding() {
		return sloSvcBinding;
	}


	public void setSloSvcBinding(String sloSvcBinding) {
		this.sloSvcBinding = sloSvcBinding;
	}


	public String getNameIDField() {
		return nameIDField;
	}


	public void setNameIDField(String nameIDField) {
		this.nameIDField = nameIDField;
	}


	public String getSigningCertificate() {
		return signingCertificate;
	}


	public void setSigningCertificate(String signingCertificate) {
		this.signingCertificate = signingCertificate;
	}


	public boolean isEncryptWithSigningCert() {
		return encryptWithSigningCert;
	}


	public void setEncryptWithSigningCert(boolean encryptWithSigningCert) {
		this.encryptWithSigningCert = encryptWithSigningCert;
	}


	public String getEncryptionCertificate() {
		return encryptionCertificate;
	}


	public void setEncryptionCertificate(String encryptionCertificate) {
		this.encryptionCertificate = encryptionCertificate;
	}


	public String getLogoutPageURL() {
		return logoutPageURL;
	}


	public void setLogoutPageURL(String logoutPageURL) {
		this.logoutPageURL = logoutPageURL;
	}


	public int getClockSkew() {
		return clockSkew;
	}


	public void setClockSkew(int clockSkew) {
		this.clockSkew = clockSkew;
	}


	public boolean isSignAuthRequest() {
		return signAuthRequest;
	}


	public void setSignAuthRequest(boolean signAuthRequest) {
		this.signAuthRequest = signAuthRequest;
	}


	public boolean isSignAssertion() {
		return signAssertion;
	}


	public void setSignAssertion(boolean signAssertion) {
		this.signAssertion = signAssertion;
	}


	public boolean isSignLogoutRequest() {
		return signLogoutRequest;
	}


	public void setSignLogoutRequest(boolean signLogoutRequest) {
		this.signLogoutRequest = signLogoutRequest;
	}


	public String getAcsURL() {
		return acsURL;
	}


	public void setAcsURL(String acsURL) {
		this.acsURL = acsURL;
	}


	public String getSpEntityId() {
		return spEntityId;
	}


	public void setSpEntityId(String spEntityId) {
		this.spEntityId = spEntityId;
	}
	
	public String getIdpEntityId() {
		return idpEntityId;
	}


	public void setIdpEntityId(String idpEntityId) {
		this.idpEntityId = idpEntityId;
	}

    public String getNameIDFormat() {
        return nameIDFormat;
    }

    public void setNameIDFormat(String nameIDFormat) {
        this.nameIDFormat = nameIDFormat;
    }

    public String getSamlRedirectURL() {
        return samlRedirectURL;
    }

    public void setSamlRedirectURL(String samlRedirectURL) {
        this.samlRedirectURL = samlRedirectURL;
    }
	
	

}
