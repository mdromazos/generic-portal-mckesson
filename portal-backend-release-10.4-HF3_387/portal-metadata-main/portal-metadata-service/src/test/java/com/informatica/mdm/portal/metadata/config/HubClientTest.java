package com.informatica.mdm.portal.metadata.config;

import javax.naming.Context;

import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.informatica.mdm.portal.metadata.config.HubClient;
import com.siperian.sif.client.JeeContainerFactory;

@RunWith(PowerMockRunner.class)
@PrepareForTest({HubClient.class,JeeContainerFactory.class})
@PowerMockIgnore("javax.management.*")
public class HubClientTest {
	
	private static final String HUB_REMOTE_PROPERTY = "mdm.hubclient.remote";
	
	@BeforeClass
	public static void init() {
		System.setProperty(HUB_REMOTE_PROPERTY, HUB_REMOTE_PROPERTY);
		System.setProperty(Context.URL_PKG_PREFIXES, Context.URL_PKG_PREFIXES);
		System.setProperty(Context.PROVIDER_URL, Context.PROVIDER_URL);
		System.setProperty(Context.INITIAL_CONTEXT_FACTORY, Context.INITIAL_CONTEXT_FACTORY);
	}
	
	@Test
	public void testGetHubClient() throws Exception {
		HubClient hubClient = PowerMockito.mock(HubClient.class);
	    PowerMockito.spy(HubClient.class);
	    PowerMockito.whenNew(HubClient.class).withNoArguments().thenReturn(hubClient);
		HubClient.getInstance();
	}

}
