import React from 'react';
import { StateContext } from '../../../context/stateContext';
import ResetPassword from '../ResetPassword';
import { render, fireEvent, act, wait } from '@testing-library/react';
import { runtime_data, match} from '../__mocks__/resetPassword-data';
import APIService from '../../../utils/apiService';
import { URLMap } from '../../../utils/urlMappings';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

APIService.postRequest = jest.fn().mockImplementation((url, loginPayload, success) => {
    if (url === URLMap.postResetPassword(match.params.id)) {
        success();
    }
});

const history = {
    push: jest.fn(),
    location: {
        hash: "",
        pathname: "/2/localhost-orcl-SUPPLIER_ORS/resetPassword"
    }
};

describe('Rendering the Reset Password form component', () => {

    const renderForm = () => render(
        <StateContext.Provider value={[{
            runtimeConfigurationData : runtime_data,
            notificationActions : {dispatchAppNotification : {} }
        }]}>
            <ResetPassword match={match} history={history}/>
        </StateContext.Provider>
    ); 

    it("Renders the portal reset password form", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('reset_password_title')).not.toBeNull();
        expect(queryAllByTestId('password_field')).not.toBeNull();
        expect(queryAllByTestId('confirm_password_field')).not.toBeNull();
        expect(queryAllByTestId('reset_password_button')).not.toBeNull();
        expect(queryAllByTestId('login_link')).not.toBeNull();
        expect(queryAllByTestId('copyright_text')).not.toBeNull();
    });
    
    it("Renders the title on the reset password form", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('reset_password_title').textContent).toMatch("RESET_PASSWORD_TITLE");
    });

    it("Renders copyright text below the reset password form", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('copyright_text').textContent).toMatch("LABEL_COPYRIGHT_TEXT");
    });

    
    it("Render login link below the reset Password form", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('login_link').length).toStrictEqual(2);
    });

    it("Renders the proper error message for password when left blank", async () => {
        const { getByTestId, queryAllByText } = renderForm();
        act(() => {
            fireEvent.click(getByTestId('reset_password_button'));
        });
        await wait(() => {
            expect(queryAllByText('ERROR_REQUIRED_PASSWORD').length).toStrictEqual(1);
        });
    },10000);

    it("Handle Post Submit - fire API", async () =>  {
        const { getByTestId, container } = renderForm();

        const password = container.querySelectorAll('input')[0];
        const confirmPassword = container.querySelectorAll('input')[1];
        
        fireEvent.change(password, {
            target: {
              value: "12345"
            }
        });
        fireEvent.change(confirmPassword, {
            target: {
              value: "12345"
            }
        });
        act(() => {
            fireEvent.click(getByTestId('reset_password_button'));
        });
        await wait(() => {
            expect(APIService.postRequest).toHaveBeenNthCalledWith(1,URLMap.postResetPassword(match.params.id),
                expect.any(Object),expect.any(Function),expect.any(Function),expect.any(Object)
            );
        }) 
    });
});