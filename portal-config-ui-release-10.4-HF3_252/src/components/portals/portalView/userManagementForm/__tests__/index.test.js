import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import UserManagementForm from '../index';
import { fireEvent, render, wait } from '@testing-library/react';
import APIService from '../../../../../utils/apiService';
import { StateContext } from "../../../../../context/stateContext";
import CONFIG from "../../../../../config/config";
import { bevMetadata, bevNamesData, portalRolesData, portalStatesData } from '../__mocks__/index';

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

const renderPage = (props) => render(
    <Router>
        <StateContext.Provider
            value={{ dispatch }}
        >
            <UserManagementForm
                isEdit={props.isEdit}
                formikProps={props.formikProps}
                commonProps={commonProps}
                handleBlur={handleBlur}
                handleChange={handleChange}
                setActiveStep={jest.fn()}
            />
        </StateContext.Provider>
    </Router>
);

describe('Usermanagement Form component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getBevNames request fails', async () => {
        const props = {
            formikProps: {
                values: {},
                touched: {},
                errors: {},
            },
        };
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
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_FETCHING_BEV_NAME'
                }
            })
        });
    }, 30000);

    it('getBevMetadata request fails', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                        hasSameEmailAndUsername: true,
                        createAdditionalUsers: true,
                    },
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
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
            .mockImplementationOnce((url, success) => success(bevNamesData))
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

    it('getPortalRoles request fails', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    roleSettings: {
                        referenceEntity: 'referenceEntity',
                    },
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
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
            .mockImplementationOnce((url, success) => success(bevNamesData))
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
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
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
            .mockImplementationOnce((url, success) => success(bevNamesData))
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

    it('toggle additional users tab based on createAdditionalUsers checkbox vaues', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
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
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(container.querySelector('.tabs__section').children.length).toBe(1);
        expect(container.querySelector('.tabs__section').children[0].textContent).toBe('LABEL_FIELD_MAPPING');
        fireEvent.click(container.querySelector('input[type="checkbox"]'));
        expect(handleChange).toHaveBeenCalledWith('userManagement.createAdditionalUsers', true);
        expect(handleBlur).toHaveBeenCalledWith('userManagement.createAdditionalUsers');
        expect(container.querySelector('.tabs__section').children.length).toBe(2);
        expect(container.querySelector('.tabs__section').children[0].textContent).toBe('LABEL_FIELD_MAPPING');
        expect(container.querySelector('.tabs__section').children[1].textContent).toBe('LABEL_USER_CREATION_FORM');
    }, 30000);

    it('hasSameEmailAndUsername checkbox change', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
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
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[1]);
        expect(handleChange).toHaveBeenCalledWith('userManagement.hasSameEmailAndUsername', true);
        expect(handleBlur).toHaveBeenCalledWith('userManagement.hasSameEmailAndUsername');
    }, 30000);

    it('business entity view change', async () => {
        const props = {
            formikProps: {
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                        hasSameEmailAndUsername: true,
                        createAdditionalUsers: false,
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
                    signup: {
                        bevName: '',
                    },
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container, getByTestId } = renderPage(props);
        const dropdown_buttons = container.querySelectorAll('[data-testid="dropdown-button"]');
        fireEvent.click(dropdown_buttons[0]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
        expect(handleChange).toHaveBeenCalledWith('userManagement.bevName', 'CustomerOrgView');
        fireEvent.blur(container.querySelector('[data-testid="dropdown-search"]'));
        expect(handleBlur).toHaveBeenCalledWith('userManagement.bevName');
        fireEvent.click(dropdown_buttons[1]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
        fireEvent.blur(container.querySelectorAll('[data-testid="dropdown-search"]')[1]);
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
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(container.querySelector('.tabs__section').children.length).toBe(2);
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('LABEL_FIELD_MAPPING');
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('LABEL_USER_CREATION_FORM');
        fireEvent.click(container.querySelector('.tabs__section').children[0]);
        expect(container.querySelector('[aria-current="page"]').textContent).toBe('LABEL_FIELD_MAPPING');
    }, 30000);

    it('hide user roe field checkbox change', async () => {
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
                    signup: {
                        bevName: '',
                    },
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container, getByTestId } = renderPage(props);
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        fireEvent.click(container.querySelector('input[type="checkbox"]'));
        expect(handleChange).toHaveBeenCalledWith('userManagement.hasUserRole', true);
        expect(handleBlur).toHaveBeenCalledWith('userManagement.hasUserRole');
    }, 30000);

    it('user role change', async () => {
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
                    signup: {
                        bevName: '',
                    },
                },
                touched: {},
                errors: {},
                setFieldValue: jest.fn(),
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container, getByTestId } = renderPage(props);
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        fireEvent.click(container.querySelectorAll('[data-testid="dropdown-button"]')[0]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
        fireEvent.click(container.querySelectorAll('[data-testid="dropdown-button"]')[0]);
        fireEvent.blur(container.querySelectorAll('[data-testid="dropdown-search"]')[0]);
    }, 30000);

    it('user state change', async () => {
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
                    signup: {
                        bevName: '',
                    },
                },
                touched: {},
                errors: {},
                setFieldValue: jest.fn(),
            },
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData))
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container, getByTestId } = renderPage(props);
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        fireEvent.click(container.querySelectorAll('[data-testid="dropdown-button"]')[1]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
        fireEvent.click(container.querySelectorAll('[data-testid="dropdown-button"]')[1]);
        fireEvent.blur(container.querySelectorAll('[data-testid="dropdown-search"]')[1]);
    }, 30000);

    it('renders corresponding error message when errors object found in formikProps', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
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
                },
                touched: {
                    userManagement: {
                        bevName: true,
                        fieldMapping: {
                            manyRowId: true,
                            userRole: {
                                code: true,
                            },
                            email: {
                                code: true,
                            },
                            userName: {
                                code: true,
                            },
                            firstName: {
                                code: true,
                            },
                            lastName: {
                                code: true,
                            },
                            userState: {
                                code: true,
                            },
                            portalAssociation: {
                                code: true,
                            },
                        },
                        userRoles: true,
                        userStates: true,
                    },
                },
                errors: {
                    userManagement: {
                        bevName: "Field is Required",
                        fieldMapping: {
                            manyRowId: "Field is Required",
                            userRole: {
                                code: "Field is Required",
                            },
                            email: {
                                code: "Field is Required",
                            },
                            userName: {
                                code: "Field is Required",
                            },
                            firstName: {
                                code: "Field is Required",
                            },
                            lastName: {
                                code: "Field is Required",
                            },
                            userState: {
                                code: "Field is Required",
                            },
                            portalAssociation: {
                                code: "Field is Required",
                            },
                        },
                        userRoles: "Fied is required",
                        userStates: "Fied is required",
                    },
                },
            }
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(container.querySelectorAll('.form-error').length).toBe(9);
        fireEvent.click(container.querySelector('.tabs__section').children[1]);
        expect(container.querySelectorAll('.form-error').length).toBe(2);
    }, 30000);

    it('shoud renders the value in corresponding field from formikProps', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    userManagement: {
                        bevName: 'CustomerOrgRegistrationView',
                        createAdditionalUsers: true,
                        fieldMapping: {
                            manyRowId: 'Contacts',
                            userRole: {
                                code: 'prtlUsrRle',
                            },
                            email: {
                                code: 'emailAdd',
                            },
                            userName: {
                                code: 'prtlUsrNm',
                            },
                            firstName: {
                                code: 'frstNm',
                            },
                            lastName: {
                                code: 'lstNm',
                            },
                            countryDialingCode: {
                                code: 'phnDlngCd',
                            },
                            phoneNumber: {
                                code: 'phnNum',
                            },
                            jobTitle: {
                                code: 'title',
                            },
                            userState: {
                                code: 'prtlState',
                            },
                            portalAssociation: {
                                code: 'portalAssc',
                            },
                        },
                        hasSameEmailAndUsername: true,
                        userRoles: ["Customer Administrators"],
                        userStates: ["Approved"],
                        hasUserRole: true,
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
                },
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(bevNamesData))
            .mockImplementationOnce((url, success) => success(bevMetadata))
            .mockImplementationOnce((url, success) => success(portalRolesData))
            .mockImplementationOnce((url, success) => success(portalStatesData));
        const { container } = renderPage(props);
        expect(
            container.querySelector('input[name="userManagement.bevName"]').value
        ).toBe(props.formikProps.values.userManagement.bevName);
        expect(
            container.querySelector('input[name="userManagement.createAdditionalUsers"]').checked
        ).toBe(props.formikProps.values.userManagement.createAdditionalUsers);
        expect(
            container.querySelector('input[name="userManagement.hasSameEmailAndUsername"]').checked
        ).toBe(props.formikProps.values.userManagement.hasSameEmailAndUsername);
    }, 30000);
});
