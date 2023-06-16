/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Checkbox, Dropdown } from "@informatica/droplets-core";
import "./index.css";
import APIService from "../../../../utils/apiService";
import { APIMap } from "../../../../utils/apiMappings";
import { StateContext } from "../../../../context/stateContext";
import CONFIG from "../../../../config/config";
import WizardSteps from "./wizardSteps";
import { getCookie, handleBlur, handleChange } from "../../../../utils/utilityService";

const WizardSettings = ({ wizardData, updateWizardData, formikProps, stepIndex }) => {

    const {
        state: { portalConfig: { generalSettings: { beName, databaseId } }}, dispatch
    } = useContext(StateContext);
    const { HEADERS, WIZARD_OPERATIONS, ACTIONS, NOTIFICATION_TYPE } = CONFIG;
    const { t: translate } = useTranslation();
    const [bevNames, setBevNames] = useState([]);
    const [bevName, setBevName] = useState(undefined);
    const [bevMetadata, setBevMetadata] = useState(undefined);
    const [currentStep, setCurrentStep] = useState(stepIndex);
    const [wizardStepData, setWizardStepData] = useState(undefined);

    useEffect(() => {
        getBevViews();
    }, []);

    useEffect(() => {
        setCurrentStep(stepIndex);
    }, [stepIndex]);

    useEffect(() => {
        if((wizardStepData && wizardStepData.configName !== wizardData.configName)
            || (!wizardStepData && wizardData.configName)) {
            setBevName(wizardData.configName);
            updateBevMetadata(wizardData.configName);
        }
        setWizardStepData(wizardData);
    }, [wizardData]);

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
                const bevViews = resp.map((element) => ({
                    "text": element,
                    "value": element,
                }));
                setBevNames(bevViews);
            }
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'),NOTIFICATION_TYPE.ERROR)
            }
        };
        APIService.getRequest(
            APIMap.getBevNames(beName),
            successCallback,
            failureCallback,
            { [ HEADERS.ORS ]: databaseId },
        );
    };

    const updateBevMetadata = (beName) => {

        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'),NOTIFICATION_TYPE.ERROR)
            }
            setBevMetadata(undefined);
        };
        APIService.getRequest(
            APIMap.getBevMetadata(databaseId, beName),
            (resp) => {
                setBevMetadata(resp);
            },
            failureCallback,
            { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
        );
    };

    const updateWizardStep = (operation, operationData) => {
        let stepIndex = undefined;
        let updatedWizardData = JSON.parse(JSON.stringify(formikProps.values));

        switch (operation) {
            case WIZARD_OPERATIONS.UPDATE_WIZARD_DATA:
                updatedWizardData.steps[operationData.stepIndex].beFormComponent = operationData.beFormComponent;
                break;
            case WIZARD_OPERATIONS.ADD_STEP:
                if(!updatedWizardData.steps) {
                    updatedWizardData.steps = [];
                }
                updatedWizardData.steps.push({
                    title: "",
                    beFormComponent: {}
                });
                stepIndex = updatedWizardData.steps.length;
                break;
            case WIZARD_OPERATIONS.DELETE_STEP:
                updatedWizardData.steps.splice(operationData, 1);
                stepIndex = operationData;
                break;
            case WIZARD_OPERATIONS.UPDATE_BEV_NAME:
                updatedWizardData.configName = operationData.value;
                break;
            case WIZARD_OPERATIONS.TOGGLE_SHOW_OVERVIEW:
                updatedWizardData.showOverview = operationData;
                break;
            case WIZARD_OPERATIONS.SHIFT_STEP_LEFT:
                if(operationData !== 0) {
                    [updatedWizardData.steps[operationData - 1], updatedWizardData.steps[operationData]] =
                        [updatedWizardData.steps[operationData], updatedWizardData.steps[operationData - 1]];
                    stepIndex = operationData;
                }
                break;
            case WIZARD_OPERATIONS.SHIFT_STEP_RIGHT:
                if(operationData !== (updatedWizardData.steps.length - 1)) {
                    [updatedWizardData.steps[operationData], updatedWizardData.steps[operationData + 1]] =
                        [updatedWizardData.steps[operationData + 1], updatedWizardData.steps[operationData]];
                    stepIndex = operationData + 2;
                }
                break;
            default: break;
        }
        updateWizardData(updatedWizardData, stepIndex);
    };

    return <>
        {
            wizardStepData && formikProps.values && <>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label" help={translate('LABEL_ASSOCIATED_TASK_TYPE_INFO')} >
                        {translate("LABEL_ASSOCIATED_TASK_TYPE")}
                    </Form.Label>
                    <Form.Control
                        as={Input}
                        name="associatedTaskType"
                        className="form-field"
                        value={formikProps.values.associatedTaskType}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                    />
                    {formikProps.touched.associatedTaskType
                        && formikProps.errors.associatedTaskType
                        && (<div className="form-error">
                            <Form.Error>
                                {formikProps.errors.associatedTaskType}
                            </Form.Error>
                        </div>)}
                </Form.Group>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label" help={translate('LABEL_PRIMARY_ACTION_INFO')} >
                        {translate("LABEL_PRIMARY_ACTION")}
                    </Form.Label>
                    <Form.Control
                        name="primaryAction"
                        as={Input}
                        className="form-field"
                        value={formikProps.values.primaryAction}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}                        
                    />
                    {formikProps.touched.primaryAction
                        && formikProps.errors.primaryAction
                        && (<div className="form-error">
                            <Form.Error>
                                {formikProps.errors.primaryAction}
                            </Form.Error>
                        </div>)}
                </Form.Group>
                <Form.Group className="form-group" >
                    <Form.Label className="form-label" help={translate('LABEL_LOGOUT_ACTIONS_INFO')}>
                        {translate("LABEL_LOGOUT_ACTIONS")}
                    </Form.Label>
                    <Form.Control
                        name="logoutActions"
                        as={Input}
                        className="form-field"
                        value={formikProps.values.logoutActions}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}                          
                    />
                </Form.Group> 
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label">{translate("LABEL_BUSINESS_ENTITY_VIEW")}</Form.Label>
                    <Form.Control
                        name="configName"
                        as={Dropdown}
                        options={bevNames}
                        className="form-field"
                        value={formikProps.values.configName}
                        onChange={(bevData) => {
                            handleChange(formikProps, 'configName', bevData.value);
                            updateWizardStep(WIZARD_OPERATIONS.UPDATE_BEV_NAME, bevData)
                        }}
                        onBlur={() => handleBlur(formikProps, 'configName')}                        
                    />
                    {formikProps.touched.configName
                        && formikProps.errors.configName
                        && (<div className="form-error">
                            <Form.Error>
                                {formikProps.errors.configName}
                            </Form.Error>
                        </div>)}
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Control
                        name="showOverview"
                        as={Checkbox}
                        className="form-field"
                        checked={wizardStepData.showOverview}
                        onChange={(e) => {
                            const { checked } = e.target;
                            handleChange(formikProps, 'showOverview', checked);
                            handleBlur(formikProps, 'showOverview');
                            updateWizardStep(WIZARD_OPERATIONS.TOGGLE_SHOW_OVERVIEW, !wizardStepData.showOverview)                  
                        }}
                    >
                        {translate("LABEL_INCLUDE_OVERVIEW_STEP")}
                    </Form.Control>
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Control
                        name="showComments"
                        as={Checkbox}
                        className="form-field"
                        checked={wizardStepData.showComments || formikProps.values.showComments}
                        onChange={(e) => {
                            const { checked } = e.target;
                            handleChange(formikProps, 'showComments', checked);
                            handleBlur(formikProps, 'showComments');
                        }}                        
                    >
                        {translate("LABEL_SHOW_COMMENTS")}
                    </Form.Control>
                </Form.Group>
                <WizardSteps
                    wizardData={wizardStepData}
                    bevName={bevName}
                    bevMetadata={bevMetadata}
                    updateWizardStep={updateWizardStep}
                    currentStep={currentStep}
                    formikProps={formikProps}
                    setWizardCurrentStep={stepIndex => updateWizardData(undefined, stepIndex)}
                />
            </>
        }
    </>;
};
export default WizardSettings;
