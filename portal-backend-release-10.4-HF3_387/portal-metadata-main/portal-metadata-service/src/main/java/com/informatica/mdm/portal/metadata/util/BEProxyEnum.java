package com.informatica.mdm.portal.metadata.util;

public enum BEProxyEnum {

	idlabel("lookup", "readLookupsAsIdAndLabelUsingGET"),
	object("list", "readLookupsAsObjectUsingGET");
	
	private final String lookupType;
	private final String lookupValue;
	
	private BEProxyEnum(String lookupType, String lookupValue) {
		
		this.lookupType = lookupType;
		this.lookupValue = lookupValue;
	}

	public String getLookupType() {
		return lookupType;
	}

	public String getLookupValue() {
		return lookupValue;
	}
	
	public static String valueByCode(String code) {
		String filterValue = null;
		for(BEProxyEnum val : BEProxyEnum.values()) {
			if(val.getLookupType().equalsIgnoreCase(code)) {
				filterValue = val.getLookupValue();
			}
		}
		return filterValue;
	}
	
}
