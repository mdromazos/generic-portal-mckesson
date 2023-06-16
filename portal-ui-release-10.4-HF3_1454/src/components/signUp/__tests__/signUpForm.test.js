import React from 'react';
import { StateContext } from '../../../context/stateContext';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import SignUpForm from '../SignUpForm';
import { render, fireEvent, wait, act } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';
import { locale_option } from '../../login/__mocks__/runtime-data';
import { runtime_data, history, appNotification, match } from '../__mocks__/signup-data';

jest.mock('../../beForm/beForm', () => () => 'beForm');
jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

APIService.getRequest = jest.fn().mockImplementation((url, success) => {
    if (url === URLMap.getPortalLocales(match.params.id)) {
        success(locale_option);
    } else {
        success({});
    }
});

APIService.postRequest = jest.fn().mockImplementation((url, signUpPayload, success) => {
    if (url === URLMap.postSignUp(portalSettings.generalSettings.signup.bevName, portalSettings.generalSettings.sourceSystem)) {
        success();
    }
});

const handleLocaleHandler = jest.fn(String);

const dispatchAppNotification =  jest.fn(String);

const { 123: portalSettings } = portalMetadataStore;

const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: portalSettings.generalSettings,
        runtimeConfigurationData: runtime_data,
        appNotification: appNotification,
        notificationActions: { dispatchAppNotification: dispatchAppNotification, removeAppNotification: jest.fn() }
    }]}>
        <SignUpForm match={match} history={history} handleLocaleHandler={handleLocaleHandler} />
    </StateContext.Provider>
);

describe('Testing the signup page form component', () => {

    it("Renders title properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('signup__form__title').textContent).toMatch(portalSettings.generalSettings.signup.title + portalSettings.generalSettings.signup.welcomeText);
    });

    it("Renders copyright text below the signup form", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('signup__copyright__text').textContent).toMatch("© Copyright 1993-2020 Informatica LLC.All Rights Reserved.");
    });

    it("Renders the message bubble and message properly", () => {
        const { queryAllByTestId, getByTestId } = renderForm();
        expect(queryAllByTestId('message_bubble').length).toStrictEqual(1);
        expect(queryAllByTestId('message_bubble_message').length).toStrictEqual(1);
        expect(getByTestId('message_bubble_message').textContent).toMatch(appNotification[0].message);
    });

    it("Render login link below the signup form", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('login__link')).not.toBeNull();
        expect(getByTestId('login__link').textContent).toMatch("Log In");
        act(() => {
            fireEvent.click(getByTestId('login__link'));
        });
        expect(history.push).toHaveBeenNthCalledWith(1, `/${match.params.id}/${match.params.orsId}/login`);
    });

    it("Renders the proper error message for username and password when left blank", async () => {
        const { queryAllByText, container } = renderForm();
        act(() => {
            fireEvent.blur(container.querySelectorAll('input')[0])
            fireEvent.blur(container.querySelectorAll('input')[1])
            fireEvent.blur(container.querySelectorAll('input')[5])
            fireEvent.blur(container.querySelector('input[type="password"]'))
        });
        await wait(() => {
            expect(queryAllByText('First Name is a required field').length).toStrictEqual(1);
            expect(queryAllByText('Last Name is a required field').length).toStrictEqual(1);
            expect(queryAllByText('Email is a required field').length).toStrictEqual(1);
            expect(queryAllByText('Password is a required field').length).toStrictEqual(1);
        });
    },10000);

    it("Render dropdown for various locale options", () => {
        const { getByTestId, } = renderForm();
        const dropdown = getByTestId('dropdown-button');

        act(() => {
            fireEvent.click(dropdown);
        });
        act(() => {
            fireEvent.click(getByTestId('dropdown-menu').lastChild);
        });
        expect(handleLocaleHandler).toHaveBeenCalledTimes(1);
    });

    it("Handle Post signup - fire API", async () =>  {
        const { getByTestId, container } = renderForm();

        const firstName = container.querySelectorAll('input')[0];
        const lastName = container.querySelectorAll('input')[1];
        const email = container.querySelectorAll('input')[5];
        const password = container.querySelector('input[type="password"]');
       
        fireEvent.change(firstName, {
            target: {value: "abc"}
        });
        fireEvent.change(lastName, {
            target: {value: "xyz"}
        });
        fireEvent.change(email, {
            target: {value: "mock@email.com"}
        });
        fireEvent.change(password, {
            target: {value: "12345"}
        });
        act(() => {
            fireEvent.click(getByTestId('signup__button'));
        });
        await wait(() => {
            expect(APIService.postRequest).toHaveBeenNthCalledWith(1,
                URLMap.postSignUp(portalSettings.generalSettings.signup.bevName, portalSettings.generalSettings.sourceSystem),
                expect.any(Object),expect.any(Function),expect.any(Function),expect.any(Object)
            );
            expect(history.push).toHaveBeenCalledWith({"pathname": `/${match.params.id}/${match.params.orsId}/login`});
            expect(dispatchAppNotification).toHaveBeenCalledTimes(1);
        }) 
    });
});