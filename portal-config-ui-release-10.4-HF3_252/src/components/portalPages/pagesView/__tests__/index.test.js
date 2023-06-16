import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PagesView from '../index';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StateContext } from "../../../../context/stateContext";
import APIService from '../../../../utils/apiService';
import CONFIG  from '../../../../config/config';
import { portalConfigData, portalConfigMapData } from '../__mocks__';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('@informatica/archipelago-icons', () => ({
    home_icon: 'home_icon',
}));

const { ACTIONS, NOTIFICATION_TYPE } = CONFIG;

const dispatch = jest.fn();
const push = jest.fn();

const defaultProps = {
    history: {
        push,
    }
}

const renderPage = ({
        props= defaultProps,
        portalConfigMap= portalConfigMapData
    } = {}) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch,
                state: {
                    portalConfigMap,
                }
            }}
        >
            <PagesView
                {...props}
                portalConfig={portalConfigData}
            />
        </StateContext.Provider>
    </Router>
);

describe('Pages View', async () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });    
    it('should be able to delete an item from the list', async () => {
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({
                portalId: "2",
                version: 18
            }));        

        const { container, queryByTestId, queryAllByRole } = renderPage();

        const lastElementInList = container.querySelector('[data-id="30006"]').lastChild;
        fireEvent.mouseOver(lastElementInList);
        fireEvent.click(lastElementInList.querySelector('button'));
        const menuItemDelete = queryAllByRole("menuitem")[1];
        fireEvent.click(menuItemDelete);
        
        const deleteConfirmationDialog = queryByTestId('message-box-title');
        expect(deleteConfirmationDialog).toBeInTheDocument();

        fireEvent.click(queryByTestId('message-box-action-button'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.REMOVE_PAGE_SETTINGS,
            pageSettings: {
                id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2_LABEL_EDIT_PAGE_30006",
                type: 'LABEL_EDIT_PORTAL',
            },
        });
    }, 30000);

    it('should not delete an item from the list when there is error with error code in the API', async () => {
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: { errorCode: 'ERROR_MESSAGE' }}}));

        const { container, queryByTestId, queryAllByRole } = renderPage();

        const lastElementInList = container.querySelector('[data-id="30006"]').lastChild;
        fireEvent.mouseOver(lastElementInList);
        fireEvent.click(lastElementInList.querySelector('button'));
        const menuItemDelete = queryAllByRole("menuitem")[1];
        fireEvent.click(menuItemDelete);
        
        const deleteConfirmationDialog = queryByTestId('message-box-title');
        expect(deleteConfirmationDialog).toBeInTheDocument();

        fireEvent.click(queryByTestId('message-box-action-button'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: "ERROR_MESSAGE",
                type: 'error',
            },
        });
    }, 30000);

    it('should not delete an item from the list when there is no error code in the API', async () => {
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: {}}}));

        const { container, queryByTestId, queryAllByRole } = renderPage();

        const lastElementInList = container.querySelector('[data-id="30006"]').lastChild;
        fireEvent.mouseOver(lastElementInList);
        fireEvent.click(lastElementInList.querySelector('button'));
        const menuItemDelete = queryAllByRole("menuitem")[1];
        fireEvent.click(menuItemDelete);
        
        const deleteConfirmationDialog = queryByTestId('message-box-title');
        expect(deleteConfirmationDialog).toBeInTheDocument();

        fireEvent.click(queryByTestId('message-box-action-button'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: "DELETE_PAGE_ERROR_MESSAGE",
                type: 'error',
            },
        });
    }, 30000);

    it('should navigate to edit page when user clicks on edit button in menu dropdown', async () => {
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({
                portalId: "2",
                version: 18
            }));        

        const { container, queryAllByRole } = renderPage();

        const lastElementInList = container.querySelector('[data-id="30006"]').lastChild;
        fireEvent.mouseOver(lastElementInList);
        fireEvent.click(lastElementInList.querySelector('button'));
        const menuItemEdit = queryAllByRole("menuitem")[0];
        fireEvent.click(menuItemEdit);
        
        expect(push).toHaveBeenCalledWith('/portals/localhost-orcl-C360_ORS/2/page/30006');
    }, 30000);

    it('should navigate to edit page when user clicks on name', async () => {
        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({
                portalId: "2",
                version: 18
            }));        

        const { getByTestId } = renderPage();

        const item = getByTestId('edit-page-30006');
        fireEvent.click(item);
        
        expect(push).toHaveBeenCalledWith('/portals/localhost-orcl-C360_ORS/2/page/30006');
    }, 30000);

    it('should open shutter modal when user clicks on reorder pages button and submit', async () => {
        APIService.patchRequest = jest.fn()
            .mockImplementationOnce((url, data, success) => success({
                portalId: "2",
                version: 22
            }));        

        const { getByTestId, queryByTestId } = renderPage();

        const reorderPagesButton = getByTestId('reorder-pages');
        fireEvent.click(reorderPagesButton);

        const shutterDialog = queryByTestId('shutter-dialog');
        expect(shutterDialog).toBeInTheDocument();

        fireEvent.click(queryByTestId('on-reordering-pages'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: "REORDER_PAGE_SUCCESS_MESSAGE",
                type: NOTIFICATION_TYPE.SUCCESS,
            },
        });
        
    }, 30000);

    it('should throw error with error code returned from API when user clicks on save button in shutter modal', async () => {
        APIService.patchRequest = jest.fn()
            .mockImplementationOnce((url, data, success, failure) => failure({ response: { data: { errorCode: 'ERROR_MESSAGE' }}}));

        const { queryByTestId, getByTestId } = renderPage();

        const reorderPagesButton = getByTestId('reorder-pages');
        fireEvent.click(reorderPagesButton);

        const shutterDialog = queryByTestId('shutter-dialog');
        expect(shutterDialog).toBeInTheDocument();

        fireEvent.click(queryByTestId('on-reordering-pages'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: "ERROR_MESSAGE",
                type: 'error',
            },
        });
    }, 30000);

    it('should throw error with custom error code when user clicks on save button in shutter modal', async () => {
        APIService.patchRequest = jest.fn()
            .mockImplementationOnce((url, data, success, failure) => failure({ response: { data: {}}}));

        const { queryByTestId, getByTestId } = renderPage();

        const reorderPagesButton = getByTestId('reorder-pages');
        fireEvent.click(reorderPagesButton);

        const shutterDialog = queryByTestId('shutter-dialog');
        expect(shutterDialog).toBeInTheDocument();

        fireEvent.click(queryByTestId('on-reordering-pages'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: "DELETE_PAGE_ERROR_MESSAGE",
                type: 'error',
            },
        });
    }, 30000);

    it('should be able to search and filter pages list when user enter keywords in the input box', async () => {
        const { getByTestId } = renderPage();

        const reorderPagesButton = getByTestId('search-filter');
        fireEvent.change(reorderPagesButton, {
            target: { value: "Review" }
        });

        const pagesList = getByTestId('page-list-container').children.length;

        expect(pagesList).toStrictEqual(1);
    }, 30000);
});
