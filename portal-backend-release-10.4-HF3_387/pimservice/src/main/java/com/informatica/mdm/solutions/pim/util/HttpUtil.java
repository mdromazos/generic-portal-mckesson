package com.informatica.mdm.solutions.pim.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.params.ClientPNames;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContextBuilder;
import org.apache.http.conn.ssl.SSLContexts;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.SingleClientConnManager;
import org.apache.http.message.BasicNameValuePair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import com.informatica.mdm.solutions.pim.model.IPIMConstants;

public class HttpUtil {
	
	private final static Logger log = LoggerFactory.getLogger(HttpUtil.class);
	
	private static String pimKSPath;
	
	private static String pimKSPassword;
	
	public static final String SERVLET_SECURED = "rf/gwtRequest";

	private static String getSessionCookie(HttpResponse response) {
		String sessionId = null;
		Header[] cookieHeader = response.getHeaders("Set-Cookie");
		for (Header header : cookieHeader) {
			String value = header.getValue();
			if (value.contains("JSESSIONID")) {
				int end = value.indexOf(";");
				sessionId = value.substring(0, end);
			}
		}
		return sessionId;
	}

	static HttpResponse executeAndReturnResponse(HttpRequestBase method)  {
        return executeAndReturnResponse(createHttpClient(method.getURI().getScheme()), method);
    }

	private static HttpResponse executeAndReturnResponse(HttpClient httpClient, HttpRequestBase method) {
		try {
			return httpClient.execute(method);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	private static HttpClient createHttpClient(String scheme) {
		if (scheme.equals("https")){
			return getHttpsClient();
		} else {
			DefaultHttpClient httpClient = new DefaultHttpClient();
			httpClient.getParams().setBooleanParameter(ClientPNames.HANDLE_REDIRECTS, false);
			return httpClient;
		}

	}

	static int logout(String serverUrl, String sessionToken, Locale locale)  {
		HttpGet request = new HttpGet(serverUrl + "/logout");
		addAcceptLanguageHeader(request, locale);
		request.addHeader("Cookie", sessionToken);
		String scheme = request.getURI().getScheme();
        return executeAndReturnResponse(createHttpClient(scheme), request).getStatusLine().getStatusCode();
    }

	static String login(String serverUrl, String username, String password, Locale locale)  {
		HttpPost request = new HttpPost(serverUrl + "/login");
		String scheme = request.getURI().getScheme();
		request.addHeader("Content-Type", "application/x-www-form-urlencoded");
		addAcceptLanguageHeader(request, locale);
		List<NameValuePair> parameters = Arrays.asList(new NameValuePair[] {
				new BasicNameValuePair("username", username), new BasicNameValuePair("password", password),
				new BasicNameValuePair("remember-me", Boolean.toString(false)) });
		HttpEntity entity;
		try {
			entity = new UrlEncodedFormEntity(parameters);
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		}
		request.setEntity(entity);
        HttpResponse response = executeAndReturnResponse(createHttpClient(scheme), request);
        return getSessionCookie(response);
	}

	static String loginWithBearerToken(String servletUrl, PrivateKey privateKey, String algorithm, String username, UserType userType, long timeToLiveSeconds, Locale locale, String pimKeystorePath, String pimKeystorePassword)  {
		pimKSPath=pimKeystorePath;
		pimKSPassword=pimKeystorePassword;
		HttpResponse response = createTokenForS360AsHttpResponse( servletUrl, privateKey, algorithm, username, userType, timeToLiveSeconds, locale, pimKeystorePath, pimKeystorePassword);
		return getSessionCookie( response );
	}

	static HttpResponse createTokenForS360AsHttpResponse(String servletUrl, PrivateKey privateKey, String algorithm, String username, UserType userType, long timeToLiveSeconds, Locale locale, String pimKeyStorePath, String pimKeyStorePassword) {
	    S360BearerMessageGenerator bearerMessageGenerator = new S360BearerMessageGenerator( privateKey, algorithm );
	    String bearerToken = bearerMessageGenerator.generate( username, userType, timeToLiveSeconds );
	    pimKSPath=pimKeyStorePath;
		pimKSPassword=pimKeyStorePassword;
	    HttpPost request = new HttpPost(servletUrl + "/rest/tokenForS360");
	    request.addHeader(HttpHeaders.ACCEPT, "application/json");
	    request.addHeader(HttpHeaders.CONTENT_TYPE, "application/json");
	    request.addHeader("authMethod", "bearer.p360.s360.supplierportal.integration");
	    request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + bearerToken);
	    addAcceptLanguageHeader(request, locale);
		String scheme = request.getURI().getScheme();

        HttpResponse response = executeAndReturnResponse(createHttpClient(scheme), request);
        if (HttpStatus.SC_CREATED != response.getStatusLine().getStatusCode())
      {
        throw new RuntimeException("Response status is " + response.getStatusLine().getStatusCode() + " \"" + response.getStatusLine().getReasonPhrase() + "\"");
      }

	    return response;
	  }

	private static void addAcceptLanguageHeader(HttpRequestBase result, Locale locale) {
		if (locale != null) {
			result.addHeader("Accept-Language", toHttpHeaderLocale(locale));
		}
	}

	private static String toHttpHeaderLocale(Locale locale) {
		return locale.toString().replace("_", "-");
	}

    public static HttpClient getHttpsClient() {

        SSLContext sslContext = null;
        
        try {
        	//keyStore based trusting with trustMaterial
        	if (!StringUtils.isEmpty(pimKSPath) && !pimKSPath.equals(IPIMConstants.EMPTY_PATH)&& !StringUtils.isEmpty(pimKSPassword) &&!pimKSPassword.equals(IPIMConstants.EMPTY_PSWD)) {
				SSLContextBuilder SSLBuilder = SSLContexts.custom();
				// Loading the Keystore file
				KeyStore keyStore = null;
				try {
					keyStore = loadKeyStoreFromFile(new File(pimKSPath), pimKSPassword);
				} catch (Exception e) {
					log.error(e.getMessage());
					throw new RuntimeException("Unable to load KeyStore from file may be incorrect keystore path or incorrect keystore password given in cmxserver.properties file {" + e.getMessage()+"}");					
				}
				try {
					SSLBuilder = SSLBuilder.loadTrustMaterial(keyStore);
				} catch (NoSuchAlgorithmException e) {
					log.error(e.getMessage());
					throw new RuntimeException("KeyStore Algorithm Exception : {" + e.getMessage()+"}");
				} catch (KeyStoreException e) {
					log.error(e.getMessage());
					throw new RuntimeException("KeyStore Exception : {" + e.getMessage()+"}");
				}
				SSLContext sslcontext = null;
				try {
					sslcontext = SSLBuilder.build();
				} catch (KeyManagementException | NoSuchAlgorithmException e) {
					log.error(e.getMessage());
					throw new RuntimeException("KeyManagement Exception : {" + e.getMessage()+"}");
				}
				SSLConnectionSocketFactory sslConSocFactory = new SSLConnectionSocketFactory(sslcontext);
				HttpClientBuilder clientbuilder = HttpClients.custom();
				clientbuilder = clientbuilder.setSSLSocketFactory(sslConSocFactory);
				HttpClient httpclient = clientbuilder.build();
				return httpclient;
			}
        	// set up a TrustManager that trusts everything
            sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, new TrustManager[] { new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() {
                    return null;
                }

                public void checkClientTrusted(X509Certificate[] certs,
                                               String authType) {
                }

                public void checkServerTrusted(X509Certificate[] certs,
                                               String authType) {
                }
            } }, new SecureRandom());
        	
        } catch (KeyManagementException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        SSLSocketFactory sf = new SSLSocketFactory(sslContext);
        Scheme httpsScheme = new Scheme("https", 443, sf);
        SchemeRegistry schemeRegistry = new SchemeRegistry();
        schemeRegistry.register(httpsScheme);

        // apache HttpClient version >4.2 should use BasicClientConnectionManager
        ClientConnectionManager cm = new SingleClientConnManager(schemeRegistry);
        HttpClient httpClient = new DefaultHttpClient(cm);
        return httpClient;

    }
    private static KeyStore loadKeyStoreFromFile( File keyStoreFile, String password )
    	    throws Exception
    	  {
    	    KeyStore keyStore = KeyStore.getInstance( KeyStore.getDefaultType() );
    	    try (FileInputStream keyStoreStream = new FileInputStream( keyStoreFile )) {
    	      char[] keyStorePasswordArray = password.toCharArray();
    	      keyStore.load( keyStoreStream, keyStorePasswordArray );
    	    }
    	    return keyStore;
    	  }
	
}
