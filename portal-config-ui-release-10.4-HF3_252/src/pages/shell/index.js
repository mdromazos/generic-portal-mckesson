import React, { useContext, useState, useCallback} from 'react';
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import {
    Shell,
    Button,
    MessageBubble,
    IconButton,
    Popover,
    Bubble,
    Tooltip,
    useDialogState,
    useMessageBoxState,
    useDialogResizeDrag,
} from "@informatica/droplets-core";
import { useTranslation } from "react-i18next";
import User from "./../shell/shellHeader/user";
import About from "./../shell/shellHeader/about";
import Workspace from "../workspace";
import CONFIG from '../../config/config';
import APIService from '../../utils/apiService';
import { StateContext } from '../../context/stateContext';
import { URLMap } from '../../utils/urlMappings';
import { APIMap } from '../../utils/apiMappings';
import { getPortalConfigMapKey, generateViewId, getPageSetting } from "../../utils/utilityService";
import { information_icon, error_icon } from "@informatica/archipelago-icons"
import DialogBox from "../../components/dialogBox";
import ImportPortal from "../../components/portals/importPortal/index";

const ShellPage = ({ history }) => {

    const { PAGES, ACTIONS, ICONS, CONSTANTS, HEADERS, NOTIFICATION_TYPE, PORTAL_STATUS, NO_REDIRECT, NAV_LINK} = CONFIG;
    const { state: {
        portalConfig, pageSettings, currentPage, appNotification, portalConfigMap,
        editGeneralSettings:{editStatus, pageType, nextPage},
    }, dispatch } = useContext(StateContext);

    const [importPortalErrorMessage, setImportPortalErrorMessage] = useState(undefined);

    const draftMessageBox = useMessageBoxState();
    const closeMessageBox = useMessageBoxState();
    const importPortalDialogBox = useDialogState();
    const resize = useDialogResizeDrag({ ...importPortalDialogBox, enableResizing: null });

    const { t: translate } = useTranslation();

    const handleToggleCloseMessageBox = useCallback((url) => {
        dispatch({
            type: ACTIONS.EDIT_GENERAL_SETTINGS_PAGE_STATUS,
            dialogBoxVisible: !closeMessageBox.closed,
            editStatus: true,
            nextPage:url
        });
        closeMessageBox.open();
    }, []);

    const closeButtonHandler = (url) => {
        if (currentPage.type === PAGES.CREATE_PORTAL || currentPage.type === PAGES.CREATE_PAGE
                || currentPage.type === PAGES.EDIT_PORTAL_GENERAL || currentPage.type === PAGES.EDIT_PAGE 
                || currentPage.type === PAGES.CREATE_RUNTIME_CONFIG
                || currentPage.type === PAGES.CREATE_SSO_CONFIG) {
            handleToggleCloseMessageBox(url);
        } else {
            closePageView();
        }
    };

    const publishConfiguration = () => {

        const { portalId, generalSettings: { portalName, databaseId }} = portalConfig;
        const url = APIMap.publishPortal(portalId);
        APIService.postRequest(
            url,
            {},
            () => {
                const deletedPageInfo = {
                    type: PAGES.EDIT_PORTAL,
                    id: generateViewId(PAGES.EDIT_PORTAL, databaseId, portalId)
                };
                dispatch({
                    type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
                    pageSettings: deletedPageInfo
                });
                dispatch({
                    type: ACTIONS.ADD_APP_NOTIFICATION,
                    notificationConfig: {
                        type: NOTIFICATION_TYPE.SUCCESS,
                        message: `${translate('PORTAL_PUBLISH_SUCCESS_MESSAGE', { PORTAL_NAME: `${portalName}` })}`
                    }
                });
                redirectToPortalPage(URLMap.portals());
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
                } else {
                    dispatchAppNotification(translate('PORTAL_PUBLISH_ERROR_MESSAGE'), NOTIFICATION_TYPE.ERROR)
                }
            },
            {
                [HEADERS.ORS]: databaseId
            }
        );
    };

    const redirectToPortalPage = (url) => {
        history.push(url);
    };

    const handleCreatePage = () => {
        const { generalSettings : { databaseId }, portalId } = portalConfig;
        editGeneralSettings(true, !closeMessageBox.closed, URLMap.createPortalPage(databaseId, portalId));
    };

    const createNewPortal = () => {
        editGeneralSettings(true, !closeMessageBox.closed, URLMap.createPortal());
    };

    const getAppNotificationMessage = () => {
        let notificationObj;
        if (appNotification) {
            notificationObj = (
                <MessageBubble 
                    type={appNotification[0].type}
                    timeout={CONSTANTS.NOTIFICATION_TIMEOUT}
                    onClose={onNotificationClose} 
                    dismissible
                >
                    { 
                        appNotification.map(notificationConfig => (
                        <div>
                            {notificationConfig.message}
                        </div>
                    ))}
                </MessageBubble>
            );
        }
        return notificationObj;
    };

    const onNotificationClose = () => {
        dispatch({
            type: ACTIONS.REMOVE_APP_NOTIFICATION
        });
    };

    const onNavLinkClose = (page) => {
        if (currentPage.type === PAGES.EDIT_PAGE || currentPage.type === PAGES.CREATE_PAGE
            || currentPage.type === PAGES.EDIT_PORTAL_GENERAL) {
            if (pageType === NAV_LINK) {
                editGeneralSettings(false, false, nextPage);
            } else {
                const { generalSettings : { databaseId}, portalId} = portalConfig;
                editGeneralSettings(false, false, URLMap.portalDetails(databaseId, portalId));
            }
        } else if (page.id === currentPage.id) {
            editGeneralSettings(false, false, URLMap.portals());
        }
        const removePageSettings = {
            type: page.type,
            id: page.id
        };
        dispatch({
            type: ACTIONS.REMOVE_PAGE_SETTINGS,
            pageSettings: removePageSettings
        });
    };

    const closePageView = (event) => {
        onNavLinkClose(currentPage);
    };
    
    function editGeneralSettings(status, visible, redirectURL, type, navClick){
        dispatch({
            type: ACTIONS.EDIT_GENERAL_SETTINGS_PAGE_STATUS,
            editStatus: status,
            dialogBoxVisible: visible,
            nextPage: redirectURL,
            pageType: navClick
        });
        if(type !== NO_REDIRECT && redirectURL){
            history.push(redirectURL);
        }
        return true;
    }

    const checkForEdit = (event, nextPage, navClick) => {
        if (currentPage.type === PAGES.CREATE_PAGE ||
            currentPage.type === PAGES.EDIT_PAGE ||
            currentPage.type === PAGES.CREATE_SSO_CONFIG) {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            closeMessageBox.open();
            editGeneralSettings(true, true, nextPage, NO_REDIRECT, navClick);
            return false;
        }

        if(editStatus){
            if(event && event.preventDefault){
                event.preventDefault();
            }
            closeMessageBox.open();
            editGeneralSettings(true, true, nextPage, NO_REDIRECT, navClick);
            return false;
        }
        editGeneralSettings(false, false, nextPage);
    }

    const getCloseHandlerCallback = (event, page) => {
        if( currentPage.type === PAGES.EDIT_PORTAL_GENERAL || 
            currentPage.type === PAGES.CREATE_PORTAL || 
            currentPage.type === PAGES.CREATE_SSO_CONFIG){
                return checkForEdit(event, page.url, NAV_LINK);
        }
        if (currentPage.type === PAGES.CREATE_PAGE ||
            currentPage.type === PAGES.EDIT_PAGE) {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            closeMessageBox.open();
            return;
        }

        return onNavLinkClose(page);
    }
      
    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message
            },
        });
    };

    const getDialogTitle = () => {
        switch (currentPage.type) {
            case PAGES.EDIT_PORTAL_GENERAL:  return  translate("LABEL_CLOSE_EDIT_PORTAL");
            case PAGES.CREATE_PAGE: return translate("LABEL_CLOSE_PAGE_DIALOG_CONTENT_HEADING");
            case PAGES.EDIT_PORTAL: return translate("LABEL_CLOSE_EDIT_PORTAL");
            case PAGES.EDIT_PAGE:  return translate("LABEL_CLOSE_EDIT_PAGE");
            case PAGES.CREATE_PORTAL:  return  translate("LABEL_CLOSE_PORTAL_DIALOG_CONTENT_HEADING");
            case PAGES.CREATE_RUNTIME_CONFIG:  return translate("LABEL_RUNTIME_CLOSE_DIALOG_TITLE");
            case PAGES.CREATE_SSO_CONFIG:  return translate("LABEL_SSO_CLOSE_DIALOG_TITLE");
            default: return translate("LABEL_CLOSE_DIALOG_CONTENT_HEADING");
        }
    }

    const getBreadCrumbs = () => {
        let breadCrumbs = [];

        if(portalConfig.status === PORTAL_STATUS.INVALID) {
            breadCrumbs.push(<>
                <span className="shell__header__separator"/>
                <img src={error_icon} alt="" className="breadcrumb__icon"/>
                <span className="label__breadcrumb">{translate("LABEL_INVALID_CONFIG")}</span>
                <Tooltip position="bottom" content={translate("LABEL_INVALID_CONFIG_INFO")}>
                    <IconButton className="breadcrumb__info">
                        <i className="aicon aicon__info info__icon" />
                    </IconButton>
                </Tooltip>
            </>);
        }
        else if(portalConfig.status === PORTAL_STATUS.RUNNING) {
            breadCrumbs.push(<>
                <span className="shell__header__separator" />
                <img src={ICONS.UP_AND_RUNNING} alt="" className="breadcrumb__icon" />
                <span className="label__breadcrumb">{translate("LABEL_PORTAL_STATUS_RUNNING")}</span>
            </>);
        }
        else {
            breadCrumbs.push(<>
                <span className="shell__header__separator" />
                <img src={ICONS.STOPPED} alt="" className="breadcrumb__icon" />
                <span className="label__breadcrumb">{translate("LABEL_PORTAL_STATUS_STOP")}</span>
            </>);
        }
        /*{ <span className="shell__header__separator"/>
                <img src={alert_icon} alt="" className="breadcrumb__icon"/>
                <span className="label__breadcrumb">{"Schema Warning"}</span>
                <Tooltip position="bottom" content={"Explanation for Schema Warning"}>
                    <IconButton className="breadcrumb__info">
                        <i className="aicon aicon__info info__icon" />
                    </IconButton>
                </Tooltip>
                <span className="shell__header__separator"/>
                <img src={error_icon} alt="" className="breadcrumb__icon"/>
                <span className="label__breadcrumb">{"Schema Error"}</span>
                <Tooltip position="bottom" content={"Explanation for Schema Warning"}>
                    <IconButton className="breadcrumb__info">
                        <i className="aicon aicon__info info__icon" />
                    </IconButton>
                </Tooltip>
        }*/    
        if(portalConfig.isDraft) {
            breadCrumbs.push(<>
                <span className="shell__header__separator"/>
                <img src={information_icon} alt="" className="breadcrumb__icon"/>
                <span className="label__breadcrumb">{translate("LABEL_USER_ACTION_DRAFT")}</span>
            </>);
        }

        return breadCrumbs;
    };

    const getPortalSettingIcon = () => {

        const { generalSettings: { databaseId }, portalId} = portalConfig;

        return <>
            <span className="shell__header__separator"/>
            <Tooltip content={translate("LABEL_PORTAL_SETTINGS")}>
                <IconButton
                    data-testid="edit-general-settings"
                    className="shell__action__menu portal__setting__icon"
                    onClick={() => editGeneralSettings(true, !closeMessageBox.closed, URLMap.editPortalGeneral(databaseId, portalId))}
                >
                    <i className="aicon aicon__settings shell__action__icon" />
                </IconButton>
            </Tooltip>
        </>;
    };

    const getMenuForDiscardDraft = () => {
        return <>
            <span className="shell__header__separator"/>
            <Popover
                on="click"
                content={
                    <Bubble position="top">
                        <Button
                            data-testid="discard-draft"
                            className="discard__draft"
                            onClick={() => draftMessageBox.open()}
                        >
                            {translate("LABEL_DISCARD_DRAFT")}
                        </Button>
                    </Bubble>
                }
                position="bottom"
                trigger={
                    <IconButton
                        data-testid="shell-menu-button"
                        className="shell__action__menu">
                        <i className="aicon aicon__action_menu shell__action__icon"/>
                    </IconButton>
                }
            />
        </>;
    };

    const discardDraftPortalRequest = () => {
        const {generalSettings: { databaseId }, portalId, version} = portalConfig;
        const successCallback = resp => {
            let lastPublishedVersion = resp.version;
            if (!lastPublishedVersion) {
                redirectToPortalPage(URLMap.portals());
                return;
            }
            const deletedPageInfo = {
                type: PAGES.EDIT_PORTAL,
                id: generateViewId(PAGES.EDIT_PORTAL, databaseId, portalId)
            };
            dispatch({
                type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
                pageSettings: deletedPageInfo
            });
            getPortal(lastPublishedVersion);
            dispatchAppNotification(
                translate("LABEL_DISCARD_DRAFT_SUCCESS_MESSAGE"),
                NOTIFICATION_TYPE.SUCCESS
            );
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
            } else {
                dispatchAppNotification(translate("ERROR_DELETE_MESSAGE"),NOTIFICATION_TYPE.ERROR)
            }
        };
        APIService.deleteRequest(
            APIMap.discardDraftPortal(portalId),
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version
            }
        );
    };

    const getPortal = lastPublishedVersion => {

        const { generalSettings : { databaseId}, portalId } = portalConfig;

        APIService.getRequest(
            APIMap.getPortalDetails(portalId),
            resp => {
                if (resp.pages !== undefined) {
                    getPortalPages(resp, lastPublishedVersion);
                } else {
                    handleDispatch(resp);
                }
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR)
                }
            },
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: lastPublishedVersion
            }
        );
    };

    const getPortalPages = (response, lastPublishedVersion) => {

        const { generalSettings : { databaseId}, portalId } = portalConfig;

        APIService.getRequest(
            APIMap.getPortalPageSortedDetails(portalId),
            resp => {
                response.pages = [...resp];
                handleDispatch(response);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR)
                }
            },
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: lastPublishedVersion
            }
        );
    };

    const importButtonHandler = () => {
        importPortalDialogBox.open();
        setImportPortalErrorMessage(undefined);
    };

    const importPortalHandler = (values, fileData) => {
        
        const files = new FormData();
        files.append(CONFIG.FILE_OPERATIONS.FILE, fileData[0]);
        files.append(CONFIG.FILE_OPERATIONS.PORTAL_NAME,values.portalName);
        files.append(CONFIG.FILE_OPERATIONS.IS_PORTAL_EXISTS,values.isExistingPortal);
        files.append(CONFIG.FILE_OPERATIONS.SYSTEM_NAME,values.sourceSystem);
        files.append(CONFIG.FILE_OPERATIONS.IS_EXTERNAL_USER_MANAGEMENT_ENABLED,values.isExternalUserManagementEnabled);
        if(values.isExistingPortal) {
            files.append(CONFIG.FILE_OPERATIONS.PORTAL_ID,values.portalId);
        }

        const successCallback = (responseData) => {
            redirectToPortalPage('/');
            dispatchAppNotification(`${translate('LABEL_IMPORT_SUCCESS_MESSAGE',
                { PORTAL_NAME: `${responseData.portalName}` })}`,
                NOTIFICATION_TYPE.SUCCESS
            );
            setImportPortalErrorMessage(undefined);
            importPortalDialogBox.close();
        }

        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                setImportPortalErrorMessage(translate(errorCode));
            } else {
                setImportPortalErrorMessage(translate('LABEL_METADATA_ERROR'));
            }
        }

        APIService.postRequest(
            APIMap.importPortal(),
            files,
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: values.database
            },
        );
    };

    const handleDispatch = portalConfigInfo => {
        const { generalSettings: { portalName, databaseId }, portalId, version, isDraft } = portalConfigInfo;
        const currentPageInfo = {
            label: [portalName],
            type: PAGES.EDIT_PORTAL,
            url: URLMap.portalDetails(databaseId, portalId),
            icon: ICONS.PORTAL,
            id: generateViewId(PAGES.EDIT_PORTAL, databaseId, portalId)
        };
        dispatch({
            type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
            currentPage: currentPageInfo
        });
        dispatch({
            type: ACTIONS.SET_PORTAL_CONFIGURATION,
            portalConfig: portalConfigInfo
        });
        const editPage = getPageSetting(currentPageInfo.id, pageSettings);
        const actionType = editPage.length === 0 ? ACTIONS.ADD_PAGE_SETTINGS : ACTIONS.UPDATE_PAGE_SETTINGS;
        dispatch({
            type: actionType,
            pageSettings: currentPageInfo
        });
        
        let portalMapKey = getPortalConfigMapKey(databaseId, portalId);

        let portalConfigMap = {
            [portalMapKey]: {
                name: portalName,
                orsId: databaseId,
                version: version,
                isDraft: isDraft
            }
        };
        dispatch({
            type: ACTIONS.UPDATE_PORTAL_CONFIG_MAP,
            portalConfigMap: portalConfigMap
        });
    };

    const displayPublishPortalButton = () => {
        
        const { generalSettings:{ databaseId}, portalId } = portalConfig;
        let portalMapKey = getPortalConfigMapKey(databaseId, portalId);
        let publishButton;

        if (currentPage.type === PAGES.EDIT_PORTAL) {
            if (portalConfigMap[portalMapKey] && portalConfigMap[portalMapKey].isDraft) {
                if(portalConfig.status === PORTAL_STATUS.RUNNING) {
                    publishButton = <Tooltip content={translate("LABEL_PUBLISH_RUNNING_PORTAL")}>
                        <Button data-testid="publish-button" variant="call-to-action" disabled>
                            {translate('LABEL_PUBLISH')}
                        </Button>
                    </Tooltip>;
                }
                else {
                    publishButton = 
                        <Button
                            data-testid="publish-button"
                            variant="call-to-action"
                            onClick={publishConfiguration} >
                        {translate('LABEL_PUBLISH')}
                    </Button>;
                }
            }
        }
        return publishButton;
    };

    const breadCrumbs = (currentPage.label).map((label) => (translate(label)));
    breadCrumbs.unshift(<img src={`${currentPage.icon}`} alt="" className="breadcrumb-icon" />);

    if(currentPage.type === PAGES.EDIT_PORTAL) {
        let lastText = breadCrumbs.pop();
        breadCrumbs.push(
            <>
                <span className="breadcrumb__label">{lastText}</span>
                { getBreadCrumbs() }
            </>
        );
    }

    return <Shell>
        <Shell.Header productName={translate("PRODUCT_NAME")}>
            <div className="profile__section">
                <User history={history} />
                <About />
            </div>
        </Shell.Header>
        <Shell.Nav data-testid="navigation-list">
            {
                pageSettings.map((page) => {
                    let navLinkActiveClass = (page.id === currentPage.id) ? "selected-nav-link" : "";
                    let onCloseHandler;
                    if (page.id !== PAGES.HOME) {
                        onCloseHandler = (event) => getCloseHandlerCallback(event, page)
                    }
                    return (<Shell.Nav.NavLink
                        data-testid="navigation-link"
                        onClick={(event) => checkForEdit(event, page.url, NAV_LINK) }
                        label={translate(page.label)}
                        icon={<img src={`${page.icon}`} alt="" />}
                        onClose={onCloseHandler}
                        className={navLinkActiveClass}
                    />);
                })
            }
        </Shell.Nav>
        <Shell.Main>
            {getAppNotificationMessage()}
            <Shell.Page
                breadcrumbs={breadCrumbs}
                buttonGroup={
                    <>
                        {   (currentPage.type === PAGES.HOME) &&
                            (
                                <>
                                    <Button data-testid="import-portal" className="import__portal" onClick={importButtonHandler}>
                                        {translate("LABEL_IMPORT_PORTAL")}
                                    </Button>
                                    <Button
                                        data-testid="create-new-portal"
                                        variant="primary"
                                        onClick={createNewPortal}>
                                        {translate('LABEL_CREATE_PORTAL')}
                                    </Button> 
                                </>
                            )
                        }
                        {
                            (currentPage.type === PAGES.EDIT_PORTAL)
                            && <Button
                                    data-testid="create-page"
                                    variant="primary" 
                                    onClick={handleCreatePage}>{translate('LABEL_CREATE_PAGE')}
                                </Button>
                        }
                        {displayPublishPortalButton()}
                        {
                            (currentPage.type === PAGES.EDIT_PORTAL) && getPortalSettingIcon()
                        }
                        {
                            (currentPage.type === PAGES.EDIT_PORTAL) && (portalConfig.isDraft) && getMenuForDiscardDraft()
                        }
                        {
                            ( currentPage.type === PAGES.EDIT_PORTAL) && <span className="shell__header__separator"/>
                        }
                        {
                            (
                                currentPage.type === PAGES.CREATE_PAGE ||
                                currentPage.type === PAGES.EDIT_PAGE ||
                                currentPage.type === PAGES.EDIT_PORTAL ||
                                currentPage.type === PAGES.CREATE_PORTAL ||
                                currentPage.type === PAGES.EDIT_PORTAL_GENERAL ||
                                currentPage.type === PAGES.CREATE_RUNTIME_CONFIG ||
                                currentPage.type === PAGES.CREATE_SSO_CONFIG
                            )
                            && <IconButton className="shell-header-close-icon">
                                <Tooltip content={translate("LABEL_CLOSE")}>
                                    <i className="aicon aicon__close-solid close-icon"
                                        onClick={()=>closeButtonHandler(currentPage.url)}
                                        data-testid="close-button"
                                    />
                                </Tooltip>
                            </IconButton>
                        }
                    </>
                }
            >
                <Workspace />
                {
                    !importPortalDialogBox.closed && <ImportPortal
                        displayImportDialogBox={importPortalDialogBox}
                        importPortalHandler={importPortalHandler}
                        importPortalErrorMessage={importPortalErrorMessage}
                        resize={resize}
                    />
                }
                {
                    !draftMessageBox.closed && 
                        (<DialogBox
                            dialogBox={draftMessageBox}
                            title={translate("PORTAL_DISCARD_DRAFT_DIALOG_HEADER")}
                            messageContentTitle={translate("LABEL_DISCARD_DRAFT_PORTAL_DIALOG_CONTENT_HEADING")}
                            messageContentBody={translate("PORTAL_DISCARD_DRAFT_DIALOG_CONTENT")}
                            clickHandler={discardDraftPortalRequest}
                            actionButtonText={translate("LABEL_DISCARD_BUTTON")}
                            cancelButtonText={translate("LABEL_DISCARD_BUTTON_CANCEL")}
                        />)
                }
                {
                    !closeMessageBox.closed && 
                        (<DialogBox
                            dialogBox={closeMessageBox}
                            title={translate("LABEL_CLOSE_DIALOG_HEADER")}
                            messageContentTitle= {getDialogTitle()}
                            messageContentBody={
                                !(currentPage.type === PAGES.CREATE_RUNTIME_CONFIG)
                                    ? translate("LABEL_CLOSE_DIALOG_CONTENT") : ''
                            }
                            clickHandler={closePageView}
                            actionButtonText={translate("LABEL_CLOSE_BUTTON")}
                            cancelButtonText={translate("LABEL_CLOSE_BUTTON_CANCEL")}
                        />)
                }
            </Shell.Page>
        </Shell.Main>
    </Shell>;
};
export default ShellPage;
