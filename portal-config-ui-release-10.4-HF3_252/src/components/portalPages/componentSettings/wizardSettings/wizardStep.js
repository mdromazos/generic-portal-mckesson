import React, { useMemo, useEffect, useState, useContext } from "react";
import { Form, IconButton, Tooltip, Input } from "@informatica/droplets-core";
import BeFormBuilder from "../../../beFormBuilder/beFormBuilder";
import "./index.css";
import { useTranslation } from "react-i18next";
import CONFIG from "../../../../config/config";
import APIService from "../../../../utils/apiService";
import { APIMap } from "../../../../utils/apiMappings";
import { StateContext } from "../../../../context/stateContext";
import { getCookie } from '../../../../utils/utilityService';

const WizardStep = ({
    currentStepIndex,
    showOverview,
    bevName,
    bevMetadata,
    wizardStepData,
    updateWizardStepData,
    formikProps,
}) => {
    const { state: { portalConfig: { generalSettings: { databaseId }}}} = useContext(StateContext);
    const { WIZARD_OPERATIONS, COMPONENTS, CONFIG_TYPES } = CONFIG;
    const { t: translate } = useTranslation();
    const [step, setStep] = useState(currentStepIndex - 1);
    const [arrowPointer, setArrowPointer] = useState(showOverview ? currentStepIndex : currentStepIndex - 1);
    const [beFormBuilderData, setBeFormBuilderData] = useState(undefined);

    useEffect(() => {
        setStep(currentStepIndex - 1);
    }, [currentStepIndex]);

    useEffect(() => {
        setBeFormBuilderData(wizardStepData.beFormComponent);
        setArrowPointer(showOverview ? currentStepIndex : currentStepIndex - 1);
    }, [currentStepIndex, showOverview]);

    const getLookupTableMetadata = (lookupFieldName) => {
        return new Promise((resolve, reject) => {
            APIService.getRequest(APIMap.getLookupTableMetadata(databaseId, lookupFieldName),
                response => { resolve(response) },
                error => { reject(error) },
                { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)});
        });
    };

    const updateBeFormBuilder = (beFormBuilder) => {
        updateWizardStepData(WIZARD_OPERATIONS.UPDATE_WIZARD_DATA, {
            beFormComponent: beFormBuilder,
            stepIndex: currentStepIndex - 1
        });
    };

    const renderBeFormBuilder = () => {
        return beFormBuilderData && <BeFormBuilder
            componentType={COMPONENTS.BE_FORM_COMPONENT}
            maxColumns={2}
            configName={bevName}
            configType={CONFIG_TYPES.BE_VIEW}
            beFormBuilderData={beFormBuilderData}
            beFieldsMetaModel={bevMetadata}
            saveFormData={updateBeFormBuilder}
            getLookupTableMetadata={getLookupTableMetadata}
            currentStep={step}
        />;
    };

    const styleWizardArrowPointer = useMemo(() => {
        let arrowMargin = arrowPointer >= 0 ? arrowPointer : 0;
        let marginLeft = 88 + arrowMargin * 45;
        return { marginLeft : `${marginLeft}px` };
    }, [arrowPointer]);

    return <>
        {
            (step >= 0) && (arrowPointer >= 0) && <>
                <div className="wizard__step__icon__arrow" style={styleWizardArrowPointer} />
                <div className="wizard__step__heading">
                    <Form.Group className="form-group">
                        <Form.Label className="form-label">{translate("LABEL_TITLE")}</Form.Label>
                        <Form.Control
                            className="form-field"
                            as={Input}
                            name={`steps[${step}].title`}
                            value={formikProps.values.steps
                                && formikProps.values.steps[step]
                                && formikProps.values.steps[step].title
                            }
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}                               
                        />
                    </Form.Group>
                    <div className="wizard__step__operation__icons">
                        <IconButton  onClick={() => updateWizardStepData(WIZARD_OPERATIONS.SHIFT_STEP_LEFT, step)}>
                            <Tooltip content={translate("LABEL_MOVE_STEP_LEFT")}>
                                <i className="aicon aicon__move-up-down wizard__icon wizard__icon__left"/>
                            </Tooltip>
                        </IconButton>
                        <IconButton onClick={() => updateWizardStepData(WIZARD_OPERATIONS.SHIFT_STEP_RIGHT, step)}>
                            <Tooltip content={translate("LABEL_MOVE_STEP_RIGHT")}>
                                <i className="aicon aicon__move-up-down wizard__icon wizard__icon__right"/>
                            </Tooltip>
                        </IconButton>
                        <IconButton onClick={() => updateWizardStepData(WIZARD_OPERATIONS.DELETE_STEP, step)}>
                            <Tooltip content={translate("LABEL_DELETE_STEP")}>
                                <i className="aicon aicon__delete wizard__icon"/>
                            </Tooltip>
                        </IconButton>
                    </div>
                </div>
                <div className="wizard__body">
                    {
                        renderBeFormBuilder()
                    }
                </div>
                <div className="wizard__step__heading">
                    <Form.Group className="form-group">
                        <Form.Label className="form-label">{translate("LABEL_DESCRIPTION")}</Form.Label>
                        <Form.Control
                            className="form-field"
                            as={Input}
                            name={`steps[${step}].description`}
                            value={formikProps.values.steps
                                && formikProps.values.steps[step]
                                && formikProps.values.steps[step].description
                            }
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}                               
                        />
                    </Form.Group>
                </div>
            </>
        }
    </>;
};
export default WizardStep;
