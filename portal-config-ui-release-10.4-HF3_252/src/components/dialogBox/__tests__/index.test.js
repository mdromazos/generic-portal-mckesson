import React from 'react';
import DialogBox from '../index';
import { render, fireEvent } from '@testing-library/react';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

describe('DialogBox component', () => {
    describe('Renders the fields correctly and its intraction', () => {
        const props = {
            dialogBox: {
                close: jest.fn(),
            },
            title: 'DialogBox Title',
            cancelButtonText: 'Cancel',
            messageContentTitle: 'messageContentTitle',
            messageContentBody: 'messageContentBody',
            actionButtonText: 'actionButtonText',
            clickHandler: jest.fn(),
        };
        const renderDialogBox = () => render(
            <DialogBox
                {...props}
            />
        );
        it("Renders the dialogbox title", () => {
            const { getByTestId }  = renderDialogBox();
            expect(getByTestId('message-box-title')).toBeDefined();
        });
        it("Renders the dialogbox content", () => {
            const { getByTestId }  = renderDialogBox();
            expect(getByTestId('message-box-content-title')).toBeDefined();
            expect(getByTestId('message-box-content-body')).toBeDefined();
        });
        it("Renders the action button", () => {
            const { getByTestId }  = renderDialogBox();
            expect(getByTestId('message-box-action-button')).toBeDefined();
        });
        it("Renders the cancel button", () => {
            const { getByTestId }  = renderDialogBox();
            expect(getByTestId('message-box-cancel-button')).toBeDefined();
        });
        it("should trigger the click handler when action button is clicked", async () => {
            const { getByTestId }  = renderDialogBox();
            fireEvent.click(getByTestId('message-box-action-button'));
            await expect(props.clickHandler).toHaveBeenCalled();
            await expect(props.dialogBox.close).toHaveBeenCalled();
        });
        it("should trigger the click handler when action button is clicked", async () => {
            const { getByTestId }  = renderDialogBox();
            fireEvent.click(getByTestId('message-box-cancel-button'));
            await expect(props.dialogBox.close).toHaveBeenCalled();
        });
    });
});