const CONFIG = {
    
    "ICONS": {
        "PORTAL": process.env.PUBLIC_URL+ "/icons/portal.svg",
        "PAGE": process.env.PUBLIC_URL+ "/icons/pages.svg",
        "HELP": process.env.PUBLIC_URL+ "/icons/help.svg",
        "SEARCH": process.env.PUBLIC_URL + "/icons/search.svg",
        "PROFILE": process.env.PUBLIC_URL + "/icons/profile.svg",
        "STEP_HOME": process.env.PUBLIC_URL + "/icons/home.svg",
        "FILE_UPLOAD": process.env.PUBLIC_URL + "/icons/file_upload.svg",
        "SSO_LOGIN": process.env.PUBLIC_URL + "/icons/sso_login.svg"
    },
    "IMAGES" : {
        "PAGE_NOT_FOUND": process.env.PUBLIC_URL + "/images/pageNotFound.svg",
        "DEFAULT": process.env.PUBLIC_URL + "/images/logo.svg",
        "ALERT": process.env.PUBLIC_URL + "/icons/alert.svg",
        "VIEW_COMMENTS": process.env.PUBLIC_URL + "/icons/comments.svg",
        "VIEW_COMMENTS_NEW": process.env.PUBLIC_URL + "/icons/comments_new.svg",
        "ERROR_404": process.env.PUBLIC_URL + "/images/error404.png"
    },
    "CONSTANTS": {
        "NOTIFICATION_TIMEOUT": 5000,
        "NOTIFICATION_ERROR": "error",
        "NOTIFICATION_SUCCESS": "success",
        "NOTIFICATION_INFO": "info",
        "STOPPED": "Stopped",
        "INVALID" : "Invalid",
        "COMMENT_MAX_LEN": 500
    },
    "COMPONENT_TYPE": {
        "BE_FORM": "BeFormComponent",
        "WIZARD": "WizardComponent",
        "EXTERNAL_LINK":"ExternalLink",
        "TWITTER_FEED": "TwitterComponent",
        "TEXT":"TextComponent",
        "P360_CATALOG": "Product360CatalogsComponent",
        "P360_CATALOG_UPLOAD": "Product360CatalogUploadComponent",
        "P360_CATALOG_TIMELINE": "Product360TimelineComponent",
        "P360_TASK_VIEW": "Product360TaskViewComponent"
    }, 
    "DISPLAY_HEIGHT_OPTIONS": {
        "FIT_TO_CONTENT": "FIT_TO_CONTENT",
        "CUSTOM": "CUSTOM"
    },
    "DEFAULT_HEIGHT_FIT_TO_CONTENT" :"100%",
    "TWITTER_SCRIPT":"https://platform.twitter.com/widgets.js",
    "LOOKUP_PROXY_PAYLOAD":{
        "API_URL": 'apiUrl',
        "REST_TYPE": 'restType',
        "HTTP_METHOD": "httpMethod",
        "PROXY_ATTRIBUTE": "proxyAttribute"
    },
    "HTTP_METHOD":{
        "GET":"GET",
        "POST":"POST",
        "PUT":"PUT",
        "DELETE":"DELETE",
        "PATCH":"PATCH"
    },
    "DEFAULT_FILENAME":"unknown",
    "PROXY_PAYLOAD":"payload",
    "INITIAL_VALUES":{
        "email": "",
        "password": ""
    },
    "PROJECTIONS":{},
    "LOGIN_SECTION":"Login Section",
    "PROJECTION_BE_ROLE":"BEPathRole",
    "PROJECTION_BE_STATE": "BEPathState",
    "LOOKUP_REL_TYPE":{
        "LOOKUP": "lookup",
        "LIST": "list"
    },
    "BE_ROW_ID" :"rowId",
    "USER_NAME" : "username", 
    "USER_ROLE" :"role",
    "PORTAL_STATE":"state",
    "EMAIL":"email",
    "ORS_ID_HEADER":"orsId",
    "SIGN_UP_HEADER":"X-INFA-ORS",
    "SIGN_UP_PORTAL_HEADER":"X-INFA-PORTALID",
    "PORTAL_ID_HEADER":"X-INFA-PORTALID",
    "FIELD_PAYLOAD":{
        "EMAIL":"email",
        "ONBOARDING_STATUS":"Onboarding Status",
        "MAP_EMAIL_TO_USER_NAME":"hasSameEmailAndUsername"
    },
    "CONTACT_SECTION":{
        "SECTION_NAME":"Contacts",
        "FIRST_NAME":"frstNm",
        "LAST_NAME":"lstNm",
        "USER_ROLE":"prtlUsrRle",
        "USERNAME":"prtlUsrNm"
    },
    "BE_FORM_MODES": {
        "READ_EDIT": "READ_EDIT",
        "READ_ONLY": "READ_ONLY",
        "EDIT_ONLY": "EDIT_ONLY",
        "EDIT_READ": "EDIT_READ",
        "EDIT_AUTO_SAVE": "EDIT_AUTO_SAVE" 
    },
    "PASSWORD_POLICY":{
        "PASSWORD_SECTION":"Password Section",
        "PASSWORD_POLICY_KEY":"passwordPolicy"
    },
    "SESSION_POLICY":{
        "SESSION_SECTION":"Session Section",
        "SESSION_TIMEOUT":"session.timeout",
        "SESSION_WARNING":"session.timeout.warning",
        "SESSION_TIMEOUT_VALUE":"sessionTimeout",
        "SESSION_TIMEOUT_WARNING_VALUE":"sessionTimeoutWarning",
        "SESSION_TIMEOUT_INITIAL_VALUE":"sessionInitialValue",
        "SESSION_TIMEOUT_LOGIN_VALUE":"sessionTimeOut"
    },
    "UNIQUE_FIELD_PATH":"uniqueFieldPath",
    "RECORD_ID_FIELD":"recordIdField",
    "USER_MANAGEMENT_PATH": "users",
    "DATA_TYPE":{
        "OBJECT":"object"
    },
    "EXTERNAL_LINK_PARAMS": {
        "PARAMETERS": "params",
        "BE_NAME_PARAM": "beName",
        "ROW_ID_PARAM": "rowId"
    },
    "ORS_ID":"X-INFA-ORS",
    "CHANGE_PASSWORD":"changePassword",
    "CHECK_USER":{
        "EXISTING_USER":"resetPassword"
    },
    "LOGIN_FIELD_MAPPING": {
        "RECORD_ID": {
            "KEY": "recordIdField",
            "VALUE": "rowidObject"
        },
        "UNIQUE_FIELD_PATH": "uniqueFieldPath",
        "PROJECTIONS": {
            "PROJECTION_BE_ROLE": "BEPathRole",
            "PROJECTION_BE_STATE": "BEPathState",
            "PROJECTION_BE_PATH": "BEPathPortalAssociation",
        }
    },
    "REFERENCE_ENTITY":"LookupPortalUserRole",
    "PRODUCT_360_USER_TYPE": {
        "SUPPLIER_USER": "supplier_user",
        "PORTAL_ADMIN_USER": "portal_admin_user"
    },
    "LANGUAGE": "selectedLocale",
    "ENGLISH": "en",
    "BE_FIELDS": {
        "HUB_STATE_INDICATOR": "hubStateInd",
        "INTERACTION_ID": "interactionId",
    },
    "LOG_OUT":"LOG_OUT",
    "SIDENAV_ACTIVE":"selected",
    "LOCALE_CODES":{
        "EN":"en",
        "DE":"de",
        "ES":"es",
        "FR":"fr",
        "JA":"ja",
        "KO":"ko",
        "RU":"ru",
        "ZH_CN":"zh_CN",
        "PT_BR":"pt_BR"
    },
    "P360_LOCALE_CODES": {
        "EN": "en_US",
        "DE": "de_DE",
        "ES": "es_ES",
        "FR": "fr_FR",
        "JA": "ja_JP",
        "KO": "ko_KR",
        "RU":"ru_RU",
        "ZH_CN": "zh_CN",
        "PT_BR": "pt_BR"
    },
    "USER_CREATION_STATIC_SECTION":{
        "FIRST_NAME":"firstName",
        "LAST_NAME":"lastName",
        "USER_NAME":"userName",
        "EMAIL":"email",
        "JOB_TITLE":"jobTitle",
        "COUNTRY_CODE":"countryDialingCode",
        "PHONE_NUMBER":"phoneNumber"
    },
    "COMMENT": {
        "TYPE": {
            "MANDATORY": "MANDATORY",
            "OPTIONAL": "OPTIONAL",
            "AS_REQUIRED": "AS_REQUIRED"
        },
        "DETAILS": {
            "COMMENTS": "COMMENTS",
            "USER_NAME": "USER_NAME",
            "TIME": "TIME",
            "TIME_FORMAT": "HH:mm, DD MMM YYYY"
        },
        "SEPARATOR": {
            "LINE": "\n\n",
            "USER_TIME": " - "
        }
    },
    "TASK_DETAILS": {
        "TASK_ID": "taskId",
        "INTERACTION_ID": "interactionId",
        "TITLE": "title",
        "COMMENTS": "comments",
        "TASK_TYPE": "taskType",
        "ACTION": {
            "NAME": "name",
            "LABEL": "label",
            "MESSAGE": "message",
            "COMMENT": "comment",
        }
    },
    "CONTENT_TYPE": {
        "KEY": "Content-Type",
        "FILE_UPLAOD": "application/octet-stream"
    },
    "RECORD_STATE" : {
        "ACTIVE": "ACTIVE",
        "PENDING": "PENDING"
    },
    "PREFERENCE_TYPE": {
        "WIZARD_COMPLETED_STEPS": "WizardCompletedSteps",
    }
};
export { CONFIG as default }
