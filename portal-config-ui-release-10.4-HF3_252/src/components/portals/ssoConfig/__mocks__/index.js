const ssoConfigurationWithQuickSetupGuide = {
    "SP_METADATA": {
       "name":"SAML Service provider metadata properties",
       "desc":"SAML Service provider metadata properties",
       "configuration":{
          "EntityID":{
             "key":"EntityID",
             "desc":"Used to communicate with SP and IDP",
             "value":"GENERIC_PORTAL_localhost-orcl-CMX_ORS_140038",
             "type":"String",
             "isMandatory":true
          },
          "SignAuthRequest":{
             "key":"SignAuthRequest",
             "desc":"Boolean attribute",
             "value":true,
             "type":"boolean",
             "isMandatory":true
          },
          "SignLogoutRequest":{
             "key":"SignLogoutRequest",
             "desc":"Boolean attribute",
             "label":"SignLogoutRequest",
             "value":true,
             "type":"boolean",
             "isMandatory":true
          },
          "AssertionConsumerServiceURL":{
             "key":"AssertionConsumerServiceURL",
             "desc":"End point to which SAML responses are to be sent by the IdP",
             "value":"http://localhost:8080/infa-portal/portals/login/saml/localhost-orcl-CMX_ORS/140038",
             "type":"String",
             "isMandatory":true
          }
       }
    },
    "IDP_METADATA":{
       "name":"SAML Identity provider metadata properties",
       "desc":"SAML Identity provider metadata properties",
       "configuration":{
          "EntityID":{
             "key":"EntityID",
             "desc":"Used to communicate with SP and IDP",
             "value":"http://www.okta.com/exku7ydqisZkTcfS45d6",
             "type":"String",
             "isMandatory":false
          },
          "SingleSignOnServiceURLRedirect":{
             "key":"SingleSignOnServiceURLRedirect",
             "desc":"Single SignOn Service URL Redirect",
             "value":"https://dev-25198609.okta.com/app/dev-25198609_portal_2/exku7ydqisZkTcfS45d6/sso/saml",
             "type":"String",
             "isMandatory":false
          },
          "SingleSignOnServiceURLPOST":{
             "key":"SingleSignOnServiceURLPOST",
             "desc":"Single SignOn Service URL POST",
             "value":"https://dev-25198609.okta.com/app/dev-25198609_portal_2/exku7ydqisZkTcfS45d6/sso/saml",
             "type":"String",
             "isMandatory":false
          },
          "SingleLogoutServiceURL":{
             "key":"SingleLogoutServiceURL",
             "desc":"Single Logout Service URL",
             "value":"",
             "type":"String",
             "isMandatory":false
          },
          "Certificate":{
             "key":"Certificate",
             "desc":"X509Certificate for IdP",
             "value":"MIIDqDCCApCgAwIBAgIGAXm+KCZ7MA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJVUzETMBEG\nA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU\nMBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi0yNTE5ODYwOTEcMBoGCSqGSIb3DQEJ\nARYNaW5mb0Bva3RhLmNvbTAeFw0yMTA1MzAxNjQxNTJaFw0zMTA1MzAxNjQyNTJaMIGUMQswCQYD\nVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsG\nA1UECgwET2t0YTEUMBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi0yNTE5ODYwOTEc\nMBoGCSqGSIb3DQEJARYNaW5mb0Bva3RhLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\nggEBAJHlw1Wu683G4gHLtOjjJQ+orkeYKnbjZiLsiFrqg+URTxa7mi5e+iejOsgcMe6S1DjS+QbB\nVYW71+bkt9lwSCMfH4MQOVhow1qUJ1ealFKrbIPJJh+AGaXqrdB5Ib03eLH4JMlZ9+4Z83XQya1x\ngenRmAGjRkplbpffJRcO4a3uveO5Jpu+FwCTlgfab8KZILhkNd3sSGgBcKWhPVxKuYW+Y418lQDK\nsh3Dj9yIBM7Byvt4ofKgOIsAdBMq3FMaj60mSI4rPbVyR8djDh2MDQJxUdtrcCZDiY/6CUfG4aLp\nccj0X71TwZKgfA96BgEAbVmnSlocxMsNBis/G+rZXc8CAwEAATANBgkqhkiG9w0BAQsFAAOCAQEA\nRCP8otQlc46gIjTVaGXdfKpk5XFYvr+0MfnDb4W1OYGKreZhUvAZ33anxxVXvsiXXn95yPH+FT++\nav/4F8DAlaB4cuhLnT9HDmj5hxauO54j9ipuxcfFZdDQT+HviiU9w7JqEfKw7Nq7ACkgSsho9cpp\nIv/4rjMtG+4Y6YNSGkRcHMUfvTA9UUvRHDahecbNygjnHOTlGWRymmGCA9GSoVonePHIRKQ8FNGP\nRCR4C0HLkuoOjOSWYz7UGe1FcpbhFk+5NjsMH1sCcLw6Io1oD+BrE+ud8adsBJoV4r2OHwxSvB+R\nypNi3x1zmqJVMJ8fdlZOJeSpnp8DrZ6jXABrtQ==",
             "type":"String",
             "isMandatory":false
          },
          "BindingType":{
             "key":"BindingType",
             "desc":"Single SignOn Service URL Binding Type",
             "value":"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
             "type":"String",
             "isMandatory":false
          }
       }
    },
    "GENERAL_PROPERTIES":{
       "name":"SAML General properties",
       "desc":"SAML General properties",
       "configuration":{
          "UserNameMapping":{
             "key":"UserNameMapping",
             "desc":"Portal UserName Mapping With IDP Attribute",
             "value":"NameID",
             "type":"String",
             "isMandatory":false
          },
          "QuickSetupGuide":{
             "desc":"Portal SSO Quick Setup Guide flag",
             "value": true,
             "type":"boolean"
          }
       }
    }
};

const ssoConfigurationWithOutQuickSetupGuide = {
    ...ssoConfigurationWithQuickSetupGuide,
    "GENERAL_PROPERTIES":{
       "name":"SAML General properties",
       "desc":"SAML General properties",
       "configuration":{
          "UserNameMapping":{
             "key":"UserNameMapping",
             "desc":"Portal UserName Mapping With IDP Attribute",
             "value":"NameID",
             "type":"String",
             "isMandatory":false
          },
          "QuickSetupGuide":{
             "desc":"Portal SSO Quick Setup Guide flag",
             "value": false,
             "type":"boolean"
          }
       }
    }
};

const match = {
    params: {
        databaseId: 'localhost-orcl-C360_ORS',
        portalId: 2
    }
};

export { ssoConfigurationWithQuickSetupGuide, ssoConfigurationWithOutQuickSetupGuide, match };