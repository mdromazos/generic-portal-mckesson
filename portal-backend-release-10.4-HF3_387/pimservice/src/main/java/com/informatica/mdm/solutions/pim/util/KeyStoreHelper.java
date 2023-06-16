package com.informatica.mdm.solutions.pim.util;

import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.UnrecoverableKeyException;

import com.siperian.sif.client.CertificateHelper;

public class KeyStoreHelper {

	private static final String PRIVATE_KEY_ALIAS = "infaPortal";
	private static KeyStoreHelper keyStoreHelper = null;
	private PrivateKey pimPrivateKey = null;
	
	public static KeyStoreHelper getInstance() throws Exception {
		if(keyStoreHelper == null) {
			synchronized (KeyStoreHelper.class) {
				if(keyStoreHelper == null) {
					keyStoreHelper = new KeyStoreHelper();
				}
			}
		}
		return keyStoreHelper;
	}
	
	private KeyStoreHelper() throws Exception {
		CertificateHelper certificateHelper = CertificateHelper.getInstance();
		pimPrivateKey = certificateHelper.getPrivateKey(PRIVATE_KEY_ALIAS);
	}
	
	public PrivateKey getPIMPrivateKey() throws UnrecoverableKeyException, KeyStoreException, NoSuchAlgorithmException {
		return pimPrivateKey;
	}
	
}
