import React, {useContext, useEffect, useState} from "react";
import "@informatica/droplets-core/dist/themes/archipelago/components/loader.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/form.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/button.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css";
import { StateContext } from "../../context/stateContext";
import "./index.css";
import SignUpForm from "./signUpForm";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import APIService from "../../utils/apiService";
import {URLMap} from "../../utils/urlMappings";
import CONFIG from "../../config/config";
import PageNotFound from "../pageNotFound";

const SignUp = ({ match, history }) => {

    const [{
        globalSettings: { header, signup, portalTitle, isExternalUserManagementEnabled }, globalActions: { setPortalConfiguration },
        runtimeConfigurationActions: { setRuntimeConfigurationAction},
        notificationActions : {dispatchAppNotification},
    }] = useContext(StateContext);
    const {
        CONSTANTS, SESSION_POLICY: { SESSION_SECTION, SESSION_TIMEOUT_VALUE, SESSION_TIMEOUT_WARNING_VALUE,
        SESSION_TIMEOUT, SESSION_WARNING, SESSION_TIMEOUT_INITIAL_VALUE }, LANGUAGE, ENGLISH
    } = CONFIG;
    
    const selectedLanguage = i18n.language && i18n.language.includes(ENGLISH) ? ENGLISH : i18n.language;
    const [localeValue, setLocaleValue] = useState(selectedLanguage);
    const { t: translate } = useTranslation();
    const [disableSignup, setDisableSignup] = useState(false);

    useEffect(() => {
        if(i18n.language && i18n.language.includes(ENGLISH)) {
            setLocaleValue(ENGLISH);
            document.cookie = `${LANGUAGE}=${ENGLISH}; path=/`;
        } else {
            document.cookie = `${LANGUAGE}=${i18n.language}; path=/`;
        }
        loadPortalConfiguration(match);
    }, []);


    const loadPortalConfiguration = (match) => {
        const successCallback = (response) => {
            if(response.status !== CONSTANTS.STOPPED && response.status !== CONSTANTS.INVALID) {
                let portalConfig =  JSON.parse(JSON.stringify(response));
                portalConfig.loadPortalConfig = false;
                validateSession(match, history);
                if(response.disableSignup) {
                    setDisableSignup(true);
                } else {
                    setPortalConfiguration(portalConfig);
                    fetchRuntimeConfigurationData();
                }
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
            URLMap.generateHeader(match.params.orsId)
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

    const renderSignupForm = () => {
        return header.logo && <div class="signup__page" style={{ backgroundImage:  'url("' + signup.backgroundImage + '")'}}>
            <div className="signup__box__outer">
                    <div className="signup__box__inner">
                        <div className="signup__box__header">
                            <div className="signup__header__div">
                                <img
                                    alt={translate('LABEL_COMPANY_LOGO')}
                                    className="signup__header__logo"
                                    src={header.logo}
                                />
                            </div>
                            <div className="signup__header__content" data-testid="portal__signup__title">{portalTitle}</div>
                        </div>
                        <div className="signup__box__content" data-testid="portal__signupForm">
                            <SignUpForm
                                match={match}
                                history={history}
                                locale={localeValue}
                                handleLocaleHandler={localeHandler}
                            />
                        </div>
                    </div>
            </div>
        </div> 
    };

    return <>
        { (isExternalUserManagementEnabled || disableSignup) ? <PageNotFound /> : renderSignupForm() }
    </>;
    
        
};
export default SignUp;
