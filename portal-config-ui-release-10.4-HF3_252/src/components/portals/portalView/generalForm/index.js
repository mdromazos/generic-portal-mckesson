import React, { useState, useContext, useEffect, useCallback } from "react";
import { ChromePicker } from "react-color";
import { useTranslation } from "react-i18next";
import {
    Form,
    Section,
    Button,
    MessageBox,
    Input,
    Dropdown,
    Radio,
    useMessageBoxState,
    Textarea,
    Tooltip,
    IconButton
 } from "@informatica/droplets-core";
import { StateContext } from "../../../../context/stateContext";
import APIService from "../../../../utils/apiService";
import { APIMap } from "../../../../utils/apiMappings";
import { hexToRgb, getCookie } from "../../../../utils/utilityService";
import CONFIG from "../../../../config/config";
import "./index.css";

const IS_STATE_ENABLED = 'isStateEnabled';

const GeneralForm = ({ isEdit, formikProps, commonProps, handleBlur, handleChange, setActiveStep }) => {
    const { t: translate } = useTranslation();
    const { state: { portalConfig }, dispatch } = useContext(StateContext);
    const {ACTIONS, NOTIFICATION_TYPE } = CONFIG;
    const [databases, setDatabases] = useState([]);
    const [portalStateEnabled, setPortalStateEnabled] = useState(false);

    const defaultRgbPortalConfig = {
        "header": {},
        "footer": {},
    };
    const [rgbPortalConfig, setRgbPortalConfig] = useState(defaultRgbPortalConfig);
    const [businessEntities, setBusinessEntities] = useState([]);
    const [states, setStates] = useState([]);
    const [sourceSystemOptions, setSourceSystemOptions] = useState([]);
    const [referenceEntities, setReferenceEntities] = useState([]);
    const [rolefieldName,setRoleFieldName] = useState([]);
    const [stateFieldName,setStateFieldName] =useState([]);
    const [lookupFieldObject,setLookupFieldObject] = useState({});
    const validationStatusMessageBox = useMessageBoxState();
    const roleValidationMessageBox = useMessageBoxState();
        
    useEffect(() => {
        getDatabases();
        setUpdatedInfo();
    }, [portalConfig]);

    useEffect(() => {
        if (databases.length > 0 && formikProps.values.databaseId && !isEdit) {
            getBusinessEntities(formikProps.values.databaseId);
            getSourceSystems(formikProps.values.databaseId);
            getLookupTablesData(formikProps.values.databaseId);
        }
    }, [databases]);

    useEffect(() => {
        if (formikProps.values.roleSettings && formikProps.values.roleSettings.referenceEntity) {
            setRoleFieldName(lookupFieldObject[formikProps.values.roleSettings.referenceEntity]);
        }
        if(formikProps.values.isStateEnabled && formikProps.values.stateSettings && 
            formikProps.values.stateSettings.referenceEntity) {
                setStateFieldName(lookupFieldObject[formikProps.values.stateSettings.referenceEntity]);
        }
    }, [lookupFieldObject]);

    useEffect(() => {
        if (formikProps.values && formikProps.values.isStateEnabled) {
            setPortalStateEnabled(true);
        }
    }, [isEdit]);

    useEffect(() => {
        setActiveStep();
    }, [setActiveStep])

    const setUpdatedInfo = () => {
        if (isEdit) {
            const { generalSettings: { databaseId, isStateEnabled, header, footer }} = portalConfig;
            let newRgbConfig = { ...rgbPortalConfig };
            if (header) {
                newRgbConfig.header.fontColorRGB = (header.fontColor) ? hexToRgb(header.fontColor) : "";
                newRgbConfig.header.backgroundColorRGB = (header.backgroundColor) ? hexToRgb(header.backgroundColor) : "";
            }
            if (footer) {
                newRgbConfig.footer.fontColorRGB = (footer.fontColor) ? hexToRgb(footer.fontColor) : "";
                newRgbConfig.footer.backgroundColorRGB = (footer.backgroundColor) ? hexToRgb(footer.backgroundColor) : "";
            }
            setPortalStateEnabled(isStateEnabled);
            setRgbPortalConfig(newRgbConfig);
            getBusinessEntities(databaseId);
            getSourceSystems(databaseId);
            getLookupTablesData(databaseId);
        }
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

    const getDatabases = () => {
        const successCallback = (resp) => {
            if (resp) {
                const databaseDropdownData = resp.map((database) => ({
                    value: database.databaseId,
                    text: database.label,
                }));
                setDatabases(databaseDropdownData);
            }
        };
        APIService.getRequest(
            APIMap.getDatabases(),
            successCallback,
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
        );
    };

    const [isHeaderBGColorPaletteOpen, toggleHeaderBGColorPalette] = useState(false);
    const handleHeaderBGColorPalette = useCallback((openPalette) => {
        return toggleHeaderBGColorPalette(openPalette);
    }, [isHeaderBGColorPaletteOpen, toggleHeaderBGColorPalette]);

    const [isFooterBGColorPaletteOpen, toggleFooterBGColorPalette] = useState(false);
    const handleFooterBGColorPalette = useCallback((openPalette) => {
        return toggleFooterBGColorPalette(openPalette);
    }, [isFooterBGColorPaletteOpen, toggleFooterBGColorPalette]);

    const [isHeaderFontColorPaletteOpen, toggleHeaderFontColorPalette] = useState(false);
    const handleHeaderFontColorPalette = useCallback((openPalette) => {
        return toggleHeaderFontColorPalette(openPalette);
    }, [isHeaderFontColorPaletteOpen, toggleHeaderFontColorPalette]);

    const [isFooterFontColorPaletteOpen, toggleFooterFontColorPalette] = useState(false);
    const handleFooterFontColorPalette = useCallback((openPalette) => {
        return toggleFooterFontColorPalette(openPalette);
    }, [isFooterFontColorPaletteOpen, toggleFooterFontColorPalette]);

    const setHeaderBGColor = (color) => {
        formikProps.setFieldValue("header.backgroundColor", color.hex, false);
        let newRgbConfig = { ...rgbPortalConfig };
        if (!newRgbConfig.header) {
            newRgbConfig.header = {};
        }
        newRgbConfig.header.backgroundColorRGB = color.rgb;
        setRgbPortalConfig(newRgbConfig);
    };

    const setFooterBGColor = (color) => {
        formikProps.setFieldValue("footer.backgroundColor", color.hex, false);
        let newRgbConfig = { ...rgbPortalConfig };
        if (!newRgbConfig.footer) {
            newRgbConfig.footer = {};
        }
        newRgbConfig.footer.backgroundColorRGB = color.rgb;
        setRgbPortalConfig(newRgbConfig);
    };

    const setHeaderFontColor = (color) => {
        formikProps.setFieldValue("header.fontColor", color.hex, false);
        let newRgbConfig = { ...rgbPortalConfig };
        if (!newRgbConfig.header) {
            newRgbConfig.header = {};
        }
        newRgbConfig.header.fontColorRGB = color.rgb;
        setRgbPortalConfig(newRgbConfig);
    };

    const setFooterFontColor = (color) => {
        formikProps.setFieldValue("footer.fontColor", color.hex, false);
        let newRgbConfig = { ...rgbPortalConfig };
        if (!newRgbConfig.footer) {
            newRgbConfig.footer = {};
        }
        newRgbConfig.footer.fontColorRGB = color.rgb;
        setRgbPortalConfig(newRgbConfig);
    };

    const getColorPicker = (onChangeHandler, color, onBlurHandler) => {
        return <div
            className="portal-color-palette" tabIndex={0}
            onBlur={(e) => {
                if (e.target && e.relatedTarget && e.target.contains(e.relatedTarget)) {
                    return;
                }
                onBlurHandler.call({}, false);
            }}
        >
            <ChromePicker color={color} onChangeComplete={onChangeHandler} />
        </div>;
    };

    const handlePortalStateChange = useCallback((event) => {
        const parsedValue = JSON.parse(event.target.value);
        handleChange(IS_STATE_ENABLED, parsedValue)
        handleBlur(IS_STATE_ENABLED);
        setPortalStateEnabled(parsedValue);
    }, [setPortalStateEnabled, handleChange, handleBlur]);

    const stateValidateMessageBox = () => {
        const { stateSettings: { fieldName } } = formikProps.values;
        return(<MessageBox
                    {...validationStatusMessageBox}
                    type={NOTIFICATION_TYPE.SUCCESS}
                    title={translate("STATE_CONF_VALIDATE_DIALOG_HEADER")}
                >
                    <MessageBox.Content>
                        <MessageBox.Title>
                            {translate("STATE_CONF_VALIDATE_DIALOG_CONTENT_HEADING")}
                        </MessageBox.Title>
                        <p className="message__box__content">
                            {
                                states.length === 0 && <div>
                                    {translate("STATE_CONF_VALIDATE_DIALOG_NO_STATE_FOUND")}
                                </div>
                            }
                            {
                                states.length !== 0 && states[0].hasOwnProperty(fieldName) && 
                                <div>
                                    <ul>
                                        {
                                            states.map(state =>
                                                (
                                                    <li key={`state_${state["rowidObject"]}`}>
                                                        {
                                                            state[fieldName]
                                                        }
                                                    </li>
                                                ),
                                            )
                                        }
                                    </ul>
                                </div>
                            }
                        </p>
                    </MessageBox.Content>
                    <MessageBox.Footer>
                    <Button onClick={validationStatusMessageBox.close} >
                        {translate("STATE_CONF_VALIDATE_DIALOG_OK_BTN")}
                    </Button>
                    </MessageBox.Footer>
        </MessageBox>)
    };

    const roleValidateMessageBox = () => {
        const { roleSettings: { fieldName } } = formikProps.values;
        return (
            <MessageBox
                {...roleValidationMessageBox}
                type={NOTIFICATION_TYPE.SUCCESS}
                title={translate("ROLE_CONF_VALIDATE_DIALOG_HEADER")}>
                <MessageBox.Content>
                    <MessageBox.Title>
                        {translate("ROLE_CONF_VALIDATE_DIALOG_CONTENT_HEADING")}
                    </MessageBox.Title>
                    <p  className="message__box__content">
                        {
                            states.length === 0 && <div>
                                { translate("ROLE_CONF_VALIDATE_DIALOG_NO_STATE_FOUND") }
                            </div>
                        }
                        {
                            states.length !== 0 && states[0].hasOwnProperty(fieldName) && 
                            <div>
                                <ul>
                                    {
                                        states.map(state =>
                                            (
                                                <li key={`state_${state["rowidObject"]}`}>
                                                    {
                                                        state[fieldName]
                                                    }
                                                </li>
                                            ),
                                        )
                                    }
                                </ul>
                            </div>
                        }
                    </p>
                </MessageBox.Content>
                <MessageBox.Footer>
                <Button onClick={roleValidationMessageBox.close}>
                    { translate("STATE_CONF_VALIDATE_DIALOG_OK_BTN") }
                </Button>
                </MessageBox.Footer>
            </MessageBox>
        );
    };

    const isValidStateConfiguration = () => {
        let isValid = true;
        if(!formikProps.values.databaseId) {
            formikProps.setFieldTouched("databaseId", true, true);
            isValid = false;
        }
        if(isValid) {
            if (formikProps.values.stateSettings ) {
                if(!formikProps.values.stateSettings.referenceEntity) {
                    formikProps.setFieldTouched("stateSettings.referenceEntity", true, true);
                    isValid =  false;
                }
                if(!formikProps.values.stateSettings.fieldName) {
                    formikProps.setFieldTouched("stateSettings.fieldName", true, true);
                    isValid = false;
                }
            } else {
                formikProps.setFieldTouched("stateSettings.referenceEntity", true, true);
                formikProps.setFieldTouched("stateSettings.fieldName", true, true);
                isValid = false;
            }
        }
        if(isValid) {
            return true;
        }
        return false;
    };

    const isValidRoleConfiguration = () => {
        let isValid = true;
        if(!formikProps.values.databaseId) {
            formikProps.setFieldTouched("databaseId", true, true);
            isValid = false;
        }
        if(isValid) {
            if (formikProps.values.roleSettings ) {
                if(!formikProps.values.roleSettings.referenceEntity) {
                    formikProps.setFieldTouched("roleSettings.referenceEntity", true, true);
                    isValid = false;
                }
                if(!formikProps.values.roleSettings.fieldName) {
                    formikProps.setFieldTouched("roleSettings.fieldName", true, true);
                    isValid = false;
                }
            } else {
                formikProps.setFieldTouched("roleSettings.referenceEntity", true, true);
                formikProps.setFieldTouched("roleSettings.fieldName", true, true);
                isValid = false;
            }
        }
        if(isValid) {
            return true;
        }
        return false;
    };

    const getStateConfiguration = () => {
        if (isValidStateConfiguration()) {
            const { databaseId, stateSettings: { referenceEntity, filterFieldName, filterFieldValue }} = formikProps.values;

            APIService.getRequest(
                APIMap.getLookupData(databaseId, referenceEntity, filterFieldName, filterFieldValue),
                (resp) => {
                    const { item } = resp;
                    setStates(item);
                    validationStatusMessageBox.open();
                },
                () => {
                    setStates([]);
                    validationStatusMessageBox.open();
                },
                { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
            );
        }
    };
    const getRoleConfiguration = () => {
        if (isValidRoleConfiguration()) {
            const { databaseId, roleSettings: { referenceEntity }} = formikProps.values;
            APIService.getRequest(
                APIMap.getLookupData(databaseId, referenceEntity),
                (resp) => {
                    const { item } = resp;
                    setStates(item);
                    roleValidationMessageBox.open();
                },
                () => {
                    setStates([]);
                    roleValidationMessageBox.open();
                },
                { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
            );
        }
    };
    
    const getBusinessEntities = (databaseId) => {
        APIService.getRequest(
            APIMap.getBusinessEntities(databaseId),
            ({ item }) => {
                if (item && item.length) {
                    let entites = item.map(be => (
                        {
                            text: be.object.label,
                            value: be.object.name,
                        }
                    ));
                    entites.sort(function (entity1, entity2) {
                        let name1 = entity1.value.toLowerCase();
                        let name2 = entity2.value.toLowerCase();
                        return name1.localeCompare(name2);
                    });
                    setBusinessEntities(entites);
                }
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
                setBusinessEntities([]);
            },
            { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
        );
    };

    const getLookupTablesData = (databaseID) => {

        const successCallback = (resp) => {
            if (resp) { 
                let filterFields = {};
                let fieldTempObject = {};
                let lookupDropdownData = resp.item.map((lookUpField) => {

                    filterFields = lookUpField.object.field.filter((fields) => (
                        !fields.system
                    ))
                    
                    if(filterFields) {
                        let fields =  filterFields.map((field) => (
                            { value: field.name, text: field.label }
                        ))
                        Object.assign(fieldTempObject, { [lookUpField.object.name] : fields });
                    }

                    return  {
                        value: lookUpField.object.name,
                        text: lookUpField.object.label,
                    }
                });
                lookupDropdownData.sort(function (lookUpField1, lookUpField2) {
                    let name1 = lookUpField1.value.toLowerCase();
                    let name2 = lookUpField2.value.toLowerCase();
                    return name1.localeCompare(name2);
                });
                setReferenceEntities(lookupDropdownData);
                setLookupFieldObject(fieldTempObject);
            }
        };
        APIService.getRequest(
            APIMap.getLookupTableData(databaseID),
            successCallback,
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
                }
                else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR)
                }
            },
            {[CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
            
        );
    };

    const getSourceSystems = (databaseID) => {
        const successCallback = (resp) => {
            if (resp) {
                const sourceSystemDropdownData = resp.sourceSystems.map((srcSystem) => ({
                    value: srcSystem.name,
                    text: srcSystem.name,
                }));
                setSourceSystemOptions(sourceSystemDropdownData);
            }
        };
        APIService.getRequest(
            APIMap.getSourceSystem(databaseID),
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

    return <>
        <div className="default_message">
            {translate("LABEL_PORTAL_MESSAGE")}
        </div>
        {
            !validationStatusMessageBox.closed && stateValidateMessageBox()
        }
        {
            !roleValidationMessageBox.closed && roleValidateMessageBox()
        }
        <Section title={translate("LABEL_PORTAL_DETAIL_SECTION")} collapsible>            
            <Form.Group required className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_PORTAL_NAME_INFO")}>
                    {translate("LABEL_PORTAL_NAME")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="portalName"
                    as={Input}
                    disabled={isEdit}
                    value={formikProps.values.portalName}
                    {...commonProps}
                />
                {formikProps.touched.portalName 
                    && formikProps.errors.portalName 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.portalName}</Form.Error>
                    </div>)}
            </Form.Group>
            <Form.Group required className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_PORTAL_TITLE_INFO")}>
                    {translate("LABEL_PORTAL_TITLE")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="portalTitle"
                    as={Input}
                    value={formikProps.values.portalTitle}
                    {...commonProps}
                />
                {formikProps.touched.portalTitle
                    && formikProps.errors.portalTitle
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.portalTitle}</Form.Error>
                    </div>)}
            </Form.Group>
                <Form.Group required className="form-group">
                    <Form.Label className="form-label" help={translate("LABEL_DATABASE_INFO")}>
                        {translate("LABEL_DATABASE")}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="databaseId"
                        value={formikProps.values.databaseId}
                        as={Dropdown}
                        options={databases}
                        onBlur={() => handleBlur('databaseId')}
                        onChange={({ value }) => {
                            handleChange('databaseId', value);
                            getBusinessEntities(value);
                            getSourceSystems(value);
                            getLookupTablesData(value);
                        }}
                        disabled={isEdit}
                    />
                    {formikProps.touched.databaseId 
                        && formikProps.errors.databaseId
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.databaseId}</Form.Error></div>)}
                </Form.Group>
            <Form.Group required className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_BUSINESS_ENTITY_INFO")}>
                    {translate("LABEL_BUSINESS_ENTITY")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="beName"
                    value={formikProps.values.beName}
                    onBlur={() => handleBlur('beName')}
                    onChange={({ value }) => handleChange('beName', value)}
                    as={Dropdown}
                    options={businessEntities}
                    disabled={isEdit}
                />
                {formikProps.touched.beName 
                    && formikProps.errors.beName 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.beName}</Form.Error></div>)}
            </Form.Group>
            <Form.Group required className="form-group">
                <Form.Label className="form-label">{translate("LABEL_SOURCE_SYSTEM")}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="sourceSystem"
                    value={formikProps.values.sourceSystem}
                    onBlur={() => handleBlur('sourceSystem')}
                    onChange={({ value }) => handleChange('sourceSystem', value)}                    
                    as={Dropdown}
                    options={sourceSystemOptions} 
                    disabled={isEdit}
                />
                {formikProps.touched.sourceSystem
                    && formikProps.errors.sourceSystem 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.sourceSystem}</Form.Error></div>)}
            </Form.Group>
            <Form.Group required className="form-group">
                <Form.Label className="radio-form-label" help={translate("LABEL_ENABLE_STATE_INFO")}>
                    {translate("LABEL_ENABLE_STATE")}
                </Form.Label>
                <div className="radio-form-group">
                    <Form.Control
                        className="radio-form-field"
                        name="isStateEnabled"
                        onChange={handlePortalStateChange}
                        value={true}
                        as={Radio}
                        disabled={isEdit}
                        data-testid="is-state-enabled-true"
                        checked={Boolean(formikProps.values.isStateEnabled) === true}
                    >{translate("LABEL_YES")}</Form.Control>
                    <Form.Control
                        name="isStateEnabled"
                        onChange={handlePortalStateChange}
                        value={false}
                        as={Radio}
                        disabled={isEdit}
                        checked={Boolean(formikProps.values.isStateEnabled) === false}
                    >{translate("LABEL_NO")}</Form.Control>
                </div>
                {formikProps.touched.isStateEnabled 
                    && formikProps.errors.isStateEnabled 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.isStateEnabled}</Form.Error></div>)}
            </Form.Group>

            <Form.Group required className="form-group">
                <Form.Label className="radio-form-label">
                    {translate("LABEL_ENABLE_EXTERNAL_USER_MANAGEMENT")}
                </Form.Label>
                <div className="radio-form-group">
                    <Form.Control
                        name="isExternalUserManagementEnabled"
                        className="width-auto"
                        value={true}
                        as={Radio}
                        disabled={isEdit}
                        onChange={(e) => {
                            const { value } = e.target;
                            handleChange('isExternalUserManagementEnabled', JSON.parse(value));
                            handleChange('disableSignup', true);
                            handleBlur('isExternalUserManagementEnabled');                            
                        }}
                        data-testid="is-external-user-true"
                        checked={Boolean(formikProps.values.isExternalUserManagementEnabled) === true}
                    >{translate("LABEL_YES")}</Form.Control>
                    <Form.Control
                        name="isExternalUserManagementEnabled"
                        className="width-auto"
                        value={false}
                        as={Radio}
                        disabled={isEdit}
                        onChange={(e) => {
                            const { value } = e.target;
                            handleChange('isExternalUserManagementEnabled', JSON.parse(value));
                            handleChange('disableSignup', false);
                            handleBlur('isExternalUserManagementEnabled');                            
                        }}
                        data-testid="is-external-user-false"
                        checked={Boolean(formikProps.values.isExternalUserManagementEnabled) === false}
                    >{translate("LABEL_NO")}</Form.Control>
                    <Tooltip position="right" content={translate("LABEL_ENABLE_EXTERNAL_USER_MANAGEMENT_INFO")}>
                        <IconButton>
                            <i className="aicon aicon__info info__icon" />
                        </IconButton>
                    </Tooltip>
                </div>
            </Form.Group>
        </Section>
        {portalStateEnabled && (
            <Section title={translate("LABEL_STATE_SETTINGS_SECTION")} collapsible>
                <Form.Group required className="form-group">
                    <Form.Label className="form-label"
                        help={translate("LABEL_STATE_CONF_TABLE_NAME_INFO")}
                    >
                        {translate("LABEL_STATE_CONF_TABLE_NAME")}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        name="stateSettings.referenceEntity"
                        as={Dropdown}
                        value={formikProps.values.stateSettings && formikProps.values.stateSettings.referenceEntity}
                        onBlur={() => handleBlur('stateSettings.referenceEntity')} 
                        onChange={({ value }) => {
                            handleChange('stateSettings.referenceEntity', value);
                            setStateFieldName(lookupFieldObject[value]);
                        }}
                        options={referenceEntities}
                    />
                    {formikProps.touched.stateSettings 
                        && formikProps.touched.stateSettings.referenceEntity 
                        && formikProps.errors.stateSettings
                        && formikProps.errors.stateSettings.referenceEntity 
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.stateSettings.referenceEntity}</Form.Error></div>)}
                </Form.Group>
                <Form.Group required className="form-group">
                    <Form.Label className="form-label" help={translate("LABEL_STATE_CONF_COLUMN_NAME_INFO")}>
                        {translate("LABEL_STATE_CONF_COLUMN_NAME")}
                    </Form.Label>
                    {stateFieldName && 
                        <Form.Control
                            className="form-field"
                            as={Dropdown}
                            value={formikProps.values.stateSettings && formikProps.values.stateSettings.fieldName}
                            name="stateSettings.fieldName"
                            options={stateFieldName}
                            onBlur={() => handleBlur('stateSettings.fieldName')}
                            onChange={({ value }) => handleChange('stateSettings.fieldName', value)}
                        />                    
                    }
                    {formikProps.touched.stateSettings 
                        && formikProps.touched.stateSettings.fieldName 
                        && formikProps.errors.stateSettings
                        && formikProps.errors.stateSettings.fieldName 
                        &&(<div className="form-error">
                            <Form.Error>{formikProps.errors.stateSettings.fieldName}</Form.Error></div>)}
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Label className="form-label" help={translate("LABEL_STATE_CONF_FILTER_BY_COLUMN_INFO")}>
                        {translate("LABEL_STATE_CONF_FILTER_BY_COLUMN")}
                    </Form.Label>
                    {stateFieldName && 
                        <Form.Control
                            className="form-field"
                            as={Dropdown}
                            value={formikProps.values.stateSettings && formikProps.values.stateSettings.filterFieldName}
                            name="stateSettings.filterFieldName"
                            options={stateFieldName}
                            onBlur={() => handleBlur('stateSettings.filterFieldName')}
                            onChange={({ value }) => handleChange('stateSettings.filterFieldName', value)}                        
                        />                    
                    }
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Label className="form-label" help={translate("LABEL_STATE_CONF_FILTER_BY_VALUE_INFO")}>
                        {translate("LABEL_STATE_CONF_FILTER_BY_VALUE")}
                    </Form.Label>
                    <Form.Control
                        className="form-field"
                        as={Input}
                        value={formikProps.values.stateSettings && formikProps.values.stateSettings.filterFieldValue}
                        name="stateSettings.filterFieldValue"
                        {...commonProps}
                    />
                </Form.Group>
                <div className='validate__state'>
                    <Form.Group >
                        <div className="validateState" onClick={getStateConfiguration}>
                            { translate("LABEL_VIEW_LIST_OF_STATES") }
                        </div>
                        <Form.Control
                            className="form-field"
                            name="validateState"
                            value={formikProps.values.validateState}
                            type="hidden"
                            as={Input} 
                            {...commonProps}
                        />
                        {formikProps.touched.validateState
                            && formikProps.errors.validateState 
                            &&(<div className="form-error">
                                <Form.Error>{formikProps.errors.validateState}</Form.Error></div>)
                        }
                    </Form.Group>
                </div>
            </Section>)}
        <Section title={translate("LABEL_ROLE_SETTINGS_SECTION")} collapsible>
            <Form.Group required className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_ROLE_REFERENCE_ENTITY_INFO")}>
                    {translate("LABEL_ROLE_REFERENCE_ENTITY")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    as={Dropdown}
                    options={referenceEntities}
                    value={formikProps.values.roleSettings && formikProps.values.roleSettings.referenceEntity}
                    name="roleSettings.referenceEntity"
                    onBlur={() => handleBlur('roleSettings.referenceEntity')}
                    onChange={({ value }) => { 
                        handleChange('roleSettings.referenceEntity', value);
                        setRoleFieldName(lookupFieldObject[value]);
                    }}
                />
                {formikProps.touched.roleSettings 
                    && formikProps.touched.roleSettings.referenceEntity 
                    && formikProps.errors.roleSettings
                    && formikProps.errors.roleSettings.referenceEntity 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.roleSettings.referenceEntity}</Form.Error></div>)}
            </Form.Group>
            <Form.Group required className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_ROLE_FIELD_NAME_INFO")}>
                    {translate("LABEL_ROLE_FIELD_NAME")}
                </Form.Label>
                {rolefieldName &&
                    <Form.Control
                        className="form-field"
                        as={Dropdown}
                        value={formikProps.values.roleSettings && formikProps.values.roleSettings.fieldName}
                        options={rolefieldName}
                        name="roleSettings.fieldName"
                        onBlur={() => handleBlur('roleSettings.fieldName')}
                        onChange={({ value }) => handleChange('roleSettings.fieldName', value)}                   
                    />                
                }
                {formikProps.touched.roleSettings 
                    && formikProps.touched.roleSettings.fieldName 
                    && formikProps.errors.roleSettings
                    && formikProps.errors.roleSettings.fieldName 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.roleSettings.fieldName}</Form.Error></div>)}
            </Form.Group>
            <div className='validate__role'>
                <Form.Group className="form-group">
                    <div className="validateState" onClick={getRoleConfiguration}>
                        { translate("LABEL_VIEW_LIST_OF_ROLES") }
                    </div>
                    <Form.Control
                        className="form-field"
                        name="validateRole"
                        value={formikProps.values.validateRole}
                        type="hidden"
                        as={Input}
                    />
                    {formikProps.touched.validateRole 
                    && formikProps.errors.validateRole 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.validateRole}</Form.Error></div>)}
                </Form.Group>
            </div>
        </Section>
        <Section title={translate("LABEL_HEADER_SECTION")} collapsible>
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_LOGO_INFO")}>
                    {translate("LABEL_LOGO")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="header.logo"
                    value={formikProps.values.header && formikProps.values.header.logo}
                    as={Input} 
                    {...commonProps}
                />
                {formikProps.touched.header 
                    && formikProps.touched.header.logo 
                    && formikProps.errors.header
                    && formikProps.errors.header.logo 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.header.logo}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_HEADER_BACKGROUND_COLOR_INFO")}>
                    {translate("LABEL_BACKGROUND_COLOR")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="header.backgroundColor"
                    value={formikProps.values.header && formikProps.values.header.backgroundColor}
                    as={Input} 
                    onClick={() => handleHeaderBGColorPalette(!isHeaderBGColorPaletteOpen)}
                    readOnly={true}
                    {...commonProps}
                    data-testid="header-bg-color"
                />
                {
                    isHeaderBGColorPaletteOpen &&
                    getColorPicker(setHeaderBGColor, rgbPortalConfig.header.backgroundColorRGB, handleHeaderBGColorPalette)
                }
                {formikProps.touched.header 
                    && formikProps.touched.header.backgroundColor 
                    && formikProps.errors.header
                    && formikProps.errors.header.backgroundColor 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.header.backgroundColor}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_HEADER_FONT_COLOR_INFO")}>
                    {translate("LABEL_FONT_COLOR")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="header.fontColor"
                    value={formikProps.values.header && formikProps.values.header.fontColor}
                    as={Input} 
                    onClick={() => handleHeaderFontColorPalette(!isHeaderFontColorPaletteOpen)} 
                    readOnly={true}
                    {...commonProps}
                    data-testid="header-font-color"
                />
                {
                    isHeaderFontColorPaletteOpen &&
                    getColorPicker(setHeaderFontColor, rgbPortalConfig.header.fontColorRGB, handleHeaderFontColorPalette)
                }
                {formikProps.touched.header 
                    && formikProps.touched.header.fontColor 
                    && formikProps.errors.header
                    && formikProps.errors.header.fontColor 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.header.fontColor}</Form.Error></div>)}
            </Form.Group>
        </Section>
        <Section title={translate("LABEL_FOOTER_SECTION")} collapsible>
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_FOOTER_TEXT_INFO")}>
                    {translate("LABEL_FOOTER_TEXT")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    value={formikProps.values.footer && formikProps.values.footer.footerText}
                    name="footer.footerText"
                    as={Textarea}
                    {...commonProps}
                />
                {formikProps.touched.footer 
                    && formikProps.touched.footer.footerText 
                    && formikProps.errors.footer
                    && formikProps.errors.footer.footerText 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.footer.footerText}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_FOOTER_BACKGROUND_COLOR_INFO")}>
                    {translate("LABEL_BACKGROUND_COLOR")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="footer.backgroundColor"
                    value={formikProps.values.footer && formikProps.values.footer.backgroundColor}
                    as={Input} 
                    onClick={() => handleFooterBGColorPalette(!isFooterBGColorPaletteOpen)}
                    readOnly={true}
                    {...commonProps}
                    data-testid="footer-bg-color"
                />
                {
                    isFooterBGColorPaletteOpen &&
                    getColorPicker(setFooterBGColor, rgbPortalConfig.footer.backgroundColorRGB, handleFooterBGColorPalette)
                }
                {formikProps.touched.footer 
                    && formikProps.touched.footer.backgroundColor 
                    && formikProps.errors.footer
                    && formikProps.errors.footer.backgroundColor 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.footer.backgroundColor}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_FOOTER_FONT_COLOR_INFO")}>
                    {translate("LABEL_FONT_COLOR")}
                </Form.Label>
                <Form.Control
                    className="form-field"
                    name="footer.fontColor"
                    value={formikProps.values.footer && formikProps.values.footer.fontColor}
                    as={Input} 
                    onClick={() => handleFooterFontColorPalette(!isFooterFontColorPaletteOpen)}
                    readOnly={true}
                    {...commonProps}
                    data-testid="footer-font-color"
                />
                {
                    isFooterFontColorPaletteOpen &&
                    getColorPicker(setFooterFontColor, rgbPortalConfig.footer.fontColorRGB, handleFooterFontColorPalette)
                }
                {formikProps.touched.footer 
                    && formikProps.touched.footer.fontColor 
                    && formikProps.errors.footer
                    && formikProps.errors.footer.fontColor 
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.footer.fontColor}</Form.Error></div>)}
            </Form.Group>
        </Section>
 </>;
};
export default GeneralForm;
