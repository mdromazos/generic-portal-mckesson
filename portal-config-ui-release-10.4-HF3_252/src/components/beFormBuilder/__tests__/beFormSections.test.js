import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import BeFormSections from '../BeFormSections';
import { beFormFields, selectedBeFormFields } from '../__mocks__/index';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const renderComponent = (props) => render(
    <BeFormSections
        {...props}
    />
);

describe('beFormBuilder > BeFormSections component', () => {
    it('should render BeFormSections without crashing', async () => {
        const props = {
            beFormData: {
                beFormSections: [{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 0,
                },{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 1,
                }],
                componentType: "BeFormComponent",
                configName: 'CustomerOrgRegistrationView',
                configType: 'BEView',
                maxColumns: 2,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            currentStep: 0,
            setBeFormData: jest.fn(),
            setSelectedFormField: jest.fn(),
            setSelectedFormSection: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.builder__body').length).toBe(1);
        expect(container.querySelectorAll('.section__container__main').length).toBe(2);
        expect(container.querySelector('.builder__heading_title').textContent).toBe('LABEL_FIELDS');
    }, 30000);

    it('should call the call back function with new section when click on + button in the section header', async () => {
        const props = {
            beFormData: {
                beFormSections: [{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 0,
                },{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 1,
                }],
                componentType: "BeFormComponent",
                configName: 'CustomerOrgRegistrationView',
                configType: 'BEView',
                maxColumns: 2,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            currentStep: 0,
            setBeFormData: jest.fn(),
            setSelectedFormField: jest.fn(),
            setSelectedFormSection: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.section__container__main').length).toBe(2);
        fireEvent.click(container.querySelector('.section__container__main').querySelector('.section__header__controls').children[3]);
        expect(props.setBeFormData).toHaveBeenCalledWith({
            ...props.beFormData,
            beFormSections: [
                ...props.beFormData.beFormSections,
                {
                    name:"",
                    order: 2,
                    beFormFields: []
                },
            ],
        });
    }, 30000);

    it('should call the callback function with new section data after section removal when click on x button in the section header', async () => {
        const props = {
            beFormData: {
                beFormSections: [{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 0,
                },{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 1,
                }],
                componentType: "BeFormComponent",
                configName: 'CustomerOrgRegistrationView',
                configType: 'BEView',
                maxColumns: 2,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            currentStep: 0,
            setBeFormData: jest.fn(),
            setSelectedFormField: jest.fn(),
            setSelectedFormSection: jest.fn(),
        };
        const { container, getByTestId } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.section__container__main').length).toBe(2);
        fireEvent.click(container.querySelector('.section__container__main').querySelector('.section__header__controls').children[2]);
        expect(getByTestId('message-box-content-title').textContent).toBe("LABEL_DELETE_SECTION_DIALOG_TITLE");
        fireEvent.click(getByTestId('message-box-action-button'));
        expect(props.setBeFormData).toHaveBeenCalledWith({
            ...props.beFormData,
            beFormSections: [props.beFormData.beFormSections[1]],
        });
    }, 30000);

    it('should render cannot delete the section dialogBox when single section is present', async () => {
        const props = {
            beFormData: {
                beFormSections: [{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 0,
                }],
                componentType: "BeFormComponent",
                configName: 'CustomerOrgRegistrationView',
                configType: 'BEView',
                maxColumns: 2,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            currentStep: 0,
            setBeFormData: jest.fn(),
            setSelectedFormField: jest.fn(),
            setSelectedFormSection: jest.fn(),
        };
        const { container, getByTestId } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.section__container__main').length).toBe(1);
        fireEvent.click(container.querySelector('.section__container__main').querySelector('.section__header__controls').children[2]);
        expect(getByTestId('message-box-content-title').textContent).toBe("LABEL_DELETE_SECTION_DIALOG_FAILURE_TITLE");
        fireEvent.click(getByTestId('message-box-cancel-button'));
        expect(props.setBeFormData).not.toHaveBeenCalled();
    }, 30000);

    it('should move the section down when click on down arrow button in the section header', async () => {
        const props = {
            beFormData: {
                beFormSections: [{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 0,
                },{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 1,
                }],
                componentType: "BeFormComponent",
                configName: 'CustomerOrgRegistrationView',
                configType: 'BEView',
                maxColumns: 2,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            currentStep: 0,
            setBeFormData: jest.fn(),
            setSelectedFormField: jest.fn(),
            setSelectedFormSection: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.section__container__main').length).toBe(2);
        fireEvent.click(container.querySelector('.section__container__main').querySelector('.section__header__controls').children[1]);
        expect(props.setBeFormData).toHaveBeenCalledWith({
            ...props.beFormData,
            beFormSections: [props.beFormData.beFormSections[1], props.beFormData.beFormSections[0]],
        });
    }, 30000);

    it('should move the section up when click on up arrow button in the section header', async () => {
        const props = {
            beFormData: {
                beFormSections: [{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 0,
                },{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 1,
                }],
                componentType: "BeFormComponent",
                configName: 'CustomerOrgRegistrationView',
                configType: 'BEView',
                maxColumns: 2,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            currentStep: 0,
            setBeFormData: jest.fn(),
            setSelectedFormField: jest.fn(),
            setSelectedFormSection: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.section__container__main').length).toBe(2);
        fireEvent.click(container.querySelectorAll('.section__container__main')[1].querySelector('.section__header__controls').children[0]);
        expect(props.setBeFormData).toHaveBeenCalledWith({
            ...props.beFormData,
            beFormSections: [props.beFormData.beFormSections[1], props.beFormData.beFormSections[0]],
        });
    }, 30000);

    it('should cal the call back function setBeFormData when update the section name in sectionHeader', async () => {
        const props = {
            beFormData: {
                beFormSections: [{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 0,
                },{
                    beFormFields: [],
                    hideName: false,
                    name: "",
                    order: 1,
                }],
                componentType: "BeFormComponent",
                configName: 'CustomerOrgRegistrationView',
                configType: 'BEView',
                maxColumns: 2,
            },
            beFormMetadata: {
                beFormFields: beFormFields,
                name: "CustomerOrgRegistrationView",
                label: "Customer Org Registration View",
            },
            currentStep: 0,
            setBeFormData: jest.fn(),
            setSelectedFormField: jest.fn(),
            setSelectedFormSection: jest.fn(),
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.section__container__main').length).toBe(2);
        fireEvent.change(container.querySelectorAll('.section__container__main')[1].querySelectorAll('input')[0]);
        fireEvent.blur(container.querySelectorAll('.section__container__main')[1].querySelectorAll('input')[0], { target: { value: 'Section new title' }});
        expect(props.setBeFormData).toHaveBeenCalledWith({
            ...props.beFormData,
            beFormSections: [props.beFormData.beFormSections[0], { ...props.beFormData.beFormSections[1], name: 'Section new title'}],
        });
    }, 30000);
});