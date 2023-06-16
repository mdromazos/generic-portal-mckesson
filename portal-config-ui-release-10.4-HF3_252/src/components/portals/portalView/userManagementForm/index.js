import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Form, Section, Tabs, Input, Dropdown, Checkbox, Tooltip } from "@informatica/droplets-core";
import APIService from "../../../../utils/apiService";
import { APIMap } from "../../../../utils/apiMappings";
import { StateContext } from "../../../../context/stateContext";
import CONFIG from "../../../../config/config";
import "./index.css";
import { getCookie, handleMultiSelectDropdownChange } from '../../../../utils/utilityService';

const USER_MANAGEMENT_KEYS = {
    createAdditionalUsers: 'userManagement.createAdditionalUsers',
    hasSameEmailAndUsername: 'userManagement.hasSameEmailAndUsername'
}

const UserManagementForm = ({ formikProps, isEdit, commonProps, handleBlur, handleChange, setActiveStep }) => {
    const { dispatch } = useContext(StateContext);
    const { t: translate } = useTranslation();
    const [currentTab, setCurrentTab] = useState("FIELD_MAPPING");
    const [bevNames, setBevNames] = useState([]);
    const { HEADERS, ACTIONS, NOTIFICATION_TYPE } = CONFIG;
    const [bevMetadata, setBeMetadata] = useState(undefined);
    const [portalRole, setPortalRole] = useState([]);
    const [checkedMap, setCheckedMap] = useState(false);
    const [checkedUser, setCheckedUser] = useState(false);
    const [oneToMany, setOneToMany] = useState([]);
    const [oneToManyFields, setOneToManyFields] = useState([]);
    const [userPortalStates, setUserPortalStates] = useState([]);
    const [portalStates, setPortalStates] = useState([]);

    useEffect(() => {
        setActiveStep();
    }, [setActiveStep]);    
   
    useEffect(() => {
        getBevViews();
        if (formikProps.values.userManagement && formikProps.values.userManagement.bevName) {
            let fieldMapping = formikProps.values.userManagement;
            getBevMetadata(fieldMapping.bevName);

            if (fieldMapping.hasSameEmailAndUsername) {
                setCheckedMap(fieldMapping.hasSameEmailAndUsername);
            }

            if (fieldMapping.createAdditionalUsers) {
                setCheckedUser(fieldMapping.createAdditionalUsers);
            }
        }
        if(formikProps.values.roleSettings) {
            getPortalRoles();
        }
        if (formikProps.values.isStateEnabled && formikProps.values.stateSettings) {
            getPortalStates();
        }
        /*if (isEdit) {
            setCheckedUser(formikProps.values.userManagement.createAdditionalUsers);
        }*/
    }, []);

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const getPortalRoles = () => {
        const successCallback = resp => {
            if (resp && resp.hasOwnProperty("item") && resp.item.length > 0) {
                const portalRoleDropDownData = resp.item.map(portalState => ({
                    value: portalState[formikProps.values.roleSettings.fieldName],
                    text: portalState[formikProps.values.roleSettings.fieldName]
                }));
                setPortalRole(portalRoleDropDownData);
            }
        };
        APIService.getRequest(
            APIMap.getLookupData(
                formikProps.values.databaseId,
                formikProps.values.roleSettings.referenceEntity
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

    const getPortalStates = () => {
        const successCallback = (resp) => {
            if (resp && resp.hasOwnProperty('item') && resp.item.length > 0) {
                const portalStatesDropDownData = resp.item.map((portalState) => ({
                    "value": portalState[formikProps.values.stateSettings.fieldName],
                    "text": portalState[formikProps.values.stateSettings.fieldName]
                }));
                setUserPortalStates(portalStatesDropDownData);
            }
        };
        APIService.getRequest(
            APIMap.getLookupData(
                formikProps.values.databaseId,
                formikProps.values.stateSettings.referenceEntity,
                formikProps.values.stateSettings.filterFieldName,
                formikProps.values.stateSettings.filterFieldValue
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

    const getBevViews = () => {
        const successCallback = resp => {
            if (resp && Array.isArray(resp)) {
                const bevViews = resp.map(element => ({
                    text: element,
                    value: element
                }));
                setBevNames(bevViews);
            }
        };
        APIService.getRequest(
            APIMap.getBevNames(formikProps.values.beName),
            successCallback,
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
                }
                else {
                    dispatchAppNotification(translate("ERROR_FETCHING_BEV_NAME"), NOTIFICATION_TYPE.ERROR)
                }
            },
            { [HEADERS.ORS]: formikProps.values.databaseId }
        );
    };

    const getBevMetadata = beName => {
        APIService.getRequest(
            APIMap.getBevMetadata(formikProps.values.databaseId, beName),
            resp => {
                setBeMetadata(resp);
                getFieldmapping(resp);
                if (formikProps.values.userManagement) {
                    let fieldMappingRowId =
                        formikProps.values.userManagement.fieldMapping.manyRowId;
                    if (fieldMappingRowId !== "") {
                        editGenericHandleChange(resp, fieldMappingRowId);
                    }
                }
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
                }
                else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR)
                }
            },
            { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
        );
    };

    const beHandler = beValue => {
        formikProps.values.signup.bevName = beValue.value;
        return getBevMetadata(beValue.value);
    };

    const getFieldmapping = formData => {
        let oneToMany = [];
        let rootFields = [];
        for (let rootIndex = 0; rootIndex < formData.object.field.length; rootIndex++) {
            if (!formData.object.field[rootIndex].system) {
                rootFields.push({
                    text: formData.object.field[rootIndex].label,
                    value: formData.object.field[rootIndex].name
                });
            }
        }
        if (formData.object.child) {
            for (let index = 0; index < formData.object.child.length; index++) {
                oneToMany.push({
                    text: formData.object.child[index].label,
                    value: formData.object.child[index].name
                });
            }
        }
        setOneToMany(oneToMany);
        setPortalStates(rootFields);
        setOneToManyFields(rootFields);
    };
   
    const handleChecked = React.useCallback((e) => {
        const { checked } = e.target;
        handleChange(USER_MANAGEMENT_KEYS.createAdditionalUsers, checked)
        handleBlur(USER_MANAGEMENT_KEYS.createAdditionalUsers);
        setCheckedUser(checked);
    }, [setCheckedUser, handleChange, handleBlur]);

    const handleCheckedMappedUsers = React.useCallback(
        e => {
            const { checked } = e.target;
            handleChange(USER_MANAGEMENT_KEYS.hasSameEmailAndUsername, checked)
            handleBlur(USER_MANAGEMENT_KEYS.hasSameEmailAndUsername);                 
            setCheckedMap(checked);
        },
        [checkedMap, setCheckedMap]
    );

    const genericHandleChange = (oneToMany) => {

        let oneToManyFields = [];

        for (let index = 0; index < bevMetadata.object.child.length; index++) {
            for (let indexField = 0; indexField < bevMetadata.object.child[index].field.length; indexField++) {
                if (bevMetadata.object.child[index].name === oneToMany.value) {
                    if (!bevMetadata.object.child[index].field[indexField].system){
                         oneToManyFields.push({
                             text: bevMetadata.object.child[index].field[indexField].label,
                             value: bevMetadata.object.child[index].field[indexField].name
                         });
                    }
                }
            }
        }
        if (oneToManyFields.length === 0) {
            for (let rootField = 0; rootField < bevMetadata.object.field.length; rootField++) {
                if (bevMetadata.object.field[rootField].label === oneToMany.value) {
                    if (!bevMetadata.object.field[rootField].system) {
                        oneToManyFields.push({
                            text: bevMetadata.object.field[rootField].label,
                            value: bevMetadata.object.field[rootField].name
                        });
                     }
                }
            }
        }
        setOneToManyFields(oneToManyFields);
    };

    const editGenericHandleChange = (resp, oneToMany) => {

        let oneToManyFields = [];
        if (!oneToMany) {
            for (let rootField = 0; rootField < resp.object.field.length; rootField++) {
                oneToManyFields.push({
                    text: resp.object.field[rootField].label,
                    value: resp.object.field[rootField].name
                });
            }
        }
        else {
            for (let index = 0; index < resp.object.child.length; index++) {
                for (let indexField = 0; indexField < resp.object.child[index].field.length; indexField++) {
                    if (resp.object.child[index].name === oneToMany) {
                        if (!resp.object.child[index].field[indexField].system) {
                            oneToManyFields.push({
                                text: resp.object.child[index].field[indexField].label,
                                value: resp.object.child[index].field[indexField].name
                            });
                        }
                    }
                }
            }
            if (oneToManyFields.length === 0) {
                for (let rootField = 0; rootField < resp.object.field.length; rootField++) {
                    if (resp.object.field[rootField].label === oneToMany) {
                        if (!resp.object.field[rootField].system) {
                             oneToManyFields.push({
                                 text: resp.object.field[rootField].label,
                                 value: resp.object.field[rootField].name
                            });
                        }
                    }
                }
            }
        }
        setOneToManyFields(oneToManyFields);
    };

    const pageContent = {
        USER_CREATION: () => <div key="user_creation">         
            <Form.Group className="form-group" required>
                <Form.Label className="form-label"
                    help={translate("LABEL_USER_ROLE_INFO")}>
                    {translate("LABEL_USER_ROLE")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="userManagement.userRoles"
                    as={Dropdown}
                    options={portalRole}
                    disabled={formikProps.values.isExternalUserManagementEnabled}
                    value={formikProps.values.userManagement &&
                        formikProps.values.userManagement.userRoles}
                    onBlur={() => handleBlur('userManagement.userRoles')}
                    onClose={(selectedItems) =>
                        handleMultiSelectDropdownChange(formikProps, selectedItems, 'userManagement.userRoles')}                     
                    multiple
                />
                {formikProps.touched.userManagement 
                    && formikProps.touched.userManagement.userRoles 
                    && formikProps.errors.userManagement
                    && formikProps.errors.userManagement.userRoles 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.userManagement.userRoles}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group" required={formikProps.values.isStateEnabled}>
                <Form.Label className="form-label" help={translate("LABEL_USER_MANAGE_STATE_INFO")}>
                    {translate("LABEL_USER_MANAGE_STATE")}
                </Form.Label>
                <Form.Control className="form-field"
                    name="userManagement.userStates"
                    as={Dropdown}
                    options={userPortalStates}
                    value={formikProps.values.userManagement &&
                        formikProps.values.userManagement.userStates}
                    onBlur={() => handleBlur('userManagement.userStates')}
                    disabled={!formikProps.values.isStateEnabled || formikProps.values.isExternalUserManagementEnabled}
                    onClose={(selectedItems) =>
                        handleMultiSelectDropdownChange(formikProps, selectedItems, 'userManagement.userStates')}                     
                    multiple
                />
                {formikProps.touched.userManagement 
                    && formikProps.touched.userManagement.userStates 
                    && formikProps.errors.userManagement
                    && formikProps.errors.userManagement.userStates 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.userManagement.userStates}</Form.Error></div>)}
            </Form.Group>
            <div className="hide__user__role">
                <Form.Group className="form-group">
                    <Form.Control className="form-field"
                        name="userManagement.hasUserRole"
                        as={Checkbox}
                        onChange={(e) => {
                            const { checked } = e.target;
                            handleChange('userManagement.hasUserRole', checked)
                            handleBlur('userManagement.hasUserRole');                            
                        }}
                        disabled={formikProps.values.isExternalUserManagementEnabled}
                        checked={formikProps.values.userManagement &&
                            formikProps.values.userManagement.hasUserRole}                        
                    >
                        {translate("LABEL_HIDE_USER_ROLE")}
                    </Form.Control>
                </Form.Group>
            </div>
            
        </div>,
        FIELD_MAPPING: () => <div key="field_mapping">
            <Form.Group className="form-group" required>
                <Form.Label
                    help={translate("LABEL_BE_VIEW_INFO")} 
                    className="form-label user__management__form__label"
                >
                    {translate("LABEL_BE_VIEW")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="userManagement.bevName"
                    as={Dropdown}
                    options={bevNames}
                    value={formikProps.values.userManagement &&
                        formikProps.values.userManagement.bevName}                    
                    onChange={beValue => {
                        handleChange('userManagement.bevName', beValue.value);
                        beHandler(beValue);
                    }}
                    onBlur={() => handleBlur('userManagement.bevName')}
                />
                {formikProps.touched.userManagement 
                    && formikProps.touched.userManagement.bevName 
                    && formikProps.errors.userManagement
                    && formikProps.errors.userManagement.bevName 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.userManagement.bevName}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label
                    help={translate("LABEL_SECTION_HEADING_INFO")}
                    className="form-label user__management__form__label"
                >
                    {translate("LABEL_SECTION_HEADING")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="userManagement.sectionHeading"
                    value={formikProps.values.userManagement &&
                        formikProps.values.userManagement.sectionHeading}
                    as={Input}
                    {...commonProps}
                />
            </Form.Group>
            <Section title={translate("LABEL_USERS")} help={translate("LABEL_USERS_INFO")}>
                <Form.Group className="flex align-items-center">
                    <Form.Control
                        name="userManagement.createAdditionalUsers"
                        className="width-auto"
                        as={Checkbox}
                        onChange={handleChecked}
                        checked={formikProps.values.userManagement &&
                            formikProps.values.userManagement.createAdditionalUsers}
                        disabled={formikProps.values.isExternalUserManagementEnabled}
                    >
                        {translate("LABEL_USER_CREATION")}                       
                    </Form.Control>
                    <Tooltip content={translate("LABEL_USER_CREATION_INFO")} position="right">
                        <i className="aicon aicon__help user__management__tooltip__icon" />
                    </Tooltip>                      
                </Form.Group>
                <Form.Group className="form-group" required={checkedUser}>
                    <Form.Label className="form-label" help={translate("LABEL_ONE_TO_MANY_INFO")}>
                        {translate("LABEL_ONE_TO_MANY")}
                    </Form.Label>
                    <Form.Control
                        className="form-field" 
                        as={Dropdown}
                        name="userManagement.fieldMapping.manyRowId"
                        options={oneToMany}
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.manyRowId
                        }
                        onBlur={() => handleBlur('userManagement.fieldMapping.manyRowId')}
                        onChange={beValue => {
                            handleChange('userManagement.fieldMapping.manyRowId', beValue.value)
                            genericHandleChange(beValue);
                        }}
                    />
                    {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.manyRowId 
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.manyRowId
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.manyRowId}</Form.Error></div>)}
                </Form.Group>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label">
                        {translate("LABEL_TABLE_USER_ROLE")}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="userManagement.fieldMapping.userRole.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.userRole.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.userRole.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.userRole
                            && formikProps.values.userManagement.fieldMapping.userRole.code
                        }                        
                    />
                    {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.userRole 
                        && formikProps.touched.userManagement.fieldMapping.userRole.code
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.userRole
                        && formikProps.errors.userManagement.fieldMapping.userRole.code
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.userRole.code}</Form.Error></div>)}
                </Form.Group>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label">
                        {translate("LABEL_TABLE_EMAIL")}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="userManagement.fieldMapping.email.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.email.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.email.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.email
                            && formikProps.values.userManagement.fieldMapping.email.code
                        }                               
                    />
                    {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.email 
                        && formikProps.touched.userManagement.fieldMapping.email.code
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.email
                        && formikProps.errors.userManagement.fieldMapping.email.code
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.email.code}</Form.Error></div>)}
                </Form.Group>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label">
                        {translate("LABEL_TABLE_USER_NAME")}
                    </Form.Label>
                    <Form.Control className="form-field"
                        name="userManagement.fieldMapping.userName.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.userName.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.userName.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.userName
                            && formikProps.values.userManagement.fieldMapping.userName.code
                        }                                         
                    />
                    {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.userName 
                        && formikProps.touched.userManagement.fieldMapping.userName.code
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.userName
                        && formikProps.errors.userManagement.fieldMapping.userName.code
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.userName.code}</Form.Error></div>)}
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Control className="form-field"
                        name="userManagement.hasSameEmailAndUsername"
                        as={Checkbox}
                        value="userManagement.hasSameEmailAndUsername"
                        onChange={handleCheckedMappedUsers}
                        checked={formikProps.values.userManagement &&
                            formikProps.values.userManagement.hasSameEmailAndUsername}                        
                    >
                        {translate("LABEL_USER_MAP_TO_EMAIL")}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label">{translate("LABEL_TABLE_FIRST_NAME")}</Form.Label>
                    <Form.Control
                        className="form-field"
                        name="userManagement.fieldMapping.firstName.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.firstName.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.firstName.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.firstName
                            && formikProps.values.userManagement.fieldMapping.firstName.code
                        }                        
                    />
                      {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.firstName 
                        && formikProps.touched.userManagement.fieldMapping.firstName.code
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.firstName
                        && formikProps.errors.userManagement.fieldMapping.firstName.code
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.firstName.code}</Form.Error></div>)}
                </Form.Group>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label">{translate("LABEL_TABLE_LAST_NAME")}</Form.Label>
                    <Form.Control className="form-field"
                        name="userManagement.fieldMapping.lastName.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.lastName.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.lastName.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.lastName
                            && formikProps.values.userManagement.fieldMapping.lastName.code
                        }                        
                    />
                      {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.lastName 
                        && formikProps.touched.userManagement.fieldMapping.lastName.code
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.lastName
                        && formikProps.errors.userManagement.fieldMapping.lastName.code
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.lastName.code}</Form.Error></div>)}
                </Form.Group>
                <Form.Group
                    className="form-group">
                    <Form.Label className="form-label" help={translate("LABEL_COUNTRY_DIALING_CODE_INFO")}>{translate("LABEL_COUNTRY_DIALING_CODE")}</Form.Label>
                    <Form.Control className="form-field"
                        name="userManagement.fieldMapping.countryDialingCode.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.countryDialingCode.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.countryDialingCode.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.countryDialingCode
                            && formikProps.values.userManagement.fieldMapping.countryDialingCode.code
                        }                         
                    />
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Label className="form-label" help={translate("LABEL_PHONE_NUMBER_INFO")}>{translate("LABEL_PHONE_NUMBER")}</Form.Label>
                    <Form.Control
                        className="form-field"
                        name="userManagement.fieldMapping.phoneNumber.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.phoneNumber.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.phoneNumber.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.phoneNumber
                            && formikProps.values.userManagement.fieldMapping.phoneNumber.code
                        }                         
                    />
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Label className="form-label" help={translate("LABEL_JOB_TITLE_INFO")}>{translate("LABEL_JOB_TITLE")}</Form.Label>
                    <Form.Control className="form-field"
                        name="userManagement.fieldMapping.jobTitle.code"
                        as={Dropdown}
                        options={oneToManyFields}
                        onBlur={() => handleBlur('userManagement.fieldMapping.jobTitle.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.jobTitle.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.jobTitle
                            && formikProps.values.userManagement.fieldMapping.jobTitle.code
                        }                         
                    />
                </Form.Group>
            </Section>
            <Section title={translate("LABEL_PORTAL_STATES")}>
                <Form.Group className="form-group" required={formikProps.values.isStateEnabled}>
                    <Form.Label
                        help={translate("LABEL_PORTAL_USER_STATE_INFO")} 
                        className="form-label user__management__form__label"
                    >
                        {translate("LABEL_PORTAL_USER_STATE")}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="userManagement.fieldMapping.userState.code"
                        as={Dropdown}
                        options={portalStates}
                        disabled={!formikProps.values.isStateEnabled}
                        onBlur={() => handleBlur('userManagement.fieldMapping.userState.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.userState.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.userState
                            && formikProps.values.userManagement.fieldMapping.userState.code
                        }                        
                    />
                      {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.userState 
                        && formikProps.touched.userManagement.fieldMapping.userState.code
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.userState
                        && formikProps.errors.userManagement.fieldMapping.userState.code
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.userState.code}</Form.Error></div>)}
                </Form.Group>
            </Section>
            <Section title={translate("LABEL_USER_MANAGE_SECTION_PORTAL_NAME")}>
                <Form.Group className="form-group" required>
                    <Form.Label
                        help={translate("LABEL_USER_MANAGE_PORTAL_NAME_INFO")} 
                        className="form-label user__management__form__label"
                    >
                        {translate("LABEL_USER_MANAGE_PORTAL_NAME")}
                    </Form.Label>
                    <Form.Control className="form-field"
                        name="userManagement.fieldMapping.portalAssociation.code"
                        as={Dropdown}
                        options={portalStates}
                        onBlur={() => handleBlur('userManagement.fieldMapping.portalAssociation.code')}
                        onChange={({ value }) => 
                            handleChange('userManagement.fieldMapping.portalAssociation.code', value)
                        }
                        value={formikProps.values.userManagement
                            && formikProps.values.userManagement.fieldMapping
                            && formikProps.values.userManagement.fieldMapping.portalAssociation
                            && formikProps.values.userManagement.fieldMapping.portalAssociation.code
                        }                        
                    />
                      {formikProps.touched.userManagement 
                        && formikProps.touched.userManagement.fieldMapping 
                        && formikProps.touched.userManagement.fieldMapping.portalAssociation 
                        && formikProps.touched.userManagement.fieldMapping.portalAssociation.code
                        && formikProps.errors.userManagement
                        && formikProps.errors.userManagement.fieldMapping 
                        && formikProps.errors.userManagement.fieldMapping.portalAssociation
                        && formikProps.errors.userManagement.fieldMapping.portalAssociation.code
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.userManagement.fieldMapping.portalAssociation.code}</Form.Error></div>)}
                </Form.Group>
            </Section>
            {!formikProps.values.isExternalUserManagementEnabled && <Section title={translate("LABEL_LOGIN_EMAIL_TEMPLATE")}>
                <Form.Group className="form-group">
                    <Form.Label
                        help={translate('LABEL_INVITATION_INFO')}
                        className=" form-label user__management__form__label"
                    >
                        {translate('LABEL_INVITATION')}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="userManagement.inviteEmailTemplate"
                        as={Input}
                        value={formikProps.values.userManagement &&
                            formikProps.values.userManagement.inviteEmailTemplate}                        
                        {...commonProps}
                    />
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Label
                        help={translate('LABEL_RESET_PASSWORD_SUCCESS_INFO')}
                        className="form-label user__management__form__label"
                    >
                        {translate('LABEL_RESET_PASSWORD_SUCCESS')}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="userManagement.resetPasswordEmailSuccessTemplate"
                        as={Input}
                        value={formikProps.values.userManagement &&
                            formikProps.values.userManagement.resetPasswordEmailSuccessTemplate}                           
                        {...commonProps}
                    />
                </Form.Group>
            </Section>}
        </div>
    };
    return <>
        <div className="default_message">
            {translate("LABEL_REGISTRATION_MESSAGE")}
        </div>
        <div>
            <Tabs className="tabs__section">
                <Tabs.Tab
                    aria-current={currentTab === "FIELD_MAPPING" ? "page" : undefined}
                    onClick={() => {
                        setCurrentTab("FIELD_MAPPING");
                    }}
                >
                    {translate("LABEL_FIELD_MAPPING")}
                </Tabs.Tab>
                {
                    checkedUser && <Tabs.Tab
                        aria-current={currentTab === "USER_CREATION" ? "page" : undefined}
                        onClick={() => setCurrentTab("USER_CREATION")}
                    >
                        {translate("LABEL_USER_CREATION_FORM")}
                    </Tabs.Tab>
                }
            </Tabs>
            <div>{pageContent[currentTab]()}</div>
        </div>
    </>;
};
export default React.memo(UserManagementForm);
