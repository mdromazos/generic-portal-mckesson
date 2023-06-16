import React from 'react';
import WizardOverviewStep from '../wizardOverviewStep';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <WizardOverviewStep
        formikProps={props.formikProps}
    />
);

describe('Component setting > wizard settings > wizard overview step component', () => {
    it('should render wizard overview step component without crashing', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input').length).toBe(2);
        expect(container.querySelectorAll('textArea').length).toBe(1);
    });
    
    it('should render error and values if present in formikProps', async () => {
        const props = {
            formikProps: {
                values: {
                    overviewHeading: 'overviewHeading',
                    overviewTitle: 'overviewTitle',
                    overviewBody: 'overviewBody',
                },
            }
        };
        const { container } = renderComponent(props);
        const inputs = container.querySelectorAll('input');
        expect(inputs[0].value).toBe(props.formikProps.values.overviewHeading);
        expect(inputs[1].value).toBe(props.formikProps.values.overviewTitle);
        expect(container.querySelector('textArea').value).toBe(props.formikProps.values.overviewBody);
    });
    
    it('should call the callback functions when inputs are changed', async () => {
        const props = {
            formikProps: {
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        const inputs = container.querySelectorAll('input');
        fireEvent.change(inputs[0], { target: { value: 'overviewHeading' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[0]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.change(inputs[1], { target: { value: 'overviewTitle' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[1]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.change(container.querySelector('textArea'), { target: { value: 'overviewBody' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelector('textArea'));
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
    });
});