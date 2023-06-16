import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ImportPortal from '../index';
import { fireEvent, render, wait} from '@testing-library/react';
import '@testing-library/jest-dom'
import { StateContext } from "../../../../context/stateContext";
import APIService from '../../../../utils/apiService';
import CONFIG  from '../../../../config/config';
import { databases, portals, sourceSystems } from '../__mocks__/index.mock';

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
        displayImportDialogBox= {
            close: jest.fn(),
            closed: false,
            open: jest.fn(),            
        },
        importPortalHandler= jest.fn(),
        validMetadataMessage= false,
        invalidMetadataMessage= false
    } = {}) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch,
                state: {
                    portals,
                }
            }}
        >
            <ImportPortal
                {...props}
                displayImportDialogBox={displayImportDialogBox}
                importPortalHandler={importPortalHandler}
                validMetadataMessage={validMetadataMessage}
                invalidMetadataMessage={invalidMetadataMessage}
            />
        </StateContext.Provider>
    </Router>
);

describe('ImportPortal', async () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });    
    it('should be able to check replace portal and click on submit', async () => {

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(databases))
            .mockImplementationOnce((url, success) => success(sourceSystems))

        const { queryByTestId, queryAllByTestId } = renderPage();

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'application/x-zip-compressed' });
        blob["name"] = "Zip file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        })
        
        //Select dataBase
        fireEvent.click(queryAllByTestId('dropdown-button')[0]); 
        fireEvent.click(queryByTestId('dropdown-menu').lastChild);

        // Select Source systems
        fireEvent.click(queryAllByTestId('dropdown-button')[1]); 
        fireEvent.click(queryByTestId('dropdown-menu').lastChild);

        // Select replace portal checkbox
        fireEvent.click(queryByTestId('replace-portal'));

        // Select portal name
        fireEvent.click(queryAllByTestId('dropdown-button')[2]); 
        fireEvent.click(queryByTestId('dropdown-menu').lastChild);

        // Submit Form
        await wait(() => fireEvent.click(queryByTestId('import-button')));

        // Replace portal confirmation box
        await wait(() => fireEvent.click(queryByTestId('message-box-action-button')));

    }, 30000);

    it('should be able to click on submit when the replace portal is unchecked', async () => {

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(databases))
            .mockImplementationOnce((url, success) => success(sourceSystems))

        const { queryByTestId, queryAllByTestId } = renderPage();

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'application/x-zip-compressed' });
        blob["name"] = "Zip file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        })
        
        //Select dataBase
        fireEvent.click(queryAllByTestId('dropdown-button')[0]); 
        fireEvent.click(queryByTestId('dropdown-menu').lastChild);

        // Select Source systems
        fireEvent.click(queryAllByTestId('dropdown-button')[1]); 
        fireEvent.click(queryByTestId('dropdown-menu').lastChild);

        // Select portal name
        fireEvent.change(queryByTestId('portal-name'), {
            target :{
                value: 'Portal Name'
            }
        });

        // Select external user management
        fireEvent.click(queryByTestId('is-external-user-true'));

        // Submit Form
        await wait(() => fireEvent.click(queryByTestId('import-button')));
    }, 30000);


    it('should fail when databases requests fails with error code', async () => {

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) =>  failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));

        renderPage();

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_MESSAGE'
            }
        });

    }, 30000);

    it('should fail when databases requests fails with custom error code', async () => {

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) =>  failure({response: { data: {}}}));

        renderPage();

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_GENERIC_MESSAGE'
            }
        });
    }, 30000);

    it('should throw error with error code when source system API request fails', async () => {

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(databases))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE' }}}));

        const { queryByTestId, queryAllByTestId } = renderPage();

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'application/x-zip-compressed' });
        blob["name"] = "Zip file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        })
        
        //Select dataBase
        fireEvent.click(queryAllByTestId('dropdown-button')[0]); 
        fireEvent.click(queryByTestId('dropdown-menu').lastChild);

        // Select external user management
        fireEvent.click(queryByTestId('is-external-user-true'));
        fireEvent.click(queryByTestId('is-external-user-false'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_MESSAGE'
            }
        });
        
    }, 30000);

    it('should throw error with custom code when source system API request fails', async () => {

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(databases))
            .mockImplementationOnce((url, success, failure) =>  failure({response: { data: {}}}));

        const { queryByTestId, queryAllByTestId } = renderPage();

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'application/x-zip-compressed' });
        blob["name"] = "Zip file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        })
        
        //Select dataBase
        fireEvent.click(queryAllByTestId('dropdown-button')[0]); 
        fireEvent.click(queryByTestId('dropdown-menu').lastChild);

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: NOTIFICATION_TYPE.ERROR,
                message: 'ERROR_GENERIC_MESSAGE'
            }
        });
    }, 30000);

    it('should throw error when the user uploads wrong file', async () => {

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(databases))

        const { queryByTestId } = renderPage();

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'application/pdf' });
        blob["name"] = "Image file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        });
        
        const errors = document.querySelector('.form-error');
        expect(errors).toBeInTheDocument();
    }, 30000);
});
