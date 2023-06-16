import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@informatica/droplets-core";
import WizardOverviewStep from "./wizardOverviewStep";
import "./index.css";
import WizardStep from "./wizardStep";
import CONFIG from "../../../../config/config";

const WizardSteps = ({
    wizardData,
    updateWizardStep,
    bevName,
    bevMetadata,
    currentStep,
    setWizardCurrentStep,
    formikProps,
}) => {
    const { t: translate } = useTranslation();
    const { WIZARD_OPERATIONS, ICONS } = CONFIG;
    const [currentStepIndex, setCurrentStepIndex] = useState(currentStep);
    const [wizardStepData, setWizardStepData] = useState(wizardData);

    useEffect(() => {
        setCurrentStepIndex(currentStep);
        setWizardStepData(wizardData);
    }, [currentStep, wizardData]);

    const updateWizardStepData = (operation, stepIndex) => {
        if((operation === WIZARD_OPERATIONS.SHIFT_STEP_LEFT && stepIndex > 0)
            || (operation === WIZARD_OPERATIONS.SHIFT_STEP_RIGHT && stepIndex < (wizardStepData.steps.length))
            || (operation === WIZARD_OPERATIONS.DELETE_STEP )
            || operation === WIZARD_OPERATIONS.UPDATE_WIZARD_DATA) {

            updateWizardStep(operation, stepIndex);
        }
    };

    const renderWizardStep =() => {
        return (bevName && bevMetadata && wizardStepData && wizardStepData.steps
            && wizardStepData.steps.length > 0 && ((wizardStepData.showOverview && currentStepIndex > 0)
                || (!wizardStepData.showOverview && currentStepIndex >= 0)))
            && wizardStepData.steps[currentStepIndex-1] && <WizardStep
                bevName={bevName}
                bevMetadata={bevMetadata}
                showOverview={wizardStepData.showOverview}
                updateWizardStepData={updateWizardStepData}
                currentStepIndex={currentStepIndex}
                wizardStepData={wizardStepData.steps[currentStepIndex-1]}
                formikProps={formikProps}
            />;
    };
    
    return <>
        {
            wizardStepData && <div className="wizard__step__container">
                <div className="wizard__step__header">
                    {
                        (wizardStepData.showOverview || bevMetadata)
                        && <span className="wizard__step__title">
                            {translate("LABEL_WIZARD_STEPS")}
                        </span>
                    }
                    {
                        wizardStepData.showOverview
                        && <IconButton onClick={() => setWizardCurrentStep(0)} className="wizard__step__icon">
                            <img src={ICONS.HOME} alt="" className="wizard__step__overiew__icon"/>
                        </IconButton>
                    }
                    {
                        bevMetadata && wizardStepData && wizardStepData.steps && wizardStepData.steps.length > 0
                        && wizardStepData.steps.map((stepData, index) =>
                            <IconButton
                                onClick={() => setWizardCurrentStep(index + 1)}
                                className="wizard__step__icon"
                                key={`icon-index-${index+1}`}
                            >
                                {index + 1}
                            </IconButton>
                        )
                    }
                    {
                        bevMetadata
                        && <div className="wizard__add__step">
                        <span onClick={() => updateWizardStep(WIZARD_OPERATIONS.ADD_STEP)}>
                            <IconButton>
                                <i className="aicon aicon__add-v1"/>
                            </IconButton>
                            {translate("LABEL_ADD_A_STEP")}
                        </span>
                        </div>
                    }
                </div>
                {
                    currentStepIndex >= 0 && <div className="wizard__step__body">
                        {
                            wizardStepData.showOverview && currentStepIndex === 0
                            && <>
                                <div className="wizard__step__home__icon__arrow" />
                                <WizardOverviewStep formikProps={formikProps} />
                            </>
                        }
                        {
                            renderWizardStep()
                        }
                    </div>
                }
            </div>
        }
    </>;
};
export default WizardSteps;
