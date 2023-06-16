import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom'
import GeneralForm from '../index';
import { fireEvent, render, wait } from '@testing-library/react';
import APIService from '../../../../../utils/apiService';
import { StateContext } from "../../../../../context/stateContext";
import CONFIG from "../../../../../config/config";
import { portalConfigData, dbData, entityData, sourceSystemData, lookupData } from '../__mocks__/index';

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
            value={{ 
                dispatch: dispatch,
                state: {
                    portalConfig: props.isEdit ? portalConfigData : {},
                }
            }}
        >
            <GeneralForm
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

describe('General Form component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getDatabase request success', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData));
        renderPage(props);
    }, 30000);

    it('getDatabase request fails', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
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
                    message: 'ERROR_GENERIC_MESSAGE'
                }
            })
        });
    }, 30000);

    it('get entity, sourceSystem and lookupdata success', async () => {
        const props = {
            isEdit: true,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    portalName: "Customer Portal",
                    portalTitle: "Customer Portal",
                    databaseId: 'localhost-orcl-C360_ORS',
                    beName: "CustomerOrg",
                    sourceSystem: "Portal",
                    isStateEnabled: true,
                    isExternalUserManagementEnabled: true,
                    stateSettings: {
                        fieldName: "prtyRleStsVal",
                        referenceEntity: "LookupPartyRoleStatusValue",
                        filterFieldValue: "",
                        filterFieldName: "prtyRleStsTyp"
                    },
                    validateState: "",
                    roleSettings: {
                        fieldName: "roleCode",
                        referenceEntity: "LookupPortalUserRole"
                    },
                    validateRole: "",
                    header: {},
                    footer: {
                        footerText: "Copyright 1993-2020 Informatica LLC. All Rights"
                    },
                },
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(entityData))
            .mockImplementationOnce((url, success) => success(sourceSystemData))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success) => success({ item: [] }));
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelectorAll('.d-section__header').length).toBe(5);
            expect(container.querySelectorAll('.d-section__header')[0].textContent).toBe('LABEL_PORTAL_DETAIL_SECTION');
            expect(container.querySelectorAll('.d-section__header')[1].textContent).toBe('LABEL_STATE_SETTINGS_SECTION');
            expect(container.querySelectorAll('.d-section__header')[2].textContent).toBe('LABEL_ROLE_SETTINGS_SECTION');
            expect(container.querySelectorAll('.d-section__header')[3].textContent).toBe('LABEL_HEADER_SECTION');
            expect(container.querySelectorAll('.d-section__header')[4].textContent).toBe('LABEL_FOOTER_SECTION');
        });
    }, 30000);

    it('get entity, sourceSystem and lookupdata fails', async () => {
        const props = {
            isEdit: true,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                },
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ENTITY_ERROR_MESSAGE' }}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'SOURCE_SYSTEM_ERROR_MESSAGE' }}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'LOOKUP_DATA_ERROR_MESSAGE' }}}));
        const { container } = renderPage(props);
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'ENTITY_ERROR_MESSAGE'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'SOURCE_SYSTEM_ERROR_MESSAGE'
                }
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.ERROR,
                    message: 'LOOKUP_DATA_ERROR_MESSAGE'
                }
            });
        });
    }, 30000);

    it('get entity, sourceSystem and lookupdata fails with no error code', async () => {
        const props = {
            isEdit: true,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                },
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        renderPage(props);
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

    it('open header font color picker', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData));
        const { queryByTestId, container } = renderPage(props);

        const headerFontColor = queryByTestId('header-font-color');
        fireEvent.click(headerFontColor);

        expect(container.querySelector('.portal-color-palette')).toBeDefined();
    }, 30000);

    it('open header background color picker', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData));
        const { queryByTestId, container } = renderPage(props);

        const headerBgColor = queryByTestId('header-bg-color');
        fireEvent.click(headerBgColor);
        
        expect(container.querySelector('.portal-color-palette')).toBeDefined();
    }, 30000);

    it('open footer background color picker', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData));
        const { queryByTestId, container } = renderPage(props);

        const headerBgColor = queryByTestId('footer-bg-color');
        fireEvent.click(headerBgColor);

        expect(container.querySelector('.portal-color-palette')).toBeDefined();
    }, 30000);

    it('open footer font color picker', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData));
        const { queryByTestId, container } = renderPage(props);

        const headerBgColor = queryByTestId('footer-font-color');
        fireEvent.click(headerBgColor);

        expect(container.querySelector('.portal-color-palette')).toBeDefined();
    }, 30000);

    it('open state validation and role validation messagebox when success and failure', async () => {
        const props = {
            isEdit: true,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    portalName: "Customer Portal",
                    portalTitle: "Customer Portal",
                    databaseId: 'localhost-orcl-C360_ORS',
                    beName: "CustomerOrg",
                    sourceSystem: "Portal",
                    isStateEnabled: true,
                    isExternalUserManagementEnabled: true,
                    stateSettings: {
                        fieldName: "prtyRleStsVal",
                        referenceEntity: "LookupPartyRoleStatusValue",
                        filterFieldValue: "",
                        filterFieldName: "prtyRleStsTyp"
                    },
                    validateState: "",
                    roleSettings: {
                        fieldName: "roleCode",
                        referenceEntity: "LookupPortalUserRole"
                    },
                    validateRole: "",
                    header: {},
                    footer: {
                        footerText: "Copyright 1993-2020 Informatica LLC. All Rights"
                    },
                },
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(entityData))
            .mockImplementationOnce((url, success) => success(sourceSystemData))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success) => success({ item: [
                {
                    prtyRleStsVal: 'val1',
                    rowidObject: 1,
                },
                {
                    prtyRleStsVal: 'val2',
                    rowidObject: 2,
                },
            ]}))
            .mockImplementationOnce((url, success) => success({ item: [
                {
                    roleCode: 'val1',
                    rowidObject: 1,
                },
                {
                    roleCode: 'val2',
                    rowidObject: 2,
                },
            ]}));
        const { container, getByText } = renderPage(props);
        await wait(() => {
            fireEvent.click(container.querySelectorAll('.validateState')[0]);
            expect(container.querySelector('STATE_CONF_VALIDATE_DIALOG_NO_STATE_FOUND')).toBeNull();
            fireEvent.click(container.querySelectorAll('.validateState')[1]);
            expect(container.querySelector('ROLE_CONF_VALIDATE_DIALOG_NO_STATE_FOUND')).toBeNull();
        });
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }))
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }));
        await wait(() => {
            fireEvent.click(container.querySelectorAll('.validateState')[0]);
            expect(getByText('STATE_CONF_VALIDATE_DIALOG_NO_STATE_FOUND')).toBeDefined();
            fireEvent.click(container.querySelectorAll('.validateState')[1]);
            expect(getByText('ROLE_CONF_VALIDATE_DIALOG_NO_STATE_FOUND')).toBeDefined();
        });
    }, 30000);

    it('isValidStateConfiguration and isValidRoleConfiguration is false when databaseId not chosen', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    isStateEnabled: true,
                    isExternalUserManagementEnabled: true,
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(entityData))
            .mockImplementationOnce((url, success) => success(sourceSystemData))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }))
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }));
        const { container } = renderPage(props);
        await wait(() => {
            fireEvent.click(container.querySelectorAll('.validateState')[0]);
            expect(APIService.getRequest).toHaveBeenCalledTimes(1);
            fireEvent.click(container.querySelectorAll('.validateState')[1]);
            expect(APIService.getRequest).toHaveBeenCalledTimes(1);
        });
    }, 30000);

    it('isValidStateConfiguration and isValidRoleConfiguration is false when stateSettings and roleSettings is not present', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    isStateEnabled: true,
                    isExternalUserManagementEnabled: true,
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(entityData))
            .mockImplementationOnce((url, success) => success(sourceSystemData))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }))
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }));
        const { container } = renderPage(props);
        await wait(() => {
            fireEvent.click(container.querySelectorAll('.validateState')[0]);
            expect(APIService.getRequest).toHaveBeenCalledTimes(4);
            fireEvent.click(container.querySelectorAll('.validateState')[1]);
            expect(APIService.getRequest).toHaveBeenCalledTimes(4);
        });
    }, 30000);

    it('isValidStateConfiguration and isValidRoleConfiguration is false when stateSettings and roleSettings is empty object', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    databaseId: 'localhost-orcl-C360_ORS',
                    isStateEnabled: true,
                    isExternalUserManagementEnabled: true,
                    stateSettings: {},
                    roleSettings: {},
                },
                touched: {},
                errors: {},
            },
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(entityData))
            .mockImplementationOnce((url, success) => success(sourceSystemData))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }))
            .mockImplementationOnce((url, success, failure) => failure({ item: [] }));
        const { container } = renderPage(props);
        await wait(() => {
            fireEvent.click(container.querySelectorAll('.validateState')[0]);
            expect(APIService.getRequest).toHaveBeenCalledTimes(4);
            fireEvent.click(container.querySelectorAll('.validateState')[1]);
            expect(APIService.getRequest).toHaveBeenCalledTimes(4);
        });
    }, 30000);

    it('renders corresponding error message when errors object found in formikProps', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {
                    isStateEnabled: true,
                    isExternalUserManagementEnabled: true,
                },
                touched: {
                    portalName: true,
                    portalTitle: true,
                    databaseId: true,
                    beName: true,
                    sourceSystem: true,
                    isStateEnabled: true,
                    stateSettings: {
                        referenceEntity: true,
                        fieldName: true,
                    },
                    validateState: true,
                    roleSettings: {
                        referenceEntity: true,
                        fieldName: true,
                    },
                    validateRole: true,
                    header: {
                        logo: true,
                        backgroundColor: true,
                        fontColor: true,
                    },
                    footer: {
                        footerText: true,
                        backgroundColor: true,
                        fontColor: true,
                    },
                },
                errors: {
                    portalName: 'Portal name is required',
                    portalTitle: 'Portal name is required',
                    databaseId: 'Portal name is required',
                    beName: 'Portal name is required',
                    sourceSystem: 'Portal name is required',
                    isStateEnabled: 'Portal name is required',
                    stateSettings: {
                        referenceEntity: 'State Reference entity is required',
                        fieldName: 'State Fieldname is required',
                    },
                    validateState: 'State is required',
                    roleSettings: {
                        referenceEntity: 'Role Reference entity is required',
                        fieldName: 'Role Fieldname is required',
                    },
                    validateRole: 'Role is required',
                    header: {
                        logo: 'Logo is required',
                        backgroundColor: 'Header background color is required',
                        fontColor: 'Header font color is required',
                    },
                    footer: {
                        footerText: 'Footer text is required',
                        backgroundColor: 'Footer background color is required',
                        fontColor: 'Footer font color is required',
                    },
                },
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData));
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelectorAll('.form-error').length).toBe(18);
        });
    }, 30000);

    it('select databaseId and get entity, sourceSyatem and lookup details', async () => {
        const props = {
            isEdit: false,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(entityData))
            .mockImplementationOnce((url, success) => success(sourceSystemData))
            .mockImplementationOnce((url, success) => success(lookupData));
        const { container, getByTestId } = renderPage(props);
        fireEvent.click(container.querySelector('[data-testid="dropdown-button"]'));
        await wait(() => {
            fireEvent.click(getByTestId('dropdown-menu').lastChild);
            expect(handleChange).toHaveBeenCalledWith('databaseId', 'localhost-orcl-C360_ORS');
            expect(APIService.getRequest).toHaveBeenCalledTimes(4);
        });
    }, 30000);

    it('should check the isExternal checkbox and isStateEnabled to true', async () => {
        const props = {
            isEdit: true,
            formikProps: {
                setFieldTouched: jest.fn(),
                values: {},
                touched: {},
                errors: {},
            }
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(dbData))
            .mockImplementationOnce((url, success) => success(entityData))
            .mockImplementationOnce((url, success) => success(sourceSystemData))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success) => success({ item: [] }));
        const { queryByTestId } = renderPage(props);

        fireEvent.click(queryByTestId('is-external-user-true'));
        fireEvent.click(queryByTestId('is-state-enabled-true'));

        expect(queryByTestId('is-state-enabled-true').value).toBe('true');
        expect(queryByTestId('is-external-user-true').value).toBe('true')
    }, 30000);
});
