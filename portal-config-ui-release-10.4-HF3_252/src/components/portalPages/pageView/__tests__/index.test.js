import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PageView from '../index';
import { fireEvent, render, wait, act } from '@testing-library/react';
import { StateContext } from "../../../../context/stateContext";
import { defaultCurrentPage, portalConfigDefaultData, portalConfigMap, match, sectionTemplates, lookupData, bevNames, pages, recordPage, recordTypeBevNames, customPortalView } from '../__mocks__/index';
import APIService from '../../../../utils/apiService';
import CONFIG  from '../../../../config/config';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('@informatica/archipelago-icons', () => ({
    home_icon: 'home_icon',
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const { ACTIONS, NOTIFICATION_TYPE } = CONFIG;

const defaultProps = {
    history: {
        push: jest.fn(),
    },
};

const dispatch = jest.fn();

const renderPage = ({
    props= defaultProps,
    currentPage= defaultCurrentPage,
    portalConfig= portalConfigDefaultData,
    isEditable= false,
    } = {}) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch,
                state: {
                    portalConfig,
                    currentPage,
                    pageSettings: [
                        {
                            icon: "home_icon",
                            id: "LABEL_HOME",
                            label: ["LABEL_HOME"],
                            type: "LABEL_HOME",
                            url: "/portals",
                        },
                        {
                            icon: "portal.svg",
                            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
                            label: ["Customer Portal"],
                            type: "LABEL_EDIT_PORTAL",
                            url: "/portals/localhost-orcl-C360_ORS/2",                           
                        }
                    ],
                    portalConfigMap: portalConfigMap,
                }
            }}
        >
            <PageView
                {...props}
                match={isEditable ? match : { params: { ...match.params, pageId: undefined }}}
            />
        </StateContext.Provider>
    </Router>
);

describe('Page view', async () => {
    it('should be able submit existing details when record type is custom record', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_20019_LABEL_CREATE_PAGE",
            label: ["test"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/20019",
        }

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({ layout: { sections: sectionTemplates } }))
            .mockImplementationOnce((url, success) => success(pages))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success) => success(bevNames))

        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure, other) => success({
                portalId: "20019",
                version: 7,
            }));

        const { getByTestId, getByText } = renderPage({ currentPage, isEditable: true });

        const nextButton = getByText('Next >');
        fireEvent.click(nextButton);

        await wait();
        const saveButton = getByTestId('save-button');
        fireEvent.click(saveButton);
        
        expect(dispatch).toHaveBeenCalled();
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: 'EDIT_PAGE_SUCCESS_MESSAGE'
                }
            });
        });           
    }, 30000);

    it('should be able submit existing details when record type is record page', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_20019_LABEL_CREATE_PAGE",
            label: ["test"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/20019",
        }

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({ layout: { sections: sectionTemplates } }))
            .mockImplementationOnce((url, success) => success(recordPage))
            .mockImplementationOnce((url, success) => success(customPortalView))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success) => success(recordTypeBevNames))

        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure, other) => success({
                portalId: "2",
                version: 17,
            }));       

        const { getByTestId, getByText } = renderPage({ currentPage, isEditable: true });

        const nextButton = getByText('Next >');
        fireEvent.click(nextButton);

        await wait();
        const saveButton = getByTestId('save-button');
        fireEvent.click(saveButton);
        
        expect(dispatch).toHaveBeenCalled();
        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: 'EDIT_PAGE_SUCCESS_MESSAGE'
                }
            });
        });        
    }, 30000);

    it('should display errors when there are errors in the form', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_20019_LABEL_CREATE_PAGE",
            label: ["test"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/20019",
        };

        const errorsToDisplay = {
            ...pages,
            name: '',
        }

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({ layout: { sections: sectionTemplates } }))
            .mockImplementationOnce((url, success) => success(errorsToDisplay))
            .mockImplementationOnce((url, success) => success(lookupData))
            .mockImplementationOnce((url, success) => success(bevNames))

        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure, other) => success({
                portalId: "20019",
                version: 7,
            }));       

        const { getByText, getByTestId } = renderPage({ currentPage });

        const nextButton = getByText('Next >');
        fireEvent.click(nextButton);
        
        await wait(() => {
            expect(getByTestId('name-error')).toBeDefined()
        });
        
    }, 30000);

    it('should throw error notification when network request fails with error code', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_20019_LABEL_CREATE_PAGE",
            label: ["test"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/20019",
        };

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: { errorCode: 'ERROR_MESSAGE_ONE' }}}));
  

        renderPage({ currentPage, isEditable: true });
        
        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: 'ERROR_MESSAGE_ONE',
                type: 'error',
            },
        });
        
    }, 30000);

    it('should throw error notification when network request fails without error code', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_20019_LABEL_CREATE_PAGE",
            label: ["test"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/20019",
        };

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({response: { data: {}}}));
  

        renderPage({ currentPage, isEditable: true });
        
        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                message: 'ERROR_GENERIC_MESSAGE',
                type: 'error',
            },
        });
        
    }, 30000);

    it('should be able to create and submit a new form', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_20019_LABEL_CREATE_PAGE",
            label: ["test"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/20019",
        };

        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({ layout: { sections: sectionTemplates } }))
            .mockImplementationOnce((url, success) => success(recordTypeBevNames))
            .mockImplementationOnce((url, success) => success(lookupData))

        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure, other) => success({
                portalId: "20019",
                version: 7,
            }));       

        const { getByTestId, getByText } = renderPage({ currentPage, isEditable: false });

        fireEvent.change(getByTestId('page-form-name'), {
            target: { value: "new name" }
        });

        const dropdownParentElement = getByTestId('page-form-type');
        const dropdownButton = dropdownParentElement.querySelector('[data-testid="dropdown-button"]');
        act(() => {
            fireEvent.click(dropdownButton);
        });

        await wait(() => {
            fireEvent.click(getByTestId('dropdown-menu').firstChild);
        });        
        const nextButton = getByText('Next >');

        act(() => {
            fireEvent.click(nextButton);
        });   
    }, 30000);    
});
