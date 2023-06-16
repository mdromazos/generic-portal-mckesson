import React from 'react';
import BEFormSection from '../BEFormSection';
import { render } from '@testing-library/react';
import { beMeta } from '../__mocks__/be-mock-data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const fileHandler = {
    getFileMetadataHandler : jest.fn(),
    createFileMetadataHandler : jest.fn(),
    uploadFileContentHandler : jest.fn(),
    getFileDownloadLinkHandler : jest.fn()
}
const getLookupHandler = jest.fn();

const formikProps= {
    touched: {},
    errors: {}
}

jest.mock('../beFormOneToManyGroup', () => () => 'beFormOneToManyGroup');
jest.mock('../beFormFieldHierarchy', () => () => 'beFormFieldHierarchy');
jest.mock('../beFormDynamicView', () => () => 'beFormDynamicView');

jest.mock('../beFormField', () => ({fileHandler,lookupOptionsHandler,lookupValueChangeHandler}) => {
    fileHandler.getFileMetadataHandler("storageType", "fileId");
    fileHandler.createFileMetadataHandler("storageType", "fileObj");
    fileHandler.uploadFileContentHandler("storageType", "fileId", "fileObj");
    fileHandler.getFileDownloadLinkHandler ("storageType", "fileId");
    lookupOptionsHandler({name : 'abc'});
    lookupValueChangeHandler(
        {dependents : ["SupplierPortalView.test","SupplierPortalView.abc"]}, 
        {value : '123'}
    );
    return 'be_Form_Field';
});

describe('Testing the BE Form Handler component', () => {

    const renderForm = () => render(
        <BEFormSection sectionMetaData={beMeta.beFormSections[0]} formDisabled={true} metaConfigName={beMeta.configName}
            getLookupHandler={getLookupHandler} fileHandler={fileHandler} formikProps={formikProps}
        />
    );

    const {getByText, getByTestId} = renderForm();

    it('Should render the skeleton for BE form', () => {
        expect(getByText("Additional Details")).not.toBeNull();
        expect(getByText("be_Form_FieldbeFormOneToManyGroup")).not.toBeNull();
    });

    it('Fire the POST API on calling respective functions', () => {
        expect(fileHandler.getFileMetadataHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.createFileMetadataHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.uploadFileContentHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.getFileDownloadLinkHandler).toHaveBeenCalledTimes(1);
    });

});