package com.informatica.mdm.solutions.pim.app;

import java.io.File;
import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import org.apache.http.HeaderElement;
import org.apache.http.HeaderElementIterator;
import org.apache.http.HttpResponse;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.conn.ConnectionKeepAliveStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.message.BasicHeaderElementIterator;
import org.apache.http.protocol.HTTP;
import org.apache.http.protocol.HttpContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import com.informatica.mdm.solutions.pim.model.IPIMConstants;
import com.informatica.mdm.solutions.pim.util.KeyStoreHelper;
import com.siperian.sif.client.EjbSiperianClient;
import com.siperian.sif.client.SiperianClient;

@Configuration
public class PIMServiceConfig {
	
	public static final String ERROR_PROPERTIES_PATH = "/error.properties";
	 // Determines the timeout in milliseconds until a connection is established.
    private static final int CONNECT_TIMEOUT = 5000;
     
    // The timeout when requesting a connection from the connection manager.
    private static final int REQUEST_TIMEOUT = 10000;
     
    // The timeout for waiting for data
    private static final int SOCKET_TIMEOUT = 60000;
 
    private static final int MAX_TOTAL_CONNECTIONS = Integer.parseInt(System.getProperty("portal.max.conn", "100"));
    private static final int DEFAULT_KEEP_ALIVE_TIME_MILLIS = 2 * 1000;
    private static final int CLOSE_IDLE_CONNECTION_WAIT_TIME_SECS = 30;
	
	@Bean("keyStore")
	public KeyStoreHelper keyStoreHelper() throws Exception {
		return KeyStoreHelper.getInstance();
	}
	
	@Bean("sipClient")
	public SiperianClient getSifclient()
			throws Exception {
		SiperianClient sipClient = null;
		Properties properties = new Properties();
		properties.put(SiperianClient.SIPERIANCLIENT_PROTOCOL,
				EjbSiperianClient.PROTOCOL_NAME);
		sipClient = SiperianClient.newSiperianClient(properties);
		return sipClient;
	}
	
	@Bean("errorMessages")
	public Properties getErrorProperties() throws IOException {
		Properties properties = new Properties();
		PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver =  new PathMatchingResourcePatternResolver();
	    Resource resource = pathMatchingResourcePatternResolver.getResource(ERROR_PROPERTIES_PATH);
		properties.load(resource.getInputStream());
		return properties;
	}
	
	@Bean
    public PoolingHttpClientConnectionManager poolingConnectionManager() {
        PoolingHttpClientConnectionManager poolingConnectionManager = new PoolingHttpClientConnectionManager();
        poolingConnectionManager.setMaxTotal(MAX_TOTAL_CONNECTIONS);
        poolingConnectionManager.setDefaultMaxPerRoute(Integer.parseInt(System.getProperty("portal.conn.route", "50")));
        return poolingConnectionManager;
    }
 
    public ConnectionKeepAliveStrategy connectionKeepAliveStrategy() {
        return new ConnectionKeepAliveStrategy() {
            @Override
            public long getKeepAliveDuration(HttpResponse response, HttpContext context) {
                HeaderElementIterator it = new BasicHeaderElementIterator
                        (response.headerIterator(HTTP.CONN_KEEP_ALIVE));
                while (it.hasNext()) {
                    HeaderElement he = it.nextElement();
                    String param = he.getName();
                    String value = he.getValue();
 
                    if (value != null && param.equalsIgnoreCase("timeout")) {
                        return Long.parseLong(value) * 1000;
                    }
                }
                return DEFAULT_KEEP_ALIVE_TIME_MILLIS;
            }

        };
    }
 
    @Bean
    public CloseableHttpClient httpClient(PoolingHttpClientConnectionManager poolingConnectionManager) {
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(REQUEST_TIMEOUT)
                .setConnectTimeout(CONNECT_TIMEOUT)
                .setSocketTimeout(SOCKET_TIMEOUT).build();
 
        return HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .setConnectionManager(poolingConnectionManager)
                .setConnectionManagerShared(true)
                .setKeepAliveStrategy(connectionKeepAliveStrategy())
                .disableCookieManagement()
                .build();
    }
     
    @Bean
    public Runnable idleConnectionMonitor(final PoolingHttpClientConnectionManager poolingConnectionManager) {
        return new Runnable() {
            @Override
            @Scheduled(fixedDelay = 10000)
            public void run() {
                try {
                    if (poolingConnectionManager != null) {
                        System.out.println("run IdleConnectionMonitor - Closing expired and idle connections...");
                        poolingConnectionManager.closeExpiredConnections();
                        poolingConnectionManager.closeIdleConnections(CLOSE_IDLE_CONNECTION_WAIT_TIME_SECS, TimeUnit.SECONDS);
                    } else {
                    	System.out.println("run IdleConnectionMonitor - Http Client Connection manager is not initialised");
                    }
                } catch (Exception e) {
                	System.out.println("run IdleConnectionMonitor - Exception occurred. msg={}, e={}" + e.getMessage());
                	e.printStackTrace();
                }
            }
        };
    }

    
    @Bean
    public RestTemplate restTemplate(HttpComponentsClientHttpRequestFactory clientHttpRequestFactory) {
        RestTemplate restTemplate = new RestTemplate(clientHttpRequestFactory);
        restTemplate.setErrorHandler(new DefaultResponseErrorHandler() {
        	public boolean hasError(ClientHttpResponse response) throws IOException {
        		HttpStatus statusCode = response.getStatusCode();
        		return statusCode.series() == HttpStatus.Series.SERVER_ERROR;
        	}});
        
        return restTemplate;
    }
 
    @Bean
    public HttpComponentsClientHttpRequestFactory clientHttpRequestFactory(CloseableHttpClient httpClient) {
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        clientHttpRequestFactory.setHttpClient(httpClient);
        return clientHttpRequestFactory;
    }
 
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setThreadNamePrefix("poolScheduler");
        scheduler.setPoolSize(5);
        return scheduler;
    }
    
    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfig() {
		
		String propertyfilePath = getServerHomeDirectory() + File.separator
				+ IPIMConstants.CMX_PROPERTIES;
		
		PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
		Resource propertyResource = new FileSystemResource(propertyfilePath);
		configurer.setLocation(propertyResource);
		return configurer;
		
    }
    
public static String getServerHomeDirectory() {
		
		String result = null;
		try {
			InitialContext context = getInitialContext();
			Context con = (Context) context.lookup(IPIMConstants.SIPERIAN);
			result = (String) con.lookup(IPIMConstants.SIPERIAN_HOME);
		} catch (NamingException e) {
		}
		return result;
	}
	
	protected static InitialContext getInitialContext() {
		
		InitialContext result = null;
		try {
			result = new InitialContext();
		} catch (NamingException e) {
			
		}
		return result;
	}
}
