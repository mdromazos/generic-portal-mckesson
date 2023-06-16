package security.payload;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

import com.siperian.sam.SamAuthenticationException;
import com.siperian.sif.client.CertificateHelper;

/**
 * @author rsaikia
 *
 */
public class SecurityPayloadGenerator implements SecurityPayloadGeneratorInterface{


    public String getEncryptedSecurityPayload(String interactionId, String orsId, String requestName, 
    		String applicationName, String userName) throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, SignatureException
    {
    	CertificateHelper certificateHelper=CertificateHelper.getInstance();
        requestName=requestName.toLowerCase();
        userName = getUserName(userName,applicationName);
        interactionId="";
        String sp=null;
		try {
			sp=certificateHelper.getEncryptedSecurityPayloadForRest(interactionId, orsId, requestName, applicationName, userName);
		} catch (SamAuthenticationException e) {
			e.printStackTrace();
		}
        return sp;
    }

	@Override
	public String getEncryptedSecurityPayloadRest(String interactionId,
			String orsId, String requestName, String applicationName,
			String userName) throws InvalidKeyException,
			NoSuchAlgorithmException, NoSuchPaddingException,
			IllegalBlockSizeException, BadPaddingException, SignatureException {
		
		
		CertificateHelper certificateHelper=CertificateHelper.getInstance();
        requestName=requestName.toLowerCase();
        userName = getUserName(userName,applicationName);
        interactionId="";
        String sp=null;
		try {
			sp=certificateHelper.getSecurityPayloadForRestAsHttpHeader (interactionId, orsId, requestName, applicationName, userName);
		} catch (SamAuthenticationException e) {
			e.printStackTrace();
		}
        return sp;
		
	}
	
	private String getUserName(String userName,String applicationName){
        if(userName!=null && userName.contains("/")){
        	String[] splitted=userName.split("/");
        	if(splitted!=null && splitted.length>1){
        		applicationName=splitted[0];
        	}
        }
        else if(userName!=null && !userName.contains("/") && applicationName!=null){
        	userName=applicationName+"/"+userName;
        }
		return userName;
	}
	
}
