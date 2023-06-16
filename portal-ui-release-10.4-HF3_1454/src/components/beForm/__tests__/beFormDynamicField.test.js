import React from 'react';
import { StateContext } from '../../../context/stateContext';
import { portalMetadataStore } from '../../../components/__mocks__/portal-metadata';
import BeFormDynamicField from '../beFormDynamicField';
import { render } from '@testing-library/react';
import { beData} from '../../componentTypes/beFormHandler/__mocks__/be-data';
import { dyanamicFieldData } from '../__mocks__/be-mock-data';
import * as Moment from 'moment';
import * as DC from '@informatica/droplets-core';

global.URL.createObjectURL = jest.fn();

//Moment.locale = jest.fn();
/*DC.withFormik = jest.fn(() => () => {
    return {
        Checkbox: jest.fn(),
        Dropdown: jest.fn(),
        Error: jest.fn(),
        Field: jest.fn(),
        FilePicker: jest.fn(),
        Group: jest.fn(),
        Input: jest.fn(),
        Label: jest.fn(),
        Radio: jest.fn()
    }
});*/


jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

//jest.mock('@informatica/droplets-core', () => () => 'hellodc');
jest.mock('@informatica/archipelago-icons', () => () => 'helloai');
jest.mock('react-widgets', () => () => 'hellodc');
jest.mock('react-widgets-moment', () => () => 'hellodc');
//jest.mock('moment', () => () => 'hellodc');


const fileHandler = {
    getFileMetadataHandler : jest.fn(),
    createFileMetadataHandler : jest.fn(),
    uploadFileContentHandler : jest.fn(),
    getFileDownloadLinkHandler : jest.fn()
}
const onSave = jest.fn();
const lookupValueChangeHandler = jest.fn();
const getOneToManyBEDataHandler = jest.fn();

//jest.mock('../beFormSection', () => () => 'BE_FORM_SECTION');

/*jest.mock('../beFormOneToManyGroup', () => (props) => {
    console.log(props); 
    return 'beFormOneToManyGroup';
});
jest.mock('../beFormField', () => ({fileHandler,lookupOptionsHandler,lookupValueChangeHandler}) => {
    //console.log(props);
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
jest.mock('../beFormFieldHierarchy', () => () => 'beFormFieldHierarchy');
jest.mock('../beFormDynamicView', () => () => 'beFormDynamicView');

/*jest.mock('../beFormSection', () => ({fileHandler,getLookupHandler}) => {
    //console.log(props)
    /*validateData({name :"abc"}, jest.fn(), jest.fn()); 
    
    /*onSave(
        {data : "abc"},
        {setSubmitting : jest.fn(Boolean)}, 
        jest.fn(),
        jest.fn()
    );
    
    getOneToManyBEDataHandler("fieldName", "paramString");

    return 'BE_FORM_SECTION';
});*/

const formikProps = {
    setFieldValue : jest.fn(String, Object),
    touched: {},
    values:{},
    errors:{}
}

describe('Testing the BE Form Handler component', () => {

    const { 123: portalSettings } = portalMetadataStore;
    const match = {
        params: {
            id: '1',
            orsId: 'orcl-localhost-Supplier'
        }
    };

    //const beFields = beMeta.beFormSections[0].beFormFields[1];

    const handleDataValidation = jest.fn();

    /**
     * Mocking the POST call post render of the BE Form component
     * 
    beField, fieldName, isChild, formDisabled, deleteOneToManyRow,
    children, rowIndex, handleDataValidation, formikProps, groupValidationErrors
    */

    const lookupFullDataSet = [
        {
            answerType: "Lookup",
            label: "Lookup Questions",
            lookupOptions: "'Yes','No'",
            mandatoryInd: "N",
            questionCode: "501",
            questionDesc: "Do you like Electronics Gadgets",
            rowidObject: "1             ",
        }
    ];

    const dynamicViewProps = {
        dependentLookup: "questionCode",
        dynamicFieldLabel: "questionDesc",
        dynamicFieldMandatoryInd: "mandatoryInd",
        dynamicFieldType: "answerType",
        dynamicFieldValue: "answer",
        dynamicFieldValueOptions: "lookupOptions",
        dynamicViewOn: "ProductServicesAnswer",
        enableDependency: true,
        enableDynamicFields: true,
        parentLookupField: {
            applyNullValues: false,
            configName: "SupplierPortalView",
            configType: "BEView",
            dataType: "lookup",
            dependents: ["SupplierPortalView.ProductsAndServices.questionCode"],
            fieldType: "dropdown",
            filterable: true,
            hierarchyName: "ProductsAndServices.prdctSrvcCd",
            isReadOnly: true,
            label: "Product and Service Code"
        },
        referenceLkpField: {
            applyNullValues: false,
            configName: "SupplierPortalView",
            configType: "BEView",
            dataType: "lookup",
            fieldType: "dropdown",
            filterable: true,
            hierarchyName: "ProductsAndServices.ProductServicesAnswer.question",
            isHidden: true,
            label: "Question",
            name: "question"
        },
        referenceLookupField: "question"
    };

    const referenceLookupField = {
        applyNullValues: false,
        configName: "SupplierPortalView",
        configType: "BEView",
        dataType: "lookup",
        fieldType: "dropdown",
        filterable: true,
        hierarchyName: "ProductsAndServices.ProductServicesAnswer.question",
        isHidden: true,
        label: "Question",
        lookup: { object: "LookupQuestions", key: "questionCode", value: "questionDesc" },
        name: "question",
        operations:
        {
            create: { allowed: true },
            read: { allowed: true },
            update: { allowed: true }
        },
        readOnly: false,
        required: false,
        sortable: true,
        system: false,
        trust: false
    }

    const renderForm = () => render(
        
            <BeFormDynamicField 
                beField={dyanamicFieldData.beField} 
                formDisabled={false}
                formikProps={formikProps}
                lookupValueChangeHandler={lookupValueChangeHandler}
                maxColumns={2}
                lookupOptions= {{}}
                lookupFullDataSet={lookupFullDataSet}
                dynamicViewProps={dynamicViewProps}
                refLookupFieldVal={"501"}
                referenceLookupField={referenceLookupField}
                index={"2_0_0"}
                manyDt={
                    {
                        parentName: "OneToManyGroup.ProductsAndServices.item[0].ProductServicesAnswer",
                        row: 0
                    }
                }
                locale={undefined}
                dateFormat={"DD/MM/YYYY"}
            />
       
    );

    const {getByText, getByTestId} = renderForm();

    it('Should render the skeleton for BE form', () => { 
        expect(getByText("Hello")).not.toBeNull();
        //expect(getByText("be_Form_Field")).not.toBeNull();
    });

    /*it('Fire the POST API on calling respective functions', () => {
        expect(handleDataValidation).toHaveBeenCalledTimes(1);
        expect(fileHandler.createFileMetadataHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.uploadFileContentHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.getFileDownloadLinkHandler).toHaveBeenCalledTimes(1);
    });*/

});