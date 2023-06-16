import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { Form, Input, Dropdown, Checkbox } from "@informatica/droplets-core";
import APIService from '../../../../utils/apiService';
import { APIMap } from '../../../../utils/apiMappings';
import { StateContext } from "../../../../context/stateContext";
import CONFIG from '../../../../config/config';
import {
    getPageTypeOptions,
    getMaxNumberOfHorizontalDisplayOptions,
    getCookie,
    handleMultiSelectDropdownChange,
    handleChange,
    handleBlur,
} from '../../../../utils/utilityService';
import "./index.css";

const PageForm = ({
        pageId, pageTypeHandler, bevNameHandler, formikProps, editMode }) => {
    const { t: translate } = useTranslation();
    const [portalStates, setPortalStates] = useState([]);
    const [pageRoles, setPageRoles] = useState([]);
    const [bevNames, setBevNames] = useState([]);
 
    const {
        state: { portalConfig: {generalSettings: { isStateEnabled, roleSettings, stateSettings, databaseId, beName }}}, dispatch
    } = useContext(StateContext);
    const [isRecordPageSelected, setRecordPageSelected] = useState(false);
    const { HEADERS, PAGE_TYPE, ACTIONS, NOTIFICATION_TYPE, MAX_HORIZONTAL_DISPLAY_PAGE_OPTIONS } = CONFIG;
 
    useEffect(() => {
        getBevViews();
        if (isStateEnabled && stateSettings) {
            getPortalStates();
        }
        if(roleSettings) {
            getPortalRoles();
        }
    }, [pageId]);

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const getBevViews = () => {
        const successCallback = (resp) => {
            if (resp && Array.isArray(resp)) {
                const bevViews = resp.map((element) => (
                    { "text": element, "value": element }
                ));
                setBevNames(bevViews);
            }
        };
        APIService.getRequest(
            APIMap.getBevNames(beName),
            successCallback,
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate("ERROR_FETCHING_BEV_NAME"), NOTIFICATION_TYPE.ERROR);
                }
            },
            { [HEADERS.ORS]: databaseId }
        );
    };

    const getPortalStates = () => {
        const successCallback = (resp) => {
            let portalStateOptions = [];
            if (resp && resp.hasOwnProperty('item') && resp.item.length > 0) {
                portalStateOptions = resp.item.map((portalState) => ({
                    "value": portalState[stateSettings.fieldName],
                    "text": portalState[stateSettings.fieldName]
                }));
            }
            setPortalStates(portalStateOptions);
        };
        APIService.getRequest(
            APIMap.getLookupData(
                databaseId,
                stateSettings.referenceEntity,
                stateSettings.filterFieldName,
                stateSettings.filterFieldValue
            ),
            successCallback,
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
            { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
        );
    };

    const getPortalRoles = () => {
        const successCallback = (resp) => {
            let portalRoleOptions = [];
            if (resp && resp.hasOwnProperty('item') && resp.item.length > 0) {
                portalRoleOptions = resp.item.map((portalRole) => ({
                    "value": portalRole[roleSettings.fieldName],
                    "text": portalRole[roleSettings.fieldName]
                }));
            }
            setPageRoles(portalRoleOptions);
        };
        APIService.getRequest(
            APIMap.getLookupData(
                databaseId,
                roleSettings.referenceEntity
            ),
            successCallback,
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate("ERROR_FETCHING_ROLES"), NOTIFICATION_TYPE.ERROR);
                }
            },
            { [HEADERS.ORS]: databaseId, [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
        );
    };

    const pageTypeOptions = getPageTypeOptions();
    const maxHorizontalColOptions = getMaxNumberOfHorizontalDisplayOptions(MAX_HORIZONTAL_DISPLAY_PAGE_OPTIONS);

    const portalPageTypeChangeHandler = useCallback((selectedItem) => {
        let recordPageSelected = selectedItem.value === PAGE_TYPE.RECORD;
        setRecordPageSelected(recordPageSelected);
        if (typeof (pageTypeHandler) === "function") {
            handleChange(formikProps, 'type', selectedItem.value);
            pageTypeHandler(selectedItem.value);
        }
    }, [setRecordPageSelected, pageTypeHandler, formikProps]);

    const isRecordPageOptionSelected = () => {
        return (isRecordPageSelected || (formikProps.values.type === PAGE_TYPE.RECORD));
    };

    return <>
        <br />
        <Form.Group required className="form-group">
            <Form.Label className="form-label">{translate('LABEL_PAGE_NAME')}</Form.Label>
            <Form.Control
                name="name"
                as={Input}
                value={formikProps.values.name}
                onChange={formikProps.handleChange}
                onBlur={formikProps.handleBlur}
                className="form-field"
                data-testid="page-form-name"
            />
            {formikProps.touched.name 
            && formikProps.errors.name
            && (<div className="form-error" data-testid="name-error">
                    <Form.Error>{formikProps.errors.name}</Form.Error>
                </div>)}
        </Form.Group>
        {
            isStateEnabled && stateSettings && (
                <Form.Group className="form-group">
                    <Form.Label className="form-label">{translate('LABEL_PAGE_STATES')}</Form.Label>
                    <Form.Control
                        className="form-field"
                        data-testid="page-form-states"
                        name="states"
                        as={Dropdown}
                        value={formikProps.values.states}
                        onBlur={() => handleBlur(formikProps, 'states')}
                        options={portalStates}
                        onClose={(selectedItems) =>
                            handleMultiSelectDropdownChange(formikProps, selectedItems, 'states')}                        
                        multiple
                    />
                </Form.Group>)
        }
        <Form.Group className="form-group">
            <Form.Label className="form-label">{translate('LABEL_PAGE_ROLES')}</Form.Label>
            <Form.Control
                className="form-field"
                name="roles"
                as={Dropdown}
                data-testid="page-form-roles"
                options={pageRoles}
                value={formikProps.values.roles}
                onBlur={() => handleBlur(formikProps, 'roles')}
                onClose={(selectedItems) =>
                    handleMultiSelectDropdownChange(formikProps, selectedItems, 'roles')}
                multiple
            />
        </Form.Group>
        <Form.Group className="form-group" required>
            <Form.Label className="form-label">{translate('LABEL_PAGE_TYPE')}</Form.Label>
            <Form.Control className="form-field"
                name="type"
                as={Dropdown}
                data-testid="page-form-type"
                onChange={portalPageTypeChangeHandler}
                options={pageTypeOptions}
                disabled={editMode}
                value={formikProps.values.type}
                onBlur={() => handleBlur(formikProps, 'type')}                
            />
            {formikProps.touched.type 
                && formikProps.errors.type
                &&(<div className="form-error">
                    <Form.Error>{formikProps.errors.type}</Form.Error></div>)}
        </Form.Group>
        {
            isRecordPageOptionSelected() && <>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label">{translate('LABEL_BUSINESS_ENTITY_VIEW')}</Form.Label>
                    <Form.Control
                        className="form-field"
                        as={Dropdown}
                        name="bevName"
                        data-testid="page-form-bevname"
                        onChange={({ value }) => {
                            handleChange(formikProps, 'bevName', value);
                            bevNameHandler(value);
                        }}
                        value={formikProps.values.bevName}
                        onBlur={() => handleBlur(formikProps, 'bevName')}                           
                        options={bevNames}
                        disabled={editMode}
                    />
                  {formikProps.touched.bevName 
                    && formikProps.errors.bevName
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.bevName}</Form.Error></div>)}
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Control
                        className="form-field"
                        name="isReadOnly"
                        data-testid="page-form-readonly"
                        as={Checkbox}
                        onChange={(e) => {
                            const { checked } = e.target;
                            handleChange(formikProps, 'isReadOnly', checked)
                            handleBlur(formikProps, 'isReadOnly');                            
                        }}
                        checked={formikProps.values.isReadOnly}                          
                    >
                        {translate('LABEL_READ_ONLY')}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="form-group" name="FORMATTING">
                    <div className={'foramt-section-heading'} >{translate('LABEL_FORMATING')}</div>
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Label className="form-label" info={translate('MAX_HORIZONTL_COL_DISPLAY_INFO')}>
                        {translate('LABEL_MAX_HORIZONTAL_COLUMNS')}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="maxColumns"
                        as={Dropdown}
                        data-testid="page-form-max-columns"
                        options={maxHorizontalColOptions}
                        value={formikProps.values.maxColumns}
                        onBlur={() => handleBlur(formikProps, 'maxColumns')}
                        onChange={({ value }) => handleChange(formikProps, 'maxColumns', value)}                        
                    />
                </Form.Group>
            </>
        }
    </>;
};
export default PageForm;
