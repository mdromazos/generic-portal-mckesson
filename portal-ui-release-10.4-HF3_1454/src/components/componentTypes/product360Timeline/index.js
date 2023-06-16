import React, { useEffect, useContext, useState } from 'react';
import { Card } from '@informatica/droplets-core';
import { getHeight, getCookie, getLanguageProduct360Components} from "../../../common/helperUtils";
import '@informatica/droplets-core/dist/themes/archipelago/components/section.css';
import Iframe from 'react-iframe';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService';
import CONFIG from "../../../config/config";
import { StateContext } from '../../../context/stateContext';
import { useTranslation } from "react-i18next";

const Product360Timeline = ({ component,match}) => {

    const [{ notificationActions: { dispatchAppNotification } }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const [url, setUrl] = useState('');
    const { PRODUCT_360_USER_TYPE: { SUPPLIER_USER }, CONSTANTS, EMAIL, LANGUAGE } = CONFIG;
    const email = getCookie(EMAIL);
    const languageCookie = getCookie(LANGUAGE);
    const language = getLanguageProduct360Components(languageCookie);


    useEffect(() => {
        fetchToken();
    }, []);

    const fetchToken = function () {
        const successCallback = resp => {
            let url = `${component.serverUrl}/html/Hsp.html?embedded=true&theme=symphony&timelineOnly=true&authToken=${resp.token.key}&locale=${language}`;
            setUrl(url);
        };

        const failureCallback = ({ response: { data: { errorCode } } }) => {
            if (errorCode) {
                dispatchAppNotification(
                    translate(errorCode),
                    CONSTANTS.NOTIFICATION_ERROR
                );
            }
        };

        let bodyPayload = {};
        bodyPayload.user = email;
        bodyPayload.userType = SUPPLIER_USER;
        bodyPayload.serverUrl = component.serverUrl;

        APIService.postRequest(
            URLMap.getProduct360Token(),
            bodyPayload,
            successCallback,
            failureCallback,
            {
                [CONFIG.SIGN_UP_HEADER]: match.params.orsId,
                [CONFIG.PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    return (
        <Card className="external-link-width" data-testid="p360_timeline">
            <Card.Header title={component.title} />
            <Card.Body>
                <Iframe src={url}
                    className="external-link-iframe"
                    height={getHeight(component, window.innerHeight)}
                />
            </Card.Body>
        </Card>
    );
};
export default Product360Timeline;


