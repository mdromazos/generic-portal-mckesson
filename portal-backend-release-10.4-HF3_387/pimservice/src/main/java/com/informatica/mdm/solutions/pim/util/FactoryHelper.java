package com.informatica.mdm.solutions.pim.util;

import java.security.PrivateKey;
import java.util.Locale;

import org.apache.http.HttpResponse;

import com.google.web.bindery.event.shared.SimpleEventBus;
import com.google.web.bindery.requestfactory.shared.Receiver;
import com.google.web.bindery.requestfactory.shared.Request;
import com.google.web.bindery.requestfactory.shared.RequestFactory;
import com.google.web.bindery.requestfactory.shared.ServerFailure;
import com.google.web.bindery.requestfactory.vm.RequestFactorySource;

public class FactoryHelper {
	private static final String DEFAULT_URL = "http://localhost:9090/hsx";
	  private String sessionToken;
	  private Locale sessionLocale;
	  private String serverUrl;

	  public static class FailureException extends RuntimeException {
	    private static final long serialVersionUID = 1L;

	    public FailureException( String message ) {
	      super( message );
	    }
	  }

	  /**
	   * Connects to local server "localhost" at default port 9090.
	   */
	  public FactoryHelper() {
	    this( DEFAULT_URL );
	  }
	  
	  /**
	   * Connects to given server.
	   * @param serverUrl e.g. server http://localhost:9090/hsx
	   */
	  public FactoryHelper( String serverUrl ) {
	    this.serverUrl = serverUrl != null && !serverUrl.isEmpty() ? serverUrl : DEFAULT_URL;
	  }
	  
	  public String login( String username, String password, Locale locale ) {
	    if( sessionToken != null ) {
	      logout();
	    }
	    sessionToken = HttpUtil.login( serverUrl, username, password, locale );
	    sessionLocale = locale;
	    return sessionToken;
	  }
	  
	  public FactoryHelper login( String username, String password ) {
	    login( username, password, Locale.US );
	    return this;
	  }
	  
	  /**
	   * This method uses the bearer-token-based authentication for logging into the Product 360 Supplier Portal. 
	   * 
	   * @param privateKey this private key is used to create the signature of the bearer token
	   * @param algorithm the standard algorithm suitable for the given private key. See the Signature section in the <a href="https://docs.oracle.com/javase/8/docs/technotes/guides/security/StandardNames.html#Signature">Java Cryptography Architecture Standard Algorithm Name Documentation</a> for information about standard algorithm names.
	   * @param username the user name to be logged in with
	   * @param userType the type of user. Can be one of supplier_user, portal_admin_user, not_specified. If not_specified, then first supplier user and then portal admin user will be tried to log in.
	   * @param timeToLiveSeconds specifies the seconds, how long the bearer token is valid
	   */
	  public FactoryHelper loginWithBearerToken(PrivateKey privateKey, String algorithm, String username, UserType userType, long timeToLiveSeconds, String pimKeyStorePath, String pimKeyStorePassword) {
	    if (sessionToken != null) {
	      logout();
	    }
	    
	    sessionToken = HttpUtil.loginWithBearerToken( this.serverUrl, privateKey, algorithm, username, userType, timeToLiveSeconds, Locale.US, pimKeyStorePath, pimKeyStorePassword);
	    sessionLocale = Locale.US;
	    return this;
	  }
	    
	  public String getSessionToken() {
	    return sessionToken;
	  }
	  
	  public String getServerUrl() {
	    return serverUrl;
	  }
	  
	  public Locale getSessionLocale() {
	    return sessionLocale;
	  }

	  public void logout() {
	    if( sessionToken != null ) {
	      HttpUtil.logout( serverUrl, sessionToken, sessionLocale );
	      sessionToken = null;
	      sessionLocale = null;
	    }
	  }
	  
	  /**
	   * Create a ready to use GWT {@link RequestFactory} instance.
	   * 
	   * @param factoryClass the concrete RF factory class to create.
	   */
	  public <T extends RequestFactory> T create( Class<T> factoryClass ) {
	    return create( factoryClass, sessionToken, sessionLocale );
	  }

	  /**
	   * Same as {@link #create(Class)} but allows to specify a locale.
	   * @param factoryClass the concrete RF factory class to create.
	   * @param sessionCookie The JSESSIONID or null for unauthenticated requests.
	   * @param headerLocale Locale to be used for the user. Affects some data that are returned in
	   * the user's language, e.g. timeline messages.
	   */
	  private <T extends RequestFactory> T create( Class<T> factoryClass,
	                                               String sessionCookie,
	                                               Locale headerLocale )
	  {
	    String url = serverUrl + "/" + HttpUtil.SERVLET_SECURED;
	    HttpPostRequestTransport transport = new HttpPostRequestTransport( url, headerLocale );
	    transport.setSessionCookie( sessionCookie );
	    T factory = RequestFactorySource.create( factoryClass );
	    factory.initialize( new SimpleEventBus(), transport );
	    return factory;
	  }

	  /**
	   * Sends a request to the server. The result of the request is returned. On
	   * case of an error a {@link RuntimeException} is thrown.
	   */
	  @SuppressWarnings("unchecked")
	  public static <T> T fire( Request<T> request ) {
	    final Object[] result = new Object[ 1 ];
	    Receiver<T> receiver = new Receiver<T>() {
	      @Override
	      public void onSuccess( T arg0 ) {
	        result[ 0 ] = arg0;
	      }
	  
	      @Override
	      public void onFailure( ServerFailure error ) {
	        throw new FailureException( "Exception on Server ("
	                                    + error.getExceptionType()
	                                    + "): "
	                                    + error.getMessage() );
	      }
	    };
	    request.fire( receiver );
	    return ( T )result[ 0 ];
	  }
	  
	  /**
	   * This method uses the bearer-token-based authentication for creating an auth-token for Product 360 Supplier Portal. 
	   * 
	   * @param servletUrl e.g. http://localhost:9090/hsx
	   * @param privateKey this private key is used to create the signature of the bearer token
	   * @param algorithm the standard algorithm suitable for the given private key. See the Signature section in the <a href="https://docs.oracle.com/javase/8/docs/technotes/guides/security/StandardNames.html#Signature">Java Cryptography Architecture Standard Algorithm Name Documentation</a> for information about standard algorithm names.
	   * @param username the user name to be logged in with
	   * @param userType the type of user. Can be one of supplier_user, portal_admin_user, not_specified. If not_specified, then first supplier user and second portal admin user will be tried to log in.
	   * @param timeToLiveSeconds specifies the seconds, how long the bearer token is valid
	   * @param locale the locale to be logged in with
	   * @param
	   * @param
	   * @return the HttpResponse containing the auth-token in JSON format
	   */
	  public static HttpResponse createTokenForS360(String servletUrl, PrivateKey privateKey, String algorithm, String username, UserType userType, long timeToLiveSeconds, Locale locale, String pimKeyStorePath, String pimKeyStorePassword) {
	    return HttpUtil.createTokenForS360AsHttpResponse( servletUrl, privateKey, algorithm, username, userType, timeToLiveSeconds, locale, pimKeyStorePath, pimKeyStorePassword);
	  }
}
