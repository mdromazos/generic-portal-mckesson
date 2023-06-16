import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Panel, Wizard, Button,IconButton} from "@informatica/droplets-core";
import GeneralForm from "../generalForm";
import LoginForm from "../loginForm";
import SignupForm from "../signupForm";
import "./index.css";
import { StateContext } from "../../../../context/stateContext";
import CONFIG from '../../../../config/config';
import APIService from '../../../../utils/apiService';
import { URLMap } from '../../../../utils/urlMappings';
import { APIMap } from '../../../../utils/apiMappings';
import { getPortalConfigMapKey, generateViewId, getPageSetting, objectDeepKeys } from '../../../../utils/utilityService';
import UserManagementForm from "../userManagementForm/index"

const PortalSettings = ({ isEdit, history }) => {
    const { state: { portalConfig, createPortalConfig, pageSettings, portalConfigMap, currentPage }, dispatch } = useContext(StateContext);
    const { generalSettings: { portalName, userManagement, databaseId }, portalId, version } = portalConfig;
    const { PAGES, ACTIONS, ICONS, HEADERS, NOTIFICATION_TYPE, COMPONENTS, URL_VALIDATION_REGEXP } = CONFIG;
    const { t: translate } = useTranslation();
    const [generalSettingsInfo, setGeneralSettingsInfo] = useState(undefined);
    const [formData, setFormData] = useState(undefined);
    const [beFormMandatoryFields, setBeFormMandatoryFields] = useState(false);
    const [beCheck, setBeCheck] = useState(false);

    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        let currentPageInfo = {
            label: [PAGES.CREATE_PORTAL],
            type: PAGES.CREATE_PORTAL,
            url: URLMap.createPortal(),
            icon: ICONS.PORTAL,
            id: generateViewId(PAGES.CREATE_PORTAL)
        };
        if (isEdit) {
            currentPageInfo = {
                label: [portalName, PAGES.GENERAL],
                type: PAGES.EDIT_PORTAL_GENERAL,
                url: URLMap.portalDetails(databaseId,portalId),
                icon: ICONS.PORTAL,
                id: generateViewId(PAGES.EDIT_PORTAL, databaseId, portalId)
            };
        } else {
            const createPage = getPageSetting(currentPageInfo.id, pageSettings);
            if (createPage.length === 0) {
                dispatch({
                    type: ACTIONS.ADD_PAGE_SETTINGS,
                    pageSettings: currentPageInfo
                });
            }
            dispatch({
                type: ACTIONS.SET_PORTAL_CONFIGURATION,
                portalConfig: createPortalConfig,
            });
        }
        dispatch({
            type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
            currentPage: currentPageInfo
        });
    }, [isEdit]);

    useEffect(() => {
        if (isEdit) {
            if (userManagement) {
                let generalSettingsTemp = getPersistedFieldMappingValues();
                setGeneralSettingsInfo(generalSettingsTemp);
            } else {
                setGeneralSettingsInfo(JSON.parse(JSON.stringify(portalConfig.generalSettings)));
            }
        } else {
            setGeneralSettingsInfo(JSON.parse(JSON.stringify(createPortalConfig.generalSettings)));
        }
    }, [portalConfig]);

    const getPersistedFieldMappingValues = () => {

        let { fieldMapping: {
            firstName, lastName, email, userName, userRole, countryDialingCode, phoneNumber, jobTitle
        }} = userManagement;
        let fieldMappingTemp = JSON.parse(JSON.stringify(userManagement.fieldMapping));

        if(userName) {
            let usernameCode = userName.code.includes(".") ? userName.code.split(".") : userName.code;
            fieldMappingTemp.userName.code = typeof usernameCode === CONFIG.DATA_TYPES.OBJECT ? usernameCode[1] : userName.code;
            fieldMappingTemp.manyRowId = typeof usernameCode === CONFIG.DATA_TYPES.OBJECT ? usernameCode[0] : "";
        }
        if (firstName) {
            fieldMappingTemp.firstName.code = firstName.code
                ? (firstName.code.includes(".") ? firstName.code.split(".")[1] : firstName.code) : "";
        }
        if (lastName) {
            fieldMappingTemp.lastName.code = lastName.code
                ? (lastName.code.includes(".") ? lastName.code.split(".")[1] : lastName.code) : "";
        }
        if(email) {
            fieldMappingTemp.email.code = email.code
                ? (email.code.includes(".") ? email.code.split(".")[1] : email.code) : "";
        }
        if(userRole) {
            fieldMappingTemp.userRole.code = userRole.code.includes(".")
                ? userRole.code.split(".")[1] : userRole.code;
        }
        if (countryDialingCode) {
            fieldMappingTemp.countryDialingCode.code = countryDialingCode.code.includes(".")
                ? countryDialingCode.code.split(".")[1] : countryDialingCode.code;
        }
        if (phoneNumber) {
            fieldMappingTemp.phoneNumber.code = phoneNumber.code.includes(".")
                ? phoneNumber.code.split(".")[1] : phoneNumber.code;
        }
        if (jobTitle) {
            fieldMappingTemp.jobTitle.code = jobTitle.code.includes(".")
                ? jobTitle.code.split(".")[1] : jobTitle.code;
        }
        let generalSettingsTemp = JSON.parse(JSON.stringify(portalConfig.generalSettings));
        generalSettingsTemp.userManagement.fieldMapping = fieldMappingTemp;
        return generalSettingsTemp;
    };

    const userManagementFieldMappingChildValidationSchema = {
            userRole: yup.object({
                code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
            }),
            email: yup.object({
                code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
            }),
            userName: yup.object({
                code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
            }), 
            firstName: yup.object({
                code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
            }), 
            lastName: yup.object({
                code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
            }),
            portalAssociation: yup.object({
                code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
            }),                                                             
    }

    const userManagementFieldMappingParentValidationSchema = (isStateEnabled) => {
        return {
            fieldMapping: yup.object().when('createAdditionalUsers', (createAdditionalUsers) => {
                if(createAdditionalUsers) {
                    return yup.object({
                        ...userManagementFieldMappingChildValidationSchema,
                        userState: isStateEnabled === true && yup.object({
                            code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
                        }),
                        manyRowId: yup.string().required(translate('LABEL_REQUIRED_FIELD'))                 
                    })
                } else {
                    return yup.object({
                        ...userManagementFieldMappingChildValidationSchema,
                        userState: isStateEnabled === true && yup.object({
                            code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
                        }),                        
                    })
                }
            }),
        }         
    }

    const userManagementValidationSchema = {
        bevName: yup.string().required(translate('LABEL_REQUIRED_FIELD')),
        createAdditionalUsers: yup.boolean(),
        userRoles: yup.string().when('createAdditionalUsers', {
            is: true,
            then: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
        }),
    }


    const generalFormValidationSchema = yup.object().shape({
        portalName: yup.string().required(translate('ERROR_REQUIRED_PORTAL_NAME')),
        portalTitle: yup.string().required(translate('ERROR_REQUIRED_PORTAL_TITLE')),
        databaseId: yup.string().required(translate('ERROR_REQUIRED_DATABASE')),
        beName: yup.string().required(translate('ERROR_REQUIRED_BUSINESS_ENTITY')),
        sourceSystem: yup.string().required(translate('ERROR_REQUIRED_SOURCE_SYSTEM')),
        isStateEnabled: yup.boolean().required(translate('ERROR_REQUIRED_STATE')),
        roleSettings: yup.object({
            referenceEntity: yup.string().required(`${translate('ERROR_REQUIRED_ROLE_REFERENCE_ENTITY')}`),
            fieldName: yup.string().required(`${translate('ERROR_REQUIRED_ROLE_FIELD_NAME')}`)
        }),
        stateSettings: yup.object().when("isStateEnabled", {
            is: true,
            then: yup.object({
                referenceEntity: yup.string().required(`${translate('ERROR_REQUIRED_STATE_TABLE_CONFIGURATION')}`),
                fieldName: yup.string().required(`${translate('ERROR_REQUIRED_STATE_COLUMN_CONFIGURATION')}`)
            })
        }),
    });

    const loginFormFieldMappingChildrenValidationSchema = {
        email: yup.object({
            code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
        }),
        userName: yup.object({
            code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
        }),                    
        userRole: yup.object({
            code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
        }),
        portalAssociation: yup.object({
            code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
        })                    
    };

    const loginFormValidationSchema = yup.object({
        login: yup.object().when(['isStateEnabled', 'isExternalUserManagementEnabled'], 
            (isStateEnabled,isExternalUserManagementEnabled) => {
                let yupObj = {}
                if(isExternalUserManagementEnabled) {
                    yupObj.ssoForgotPasswordLink = yup.string().matches(URL_VALIDATION_REGEXP, translate('ERROR_INVALID_URL'))
                        .required(translate('LABEL_REQUIRED_FIELD'));
                }
                if(isStateEnabled) {
                    yupObj.fieldMapping = yup.object({
                        ...loginFormFieldMappingChildrenValidationSchema,
                        userState: yup.object({
                            code: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
                        }),                    
                    });
                }
                else {
                    yupObj.fieldMapping = yup.object({
                            ...loginFormFieldMappingChildrenValidationSchema,
                    });
                }
                return yup.object({...yupObj});
        })
    });

    const userManagementFormValidationSchema = yup.object().shape({   
        userManagement: yup.object().when('isStateEnabled', (isStateEnabled) => {
            if(isStateEnabled) {
                return yup.object({
                    userStates: yup.string().when('createAdditionalUsers', {
                        is: true,
                        then: yup.string().required(translate('LABEL_REQUIRED_FIELD'))
                    }),                    
                    ...userManagementValidationSchema,
                    ...userManagementFieldMappingParentValidationSchema(isStateEnabled)
                })
            } else {
                return yup.object({
                    userStates: yup.string().when('createAdditionalUsers', {
                        is: true,
                        then: yup.string()
                    }),                    
                    ...userManagementValidationSchema,
                    ...userManagementFieldMappingParentValidationSchema(isStateEnabled)                   
                })
            }
        })
    });

    const signupFormValidationSchema = yup.object().shape({
        signup: yup.object().when(['isStateEnabled', 'disableSignup'], (isStateEnabled, disableSignup) => {
            if(disableSignup) {
                return yup.object({
                    bevName: yup.string(),
                    userRole: yup.string(),
                })
            } else {
                if(isStateEnabled) {
                    return yup.object({
                        userState: yup.string().required(translate('LABEL_REQUIRED_FIELD')),
                        bevName: yup.string().required(translate('LABEL_REQUIRED_FIELD')),
                        userRole: yup.string().required(translate('LABEL_REQUIRED_FIELD')),
                    })
                } else {
                    return yup.object({
                        bevName: yup.string().required(translate('LABEL_REQUIRED_FIELD')),
                        userRole: yup.string().required(translate('LABEL_REQUIRED_FIELD')),
                    })    
                }                
            }
        })
    })

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message
            }
        });
    };

    const updatePortalConfigMap = async (databaseId, portalId, portalConfigMapDt) => {
        await dispatch({
            type: ACTIONS.UPDATE_PORTAL_CONFIG_MAP,
            portalConfigMap: portalConfigMapDt
        });
        history.push(URLMap.portalDetails(databaseId, portalId));
    };

    const getUserFieldMappingPayload=(fieldMapping) => {
        if (fieldMapping.userRole){
            fieldMapping.userRole.label = translate("LABEL_TABLE_USER_ROLE");
            if (fieldMapping.manyRowId && fieldMapping.userRole.code){
                fieldMapping.userRole.code = `${fieldMapping.manyRowId}.${fieldMapping.userRole.code}`;
            }
        }
        if (fieldMapping.email) {
            fieldMapping.email.label = translate("LABEL_TABLE_EMAIL");
            if (fieldMapping.manyRowId && fieldMapping.email.code) {
                fieldMapping.email.code = `${fieldMapping.manyRowId}.${fieldMapping.email.code}`;
            }
        }
        if (fieldMapping.userName) {
            fieldMapping.userName.label = translate("LABEL_TABLE_USER_NAME");
            if (fieldMapping.manyRowId && fieldMapping.userName.code) {
                fieldMapping.userName.code = `${fieldMapping.manyRowId}.${fieldMapping.userName.code}`;
            }
        }
        if (fieldMapping.firstName) {
            fieldMapping.firstName.label = translate("LABEL_TABLE_FIRST_NAME");
            if (fieldMapping.manyRowId && fieldMapping.firstName.code) {
                fieldMapping.firstName.code = `${fieldMapping.manyRowId}.${fieldMapping.firstName.code}`;
            }
        }
        if (fieldMapping.lastName) {
            fieldMapping.lastName.label = translate("LABEL_TABLE_LAST_NAME");
            if (fieldMapping.manyRowId && fieldMapping.lastName.code) {
                fieldMapping.lastName.code = `${fieldMapping.manyRowId}.${fieldMapping.lastName.code}`;
            }
        }
        if (fieldMapping.countryDialingCode) {
            fieldMapping.countryDialingCode.label = translate("LABEL_COUNTRY_DIALING_CODE");
            if (fieldMapping.manyRowId && fieldMapping.countryDialingCode.code) {
                fieldMapping.countryDialingCode.code = `${fieldMapping.manyRowId}.${fieldMapping.countryDialingCode.code}`;
            }
        }
        if (fieldMapping.phoneNumber ) {
            fieldMapping.phoneNumber.label = translate("LABEL_PHONE_NUMBER");
            if (fieldMapping.manyRowId && fieldMapping.phoneNumber.code) {
                fieldMapping.phoneNumber.code = `${fieldMapping.manyRowId}.${fieldMapping.phoneNumber.code}`;
            }
        }
        if (fieldMapping.jobTitle) {
            fieldMapping.jobTitle.label = translate("LABEL_JOB_TITLE");
            if (fieldMapping.manyRowId && fieldMapping.jobTitle.code) {
                fieldMapping.jobTitle.code = `${fieldMapping.manyRowId}.${fieldMapping.jobTitle.code}`;
            }
        }
        return fieldMapping;
    };

    const onSubmit = (values) => {

        let generalSettingData = JSON.parse(JSON.stringify(values));
        if (formData) {
            generalSettingData.signup.beFormComponent = JSON.parse(JSON.stringify(formData));
            generalSettingData.signup.beFormComponent.componentType = COMPONENTS.BE_FORM_COMPONENT;
        }
        if (isEdit && generalSettingData.hasOwnProperty('validateState')) {
            delete generalSettingData.validateState;
        }
        if (generalSettingData.userManagement) {
            let fieldMapping = getUserFieldMappingPayload(generalSettingData.userManagement.fieldMapping);
            generalSettingData.userManagement.fieldMapping = {...fieldMapping};
        }
        generalSettingData.userManagement.fieldMapping.manyRowId = undefined;

        if (!formData && beFormMandatoryFields && !generalSettingData.disableSignup){
            setBeCheck(true);
        } else {
            if (generalSettingData.hasOwnProperty('validateState')) {
                delete generalSettingData.validateState;
            }
        }
        const successCallback = (resp) => {
            let message;
            let portalConfigMapDt = {};
            let portalMapKey = getPortalConfigMapKey(generalSettingData.databaseId, resp.portalId);

            if (isEdit) {
                portalConfigMapDt[portalMapKey] = {
                    ...portalConfigMap[portalMapKey],
                    version: resp.version,
                    isDraft: true
                };
                message = 'PORTAL_EDIT_SUCCESS_MESSAGE';
            } else {
                message = 'PORTAL_CREATE_SUCCESS_MESSAGE';
                const createPageSettings = {
                    label: [PAGES.CREATE_PORTAL],
                    type: PAGES.CREATE_PORTAL,
                    id: generateViewId(PAGES.CREATE_PORTAL)
                };
                dispatch({
                    type: ACTIONS.REMOVE_PAGE_SETTINGS,
                    pageSettings: createPageSettings
                });
                
                portalConfigMap[portalMapKey] = {
                    name: generalSettingData.portalName,
                    orsId: generalSettingData.databaseId,
                    version: resp.version,
                    isDraft: true
                };
            }
            updatePortalConfigMap(generalSettingData.databaseId, resp.portalId, portalConfigMapDt);
            dispatchAppNotification(
                `${translate(message, { PORTAL_NAME: `${generalSettingData.portalName}` })}`,
                NOTIFICATION_TYPE.SUCCESS
            );
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                const message = (isEdit) ? 'PORTAL_EDIT_ERROR_MESSAGE' : 'PORTAL_CREATE_ERROR_MESSAGE';
                dispatchAppNotification(
                    `${translate(message, { PORTAL_NAME: `${generalSettingData.portalName}` })}`,
                    NOTIFICATION_TYPE.ERROR
                );
            }
        };
        if (isEdit) {
            APIService.putRequest(
                APIMap.savePortalGeneralSettings(portalId),
                generalSettingData,
                successCallback,
                failureCallback,
                { [HEADERS.ORS]: databaseId, [HEADERS.VERSION]: version }
            );
        } else if ((formData && beFormMandatoryFields) || (!beFormMandatoryFields) || generalSettingData.disableSignup) {
            let portalConfigData = JSON.parse(JSON.stringify(portalConfig));
            portalConfigData.generalSettings = JSON.parse(JSON.stringify(generalSettingData));
            APIService.postRequest(
                APIMap.savePortal(),
                portalConfigData,
                successCallback,
                failureCallback,
                { [HEADERS.ORS]: generalSettingData.databaseId }
            );
        }
    };

    function editGeneralSettings(status, visible, redirectURL, navClick){
        dispatch({
            type: ACTIONS.EDIT_GENERAL_SETTINGS_PAGE_STATUS,
            editStatus: status,
            dialogBoxVisible: visible,
            nextPage: redirectURL,
            pageType: navClick
        });
    }

    const getSaveButton = ({ handleSubmit, setFieldTouched, validateForm }) => {
        return <span className="save__button">
            <Button
                data-testid="save-button"
                onClick={()=> {
                editGeneralSettings(false, false, currentPage.url);
                validateForm().then(errors => {
                    if(Object.entries(errors).length === 0) {
                        return handleSubmit();
                    } else {
                        return handleFormikErrors({ errors, setFieldTouched });
                    }
                });
                
            }} variant="call-to-action">{translate('LABEL_SAVE')}</Button>
        </span>;
    };

    const handleFormikErrors = ({ errors, setFieldTouched }) => {
        const errorrKeys = objectDeepKeys(errors);
        if (Object.entries(errors).length === 0) {
            return true;
        }
        errorrKeys.map((err) => setFieldTouched(err, true));
        return false;
    };

    const formDataCallBack = useCallback(
        (formData) => {
            setFormData(formData)
        },
        []
    );

    const beDataCallBack = useCallback(
        (beDataCheck) => {
            setBeFormMandatoryFields(beDataCheck);
            if(!beDataCheck){
                setBeCheck(false);
            }
        },
        []
    );

    const validationSchema = [
        generalFormValidationSchema,
        loginFormValidationSchema,
        userManagementFormValidationSchema,
        signupFormValidationSchema
    ];

    const formikProps = useFormik({
        initialValues: generalSettingsInfo,
        enableReinitialize: true,
        onSubmit,
        validationSchema: validationSchema[activeStep],
    });

    const commonProps = {
        onChange: formikProps.handleChange,
        onBlur: formikProps.handleBlur,
    };

    /** Custom functions which are passed to form control or element */
    const handleBlur = useCallback((name) => formikProps.setFieldTouched(name, true), [formikProps.setFieldTouched]);
    const handleChange = useCallback((name, value) => formikProps.setFieldValue(name, value), [formikProps.setFieldValue]);    
    return(
        <>
        {
            generalSettingsInfo && <Panel className="portal__config__panel">
                {
                    <form onSubmit={formikProps.handleSubmit}>
                        <Wizard
                            steps={[
                                {
                                    name: translate("LABEL_GENERAL"),
                                    isValid: () => {
                                        return formikProps.validateForm().then(errors => {
                                            return handleFormikErrors({ errors, setFieldTouched: formikProps.setFieldTouched });
                                        });
                                    },
                                    render: ({ step }) => <GeneralForm
                                        formikProps={formikProps}
                                        isEdit={isEdit}
                                        commonProps={commonProps}
                                        handleBlur={handleBlur}
                                        handleChange={handleChange}
                                        setActiveStep={() => setActiveStep(step)}
                                    />
                                },
                                {
                                    name: translate("LABEL_LOGIN"),
                                    isValid: () => {
                                        return formikProps.validateForm().then(errors => {
                                            return handleFormikErrors({ errors, setFieldTouched: formikProps.setFieldTouched });
                                        });
                                    },
                                    render: ({ step }) => <LoginForm
                                        formikProps={formikProps}
                                        commonProps={commonProps}
                                        handleBlur={handleBlur}
                                        handleChange={handleChange}
                                        setActiveStep={() => setActiveStep(step)}
                                    />
                                },
                                {
                                    name: translate("LABEL_USER_STATE"),
                                    isValid: () => {
                                        return formikProps.validateForm().then(errors => {
                                            return handleFormikErrors({ errors, setFieldTouched: formikProps.setFieldTouched });
                                        });
                                    },
                                    render: ({ step }) => <UserManagementForm
                                        formikProps={formikProps}
                                        isEdit={isEdit}
                                        commonProps={commonProps}
                                        handleBlur={handleBlur}
                                        handleChange={handleChange}
                                        setActiveStep={() => setActiveStep(step)}
                                    />
                                },
                                {
                                    name: translate("LABEL_SIGNUP"),
                                    render: ({ step }) => <div>
                                        {
                                            beCheck && <div className="be__mandatory__check">
                                                <IconButton className="login__error__btn">
                                                    <i className="be__mandatory__check aicon aicon__close-solid" />
                                                </IconButton>
                                                {translate("ERROR_MISSING_MANDATORY_BE")}
                                            </div>
                                        }
                                        <SignupForm
                                            formikProps={formikProps}
                                            formDataProp={formData}
                                            formDataCallBack={formDataCallBack}
                                            isEdit={isEdit}
                                            beDataCallBack={beDataCallBack}
                                            commonProps={commonProps}
                                            handleBlur={handleBlur}
                                            handleChange={handleChange}
                                            setActiveStep={() => setActiveStep(step)}
                                        />
                                    </div>
                                }
                            ]}
                        >
                        <div className="d-wizard__toolbar wizard__toolbar">
                            <Wizard.Roadmap />
                            <Wizard.Controls renderNextOnLastStep={getSaveButton({ setFieldTouched: formikProps.setFieldTouched, isLastStep: true, handleSubmit: formikProps.handleSubmit,  validateForm: formikProps.validateForm })} />
                        </div>
                        <Wizard.View />                                   
                        </Wizard>
                    </form>
                }
            </Panel>
        }        
        </>
    )
};
export default PortalSettings;
