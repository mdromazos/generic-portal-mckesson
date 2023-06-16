import React from 'react';
import BEFormField from '../beFormField';
import { render } from '@testing-library/react';
import { beMeta } from '../__mocks__/be-mock-data';
import { oneToManyGroupData } from '../__mocks__/be-mock-data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../upload/fileUploader', () => () => 'file_upload');

const fileHandler = {
    getFileMetadataHandler : jest.fn(),
    createFileMetadataHandler : jest.fn(),
    uploadFileContentHandler : jest.fn(),
    getFileDownloadLinkHandler : jest.fn()
}
const getLookupHandler = jest.fn();

const formikProps = {
    setFieldValue: jest.fn(String, Object)
}

describe('Testing the BE Form Handler component', () => {

    const renderForm = () => render(
        <BEFormField 
            beField={oneToManyGroupData.beField.beFormFields[3]} 
            formDisabled={true} 
            metaConfigName={beMeta.configName}
            getLookupHandler={getLookupHandler} 
            fileHandler={fileHandler}
            formikProps={formikProps}
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