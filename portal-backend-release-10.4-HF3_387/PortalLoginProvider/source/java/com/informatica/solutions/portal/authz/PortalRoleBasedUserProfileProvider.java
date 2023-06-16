package com.informatica.solutions.portal.authz;

import java.io.Serializable;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.logging.Logger;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.rmi.PortableRemoteObject;
import javax.xml.bind.DatatypeConverter;

import com.delos.cmx.server.MDMSessionException;
import com.delos.cmx.server.admin.AdminLogin;
import com.delos.cmx.server.datalayer.ConnectionData;
import com.delos.cmx.server.datalayer.repository.ReposException;
import com.delos.cmx.server.datalayer.repository.database.ReposDatabase;
import com.delos.cmx.server.datalayer.repository.security.ReposSamRole;
import com.delos.cmx.server.datalayer.repository.security.ReposUser;
import com.delos.util.AppProperties;
import com.siperian.sam.PkiUtilProvider;
import com.siperian.sam.SecurityCredential;
import com.siperian.sam.UserProfile;
import com.siperian.sam.UserProfileProvider;
import com.siperian.sam.security.certificate.PKIUtil;
import com.siperian.sif.client.CertificateHelper;

public class PortalRoleBasedUserProfileProvider implements
		UserProfileProvider {
	
	private Map properties = new HashMap();

	private static List<String> capabities = new ArrayList<String>();

	private static final Logger LOGGER = Logger.getLogger(PortalRoleBasedUserProfileProvider.class.getName());
	
	private static final String USER_SESSION_ATTRIB ="UserSessionAttributes";
	
	private static final String PAYLOAD_MDM_SESSION = "mdm.session.id||";
	
	private static final String USERNAME = "username";
	
	private static final String ROLE_CODE = "roleCode";
	
	private static final String INFA_PORTAL = "infaPortal";
	
	private static final String HUB = "hub";
	
	private static final String IS_PROXY = "isProxy";
	
	private static final String APP_SERVER_PROP = "app.server.type";
	
	private static final String APP_SERVER_JBOSS = "jboss";
	
	private static final String APP_SERVER_WEBLOGIC = "weblogic";
	
	private static final String APP_SERVER_WEBSPHERE = "websphere";
	
	static {
		capabities.add(UserProfileProvider.CREATE_USER_PROFILE);
	}
	
	void setProperties(Map props) {
		this.properties.putAll(props);
	}

	/**
	 * Create user profile based on security pay load (credentials and roles)
	 * @param securityCredential Security Credential
	 * @return userProfile Created user profile
	 * 
	 * */
	public UserProfile createUserProfile(SecurityCredential securityCredential) {

		UserProfile userProfile = new UserProfile();
		try {
			String mrmHome = AppProperties.getInstance().getProperty("cmx.home");
			if (mrmHome == null) {
				throw new NullPointerException("cmx.home not found in app properties (cmxserver.properties)");
			}
			PkiUtilProvider pkiUtilprovider = PkiUtilProvider.getInstance(mrmHome);
			PKIUtil pkiUtil = pkiUtilprovider.getPkiUtil();
			Certificate certificate = pkiUtil.getCertificate(INFA_PORTAL);
			PublicKey portalPublicKey = certificate.getPublicKey();
			PrivateKey hubPrivateKey = pkiUtil.getPrivateKey(HUB);
			CertificateHelper certificateHelper = CertificateHelper.getInstance(mrmHome);
			byte[] payload = securityCredential.getPayload();
			byte[] decryptedWithHubPrivateKey = certificateHelper.decrypt(DatatypeConverter.parseHexBinary(new String(payload)), hubPrivateKey);
			byte[] decryptedWithPortalPublicKey = certificateHelper.decrypt(decryptedWithHubPrivateKey, portalPublicKey);
			String sessionId = new String(decryptedWithPortalPublicKey);
			AdminLogin adminLoginBean = (AdminLogin) lookUp("AdminLoginBean", AdminLogin.class);
			Serializable obj = adminLoginBean.getSessionAttribute(sessionId, USER_SESSION_ATTRIB);
			HashMap<String, Object> map = (HashMap<String, Object>) obj;
			List<String> roleNames = getRoleNames(adminLoginBean,map);
			List<String> roles = getRoles(securityCredential.getDatabaseId(), (String)map.get(USERNAME), new HashSet<>(roleNames));
			userProfile.setUserRoles(roles);
			userProfile.setUserRoleNames(roleNames);
			userProfile.setUsername((String)map.get(USERNAME));
			userProfile.setPayload((PAYLOAD_MDM_SESSION+sessionId).getBytes());
			userProfile.setAttribute(IS_PROXY, true);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		return userProfile;
	}
	
	public List<String> getCapabilties() {
		return capabities;
	}

	public boolean hasCapability(String capability) {
		return PortalRoleBasedUserProfileProvider.capabities.contains(capability);
	}
	
	public InitialContext getInitialContext() throws NamingException {
		Properties props = new Properties();
	    props.putAll(this.properties);
	    return new InitialContext(props);
	}
	
	public Object lookUp(String paramString, Class paramClass) throws NamingException {
		
		InitialContext localInitialContext = getInitialContext();
		Object object = null;
		String serverType = (String) localInitialContext.getEnvironment().get(APP_SERVER_PROP);
		if(APP_SERVER_JBOSS.equalsIgnoreCase(serverType)) {
			object = lookUpJbossAppServer(localInitialContext, paramString, paramClass);
		} else if(APP_SERVER_WEBLOGIC.equalsIgnoreCase(serverType)) {
			object = lookUpWeblogicAppServer(localInitialContext, paramString, paramClass);
		} else if(APP_SERVER_WEBSPHERE.equalsIgnoreCase(serverType)) {
			object = lookUpWebsphereAppServer(localInitialContext, paramString, paramClass);
		}
		return object;
	}
	
	public Object lookUpWeblogicAppServer(InitialContext initialContext, String paramString, Class paramClass) throws NamingException {
		
		initialContext.lookup("/global/siperian-mrm/siperian-ejb/" + paramString);
		return paramClass.cast(initialContext.lookup("/global/siperian-mrm/siperian-ejb/" + paramString ));
	}
	
	public Object lookUpJbossAppServer(InitialContext initialContext, String paramString, Class paramClass) throws NamingException {
		
		initialContext.lookup("ejb:" + "/siperian-mrm/siperian-ejb/" + paramString + '!' + paramClass.getName());
		return paramClass.cast(initialContext.lookup("/siperian-mrm/siperian-ejb/" + paramString + '!' + paramClass.getName()));
	}
	
	public Object lookUpWebsphereAppServer(InitialContext initialContext, String paramString, Class paramClass) throws NamingException {
		
		Object localObject = initialContext.lookup("ejb/siperian-mrm.ear/siperian-ejb.jar/" + paramString + '#' + paramClass.getName());
	    return paramClass.cast(PortableRemoteObject.narrow(localObject, paramClass));
	}
	
	
	private List<String> getRoles(String orsId,String username,Set<String> roleSet) throws ReposException{
		List<String> roleIds = new ArrayList<>();
		ConnectionData connectionData = getConnectionData(orsId);
		ReposUser reposUser = ReposUser.getUser(username);
		for(String role : roleSet) {
			ReposSamRole resposSamRole = ReposSamRole.getSamRoleByName(connectionData, role);
			roleIds.add(resposSamRole.getPrimaryKey());
		}
		return roleIds;
	}
	
	private List<String> getRoleNames(AdminLogin adminLoginBean,HashMap<String, Object> map) throws MDMSessionException{
		List<String> roleNames = new ArrayList<>();
		roleNames.add((String) map.get(ROLE_CODE));
		return roleNames;
	}
	
	private ConnectionData getConnectionData(String orsId) throws ReposException {
            return ReposDatabase.getDatabaseById(orsId, false).getConnection();
    }
}