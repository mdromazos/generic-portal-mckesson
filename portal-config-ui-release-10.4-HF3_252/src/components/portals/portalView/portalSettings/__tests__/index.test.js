import React from 'react';
import { render, fireEvent, wait } from "@testing-library/react";
import { BrowserRouter as Router } from 'react-router-dom';
import { StateContext } from '../../../../../context/stateContext';
import PortalSettings from "../index";
import { generalInformationInitalData, pageSettingsData, portalConfigMapData, currentPageData, generalInformationEditData, pageSettingsEditData, currentPageEditData } from '../__mocks__';
import APIService from '../../../../../utils/apiService';
import CONFIG  from '../../../../../config/config';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('@informatica/archipelago-icons', () => ({
    home_icon: 'home_icon',
}));

const dispatch = jest.fn();
const push = jest.fn();

const defaultProps = {
    history: {
        push,
    }
};

const { ACTIONS, PAGES } = CONFIG;

const renderPage = ({
    props= defaultProps,
    portalConfig= generalInformationInitalData,
    createPortalConfig= generalInformationInitalData,
    pageSettings= pageSettingsData,
    portalConfigMap= portalConfigMapData,
    currentPage= currentPageData,
    isEdit= false,
} = {}) => render(
<Router>
    <StateContext.Provider
        value={{ 
            dispatch,
            state: {
                portalConfig,
                createPortalConfig,
                pageSettings,
                portalConfigMap,
                currentPage,
            }
        }}
    >
        <PortalSettings
            {...props}
            isEdit={isEdit} 
        />
    </StateContext.Provider>
</Router>
);


describe('Portal Settings', async () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });    

    it('should be edit details and click on save button', async () => {
        APIService.putRequest = jest.fn()
            .mockImplementationOnce((url, data, success) => success({
                portalId: "2",
                version: 23
            }));

        const { getByText, queryByTestId } = renderPage({
            portalConfig: generalInformationEditData,
            pageSettings: pageSettingsEditData,
            currentPage: currentPageEditData,
            isEdit: true
        });

        const nextButton = getByText('Next >');
        await wait(() => fireEvent.click(nextButton)); // General Information
        await wait(() => fireEvent.click(nextButton)); // Login
        await wait(() => fireEvent.click(nextButton)); // User management

        await wait();
        const saveButton = queryByTestId('save-button');
        fireEvent.click(saveButton);
        let currentPageInfo = {
            label: ['Customer Portal', PAGES.GENERAL],
            type: PAGES.EDIT_PORTAL_GENERAL,
            url: "/portals/localhost-orcl-C360_ORS/2",
            icon: '/icons/portal.svg',
            id: 'LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2'
        };

        expect(dispatch).toHaveBeenCalledWith({
            type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
            currentPage: currentPageInfo,
        });         
    }, 30000);

});
