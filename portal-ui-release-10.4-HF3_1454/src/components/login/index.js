import React, {useContext, useEffect, useState} from 'react';
import { StateContext } from '../../context/stateContext';
import LoginForm from './loginForm';
import './index.css';
import CONFIG from './../../config/config';
import APIService from "../../utils/apiService";
import {URLMap} from "../../utils/urlMappings";
import {MessageBubble} from '@informatica/droplets-core';
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Login = ({ match, history }) => {
    
    const [{
        globalSettings: { header, login, portalTitle }, globalActions: { setPortalConfiguration },
        runtimeConfigurationActions: { setRuntimeConfigurationAction}, appNotification,
        notificationActions : {dispatchAppNotification,removeAppNotification}
    }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const {
        CONSTANTS, SESSION_POLICY: { SESSION_SECTION, SESSION_TIMEOUT_VALUE, SESSION_TIMEOUT_WARNING_VALUE,
        SESSION_TIMEOUT, SESSION_WARNING, SESSION_TIMEOUT_INITIAL_VALUE }, LANGUAGE, ENGLISH
    } = CONFIG;
    const selectedLanguage = i18n.language && i18n.language.includes(ENGLISH) ? ENGLISH : i18n.language;
    const [localeValue, setLocaleValue] = useState(selectedLanguage);

    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get('errorcode');

    useEffect(() => {
        if(i18n.language && i18n.language.includes(ENGLISH)) {
            setLocaleValue(ENGLISH);
            document.cookie = `${LANGUAGE}=${ENGLISH}; path=/`;
        } else {
            document.cookie = `${LANGUAGE}=${i18n.language}; path=/`;
        }
        loadPortalConfiguration(match);
    }, []);

    useEffect(()=> {
        errorCode && dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
    },[errorCode]);
    
    const loadPortalConfiguration = (match) => {
        const successCallback = (response) => {
            if(response.status !== CONSTANTS.STOPPED && response.status !== CONSTANTS.INVALID) {
                let portalConfig =  JSON.parse(JSON.stringify(response));
                portalConfig.loadPortalConfig = false;
                setPortalConfiguration(portalConfig);
                validateSession(match, history);
                fetchRuntimeConfigurationData();
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
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    };

    const fetchRuntimeConfigurationData = () => {

        const successCallback = (resp) => {
            let runtimeTransformedData = {};
            for (let section = 0; section < resp.length; section++) {
                runtimeTransformedData[resp[section].name] = {};

                for (let configIndex = 0; configIndex < resp[section].configuration.length; configIndex++) {
                    runtimeTransformedData[resp[section].name][
                        resp[section].configuration[configIndex].key
                    ] = resp[section].configuration[configIndex];
                }
            }
            let sessionConfig = runtimeTransformedData[SESSION_SECTION];
            localStorage.setItem(SESSION_TIMEOUT_VALUE +"_"+ match.params.id, sessionConfig[SESSION_TIMEOUT].value * 60);
            localStorage.setItem(SESSION_TIMEOUT_WARNING_VALUE+"_"+ match.params.id, sessionConfig[SESSION_WARNING].value * 60);
            localStorage.setItem(SESSION_TIMEOUT_INITIAL_VALUE+"_"+ match.params.id, sessionConfig[SESSION_TIMEOUT].value * 60);
            setRuntimeConfigurationAction(runtimeTransformedData);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };
        APIService.getRequest(
            URLMap.getRuntimeConfigurationData(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId)
        );
    };

    const validateSession = (match, history) => {
        let successCallback = () => {
            history.push(`/${match.params.id}/${match.params.orsId}/shell`);
        };
        APIService.getRequest(
            URLMap.getSessionValidate(match.params.id),
            successCallback,
            () => { },
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    };

    const localeHandler = (value) => {
        i18n.init({
            lng: value
        });
        setLocaleValue(value);
        loadPortalConfiguration(match);
    }

    return <>
        {
            header.logo && <div
                className='login__page'
                style={{ backgroundImage: 'url("' + login.backgroundImage + '")' }}
            >
                <div className='login__box'>
                    {
                        appNotification && <MessageBubble data-testid="message_bubble"
                            type={appNotification[0].type}
                            timeout={CONSTANTS.NOTIFICATION_TIMEOUT}
                            onClose={removeAppNotification} dismissible
                        >
                            {
                                appNotification.map(notificationConfig => (
                                    <div data-testid="message_bubble_message">
                                        {notificationConfig.message}
                                    </div>
                                ))
                            }
                        </MessageBubble>
                    }
                    <div className='login__box__header'>
                        <div className="login__header__div">
                            <img alt={translate('LABEL_COMPANY_LOGO')} className="login__header__logo" src={header.logo} />
                        </div>
                        <div className="login__header__content" data-testid="login__portal__title">{portalTitle}</div>
                    </div>
                    <div className='login__box__content'>
                        <LoginForm
                            match={match}
                            history={history}
                            locale={localeValue}
                            handleLocaleHandler = {localeHandler}
                        />
                    </div>
                </div>
            </div>
        }
    </>;
};
export default Login;
