import React, { useState, useEffect, useContext, useRef } from "react";
import { useDialogState  } from "@informatica/droplets-core";
import { StateContext } from "../../context/stateContext";
import { useTranslation } from "react-i18next";
import CONFIG from "../../config/config";
import { URLMap } from "../../utils/urlMappings";
import APIService from "../../utils/apiService";
import SessionDialog from "./SessionDialog";
import "./index.css";

const SessionTimeout = ({ timeout, sessionTimeoutWarning, match, history }) => {
    
    const dialogBox = useDialogState(true);
    const [{ notificationActions : {dispatchAppNotification} }] = useContext(StateContext);
    
    const closeSessionDialog = useRef(true);
    
    const { SESSION_POLICY: { SESSION_TIMEOUT_VALUE, SESSION_TIMEOUT_WARNING_VALUE, SESSION_TIMEOUT_INITIAL_VALUE },
           CONSTANTS:{ NOTIFICATION_ERROR, NOTIFICATION_INFO }} = CONFIG;
    const [sessionTimeout, setSessionTimeout] = useState(timeout);
    const init = useRef(true);
    const progressBar = useRef(sessionTimeoutWarning);
    const { t: translate } = useTranslation();

    let portalSessionTimeOut = SESSION_TIMEOUT_VALUE +"_"+ match.params.id;
    let portalSessionWarningTimeOut = SESSION_TIMEOUT_WARNING_VALUE+"_"+ match.params.id;
    let portalSessionInitialValue = SESSION_TIMEOUT_INITIAL_VALUE+"_"+ match.params.id;
    let sessionTimeoutInterval = null;

    const handleLogout = () => {
        const successCallback = () => {
            localStorage.removeItem(portalSessionTimeOut);
            localStorage.removeItem(portalSessionWarningTimeOut);
            dispatchAppNotification(
                translate("SESSION_EXPIRED_ERROR_MESSAGE"),
                NOTIFICATION_INFO
                );
            history.push(`/${match.params.id}/${match.params.orsId}/login`);
        };

        const failureCallback = ({ response: {data: { errorCode }} }) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(
                translate("GENERIC__ERROR__MESSAGE"),
                NOTIFICATION_ERROR
                );
            }
        };

        APIService.putRequest(
        URLMap.postLogout(match.params.id),
        {},
        successCallback,
        failureCallback,
        { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
        );
    };

    useEffect(() => {
        if (init.current) {
            init.current = false;
            let sessionTime = localStorage.getItem(portalSessionTimeOut);
        
            if (sessionTime && sessionTime < sessionTimeoutWarning) {
                progressBar.current = sessionTime;
            } else {
                progressBar.current = sessionTimeoutWarning;
            }
            if (sessionTime) {
                setSessionTimeout(sessionTime);
            } else {
                localStorage.setItem(portalSessionTimeOut, sessionTimeout);
            }
        }
        if (sessionTimeout > 0) {
            sessionTimeoutInterval = setTimeout(() => {
                if (sessionTimeout <= sessionTimeoutWarning && closeSessionDialog.current) {
                    dialogBox.open();
                }
                setSessionTimeout(sessionTimeout => {
                    let updatedtime = sessionTimeout - 1;
                    localStorage.setItem(portalSessionTimeOut, updatedtime);
                    return updatedtime;
                });
            }, 1000);
        } else {
            handleLogout();
            dialogBox.close();
            localStorage.removeItem(portalSessionTimeOut);
            clearTimeout(sessionTimeoutInterval);
        }
        return () => {
            if (sessionTimeoutInterval) clearTimeout(sessionTimeoutInterval);
        };
    }, [sessionTimeout]);

    function addMoreTimeHandler() {
        const sessionInitialValue = localStorage.getItem(portalSessionInitialValue);
        dialogBox.close();
        clearTimeout(sessionTimeoutInterval);
        const successCallback = () => {
            localStorage.setItem(portalSessionTimeOut, sessionInitialValue);
            setSessionTimeout(sessionInitialValue);
            init.current = true;
            closeSessionDialog.current = true;
        };
        APIService.postRequest(
            URLMap.refreshSession(match.params.id,sessionInitialValue),
            {},
            successCallback,
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR)
                }
                else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_ERROR)
                }
                handleLogout();
            },
            { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
        );
    }
    
    return (
        <>
           {
               !dialogBox.closed &&
               <SessionDialog
                    progressBar={progressBar.current}
                    sessionTimeout={sessionTimeout}
                    addMoreTime={addMoreTimeHandler}
                    dialogBox={dialogBox}
               /> 
           }
        </>
    );
};

export default SessionTimeout;
