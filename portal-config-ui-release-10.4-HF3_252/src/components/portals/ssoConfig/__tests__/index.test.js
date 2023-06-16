import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { fireEvent, render, wait } from '@testing-library/react';
import '@testing-library/jest-dom';
import { saveAs } from 'file-saver';
import { URLMap } from '../../../../utils/urlMappings';
import APIService from '../../../../utils/apiService';
import { StateContext } from "../../../../context/stateContext";
import { initialState } from "../../../../context/stateContext";
import { match, ssoConfigurationWithOutQuickSetupGuide, ssoConfigurationWithQuickSetupGuide } from "../__mocks__/index";
import CONFIG from "../../../../config/config";
import SSOConfiguration from '../index';

const { ACTIONS, NOTIFICATION_TYPE, FILE_TYPE: { XML, XML_FILE } } = CONFIG;

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('file-saver', () => ({
    saveAs: jest.fn(),
}));

const renderPage = (props) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch: props.dispatch,
                state: { ...initialState, 
                    portalConfigMap: {
                        "localhost-orcl-C360_ORS__2": {
                            name: "Customer 360 Portal",
                        },
                    },
                },
            }}
        >
            <SSOConfiguration match={match} history={props.history} />
        </StateContext.Provider>
    </Router>
);

describe('SSO Configuration component', () => {
    it("should display the quicksetup guide modal on page load when the user visits for the first time", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => success(ssoConfigurationWithQuickSetupGuide));
        const { getByTestId } = renderPage(props);

        expect(getByTestId('setup_guide')).toBeInTheDocument();
    }, 30000);

    it("should display generic error notification when sso configuation fails to load data", async () => {
        // Arrange
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };

        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
        const { getByTestId } = renderPage(props);

        // Act
        await wait(() => fireEvent.click(getByTestId('download-metadata')));

        // Assert
        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: 'ERROR_GENERIC_MESSAGE',
                type: 'error',
            },
        });
    }, 30000);

    it("should display custom error notification returned from response when sso configuation fails to load data", async () => {
        // Arrange
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };

        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE_ONE' }}}))
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE_ONE' }}}));

        const { getByTestId } = renderPage(props);

        // Act
        await wait(() => fireEvent.click(getByTestId('download-metadata')));

        // Assert
        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: 'ERROR_MESSAGE_ONE',
                type: 'error',
            },
        });
    }, 30000);

    it("should dispatch the success notification action when sso configuration updated successfully", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success, failure, other) => success(ssoConfigurationWithOutQuickSetupGuide));
        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure, other) => success({
                portalId: "20019",
            }));       
            
        const { getByTestId } = renderPage(props);
        await wait(() => {
            fireEvent.change(getByTestId('user-name-mapping'), { target: { value: 'UpdateNameID' }});
            fireEvent.click(getByTestId('sso-save-details'));
        });

        await wait(() => {
            expect(APIService.putRequest).toHaveBeenCalled();
            expect(push).toHaveBeenCalledWith(URLMap.portals());
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: "SSO_CONFIG_SUCCESS_MESSAGE",
                },
            });
        });
    }, 30000);

    it("should download the metadata file when user click on the download meta data button", async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => success(ssoConfigurationWithOutQuickSetupGuide))
            .mockImplementationOnce((url, success) => success('blob data'))
              
        const { getByTestId } = renderPage(props);

        await wait(() => fireEvent.click(getByTestId('download-metadata')));

        await wait(() => {
            let blob = new Blob(['blob data'], { type: XML_FILE});
            let fileName = `2-localhost-orcl-C360_ORS.${XML}`;
            expect(saveAs).toHaveBeenCalledWith(blob, fileName);
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.INFO,
                    message: 'PORTAL_USER_ACTION_EXPORT_MESSAGE'
                }
            });
        });
    }, 30000);

    it('should throw error when the user uploads wrong file', async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };        

        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failure, other) => success(ssoConfigurationWithOutQuickSetupGuide))

        const { queryByTestId } = renderPage(props);

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'application/pdf' });
        blob["name"] = "PDF file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        });
        
        const errors = document.querySelector('.form-error');
        expect(errors).toBeInTheDocument();
    }, 30000);

    it('should be able to upload the xml file and save the sso details', async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(ssoConfigurationWithQuickSetupGuide));

        APIService.postRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success) => success(ssoConfigurationWithQuickSetupGuide));               

        const { queryByTestId } = renderPage(props);

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'text/xml' });
        blob["name"] = "XML file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        })
        
        // Submit Form
        await wait(() => fireEvent.click(queryByTestId('sso-save-details')));

        await wait(() => {
            expect(APIService.postRequest).toHaveBeenCalled();
        });
    }, 30000);

    it('should be able to click on submit when the replace portal is unchecked', async () => {
        const push = jest.fn(String);
        const dispatch = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(ssoConfigurationWithQuickSetupGuide));

        APIService.postRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure) => failure({ response: {}}));              

        const { queryByTestId } = renderPage(props);

        const fileupload = queryByTestId('file-upload');        
        let blob = new Blob([""], { type: 'text/xml' });
        blob["name"] = "XML file";
        fireEvent.change(fileupload, {
            target: {
                files: [blob]
            }
        })
        
        // Submit Form
        await wait(() => fireEvent.click(queryByTestId('sso-save-details')));

        // Assert
        // await wait(() => {
        //     expect(APIService.putRequest).toHaveBeenCalled();
        //     expect(dispatch).toHaveBeenCalledWith({
        //         type: ACTIONS.ADD_APP_NOTIFICATION,
        //         notificationConfig: {
        //             type: NOTIFICATION_TYPE.ERROR,
        //             message: "ERROR_GENERIC_MESSAGE",
        //         },
        //     });
        // });
    }, 30000);

});
