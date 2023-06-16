import React from 'react';
import Product360TaskView from '../index';
import { StateContext } from '../../../../context/stateContext';
import { render, cleanup } from '@testing-library/react';
import {component_data, match} from '../__mocks__/p360-taskView-data';
import APIService from '../../../../utils/apiService';
import {URLMap} from '../../../../utils/urlMappings';

afterEach(cleanup);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

APIService.postRequest = jest.fn().mockImplementation((url,payload, success) => {
    if (url === URLMap.getProduct360Token()) {
        success({token:{key: '123'}})
    } else {
        success({});
    }
});

const renderForm = () => render(
    <StateContext.Provider value={[{
        notificationActions: { dispatchAppNotification: jest.fn() }
    }]}>
        <Product360TaskView component={component_data} match={match}/>
    </StateContext.Provider>
);
describe('Rendering Portal Text component', () => {

    it("Renders Portal Text component properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('p360_task_timelime_card')).not.toBeNull();
    });

    it("Portal Text component Heading and body should match with the data", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('p360_task_timelime_card').textContent).toMatch(component_data.title);
    });
});

describe('Rendering Portal Text component without header and body', () => {
    it("Portal Text component Heading and body should match with the data", () => {
        renderForm();
        expect(APIService.postRequest).toHaveBeenNthCalledWith(1, URLMap.getProduct360Token(),
            { user: "",userType: "supplier_user",serverUrl: component_data.serverUrl },
            expect.any(Function), expect.any(Function), expect.any(Object)
        );
    });
});
