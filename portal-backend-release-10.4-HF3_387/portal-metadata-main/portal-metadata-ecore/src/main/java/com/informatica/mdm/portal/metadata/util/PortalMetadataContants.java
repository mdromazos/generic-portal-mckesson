package com.informatica.mdm.portal.metadata.util;

public class PortalMetadataContants {

    public static final String NS_URI = "http://www.informatica.com/mdm/config/model/v1";
	public static final String CORE_ECORE_MODEL = "ecore/ui-config-metadata_v1.ecore";
	
	public static final String REFERENCE_DATA_PATH = "models/*.json";
	public static final String RUNTIME_CONFIG_PATH = "models/runtime/runtime-config.json";
	public static final String SAML_CONFIG_PATH = "models/runtime/saml-config.json";
	public static final String META_ECLASS_STRING = "eClass";
    public static final String ECLASS_STRING = "EString";
    public static final String ECLASS_BOOLEAN = "EBoolean";
    public static final String ECLASS_DATE = "EDate";
    public static final String ECLASS_INTEGER = "EInt";
    public static final String ECLASS_REFERENCE = "EReference";
    public static final String ECLASS_ELIST = "BasicEList";

    public static final String ROOT_ECLASS = "Application";
    public static final String PORTAL_ECLASS = "Portal";
    public static final String HEADER_ECLASS = "Header";
    public static final String FOOTER_ECLASS = "Footer";
    public static final String LOGIN_ECLASS = "Login";
    public static final String SIGNUP_ECLASS = "Signup";
    public static final String PAGE_ECLASS = "Page";
    public static final String STATE_ECLASS = "State";
    public static final String SECTION_ECLASS = "LayoutSection";
    public static final String COMPONENT_ECLASS = "Component";
    public static final String COMPONENT_TYPE = "componentType";
    public static final String METADATA_ATTRIBUTE = "metadata";

    public static final String HEADER_ATTRIBUTE = "header";
    public static final String FOOTER_ATTRIBUTE = "footer";
    public static final String LOGIN_ATTRIBUTE = "login";
    public static final String SIGNUP_ATTRIBUTE = "signup";
    public static final String FIELDMAPPING_ATTRIBUTE = "fieldMapping";
    public static final String USER_MANAGEMENT_ATTRIBUTE = "userManagement";
    public static final String IS_EXTERNAL_USER_MANAGEMENT_ENABLED = "isExternalUserManagementEnabled";
    public static final String DISABLE_SIGNUP = "disableSignup";
    public static final String EXTERNAL_USER = "externalUser";
    public static final String PASSWORD = "password";
    public static final String USER_DATA = "userData";
    public static final String PAGE_ATTRIBUTE = "pages";
    public static final String ID_ATTRIBUTE = "id";
    public static final String KEY_ATTRIBUTE = "key";
    public static final String VALUE_ATTRIBUTE = "value";
    public static final String PAGE_NAME_ATTRIBUTE = "name";
    public static final String STATE_ATTRIBUTE = "states";
    public static final String PORTAL_ATTRIBUTE = "portals";
    public static final String TITLE_ATTRIBUTE = "title";
    public static final String CONTAINER_ATTRIBUTE = "containers";
    public static final String SECTION_ATTRIBUTE = "sections";
    public static final String COMPONENT_ATTRIBUTE = "components";
    public static final String WELCOME_TEXT_ATTRIBUTE  = "welcomeText";
    public static final String FOOTER_TEXT_ATTRIBUTE = "footerText";
    public static final String IDENTITY_PROVIDER_METADATA_PROPERTIES = "IDP_METADATA";
    public static final String CODE_ATTRIBUTE = "code";
    public static final String LABEL_ATTRIBUTE = "label";
    public static final String FIELD_MAPPING_USER_NAME = "userName";
    public static final String FIELD_MAPPING_USER_STATE = "userState";
    public static final String FIELD_MAPPING_USER_ROLE = "userRole";
    public static final String FIELD_MAPPING_PORTAL_ASSC_FIELD = "portalAssociation";
    public static final String RUNTIME_CONFIG_NAME_ATTRIBUTE = "name";
    public static final String SSO_IDP_KEY_ENTITY_ID = "EntityID";
    public static final String SINGLE_SIGNON_SERVICE_URL_REDIRECT = "SingleSignOnServiceURLRedirect";
    public static final String SINGLE_SIGNON_SERVICE_URL_POST = "SingleSignOnServiceURLPOST";
    public static final String SINGLE_LOGOUT_SERVICE_URL_REDIRECT= "SingleLogoutServiceURLRedirect";
    public static final String SINGLE_LOGOUT_SERVICE_URL_POST = "SingleLogoutServiceURLPOST";
    public static final String CERTIFICATE = "Certificate";
    public static final String BINDING_TYPE = "BindingType";
    public static final String HTTP_REDIRECT = "HTTP-Redirect";
    public static final String EMPTY_STRING ="";
    public static final String OVERVIEW_TITLE = "overviewTitle";
    public static final String OVERVIEW_BODY = "overviewBody";
    public static final String OVERVIEW_HEADING = "overviewHeading";
    public static final String HEADING = "heading";
    public static final String BODY = "body";
    public static final String SECTION_HEADING = "sectionHeading";
    
    public static final String BE_FORM_SECTIONS_ATTRIBUTE = "beFormSections";
    public static final String BE_FORM_COMPONENT_ATTRIBUTE = "beFormComponent";
    public static final String BE_FORM_FIELDS_ATTRIBUTE = "beFormFields";
    public static final String PORTAL_STATUS_ATTRIBUTE = "status";
    public static final String PORTAL_STATUS_START = "Running";
    public static final String PORTAL_STATUS_STOP = "Stopped";
    public static final String PORTAL_STATUS_INVALID = "Invalid";
    public static final String PORTAL_STATUS_START_ACTION = "Start";
    public static final String PORTAL_STATUS_STOP_ACTION = "Stop";
    
    public static final String PATH_VALIDATE_WITH_ID = "portal with id";
    public static final String PATH_VALIDATE_WITHOUT_ID = "portal without id";

    public static final String PORTAL_ID = "portalId";
	public static final String PORTAL_NAME = "portalName";
	public static final String PORTAL_TITLE = "portalTitle";
	public static final String GENERAL_SETTINGS = "generalSettings";
	public static final String PORTAL_SOURCE_SYSTEM_NAME = "sourceSystem";
	public static final String PORTAL_BE_NAME = "beName";
	public static final String PORTAL_VERSION = "version";
	public static final String PORTAL_METAMODEL_VERSION = "metamodelVersion";
	public static final String PORTAL_BASE_VERSION = "baseVersion";
	public static final String PORTAL_STATE_ATTRIBUTE = "isDraft";
    public static final String PORTAL_SSO_CONFIGURATION = "ssoConfiguration";
    public static final String PORTAL_SSO_ATTRIBUTE = "hasSSO";
	public static final String PORTAL_PUBLISHED_ATTRIBUTE = "hasPublished";
	public static final String PORTAL_PUBLISHED_STATE = "Published";
	public static final String PORTAL_DISCARD_ACTION = "Discard";
	public static final String PORTAL_FORCE_DELETE_ACTION = "ForceDelete";
	public static final String DATABASE = "database";
	public static final String DATABASE_ID = "databaseId";
	public static final String NAVIGATION_TYPE = "navigationType";
	public static final String STATE_ENABLED = "isStateEnabled";
	public static final String ORS_ID = "orsId";
	public static final String DATABASE_LABEL = "label";
	public static final String LAST_UPDATED_DATE = "lastUpdatedDate";
	public static final String LAST_UPDATED_BY = "lastUpdatedBy";
	public static final String CREATED_DATE = "createdDate";
	public static final String CREATED_BY = "createdBy";
	public static final String CONFIGURATION = "configuration";
	public static final String PORTAL_STATE_DRAFT = "Draft";
	public static final String PORTAL_USER_STATE = "userState";
	public static final String PORTAL_BE_VIEW_NAME = "bevName";
	public static final String PORTAL_ASSC_FIELD = "portalAssociation";
	
	public static final String URI_PATH_DELIMITER = "\\.";
	public static final String URI_PATH_LIST_DELIMITER_BEGIN = "(";
	public static final String URI_PATH_LIST_DELIMITER_END = ")";
	
	
	public static final String AUTHENTICATION_USER_NAME = "username";
	
	public static final String USER_DISPLAY_NAME = "displayName";
	public static final String AUTHENTICATION_EMAIL = "email";
	
	public static final String PORTAL_ROLE_NAME = "roleName";
	
	public static final Integer BASE_VERSION_COUNTER = 0;
	
	public static final String DEFAULT_VALUE_ORDER = "order";
	
	public static final String PORTAL_CONFIG_URI_PUBLISH_ACTION = "publish";
	
	public static final String PORTAL_CONFIG_URI_ACTION_PARAM = "action";
	
	
	public static final String DATE_FORMAT = "dd MMM yyyy HH:mm:ss zzz";

    public static final String USER_PREFERENCE_PORTAL_APPLICATION_TYPE = "Portal";

	
	public static final String SORT_ORDER_DESC = "DESC";
	public final static String COLON = ":";
	public final static String PROTOCOL_SEPARATOR = "://";
	public static final String BE_META_URL = "%s/cmx/cs/%s/meta/entity.json?recordsToReturn=100";
	public static final String MDM_SESSION_ID = "mdmsessionid";
	public final static String ITEM = "item";
	public final static String BE_NAME = "beName";
	public final static String CONFIG_TEMPLATE_LOGIN_SEC_RESET = "resetPasswordEmailTemplate";
	public final static String CONFIG_TEMPLATE_LOGIN_SEC_RESET_SUCCESS = "resetPasswordEmailSuccessTemplate";		
	public final static String CONFIG_TEMPLATE_USER_MGMT_SEC_INVITE= "inviteEmailTemplate";
	public final static String CONFIG_TEMPLATE_USER_MGMT_SEC_RESET_SUCCESS = "resetPasswordEmailSuccessTemplate";
	public final static String CONFIG_TEMPLATE_SIGN_UP_REGISTRATION = "registrationEmailTemplate";
	public final static String CONFIG_USER_MGMT_USE_EMAIL_AS_UNAME = "hasSameEmailAndUsername";
	public final static String EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD = "loginResetPassword";
	public final static String EMAIL_TEMPLATE_LOGIN_RESET_PASSWORD_SUCCESS = "LoginResetPasswordSuccess";
	public final static String EMAIL_TEMPLATE_USER_MGMT_INVITATION = "UserMgmtEmailInvite";
	public final static String EMAIL_TEMPLATE_USER_MGMT_RESET_PASSWORD_SUCCESS = "UserMgmtResetPasswordSuccess";
	public final static String EMAIL_TEMPLATE_SIGNUP_REGISTRATION = "SignupRegistration";
	public final static String RESET_PWD_TEMPLATE = "resetPassword";
	public final static String RESET_PWD_SUCCESS_TEMPLATE= "resetPasswordSuccessful";
	public final static String INVITE_USER_TEMPLATE = "setPassword";
	public final static String INVITE_USER_SUCCESS_TEMPLATE= "setPasswordSuccessful";
	
	public static final String SERVICE_PROVIDER_METADATA_PROPERTIES = "SP_METADATA";
	public static final String SSO_SP_KEY_ENTITY_ID = "EntityID";
	public static final String SSO_SP_KEY_ACSURL = "AssertionConsumerServiceURL";
    public static final String GENERAL_PROPERTIES_METADATA_PROPERTIES = "GENERAL_PROPERTIES";
    public static final String SSO_GP_KEY_SAMLREDIRECTURL = "SAMLRedirectURL";
}
