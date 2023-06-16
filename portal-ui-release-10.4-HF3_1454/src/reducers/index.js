import {
    SET_PORTAL_CONFIGURATION, SET_RUNTIME_CONFIGURATION, SET_PORTAL_PAGES,
    ADD_APP_NOTIFICATION, REMOVE_APP_NOTIFICATION, CANCEL_EDIT, UPDATE_USER_PREFERENCE,
    REMOVE_USER_PREFERENCE
} from '../actions/types';

export const stateReducer = (state, action ) => {
    
    switch(action.type) {
        case SET_PORTAL_CONFIGURATION:  
            return {
                ...state,
                globalSettings: {...action.payload}
            };
        case SET_PORTAL_PAGES:
            const newState = {...state.pageMetadata};
            newState['pages'] = action.payload.pages;
            return {
                ...state,
                pageMetadata: newState
            };
        case SET_RUNTIME_CONFIGURATION:
            return {
                ...state,
                runtimeConfigurationData: {...action.payload}
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
        case CANCEL_EDIT:
            return {
                ...state,
                confirmDialog: {
                    editStatus: action.status.edit,
                    visible: action.status.display,
                    nextPageID: action.status.nextPageID,
                    type: action.status.linkType
                }
            };
        case UPDATE_USER_PREFERENCE:
            let userPreference = JSON.parse(JSON.stringify(state.userPreferences));
            let updatedUserPreference = {...userPreference, ...action.payload};
            
            return {
                ...state,
                userPreferences: updatedUserPreference
            };
        case REMOVE_USER_PREFERENCE:
            return {
                ...state,
                userPreferences: {}
            };
        default : return {
            ...state
        }
    }
};
