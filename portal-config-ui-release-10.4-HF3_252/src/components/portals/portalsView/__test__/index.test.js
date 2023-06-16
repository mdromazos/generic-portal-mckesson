import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PortalsView from '../index';
import { fireEvent, render, wait } from '@testing-library/react';
import { URLMap } from '../../../../utils/urlMappings';
import APIService from '../../../../utils/apiService';
import { StateContext } from "../../../../context/stateContext";
import { dbData, portalConfigMap, portalsData } from "../__mocks__/index";
import CONFIG from "../../../../config/config";
import { generateViewId } from "../../../../utils/utilityService";

const { ACTIONS, PAGES, NOTIFICATION_TYPE } = CONFIG;

jest.mock('@informatica/archipelago-icons', () => ({
    home_icon: 'home_icon',
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderPage = (props) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch: props.dispatch,
            }}
        >
            <PortalsView history={props.history} />
        </StateContext.Provider>
    </Router>
);

describe('Portals View component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should render list of portal when able to fetch all portals', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(portalsData));
        const { container } = renderPage(props);
        await wait(() => {
            expect(APIService.getRequest).toHaveBeenCalledTimes(2);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
                currentPage: {
                    label: [PAGES.HOME],
                    type: PAGES.HOME,
                    url: URLMap.portals(),
                    icon: "home_icon",
                    id: PAGES.HOME
                }
            });
            expect(dispatch).toHaveBeenCalledWith(portalConfigMap);
            expect(container.querySelector('.no__portal__message')).toBeNull();
            expect(container.querySelectorAll('.card_section').length).toBe(3);
        });
    }, 30000);
    
    it('Should render no portal message section when no portals found while fetching', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success([]));
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelector('.no__portal__message')).not.toBeNull();
            expect(APIService.getRequest).toHaveBeenCalledTimes(2);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
                currentPage: {
                    label: [PAGES.HOME],
                    type: PAGES.HOME,
                    url: URLMap.portals(),
                    icon: "home_icon",
                    id: PAGES.HOME
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                portalConfigMap: {},
                portals: [],
                type: "CREATE_PORTAL_CONFIG_MAP"
            });
        });
    }, 30000);
    
    it('Should dispatch an error notification action when failed to fetch database', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({
                response: {
                    data: {
                        errorCode: "ERROR_MESSAGE",
                    },
                },
            }));
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelector('.no__portal__message')).not.toBeNull();
            expect(APIService.getRequest).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
                currentPage: {
                    label: [PAGES.HOME],
                    type: PAGES.HOME,
                    url: URLMap.portals(),
                    icon: "home_icon",
                    id: PAGES.HOME
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            });
        });
    }, 30000);
    
    it('Should dispatch an error notification action when failed to fetch portal details', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success, failure) => failure({
                response: {
                    data: {},
                },
            }));
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelector('.no__portal__message')).not.toBeNull();
            expect(APIService.getRequest).toHaveBeenCalledTimes(2);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
                currentPage: {
                    label: [PAGES.HOME],
                    type: PAGES.HOME,
                    url: URLMap.portals(),
                    icon: "home_icon",
                    id: PAGES.HOME
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

    it('Should redirect to portal edit page when click on edit button in menu', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(portalsData));
        const { container, getByText } = renderPage(props);
        fireEvent.click(container.querySelectorAll('.card_section')[1].querySelector('.aicon__action_menu'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_EDIT'));
            expect(push).toHaveBeenCalledWith(URLMap.portalDetails(portalsData[1].databaseId, portalsData[1].portalId));
        });
    }, 30000);

    it('portal action success', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(portalsData))
            .mockImplementationOnce((url, success) => success(portalsData));
        const { container, getByText } = renderPage(props);
        fireEvent.click(container.querySelectorAll('.card_section')[1].querySelector('.aicon__action_menu'));
        APIService.putRequest = jest
            .fn()
            .mockImplementationOnce((url, {}, success) => success());
        expect(getByText('PORTAL_USER_ACTION_START')).toBeDefined();
        fireEvent.click(getByText('PORTAL_USER_ACTION_START'));
        await wait(() => {
            expect(APIService.getRequest).toHaveBeenCalledTimes(3);
            expect(dispatch).toHaveBeenCalledWith(portalConfigMap);
            expect(container.querySelectorAll('.card_section').length).toBe(3);
        });
    }, 30000);

    it('portal action failed', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(portalsData));
        const { container, getByText } = renderPage(props);
        fireEvent.click(container.querySelectorAll('.card_section')[1].querySelector('.aicon__action_menu'));
        APIService.putRequest = jest
            .fn()
            .mockImplementationOnce((url, {}, success, failure) => failure({ response: { data: {}}}));
        expect(getByText('PORTAL_USER_ACTION_START')).toBeDefined();
        fireEvent.click(getByText('PORTAL_USER_ACTION_START'));
        await wait(() => {
            expect(APIService.getRequest).toHaveBeenCalledTimes(2);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            });
        });
    }, 30000);
    
    it('drafted portal discard success', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(portalsData));
        const { container, getByText, getByTestId } = renderPage(props);
        fireEvent.click(container.querySelectorAll('.card_section')[0].querySelector('button'));
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success());
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => {
                const newPortalsData = JSON.parse(JSON.stringify(portalsData));
                newPortalsData.shift();
                success(newPortalsData);
            });
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_DISCARD_DRAFT'));
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: 'LABEL_DISCARD_DRAFT_SUCCESS'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
                pageSettings: {
                    type: PAGES.EDIT_PORTAL,
                    id: generateViewId(PAGES.EDIT_PORTAL, portalsData[0].databaseId, portalsData[0].portalId)
                }
            });
            expect(APIService.getRequest).toHaveBeenCalledTimes(1);
            expect(container.querySelectorAll('.card_section').length).toBe(2);
        });
    }, 30000);
    
    it('drafted portal discard success', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(portalsData));
        const { container, getByText, getByTestId } = renderPage(props);
        fireEvent.click(container.querySelectorAll('.card_section')[0].querySelector('button'));
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: {} } }));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_DISCARD_DRAFT'));
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_DELETE_MESSAGE'
                }
            });
            expect(container.querySelectorAll('.card_section').length).toBe(3);
        });
        fireEvent.click(container.querySelectorAll('.card_section')[0].querySelector('button'));
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: { errorCode: 'DELETE_PORTAL_ERROR' } } }));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_DISCARD_DRAFT'));
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'DELETE_PORTAL_ERROR'
                }
            });
            expect(container.querySelectorAll('.card_section').length).toBe(3);
        });
    }, 30000);
    
    it('delete portal success', async () => {
        const push = jest.fn();
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(portalsData));
        const { container, getByText, getByTestId } = renderPage(props);
        fireEvent.click(container.querySelectorAll('.card_section')[1].querySelector('button'));
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success());
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => {
                const newPortalsData = JSON.parse(JSON.stringify(portalsData));
                newPortalsData.shift();
                success(newPortalsData);
            });
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_DELETE'));
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: 'LABEL_DELETE_SUCCESS_MESSAGE'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
                pageSettings: {
                    type: PAGES.EDIT_PORTAL,
                    id: generateViewId(PAGES.EDIT_PORTAL, portalsData[1].databaseId, portalsData[1].portalId)
                }
            });
            expect(APIService.getRequest).toHaveBeenCalledTimes(1);
            expect(container.querySelectorAll('.card_section').length).toBe(2);
        });
    }, 30000);
});
