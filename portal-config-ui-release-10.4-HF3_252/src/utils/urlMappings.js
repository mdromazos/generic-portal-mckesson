export const URLMap = {
    "PORTAL_API": "/portals",

    portals: function () {
        return this.PORTAL_API;
    },
    portalDetails: function (databaseId, portalId) {
        return this.portals()+`/${databaseId}/${portalId}`;
    },

    createPortal: function () {
        return this.portals()+`/new`;
    },

    editPortalGeneral: function (databaseId, portalId) {
        return this.portals()+`/${databaseId}/${portalId}/general`;
    },

    createPortalPage: function (databaseId, portalId) {
        return this.portals()+`/${databaseId}/${portalId}/page/new`;
    },

    editPortalPage: function (databaseId, portalId, pageId) {
        return this.portals()+`/${databaseId}/${portalId}/page/${pageId}`;
    },

    getPortalUiUrl: (databaseId, portalId) => {
        const { location } = window;
        const port = location.port ? ':' + location.port : '';

        let portalUiUrl = `${location.protocol}//${location.hostname}${port}`;
        portalUiUrl += `/portal-ui/${portalId}/${databaseId}/login`;

        return portalUiUrl;
    },

    runtimeSettings:function (databaseId, portalId) {
        return `/portals/${databaseId}/${portalId}/runtime`;
    },

    ssoSettings:function (databaseId, portalId) {
        return `/portals/${databaseId}/${portalId}/sso`;
    },

    getLoginPage : function () {
        return process.env.PUBLIC_URL;
    }
};
