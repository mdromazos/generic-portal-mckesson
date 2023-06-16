import React from 'react';
import Product360Catalog from '../index';
import { StateContext } from '../../../../context/stateContext';
import { render, cleanup } from '@testing-library/react';
import {component_data, match, catalogOptions} from '../__mocks__/p360-catalog-data';
import APIService from '../../../../utils/apiService';
import {URLMap} from '../../../../utils/urlMappings';

afterEach(cleanup);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

APIService.postRequest = jest.fn().mockImplementation((url,payload, success) => {
    if (url === URLMap.getProduct360Token()) {
        success({token:{key: '123'}})
    } else if(url === URLMap.findCatalog()) {
        success(catalogOptions);
    } else {
        success({});
    }
});

const renderForm = () => render(
    <StateContext.Provider value={[{
        notificationActions: { dispatchAppNotification: jest.fn() }
    }]}>
        <Product360Catalog component={component_data} match={match}/>
    </StateContext.Provider>
);
describe('Rendering Portal Text component', () => {

    it("Renders Portal Text component properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('product360_catalog')).not.toBeNull();
        expect(getByTestId('product360_catalog__dropdown')).not.toBeNull();
    });

    it("Portal Text component Heading and body should match with the data", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('product360_catalog').textContent).toMatch(component_data.title);
    });
});

describe('Rendering Portal Text component without header and body', () => {
    it("Portal Text component Heading and body should match with the data", () => {
        renderForm();
        expect(APIService.postRequest).toHaveBeenNthCalledWith(1, URLMap.getProduct360Token(),
            { user: "",userType: "supplier_user",serverUrl: component_data.serverUrl },
            expect.any(Function), expect.any(Function), expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(2, URLMap.findCatalog(),
            { user: component_data.user,userType: "portal_admin_user",serverUrl: component_data.serverUrl,externalid: "" },
            expect.any(Function), expect.any(Function), expect.any(Object)
        );
    });
});
