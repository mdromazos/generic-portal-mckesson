import React, { useContext, useEffect, useState,useMemo } from 'react';
import { StateContext } from '../../../context/stateContext';
import { Panel, useMessageBoxState} from '@informatica/droplets-core';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService';
import PortalFooter from "../portalFooter";
import BEFormHandler from '../../componentTypes/beFormHandler';
import CONFIG from "../../../config/config";
import { useTranslation } from "react-i18next";
import './index.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/panel.css';
import ExternalLink from "../../componentTypes/externalLink"
import TwitterFeed from "../../componentTypes/twitterFeed"
import Text from "../../componentTypes/textComponent"
import { Button, IconButton, Table, createTable, Pagination, Section, Menu, MessageBox, Tooltip} from "@informatica/droplets-core";
import AddUserForm from "../../userManagement/index"
import ChangePassword from "../../changePassword"
import {withRouter} from "react-router-dom";
import Product360Catalog from "../../componentTypes/product360Catalog";
import Product360CatalogUpload from "../../componentTypes/product360CatalogUpload";
import Product360TaskView from "../../componentTypes/product360TaskView";
import Product360Timeline from "../../componentTypes/product360Timeline";
import {getCookie } from "../../../common/helperUtils";
import PortalWizardHandler from '../../componentTypes/portalWizard';
 
const PortalWorkspace = ({ history, match}) => {

    const [{ globalSettings: { userManagement, beName, sourceSystem, roleSettings, isExternalUserManagementEnabled}, 
             pageMetadata: { pages },
             notificationActions : {dispatchAppNotification}
        }] = useContext(StateContext);
    const [ sections, setSections] = useState([]);
    const [ currentIndex, setCurrentIndex ] = useState(-1);
    const [portalName, setPortalName] = useState('');
    const { BE_FORM_MODES, COMPONENT_TYPE,
        LOOKUP_PROXY_PAYLOAD:{API_URL, HTTP_METHOD, PROXY_ATTRIBUTE},
        HTTP_METHOD:{GET}, CHANGE_PASSWORD, USER_MANAGEMENT_PATH,
        CONSTANTS, ORS_ID, EMAIL, IMAGES: { ALERT } } = CONFIG; 
 	const { t: translate } = useTranslation(); 
    const [userForm,setUserForm]=useState(true);
    const [addUserForm, setaddUserForm] = useState(false);
    const INITIAL_PAGE_SIZE = 25;
    const [totalItems, setTotalItems] = useState(undefined);
    const [userData,setUserData]=useState([]);
    const [editUser,setEditUser]=useState(false);
    const [selectedRowId, setSelectedRowId]=useState({});
    const [userFieldMapping, setUserFieldMapping] = useState(undefined);
    let beRowId = decodeURIComponent(document.cookie.match(/rowId=([^;]*)/) ? document.cookie.match(/rowId=([^;]*)/)[1] : '');
    const deleteUserMessageBox = useMessageBoxState();
    const userName = getCookie(EMAIL);
    let userAuth = getCookie('userAuth');
 
    useEffect(() => {
        if(pages && pages.length > 0 && match.params.pageId){
            let newIndex = pages.findIndex(page => page.id === match.params.pageId);
            if(newIndex !== currentIndex){
                APIService.getRequest(
                    URLMap.getPortalMeta(
                        ['portals', match.params.id, 'pages', pages[newIndex].id],
                        0, true
                    ),
                    (response) => {
                    //Handling cases of empty layout
                        if (response.layout && response.layout.hasOwnProperty('sections')){
                            setSections(response.layout.sections);
                            setPortalName(response.name)
                        }
                        setCurrentIndex(newIndex);
                    },
                    ({response:{data:{errorCode}}}) => {
                        if (errorCode) {
                            dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
                        }
                        else {
                            dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
                        }
                    },
                    URLMap.generateHeader(match.params.orsId,match.params.id)
                );
            }
        }
    }, [pages]);
 
    useEffect(() => {
        if (match.params.pageId === CONFIG.USER_MANAGEMENT_PATH) {
            let fieldMappingObj = {};
            if (userManagement && userManagement.fieldMapping) {
                fieldMappingObj.userName = userManagement.fieldMapping.userName.code.includes(".") ?
                    userManagement.fieldMapping.userName.code.split(".")[1] : userManagement.fieldMapping.userName.code
 
                fieldMappingObj.firstName = userManagement.fieldMapping.firstName.code.includes(".") ?
                    userManagement.fieldMapping.firstName.code.split(".")[1] : userManagement.fieldMapping.firstName.code
 
                fieldMappingObj.lastName = userManagement.fieldMapping.lastName.code.includes(".") ?
                    userManagement.fieldMapping.lastName.code.split(".")[1] : userManagement.fieldMapping.lastName.code
 
                fieldMappingObj.email = userManagement.fieldMapping.email.code.includes(".") ?
                    userManagement.fieldMapping.email.code.split(".")[1] : userManagement.fieldMapping.email.code
 
                fieldMappingObj.userRole = userManagement.fieldMapping.userRole.code.includes(".") ?
                    userManagement.fieldMapping.userRole.code.split(".")[1] : userManagement.fieldMapping.userRole.code
 
                setUserFieldMapping({ ...fieldMappingObj });
            }
        }
    }, [userForm, userManagement]);
 
    useEffect(() => {
        userFieldMapping && getUsers();
    }, [userFieldMapping]);
    
    const renderPageComponents = (component, sectionIndex, childIndex, componentIndex) => {
 
        switch (component.componentType) {
            case COMPONENT_TYPE.BE_FORM:
                let beFormMode = BE_FORM_MODES.READ_EDIT;
                let maxColumns;
                if (pages[currentIndex]) {
                    beFormMode = pages[currentIndex].isReadOnly ? BE_FORM_MODES.READ_ONLY : beFormMode;
                    maxColumns = pages[currentIndex].maxColumns; //Commenting this untill BEForm component changes checkin. Default value is set to 2 in BEForm 
                }

                return <BEFormHandler
                    beMeta={component}
                    key={`${sectionIndex}_${childIndex}_${componentIndex}`}
                    match={match}
                    mode={beFormMode}
                    maxColumns={maxColumns}
                    activePageName={portalName}
                    history={history}
                />;
            case COMPONENT_TYPE.WIZARD:
                return <PortalWizardHandler
                    beMeta={component}
                    beName={beName}
                    key={`${sectionIndex}_${childIndex}_${componentIndex}`}
                    match={match}
                    history={history}
                >
                </PortalWizardHandler>;
            case COMPONENT_TYPE.EXTERNAL_LINK:
                return <ExternalLink component={component} match={match} beName={beName}/>
            case COMPONENT_TYPE.TWITTER_FEED:
                return <TwitterFeed component={component} />
            case COMPONENT_TYPE.TEXT:
                return <Text component={component} />
            case COMPONENT_TYPE.P360_CATALOG:
                return <Product360Catalog component={component} match={match}/>
            case COMPONENT_TYPE.P360_CATALOG_UPLOAD:
                return <Product360CatalogUpload component={component} match={match} />
            case COMPONENT_TYPE.P360_TASK_VIEW:
                return <Product360TaskView component={component} match={match} />
            case COMPONENT_TYPE.P360_CATALOG_TIMELINE:
                return <Product360Timeline component={component} match={match} />
            default:
                break;
        }
    };
 
    const addUserAction = () => {
        setUserForm(false);
        setaddUserForm(true);
    };
 
    const onAddUserClose = () => {
        setUserForm(true);
        setaddUserForm(false);
        setEditUser(false);
    };

    const filterInvalidUsers = userList => {
        let beName = userManagement && userManagement.bevName;
        let filteredUsers = [];
 
        let promiseMap = userList.map(user => new Promise((resolve, reject) => {
            APIService.getRequest(
                URLMap.doesUserExist(beName,user[userFieldMapping.userName]),
                (response) => {
                    resolve(response)
                },
                (error) => {
                    reject(error)
                },
                URLMap.generateHeader(match.params.orsId,match.params.id)
            );
        }));
 
        Promise.allSettled(promiseMap).then((results) => {
            results.forEach((result,index) => {
                (result.value !== "") && filteredUsers.push(userList[index]);
            });
            setTotalItems(filteredUsers.length);
            setUserData([...filteredUsers]);
        });
    };

    const getUsers = () => {
 
        const successCallback = response => {
            if(response.item) {
                filterInvalidUsers(response.item);
            }
            else {
                setTotalItems(undefined);
                setUserData([]);
            }
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
        let oneToManyRelationship = userManagement && userManagement.fieldMapping.userName.code.includes(".") ?
            userManagement.fieldMapping.userName.code.split(".")[0] : null ;
        let userBevName = userManagement && userManagement.bevName;

        payLoad[API_URL] = URLMap.getContactBEData(
            match.params.orsId,
            userBevName,
            beRowId,
            oneToManyRelationship
        );
        payLoad[HTTP_METHOD] =  GET;
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

    const deleteUser = () => {
        let deletePayload = getDeletePayload();
        let userDeletionPayload = {
            BEData: {
                ...deletePayload,
                rowidObject: beRowId
            }
        };
 
        const successCallback = response => {
            dispatchAppNotification(translate("LABEL_DELETE_SUCESS"), CONSTANTS.NOTIFICATION_SUCCESS);
            getUsers();
        };
 
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };

        APIService.deleteRequest(
            URLMap.deleteUserData(selectedRowId.prtlUsrNm, userManagement.bevName, sourceSystem),
            userDeletionPayload,
            successCallback,
            failureCallback,
            {
                [CONFIG.SIGN_UP_HEADER]: match.params.orsId,
                [CONFIG.PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    const getDeletePayload = () => {
        let beData = {};
        let beDataKey = userManagement.fieldMapping.userName.code.includes(".") ? 
            userManagement.fieldMapping.userName.code.split(".")[0] : userManagement.fieldMapping.userName.code
        beData[beDataKey] = {};
        beData[beDataKey].item = [null];
        beData[beDataKey].$original = {};
        beData[beDataKey].$original.item = [];
        beData[beDataKey].$original.item.push({
            rowidObject: selectedRowId.rowidObject
        });
        
        return beData;
    };

    const DeleteDialogMessageBox = () => {
        return (
            <MessageBox
                type="warning"
                title={translate("LABEL_WARNING")}
                {...deleteUserMessageBox}
            >
                <MessageBox.Content>
                    <div className="user__content__header">
                        <img src={ALERT} alt={translate("LABEL_ALERT_ICON")} className="user__cancel__alert__icon" />
                        <span className="user__delete__message__body">{translate("LABEL_DELETE_WARNING")}</span>
                    </div>
                </MessageBox.Content>
                <MessageBox.Footer>
                    <Button
                        onClick={() => {
                            deleteUserMessageBox.close();
                        }}>
                        {translate("CHANGE_PASSWORD_CANCEL")}
                    </Button>
                    <Button
                        onClick={() => {
                            deleteUser();
                            deleteUserMessageBox.close();
                        }}
                        variant="primary"
                    >
                        {translate("LABEL_DELETE_OK")}
                    </Button>
                </MessageBox.Footer>
            </MessageBox>
        );
    };
    const deletePageConfirmation = userObject => {
        deleteUserMessageBox.open();
        setSelectedRowId(userObject);
    };
 
    const resendInvite=(contactObject)=>{
        const successCallback = resp => {
 
            dispatchAppNotification(
                resp.Status,
                CONSTANTS.NOTIFICATION_SUCCESS
            );
        };
 
        const failureCallback = ({ response: { data: { errorCode } } }) => {
            if (errorCode) {
                dispatchAppNotification(
                    translate(errorCode),
                    CONSTANTS.NOTIFICATION_ERROR
                );
            }
        };
 
        let loginPayload = {};
        loginPayload.userEmail = contactObject.prtlUsrNm;
        loginPayload.orsId = match.params.orsId;
 
        APIService.postRequest(
            URLMap.postForgotPassword(match.params.id),
            loginPayload,
            successCallback,
            failureCallback,
            { [ORS_ID]: match.params.orsId }
        );
    }

    const renderTableMenu = React.useCallback(
        rowIds => {
            let menuArray = [];
            if (JSON.parse(rowIds).prtlUsrNm === userName) {
                if(!isExternalUserManagementEnabled) {
                    menuArray.push(
                        <Menu.Item
                            key={`${rowIds}-invite`}
                            onClick={() => {
                                resendInvite(JSON.parse(rowIds));
                            }}
                        >
                            {translate("LABEL_RESEND_INVITE")}
                        </Menu.Item>)
                }
            } else {
                if(!isExternalUserManagementEnabled) {
                    menuArray.push(<><Menu.Item
                        key={`${rowIds}-invite`}
                        onClick={() => {
                            resendInvite(JSON.parse(rowIds));
                        }}
                    >
                        {translate("LABEL_RESEND_INVITE")}
                    </Menu.Item>
                    <Menu.Separator />
                    </>);
                }
                menuArray.push(<Menu.Item
                    key={`${rowIds}-deleteAction`}
                    onClick={() => {
                        deletePageConfirmation(JSON.parse(rowIds));
                    }}
                >
                    <i className="aicon aicon__delete user__delete__icon" />
                        {translate("LABEL_DELETE_USER")}
                    </Menu.Item>);
            }
            return menuArray;
        },
        []
    );
    
    const UserTable = useMemo(
        () => createTable(
            Table.Features.withRowActions()
        ), []
    );
    
    const UserTableOptions = {
        renderActionMenuItems: renderTableMenu,
    };
    
    const UserTableProps = UserTable.useTable(UserTableOptions);

    const paginationProps = Pagination.usePagination({
        totalItems: totalItems,
        initialPageSize: INITIAL_PAGE_SIZE,
    });

    const getListofUsers = () => {
        return (
            <Section title={translate("LABEL_USER_MANAGEMENT")}>
                <UserTable {...UserTableProps}>
                    <UserTable.Header>
                        <UserTable.HeaderRow>
                            <UserTable.HeaderCell>
                                {translate("LABEL_USER_NAME")}
                            </UserTable.HeaderCell>
                            <UserTable.HeaderCell>
                                {translate("LABEL_EMAIL_ADDRESS")}
                            </UserTable.HeaderCell>
                            <UserTable.HeaderCell>
                                {translate("LABEL_FIRST_NAME")}
                            </UserTable.HeaderCell>
                            <UserTable.HeaderCell>
                                {translate("LABEL_LAST_NAME")}
                            </UserTable.HeaderCell>
                            <UserTable.HeaderCell>
                                {translate("LABEL_USER_ROLE")}
                            </UserTable.HeaderCell>
                        </UserTable.HeaderRow>
                    </UserTable.Header>
                    <UserTable.Body>
                        {userData
                            .slice(paginationProps.startIndex, paginationProps.endIndex + 1)
                            .map(row => (
                                <UserTable.Row
                                    key={JSON.stringify(row)}
                                    data-id={JSON.stringify(row)}
                                >
                                    <UserTable.Cell>
                                        {row[userFieldMapping.userName] ? row[userFieldMapping.userName] : ""}
                                    </UserTable.Cell>
                                    <UserTable.Cell>
                                        {row[userFieldMapping.email] ? row[userFieldMapping.email] : ""}
                                    </UserTable.Cell>
                                    <UserTable.Cell>
                                        {row[userFieldMapping.firstName] ? row[userFieldMapping.firstName] : ""}
                                    </UserTable.Cell>
                                    <UserTable.Cell>
                                        {row[userFieldMapping.lastName] ? row[userFieldMapping.lastName] : ""}
                                    </UserTable.Cell>
                                    <UserTable.Cell>
                                        {row[userFieldMapping.userRole] ? row[userFieldMapping.userRole][roleSettings.fieldName] : ""}
                                    </UserTable.Cell>
                                </UserTable.Row>
                            ))}
                    </UserTable.Body>
                </UserTable>
                <Pagination.DefaultLayout {...paginationProps} />
            </Section>
        );
    };

    const getSections = () => {
        return(
            <div className="page-data">
            {sections.map((section, sectionIndex) => {
                return (
                    <div
                        key={`page${match.params.pageId}section${sectionIndex}`}
                        className="page-layout-section"
                    >
                        {section.containers.map((child, childIndex) => {
                            let componentList;
                            if (child.components && Array.isArray(child.components)) {
                                componentList = child.components.map(
                                    (component, componentIndex) => {
                                        return renderPageComponents(
                                            component,
                                            sectionIndex,
                                            childIndex,
                                            componentIndex
                                        );
                                    }
                                );
                            }
                            return (
                                <Panel
                                    key={`${sectionIndex}_${childIndex}_panel`}
                                    collapsible
                                    style={{ flex: child.style.width }}
                                >
                                    {componentList}
                                </Panel>
                            );
                        })}
                    </div>
                );
            })}
        </div>
        );
    }

    const getUserManagementPage = () => {
        return(
            <div className="portal__table" data-testid="portal_table">
                {userForm && userAuth === "true" && <div>{getListofUsers()}</div>}
                {addUserForm && (
                    <AddUserForm
                        match={match}
                        edit={editUser}
                        selectedRowId={selectedRowId}
                        setUserForm={setUserForm}
                        setaddUserForm={setaddUserForm}
                        setEditUser={setEditUser}
                    />
                )}
                {!deleteUserMessageBox.closed && <DeleteDialogMessageBox />}
            </div>
        );
    }

    const renderPortalPage = (pageId) => {
        switch (pageId) {
            case CHANGE_PASSWORD: return <ChangePassword />;
            case USER_MANAGEMENT_PATH: return getUserManagementPage(); 
            default: return getSections(); 
        }
    }

    const closeButtonHandler = () => {
        history.goBack();
    }

    return(
        <>
            <div className="portal-global" data-testid="portal-global">
                {match.params.pageId !== USER_MANAGEMENT_PATH ? (
                    <div className="portal-name-container">
                        {match.params.pageId === CHANGE_PASSWORD ?
                            <>
                                <span className="portal-name">{translate("CHANGE_PASSWORD")}</span>
                                <IconButton className="shell-header-close-icon title-close-icon">
                                    <Tooltip content={translate("LABEL_CLOSE")}>
                                        <i className="aicon aicon__close-solid close-icon"
                                            onClick={closeButtonHandler} />
                                    </Tooltip>
                                </IconButton>
                            </>
                            :
                            <span className="portal-name">{portalName}</span>
                        }
                    </div>
                ) : (
                        <div>
                            {userAuth==="true" && userForm && (
                                <div className="portal-name-container">
                                    <span className="portal-name">
                                        {translate("LABEL_USER_MANAGEMENT")}
                                    </span>
                                    {!isExternalUserManagementEnabled &&
                                        <Button className="portal__user" onClick={addUserAction} data-testid="add_user_button">
                                            {translate("LABEL_ADD_USER")}
                                        </Button>
                                    }
                                </div>
                            )}
                            {addUserForm && (
                                <div className="portal-name-container">
                                    <span className="portal-name">
                                        {editUser
                                            ? translate("LABEL_EDIT_USER")
                                            : translate("LABEL_NEW_USER")}
                                    </span>
                                    <IconButton onClick={onAddUserClose}>
                                        <div className="shell__seperator__div">
                                            <span class="shell__header__separator"></span>
                                        </div>
                                        <i className="aicon aicon__close-solid close-icon portal__user__close" />
                                    </IconButton>
                                </div>
                            )}
                        </div>
                    )}
            </div>
       
            <div key={`page_${match.params.pageId} `} className={match.params.pageId === CHANGE_PASSWORD ? 'portal__page' : 'page__layout'}>
                {  renderPortalPage(match.params.pageId) }
                <PortalFooter />
            </div>
            
        </>
    );
};

export default withRouter(PortalWorkspace);