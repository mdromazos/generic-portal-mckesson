package com.informatica.mdm.portal.metadata.auth.util;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.delos.cmx.server.admin.AdminLogin;
import com.delos.cmx.server.datalayer.repository.security.AccessException;
import com.informatica.mdm.portal.metadata.config.HubClient;
import com.informatica.mdm.portal.metadata.util.PortalConfigUtil;
import com.informatica.mdm.portal.metadata.util.PortalRestConstants;
import com.informatica.mdm.portal.metadata.util.PortalRestUtil;

@RunWith(PowerMockRunner.class)
@PrepareForTest({PortalRestUtil.class,HubClient.class,PortalConfigUtil.class})
@PowerMockIgnore("javax.management.*")
public class AuthUtilTest {
	
	static final String MDM_SESSION_ID_COOKIE = "mdmsessionid";
	
	private HubClient hubClient;
	
	private AdminLogin adminLogin;
	
	@Before
	public void setup() {
		hubClient = mock(HubClient.class);
		adminLogin = mock(AdminLogin.class);
		PowerMockito.mockStatic(HubClient.class);
		PowerMockito.mockStatic(PortalConfigUtil.class);
		when(HubClient.getInstance()).thenReturn(hubClient);
		when(hubClient.getAdminLoginBean()).thenReturn(adminLogin);
	}
	
	@Test
	public void testIsSessionValid() throws AccessException {
		HttpServletRequest request = mock(HttpServletRequest.class);
		when(request.getScheme()).thenReturn("http");
		when(request.getServerName()).thenReturn("localhost");
		when(request.getServerPort()).thenReturn(8080);
		when(PortalConfigUtil.executeRest(Mockito.anyString(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(new ResponseEntity<>(HttpStatus.OK));
		assertTrue(PortalRestUtil.isSessionValid(request,"mdmSessionid","ict"));
	}
	
	@Test
	public void testSessionInvalid() throws AccessException {
		HttpServletRequest request = mock(HttpServletRequest.class);
		when(request.getScheme()).thenReturn("http");
		when(request.getServerName()).thenReturn("localhost");
		when(request.getServerPort()).thenReturn(8080);
		when(PortalConfigUtil.executeRest(Mockito.anyString(), Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(new ResponseEntity<>(HttpStatus.UNAUTHORIZED));
		assertFalse(PortalRestUtil.isSessionValid(request,"mdmSessionid","ict"));
	}
	
	@Test
	public void testGetMDMSessionId() {
		HttpServletRequest request = mock(HttpServletRequest.class);
		Cookie cookie = new Cookie(MDM_SESSION_ID_COOKIE, "mdmSessionid");
		Cookie[] cookies = new Cookie[1];
		cookies[0]=cookie;
		when(request.getCookies()).thenReturn(cookies);
		assertEquals(PortalRestUtil.getCookieValue(request, PortalRestConstants.MDM_SESSION_ID_COOKIE), "mdmSessionid");
	}
	
}
