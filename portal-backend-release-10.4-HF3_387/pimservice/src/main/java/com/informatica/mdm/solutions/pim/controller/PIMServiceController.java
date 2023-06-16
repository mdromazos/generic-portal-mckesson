package com.informatica.mdm.solutions.pim.controller;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.delos.util.StringUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.informatica.mdm.solutions.pim.model.IPIMConstants;
import com.informatica.mdm.solutions.pim.service.PIMService;

@RestController
public class PIMServiceController {

	@Autowired
	PIMService pimService;
	
	@RequestMapping(value = "/token", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getTokenForS360(HttpServletResponse response, HttpServletRequest request,@RequestBody Map<String,String> data,@RequestParam(required=false) String locale) throws Exception {
		
			Locale localeValue = null;
			if(!StringUtil.isEmpty(locale)) {
				localeValue = Locale.forLanguageTag(locale);
			}
			String token = pimService.createTokenForS360(data,localeValue);
			return new ResponseEntity<String>(token,HttpStatus.OK);
		
	}
	
	@RequestMapping(value = "/supplier", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> supplierManagement(HttpServletResponse response, HttpServletRequest request,@RequestBody Map<String,String> data,@RequestParam String action) throws Exception{
		
			Object result = null;
			if(action.equalsIgnoreCase(IPIMConstants.ADD)) {
				result = pimService.addSupplier(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.UPDATE)) {
				result = pimService.updateSupplier(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.ACTIVATE)) {
				result = pimService.activateSupplier(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.DEACTIVATE)) {
				result = pimService.deactivateSupplier(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.DELETE)) {
				result = pimService.deleteSupplier(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.FIND)) {
				result = pimService.findSuppliers(data);
			}
			return new ResponseEntity<Object>(result,HttpStatus.OK);
		
	}
	
	@RequestMapping(value = "/user", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> userManagement(HttpServletResponse response, HttpServletRequest request,@RequestBody Map<String,String> data,@RequestParam String action) throws Exception{
		
			Object result = null;
			if(action.equalsIgnoreCase(IPIMConstants.ADD)) {
				result = pimService.addUser(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.FIND)) {
				result = pimService.findUser(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.DELETE)) {
				result = pimService.deleteUser(data);
			}else if(action.equalsIgnoreCase(IPIMConstants.HARD_DELETE)) {
				result = pimService.deleteUserHard(data);
			}
			return new ResponseEntity<Object>(result,HttpStatus.OK);
		
	}
	
	@RequestMapping(value = "/catalogs", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> findCatalog(HttpServletResponse response, HttpServletRequest request,@RequestBody Map<String,String> data) throws Exception{
			List<Map<String,String>> result = pimService.findCatalogue(data);
			return new ResponseEntity<List<Map<String,String>>>(result,HttpStatus.OK);
	}
}
