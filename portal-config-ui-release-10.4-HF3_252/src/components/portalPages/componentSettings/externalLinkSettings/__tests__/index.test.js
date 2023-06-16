import React from 'react';
import ExternalLinkSettings from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <ExternalLinkSettings
        formikProps={props.formikProps}
    />
);

describe('Component setting > External link setting component', () => {
    it('should render external link setting component without crashing', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.external__container')).not.toBeNull();
        expect(container.querySelectorAll('input').length).toBe(3);
    });
    
    it('should render error and values if present in formikProps', async () => {
        const props = {
            formikProps: {
                values: {
                    url: 'url',
                    hasBEName: true,
                    hasBERowid: true,
                },
                touched: {
                    url: true,
                },
                errors: {
                    url: 'The url field is required',
                },
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.form-error').textContent).toBe(props.formikProps.errors.url);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        expect(inputs[0].value).toBe(props.formikProps.values.url);
        expect(inputs[1].checked).toBe(props.formikProps.values.hasBEName);
        expect(inputs[2].checked).toBe(props.formikProps.values.hasBERowid);
    });
    
    it('should call the callback functions when inputs are changed', async () => {
        const props = {
            formikProps: {
                setFieldValue: jest.fn(),
                setFieldTouched: jest.fn(),
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        fireEvent.change(inputs[0], { target: { value: 'url' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[0]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.click(inputs[1]);
        fireEvent.click(inputs[2]);
    });
});