package com.informatica.solutions.portal.authn;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.util.Calendar;
import java.util.Map;

import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;
import com.delos.util.AppProperties;
import com.delos.util.base64.Base64;
import com.siperian.common.SipRuntimeException;
import com.siperian.sam.UserProfile;
import com.siperian.sam.UserProfileCallback;
import com.siperian.sif.client.CertificateHelper;

public class PortalLoginModule implements LoginModule {
	private static final String IS_PROXY = "isProxy";
	private CallbackHandler callbackHandler;
	private static final String INFA_PORTAL = "infaPortal";
	private static final String SAML_PROVIDER_TYPE = "SAML";
	private static String TIME_DIFF_SEC = "10";
	private Map options;
	public PortalLoginModule() {
	}

	public boolean login() throws LoginException {
		try {
			UserProfileCallback userProfileCallback = new UserProfileCallback();	
			callbackHandler.handle(new Callback[] { userProfileCallback });
			UserProfile userProfile = userProfileCallback.getUserProfile();
			if (userProfile != null) {
				// return true only if userProfile is created from Portal UserProfile provider
				Object isProxy = userProfile.getAttribute(IS_PROXY);
				if (isProxy != null && ((Boolean) isProxy)) {
					return true;
				}

				String prodiverType = (String) options.get("provider.type");
				String prodiverTimeDiff = (String) options.get("provider.time");
				long prodiverTimeDiffLong;
				if(prodiverTimeDiff != null ){
					prodiverTimeDiffLong = Long.parseLong(prodiverTimeDiff);
				} else {
					prodiverTimeDiffLong = Long.parseLong(TIME_DIFF_SEC);
				}
				if (prodiverType.equals(SAML_PROVIDER_TYPE)) {
					String userName = userProfile.getUsername();
					String password = userProfile.getPassword();
					return validateSAMLIdentity(userName, password, prodiverTimeDiffLong);
				}

			}

			return false;
		} catch (IOException e) {
			throw new SipRuntimeException("SIP-18005", e.getMessage(), callbackHandler, e);
		} catch (UnsupportedCallbackException e) {
			throw new SipRuntimeException("SIP-18006", e.getMessage(), callbackHandler, e);
		}
	}

	public void initialize(Subject subject, CallbackHandler callbackHandler, Map<String, ?> sharedState,
			Map<String, ?> options) {
		this.callbackHandler = callbackHandler;
		this.options = options;
	}

	public boolean commit() throws LoginException {
		return true;
	}

	public boolean abort() throws LoginException {
		return true;
	}

	public boolean logout() throws LoginException {
		return true;
	}

	public boolean validateSAMLIdentity(String userName, String password, long prodiverTimeDiffLong) {
		try {
			String mrmHome = AppProperties.getInstance().getProperty("cmx.home");
			if (mrmHome == null) {
				throw new NullPointerException("cmx.home not found in app properties (cmxserver.properties)");
			}
			CertificateHelper certificateHelper = CertificateHelper.getInstance(mrmHome);
			PrivateKey portalPrivateKey = certificateHelper.getPrivateKey(INFA_PORTAL);
			String decryptedValue = new String(certificateHelper.decrypt(Base64.decode(password), portalPrivateKey), StandardCharsets.UTF_8);
			long passwordmilis = Long.parseLong(decryptedValue);
			long milliTime = Calendar.getInstance().getTimeInMillis();
			long diff = milliTime - passwordmilis;
			long diffSeconds = diff / 1000 % 60;
			System.out.println("Time difference between encryption and decryption of SAML custom authentication process in seconds "+diffSeconds);
			if(diffSeconds<=prodiverTimeDiffLong){
				System.out.println("Login successful for "+ userName +" from Portal SAML provider." );
				return true;
			}

		} catch (Exception e) {
			System.out.println("Failed login for "+ userName  );
		}

		return false;
	}

}
