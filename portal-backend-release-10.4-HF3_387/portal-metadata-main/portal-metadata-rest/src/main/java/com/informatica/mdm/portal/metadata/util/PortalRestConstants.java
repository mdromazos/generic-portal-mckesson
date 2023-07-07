package com.informatica.mdm.portal.metadata.util;

public class PortalRestConstants {
	
	public static final String MDM_SESSION_ID_COOKIE = "mdmsessionid";
	
	//Needs to Be worked on 
	public static final String CONFIG_UI_COOKIE = "mdmsessionid";
	public static final String CONFIG_UI_LOCAL_COOKIE = "selectedLocale";
	
	//Needs to be worked on
	public static final String PORTAL_UI_COOKIE = "portalsessionid";
	public static final String PORTAL_UI_PROVIDER = "portalprovider";
	
	//Needs to be worked on
	public static final String CONFIG_UI_PATH = "/";
	
	//Needs to be worked on
	public static final String PORTAL_UI_PATH = "/";
	public static final String PORTAL_UI_CONTEXT = "portal-ui";
	
	
	public static final String USERNAME = "username";
	public static final String PASSWORD = "password";
	public static final String MDM_SESSION_ID_COOKIE_PATH = "/";
	public static final String COOKIE_HTTP_SET_METHOD = "setHttpOnly";
	public static final String PAYLOAD_MDM_SESSION = "mdm.session.id||";
	public static final String[] CLASSPATH_RESOURCE_LOCATIONS = {"classpath:/public/docs/"};
	public static final String CONFIG_LOGIN_MAPPING_URL = "/config/login/**";
	public static final String CONFIG_LOGOUT_MAPPING_URL = "/config/logout/**";
	public static final String CONFIG_UI_LOGOUT = "/infa-portal/config/logout";
	public static final String CONFIG_SESSION_MAPPING_URL = "/config/session/**";
	public static final String ERROR_MAPPING_URL = "/error/**";
	public static final String REST_DOC_MAPPING_URL = "/restdocs/**";
	public static final String GLOBAL_CONFIG_MAPPING_URL = "/global/**";
	public static final String PORTALS = "/portals/**";
	public static final String CONFIG_UI = "/config/**";
	public static final String PORTAL_LOGIN_MAPPING_URL = "/portals/login/**";
	public static final String PORTAL_LOGOUT_MAPPING_URL = "/portals/logout/**";
	public static final String PORTAL_SESSION_MAPPING_URL = "/portals/session/**";
	
	public static final String PUBLISH_URI_REGEX = "/infa-portal/config/portals/"+"\\d+";
	public static final String REFERENCE_URI_REGEX = "/infa-portal/config/reference/portals/"+"[a-zA-Z]+[a-zA-Z_0-9]*";
	
	public static final String PORTAL_URI = "/infa-portal/portals";
	public static final String PORTAL_CONFIG_URI_DEPRECATED = "/infa-portal/config/portals";
	public static final String PORTAL_CONFIG_URI_ROLES = "/infa-portal/config/roles";
	public static final String BE_LOOKUP_URI = "/infa-portal/config/entity/"+"[a-zA-Z]+[a-zA-Z_0-9]*"+"/view";
	public static final String PORTAL_CONFIG_URI = "/infa-portal/config/";
	public static final String PORTAL_UI_URI = "/infa-portal/";
	public static final String GLOBAL_CONFIG_URI = "/infa-portal/global";
	public static final String DATABASE_URI = "/infa-portal/config/databases";
	
	public static final String HEADER_ATTRIBUTE_ORS_ID = "X-INFA-ORS";
	public static final String HEADER_ATTRIBUTE_PORTAL_VERSION = "X-INFA-VERSION";
	public static final String HEADER_ATTRIBUTE_PORTAL_ID = "X-INFA-PORTALID";
	
	public final static String ITEM = "item";
	public final static String DOT = "\\.";
	public final static String ROWID_OBJECT = "rowidObject";
	public final static String RECORD_ID= "recordId";
	public final static String RECORD_IDS= "recordIds";
	public final static String CMX_CS_URL = "/cmx/cs/";
	public final static String COLON = ":";
	public final static String PROTOCOL_SEPARATOR = "://";
	public final static String SEARCH_BE_URL = "%s/cmx/cs/%s/%s.json?action=query&recordStates=ACTIVE,PENDING&recordsToReturn=100&returnTotal=true&filter=%s='%s'%s";
	public final static String AND = "&";
	public final static String EQUALS = "=";
	public final static String CHILDREN = "children";
	public final static String DEPTH = "depth";
	public final static String COMA = ",";
	public final static String MDM_LOGIN_URL = "%s/cmx/auth";
	public final static String MDM_SESSION_URL = "%s/cmx/session/%s";
	public final static String BE_PATH_STATE_NAME =  "BEPathState";
	public final static String BE_PATH_ROLE_NAME =  "BEPathRole";
	public final static String BE_PATH_PORTAL_ASSC =  "BEPathPortalAssociation";
	public final static String ROLE_CODE =  "roleCode";
	public final static String STATUS_CODE =  "partyStatusValue";
	public static final String PORTAL_SESSION_ATTRIB = "portalSessionAttributes";
	public static final String USER_SESSION_ATTRIB ="UserSessionAttributes";
	public static final String PORTAL_PROXY_URL = "/proxy/**";
	public static final String PORTAL_PROXY_HEADER_ATTRIBUTE = "headers";
	public static final String PORTAL_PROXY_METHOD_ATTIBUTE = "httpMethod";
	public static final String PORTAL_PROXY_URL_ATTIBUTE = "apiUrl";
	public static final String PORTAL_PROXY_RECORD_ATTIBUTE = "proxyAttribute";
	public static final String PORTAL_PROXY_REST_ATTIBUTE = "restType";
	public static final String PORTAL_PROXY_PAYLOAD_ATTIBUTE = "payload";
	public static final String SESSION_VALIDATE_ACTION = "validate";
	public static final String SESSION_REFRESH_ACTION = "refresh";
	public static final String SESSION_LOGOUT_ACTION = "logout";
	
	public static final String RUNTIME_CONFIG_URI_REGEX = "/infa-portal/config/portals/"+"\\d+/runtime";
	public static final String RUNTIME_CONFIG_URI = "/infa-portal/runtime";
	public static final String RUNTIME_URI = "/runtime/**";
	public static final String NAME_ID = "samlNameId";
    public static final String SAML_URI = "/sso/**";
	public static final String SAML_CONFIG_URI = "/infa-portal/sso";
	public static final String EXPORT_URI = "/infa-portal/config/portals/"+"\\d+/export";
	public static final String IMPORT_URI = "/infa-portal/config/portals/import";
	public static final String BUNDLES_URI = "/infa-portal/config/portals/"+"\\d+/bundles";
	public static final String PORTAL_STATUS_URI = "/infa-portal/config/portals/"+"\\d+/status";
	public static final String PORTAL_STATE_URI = "/infa-portal/config/portals/"+"\\d+/state";
	public static final String FILE_NAME = "%s_%s.%s";
	public static final String ZIP_EXT = "zip";
	public static final String XML_EXT = "xml";
	public static final String ROLE_APP_ADMIN = "ROLE.ApplicationAdministrator";
	public static final String ROLE_ADMIN = "ROLE.Administrator";
	public static final String BUNDLES = "bundles";
	public static final String LOCALE = "locale";
	public static final String ADD_USERS_URI = "/infa-portal/portals/entities/"+"[a-zA-Z]+[a-zA-Z_0-9]*"+"/users";
	public static final String UPDATE_STATE_URI = "/infa-portal/portals/state/"+"\\d+";
	
	public static final String SESSION_TIMEOUT = "sessionTimeout";
	public final static String BE_RECORD_COUNT_ATTRIBUTE =  "recordCount";
	
	public final static String HUB = "hub";
	public final static String SESSION_TO_REGISTER = "mdm.session.to.register";
	public final static String MDM_CSRF_TOKEN_HEADER = "ICT";
	public final static String MDM_CSRF_TOKEN_UI = "ict-ui";
	public final static String MDM_CSRF_TOKEN_CONFIG = "ict-config";

    public static final String DEFAUT_PORTAL_LOGIN_URL = "%s/portal-ui/%s/%s/login";
	public static final String SAML_RESPONSE = "SAMLResponse";
	public static final String SAML_NAMEID = "NameID";

	public static final String RUNTIME_PORTAL_ADMIN_FILTER = "{\"name\":\"Portal Administrator User\"}";
	public static final String RUNTIME_SESSION_FILTER = "{\"name\":\"Session Section\"}";
	public static final String PORTAL_UI_COOKIE_EMAIL = "email";
	public static final String PORTAL_UI_COOKIE_USERNAME = "username";
	public static final String PORTAL_UI_COOKIE_STATE = "state";
	public static final String PORTAL_UI_COOKIE_ROWID = "rowId";
	public static final String PORTAL_UI_COOKIE_ROWIDS = "rowIds";
	public static final String PORTAL_UI_COOKIE_ROLE = "role";
	public static final String PORTAL_UI_COOKIE_ORS = "orsId";
    public static final String PORTAL_SHELL_URL = "%s/portal-ui/%s/%s/shell";

    public static final String USER_PREFERENCE_URI = "/infa-portal/portals/preferences/users/"+"[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]*"+"/";
	
	public static final String PORTAL_UI_FILE = "fileupload";


}
