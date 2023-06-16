import React from 'react';
import ComponentBuilder from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderComponent = (props) => render(
    <ComponentBuilder
        {...props}
    />
);

describe('Component builder component', () => {
    it('should render component builder component without crashing', async () => {
        const props = {
            component: {
                componentType: "WizardComponent",
                title: "Wizard"
            },
            componentIndex: 0,
            containerIndex: "container_0",
            handleSettingsDisplay: jest.fn(),
            sectionData: [{
                containers: [{
                    components: [{
                        componentType: "WizardComponent",
                        title: "Wizard",
                    }],
                }],
            }],
            sectionIndex: 0,
            setComponentData: jest.fn(),
            setSectionData: jest.fn(),
            openDialogBox: jest.fn(),
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.card-section').length).toBe(1);
        expect(container.querySelector('.d-toolbar__content').children.length).toBe(4);
        expect(container.querySelector('.d-card__header__title').textContent).toBe(props.component.title);
    });

    it('should call openDialogBox callback function when click on settings button', async () => {
        const props = {
            component: {
                componentType: "WizardComponent",
                title: "Wizard"
            },
            componentIndex: 0,
            containerIndex: "container_0",
            handleSettingsDisplay: jest.fn(),
            sectionData: [{
                containers: [{
                    components: [{
                        componentType: "WizardComponent",
                        title: "Wizard",
                    }],
                }],
            }],
            sectionIndex: 0,
            setComponentData: jest.fn(),
            setSectionData: jest.fn(),
            openDialogBox: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.d-toolbar__content').children[0]);
        expect(props.openDialogBox).toHaveBeenCalled();
        expect(props.setComponentData).toHaveBeenCalledWith(props);
    });

    it('should open delete dialogbox when click on delete button', async () => {
        const props = {
            component: {
                componentType: "WizardComponent",
                title: "Wizard"
            },
            componentIndex: 0,
            containerIndex: "container_0",
            handleSettingsDisplay: jest.fn(),
            sectionData: [{
                containers: [{
                    components: [{
                        componentType: "WizardComponent",
                        title: "Wizard",
                    },{
                        componentType: "ExternalLink",
                        title: "External Link", 
                        id: 2,
                    }],
                }],
            }],
            sectionIndex: 0,
            setComponentData: jest.fn(),
            setSectionData: jest.fn(),
            openDialogBox: jest.fn(),
        };
        const { container, getByTestId } = renderComponent(props);
        fireEvent.click(container.querySelector('.d-toolbar__content').children[3]);
        fireEvent.click(getByTestId('message-box-action-button'));
        expect(props.setSectionData).toHaveBeenCalledWith(
            [{
                containers: [{
                    components: [{
                        componentType: "ExternalLink",
                        title: "External Link", 
                        id: 2,
                    }],
                }],
            }]    
        );
    });

    it('should go up when click on up button', async () => {
        const props = {
            component: {
                componentType: "ExternalLink",
                title: "External Link", 
                id: 2,
            },
            componentIndex: 1,
            containerIndex: "container_0",
            handleSettingsDisplay: jest.fn(),
            sectionData: [{
                containers: [{
                    components: [{
                        componentType: "WizardComponent",
                        title: "Wizard",
                        id: 1,
                    },{
                        componentType: "ExternalLink",
                        title: "External Link", 
                        id: 2,
                    }],
                }],
            }],
            sectionIndex: 0,
            setComponentData: jest.fn(),
            setSectionData: jest.fn(),
            openDialogBox: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.d-toolbar__content').children[1]);
        expect(props.setComponentData).toHaveBeenCalledWith(
            [{
                containers: [{
                    components: [{
                        componentType: "ExternalLink",
                        title: "External Link", 
                        id: 2,
                    },{
                        componentType: "WizardComponent",
                        title: "Wizard",
                        id: 1,
                    }],
                }],
            }]
        );
    });

    it('should go down when click on down button', async () => {
        const props = {
            component: {
                componentType: "WizardComponent",
                title: "Wizard",
                id: 1,
            },
            componentIndex: 0,
            containerIndex: "container_0",
            handleSettingsDisplay: jest.fn(),
            sectionData: [{
                containers: [{
                    components: [{
                        componentType: "WizardComponent",
                        title: "Wizard",
                        id: 1,
                    },{
                        componentType: "ExternalLink",
                        title: "External Link", 
                        id: 2,
                    }],
                }],
            }],
            sectionIndex: 0,
            setComponentData: jest.fn(),
            setSectionData: jest.fn(),
            openDialogBox: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.d-toolbar__content').children[2]);
        expect(props.setComponentData).toHaveBeenCalledWith(
            [{
                containers: [{
                    components: [{
                        componentType: "ExternalLink",
                        title: "External Link", 
                        id: 2,
                    },{
                        componentType: "WizardComponent",
                        title: "Wizard",
                        id: 1,
                    }],
                }],
            }]
        );
    });
});