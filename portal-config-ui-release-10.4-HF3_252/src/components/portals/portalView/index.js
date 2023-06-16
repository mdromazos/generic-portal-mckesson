import React, { useEffect, useContext } from "react";
import { Panel } from "@informatica/droplets-core";
import { useTranslation } from "react-i18next";
import PagesView from "../../portalPages/pagesView";
import CONFIG from "../../../config/config";
import APIService from "../../../utils/apiService";
import { URLMap } from "../../../utils/urlMappings";
import { APIMap } from "../../../utils/apiMappings";
import { getPortalConfigMapKey, generateViewId, getPageSetting } from "../../../utils/utilityService";
import { StateContext } from "../../../context/stateContext";
import "./index.css";

const PortalView = props => {

    const {state: {portalConfig, pageSettings, portalConfigMap}, dispatch} = useContext(StateContext);
    const { ACTIONS, PAGES, ICONS, HEADERS, NOTIFICATION_TYPE } = CONFIG;
    const { match: { params: { databaseId, portalId } }, history } = props;
    const portalMapDt = portalConfigMap[getPortalConfigMapKey(databaseId, portalId)];
    const { version } = portalMapDt;
    const { t: translate } = useTranslation();

    useEffect(() => {
        getPortal();
    }, [databaseId, portalId, version]);

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const getPortal = () => {
        APIService.getRequest(
            APIMap.getPortalBasicDetails(portalId),
            resp => {
                getPortalPages(resp);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version,
            }
        );
    };

    const getPortalPages = portalData => {
        APIService.getRequest(
            APIMap.getPortalPageSortedDetails(portalId),
            resp => {
                portalData.pages = [...resp];
                handleDispatch(portalData);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version,
            }
        );
    };

    const handleDispatch = portalConfigInfo => {

        const { generalSettings: { portalName, databaseId }, portalId, version, isDraft } = portalConfigInfo;
        const currentPageInfo = {
            label: [portalName],
            type: PAGES.EDIT_PORTAL,
            url: URLMap.portalDetails(databaseId, portalId),
            icon: ICONS.PORTAL,
            id: generateViewId(PAGES.EDIT_PORTAL, databaseId, portalId),
        };
        dispatch({
            type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
            currentPage: currentPageInfo,
        });
        dispatch({
            type: ACTIONS.SET_PORTAL_CONFIGURATION,
            portalConfig: portalConfigInfo,
        });
        const editPage = getPageSetting(currentPageInfo.id, pageSettings);
        const actionType = editPage.length === 0 ? ACTIONS.ADD_PAGE_SETTINGS : ACTIONS.UPDATE_PAGE_SETTINGS;
        dispatch({
            type: actionType,
            pageSettings: currentPageInfo,
        });
        let portalMapKey = getPortalConfigMapKey(databaseId, portalId);
        let portalConfigMap = {
            [portalMapKey]: {
                name: portalName,
                orsId: databaseId,
                version: version,
                isDraft: isDraft,
            },
        };
        dispatch({
            type: ACTIONS.UPDATE_PORTAL_CONFIG_MAP,
            portalConfigMap: portalConfigMap,
        });
    };

    return(
        <Panel className="portal__config__panel portal__pages__panel">
            <PagesView history={history} portalConfig={portalConfig} />
        </Panel>        
    );
};
export default PortalView;
