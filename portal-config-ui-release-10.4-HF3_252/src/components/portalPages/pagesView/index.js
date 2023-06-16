import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
    Table,
    Menu,
    Button,
    Input,
    Dialog,
    Shuttle,
    useShuttleState,
    Section,
    Toolbar,
    IconButton,
    createTable,
    useMessageBoxState,
    useDialogState,
} from "@informatica/droplets-core";
import { StateContext } from "../../../context/stateContext";
import "./index.css";
import CONFIG from "../../../config/config";
import APIService from "../../../utils/apiService";
import { URLMap } from "../../../utils/urlMappings";
import { APIMap } from "../../../utils/apiMappings";
import { getPortalConfigMapKey, generateViewId } from "../../../utils/utilityService";
import DialogBox from "../../dialogBox"

const PagesView = ({ history, portalConfig }) => {
    const { state: { portalConfigMap }, dispatch } = useContext(StateContext);
    const { t: translate } = useTranslation();
    const { ACTIONS, PAGES, HEADERS, NOTIFICATION_TYPE } = CONFIG;
    const { generalSettings: { databaseId }, portalId, version } = portalConfig;
    //To set the Portal page list
    const [pageList, setPortalPages] = useState([]);
    //To set the page selected for delete operation
    const [selectedPage, setSelectedPage] = useState({});
    const shuttle = useShuttleState({ source: [] });
    const [visibleButtonInput, setVisibleButtonInput] = useState("visible_pages");
    const deleteRowMessageBox = useMessageBoxState();
    const shuttleDialogBox = useDialogState();

    useEffect(() => {
        setPortalPages(portalConfig.pages);
        if (portalConfig.pages !== undefined) {
            shuttle.shuttleState.target = [...portalConfig.pages];
            setVisibleButtonInput("");
        }
    }, [databaseId, portalConfig.pages, portalId]);

    //To open the edit page
    const editPageHandler = pageObj => {
        history.push(URLMap.editPortalPage(databaseId, portalId, pageObj.id));
    };

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const updatePortalConfigMap = async newVersion => {
        let portalMapKey = getPortalConfigMapKey(databaseId, portalId);

        let portalConfigMapDt = {};
        portalConfigMapDt[portalMapKey] = {
            ...portalConfigMap[portalMapKey],
            version: newVersion,
            isDraft: true,
        };
        await dispatch({
            type: ACTIONS.UPDATE_PORTAL_CONFIG_MAP,
            portalConfigMap: portalConfigMapDt,
        });
        history.push(URLMap.portalDetails(databaseId, portalId));
    };

    //To perform page delete action
    const deletePageHandler = pageObj => {
        let deleteUrl = APIMap.deletePortalPage(portalId, pageObj.id);

        APIService.deleteRequest(
            deleteUrl,
            response => {
                if (response && response.version) {
                    updatePortalConfigMap(response.version);
                }
                let currentPageId = generateViewId(PAGES.EDIT_PAGE, databaseId, portalId, pageObj.id);
                const currentPageInfo = {
                    type: PAGES.EDIT_PORTAL,
                    id: currentPageId,
                };
                dispatch({
                    type: ACTIONS.REMOVE_PAGE_SETTINGS,
                    pageSettings: currentPageInfo,
                });
                dispatchAppNotification(translate("DELETE_PAGE_SUCCESS_MESSAGE",{ PAGE_NAME: `${selectedPage.name}`}), NOTIFICATION_TYPE.SUCCESS);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate("DELETE_PAGE_ERROR_MESSAGE"), NOTIFICATION_TYPE.ERROR);
                } 
            },
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version,
            },
        );
    };

    const deletePageConfirmation = pageObj => {
        setSelectedPage(pageObj);
        deleteRowMessageBox.open();
    };

    const DeleteConfirmationBox = () => (
        <DialogBox
            dialogBox={deleteRowMessageBox}
            title={translate("PAGE_DELETE_MESSAGE_TITLE")}
            messageContentTitle={`${translate("PAGE_DELETE_MESSAGE_CONTENT_HEADING", { PAGE_NAME: `${selectedPage && selectedPage.name}`})}`}
            messageContentBody={translate("PAGE_DELETE_MESSAGE_CONTENT")}
            clickHandler={() => deletePageHandler(selectedPage)}
            actionButtonText={translate("PAGE_USER_ACTION_DELETE")}
            cancelButtonText={translate("PAGE_USER_ACTION_CANCEL")}
        />
    );

    const onReOrderingPages = () => {
        let updatePageUrl = APIMap.editPortalReOrderPage(portalId);
        let orderIdIndex;
        let patchData;

        const successCallback = resp => {
            if (resp && resp.version) {
                updatePortalConfigMap(resp.version);
            }
            shuttleDialogBox.close();
            dispatchAppNotification(translate("REORDER_PAGE_SUCCESS_MESSAGE"), NOTIFICATION_TYPE.SUCCESS);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate("DELETE_PAGE_ERROR_MESSAGE"), NOTIFICATION_TYPE.ERROR);
            }
        };
        patchData = shuttle.shuttleState.target.map((e, index) => {
            orderIdIndex = index + 1;
            return { id: e.id, order: orderIdIndex };
        });
        APIService.patchRequest(updatePageUrl, patchData, successCallback, failureCallback, {
            [HEADERS.ORS]: databaseId,
            [HEADERS.VERSION]: version,
        });
    };

    const pageArraySearch = (dataArray, filterValue) => {
        if (dataArray) {
            let match = dataArray.length > 0 && dataArray.filter(data => 
                data.toUpperCase().includes(filterValue.toUpperCase())
            );
            return match.length !== 0;
        }
        return false;        
    };

    const onFindPage = event => {
        let filterValue = event.target.value;
        if (filterValue !== "") {
            let filterArray = portalConfig.pages.filter(event =>
                event.name.toUpperCase().includes(filterValue.toUpperCase())
                || pageArraySearch(event.states, filterValue)
                || pageArraySearch(event.roles, filterValue)
            );
            setPortalPages(filterArray.length ? filterArray : []);
        } else {
            setPortalPages(portalConfig.pages);
        }        
    };

    const pageEditClickHandler = rowId => {
        let pageObject = shuttle.shuttleState.target.find(row => row.id === rowId);
        editPageHandler(pageObject);
    };

    const renderTableMenu = React.useCallback(
        rowId => [
            <Menu.Item
                data-testid={`edit-${rowId}`}
                onClick={() => {
                    pageEditClickHandler(`${rowId}`);
                }}>
                <IconButton>
                    <i className="aicon aicon__edit"/>
                </IconButton>
                {translate("PORTAL_USER_ACTION_EDIT")}
            </Menu.Item>,
            <Menu.Item
                data-testid={`delete-${rowId}`}
                onClick={() => {
                    let pageObject = shuttle.shuttleState.target.find(row => row.id === `${rowId}`);
                    deletePageConfirmation(pageObject);
                }}>
                <IconButton>
                    <i className="aicon aicon__delete"/>
                </IconButton>
                {translate("PORTAL_USER_ACTION_DELETE")}
            </Menu.Item>,
        ],[portalConfig]
    );


    const PortalConfigPageTable = React.useMemo(() => createTable(Table.Features.withRowActions()), []);
    
    const tableProps = PortalConfigPageTable.useTable({ renderActionMenuItems: renderTableMenu });
    
    return <div key={`${portalId}_${version}`} id={`${portalId}_${version}`}>
        <Section
            title={translate('LABEL_PAGES')}
            toolbar={({ expanded }) => (
                portalConfig.pages && portalConfig.pages.length > 1
                    ? <Toolbar>
                        <Button
                            data-testid="reorder-pages"
                            className={visibleButtonInput}
                            variant="primary"
                            onClick={shuttleDialogBox.open}>
                            {translate("REORDER_PAGES")}
                        </Button>
                        <Input
                            className={visibleButtonInput}
                            placeholder={translate('LABEL_PLACEHOLDER_FIND_BOX')}
                            onChange={onFindPage}
                            data-testid="search-filter"
                        />
                    </Toolbar>
                    : ''
            )}
        >
            <PortalConfigPageTable {...tableProps}>
                <PortalConfigPageTable.Header>
                    <PortalConfigPageTable.HeaderRow className="table__row">
                        <PortalConfigPageTable.HeaderCell className="table__column__page bold__text">
                            {translate("LABEL_PAGE")}
                        </PortalConfigPageTable.HeaderCell>
                        {
                            portalConfig.generalSettings.isStateEnabled  && <PortalConfigPageTable.HeaderCell className="table__column__state bold__text">
                                {translate("LABEL_STATE")}
                            </PortalConfigPageTable.HeaderCell>
                        }
                        <PortalConfigPageTable.HeaderCell className="table__column__role bold__text">
                            {translate("LABEL_ROLE")}
                        </PortalConfigPageTable.HeaderCell>
                        <PortalConfigPageTable.HeaderCell className="table__column__permission bold__text">
                            {translate("LABEL_PERMISSION")}
                        </PortalConfigPageTable.HeaderCell>
                    </PortalConfigPageTable.HeaderRow>
                </PortalConfigPageTable.Header>
                <PortalConfigPageTable.Body data-testid="page-list-container">
                    {
                        pageList && Array.isArray(pageList) && pageList.map(row => (
                            <PortalConfigPageTable.Row
                                key={row.id}
                                data-id={row.id}
                                className="table__row__body"
                            >
                                <PortalConfigPageTable.Cell className="table__column__page">
                                    <span
                                        data-testid={`edit-page-${row.id}`}
                                        className="page__name"
                                        onClick={() => pageEditClickHandler(row.id)}
                                    >
                                        {row.name}
                                    </span>
                                </PortalConfigPageTable.Cell>
                                {
                                    portalConfig.generalSettings.isStateEnabled && <PortalConfigPageTable.Cell className="table__column__state">
                                        {
                                            row.states && Array.isArray(row.states) ? row.states.join(", ") : ""
                                        }
                                    </PortalConfigPageTable.Cell>
                                }
                                <PortalConfigPageTable.Cell className="table__column__role">
                                    {
                                        row.roles && Array.isArray(row.roles) ? row.roles.join(", ") : ""
                                    }
                                </PortalConfigPageTable.Cell>
                                <PortalConfigPageTable.Cell className="table__column__permission">
                                    {
                                        row.isReadOnly && translate('LABEL_READ_ONLY')
                                    }
                                </PortalConfigPageTable.Cell>
                            </PortalConfigPageTable.Row>
                        ))
                    }
                </PortalConfigPageTable.Body>
            </PortalConfigPageTable>
        </Section>
        <Dialog {...shuttleDialogBox} bounds="parent" data-testid="shutter-dialog">
            <Dialog.Header title={translate("REORDER_PAGES_DIALOG_HEADING")}/>
            <Dialog.Content instructions={translate("REORDER_PAGES_DIALOG_INSTRUCTION")}>
                <Shuttle {...shuttle}>
                    <Shuttle.Container className="sourceShuttle">
                        {
                            ({ source, selected }, getItemProps) => source.map((item, index) => (
                                <Shuttle.Item
                                    {...getItemProps(index)}
                                    key={item}
                                    value={item}
                                    selected={selected.source.has(index)}>
                                </Shuttle.Item>
                            ))
                        }
                    </Shuttle.Container>
                    <Shuttle.Container>
                        {
                            ({ target, selected }, getItemProps, filter) => target.map((item, index) => {
                                if (!filter || item.indexOf(filter) !== -1) {
                                    return (
                                        <Shuttle.Item
                                            key={item.id}
                                            selected={selected.target.has(index)}>
                                            {item.name}
                                        </Shuttle.Item>
                                    );
                                }
                                return null;
                            })
                        }
                    </Shuttle.Container>
                    <Shuttle.Controls variant="sort"/>
                </Shuttle>
            </Dialog.Content>
            <Dialog.Footer>
                <Button data-testid="on-reordering-pages" variant="primary" onClick={onReOrderingPages}>
                    {translate("LABEL_SAVE")}
                </Button>
                <Button onClick={shuttleDialogBox.close}>
                    {translate("LABEL_CANCEL")}
                </Button>
            </Dialog.Footer>
        </Dialog>
        {!deleteRowMessageBox.closed && <DeleteConfirmationBox/> }
    </div>;
};
export default PagesView;
