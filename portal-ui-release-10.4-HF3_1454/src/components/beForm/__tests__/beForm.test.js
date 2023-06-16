import React from 'react';
import { StateContext } from '../../../context/stateContext';
import { portalMetadataStore } from '../../../components/__mocks__/portal-metadata';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService';
import BEForm from '../beForm';
import { render } from '@testing-library/react';
import { beData} from '../../componentTypes/beFormHandler/__mocks__/be-data';
import { beMeta } from '../__mocks__/be-mock-data';


jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const validateData = jest.fn();
const fileHandler = {
    getFileMetadataHandler : jest.fn(),
    createFileMetadataHandler : jest.fn(),
    uploadFileContentHandler : jest.fn(),
    getFileDownloadLinkHandler : jest.fn()
}
const onSave = jest.fn();
const getLookupHandler = jest.fn();
const getOneToManyBEDataHandler = jest.fn();

//jest.mock('../beFormSection', () => () => 'BE_FORM_SECTION');

/*onSave, validateData, beMeta, beData, dateFormat, dateLocal, maxColumns,
    getLookupHandler, fileHandler, mode, getOneToManyBEDataHandler, skipOriginalCreation = false, history, previewMode = false}, ref)*/

    
jest.mock('../beFormSection', () => ({fileHandler,getLookupHandler}) => {
    //console.log(props)
    /*validateData({name :"abc"}, jest.fn(), jest.fn()); */
    fileHandler.getFileMetadataHandler("storageType", "fileId");
    fileHandler.createFileMetadataHandler("storageType", "fileObj");
    fileHandler.uploadFileContentHandler("storageType", "fileId", "fileObj");
    fileHandler.getFileDownloadLinkHandler ("storageType", "fileId");
    getLookupHandler("http://abc.com/123/xyz");
    /*onSave(
        {data : "abc"},
        {setSubmitting : jest.fn(Boolean)}, 
        jest.fn(),
        jest.fn()
    );
    
    getOneToManyBEDataHandler("fieldName", "paramString");*/

    return 'BE_FORM_SECTION';
});

describe('Testing the BE Form Handler component', () => {

    const { 123: portalSettings } = portalMetadataStore;
    const match = {
        params: {
            id: '1',
            orsId: 'orcl-localhost-Supplier'
        }
    };

    APIService.postRequest = jest.fn().mockImplementation((url,payLoad, success)=> {
            if(payLoad.apiUrl === URLMap.getBEData(match.params.orsId, beMeta.configName, "", 'ACTIVE') && url === URLMap.getProxy()) {
                success(beMeta);
            }else if(payLoad.apiUrl === `${URLMap.validateBE(match.params.orsId, beMeta.configName)}
                ?systemName=${portalSettings.generalSettings.sourceSystem}&validateOnly=true`) {
                success({response : "DONE"});
            }
            else if(url === URLMap.getFileDownloadProxy()) {
                success("response", { 
                    headers : {
                        'content-type' : 'HTML',
                        'content-disposition': 'attachment; filename="filename.jpg"'
                    }
                })
            }
            else {
                success("done");
            }
        }
    );

    const renderForm = () => render(
        <StateContext.Provider value={[{
            notificationActions: { dispatchAppNotification: jest.fn(Object),editStatusAction : jest.fn(Boolean)},
            confirmDialog:{visible : false , nextPageID : "123", type : ""}
        }]}>
            <BEForm history={history} beMeta={beMeta} mode={"READ_EDIT"} onSave={onSave} validateData={validateData} getLookupHandler={getLookupHandler}
                fileHandler={fileHandler} getOneToManyBEDataHandler={getOneToManyBEDataHandler} 
            />
        </StateContext.Provider>
    );

    const {getByText, getByTestId} = renderForm();

    it('Should render the skeleton for BE form', () => {
        
        expect(getByText("BE_FORM_SECTION")).not.toBeNull();
        expect(getByTestId("be_form_edit_button")).not.toBeNull();
    });

    it('Fire the POST API on calling respective functions', () => {
        expect(fileHandler.getFileMetadataHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.createFileMetadataHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.uploadFileContentHandler).toHaveBeenCalledTimes(1);
        expect(fileHandler.getFileDownloadLinkHandler).toHaveBeenCalledTimes(1);
        expect(getLookupHandler).toHaveBeenCalledTimes(1);
        
    });
});