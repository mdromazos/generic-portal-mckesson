package security.payload;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

public interface SecurityPayloadGeneratorInterface {
	public String getEncryptedSecurityPayload(String interactionId, String orsId, String requestName, String applicationName, String userName) throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, SignatureException;
	
	public String getEncryptedSecurityPayloadRest(String interactionId, String orsId, String requestName, String applicationName, String userName) throws InvalidKeyException, NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, SignatureException;
	
}