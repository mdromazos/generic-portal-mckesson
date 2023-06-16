import React from 'react';
import { StateContext } from '../../../context/stateContext';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import ForgotPassword from '../ForgotPassword';
import { render, fireEvent, wait, act } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const { 123: portalSettings } = portalMetadataStore;

const history = {
    push: jest.fn(String)
};

const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: portalSettings.generalSettings,
        globalActions: { setPortalConfiguration: jest.fn() },
        runtimeConfigurationActions: { setRuntimeConfigurationAction: {} },
        notificationActions: { dispatchAppNotification: {}, removeAppNotification: {} }
    }]}>
        <ForgotPassword match={match} history={history} />
    </StateContext.Provider>
);


describe('Testing the forgot password form component', () => {
    APIService.postRequest = jest.fn().mockImplementation((url, payload, success, failureCallback) => {
        if (url === URLMap.postForgotPassword(match.params.id)) {
            success();
        }
    });

    it("Renders title properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('forgot_password_title').textContent).toMatch("FORGOT_PASSWORD_TITLE");
    });


    it("Render login link below the forgot Password form", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('login_link')).not.toBeNull();
        expect(getByTestId('login_link').textContent).toMatch("BACK_TO_LOGIN");

        act(() => {
            fireEvent.click(getByTestId('login_link').firstChild);
        });
        expect(history.push).toHaveBeenCalledTimes(1);
    });

    it("Renders the proper error message for email id when left blank", async () => {
        const { getByText, getByTestId } = renderForm();
        act(() => {
            fireEvent.click(getByTestId('password_reset_button'));
        });
        await wait(() => {
            expect(getByText('ERROR_REQUIRED_EMAIL')).not.toBeNull();
        });
    });

    it("Render Password instruction on forgot password page", () => {
        const { queryByTestId } = renderForm();
        expect(queryByTestId('password_instruction').textContent).toMatch("FORGOT_PASSWORD_DEFAULT_INFO");
    });

    it("Handle Post login fire API",async () => {
        const { getByTestId, container } = renderForm();
        
        const email = container.querySelector('input');

        fireEvent.change(email, {
            target: {
              value: "mock@email.com"
            }
        });
        
        act(() => {
            fireEvent.click(getByTestId('password_reset_button'));
        });

        await wait(()=> {
            expect(APIService.postRequest).toHaveBeenCalledWith(
                URLMap.postForgotPassword(match.params.id), 
                {"orsId": match.params.orsId, "userEmail": "mock@email.com"},
                expect.any(Function),expect.any(Function),expect.any(Object)
            );
        })
    });
});