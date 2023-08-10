import React, { useEffect, useContext, useState, useCallback } from 'react';
import './index.css';
import PortalHeader from "./portalHeader";
import PortalBody from "./portalBody";
import APIService from "../../utils/apiService";
import {URLMap} from "../../utils/urlMappings";
import {StateContext} from "../../context/stateContext";
import { getCookie } from "../../common/helperUtils";
import CONFIG from "../../config/config";
import { useTranslation } from "react-i18next";
import SessionTimeout from '../sessionTimeout';


const Shell = ({ match, history }) => {

    const [{
        globalSettings: { loadPortalConfig },
        pageActions: { setPortalPages },
        globalActions: { setPortalConfiguration },
        pageMetadata: { loadPortalPages, pages },
        notificationActions : {dispatchAppNotification},
        userPreferenceActions : { updateUserPreference },
        runtimeConfigurationActions: { setRuntimeConfigurationAction },
    }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const { CONSTANTS, 
        SESSION_POLICY: { SESSION_TIMEOUT_VALUE, SESSION_SECTION, SESSION_TIMEOUT_WARNING_VALUE, SESSION_TIMEOUT, SESSION_WARNING, SESSION_TIMEOUT_INITIAL_VALUE },
        USER_NAME } = CONFIG;    let portalSessionTimeOut = SESSION_TIMEOUT_VALUE +"_"+ match.params.id;
    let portalSessionWarningTimeOut = SESSION_TIMEOUT_WARNING_VALUE+"_"+ match.params.id;

    const [sessionTimeout, setSessionTimeout] = useState(localStorage.getItem(portalSessionTimeOut));
    const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(localStorage.getItem(portalSessionWarningTimeOut));

    
    const startSessionTimeout = () => {
        const timeoutValue = localStorage.getItem(portalSessionTimeOut);
        const warningValue = localStorage.getItem(portalSessionWarningTimeOut);
        setSessionTimeout(timeoutValue);
        setSessionTimeoutWarning(warningValue);
    };

    useEffect(() => {
        const samlCookie = getCookie(`portalprovider-${match.params.orsId}-${match.params.id}`)
        if(samlCookie === 'SAML') {
            fetchRuntimeConfigurationData()
        } else {
            tartSessionTimeout();
        }
        validateAndLoadPortalMetadata();
    }, []);


    const fetchRuntimeConfigurationData = () => {
        const successCallback = (resp) => {
            const runtimeTransformedData = {};
            for (let section = 0; section < resp.length; section += 1) {
                runtimeTransformedData[resp[section].name] = {};
    
                for (let configIndex = 0; configIndex < resp[section].configuration.length; configIndex += 1) {
                    runtimeTransformedData[resp[section].name][resp[section].configuration[configIndex].key] = resp[section].configuration[configIndex];
                }
            }
            const sessionConfig = runtimeTransformedData[SESSION_SECTION];
            localStorage.setItem(`${SESSION_TIMEOUT_VALUE}_${match.params.id}`, sessionConfig[SESSION_TIMEOUT].value * 60);
            localStorage.setItem(`${SESSION_TIMEOUT_WARNING_VALUE}_${match.params.id}`, sessionConfig[SESSION_WARNING].value * 60);
            localStorage.setItem(`${SESSION_TIMEOUT_INITIAL_VALUE}_${match.params.id}`, sessionConfig[SESSION_TIMEOUT].value * 60);
    
            setSessionTimeout(sessionConfig[SESSION_TIMEOUT].value * 60);
            setSessionTimeoutWarning(sessionConfig[SESSION_WARNING].value * 60);      
            setRuntimeConfigurationAction(runtimeTransformedData);
        };
        const failureCallback = ({ response }) => {
        const { data } = response || {}
            if (data && data.errorCode) {
                dispatchAppNotification(translate(data.errorCode), CONSTANTS.NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };
        APIService.getRequest(URLMap.getRuntimeConfigurationData(match.params.id), successCallback, failureCallback, URLMap.generateHeader(match.params.orsId));
    };

    const validateAndLoadPortalMetadata = () => {
        let successCallback = () => {
            if(loadPortalConfig) {
                loadPortalConfiguration();
            }
            if(loadPortalPages) {
                loadPages();
            } else if(match.params.pageId) {
                history.push(`/${match.params.id}/${match.params.orsId}/shell/${match.params.pageId}`);
            } else if(Array.isArray(pages) && pages.length > 0) {
                history.push(`/${match.params.id}/${match.params.orsId}/shell/${pages[0].id}`);
            }
            getPortalPreferences();
        };
        let failureCallback = ({response:{data:{errorCode}}}) => {
            history.push(`/${match.params.id}/${match.params.orsId}/login`);
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            }
        };
        APIService.getRequest(
            URLMap.getSessionValidate(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    };

    const getPortalPreferences = useCallback(() => {

        let username = getCookie(USER_NAME);

        const successCallback = (response) => {
            updateUserPreference(response);
        };

        const failureCallback = ({ response: { data: { errorCode } } }) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };

        APIService.getRequest(
            URLMap.getPortalPreferences(username),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    }, []
    );

    const loadPortalConfiguration = () => {
        const successCallback = (response) => {
            if(response.status !== CONSTANTS.STOPPED && response.status !== CONSTANTS.INVALID) {
                let portalConfig =  JSON.parse(JSON.stringify(response));
                portalConfig.loadPortalConfig = false;
                setPortalConfiguration(portalConfig);
            } else {
                history.push(`/${match.params.id}/${match.params.orsId}/error`);
            }
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };
        APIService.getRequest(
            URLMap.getPortalData(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId,match.params.id)
        );
    };

    const loadPages = () => {
        const successCallback = (response) => {
            setPortalPages({
                pages: response,
                loadPortalPages: false
            });
            if (match.params.pageId) {
                history.push(`/${match.params.id}/${match.params.orsId}/shell/${match.params.pageId}`);
            } else if (Array.isArray(response) && response.length > 0) {
                history.push(`/${match.params.id}/${match.params.orsId}/shell/${response[0].id}`);
            }
        };
        const errorCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };
        const userRole = getCookie(CONFIG.USER_ROLE); 
        const userState = getCookie(CONFIG.PORTAL_STATE);

        let filterParams = { "roles": [userRole] };
        if (userState && userState !== "null" && userState !== "undefined") {
            filterParams["states"] = [userState];
        }
        APIService.getRequest(
            URLMap.getPortalMeta(['portals', match.params.id, 'pages'], 3, true, 'order', filterParams),
            successCallback,
            errorCallback,
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    };

    return (
        <>
            {sessionTimeout && sessionTimeoutWarning && <SessionTimeout
                timeout = { parseInt(sessionTimeout) }
                sessionTimeoutWarning = { parseInt(sessionTimeoutWarning) }
                match = {match}
                history = {history}
            />}
            <PortalHeader match={match} history={history} />
            <PortalBody match={match} history={history} />
        </>
    );
};
export default Shell;
