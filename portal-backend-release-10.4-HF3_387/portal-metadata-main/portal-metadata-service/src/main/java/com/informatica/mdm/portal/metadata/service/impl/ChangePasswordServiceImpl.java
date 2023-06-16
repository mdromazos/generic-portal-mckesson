package com.informatica.mdm.portal.metadata.service.impl;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import com.informatica.mdm.portal.metadata.exception.DataAccessException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.web.client.RestTemplate;

import com.delos.util.StringUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.cs.server.rest.Credentials;
import com.informatica.mdm.portal.metadata.config.MultiDataSource;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.PortalConfigServiceException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;
import com.informatica.mdm.portal.metadata.model.DataSourceModel;
import com.informatica.mdm.portal.metadata.model.InitiateEmailResponse;
import com.informatica.mdm.portal.metadata.model.PortalRestConfig;
import com.informatica.mdm.portal.metadata.repository.PortalRepo;
import com.informatica.mdm.portal.metadata.service.ChangePasswordService;
import com.informatica.mdm.portal.metadata.service.PortalPersistenceService;
import com.informatica.mdm.portal.metadata.service.PortalUIService;
import com.informatica.mdm.portal.metadata.util.DatabaseConstants;
import com.informatica.mdm.portal.metadata.util.ErrorCodeContants;
import com.informatica.mdm.portal.metadata.util.ExternalConfigConstants;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalMetadataContants;
import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;
import com.informatica.mdm.portal.metadata.util.QueryComponent;
import com.informatica.mdm.portal.metadata.util.QueryWrapper;
import com.siperian.sif.client.SiperianClient;


@Service
public class ChangePasswordServiceImpl implements ChangePasswordService
{

   private final static Logger log = LoggerFactory.getLogger(ChangePasswordServiceImpl.class);
   
   @Autowired
   @Qualifier(value = "errorCodeProperties")
   private Properties errorCodeProperties;

   @Autowired
   SiperianClient siperianClient;
   
   @Value("${cookie-secure:false}")
   private String httpsPropertyKey;
   
   @Autowired
   private EmailNotificationService emailNotificationService;
   
   @Autowired
   private MultiDataSource multiDataSource;
	
   @Autowired
   private PortalRepo portalRepo;
   
   @Autowired
   private PortalUIService portalUIService;
   
   @Autowired
   RestTemplate restTemplate;
   
   @Autowired
   private PortalPersistenceService portalPersistenceService;
   
   @Autowired
   ObjectMapper mapper;
   
   private String portalCmxUrl;
   
   @Value("${portal.cmx.url}")
   public void setCmxUrl(String url) {
		portalCmxUrl=url;
		if(null!=portalCmxUrl && !portalCmxUrl.isEmpty() && portalCmxUrl.endsWith("/")) {
			portalCmxUrl=portalCmxUrl.substring(0, portalCmxUrl.length()-1);
		}
	}
   
   @Override
    public Map<String,Object> changePassword(Credentials credentials, String mdmSessionId, String orsId, String portalId, String changePassJson, HttpServletRequest request,String ict) throws Exception
    {
	   ResponseEntity<String> response = null;
       Map<String, Object> resp = new HashMap<>();
       HttpHeaders headers = new HttpHeaders();
       Boolean changePwdNewUser = false;
       String username = null;
       Boolean isResetPass = false;
	   try 
	   {
	        String url = String.format(PortalServiceConstants.CHANGE_PASSWORD_URL, portalCmxUrl,orsId);
	        
	        JSONObject obj = new JSONObject(changePassJson);
	        String oldPass = null;
	        if(obj.has(PortalServiceConstants.CHANGEPASSWORD_OLD) && obj.get(PortalServiceConstants.CHANGEPASSWORD_OLD) != null)
	        	oldPass = obj.get(PortalServiceConstants.CHANGEPASSWORD_OLD).toString();
	        
	        
	        String newPass = obj.get(PortalServiceConstants.CHANGEPASSWORD_NEW).toString();
	        boolean verificationSuccess = true;
	        List<Map<String, Object>> pwdRecs = null;
	        if(oldPass != null && !oldPass.isEmpty()) // then change password , pass mdmsessionid
	        {
	        	String authCookie = ExternalConfigConstants.AUTH_MDM_ATTRIBUTE + "=" + mdmSessionId;
	    		headers.add(PortalServiceConstants.MDM_CSRF_TOKEN_HEADER, ict);
	        	headers.add(ExternalConfigConstants.AUTH_COOKIE, authCookie);
	        }
	        else // its forgot pass , add header X-MDM-AUTH-PAYLOAD
	        {
	        	isResetPass = true;
	        	String emailHashValue = obj.get(PortalServiceConstants.CHANGEPASSWORD_LINKHASHVALUE).toString();
	        	// check if new user
		        if(obj.has(PortalServiceConstants.CHANGEPASSWORD_ISNEWUSER) && obj.get(PortalServiceConstants.CHANGEPASSWORD_ISNEWUSER) != null)
		        	changePwdNewUser = Boolean.parseBoolean(obj.get(PortalServiceConstants.CHANGEPASSWORD_ISNEWUSER).toString());
	        	
	        	pwdRecs = getForgotPasswordLinkRecord(orsId, DatabaseConstants.COLUMN_HASH_VALUE,emailHashValue);
	        	if(pwdRecs != null && pwdRecs.size() > 0)
	        	{
	        		Map<String, Object> pwdRec = pwdRecs.get(0);
	        		username  = (String) pwdRec.get(DatabaseConstants.COLUMN_USER_ID);
	        	}
	        	else
	        	{
	        		throw new PortalConfigException(ErrorCodeContants.CONFIG904,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG904), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG904));
	        	}
	        	String securityPayload = PortalConfigUtil.getSecurityPayloadForRest(
						PortalServiceConstants.TRUSTED_APP + "/" + username, null, "changePasswordUsingPOST");
				headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD,securityPayload);
				
				if(!StringUtil.isEmpty(portalId)){
					long timeSinceCreation = getElapsedTime(pwdRecs.get(0));
					Long allowedTime = getTimeInMilliseconds(getPwdResetLinkExpiryTimeFromRuntimeConfig(portalId, orsId));
					if(timeSinceCreation > allowedTime) {
	        		verificationSuccess = false;
					}
				}
				// change the changepass json
        		obj = new JSONObject();
        		obj.put(PortalServiceConstants.CHANGEPASSWORD_NEW, newPass);
        		changePassJson = obj.toString();
			}
	        if(verificationSuccess)
	        {
	        	headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
	            response = PortalConfigUtil.executeRest(url, HttpMethod.POST, changePassJson, headers, restTemplate);
	              
	        }
	        else
	        {
	        	throw new ResourceNotFoundException(ErrorCodeContants.CONFIG905,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG905), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG905));
	        }
	        
            if(response.getStatusCode() != HttpStatus.OK) 
            {
            	throw new ResourceNotFoundException(ErrorCodeContants.CONFIG901,
						errorCodeProperties.getProperty(ErrorCodeContants.CONFIG901), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG901));
			
	        }
            else
            {
          	   resp.put("Status", "Password changed successfully");
          	   InitiateEmailResponse emailResp = null;
          	   Boolean useEmailAsUsername = false;
          	   String userEmail = null;
          	   //send email for change password success
          	   if(isResetPass)
          	   {
          		   if(!StringUtil.isEmpty(portalId)) {
	          		   JsonNode portalConfigNode = getPublishedPortal(portalId, orsId);
	          		   JsonNode userMgmtSec = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.USER_MANAGEMENT_ATTRIBUTE);
	          		   useEmailAsUsername = Boolean.parseBoolean(userMgmtSec.get(PortalMetadataContants.CONFIG_USER_MGMT_USE_EMAIL_AS_UNAME).asText());
	          		   if(useEmailAsUsername)
	          			   userEmail = username;
	          		   else
	          			   userEmail = searchBEForUserAndEmail(request, portalConfigNode, orsId, username, false, portalId);
	          	   }else {
	          		   
	          		   userEmail = (String) pwdRecs.get(0).get(DatabaseConstants.COLUMN_EMAIL_ID);
	          	   }
          		   
          		   Map<String, String> emailProperties = new HashMap<String, String>();
          		   emailProperties.put(PortalServiceConstants.EMAIL_LOGIN_NAME, username);
          		   if(changePwdNewUser)
          			   emailResp = emailNotificationService.sendEmail(orsId, portalId, PortalMetadataContants.EMAIL_TEMPLATE_USER_MGMT_RESET_PASSWORD_SUCCESS, emailProperties, userEmail);
          		   else
          			 emailResp = emailNotificationService.sendEmail(orsId, portalId, PortalMetadataContants.EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD_SUCCESS, emailProperties, userEmail);
          		   
          		   log.info("Email sent out to " + userEmail);
          		   resp.put("Email Status", emailResp.getStatus());
          	   }
          	   
            }
	            
       }
	   catch (PortalConfigException e) {
			log.error(e.getMessage());
			throw e;
	    }
	    catch (Exception e) {
			log.error(e.getMessage());
			throw new PortalConfigException(ErrorCodeContants.CONFIG902,
				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG902), e.getMessage());
		}
	   
	   return resp ;
    }

   private long getTimeInMilliseconds(String timeString) {
		String[] time = timeString.split(":");
		long hour = Long.valueOf(time[0].trim());
		long minutes = Long.valueOf(time[1].trim());
		long seconds = Long.valueOf(time[2].trim());
		return ((hour*60*60*1000)+(minutes  * 60 * 1000) + (seconds  * 1000));
	}
    
   private long getElapsedTime(Map<String, Object> pwdRec) throws PortalConfigException
   {
	   
   	long elapsedTime = 0;
	String linkCreatedTimeStr  = (String) pwdRec.get(DatabaseConstants.COLUMN_MILLISEC);
	if(null != linkCreatedTimeStr && !linkCreatedTimeStr.isEmpty())
	{
		long linkCreatedTime = Long.parseLong(linkCreatedTimeStr);
		long currentMillis = Calendar.getInstance().getTimeInMillis();
		elapsedTime =  currentMillis - linkCreatedTime;
	}
	return elapsedTime;
    }
    
    
	@Override
	public Map<String,Object> generateForgotPasswordLink(String orsId,String portalId,String resetPassJson,HttpServletRequest request) throws Exception
    {
    	
		InitiateEmailResponse emailResp = null;
		String username = null;
		String userEmail = null;
		Map<String,Object> resp = new HashMap<>();
		String sectionName = null;
		Boolean isNewUser = false;
		Boolean sendEmail = true;
		try {
			JSONObject obj = new JSONObject(resetPassJson);
	        if(obj.has(PortalServiceConstants.CHANGEPASSWORD_ISNEWUSER))
	        	isNewUser = Boolean.parseBoolean(obj.get(PortalServiceConstants.CHANGEPASSWORD_ISNEWUSER).toString());
	        
			String resetpassLink;
			if(isNewUser)
			{
				username = obj.get(PortalServiceConstants.RESETPASSWORD_USERNAME).toString();
				userEmail = obj.get(PortalServiceConstants.CHANGEPASSWORD_EMAIL).toString();
				if (obj.has(PortalServiceConstants.ADD_USER_SEND_EMAIL)) {
					sendEmail = (Boolean) obj.get(PortalServiceConstants.ADD_USER_SEND_EMAIL);
				}
				log.info("userEmail returned for new user" + userEmail);
				resetpassLink = PortalServiceConstants.RESETPASSWORD_URL_NEWUSER;
				sectionName = PortalMetadataContants.EMAIL_TEMPLATE_USER_MGMT_INVITATION;
			}
			else // forgot pas when email is available
			{
				JsonNode portalConfigNode = getPublishedPortal( portalId, orsId);
				userEmail = obj.get(PortalServiceConstants.CHANGEPASSWORD_EMAIL).toString();	
				username = searchBEForUserAndEmail(request, portalConfigNode, orsId, userEmail, true, portalId);
				log.info("username returned for forgot password " + username);
				ArrayNode users = portalPersistenceService.getHubUser(username);
				if(users == null){
					throw new PortalConfigException(ErrorCodeContants.CONFIG909,
		    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG909), "User not found");
					
				}
				resetpassLink = PortalServiceConstants.RESETPASSWORD_URL;
				sectionName = PortalMetadataContants.EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD;
			}
			
			String emailLinkHash  = createPasswordLinkExpiryTableAndData(orsId,username,userEmail);
			String baseUrl = "";
			if(obj.has(PortalServiceConstants.FORGOT_PASSWORD_URL) && obj.get(PortalServiceConstants.FORGOT_PASSWORD_URL)!=null) {
				baseUrl = obj.getString(PortalServiceConstants.FORGOT_PASSWORD_URL);
				if(baseUrl.endsWith("/"))
					baseUrl=baseUrl.substring(0,baseUrl.length()-1);
			}else {
				String protocol = request.getScheme();
				if(null != httpsPropertyKey && httpsPropertyKey.equals("true")) {
					protocol = "https";
				}
				String serverName = request.getServerName();    
				int serverPort = request.getServerPort();   
				baseUrl = protocol+"://"+serverName+":"+serverPort;
			}
			String link = baseUrl + "/portal-ui/"+portalId+"/"+orsId+"/"+resetpassLink+"?hash=" + emailLinkHash;;
			Map<String,String> emailprop = new HashMap<>();
			emailprop.put("passwordLink", link);
			
			emailprop.put(PortalServiceConstants.EMAIL_LOGIN_NAME, username);
			if (sendEmail) {
				emailResp = emailNotificationService.sendEmail(orsId, portalId, sectionName, emailprop, userEmail);
				resp.put("Status", emailResp.getStatus());
				log.info("Email sent out to " + userEmail);
			}
						
			resp.put("passwordLink", link);
			
		}
		catch (DataAccessException e) {
			log.error("Exception occurred in sending email \n" +e.getMessage() );
		}
		catch (Exception e) {
			if(isNewUser)
			{
				log.error(e.getMessage());
				throw new PortalConfigException(ErrorCodeContants.CONFIG917,
	    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG917), e.getMessage());
				
			} else {
				log.error(e.getMessage());
				throw new PortalConfigException(ErrorCodeContants.CONFIG909,
	    				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG909), e.getMessage());
			}
		}
    	return resp;
    }


	private String createInvitationLinkHash(String userEmailId, String milliTime) {
	    byte[] secretBytes = (userEmailId + milliTime).getBytes();
	    return DigestUtils.md5DigestAsHex( secretBytes );
	}

	synchronized private String createPasswordLinkExpiryTableAndData(String orsId,String username,String userEmail) throws PortalConfigException
	{
		
		long milliTime = Calendar.getInstance().getTimeInMillis();
		String emailLinkHash = createInvitationLinkHash(username, Long.toString(milliTime));
		Boolean isInsert = false;
		JdbcTemplate jdbcTemplate = null;
		try {
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, null);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			
			if (!portalRepo.isTableExist(DatabaseConstants.TABLE_FORGOT_PASSWORD_LINK_EXPIRY)) 
			{
				portalRepo.createPortalEntity(DatabaseConstants.TABLE_FORGOT_PASSWORD_LINK_EXPIRY);
				isInsert = true;
				
			}
			
			// insert into table
			List<QueryComponent> fieldMapping = new ArrayList<QueryComponent>();
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_USER_ID,
					username));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_HASH_VALUE,
					emailLinkHash));
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_EMAIL_ID,
					userEmail));
			long createdTime = Calendar.getInstance().getTimeInMillis();
			
			fieldMapping.add(new QueryComponent(DatabaseConstants.COLUMN_MILLISEC,
					Long.toString(createdTime)));
			
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_FORGOT_PASSWORD_LINK_EXPIRY);
			queryWrapper.setSetClause(fieldMapping);
			
			if(!isInsert)
			{
				// check here
				if(!checkIfForgotPwdEntryExists(orsId, username))
					isInsert = true;
			}
			if(isInsert) {
				queryWrapper.setQueryType(DatabaseConstants.INSERT_QUERY_TYPE);
				portalRepo.save(queryWrapper);
				log.info("Forgot passwod entry created");
			}
			else {
				queryWrapper.setQueryType(DatabaseConstants.UPDATE_QUERY_TYPE);
				portalRepo.update(queryWrapper);
				log.info("Forgot passwod entry updated");
			}
				
		}		
		catch (PortalConfigException e) {
			log.error("Error on creating table to store forgot password link for database id {}",
					  orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on creating table or inserting row into forgot password link for database id {}",
					orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG901,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG901), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return emailLinkHash;
			
	}
	
	private Boolean checkIfForgotPwdEntryExists(String orsId, String username) throws PortalConfigException
	{
		Boolean entryExists = false;
		List<Map<String, Object>> rows = getForgotPasswordLinkRecord(orsId, DatabaseConstants.COLUMN_USER_ID,username);
		if(rows != null && rows.size() > 0)
			entryExists = true;
		return entryExists;
	}
	
	private List<Map<String, Object>> getForgotPasswordLinkRecord(String orsId, String fieldName,String fieldValue) throws PortalConfigException 
	{
		
		List<Map<String, Object>> pwdRows;
		JdbcTemplate jdbcTemplate = null;
		try {
			DataSourceModel dataSourceModel = new DataSourceModel(orsId, null);
			jdbcTemplate = multiDataSource.getCurrentJdbcTemplate(dataSourceModel);
			portalRepo.setJdbcTemplate(jdbcTemplate);
			
			QueryComponent userNameFilter = new QueryComponent(fieldName, fieldValue);
			List<QueryComponent> filter = new ArrayList<QueryComponent>();
			filter.add(userNameFilter);
			
			List<String> projections = new ArrayList<String>();
			projections.add(DatabaseConstants.COLUMN_USER_ID);
			projections.add(DatabaseConstants.COLUMN_HASH_VALUE);
			projections.add(DatabaseConstants.COLUMN_MILLISEC);
			projections.add(DatabaseConstants.COLUMN_EMAIL_ID);
			
			QueryWrapper queryWrapper = new QueryWrapper();
			queryWrapper.setTableName(DatabaseConstants.TABLE_FORGOT_PASSWORD_LINK_EXPIRY);
			queryWrapper.setProjections(projections);
			queryWrapper.setFilter(filter);
			
			pwdRows = portalRepo.getPortalDetails(queryWrapper);
			
			
		}		
		catch (PortalConfigException e) {
			log.error("Error on retrieving information for database id {}",
					 orsId);
			throw e;
		} catch (Exception e) {
			log.error("Error on retrieving information for database id {}",
					orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG901,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG901), e.getMessage());
		}
		finally {
			try {
				if(null != jdbcTemplate)
					jdbcTemplate.getDataSource().getConnection().close();
			} catch (SQLException throwables) {
				log.error("Error while closing jdbc connection");
			}
		}
		return pwdRows;
	}
    
	private String getPwdResetLinkExpiryTimeFromRuntimeConfig(String portalId,String orsId) throws Exception 
    {
    	String pwdExpiryTime = null;
    	List<String> projections = new ArrayList<String>();

    	projections.add(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
		String filter = "{\"name\":\"Password Section\"}";
		PortalRestConfig restConfig = PortalRestConfig.generatePortalRestConfig(orsId, filter,projections);
		JsonNode runtimeConfig = portalUIService.getRuntimeConfig(null, portalId, restConfig);
		JsonNode configItem = runtimeConfig.get(0);
		JsonNode passConfigItem = configItem.get(PortalServiceConstants.RUNTIME_CONFIG_CONFIGURATION);
		Iterator<JsonNode> itr = passConfigItem.iterator();
		while(itr.hasNext())
		{
			JsonNode sections = itr.next();
			String key = sections.get(PortalServiceConstants.RUNTIME_CONFIG_KEY).asText();
			if(key.equals(PortalServiceConstants.RUNTIME_CONFIG_PASSWORD_EXPIRY))
			{
				pwdExpiryTime = sections.get(PortalServiceConstants.RUNTIME_CONFIG_VALUE).asText();
				break;
			}
		}

    	return pwdExpiryTime;
    	
    }
	 
	
	private JsonNode getPublishedPortal(String portalId, String orsId) throws PortalConfigServiceException
	{
		JsonNode portalConfigNode = null;
	
		try
		{
			portalConfigNode = portalPersistenceService.getPublishedPortalConfig(null, portalId, orsId);
			if (null != portalConfigNode) 
			{
				return portalConfigNode;
			}
			else
			{
				throw new PortalConfigException(ErrorCodeContants.CONFIG604, errorCodeProperties.getProperty(ErrorCodeContants.CONFIG604), "");
			}
		}
		catch (Exception e) 
		{
			log.error("Error during search BE call {} ", portalId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG910,
				errorCodeProperties.getProperty(ErrorCodeContants.CONFIG910), e.getMessage());
		}
		
	}
	
	
	public String searchBEForUserAndEmail(HttpServletRequest request, JsonNode portalConfigNode,
			String orsId, String beFieldValue, Boolean isKeyEmail, String portalId) throws PortalConfigException
	{
		ResponseEntity<String> response = null;
		String retValue = null;
		String beView=null;
		String emailMapping = null;
		String userMapping = null;
		String beFieldKey = null;
		
		try {
		
			if (null != portalConfigNode) 
			{
				beView = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.PORTAL_BE_NAME).asText();
				JsonNode loginSec = portalConfigNode.get(PortalMetadataContants.GENERAL_SETTINGS).get(PortalMetadataContants.LOGIN_ATTRIBUTE);
				JsonNode loginFieldMapSec = loginSec.get(PortalMetadataContants.FIELDMAPPING_ATTRIBUTE);
				
				emailMapping = loginFieldMapSec.get(PortalMetadataContants.AUTHENTICATION_EMAIL).get(PortalMetadataContants.CODE_ATTRIBUTE).asText();
				userMapping = loginFieldMapSec.get(PortalMetadataContants.FIELD_MAPPING_USER_NAME).get(PortalMetadataContants.CODE_ATTRIBUTE).asText();
				beFieldKey = (isKeyEmail) ? emailMapping : userMapping;
				//search BE with this 
				List<String> childrenPath = new ArrayList<>();
				childrenPath.add(emailMapping);
				childrenPath.add(userMapping);
				String children = childrenParamBuilder(childrenPath);
				String trustedUser = portalUIService.getTrustedAppUser(portalId, orsId);
				log.info("Send Email Search BE Trusted user name is {}", trustedUser);
				String url = String.format(PortalServiceConstants.SEARCH_BE_URL, portalCmxUrl,orsId,beView,beFieldKey,beFieldValue,children);
				String searchBEPayload = PortalConfigUtil.getSecurityPayloadForRest(PortalServiceConstants.TRUSTED_APP+ "/" + trustedUser, orsId, "querySearchUsingGET");
				HttpHeaders headers = new HttpHeaders();
				headers.add(PortalServiceConstants.AUTH_SECURITY_PAYLOAD,searchBEPayload);
				headers.add(PortalServiceConstants.CONTENT_TYPE, PortalServiceConstants.APPLICATION_JSON);
				response =  PortalConfigUtil.executeRest(url, HttpMethod.GET, null, headers, restTemplate);
				if(response.getStatusCode() == HttpStatus.OK)
				{
					String beJson = response.getBody();
					JsonNode responseNode = mapper.readTree(beJson);
					
					if(null == responseNode || responseNode.isEmpty(null) || !responseNode.has(PortalServiceConstants.ITEM)
							|| null == responseNode.get(PortalServiceConstants.ITEM) || responseNode.get(PortalServiceConstants.ITEM).size() <= 0) {
						log.error("Password Service serach BE is empty response for api url {}", url);
						throw new PortalConfigException(ErrorCodeContants.PORTAL618,
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL618),
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL618));
					}
					
					JsonNode beNode = responseNode.get(PortalServiceConstants.ITEM).get(0).get(beView);
					if(isKeyEmail) {
						log.info("Forgot Password Apply filter via emailBePath {}, on JsonNode {}", emailMapping, beNode);
						filterByUniqueField(emailMapping, beNode, beFieldValue, 0);
						log.info("Forgot Password filtered value {}, via emailBePath {}", beNode, emailMapping);
						retValue = (String) applyProjections(beNode, userMapping, 0);
						log.info("Fetching username from email {}", retValue);
					}
					else {
						log.info("Change Password Apply filter via usernameBePath {}, on JsonNode {}", userMapping, beNode);
						filterByUniqueField(userMapping, beNode, beFieldValue, 0);
						log.info("Change Password filtered value {} via usernameBePath {}", beNode, userMapping);
						retValue = (String) applyProjections(beNode, emailMapping, 0);
						log.info("Fetching email from user {}", retValue);
					}
					 
				}
				else
				{
					throw new PortalConfigException(ErrorCodeContants.CONFIG604, errorCodeProperties.getProperty(ErrorCodeContants.CONFIG604), "");
				}
			}
			else
			 {
				 log.error("Error on get Portal Config for orsId id {}", orsId);
				 throw new PortalConfigException(ErrorCodeContants.CONFIG907,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG907), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG907));
	        	
			 }
		}
		catch (Exception e) {
			log.error("Error during search BE call {} ", orsId);
			throw new PortalConfigServiceException(ErrorCodeContants.CONFIG910,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG910), e.getMessage());
		}
		return retValue;
	}
	
	public boolean filterByUniqueField(String uniqueFieldPath, JsonNode beNode, String uniqueFieldValue,
			Integer beIndex) {

		boolean flag = false;
		String[] fields = uniqueFieldPath.split(PortalServiceConstants.DOT);

		if (beIndex < fields.length) {
			beNode = beNode.get(fields[beIndex]);
			if (null != beNode && !beNode.isEmpty(null)) {

				if (beNode.has(PortalServiceConstants.ITEM)) {
					ArrayNode existingArray = (ArrayNode) beNode.get(PortalServiceConstants.ITEM);
					ArrayNode filteredArray = ((ObjectNode) beNode).putArray(PortalServiceConstants.ITEM);
					Iterator<JsonNode> iterateNode = existingArray.iterator();
					while (iterateNode.hasNext()) {
						Integer counter = new Integer(beIndex);
						JsonNode bePathNode = iterateNode.next();
						if (filterByUniqueField(uniqueFieldPath, bePathNode, uniqueFieldValue, ++counter)) {
							filteredArray.add(bePathNode);
							return true;
						}
					}
				} else if (beNode.isObject()) {
					flag = filterByUniqueField(uniqueFieldPath, beNode, uniqueFieldValue, ++beIndex);
				} else if (beNode.isValueNode()) {
					flag = uniqueFieldValue.equalsIgnoreCase(beNode.asText());
				}
			}
		}

		return flag;
	}

	private Object applyProjections(JsonNode beNode, String projectionPath, Integer beIndex)
			throws PortalConfigException {

		Object projectionValue = null;
		String[] fields = projectionPath.split(PortalServiceConstants.DOT);
		if (beIndex < fields.length) {
			beNode = beNode.get(fields[beIndex]);
			log.info("Login - Search BE node is empty for projection path {}, with index {}, for beNode {}",
					projectionPath, beIndex, beNode);
			if (null != beNode && !beNode.isEmpty(null)) {
				if (beNode.has(PortalServiceConstants.ITEM)) {
					beNode = beNode.get(PortalServiceConstants.ITEM);
					if (null == beNode || beNode.isEmpty(null)) {
						log.error(
								"Password Service serach BE node is empty for projection path {}, with index {}, for beNode {}",
								projectionPath, beIndex, beNode);
						throw new PortalConfigException(ErrorCodeContants.PORTAL618,
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL618),
								errorCodeProperties.getProperty(ErrorCodeContants.PORTAL618));
					}
					Iterator<JsonNode> iterateNode = beNode.iterator();
					while (iterateNode.hasNext()) {
						Integer counter = new Integer(beIndex);
						JsonNode bePathNode = iterateNode.next();
						projectionValue = applyProjections(bePathNode, projectionPath, ++counter);
					}
				} else if (beNode.isObject()) {
					projectionValue = applyProjections(beNode, projectionPath, ++beIndex);
				} else if (beNode.isValueNode()) {
					projectionValue = beNode.asText();
				}
			}
		}

		return projectionValue;
	}
	
	private String childrenParamBuilder(List<String> fieldPaths) {
		StringBuilder children = new StringBuilder();
		Map<String,Integer> childDepthMap = new HashMap<>();
		fieldPaths.forEach(fieldPath ->{
			String[] pathArray = fieldPath.split(PortalServiceConstants.DOT);
				if(pathArray.length>1) {
					if(childDepthMap.containsKey(pathArray[0])) {
						childDepthMap.put(pathArray[0], Math.max(pathArray.length-1, childDepthMap.get(pathArray[0])));
					}else {
						childDepthMap.put(pathArray[0], pathArray.length-1);
					}
				}
		});
		if(!childDepthMap.isEmpty()) {
			children.append(PortalServiceConstants.AND).append(PortalServiceConstants.CHILDREN).append(PortalServiceConstants.EQUALS);
			childDepthMap.keySet().forEach(key -> { children.append(key).append(".").append(PortalServiceConstants.DEPTH)
				.append(PortalServiceConstants.EQUALS).append(childDepthMap.get(key)).append(PortalServiceConstants.COMA); });
		}
		if(children.length()!=0)
		children.deleteCharAt(children.length()-1);
		return children.toString();
	}
}

