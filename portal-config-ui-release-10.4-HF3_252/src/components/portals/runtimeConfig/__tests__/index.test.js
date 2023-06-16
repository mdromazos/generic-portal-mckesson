import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RuntimeConfig from '../index';
import { fireEvent, render, wait } from '@testing-library/react';
import { URLMap } from '../../../../utils/urlMappings';
import APIService from '../../../../utils/apiService';
import { StateContext } from "../../../../context/stateContext";
import { initialState } from "../../../../context/stateContext";
import { match, runtimeConfiguration, runtimeConfigurationWithoutPasswordSection } from "../__mocks__/index";
import CONFIG from "../../../../config/config";

const { ACTIONS, NOTIFICATION_TYPE } = CONFIG;

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
                state: { ...initialState, 
                    portalConfigMap: {
                        "localhost-orcl-C360_ORS__2": {
                            name: "Customer 360 Portal",
                        },
                    },
                    portalConfig: {
                        generalSettings: {
                            isExternalUserManagementEnabled: props.isExternalUserManagementEnabled,
                        }
                    }
                },
            }}
        >
            <RuntimeConfig match={match} history={props.history} />
        </StateContext.Provider>
    </Router>
);

describe('Runtime Configuration component', () => {
    it("Renders the run time config form once runtime configuration is fetched successfully", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => success(runtimeConfiguration));
        const { container, getByTestId } = renderPage(props);
        await wait(() => {
            expect(APIService.getRequest).toHaveBeenCalled();
            expect(getByTestId('runtime-save-button')).toBeDefined();
            expect(dispatch).toHaveBeenCalledWith({
                currentPage: {
                    icon: "/icons/runtime_environments.svg",
                    id: "LABEL_RUNTIME_CONFIG_localhost-orcl-C360_ORS_2",
                    label: ["Customer 360 Portal", "LABEL_RUNTIME_CONFIG"],
                    type: "LABEL_RUNTIME_CONFIG",
                    url: "/portals/localhost-orcl-C360_ORS/2/runtime"
                },
                type: "SET_CURRENT_PAGE_SETTINGS"
            });
            const RuntimeSections = container.querySelectorAll('[data-testid="runtime-config-section"]');
            expect(RuntimeSections.length).toBe(3);
            expect(RuntimeSections[0].querySelectorAll('#runtime-config-section-form-group').length).toBe(2);
            expect(RuntimeSections[1].querySelectorAll('#runtime-config-section-form-group').length).toBe(2);
            expect(RuntimeSections[2].querySelectorAll('#runtime-config-section-form-group').length).toBe(1);
            expect(container.querySelector('[data-testid="message-box-title"]')).toBeNull();
        });
    }, 30000);

    it("Render the error when the form field is cleared", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => success(runtimeConfiguration));
        const { container, getByTestId } = renderPage(props);
        expect(container.querySelector('.username-field-error')).toBeNull();
        await wait(() => {
            fireEvent.change(
                container
                    .querySelector('[data-testid="runtime-config-section"]')
                    .querySelectorAll('#runtime-config-section-form-group')[0],
                { target: { value: null },
            });
            fireEvent.click(getByTestId('runtime-save-button'));
        });
        await wait(() => {
            expect(container.querySelector('.username-field-error')).not.toBeNull();
        });
    }, 30000);

    it("Dispatch the success notification action when runtime configuration updated successfully", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
            isExternalUserManagementEnabled: true,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => success(runtimeConfigurationWithoutPasswordSection));
        const { container, getByTestId } = renderPage(props);
        await wait(() => {
            fireEvent.change(
                container
                    .querySelector('[data-testid="runtime-config-section"]')
                    .querySelectorAll('#runtime-config-section-form-group')[0],
                { target: { value: 125 },
            });
            fireEvent.click(getByTestId('runtime-save-button'));
        });
        await wait(() => {
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        APIService.putRequest = jest
            .fn()
            .mockImplementationOnce((url, formValues, success, failure, other) => success());
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(APIService.putRequest).toHaveBeenCalled();
            expect(push).toHaveBeenCalledWith(URLMap.portals());
            expect(dispatch).toHaveBeenCalledWith({
                pageSettings: {
                    icon: "/icons/runtime_environments.svg",
                    id: "LABEL_RUNTIME_CONFIG_localhost-orcl-C360_ORS_2",
                    label: ["Customer 360 Portal", "LABEL_RUNTIME_CONFIG"],
                    type: "LABEL_RUNTIME_CONFIG",
                    url: "/portals/localhost-orcl-C360_ORS/2/runtime"
                },
                type: ACTIONS.REMOVE_PAGE_SETTINGS,
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: "RUNTIME_CONFIG_SUCCESS_MESSAGE",
                },
            });
        });
    }, 30000);

    it("Dispatch the error notification action when runtime configuration update is failed", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => success(runtimeConfiguration));
        const { container, getByTestId } = renderPage(props);
        await wait(() => {
            fireEvent.change(
                container
                    .querySelector('[data-testid="runtime-config-section"]')
                    .querySelectorAll('#runtime-config-section-form-group')[0],
                { target: { value: 125 },
            });
            fireEvent.click(getByTestId('runtime-save-button'));
        });
        await wait(() => {
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        APIService.putRequest = jest
            .fn()
            .mockImplementationOnce((url, formValues, success, failure, other) => failure({ response: { data: {}}}));
        fireEvent.click(getByTestId('message-box-action-button'));
        await wait(() => {
            expect(APIService.putRequest).toHaveBeenCalled();
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: "RUNTIME_CONFIG_ERROR_MESSAGE",
                },
            });
        });
    }, 30000);

    it("Dispatch the error notification action when fail to fetch runtime configuration", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => failure({ response: { data: { errorCode: 'RUNTIME_CONFIG_ERROR_MESSAGE' }}}));
        const { getByTestId } = renderPage(props);
        await wait(() => {
            expect(APIService.getRequest).toHaveBeenCalled();
            expect(getByTestId('runtime-save-button')).toBeDefined();
            expect(dispatch).toHaveBeenCalledWith({
                currentPage: {
                    icon: "/icons/runtime_environments.svg",
                    id: "LABEL_RUNTIME_CONFIG_localhost-orcl-C360_ORS_2",
                    label: ["Customer 360 Portal", "LABEL_RUNTIME_CONFIG"],
                    type: "LABEL_RUNTIME_CONFIG",
                    url: "/portals/localhost-orcl-C360_ORS/2/runtime"
                },
                type: "SET_CURRENT_PAGE_SETTINGS"
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: "RUNTIME_CONFIG_ERROR_MESSAGE",
                },
            });
        });
    }, 30000);
});
