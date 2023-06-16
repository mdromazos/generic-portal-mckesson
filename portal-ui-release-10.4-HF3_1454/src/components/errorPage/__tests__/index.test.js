import React from 'react';
import { StateContext } from '../../../context/stateContext';
import ErrorPage from '../index';
import { portalMetadataStore } from '../../__mocks__/portal-metadata';
import { render, cleanup } from '@testing-library/react';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';

afterEach(cleanup);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const { 123: portalSettings } = portalMetadataStore;
const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

const history = {
    push: jest.fn(String)
}

APIService.getRequest = jest.fn().mockImplementation((url, success, failureCallback) => {
    if (url === URLMap.getPortalData(match.params.id)) {
        success(portalSettings.generalSettings);
    } else if (url === URLMap.getSessionValidate(match.params.id)) {
        failureCallback();
    } else {
        success();
    }
});

const renderForm = () => render(
    <StateContext.Provider value={[{
        globalSettings: portalSettings.generalSettings,
        globalActions: { setPortalConfiguration: jest.fn() },
        notificationActions: { dispatchAppNotification: jest.fn() },
    }]}>
        <ErrorPage match={match} history={history}/>
    </StateContext.Provider>
);

describe('Examining the error page component', () => {

    it("Renders the error page properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('portal-error-container')).not.toBeNull();
        expect(getByTestId('portal-error-image')).not.toBeNull();
        expect(getByTestId('portal-error-heading')).not.toBeNull();
        expect(getByTestId('portal-error-content')).not.toBeNull();
        expect(getByTestId('portal-error-sub-content')).not.toBeNull();
    });

    it("Labels should be match with the respective text", () => {
        const {getByTestId } = renderForm();
        expect(getByTestId('portal-error-heading').textContent).toMatch("LABEL_PORTAL_NOT_AVAILABLE_HEADING");
        expect(getByTestId('portal-error-content').textContent).toMatch("LABEL_PORTAL_NOT_AVAILABLE_CONTENT");
        expect(getByTestId('portal-error-sub-content').textContent).toMatch("LABEL_PORTAL_NOT_AVAILABLE_SUB_CONTENT");
    });
});

describe('Fire API on load of error page', () => {
    it("Fire API on load of error page with proper parameters", () => {
        renderForm();
        expect(APIService.getRequest).toHaveBeenNthCalledWith(1, URLMap.getPortalData(match.params.id), 
            expect.any(Function), expect.any(Function), expect.any(Object)); 
        expect(APIService.getRequest).toHaveBeenNthCalledWith(2, URLMap.getSessionValidate(match.params.id),
            expect.any(Function), expect.any(Function), expect.any(Object));
    });
});