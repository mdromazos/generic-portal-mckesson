import React from 'react';
import ExternalLink from '../index';
import { StateContext } from '../../../../context/stateContext';
import { render, cleanup } from '@testing-library/react';
import { component_data, match, beData } from '../__mocks__/external-link-data';
import APIService from '../../../../utils/apiService';
import { URLMap } from '../../../../utils/urlMappings';

afterEach(cleanup);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

APIService.postRequest = jest.fn().mockImplementation((url,payload, success) => {
    if (url === URLMap.getProxy() && 
        payload.apiUrl  === URLMap.getBEData(match.params.orsId,"Supplier","")
    ) {
        success(beData);
    } else {
        success({});
    }
});

describe('Rendering Portal External link component', () => {

    const renderForm = () => render(
        <StateContext.Provider value={[{
            notificationActions : {dispatchAppNotification : {} }
        }]}>
            <ExternalLink component={component_data} match={match} beName={"Supplier"}/>
        </StateContext.Provider>
    );

    it("Renders Portal External link component properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('external__link__component')).not.toBeNull();
        expect(getByTestId('IFrame__container')).not.toBeNull();
    });

    it("Portal External link component title should match with the data", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('external__link__component').textContent).toMatch(component_data.title);
    });

    it("Fire API post request to fetch the BEData for IFrame", () => {
        expect(APIService.postRequest).toHaveBeenNthCalledWith(1, URLMap.getProxy(), 
            {   apiUrl : URLMap.getBEData(match.params.orsId,"Supplier",""),
                proxyAttribute:"",
                httpMethod:"GET"
            }, 
            expect.any(Function), expect.any(Function), expect.any(Object)
        );
    });
});
