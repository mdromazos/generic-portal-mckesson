package com.informatica.mdm.portal.metadata.util;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import javax.xml.bind.DatatypeConverter;

public class Base64Tool {
	  public static String encode(String value) {
	    return encode(value.getBytes(StandardCharsets.UTF_8));
	  }
	  
	  public static String encode(byte[] value) {
	    return DatatypeConverter.printBase64Binary(value);
	  }
	  
	  public static String decode(String value) {
	    byte[] decodedValue = decodeBytes(value);
	    return new String(decodedValue, StandardCharsets.UTF_8);
	  }
	  
	  public static byte[] decodeBytes(String value) {
	    return DatatypeConverter.parseBase64Binary(value);
	  }
	  
	  public static String urlEncode(String value) {
	    try {
	      return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
	    } catch (UnsupportedEncodingException ex) {
	      throw new RuntimeException(ex.getCause());
	    } 
	  }
	  
	  public static String urlDecode(String value) {
	    try {
	      return URLDecoder.decode(value, StandardCharsets.UTF_8.toString());
	    } catch (UnsupportedEncodingException ex) {
	      throw new RuntimeException(ex.getCause());
	    } 
	  }
	}
