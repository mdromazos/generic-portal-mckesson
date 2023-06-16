import { SET_PORTAL_CONFIGURATION } from './types'
import CONFIG from './../config/config';
import { useTranslation } from "react-i18next";

export const useGlobalActions = (state, dispatch) => {
    const { t: translate } = useTranslation();
    const setPortalConfiguration = globalConfig => {
        globalConfig = setDefaultValues(globalConfig);
        dispatch({
            type: SET_PORTAL_CONFIGURATION,
            payload: globalConfig
        })
    };
    /*  sets default values for globalConfig (gc) */
    const setDefaultValues = gc => {
        gc.header.logo = (gc.header.hasOwnProperty('logo') && gc.header.logo ? 
                          gc.header.logo : `${CONFIG.IMAGES.DEFAULT}`);
        gc.portalTitle = (gc.hasOwnProperty('portalTitle') && gc.portalTitle) ? 
                          gc.portalTitle : '';
        gc.login.title = (gc.login.hasOwnProperty('title') && gc.login.title) ? 
                          gc.login.title : translate("DEFAULT_LOGIN_TITLE");
        gc.login.backgroundImage = (gc.login.hasOwnProperty('backgroundImage') && gc.login.backgroundImage) ? 
                          gc.login.backgroundImage : '';
        gc.signup.title = (gc.signup.hasOwnProperty('title') && gc.signup.title) ? 
                          gc.signup.title : translate("DEFAULT_SIGNUP_TITLE");
        gc.signup.backgroundImage = (gc.signup.hasOwnProperty('backgroundImage') && gc.signup.backgroundImage) ? 
                          gc.signup.backgroundImage : '';
        return gc;
    }

    return {
        setPortalConfiguration
    }
};