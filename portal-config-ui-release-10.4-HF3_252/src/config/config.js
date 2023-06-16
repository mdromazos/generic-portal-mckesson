const CONFIG = {
    "PAGES": {
        "HOME": "LABEL_HOME",
        "GENERAL": "LABEL_PORTAL_SETTINGS",
        "CREATE_PORTAL": "LABEL_CREATE_PORTAL",
        "EDIT_PORTAL": "LABEL_EDIT_PORTAL",
        "EDIT_PORTAL_GENERAL": "LABEL_EDIT_PORTAL_GENERAL",
        "CREATE_PAGE": "LABEL_CREATE_PAGE",
        "EDIT_PAGE": "LABEL_EDIT_PAGE",
        "CREATE_RUNTIME_CONFIG":"LABEL_RUNTIME_CONFIG",
        "CREATE_SSO_CONFIG":"LABEL_SSO_CONFIG"
    },
    "CONSTANTS": {
        "NOTIFICATION_TIMEOUT": 5000,
        "AUTHORIZATION_ERROR_STATUS": 401,
		"PORTAL_DRAFT_ERROR":"PORTAL626"
    },
    "OBJECT_KEYS": {
        VERSION : "version",
    },
    "ICONS": {
        "PORTAL": process.env.PUBLIC_URL + "/icons/portal.svg",
        "PAGE": process.env.PUBLIC_URL + "/icons/pages.svg",
        "HELP": process.env.PUBLIC_URL + "/icons/help_globalnav.svg",
        "RUNTIME_CONFIGURATION": process.env.PUBLIC_URL + "/icons/runtime_environments.svg",
        "UP_AND_RUNNING": process.env.PUBLIC_URL + "/icons/up_and_running.svg",
        "STOPPED": process.env.PUBLIC_URL + "/icons/stopped.svg",
        "HOME": process.env.PUBLIC_URL + "/icons/home.svg",
        "ADD_BUTTON": process.env.PUBLIC_URL + "/icons/add_v2.svg"
    },
    "IMAGES": {
        "BRANDING": process.env.PUBLIC_URL + "/images/branding_Login_Image.png",
        "INFA_LOGO": process.env.PUBLIC_URL + "/images/infa-logo.svg"
    },
    "PORTAL_SETTINGS_PAGES": [
        "LOGIN",
        "SIGNUP",
        "STATES",
        "BRAND",
        "RUNTIME_CONFIGURATION"
    ],
    "ACTIONS": {
        "SET_PORTAL_CONFIGURATION": "SET_PORTAL_CONFIGURATION",
        "ADD_PAGE_SETTINGS": "ADD_PAGE_SETTINGS",
        "REMOVE_PAGE_SETTINGS": "REMOVE_PAGE_SETTINGS",
        "REMOVE_PORTAL_PAGE_SETTINGS": "REMOVE_PORTAL_PAGE_SETTINGS",
        "VIEW_PAGE_SETTINGS": "VIEW_PAGE_SETTINGS",
        "SET_CURRENT_PAGE_SETTINGS": "SET_CURRENT_PAGE_SETTINGS",
        "UPDATE_PAGE_SETTINGS": "UPDATE_PAGE_SETTINGS",
        "ADD_APP_NOTIFICATION": "ADD_APP_NOTIFICATION",
        "REMOVE_APP_NOTIFICATION": "REMOVE_APP_NOTIFICATION",
        "SET_USER_SETTINGS": "SET_USER_SETTINGS",
        "CREATE_PORTAL_CONFIG_MAP": "CREATE_PORTAL_CONFIG_MAP",
        "UPDATE_PORTAL_CONFIG_MAP": "UPDATE_PORTAL_CONFIG_MAP",
        "EDIT_GENERAL_SETTINGS_PAGE_STATUS":"EDIT_GENERAL_SETTINGS_PAGE_STATUS"
    },
    "PORTAL_STATES": {
        "PUBLISHED": "Published",
        "DRAFT": "Draft"
    },
    "NOTIFICATION_TYPE": {
        "SUCCESS": "success",
        "INFO": "info",
        "WARNING": "warning",
        "ERROR": "error"
    },
    "HEADERS": {
        "ORS": "X-INFA-ORS",
        "VERSION": "X-INFA-VERSION",
        "ICT":"ict",
        "ICT_CONFIG":"ict-config"
    },
    "PAGE_TYPE": {
        "CUSTOM": "Custom Page",
        "RECORD": "Record Page"
    },
    "PAGE_DESIGNER_TYPE": {
        "LAYOUT": "LAYOUT",
        "FORM": "FORM"
    },
    "MAX_HORIZONTAL_DISPLAY_PAGE_OPTIONS": [1, 2, 3],
    "MAX_HORIZONTAL_DISPLAY_SIGNUP_OPTIONS": [1,2],
    "NO_REDIRECT":"NO_REDIRECT",
    "NAV_LINK":"NAV_LINK",
    "URL_VALIDATION_REGEXP": /^(?:([a-z0-9+.-]+):\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/,
    "COMPONENTS": {
        "WIZARD": "WizardComponent",
        "EXTERNAL_LINK": "ExternalLink",
        "TWITTER_FEED": "TwitterComponent",
        "BE_FORM_COMPONENT": "BeFormComponent",
        "TEXT":"TextComponent",
        "P360_CATALOG": "Product360CatalogsComponent",
        "P360_CATALOG_UPLOAD": "Product360CatalogUploadComponent",
        "P360_CATALOG_TIMELINE":"Product360TimelineComponent",
        "P360_TASK_VIEW":"Product360TaskViewComponent"
    },
    "DISPLAY_HEIGHT_OPTIONS": {
        "FIT_TO_CONTENT": "FIT_TO_CONTENT",
        "CUSTOM": "CUSTOM"
    }, 
    "MOVE_ARROWS":{
        "UP" : -1,
        "DOWN" : 1
    },
    "DEFAULT_HEIGHT_CUSTOM" :90,
    "CONFIG_TYPES": {
        "BE_VIEW": "BEView"
    },
    "COMPONENTS_LIST": [
        {
            label: "LABEL_COMPONENT_WIZARD",
            type: "WizardComponent"
        },
        {
            label: "LABEL_COMPONENT_EXTERNAL_LINK",
            type: "ExternalLink"
        },
        {
            label: "LABEL_COMPONENT_PRODUCT_TIMELINE",
            type: "Product360TimelineComponent"
        },
        {
            label: "LABEL_COMPONENT_PRODUCT_TASK_VIEW",
            type: "Product360TaskViewComponent"
        },
        {
            label: "LABEL_COMPONENT_PRODUCT_CATALOG",
            type: "Product360CatalogsComponent"
        },
        {
            label: "LABEL_COMPONENT_PRODUCT_CATALOG_UPLOAD",
            type: "Product360CatalogUploadComponent"
        },
        {
            label: "LABEL_COMPONENT_TWITTER",
            type: "TwitterComponent"
        },
        {
            label: "LABEL_COMPONENT_TEXT",
            type: "TextComponent"
        }
    ],
    "WIZARD_OPERATIONS": {
        "UPDATE_WIZARD_DATA": "UPDATE_WIZARD_DATA",
        "ADD_STEP": "ADD_STEP",
        "DELETE_STEP": "DELETE_STEP",
        "UPDATE_BEV_NAME": "UPDATE_BEV_NAME",
        "TOGGLE_SHOW_OVERVIEW": "TOGGLE_SHOW_OVERVIEW",
        "TOGGLE_TASK_ASSOCIATION": "TOGGLE_TASK_ASSOCIATION",
        "SHIFT_STEP_LEFT": "SHIFT_STEP_LEFT",
        "SHIFT_STEP_RIGHT": "SHIFT_STEP_RIGHT"
    },
    "FILE_TYPE":{
        "JSON":"json",
        "ZIP_FILE":"application/zip",
        "BLOB":"blob",
        "ZIP":"zip",
        "XML": "xml",
        "XML_FILE": "text/xml"
    },
    "LOCALIZATION_BUNDLE_MENU":{
        "TITLE": "PORTAL_USER_ACTION_LOCALIZATION",
        "SUBMENU":{
            "IMPORT_LANGUAGE": "PORTAL_IMPORT_LANGUAGE_BUNDLE",
            "EXPORT_LANGUAGE": "PORTAL_EXPORT_LANGUAGE_BUNDLE"
        }
    },
    "USER_MANAGEMENT_FIELD_MAPPING":[
        {
            name:"LABEL_TABLE_USER_ROLE",
            id:"userManagement.fieldMapping.userRole",
            manyRowId:"userManagement.fieldMapping.manyRowId.userRole"
        },
       
        {
            name: "LABEL_TABLE_USER_NAME",
            id: "userManagement.fieldMapping.username",
            manyRowId: "userManagement.fieldMapping.manyRowId.username"
        },
        {
            name: "LABEL_TABLE_EMAIL",
            id: "userManagement.fieldMapping.email",
            manyRowId: "userManagement.fieldMapping.manyRowId.email"
        },
        {
            name: "LABEL_TABLE_FIRST_NAME",
            id: "userManagement.fieldMapping.firstName",
            manyRowId: "userManagement.fieldMapping.manyRowId.firstName"
        },
        {
            name: "LABEL_TABLE_LAST_NAME",
            id: "userManagement.fieldMapping.lastName",
            manyRowId: "userManagement.fieldMapping.manyRowId.lastName"
        }
    ],
    "FILE_OPERATIONS":{
        "FILE": "file",
        "PORTAL_NAME": "portalName",
        "IS_PORTAL_EXISTS": "isExistingPortal",
        "SYSTEM_NAME": "systemName",
        "PORTAL_ID": "portalId",
        "IS_EXTERNAL_USER_MANAGEMENT_ENABLED": "isExternalUserManagementEnabled"
    },
    "EXTERNAL_LINK_PARAMS": {
        "PARAMETERS": "params",
        "BE_NAME_PARAM": "beName",
        "ROW_ID_PARAM": "rowId"
    },
    "DATA_TYPES": {
        "STRING": "String",
        "INTEGER": "Integer",
        "OBJECT":"object"
    },
    "PORTAL_STATUS": {
        "RUNNING" : "Running",
        "STOPPED" : "Stopped",
        "INVALID" : "Invalid"
    },
    "PORTAL_STATUS_ACTION": {
        "START": "Start",
        "STOP": "Stop"
    },
    "DROPDOWN_OPTIONS":{
        "TEXT":"text",
        "VALUE": "value"
    },
    "PORTAL_ACTION_STATES":{
        "DELETE": "PORTAL_DELETE",
        "FORCE_DELETE": "PORTAL_FORCE_DELETE",
        "DISCARD_DRAFT": "PORTAL_DISCARD_DRAFT"
    },
    "PORTAL_USER_ACTION": {
        "EDIT" : "PORTAL_USER_ACTION_EDIT",
        "EXPORT" : "PORTAL_USER_ACTION_EXPORT",
        "COPY_URL" : "PORTAL_USER_ACTION_COPY_URL",
        "START" : "PORTAL_USER_ACTION_START",
        "STOP" : "PORTAL_USER_ACTION_STOP",
        "RUNTIME_CONFIG" : "PORTAL_USER_ACTION_RUNTIME_CONFIG",
        "DISCARD_DRAFT" :"PORTAL_USER_ACTION_DISCARD_DRAFT",
        "DELETE" : "PORTAL_USER_ACTION_DELETE",
        'SSO_CONFIG': "LABEL_SSO_CONFIG"
    },
    "SECTION_NAME": 'SECTION_NAME',
    "HIDE_SECTION_NAME": 'HIDE_SECTION_NAME',
    "BE_FORM_FIELDS": 'BE_FORM_FIELDS',
    "USERNAME" : 'username',
    "PRODUCT_360_ROW_ID":"LABEL_ROW_ID_OBJECT",
    "HELP_URL": "https://www4.informatica.com/onlinehelp/default.aspx?product=portalconfig&ver=104HF3&lang=en",
    'RUNTIME_PASSWORD_SECTION': 'Password Section'
};
export { CONFIG as default }
