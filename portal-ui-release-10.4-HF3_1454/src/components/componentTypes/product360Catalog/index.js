import React, { useEffect, useContext, useState } from 'react';
import { Card, Dropdown, Toolbar } from '@informatica/droplets-core';
import { getHeight, getCookie, getLanguageProduct360Components} from "../../../common/helperUtils";
import '@informatica/droplets-core/dist/themes/archipelago/components/section.css';
import Iframe from 'react-iframe';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService';
import CONFIG from "../../../config/config";
import { StateContext } from '../../../context/stateContext';
import { useTranslation } from "react-i18next";

const Product360Catalog = ({ component,match}) => {

    const [{ notificationActions: { dispatchAppNotification } }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');
    const [catalogs, setCatalog] = useState([]);
    const { CONSTANTS, EMAIL, BE_ROW_ID, PRODUCT_360_USER_TYPE: { SUPPLIER_USER, PORTAL_ADMIN_USER }, LANGUAGE } = CONFIG;
    const beRowId = getCookie(BE_ROW_ID);
    const email = getCookie(EMAIL);
    const languageCookie = getCookie(LANGUAGE);
    const language = getLanguageProduct360Components(languageCookie);

    useEffect(() => {
        fetchToken();
    }, []);

    const fetchToken = function () {
        const successCallback = resp => {
            setToken(resp.token.key);
            fetchCatalog(resp.token.key);
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

    const fetchCatalog = function (tokenKey) {
        const successCallback = resp => {

            const catalogDropDownData = resp.map((catalog) => ({
                "value": catalog.catalogids,
                "text": catalog.catalogname
            }));
            setCatalog(catalogDropDownData);
            fetchProductData(tokenKey,catalogDropDownData[0]);
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
        bodyPayload.user = component.user;
        bodyPayload.userType = PORTAL_ADMIN_USER;
        bodyPayload.serverUrl = component.serverUrl;
        bodyPayload.externalid = beRowId;

        APIService.postRequest(
            URLMap.findCatalog(),
            bodyPayload,
            successCallback,
            failureCallback,
            {
                [CONFIG.SIGN_UP_HEADER]: match.params.orsId,
                [CONFIG.PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    const fetchProductData = (tokenKey,selectedCatalog)=>{
        let url = `${component.serverUrl}/html/Hsp.html?embedded=true&authToken=${tokenKey}&locale=${language}#editCatalog:catalogIds=${selectedCatalog.value}`;
        setUrl(url);
    }

    const catalogChangeHandler = (selectedCatalog) => {
        fetchProductData(token,selectedCatalog);
    }

    return (
            <Card className="external-link-width" data-testid="product360_catalog">
                <Card.Header title={component.title}>
                    <Toolbar>
                        <Dropdown data-testid="product360_catalog__dropdown" 
                            className="product__catalog" 
                            options={catalogs} 
                            value={catalogs.length>0?catalogs[0].value:''} 
                            onChange={catalogChangeHandler} 
                        />
                    </Toolbar>
                </Card.Header>
                <Card.Body>
                    <Iframe src={url}
                        className="external-link-iframe"
                        height={getHeight(component, window.innerHeight)}
                    />
                </Card.Body>
            </Card>
    )
};
export default Product360Catalog;


