import React, {useContext, useEffect} from 'react';
import { StateContext } from '../../context/stateContext';
import './index.css';
import CONFIG from './../../config/config';
import APIService from "../../utils/apiService";
import {URLMap} from "../../utils/urlMappings";
import { useTranslation } from "react-i18next";
import {useAxiosLoader} from "../../utils/Interceptors";

const ErrorPage = ({ match, history }) => {

    const { t: translate } = useTranslation();
    const [loading] = useAxiosLoader();
    const { CONSTANTS, IMAGES } = CONFIG;
    const [{
        globalSettings: { portalTitle },
        globalActions: { setPortalConfiguration },
        notificationActions : { dispatchAppNotification }
    }] = useContext(StateContext);

    useEffect(() => {
        loadPortalConfiguration(match);
    }, []);

    const loadPortalConfiguration = (match) => {
        const successCallback = (response) => {
            let portalConfig =  JSON.parse(JSON.stringify(response));

            if(response.status !== CONSTANTS.STOPPED && response.status !== CONSTANTS.INVALID) {
                portalConfig.loadPortalConfig = false;
                validateSession(match, history);
            }
            setPortalConfiguration(portalConfig);
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

    const validateSession = (match, history) => {
        let successCallback = () => {
            history.push(`/${match.params.id}/${match.params.orsId}/shell`);
        };
        let failureCallback = () => {
            history.push(`/${match.params.id}/${match.params.orsId}/login`);
        };
        APIService.getRequest(
            URLMap.getSessionValidate(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    };

    return <>
        {
            !loading && <div className="portal__error__container" data-testid="portal-error-container">
                <img className="portal__error__image" alt="" src={IMAGES.PAGE_NOT_FOUND}  data-testid="portal-error-image"/>
                <span className="portal__error__heading" data-testid="portal-error-heading">
                    {
                        translate("LABEL_PORTAL_NOT_AVAILABLE_HEADING", {
                            PORTAL_NAME: `${portalTitle}`
                        })
                    }
                </span>
                <span className="portal__error__content" data-testid="portal-error-content">
                    {translate("LABEL_PORTAL_NOT_AVAILABLE_CONTENT")}
                </span>
                <span className="portal__error__sub__content" data-testid="portal-error-sub-content">
                    {translate("LABEL_PORTAL_NOT_AVAILABLE_SUB_CONTENT")}
                </span>
            </div>
        }
    </>;
};
export default ErrorPage;
