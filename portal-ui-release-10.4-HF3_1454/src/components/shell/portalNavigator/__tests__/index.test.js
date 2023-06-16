import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { StateContext } from '../../../../context/stateContext';
import { portalMetadataStore } from '../../../__mocks__/portal-metadata';
import { portalPages } from '../../../__mocks__/portal-pages';
import PortalNavigator from '../index';
import { render, fireEvent, act } from '@testing-library/react';
import APIService from '../../../../utils/apiService';
import { URLMap } from '../../../../utils/urlMappings';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const { 123: portalSettings } = portalMetadataStore;

const match = {
    url: "http:localhost:8080/portal-ui/",
    params: {
        pageId: '10',
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const editStatusAction = jest.fn(Boolean, String, Boolean);
const dispatchAppNotification = jest.fn(String, String);

const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: portalSettings.generalSettings,
        pageMetadata: { pages: portalPages.pages },
        notificationActions: { editStatusAction: editStatusAction},
        confirmDialog: { editStatus: true },
        dispatchAppNotification : dispatchAppNotification 
    }]}>
        <Router>
            <PortalNavigator match={match}/>
        </Router>
    </StateContext.Provider>
);

describe('Testing the portal navigator component', () => {

    it("Should render the portal navigation column", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('portal-navigator').length).toStrictEqual(1);
    });

    it("Portal navigation tab should be equal to the number of pages", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('portal__nav__tab').length).toStrictEqual(11);

        act(() => {
            fireEvent.click(queryAllByTestId('portal__nav__tab')[5]);
        });

        expect(editStatusAction).toHaveBeenNthCalledWith(1,true,'http:localhost:8080/portal-ui/shell/1400073',true);

        act(() => {
            fireEvent.click(queryAllByTestId('portal__nav__tab')[10]);
        });

        expect(editStatusAction).toHaveBeenNthCalledWith(2,true,'http:localhost:8080/portal-ui/shell/1400074',true);
    });

    it("Number of selected navigation tab should be exactly one", () => {
        const { container } = renderForm();
        expect(container.getElementsByClassName('selected').length).toStrictEqual(1);
    });

    it("Should fetch portal details by firing get API", () => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                success(portalSettings.generalSettings);
            } else {
                success();
            }
        });
        
        renderForm();
        expect(APIService.getRequest).toHaveBeenCalledWith(URLMap.getPortalData(match.params.id), 
            expect.any(Function), expect.any(Function), expect.any(Object));
    });

});

describe('Testing the portal navigator component with failureCallback', () => {
    it("fire API with failureCallback of getPortalData", async(done) => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                failureCallback({response: {data: {errorCode: 'ERROR'}}});
            }
        });
        renderForm();

        expect(APIService.getRequest).toHaveBeenCalledTimes(1);
        expect(dispatchAppNotification).toHaveBeenCalledTimes(1);
        done();
    });
});

describe('Testing the portal navigator component with failureCallback without errorCode', () => {
    it("fire API with failureCallback of getPortalData without errorCode", async(done) => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                failureCallback({response: {data: {}}});
            }
        });
        renderForm();

        expect(APIService.getRequest).toHaveBeenCalledTimes(1);
        expect(dispatchAppNotification).toHaveBeenCalledTimes(2);
        done();
    });
});