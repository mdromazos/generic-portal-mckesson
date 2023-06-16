import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BeFormFieldGroup from '../beFormFieldGroup';
import { beFormFields } from '../__mocks__/index';

const renderComponent = (props) => render(
    <BeFormFieldGroup
        {...props}
    />
);

describe('beFormBuilder > beFormFieldGroup component', () => {

    it('should render beFormFieldGroup without crashing', () => {
        const props = {
            title: 'be form field group title',
            beFormFields: beFormFields,
            selectedField: {},
            selectField: jest.fn(),
            showFormChildren: {},
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.field__group_container').length).toBe(1);
        expect(container.querySelector('.section__title').textContent).toBe(props.title);
        expect(container.querySelectorAll('.field__group__input__box').length).toBe(1);
        expect(container.querySelectorAll('.field__group__items').length).toBe(1);
    });

    it('filter the beFormFields based on the input text in the filter text box', () => {
        const props = {
            title: 'be form field group title',
            beFormFields: beFormFields,
            selectedField: {},
            selectField: jest.fn(),
            showFormChildren: {},
        };
        const { container, getByTestId } = renderComponent(props);
        expect(container.querySelectorAll('.field__inactive').length).toBe(props.beFormFields.length);
        fireEvent.change(getByTestId('field__search__textbox'), { target: { value: 'Company' }});
        expect(container.querySelectorAll('.field__inactive').length).toBe(2);
        fireEvent.change(getByTestId('field__search__textbox'), { target: { value: '' }});
        expect(container.querySelectorAll('.field__inactive').length).toBe(props.beFormFields.length);
    });

});