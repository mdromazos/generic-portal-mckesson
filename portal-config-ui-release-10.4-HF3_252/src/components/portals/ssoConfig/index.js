import React, {
    useEffect,
    useContext,
    useState,
} from "react";
import { useFormik } from 'formik';
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import {
    Section,
    Form,
    Button,
    Panel,
    Input,
    Checkbox,
    FilePicker,
    Textarea,
    Dialog,
    useDialogState,
} from "@informatica/droplets-core";
import { saveAs } from 'file-saver';
import APIService from '../../../utils/apiService';
import CONFIG from "../../../config/config";
import * as yup from "yup";
import { URLMap } from '../../../utils/urlMappings';
import { APIMap } from '../../../utils/apiMappings';
import { getPortalConfigMapKey, generateViewId, getPageSetting } from '../../../utils/utilityService';
import { checkIfFilesIsXML } from "../../../utils/utilityService";
import { StateContext } from "../../../context/stateContext";
import { useTranslation } from "react-i18next";
import './index.css';

const SSOConfiguration = ({ match:{ params:{ databaseId, portalId }} }) => {
    const { state: { portalConfigMap, pageSettings }, dispatch } = useContext(StateContext);
    const { t: translate } = useTranslation();
    const { name } = portalConfigMap[ getPortalConfigMapKey(databaseId, portalId) ];
    const { ACTIONS, HEADERS, NOTIFICATION_TYPE, FILE_TYPE: {XML, XML_FILE}, PAGES, ICONS, URL_VALIDATION_REGEXP } = CONFIG;

    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [ssoConfiguration, setSSOConfiguration] = useState([]);

    const setupGuideDialogBox = useDialogState();

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const fetchSSOConfigurationData = () => {
        const successCallback = (resp) => {
            setSSOConfiguration(resp);
            resp.GENERAL_PROPERTIES.configuration.QuickSetupGuide.value === true && setupGuideDialogBox.open();
        };
        const failureCallback = ({ response: {data: {errorCode} }}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.getRequest(
            APIMap.ssoConfigurationData(portalId),
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId
            }
        );
    };

    const downloadMetaDataHandler = () => {
        const successCallback = (resp) => {
            let blob = new Blob([resp], { type: XML_FILE});
            let fileName = `${portalId}-${databaseId}.${XML}`;
            saveAs(blob, fileName);
            dispatchAppNotification(
                `${translate("PORTAL_USER_ACTION_EXPORT_MESSAGE", { PORTAL_NAME: `${name}` })}`,
                NOTIFICATION_TYPE.INFO
            );
        };
        const failureCallback = ({ response: {data: {errorCode} }}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };

        APIService.getRequest(
            APIMap.downloadMetaDataXML(portalId),
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId
            },
            {responseType: CONFIG.FILE_TYPE.BLOB}
        );
    };

    const onSubmit = (formValues) => {
        const updatedFormValues = {
            ...formValues,
            GENERAL_PROPERTIES: {
                ...formValues.GENERAL_PROPERTIES,
                configuration: {
                    ...formValues.GENERAL_PROPERTIES.configuration,
                    QuickSetupGuide: {
                        ...formValues.GENERAL_PROPERTIES.configuration.QuickSetupGuide,
                        value: false,
                    }
                }
            }
        };

        const successCallback = () => {
            dispatchAppNotification(
                `${translate('SSO_CONFIG_SUCCESS_MESSAGE', { PORTAL_NAME: `${name}` })}`,
                NOTIFICATION_TYPE.SUCCESS
            );
            setSSOConfiguration(updatedFormValues);
            setIsFileUploaded(false);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.putRequest(
            APIMap.ssoConfigurationData(portalId),
            updatedFormValues,
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId
            }
        );
    };

    const uploadMetaData = (file) => {
        const successCallback = (resp) => {
            setSSOConfiguration(resp);
            setIsFileUploaded(true);
        };
        const failureCallback = ({ response: {data: {errorCode} }}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };

        const files = new FormData();
        files.append(CONFIG.FILE_OPERATIONS.FILE, file);

        APIService.postRequest(
            APIMap.updateXMLConfiguration(portalId),
            files,
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId
            },
        );
    };

    const ssoValidationSchema = () => {
        return yup.object().shape({
            IDP_METADATA: yup.object({
                configuration: yup.object({
                    SingleSignOnServiceURLPOST : yup.object({
                        value: yup.string().matches(URL_VALIDATION_REGEXP, translate('ERROR_INVALID_URL'))
                    }),
                    SingleSignOnServiceURLRedirect : yup.object({
                        value: yup.string().matches(URL_VALIDATION_REGEXP, translate('ERROR_INVALID_URL'))
                    }),
                    SingleLogoutServiceURLRedirect : yup.object({
                        value: yup.string().matches(URL_VALIDATION_REGEXP, translate('ERROR_INVALID_URL'))
                    }),
                }),
            }),
        });
    };

    const formikProps = useFormik({
        initialValues: ssoConfiguration,
        enableReinitialize: true,
        validationSchema: ssoValidationSchema,
        onSubmit,
    });

    const checkXMLFile = (files) => {
        if(checkIfFilesIsXML (files[0])) {
            uploadMetaData(files[0]);
            formikProps.setFieldTouched("file", true);
        } else {
            formikProps.setFieldTouched("file", true, false);
            formikProps.setFieldError("file", translate("REQUIRED_XML_FILE"));
        }
    };


    useEffect(() => {
        let pageInfo = {
            label: [name, PAGES.CREATE_SSO_CONFIG],
            type: PAGES.CREATE_SSO_CONFIG,
            url: URLMap.ssoSettings(databaseId, portalId),
            icon: ICONS.RUNTIME_CONFIGURATION,
            id: generateViewId(PAGES.CREATE_SSO_CONFIG, databaseId, portalId)
        };
        fetchSSOConfigurationData();

        const ssoConfigPage = getPageSetting(pageInfo.id, pageSettings);
        if (ssoConfigPage.length === 0) {
            dispatch({
                type: ACTIONS.ADD_PAGE_SETTINGS,
                pageSettings: pageInfo,
            });
        }
        dispatch({
            type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
            currentPage: pageInfo
        });
    }, [databaseId, portalId]);

    const QuickSetupGuide = () => (
        <Dialog {...setupGuideDialogBox} data-testid="setup_guide">
            <Dialog.Header title={translate("LABEL_SETUP_GUIDE")} />
            <Dialog.Content>
                <div>{translate('LABEL_SSO_DIALOG_BODY_STEPS_CONFIGURE')}</div>
                <ol className="setup__guide__list">
                    <li className="setup__guide__list__item">{translate('LABEL_SSO_DIALOG_BODY_STEP_ONE')}</li>
                    <li className="setup__guide__list__item">{translate('LABEL_SSO_DIALOG_BODY_STEP_TWO')}</li>
                    <li className="setup__guide__list__item">{translate('LABEL_SSO_DIALOG_BODY_STEP_THREE')}</li>
                    <li className="setup__guide__list__item">{translate('LABEL_SSO_DIALOG_BODY_STEP_FOUR')}</li>
                </ol>
            </Dialog.Content>
            <Dialog.Footer>
                <Button variant="primary" onClick={setupGuideDialogBox.close}>
                    {translate('LABEL_CLOSE_BUTTON')}
                </Button>
            </Dialog.Footer>
        </Dialog>
    )

    return(
        <>
        <form>
            <Panel className="sso__panel portal__config__panel">
                <div className="sso__heading__container">
                    <span className="sso__heading">{translate("LABEL_SSO_CONFIG")}</span>
                    <div>
                        <Button className="sso__download__metadata" onClick={downloadMetaDataHandler} data-testid="download-metadata" disabled={isFileUploaded || formikProps.dirty}>{translate('LABEL_DOWNLOAD_SERVICE_PROVIDER_METADATA')}</Button>
                        <Button variant="call-to-action" onClick={formikProps.handleSubmit} data-testid="sso-save-details" disabled={isFileUploaded ? !isFileUploaded : !formikProps.dirty}>{translate('LABEL_SAVE')}</Button>
                    </div>
                </div>
                <Section
                    title={<div className="flex">
                        <span className="service__provider__header">{translate("LABEL_SERVICE_PROVIDER_CONFIG")}</span>
                        <span className="sso__guide" onClick={setupGuideDialogBox.open}>{translate("LABEL_SETUP_GUIDE")}</span>
                    </div>}
                    collapsible
                    data-testid="sso-config-section"
                >
                   
                    <p>{translate("LABEL_SSO_SERVICE_PROVIDER_CONFIG_TEXT")}</p>

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_ISSUER_ID_SP_INFO")}>{translate("LABEL_ISSUER_ID")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="SP_METADATA.configuration.EntityID.value"
                            as={Input}
                            value={formikProps.values && 
                                formikProps.values.SP_METADATA && 
                                formikProps.values.SP_METADATA.configuration && 
                                formikProps.values.SP_METADATA.configuration.EntityID
                                && formikProps.values.SP_METADATA.configuration.EntityID.value}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="binding-type"
                        />
                    </Form.Group>

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_ASSERTION_CONSUMER_URL_INFO")}>{translate("LABEL_ASSERTION_CONSUMER_URL")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="SP_METADATA.configuration.AssertionConsumerServiceURL.value"
                            as={Input}
                            value={formikProps.values && 
                                formikProps.values.SP_METADATA && 
                                formikProps.values.SP_METADATA.configuration && 
                                formikProps.values.SP_METADATA.configuration.AssertionConsumerServiceURL
                                && formikProps.values.SP_METADATA.configuration.AssertionConsumerServiceURL.value}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="assertion_consumer_url"
                        />
                    </Form.Group>                                        
                    
                    <div className="flex">
                        <Form.Group>
                            <Form.Control
                                name="SP_METADATA.configuration.SignAuthRequest.value"
                                as={Checkbox}
                                checked={formikProps.values && 
                                    formikProps.values.SP_METADATA && 
                                    formikProps.values.SP_METADATA.configuration && 
                                    formikProps.values.SP_METADATA.configuration.SignAuthRequest
                                    && formikProps.values.SP_METADATA.configuration.SignAuthRequest.value}
                                onChange={(e) => {
                                    const { checked } = e.target;
                                    formikProps.setFieldValue("SP_METADATA.configuration.SignAuthRequest.value", checked);
                                    formikProps.setFieldTouched("SP_METADATA.configuration.SignAuthRequest.value", true);
                                }}
                            >
                                {translate("LABEL_SIGN_AUTHENTICATION_REQUEST")}
                            </Form.Control>
                        </Form.Group>  

                        <Form.Group>
                            <Form.Control
                                name="SP_METADATA.configuration.SignLogoutRequest.value"
                                as={Checkbox}
                                checked={formikProps.values && 
                                    formikProps.values.SP_METADATA && 
                                    formikProps.values.SP_METADATA.configuration && 
                                    formikProps.values.SP_METADATA.configuration.SignLogoutRequest
                                    && formikProps.values.SP_METADATA.configuration.SignLogoutRequest.value}
                                onChange={(e) => {
                                    const { checked } = e.target;
                                    formikProps.setFieldValue("SP_METADATA.configuration.SignLogoutRequest.value", checked);
                                    formikProps.setFieldTouched("SP_METADATA.configuration.SignLogoutRequest.value", true);
                                }}
                            >
                                {translate("LABEL_SIGN_LOGOUT_REQUEST")}
                            </Form.Control>
                        </Form.Group>                                        
                    </div>
                </Section>

                <Section title={translate("LABEL_IDENTITY_PROVIDER_CONFIG")} collapsible data-testid="sso-config-section">
                    <p>{translate("LABEL_SSO_IDENTITY_PROVIDER_CONFIG_TEXT")}</p>
                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label">{translate("LABEL_IDP_FILE")}</Form.Label>
                            <Form.Control
                                className="sso__file__upload__field"
                                name="file"
                                as={FilePicker}
                                accept={["." + CONFIG.FILE_TYPE.XML]}
                                onChange={({ files }) => {
                                    checkXMLFile(files, formikProps);
                                }}
                                data-testid="file-upload"
                            />
                            {formikProps.touched.file && formikProps.errors.file
                                && (<div className="form-error">
                                    <Form.Error>{formikProps.errors.file}</Form.Error></div>)}
                    </Form.Group>

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_ISSUER_IDP_INFO")}>{translate("LABEL_ISSUER_ID")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="IDP_METADATA.configuration.EntityID.value"
                            as={Input}
                            value={formikProps.values && 
                                formikProps.values.IDP_METADATA && 
                                formikProps.values.IDP_METADATA.configuration && 
                                formikProps.values.IDP_METADATA.configuration.EntityID
                                && formikProps.values.IDP_METADATA.configuration.EntityID.value}                            
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="issuer-id"
                        />
                    </Form.Group>

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_BINDING_TYPE_INFO")}>{translate("LABEL_BINDING_TYPE")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            as={Input}
                            name="IDP_METADATA.configuration.BindingType.value"
                            value={formikProps.values && 
                                formikProps.values.IDP_METADATA && 
                                formikProps.values.IDP_METADATA.configuration && 
                                formikProps.values.IDP_METADATA.configuration.BindingType
                                && formikProps.values.IDP_METADATA.configuration.BindingType.value}                              
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="binding-type"
                        />
                    </Form.Group>

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_SINGLE_SIGN_ON_URL_INFO")}>{translate("LABEL_SINGLE_SIGN_ON_URL")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="IDP_METADATA.configuration.SingleSignOnServiceURLPOST.value"
                            value={formikProps.values && 
                                formikProps.values.IDP_METADATA && 
                                formikProps.values.IDP_METADATA.configuration && 
                                formikProps.values.IDP_METADATA.configuration.SingleSignOnServiceURLPOST
                                && formikProps.values.IDP_METADATA.configuration.SingleSignOnServiceURLPOST.value}                            
                            as={Input}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="sign-out-url"
                        />
                        {formikProps.touched && formikProps.touched.IDP_METADATA && 
                            formikProps.touched.IDP_METADATA.configuration && 
                            formikProps.touched.IDP_METADATA.configuration.SingleSignOnServiceURLPOST && 
                            formikProps.touched.IDP_METADATA.configuration.SingleSignOnServiceURLPOST.value && 
                            formikProps.errors && formikProps.errors.IDP_METADATA && 
                            formikProps.errors.IDP_METADATA.configuration && 
                            formikProps.errors.IDP_METADATA.configuration.SingleSignOnServiceURLPOST && 
                            formikProps.errors.IDP_METADATA.configuration.SingleSignOnServiceURLPOST.value && 
                            (<div className="form-error">
                                <Form.Error>{formikProps.errors.IDP_METADATA.configuration.SingleSignOnServiceURLPOST.value}</Form.Error>
                            </div>)
                        }
                    </Form.Group>                     

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_SINGLE_SIGN_ON_REDIRECT_URL_INFO")}>{translate("LABEL_SINGLE_SIGN_ON_REDIRECT_URL")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="IDP_METADATA.configuration.SingleSignOnServiceURLRedirect.value"
                            value={formikProps.values && 
                                formikProps.values.IDP_METADATA && 
                                formikProps.values.IDP_METADATA.configuration && 
                                formikProps.values.IDP_METADATA.configuration.SingleSignOnServiceURLRedirect
                                && formikProps.values.IDP_METADATA.configuration.SingleSignOnServiceURLRedirect.value}                                
                            as={Input}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="sign-on-url"
                        />
                        {formikProps.touched && formikProps.touched.IDP_METADATA && 
                            formikProps.touched.IDP_METADATA.configuration && 
                            formikProps.touched.IDP_METADATA.configuration.SingleSignOnServiceURLRedirect && 
                            formikProps.touched.IDP_METADATA.configuration.SingleSignOnServiceURLRedirect.value && 
                            formikProps.errors && formikProps.errors.IDP_METADATA && 
                            formikProps.errors.IDP_METADATA.configuration && 
                            formikProps.errors.IDP_METADATA.configuration.SingleSignOnServiceURLRedirect && 
                            formikProps.errors.IDP_METADATA.configuration.SingleSignOnServiceURLRedirect.value && 
                            (<div className="form-error">
                                <Form.Error>{formikProps.errors.IDP_METADATA.configuration.SingleSignOnServiceURLRedirect.value}</Form.Error>
                            </div>)
                        }
                    </Form.Group>

                    {/* <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_SINGLE_SIGN_OUT_URL_POST_INFO")}>{translate("LABEL_SINGLE_SIGN_OUT_URL_POST")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="IDP_METADATA.configuration.SingleLogoutServiceURLPOST.value"
                            value={formikProps.values && 
                                formikProps.values.IDP_METADATA && 
                                formikProps.values.IDP_METADATA.configuration && 
                                formikProps.values.IDP_METADATA.configuration.SingleLogoutServiceURLPOST
                                && formikProps.values.IDP_METADATA.configuration.SingleLogoutServiceURLPOST.value}                            
                            as={Input}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="single-logout-url-post"
                        />
                    </Form.Group>                     */}

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_SINGLE_SIGN_OUT_REDIRECT_URL_INFO")}>{translate("LABEL_SINGLE_SIGN_OUT_REDIRECT_URL")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="IDP_METADATA.configuration.SingleLogoutServiceURLRedirect.value"
                            value={formikProps.values && 
                                formikProps.values.IDP_METADATA && 
                                formikProps.values.IDP_METADATA.configuration && 
                                formikProps.values.IDP_METADATA.configuration.SingleLogoutServiceURLRedirect
                                && formikProps.values.IDP_METADATA.configuration.SingleLogoutServiceURLRedirect.value}                            
                            as={Input}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="sign-out-redirect-url"
                        />
                        {formikProps.touched && formikProps.touched.IDP_METADATA && 
                            formikProps.touched.IDP_METADATA.configuration && 
                            formikProps.touched.IDP_METADATA.configuration.SingleLogoutServiceURLRedirect && 
                            formikProps.touched.IDP_METADATA.configuration.SingleLogoutServiceURLRedirect.value && 
                            formikProps.errors && formikProps.errors.IDP_METADATA && 
                            formikProps.errors.IDP_METADATA.configuration && 
                            formikProps.errors.IDP_METADATA.configuration.SingleLogoutServiceURLRedirect && 
                            formikProps.errors.IDP_METADATA.configuration.SingleLogoutServiceURLRedirect.value && 
                            (<div className="form-error">
                                <Form.Error>{formikProps.errors.IDP_METADATA.configuration.SingleLogoutServiceURLRedirect.value}</Form.Error>
                            </div>)
                        }
                    </Form.Group>
                    
                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_SIGN_IN_CERTIFICATE_INFO")}>{translate("LABEL_SIGN_IN_CERTIFICATE")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="IDP_METADATA.configuration.Certificate.value"
                            value={formikProps.values && 
                                formikProps.values.IDP_METADATA && 
                                formikProps.values.IDP_METADATA.configuration && 
                                formikProps.values.IDP_METADATA.configuration.Certificate
                                && formikProps.values.IDP_METADATA.configuration.Certificate.value}                             
                            as={Textarea}
                            rows={5}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="sign-in-certificate"
                        />
                    </Form.Group>

                    <Form.Group className="form-group">
                        <Form.Label className="sso__form__label" help={translate("LABEL_USER_NAME_MAPPING_INFO")}>{translate("LABEL_USER_NAME_MAPPING")}</Form.Label>
                        <Form.Control
                            className="sso__form__field"
                            name="GENERAL_PROPERTIES.configuration.UserNameMapping.value"
                            value={formikProps.values && 
                                formikProps.values.GENERAL_PROPERTIES && 
                                formikProps.values.GENERAL_PROPERTIES.configuration && 
                                formikProps.values.GENERAL_PROPERTIES.configuration.UserNameMapping
                                && formikProps.values.GENERAL_PROPERTIES.configuration.UserNameMapping.value}                            
                            as={Input}
                            onChange={formikProps.handleChange}
                            onBlur={formikProps.handleBlur}
                            data-testid="user-name-mapping"
                        />
                    </Form.Group>

                     <Form.Group className="form-group">
                            <Form.Label className="sso__form__label" help={translate("LABEL_SAML_REDIRECT_URL_INFO")}>{translate("LABEL_SAML_REDIRECT_URL_MAPPING")}</Form.Label>
                            <Form.Control
                                className="sso__form__field"
                                name="GENERAL_PROPERTIES.configuration.SAMLRedirectURL.value"
                                value={formikProps.values &&
                                    formikProps.values.GENERAL_PROPERTIES &&
                                    formikProps.values.GENERAL_PROPERTIES.configuration &&
                                    formikProps.values.GENERAL_PROPERTIES.configuration.SAMLRedirectURL
                                    && formikProps.values.GENERAL_PROPERTIES.configuration.SAMLRedirectURL.value}
                                as={Input}
                                onChange={formikProps.handleChange}
                                onBlur={formikProps.handleBlur}
                                data-testid="saml-redirect-url"
                            />
                        </Form.Group>                                                                                                                    
                </Section>
            </Panel>
        </form>
            <QuickSetupGuide />
        </>
    );
};

export default SSOConfiguration;
