import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import {
    Form,
    Section,
    Tabs,
    Checkbox,
    Input,
    Dropdown,
    Tooltip,
 } from "@informatica/droplets-core";
import APIService from '../../../../utils/apiService';
import { APIMap } from '../../../../utils/apiMappings';
import { StateContext } from "../../../../context/stateContext";
import CONFIG from '../../../../config/config';
import BeFormBuilder from "../../../beFormBuilder/beFormBuilder";
import { getMaxNumberOfHorizontalDisplayOptions, getCookie } from '../../../../utils/utilityService';
import './index.css';

const DISABLE_SIGNUP = 'disableSignup';

const SignupForm = ({
    formikProps,
    formDataProp,
    formDataCallBack,
    isEdit,
    beDataCallBack,
    commonProps,
    handleChange,
    handleBlur,
    setActiveStep,
}) => {
    const { dispatch } = useContext(StateContext);
    const { t: translate } = useTranslation();
    const [currentTab, setCurrentTab] = useState('GENERAL');
    const { ACTIONS, NOTIFICATION_TYPE, MAX_HORIZONTAL_DISPLAY_SIGNUP_OPTIONS } = CONFIG;
    const [beValue, setBeValue] = useState('');
    const [bevMetadata, setBeMetadata] = useState(undefined);
    const [portalStates, setPortalStates] = useState([]);
    const [portalRole,setPortalRole] = useState([]);
    const [formData, setFormData] = useState({});
    const [beNameDropDownValues,setBenameDropDown] = useState([]);
    const [disableSignup, setDisableSignup] = useState(false);

    let maxHorizontalColOptions;
    maxHorizontalColOptions = useMemo(() => 
        getMaxNumberOfHorizontalDisplayOptions(MAX_HORIZONTAL_DISPLAY_SIGNUP_OPTIONS),
    [maxHorizontalColOptions]);

    useEffect(() => {
        setActiveStep();
    }, [setActiveStep]);

    useEffect(() => {
        const userManagementBeValue = formikProps.values.userManagement && formikProps.values.userManagement.bevName;
        setBeValue(userManagementBeValue);
        beDataCallBack(false);
        setBenameDropDown([{
            text: userManagementBeValue,
            value: userManagementBeValue
        }]);
        getBevMetadata(userManagementBeValue);

        if(formikProps.values.roleSettings) {
            getRoleStates();
        }
        if (formikProps.values.isStateEnabled && formikProps.values.stateSettings) {
            getPortalStates();
        }
        if(formikProps.values.disableSignup) {
            setDisableSignup(true);
        }
    }, []);

    useEffect(() => {
        if (formDataProp){
            setFormData(formDataProp);
        } else {
            setFormData(formikProps.values.signup.beFormComponent);
        }
    }, [formDataProp]);

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const getPortalStates = () => {
        const successCallback = (resp) => {
            if (resp && resp.hasOwnProperty('item') && resp.item.length > 0) {
                const portalStatesDropDownData = resp.item.map((portalState) => ({
                    "value": portalState[formikProps.values.stateSettings.fieldName],
                    "text": portalState[formikProps.values.stateSettings.fieldName]
                }));
                setPortalStates(portalStatesDropDownData);
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

    const getRoleStates = () => {
        const successCallback = (resp) => {
            if (resp && resp.hasOwnProperty('item') && resp.item.length > 0) {
                const portalRoleDropDownData = resp.item.map((portalState) => ({
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

    const getBevMetadata = (beName) => {
        APIService.getRequest(
            APIMap.getBevMetadata(formikProps.values.databaseId, beName),
            (resp) => {
                setBeMetadata(resp);
                getMandatoryFieldCheck(resp);
            },
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
    
    const getMandatoryFieldCheck = (resp)=>{
        for(let object = 0; object < resp.object.field.length; object++) {
            if (resp.object.field[object].required === true && !resp.object.field[object].system) {
                beDataCallBack(true);
            }
        }
    };

    const pageContent = {
        GENERAL: () => <div>
            <Form.Group className="form-group">
                <Form.Label className="form-label">{translate('LABEL_BACKGROUND_IMAGE')}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="signup.backgroundImage"
                    as={Input}
                    value={formikProps.values.signup.backgroundImage}
                    {...commonProps}
                />
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label">{translate('LABEL_TITLE')}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="signup.title"                    
                    as={Input}
                    value={formikProps.values.signup.title}
                    {...commonProps}
                />
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label">{translate('LABEL_WELCOME_TEXT')}</Form.Label>
                <Form.Control
                    className="form-field"
                    as={Input}
                    name="signup.welcomeText"
                    value={formikProps.values.signup.welcomeText}
                    {...commonProps}
                />
            </Form.Group>
            <Form.Group className="form-group" required>
                <Form.Label className="form-label" help={translate("LABEL_BE_VIEW_INFO")}>
                    {translate('LABEL_BE_VIEW')}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    as={Dropdown}
                    name="signup.bevName"
                    options={beNameDropDownValues}
                    value={formikProps.values.signup.bevName} 
                    onBlur={() => handleBlur('signup.bevName')}
                    onChange={({ value }) => handleChange('signup.bevName', value)}
                    defaultValue={beNameDropDownValues.length === 0 ? '' : beNameDropDownValues[0].value}>
                </Form.Control>
                {formikProps.touched.signup
                    && formikProps.touched.signup.bevName
                    && formikProps.errors.signup
                    && formikProps.errors.signup.bevName
                    && (<div className="form-error">
                        <Form.Error>
                            {formikProps.errors.signup.bevName}</Form.Error></div>)
                }
            </Form.Group>
            <Form.Group className="form-group" required>
                <Form.Label className="form-label" help={translate("LABEL_SIGNUP_USER_ROLE_INFO")}>
                    {translate('LABEL_SIGNUP_USER_ROLE')}
                </Form.Label>
                <Form.Control
                    name="signup.userRole"
                    className="form-field"
                    as={Dropdown}
                    options={portalRole}
                    value={formikProps.values.signup.userRole} 
                    onBlur={() => handleBlur('signup.userRole')}
                    onChange={({ value }) => handleChange('signup.userRole', value)}                    
                />
                {formikProps.touched.signup
                    && formikProps.touched.signup.userRole
                    && formikProps.errors.signup
                    && formikProps.errors.signup.userRole
                    && (<div className="form-error">
                        <Form.Error>
                            {formikProps.errors.signup.userRole}</Form.Error></div>)
                }
            </Form.Group>
            <Form.Group className="form-group"  required={formikProps.values.isStateEnabled}>
                <Form.Label className="form-label" help={translate("LABEL_SIGNUP_USER_STATE_INFO")}>
                    {translate('LABEL_SIGNUP_USER_STATE')}
                </Form.Label>
                {
                    formikProps.values.isStateEnabled ? 
                        <Form.Control 
                            name="signup.userState"
                            className="form-field"
                            as={Dropdown}
                            options={portalStates}
                            onBlur={() => handleBlur('signup.userState')}
                            onChange={({ value }) => handleChange('signup.userState', value)}
                            value={formikProps.values.signup.userState}                              
                        />
                        : <Form.Control 
                            className="form-field"
                            name="signup.userState"
                            as={Dropdown}
                            options={portalStates}
                            disabled={true}
                            value={formikProps.values.signup.userState}
                        />
                }
                {formikProps.touched.signup
                    && formikProps.touched.signup.userState
                    && formikProps.errors.signup
                    && formikProps.errors.signup.userState
                    && (<div className="form-error">
                        <Form.Error>
                            {formikProps.errors.signup.userState}</Form.Error></div>)
                }
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label">
                    {translate('LABEL_MAX_HORIZONTAL_COLUMNS')}
                </Form.Label>
                <Form.Control
                    name="signup.maxColumns"
                    className="form-field" 
                    as={Dropdown}
                    options={maxHorizontalColOptions}
                    value={formikProps.values.signup.maxColumns}
                    onBlur={() => handleBlur('signup.maxColumns')}
                    onChange={({ value }) => handleChange('signup.maxColumns', value)}                      
                />
            </Form.Group>
            {/* <Form.Group className="form-group" name="signup.isCaptchaEnabled">
                <Form.Control className="form-field" checked={true} as={Form.Checkbox}>
                    {translate('LABEL_ENABLE_CAPTCHA')}
                </Form.Control>
                <Form.Error />
            </Form.Group> */}

            <Section title={translate("LABEL_LOGIN_EMAIL_TEMPLATE")}>
                <Form.Group className="form-group" >
                    <Form.Label className="form-label" help={translate('LABEL_REGISTRATION_SUCCESS_INFO')}>{translate('LABEL_REGISTRATION_SUCCESS')}</Form.Label>
                    <Form.Control
                        className="form-field"
                        as={Input}
                        name="signup.registrationEmailTemplate"
                        value={formikProps.values.signup.registrationEmailTemplate}
                        {...commonProps}
                    />
                </Form.Group>
            </Section>
        </div>,
        SIGNUPFORM: () => <BeFormBuilder
            configName={beValue}
            configType="BEView"
            beFormBuilderData={formData}
            beFieldsMetaModel={bevMetadata}
            saveFormData={builderFormData => {
                setFormData(builderFormData)
                formDataCallBack(builderFormData)
            }}
        />        
    };

    const handleChecked = React.useCallback((e) => {
        const { checked } = e.target;
        handleChange(DISABLE_SIGNUP, checked);
        handleBlur(DISABLE_SIGNUP);
        setDisableSignup(checked);
    }, [setDisableSignup]);

    useEffect(() => {
        if(isEdit && formikProps.values.isExternalUserManagementEnabled) {
            handleChange(DISABLE_SIGNUP, true);
            handleBlur(DISABLE_SIGNUP);
            setDisableSignup(true);
        }
    }, [isEdit])

    const RenderDisableSignupOption = () => (
        <Form.Group className="flex align-items-center">
            <Form.Control
                value="disableSignup"
                className="width-auto"
                as={Checkbox}
                onChange={handleChecked}
                name="disableSignup"
                checked={formikProps.values.disableSignup}
                disabled={formikProps.values.isExternalUserManagementEnabled}
            >
                {translate("LABEL_DISABLE_REGISTRATION")}
            </Form.Control>
            <Tooltip content={ formikProps.values.isExternalUserManagementEnabled ? 
                    translate("LABEL_DISABLE_REGISTRATION_EXTERNAL_USER_INFO") : translate("LABEL_DISABLE_REGISTRATION_INFO")} 
                position="right"
            >
                <i className="aicon aicon__help disable__registration__tooltip__icon" />
            </Tooltip>                 
        </Form.Group>
    );

    return <>
        <RenderDisableSignupOption />
        { !disableSignup && (<>
            <div className="default_message">
                {translate('LABEL_REGISTRATION_MESSAGE')}
            </div>
            <div>
                <Tabs className="tabs__section">
                    <Tabs.Tab
                        aria-current={currentTab === 'GENERAL' ? 'page' : undefined}
                        onClick={() => setCurrentTab('GENERAL')}
                    >
                        {translate("LABEL_PAGE_DETAILS_SIGNUP_PAGE")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        aria-current={currentTab === 'SIGNUPFORM' ? 'page' : undefined}
                        onClick={() => setCurrentTab('SIGNUPFORM')}
                    >
                        {translate("LABEL_LAYOUT_SIGNUP_PAGE")}
                    </Tabs.Tab>
                </Tabs>
                <div>{pageContent[currentTab]()}</div>
            </div>
        </>) }
    </>;
};
export default React.memo(SignupForm);
