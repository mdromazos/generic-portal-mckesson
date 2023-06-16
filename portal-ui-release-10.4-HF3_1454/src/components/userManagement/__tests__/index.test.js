import React from 'react';
import { StateContext } from '../../../context/stateContext';
import UserManagementForm from '../index';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { render, fireEvent, act, wait, cleanup } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

afterEach(cleanup);

const { 123: portalSettings } = portalMetadataStore;
const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const portalRole = {
    item : [
        {
            id : 'supplier_user',
            value : 'User'
        },
        {
            id : 'supplier_admin',
            value : 'Admin'
        }
    ]
}

var editUser = false;
const selectedRowId = {};
const setUserForm = jest.fn();
const setaddUserForm = jest.fn();
const setEditUser = jest.fn().mockImplementation((value) => editUser = value);
const setEditUserMessage = jest.fn();

APIService.postRequest = jest.fn().mockImplementation((url, payload,success, failureCallback) => {
    if (url === URLMap.getProxy() && payload.httpMethod === 'GET') {
        success(portalRole);
    } else if (url === URLMap.getRuntimeConfigurationData(match.params.id)) {
        success(runtime_data);
    } else if (url === URLMap.getSessionValidate(match.params.id)) {
        failureCallback({response:{data:{errorCode:'ERRORR'}}});
    } else {
        success();
    }
});


const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: portalSettings.generalSettings,
        notificationActions: { dispatchAppNotification: jest.fn() },
    }]}>
        <UserManagementForm
            match={match}
            edit={false}
            selectedRowId={selectedRowId}
            setUserForm={setUserForm}
            setaddUserForm={setaddUserForm}
            setEditUser={setEditUser}
            setEditUserMessage={setEditUserMessage}
        />
    </StateContext.Provider>
);

describe('Testing user management page component with edit mode as false', () => {

    it("Renders the user management page properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('add_user_section')).not.toBeNull();
        expect(getByTestId('add_user_section').firstChild.textContent).toMatch(portalSettings.generalSettings.userManagement.sectionHeading);
        expect(getByTestId('firstName')).not.toBeNull();
        expect(getByTestId('firstName').textContent).toMatch(portalSettings.generalSettings.userManagement.fieldMapping.firstName.label);
        expect(getByTestId('lastName')).not.toBeNull();
        expect(getByTestId('lastName').textContent).toMatch(portalSettings.generalSettings.userManagement.fieldMapping.lastName.label);
        expect(getByTestId('email')).not.toBeNull();
        expect(getByTestId('email').textContent).toMatch(portalSettings.generalSettings.userManagement.fieldMapping.email.label);
        expect(getByTestId('jobTitle')).not.toBeNull();
        expect(getByTestId('jobTitle').textContent).toMatch(portalSettings.generalSettings.userManagement.fieldMapping.jobTitle.label);
        expect(getByTestId('countryDialingCode')).not.toBeNull();
        expect(getByTestId('countryDialingCode').textContent).toMatch(portalSettings.generalSettings.userManagement.fieldMapping.countryDialingCode.label);
        expect(getByTestId('phoneNumber')).not.toBeNull();
        expect(getByTestId('phoneNumber').textContent).toMatch(portalSettings.generalSettings.userManagement.fieldMapping.phoneNumber.label);
        expect(getByTestId('userRole')).not.toBeNull();
        expect(getByTestId('userRole').textContent).toMatch('LABEL_USER__MANAGEMENT_ROLE');
        expect(getByTestId('save_user_button')).not.toBeNull();
    });

    it("Fire get Role API on load of page ", () => {
        renderForm();
        expect(APIService.postRequest).toHaveBeenCalledTimes(2);
        expect(APIService.postRequest).toHaveBeenNthCalledWith(1,URLMap.getProxy(), {
            apiUrl: '/cmx/lookup/orcl-localhost-Supplier/id-label/SupplierRegistrationView/Contacts/prtlUsrRle',
            httpMethod: 'GET',
            proxyAttribute: ''
        }, expect.any(Function), expect.any(Function), expect.any(Object) );
    });
        
    it("Render Error messages on click of submit button and fire submit API", async () => {
        const { getByTestId, getByText, container } = renderForm();
        act(() => {
            fireEvent.blur(container.querySelectorAll('input')[0]);
            fireEvent.blur(container.querySelectorAll('input')[1]);
            fireEvent.blur(container.querySelectorAll('input')[2]);
            fireEvent.blur(getByTestId('dropdown-search'));
        });
        await wait(() => {
            expect(getByText('ERROR_REQUIRED_FIRST_NAME')).not.toBeNull();
            expect(getByText('ERROR_REQUIRED_LAST_NAME')).not.toBeNull();
            expect(getByText('ERROR_REQUIRED_EMAIL')).not.toBeNull();
            expect(getByText('ERROR_REQUIRED_USER_ROLE')).not.toBeNull();
            expect(APIService.postRequest).toHaveBeenCalledTimes(3);
        })
    },10000);
});

describe('Testing user management page component with edit mode as true', () => {

    it("Render Error messages on click of submit button and fire submit API for edit mode as true", async () => {
        const { getByTestId, container } = render(
            <StateContext.Provider value={[{
                globalSettings: portalSettings.generalSettings,
                notificationActions: { dispatchAppNotification: jest.fn() },
            }]}>
                <UserManagementForm
                    match={match}
                    edit={true}
                    selectedRowId={selectedRowId}
                    setUserForm={setUserForm}
                    setaddUserForm={setaddUserForm}
                    setEditUser={setEditUser}
                    setEditUserMessage={setEditUserMessage}
                />
            </StateContext.Provider>
        );
        const firstName = container.querySelectorAll('input')[0];
        const lastName = container.querySelectorAll('input')[1];
        const email = container.querySelectorAll('input')[2];
        const userRole = getByTestId('dropdown-search');
       
        fireEvent.change(firstName, {
            target: {value: "abc"}
        });
        fireEvent.change(lastName, {
            target: {value: "xyz"}
        });
        fireEvent.change(email, {
            target: {value: "mock@email.com"}
        });
        fireEvent.change(userRole, {
            target: {value: "supplier user"}
        });
        act(() => {
            fireEvent.click(getByTestId('save_user_button'));
        });
        await wait(() => {
            expect(APIService.postRequest).toHaveBeenCalledTimes(5);
        })
    },10000);
});














