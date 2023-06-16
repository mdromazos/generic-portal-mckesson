// @flow
import React from 'react';
import PortalRoadmap from "./poartalRoadmap/PortalRoadmap";
import usePortalWizardInitialStepEffect from "./usePortalWizardInitialStepEffect";
import { useTranslation } from "react-i18next";

import { Button } from '@informatica/droplets-core';

type VisitedSteps = Array<boolean>;

type Steps = Array<>;

type RenderProps = {|
    isFirstStep: boolean,
        isLastStep: boolean,
            isSubmitting: boolean,
                step: number,
                    steps: Steps,
                        setStep: number => void,
                            visitedSteps: VisitedSteps,
|};

type PortalWizardProps = {
    children: RenderProps => React.Node | React.Node,

        /**
         * Each `step` is represented by a `StepDefinition` object with the following properties:
         *
         * * __`name: string`__:
         * The name of the step. Shown in the `Roadmap` component.
         *
         * * __`render: () => React.Node`__:
         * A function that returns the content that should be rendered for this step.
         * Shown in the `PortalWizard.View` component.
         *
         * * __`isValid?: () => Promise<boolean>`__:
         * An optional callback that will be called for validating existing step.
         * This will be called only when the step that is being transitioned to is not previously visited.
         * This function should always return a `Promise` — if a synchronous operation
         * is used to determine the result, you can simply return `Promise.resolve(true | false)`.
         * This is where you can define step validation logic (or use a third-party library like Formik)
         * and block all step changes. This is useful for create wizards where users shouldnt be allowed
         * to proceed to the next step if the current step is in an invalid state.
         *
         * * __`beforeEnter?: () => Promise<boolean>`__:
         * An optional callback used when Wizard attempts to visit the step.
         * This function should always return a `Promise` — if a synchronous operation
         * is used to determine the result, you can simply return `Promise.resolve(true | false)`.
         * This is where you can explicitly check for field values that must be valid before a step can
         * be visitied and block step changes if the requested step depends on a previous invalid step
         * or a field value. This is useful for editable Wizards where users can be allowed to switch between
         * steps even when the steps are invalid.
         *
         * * __`beforeLeave?: () => Promise<boolean>`__:
         * An optional callback used when Wizard attempts to change the step.
         * This function should always return a `Promise` — if a synchronous operation
         * is used to determine the result, you can simply return `Promise.resolve(true | false)`.
         * This is where you can add the mandatory condition which need to be checked before leaving the current step,
         * You can block the step change by returning `false` from the function. You can continue to move into next step by returning `true`.
         * This is useful for Wizards where a step wants to enforce some logic before a step transition is triggered.
         *
         */
        steps: Steps,

            /**
             * Initial active step of the wizard.
             * Providing this prop will call the `beforeEnter` method if provided in the Step definition of the `initialStep`.
             * If the `beforeEnter` promise resolves to true, the Wizard will start at the `initialStep` and mark all previous steps as visited.
             * If the `beforeEnter` promise resolves to false, the Wizard will start at the first step as usual.`
             */
            initialStep: number,

                /**
                 * When implementing an editable Wizard, you can specify the
                 * initialVisited prop to show specific (or all) steps as visited.
                 */
                initialVisited ?: VisitedSteps,

                /**
                 * Used when performing an asynchronous action that should block
                 * Wizard controls / step changes from occurring.
                 */
                isSubmitting ?: boolean,
};

const PortalWizardContext = React.createContext<RenderProps>({
    isFirstStep: false,
    isLastStep: false,
    isSubmitting: false,
    step: 0,
    steps: [],
    setStep: () => undefined,
    visitedSteps: [],
});

function shouldAllowStepChange(
    { stepNumber, beforeLeave = () => Promise.resolve(true), isValid = () => Promise.resolve(true) },
    nextStep,
    isNextStepVisited = false
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        isValid = isNextStepVisited ? () => Promise.resolve(true) : isValid;
        isValid(stepNumber).then(valid => {
            if (!valid) {
                return resolve(false);
            } else {
                beforeLeave(stepNumber).then(result => {
                    if (!result) {
                        return resolve(false);
                    } else {
                        const beforeEnter = nextStep.beforeEnter ? nextStep.beforeEnter : (() => Promise.resolve(true));
                        beforeEnter(nextStep.stepNumber).then(result => resolve(!!result));
                    }
                });
            }
        });
    });
}

function PortalWizard({
    children,
    initialVisited = [true],
    isSubmitting = false,
    steps,
    wizardStepChangeHandler,
    initialStep,
    ...rest
}: PortalWizardProps) {
    if (!steps || steps.length === 0) {
        throw new Error("Portal Wizard: `steps` prop cannot be empty");
    }
    if (initialStep < 0 || initialStep >= steps.length) {
        throw new Error(
            "`initialStep` is out of bounds. `initialStep` should be a valid step index from the steps array."
        );
    }

    const [step, setStep] = React.useState(0);

    const [visitedSteps, setVisitedSteps] = React.useState<VisitedSteps>(initialVisited);

    const handleStepChange: (nextStep: number) => void = React.useCallback(
        (nextStepIndex: number): void => {
            if (nextStepIndex < 0 || nextStepIndex >= steps.length) {
                throw new Error("Portal Wizard: Attempted to access an out-of-bounds step.");
            }

            const currentStep = steps[step];
            const nextStep = steps[nextStepIndex];
            shouldAllowStepChange(currentStep, nextStep, visitedSteps[nextStepIndex]).then(
                allow => {
                    if (!allow) {
                        if (nextStepIndex < step) {
                            throw new Error(
                                "Portal Wizard: beforeEnter should never return false when attempting to go backwards."
                            );
                        }

                        return;
                    }

                    setVisitedSteps(prevState => {
                        const newArray = prevState.slice();
                        newArray[nextStepIndex] = true;
                        return newArray;
                    });

                    setStep(nextStepIndex);
                }
            );
        },
        [steps, step, setStep, setVisitedSteps]
    );

    const wizardStepChangeNotificationHandler = (nextStep: number) => {
        if (typeof (wizardStepChangeHandler) === "function") {
            wizardStepChangeHandler(handleStepChange, nextStep, step);
        } else {
            handleStepChange(nextStep);
        }
    };

    const renderProps: RenderProps = React.useMemo(
        () => ({
            isFirstStep: step === 0,
            isLastStep: step === steps.length - 1,
            isSubmitting,
            step,
            steps,
            setStep: wizardStepChangeNotificationHandler,
            visitedSteps,
        }),
        [isSubmitting, step, handleStepChange, visitedSteps]
    );

    const { ready } = usePortalWizardInitialStepEffect(steps, initialStep, setStep, setVisitedSteps);

    return ready ? (
        <PortalWizardContext.Provider value={renderProps}>
            {typeof children === "function" ? children(renderProps) : children}
        </PortalWizardContext.Provider>
    ) : null;
}

type PortalWizardControlsProps = {|
    renderOnStepsCompleted?: React.Node,
    extraButtons?: React.Node,
|};

PortalWizard.Controls = ({ renderOnStepsCompleted, extraButtons }: PortalWizardControlsProps) => {
    const { isSubmitting, isLastStep, isFirstStep, step, steps, setStep, visitedSteps } = React.useContext<RenderProps>(
        PortalWizardContext
    );

    const { t: translate } = useTranslation();
    return (
        <span className="portal__wizard__buttons">
            {extraButtons ? extraButtons : ""}
            <Button 
                onClick={() => setStep(step - 1)} 
                disabled={isFirstStep || isSubmitting}
                data-testid="wizard_back_button"
            >
                 { "< " + translate("LABEL_WIZARD_BUTTON_BACK")}
            </Button>{" "}
            <Button
                onClick={() => setStep(step + 1)}
                disabled={isLastStep || isSubmitting}
                data-testid="wizard_next_button"
                variant="primary">
                {translate("LABEL_WIZARD_BUTTON_NEXT") + " >" }
            </Button>
            {renderOnStepsCompleted && visitedSteps.length === steps.length ? (renderOnStepsCompleted) : ""}
        </span>
    );
};
PortalWizard.Controls.displayName = "PortalWizard.Controls";

PortalWizard.View = () => {
    const renderProps = React.useContext<RenderProps>(PortalWizardContext);
    const { step, steps } = renderProps;

    return steps[step].render(renderProps);
};

PortalWizard.Roadmap = () => {
    const { steps, step, setStep, visitedSteps } = React.useContext<RenderProps>(PortalWizardContext);

    const getStatus = idx => {
        if (step === idx) {
            return "current";
        }

        return visitedSteps[idx] ? "enabled" : "disabled";
    };

    return (
        <PortalRoadmap>
            {steps.map((step, idx) => (
                <PortalRoadmap.Step
                    index={idx}
                    key={step.name}
                    name={step.name}
                    stepNumber={step.stepNumber}
                    imageIcon={step.imageIcon}
                    className={step.className}
                    onClick={() => setStep(idx)}
                    status={getStatus(idx)}
                />
            ))}
        </PortalRoadmap>
    );
};
PortalWizard.Roadmap.displayName = "PortalWizard.Roadmap";

export default PortalWizard;
