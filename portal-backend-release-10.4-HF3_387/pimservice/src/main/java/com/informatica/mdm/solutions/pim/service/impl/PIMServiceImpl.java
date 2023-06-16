package com.informatica.mdm.solutions.pim.service.impl;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.delos.util.StringUtil;
import com.google.web.bindery.requestfactory.shared.Request;
import com.heiler.hsp.backend.domain.ItemEditorPermission;
import com.heiler.hsp.registration.ui.shared.RegistrationRequestFactory;
import com.heiler.hsp.registration.ui.shared.RegistrationRequestFactory.RegistrationRequestContext;
import com.heiler.hsp.ui.backendconnector.shared.CatalogProxy;
import com.heiler.hsp.ui.backendconnector.shared.OrganizationProxy;
import com.heiler.hsp.ui.backendconnector.shared.OrganizationRequestFactory;
import com.heiler.hsp.ui.backendconnector.shared.OrganizationRequestFactory.OrganizationRequestContext;
import com.heiler.hsp.ui.backendconnector.shared.RoleProxy;
import com.heiler.hsp.ui.backendconnector.shared.RoleRequestFactory;
import com.heiler.hsp.ui.backendconnector.shared.RoleRequestFactory.RoleRequestContext;
import com.heiler.hsp.ui.backendconnector.shared.UserProxy;
import com.heiler.hsp.ui.backendconnector.shared.UserRequestFactory;
import com.heiler.hsp.ui.backendconnector.shared.UserRequestFactory.UserRequestContext;
import com.informatica.mdm.solutions.pim.model.BadRequestException;
import com.informatica.mdm.solutions.pim.model.ErrorCodes;
import com.informatica.mdm.solutions.pim.model.IPIMConstants;
import com.informatica.mdm.solutions.pim.model.PIMServiceException;
import com.informatica.mdm.solutions.pim.service.PIMService;
import com.informatica.mdm.solutions.pim.util.FactoryHelper;
import com.informatica.mdm.solutions.pim.util.KeyStoreHelper;
import com.informatica.mdm.solutions.pim.util.UserType;

@Service
public class PIMServiceImpl implements PIMService{
	
	private static final String PRIVATE_KEY_ALGORITHM = "SHA1withRSA";
	private static final long BEARER_TOKEN_TIME_TO_LIVE_IN_SECONDS = 360;
	
	@Autowired
	@Qualifier(value = "keyStore")
	KeyStoreHelper keyStoreHelper;
	
	@Autowired
	@Qualifier(value = "errorMessages")
	private Properties errorMessages;
	
	private String pimKeyStorePath;
	@Value("${pim.keystore.path:emptyPath}")
    public void setCmxKeyStorePath(String path) {
		pimKeyStorePath=path;
	}
	private String pimKeyStorePassword;
	@Value("${pim.keystore.password:emptyPswd}")
	public void setCmxKeyStorePassword(String pswd) {
		pimKeyStorePassword=pswd;
	}
	
	private final static Logger log = LoggerFactory.getLogger(PIMServiceImpl.class);
	
	private FactoryHelper loginWithBearerToken(String username,UserType userType,String serverUrl) throws Exception {
		FactoryHelper factoryHelper = new FactoryHelper(serverUrl);
		factoryHelper.loginWithBearerToken(keyStoreHelper.getPIMPrivateKey(), PRIVATE_KEY_ALGORITHM, username, userType, BEARER_TOKEN_TIME_TO_LIVE_IN_SECONDS,  pimKeyStorePath, pimKeyStorePassword);
		return factoryHelper;
	}
	
	public String createTokenForS360(Map<String,String> data, Locale locale) throws PIMServiceException {
		String authToken = null;
		try {
			HttpResponse authTokenResponse = FactoryHelper.createTokenForS360(data.get(IPIMConstants.SERVER_URL), keyStoreHelper.getPIMPrivateKey(), PRIVATE_KEY_ALGORITHM, data.get(IPIMConstants.USER), UserType.valueOf(data.get(IPIMConstants.USER_TYPE)), BEARER_TOKEN_TIME_TO_LIVE_IN_SECONDS, locale, pimKeyStorePath, pimKeyStorePassword);
			StringWriter contentStringWriter = new StringWriter();
		    IOUtils.copy( authTokenResponse.getEntity().getContent(), contentStringWriter );
		    authToken = contentStringWriter.toString();
		}catch(Exception e) {
			log.error("Unable to create auth token", e);
			throw new PIMServiceException(ErrorCodes.PIM119, errorMessages.getProperty(ErrorCodes.PIM119), e.getMessage());
		}
		return authToken;
	}

	public Map<String, String> addSupplier(Map<String, String> data) throws Exception {
		UserProxy userProxy = null;
		Map<String,String> savedSupplier = new HashMap();
		FactoryHelper helper = null;
		try {
			helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
			RoleRequestFactory roleFactory = helper.create(RoleRequestFactory.class);
			RoleProxy supplierAdminRole = FactoryHelper.fire(roleFactory.context().supplierAdmin());
			UserRequestFactory factory = helper.create(UserRequestFactory.class);
			UserRequestContext context = factory.context();
			OrganizationProxy supplier = context.create(OrganizationProxy.class);
			if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_ORG_NAME))) {
				supplier.setName(data.get(IPIMConstants.HSX_ORG_NAME));
			}else {
				throw new BadRequestException(ErrorCodes.PIM103,errorMessages.getProperty(ErrorCodes.PIM103),"");
			}
			if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_EXTERNAL_IDENTIFIER))) {
			supplier.setExternalSupplierIdentifier(data.get((IPIMConstants.HSX_EXTERNAL_IDENTIFIER)));
			}
			UserProxy newUser = createNewUserProxy(context, supplier, data,supplierAdminRole, UserProxy.STATE.REGISTRATION_PENDING);
			supplier.setUsers(Arrays.asList(newUser));
			userProxy = FactoryHelper.fire(context.save(newUser).with(IPIMConstants.ORGANIZTION));
			if(userProxy!=null) {
				savedSupplier.put(IPIMConstants.HSX_SUPPLIER_ID, userProxy.getOrganization().getId().toString());
			}
		}catch(Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM110, errorMessages.getProperty(ErrorCodes.PIM110), e.getMessage());
			}else {
				throw e;
			}
		}finally{
			if(helper!=null) {
				helper.logout();
			}
		}
		return savedSupplier;
	}

	public Map<String, String> activateSupplier(Map<String, String> data) throws Exception {
		Map<String, String> activatedSupplierHash = new HashMap<>();
		FactoryHelper helper = null;
		try
		{
			String supplierId = data.get(IPIMConstants.HSX_SUPPLIER_ID);
			if (!StringUtil.isEmpty(supplierId)) {
				helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
				// Create a factory and context to assemble a http request
				RegistrationRequestFactory factory = helper
						.create(RegistrationRequestFactory.class);
				RegistrationRequestContext context = factory.context();
				OrganizationProxy activatedSupplier = FactoryHelper
						.fire(context.activateSupplier(Long.parseLong(supplierId)));
				if (activatedSupplier != null) {
					activatedSupplierHash.put(IPIMConstants.MESSAGE,IPIMConstants.ACTIVATION_SUCCESS);
				}
			} else {
				// Throwing exception when supplier id is empty
				throw new BadRequestException(ErrorCodes.PIM104,errorMessages.getProperty(ErrorCodes.PIM104),"");
			}
		}catch (Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM111, errorMessages.getProperty(ErrorCodes.PIM111), e.getMessage());
			}else {
				throw e;
			}
		} finally {
			if(helper!=null) {
			helper.logout();
			}
		}
		return activatedSupplierHash;
	}

	@Override
	public Map<String,String> updateSupplier(Map<String, String> data) throws Exception{
		Map<String,String> updatedSupplier = new HashMap();
		FactoryHelper helper = null;
		try {
			if(!StringUtil.isEmpty(data.get(IPIMConstants.HSX_SUPPLIER_ID))) {
				helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
				OrganizationRequestFactory factory = helper.create(OrganizationRequestFactory.class);
				OrganizationRequestContext context = factory.context();
				OrganizationProxy updatedSupplierProxy;
				Request<OrganizationProxy> retrieveOrgByIdRequest = context.findById(Long.parseLong(data.get(IPIMConstants.HSX_SUPPLIER_ID)));
				OrganizationProxy retrievedOrgProxy = FactoryHelper.fire(retrieveOrgByIdRequest);
				// creating proxy for update supplier
				OrganizationRequestContext updateSupplierContext = factory.context();
				OrganizationProxy updateSupplierProxy = createUpdateSupplierProxy(updateSupplierContext, retrievedOrgProxy, data);
				Request<OrganizationProxy> updateOrgProxyRequest = updateSupplierContext.persist(updateSupplierProxy);
				// updating supplier attributes
				updatedSupplierProxy = FactoryHelper.fire(updateOrgProxyRequest);
				if (updatedSupplierProxy != null) {
					updatedSupplier.put(IPIMConstants.MESSAGE,IPIMConstants.SUPPLIER_UPDATE_SUCCESS_MESSAGE);
				}
			}else {
				throw new BadRequestException(ErrorCodes.PIM104,errorMessages.getProperty(ErrorCodes.PIM104),"");
			}
		}catch(Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM112, errorMessages.getProperty(ErrorCodes.PIM112), e.getMessage());
			}else {
				throw e;
			}
		}finally {
			if(helper!=null) {
				helper.logout();
			}
		}
		return updatedSupplier;
	}

	@Override
	public Map<String,String> deleteSupplier(Map<String,String> data) throws Exception{
		Map<String,String> deletedSupplier = new HashMap<>();
		FactoryHelper helper = null;
		try {
			String supplierid = data.get(IPIMConstants.HSX_SUPPLIER_ID);
			if(!StringUtil.isEmpty(supplierid)) {
			helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
			OrganizationRequestFactory factory = helper
					.create(OrganizationRequestFactory.class);
			OrganizationRequestContext deleteSupplierContext = factory.context();
			Request<Void> deleteSupplierRequest = deleteSupplierContext.remove(Long.parseLong(supplierid));
			FactoryHelper.fire(deleteSupplierRequest);
			deletedSupplier.put(IPIMConstants.MESSAGE,IPIMConstants.SUPPLIER_DELETE_SUCCESS_MESSAGE);
			}else {
				throw new BadRequestException(ErrorCodes.PIM104,errorMessages.getProperty(ErrorCodes.PIM104),"");
			}
		}catch(Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM113, errorMessages.getProperty(ErrorCodes.PIM113), e.getMessage());
			}else {
				throw e;
			}
		}finally{
			if(helper!=null) {
				helper.logout();
			}
		}
		return deletedSupplier;
	}

	@Override
	public Map<String, String> deactivateSupplier(Map<String,String> data) throws Exception{
		Map<String, String> deactivatedSupplierHash = new HashMap<>();
		OrganizationProxy deactivatedSupplierProxy = null;
		FactoryHelper helper = null;
		try {

			helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
			OrganizationRequestFactory factory = helper
					.create(OrganizationRequestFactory.class);
			OrganizationRequestContext context = factory.context();
			String supplierId = data.get(IPIMConstants.HSX_SUPPLIER_ID);
			if (!StringUtil.isEmpty(supplierId)) {
				Request<OrganizationProxy> retrieveOrgByIdRequest = context
						.findById(Long.parseLong(supplierId));
				OrganizationProxy retrievedOrgProxy = FactoryHelper
						.fire(retrieveOrgByIdRequest);

				OrganizationRequestContext deactivateSupplierContext = factory
						.context();
				OrganizationProxy deactivateUserProxy = deactivateSupplierContext
						.edit(retrievedOrgProxy);
				deactivateUserProxy.setActive(false);
				deactivateUserProxy.setActivePortalSupplier(false);
				Request<OrganizationProxy> deactivateOrgProxyRequest = deactivateSupplierContext
						.persist(deactivateUserProxy);
				// making supplier as inactive
				deactivatedSupplierProxy = FactoryHelper.fire(deactivateOrgProxyRequest);
				if (deactivatedSupplierProxy != null) {
					deactivatedSupplierHash.put(IPIMConstants.MESSAGE,IPIMConstants.SUPPLIER_DEACTIVATE_SUCCESS_MESSAGE);
				}
			} else {
				// supplier id is mandatory
				throw new BadRequestException(ErrorCodes.PIM104,errorMessages.getProperty(ErrorCodes.PIM104),"");
			}
		} catch (Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM114, errorMessages.getProperty(ErrorCodes.PIM114), e.getMessage());
			}else {
				throw e;
			}
		} finally {
			if(helper!=null) {
				helper.logout();
			}
		}
		return deactivatedSupplierHash;
	}

	@Override
	public Map<String,String> deleteUser(Map<String,String> data) throws Exception{
		UserProxy deactivatedUser = null;
		Map<String, String> deletedUserHash = new HashMap();
		FactoryHelper helper = null;
		try {
			helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
			// Create a factory and context to assemble a http request
			UserRequestFactory factory = helper
					.create(UserRequestFactory.class);
			UserRequestContext context = factory.context();
			String userEmailId = data.get(IPIMConstants.HSX_USER_EMAIL_ID);
			if (!StringUtil.isEmpty(userEmailId)) {
				Request<UserProxy> retrieveUserRequest = context.findSupplierUserByEmail(userEmailId).with(IPIMConstants.ORGANIZTION);
				UserProxy retrievedUser = FactoryHelper.fire(retrieveUserRequest);
				if (retrievedUser != null) {
					UserRequestContext contextDeactivateUser = factory.context();
					UserProxy updateUser = contextDeactivateUser.edit(retrievedUser);
					updateUser.setStateAsString(UserProxy.STATE.DEACTIVATED);
					Request<UserProxy> deleteUserRequest = contextDeactivateUser.save(updateUser);
					deactivatedUser = FactoryHelper.fire(deleteUserRequest);
					if (deactivatedUser != null) {
						deletedUserHash.put(IPIMConstants.MESSAGE,IPIMConstants.USER_DELETE_SUCCESS_MESSAGE);
					}
				} else {
					throw new PIMServiceException(ErrorCodes.PIM105,errorMessages.getProperty(ErrorCodes.PIM105),"");
				}
			} else {
				throw new PIMServiceException(ErrorCodes.PIM106,errorMessages.getProperty(ErrorCodes.PIM106),"");
			}
		}catch (Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM115, errorMessages.getProperty(ErrorCodes.PIM115), e.getMessage());
			}else {
				throw e;
			}
		} finally {
			if(helper!=null) {
				helper.logout();
			}
		}
		return deletedUserHash;
		
	}

	@Override
	public Map<String,String> addUser(Map<String, String> data) throws Exception{
		UserProxy userProxy = null;
		RoleProxy roles = null;
		Map<String, String> savedUser = new HashMap();
		FactoryHelper helper = null;
		try {
			helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
			OrganizationRequestFactory factory = helper
					.create(OrganizationRequestFactory.class);
			OrganizationRequestContext context = factory.context();
			if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_SUPPLIER_ID))) {
				Request<OrganizationProxy> retrieveOrgByIdRequest = context.findById(Long.parseLong(data.get(IPIMConstants.HSX_SUPPLIER_ID)));
				OrganizationProxy retrievedOrgProxy = FactoryHelper.fire(retrieveOrgByIdRequest);
				// if the organization exists and is Active add the new user and link to the org
				if (retrievedOrgProxy != null) {
						if (retrievedOrgProxy.isActive()) {
							UserRequestFactory userFactory = helper.create(UserRequestFactory.class);
						UserRequestContext newUserContext = userFactory.context();
						RoleRequestFactory roleFactory = helper.create(RoleRequestFactory.class);
						// creating user role proxy
						if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_ROLE))) {
							roles = createRoleProxy(roleFactory,data.get(IPIMConstants.HSX_ROLE));
						}
						// creating new user proxy
						UserProxy newUser = createNewUserProxy(newUserContext,retrievedOrgProxy, data, roles,UserProxy.STATE.ACTIVE);
						// Send the requests synchronously
						userProxy = FactoryHelper.fire(newUserContext.save(newUser));
						// Handle the result. Supplier user and supplier are persisted now.
						if (userProxy != null) {
							savedUser.put(IPIMConstants.HSX_USER_ID,userProxy.getId().toString());
						}
					} else {
						// supplier is Inactive ..Hence can not add new user
						throw new PIMServiceException(ErrorCodes.PIM107,errorMessages.getProperty(ErrorCodes.PIM107),"");
					}
				}
			} else {
				throw new BadRequestException(ErrorCodes.PIM104,errorMessages.getProperty(ErrorCodes.PIM104),"");
			}
		}catch(Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM116, errorMessages.getProperty(ErrorCodes.PIM116), e.getMessage());
			}else {
				throw e;
			}
		}finally{
			if(helper!=null) {
				helper.logout();
			}
		}
		return savedUser;
	}

	@Override
	public List<Map<String, String>> findSuppliers(Map<String,String> data) throws Exception{
		List<Map<String, String>> supplierList = new ArrayList<>();
		FactoryHelper helper = null;
		try {
			if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_EXTERNAL_IDENTIFIER))) {
				helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
				OrganizationRequestFactory factory = helper.create(OrganizationRequestFactory.class);
				OrganizationRequestContext context = factory.context();
				Request<List<OrganizationProxy>> retrievedSupplierRequest = context.findByExternalIdentifier(data.get(IPIMConstants.HSX_EXTERNAL_IDENTIFIER));
				List<OrganizationProxy> retrievedSupplierProxyList = FactoryHelper.fire(retrievedSupplierRequest);
				if (retrievedSupplierProxyList.size() != 0) {
					for (Iterator<OrganizationProxy> iter = retrievedSupplierProxyList
							.iterator(); iter.hasNext();) {
						OrganizationProxy org = iter.next();
						Map<String, String> supplierHash = new HashMap<String, String>();

						supplierHash.put(IPIMConstants.HSX_SUPPLIER_ID,
								Long.toString(org.getId()));
						supplierList.add(supplierHash);
					}
				}
			} else {
				throw new BadRequestException(ErrorCodes.PIM108,errorMessages.getProperty(ErrorCodes.PIM108),"");
			}
		} catch (Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM116, errorMessages.getProperty(ErrorCodes.PIM116), e.getMessage());
			}else {
				throw e;
			}
		} finally {
			if(helper!=null) {
				helper.logout();
			}
		}
		return supplierList;
		
	}

	@Override
	public Map<String,String> findUser(Map<String,String> data) throws Exception{
		Map<String, String> findUserHash = new HashMap<>();
		FactoryHelper helper = null;
		try {
			helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
			UserRequestFactory factory = helper.create(UserRequestFactory.class);
			UserRequestContext context = factory.context();
			String identifier = data.get(IPIMConstants.HSX_USER_EMAIL_ID);
			if (!StringUtil.isEmpty(identifier)) {
				Request<UserProxy> retrieveUserRequest = context
						.findSupplierUserByEmail(identifier);
				UserProxy retrievedUser = FactoryHelper
						.fire(retrieveUserRequest);

				if (retrievedUser != null) {
					if (retrievedUser.getFirstName() != null) {
						findUserHash.put("hsx-firstname",retrievedUser.getFirstName());
					}
					if (retrievedUser.getLastName() != null) {
						findUserHash.put("hsx-lastname",retrievedUser.getLastName());
					}
					if (retrievedUser.getEmail() != null) {
						findUserHash.put("hsx-email", retrievedUser.getEmail());
					}
					if (retrievedUser.getId() != null) {
						findUserHash.put("hsx-userid",String.valueOf(retrievedUser.getId()));
					}
					if(retrievedUser.isBrokerUser()) {
						findUserHash.put("isBroker", "Y");
					}else {
						findUserHash.put("isBroker", "N");
					}
				}
			} else {
				throw new BadRequestException(ErrorCodes.PIM106,errorMessages.getProperty(ErrorCodes.PIM106),"");
			}
		} catch (Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM117, errorMessages.getProperty(ErrorCodes.PIM117), e.getMessage());
			}else {
				throw e;
			}
		} finally {
			if(helper!=null) {
				helper.logout();
			}
		}
		return findUserHash;
		
	}

	@Override
	public List<Map<String, String>> findCatalogue(Map<String,String> data) throws Exception{
		List<Map<String, String>> catalogueList = new ArrayList<>();
		boolean hasItemEditorPermission = false;
		FactoryHelper helper = null;
		try {
			helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
			if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_EXTERNAL_IDENTIFIER).trim())) {
				OrganizationRequestFactory factory = helper
						.create(OrganizationRequestFactory.class);
				OrganizationRequestContext context = factory.context();
				Request<List<OrganizationProxy>> retrievedSupplierRequest = context.findByExternalIdentifier(data.get(IPIMConstants.HSX_EXTERNAL_IDENTIFIER).trim())
						.with(IPIMConstants.CATALOGS);
				List<OrganizationProxy> retrievedOrgProxy = FactoryHelper.fire(retrievedSupplierRequest);
				if (!retrievedOrgProxy.get(0).getItemEditorPermission().equals(ItemEditorPermission.RESTRICTED)) {
					hasItemEditorPermission = true;
				}
				List<CatalogProxy> catalogs = retrievedOrgProxy.get(0).getCatalogs();
				if (catalogs != null && catalogs.size() != 0) {

					for (Iterator<CatalogProxy> iter = catalogs.iterator(); iter.hasNext();) {
						CatalogProxy catalog = iter.next();
						Map<String, String> catalogHash = new HashMap<>();
						catalogHash.put(IPIMConstants.CATALOG_ID,Long.toString(catalog.getId()));
						catalogHash.put(IPIMConstants.CATALOG_NAME,catalog.getName());
						catalogHash.put(IPIMConstants.HAS_ITEM_EDITOR_PERMISSION,String.valueOf(hasItemEditorPermission));
						catalogueList.add(catalogHash);
					}
				} else {
					throw new PIMServiceException(ErrorCodes.PIM101,errorMessages.getProperty(ErrorCodes.PIM101),"");
				}
			} else {
				throw new BadRequestException(ErrorCodes.PIM104,errorMessages.getProperty(ErrorCodes.PIM104),"");
			}
		} catch (Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM101, errorMessages.getProperty(ErrorCodes.PIM101), e.getMessage());
			}else {
				throw e;
			}
		} finally {
			if(helper!=null) {
				helper.logout();
			}
		}
		return catalogueList;
	}
	
	@Override
	public Map<String, String> deleteUserHard(Map<String,String> data) throws Exception {
		Map<String, String> deletedSupplierHash = new HashMap<>();
		FactoryHelper helper = null;
		try {
			String userId = null;
			if(!StringUtil.isEmpty(data.get(IPIMConstants.HSX_USER_ID))) {
				Map<String,String> findUserHash = findUser(data);
				userId =  findUserHash.get(IPIMConstants.HSX_USER_ID);
			}
			if (!StringUtil.isEmpty(userId)) {
				helper = loginWithBearerToken(data.get(IPIMConstants.USER),UserType.valueOf(data.get(IPIMConstants.USER_TYPE)),data.get(IPIMConstants.SERVER_URL));
				UserRequestFactory factory = helper.create(UserRequestFactory.class);
				UserRequestContext deleteUserContext = factory.context();
				Request<Void> deleteUserRequest = deleteUserContext.remove(Long.parseLong(userId));
				FactoryHelper.fire(deleteUserRequest);
				deletedSupplierHash.put(IPIMConstants.MESSAGE,IPIMConstants.USER_DELETE_SUCCESS_MESSAGE);
			} else {
				// user id is mandatory
				throw new PIMServiceException(ErrorCodes.PIM105,errorMessages.getProperty(ErrorCodes.PIM105),"");
			}
		}catch (Exception e) {
			log.error(e.getMessage());
			if(!(e instanceof PIMServiceException)) {
				throw new PIMServiceException(ErrorCodes.PIM115, errorMessages.getProperty(ErrorCodes.PIM115), e.getMessage());
			}else {
				throw e;
			}
		} finally {
			if(helper!=null) {
				helper.logout();
			}
		}
		return deletedSupplierHash;
	}
	
	private UserProxy createNewUserProxy(UserRequestContext newUserContext,
			OrganizationProxy retrievedOrgProxy, Map<String, String> data,RoleProxy roles, String state)  {
		UserProxy newUser = newUserContext.create(UserProxy.class);
		if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_USER_EMAIL_ID))) {
			newUser.setEmail(data.get(IPIMConstants.HSX_USER_EMAIL_ID));
		}
		if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_FIRST_NAME))) {
			newUser.setFirstName(data.get(IPIMConstants.HSX_FIRST_NAME));
		}
		if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_LAST_NAME))) {
			newUser.setLastName(data.get(IPIMConstants.HSX_LAST_NAME));
		}
		if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_UILOCALE))) {
			newUser.setUiLocaleAsString(data.get(IPIMConstants.HSX_UILOCALE));
		}
		if (state != null) {
			newUser.setStateAsString(state);
		}
		newUser.setOrganization(retrievedOrgProxy);
		if (roles != null) {
			newUser.setRoles((Arrays.asList(roles)));
		}
		return newUser;
	}
	
	private OrganizationProxy createUpdateSupplierProxy(
			OrganizationRequestContext updateSupplierContext,
			OrganizationProxy retrievedOrgProxy, Map<String, String> data) {
		OrganizationProxy updateSupplierProxy = updateSupplierContext.edit(retrievedOrgProxy);
		if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_NAME))) {
			updateSupplierProxy.setName(data.get(IPIMConstants.HSX_NAME));
		}
		if (!StringUtil.isEmpty(data.get(IPIMConstants.HSX_EXTERNAL_IDENTIFIER))) {
			updateSupplierProxy.setExternalSupplierIdentifier(data.get(IPIMConstants.HSX_EXTERNAL_IDENTIFIER));
		}

		return updateSupplierProxy;
	}
	
	private RoleProxy createRoleProxy(RoleRequestFactory roleFactory,String role) throws Exception {
		RoleRequestContext roleRequestContext = roleFactory.context();
		RoleProxy roles = roleRequestContext.create(RoleProxy.class);
		try {
			if (role.equalsIgnoreCase(IPIMConstants.SUPPLIER_ADMIN_ROLE)) {
				// user is supplier admin
				roles = FactoryHelper.fire(roleFactory.context().supplierAdmin());
			} else if (role.equalsIgnoreCase(IPIMConstants.SUPPLIER_USER_ROLE)) {
				// user is supplier user
				roles = FactoryHelper.fire(roleFactory.context().supplierUser());
			} else {
				// invalid role is provided
				throw new BadRequestException(ErrorCodes.PIM109,errorMessages.getProperty(ErrorCodes.PIM109),"");
			}
		} catch (Exception e) {
			log.error(e.getMessage());
			throw e;
		}
		return roles;
	}

}
