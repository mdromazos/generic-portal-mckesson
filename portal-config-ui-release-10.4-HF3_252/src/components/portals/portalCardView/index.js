import React, {useState, useCallback, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
    Card,
    IconButton,
    Menu,
    Tooltip,
    Dialog,
    useDialogState,
    Form,
    FilePicker,
    Button,
    useDialogResizeDrag,
} from "@informatica/droplets-core";
import { URLMap } from "../../../utils/urlMappings";
import CONFIG from "../../../config/config";
import { StateContext } from "../../../context/stateContext";
import "./index.css";
import DialogBox from "../../dialogBox";
import { APIMap } from '../../../utils/apiMappings';
import APIService from '../../../utils/apiService';
import { saveAs } from 'file-saver';
import {checkIfFilesAreCorrectType} from "../../../utils/utilityService";
import { error_icon } from "@informatica/archipelago-icons";
 
const PortalCardView = ({ portal, databaseLabel, history, deletePortalRequest, editPortalHandler,
    discardDraftPortalRequest, portalActionHandler }) => {
 
    const { t: translate } = useTranslation();
    const { dispatch } = useContext(StateContext);
    const {
        ACTIONS, PORTAL_STATES, HEADERS, NOTIFICATION_TYPE, FILE_TYPE:{ZIP, ZIP_FILE},
        LOCALIZATION_BUNDLE_MENU, LOCALIZATION_BUNDLE_MENU:{SUBMENU:{IMPORT_LANGUAGE,EXPORT_LANGUAGE}},
		ICONS, PORTAL_STATUS , PORTAL_USER_ACTION, PORTAL_STATUS_ACTION, PORTAL_ACTION_STATES,CONSTANTS
    } = CONFIG;
    const {
        portalId, portalName, databaseId, lastUpdatedDate, isDraft, lastUpdatedBy, hasPublished, status, hasSSO,
    } = portal;
    const [hideMessageBox, toggleMessageBoxVisibility] = useState(true);
    const [actionType, setActionType] = useState('');     
    const [importLanguageFiles, setImportLanguageFiles] = useState([]);
    const [fileTypeError, setFileTypeError] = useState(true);
    const dialog = useDialogState();
    
    const handleToggleMessageBox = useCallback(() => {
        toggleMessageBoxVisibility(!hideMessageBox);
    }, [hideMessageBox, toggleMessageBoxVisibility]);
    const openPortalConfig = () => {
        history.push(URLMap.portalDetails(databaseId, portalId));
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
 
    const getPortalUiUrlCopied = portalUiUrl => {
        let elm = document.createElement("textarea");
        elm.value = portalUiUrl;
        elm.style.position = "absolute";
        elm.style.left = "-9999px";
        document.body.appendChild(elm);
        elm.select();
 
        document.execCommand("copy");
        document.body.removeChild(elm);
        dispatchAppNotification(
            `${translate("PORTAL_USER_ACTION_COPY_URL_MESSAGE", {PORTAL_NAME: `${portalName}`})}`,
            NOTIFICATION_TYPE.SUCCESS
        );
    };
 
    const deletePortal = () => {
        let url = APIMap.deletePortal(portalId, isDraft);
        
        const successCallback = () => {
            deletePortalRequest(portal);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                if(errorCode === CONSTANTS.PORTAL_DRAFT_ERROR){
                    setActionType(PORTAL_ACTION_STATES.FORCE_DELETE);
                    toggleMessageBoxVisibility(false);
                }else{
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                }
            } else {
                dispatchAppNotification(translate('ERROR_DELETE_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.deleteRequest(url, successCallback, failureCallback, { [HEADERS.ORS]: databaseId });
    };
 
 
    const forceDeletePortal = () => {
        let url = APIMap.deletePortal(portalId+"?action=ForceDelete", isDraft);
 
        const successCallback = () => {
            deletePortalRequest(portal);
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
 
    const deletePortalWarningMessageBox = () => {
        const clickHandler = {
            [PORTAL_ACTION_STATES.DISCARD_DRAFT]: () => discardDraftPortalRequest(portal),
            [PORTAL_ACTION_STATES.DELETE]: deletePortal,
            [PORTAL_ACTION_STATES.FORCE_DELETE]: forceDeletePortal,
        };
        const dialogBox = {
            close: handleToggleMessageBox,
        };
        return <DialogBox 
            title = {translate(actionType+"_DIALOG_HEADER")}
            messageContentTitle = {`${translate(actionType+"_DIALOG_CONTENT_HEADING", {PORTAL_NAME: `${portalName}`})}`}
            messageContentBody = {translate(actionType+"_DIALOG_CONTENT")}
            clickHandler = {clickHandler[actionType]}
            hideMessageBox={hideMessageBox}
            dialogBox={dialogBox}
            actionButtonText = {translate(actionType === PORTAL_ACTION_STATES.DISCARD_DRAFT ? "LABEL_DISCARD_BUTTON" : "PORTAL_DELETE_DIALOG_DELETE_BTN")}
            cancelButtonText = {translate("LABEL_DISCARD_BUTTON_CANCEL")}
        />;
    };
 
    const exportHandler = () => {
        APIService.getRequest(
            APIMap.exportPortal(portalId),
            (responseData) => {
                let blob = new Blob([responseData], { type: ZIP_FILE});
                let fileName = `${portalId}-${databaseId}.${ZIP}`;
                saveAs(blob, fileName);
                dispatchAppNotification(
                    `${translate("PORTAL_USER_ACTION_EXPORT_MESSAGE", { PORTAL_NAME: `${portalName}` })}`,
                    NOTIFICATION_TYPE.INFO
                );
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
            {
                [HEADERS.ORS]: databaseId
            },
            {responseType:CONFIG.FILE_TYPE.BLOB}
        );
    };
 
    const runtimeConfigurationHandler = () => {
        history.push(URLMap.runtimeSettings(databaseId, portalId));
    };
 
    const ssoConfigurationHandler = () => {
        history.push(URLMap.ssoSettings(databaseId, portalId));
    };
 
    const importLanguageBundleHandler = (fileData) => {
        const files = new FormData();
        files.append(CONFIG.FILE_OPERATIONS.FILE, fileData[0]);
        files.append(CONFIG.FILE_OPERATIONS.PORTAL_NAME, portalName);
 
        APIService.postRequest(
            APIMap.importLanguageBundle(portalId),
            files,
            () => {
                setImportLanguageFiles([]);
                dispatchAppNotification(`${translate('IMPORT_LANGUAGE_SUCCESS_MESSAGE', { PORTAL_NAME: `${portalName}` })}`, NOTIFICATION_TYPE.SUCCESS);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
            {
                [HEADERS.ORS]: databaseId
            },
        );
    };
 
    const handleImport = useCallback(() => {
        importLanguageBundleHandler(importLanguageFiles);
        dialog.close();
    }, [importLanguageBundleHandler, importLanguageFiles]);
  
    const exportLanguageHandler = (portalId) => {
        APIService.getRequest(
            APIMap.exportLanguageBundle(portalId),
                (responseData) => {
                    let blob = new Blob([responseData], { type: ZIP_FILE});
                    let fileName = portalId + "-" + databaseId + "." + ZIP;
                    saveAs(blob, fileName);
                dispatchAppNotification(
                    `${translate('EXPORT_LANGUAGE_SUCCESS_MESSAGE', { PORTAL_NAME: `${portalName}` })}`,
                    NOTIFICATION_TYPE.INFO
                );
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
            {
                [HEADERS.ORS]: databaseId
            },
            {responseType:CONFIG.FILE_TYPE.BLOB}
        );
    };
 
    let userActions = [
        {
            name: PORTAL_USER_ACTION.EDIT,
            icon: <i className="aicon aicon__edit menu__icon" />,
            clickHandler: () => {
                editPortalHandler(portal);
            }
        },
        {
            name: PORTAL_USER_ACTION.EXPORT,
            icon: <i className="aicon aicon__export menu__icon" />,
            clickHandler: () => {
                exportHandler();
            }
        },
        {
            name: PORTAL_USER_ACTION.COPY_URL,
            icon: <i className="aicon aicon__redo menu__icon" />,
            clickHandler: () => {
                getPortalUiUrlCopied(URLMap.getPortalUiUrl(databaseId, portalId));
            }
        },
        {
            name: PORTAL_USER_ACTION.START,
            icon: <i className="aicon aicon__run-now menu__icon" />,
            clickHandler: () => {
                portalActionHandler(portal, PORTAL_STATUS_ACTION.START);
            }
        },
        {
            name: PORTAL_USER_ACTION.STOP,
            icon: <i className="aicon aicon__stop menu__icon" />,
            clickHandler: () => {
                portalActionHandler(portal, PORTAL_STATUS_ACTION.STOP);
            }
        },
        {
            name: PORTAL_USER_ACTION.RUNTIME_CONFIG,
            icon: <i className="aicon aicon__settings menu__icon" />,
            clickHandler: () => {
                runtimeConfigurationHandler()
            }
        },
        {
            name: PORTAL_USER_ACTION.SSO_CONFIG,
            icon: <i className="aicon aicon__settings menu__icon" />,
            clickHandler: () => {
                ssoConfigurationHandler();
            }
        },
		{    
            name: LOCALIZATION_BUNDLE_MENU.TITLE,
            subMenu:true,
            subMenuItems:[
                {
                    name: IMPORT_LANGUAGE,
                    icon: <IconButton><i className="aicon aicon__import" /></IconButton>,
                    clickHandler: () => { dialog.open(); }
                },
                {
                    name: EXPORT_LANGUAGE,
                    icon: <IconButton><i className="aicon aicon__export" /></IconButton>,
                    clickHandler: () => { exportLanguageHandler(portalId); }
                }
            ]
		},
        {
            name: PORTAL_USER_ACTION.DISCARD_DRAFT,
            clickHandler: () => {
                setActionType(PORTAL_ACTION_STATES.DISCARD_DRAFT);
                toggleMessageBoxVisibility(false);
            }
        },
        {
            name: PORTAL_USER_ACTION.DELETE,
            icon: <i className="aicon aicon__delete menu__icon" />,
            clickHandler: () => {
                setActionType(PORTAL_ACTION_STATES.DELETE);
                toggleMessageBoxVisibility(false);
            }
        }
    ];
 
    const setUserActionsBasedOnState = () => {
        if (isDraft) {
            userActions = userActions.filter((action) => {
               return !(
                    action.name === PORTAL_USER_ACTION.COPY_URL ||
                    action.name === PORTAL_USER_ACTION.EXPORT ||
                    action.name === PORTAL_USER_ACTION.START
                );
            });
            userActions = userActions.map(item => {
                if(Array.isArray(item.subMenuItems)){
                    return {
                        ...item,
                        subMenuItems : item.subMenuItems.filter(menu => menu.name !== EXPORT_LANGUAGE)
                    }
                } return item;
            });
        } else {
            userActions = userActions.filter(action => {
                return !(
                    action.name === PORTAL_USER_ACTION.DISCARD_DRAFT
                );
            });
        }
    };
 
    const setUserActionBasedOnPublished = () => {
        if(!hasPublished) {
            userActions = userActions.filter(action => {
                return !(
                    action.name === PORTAL_USER_ACTION.RUNTIME_CONFIG ||
                    action.name === PORTAL_USER_ACTION.DELETE
                );
            });
        }
    };
 
    const setUserActionBasedOnSSO = () => {
        if(!hasSSO) {
            userActions = userActions.filter(action => {
                return !(
                    action.name === PORTAL_USER_ACTION.SSO_CONFIG
                );
            });
        }
    };
 
    const setUserActionsBasedOnStatus = () => {
        userActions = userActions.filter(action => {
            if(status === PORTAL_STATUS.INVALID) {
                return !(action.name === PORTAL_USER_ACTION.START || action.name === PORTAL_USER_ACTION.RUNTIME_CONFIG ||
                    action.name === PORTAL_USER_ACTION.EXPORT || action.name === PORTAL_USER_ACTION.STOP || 
                    action.name === PORTAL_USER_ACTION.COPY_URL || action.name === LOCALIZATION_BUNDLE_MENU.TITLE 
                );
            }
            else if (status === PORTAL_STATUS.RUNNING) {
                return !(action.name === PORTAL_USER_ACTION.START || action.name === PORTAL_USER_ACTION.DELETE);
            }
            else {
                return !(action.name === PORTAL_USER_ACTION.STOP);
            }
        });
    };
 
    setUserActionBasedOnPublished();
    setUserActionsBasedOnState();
    setUserActionsBasedOnStatus();
    setUserActionBasedOnSSO();
 
    const getDraftIdentifier = () => {
        let draftIdentifier = null;
        if (isDraft) {
            draftIdentifier = (
                <tr>
                    <td>
                        {PORTAL_STATES.DRAFT}
                        <Tooltip position="right" content={translate("PORTAL_DRAFT_INFO")}>
                            <IconButton data-testid={`draft_${portalName}`}>
                                <i className="aicon aicon__info info__icon" />
                            </IconButton>
                        </Tooltip>
                    </td>
                </tr>
            );
        }
        return draftIdentifier;
    };
 
    const getPortalStatus = () => {
        let portalStatus = null;
        let statusList = [];
 
        if(status === PORTAL_STATUS.INVALID) {
            statusList.push(<>
                <img src={error_icon} alt="" className="status__icon first__status__icon"/>
                <span className="status__label" data-testid={`invalid_${portalName}`}>{translate("LABEL_INVALID_CONFIG")}</span>
                <Tooltip position="bottom" content={translate("LABEL_INVALID_CONFIG_INFO")}>
                    <IconButton className="portal__card__info__icon">
                        <i className="aicon aicon__info info__icon" />
                    </IconButton>
                </Tooltip>
            </>);
        }
        else if(status === PORTAL_STATUS.RUNNING) {
            statusList.push(<>
                <img src={ICONS.UP_AND_RUNNING} alt="" className="status__icon first__status__icon"/>
                <span className="status__label" data-testid={`running_${portalName}`}>{translate("LABEL_PORTAL_STATUS_RUNNING")}</span>
            </>);
        }
        else {
            statusList.push(<>
                <img src={ICONS.STOPPED} alt="" className="status__icon first__status__icon"/>
                <span className="status__label" data-testid={`stopped_${portalName}`}>{translate("LABEL_PORTAL_STATUS_STOP")}</span>
            </>);
        }
        
        /*{    <span className="shell__header__separator status__seperator"/>
                    <img src={alert_icon} alt="" className="status__icon"/>
                    {"Schema Warning"}
                    <Tooltip position="bottom" content={"Explanation for Schema Warning"}>
                        <IconButton>
                            <i className="aicon aicon__info info__icon" />
                        </IconButton>
                    </Tooltip>
 
                    <span className="shell__header__separator status__seperator"/>
                    <img src={error_icon} alt="" className="status__icon"/>
                    {"Schema Error"}
                    <Tooltip position="bottom" content={"Explanation for Schema Error"}>
                        <IconButton>
                            <i className="aicon aicon__info info__icon" />
                        </IconButton>
                    </Tooltip>
        }*/
 
        portalStatus = (<tr> 
            <td className="portal__status__row">
                {statusList}
            </td>
        </tr>);
 
        return portalStatus;
    };
 
    const getLastUpdateDate = date => {
        let dateExcludeTimestamp = date.split(" ");
        dateExcludeTimestamp.pop();
        return dateExcludeTimestamp.join(" ");
    };
    
    useEffect(() => {
        importLanguageFiles.length > 0 && checkIfFilesAreCorrectType(importLanguageFiles[0]) 
            ? setFileTypeError(false)
            : setFileTypeError(true);
    }, [setFileTypeError, importLanguageFiles]);
 
    const resize = useDialogResizeDrag({ ...dialog, enableResizing: null });
    return(
        <>
            {!hideMessageBox && deletePortalWarningMessageBox()}
            
            <Card className="card_section">
                <Card.Header title={portalName}>
                    <Menu trigger={
                            <IconButton data-testid="user_action_icon">
                                <i className="aicon aicon__action_menu user-action-icon" />
                            </IconButton>
                        }
                    >
                        {
                            userActions.length && userActions.map((action) => (
                                action.subMenu ?
                                (<>
                                    <Menu.Separator />
                                    <Menu.Submenu
                                        label={translate(action.name)}
                                        key={`${action.name}_${portalId}`}
                                        data-testid={`${action.name}_${portalName}`}
                                    >
                                        {
                                            action.subMenuItems.map(subMenu=>{
                                                return  <Menu.Item
                                                    key={`${subMenu.name}_${portalId}`}
                                                    id={`${subMenu.name.toLowerCase()}_${portalId}`}
                                                    onClick={() => subMenu.clickHandler()}
                                                    data-testid={`${subMenu.name.toLowerCase()}_${portalName}`}
                                                >
                                                    {subMenu.icon}
                                                    {translate(subMenu.name)}
                                                </Menu.Item>
                                            })
                                        }
                                    </Menu.Submenu>                                
                                </>) :
                                (<>
                                    {(action.name === PORTAL_USER_ACTION.DELETE || 
                                        action.name === PORTAL_USER_ACTION.DISCARD_DRAFT) 
                                        ? <Menu.Separator /> : ""
                                    }  
                                    <Menu.Item
                                        key={`${action.name}_${portalId}`}
                                        id={`${action.name.toLowerCase()}_${portalId}`}
                                        onClick={() => action.clickHandler()}
                                        data-testid={`${action.name.toLowerCase()}_${portalName}`}
                                    >
                                        {action.icon}
                                        {translate(action.name)}
                                    </Menu.Item>                                    
                                </>)
                            ))
                        }
                    </Menu>
                </Card.Header>
                <Card.Body>
                    <table className="portal__card__body__table" data-testid="portal-card-detail-section" onClick={openPortalConfig}>
                        <tbody>
                            <tr>
                                <td>{translate("LABEL_DATABASE")}: {databaseLabel}</td>
                            </tr>
                            <tr>
                                <td>
                                    {translate("LABEL_LAST_PUBLISHED")}{" "}{getLastUpdateDate(lastUpdatedDate)}
                                </td>
                            </tr>
                            <tr>
                                <td>{translate("LABEL_LAST_PUBLISHED_BY")} {lastUpdatedBy}</td>
                            </tr>
                            {getPortalStatus()}
                            {getDraftIdentifier()}
                        </tbody>
                    </table>
                </Card.Body>
            </Card>
            <Dialog 
                {...dialog}
                {...resize}
                bounds="parent"
                className="import_dialog"
            >
                    <Dialog.Header title={translate("PORTAL_IMPORT_LANGUAGE_BUNDLE")} />
                    <Dialog.Content>
                        <form>
                            <Form.Group required className="file-group-field">
                                <Form.Label className="file-group-label">{translate("LABEL_FILE")}</Form.Label>
                                <Form.Control
                                    name="file"
                                    as={FilePicker}
                                    onChange={({ files }) => setImportLanguageFiles(files)}
                                    accept={["." + ZIP]}
                                    data-testid="import_language_file"
                                />
                            </Form.Group>
                            {fileTypeError && importLanguageFiles.length > 0 &&
                                <div className="file-group-error">
                                    <Form.Error>{translate("REQUIRED_ZIP_FILE")}</Form.Error>
                                </div>
                            }
                        </form>
                    </Dialog.Content>
                    <Dialog.Footer>
                    <Button
                        onClick={handleImport}
                        data-testid="import_language_bundle"
                        type="submit"
                        disabled={fileTypeError}
                        variant="primary"
                    >
                        {translate("LABEL_IMPORT_BUTTON")}
                    </Button>
                    <Button onClick={dialog.close} data-testid="layout_import_cancel"> {translate("LAYOUT_BUTTON_CANCEL")}</Button>
                    </Dialog.Footer>                
            </Dialog>
        </>        
    )
};
PortalCardView.propTypes = {
    portal: PropTypes.object.isRequired,
    databaseLabel: PropTypes.string,
    history: PropTypes.object,
    deletePortalRequest: PropTypes.func.isRequired,
    editPortalHandler: PropTypes.func.isRequired,
    discardDraftPortalRequest: PropTypes.func.isRequired
};
export default PortalCardView;