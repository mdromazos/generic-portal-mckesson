import React from 'react';
import SessionDialog from '../SessionDialog';
import { render, fireEvent, act } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const addMoreTimeHandler = jest.fn();
const dialogBox = {
    close: jest.fn(),
    closed: false
}

describe('Testing the session timeout dialog component', () => {

    const renderForm = () => render(
        <SessionDialog 
            sessionTimeout={20}
            progressBar={""}
            addMoreTime={addMoreTimeHandler}
            dialogBox={dialogBox}
        />
    );
    
    it("Should render the portal seesion timeout dialog", () => {
        const { getByTestId} = renderForm();
        expect(getByTestId('session-dialog')).not.toBeNull();
        expect(getByTestId('dialog__header__title')).not.toBeNull();
        expect(getByTestId('session-dialog-header-title')).not.toBeNull();
        expect(getByTestId('remaining-time')).not.toBeNull();
        expect(getByTestId('remaining-time-description')).not.toBeNull();
        expect(getByTestId('dialog-footer-title')).not.toBeNull();
        expect(getByTestId('logged-in-button')).not.toBeNull();
    });

    it("Portal navigation tab should be equal to the number of pages", () => {
        const { getByTestId} = renderForm();

        expect(getByTestId("dialog__header__title").textContent).toMatch("LABEL_SESSION_TITLE");
        expect(getByTestId("session-dialog-header-title").textContent).toMatch("LABEL_SESSION_EXPIRE_HEADER_TITLE");
        expect(getByTestId("remaining-time").textContent).toMatch("20");
        expect(getByTestId("remaining-time-description").textContent).toMatch("LABEL_SECONDS");
        expect(getByTestId("dialog-footer-title").textContent).toMatch("LABEL_SESSION_EXPIRE_FOOTER_TITLE");
        expect(getByTestId("logged-in-button").textContent).toMatch("LABEL_KEEP_ME_LOGGED_IN");
    });

    it("Portal navigation tab should be equal to the number of pages", () => {
        const { getByTestId} = renderForm();
        act(() => {
            fireEvent.click(getByTestId('logged-in-button'));
        });
        expect(addMoreTimeHandler).toHaveBeenCalledTimes(1);
    });
});