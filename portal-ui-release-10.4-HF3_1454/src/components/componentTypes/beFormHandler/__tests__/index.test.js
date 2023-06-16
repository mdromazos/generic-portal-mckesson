import React from 'react';
import { StateContext } from '../../../../context/stateContext';
import { portalMetadataStore } from '../../../__mocks__/portal-metadata';
import { URLMap } from '../../../../utils/urlMappings';
import APIService from './../../../../utils/apiService';
import BEFormHandler from '../index';
import { render } from '@testing-library/react';
import { beMeta } from '../__mocks__/be-data';
import * as FileSaver from 'file-saver';

global.URL.createObjectURL = jest.fn();

FileSaver.saveAs = jest.fn();

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../../beForm/beForm', () => ({validateData,fileHandler,onSave,getLookupHandler,getOneToManyBEDataHandler}) => {
    validateData({name :"abc"}, jest.fn(), jest.fn()); 
    fileHandler.getFileMetadataHandler("storageType", "fileId");
    fileHandler.createFileMetadataHandler("storageType", "fileObj");
    fileHandler.uploadFileContentHandler("storageType", "fileId", "fileObj");
    fileHandler.getFileDownloadLinkHandler ("storageType", "fileId");
    onSave(
        {data : "abc"},
        {setSubmitting : jest.fn(Boolean)}, 
        jest.fn(),
        jest.fn()
    );
    getLookupHandler("http://abc.com/123/xyz");
    getOneToManyBEDataHandler("fieldName", "paramString");

    return 'BE_form_component';
});

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
     */
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
            globalSettings: portalSettings.generalSettings,
            notificationActions: { dispatchAppNotification: jest.fn(Object)},
        }]}>
            <BEFormHandler match={match} history={history} beMeta={beMeta} mode={"READ_EDIT"} />
        </StateContext.Provider>
    );

    const {getByText} = renderForm();

    it('Should render the skeleton for BE form', () => {
        
        expect(getByText("BE_form_component")).not.toBeNull();
    });

    it('Fire the POST API on calling respective functions', () => {
        expect(APIService.postRequest).toHaveBeenCalledTimes(10);
    });

    it('Fire the POST API with correct parameters', () => {

        expect(APIService.postRequest).toHaveBeenNthCalledWith(1,URLMap.getProxy(), 
            { 
                apiUrl : URLMap.getBEData(match.params.orsId, beMeta.configName, "", 'ACTIVE'),
                httpMethod : "GET",
                proxyAttribute : ""
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(2,URLMap.getProxy(), 
            { 
                apiUrl : `${URLMap.validateBE(match.params.orsId, beMeta.configName)}?systemName=${portalSettings.generalSettings.sourceSystem}&validateOnly=true`,
                httpMethod : "POST",
                proxyAttribute : "",
                payload: expect.any(Object)
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(3,URLMap.getProxy(), 
            { 
                apiUrl : URLMap.getFileMetadata(match.params.orsId, "storageType", "fileId"),
                httpMethod : "GET",
                proxyAttribute : ""
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(4,URLMap.getFileUploadProxy(), 
            { 
                apiUrl : URLMap.createFileMetadata(match.params.orsId, "storageType"),
                httpMethod : "POST",
                proxyAttribute : "",
                payload:"fileObj"
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(5,URLMap.getFileUploadProxy(), 
            expect.any(Object),expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(6,URLMap.getFileDownloadProxy(), 
            { 
                apiUrl : URLMap.uploadFileContent(match.params.orsId, "storageType", "fileId"),
                httpMethod : "GET",
                proxyAttribute : ""
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(7,URLMap.getProxy(), 
            { 
                apiUrl : `${URLMap.postBEData(match.params.orsId, beMeta.configName, "")}&systemName=${portalSettings.generalSettings.sourceSystem}`,
                httpMethod : "POST",
                proxyAttribute : "",
                payload: {data : "abc"}
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(8,URLMap.getProxy(), 
            { 
                apiUrl : URLMap.getBEData(match.params.orsId, beMeta.configName, "", 'ACTIVE'),
                httpMethod : "GET",
                proxyAttribute : ""
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(9,URLMap.getProxy(), 
            { 
                apiUrl : "/123/xyz",
                httpMethod : "GET",
                proxyAttribute : ""
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
        expect(APIService.postRequest).toHaveBeenNthCalledWith(10,URLMap.getProxy(), 
            { 
                apiUrl : URLMap.getBEDataForOneToMany(match.params.orsId,beMeta.configName,"",
                    'fieldName','paramString','ACTIVE'
                ),
                httpMethod : "GET",
                proxyAttribute : ""
            },
            expect.any(Function),expect.any(Function),expect.any(Object)
        );
       
    });
});