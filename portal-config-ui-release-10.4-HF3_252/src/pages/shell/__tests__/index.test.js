import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ShellPage from '../index';
import { fireEvent, render, wait } from '@testing-library/react';
import { StateContext } from "../../../context/stateContext";
import { defaultCurrentPage, portalConfigDefaultData, portalConfigMap, portalPages } from '../__mocks__/index';
import APIService from '../../../utils/apiService';
import CONFIG  from '../../../config/config';

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
        editStatus= false,
    } = {}) => render(
    <Router>
        <StateContext.Provider
            value={{ 
                dispatch,
                state: {
                    portalConfig,
                    editGeneralSettings:{
                        editStatus: editStatus,
                    },
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
                    currentPage,
                    portalConfigMap: portalConfigMap,
                    pageType: undefined,
                    nextPage: "/portals",
                    appNotification: null,
                }
            }}
        >
            <ShellPage
                {...props}
            />
        </StateContext.Provider>
    </Router>
);

describe('Shell Page', async () => {
    it('should display disard draft modal when user clicks on close icon in general information', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PAGE",
            url: "/portals/localhost-orcl-C360_ORS/2/page/120012",
        };
        const { getByTestId } = renderPage({ currentPage });

        const closeIcon  = getByTestId('close-button');
        fireEvent.click(closeIcon);
        
        expect(getByTestId('message-box-title')).toBeDefined();
    }, 30000);

    it('should navigate back to previous page when user clicks on close icon', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };
        const { getByTestId } = renderPage({ props, currentPage });

        const closeIcon  = getByTestId('close-button');
        fireEvent.click(closeIcon);
        
        expect(push).toHaveBeenCalledWith('/portals');
    }, 30000);

    it('should open import modal when user clicks on import portal button', async () => {
        const { getByTestId } = renderPage();

        const importPortalButton  = getByTestId('import-portal');
        fireEvent.click(importPortalButton);
        
        expect(getByTestId('import-modal-dialog')).toBeDefined();
    }, 30000);

    it('should display discard draft modal when user clicks on discard draft button', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };        
        const { getByTestId } = renderPage({ currentPage });
        
        const openMenu  = getByTestId('shell-menu-button');
        fireEvent.click(openMenu);

        const discardDraftButton = getByTestId('discard-draft');
        fireEvent.click(discardDraftButton);

        expect(getByTestId('message-box-title')).toBeDefined();
    }, 30000);

    it('should be able to discard draft when user clicks on discard draft button', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({
                portalId: "20019",
                version: 3
            }));
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(portalConfigDefaultData))
            .mockImplementationOnce((url, success) => success(portalPages))

        const { getByTestId } = renderPage({ currentPage });
        
        const openMenu  = getByTestId('shell-menu-button');
        fireEvent.click(openMenu);

        const discardDraftButton = getByTestId('discard-draft');
        fireEvent.click(discardDraftButton);
        fireEvent.click(getByTestId('message-box-action-button'));

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
            pageSettings: {
                id: currentPage.id,
                type: currentPage.type,
            },
        });
        expect(dispatch).toHaveBeenCalled();
    }, 30000);

    it('should disard draft when user clicks on discard button with empty version', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success) => success({}))

        const { getByTestId } = renderPage({ currentPage });
        
        const openMenu  = getByTestId('shell-menu-button');
        fireEvent.click(openMenu);

        const discardDraftButton = getByTestId('discard-draft');
        fireEvent.click(discardDraftButton);
        fireEvent.click(getByTestId('message-box-action-button'));

        expect(dispatch).toHaveBeenCalled();
    }, 30000);

    it('should display error notification when there is error code when user clicks on discard button', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: { errorCode: 'ERROR_MESSAGE' }}}));

        const { getByTestId } = renderPage({ currentPage });
        
        const openMenu  = getByTestId('shell-menu-button');
        fireEvent.click(openMenu);

        const discardDraftButton = getByTestId('discard-draft');
        fireEvent.click(discardDraftButton);
        fireEvent.click(getByTestId('message-box-action-button'));

        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type:  NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            })
        });        
    }, 30000);

    it('should display error notification when there is no error code when user clicks on discard button', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        APIService.deleteRequest = jest.fn()
            .mockImplementationOnce((url, success, failure) => failure({ response: { data: {}}}));

        const { getByTestId } = renderPage({ currentPage });
        
        const openMenu  = getByTestId('shell-menu-button');
        fireEvent.click(openMenu);

        const discardDraftButton = getByTestId('discard-draft');
        fireEvent.click(discardDraftButton);
        fireEvent.click(getByTestId('message-box-action-button'));

        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type:  NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_DELETE_MESSAGE'
                }
            })
        });        
    }, 30000);

    it('should navigate to portal setting general information page', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        const { getByTestId } = renderPage({ currentPage });
        
        const editGeneralSettingsButton = getByTestId('edit-general-settings');
        fireEvent.click(editGeneralSettingsButton);
    }, 30000);

    it('should publish changes when user clicks on publish button', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        APIService.postRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success) => success({
                portalId: "60004",
                version: 3
            }));          
                
        const { getByTestId } = renderPage({ currentPage });
        
        const publishButton = getByTestId('publish-button');
        fireEvent.click(publishButton);   

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.REMOVE_PORTAL_PAGE_SETTINGS,
            pageSettings: {
                id: currentPage.id,
                type: currentPage.type,
            },
        });            
        expect(dispatch).toHaveBeenCalled();
    }, 30000);

    it('should display error notification when user clicks on publish button and there is not error code', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        
        APIService.postRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure) => failure({ response: { data: {}}})); 

        const { getByTestId } = renderPage({ currentPage });
        
        const publishButton = getByTestId('publish-button');
        fireEvent.click(publishButton);         

        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type:  NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            })
        });        
    }, 30000);

    it('should display error notification when user clicks on publish button and there is error code', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        
        APIService.postRequest = jest.fn()
            .mockImplementationOnce((url, formValues, success, failure) => failure({ response: { data: { errorCode: 'ERROR_MESSAGE' }}})); 

        const { getByTestId } = renderPage({ currentPage });
        
        const publishButton = getByTestId('publish-button');
        fireEvent.click(publishButton);         

        await wait(() => {
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type:  NOTIFICATION_TYPE.ERROR,
                    message: 'ERROR_MESSAGE'
                }
            })
        });        
    }, 30000);

    it('should navigate to new page when user clicks on create page button', async () => {
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                    
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        const { getByTestId } = renderPage({ props, currentPage });
        
        const createPageButton = getByTestId('create-page');
        fireEvent.click(createPageButton);

        expect(push).toHaveBeenCalledWith('/portals/localhost-orcl-C360_ORS/2/page/new')
    }, 30000);

    it('should navigate to home page when user clicks on home button in side bar', async () => {
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                    
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PORTAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        const { getAllByTestId } = renderPage({ props, currentPage });
        
        const homeNavigationlink = getAllByTestId('navigation-link');
        fireEvent.click(homeNavigationlink[0]);

        expect(push).toHaveBeenCalledWith('/portals');
    }, 30000);

    it('should navigate to home page when user clicks on home page button from create page screen', async () => {
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                    
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_CREATE_PAGE_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_CREATE_PAGE",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        const { getByTestId, getAllByTestId } = renderPage({ props, currentPage });
        
        const homeNavigationlink = getAllByTestId('navigation-link');
        fireEvent.click(homeNavigationlink[0]);

        const discardModal = getByTestId('message-box-action-button');
        expect(discardModal).toBeDefined();

        fireEvent.click(getByTestId('message-box-action-button'));

        expect(push).toHaveBeenCalledWith('/portals/localhost-orcl-C360_ORS/2');
    }, 30000);

    it('should navigate to home screen when edit status is true', async () => {
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                    
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_GENERAL_localhost-orcl-C360_ORS_2",
            label: ["test", "Customer Portal"],
            type: "LABEL_EDIT_PORTAL_GENERAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        const { getByTestId, getAllByTestId } = renderPage({ props, currentPage, editStatus: true });
        
        const homeNavigationlink = getAllByTestId('navigation-link');
        fireEvent.click(homeNavigationlink[0]);

        const discardModal = getByTestId('message-box-action-button');
        expect(discardModal).toBeDefined();

        fireEvent.click(getByTestId('message-box-action-button'));

        expect(push).toHaveBeenCalledWith('/portals/localhost-orcl-C360_ORS/2');
    }, 30000);

    it('should open discard modal when user clicks on close icon in side bar in general information page', async () => {
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                    
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL_GENERAL_localhost-orcl-C360_ORS_2",
            label: ["test", "Customer Portal"],
            type: "LABEL_EDIT_PORTAL_GENERAL",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        const { getByTestId } = renderPage({ props, currentPage, editStatus: true });
        
        const homeNavigationlink = getByTestId('navigation-list');
        const closeButton = homeNavigationlink.querySelector('button')
        fireEvent.click(closeButton);

        const discardModal = getByTestId('message-box-action-button');
        expect(discardModal).toBeDefined();
    }, 30000);

    it('should open discard modal when user clicks on close icon in create page', async () => {
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };                    
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_CREATE_PAGE_localhost-orcl-C360_ORS_2",
            label: ["Customer Portal"],
            type: "LABEL_CREATE_PAGE",
            url: "/portals/localhost-orcl-C360_ORS/2",
        };

        const { getByTestId } = renderPage({ props, currentPage });
        
        const homeNavigationlink = getByTestId('navigation-list');
        const closeButton = homeNavigationlink.querySelector('button')
        fireEvent.click(closeButton);

        const discardModal = getByTestId('message-box-action-button');
        expect(discardModal).toBeDefined();
    }, 30000);

    it('should display disard draft modal when user clicks on close icon in side bar while editing in general information', async () => {
        const currentPage = {
            icon: "home_icon",
            id: "LABEL_EDIT_PORTAL",
            label: ["Customer Portal"],
            type: "LABEL_EDIT_PAGE",
            url: "/portals/localhost-orcl-C360_ORS/2/page/120012",
        };
        const { getByTestId } = renderPage({ currentPage });

        const homeNavigationlink = getByTestId('navigation-list');
        const closeButton = homeNavigationlink.querySelector('button')
        fireEvent.click(closeButton);

        const discardModal = getByTestId('message-box-action-button');
        expect(discardModal).toBeDefined();
    }, 30000);

    it('should navigate to new portal page when user clicks on create portal button', async () => {
        const push = jest.fn();
        const props = {
            history: {
                push,
            },
            dispatch,
        };        
        const { getByTestId } = renderPage({ props });
        
        const createNewPortalButton  = getByTestId('create-new-portal');
        fireEvent.click(createNewPortalButton);

        expect(push).toHaveBeenCalledWith('/portals/new')
    }, 30000);
});
