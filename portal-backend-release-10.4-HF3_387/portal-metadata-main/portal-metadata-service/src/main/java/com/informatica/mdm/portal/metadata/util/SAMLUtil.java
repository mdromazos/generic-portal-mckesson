package com.informatica.mdm.portal.metadata.util;

import java.security.SecureRandom;


public class SAMLUtil
{
    private static final char[] hexes = "0123456789abcdef".toCharArray();

    private static String hexEncode(byte[] b)
    {
        char[] out = new char[b.length * 2];
        for (int i = 0; i < b.length; i++)
        {
            out[i*2] = hexes[(b[i] >> 4) & 0xf];
            out[i*2 + 1] = hexes[b[i] & 0xf];
        }
        return new String(out);
    }

    /**
     *  Generate a request ID suitable for passing to
     *  SAMLClient.createAuthnRequest.
     */
    public static String generateRequestId()
    {
        /* compute a random 256-bit string and hex-encode it */
        SecureRandom sr = new SecureRandom();
        byte[] bytes = new byte[32];
        sr.nextBytes(bytes);
        return "_" + hexEncode(bytes);
    }
    
    
}
