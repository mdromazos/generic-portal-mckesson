import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import BeFormFieldProperties from '../BeFormFieldProperties';
import { selectedBeFormFields } from '../__mocks__/index';
import { bevMetadata } from '../../portals/portalView/userManagementForm/__mocks__';
import APIService from '../../../utils/apiService';
import { APIMap } from '../../../utils/apiMappings';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const renderComponent = (props) => render(
    <BeFormFieldProperties
        {...props}
    />
);

const clearFullCustomAttributesOfField = (selectedBeFormField) => {
    let formField = JSON.parse(JSON.stringify(selectedBeFormField));
    formField.dynamicViewOn = undefined;
    formField.referenceLookupField = undefined;
    formField.enableDependency = false;
    formField.dependentLookup = undefined;
    formField.enableDynamicFields = false;
    formField.dynamicFieldLabel = undefined;
    formField.dynamicFieldType = undefined;
    formField.dynamicFieldMandatoryInd = undefined;
    formField.dynamicFieldValueOptions = undefined;
    formField.dynamicFieldValue = undefined;
    return formField;
};

const clearCustomAttributesOfField = (selectedBeFormField) => {
    let formField = JSON.parse(JSON.stringify(selectedBeFormField));
    formField.referenceLookupField = undefined;
    formField.enableDependency = false;
    formField.dependentLookup = undefined;
    formField.enableDynamicFields = false;
    formField.dynamicFieldLabel = undefined;
    formField.dynamicFieldType = undefined;
    formField.dynamicFieldMandatoryInd = undefined;
    formField.dynamicFieldValueOptions = undefined;
    formField.dynamicFieldValue = undefined;
    return formField;
};

describe('beFormBuilder component', () => {
    beforeEach(() => jest.clearAllMocks());
    it('should render BeFormBuilder with field type string', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "city",
                attributeSelector: "$.object.field[?(@.name==\"city\")]",
                hierarchyName: "city",
                many: false,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "city",
                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                    hierarchyName: "city",
                    many: false,
                    dataType: "String",
                    label: "City",
                    required: true
                },
                fieldType: "textArea",
                required: true
            },
            getLookupTableMetadata: jest.fn(),
            updateFormSectionField: jest.fn()
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input[type="radio"]').length).toBe(2);
        expect(container.querySelectorAll('[class="state"]')[0].textContent).toBe('LABEL_TEXT_FIELD');
        expect(container.querySelectorAll('[class="state"]')[1].textContent).toBe('LABEL_TEXT_BOX');
        fireEvent.click(container.querySelectorAll('input[type="radio"]')[0]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearFullCustomAttributesOfField(props.selectedFormField),
            fieldType: "textField"
        });
    });

    it('should render BeFormBuilder with field type boolean', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "city",
                attributeSelector: "$.object.field[?(@.name==\"city\")]",
                hierarchyName: "city",
                many: false,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "city",
                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                    hierarchyName: "city",
                    many: false,
                    dataType: "Boolean",
                    label: "City",
                    required: true
                },
                fieldType: "radioButton",
                required: true
            },
            getLookupTableMetadata: jest.fn(),
            updateFormSectionField: jest.fn()
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input[type="radio"]').length).toBe(2);
        expect(container.querySelectorAll('[class="state"]')[0].textContent).toBe('LABEL_RADIO_BUTTON');
        expect(container.querySelectorAll('[class="state"]')[1].textContent).toBe('LABEL_CHECKBOX');
        fireEvent.click(container.querySelectorAll('input[type="radio"]')[1]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearFullCustomAttributesOfField(props.selectedFormField),
            fieldType: "checkbox"
        });
    });

    it('should render BeFormBuilder with field type lookup', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "city",
                attributeSelector: "$.object.field[?(@.name==\"city\")]",
                hierarchyName: "city",
                many: false,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "city",
                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                    hierarchyName: "city",
                    many: false,
                    dataType: "lookup",
                    label: "City",
                    required: true
                },
                fieldType: "textField",
                required: true
            },
            getLookupTableMetadata: jest.fn(),
            updateFormSectionField: jest.fn()
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input[type="radio"]').length).toBe(1);
        expect(container.querySelector('[class="state"]').textContent).toBe('LABEL_DROPDOWN');
        fireEvent.click(container.querySelector('input[type="radio"]'));
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearFullCustomAttributesOfField(props.selectedFormField),
            fieldType: "dropdown"
        });
    });

    it('should render BeFormBuilder with field type many', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "city",
                attributeSelector: "$.object.field[?(@.name==\"city\")]",
                hierarchyName: "city",
                many: true,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "city",
                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                    hierarchyName: "city",
                    many: true,
                    dataType: "lookup",
                    label: "City",
                    required: true
                },
                fieldType: "cardView",
                required: true
            },
            getLookupTableMetadata: jest.fn(),
            updateFormSectionField: jest.fn()
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input[type="radio"]').length).toBe(4);
        expect(container.querySelectorAll('[class="state"]')[0].textContent).toBe('LABEL_CARD_VIEW');
        expect(container.querySelectorAll('[class="state"]')[1].textContent).toBe('LABEL_GRID_VIEW');
        expect(container.querySelectorAll('[class="state"]')[2].textContent).toBe('LABEL_MULTI_SELECT_VIEW');
        expect(container.querySelectorAll('[class="state"]')[3].textContent).toBe('LABEL_DYNAMIC_FIELD_VIEW');
        fireEvent.click(container.querySelectorAll('input[type="radio"]')[1]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearFullCustomAttributesOfField(props.selectedFormField),
            fieldType: "gridView"
        });
        fireEvent.click(container.querySelectorAll('input[type="radio"]')[2]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearFullCustomAttributesOfField(props.selectedFormField),
            fieldType: "multiSelectView"
        });
        fireEvent.click(container.querySelectorAll('input[type="radio"]')[3]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearFullCustomAttributesOfField(props.selectedFormField),
            fieldType: "dynamicFieldView"
        });
    });

    it('should render checkboxes for required , hidden and readonly and its actions', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "city",
                attributeSelector: "$.object.field[?(@.name==\"city\")]",
                hierarchyName: "city",
                many: false,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "city",
                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                    hierarchyName: "city",
                    many: false,
                    dataType: "lookup",
                    label: "City",
                },
                fieldType: "textField",
            },
            getLookupTableMetadata: jest.fn(),
            updateFormSectionField: jest.fn()
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input[type="checkbox"]').length).toBe(3);
        expect(container.querySelectorAll('.form__group--stacked')[1].textContent).toBe('LABEL_REQUIRED_FIELD');
        expect(container.querySelectorAll('.form__group--stacked')[2].textContent).toBe('LABEL_HIDDEN_FIELD');
        expect(container.querySelectorAll('.form__group--stacked')[3].textContent).toBe('LABEL_READ_ONLY_FIELD');
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[0]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...props.selectedFormField,
            required: true
        });
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[1]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...props.selectedFormField,
            isHidden: true
        });
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[2]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...props.selectedFormField,
            isReadOnly: true
        });
    });

    it('should render BeFormBuilder with dynamic field view', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "Contact",
                attributeSelector: "$.object.field[?(@.name==\"Contact\")]",
                hierarchyName: "Contact",
                many: true,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "Contact",
                    attributeSelector: "$.object.field[?(@.name==\"Contact\")]",
                    hierarchyName: "Contact",
                    many: false,
                    dataType: "lookup",
                    label: "Contact",
                    required: true
                },
                fieldType: "dynamicFieldView",
                required: true,
                beFormFields: selectedBeFormFields.beFormFields[7].beFormFields.map(field => field.name === 'hmRelTypCd'
                    ? ({ 
                        ...field,
                        many: true, 
                        metadata: { 
                            ...field.metadata, 
                            lookup: {
                                key: "relTypeCd",
                                value: "dispNm",
                                object: "LookupOrgRelType",
                            },
                        }
                    }) : ({...field, many:true })
                ),
                dynamicViewOn: "Contact",
                referenceLookupField: "hmRelTypCd",
                enableDependency: true,
                enableDynamicFields: true,
            },
            updateFormSectionField: jest.fn(),
            getLookupTableMetadata: (lookupFieldName) => new Promise((resolve, reject) => {
                APIService.getRequest(APIMap.getLookupTableMetadata(databaseId, lookupFieldName),
                response => resolve(response),
                error => reject(error),
                { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)});
            }),            
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container, getByTestId } = renderComponent(props);
        expect(container.querySelectorAll('input[type="radio"]').length).toBe(4);
        expect(container.querySelectorAll('[class="state"]')[0].textContent).toBe('LABEL_CARD_VIEW');
        expect(container.querySelectorAll('[class="state"]')[1].textContent).toBe('LABEL_GRID_VIEW');
        expect(container.querySelectorAll('[class="state"]')[2].textContent).toBe('LABEL_MULTI_SELECT_VIEW');
        expect(container.querySelectorAll('[class="state"]')[3].textContent).toBe('LABEL_DYNAMIC_FIELD_VIEW');
        const dropdown_buttons = container.querySelectorAll('[data-testid="dropdown-button"]');
        fireEvent.click(dropdown_buttons[0]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearCustomAttributesOfField(props.selectedFormField),
            dynamicViewOn: 'title',
        });
        fireEvent.click(container.querySelector('input[type="checkbox"]'));
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...clearFullCustomAttributesOfField(props.selectedFormField),
            dynamicViewOn: 'title',
            enableDynamicFields: false,
        });
    });

    it('should render BeFormBuilder with multiSelect view', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "city",
                attributeSelector: "$.object.field[?(@.name==\"city\")]",
                hierarchyName: "city",
                many: true,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "city",
                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                    hierarchyName: "city",
                    many: false,
                    dataType: "lookup",
                    label: "City",
                    required: true
                },
                fieldType: "multiSelectView",
                required: true,
                referenceLookupField: "hmRelTypCd",
                beFormFields: selectedBeFormFields.beFormFields[7].beFormFields.map(field => field.name === 'hmRelTypCd'
                    ? ({ 
                        ...field,
                        metadata: { 
                            ...field.metadata,
                            datatype: 'lookup',
                            lookup: {
                                key: "relTypeCd",
                                value: "dispNm",
                                object: "LookupOrgRelType",
                            },
                        }
                    }) : ({...field, many:true })
                ),
            },
            getLookupTableMetadata: (lookupFieldName) => new Promise((resolve, reject) => {
                APIService.getRequest(APIMap.getLookupTableMetadata(databaseId, lookupFieldName),
                response => resolve(response),
                error => reject(error),
                { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)});
            }), 
            updateFormSectionField: jest.fn()
        };
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const { container, getByTestId } = renderComponent(props);
        expect(container.querySelectorAll('input[type="radio"]').length).toBe(4);
        expect(container.querySelectorAll('[class="state"]')[0].textContent).toBe('LABEL_CARD_VIEW');
        expect(container.querySelectorAll('[class="state"]')[1].textContent).toBe('LABEL_GRID_VIEW');
        expect(container.querySelectorAll('[class="state"]')[2].textContent).toBe('LABEL_MULTI_SELECT_VIEW');
        expect(container.querySelectorAll('[class="state"]')[3].textContent).toBe('LABEL_DYNAMIC_FIELD_VIEW');
        const dropdown_buttons = container.querySelectorAll('[data-testid="dropdown-button"]');
        fireEvent.click(dropdown_buttons[0]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...props.selectedFormField,
            referenceLookupField: 'hmRelTypCd',
        });
    });

    it('should render BeFormBuilder with grid view', () => {
        const props = {
            currentStep: 1,
            selectedFormField: {
                name: "city",
                attributeSelector: "$.object.field[?(@.name==\"city\")]",
                hierarchyName: "city",
                many: true,
                configName: "CustomerOrgRegistrationView",
                configType: "BEView",
                metadata: {
                    name: "city",
                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                    hierarchyName: "city",
                    many: false,
                    dataType: "lookup",
                    label: "City",
                    required: true
                },
                fieldType: "gridView",
                required: true
            },
            getLookupTableMetadata: jest.fn(),
            updateFormSectionField: jest.fn()
        };
        const { container } = renderComponent(props);
        expect(container.querySelectorAll('input[type="checkbox"]').length).toBe(3);
        expect(container.querySelectorAll('.form__group--stacked')[1].textContent).toBe('LABEL_REQUIRED_FIELD');
        expect(container.querySelectorAll('.form__group--stacked')[2].textContent).toBe('LABEL_ALTERNALE_FIELD_VIEW');
        expect(container.querySelectorAll('.form__group--stacked')[3].textContent).toBe('LABEL_ENABLE_VALIDATION');
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[1]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...props.selectedFormField,
            enableAlternateView: true
        });
        fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[2]);
        expect(props.updateFormSectionField).toHaveBeenCalledWith({
            ...props.selectedFormField,
            enableValidation: true
        });
    });

});