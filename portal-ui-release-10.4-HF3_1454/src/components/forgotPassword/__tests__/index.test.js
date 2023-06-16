import React from 'react';
import '@testing-library/jest-dom';
import { StateContext } from '../../../context/stateContext';
import ForgotPasswordView from '../index';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { render } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';
import { runtime_data } from '../../login/__mocks__/runtime-data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const appNotification = [
    {
        type: 'warning',
        message: 'sample warning'
    }
];

const history ={
    push: jest.fn(String)
}

const { 123: portalSettings } = portalMetadataStore;
const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const renderForm = ({ isExternalUserManagementEnabled= false } = {}) => render(
    <StateContext.Provider value={[{
        globalSettings: { ...portalSettings.generalSettings, loadPortalConfig: true,  isExternalUserManagementEnabled },
        globalActions: { setPortalConfiguration: jest.fn(Object) },
        runtimeConfigurationActions: { setRuntimeConfigurationAction: jest.fn(Object) },
        notificationActions: { dispatchAppNotification: jest.fn(Object), removeAppNotification: jest.fn(Object) },
        appNotification: appNotification
    }]}>
        <ForgotPasswordView match={match} history={history}/>
    </StateContext.Provider>
);

describe('Examining the forgot password page component', () => {
    
    it("Renders the portal name on the forgot password page properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('portal_title').textContent).toMatch(portalSettings.generalSettings.portalTitle);
    });

    it("Renders the message bubble and message properly", () => {
        const { queryAllByTestId, getByTestId } = renderForm();
        expect(queryAllByTestId('message_bubble').length).toStrictEqual(1);
        expect(queryAllByTestId('message_bubble_message').length).toStrictEqual(1);
        expect(getByTestId('message_bubble_message').textContent).toMatch(appNotification[0].message);
    });

    it("Fire API on portal loading", () => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                success(portalSettings);
            } else if (url === URLMap.getRuntimeConfigurationData(match.params.id)) {
                success(runtime_data);
            } else if (url === URLMap.getSessionValidate(match.params.id)) {
                failureCallback();
            } else {
                success();
            }
        });    
        renderForm();
        expect(APIService.getRequest).toHaveBeenCalledTimes(3);
    });

    it('should display page not found page when isExternalUserManagementEnabled is true', () => {
        const { getByTestId } = renderForm({ isExternalUserManagementEnabled: true });

        expect(getByTestId('page-not-found')).toBeInTheDocument();
    });
});

describe('Fire API on load of portal UI Forgot password page with failureCallback', () => {

    it("Fire API on portal loading with failure callback", () => {
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