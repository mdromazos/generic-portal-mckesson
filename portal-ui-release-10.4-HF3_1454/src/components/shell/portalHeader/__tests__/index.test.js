import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import { StateContext } from '../../../../context/stateContext';
import { portalMetadataStore } from '../../../__mocks__/portal-metadata';
import PortalHeader from '../index';
import { render, fireEvent, act } from '@testing-library/react';
import APIService from '../../../../utils/apiService';
import { URLMap } from '../../../../utils/urlMappings';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const { 123: portalSettings } = portalMetadataStore;

const history = {
    push : jest.fn()
};

const match = {  
    params: {      
        id: '1',       
        orsId: 'orcl-localhost-Supplier'   
    }
};

const dispatchAppNotification = jest.fn();
const setRuntimeConfigurationAction = jest.fn();
const setPortalConfiguration = jest.fn();

const renderForm = ({ isExternalUserManagementEnabled= false } = {}) => render(
    <StateContext.Provider value={[{
        globalSettings: { ...portalSettings.generalSettings, isExternalUserManagementEnabled },
        globalActions: { setPortalConfiguration},
        runtimeConfigurationActions: { setRuntimeConfigurationAction},
        notificationActions: { dispatchAppNotification, editStatusAction: jest.fn()},
        confirmDialog:{ editStatus : false, type : {} }
    }]}>
        <Router>
            <PortalHeader match={match} history={history} />
        </Router>
    </StateContext.Provider>
);

describe('Testing the portal header component', () => {

    it("Renders portal header title properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('portal__header__title').textContent).toMatch(portalSettings.generalSettings.portalTitle);
    });
    
    it("Renders the menu button in header section", () => {
        const { queryByTestId } = renderForm();
        expect(queryByTestId('portal__header__menu')).not.toBeNull();
    });

    it("Renders the menu button in header section", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('portal_header_logo_image')).toHaveLength(1);
        expect(queryAllByTestId('portal_header_logo')).toHaveLength(0);
    });

    it("Renders the menu item on click of menu icon in header", async () => {
        const { getByTestId, queryAllByTestId } = renderForm();
        act(() => {
            fireEvent.click(getByTestId('portal__header__menu'));
        });
        expect(queryAllByTestId('header__menu__item')).toHaveLength(3);

    });

    it("Logs out and redirects to Logout page on clicking logout button", async(done) => {
        APIService.putRequest = jest.fn().mockImplementation((url,payload ,success) => {
            if (url === URLMap.postLogout(match.params.id)) {
                success();
            }
        });

        const { getByText, getByTestId, queryAllByTestId } = renderForm();
        const userMenu = getByTestId('portal__header__menu');
        act(() => {
            fireEvent.click(userMenu);
        });

        expect(getByText('LOG_OUT')).not.toBeNull();

        act(() => {
            fireEvent.click(queryAllByTestId('header__menu__item')[2]);
        });

        expect(APIService.putRequest).toHaveBeenCalledTimes(1);
        expect(APIService.putRequest).toHaveBeenCalledWith(URLMap.postLogout(match.params.id), 
            {}, expect.any(Function), expect.any(Function), expect.any(Object)
        );
        done();
    });

    it('should hide change password menu item when isExternalUserManagementEnabled is true', () => {
        const { getByTestId, queryAllByTestId } = renderForm({ isExternalUserManagementEnabled: true });

        const userMenu = getByTestId('portal__header__menu');
        act(() => {
            fireEvent.click(userMenu);
        });
        
        expect(queryAllByTestId('header__menu__item')).toHaveLength(2);
    });
});

describe('Testing portal header component with API failureCallback', () => {
    it("Logs out and fire API with failureCallback  on clicking logout button", async(done) => {
        APIService.putRequest = jest.fn().mockImplementation((url,payload ,success, failureCallback) => {
            if (url === URLMap.postLogout(match.params.id)) {
                failureCallback({response: {data: {errorCode: 'ERROR'}}});
            }
        });
        
        const {  getByTestId, queryAllByTestId } = renderForm();

        const userMenu = getByTestId('portal__header__menu');
        act(() => {
            fireEvent.click(userMenu);
        });
        act(() => {
            fireEvent.click(queryAllByTestId('header__menu__item')[2]);
        });

        expect(APIService.putRequest).toHaveBeenCalledTimes(1);
        expect(APIService.putRequest).toHaveBeenCalledWith(URLMap.postLogout(match.params.id), 
            {}, expect.any(Function), expect.any(Function), expect.any(Object)
        );
        expect(dispatchAppNotification).toHaveBeenCalledTimes(1);
        done();
    });
});