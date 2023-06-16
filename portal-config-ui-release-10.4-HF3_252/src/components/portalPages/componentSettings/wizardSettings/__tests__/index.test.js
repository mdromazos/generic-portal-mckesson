import React from 'react';
import WizardSettings from '../index';
import { fireEvent, render } from '@testing-library/react';
import { StateContext } from '../../../../../context/stateContext';
import APIService from '../../../../../utils/apiService';
import CONFIG from "../../../../../config/config";
import { bevMetadata, bevNamesData } from '../../../../portals/portalView/userManagementForm/__mocks__/index';

const { ACTIONS, NOTIFICATION_TYPE } = CONFIG;

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <StateContext.Provider
        value={{
            state: { portalConfig: { generalSettings: { beName: 'CustomerOrg', databaseId: 'localhost-orcl-C360_ORS' } }},
            dispatch: props.dispatch
        }}
    >
        <WizardSettings
            {...props}
        />
    </StateContext.Provider>
);

describe('Component setting > wizard settings component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getBevNames request fails', async () => {
        const props = {
            dispatch: jest.fn(),
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "",
                }],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));
        renderComponent(props);
        expect(props.dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_MESSAGE'
            }
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        renderComponent(props);
        expect(props.dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_GENERIC_MESSAGE'
            }
        });
    }, 30000);

    it('getBevMetaData request fails', async () => {
        const props = {
            dispatch: jest.fn(),
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "",
                }],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));
        renderComponent(props);
        expect(props.dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_MESSAGE'
            }
        });
        jest.clearAllMocks();
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        renderComponent(props);
        expect(props.dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_GENERIC_MESSAGE'
            }
        });
    }, 30000);

    it('should not render the wizard wizard overview step when showOverview is false', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: false,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                },
                touched: {},
                errors: {},
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
                setFieldValue: jest.fn(),
                setFieldTouched: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header').querySelectorAll('button').length).toBe(1);
    });

    it('should render the wizard wizard overview step when showOverview is true', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                },
                touched: {},
                errors: {},
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
                setFieldValue: jest.fn(),
                setFieldTouched: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header').querySelectorAll('button').length).toBe(2);
    });

    it('should go to previous step when click on (<) button in the step heading', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "Title 1",
                },{
                    beFormComponent: {},
                    title: "Title 2",
                }],
            },
            updateWizardData: jest.fn(),
            stepIndex: 2,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                    steps: [{
                        beFormComponent: {},
                        title: "Title 1",
                    },{
                        beFormComponent: {},
                        title: "Title 2",
                    }],
                },
                touched: {},
                errors: {},
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header')).not.toBeNull();
        fireEvent.click(container.querySelector('.wizard__step__heading').querySelectorAll('button')[0]);
        expect(props.updateWizardData).toHaveBeenCalledWith({
            title: "Wizard",
            componentType: "WizardComponent",
            showOverview: true,
            overviewHeading: "overview Heading",
            overviewTitle: "overview Title",
            overviewBody: "overview Body",
            configName: "CustomerOrgPortalView",
            steps: [{
                beFormComponent: {},
                title: "Title 2",
            },{
                beFormComponent: {},
                title: "Title 1",
            }],
        }, 1);
    });

    it('should go to next step when click on (>) button in the step heading', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "Title 1",
                },{
                    beFormComponent: {},
                    title: "Title 2",
                }],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                    steps: [{
                        beFormComponent: {},
                        title: "Title 1",
                    },{
                        beFormComponent: {},
                        title: "Title 2",
                    }],
                },
                touched: {},
                errors: {},
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header')).not.toBeNull();
        fireEvent.click(container.querySelector('.wizard__step__heading').querySelectorAll('button')[1]);
        expect(props.updateWizardData).toHaveBeenCalledWith({
            title: "Wizard",
            componentType: "WizardComponent",
            showOverview: true,
            overviewHeading: "overview Heading",
            overviewTitle: "overview Title",
            overviewBody: "overview Body",
            configName: "CustomerOrgPortalView",
            steps: [{
                beFormComponent: {},
                title: "Title 2",
            },{
                beFormComponent: {},
                title: "Title 1",
            }],
        }, 2);
    });

    it('should delete the step when click on delete button in the step heading', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "Title 1",
                },{
                    beFormComponent: {},
                    title: "Title 2",
                }],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                    steps: [{
                        beFormComponent: {},
                        title: "Title 1",
                    },{
                        beFormComponent: {},
                        title: "Title 2",
                    }],
                },
                touched: {},
                errors: {},
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header')).not.toBeNull();
        fireEvent.click(container.querySelector('.wizard__step__heading').querySelectorAll('button')[2]);
        expect(props.updateWizardData).toHaveBeenCalledWith({
            title: "Wizard",
            componentType: "WizardComponent",
            showOverview: true,
            overviewHeading: "overview Heading",
            overviewTitle: "overview Title",
            overviewBody: "overview Body",
            configName: "CustomerOrgPortalView",
            steps: [{
                beFormComponent: {},
                title: "Title 2",
            }],
        }, 0);
    });

    it('should add new step when click on add step button', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                },
                touched: {},
                errors: {},
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container } = renderComponent(props);
        expect(container.querySelector('.wizard__step__header')).not.toBeNull();
        const buttons = container.querySelector('.wizard__add__step').querySelectorAll('button');
        expect(buttons.length).toBe(1);
        fireEvent.click(buttons[0]);
        expect(props.updateWizardData).toHaveBeenCalled();
    });

    it('should call the callback function with respective stepIndex when click on the step', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [{
                    beFormComponent: {},
                    title: "Title 1",
                },{
                    beFormComponent: {},
                    title: "Title 2",
                }],
            },
            updateWizardData: jest.fn(),
            stepIndex: 2,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                    steps: [{
                        beFormComponent: {},
                        title: "Title 1",
                    },{
                        beFormComponent: {},
                        title: "Title 2",
                    }],
                },
                touched: {},
                errors: {},
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container } = renderComponent(props);
        const buttons = container.querySelector('.wizard__step__header').querySelectorAll('button');
        expect(buttons.length).toBe(4);
        fireEvent.click(buttons[1]);
        expect(props.updateWizardData).toHaveBeenCalledWith(undefined, 1);
    });

    it('should call the callback function when form input changed by intraction', async () => {
        const props = {
            wizardData: {
                title: "Wizard",
                componentType: "WizardComponent",
                showOverview: true,
                overviewHeading: "overview Heading",
                overviewTitle: "overview Title",
                overviewBody: "overview Body",
                configName: "CustomerOrgPortalView",
                steps: [],
            },
            updateWizardData: jest.fn(),
            stepIndex: 1,
            setWizardCurrentStep: jest.fn(),
            formikProps: {
                values: {
                    title: "Wizard",
                    componentType: "WizardComponent",
                    showOverview: true,
                    overviewHeading: "overview Heading",
                    overviewTitle: "overview Title",
                    overviewBody: "overview Body",
                    configName: "CustomerOrgPortalView",
                },
                touched: {
                    associatedTaskType: true,
                    primaryAction: true,
                    configName: true,
                },
                errors: {
                    associatedTaskType: 'The field is required',
                    primaryAction: 'The field is required',
                    configName: 'The field is required',
                },
                handleChange: jest.fn(),
                handleBlur: jest.fn(),
                setFieldValue: jest.fn(),
                setFieldTouched: jest.fn(),
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container, getByTestId } = renderComponent(props);
        fireEvent.change(container.querySelectorAll('input[type="text"]')[0], { target: { value: 'value 1' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelectorAll('input[type="text"]')[0]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.change(container.querySelectorAll('input[type="text"]')[1], { target: { value: 'value 2' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelectorAll('input[type="text"]')[1]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.change(container.querySelectorAll('input[type="text"]')[2], { target: { value: 'value 3' }});
        expect(props.formikProps.handleChange).toHaveBeenCalled();
        fireEvent.blur(container.querySelectorAll('input[type="text"]')[2]);
        expect(props.formikProps.handleBlur).toHaveBeenCalled();
        fireEvent.click(container.querySelector('[data-testid="dropdown-button"]'));
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
        expect(props.updateWizardData).toHaveBeenCalled();
        fireEvent.blur(container.querySelector('[data-testid="dropdown-search"]'));
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[0]);
        expect(props.updateWizardData).toHaveBeenCalled();
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[1]);
    });
});