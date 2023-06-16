import React from 'react';
import TextSettings from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <TextSettings
        formikProps={props.formikProps}
    />
);

describe('Component setting > text settings component', () => {
    it('should render text settings component without crashing', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input').length).toBe(1);
        expect(container.querySelectorAll('textArea').length).toBe(1);
    });
    
    it('should render error and values if present in formikProps', async () => {
        const props = {
            formikProps: {
                values: {
                    heading: 'heading',
                    body: 'body',
                },
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('input').value).toBe(props.formikProps.values.heading);
        expect(container.querySelector('textArea').value).toBe(props.formikProps.values.body);
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
        fireEvent.change(container.querySelector('input'), { target: { value: 'heading' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelector('input'));
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.change(container.querySelector('textArea'), { target: { value: 'body' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelector('textArea'));
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
    });
});