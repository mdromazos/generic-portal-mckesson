import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PageForm from '../index';
import { render, wait } from '@testing-library/react';
import { StateContext } from "../../../../../context/stateContext";
import { bevViews, portalConfigDefaultData, roles, states } from '../__mocks__';
import APIService from '../../../../../utils/apiService';
import CONFIG  from '../../../../../config/config';

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

const renderPage = ({
        formikProps,
        editMode = false,
        pageId= undefined,
        pageTypeHandler= jest.fn(),
        bevNameHandler= jest.fn(),
        portalConfig= portalConfigDefaultData,
    } = {}) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch,
                state: {
                    portalConfig,
                }
            }}
        >
            <PageForm
                formikProps={formikProps}
                editMode={editMode}
                pageId={pageId}
                pageTypeHandler={pageTypeHandler}
                bevNameHandler={bevNameHandler}
            />
        </StateContext.Provider>
    </Router>
);

describe('Page Form', async () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });    
    it('should getDatabase request success', async () => {
        const formikProps = {
            setFieldTouched: jest.fn(),
            values: {
                name: "test",
                type: "Record Page",
                roles: ['Customer Administrators'],
                states: ['Active'],
                bevName: 'CustomerOrgPortalView',
                isReadOnly: true,        
            },
            touched: {
                name: true,
                type: true,
                roles: true,
                states: true,
                bevName: true,
                isReadOnly: true,
            },
            errors: {},
        };

        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevViews))
            .mockImplementationOnce((url, success) => success(roles))
            .mockImplementationOnce((url, success) => success(states))        

        renderPage({ formikProps });
    }, 30000);

    it('request should fail with notifictaion with error code', async () => {
        const formikProps = {
            setFieldTouched: jest.fn(),
            values: {},
            touched: {},
            errors: {},
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE 1' }}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE 2' }}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE 3' }}}))

        renderPage({ formikProps });
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE 1'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE 2'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE 3'
                }
            });
        });
    }, 30000); 
    
    it('request should fail with notifictaion when there is no error code', async () => {
        const formikProps = {
            setFieldTouched: jest.fn(),
            values: {},
            touched: {},
            errors: {},
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}))

        renderPage({ formikProps });
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            });
        });
    }, 30000);

    it('should display corresponding errors', async () => {
        const formikProps = {
            setFieldTouched: jest.fn(),
            values: {
                type: 'Record Page'
            },
            touched: {
                name: true,
                bevName : true,
                states: true,
                roles: true,
                type: true,
            },
            errors: {
                name: 'Name is required',
                type: 'Select type',
                bevName: 'Select bevname'
            },
        };

        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevViews))
            .mockImplementationOnce((url, success) => success(roles))
            .mockImplementationOnce((url, success) => success(states))        

        const { container } = renderPage({ formikProps });
        
        await wait(() => {
            expect(container.querySelectorAll('.form-error').length).toBe(3);
        });
    }, 30000)
});
