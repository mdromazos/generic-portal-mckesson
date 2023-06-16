import React from 'react';
import { StateContext } from '../../../context/stateContext';
import SignUp from '../index';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { render } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';
import { runtime_data, locale_option } from '../../login/__mocks__/runtime-data';
import { match } from '../__mocks__/signup-data';

jest.mock('./../signUpForm', () => () => 'signUpForm');

APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
    if (url === URLMap.getPortalData(match.params.id)) {
        success(portalSettings.generalSettings);
    } else if(url === URLMap.getRuntimeConfigurationData(match.params.id)) {
        success(runtime_data);
    } else if(url === URLMap.getSessionValidate(match.params.id)) {
        failureCallback();
    } else if(url === URLMap.getPortalLocales(match.params.id)) {
        success(locale_option);
    }
});

const { 123: portalSettings } = portalMetadataStore;

describe('Examining the Signup page component', () => {


    const renderForm = () => render(
        <StateContext.Provider value={[{
            globalSettings : portalSettings.generalSettings,
            globalActions: { setPortalConfiguration : jest.fn()},
            runtimeConfigurationActions: { setRuntimeConfigurationAction : jest.fn()},
            notificationActions : {dispatchAppNotification : jest.fn(),removeAppNotification : jest.fn()}
        }]}>
            <SignUp match={match}/>
        </StateContext.Provider>
    );
    
    it("Renders the portal title on the signup page properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('portal__signup__title').textContent).toMatch(portalSettings.generalSettings.portalTitle);
    });

    it("Signup page should contains the signup Form section", () => {
        const { getAllByTestId } = renderForm();
        expect(getAllByTestId('portal__signupForm').length).toStrictEqual(1);
    });

    it("Fire API on portal loading", () => {
        renderForm();
        expect(APIService.getRequest).toHaveBeenNthCalledWith(1, URLMap.getPortalData(match.params.id), 
            expect.any(Function), expect.any(Function), expect.any(Object)); 
        expect(APIService.getRequest).toHaveBeenNthCalledWith(2, URLMap.getSessionValidate(match.params.id),
            expect.any(Function), expect.any(Function), expect.any(Object));
        expect(APIService.getRequest).toHaveBeenNthCalledWith(3, URLMap.getRuntimeConfigurationData(match.params.id),
            expect.any(Function), expect.any(Function), expect.any(Object));
    });

});