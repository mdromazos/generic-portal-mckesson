import React, { useState, useEffect,useContext} from 'react';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService';
import BEForm from "../../beForm/beForm";
import { StateContext } from '../../../context/stateContext';
import '@informatica/droplets-core/dist/themes/archipelago/components/form.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/button.css';
import { useTranslation } from "react-i18next";
import CONFIG from './../../../config/config';
import {base64StringToBlob} from 'blob-util';
import { saveAs } from 'file-saver';

const BEFormHandler = ({match, beMeta, mode, maxColumns, activePageName, history}) => {

    const [ initialData, setInitialData ] = useState(undefined);
    const [{ globalSettings: { sourceSystem },notificationActions : { dispatchAppNotification }}] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const {
        LOOKUP_PROXY_PAYLOAD:{ API_URL, HTTP_METHOD, PROXY_ATTRIBUTE }, PROXY_PAYLOAD,
        HTTP_METHOD:{ GET, POST, PUT }, DEFAULT_FILENAME, RECORD_STATE : {ACTIVE, PENDING},
        CONSTANTS: { NOTIFICATION_ERROR, NOTIFICATION_SUCCESS }, BE_FORM_MODES, BE_FIELDS
    } = CONFIG;

    useEffect(() => {
        fetchBEData();
    }, []);

    const getRowId = () => {
        return decodeURIComponent(document.cookie.match(/rowId=([^;]*)/) ? document.cookie.match(/rowId=([^;]*)/)[1]:'');
    };

    const handleBeFormSave = (values, actions, onSaveSuccess, onSaveFailure) => {
        actions.setSubmitting(true);

        let payLoad = {};
        let rowId = getRowId();
        let apiUrl = URLMap.postBEData(match.params.orsId, beMeta.configName, rowId);
        payLoad[API_URL] = `${apiUrl}&systemName=${sourceSystem}`;
        payLoad[HTTP_METHOD] = POST;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        payLoad[PROXY_PAYLOAD] = values;
        APIService.postRequest(URLMap.getProxy(), payLoad, () => {
            fetchBEData();
            onSaveSuccess();
            dispatchAppNotification(translate("LABEL_BEFORM_SAVED_SUCCESSFULLY", { PORTAL_PAGE: `${activePageName}` }),
                NOTIFICATION_SUCCESS);
        }, ({response:{ data:{errorCode, errorData} }}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
            if(errorData) {
                onSaveFailure(errorData);
            }
        }, {[CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId });
    };

    const handleDataValidation = (values, successCallback, failureCallback) => {
        let dataToValidate = {...values, rowidObject: getRowId()};
        let payLoad = {};
        let rowId = getRowId();
        let apiUrl = URLMap.validateBE(match.params.orsId, beMeta.configName);
        payLoad[API_URL] = `${apiUrl}?systemName=${sourceSystem}&validateOnly=true`;
        payLoad[HTTP_METHOD] = POST;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        payLoad[PROXY_PAYLOAD] = dataToValidate;

        APIService.postRequest(
            URLMap.getProxy(),
            payLoad,
            (response) => {
                dispatchAppNotification(translate("VALIDATION_SUCCESS_MESSAGE"), NOTIFICATION_SUCCESS);
                successCallback(response);
            }, ({response:{data:{errorCode, errorData}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
                } else {
                    dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
                }
                if(errorData) {
                    failureCallback(errorData);
                }
            }, { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
        );
    };

    const fetchBEData = function(){
        const successCallback = (response) => {
            setInitialData(response);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
        };
        let rowId = getRowId();
        let payLoad = {};
        const recordState = `${ACTIVE},${PENDING}`;
        payLoad[API_URL] = URLMap.getBEDataPendingProtected(match.params.orsId, beMeta.configName, rowId, recordState);
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        APIService.postRequest(URLMap.getProxy(), payLoad,
            successCallback,
            failureCallback,
            { 
                [CONFIG.PORTAL_ID_HEADER]: match.params.id, 
                [CONFIG.ORS_ID]: match.params.orsId 
            }
        );
    };

    const getLookupHandler = (lookupUrl) => {
        let lookUpUrl = new URL(lookupUrl);
        let payLoad = {};
        let {pathname, search} = lookUpUrl;
        payLoad[API_URL] = `${pathname + search}`;
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = getRowId();
        return new Promise((resolve, reject) => {
            APIService.postRequest(URLMap.getProxy(),payLoad,
                (response) => {
                    resolve(response);
                },
                (error) => {
                    reject(error);
                },
                { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
                );
        });
    };

    const getOneToManyBEDataHandler = (fieldName, paramString) => {
        let rowId = getRowId();
        let payLoad = {};

        payLoad[API_URL] = URLMap.getBEDataForOneToManyPendingProtected(
            match.params.orsId,
            beMeta.configName,
            rowId,
            fieldName,
            paramString,
            `${ACTIVE},${PENDING}`
        );
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        return new Promise((resolve, reject) => {
            APIService.postRequest(URLMap.getProxy(),payLoad,
                (response) => {
                    resolve(response);
                },
                (error) => {
                    reject(error);
                },
                { 
                    [CONFIG.PORTAL_ID_HEADER]: match.params.id, 
                    [CONFIG.ORS_ID]: match.params.orsId 
                }
            );
        });
    };

    const fileHandler = {
        getFileMetadataHandler: (storageType, fileId) => {
            let payLoad = {};
            payLoad[API_URL] =URLMap.getFileMetadata(match.params.orsId, storageType, fileId);
            payLoad[HTTP_METHOD] = GET;
            payLoad[PROXY_ATTRIBUTE] = getRowId();
            return new Promise((resolve, reject) => {
                APIService.postRequest(URLMap.getProxy(), payLoad,
                    (response) => {
                        resolve(response);
                    },
                    (error) => {
                        reject(error);
                    },
                    { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
                    );
            })
        },
        createFileMetadataHandler: (storageType, fileObj) => {
            let payLoad = {};
            payLoad[API_URL] =URLMap.createFileMetadata(match.params.orsId, storageType);
            payLoad[HTTP_METHOD] = POST;
            payLoad[PROXY_ATTRIBUTE] = getRowId();
            payLoad[PROXY_PAYLOAD] = fileObj;
            return new Promise((resolve, reject) => {
                APIService.postRequest(
                    URLMap.getFileUploadProxy(),
                    payLoad,
                    (response) => {
                        resolve(response);
                    },
                    (error) => {
                        reject(error);
                    },
                    { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
                );
            })
        },
        uploadFileContentHandler: (storageType, fileId, fileObj) => {
            let payLoad = {};
            payLoad[API_URL] = URLMap.uploadFileContent(match.params.orsId, storageType, fileId);
            payLoad[HTTP_METHOD] = PUT;
            payLoad[PROXY_ATTRIBUTE] = getRowId();
            const uploadFormData = new FormData();
            uploadFormData.append("file",fileObj);
            uploadFormData.append("payload",JSON.stringify(payLoad));
            return new Promise((resolve, reject) => {
                APIService.postRequest(
                    URLMap.getFileUploadProxy(),
                    uploadFormData,
                    (response) => {
                        resolve(response);
                    },
                    (error) => {
                        reject(error);
                    },
                    {[CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId , "Content-Type": "application/octet-stream" }
                );
            })
        },
        getFileDownloadLinkHandler: (storageType, fileId) => {
            let payLoad = {};
            payLoad[API_URL] = URLMap.uploadFileContent(match.params.orsId, storageType, fileId);
            payLoad[HTTP_METHOD] = GET;
            payLoad[PROXY_ATTRIBUTE] = getRowId();
            const downloadUrl = URLMap.getFileDownloadProxy();

            APIService.postRequest(
                downloadUrl,
                payLoad,
                (response,responseHeader) => {
                    const blob = base64StringToBlob(response, responseHeader.headers['content-type']);
                    let filename = DEFAULT_FILENAME;
                    const disposition = responseHeader.headers['content-disposition'];
                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        let matches = filenameRegex.exec(disposition);
                        if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                        }
                    }
                    saveAs(blob, filename);
                },
                (error)=>{
                    console.log(error);
                }, 
                {
                    [CONFIG.PORTAL_ID_HEADER]: match.params.id, 
                    [CONFIG.ORS_ID]: match.params.orsId, 
                    responseType:'blob'
                }
            );
            return downloadUrl;
        }
    };

    return  <>
        {
            initialData && <BEForm
                beData={initialData}
                beMeta={beMeta}
                onSave={handleBeFormSave}
                validateData={handleDataValidation}
                getLookupHandler={getLookupHandler}
                getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                fileHandler={fileHandler}
                mode={(initialData && initialData[BE_FIELDS['HUB_STATE_INDICATOR']] === 0) ? BE_FORM_MODES.READ_ONLY : mode}
                maxColumns={maxColumns}
                history={history}
            />
        }
    </>;
};

export default BEFormHandler;
