import React from 'react';
import { StateContext } from '../../../context/stateContext';
import ResetPasswordView from '../index';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { cleanup, render } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';
import { runtime_data } from '../../login/__mocks__/runtime-data';

afterEach(cleanup);

jest.mock('./../ResetPassword', () => () => 'ResetPassword');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const appNotification = [
    {
        type: 'warning',
        message: 'sample warning'
    }
];

const { 123: portalSettings } = portalMetadataStore;
const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const history = {
    push : jest.fn()
}

const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: {...portalSettings.generalSettings, loadPortalConfig : true},
        globalActions: { setPortalConfiguration: jest.fn() },
        runtimeConfigurationActions: { setRuntimeConfigurationAction: jest.fn() },
        notificationActions: { dispatchAppNotification: jest.fn(), removeAppNotification: {} },
        appNotification: appNotification
    }]}>
        <ResetPasswordView match={match} history={history}/>
    </StateContext.Provider>
);

describe('Rendering the Reset Password page component', () => {

    it("Renders the portal reset password page properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('reset_password_page')).not.toBeNull();
    });

    it("Renders the portal name on the reset password page properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('reset_password_title').textContent).toMatch(portalSettings.generalSettings.portalTitle);
    });

    it("Renders the message bubble and message properly", () => {
        const { queryAllByTestId, getByTestId } = renderForm();
        expect(queryAllByTestId('message_bubble').length).toStrictEqual(1);
        expect(queryAllByTestId('message_bubble_message').length).toStrictEqual(1);
        expect(getByTestId('message_bubble_message').textContent).toMatch(appNotification[0].message);
    });
});

describe('Fire API on load of portal UI Forgot password page', () => {

    it("Fire API on portal loading", () => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                success(portalSettings);
            } else if (url === URLMap.getRuntimeConfigurationData(match.params.id)) {
                success(runtime_data);
            } else if (url === URLMap.getSessionValidate(match.params.id)) {
                failureCallback({response:{data:{errorCode:'ERROR'}}});
            } else {
                success();
            }
        });
        renderForm();
        expect(APIService.getRequest).toHaveBeenCalledTimes(3);
    });
});

describe('Fire API on load of portal UI reset password page with failureCallback', () => {

    it("Fire API on reset password pag loading with failure callback", () => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                failureCallback({response : {data : {errorCode : 'GENERIC_ERROR'}}});
            } else if (url === URLMap.getRuntimeConfigurationData(match.params.id)) {
                failureCallback({response : {data : {errorCode : 'ERROR'}}});
            } else if (url === URLMap.getSessionValidate(match.params.id)) {
                success();
            } else {
                failureCallback();
            }
        });
        renderForm();
        expect(APIService.getRequest).toHaveBeenCalledTimes(3);
        expect(history.push).toHaveBeenCalledTimes(1);
    });
});