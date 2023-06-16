import React from 'react';
import BeFormHierarchyField from '../BeFormFieldHierarchy';
import { render } from '@testing-library/react';
import { hierarchyData } from '../__mocks__/be-mock-data';

const lookupData = {
    firstRecord: 1,
    item: [{
        label: "Lookup Products and Services",
        productAndServiceCode: "101",
        productAndServiceDesc: "Electronics",
        rowidObject: "1",
    }],
    link: []
};

const getLookupHandler = jest.fn().mockImplementation(() => Promise.resolve(lookupData));

const getOneToManyBEDataHandler = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));

const renderForm = () => render(
    <BeFormHierarchyField 
        beField={hierarchyData} 
        formikProps={{setFieldValue : jest.fn()}} 
        fieldName={"OneToManyGroup."+`${hierarchyData.name}`} 
        disabled={false} 
        getLookupHandler={getLookupHandler} 
        getOneToManyBEDataHandler={getOneToManyBEDataHandler}
    />
);

describe('Testing the BE Form Field Hierarchy component', () => {

    const { getByTestId } = renderForm();

    it('Should render the skeleton for BE form and render the correct heading and labels', () => {
       
        expect(getByTestId("hierarchy-section")).not.toBeNull();
        expect(getByTestId("tree-container")).not.toBeNull();
        expect(getByTestId("tree-container-error")).not.toBeNull();
        //expect(getByTestId("tree-hierarchy")).not.toBeNull();

        expect(getByTestId("hierarchy-section").childNodes[0].textContent).toMatch(hierarchyData.label + (hierarchyData.required?"  * ":""));
        expect(getByTestId("tree-container-error").textContent).toMatch(hierarchyData.sectionError);
        //expect(getByTestId("tree-hierarchy").textContent).toMatch(lookupData.item[0].productAndServiceDesc);
    });

});