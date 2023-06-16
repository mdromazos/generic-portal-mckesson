package com.informatica.mdm.portal.metadata.service.impl;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.axis.client.Call;
import org.apache.axis.client.Service;
import org.apache.axis.message.SOAPBodyElement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;

import com.delos.util.StringUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.informatica.mdm.portal.metadata.exception.DataAccessException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.model.EmailProperties;
import com.informatica.mdm.portal.metadata.model.EmailProperty;
import com.informatica.mdm.portal.metadata.model.InitiateEmail;
import com.informatica.mdm.portal.metadata.model.InitiateEmailResponse;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.siperian.sif.client.SiperianClient;
import com.siperian.sif.message.SiperianObjectType;
import com.siperian.sif.message.metadata.MetaDataPrimaryWorkflowEngine;
import com.siperian.sif.message.mrm.DescribeSiperianObjectRequest;
import com.siperian.sif.message.mrm.DescribeSiperianObjectResponse;

@org.springframework.stereotype.Service
public class EmailNotificationService 
{
	@Autowired
	@Qualifier(value = "errorCodeProperties")
	private Properties errorCodeProperties;

	@Autowired
    SiperianClient siperianClient;
	
	@Autowired
	private PortalPersistenceService portalPersistenceService;
	
	@Autowired
	private PortalUIService portalUIService;
	
	private final static Logger log = LoggerFactory.getLogger(EmailNotificationService.class);
	
	Map<String,String> defaultEmailTemplates = new HashMap<>();
	
	{
		defaultEmailTemplates.put(PortalMetadataContants.CONFIG_TEMPLATE_LOGIN_SEC_RESET, PortalMetadataContants.RESET_PWD_TEMPLATE);
		defaultEmailTemplates.put(PortalMetadataContants.CONFIG_TEMPLATE_LOGIN_SEC_RESET_SUCCESS, PortalMetadataContants.RESET_PWD_SUCCESS_TEMPLATE);
		defaultEmailTemplates.put(PortalMetadataContants.CONFIG_TEMPLATE_USER_MGMT_SEC_INVITE, PortalMetadataContants.INVITE_USER_TEMPLATE);
		defaultEmailTemplates.put(PortalMetadataContants.CONFIG_TEMPLATE_USER_MGMT_SEC_RESET_SUCCESS, PortalMetadataContants.INVITE_USER_SUCCESS_TEMPLATE);
	}
	
	public InitiateEmailResponse sendEmail(String orsId, String portalId, String sectionOprType,Map<String,String> emailProperty,String userEmail)
			throws Exception {
		
		log.info("inside initiate email");
		String templateName = null;
		try {
			
			String trustedUser = portalUIService.getTrustedAppUser(portalId, orsId);
			log.info("Send Email Trusted user name is {}", trustedUser);
			MetaDataPrimaryWorkflowEngine metaData = getBPMMetaData(orsId, trustedUser);
			templateName = getTemplates(orsId, portalId, sectionOprType);
			InitiateEmail in = createEmailTemplate(templateName, userEmail, emailProperty);
			String protocol = "http";
			if(null != metaData.getProtocol())
				protocol = metaData.getProtocol();
			String avosEmailServiceUrl = protocol + "://"
					+ metaData.getHost() + ":"
					+ metaData.getPort() + "/active-bpel/services/avosEmailNotification";

			log.info("url is " + avosEmailServiceUrl);
			
			InitiateEmailResponse processResponse;
			Service service = new Service();
			Call processCall;
			processCall = (Call) service.createCall();
			processCall.setTargetEndpointAddress(new URL(avosEmailServiceUrl));
			processCall.setTimeout(360 * 1000);
			processCall.setProperty(Call.USERNAME_PROPERTY, metaData.getUsername());
			processCall.setProperty(Call.PASSWORD_PROPERTY, metaData.getPassword());
		
			JAXBContext context = JAXBContext.newInstance(InitiateEmail.class);
			ByteArrayOutputStream sos = new ByteArrayOutputStream();
			Marshaller m = context.createMarshaller();
			m.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
			m.marshal(in, sos);
			String xml = sos.toString();
			DocumentBuilderFactory factory = DocumentBuilderFactory
					.newInstance();
			DocumentBuilder builder;
			Document requestDoc = null;

			builder = factory.newDocumentBuilder();
			requestDoc = builder.parse(new InputSource(
					new ByteArrayInputStream(xml.getBytes())));

			SOAPBodyElement body = new SOAPBodyElement(
					requestDoc.getDocumentElement());
			body.setNamespaceURI("http://www.informatica.com/solutions/avosEmailService");
			processCall.setOperation("sendEmail");
			
			//processCall.setOperationName("avos:sendEmail");
			
			List soapResponse = (List) processCall
					.invoke(new Object[] { body });

			if (soapResponse == null || soapResponse.isEmpty()) {
				throw new DataAccessException(null,null,
						"No response received from Active VOS web service");
			} else {
				JAXBContext contextUnmarshal = JAXBContext
						.newInstance(InitiateEmailResponse.class);
				Unmarshaller unm = contextUnmarshal.createUnmarshaller();

				SOAPBodyElement soapBodyElem = (SOAPBodyElement) soapResponse
						.get(0);
				Element bodyElem = soapBodyElem.getAsDOM();
				processResponse = (InitiateEmailResponse) unm
						.unmarshal(bodyElem);

				log.info("success, response "+processResponse.getStatus());
				return processResponse;

			}
		} catch (Exception e) {
			log.error("Unable to send email with {} email template, please check if temaplate name is correct",templateName);
			log.error(e.getLocalizedMessage());
			throw new DataAccessException(ErrorCodeContants.CONFIG912,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG912), e.getLocalizedMessage());
		}

	}
	
	private InitiateEmail createEmailTemplate(String templateName, String userEmail, Map<String,String> emailProperty)
	{
		InitiateEmail email = new InitiateEmail();
		EmailProperties emailProperties = new EmailProperties();
		List<EmailProperty> propertyList = new ArrayList<>();	
		if(null != emailProperty && emailProperty.size() > 0)
		{
			for(String key : emailProperty.keySet())
			{
				String propValue = emailProperty.get(key);
				EmailProperty prop = new EmailProperty();
				prop.setName(key);
				prop.setPropertyValue(propValue);
				propertyList.add(prop);
			}
		}
		if(propertyList.size() > 0)
		{
			//set properties
			emailProperties.setProperties(propertyList);
			email.setEmailProperties(emailProperties);
		}
		
		//set email
		email.setToEmail(userEmail);
		email.setEmailTemplate(templateName);
				
		return email;
	}
	
	private MetaDataPrimaryWorkflowEngine getBPMMetaData(String orsId, String trustedUser) throws PortalConfigException
    {
    	MetaDataPrimaryWorkflowEngine metaData = null;
    	try
    	{
    		DescribeSiperianObjectRequest request = new DescribeSiperianObjectRequest();
    		request.getUids().add(
                    SiperianObjectType.WORKFLOW_ENGINE.makeUid(PortalServiceConstants.CURRENT_UID));//CURRENT_UID
	        String securityPayload = PortalConfigUtil.getSecurityPayload(PortalServiceConstants.TRUSTED_APP + "/" + trustedUser, orsId, "DescribeSiperianObject");
            request.setOrsId(orsId);
            request.setUsername(PortalServiceConstants.TRUSTED_APP + "/" + trustedUser);
	        request.setSecurityPayload(securityPayload.getBytes());
	        DescribeSiperianObjectResponse response = (DescribeSiperianObjectResponse) siperianClient
	                    .process(request);
	        metaData = (MetaDataPrimaryWorkflowEngine) response.getMetaDataObjectList().get(0);

    	}
    	catch(Exception e)
    	{
    		log.error(e.getMessage());
    		throw new PortalConfigException(ErrorCodeContants.CONFIG906,
    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG906), e.getMessage());
    		
    	}
    	return metaData;
    }
	
	private String getTemplates(String orsId,String portalId,String SectonOprType) throws PortalConfigException
	{
		String templateName= null;
		try {
			if(StringUtil.isEmpty(portalId)) {
				if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD)
				{
					templateName = defaultEmailTemplates.get(PortalMetadataContants.CONFIG_TEMPLATE_LOGIN_SEC_RESET);
				}
				else if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD_SUCCESS)
				{
					templateName = defaultEmailTemplates.get(PortalMetadataContants.CONFIG_TEMPLATE_LOGIN_SEC_RESET_SUCCESS);
				}
				else if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_USER_MGMT_INVITATION)
				{
					templateName = defaultEmailTemplates.get(PortalMetadataContants.CONFIG_TEMPLATE_USER_MGMT_SEC_INVITE);
				}
				else if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_USER_MGMT_RESET_PASSWORD_SUCCESS)
				{
					templateName = defaultEmailTemplates.get(PortalMetadataContants.CONFIG_TEMPLATE_USER_MGMT_SEC_RESET_SUCCESS);
				}
			}else {
				JsonNode portalConfigNode = portalPersistenceService.getPublishedPortalConfig(null, portalId, orsId);
				if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD)
				{
					JsonNode loginSec = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.LOGIN_ATTRIBUTE);
					templateName = loginSec.get(PortalMetadataContants.CONFIG_TEMPLATE_LOGIN_SEC_RESET).asText();
				}
				else if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD_SUCCESS)
				{
					JsonNode loginSec = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.LOGIN_ATTRIBUTE);
					templateName = loginSec.get(PortalMetadataContants.CONFIG_TEMPLATE_LOGIN_SEC_RESET_SUCCESS).asText();
				}
				else if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_USER_MGMT_INVITATION)
				{
					JsonNode userMgmtSec = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.USER_MANAGEMENT_ATTRIBUTE);
					templateName = userMgmtSec.get(PortalMetadataContants.CONFIG_TEMPLATE_USER_MGMT_SEC_INVITE).asText();
				}
				else if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_USER_MGMT_RESET_PASSWORD_SUCCESS)
				{
					JsonNode userMgmtSec = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.USER_MANAGEMENT_ATTRIBUTE);
					templateName = userMgmtSec.get(PortalMetadataContants.CONFIG_TEMPLATE_USER_MGMT_SEC_RESET_SUCCESS).asText();
				}
				else if(SectonOprType == PortalMetadataContants.EMAIL_TEMPLATE_SIGNUP_REGISTRATION)
				{
					JsonNode signupSec = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.SIGNUP_ATTRIBUTE);
					templateName = signupSec.get(PortalMetadataContants.CONFIG_TEMPLATE_SIGN_UP_REGISTRATION).asText();
				}
			}
		}
		catch(Exception e)
		{
    		log.error("Error during retieving template name from portal config "+e.getMessage());
    		throw new PortalConfigException(ErrorCodeContants.CONFIG911,
    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG911), e.getMessage());
    		
    	}
		return templateName;
	}
}
