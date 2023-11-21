import { getCookie } from "../common/helperUtils";
import CONFIG from '../config/config';

const PORTAL_ROOT = '/infa-portal';
const PIM_ROOT = '/pimservice';
export const URLMap = {
    GLOBAL_API: PORTAL_ROOT + '/global/portals',
    PORTALS: PORTAL_ROOT + '/portals',
    PORTAL_LOGIN: PORTAL_ROOT + '/portals/login',
    PORTAL_SIGNUP: PORTAL_ROOT + '/global/portals/signup',
    PORTAL_LOGOUT: PORTAL_ROOT + '/portals/logout',
    LOOKUP_PROXY: PORTAL_ROOT + '/global/proxy',
    LOGIN_CONFIG_DATA: PORTAL_ROOT + '/global/runtime/portals',
    BES_PREFIX: '/cmx/cs',
    BES_LOOKUP_PREFIX: '/cmx/lookup',
    BES_FILE_PREFIX: '/cmx/file',
    BE_PROXY: PORTAL_ROOT + '/proxy',
    BE_PROXY_UPLOAD: PORTAL_ROOT + '/proxy/file/upload',
    BE_PROXY_DOWNLOAD: PORTAL_ROOT + '/proxy/file/download',
    CREATE_ADDITIONAL_USER: PORTAL_ROOT + '/portals/entities',
    PRODUCT_360_TOKEN: PIM_ROOT + '/token',
    PRODUCT_360_CATALOG: PIM_ROOT + '/catalogs',
 
    getLoginPage: function () {
        return process.env.PUBLIC_URL;
    },
    getSessionValidate: function (portalID) {
        return `${this.PORTALS}/session/${portalID}/?action=validate`
    },
    postForgotPassword: function (portalID) {
        return `${this.GLOBAL_API}/${portalID}/forgotpasswordlink`;
    },
    postResetPassword: function (portalID) {
        return `${this.GLOBAL_API}/${portalID}/forgotpassword`;
    },
    postChangePassword: function (portalID) {
        return `${this.PORTALS}/${portalID}/changepassword`;
    },
    getPortalLocales : function(portalId){
        return `${this.GLOBAL_API}/${portalId}/locales`;
    },
    getProxy: function () {
        return `${this.BE_PROXY}`;
    },
    getFileUploadProxy: function () {
        return `${this.BE_PROXY_UPLOAD}`;
    },
    getFileDownloadProxy: function () {
        return `${this.BE_PROXY_DOWNLOAD}`;
    },
    getUrlExtension: function (params) {
        return params.reduce((acc, val) => {
            return acc + val + '/';
        }, '').slice(0, -1);
    },
    getPortalMeta: function (params, depth, resolveMeta, sort, filter) {
        let depthParam = depth ? `depth=${depth}&` : "";
        let sortParam = sort ? `sort=${sort}&` : "";
        const filterParam = filter ? `filter=${encodeURIComponent(JSON.stringify(filter))}&caseInsensitive=true&` : "";
        return `${PORTAL_ROOT}/${this.getUrlExtension(params)}?${depthParam}${sortParam}${filterParam}resolveExtConfig=${resolveMeta}`;
    },
    getLookUpProxy: function () {
        return `${this.LOOKUP_PROXY}`;
    },
    getRuntimeConfigurationData: function (portalId) {
        return `${this.LOGIN_CONFIG_DATA}/${portalId}`;
    },
    getPortalData: function (portalId) {
        return `${this.GLOBAL_API}/${portalId}`;
    },
    getBEData: function (orsId, beName, beRowId, recordState) {
        const recordStateParam = (recordState) ? `recordStates=${recordState}` : 'recordStates=ACTIVE,PENDING';
        return `${this.BES_PREFIX}/${orsId}/${beName}/${beRowId}?${recordStateParam}&readSystemFields=true`;
    },
    getBEDataPendingProtected: function (orsId, beName, beRowId, recordState) {
        const recordStateParam = (recordState) ? `recordStates=${recordState}` : 'recordStates=ACTIVE,PENDING';
        return `${this.BES_PREFIX}/${orsId}/${beName}/${beRowId}?${recordStateParam}&readSystemFields=true&contentMetadata=PENDING_PROTECTED`;
    },
    postBEData: function (orsId, beName, beRowId, interactionId, isPending) {
        let interactionIdParam = interactionId ? `interactionId=${interactionId}&` : "";
        let recordStateParam = (isPending) ? 'recordState=PENDING&' : '';
        return `${this.BES_PREFIX}/${orsId}/${beName}/${beRowId}?${interactionIdParam}${recordStateParam}`;
    },
    getBEDataForOneToMany: function (orsId, beName, beRowId, fieldName, paramString, recordState) {
        const recordStateParam = (recordState) ? `recordStates=${recordState}` : 'recordStates=ACTIVE,PENDING';
        return `${this.BES_PREFIX}/${orsId}/${beName}/${beRowId}/${fieldName}?${paramString}&${recordStateParam}&readSystemFields=true`;
    },
    getBEDataForOneToManyPendingProtected: function (orsId, beName, beRowId, fieldName, paramString, recordState) {
        const recordStateParam = (recordState) ? `recordStates=${recordState}` : 'recordStates=ACTIVE,PENDING';
        return `${this.BES_PREFIX}/${orsId}/${beName}/${beRowId}/${fieldName}?${paramString}&${recordStateParam}&readSystemFields=true&contentMetadata=PENDING_PROTECTED`;
    },
    deleteUserData: function (username, beView,systemName) {
        return `${this.CREATE_ADDITIONAL_USER}/${beView}/users/${username}?systemName=${systemName}`;
    },
    getContactBEData: function (orsId, beName, beRowId, oneToMany) {
        let contact = oneToMany ? `/${oneToMany}.json` : '';
        return `${this.BES_PREFIX}/${orsId}/${beName}/${beRowId}${contact}?depth=10&returnTotal=true&recordsToReturn=100&recordStates=ACTIVE,PENDING`
    },
    createAdditionalUser: function (beView, systemName) {
        return `${this.CREATE_ADDITIONAL_USER}/${beView}/users?systemName=${systemName}`;
    },
    postLogout: function (portalID) {
        return `${this.PORTAL_LOGOUT}/${portalID}`;
    },
    postLogin: function (portalID) {
        return `${this.PORTAL_LOGIN}/${portalID}`;
    },
    getPortalRoles: function (orsID, beViewName, refTable) {
        let refTableName = refTable.includes(".") ? `${refTable.split(".")[0]}/${refTable.split(".")[1]}` : refTable;
        return `${this.BES_LOOKUP_PREFIX}/${orsID}/id-label/${beViewName}/${refTableName}`;
    },
    postSignUp: function (supplierView, systemName) {
        return `${this.PORTAL_SIGNUP}/${supplierView}?systemName=${systemName}`;
    },
    generateHeader: function (orsId, portalId) {
        const userRole = getCookie(CONFIG.USER_ROLE); 
        if (portalId) {
            return {
                headers: {
                    'X-INFA-ORS': orsId,
                    'X-INFA-PORTALID': portalId,
                    'X-INFA-ROLE': userRole
                }
            }
        }
        else {
            return {
                headers: {
                    'X-INFA-ORS': orsId,
                    'X-INFA-ROLE': userRole
                }
            }
        }
    },
    getFileMetadata: function (orsId, storageType, fileId) {
        return `${this.BES_FILE_PREFIX}/${orsId}/${storageType}/${fileId}?recordStates=ACTIVE,PENDING`;
    },
    createFileMetadata: function (orsId, storageType) {
        return `${this.BES_FILE_PREFIX}/${orsId}/${storageType}?recordStates=ACTIVE,PENDING`;
    },
    uploadFileContent: function (orsId, storageType, fileId) {
        return `${this.BES_FILE_PREFIX}/${orsId}/${storageType}/${fileId}/content?recordStates=ACTIVE,PENDING`;
    },
    //#TODO move to proxy API once the backend processes BES errors
    validateBE: function (orsId, beName) {
        return `${this.BES_PREFIX}/${orsId}/${beName}`;
    },
    getProduct360Token: function () {
        return `${this.PRODUCT_360_TOKEN}`
    },
    findCatalog: function () {
        return `${this.PRODUCT_360_CATALOG}`
    },
    getTaskList: function (orsId, beName, owner, taskType, status) {
        const statusParam = status ? `status=${status}&` : "";
        const businessEntityParam = beName ? `businessEntity=${beName}&` : "";
        return `${this.BES_PREFIX}/${orsId}/task?${statusParam}${businessEntityParam}owner=${owner}&taskType=${taskType}`;
    },
    getTaskDetails: function (orsId, taskId) {
        return `${this.BES_PREFIX}/${orsId}/task/${taskId}`;
    },
    executeTask: function (orsId, taskId, taskAction) {
        return `${this.BES_PREFIX}/${orsId}/task/${taskId}?taskAction=${taskAction}`;
    },
    refreshSession: function (portalId, sessionTimeout) {
        return `${this.PORTALS}/session/${portalId}/${sessionTimeout}`;
    },
    doesUserExist: function (beName, portalUserName) {
        return `${this.PORTALS}/entities/${beName}/users?username=${portalUserName}`;
    },
    getPortalPreferences: function(username, preferenceId) {
        const preferenceIdParam = preferenceId ? `?id=${preferenceId}` : '';
        return `${this.PORTALS}/preferences/users/${username}/${preferenceIdParam}`;
    },
    savePortalPreferences: function(username, userPreferenceId) {
        const preferenceId = userPreferenceId ? userPreferenceId : "";
        return `${this.PORTALS}/preferences/users/${username}/${preferenceId}`;
    },
    validateSSOLogin: function(portalId, orsId) {
        return `${this.PORTALS}/login/saml/${orsId}/${portalId}?validate=true`;
    }
};