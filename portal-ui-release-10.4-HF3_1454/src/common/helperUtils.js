import CONFIG from "../config/config";
import APIService from '../utils/apiService';
import { URLMap } from "../utils/urlMappings";
import moment from "moment";

/**
 * Function used to giving out difference between form object representing
 * Formik value object and the initial post-BE load object
 * @param obj1
 * @param obj2
 * @returns {*}
 * @constructor
 */
export const Diff = function (obj1, obj2) {

    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
        return obj1;
    }

    let diffs = {};
    let key;

    let arraysMatch = function (arr1, arr2) {

        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;

    };

    let compare = function (item1, item2, key) {

        let type1 = Object.prototype.toString.call(item1);
        let type2 = Object.prototype.toString.call(item2);

        if (type2 === '[object Undefined]') {
            diffs[key] = null;
            return;
        }

        if (type1 !== type2) {
            diffs[key] = item2;
            return;
        }

        if (type1 === '[object Object]') {
            let objDiff = Diff(item1, item2);
            if (Object.keys(objDiff).length > 0) {
                diffs[key] = objDiff;
            }
            return;
        }

        if (type1 === '[object Array]') {
            if (!arraysMatch(item1, item2)) {
                diffs[key] = item2;
            }
            return;
        }

        if (type1 === '[object Function]') {
            if (item1.toString() !== item2.toString()) {
                diffs[key] = item2;
            }
        } else {
            if (item1 !== item2) {
                diffs[key] = item2;
            }
        }

    };

    for (key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            compare(obj1[key], obj2[key], key);
        }
    }

    for (key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (!obj1[key] && obj1[key] !== obj2[key]) {
                diffs[key] = obj2[key];
            }
        }
    }

    return diffs;
};

export const getHeight = ({ displayHeight, customHeight }, fitToContentHeight) => {
    return displayHeight === CONFIG.DISPLAY_HEIGHT_OPTIONS.FIT_TO_CONTENT ? fitToContentHeight : customHeight + "px";
};

export const getUserPreferenceIdBasedOnComponentId = (userPreference, componentId, componentTypeKey) => {
    for (const [key, value] of Object.entries(userPreference)) {
        if( value[componentTypeKey] === componentId) {
            return key;
        }
    }
    return null;
}


/**
 * BES CRUD requires the creation of $original object for update comparisons
 * @param diffObject
 * @param originalObject
 * @returns {{}}
 */
export const create$Original = function (diffObject, originalObject) {
    const obj = {};
    Object.keys(diffObject).forEach(function (value) {
        if (diffObject[value] === '') {
            diffObject[value] = null;
            obj[value] = originalObject[value];
            return;
        }

        if (diffObject[value] === null && originalObject[value]) {
            obj[value] = originalObject[value];
            return;
        }

        if (diffObject.hasOwnProperty(value) &&
            (originalObject[value] === false || originalObject[value] === true)) {
            obj[value] = originalObject[value];
            return;
        }

        if (diffObject[value]) {
            obj[value] = !originalObject[value] ? null : originalObject[value];
        }
    });
    return obj;
};

export const getLookupHandler = (match,lookupUrl) => {
    const { LOOKUP_PROXY_PAYLOAD: { API_URL, HTTP_METHOD, PROXY_ATTRIBUTE },
        HTTP_METHOD: { GET }, BE_ROW_ID, ORS_ID, PORTAL_ID_HEADER} = CONFIG;

    let lookUpUrl = new URL(lookupUrl);
    let payLoad = {};
    let {pathname, search} = lookUpUrl;
    payLoad[API_URL] = `${pathname + search}`;
    payLoad[HTTP_METHOD] = GET;
    payLoad[PROXY_ATTRIBUTE] = getCookie(BE_ROW_ID);
    return new Promise((resolve, reject) => {
        APIService.postRequest(URLMap.getProxy(),payLoad,
            (response) => {
                resolve(response);
            },
            (error) => {
                reject(error);
            },
            {
                [ORS_ID]: match.params.orsId,
                [PORTAL_ID_HEADER]: match.params.id
            }
            );
    });
};

export const getCookie = (name) => {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return decodeURIComponent(match ? match[2] : "");
};

export const getLanguageProduct360Components=(language)=>{

    switch (language){

        case CONFIG.LOCALE_CODES.DE:
            return CONFIG.P360_LOCALE_CODES.DE;
        case CONFIG.LOCALE_CODES.ES:
            return CONFIG.P360_LOCALE_CODES.ES;
        case CONFIG.LOCALE_CODES.FR:
            return CONFIG.P360_LOCALE_CODES.FR;
        case CONFIG.LOCALE_CODES.RU:
            return CONFIG.P360_LOCALE_CODES.RU;
        case CONFIG.LOCALE_CODES.JA:
            return CONFIG.P360_LOCALE_CODES.JA;
        case CONFIG.LOCALE_CODES.KO:
            return CONFIG.P360_LOCALE_CODES.KO;
        case CONFIG.LOCALE_CODES.ZH_CN:
            return CONFIG.P360_LOCALE_CODES.ZH_CN;
        case CONFIG.LOCALE_CODES.PT_BR:
            return CONFIG.P360_LOCALE_CODES.PT_BR;
        default:
            return CONFIG.P360_LOCALE_CODES.EN;
    }
}

export const getCommentDetails = (commentLine) => {

    const { COMMENT: { DETAILS, SEPARATOR } } = CONFIG;

    let commentDt = {};
    let regExpList = [
        // For user/date like "admin - 7/May/2015 09:54.51"
        /(\w|\W)+\s-\s\d{1,2}\/+[a-zA-Z]{3,9}\/\d{4}\s+\d{1,2}:\d{1,2}.\d{1,2}/g,
        // For user/date like "admin - Thu, 07 May 2015 15:30:01 GMT".
        /(\w|\W)+\s-\s\w{3},\s\d{1,2}\s[a-zA-Z]{3,9}\s\d{4}\s\d{1,2}:\d{1,2}:\d{1,2}\s[a-zA-Z]{3}/g
    ];

    if (commentLine) {
        for (let i = 0; i < regExpList.length; i++) {
            let matchList = regExpList[i].exec(commentLine);
            if (matchList) {
                let userNameDateString = matchList[0];
                commentDt[DETAILS.COMMENTS] = (commentLine.replace(userNameDateString, '')).trim();
                let lastDashIndex = userNameDateString.lastIndexOf(SEPARATOR.USER_TIME);
                if (lastDashIndex !== -1) {
                    commentDt[DETAILS.USER_NAME] = (userNameDateString.substring(0, lastDashIndex)).trim();
                    let commentTime = (userNameDateString.substring(lastDashIndex + SEPARATOR.USER_TIME.length)).trim();
                    commentDt[DETAILS.TIME] = moment(new Date(commentTime)).isValid() ? moment(new Date(commentTime)).format(DETAILS.TIME_FORMAT) : "";
                }
                break;
            }
        }
        if (!commentDt[DETAILS.COMMENT]) {
            commentDt[DETAILS.COMMENT] = commentLine;
        }
    }
    return commentDt;
};