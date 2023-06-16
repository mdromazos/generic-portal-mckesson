package com.informatica.mdm.portal.metadata.config;

import java.util.Properties;

import javax.naming.Context;

import com.delos.cmx.server.admin.AdminLogin;
import com.siperian.sif.client.JEEContainer;
import com.siperian.sif.client.JeeContainerFactory;

/**
 * The Class HubClient.
 */
public class HubClient {

	/** The admin login bean. */
	private AdminLogin adminLoginBean;
	
	/** The jee container. */
	private JEEContainer jeeContainer;

	/** The config. */
	private Properties config;
	
	/** The Constant HUB_REMOTE_PROPERTY. */
	private static final String HUB_REMOTE_PROPERTY = "mdm.hubclient.remote";
	
	/** The hub client. */
	private static HubClient hubClient = null;
	
	/**
	 * Gets the single instance of HubClient.
	 *
	 * @return single instance of HubClient
	 */
	public static HubClient getInstance() {
		if(hubClient == null) {
			synchronized (HubClient.class) {
				if(hubClient == null) {
					hubClient = new HubClient();
				}
			}
		}
		return hubClient;
	}
	
	/**
	 * Gets the admin login bean.
	 *
	 * @return the admin login bean
	 */
	public AdminLogin getAdminLoginBean() {
		return adminLoginBean;
	}
	
	/**
	 * Instantiates a new hub client.
	 */
	private HubClient() {
		init();
		createBeans();
	}

	private void init() {
		config = new Properties();
		String hubRemote = System.getProperty(HUB_REMOTE_PROPERTY);
		if (hubRemote != null) {
			initProperty(Context.URL_PKG_PREFIXES);
			initProperty(Context.PROVIDER_URL);
			initProperty(Context.INITIAL_CONTEXT_FACTORY);
		}		
	}

	/**
	 * Creates the beans.
	 */
	private void createBeans() {
		jeeContainer = JeeContainerFactory.createContainer(config);
		adminLoginBean = jeeContainer.createEjb("AdminLoginBean", AdminLogin.class);
	}

	/**
	 * Initialize the property.
	 *
	 * @param name the name
	 */
	private void initProperty(String name) {
		String value = System.getProperty(name);
		if (value != null) {
			config.put(name, value);
		}
	}

}