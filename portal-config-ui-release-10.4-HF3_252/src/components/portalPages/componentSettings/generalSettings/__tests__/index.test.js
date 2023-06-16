import React from 'react';
import GeneralSettings from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <GeneralSettings
        formikProps={props.formikProps}
    />
);

describe('Component setting > General setting component', () => {
    it('should render general setting component without custom height field when displayHeight is not custom', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.form-group').length).toBe(2);
    });

    it('should render general setting component with custom height field when displayHeight is custom', async () => {
        const props = {
            formikProps: {
                values: {
                    displayHeight: 'CUSTOM',
                },
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.form-group').length).toBe(3);
    });
    
    it('should render error and values if present in formikProps', async () => {
        const props = {
            formikProps: {
                values: {
                    title: 'title',
                    displayHeight: 'CUSTOM',
                    customHeight: '10',
                },
                touched: {
                    customHeight: true,
                },
                errors: {
                    customHeight: 'The customHeight field is required',
                },
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.form-error').textContent).toBe(props.formikProps.errors.customHeight);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        expect(inputs[0].value).toBe(props.formikProps.values.title);
        expect(inputs[1].value).toBe('LABEL_CUSTOM');
        expect(inputs[2].value).toBe(props.formikProps.values.customHeight);
    });
    
    it('should call the callback functions when inputs are changed', async () => {
        const props = {
            formikProps: {
                setFieldValue: jest.fn(),
                setFieldTouched: jest.fn(),
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
                values: {
                    displayHeight: 'CUSTOM',
                },
                touched: {},
                errors: {},
            }
        };
        const { container, getByTestId } = renderComponent(props);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        fireEvent.change(inputs[0], { target: { value: 'title' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[0]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.click(container.querySelector('[data-testid="dropdown-button"]'));
        fireEvent.click(getByTestId('dropdown-menu').firstChild);
        fireEvent.blur(getByTestId('dropdown-search'));
        fireEvent.change(inputs[2], { target: { value: '22' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[2]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
    });
});