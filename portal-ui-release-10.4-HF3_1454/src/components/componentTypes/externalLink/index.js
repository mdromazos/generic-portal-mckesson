import React, { useRef,useEffect, useContext } from 'react';
import { Card } from '@informatica/droplets-core';
import {getHeight, getCookie} from "../../../common/helperUtils";
import '@informatica/droplets-core/dist/themes/archipelago/components/section.css';
import Iframe from 'react-iframe';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService'; 
import CONFIG from "../../../config/config";
import { StateContext } from '../../../context/stateContext';
import { useTranslation } from "react-i18next";

const ExternalLink = ({ component, match, beName}) => {
    const externalLink = useRef();
    const [{ notificationActions : {dispatchAppNotification}}] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const { LOOKUP_PROXY_PAYLOAD:{API_URL, HTTP_METHOD, PROXY_ATTRIBUTE},
            HTTP_METHOD:{GET}, CONSTANTS } = CONFIG;
    const beRowId = getCookie(CONFIG.BE_ROW_ID);
    useEffect(() => {
        if ( component.url &&
            component.url.includes(CONFIG.EXTERNAL_LINK_PARAMS.BE_NAME_PARAM) &&
            component.url.includes(CONFIG.EXTERNAL_LINK_PARAMS.ROW_ID_PARAM)
        ) {
            let currentIframe = externalLink.current; 
            currentIframe.firstChild.style.border = "none";
            if (currentIframe.firstChild.contentDocument) {
                fetchBEData(currentIframe);
            }
        }
    }, []);

    const fetchBEData = function (x) {
        const successCallback = response => {
            x.firstChild.contentDocument.write(
                "<div class='external'>" +
                x.innerHTML +
                "<h1>" +
                JSON.stringify(response) +
                "</h1></div>"
            );
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };

        let payLoad = {};
        payLoad[API_URL] =   URLMap.getBEData(
            match.params.orsId,
            beName,
            beRowId
        )
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = beRowId;
        APIService.postRequest(
            URLMap.getProxy(),payLoad,
            successCallback,
            failureCallback,
            { 
                [CONFIG.PORTAL_ID_HEADER]: match.params.id, 
                [CONFIG.ORS_ID]: match.params.orsId 
            }
        );
    };

    return (
        <Card className="external-link-width" data-testid="external__link__component">
            <Card.Header title={component.title} />
            <Card.Body>
                <div ref={externalLink} data-testid="IFrame__container">
                    <Iframe src={component.url} 
                        className="external-link-iframe" 
                        height={getHeight(component, window.innerHeight)}
                    />
                </div>
            </Card.Body>
        </Card>
    );
};
export default ExternalLink;    


