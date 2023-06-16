import React from 'react';
import ComponentSettings from '../index';
import { fireEvent, render, wait } from '@testing-library/react';
import { StateContext } from '../../../../context/stateContext';
import APIService from '../../../../utils/apiService';
import CONFIG from '../../../../config/config';

const { ACTIONS, NOTIFICATION_TYPE } = CONFIG;

jest.mock('../twitterFeedSettings', () => () => <div data-testid="component-identifier">Twitter Feed Settings</div>);
jest.mock('../textSettings', () => () => <div data-testid="component-identifier">Text Settings</div>);
jest.mock('../generalSettings', () => () => <div data-testid="component-identifier">General Settings</div>);
jest.mock('../product360CatalogSettings', () => () => <div data-testid="component-identifier">Product 360 Catalog Settings</div>);
jest.mock('../product360CatalogUploadSettings', () => () => <div data-testid="component-identifier">Product 360 Catalog Upload Settings</div>);
jest.mock('../product360TimelineSettings', () => () => <div data-testid="component-identifier">Product 360 Timeline Settings</div>);
jest.mock('../product360TaskViewSettings', () => () => <div data-testid="component-identifier">Product 360 Taskview Settings</div>);

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const dispatch = jest.fn();

const renderComponent = (props) => render(
    <StateContext.Provider
        value={{ 
            dispatch: dispatch,
            state: { portalConfig: { generalSettings: { beName: 'CustomerOrg', databaseId: 'localhost-orcl-C360_ORS' } }}
        }}
    >
        <ComponentSettings
            {...props}
        />
    </StateContext.Provider>
);

describe('Component settings component', () => {
    it('switch between general and component tabs', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "TextComponent",
                    title: "Text Component",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByTestId('component-identifier').textContent).toBe('Text Settings');
        fireEvent.click(getByText('LABEL_GENERAL'));
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
    });
    it('should render wizard settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "WizardComponent",
                    title: "Wizard",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId, debug } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        APIService.getRequest = jest.fn()
            .mockImplementationOnce((url, success) => success(["CustomerOrgPortalView","CustomerOrgRegistrationView","CustomerOrgView"]));
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByText('Wizard LABEL_COMPONENT_SETTING_CONFIGURATION')).not.toBeNull();
        fireEvent.click(getByText('LABEL_INCLUDE_OVERVIEW_STEP'));
        fireEvent.click(getByTestId('component-settings-save-button'));
    });
    it('should render external link settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "ExternalLink",
                    title: "External Link",
                },
                sectionIndex: 0,
                sectionData: [{
                    containers: [{
                        components: [{
                            componentType: "ExternalLink",
                            title: "External Link",
                        }],
                    }],
                }],
                containerIndex: "container_0",
                componentIndex: 0,
                setSectionData: jest.fn(),
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        fireEvent.change(getByTestId('external-link-setting-url'), { target: { value: 'http://google.com?params=xyz' }});
        fireEvent.click(getByTestId('external-link-setting-hasBEName'));
        fireEvent.click(getByTestId('external-link-setting-hasBERowid'));
        fireEvent.submit(getByTestId('component-settings-form'));
        await wait(() => {
            expect(props.componentData.setSectionData).toHaveBeenCalled();
            expect(props.settingsDisplayDialogBox.close).toHaveBeenCalled();
            expect(dispatch).toHaveBeenCalledWith({
                type: ACTIONS.ADD_APP_NOTIFICATION,
                notificationConfig: {
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: 'LABEL_COMPONENT_SETTINGS'
                }
            });
        });
    });
    it('should render twitter feed settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "TwitterComponent",
                    title: "Twitter Component",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByTestId('component-identifier').textContent).toBe('Twitter Feed Settings');
        fireEvent.click(getByTestId('component-settings-save-button'));
    });
    it('should render text settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "TextComponent",
                    title: "Text Component",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByTestId('component-identifier').textContent).toBe('Text Settings');
        fireEvent.click(getByTestId('component-settings-save-button'));
    });
    it('should render Product 360 Catalogs settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "Product360CatalogsComponent",
                    title: "Product 360 Catalogs Component",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByTestId('component-identifier').textContent).toBe('Product 360 Catalog Settings');
        fireEvent.click(getByTestId('component-settings-save-button'));
    });
    it('should render Product 360 Catalog Upload settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "Product360CatalogUploadComponent",
                    title: "Product 360 Catalog Upload Component",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByTestId('component-identifier').textContent).toBe('Product 360 Catalog Upload Settings');
        fireEvent.click(getByTestId('component-settings-save-button'));
    });
    it('should render Product 360 Timeline settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "Product360TimelineComponent",
                    title: "Product 360 Timeline Component",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByTestId('component-identifier').textContent).toBe('Product 360 Timeline Settings');
        fireEvent.click(getByTestId('component-settings-save-button'));
    });
    it('should render Product 360 Task View settings component', async () => {
        const props = {
            componentData: {
                component: {
                    componentType: "Product360TaskViewComponent",
                    title: "Product 360 Task View Component",
                },
            },
            settingsDisplayDialogBox: {
                closed: false,
                open: jest.fn(),
                close: jest.fn(),
            },
        };
        const { container, getByText, getByTestId } = renderComponent(props);
        expect(container.querySelector('.component__settings__dialog')).not.toBeNull();
        expect(getByTestId('component-identifier').textContent).toBe('General Settings');
        fireEvent.click(getByText('LABEL_COMPONENT'));
        expect(getByTestId('component-identifier').textContent).toBe('Product 360 Taskview Settings');
        fireEvent.click(getByTestId('component-settings-save-button'));
    });
});