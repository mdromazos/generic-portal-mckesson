import React, {createContext, useReducer} from 'react';
import { useNotificationActions } from '../actions/notificationActions'
import { useGlobalActions } from '../actions/globalActions';
import { usePageActions } from '../actions/pageActions';
import { useRuntimeConfigActions } from '../actions/runtimeConfigActions';
import { useUserPreferenceActions } from '../actions/userPreferenceActions';
import { stateReducer } from '../reducers';

//TODO: load initial state based on portal ID
const initialState = {
    globalSettings: {
        loadPortalConfig: true,
        header: {},
        footer: {},
        login: {}
    },
    pageMetadata: {
        loadPortalPages: true,
        pages: undefined,
    },
    runtimeConfigurationData:{},
    appNotification: null,
    confirmDialog : {
        visible: false
    },
    userPreferences: {}
};

const StateContext = createContext({});

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(stateReducer, initialState);
    const globalActions = useGlobalActions(state.globalSettings, dispatch);
    const pageActions = usePageActions(state.pageMetadata, dispatch);
    const runtimeConfigurationActions = useRuntimeConfigActions(state.runtimeConfigurationData, dispatch);
    const notificationActions = useNotificationActions(state.appNotification,dispatch);
    const userPreferenceActions = useUserPreferenceActions(state.userPreferences, dispatch);

    return(
        <StateContext.Provider value={[
            {
                globalSettings: state.globalSettings,
                pageMetadata: state.pageMetadata,
                runtimeConfigurationData: state.runtimeConfigurationData,
                globalActions,
                pageActions,
                runtimeConfigurationActions,
                appNotification: state.appNotification,
                notificationActions,
                userPreferenceActions,
                userPreferences: state.userPreferences,
                confirmDialog: state.confirmDialog
            },
            dispatch
        ]}
        >
            {children}
        </StateContext.Provider>
    )
};

export {StateContext, StateProvider};