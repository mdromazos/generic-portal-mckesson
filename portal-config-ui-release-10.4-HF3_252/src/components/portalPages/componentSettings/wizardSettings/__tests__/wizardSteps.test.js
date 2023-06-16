import React from 'react';
import WizardSteps from '../wizardSteps';
import { fireEvent, render } from '@testing-library/react';
import { StateContext } from '../../../../../context/stateContext';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <StateContext.Provider
        value={{
            state: { portalConfig: { generalSettings: { databaseId: 'localhost-orcl-C360_ORS' } }}
        }}
    >
        <WizardSteps
            {...props}
        />
    </StateContext.Provider>
);

describe('Component setting > wizard settings > wizard steps component', () => {
    it('should render the wizard step header', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "",
                }],
            },
            updateWizardStep: jest.fn(),
            bevName: "CustomerOrgPortalView",
            bevMetadata: {
                object: {
                    field: [],
                    child: [],
                },
            },
            currentStep: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    overviewHeading: "overviewHeading",
                    steps: [{
                        beFormComponent: {},
                        title: "Title"
                    }],
                },
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header')).not.toBeNull();
        const buttons = container.querySelector('.wizard__step__header').querySelectorAll('button');
        expect(buttons.length).toBe(3);
    });
    it('should call the callback function when intraction', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "",
                }],
            },
            updateWizardStep: jest.fn(),
            bevName: "CustomerOrgPortalView",
            bevMetadata: {
                object: {
                    field: [],
                    child: [],
                },
            },
            currentStep: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    overviewHeading: "overviewHeading",
                    steps: [{
                        beFormComponent: {},
                        title: "Title"
                    }],
                },
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header')).not.toBeNull();
        const buttons = container.querySelector('.wizard__step__header').querySelectorAll('button');
        expect(buttons.length).toBe(3);
        fireEvent.click(buttons[0]);
        expect(props.setWizardCurrentStep).toHaveBeenCalledWith(0);
        fireEvent.click(buttons[1]);
        expect(props.setWizardCurrentStep).toHaveBeenCalledWith(1);
        fireEvent.click(buttons[2]);
        expect(props.updateWizardStep).toHaveBeenCalledWith("ADD_STEP");
        const operation_buttons = container.querySelector('.wizard__step__operation__icons').children;
        expect(operation_buttons.length).toBe(3);
        fireEvent.click(operation_buttons[2]);
        expect(props.updateWizardStep).toHaveBeenCalledWith('DELETE_STEP', props.currentStep-1);
    });
    it('should render the wizard overview step when current step is 0', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "",
                }],
            },
            updateWizardStep: jest.fn(),
            bevName: "CustomerOrgPortalView",
            bevMetadata: {
                object: {
                    field: [],
                    child: [],
                },
            },
            currentStep: 0,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    overviewHeading: "overviewHeading",
                    steps: [{
                        beFormComponent: {},
                        title: "Title"
                    }],
                },
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__overview__body')).not.toBeNull();
    });
    it('should render the wizard step when current step is 1', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "",
                }],
            },
            updateWizardStep: jest.fn(),
            bevName: "CustomerOrgPortalView",
            bevMetadata: {
                object: {
                    field: [],
                    child: [],
                },
            },
            currentStep: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    overviewHeading: "overviewHeading",
                    steps: [{
                        beFormComponent: {},
                        title: "Title"
                    }],
                },
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__body')).not.toBeNull();
    });
});