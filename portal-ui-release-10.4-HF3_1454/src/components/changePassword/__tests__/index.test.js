import React from 'react';
import { Router, Route } from 'react-router-dom';
import '@testing-library/jest-dom'
import { StateContext } from '../../../context/stateContext';
import ChangePassword from '../index';
import { render, fireEvent, act, wait } from '@testing-library/react';
import { runtimeData, match } from '../__mocks__/data';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { runtime_data } from '../../login/__mocks__/runtime-data';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';
import { createMemoryHistory } from 'history';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

APIService.postRequest = jest.fn().mockImplementation((url, Payload, success) => {
    if (url === URLMap.postChangePassword(match.params.id)) {
        success();
    }
});

APIService.putRequest = jest.fn().mockImplementation((url, Payload, success) => {
    if (url === URLMap.postLogout(match.params.id)) {
        success();
    } else {
        success();
    }
});

APIService.getRequest = jest.fn().mockImplementation((url, success) => {
    if (url === URLMap.getRuntimeConfigurationData(match.params.id)) {
        success(runtime_data);
    }
});

const dispatchAppNotification = jest.fn();

const route =  `/${match.params.id}/${match.params.orsId}`;
const history = createMemoryHistory({ initialEntries: [route] });
history.push = jest.fn(String);

const { 123: portalSettings } = portalMetadataStore;

describe('Rendering the Change Password form component', () => {

    const renderForm = ({ isExternalUserManagementEnabled= false } = {}) => render(
        <Router history={history}>
            <StateContext.Provider value={[{
                globalSettings: { ...portalSettings.generalSettings, loadPortalConfig: true,  isExternalUserManagementEnabled },
                runtimeConfigurationData: runtimeData,
                notificationActions: { dispatchAppNotification: dispatchAppNotification },
                runtimeConfigurationActions: { setRuntimeConfigurationAction: jest.fn() }
            }]}>
                <Route path="/:id/:orsId" component={ChangePassword} />
            </StateContext.Provider>
        </Router>
    ); 

    it("Renders the portal change password form", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('change_password_title')).not.toBeNull();
        expect(queryAllByTestId('current_password')).not.toBeNull();
        expect(queryAllByTestId('new_password')).not.toBeNull();
        expect(queryAllByTestId('confirm_new_password')).not.toBeNull();
        expect(queryAllByTestId('change_password_button')).not.toBeNull();
    });
    
    it("Renders the title and fields name on the change password form", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('change_password_title').textContent).toMatch("CHANGE_PASSWORD");
        expect(getByTestId('current_password').textContent).toMatch("LABEL_VERIFY_CURRENT_PASSWORD");
        expect(getByTestId('new_password').textContent).toMatch("LABEL_VERIFY_NEW_PASSWORD");
        expect(getByTestId('confirm_new_password').textContent).toMatch("LABEL_VERIFY_CONFIRM_PASSWORD");
    });

    it("Renders the proper error message for password when left blank and fire API on load", async () => {
        const { queryAllByText, container } = renderForm();

        expect(APIService.getRequest).toHaveBeenNthCalledWith(1,
            URLMap.getRuntimeConfigurationData(match.params.id),
            expect.any(Function), expect.any(Function), expect.any(Object)
        );

        act(() => {
            fireEvent.blur(container.querySelectorAll('input[type="password"]')[0]);
            fireEvent.blur(container.querySelectorAll('input[type="password"]')[1]);
            fireEvent.blur(container.querySelectorAll('input[type="password"]')[2]);
        });
        await wait(() => {
            expect(queryAllByText('ERROR_REQUIRED_PASSWORD').length).toStrictEqual(1);
            expect(queryAllByText('ERROR_REQUIRED_CONFIRM_PASSWORD').length).toStrictEqual(1);
            expect(queryAllByText('ERROR_REQUIRED_NEW_PASSWORD').length).toStrictEqual(1);
        });
    },10000);

    it("Handle Post Submit - fire API", async () =>  {
        const { getByTestId, container } = renderForm();

        const oldPassword = container.querySelectorAll('input[type="password"]')[0];
        const newPassword = container.querySelectorAll('input[type="password"]')[1];
        const confirmPassword = container.querySelectorAll('input[type="password"]')[2];
        
        fireEvent.change(oldPassword, {
            target: {value: "12345"}
        });
        fireEvent.change(newPassword, {
            target: {value: "abcde"}
        });
        fireEvent.change(confirmPassword, {
            target: {value: "abcde"}
        });

        act(() => {
            fireEvent.click(getByTestId('change_password_button'));
        });
        await wait(() => {
            expect(APIService.postRequest).toHaveBeenNthCalledWith(1,
                URLMap.postChangePassword(match.params.id),
                expect.any(Object),expect.any(Function),expect.any(Function),expect.any(Object)
            );
            expect(dispatchAppNotification).toHaveBeenCalledTimes(1);
            expect(APIService.putRequest).toHaveBeenNthCalledWith(1,
                URLMap.postLogout(match.params.id),
                expect.any(Object),expect.any(Function),expect.any(Function),expect.any(Object)
            );
            expect(history.push).toHaveBeenCalledWith(`/${match.params.id}/${match.params.orsId}/login`);
        });
    });

    it('should display page not found page when isExternalUserManagementEnabled is true', () => {
        const { getByTestId } = renderForm({ isExternalUserManagementEnabled: true });

        expect(getByTestId('page-not-found')).toBeInTheDocument();
    });

});