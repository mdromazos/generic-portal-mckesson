import React from 'react';
import { StateContext } from '../../../context/stateContext';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { portalPages } from '../../__mocks__/portal-pages';
import Shell from '../index';
import { render } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../portalHeader', () => () => 'portal-header');
jest.mock('../portalBody', () => () => 'portal-body');

const { 123: portalSettings } = portalMetadataStore;

const match = {
    url: "http:localhost:8080/portal-ui/",
    params: {
        pageId: '10',
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const history = {
    push: jest.fn(String)
};

const dispatchAppNotification = jest.fn(Boolean, String, Boolean);
const setPortalConfiguration = jest.fn(Object);
const setPortalPages = jest.fn(Object);

const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: {...portalSettings.generalSettings,loadPortalConfig:true},
        pageActions: { setPortalPages: setPortalPages },
        globalActions: { setPortalConfiguration: setPortalConfiguration },
        pageMetadata: { pages: portalPages.pages, loadPortalPages:true },
        notificationActions: { dispatchAppNotification: dispatchAppNotification},
    }]}>
        <Shell match={match} history={history}/>
    </StateContext.Provider>
);

describe('Testing the portal shell component', () => {

    it("Should render the shell with header and body", () => {
        const { getByText} = renderForm();
        expect(getByText('portal-headerportal-body')).not.toBeNull();
    });

    it("Should fire API with respective parameters and call respective functions on load", () => {
        APIService.getRequest = jest.fn().mockImplementation((url, success) => {
            if (url === URLMap.getSessionValidate(match.params.id)) {
                success();
            } else if(url === URLMap.getPortalData(match.params.id)){
                success(portalSettings.generalSettings);
            } else if(url === URLMap.getPortalMeta(['portals', match.params.id, 'pages'], 3, true, 'order', {"roles": [""]})){
                success([{id:1}]);
            }
        });

        renderForm();

        expect(setPortalConfiguration).toHaveBeenCalledTimes(1);
        expect(setPortalPages).toHaveBeenCalledTimes(1);
        expect(history.push).toHaveBeenCalledTimes(1);

        expect(APIService.getRequest).toHaveBeenNthCalledWith(1,
            URLMap.getSessionValidate(match.params.id),
            expect.any(Function),
            expect.any(Function),
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
        expect(APIService.getRequest).toHaveBeenNthCalledWith(2,
            URLMap.getPortalData(match.params.id),
            expect.any(Function),
            expect.any(Function),
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
        expect(APIService.getRequest).toHaveBeenNthCalledWith(3,
            URLMap.getPortalMeta(['portals', match.params.id, 'pages'], 3, true, 'order', {"roles": [""]}),
            expect.any(Function),
            expect.any(Function),
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
    });
});

describe('Fire API on load of shell with session validate failureCallback', () => {

    it("Fire API on shell with  session validate failure callback", () => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                failureCallback({response : {data : {errorCode : 'GENERIC_ERROR'}}});
            } else if (url === URLMap.getPortalMeta(['portals', match.params.id, 'pages'], 3, true, 'order', {"roles": [""]})) {
                failureCallback({response : {data : {errorCode : 'ERROR'}}});
            } else if (url === URLMap.getSessionValidate(match.params.id)) {
                failureCallback({response : {data : {errorCode : 'ERROR'}}});
            } else {
                failureCallback();
            }
        });
        renderForm();
        expect(APIService.getRequest).toHaveBeenCalledTimes(1);
        expect(history.push).toHaveBeenCalledTimes(2);
        expect(dispatchAppNotification).toHaveBeenCalledTimes(1);
    });
});

describe('Fire API on load of shell with session validate failureCallback', () => {

    it("Fire API on shell with  session validate failure callback", () => {
        APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
            if (url === URLMap.getPortalData(match.params.id)) {
                failureCallback({response : {data : {errorCode : 'GENERIC_ERROR'}}});
            } else if (url === URLMap.getPortalMeta(['portals', match.params.id, 'pages'], 3, true, 'order', {"roles": [""]})) {
                failureCallback({response : {data : {errorCode : 'ERROR'}}});
            } else if (url === URLMap.getSessionValidate(match.params.id)) {
                success();
            } else {
                failureCallback();
            }
        });
        renderForm();
        expect(APIService.getRequest).toHaveBeenCalledTimes(3);
        expect(history.push).toHaveBeenCalledTimes(2);
        expect(dispatchAppNotification).toHaveBeenCalledTimes(3);
    });
});