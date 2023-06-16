package com.informatica.mdm.solutions.pim.util;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;

import com.google.gwt.core.client.GWT;
import com.google.web.bindery.requestfactory.shared.RequestFactory;
import com.google.web.bindery.requestfactory.shared.RequestTransport;
import com.google.web.bindery.requestfactory.shared.ServerFailure;


class HttpPostRequestTransport implements RequestTransport {
  private final Map<String, String> requestHeaders;
  private final String url;
  private int                       lastResult;

  public HttpPostRequestTransport( String url, Locale hsxLocale ) {
    this.url = url;
    requestHeaders = new HashMap<String, String>();
    requestHeaders.put( "Accept-Language", hsxLocale.toString().replace( "_", "-" ) );
    requestHeaders.put( "Content-Type", RequestFactory.JSON_CONTENT_TYPE_UTF8 );
    requestHeaders.put( "X-GWT-Permutation", GWT.getPermutationStrongName() );
  }

  @Override
  public void send( String payload, TransportReceiver receiver ) {
    HttpPost post = new HttpPost( url );
    for( Entry<String, String> header : requestHeaders.entrySet() ) {
      post.setHeader( header.getKey(), header.getValue() );
    }
    post.setEntity( createPostEntity( payload ) );
    HttpResponse response = HttpUtil.executeAndReturnResponse( post );
    lastResult = response.getStatusLine().getStatusCode();
    handleResponse( receiver, response );
  }

  private StringEntity createPostEntity( String payload ) {
    try {
      return new StringEntity( payload, "application/json", "UTF-8" );
    } catch( UnsupportedEncodingException e ) {
      throw new RuntimeException( e );
    }
  }

  private void handleResponse( TransportReceiver receiver, HttpResponse response ) {
    if( lastResult == HttpServletResponse.SC_OK ) {
      receiver.onTransportSuccess( getContentAsString( response ) );
    } else {
      receiver.onTransportFailure( createServerFailure() );
    }
  }

  private ServerFailure createServerFailure() {
    return new ServerFailure( "Server error: " + lastResult, "", "", false );
  }

  public int getLastResult() {
    return lastResult;
  }

  public void setSessionCookie( String sessionCookie ) {
    requestHeaders.put( "Cookie", sessionCookie );
  }
  
  private static String getContentAsString( HttpResponse response ) {
    HttpEntity entity = response.getEntity();
    String result = null;
    try {
      String encoding = getContentEncoding( entity );
      result = IOUtils.toString( entity.getContent(), encoding );
    } catch( IOException e ) {
      throw new RuntimeException( e );
    }
    return result;
  }

  private static String getContentEncoding( HttpEntity entity ) {
    Header contentEncodingHeader = entity.getContentEncoding();
    String encoding = contentEncodingHeader != null
                                                   ? contentEncodingHeader.getValue()
                                                   : null;
    if( encoding == null && entity.getContentType() != null ) {
      String contentType = entity.getContentType().getValue();
      if( contentType.contains( "charset=" ) ) {
        encoding = contentType.substring( contentType.indexOf( "charset=" ) + 8 );
      }
    }
    return encoding;
  }  
}