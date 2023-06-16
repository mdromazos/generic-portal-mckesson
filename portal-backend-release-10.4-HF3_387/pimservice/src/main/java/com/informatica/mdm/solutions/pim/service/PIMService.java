package com.informatica.mdm.solutions.pim.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;

public interface PIMService {

	String createTokenForS360(Map<String,String> data,Locale locale) throws Exception;
	
	Map<String,String> addSupplier(Map<String,String> data)  throws Exception;
	
	Map<String,String> activateSupplier(Map<String,String> data)  throws Exception;
	
	Map<String,String> updateSupplier(Map<String,String> data) throws Exception;
	
	Map<String,String> deleteSupplier(Map<String,String> data)  throws Exception;
	
	Map<String, String> deactivateSupplier(Map<String,String> data)  throws Exception;
	
	Map<String,String> deleteUser(Map<String,String> data) throws Exception;
	
	Map<String,String> addUser(Map<String,String> data) throws Exception;
	
	List<Map<String, String>> findSuppliers(Map<String,String> data) throws Exception;
	
	Map<String,String> findUser(Map<String,String> data) throws Exception;
	
	List<Map<String, String>> findCatalogue(Map<String,String> data) throws Exception;
	
	Map<String, String> deleteUserHard(Map<String,String> data) throws Exception;
}
