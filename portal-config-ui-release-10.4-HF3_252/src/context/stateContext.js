import React, {createContext, useReducer} from 'react';
import home_icon from '@informatica/archipelago-icons/src/icons/home.svg';
import { globalConfigReducer } from '../reducers';
import CONFIG from '../config/config';

const { PAGES: { HOME }} = CONFIG;
const homePageSettings = {
    label: [HOME],
    type: HOME,
    url: "/portals",
    icon: home_icon,
    id: HOME
};
const defaultPortalConfig = {
    generalSettings: {
        header: { },
        footer: { },
        login: { enableSSO: false },
        isStateEnabled: false,
        isExternalUserManagementEnabled: false,
        signup: { "maxColumns" : 2 },
        userManagement: {
            createAdditionalUsers: false,
            fieldMapping: {},
        }
    }
};
const initialState = {
    portalConfig: defaultPortalConfig,
    createPortalConfig: defaultPortalConfig,
    currentPage: homePageSettings,
    pageSettings: [
        homePageSettings
    ],
    appNotification: null,
    portalConfigMap: {},
    portals:[],
    editGeneralSettings : {}
};
const StateContext = createContext({});

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalConfigReducer, initialState);
    return(
        <StateContext.Provider value={{ state, dispatch }}>
            { children }
        </StateContext.Provider>
    )
};
export { StateContext, StateProvider, initialState };
