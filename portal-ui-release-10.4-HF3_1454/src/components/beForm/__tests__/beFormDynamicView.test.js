import React from 'react';
import BeFormDynamicFieldView from '../beFormDynamicView';
import { render } from '@testing-library/react';
import { dyanamicViewData } from '../__mocks__/be-mock-data';
import * as formUtility from '../beFormUtility'


jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('@informatica/archipelago-icons', () => () => 'mocking-archipelago-library');

formUtility.getFieldValue = jest.fn().mockImplementation( () => {
    return {
        item : [{key : 'valued'}]
    };
});

const fileHandler = {
    getFileMetadataHandler : jest.fn(),
    createFileMetadataHandler : jest.fn(),
    uploadFileContentHandler : jest.fn(),
    getFileDownloadLinkHandler : jest.fn()
};

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
const getOneToManyBEDataHandler = jest.fn().mockImplementation(() => Promise.resolve(dyanamicViewData.oneToManyData));

jest.mock('../beFormOneToManyRowItem', () => ({deleteOneToManyRow}) => {
    deleteOneToManyRow();
    return 'be_Form_One_To_Many_Row_Item'
});
jest.mock('../beFormField', () => () => 'BE_Form_Field');
jest.mock('../beFormDynamicField', () => () => 'Be_Form_Dynamic_Field');

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

describe('Testing the BE Form Handler component', () => {

    const updateBEData = jest.fn();

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

    const lookupDataSet = {
        prdctSrvcCd: [
            {
                text: "Electronics",
                value: "101"
            }
        ],
        questionCode_101: [
            {
                text: "Do you like Electronics Gadgets",
                value: "501"
            }
        ]
    };

    const formikProps = {
        setFieldValue: jest.fn(String, Object)
    }

    const renderForm = () => render(
        <BeFormDynamicFieldView
            beField={dyanamicViewData.beField}
            index={1}
            fieldName={"OneToManyGroup." + `${dyanamicViewData.beField.name}`}
            beData={{}}
            formDisabled={false}
            formikProps={formikProps}
            getLookupHandler={getLookupHandler}
            getOneToManyBEDataHandler={getOneToManyBEDataHandler}
            fileHandler={fileHandler}
            lookupDataSet={lookupDataSet}
            lookupFullDataSet={lookupFullDataSet}
            dateFormat={"DD/MM/YYYY"}
            maxColumns={"2"}
            updateBEData={updateBEData}
            dynamicViewProps={dynamicViewProps}
            parentLookupKeyValue={"101"}
            hideParentStatus={false}
        />
    );

    const {getByText, getByTestId} = renderForm();

    it('Should render the skeleton for BE form Dynamic view', () => { 
        expect(getByText("BE_FORM_ITEMS_NOT_ADDED_MESSAGE")).not.toBeNull();
        expect(getByTestId('one-to-many-header-title').textContent).toMatch(dyanamicViewData.beField.label);
    });
    
    it('deleteOneToManyRow function should be called and invoke formik setFieldValue method', () => { 
        expect(formikProps.setFieldValue).toHaveBeenCalledTimes(2);
    });

});