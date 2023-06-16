import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import BeFormBuilder from '../BeFormBuilder';
import { beFormFields, selectedBeFormFields } from '../__mocks__/index';
import { bevMetadata } from '../../portals/portalView/userManagementForm/__mocks__';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

const renderComponent = (props) => render(
    <BeFormBuilder
        {...props}
    />
);

describe('beFormBuilder component', () => {
    it('should render BeFormBuilder without crashing', async () => {
        const props = {
            beFormBuilderData: {},
            beFieldsMetaModel: bevMetadata,
            saveFormData: jest.fn(),
            configName: 'CustomerOrgRegistrationView',
            componentType: 'BeFormComponent',
            maxColumns: 2,
            configType: 'BEView',
            getLookupTableMetadata: jest.fn(),
            currentStep: 0,
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.beFormBuilder__component__container').length).toBe(1);
        expect(container.querySelector('.builder__container')).not.toBeNull();
        expect(container.querySelector('.properties__container')).not.toBeNull();
    }, 30000);

    it('should render BeFormBuilder properties when click on selected field in rightside box', async () => {
        const props = {
            beFormBuilderData: {},
            beFieldsMetaModel: bevMetadata,
            saveFormData: jest.fn(),
            configName: 'CustomerOrgRegistrationView',
            componentType: 'BeFormComponent',
            maxColumns: 2,
            configType: 'BEView',
            getLookupTableMetadata: jest.fn(),
            currentStep: 0,
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.beFormBuilder__component__container').length).toBe(1);
        expect(container.querySelector('.builder__container')).not.toBeNull();
        fireEvent.click(container.querySelector('.section__available__controls').children[3]);
        await wait();
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(9);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[0]);
        await wait();
        expect(container.querySelector('.properties__container')).not.toBeNull();
    }, 30000);

    it('should call the call back function when field property changes', async () => {
        const props = {
            beFormBuilderData: {},
            beFieldsMetaModel: bevMetadata,
            saveFormData: jest.fn(),
            configName: 'CustomerOrgRegistrationView',
            componentType: 'BeFormComponent',
            maxColumns: 2,
            configType: 'BEView',
            getLookupTableMetadata: jest.fn(),
            currentStep: 0,
        };
        const { container } = renderComponent(props);
        await wait();
        expect(container.querySelectorAll('.beFormBuilder__component__container').length).toBe(1);
        expect(container.querySelector('.builder__container')).not.toBeNull();
        fireEvent.click(container.querySelector('.section__available__controls').children[3]);
        await wait();
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(9);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[0]);
        await wait();
        expect(container.querySelector('.properties__container')).not.toBeNull();
        expect(container.querySelector('.properties__container').querySelectorAll('input[type="radio"]').length).toBe(2);
        fireEvent.click(container.querySelector('.properties__container').querySelectorAll('input[type="radio"]')[1]);
        expect(props.saveFormData).toHaveBeenCalled();
    }, 30000);

});