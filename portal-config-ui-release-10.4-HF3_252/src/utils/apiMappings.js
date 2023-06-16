const PORTAL_ROOT = "/infa-portal/config";
const BES_ROOT = "/cmx/cs";

export const APIMap = {
    LOGIN: `${PORTAL_ROOT}/login`,
    LOGOUT: `${PORTAL_ROOT}/logout`,
    GET_DATABASES: `${PORTAL_ROOT}/databases`,
    GET_SECTION_TEMPLATES: `${PORTAL_ROOT}/reference/portals/sections`,
    PORTAL_API: `${PORTAL_ROOT}/portals`,
    CMX_CS: "/cmx/cs",
    DEFAULT_GET_SIZE: "1000",
    SOURCE_SYSTEM: "/cmx/metadata",
    PORTAL_SSO_API: "/infa-portal/sso/portals",

    getDatabases: function () {
        return this.GET_DATABASES;
    },

    getLookupData: function (databaseId, refTable, depRef, depRefValue) {
        if (depRef && depRefValue) {
            return `${this.CMX_CS}/${databaseId}/${refTable}.json?action=list&recordsToReturn=${this.DEFAULT_GET_SIZE}&filter=${depRef}='${depRefValue}'`;
        } else {
            return `${this.CMX_CS}/${databaseId}/${refTable}.json?action=list&recordsToReturn=${this.DEFAULT_GET_SIZE}`;
        }
    },

    getPortals: function () {
        return `${this.PORTAL_API}?depth=1`;
    },

    runtimeConfigurationData:function(portalId){
        return `/infa-portal/runtime/portals/${portalId}`;
    },

    savePortal: function () {
        return this.PORTAL_API;
    },
    getSourceSystem: function (databaseId) {
        return `${this.SOURCE_SYSTEM}/${databaseId}/sourceSystem`
    },

    getLookupTableData: function (databaseId) {
        return `${this.CMX_CS}/${databaseId}/meta/lookup?recordsToReturn=${this.DEFAULT_GET_SIZE}`;
    },

    exportPortal: function (portalId) {
        return `${this.PORTAL_API}/${portalId}/export`;
    },
    
    importPortal: function () {
        return `${this.PORTAL_API}/import`;
    },

    importLanguageBundle: function(portalId){
        return `${PORTAL_ROOT}/portals/${portalId}/bundles`
    },

    exportLanguageBundle: function(portalId){
        return `${PORTAL_ROOT}/portals/${portalId}/bundles`
    },

    getPortalDetails: function (portalId) {
        return `${this.PORTAL_API}/${portalId}?depth=4`;
    },

    getPortalBasicDetails: function (portalId) {
        return `${this.PORTAL_API}/${portalId}?projections=portalId,isDraft,hasPublished,version,status,generalSettings`;
    },

    getPortalPageSortedDetails: function (portalId) {
        return `${this.PORTAL_API}/${portalId}/pages?depth=3&sort=order&sortOrder=asc`;
    },

    editPortal: function (portalId) {
        return `${this.PORTAL_API}/${portalId}`;
    },

    savePortalGeneralSettings: function (portalId) {
        return `${this.PORTAL_API}/${portalId}/generalSettings`;
    },

    deletePortal: function (portalId) {
        return `${this.PORTAL_API}/${portalId}`
    },

    discardDraftPortal: function (portalId) {
        return `${this.PORTAL_API}/${portalId}?action=Discard`
    },

    publishPortal: function (portalId) {
        return `${this.PORTAL_API}/${portalId}?action=publish`;
    },

    getSectionTemplates: function () {
        return this.GET_SECTION_TEMPLATES;
    },

    createPortalPage: function (portalId) {
        return `${this.PORTAL_API}/${portalId}/pages`;
    },

    editPortalPage: function (portalId, pageId) {
        return `${this.PORTAL_API}/${portalId}/pages/${pageId}`;
    },

    deletePortalPage: function (portalId, pageId) {
        return `${this.PORTAL_API}/${portalId}/pages/${pageId}`;
    },

    editPortalReOrderPage: function (portalId) {
        return `${this.PORTAL_API}/${portalId}/pages/`;
    },

    validateSession: function () {
        return `/infa-portal/config/session?action=validate`;
    },

    getBevNames: function (beName) {
        return `${PORTAL_ROOT}/entity/${beName}/view`;
    },

    getBusinessEntities: function (databaseId, limitRecords = `${this.DEFAULT_GET_SIZE}`) {
        return `${BES_ROOT}/${databaseId}/meta/entity.json?recordsToReturn=${limitRecords}`;
    },

    getBevMetadata: function (databaseId, entityName) {
        return `${BES_ROOT}/${databaseId}/${entityName}.json?action=meta`;
    },

    getLookupTableMetadata: function (databaseId, lookupFieldName) {
        return `${BES_ROOT}/${databaseId}/${lookupFieldName}.json?action=meta`;
    },

    portalActions: function (portalId,action) {
        return `${this.PORTAL_API}/${portalId}/status?action=${action}`;
    },

    ssoConfigurationData: function(portalId){
        return `${this.PORTAL_SSO_API}/${portalId}`;
    },

    downloadMetaDataXML: function (portalId) {
        return `${this.PORTAL_SSO_API}/${portalId}/download`;
    },

    updateXMLConfiguration: function (portalId) {
        return `${this.PORTAL_SSO_API}/${portalId}/upload`;
    },
};