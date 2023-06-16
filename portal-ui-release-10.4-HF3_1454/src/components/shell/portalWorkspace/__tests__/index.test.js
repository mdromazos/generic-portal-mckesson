import React from 'react';
import { Router, Route } from 'react-router-dom';
import { StateContext } from '../../../../context/stateContext';
import { portalMetadataStore } from '../../../__mocks__/portal-metadata';
import { portalPages } from "../../../__mocks__/portal-pages";
import { URLMap } from '../../../../utils/urlMappings';
import { cleanup, fireEvent, render } from '@testing-library/react';
import PortalWorkspace from '../index';
import APIService from '../../../../utils/apiService';
import { createMemoryHistory } from 'history';
import * as helperUtils from '../../../../common/helperUtils';

afterEach(cleanup);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../../componentTypes/beFormHandler', () => () => 'beFormHandler');
jest.mock('../../../componentTypes/externalLink', () => () => 'externalLink');
jest.mock('../../../componentTypes/twitterFeed', () => () => 'twitterFeed');
jest.mock('../../../componentTypes/textComponent', () => () => 'textComponent');
jest.mock('../../../userManagement/index', () => () => 'userManagement');
jest.mock("../../../changePassword", () => () => 'changePassword');
jest.mock("../../../componentTypes/portalWizard", () => () => 'portalWizard');

helperUtils.getCookie = jest.fn().mockImplementation((cookieName) => {
    if(cookieName == 'userAuth') {
        return 'true';
    } else {
        return 'abc';
    }
});

const match = {
    params: {
        id: '10',
        orsId: 'orcl-localhost-Supplier',
        pageId: '1400067'
    }
};

describe('Examining Portal Workspace Component', () => {

    const { 123: portalSettings } = portalMetadataStore;

    const mockLayout = portalPages.pages[1];

    const route = `/${match.params.id}/${match.params.orsId}/${match.params.pageId}`;
    const history = createMemoryHistory({ initialEntries: [route] });
    history.push = jest.fn(String);

    APIService.getRequest = jest.fn().mockImplementation((url, success) => {
        if (url === URLMap.getPortalMeta(['portals', match.params.id, 'pages', match.params.pageId], 0, true)) {
            success(mockLayout);
        } else if (url == URLMap.doesUserExist(beName,'xyz')) {
            success([{userName : 'xyz'}]);
        } else {
            success();
        }
    });

    const renderForm = () => render(
        <StateContext.Provider value={[{
            globalSettings: portalSettings.generalSettings,
            pageMetadata: { pages: portalPages.pages },
            notificationActions: { dispatchAppNotification: jest.fn() }
        }]}>
            <Router history={history}>
                <Route path="/:id/:orsId/:pageId" component={PortalWorkspace} />
            </Router>
        </StateContext.Provider>
    );

    it("Fetches layout metdata via Get api and renders a panel with the expected text for each corresponding section child", () => {

        const { container, getByTestId } = renderForm();
        //debug();
        expect(getByTestId('portal-global')).not.toBeNull();
        expect(APIService.getRequest).toHaveBeenCalledTimes(1);
        expect(APIService.getRequest).toHaveBeenCalledWith(
            URLMap.getPortalMeta(['portals', match.params.id, 'pages', match.params.pageId], 0, true),
            expect.any(Function), expect.any(Function),
            URLMap.generateHeader(match.params.orsId, match.params.id)
        );
        let panels = Array.from(container.querySelectorAll('.page-layout-section'));
        expect(panels.length).toBe(mockLayout.layout.sections.length);
    });
});

describe('Testing Portal Workspace Component with user management option', () => {

    const { 123: portalSettings } = portalMetadataStore;

    it("Fetches user details and render portal user table container and on click of add user button should render form", () => {
        const route = `/${match.params.id}/${match.params.orsId}/users`;
        const history = createMemoryHistory({ initialEntries: [route] });
        
        history.push = jest.fn(String);
        APIService.postRequest = jest.fn().mockImplementation((url,payLoad, success) => {
            if (url === URLMap.getProxy()) {
                success({ item : [{prtlUsrNm:'xyz'}]});
            } else {
                success({});
            }
        });

        const { getByTestId, getByText } = render(
            <StateContext.Provider value={[{
                globalSettings: { ...portalSettings.generalSettings, isExternalUserManagementEnabled: false},
                pageMetadata: { pages: portalPages.pages },
                notificationActions: { dispatchAppNotification: jest.fn() }
            }]}>
                <Router history={history}>
                    <Route path="/:id/:orsId/:pageId" component={PortalWorkspace} />
                </Router>
            </StateContext.Provider>
        );
        
        
        expect(APIService.postRequest).toHaveBeenCalledTimes(1);
        expect(APIService.postRequest).toHaveBeenCalledWith(
                URLMap.getProxy(),
                expect.any(Object),
                expect.any(Function), 
                expect.any(Function),
                expect.any(Object)
        );
        expect(getByTestId('portal_table')).not.toBeNull();

        expect(getByTestId('add_user_button')).not.toBeNull();

        fireEvent.click(getByTestId('add_user_button'));

        expect(getByText('userManagement')).not.toBeNull();
    });

    it('should hide add user button when isExternalUserManagementEnabled is true', () => {
        const route = `/${match.params.id}/${match.params.orsId}/users`;
        const history = createMemoryHistory({ initialEntries: [route] });

        const { queryByTestId } = render(
            <StateContext.Provider value={[{
                globalSettings: { ...portalSettings.generalSettings, isExternalUserManagementEnabled: true},
                pageMetadata: { pages: portalPages.pages },
                notificationActions: { dispatchAppNotification: jest.fn() }
            }]}>
                <Router history={history}>
                    <Route path="/:id/:orsId/:pageId" component={PortalWorkspace} />
                </Router>
            </StateContext.Provider>
        );

        
        expect(queryByTestId('add_user_button')).toBeNull();
    });
});