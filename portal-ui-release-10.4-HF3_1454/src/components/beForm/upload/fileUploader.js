import PropTypes from "prop-types";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Form, IconButton, Input } from '@informatica/droplets-core';
import CONFIG from "../../../config/config"

import { useTranslation } from "react-i18next";

import './fileUploader.css';
import {
    getFieldName,
    getFieldValue
} from "../beFormUtility";

const FileUploader = ({
    formDisabled, beData, beField, formikProps, manyDt, fileHandler: {
        getFileMetadataHandler,
        createFileMetadataHandler,
        uploadFileContentHandler,
        getFileDownloadLinkHandler
    },
    isReadOnly,fieldErrorMessage
}) => {

    const { t: translate } = useTranslation();

    const fileElementRef = useRef(null);
    const [fileConfState, setFileConfState] = useState({});
    const [fileUploadError, setFileUploadError] = useState(null);
    const STORAGE_TYPE = "TEMP";
    const FILE_CONTENT_TYPE_HEADER = "application/octet-stream";
    const FILE_UPLOAD_COMMENT = "Application - Portal UI File Upload";
    const fieldName = getFieldName(beField, manyDt);
    const {ICONS:{FILE_UPLOAD}} = CONFIG;

    let fileId = false;
    if (beData) {
        fileId = getFieldValue(beData, fieldName);
    }
    if (!fileId && formikProps && formikProps.values) {
        fileId = getFieldValue(formikProps.values, fieldName);
    }
    const fetchFileMetaData = useCallback(() => {
        if (fileId) {
            const storageType = fileId.split("_")[0];
            getFileMetadataHandler(storageType, fileId)
                .then(response => {
                    setFileConfState(response);
                })
                .catch(error => {
                    setFileConfState({});
                });
        }
    }, [fileId]);

    useEffect(() => {
        fetchFileMetaData();
    }, [formDisabled, fetchFileMetaData]);

    const downloadBEFormFileContent = () => {
        let hrefLink = "";
        if (formikProps && formikProps.values) {
            const fileId = getFieldValue(formikProps.values, fieldName);
            const storageType = fileId.split("_")[0];
            getFileDownloadLinkHandler(storageType, fileId);
        }
        return hrefLink;
    };

    const beFormFileUpload = () => {

        const fileFieldContent = document.getElementsByName(`${fieldName}_file`);
        const isValidFileConf = fileFieldContent && fileFieldContent[0] && fileFieldContent[0].files && fileFieldContent[0].files.length;

        if (isValidFileConf) {
            const fileObj = fileFieldContent[0].files.item(0);
            let uploadFileConf = {
                comments: FILE_UPLOAD_COMMENT,
                fileContentType: FILE_CONTENT_TYPE_HEADER,
                fileName: fileObj.name,
                fileType: fileObj.type
            };
            createFileMetadataHandler(STORAGE_TYPE, uploadFileConf)
                .then(fileId => {
                    uploadFileContentHandler(STORAGE_TYPE,
                        fileId,
                        fileObj
                    ).then((resp) => {
                            formikProps.setFieldValue(fieldName, fileId);
                            setFileConfState({
                                ...uploadFileConf, fileId: fileId
                            });
                            setFileUploadError(null);
                        })
                        .catch(({response:{ data:{errorData} }}) => {
                            fetchFileMetaData();
                            setFileUploadError(getErrorMessage(errorData));
                        });
                })
                .catch(({response:{ data:{errorData} }}) => {
                    fetchFileMetaData();
                    setFileUploadError(getErrorMessage(errorData));
                });
        }
    };

    const getErrorMessage = (errorData) => {
       return (errorData[0] && errorData[0].message) ? errorData[0].message.split(":")[1] : null;
    }

    const triggerFileUpload = () => {
        fileElementRef.current.click();
        return true;
    };

    const removeSelectedFile = useCallback(() => {
        document.getElementById(fileConfState['fileName'] + "_ID").value = "";
        formikProps.setFieldValue(fieldName, '')
        setFileConfState({});
    }, [setFileConfState, formikProps.setFieldValue, fileConfState])

    return (
        <>
            <div className="be-form-field-file-value">
                {
                    !formDisabled && formikProps.values && <Form.Control as={Input}
                        data-testid={fieldName+"_input"}
                        name={fieldName}
                        value={formikProps.values[fieldName]}
                        type="hidden"
                        maxlength={beField.length} />
                }
            </div>
            <div className="be-form-field-file-display-elements">
                {
                    ((formikProps.values && getFieldValue(formikProps.values, fieldName)
                        && fileConfState['fileName']
                        && <div className="beFormField-file-anchor-element">
                            {
                                (formDisabled || isReadOnly) && (
                                    <span className="be-form-field-file-download-link"
                                        onClick={downloadBEFormFileContent}
                                        >
                                        {
                                            fileConfState['fileName']
                                        }
                                    </span>                                    
                                )
                            }
                        </div>
                    ))
                }
                {
                    !formDisabled && !isReadOnly
                    &&  <div className={`be-form-field-file-button-element file__upload__container ${fieldErrorMessage}`}>
                            <input className="file__input" id={fileConfState['fileName']+"_ID"}
                                value={fileConfState['fileName']} 
                                data-testid="file_upload_input"
                                onChange={() => { triggerFileUpload()}}
                                placeholder={translate('FILE_PICKER_PLACE_HOLDER')}    
                            />

                            <div className="action__buttons">
                                {Object.keys(fileConfState).length > 0 &&
                                    <IconButton onClick={removeSelectedFile} className="remove__file">
                                        <i className="aicon aicon__close-solid" />
                                    </IconButton>}
                                    <IconButton onClick={() => triggerFileUpload()} className="file__upload__button" data-testid="file_upload_button">
                                        <img src={FILE_UPLOAD} alt={translate("LABEL_FILE_UPLOAD")} className="file__upload__icon" />
                                    </IconButton>
                            </div>                            
                        </div>
                }
                {
                    !formDisabled && !isReadOnly
                    && <div className="be-form-field-file-element">
                        <input type="file"
                            data-testid={fieldName+"_input"}
                            name={`${fieldName}_file`}
                            ref={fileElementRef}
                            onChange={() => { beFormFileUpload() }} />
                    </div>
                }
                {!formDisabled && !isReadOnly && Object.keys(fileConfState).length > 0 &&
                    <span
                        onClick={downloadBEFormFileContent}
                        className="be-form-field-file-download-link file__download__button"
                    >
                        {translate('DOWNLOAD')}
                    </span>
                }                
            </div>
            {
                fileUploadError &&
                <div className="beForm_error">
                    <small className="form__error">{fileUploadError}</small>
                </div>
            }            
        </>
    )
};

FileUploader.propTypes = {
    formDisabled: PropTypes.bool.isRequired,
    fileHandler: PropTypes.shape({
        getFileMetadataHandler: PropTypes.func.isRequired,
        createFileMetadataHandler: PropTypes.func.isRequired,
        uploadFileContentHandler: PropTypes.func.isRequired,
        getFileDownloadLinkHandler: PropTypes.func.isRequired
    }),
    beData: PropTypes.object.isRequired,
    beField: PropTypes.shape({
        name: PropTypes.string,
        fieldType: PropTypes.string,
        label: PropTypes.string,
        dataType: PropTypes.string,
        length: PropTypes.number,
        trust: PropTypes.bool,
        required: PropTypes.bool,
        applyNullValues: PropTypes.string,
        filterable: PropTypes.bool,
        sortable: PropTypes.bool,
        lookup: PropTypes.shape({
            link: PropTypes.arrayOf(
                PropTypes.shape({
                    href: PropTypes.string,
                    rel: PropTypes.string
                })
            )
        })
    }),
    formikProps: PropTypes.object.isRequired
};

export default FileUploader;
