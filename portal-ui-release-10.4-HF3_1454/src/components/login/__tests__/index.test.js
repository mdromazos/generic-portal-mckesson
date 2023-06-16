import React from 'react';
import '@testing-library/jest-dom';
import { StateContext } from '../../../context/stateContext';
import LoginPage from '../index';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { render, act, fireEvent, cleanup } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';
import { runtime_data, locale_option } from '../__mocks__/runtime-data';

afterEach(cleanup);

const { 123: portalSettings } = portalMetadataStore;
const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const appNotification = [
    {
        type: 'warning', 
        message : 'sample warning'
    }
];

APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
    if (url === URLMap.getPortalData(match.params.id)) {
        success(portalSettings.generalSettings);
    } else if (url === URLMap.getRuntimeConfigurationData(match.params.id)) {
        success(runtime_data);
    } else if (url === URLMap.getSessionValidate(match.params.id)) {
        failureCallback();
    } else if (url === URLMap.getPortalLocales(match.params.id)) {
        success(locale_option);
    }
});

const renderForm = ({ isExternalUserManagementEnabled= false } = {}) => render(
    <StateContext.Provider value={[{
        globalSettings: { ...portalSettings.generalSettings, isExternalUserManagementEnabled },
        globalActions: { setPortalConfiguration: jest.fn() },
        runtimeConfigurationActions: { setRuntimeConfigurationAction: jest.fn() },
        notificationActions: { dispatchAppNotification: jest.fn(), removeAppNotification: jest.fn() },
        appNotification: appNotification
    }]}>
        <LoginPage match={match} />
    </StateContext.Provider>
);

describe('Examining the login page component', () => {

    it("Renders the portal name on the login page properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('login__portal__title').textContent).toMatch(portalSettings.generalSettings.portalTitle);
    });

    it("Renders the message bubble and message properly", () => {
        const { queryAllByTestId, getByTestId } = renderForm();
        expect(queryAllByTestId('message_bubble').length).toStrictEqual(1);
        expect(queryAllByTestId('message_bubble_message').length).toStrictEqual(1);
        expect(getByTestId('message_bubble_message').textContent).toMatch(appNotification[0].message);
    });

    it('should not display forgot password link page when isExternalUserManagementEnabled is true', () => {
        const { queryByTestId } = renderForm({ isExternalUserManagementEnabled: true });

        expect(queryByTestId('forgot_password_link')).toBeNull();
    });
});

describe('Fire API on load of portal UI and should render dropdown for locales', () => {

    it("Fire API on portal loading", () => {
        renderForm();
        expect(APIService.getRequest).toHaveBeenNthCalledWith(2, URLMap.getPortalData(match.params.id), 
            expect.any(Function), expect.any(Function), expect.any(Object)); 
        expect(APIService.getRequest).toHaveBeenNthCalledWith(1, URLMap.getPortalLocales(match.params.id),
            expect.any(Function), expect.any(Function), expect.any(Object) );
        expect(APIService.getRequest).toHaveBeenNthCalledWith(3, URLMap.getSessionValidate(match.params.id),
            expect.any(Function), expect.any(Function), expect.any(Object));
        expect(APIService.getRequest).toHaveBeenNthCalledWith(4, URLMap.getRuntimeConfigurationData(match.params.id),
            expect.any(Function), expect.any(Function), expect.any(Object));
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
    });
});