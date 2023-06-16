import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PortalCardView from '../index';
import {
    fireEvent,
    render,
    wait
} from '@testing-library/react';
import { URLMap } from '../../../../utils/urlMappings';
import APIService from '../../../../utils/apiService';
import { StateContext } from "../../../../context/stateContext";
import CONFIG from "../../../../config/config";
import { saveAs } from 'file-saver';


const { PORTAL_STATUS_ACTION, PORTAL_STATUS, PORTAL_STATES, ACTIONS, NOTIFICATION_TYPE, FILE_TYPE: { ZIP, ZIP_FILE }, CONSTANTS } = CONFIG;

jest.mock('@informatica/archipelago-icons', () => ({
    error_icon: 'error_icon',
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('file-saver', () => ({
    saveAs: jest.fn(),
}));

const dispatch = jest.fn();
const defaultProps = {
    history: {
        push: jest.fn(),
    },
    portal: {
        portalId: 8,
        portalName: "portal 3",
        databaseId: "orcl-CMX_ORS",
        version: 5,
        state: PORTAL_STATES.PUBLISHED,
        status: PORTAL_STATUS.RUNNING,
        isDraft: false,
        hasPublished: true,
        createdBy: "admin",
        createdDate: "17 Jul 2019 17:29:03",
        lastUpdatedBy: "admin",
        lastUpdatedDate: "07 Aug 2019 14:38:26",
        hasSSO: true,
    },
    databaseLabel: "cmx_ors",
    discardDraftPortalRequest: jest.fn(),
    editPortalHandler: jest.fn(),
    deletePortalRequest: jest.fn(),
    portalActionHandler: jest.fn(),
};

const getFormattedDate = (date) => {
    let newDate = date.split(" ");
    newDate.pop();
    return newDate.join(" ");
};

const renderPage = (props) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch,
            }}
        >
            <PortalCardView
                {...props}
            />
        </StateContext.Provider>
    </Router>
);

describe('Portal card view component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should render the portal card with running portal details', async () => {
        const { container } = renderPage(defaultProps);
        await wait(() => {
            expect(container.querySelector('.d-card__header__title').textContent).toBe(defaultProps.portal.portalName);
            expect(container.querySelectorAll('td').length).toBe(4);
            expect(container.querySelectorAll('td')[0].textContent).toContain(defaultProps.databaseLabel);
            expect(container.querySelectorAll('td')[1].textContent).toContain(getFormattedDate(defaultProps.portal.lastUpdatedDate));
            expect(container.querySelectorAll('td')[2].textContent).toContain(defaultProps.portal.lastUpdatedBy);
            expect(container.querySelectorAll('td')[3].textContent).toContain('LABEL_PORTAL_STATUS_RUNNING');
        });
    }, 30000);

    it('Should render the portal card with stopped portal details', async () => {
        const newProps = {
            ...defaultProps,
            portal: {
                ...defaultProps.portal,
                status: PORTAL_STATUS.STOPPED,
            },
        };
        const { container } = renderPage(newProps);
        await wait(() => {
            expect(container.querySelectorAll('td').length).toBe(4);
            expect(container.querySelectorAll('td')[3].textContent).toContain('LABEL_PORTAL_STATUS_STOP');
        });
    }, 30000);

    it('Should render the portal card with drafted portal details', async () => {
        const newProps = {
            ...defaultProps,
            portal: {
                ...defaultProps.portal,
                state: PORTAL_STATES.DRAFT,
                status: PORTAL_STATUS.INVALID,
                isDraft: true,
                hasPublished: false,
            },
        };
        const { container } = renderPage(newProps);
        await wait(() => {
            expect(container.querySelectorAll('td').length).toBe(5);
            expect(container.querySelectorAll('td')[3].textContent).toContain('LABEL_INVALID_CONFIG');
            expect(container.querySelectorAll('td')[4].textContent).toContain('Draft');
        });
    }, 30000);

    it('Should call editPortalHandler with portal details when click on edit button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_EDIT'));
            expect(defaultProps.editPortalHandler).toHaveBeenCalledWith(defaultProps.portal);
        });
    }, 30000);

    it('Should call portalActionHandler with portal details and action type is START when click on Start button in the menu', async () => {
        const newProps = {
            ...defaultProps,
            portal: {
                ...defaultProps.portal,
                status: PORTAL_STATUS.STOPPED,
            },
        };
        const { container, getByText } = renderPage(newProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_START'));
            expect(defaultProps.portalActionHandler).toHaveBeenCalledWith(newProps.portal, PORTAL_STATUS_ACTION.START);
        });
    }, 30000);

    it('Should call portalActionHandler with portal details and action type is STOP when click on Stop button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_STOP'));
            expect(defaultProps.portalActionHandler).toHaveBeenCalledWith(defaultProps.portal, PORTAL_STATUS_ACTION.STOP);
        });
    }, 30000);

    it('Should copy the portal url to clipboard when click on the copy button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        document.execCommand = jest.fn();
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_COPY_URL'));
            expect(document.execCommand).toHaveBeenCalledWith('copy');
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: 'PORTAL_USER_ACTION_COPY_URL_MESSAGE'
                }
            });
        });
    }, 30000);

    it('Should navigate to runtime settings page when click on the runtime settings button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_RUNTIME_CONFIG'));
            expect(defaultProps.history.push).toHaveBeenCalledWith(URLMap.runtimeSettings(defaultProps.portal.databaseId,defaultProps.portal.portalId));
        });
    }, 30000);


    it('Should navigate to sso configuration page when click on the sso configuration button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('LABEL_SSO_CONFIGURATION'));
            expect(defaultProps.history.push).toHaveBeenCalledWith(URLMap.ssoSettings(defaultProps.portal.databaseId, defaultProps.portal.portalId));
        });
    }, 30000);

    it('Should download the language bunddle when get bundle is success while click on the export language bundle button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_LOCALIZATION'));
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success('blob data'));
        fireEvent.click(getByText('PORTAL_EXPORT_LANGUAGE_BUNDLE'));
        await wait(() => {
            let blob = new Blob(['blob data'], { type: ZIP_FILE});
            let fileName = `${defaultProps.portal.portalId}-${defaultProps.portal.databaseId}.${ZIP}`;
            expect(saveAs).toHaveBeenCalledWith(blob, fileName);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.INFO,
                    message: 'EXPORT_LANGUAGE_SUCCESS_MESSAGE'
                }
            });
        });
    }, 30000);

    it('Should dispatch error notification when get bundle is fail while click on the export language bundle button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_LOCALIZATION'));
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({
                response: {
                    data: {
                        errorCode: "ERROR_MESSAGE",
                    },
                },
            }));
        fireEvent.click(getByText('PORTAL_EXPORT_LANGUAGE_BUNDLE'));
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            });
        });
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_LOCALIZATION'));
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: {} } }));
        fireEvent.click(getByText('PORTAL_EXPORT_LANGUAGE_BUNDLE'));
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            });
        });
    }, 30000);

    it('Should download the portal data when get call for export portal is success while click on the export portal button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            APIService.getRequest = jest
                .fn()
                .mockImplementationOnce((url, success) => success('portal blob data'));
            fireEvent.click(getByText('PORTAL_USER_ACTION_EXPORT'));
        });
        await wait(() => {
            let blob = new Blob(['portal blob data'], { type: ZIP_FILE});
            let fileName = `${defaultProps.portal.portalId}-${defaultProps.portal.databaseId}.${ZIP}`;
            expect(saveAs).toHaveBeenCalledWith(blob, fileName);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.INFO,
                    message: 'PORTAL_USER_ACTION_EXPORT_MESSAGE'
                }
            });
        });
    }, 30000);

    it('Should dispatch error notification when get call for export portal is fail while click on the export portal button in the menu', async () => {
        const { container, getByText } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            APIService.getRequest = jest
                .fn()
                .mockImplementationOnce((url, success, failure) => failure({
                    response: {
                        data: {
                            errorCode: "ERROR_MESSAGE",
                        },
                    },
                }));
            fireEvent.click(getByText('PORTAL_USER_ACTION_EXPORT'));
        });
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            });
        });
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            APIService.getRequest = jest
                .fn()
                .mockImplementationOnce((url, success, failure) => failure({ response: { data: {} } }));
            fireEvent.click(getByText('PORTAL_USER_ACTION_EXPORT'));
        });
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            });
        });
    }, 30000);

    it('Should call discardDraftPortalRequest when click on the discard draft button in the menu', async () => {
        const newProps = {
            ...defaultProps,
            portal: {
                ...defaultProps.portal,
                state: PORTAL_STATES.DRAFT,
                status: PORTAL_STATUS.INVALID,
                isDraft: true,
                hasPublished: false,
            },
        };
        const { container, getByText, getByTestId } = renderPage(newProps);
        expect(container.querySelector('[data-testid="message-box-title"]')).toBeNull();
        fireEvent.click(container.querySelector('button'));
        fireEvent.click(getByText('PORTAL_USER_ACTION_DISCARD_DRAFT'));
        await wait(() => {
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(newProps.discardDraftPortalRequest).toHaveBeenCalledWith(newProps.portal);
        });
    }, 30000);

    it('Should delete the portal and call deletePortalRequest when delete portal call is success while click on Delete Portal button in the menu', async () => {
        const newProps = {
            ...defaultProps,
            portal: {
                ...defaultProps.portal,
                status: PORTAL_STATUS.STOPPED,
            },
        };
        const { container, getByText, getByTestId } = renderPage(newProps);
        expect(container.querySelector('[data-testid="message-box-title"]')).toBeNull();
        fireEvent.click(container.querySelector('button'));
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success());
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_DELETE'));
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(newProps.deletePortalRequest).toHaveBeenCalledWith(newProps.portal);
        });
    }, 30000);

    it('should call deletePortalRequest when soft delete failed and force delete success', async () => {
        const newProps = {
            ...defaultProps,
            portal: {
                ...defaultProps.portal,
                status: PORTAL_STATUS.STOPPED,
            },
        };
        const { container, getByText, getByTestId } = renderPage(newProps);
        expect(container.querySelector('[data-testid="message-box-title"]')).toBeNull();
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_DELETE'));
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: { errorCode: CONSTANTS.PORTAL_DRAFT_ERROR } } }));
        fireEvent.click(getByTestId('message-box-action-button'));
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success());
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(newProps.deletePortalRequest).toHaveBeenCalledWith(newProps.portal);
        });
    }, 30000);

    it('should dispatch error notification when soft delete failed and force delete fails', async () => {
        const newProps = {
            ...defaultProps,
            portal: {
                ...defaultProps.portal,
                status: PORTAL_STATUS.STOPPED,
            },
        };
        const { container, getByText, getByTestId } = renderPage(newProps);
        expect(container.querySelector('[data-testid="message-box-title"]')).toBeNull();
        fireEvent.click(container.querySelector('button'));
        await wait(() => {
            fireEvent.click(getByText('PORTAL_USER_ACTION_DELETE'));
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: { errorCode: CONSTANTS.PORTAL_DRAFT_ERROR } } }));
        fireEvent.click(getByTestId('message-box-action-button'));
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: {} } }));
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_DELETE_MESSAGE'
                }
            });
        });
    }, 30000);

    it('Should navigate to portal details page when click on the card body', async () => {
        const { container } = renderPage(defaultProps);
        fireEvent.click(container.querySelector('[data-testid="portal-card-detail-section"]'));
        expect(defaultProps.history.push).toHaveBeenCalledWith(URLMap.portalDetails(defaultProps.portal.databaseId,defaultProps.portal.portalId));
    }, 30000);
});
