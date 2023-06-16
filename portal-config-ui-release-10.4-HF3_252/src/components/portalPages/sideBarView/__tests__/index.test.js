import React from 'react';
import SideBarView from '../index';
import { fireEvent, render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const renderSidebar = (props) => render(
    <SideBarView
        cssClassName='cssClassName'
        closeSideBar={props.closeSideBar}
        addComponent={props.addComponent}
    />
);

describe('Sidebar view component', () => {
    it('should render the sidebar with all components listed', async () => {
        const props = {
            closeSideBar: jest.fn(),
            addComponent: jest.fn(),
        };
        const { container } = renderSidebar(props);
        expect(container.querySelectorAll('.data-panel').length).toBe(8);
    });
    it('should toggle the add button for corresponding component section when mouse enters/leaves', async () => {
        const props = {
            closeSideBar: jest.fn(),
            addComponent: jest.fn(),
        };
        const { container, debug } = renderSidebar(props);
        expect(container.querySelectorAll('.data-panel')[0].querySelector('.button-icon')).toBeNull();
        fireEvent.mouseEnter(container.querySelectorAll('.data-panel')[0]);
        debug();
        expect(container.querySelectorAll('.data-panel')[0].querySelector('.button-icon')).not.toBeNull();
        fireEvent.mouseLeave(container.querySelectorAll('.data-panel')[0]);
        expect(container.querySelectorAll('.data-panel')[0].querySelector('.button-icon')).toBeNull();
    });
    it('should call the addComponent function when click on the add button in the hovered component', async () => {
        const props = {
            closeSideBar: jest.fn(),
            addComponent: jest.fn(),
        };
        const { container } = renderSidebar(props);
        expect(container.querySelectorAll('.data-panel')[0].querySelector('.button-icon')).toBeNull();
        fireEvent.mouseEnter(container.querySelectorAll('.data-panel')[0]);
        fireEvent.click(container.querySelectorAll('.data-panel')[0].querySelector('.button-icon'));
        expect(props.addComponent).toHaveBeenCalledWith({
            label: "LABEL_COMPONENT_WIZARD",
            type: "WizardComponent"
        });
    });
    it('should close the sidebar when click on close button', async () => {
        const props = {
            closeSideBar: jest.fn(),
            addComponent: jest.fn(),
        };
        const { container } = renderSidebar(props);
        fireEvent.click(container.querySelector('.shell-header-close-icon'));
        expect(props.closeSideBar).toHaveBeenCalled();
    });
});