import React from 'react';
import { StateContext } from '../../../../context/stateContext';
import PortalWizardHandler from '../index';
import { portalMetadataStore } from '../../../__mocks__/portal-metadata';
import { portalPages } from '../__mocks__/wizard-data';
import { render } from '@testing-library/react';
import APIService from '../../../../utils/apiService';
import { URLMap } from '../../../../utils/urlMappings';
import { beData,taskDetails } from '../__mocks__/mock-data';

//jest.mock('../PortalPageWizard', () => () => 'PortalPageWizard');
//jest.mock('../PortalWizardHome', () => () => 'PortalWizardHome');
//jest.mock('../PortalWizardHome', () => () => 'PortalWizardHome');
jest.mock('../../../beForm/beForm', () => () => 'beForm');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('Rendering the Reset Password page component', () => {
    const { 123: portalSettings } = portalMetadataStore;
    const match = {
        params: {
            id: '1',
            orsId: 'orcl-localhost-Supplier'
        }
    };
    const pages_data = portalPages.pages[0].layout.sections[0].containers[0].components[0];

    APIService.postRequest = jest.fn().mockImplementation((url,payload, success) => {
        if (url === URLMap.getProxy() && 
            payload.apiUrl  === URLMap.getBEData(match.params.orsId, pages_data.configName, window.document.cookie.rowId, "ACTIVE,PENDING")
        ) {
            success(beData);
        } else if(payload.apiUrl === URLMap.getTaskList(match.params.orsId, portalSettings.generalSettings.userManagement.beName, 
            "", 
            pages_data.associatedTaskType, 
            "OPEN"
        )){
            success(taskDetails);
        } else if(payload.apiUrl === URLMap.getTaskDetails(match.params.orsId, taskDetails.task[0]["taskId"])){
            success(taskDetails.task[0]);
        } else {
            success({});
        }
    });
    
    const renderForm = () => render(
        <StateContext.Provider value={[{
            globalSettings : portalSettings.generalSettings,
            notificationActions : {dispatchAppNotification : {},removeAppNotification : {}}
        }]}>
            <PortalWizardHandler match={match} beMeta={pages_data} beName={portalSettings.generalSettings.userManagement.beName}/>
        </StateContext.Provider>
    ); 

    it("Fetches layout metdata via Get api and renders a panel with the expected text for each corresponding section child", () => {

        const { container, debug, getByTestId} = renderForm();
        expect(APIService.postRequest).toHaveBeenNthCalledWith(1, URLMap.getProxy(), 
            {   apiUrl : URLMap.getTaskList(match.params.orsId, portalSettings.generalSettings.userManagement.beName, "", pages_data.associatedTaskType, "OPEN"),
                proxyAttribute:"",
                httpMethod:"GET"
            }, 
            expect.any(Function), expect.any(Function), expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(2, URLMap.getProxy(), 
            {   apiUrl : URLMap.getTaskDetails(match.params.orsId, taskDetails.task[0]["taskId"]),
                proxyAttribute:"",
                httpMethod:"GET"
            }, 
            expect.any(Function), expect.any(Function), expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(3, URLMap.getProxy(), 
            {   apiUrl : URLMap.getBEData(match.params.orsId, pages_data.configName, "", "ACTIVE,PENDING"),
                proxyAttribute:"",
                httpMethod:"GET"
            }, 
            expect.any(Function), expect.any(Function), expect.any(Object)
        );
        /*expect(getByTestId('hello')).not.toBeNull();
        let panels = Array.from(container.querySelectorAll('.page-layout'));
        expect(panels.length).toBe(portalPages.pages[0].layout.sections.length);*/
    });

    /*it("Renders the wizard", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('reset_password_page')).not.toBeNull();
    });*/

    

    /*it("Renders the wizard pahe", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('reset_password_title').textContent).toMatch(portalSettings.generalSettings.portalTitle);
    });*/

});