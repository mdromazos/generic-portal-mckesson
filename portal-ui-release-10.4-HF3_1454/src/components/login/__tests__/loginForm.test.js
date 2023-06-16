import React from 'react';
import { StateContext } from '../../../context/stateContext';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import LoginForm from '../loginForm';
import { render, fireEvent, wait, act, cleanup } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';
import { locale_option, runtime_session_data } from '../__mocks__/runtime-data';

afterEach(cleanup);

APIService.postRequest = jest.fn().mockImplementation((url, loginPayload, success, failureCallback) => {
    if (url === URLMap.postLogin(match.params.id)) {
            const resp = {};
            resp.recordId = '12345';
            resp.username = 'abcd';
            resp.roleCode = 'admin';
            resp.partyStatusValue = 'approved';
        success(resp);
    } else {
        success({});
    }
});

const { 123: portalSettings } = portalMetadataStore;

const history = {
    push : jest.fn(String) 
};

const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const handleLocaleHandler = jest.fn(String);

const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: portalSettings.generalSettings,
        globalActions: { setPortalConfiguration: jest.fn() },
        runtimeConfigurationActions: { setRuntimeConfigurationAction: jest.fn() },
        notificationActions: { dispatchAppNotification: jest.fn(), removeAppNotification:jest.fn() },
        runtimeConfigurationData: runtime_session_data
    }]}>
        <LoginForm match={match} history={history} handleLocaleHandler={handleLocaleHandler}/>
    </StateContext.Provider>
);

describe('Testing the login form component', () => {

    APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
        if(url === URLMap.getPortalLocales(match.params.id)) {
            success(locale_option);
        } else {
            success({});
        }
    });

    it("Renders title properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('login__form__title').textContent).toMatch(portalSettings.generalSettings.login.title);
    });
    
    it("Renders the proper error message for username and password when left blank", async () => {
        const { getByText, getByTestId } = renderForm();
        act(() => {
            fireEvent.click(getByTestId('login__button'));
        });
        await wait(() => {
            expect(getByText('Username is a required field')).not.toBeNull();
            expect(getByText('Password is a required field')).not.toBeNull();
        });
    });

    it("Render the signup link properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('signup__link')).not.toBeNull();
        expect(getByTestId('signup__link').textContent).toMatch("Don't have an account?Sign Up");
        act(() => {
            fireEvent.click(getByTestId('signup__link').childNodes[1]);
        });
        expect(history.push).toHaveBeenNthCalledWith(1,`/${match.params.id}/${match.params.orsId}/signup`);
    });

    it("Do not render the signup link if signup is disabled", () => {
        portalSettings.generalSettings.disableSignup = true;
        const { queryByTestId } = renderForm();
        expect(queryByTestId('signup__link')).toBeNull();
    });

    it("Renders copyright text below the login form", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('login__copyright__text').textContent).toMatch("© Copyright 1993-2020 Informatica LLC.All Rights Reserved.");
    });
     
    it("Render forgot password link properly and should call the function on click.", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('forgot_password_link')).not.toBeNull();
        expect(getByTestId('forgot_password_link').textContent).toMatch("Forgot Password?");
        
        act(() => {
            fireEvent.click(getByTestId('forgot_password_link').firstChild);
        });
        expect(history.push).toHaveBeenNthCalledWith(2,`/${match.params.id}/${match.params.orsId}/forgotPassword`);
    });

    it("Handle Post login - fire API", async () =>  {
        const { getByTestId, container } = renderForm();

        const username = container.querySelectorAll('input')[0];
        const password = container.querySelectorAll('input')[1];
        
        fireEvent.change(username, {
            target: {
              value: "mock@email.com"
            }
        });
        fireEvent.change(password, {
            target: {
              value: "12345"
            }
        });
        act(() => {
            fireEvent.click(getByTestId('login__button'));
        });
        await wait(() => {
            expect(APIService.postRequest).toHaveBeenNthCalledWith(1,URLMap.postLogin(match.params.id),
                expect.any(Object),expect.any(Function),expect.any(Function),expect.any(Object)
            );
            expect(history.push).toHaveBeenNthCalledWith(3,`/${match.params.id}/${match.params.orsId}/shell`);
        }) 
    });

    it("Render dropdown for various locale options", () => {
        const { getByTestId } = renderForm();
        const dropdown = getByTestId('dropdown-button');

        act(() => {
            fireEvent.click(dropdown);
        });
        act(() => {
            fireEvent.click(getByTestId('dropdown-menu').lastChild);
        });
        expect(handleLocaleHandler).toHaveBeenCalledTimes(1);
    });

});