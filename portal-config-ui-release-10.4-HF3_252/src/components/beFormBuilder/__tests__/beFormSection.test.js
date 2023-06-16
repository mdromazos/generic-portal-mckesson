import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import BeFormSection from '../BeFormSection';
import { beFormFields, selectedBeFormFields } from '../__mocks__/index';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const renderComponent = (props) => render(
    <BeFormSection
        {...props}
    />
);

describe('beFormBuilder > BeFormSection component', () => {
    it('should render BeFormSection without crashing', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: {
                beFormFields: [],
                hideName: false,
                name: "",
                order: 0,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.section__container__main').length).toBe(1);
        expect(container.querySelector('.section__available__fields')).not.toBeNull();
        expect(container.querySelector('.section__available__fields').querySelector('.section__title').textContent).toBe('LABEL_AVAILABLE_FIELD');
        expect(container.querySelector('.section__available__controls')).not.toBeNull();
        expect(container.querySelector('.section__available__controls').children.length).toBe(4);
        expect(container.querySelector('.section__selected__fields')).not.toBeNull();
        expect(container.querySelector('.section__selected__fields').querySelector('.section__title').textContent).toBe('LABEL_SELECTED_FIELD');
        expect(container.querySelector('.section__selected__controls')).not.toBeNull();
        expect(container.querySelector('.section__selected__controls').children.length).toBe(4);
    }, 30000);

    it('section header form intraction', () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: {
                beFormFields: [],
                hideName: false,
                name: "",
                order: 0,
            },
            beFormMetadata: {
                beFormFields: [],
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        fireEvent.change(container.querySelectorAll('input')[0]);
        fireEvent.blur(container.querySelectorAll('input')[0], { target: { value: 'Section new title' }});
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...props.beFormSection,
            name: 'Section new title'
        });
        fireEvent.click(container.querySelectorAll('input')[1]);
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...props.beFormSection,
            hideName: true,
        });
        fireEvent.click(container.querySelectorAll('input')[1]);
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...props.beFormSection,
            hideName: false,
        });
        fireEvent.click(container.querySelector('.section__header__controls').children[0]);
        expect(props.moveSectionUp).toHaveBeenCalledWith(props.beFormSection.order);
        fireEvent.click(container.querySelector('.section__header__controls').children[1]);
        expect(props.moveSectionDown).toHaveBeenCalledWith(props.beFormSection.order);
        fireEvent.click(container.querySelector('.section__header__controls').children[2]);
        expect(props.deleteSection).toHaveBeenCalledWith(props.beFormSection.order);
        fireEvent.click(container.querySelector('.section__header__controls').children[3]);
        expect(props.addNewSection).toHaveBeenCalled();
    });

    it('should move a one to one field from the left field group to right field group when select a field and click on > button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: {
                beFormFields: [],
                hideName: false,
                name: "",
                order: 0,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container  } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(8);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(0);
        fireEvent.click(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive')[0]);
        fireEvent.click(container.querySelector('.section__available__controls').children[0]);
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...selectedBeFormFields,
            beFormFields:[selectedBeFormFields.beFormFields[0]]
        });
        fireEvent.click(container.querySelector('.section__available__fields').querySelector('.field__dropdown__arrow'));
        fireEvent.click(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive')[10]);
        fireEvent.click(container.querySelector('.section__available__controls').children[0]);
    }, 30000);

    it('should move a one to many field from the left field group to right field group when select a field and click on > button', async () => {
        const selectedFields = {
            ...selectedBeFormFields,
            beFormFields: [{
                ...selectedBeFormFields.beFormFields[7],
                beFormFields: [{
                    ...selectedBeFormFields.beFormFields[7].beFormFields[0],
                }],
            }],
        };
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container  } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(8);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(1);
        fireEvent.click(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive')[7]);
        fireEvent.click(container.querySelector('.section__available__controls').children[0]);
    }, 30000);

    it('should move a one to one field under one to many field from the left field group to right field group when select a field and click on > button while one to one field under one to many is already selected', async () => {
        const selectedFields = {
            ...selectedBeFormFields,
            beFormFields: [{
                ...selectedBeFormFields.beFormFields[7],
                beFormFields: [{
                    ...selectedBeFormFields.beFormFields[7].beFormFields[0],
                }],
            }],
        };
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container  } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(8);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(1);
        fireEvent.click(container.querySelector('.section__available__fields').querySelector('.field__dropdown__arrow'));
        fireEvent.click(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive')[10]);
        fireEvent.click(container.querySelector('.section__available__controls').children[0]);
    }, 30000);

    it('should move all fields from the left field group to right field group when click on >> button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: {
                beFormFields: [],
                hideName: false,
                name: "",
                order: 0,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(8);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(0);
        fireEvent.click(container.querySelector('.section__available__controls').children[3]);
        expect(props.updateBeFormSection).toHaveBeenCalledWith(selectedBeFormFields);
    }, 30000);

    it('should move a single field from the right field group to left field group when select a field and click on < button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedBeFormFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(0);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(8);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[0]);
        fireEvent.click(container.querySelector('.section__available__controls').children[1]);
        const selectedFields = JSON.parse(JSON.stringify(selectedBeFormFields));
        selectedFields.beFormFields.shift();
        expect(props.updateBeFormSection).toHaveBeenCalledWith(selectedFields);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelector('.field__dropdown__arrow'));
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[10]);
        fireEvent.click(container.querySelector('.section__available__controls').children[1]);
    }, 30000);

    it('should move all fields from the right field group to left field group when click on << button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedBeFormFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(0);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(8);
        fireEvent.click(container.querySelector('.section__available__controls').children[3]);
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...selectedBeFormFields,
            beFormFields: [],
        });
    }, 30000);

    it('should move selected field top when click on move top button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedBeFormFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(0);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(8);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[5]);
        fireEvent.click(container.querySelector('.section__selected__controls').children[0]);
        const selectedFields = JSON.parse(JSON.stringify(selectedBeFormFields.beFormFields));
        const selectedField = selectedFields.splice(5,1);
        selectedFields.unshift(...selectedField);
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...selectedBeFormFields,
            beFormFields: selectedFields,
        });
    }, 30000);

    it('should move selected field up when click on move up button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedBeFormFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(0);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(8);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[4]);
        fireEvent.click(container.querySelector('.section__selected__controls').children[1]);
        const selectedFields = JSON.parse(JSON.stringify(selectedBeFormFields.beFormFields));
        [selectedFields[3], selectedFields[4]] = [selectedFields[4], selectedFields[3]];
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...selectedBeFormFields,
            beFormFields: selectedFields,
        });
    }, 30000);

    it('should move selected field down when click on move down button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedBeFormFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(0);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(8);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[6]);
        fireEvent.click(container.querySelector('.section__selected__controls').children[2]);
        const selectedFields = JSON.parse(JSON.stringify(selectedBeFormFields.beFormFields));
        [selectedFields[6], selectedFields[7]] = [selectedFields[7], selectedFields[6]];
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...selectedBeFormFields,
            beFormFields: selectedFields,
        });
    }, 30000);

    it('should move selected field bottom when click on move bottom button', async () => {
        const props = {
            configName: 'CustomerOrgRegistrationView',
            configType: 'BEView',
            beFormSection: selectedBeFormFields,
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            addNewSection: jest.fn(),
            deleteSection: jest.fn(),
            currentStep: 0,
            moveSectionUp: jest.fn(),
            moveSectionDown: jest.fn(),
            updateBeFormSection: jest.fn(),
            setSelectedFormSection: jest.fn(),
            setSelectedFormField: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelector('.section__available__fields').querySelectorAll('.field__inactive').length).toBe(0);
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(8);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[3]);
        fireEvent.click(container.querySelector('.section__selected__controls').children[3]);
        const selectedFields = JSON.parse(JSON.stringify(selectedBeFormFields.beFormFields));
        const selectedField = selectedFields.splice(3,1);
        selectedFields.push(...selectedField);
        expect(props.updateBeFormSection).toHaveBeenCalledWith({
            ...selectedBeFormFields,
            beFormFields: selectedFields,
        });
    }, 30000);

});