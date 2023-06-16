import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import User from '../user';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom'
import { StateContext } from "../../../../context/stateContext";
import APIService from '../../../../utils/apiService';
import CONFIG  from '../../../../config/config';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('@informatica/archipelago-icons', () => ({
    home_icon: 'home_icon',
}));

const { ACTIONS, NOTIFICATION_TYPE } = CONFIG;

const dispatch = jest.fn();

const renderPage = () => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch,
            }}
        >
            <User />
        </StateContext.Provider>
    </Router>
);

describe('User', async () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });    
    it('should display error notification with error code returned from response when logout fails', async () => {
        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));   

        const { queryByTestId } = renderPage();

        const userButton = queryByTestId('user-menu-button');
        fireEvent.click(userButton);
        
        const logoutButton = queryByTestId('logout');
        fireEvent.click(logoutButton);

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_MESSAGE'
            }
        });        
    }, 30000);

    it('should display error notification with custom errror code when logout fails', async () => {
        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure) => failure({response: { data: {}}}));   

        const { queryByTestId } = renderPage();

        const userButton = queryByTestId('user-menu-button');
        fireEvent.click(userButton);
        
        const logoutButton = queryByTestId('logout');
        fireEvent.click(logoutButton);

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_GENERIC_MESSAGE'
            }
        });        
    }, 30000);
});
