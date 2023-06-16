package com.informatica.mdm.portal.metadata.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.exception.SAMLException;
import com.informatica.mdm.portal.metadata.model.IdPConfig;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.model.SAMLConfig;
import com.informatica.mdm.portal.metadata.service.PortalConfigService;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.service.SAMLService;
import com.informatica.mdm.portal.metadata.util.*;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.opensaml.Configuration;
import org.opensaml.common.SAMLObject;
import org.opensaml.common.SAMLObjectBuilder;
import org.opensaml.common.SAMLVersion;
import org.opensaml.common.binding.BasicSAMLMessageContext;
import org.opensaml.common.binding.SAMLMessageContext;
import org.opensaml.common.xml.SAMLConstants;
import org.opensaml.saml2.core.*;
import org.opensaml.saml2.core.impl.IssuerBuilder;
import org.opensaml.saml2.core.impl.LogoutRequestBuilder;
import org.opensaml.saml2.core.impl.NameIDBuilder;
import org.opensaml.saml2.encryption.Decrypter;
import org.opensaml.saml2.metadata.*;
import org.opensaml.ws.message.encoder.MessageEncodingException;
import org.opensaml.ws.transport.InTransport;
import org.opensaml.ws.transport.OutTransport;
import org.opensaml.ws.transport.http.HTTPOutTransport;
import org.opensaml.ws.transport.http.HTTPTransportUtils;
import org.opensaml.ws.transport.http.HttpServletRequestAdapter;
import org.opensaml.ws.transport.http.HttpServletResponseAdapter;
import org.opensaml.xml.XMLObject;
import org.opensaml.xml.XMLObjectBuilderFactory;
import org.opensaml.xml.encryption.DecryptionException;
import org.opensaml.xml.encryption.InlineEncryptedKeyResolver;
import org.opensaml.xml.io.Marshaller;
import org.opensaml.xml.io.MarshallingException;
import org.opensaml.xml.parse.BasicParserPool;
import org.opensaml.xml.security.credential.BasicCredential;
import org.opensaml.xml.security.credential.Credential;
import org.opensaml.xml.security.keyinfo.StaticKeyInfoCredentialResolver;
import org.opensaml.xml.security.x509.BasicX509Credential;
import org.opensaml.xml.signature.Signature;
import org.opensaml.xml.signature.SignatureValidator;
import org.opensaml.xml.util.XMLHelper;
import org.opensaml.xml.validation.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.DatatypeConverter;
import javax.xml.namespace.QName;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.StreamSupport;

@Service
public class SAMLServiceImpl implements SAMLService {

	private final static Logger log = LoggerFactory.getLogger(SAMLServiceImpl.class);
	private static final int slack = (int) TimeUnit.MINUTES.toSeconds(5);

	@Autowired
	ObjectMapper mapper;
	
	@Autowired
	private PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver;
	
	@Autowired
	private PortalConfigService portalConfigService;
	
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	@Autowired
	@Qualifier(value = "externalErrorProperties")
	private Map<String, Map<String, Properties>> externalErrorProperties;

	@Autowired
	@Qualifier(value = "externalBundleProperties")
	private Map<String, Map<String, Properties>> externalBundleProperties;
	
	@Autowired
	private PortalPersistenceService portalService;

	@Value("${cmx.home}")
	private String cmxHome;

	@Value("${cmx.appserver.type}")
	private String appServerType;
	
	private String portalCmxUrl;
	
	@Value("${portal.cmx.url}")
    public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}

	@Override
	public String getRelayState(HttpServletRequest request, String defaultRelayState) {
	    String result = defaultRelayState;
	    String parameter = request.getParameter(SAMLConfigConstants.SAML_RELAT_STATE);
	    if (!StringUtils.isBlank(parameter))
	      result = parameter; 
	    log.trace("Using relay state:" + result);
	    return result;
	  }

	@Override
	public AttributeSet validateResponse(String authnResponse, SAMLConfig samlConfig) throws SAMLException {
		SAMLInit.initialize();		
		byte[] decoded = DatatypeConverter.parseBase64Binary(authnResponse);
		authnResponse = new String(decoded, StandardCharsets.UTF_8);
		Response response = parseResponse(authnResponse);
        String sessionIndex = "";
		try {
			sessionIndex = validate(response, samlConfig);
		} catch (ValidationException e) {
			log.error("SAML Response is not valid : " + e.getMessage());
			throw new SAMLException(ErrorCodeContants.CONFIG1101,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1101),
					e.getMessage());
		} catch (CertificateException e) {
			log.error("SAML Certificate error found : " + e.getMessage());
			throw new SAMLException(ErrorCodeContants.CONFIG1102,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1102),
					e.getMessage());
		}

		List<Assertion> assertions = null;
		try {
			assertions = getAssertions(response);
		} catch (DecryptionException e) {
			throw new SAMLException(e);
		}

		// we only look at first assertion
		if (assertions.size() != 1) {
			log.error("Response should have a single assertion.");
			throw new SAMLException(ErrorCodeContants.CONFIG1103,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1103),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1103));
		}
		Assertion assertion = assertions.get(0);

		Subject subject = assertion.getSubject();
		if (subject == null) {
			log.error("No subject contained in the assertion.");
			throw new SAMLException(ErrorCodeContants.CONFIG1104,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1104),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1104));
		}
		if (subject.getNameID() == null) {
			log.error("No NameID found in the subject.");
			throw new SAMLException(ErrorCodeContants.CONFIG1105,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1105),
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1105));
		}

		String nameId = subject.getNameID().getValue();

		HashMap<String, List<String>> attributes = new HashMap<String, List<String>>();

		for (AttributeStatement atbs : assertion.getAttributeStatements()) {
			for (Attribute atb : atbs.getAttributes()) {
				String name = atb.getName();
				List<String> values = new ArrayList<String>();
				for (XMLObject obj : atb.getAttributeValues()) {
					values.add(obj.getDOM().getTextContent());
				}
				attributes.put(name, values);
			}
		}
		return new AttributeSet(nameId,sessionIndex,attributes);
	}

	private Response parseResponse(String authnResponse) throws SAMLException {
		try {
			BasicParserPool parsers = new BasicParserPool();
			parsers.setNamespaceAware(true);
			Document doc = parsers.getBuilder().parse(new InputSource(new StringReader(authnResponse)));
			Element root = doc.getDocumentElement();
			return (Response) Configuration.getUnmarshallerFactory().getUnmarshaller(root).unmarshall(root);
		} catch (org.opensaml.xml.parse.XMLParserException  |org.opensaml.xml.io.UnmarshallingException  | org.xml.sax.SAXException  | java.io.IOException e) {
			log.error("Error while parsing auth response " + e.getMessage());
			throw new SAMLException(ErrorCodeContants.CONFIG1106,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1106),
					e.getMessage());
		} 
	}

	private List<Assertion> getAssertions(Response response) throws DecryptionException {
		List<Assertion> assertions = new ArrayList<Assertion>();
		assertions.addAll(response.getAssertions());

		for (EncryptedAssertion e : response.getEncryptedAssertions()) {
			assertions.add(decrypt(e));
		}

		return assertions;
	}

	private Assertion decrypt(EncryptedAssertion encrypted) throws DecryptionException {
		Credential cred = getSigningCredentialsWithErrorHandling();
		StaticKeyInfoCredentialResolver resolver = new StaticKeyInfoCredentialResolver(cred);
		Decrypter decrypter = new Decrypter(null, resolver, new InlineEncryptedKeyResolver());
		decrypter.setRootInNewDocument(true);
		return decrypter.decrypt(encrypted);
	}

	private Certificate certFromString(String b64data) throws CertificateException {
		byte[] decoded = DatatypeConverter.parseBase64Binary(b64data);
		CertificateFactory cf = CertificateFactory.getInstance(SAMLConfigConstants.SAML_CERT_TYPE);
		return cf.generateCertificate(new ByteArrayInputStream(decoded));
	}

	private String validate(Response response, SAMLConfig samlConfig) throws ValidationException, CertificateException {

	    String sessionIndex = "";
		BasicCredential cred = new BasicCredential();
		cred.setEntityId(samlConfig.getIdpEntityId());		
		cred.setPublicKey(certFromString(samlConfig.getSigningCertificate()).getPublicKey());
		SignatureValidator sigValidator = new SignatureValidator(cred);

		// response signature must match IdP's key, if present
		Signature sig = response.getSignature();
		if (sig != null)
			sigValidator.validate(sig);

		// response must be successful
		if (response.getStatus() == null || response.getStatus().getStatusCode() == null
				|| !(StatusCode.SUCCESS_URI.equals(response.getStatus().getStatusCode().getValue()))) {
			log.error("Response has an unsuccessful status code");
			throw new ValidationException("Response has an unsuccessful status code");
		}

		// response destination must match ACS
		if (!samlConfig.getAcsURL().equals(response.getDestination()))
			throw new ValidationException("Response is destined for a different endpoint");

        DateTime now = new DateTime(DateTimeZone.UTC);
        log.info("Server UTC Now "+now);

		// issue instant must be within a day
		DateTime issueInstant = response.getIssueInstant();
        log.info("SAML Response  issueInstant "+issueInstant);
		if (issueInstant != null) {
			if (issueInstant.isBefore(now.minusSeconds(slack)))
				throw new ValidationException("Response IssueInstant is in the past");

			if (issueInstant.isAfter(now.plusSeconds(slack)))
				throw new ValidationException("Response IssueInstant is in the future");
		}

		List<Assertion> assertions = null;
		try {
			assertions = getAssertions(response);
		} catch (DecryptionException e) {
			throw new ValidationException(e);
		}

		for (Assertion assertion : assertions) {

			// Assertion must be signed correctly
			if (!assertion.isSigned())
				throw new ValidationException("Assertion must be signed");

			sig = assertion.getSignature();
			sigValidator.validate(sig);

			// Assertion must contain an authnstatement
			// with an unexpired session
			if (assertion.getAuthnStatements().isEmpty()) {
				log.error("Assertion should contain an AuthnStatement");
				throw new ValidationException("Assertion should contain an AuthnStatement");
			}
			for (AuthnStatement as : assertion.getAuthnStatements()) {
				DateTime sessionTime = as.getSessionNotOnOrAfter();
                sessionIndex = as.getSessionIndex();
                if (sessionTime != null) {
					DateTime exp = sessionTime.plusSeconds(slack);
					if (exp != null && (now.isEqual(exp) || now.isAfter(exp))) {
                        log.error("AuthnStatement has . sessionTime "+sessionTime + " expectedTime "+ exp);
                        throw new ValidationException("AuthnStatement has expired");
                    }
				}
			}

			if (assertion.getConditions() == null) {
				log.error("Assertion should contain conditions");
				throw new ValidationException("Assertion should contain conditions");
			}

			// Assertion IssueInstant must be within a day
			DateTime instant = assertion.getIssueInstant();
			if (instant != null) {
				if (instant.isBefore(now.minusSeconds(slack)))
					throw new ValidationException("Response IssueInstant is in the past");

				if (instant.isAfter(now.plusSeconds(slack)))
					throw new ValidationException("Response IssueInstant is in the future");
			}

			// Conditions must be met by current time
			Conditions conditions = assertion.getConditions();
			DateTime notBefore = conditions.getNotBefore();
			DateTime notOnOrAfter = conditions.getNotOnOrAfter();

			if (notBefore == null || notOnOrAfter == null)
				throw new ValidationException("Assertion conditions must have limits");

			notBefore = notBefore.minusSeconds(slack);
			notOnOrAfter = notOnOrAfter.plusSeconds(slack);

			if (now.isBefore(notBefore))
				throw new ValidationException("Assertion conditions is in the future");

			if (now.isEqual(notOnOrAfter) || now.isAfter(notOnOrAfter))
				throw new ValidationException("Assertion conditions is in the past");

			// If subjectConfirmationData is included, it must
			// have a recipient that matches ACS, with a valid
			// NotOnOrAfter
			Subject subject = assertion.getSubject();
			if (subject != null && !subject.getSubjectConfirmations().isEmpty()) {
				boolean foundRecipient = false;
				for (SubjectConfirmation sc : subject.getSubjectConfirmations()) {
					if (sc.getSubjectConfirmationData() == null)
						continue;

					SubjectConfirmationData scd = sc.getSubjectConfirmationData();
					if (scd.getNotOnOrAfter() != null) {
						DateTime chkdate = scd.getNotOnOrAfter().plusSeconds(slack);
						if (now.isEqual(chkdate) || now.isAfter(chkdate)) {
							log.error("SubjectConfirmationData is in the past");
							throw new ValidationException("SubjectConfirmationData is in the past");
						}
					}

					if (samlConfig.getAcsURL().equals(scd.getRecipient()))
						foundRecipient = true;
				}

				if (!foundRecipient)
					throw new ValidationException("No SubjectConfirmationData found for ACS");
			}

			// audience must include intended SP issuer
			if (conditions.getAudienceRestrictions().isEmpty())
				throw new ValidationException("Assertion conditions must have audience restrictions");

			// only one audience restriction supported: we can only
			// check against the single SP.
			if (conditions.getAudienceRestrictions().size() > 1)
				throw new ValidationException("Assertion contains multiple audience restrictions");

			AudienceRestriction ar = conditions.getAudienceRestrictions().get(0);

			// at least one of the audiences must match our SP
			boolean foundSP = false;
			for (Audience a : ar.getAudiences()) {
				if (samlConfig.getSpEntityId().equals(a.getAudienceURI()))
					foundSP = true;
			}
			if (!foundSP)
				throw new ValidationException("Assertion audience does not include issuer");
		}
		return sessionIndex;
	}	

	@Override
	public void buildAndEncodeAuthnRequestForm(String relayState, HttpServletRequest request,
			HttpServletResponse response, SAMLConfig samlConfig) throws SAMLException {		
		String requestID = SAMLUtil.generateRequestId();
		String ssoServiceBinding = samlConfig.getSsoSvcBinding();
		String requestUrl = samlConfig.getSsoSvcURL();
		String spEntityID = samlConfig.getSpEntityId();
		try {
			SAMLInit.initialize();
			AuthnRequest authnRequest = buildSamlAuthnRequest(requestID, samlConfig);

			if (SAMLConstants.SAML2_POST_BINDING_URI.equals(ssoServiceBinding)) {
				SAMLMessageContext<?, AuthnRequest, ?> messageContext = createMessageContext(
						checkSignedAuthRequestRequired(samlConfig), relayState, authnRequest, requestUrl, request,
						response);
				log.trace("create PostAuthnRequestForm with requestID=" + requestID + ", relayState=" + relayState
						+ ", redirectUrl=" + requestUrl + ", entityID=" + spEntityID);
				PostAuthnRequestEncoder postEncoder = PostAuthnRequestEncoder.getInstance();
				postEncoder.createEncodedAndSignedAuthenticationForm(messageContext);
			} else if (SAMLConstants.SAML2_REDIRECT_BINDING_URI.equals(ssoServiceBinding)) {
				Encoder encoder = new Encoder();
				String url = encoder.buildRedirectURL(checkSignedAuthRequestRequired(samlConfig), relayState,
						authnRequest);
				response.setCharacterEncoding(SAMLConfigConstants.SAML_UTF8);
				response.setHeader("Cache-control", "no-cache, no-store");
				response.setHeader("Pragma", "no-cache");
				response.setHeader("Access-Control-Allow-Origin", "*");
				try {
					response.sendRedirect(url);
				} catch (IOException ioe) {
					throw new SAMLException(ioe.getLocalizedMessage());
				}
			} else {
				throw new SAMLException(ErrorCodeContants.CONFIG1107,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1107),
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1107));
			}

		} catch (MessageEncodingException mce) {
			throw new SAMLException(ErrorCodeContants.CONFIG1108,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1108),
					mce.getMessage());
		}

	}

	private AuthnRequest buildSamlAuthnRequest(String requestID, SAMLConfig samlConfig) {

		XMLObjectBuilderFactory builderFactory = Configuration.getBuilderFactory();
		SAMLObjectBuilder<AuthnRequest> responseBuilder = (SAMLObjectBuilder<AuthnRequest>) builderFactory.getBuilder(AuthnRequest.DEFAULT_ELEMENT_NAME);
		AuthnRequest authnReq = responseBuilder.buildObject(new QName(SAMLConstants.SAML20P_NS, AuthnRequest.DEFAULT_ELEMENT_LOCAL_NAME, SAMLConfigConstants.SAMLP_PREFIX));

		authnReq.setID(requestID);
		authnReq.setVersion(SAMLVersion.VERSION_20);
		authnReq.setIssueInstant(new DateTime());
		authnReq.setDestination(samlConfig.getSsoSvcURL());
		authnReq.setAssertionConsumerServiceURL(samlConfig.getAcsURL());

		SAMLObjectBuilder<Issuer> issuerBuilder = (SAMLObjectBuilder<Issuer>) builderFactory.getBuilder(Issuer.DEFAULT_ELEMENT_NAME);
		Issuer issuer = issuerBuilder.buildObject(new QName(SAMLConstants.SAML20_NS, Issuer.DEFAULT_ELEMENT_LOCAL_NAME, SAMLConfigConstants.SAML_PREFIX));
		issuer.setValue(samlConfig.getSpEntityId());
		authnReq.setIssuer(issuer);

		if(!StringUtils.isEmpty(samlConfig.getNameIDFormat())) {
			SAMLObjectBuilder<NameIDPolicy> nameIdPolicyBuilder = (SAMLObjectBuilder<NameIDPolicy>)builderFactory.getBuilder(
					NameIDPolicy.DEFAULT_ELEMENT_NAME);
			NameIDPolicy nameIdPolicy = nameIdPolicyBuilder.buildObject(new QName(SAMLConstants.SAML20P_NS, NameIDPolicy.DEFAULT_ELEMENT_LOCAL_NAME, SAMLConfigConstants.SAMLP_PREFIX));
			nameIdPolicy.setFormat(samlConfig.getNameIDFormat());
			authnReq.setNameIDPolicy(nameIdPolicy);
		}

		return authnReq;

	}
	@Override
	public Map<String, String> buildAndEncodeLogoutRequestForm(String nameIdString, HttpServletRequest httpRequest,
			HttpServletResponse httpResponse, SAMLConfig samlConfig) throws SAMLException {
		Map<String, String> samlLogoutUrl = null;
		String requestID = SAMLUtil.generateRequestId();
		String sloServiceBinding = samlConfig.getSloSvcBinding();
		String logoutRequestUrl = samlConfig.getSloSvcURL();
		String spEntityID = samlConfig.getSpEntityId();
		try {
			SAMLInit.initialize();
			LogoutRequest logoutRequest = buildSamlLogoutRequest(logoutRequestUrl, requestID, spEntityID, nameIdString);

			if (SAMLConstants.SAML2_REDIRECT_BINDING_URI.equals(sloServiceBinding)) {
				Encoder encoder = new Encoder();
				samlLogoutUrl = new HashMap<String, String>();
				String logoutUrl = encoder.buildLogoutRedirectURL(checkSignedLogoutRequestRequired(samlConfig),
						nameIdString, logoutRequest);
				log.info("SAML Logout redirect URL : {}", logoutUrl);
				samlLogoutUrl.put(SAMLConfigConstants.SAML_LOGOUT_URL, logoutUrl);
				return samlLogoutUrl;// just returning saml logoutUrl to Logout API response
			} else {
				log.info("Returning null, binding type is POST binding : {}", samlLogoutUrl);
				return samlLogoutUrl; // just returning null for POST binding URI
			}

		} catch (MessageEncodingException mce) {
			throw new SAMLException(ErrorCodeContants.CONFIG1108,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1108), mce.getMessage());
		}
	}
	
	private LogoutRequest buildSamlLogoutRequest(String redirectUrl, String requestID, String spEntityID,
			String nameIdString) {
		Issuer issuer = new IssuerBuilder().buildObject();
		issuer.setValue(spEntityID);
		NameID nameID = new NameIDBuilder().buildObject();
		nameID.setValue(nameIdString);
		LogoutRequest logoutRequest = new LogoutRequestBuilder().buildObject();
		logoutRequest.setID(requestID);
		logoutRequest.setDestination(redirectUrl);
		logoutRequest.setVersion(SAMLVersion.VERSION_20);
		logoutRequest.setIssueInstant(new DateTime());
		logoutRequest.setIssuer(issuer);
		logoutRequest.setNameID(nameID);
		logoutRequest.setReason("Logout Request");

		return logoutRequest;
	}
	
	@SuppressWarnings("unchecked")
	private <T extends SAMLObject> SAMLObjectBuilder<T> createBuilder(QName defaultElementName) {
		XMLObjectBuilderFactory builderFactory = Configuration.getBuilderFactory();
		return (SAMLObjectBuilder<T>) builderFactory.getBuilder(defaultElementName);

	}

	private Issuer createIssuer(String spEntityID) {
		Issuer result = (Issuer) createBuilder(Issuer.DEFAULT_ELEMENT_NAME).buildObject();
		result.setValue(spEntityID);
		return result;

	}

	private SAMLMessageContext<?, AuthnRequest, ?> createMessageContext(Credential signingCredential, String relayState,
			AuthnRequest authnRequest, String endpointLocation, HttpServletRequest request,
			HttpServletResponse response) {
		BasicSAMLMessageContext basicSAMLMessageContext = new BasicSAMLMessageContext();
		Endpoint samlEndpoint = buildEndpoint(endpointLocation);
		basicSAMLMessageContext.setPeerEntityEndpoint(samlEndpoint);
		basicSAMLMessageContext.setOutboundSAMLMessage((SAMLObject) authnRequest);
		basicSAMLMessageContext.setRelayState(relayState);
		basicSAMLMessageContext.setOutboundSAMLMessageSigningCredential(signingCredential);
		basicSAMLMessageContext.setInboundMessageTransport((InTransport) new HttpServletRequestAdapter(request));
		HttpServletResponseAdapter httpServletResponseAdapter = new HttpServletResponseAdapter(response,
				request.isSecure());
		HTTPTransportUtils.setUTF8Encoding((HTTPOutTransport) httpServletResponseAdapter);
		basicSAMLMessageContext.setOutboundMessageTransport((OutTransport) httpServletResponseAdapter);
		return (SAMLMessageContext<?, AuthnRequest, ?>) basicSAMLMessageContext;

	}

	private Endpoint buildEndpoint(String endpointLocation) {
		SAMLObjectBuilder<Endpoint> endpointBuilder = createBuilder(AssertionConsumerService.DEFAULT_ELEMENT_NAME);
		Endpoint samlEndpoint = (Endpoint) endpointBuilder.buildObject();
		samlEndpoint.setLocation(endpointLocation);
		return samlEndpoint;
	}

	private Credential checkSignedAuthRequestRequired(SAMLConfig samlConfig) {
		Credential result = null;
		if (samlConfig.isSignAuthRequest())
			result = getSigningCredentialsWithErrorHandling();
		return result;
	}
	
	private Credential checkSignedLogoutRequestRequired(SAMLConfig samlConfig) {
		Credential result = null;
		if (samlConfig.isSignLogoutRequest())
			result = getSigningCredentialsWithErrorHandling();
		return result;
	}

	private Credential getSigningCredentialsWithErrorHandling() {

		PkiUtilProvider pkiUtilProvider = PkiUtilProvider.getInstance(cmxHome);
		PKIUtil pkiUtil = pkiUtilProvider.getPkiUtil();
		X509Certificate certificate = (X509Certificate) pkiUtil.getCertificate(PortalServiceConstants.TRUSTED_APP);
		PublicKey publicKey = certificate.getPublicKey();
		PrivateKey privateKey = pkiUtil.getPrivateKey(PortalServiceConstants.TRUSTED_APP);
		BasicX509Credential credential = new BasicX509Credential();
		credential.setPublicKey(publicKey);
		credential.setPrivateKey(privateKey);
		credential.setEntityCertificate(certificate);

		return credential;

	}

    @Override
    public JsonNode getIdpConfig(Credentials credentials, MultipartFile file, String portalId, String orsId,
                                 JsonNode ssoConfigNode) throws SAMLException, PortalConfigException, IOException {
        log.info("getIdpConfig method is running..");
        if (!(file.getOriginalFilename().contains(PortalServiceConstants.XML_EXT))) {
            log.error("metadata xml file not found orsId {}, portalId {}", orsId, portalId);
            throw new PortalConfigException(ErrorCodeContants.CONFIG1010,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1010),
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1012));
        }
        if (file.isEmpty()) {
            log.error("metadata xml file is empty orsId {}, portalId {}", orsId, portalId);
            throw new PortalConfigException(ErrorCodeContants.CONFIG1011,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1011),
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1011));
        }

        try {
            log.info("invoking updateIdpProperty method");
            ssoConfigNode = updateIdpProperty(file, ssoConfigNode);
        } catch (PortalConfigException e) {
            log.error("Save IdpConfig : Error on saving Saml Idpconfig for portalID {} with error message : {}",
                    portalId, e.getErrorMessage());
            throw new PortalConfigException(ErrorCodeContants.CONFIG1006,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1006), e.getErrorMessage());
        }

        return ssoConfigNode;
    }

    private JsonNode updateIdpProperty(MultipartFile file, JsonNode configJsonNode)
			throws SAMLException, PortalConfigException, IOException {
		log.info("updateIdpProperty method is running..");

		File convFile = new File(file.getOriginalFilename());
		FileOutputStream fos = null;
		try {
			fos = new FileOutputStream(convFile);
		} catch (FileNotFoundException e) {
			log.error("unable to convert FileOutputStream {}", e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1008,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1008), e.getMessage());
		}
		try {
			fos.write(file.getBytes());
			fos.close();
		} catch (IOException e) {
			log.error("unable to write file {}", e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1009,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1009), e.getMessage());
		}
		IdPConfig idpConfig = null;
		try {
			SAMLInit.initialize();
			idpConfig = new IdPConfig(convFile);
		} catch (SAMLException e) {
			log.error("SAML Exception unable to parse metadata xml with error messaage : {}", e.getErrorMessage());
			throw new PortalConfigException(e.getErrorCode(), errorCodeProperties.getProperty(e.getErrorCode()),
					errorCodeProperties.getProperty(e.getErrorMessage()));
		}

		String eId = StringUtils.isNotEmpty(idpConfig.getEntityId()) ? idpConfig.getEntityId()
				: PortalMetadataContants.EMPTY_STRING;
		String loginUrlRedirect = StringUtils.isNotEmpty(idpConfig.getLoginUrlRedirect())
				? idpConfig.getLoginUrlRedirect()
				: PortalMetadataContants.EMPTY_STRING;
		String loginUrlPost = StringUtils.isNotEmpty(idpConfig.getLoginUrlPost()) ? idpConfig.getLoginUrlPost()
				: PortalMetadataContants.EMPTY_STRING;
		String logoutUrlRedirect = StringUtils.isNotEmpty(idpConfig.getLogoutUrlRedirect())
				? idpConfig.getLogoutUrlRedirect()
				: PortalMetadataContants.EMPTY_STRING;
		String logoutUrlPost = StringUtils.isNotEmpty(idpConfig.getLogoutUrlPost())
				? idpConfig.getLogoutUrlPost()
				: PortalMetadataContants.EMPTY_STRING;
		String cert = StringUtils.isNotEmpty(idpConfig.getCertString()) ? idpConfig.getCertString()
				: PortalMetadataContants.EMPTY_STRING;

		JsonNode IdpNode = configJsonNode.get(PortalMetadataContants.IDENTITY_PROVIDER_METADATA_PROPERTIES);
		JsonNode configurationNode = IdpNode.get(PortalMetadataContants.CONFIGURATION);

		if (configurationNode.has(PortalMetadataContants.SSO_IDP_KEY_ENTITY_ID)) {
			((ObjectNode) configurationNode.get(PortalMetadataContants.SSO_IDP_KEY_ENTITY_ID))
					.put(PortalMetadataContants.VALUE_ATTRIBUTE, eId);
		}
		if (configurationNode.has(PortalMetadataContants.SINGLE_SIGNON_SERVICE_URL_REDIRECT)) {
			((ObjectNode) configurationNode.get(PortalMetadataContants.SINGLE_SIGNON_SERVICE_URL_REDIRECT))
					.put(PortalMetadataContants.VALUE_ATTRIBUTE, loginUrlRedirect);
		}
		if (configurationNode.has(PortalMetadataContants.SINGLE_SIGNON_SERVICE_URL_POST)) {
			((ObjectNode) configurationNode.get(PortalMetadataContants.SINGLE_SIGNON_SERVICE_URL_POST))
					.put(PortalMetadataContants.VALUE_ATTRIBUTE, loginUrlPost);
		}
		if (configurationNode.has(PortalMetadataContants.SINGLE_LOGOUT_SERVICE_URL_REDIRECT)) {
			((ObjectNode) configurationNode.get(PortalMetadataContants.SINGLE_LOGOUT_SERVICE_URL_REDIRECT))
					.put(PortalMetadataContants.VALUE_ATTRIBUTE, logoutUrlRedirect);
		}
		if (configurationNode.has(PortalMetadataContants.SINGLE_LOGOUT_SERVICE_URL_POST)) {
			((ObjectNode) configurationNode.get(PortalMetadataContants.SINGLE_LOGOUT_SERVICE_URL_POST))
					.put(PortalMetadataContants.VALUE_ATTRIBUTE, logoutUrlPost);
		}
		if (configurationNode.has(PortalMetadataContants.CERTIFICATE)) {
			((ObjectNode) configurationNode.get(PortalMetadataContants.CERTIFICATE))
					.put(PortalMetadataContants.VALUE_ATTRIBUTE, cert);
		}
		if (configurationNode.has(PortalMetadataContants.BINDING_TYPE)) {
			((ObjectNode) configurationNode.get(PortalMetadataContants.BINDING_TYPE))
					.put(PortalMetadataContants.VALUE_ATTRIBUTE, SAMLConfig.Binding.HTTP_REDIRECT.getBindingValue());
		}

		return configJsonNode;
	}

	@Override
	public String getSpMetadataXml(String portalId, String orsId)
			throws SAMLException, PortalConfigException, IOException {
		log.info("getSpMetadataXml method is running...");
		
		SAMLConfig samlConfig =getSAMLConfigurationForPortal(portalId, orsId);

		String spMetadataXmlString = constructSpMetadataXml(samlConfig);

		if (StringUtils.isBlank(spMetadataXmlString)) {
			log.error("unable to construct spMetadataXml because it is empty");
			throw new PortalConfigException(ErrorCodeContants.CONFIG1013,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1013), "");
		}

		return spMetadataXmlString;
	}

	
	private String constructSpMetadataXml(SAMLConfig samlConfig) throws SAMLException, PortalConfigException, IOException {
		log.info("constructSpMetadataXml method is running...");
		try {
			SAMLInit.initialize();
		} catch (SAMLException e) {
			log.error("SAML Exception unable to start bootstrap error messaage : {}", e.getLocalizedMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1016,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1016), e.getMessage());
		}
		log.info("Constructing SP metadata");
		String sPMetaDataString = null;
		try {
			// Constructing Entity Descriptor with ID received from the SamlRuntime json.
			EntityDescriptor entityDescriptor = buildSAMLObject(EntityDescriptor.class,
					EntityDescriptor.DEFAULT_ELEMENT_NAME);
			entityDescriptor.setEntityID(samlConfig.getSpEntityId());
			entityDescriptor.setCacheDuration((long) 604800);
			entityDescriptor.setValidUntil(new DateTime().plusMillis(172800000));
			SPSSODescriptor spssoDescriptor = buildSAMLObject(SPSSODescriptor.class,
					SPSSODescriptor.DEFAULT_ELEMENT_NAME);
			spssoDescriptor.setAuthnRequestsSigned(samlConfig.isSignAuthRequest());
			spssoDescriptor.setWantAssertionsSigned(samlConfig.isSignLogoutRequest());
			spssoDescriptor.addSupportedProtocol(SAMLConfigConstants.SAML_NAME_SPACE);
			NameIDFormat nameIDFormat = buildSAMLObject(NameIDFormat.class, NameIDFormat.DEFAULT_ELEMENT_NAME);
			nameIDFormat.setFormat(samlConfig.getNameIDFormat());
			spssoDescriptor.getNameIDFormats().add(nameIDFormat);
			AssertionConsumerService asc = buildSAMLObject(AssertionConsumerService.class,
					AssertionConsumerService.DEFAULT_ELEMENT_NAME);
			asc.setBinding(SAMLConstants.SAML2_POST_BINDING_URI);
			asc.setLocation(samlConfig.getAcsURL());
			asc.setIndex(0);
			spssoDescriptor.getAssertionConsumerServices().add(asc);
			SingleLogoutService snglogoutsrvc = buildSAMLObject(SingleLogoutService.class,
					SingleLogoutService.DEFAULT_ELEMENT_NAME);
			snglogoutsrvc.setBinding(SAMLConstants.SAML2_REDIRECT_BINDING_URI);
			snglogoutsrvc.setLocation(samlConfig.getSloSvcURL());
			spssoDescriptor.getSingleLogoutServices().add(snglogoutsrvc);
			entityDescriptor.getRoleDescriptors().add(spssoDescriptor);

			sPMetaDataString = writeEntityDescriptor(entityDescriptor);
		} catch (ParserConfigurationException e) {
			log.error("SAML Exception unable to parse entityDescriptor, error messaage : {}", e.getLocalizedMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1001,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1001), e.getMessage());
		} catch (MarshallingException e) {
			log.error("SAML Exception unable to MarshallingException, error messaage : {}", e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1014,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1014), e.getMessage());
		} catch (TransformerException e) {
			log.error("SAML Exception unable to transform nodeToString error messaage : {}", e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG1015,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1015), e.getMessage());
		}
		return sPMetaDataString;
	}

	@SuppressWarnings({ "unchecked" })
	public <T> T buildSAMLObject(final Class<T> objectClass, QName qName) {
        XMLObjectBuilderFactory builderFactory = Configuration.getBuilderFactory();
		return (T) builderFactory.getBuilder(qName).buildObject(qName);
	}

	private String writeEntityDescriptor(EntityDescriptor entityDescriptor)
			throws ParserConfigurationException, MarshallingException, TransformerException {
		Marshaller marshaller = Configuration.getMarshallerFactory().getMarshaller(entityDescriptor);
		Element element = marshaller.marshall(entityDescriptor);
		return XMLHelper.nodeToString(element);
	}

    @Override
    public SAMLConfig getSAMLConfigurationForPortal(String portalId, String orsId) throws PortalConfigException {
        JsonNode ssoConfigNode = portalService.getPortalSSOConfig(null, orsId, portalId);
        try {
            SAMLConfig samlConfig = new SAMLConfig();
            List<String> projections = new ArrayList<String>();
            projections.add(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);

            JsonNode spMetaDataConfig = ssoConfigNode.get(SAMLConfigConstants.SAML_SP_FILTER);
            if (null != spMetaDataConfig && !spMetaDataConfig.isEmpty(null)) {
                samlConfig.setSpEntityId(getConfiguarationValue(spMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_ENTITY_ID).asText());
                samlConfig.setAcsURL(getConfiguarationValue(spMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_ACS_URL).asText());
                samlConfig.setSignAuthRequest(getConfiguarationValue(spMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_SIGN_AUTH).asBoolean());
                samlConfig.setSignLogoutRequest(getConfiguarationValue(spMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_SIGN_LOGOUT).asBoolean());
            }

            JsonNode idpMetaDataConfig = ssoConfigNode.get(SAMLConfigConstants.SAML_IDP_FILTER);
            if (null != idpMetaDataConfig && !idpMetaDataConfig.isEmpty(null)) {
                samlConfig.setIdpEntityId(getConfiguarationValue(idpMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_ENTITY_ID).asText());
                samlConfig.setSigningCertificate(getConfiguarationValue(idpMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_CERTIFICATE).asText());
                String ssoServiceBinding = getConfiguarationValue(idpMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_BINDING_TYEP).asText();
                samlConfig.setSsoSvcBinding(ssoServiceBinding);
                if (SAMLConstants.SAML2_POST_BINDING_URI.equals(ssoServiceBinding)) {
                    samlConfig.setSsoSvcURL(getConfiguarationValue(idpMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_SSO_URL_POST).asText());
                }
                if (SAMLConstants.SAML2_REDIRECT_BINDING_URI.equals(ssoServiceBinding)) {
                    samlConfig.setSsoSvcURL(getConfiguarationValue(idpMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_SSO_URL_REDIRECT).asText());
                }
                String sloServiceBinding = getConfiguarationValue(idpMetaDataConfig,
						SAMLConfigConstants.SAML_CONFIG_BINDING_TYEP).asText();
				samlConfig.setSloSvcBinding(sloServiceBinding);
				if (SAMLConstants.SAML2_POST_BINDING_URI.equals(sloServiceBinding)) {
					samlConfig.setSloSvcURL(getConfiguarationValue(idpMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_SLO_URL_POST).asText());
				}
				if (SAMLConstants.SAML2_REDIRECT_BINDING_URI.equals(sloServiceBinding)) {
					samlConfig.setSloSvcURL(getConfiguarationValue(idpMetaDataConfig, SAMLConfigConstants.SAML_CONFIG_SLO_URL_REDIRECT).asText());
				}
            }

            JsonNode generalInfo = ssoConfigNode.get(SAMLConfigConstants.SAML_GENERAL_INFO_FILTER);
            if (null != generalInfo && !generalInfo.isEmpty(null)) {
                samlConfig.setNameIDField(getConfiguarationValue(generalInfo, SAMLConfigConstants.SAML_CONFIG_USER_NAME_MAPPING).asText());
				samlConfig.setNameIDFormat(getConfiguarationValue(generalInfo, SAMLConfigConstants.SAML_CONFIG_NAME_ID_POLICY).asText());
				samlConfig.setSamlRedirectURL(getConfiguarationValue(generalInfo, SAMLConfigConstants.SAML_CONFIG_SAML_REDIRECT_URL).asText());
            }

            return samlConfig;
        }
        catch (Exception e) {
            log.error("Error during parsing SAML configuration to SAML Config" + e.getMessage());
            throw new PortalConfigServiceException(ErrorCodeContants.CONFIG1000,
                    errorCodeProperties.getProperty(ErrorCodeContants.CONFIG1000), e.getMessage());
        }
    }

    private JsonNode getConfiguarationValue(JsonNode jsonNode , String key) {
        JsonNode configNode = jsonNode.get(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
        JsonNode keyNode = configNode.get(key);
        JsonNode value = keyNode.get(PortalServiceConstants.RUNTIME_CONFIG_VALUE);
        return value;
    }

}
