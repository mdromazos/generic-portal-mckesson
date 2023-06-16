import React from 'react';
import { portalMetadataStore } from '../../../components/__mocks__/portal-metadata';
import BEFormOneToManyGroup from '../BEFormOneToManyGroup';
import { act, fireEvent, render, wait } from '@testing-library/react';
import { oneToManyGroupData } from '../__mocks__/be-mock-data';
import * as formUtility from '../beFormUtility'


jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('@informatica/archipelago-icons', () => () => 'helloai');

jest.mock('../beFormField', () => () => 'BE_FORM_FIELD');
jest.mock('../beFormOneToManyRowItem', () => ({deleteOneToManyRow}) => {
    deleteOneToManyRow();
    return 'be_Form_One_To_Many_Row_Item'
});

formUtility.getFieldValue = jest.fn().mockImplementation( () => {
    return {
        item : [{key : 'valued'}]
    };
});

const fileHandler = {
    getFileMetadataHandler: jest.fn(),
    createFileMetadataHandler: jest.fn(),
    uploadFileContentHandler: jest.fn(),
    getFileDownloadLinkHandler: jest.fn()
};
const onSave = jest.fn();
const getLookupHandler = jest.fn().mockImplementation(() => Promise.resolve(lookupData));
const getOneToManyBEDataHandler = jest.fn().mockImplementation(() => Promise.resolve(data));
const updateBEData = jest.fn();
const handleDataValidation = jest.fn();


const data = {
    firstRecord: 1,
    item: [
        {
            PostalAddress_consolidationInd: 4,
            PostalAddress_createDate: "2020-08-20T19:42:19.464+05:30",
            PostalAddress_creator: "admin",
            PostalAddress_hubStateInd: 1,
            PostalAddress_interactionId: "140010000000",
            PostalAddress_lastRowidSystem: "PORTAL        ",
            PostalAddress_lastUpdateDate: "2020-12-03T16:19:44.450+05:30",
            PostalAddress_rowidObject: "3             ",
            PostalAddress_updatedBy: "avos/admin",
            addrLn1: "2100 SEAPORT BLVD",
            city: "REDWOOD CITY",
            cnsntInd: false,
            cntryCd:
            {
                consolidationInd: 4,
                countryCode: "US",
                countryDesc: "United States",
                createDate: "2020-08-20T12:41:57.315+05:30",
                creator: "admin",
                hubStateInd: 1,
                label: "Lookup Country",
                lastRowidSystem: "LOOKUP        ",
                lastUpdateDate: "2020-08-20T12:41:57.315+05:30",
                link: [{}, {}, {}],
                rowidObject: "228           ",
                updatedBy: "admin"
            },
            consolidationInd: 4,
            county: "SAN MATEO",
            createDate: "2020-08-20T19:42:19.464+05:30",
            creator: "admin",
            hmRelTypCd: "Organization Address",
            hubStateInd: 1,
            interactionId: "140010000000",
            label: "Address",
            lastRowidSystem: "PORTAL        ",
            lastUpdateDate: "2020-12-03T16:19:44.519+05:30",
            link: [{}, {}, {}],
            prmryInd: true,
            pstlAddrTyp:
            {
                addressType: "Shipping",
                addressTypeDesc: "Shipping",
                consolidationInd: 4,
                createDate: "2020-08-20T12:42:59.303+05:30",
                creator: "admin",
                hubStateInd: 1,
                label: "Lookup Postal Address Type",
                lastRowidSystem: "LOOKUP        ",
                lastUpdateDate: "2020-08-20T12:42:59.303+05:30",
                link: [{}, {}, {}],
                rowidObject: "6             ",
                updatedBy: "admin"
            },
            pstlCd: "94063-5596",
            rowidObject: "3             ",
            state: {
                link: [{}, {}, {}],
                rowidObject: "6             ",
                creator: "admin",
                createDate: "2020-08-20T12:43:10.733+05:30",
                updatedBy: "admin"
            },
            updatedBy: "avos/admin",
            vldtnMsg: "Valid Address"
        }
    ],
    link: [{}, {}],
    pageSize: 1000,
    recordCount: 1,
    searchToken: "multi"
};

const lookupData = {
    firstRecord: 1,
    item:[
        { id: "Cell", label: "Cell" },
        { id: "Fax", label: "Fax" },
        { id: "Marine", label: "Marine" },
        { id: "Pager", label: "Pager" },
        { id: "Telephone", label: "Telephone" }
    ],
    pageSize: 2147483647,
    recordCount: 0,
    searchToken: "SVR1.GIE7"
};

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

describe('Testing the BE Form Handler component', () => {

    const { 123: portalSettings } = portalMetadataStore;
    const match = {
        params: {
            id: '1',
            orsId: 'orcl-localhost-Supplier'
        }
    };

    /**
     * Mocking the POST call post render of the BE Form component
     * 
    
      beField, sectionMetaData, index, fieldName, isChild, beData, formDisabled, formikProps, metaConfigName,
    getLookupHandler, getOneToManyBEDataHandler, fileHandler, dateFormat, maxColumns, manyDt,
    locale, updateBEData, view, parentDataPath = "", handleDataValidation, groupValidationErrors, manyLevel = 0, previewMode =  false
    */

    const formikProps = {
        setFieldValue: jest.fn(String, Object),
        setFieldError: jest.fn(String, Object),
        setFieldTouched: jest.fn(String, Object)
    };

    const renderForm = () => render(

        <BEFormOneToManyGroup beField={oneToManyGroupData.beField}
            sectionMetaData={oneToManyGroupData.sectionMetaData}
            index={0}
            fieldName={"OneToManyGroup." + `${oneToManyGroupData.beField.name}`}
            isChild={false}
            beData={{}}
            formDisabled={false}
            formikProps={formikProps}
            metaConfigName={"SupplierPortalView"}
            getLookupHandler={getLookupHandler}
            getOneToManyBEDataHandler={getOneToManyBEDataHandler}
            fileHandler={fileHandler}
            dateFormat={"DD/MM/YYYY"}
            maxColumns={2}
            updateBEData={updateBEData}
            view={"cardView"}
            handleDataValidation={handleDataValidation}
            groupValidationErrors={{}}
        />

    );

    

    it('Should render the skeleton for BE form', () => {
        const { getByText, getByTestId } = renderForm();
        expect(getByText("BE_FORM_ITEMS_NOT_ADDED_MESSAGE")).not.toBeNull();
        expect(getByTestId('one-to-many-header-title').textContent).toMatch(oneToManyGroupData.beField.label);
    });

    it('Should render the skeleton for BE form',async () => {
        const { getByTestId } = renderForm();
        expect(getByTestId("field-controls")).not.toBeNull();
        expect(formikProps.setFieldError).toHaveBeenCalledTimes(1);
        expect(formikProps.setFieldTouched).toHaveBeenCalledTimes(1);
        expect(formikProps.setFieldValue).toHaveBeenCalledTimes(2);
        
        act(()=> {
            fireEvent.click(getByTestId("field-controls").childNodes[0]);
        });
        await wait(()=> {
            expect(formikProps.setFieldValue).toHaveBeenCalledTimes(7);
        });
        
    });

});