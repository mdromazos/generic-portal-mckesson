package com.informatica.mdm.portal.metadata.model;

import java.io.Serializable;

public class UserPassword implements Serializable{

	private static final long serialVersionUID = 1L;
	
	// Password text - plain or encrypted
    private String password;

    // true if password text is encrypted
    private boolean encrypted = false;
    
    public UserPassword( String password, boolean encrypted ){
        this.password = password;
        this.encrypted = encrypted;
    }

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isEncrypted() {
		return encrypted;
	}

	public void setEncrypted(boolean encrypted) {
		this.encrypted = encrypted;
	}
    
    
}
