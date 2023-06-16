import React from 'react';
import WizardStep from '../wizardStep';
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
        <WizardStep
            {...props}
        />
    </StateContext.Provider>
);

describe('Component setting > wizard settings > wizard step component', () => {
    it('should render the wizard step with all fields', async () => {
        const props = {
            currentStepIndex: 1,
            showOverview: true,
            bevName: 'CustomerOrgPortalView',
            bevMetadata: {
                object: {
                    field: [],
                    child: [],
                },
            },
            wizardStepData: {
                beFormComponent: {},
                title: "Title"
            },
            updateWizardStepData: jest.fn(),
            formikProps: {
                values: {
                    steps: [{
                        beFormComponent: {},
                        title: "Title"
                    }],
                },
            },
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__heading')).not.toBeNull();
        expect(container.querySelector('.form-label').textContent).toBe('LABEL_TITLE');
        expect(container.querySelector('.wizard__step__heading').querySelectorAll('input').length).toBe(1);
        expect(container.querySelector('.wizard__step__operation__icons').children.length).toBe(3);
        expect(container.querySelector('.beFormBuilder__component__container')).not.toBeNull();
    });
    it('wizard step operation when click on icons', async () => {
        const props = {
            currentStepIndex: 2,
            showOverview: true,
            bevName: 'CustomerOrgPortalView',
            bevMetadata: {
                object: {
                    field: [],
                    child: [],
                },
            },
            wizardStepData: {
                beFormComponent: {},
                title: "Title2"
            },
            updateWizardStepData: jest.fn(),
            formikProps: {
                values: {
                    steps: [{
                        beFormComponent: {},
                        title: "Title1"
                    },{
                        beFormComponent: {},
                        title: "Title2"
                    }],
                },
            },
        };
        const { container } = renderComponent(props);
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBe(3);
        fireEvent.click(buttons[0]);
        expect(props.updateWizardStepData).toHaveBeenCalledWith('SHIFT_STEP_LEFT', props.currentStepIndex-1);
        fireEvent.click(buttons[1]);
        expect(props.updateWizardStepData).toHaveBeenCalledWith('SHIFT_STEP_RIGHT', props.currentStepIndex-1);
        fireEvent.click(buttons[2]);
        expect(props.updateWizardStepData).toHaveBeenCalledWith('DELETE_STEP', props.currentStepIndex-1);
    });
    it('should call the callback function when intraction', async () => {
        const props = {
            currentStepIndex: 1,
            showOverview: true,
            bevName: 'CustomerOrgPortalView',
            bevMetadata: {
                object: {
                    field: [],
                    child: [],
                },
            },
            wizardStepData: {
                beFormComponent: {},
                title: "Title"
            },
            updateWizardStepData: jest.fn(),
            formikProps: {
                values: {
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
        fireEvent.change(container.querySelector('.wizard__step__heading').querySelector('input'), { target: { value: 'New Title' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelector('.wizard__step__heading').querySelector('input'));
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
    });
});