import CONFIG from "../config/config";
import { useTranslation } from "react-i18next";

const hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
    } : null;
};

const setCookie = (key, value) => {
    document.cookie = key + "=" + value;
};

const getCookie = (key) => {
    let regExp = "\\b"+key+"=([^;]*)\\b";
    return document.cookie.match(regExp) ? document.cookie.match(regExp)[1] : "" ;
};

const deleteCookie = (key) => {
    document.cookie = key+"= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
}

const getPortalConfigMapKey = (databaseId, portalId) => (
    databaseId + "__" + portalId
);

const generateViewId = (pageType,databaseId, portalId, pageId) => {

    const { PAGES } = CONFIG;
    let viewId = "";

    switch (pageType) {
        case PAGES.CREATE_PORTAL:
            viewId = PAGES.CREATE_PORTAL;
            break;
        case PAGES.EDIT_PORTAL:
            viewId = `${PAGES.EDIT_PORTAL}_${databaseId}_${portalId}`;
            break;
        case PAGES.CREATE_PAGE:
            viewId = `${PAGES.EDIT_PORTAL}_${databaseId}_${portalId}_${PAGES.CREATE_PAGE}`;
            break;
        case PAGES.EDIT_PAGE:
            viewId = `${PAGES.EDIT_PORTAL}_${databaseId}_${portalId}_${PAGES.EDIT_PAGE}_${pageId}`;
            break;
        case PAGES.CREATE_RUNTIME_CONFIG:
            viewId = `${PAGES.CREATE_RUNTIME_CONFIG}_${databaseId}_${portalId}`;
            break;
        case PAGES.CREATE_SSO_CONFIG:
            viewId = `${PAGES.CREATE_SSO_CONFIG}_${databaseId}_${portalId}`;
            break;            
        default:
            break;
    }
    return viewId;
};

const getPageSetting = (id, pageSettingsContext) => {
    return pageSettingsContext.filter(page => page.id === id);
};

const getDefaultHeaders = () => {
    return {
        "headers": {
            "Content-Type": "application/json"
        }
    };
};

const getPageTypeOptions = () => {
    const { PAGE_TYPE } = CONFIG;
    const { t: translate } = useTranslation();
    return [
        {
            text: translate('LABEL_CUSTOM_PAGE'),
            value: PAGE_TYPE.CUSTOM
        },
        {
            text: translate('LABEL_RECORD_PAGE'),
            value: PAGE_TYPE.RECORD
        }
    ]                
};

const getMaxNumberOfHorizontalDisplayOptions = (MAX_HORIZONTAL_DISPLAY_OPTIONS) => {
     
    let optionList = MAX_HORIZONTAL_DISPLAY_OPTIONS.map(option => {
        return { text: `${option}`, value: option }
    });
    
    return optionList;   
};

/**
 * 
 * @param {Object} obj 
 * @returns Array of keys
 */

function objectDeepKeys(obj){
    return Object.keys(obj)
      .filter(key => obj[key] instanceof Object)
      .map(key => objectDeepKeys(obj[key]).map(k => `${key}.${k}`))
      .reduce((x, y) => x.concat(y), Object.keys(obj))
};


/**
 * 
 * @param {Object} formikProps 
 * @param {Array of Objects} selectedItems 
 * @param {String} name 
 */
const handleMultiSelectDropdownChange = (formikProps, selectedItems, name) => {
    const selectedItem = [...selectedItems].map((selectedItem) => selectedItem.value);
    formikProps.setFieldValue(name, [...new Set(selectedItem)])
}

/** Custom functions which are passed to form control or element */
const handleBlur = (formikProps, name) => formikProps.setFieldTouched(name, true);
const handleChange = (formikProps, name, value) => formikProps.setFieldValue(name, value);


 const checkIfFilesAreCorrectType = function(files) {
    let valid = true;
    if (!["application/x-zip-compressed", "application/zip"].includes(files.type)) {
          valid = false;
    }
    return valid;
};

const checkIfFilesIsXML = function(files) {
    let valid = true;
    if (!["text/xml"].includes(files.type)) {
        valid = false;
    }
    return valid;
};

export {
    hexToRgb,
    setCookie,
    getCookie,
    deleteCookie,
    getPortalConfigMapKey,
    generateViewId,
    getPageSetting,
    getDefaultHeaders,
    getPageTypeOptions,
    getMaxNumberOfHorizontalDisplayOptions,
    handleMultiSelectDropdownChange,
    handleBlur,
    handleChange,
    objectDeepKeys,
    checkIfFilesAreCorrectType,
    checkIfFilesIsXML,
};
