import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BeFormField from '../beFormField';

const renderComponent = (props) => render(
    <BeFormField
        {...props}
    />
);

describe('beFormBuilder > beFormField component', () => {

    it('should render beFormField without crashing', () => {
        const props = {
            formField: {
                label: 'Field Label',
            },
            activeClass: 'field__active',
            onFormFieldClick: jest.fn(),
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.form__field').length).toBe(1);
        expect(container.querySelector('.form__field').textContent).toBe(props.formField.label);
        expect(container.querySelectorAll('.field__mandatory').length).toBe(0);
    });

    it('should render * when required is true', () => {
        const props = {
            formField: {
                label: 'Field Label',
                required: true,
            },
            activeClass: 'field__active',
            onFormFieldClick: jest.fn(),
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('.field__mandatory').length).toBe(1);
        expect(container.querySelector('.field__mandatory').textContent).toBe("*");
    });

    it('should call the callback function "onFormFieldClick" when click on the field', () => {
        const props = {
            formField: {
                label: 'Field Label',
                required: true,
            },
            activeClass: 'field__active',
            onFormFieldClick: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.click(container.querySelector('.form__field'));
        expect(props.onFormFieldClick).toHaveBeenCalled();
    });
});