import React from 'react';
import { StateContext } from '../../../../context/stateContext';
import PortalBody from '../index';
import { render } from '@testing-library/react';

jest.mock('../../portalWorkspace', () => () => 'portalWorkspace');
jest.mock('../../portalNavigator', () => () => 'portalNavigator');

const appNotification = [
    {
        type: 'warning',
        message: 'sample warning'
    }
];

describe('Testing the portal body component', () => {
    
    const match = {
        url: "http:localhost:8080/portal-ui/",
        params: {
            pageId: '10',
            id: '1',
            orsId: 'orcl-localhost-Supplier'
        }
    };

    const renderForm = () => render(
        <StateContext.Provider value={[{
            notificationActions: { removeAppNotification: {} },
            appNotification: appNotification
        }]}>
            <PortalBody match={match} />
        </StateContext.Provider>);

    it("Render the portal body properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('portal__body')).not.toBeNull();
    });

    it("Renders the message bubble and message properly", () => {
        const { queryAllByTestId, getByTestId } = renderForm();
        expect(queryAllByTestId('message_bubble').length).toStrictEqual(1);
        expect(queryAllByTestId('message_bubble_message').length).toStrictEqual(1);
        expect(getByTestId('message_bubble_message').textContent).toMatch(appNotification[0].message);
    });

});