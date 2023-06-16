import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignupForm from '../index';
import { fireEvent, render, wait } from '@testing-library/react';
import APIService from '../../../../../utils/apiService';
import { StateContext } from "../../../../../context/stateContext";
import CONFIG from "../../../../../config/config";
import { bevMetadata, portalRolesData, portalStatesData } from '../../userManagementForm/__mocks__/index';

const { ACTIONS, NOTIFICATION_TYPE } = CONFIG;

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('lodash/cloneDeep', (value) => value);

const dispatch = jest.fn();

const commonProps = {
    onChange: jest.fn(),
    onBlur: jest.fn(),
};

const handleBlur = jest.fn();
const handleChange = jest.fn();
const beDataCallBack = jest.fn();
const formDataCallBack = jest.fn();
const formDataProp = {};

const renderPage = (props) => render(
    <Router>
        <StateContext.Provider
            value={{ dispatch }}
        >
            <SignupForm
                isEdit={props.isEdit}
                formikProps={props.formikProps}
                commonProps={commonProps}
                handleBlur={handleBlur}
                handleChange={handleChange}
                beDataCallBack={beDataCallBack}
                formDataProp={formDataProp}
                formDataCallBack={formDataCallBack}
                setActiveStep={jest.fn()}
            />
        </StateContext.Provider>
    </Router>
);

describe('Signup Form component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getBevMetadata request fails', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                    },
                    signup: {},
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            })
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));
        renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            })
        });
    }, 30000);

    it('getRoleStates request fails', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    roleSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                    },
                    signup: {},
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            })
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));
        renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            })
        });
    }, 30000);

    it('getPortalStates request fails', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    isStateEnabled: true,
                    stateSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                        filterFieldName: 'filterFieldName',
                        filterFieldValue: 'filterFieldValue',
                    },
                    signup: {},
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            })
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));
        renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            })
        });
    }, 30000);

    it('switch between tabs', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                        hasSameEmailAndUsername: true,
                        createAdditionalUsers: true,
                        fieldMapping: {
                            manyRowId: 'Contacts',
                        },
                    },
                    roleSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                    },
                    isStateEnabled: true,
                    stateSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                        filterFieldName: 'filterFieldName',
                        filterFieldValue: 'filterFieldValue',
                    },
                    signup: {},
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(container.querySelector('.tabs__section').children.length).toBe(2);
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('LABEL_PAGE_DETAILS_SIGNUP_PAGE');
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('LABEL_LAYOUT_SIGNUP_PAGE');
        fireEvent.click(container.querySelector('.tabs__section').children[0]);
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('LABEL_PAGE_DETAILS_SIGNUP_PAGE');
    }, 30000);

    it('shouldn\'t render the signup form when disableSignup is true', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                        hasSameEmailAndUsername: true,
                        createAdditionalUsers: true,
                        fieldMapping: {
                            manyRowId: 'Contacts',
                        },
                    },
                    roleSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                    },
                    isStateEnabled: true,
                    stateSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                        filterFieldName: 'filterFieldName',
                        filterFieldValue: 'filterFieldValue',
                    },
                    signup: {},
                    disableSignup: true,
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(container.querySelector('.tabs__section')).toBeNull();
        fireEvent.click(container.querySelector('input[type="checkbox"]'));
        expect(container.querySelector('.tabs__section').children.length).toBe(2);
        expect(container.querySelectorAll('.form__group').length).toBe(9);
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        expect(container.querySelectorAll('.beFormBuilder__component__container').length).toBe(1);
    }, 30000);

    it('renders corresponding error message when errors object found in formikProps', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                        hasSameEmailAndUsername: true,
                        createAdditionalUsers: true,
                        fieldMapping: {
                            manyRowId: 'Contacts',
                        },
                    },
                    roleSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                    },
                    isStateEnabled: true,
                    stateSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                        filterFieldName: 'filterFieldName',
                        filterFieldValue: 'filterFieldValue',
                    },
                    signup: {},
                },
                touched: {
                    signup: {
                        bevName: true,
                        userRole: true,
                        userState: true,
                    },
                },
                errors: {
                    signup: {
                        bevName: "Field is Required",
                        userRole: "Fied is required",
                        userState: "Fied is required",
                    },
                },
            }
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(container.querySelectorAll('.form-error').length).toBe(3);
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        expect(container.querySelectorAll('.form-error').length).toBe(0);
    }, 30000);

    it('shoud renders the value in corresponding field from formikProps', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                        hasSameEmailAndUsername: true,
                        createAdditionalUsers: true,
                        fieldMapping: {
                            manyRowId: 'Contacts',
                        },
                    },
                    roleSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                    },
                    isStateEnabled: true,
                    stateSettings: {
                        referenceEntity: 'referenceEntity',
                        fieldName: 'fieldName',
                        filterFieldName: 'filterFieldName',
                        filterFieldValue: 'filterFieldValue',
                    },
                    disableSignup: false,
                    signup: {
                        backgroundImage: 'http://<host>:<port>/portal-ui/images/signup.jpg',
                        title: 'Sign Up Form',
                        welcomeText: 'Fill in the fields to create a customer account.',
                        bevName: 'CustomerOrgRegistrationView',
                        userRole: 'portal role 1',
                        userState: 'portal state 1',
                        maxColumns: 2,
                        registrationEmailTemplate: 'OnboardingRegistration',
                    },
                },
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(
            container.querySelector('input[name="signup.backgroundImage"]').value
        ).toBe(props.formikProps.values.signup.backgroundImage);
        expect(
            container.querySelector('input[name="signup.title"]').value
        ).toBe(props.formikProps.values.signup.title);
        expect(
            container.querySelector('input[name="signup.welcomeText"]').value
        ).toBe(props.formikProps.values.signup.welcomeText);
        expect(
            container.querySelector('input[name="signup.bevName"]').value
        ).toBe(props.formikProps.values.signup.bevName);
        expect(
            container.querySelector('input[name="signup.userRole"]').value
        ).toBe(props.formikProps.values.signup.userRole);
        expect(
            container.querySelector('input[name="signup.userState"]').value
        ).toBe(props.formikProps.values.signup.userState);
        expect(
            container.querySelector('input[name="signup.maxColumns"]').value
        ).toBe(props.formikProps.values.signup.maxColumns.toString());
        expect(
            container.querySelector('input[name="signup.registrationEmailTemplate"]').value
        ).toBe(props.formikProps.values.signup.registrationEmailTemplate);
        expect(
            container.querySelector('input[name="disableSignup"]').checked
        ).toBe(props.formikProps.values.disableSignup);
    }, 30000);
});
