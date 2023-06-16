import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BeFormFields from '../beFormFields';
import { beFormFields } from '../__mocks__/index';

const renderComponent = (props) => render(
    <BeFormFields
        {...props}
    />
);

describe('beFormBuilder > beFormFields component', () => {

    it('should render beFormFields without crashing', () => {
        const props = {
            beFields: beFormFields,
            selectedField: {},
            selectField: jest.fn(),
            showFormChildren: {},
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.field__group').length).toBe(1);
        expect(container.querySelectorAll('.field__inactive').length).toBe(props.beFields.length);
        expect(container.querySelectorAll('.field__mandatory').length).toBe(props.beFields.filter(({ required }) => required).length);
    });

    it('should render child beFormFields when click on arrow besides the field of type many', () => {
        const props = {
            beFields: beFormFields,
            selectedField: {},
            selectField: jest.fn(),
            showFormChildren: {},
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.field__dropdown__arrow'));
        expect(container.querySelectorAll('.field__inactive').length).toBe(props.beFields.length+props.beFields[7].beFormFields.length);
    });

    it('class should be updated when the field is selected', () => {
        const props = {
            beFields: beFormFields,
            selectedField: {},
            selectField: jest.fn(),
            showFormChildren: {},
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.field__inactive').length).toBe(8);
        expect(container.querySelectorAll('.field__active').length).toBe(0);
        fireEvent.click(container.querySelector('.form__field'));
        expect(props.selectField).toHaveBeenCalledWith(props.beFields[0]);
        expect(container.querySelectorAll('.field__inactive').length).toBe(7);
        expect(container.querySelectorAll('.field__active').length).toBe(1);
        fireEvent.click(container.querySelectorAll('.form__field')[7]);
        expect(props.selectField).toHaveBeenCalledWith(props.beFields[7]);
        expect(container.querySelectorAll('.field__inactive').length).toBe(7);
        expect(container.querySelectorAll('.field__active').length).toBe(1);
    });

    it('should render with metadata when isSelectedFields is true', () => {
        const props = {
            beFields: beFormFields.map(field => ({ ...field, metadata: field })),
            isSelectedFields: true,
            selectedField: {},
            selectField: jest.fn(),
            showFormChildren: {},
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.field__group').length).toBe(1);
        expect(container.querySelectorAll('.field__inactive').length).toBe(props.beFields.length);
        expect(container.querySelectorAll('.field__mandatory').length).toBe(props.beFields.filter(({ metadata: { required }}) => required).length);
    });

    it('should not render list when beFields is empty or not present', () => {
        const props = {
            selectedField: {},
            selectField: jest.fn(),
            showFormChildren: {},
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('li').length).toBe(0);
    });
});