import React from 'react';
import LoginForm from '../index';
import { render, fireEvent, wait } from '@testing-library/react';
import axios from 'axios';
import { APIMap } from "../../../utils/apiMappings";
import { URLMap } from "../../../utils/urlMappings";
import { getDefaultHeaders } from "../../../utils/utilityService";

jest.mock('axios', () => {
    return {
      post: jest.fn()
    };
});

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const renderForm = (props) => render(
    <LoginForm
        {...props}
    />
);

describe('Login form component', () => {
    it("Renders the fields correctly", async () => {
        const {
            getByTestId,
            getByText,
        } = renderForm();     
        expect(getByText('LABEL_USERNAME')).toBeDefined();
        expect(getByText('LABEL_PASSWORD')).toBeDefined();
        expect(getByTestId('username-input')).toBeDefined();
        expect(getByTestId('password-input')).toBeDefined();
        expect(getByTestId('login-button')).toBeDefined();
    });    
    
    it("Renders the proper error message for username and password when left blank", async () => {
        const {
            getByText,
            getByTestId,
        } = renderForm();
        fireEvent.click(getByTestId('login-button'));
        await wait(() => {
            expect(getByText('ERROR_REQUIRED_USERNAME')).not.toBeNull();
            expect(getByText('ERROR_REQUIRED_PASSWORD')).not.toBeNull();
        });
    }, 30000);

    it("Redirects to Portals page when successful login", async () => {
        const push = jest.fn(String);
        const props = {
            history: {
                push,
            },
        };
        const { getByTestId } = renderForm(props);
        fireEvent.change(getByTestId('username-input'), {
            target: { value: "username" }
        });
        fireEvent.change(getByTestId('password-input'), {
            target: { value: "password" }
        });
        axios.post.mockResolvedValueOnce({
            headers: {
                'ict-config':'ict-config',
            },
            data: {
                username: 'username',
            },
        });
        fireEvent.click(getByTestId('login-button'));
        await wait(() => {
            expect(axios.post).toBeCalledWith(
                APIMap.LOGIN, 
                {
                    username: 'username',
                    password: 'password',
                },
                getDefaultHeaders(),
            );
            expect(push).toHaveBeenCalledWith(URLMap.portals());
        });
    }, 30000);

    it("Shows general login error when login request fails", async () => {
        const { getByTestId } = renderForm();
        fireEvent.change(getByTestId('username-input'), {
            target: { value: "username" }
        });
        fireEvent.change(getByTestId('password-input'), {
            target: { value: "password" }
        });
        axios.post.mockRejectedValueOnce(new Error('Login Failed'));
        fireEvent.click(getByTestId('login-button'));
        await wait(() => {
            expect(axios.post).toBeCalledWith(
                APIMap.LOGIN, 
                {
                    username: 'username',
                    password: 'password',
                },
                getDefaultHeaders(),
            );
            expect(getByTestId('general-login-error')).toBeDefined();
        });
    }, 30000);
});
