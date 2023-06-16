import React from 'react';
import RecordPageDesigner from '../index';
import { render, fireEvent, wait } from '@testing-library/react';
import { StateContext } from "../../../../context/stateContext";
import { bevMetadata } from '../../../portals/portalView/userManagementForm/__mocks__/index';
import APIService from '../../../../utils/apiService';

const newBevMetadata = {
    object: {
        ...bevMetadata.object,
        child: [{
            ...bevMetadata.object.child[0],
            field: bevMetadata.object.child[0].field.map(data => data.name === 'prtlUsrRle'
                ? ({ ...data, lookup: { object: "LookupPortalUserRole" } })
                : ({...data })
            ),
        }],
    },
};

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderRecordPageDesigner = (props) => render(
    <StateContext.Provider
        value={{ state: { portalConfig: { generalSettings: { databaseId: props.databaseId }}}}}
    >
        <RecordPageDesigner
            bevMetadata={newBevMetadata}
            bevFormData={props.bevFormData}
            configName={props.configName}
            handleFormUpdate={props.handleFormUpdate}
        />
    </StateContext.Provider>
);

describe('Record page layout design component', () => {
    it('should render recordPageDesigner without crashing', async () => {
        const props = {
            databaseId: 'localhost-orcl-C360_ORS',
            bevFormData: {},
            configName: 'CustomerOrgPortalView',
            handleFormUpdate: jest.fn(),
        };
        const { container } = renderRecordPageDesigner(props);
        expect(container.querySelector('.beFormBuilder__component__container')).not.toBeNull();
    });
    
    it('getLookupTableMetadata is is success', async () => {
        const props = {
            databaseId: 'localhost-orcl-C360_ORS',
            bevFormData: {},
            configName: 'CustomerOrgPortalView',
            handleFormUpdate: jest.fn(),
        };
        const { container, getByTestId } = renderRecordPageDesigner(props);
        await wait();
        expect(container.querySelector('.beFormBuilder__component__container')).not.toBeNull();
        fireEvent.click(container.querySelector('.section__available__controls').children[3]);
        await wait();
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(9);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[8]);
        await wait();
        expect(container.querySelector('.properties__container')).not.toBeNull();
        fireEvent.click(container.querySelector('.properties__container').querySelectorAll('input[type="radio"]')[2]);
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success) => success(bevMetadata));
        const dropdown_buttons = container.querySelectorAll('[data-testid="dropdown-button"]');
        fireEvent.click(dropdown_buttons[0]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
    }, 30000);
    
    it('getLookupTableMetadata is is success', async () => {
        const props = {
            databaseId: 'localhost-orcl-C360_ORS',
            bevFormData: {},
            configName: 'CustomerOrgPortalView',
            handleFormUpdate: jest.fn(),
        };
        const { container, getByTestId } = renderRecordPageDesigner(props);
        await wait();
        expect(container.querySelector('.beFormBuilder__component__container')).not.toBeNull();
        fireEvent.click(container.querySelector('.section__available__controls').children[3]);
        await wait();
        expect(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive').length).toBe(9);
        fireEvent.click(container.querySelector('.section__selected__fields').querySelectorAll('.field__inactive')[8]);
        await wait();
        expect(container.querySelector('.properties__container')).not.toBeNull();
        fireEvent.click(container.querySelector('.properties__container').querySelectorAll('input[type="radio"]')[2]);
        APIService.getRequest = jest
            .fn()
            .mockImplementationOnce((url, success, failed) => failed("error"));
        const dropdown_buttons = container.querySelectorAll('[data-testid="dropdown-button"]');
        fireEvent.click(dropdown_buttons[0]);
        fireEvent.click(getByTestId('dropdown-menu').lastChild);
    }, 30000);
});