import React, {useContext, useEffect} from 'react';
import { StateContext } from '../../context/stateContext';
import ResetPassword from './ResetPassword';
import APIService from "../../utils/apiService";
import {URLMap} from "../../utils/urlMappings";
import {MessageBubble} from '@informatica/droplets-core';
import { useTranslation } from "react-i18next";
import CONFIG from './../../config/config';

const ResetPasswordView = ({ match, history }) => {

    const [{
        globalSettings: { loadPortalConfig, header, login, portalTitle },
        globalActions: { setPortalConfiguration },
        runtimeConfigurationActions: { setRuntimeConfigurationAction},
        notificationActions : {dispatchAppNotification, removeAppNotification},
        appNotification
    }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const { CONSTANTS } = CONFIG;

    useEffect(() => {
        loadPortalConfiguration(match);
        validateSession(match, history);
        fetchRuntimeConfigurationData();
    }, []);
    

    const loadPortalConfiguration = (match) => {
        if(loadPortalConfig) {
            const successCallback = (response) => {
                let portalConfig =  JSON.parse(JSON.stringify(response));
                portalConfig.loadPortalConfig = false;
                setPortalConfiguration(portalConfig);
            };
            const failureCallback = ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
                }
                else {
                    dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
                }
            }
            APIService.getRequest(
                URLMap.getPortalData(match.params.id),
                successCallback,
                failureCallback,
                URLMap.generateHeader(match.params.orsId, match.params.id)
            );
        }
    };

    const fetchRuntimeConfigurationData = () => {

        const successCallback = (resp) => {
            let runtimeTransformedData = [];
            for (let section = 0; section < resp.length; section++) {
                runtimeTransformedData[resp[section].name] = {};
                for (let configIndex = 0;
                    configIndex < resp[section].configuration.length;
                    configIndex++) {
                    runtimeTransformedData[resp[section].name][
                        resp[section].configuration[configIndex].key
                    ] = resp[section].configuration[configIndex];
                }
            }
            setRuntimeConfigurationAction(runtimeTransformedData);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };
        APIService.getRequest(
            URLMap.getRuntimeConfigurationData(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId)
        );
    }

    const validateSession = (match, history) => {
        let successCallback = () => {
            console.log("SESSION :: VALID");
            history.push(`/${match.params.id}/${match.params.orsId}/shell`);
        };
        let failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            }
            console.log("SESSION :: INVALID");
        };
        APIService.getRequest(
            URLMap.getSessionValidate(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    };

    return (
        <>
            {   header.logo && 
				<div className='login__page'  data-testid="reset_password_page"
					 style={{ backgroundImage: 'url("' + login.backgroundImage + '")' }}>
					<div className='login__box'>
						{ appNotification && 
                            <MessageBubble type={appNotification[0].type}
                                data-testid="message_bubble"
								timeout={CONSTANTS.NOTIFICATION_TIMEOUT}
								onClose={removeAppNotification} dismissible>
								{ appNotification.map(notificationConfig => (
									<div data-testid="message_bubble_message">
										{notificationConfig.message}
									</div>
								))}
							</MessageBubble>
						}
						<div className='login__box__header'>
							<div className="login__header__div">
								<img alt={translate('LABEL_COMPANY_LOGO')} className="login__header__logo" src={header.logo}/>
							</div>
							<div className="login__header__content" data-testid="reset_password_title">{portalTitle}</div>
						</div>
						<div className='login__box__content'>
							<ResetPassword match={match} history={history} />
						</div>
					</div>
				</div>
            }
        </>
    );
};
export default ResetPasswordView;