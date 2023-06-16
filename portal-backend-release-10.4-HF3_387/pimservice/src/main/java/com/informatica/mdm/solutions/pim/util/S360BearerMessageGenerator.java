package com.informatica.mdm.solutions.pim.util;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.SignatureException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import com.google.gwt.thirdparty.json.JSONException;
import com.google.gwt.thirdparty.json.JSONObject;


public class S360BearerMessageGenerator {
	private static final String AUTH_METHOD = "bearer.p360.s360.supplierportal.integration";
	  private PrivateKey privateKey;
	  private String algorithm;

	  public S360BearerMessageGenerator( PrivateKey privateKey, String algorithm ) {
	    this.privateKey = privateKey;
	    this.algorithm = algorithm;
	  }

	  public String generate( String username, UserType userType, long timeToLiveSeconds ) {
	    String headerString = createHeader();
	    String headerBase64Encoded = Base64.getEncoder()
	      .encodeToString( headerString.getBytes( StandardCharsets.UTF_8 ) );
	    Date expirationDate = calculateExpirationDate( timeToLiveSeconds );
	    String formattedDate = getFormattedDate( expirationDate );
	    String payloadString = createPayload( username, userType, formattedDate );
	    String payloadBase64Encoded = Base64.getEncoder()
	      .encodeToString( payloadString.getBytes( StandardCharsets.UTF_8 ) );
	    String signature = computeSignature( ( headerBase64Encoded + "." + payloadBase64Encoded )
	      .getBytes( StandardCharsets.UTF_8 ) );
	    return headerBase64Encoded + "." + payloadBase64Encoded + "." + signature;
	  }

	  private String getFormattedDate( Date expirationDate ) {
	    DateFormat dateFormat = new SimpleDateFormat( "yyyy-MM-dd'T'HH:mm:ss.SSSZ" );
	    return dateFormat.format( expirationDate );
	  }

	  private Date calculateExpirationDate( long timeToLiveSeconds ) {
	    Date timeNow = new Date();
	    long expirationDateAsLong = timeNow.getTime() + TimeUnit.SECONDS.toMillis( timeToLiveSeconds );
	    Date expirationDate = new Date( expirationDateAsLong );
	    return expirationDate;
	  }

	  private String createHeader() {
	    try {
	      JSONObject header = new JSONObject();
	      header.put( "authMethod", AUTH_METHOD );
	      header.put( "alg", this.algorithm );
	      return header.toString();
	    } catch( JSONException e ) {
	      throw new RuntimeException( "Error while creating payload.", e );
	    }
	  }

	  private String createPayload( String username, UserType userType, String expirationDate ) {
	    try {
	      JSONObject payload = new JSONObject();
	      payload.put( "user_loginName", username );
	      if( userType != null ) {
	        payload.put( "user_type", userType );
	      } else {
	        payload.put( "user_type", UserType.not_specified );
	      }
	      payload.put( "expiration_date", expirationDate );
	      return payload.toString();
	    } catch( JSONException e ) {
	      throw new RuntimeException( "Error while creating payload.", e );
	    }
	  }

	  /**
	   * Computes the signature for the specified byte array.
	   */
	  private String computeSignature( byte[] bytes ) {
	    try {
	      Signature dsa = Signature.getInstance( this.algorithm );
	      dsa.initSign( privateKey );
	      dsa.update( bytes );
	      byte[] realSig = dsa.sign();
	      return new String( Base64.getEncoder().encode( realSig ), StandardCharsets.UTF_8 );
	    } catch( InvalidKeyException | NoSuchAlgorithmException | SignatureException e ) {
	      throw new RuntimeException( "Computing signature failed.", e );
	    }
	  }
}
