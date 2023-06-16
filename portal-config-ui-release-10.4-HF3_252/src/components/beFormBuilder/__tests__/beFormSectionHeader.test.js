import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BeFormSectionHeader from '../BeFormSectionHeader';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const renderComponent = (props) => render(
    <BeFormSectionHeader
        {...props}
    />
);

describe('beFormBuilder > BeFormSectionHeader component', () => {

    it('should render BeFormSectionHeader without crashing', () => {
        const props = {
            beFormSection: {
                beFormFields: [],
                hideName: true,
                name: "My section",
                order: 0,
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeSectionField: jest.fn(),
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.section__header__name').length).toBe(1);
        expect(container.querySelectorAll('input').length).toBe(2);
        expect(container.querySelectorAll('input')[0].value).toBe(props.beFormSection.name);
        expect(container.querySelectorAll('input')[1].checked).toBe(props.beFormSection.hideName);
        expect(container.querySelectorAll('.section__header__controls').length).toBe(1);
        expect(container.querySelector('.section__header__controls').children.length).toBe(4);
    });

    it('should call the callback function moveSectionUp when click on UP arrow button', () => {
        const props = {
            beFormSection: {
                beFormFields: [],
                hideName: true,
                name: "My section",
                order: 1,
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeSectionField: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.section__header__controls').children[0]);
        expect(props.moveSectionUp).toHaveBeenCalledWith(props.beFormSection.order);
    });

    it('should call the callback function moveSectionDown when click on DOWN arrow button', () => {
        const props = {
            beFormSection: {
                beFormFields: [],
                hideName: true,
                name: "My section",
                order: 2,
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeSectionField: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.section__header__controls').children[1]);
        expect(props.moveSectionDown).toHaveBeenCalledWith(props.beFormSection.order);
    });

    it('should call the callback function deleteSection when click on DELETE button', () => {
        const props = {
            beFormSection: {
                beFormFields: [],
                hideName: true,
                name: "My section",
                order: 3
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeSectionField: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.section__header__controls').children[2]);
        expect(props.deleteSection).toHaveBeenCalledWith(props.beFormSection.order);
    });

    it('should call the callback function addNewSection when click on PLUS button', () => {
        const props = {
            beFormSection: {
                beFormFields: [],
                hideName: true,
                name: "My section",
                order: 4
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeSectionField: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.section__header__controls').children[3]);
        expect(props.addNewSection).toHaveBeenCalled();
    });

    it('header form field intraction', () => {
        const props = {
            beFormSection: {
                beFormFields: [],
                hideName: false,
                name: "My section",
                order: 3
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeSectionField: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.change(container.querySelectorAll('input')[0]);
        fireEvent.blur(container.querySelectorAll('input')[0], { target: { value: 'Section new title' }});
        expect(props.updateBeSectionField).toHaveBeenCalledWith('SECTION_NAME', 'Section new title');
        fireEvent.click(container.querySelectorAll('input')[1]);
        expect(props.updateBeSectionField).toHaveBeenCalledWith('HIDE_SECTION_NAME', true);
        fireEvent.click(container.querySelectorAll('input')[1]);
        expect(props.updateBeSectionField).toHaveBeenCalledWith('HIDE_SECTION_NAME', false);
    });

});