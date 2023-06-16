import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginForm from '../index';
import { render, wait } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const commonProps = {
    onChange: jest.fn(),
    onBlur: jest.fn(),
};

const renderPage = (props) => render(
    <Router>
        <LoginForm
            formikProps={props.formikProps}
            commonProps={commonProps}
            setActiveStep={jest.fn()}
        />
    </Router>
);

describe('Login Form component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('render login form with all fields', async () => {
        const props = {
            formikProps: {
                values: {
                    login: {}
                },
                touched: {},
                errors: {},
            },
        };
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelector('.default_message').textContent).toBe('LABEL_LOGIN_MESSAGE');
            expect(container.querySelectorAll('h1').length).toBe(3);
            expect(container.querySelectorAll('h1')[0].textContent).toBe('LABEL_PAGE_DETAILS_LOGIN_PAGE');
            expect(container.querySelectorAll('h1')[1].textContent).toBe('LABEL_LOGIN_BE_FIELD_MAPPING');
            expect(container.querySelectorAll('h1')[2].textContent).toBe('LABEL_LOGIN_EMAIL_TEMPLATE');
        });
    }, 30000);

    it('render login form with error when user state enabled', async () => {
        const props = {
            formikProps: {
                values: {
                    isStateEnabled: true,
                    login: {
                        fieldMapping: {
                            email: {
                                code: 'email-code',
                            },
                            userName: {
                                code: 'userName-code'
                            },
                            userRole: {
                                code: 'userRole-code',
                            },
                            userState: {
                                code: 'userState-code',
                            },
                            portalAssociation: {
                                code: 'portalAssociation-code',
                            },
                        },
                        resetPasswordEmailTemplate: 'resetPasswordEmailTemplate',
                    },
                },
                touched: {
                    login: {
                        fieldMapping: {
                            email: {
                                code: 'email-code',
                            },
                            userName: {
                                code: 'userName-code'
                            },
                            userRole: {
                                code: 'userRole-code',
                            },
                            userState: {
                                code: 'userState-code',
                            },
                            portalAssociation: {
                                code: 'portalAssociation-code',
                            },
                        },
                    },
                },
                errors: {
                    login: {
                        fieldMapping: {
                            email: {
                                code: 'email-code',
                            },
                            userName: {
                                code: 'userName-code'
                            },
                            userRole: {
                                code: 'userRole-code',
                            },
                            userState: {
                                code: 'userState-code',
                            },
                            portalAssociation: {
                                code: 'portalAssociation-code',
                            },
                        },
                    },
                },
            },
        };
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelectorAll('.form-error').length).toBe(5);
        });
    }, 30000);

    it('render login form with error when user state is not enabled', async () => {
        const props = {
            formikProps: {
                values: {
                    isStateEnabled: false,
                    login: {
                        fieldMapping: {
                            email: {
                                code: 'email-code',
                            },
                            userName: {
                                code: 'userName-code'
                            },
                            userRole: {
                                code: 'userRole-code',
                            },
                            userState: {
                                code: 'userState-code',
                            },
                            portalAssociation: {
                                code: 'portalAssociation-code',
                            },
                        },
                        resetPasswordEmailTemplate: 'resetPasswordEmailTemplate',
                    },
                },
                touched: {
                    login: {
                        fieldMapping: {
                            email: {
                                code: 'email-code',
                            },
                            userName: {
                                code: 'userName-code'
                            },
                            userRole: {
                                code: 'userRole-code',
                            },
                            userState: {
                                code: 'userState-code',
                            },
                            portalAssociation: {
                                code: 'portalAssociation-code',
                            },
                        },
                    },
                },
                errors: {
                    login: {
                        fieldMapping: {
                            email: {
                                code: 'email-code',
                            },
                            userName: {
                                code: 'userName-code'
                            },
                            userRole: {
                                code: 'userRole-code',
                            },
                            userState: {
                                code: 'userState-code',
                            },
                            portalAssociation: {
                                code: 'portalAssociation-code',
                            },
                        },
                    },
                },
            },
        };
        const { container } = renderPage(props);
        await wait(() => {
            expect(container.querySelectorAll('.form-error').length).toBe(5);
        });
    }, 30000);
});
