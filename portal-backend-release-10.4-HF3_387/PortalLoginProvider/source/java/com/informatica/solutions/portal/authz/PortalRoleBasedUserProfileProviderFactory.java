//=====================================================================
// project:   SAM Provider Example
//---------------------------------------------------------------------
// copyright: Siperian Inc. (c) 2007-2008.  All rights reserved.
//=====================================================================
// DISCLAIMER: All sample code is provided by Siperian for illustrative 
// purposes only. These examples have not been thoroughly tested under 
// all conditions. Siperian, therefore, cannot guarantee or imply 
// reliability, serviceability, or function of this sample code. This 
// is provided to you "AS IS" without any warranties of any kind. The 
// implied warranties of non-infringement, merchantability and fitness 
// for a particular purpose are expressly disclaimed.
//=====================================================================

package com.informatica.solutions.portal.authz;

import java.util.HashMap;
import java.util.Map;

import com.siperian.sam.UserProfileProvider;
import com.siperian.sam.UserProfileProviderFactory;

/**
 * Supplier Role Based User Profile Provider Factory for SAManager to get the
 * instance of SampleRoleBasedUserProfileProvider
 */
public class PortalRoleBasedUserProfileProviderFactory implements
		UserProfileProviderFactory {

	private Map properties = new HashMap();
	
	public void initialize(Map props) {
		if(props!=null) {
			this.properties.putAll(props);
		}
	}

	public UserProfileProvider getUserProfileProvider() {
		PortalRoleBasedUserProfileProvider userProfileProvider = new PortalRoleBasedUserProfileProvider();
		userProfileProvider.setProperties(this.properties);
		return userProfileProvider;
	}
}
