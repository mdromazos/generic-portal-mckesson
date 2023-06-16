import React, { useState, useEffect, useContext } from 'react';
import { Panel } from "@informatica/droplets-core";
import { useTranslation } from "react-i18next";
import PortalCardView from "../portalCardView";
import './index.css';
import CONFIG from '../../../config/config';
import APIService from '../../../utils/apiService';
import { APIMap } from '../../../utils/apiMappings';
import { URLMap } from '../../../utils/urlMappings';
import { StateContext } from '../../../context/stateContext';
import { getPortalConfigMapKey, generateViewId } from "../../../utils/utilityService";
import { home_icon } from '@informatica/archipelago-icons';

const PortalsView = ({ history }) => {

    const { dispatch } = useContext(StateContext);
    const { PAGES, ACTIONS, HEADERS, NOTIFICATION_TYPE } = CONFIG;
    const { t: translate } = useTranslation();
    const [portals, setPortals] = useState([]);
    const [databasesMap, setDatabasesMap] = useState({});

    useEffect(() => {
        dispatch({
            type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
            currentPage: {
                label: [PAGES.HOME],
                type: PAGES.HOME,
                url: URLMap.portals(),
                icon: home_icon,
                id: PAGES.HOME
            }
        });
        getDatabases();
    }, []);

    const getDatabases = () => {
        const successCallback = (resp) => {
            if (resp) {
                const tempDatabasesMap = resp.reduce((databaseMap, { databaseId, label }) => {
                    databaseMap[databaseId] = label;
                    return databaseMap;
                }, {});
                setDatabasesMap(tempDatabasesMap);
                getAllPortals();
            }
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.getRequest(
            APIMap.getDatabases(),
            successCallback,
            failureCallback
        );
    };

    const updatePortalConfigMap = (portalList) => {
        if (Array.isArray(portalList)) {
            let portalConfigMap = {};
            const portals = portalList;
            portalList.forEach((portalDt) => {
                let portalMapKey = getPortalConfigMapKey(portalDt.databaseId, portalDt.portalId);
                portalConfigMap[portalMapKey] = {
                    name: portalDt.portalName,
                    orsId: portalDt.databaseId,
                    version: portalDt.version,
                    isDraft: portalDt.isDraft
                };
            });
            dispatch({
                type: ACTIONS.CREATE_PORTAL_CONFIG_MAP,
                portalConfigMap: portalConfigMap,
                portals
            });
        }
    };

    const getAllPortals = () => {
        APIService.getRequest(
            APIMap.getPortals(),
            (resp) => {
                setPortals(resp);
                updatePortalConfigMap(resp);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            }
        );
    };

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message
            }
        });
    };

    const editPortalHandler = ({databaseId, portalId}) => {
        history.push(URLMap.portalDetails(databaseId, portalId));
    };

    const discardDraftPortalRequest = (portalContext) => {

        const { databaseId, portalId, portalName } = portalContext;
        let url = APIMap.discardDraftPortal(portalId);

        const successCallback = () => {
            const deletedPageInfo = {
                type: PAGES.EDIT_PORTAL,
                id: generateViewId(PAGES.EDIT_PORTAL, databaseId, portalId)
            };
            dispatch({
                type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
                pageSettings: deletedPageInfo
            });
            getAllPortals();
            dispatchAppNotification(
                `${translate('LABEL_DISCARD_DRAFT_SUCCESS', { PORTAL_NAME: `${portalName}` })}`,
                NOTIFICATION_TYPE.SUCCESS
            );
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_DELETE_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.deleteRequest(url, successCallback, failureCallback, { [HEADERS.ORS]: databaseId });
    };

    const portalActionHandler = (portalDetails,action) => {
        const { portalId, databaseId } = portalDetails;
        
        const successCallback = () => {
            getAllPortals();
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            dispatchAppNotification( errorCode ? translate(errorCode) : translate('ERROR_GENERIC_MESSAGE'),
                NOTIFICATION_TYPE.ERROR)
        };
        APIService.putRequest(
            APIMap.portalActions(portalId,action),
            {},
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId,
            }
        );
    };

    const deletePortalRequest = (portalContext) => {
        const { databaseId, portalId, portalName } = portalContext;
            const deletedPageInfo = {
                type: PAGES.EDIT_PORTAL,
                id: generateViewId(PAGES.EDIT_PORTAL, databaseId, portalId)
            };
            dispatch({
                type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
                pageSettings: deletedPageInfo
            });
            getAllPortals();
            dispatchAppNotification(
                `${translate('LABEL_DELETE_SUCCESS_MESSAGE', { PORTAL_NAME: `${portalName}` })}`,
                NOTIFICATION_TYPE.SUCCESS
            );
    };

    return <Panel className="portal__config__panel" title={translate("LABEL_PORTALS")}>
        {portals.length > 0
            ? portals.map(portal => (
                <PortalCardView
                    portal={portal}
                    databaseLabel={databasesMap[portal.databaseId]}
                    history={history}
                    deletePortalRequest={deletePortalRequest}
                    editPortalHandler={editPortalHandler}
                    discardDraftPortalRequest={discardDraftPortalRequest}
                    portalActionHandler={portalActionHandler}
                />
            )) 
            : <div className="no__portal__message">
                <div>{translate('LABEL_NO_PORTAL_DISPLAY')}</div>
                <div>{translate('LABEL_CLICK_CREATE_PORTAL')}</div>
                <div>{translate('LABEL_CLICK_IMPORT_PORTAL')}</div>
            </div>
        }
    </Panel>;
};
export default PortalsView;
