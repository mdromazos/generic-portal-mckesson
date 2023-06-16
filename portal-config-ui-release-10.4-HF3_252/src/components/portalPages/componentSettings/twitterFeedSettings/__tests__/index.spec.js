import React from 'react';
import TwitterFeedSettings from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <TwitterFeedSettings
        formikProps={props.formikProps}
    />
);

describe('Component setting > Twitter feed settings component', () => {
    it('should render twitter feed setting component without crashing', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input').length).toBe(1);
    });
    
    it('should render error and values if present in formikProps', async () => {
        const props = {
            formikProps: {
                values: {
                    url: 'serverUrl',
                },
                touched: {
                    url: true,
                },
                errors: {
                    url: 'The serverUrl field is required',
                },
            }
        };
        const { container } = renderComponent(props);
        expect(container.querySelector('.form-error').textContent).toBe(props.formikProps.errors.url);
        expect(container.querySelector('input').value).toBe(props.formikProps.values.url);
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
        fireEvent.change(container.querySelector('input'), { target: { value: 'url' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelector('input'));
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
    });
});