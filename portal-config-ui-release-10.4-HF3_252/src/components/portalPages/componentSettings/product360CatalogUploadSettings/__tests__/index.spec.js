import React from 'react';
import P360CatalogUploadSettings from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <P360CatalogUploadSettings
        formikProps={props.formikProps}
    />
);

describe('Component setting > Product 360 catalog upload settings component', () => {
    it('should render product 360 catalog setting component without crashing', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.product__catalog__upload__container')).not.toBeNull();
        expect(container.querySelectorAll('input').length).toBe(3);
    });
    
    it('should render error and values if present in formikProps', async () => {
        const props = {
            formikProps: {
                values: {
                    serverUrl: 'serverUrl',
                    user: 'user',
                    externalIdPath: 'externalIdPath',
                },
                touched: {
                    serverUrl: true,
                    user: true,
                    externalIdPath: true,
                },
                errors: {
                    serverUrl: 'The serverUrl field is required',
                    user: 'The user field is required',
                    externalIdPath: 'the externalIdPath field is required',
                },
            }
        };
        const { container } = renderComponent(props);
        const errors = container.querySelectorAll('.form-error');
        expect(errors.length).toBe(2);
        expect(errors[0].textContent).toBe(props.formikProps.errors.serverUrl);
        expect(errors[1].textContent).toBe(props.formikProps.errors.user);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBe(3);
        expect(inputs[0].value).toBe(props.formikProps.values.serverUrl);
        expect(inputs[1].value).toBe(props.formikProps.values.user);
        expect(inputs[2].value).toBe(props.formikProps.values.externalIdPath);
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
        expect(inputs.length).toBe(3);
        fireEvent.change(inputs[0], { target: { value: 'serverUrl' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[0]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.change(inputs[1], { target: { value: 'user' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[1]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.change(inputs[2], { target: { value: 'externalPath' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(inputs[2]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
    });
});