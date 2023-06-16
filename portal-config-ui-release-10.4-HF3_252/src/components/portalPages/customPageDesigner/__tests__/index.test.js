import React from 'react';
import ComponentBuilder from '../index';
import { fireEvent, render } from '@testing-library/react';
import { sectionTemplates } from '../__mocks__/index';

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

describe('Custome Page designer component', () => {
    it('should render sidebar component', async () => {
        const props = {
            sectionData: [{
                containers: [{
                    components: [{
                        componentType: "WizardComponent",
                        title: "Wizard",
                    }],
                    id: "_KSJVAZh6Eeu4VfPjI833iw",
                    style: {
                        width: 1
                    },
                }],
                displayIcon: "rectangle",
                isDefault: false,
                sectionType: "Section-Type 1",
            }],
            sectionTemplates: sectionTemplates,
            setSectionData: jest.fn(),
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.side-bar-div-closed').length).toBe(1);
        fireEvent.mouseOver(container.querySelector('.layout__section'));
        fireEvent.click(container.querySelector('.layout__container__add__component').querySelector('button'));
        expect(container.querySelectorAll('.side-bar-div-open').length).toBe(1);
        fireEvent.click(container.querySelector('.shell-header-close-icon'));
    });

    it('should add a corresponding component when click on + button in sidebar component item', async () => {
        const props = {
            sectionData: [{
                containers: [{
                    id: "_KSJVAZh6Eeu4VfPjI833iw",
                    style: {
                        width: 1
                    },
                }],
                displayIcon: "rectangle",
                isDefault: false,
                sectionType: "Section-Type 1",
            }],
            sectionTemplates: sectionTemplates,
            setSectionData: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.mouseOver(container.querySelector('.layout__section'));
        fireEvent.click(container.querySelector('.layout__container__add__component').querySelector('button'));
        fireEvent.mouseEnter(container.querySelectorAll('.data-panel')[0]);
        fireEvent.click(container.querySelectorAll('.data-panel')[0].querySelector('.button-icon'));
        expect(props.setSectionData).toHaveBeenCalledWith(
            [{
                containers: [{
                    components: [{
                        componentType: "WizardComponent",
                        title: "LABEL_COMPONENT_WIZARD"
                    }],
                    id: "_KSJVAZh6Eeu4VfPjI833iw",
                    style: {
                        width: 1
                    }
                }],
                displayIcon: "rectangle",
                isDefault: false,
                sectionType: "Section-Type 1"
            }]
        );
    });
    
    it('should render component settings when click on setting icon', async () => {
        const props = {
            sectionData: [{
                containers: [{
                    components: [{
                        componentType: "ExternalLink",
                        title: "External Link",
                    }],
                    id: "_KSJVAZh6Eeu4VfPjI833iw",
                    style: {
                        width: 1
                    },
                }],
                displayIcon: "rectangle",
                isDefault: false,
                sectionType: "Section-Type 1",
            }],
            sectionTemplates: sectionTemplates,
            setSectionData: jest.fn(),
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.component__settings__dialog').length).toBe(0);
        fireEvent.click(container.querySelector('.aicon__settings'));
        expect(container.querySelectorAll('.component__settings__dialog').length).toBe(1);
    });
});