import React from 'react';
import BEFormOneToManyTable from '../beFormOneToManyTable';
import { render,act, fireEvent } from '@testing-library/react';
import { OneToManyTableBEField } from '../__mocks__/be-mock-data';


jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('@informatica/archipelago-icons', () => () => 'mocking-archipelago-library');

Element.prototype.scrollTo = () => {} 

const fileHandler = {
    getFileMetadataHandler : jest.fn(),
    createFileMetadataHandler : jest.fn(),
    uploadFileContentHandler : jest.fn(),
    getFileDownloadLinkHandler : jest.fn()
}
const getOneToManyBEDataHandler = jest.fn().mockImplementation(() => Promise.resolve({ data: {},recordCount : 5 }));
const lookupOptionsHandler = jest.fn().mockImplementation(()=> [{text:'abc',value:'abc'},{text:'123',value:'123'}]);
const lookupValueChangeHandler = jest.fn();
const changeViewHandler = jest.fn();
const handleDataValidation = jest.fn();
const formikProps = {
    setFieldValue : jest.fn(String, Object)
}

jest.mock('../beFormField', () => () => 'BE_FORM_FIELD');

describe('Testing the BE Form One to many table component', () => {

    const renderForm = () => render(
        <BEFormOneToManyTable
            beField={OneToManyTableBEField.beField}
            sectionMetaData={OneToManyTableBEField.sectionMetaData}
            index={0}
            fieldName={"OneToManyGroup." + `${OneToManyTableBEField.beField.hierarchyName}`}
            formDisabled={false}
            fileHandler={fileHandler}
            dateFormat={"DD/MM/YYYY"}
            maxColumns={2}
            formikProps={formikProps}
            getOneToManyBEDataHandler={getOneToManyBEDataHandler}
            lookupValueChangeHandler={lookupValueChangeHandler}
            lookupOptionsHandler={lookupOptionsHandler}
            changeViewHandler={changeViewHandler}
            handleDataValidation={handleDataValidation}
        />
    );

    

    it('Should render the label of the table', () => { 
        const {getByText} = renderForm();
        expect(getByText("Documents")).not.toBeNull();
    });

    it('Fire the POST API on calling respective functions', () => {
        const { getByTestId} = renderForm();
        act(() => {
            fireEvent.click(getByTestId('field-controls').children[0]);
        });
        expect(formikProps.setFieldValue).toHaveBeenCalledTimes(2);
    });

});