import React, { useState, useEffect, useContext } from "react";
import { 
    Button,
    Dialog,
    Form,
    Checkbox,
    Dropdown,
    Input,
    FilePicker,
    useMessageBoxState,
    Radio,
    Tooltip,
    IconButton
} from "@informatica/droplets-core";
import { useFormik } from 'formik';
import { useTranslation } from "react-i18next";
import APIService from "../../../utils/apiService";
import { APIMap } from "../../../utils/apiMappings";
import * as Yup from "yup";
import { error_icon } from "@informatica/archipelago-icons";
import CONFIG from "../../../config/config";
import './index.css';
import { StateContext } from "../../../context/stateContext";
import DialogBox from "../../dialogBox";
import {checkIfFilesAreCorrectType} from "../../../utils/utilityService";
import { getCookie, handleBlur, handleChange } from "../../../utils/utilityService";

const ImportPortal = ({displayImportDialogBox, importPortalHandler, importPortalErrorMessage, resize }) => {

    const {dispatch, state:{ portals }} = useContext(StateContext);
    const { ACTIONS,NOTIFICATION_TYPE, DROPDOWN_OPTIONS:{TEXT, VALUE} } = CONFIG;
    const [replacePortal, setReplacePortal] = useState(false);
    const [portalOptions, setPortalOptions] = useState([]);
    const { t: translate } = useTranslation();
    const [databases, setDatabases] = useState([]);
    const [filesState, setFilesState] = useState();
    const [isAllFieldFilled,setIsAllFieldFilled] = useState(false);
    const [isZipFile,setIsZipFile] = useState(false);
    const [sourceSystemOptions, setSourceSystemOptions] = useState([]);
    const [portal, setPortal] = useState("");
    const [replacePortalConfirm, setReplacePortalConfirm] = useState(false);
    const [portalNameIdMap, setPortalNameIdMap] = useState({});

    const replacePortalMessageBox = useMessageBoxState();

    useEffect(() => {
        getDatabases();
    }, []);

    const validationYupObject = () => {
        return Yup.object().shape({
            database: Yup.string().required(translate("ERROR_REQUIRED_DATABASE")),
            sourceSystem: Yup.string().required(
                translate("ERROR_REQUIRED_SOURCE_SYSTEM")
            ),
            portalName: Yup.string().required(translate("ERROR_REQUIRED_PORTAL_NAME"))
        });
    };

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };


    const getDatabases = () => {
        const successCallback = resp => {
            if (resp) {
                const databaseDropdownData = resp.map(database => ({
                    value: database.databaseId,
                    text: database.label
                }));
                setDatabases(databaseDropdownData);
            }
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.getRequest(APIMap.getDatabases(), successCallback, failureCallback);
    };

    const handleImport = values => {
        values = {
            ...values,
            isExistingPortal : replacePortal
        };
        if(replacePortal){
            values = {
                ...values,
                portalId : portalNameIdMap[values.portalName]
            };
            setPortal(values);
            replacePortalMessageBox.open();
        } else {
            importPortalHandler(values, filesState);
        }
    };
    
    const replaceHandler = () => {
        setReplacePortal(!replacePortal);
        let nameIDMap = {};
        if (portals && portals.length > 0) {
            const options = portals.map(portal => {
                if(!portalNameIdMap[portal.portalName]) {
                    nameIDMap[portal.portalName] = portal.portalId;
                } 
                return ({
                    [TEXT] : portal.portalName,
                    [VALUE] : portal.portalName
                })
            });
            setPortalOptions(options);
            setPortalNameIdMap({ ...portalNameIdMap, ...nameIDMap});
        }
    };

    const triggerReplacePortalConfirm = () => {
        setReplacePortalConfirm(!replacePortalConfirm);
        importPortalHandler(portal, filesState);
    };

    const RenderReplacePortalMessageBox = () => (
        <DialogBox
            dialogBox={replacePortalMessageBox}
            title={translate("LABEL_CLOSE_DIALOG_HEADER")}
            messageContentTitle={`${translate("LABEL_REPLACE_MESSAGE_CONTENT", { PORTAL_NAME: portal.portalName})}`}
            messageContentBody={""} //yet to be confirmed by designer
            clickHandler={triggerReplacePortalConfirm}
            actionButtonText={translate("LABEL_REPLACE_PORTAL_TEXT")}
            cancelButtonText={translate("PAGE_USER_ACTION_CANCEL")}
        />
    );

    const getMetadataMessage = (icon, message) => {
        return <>
            <img src={icon} alt="" className="metadata__validation__message_icon" />
            <span className="metadata__validation__message">{message}</span>
        </>;
    };

    const getSourceSystems = (databaseID) => {
        const successCallback = (resp) => {
            if (resp) {
                const sourceSystemDropdownData = resp.sourceSystems.map((srcSystem) => ({
                    value: srcSystem.name,
                    text: srcSystem.name,
                }));
                setSourceSystemOptions(sourceSystemDropdownData)
            }
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.getRequest(
            APIMap.getSourceSystem(databaseID),
            successCallback,
            failureCallback,
            { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
        );
    };

    const checkZipFile = (file,formikProps) => {
        if(checkIfFilesAreCorrectType(file[0])) {
            setIsZipFile(true);
            setFilesState(file);
            formikProps.setFieldTouched("file", true);
        } else {
            formikProps.setFieldTouched("file", true, false);
            formikProps.setFieldError("file", translate("REQUIRED_ZIP_FILE"));
            setIsZipFile(false)
        }
    };

    const initialValues = {
        portalName: '', 
        replacePortal: false,
        sourceSystem: '',
        isExternalUserManagementEnabled: false
    };

    const formikProps = useFormik({
        initialValues,
        onSubmit: handleImport,
        validationSchema: validationYupObject
    })

    useEffect(() => {
        if(!formikProps.errors.database && !formikProps.errors.sourceSystem && !formikProps.errors.portalName){
            setIsAllFieldFilled(true)
        } else {
            setIsAllFieldFilled(false)
        }
    }, [formikProps.errors])

    return <>
                <Dialog
                    {...displayImportDialogBox}
                    {...resize}
                    className="import__portal__dialog"
                    data-testid="import-modal-dialog"
                >
                    <Dialog.Header title={translate("LABEL_IMPORT_PORTAL")} />
                        <Dialog.Content>
                        <form>
                            <Form.Group className="form-group" required>
                                <Form.Label className="form-label">{translate("LABEL_FILE")}</Form.Label>
                                <Form.Control
                                    className="form-field"
                                    name="file"
                                    as={FilePicker}
                                    accept={["." + CONFIG.FILE_TYPE.ZIP]}
                                    onChange={({ files }) => checkZipFile(files, formikProps)}
                                    data-testid="file-upload"
                                />
                                {formikProps.errors.file
                                    && (<div className="form-error">
                                        <Form.Error>{formikProps.errors.file}</Form.Error></div>)}
                            </Form.Group>
                            <Form.Group className="form-group" required>
                                <Form.Label className="form-label">{translate("LABEL_DATABASE")}</Form.Label>
                                <Form.Control
                                    name="database"
                                    className="form-field"
                                    as={Dropdown}
                                    options={databases}
                                    onChange={({ value }) => {
                                        handleChange(formikProps, 'database', value);
                                        getSourceSystems(value)
                                    }}
                                    value={formikProps.values && formikProps.values.database}
                                    onBlur={() => handleBlur(formikProps, 'database')}
                                    data-testid="database"
                                />
                                {formikProps.touched.database
                                    && formikProps.errors.database
                                    && (<div className="form-error">
                                        <Form.Error>{formikProps.errors.database}</Form.Error></div>)}
                            </Form.Group>
                            <Form.Group className="form-group" required>
                                <Form.Label className="form-label">{translate("LABEL_SOURCE_SYSTEM")}</Form.Label>
                                <Form.Control
                                    as={Dropdown}
                                    className="form-field"
                                    name="sourceSystem" 
                                    options={sourceSystemOptions}
                                    value={formikProps.values && formikProps.values.sourceSystem}
                                    onChange={({ value }) => handleChange(formikProps, 'sourceSystem', value)}
                                    onBlur={() => handleBlur(formikProps, 'sourceSystem')}
                                    data-testid="source-system"
                                />
                                {formikProps.touched.sourceSystem
                                    && formikProps.errors.sourceSystem
                                    && (<div className="form-error">
                                        <Form.Error>{formikProps.errors.sourceSystem}</Form.Error></div>)}
                            </Form.Group>
                            <Form.Group className="form-group">
                                <Form.Control
                                    name="replacePortal"
                                    checked={replacePortal}
                                    className="form-field"
                                    onChange={() => {
                                        handleChange(formikProps, 'replacePortal', !replacePortal);
                                        handleBlur(formikProps, 'replacePortal');
                                        replaceHandler();
                                    }}
                                    as={Checkbox}
                                    data-testid="replace-portal"
                                >
                                        {translate("LABEL_REPLACE_PORTAL")}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group className="form-group" required>
                                <Form.Label className="form-label">{translate("LABEL_PORTAL_NAME")}</Form.Label>
                                {replacePortal 
                                    ?  <Form.Control
                                            className="form-field"
                                            name="portalName"
                                            as={Dropdown}
                                            options={portalOptions}
                                            value={formikProps.values && formikProps.values.portalName}
                                            onChange={({ value }) => handleChange(formikProps, 'portalName', value)}
                                            onBlur={() => handleBlur(formikProps, 'portalName')}
                                            data-testid="portal-name"
                                        />
                                    :   <Form.Control
                                            className="form-field"
                                            name="portalName"
                                            as={Input}
                                            onBlur={formikProps.handleBlur}
                                            onChange={formikProps.handleChange}
                                            value={formikProps.values && formikProps.values.portalName}
                                            data-testid="portal-name"
                                        />
                                }
                                {formikProps.touched.portalName
                                    && formikProps.errors.portalName
                                    && (<div className="form-error">
                                        <Form.Error>{formikProps.errors.portalName}</Form.Error></div>)}
                            </Form.Group>
                            <br />
                            {!replacePortal && <>
                                <Form.Group required className="form-group">
                                    <Form.Label className="radio-form-label">
                                        {translate("LABEL_ENABLE_EXTERNAL_USER_MANAGEMENT")}
                                    </Form.Label>
                                    <div className="radio-form-group">
                                        <Form.Control
                                            name="isExternalUserManagementEnabled"
                                            className="width-auto"
                                            value={true}
                                            as={Radio}
                                            onChange={(e) => {
                                                const { value } = e.target;
                                                handleChange(formikProps, 'isExternalUserManagementEnabled', JSON.parse(value));
                                                handleBlur(formikProps, 'isExternalUserManagementEnabled');                            
                                            }}
                                            data-testid="is-external-user-true"
                                            checked={Boolean(formikProps.values.isExternalUserManagementEnabled) === true}
                                        >{translate("LABEL_YES")}</Form.Control>
                                        <Form.Control
                                            name="isExternalUserManagementEnabled"
                                            className="width-auto"
                                            value={false}
                                            as={Radio}
                                            onChange={(e) => {
                                                const { value } = e.target;
                                                handleChange(formikProps, 'isExternalUserManagementEnabled', JSON.parse(value));
                                                handleBlur(formikProps, 'isExternalUserManagementEnabled');                            
                                            }}
                                            data-testid="is-external-user-false"
                                            checked={Boolean(formikProps.values.isExternalUserManagementEnabled) === false}
                                        >{translate("LABEL_NO")}</Form.Control>
                                        <Tooltip position="bottom" content={translate("LABEL_ENABLE_EXTERNAL_USER_MANAGEMENT_INFO")}>
                                            <IconButton>
                                                <i className="aicon aicon__info info__icon" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </Form.Group>
                            </>}                                             
                            {
                                importPortalErrorMessage && getMetadataMessage(
                                    error_icon, importPortalErrorMessage
                                )
                            }
                        </form>
                        </Dialog.Content>
                        <Dialog.Footer>
                            <Button
                                onClick={() => handleImport(formikProps.values)}
                                data-testid="import-button" type="submit" disabled={!(isAllFieldFilled && isZipFile)}>
                                {translate("LABEL_IMPORT_BUTTON")}
                            </Button>
                            <Button onClick={displayImportDialogBox.close}>
                                {translate("LABEL_CLOSE_BUTTON_CANCEL")}
                            </Button>
                        </Dialog.Footer>
                </Dialog>
        { !replacePortalMessageBox.closed && <RenderReplacePortalMessageBox /> }
    </>;
};

export default ImportPortal;
