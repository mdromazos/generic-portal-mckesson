import CONFIG from "../config/config";

const { ACTIONS: {
    SET_PORTAL_CONFIGURATION,
    ADD_PAGE_SETTINGS,
    REMOVE_PAGE_SETTINGS,
    REMOVE_PORTAL_PAGE_SETTINGS,
    SET_CURRENT_PAGE_SETTINGS,
    UPDATE_PAGE_SETTINGS,
    ADD_APP_NOTIFICATION,
    REMOVE_APP_NOTIFICATION,
    UPDATE_PORTAL_CONFIG_MAP,
    CREATE_PORTAL_CONFIG_MAP,
    EDIT_GENERAL_SETTINGS_PAGE_STATUS
}} = CONFIG;

export const globalConfigReducer = (state, action) => {
    switch (action.type) {
        case SET_PORTAL_CONFIGURATION:
            return {
                ...state,
                portalConfig: action.portalConfig
            };

        case ADD_PAGE_SETTINGS:
            return {
                ...state,
                pageSettings: [
                    ...state.pageSettings,
                    action.pageSettings
                ]
            };

        case UPDATE_PAGE_SETTINGS:
            return {
                ...state,
                pageSettings:
                    (state.pageSettings).map(
                        (page) => {
                            return page.id === action.pageSettings.id ? action.pageSettings : page;
                        })
            };

        case REMOVE_PAGE_SETTINGS:
            return {
                ...state,
                pageSettings: state.pageSettings.filter((page) => action.pageSettings.id !== page.id)
            };

        case REMOVE_PORTAL_PAGE_SETTINGS:
            let newPageSettings = (state.pageSettings).filter(
                (page) => page.id !== action.pageSettings.id
            );
            return {
                ...state,
                pageSettings: newPageSettings
            };

        case SET_CURRENT_PAGE_SETTINGS:
            return {
                ...state,
                currentPage: action.currentPage
            };

        case ADD_APP_NOTIFICATION:
            let appNotificationObj = [];
            if(state.appNotification && state.appNotification[0].type === action.notificationConfig.type) {
                appNotificationObj = JSON.parse(JSON.stringify(state.appNotification));
            }
            appNotificationObj.push(action.notificationConfig);
            return {
                ...state,
                appNotification: appNotificationObj
            };
            
        case REMOVE_APP_NOTIFICATION:
            return {
                ...state,
                appNotification: null
            };

        case UPDATE_PORTAL_CONFIG_MAP:
            return {
                ...state,
                portalConfigMap: {
                    ...state.portalConfigMap,
                    ...action.portalConfigMap
                }
            };

        case CREATE_PORTAL_CONFIG_MAP:
            return {
                ...state,
                portalConfigMap: action.portalConfigMap,
                portals: action.portals
            };

        case EDIT_GENERAL_SETTINGS_PAGE_STATUS:
            return {
                ...state,
                editGeneralSettings: {
                    ...state.editGeneralSettings,
                    editStatus: action.editStatus,
                    dialogBoxVisible: action.dialogBoxVisible,
                    nextPage: action.nextPage,
                    pageType: action.pageType
                }
            };

        default: return {
            ...state
        };
    }
};
