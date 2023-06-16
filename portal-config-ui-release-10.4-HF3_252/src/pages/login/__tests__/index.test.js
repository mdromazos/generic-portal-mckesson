import React from 'react';
import LoginPage from '../index';
import { render, wait } from '@testing-library/react';
import axios from 'axios';
import { APIMap } from "../../../utils/apiMappings";
import { URLMap } from "../../../utils/urlMappings";

jest.mock('axios', () => ({
    get: jest.fn()
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (prop) => jest.fn(prop) })
}));

const renderPage = (props) => render(
    <LoginPage
        {...props}
    />
);

describe('LoginPage component', () => {
    it("Renders the login page when session is not valid", async () => {
        const push = jest.fn(String);
        const props = {
            history: {
                push,
            },
        };
        axios.get.mockRejectedValueOnce(new Error('Login Failed'));
        const { container } = renderPage(props);
        await wait(() => {
            expect(axios.get).toBeCalledWith(APIMap.validateSession());
            expect(container.querySelector('.login-page')).not.toBeNull();
            expect(container.querySelector('.login-box-header')).not.toBeNull();
            expect(container.querySelector('.login-box-content')).not.toBeNull();
            expect(container.querySelector('.copyright__style')).not.toBeNull();
        });
    }, 30000);

    it("Redirects to the Portals page when session is valid", async () => {
        const push = jest.fn(String);
        const props = {
            history: {
                push,
            },
        };
        axios.get.mockResolvedValueOnce(new Error('Login Failed'));
        const { container } = renderPage(props);
        await wait(() => {
            expect(axios.get).toBeCalledWith(APIMap.validateSession());
            expect(container.querySelector('.login-page')).toBeNull();;
            expect(push).toHaveBeenCalledWith(URLMap.portals());
        });
    }, 30000);
});
