import React from 'react';
import P360TimelineSettings from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <P360TimelineSettings
        formikProps={props.formikProps}
    />
);

describe('Component setting > Product 360 timeline settings component', () => {
    it('should render product 360 timeline setting component without crashing', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.product__timeline__container')).not.toBeNull();
        expect(container.querySelectorAll('input').length).toBe(1);
    });
    
    it('should render error and values if present in formikProps', async () => {
        const props = {
            formikProps: {
                values: {
                    serverUrl: 'serverUrl',
                },
                touched: {
                    serverUrl: true,
                },
                errors: {
                    serverUrl: 'The serverUrl field is required',
                },
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.form-error').textContent).toBe(props.formikProps.errors.serverUrl);
        expect(container.querySelector('input').value).toBe(props.formikProps.values.serverUrl);
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
        fireEvent.change(container.querySelector('input'), { target: { value: 'serverUrl' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelector('input'));
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
    });
});