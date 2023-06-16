import React, {
    useEffect,
    useContext,
    useState,
    useCallback,
} from "react";
import { useFormik } from 'formik';
import {
    Table,
    Section,
    Form,
    Button,
    Panel,
    Input,
    useMessageBoxState,
} from "@informatica/droplets-core";
import APIService from '../../../utils/apiService';
import CONFIG from "../../../config/config";
import { URLMap } from '../../../utils/urlMappings';
import { APIMap } from '../../../utils/apiMappings';
import { getPortalConfigMapKey, generateViewId, getPageSetting } from '../../../utils/utilityService';
import { StateContext } from "../../../context/stateContext";
import { useTranslation } from "react-i18next";
import DialogBox from "../../dialogBox";
import * as yup from "yup";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import './index.css';

const RuntimeConfig = ({ match:{ params:{ databaseId, portalId }}, history }) => {
    const { t: translate } = useTranslation();
    const { state: { pageSettings, portalConfigMap, portalConfig }, dispatch } = useContext(StateContext);
    const { name } = portalConfigMap[ getPortalConfigMapKey(databaseId, portalId) ];
    const { PAGES, ACTIONS, ICONS, HEADERS, DATA_TYPES, NOTIFICATION_TYPE, RUNTIME_PASSWORD_SECTION } = CONFIG;
    const [runtimeConfiguration, setRuntimeConfigurationAction] = useState([]);
    const [currentPageInfo, setCurrentPageInfo] = useState(undefined);
    const [runtimeFormValues, setRuntimeFormValues] = useState(undefined);
    const saveMessageBox = useMessageBoxState();

    useEffect(() => {
        let pageInfo = {
            label: [name, PAGES.CREATE_RUNTIME_CONFIG],
            type: PAGES.CREATE_RUNTIME_CONFIG,
            url: URLMap.runtimeSettings(databaseId, portalId),
            icon: ICONS.RUNTIME_CONFIGURATION,
            id: generateViewId(PAGES.CREATE_RUNTIME_CONFIG, databaseId, portalId)
        };
        fetchRuntimeConfigurationData();
        setCurrentPageInfo(pageInfo);

        const runtimePage = getPageSetting(pageInfo.id, pageSettings);
        if (runtimePage.length === 0) {
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

    const fetchRuntimeConfigurationData = () => {
        const successCallback = (resp) => {
            if(portalConfig.generalSettings.isExternalUserManagementEnabled) {
                setRuntimeConfigurationAction(resp.filter((section) => section.name !== RUNTIME_PASSWORD_SECTION));
            } else {
                setRuntimeConfigurationAction(resp);
            }
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('RUNTIME_CONFIG_ERROR_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.getRequest(
            APIMap.runtimeConfigurationData(portalId),
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId
            }
        );
    };

    const submitHandler = useCallback((values) => {
        setRuntimeFormValues(values.items);
        return saveMessageBox.open();
    }, [saveMessageBox]);

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const onSubmit = () => {
        const successCallback = () => {
            history.push(URLMap.portals());
            dispatchAppNotification(
                `${translate('RUNTIME_CONFIG_SUCCESS_MESSAGE', { PORTAL_NAME: `${name}` })}`,
                NOTIFICATION_TYPE.SUCCESS
            );
            dispatch({
                type: ACTIONS.REMOVE_PAGE_SETTINGS,
                pageSettings: currentPageInfo
            });
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                dispatchAppNotification(translate('RUNTIME_CONFIG_ERROR_MESSAGE'), NOTIFICATION_TYPE.ERROR);
            }
        };
        APIService.putRequest(
            APIMap.runtimeConfigurationData(portalId),
            runtimeFormValues,
            successCallback,
            failureCallback,
            {
                [HEADERS.ORS]: databaseId
            }
        );
    };

    const validationSchema = () => {
        return yup.object().shape({
            items: yup.array().of(yup.object().shape({
                configuration: yup.array().of(yup.object().shape({
                    type: yup.string(),
                    isMandatory: yup.boolean(),
                    value: yup.string().when(['isMandatory', 'type'], (isMandatory, type) => {
                        if(isMandatory) {
                            switch (type) {
                                case DATA_TYPES.INTEGER:
                                    return yup.number()
                                        .typeError(translate('ERROR_RUNTIME_REQUIRED_NUMBER'))
                                        .positive(translate('ERROR_RUNTIME_REQUIRED_POSITIVE_NUMBER'))
                                        .required(translate('ERROR_RUNTIME_REQUIRED_NUMBER'));
                                case DATA_TYPES.STRING:
                                    return yup.string().required(translate('ERROR_RUNTIME_REQUIRED_STRING'));
                                default:
                                    break;
                            }
                        }
                    })
                }))
            }))
        });
    };

    const formikProps = useFormik({
        initialValues: { items: runtimeConfiguration },
        enableReinitialize: true,
        onSubmit: submitHandler,
        validationSchema,
    });

    return(
        <>
            <Panel className="runtime__panel portal__config__panel">
                <form>
                    <div className="runtime__heading__container">
                        <span className="runtime__heading">{translate("LABEL_RUNTIME_CONFIG")}</span>
                        <Button variant="call-to-action" onClick={formikProps.handleSubmit} data-testid="runtime-save-button">{translate('LABEL_SAVE')}</Button>
                    </div>
                    {
                        runtimeConfiguration && runtimeConfiguration.length > 0 && runtimeConfiguration.map((sections, sectionIndex) => (
                            <Section title={sections.label} collapsible data-testid="runtime-config-section">
                                <Table>
                                <Table.Header>
                                        <Table.HeaderRow>
                                            <Table.HeaderCell className="runtime__table__cell">
                                                {translate("LABEL_RUNTIME_TABLE_COLUMN_NAME")}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell className="runtime__table__cell">
                                                {translate("LABEL_RUNTIME_TABLE_COLUMN_VALUE")}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell className="runtime__table__cell">
                                                {translate("LABEL_RUNTIME_TABLE_COLUMN_DESCRIPTION")}
                                            </Table.HeaderCell>
                                        </Table.HeaderRow>
                                    </Table.Header>
                                    <Table.Body>
                                        {sections.configuration && sections.configuration.length > 0 && sections.configuration.map((config, configIndex) => (
                                            <Table.Row>
                                                <Table.Cell className="runtime__table__cell">
                                                    {config.label}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Form.Group>
                                                        <Form.Control
                                                            name={`items[${sectionIndex}].configuration[${configIndex}].value`}
                                                            as={Input}
                                                            value={formikProps.values.items && formikProps.values.items.length > 0 && formikProps.values.items[sectionIndex].configuration[configIndex].value}
                                                            onChange={formikProps.handleChange}
                                                            onBlur={formikProps.handleBlur}
                                                            data-testid={`items[${sectionIndex}].configuration[${configIndex}].value`}
                                                        />
                                                        {formikProps.touched.items && formikProps.touched.items.length > 0
                                                            && formikProps.touched.items[sectionIndex]
                                                            && formikProps.touched.items[sectionIndex].configuration[configIndex]
                                                            && formikProps.touched.items[sectionIndex].configuration[configIndex].value
                                                            && formikProps.errors.items && formikProps.errors.items.length > 0
                                                            && formikProps.errors.items[sectionIndex]
                                                            && formikProps.errors.items[sectionIndex].configuration[configIndex]
                                                            && formikProps.errors.items[sectionIndex].configuration[configIndex].value
                                                            && (
                                                                <div className="username-field-error">
                                                                    <Form.Error>
                                                                        {formikProps.errors.items[sectionIndex].configuration[configIndex].value}
                                                                    </Form.Error>                         
                                                                </div>                                                                
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Table.Cell> 
                                                <Table.Cell className="runtime__table__cell">
                                                    {config.desc}
                                                </Table.Cell>                                                                                            
                                            </Table.Row>
                                        ))}
                                    </Table.Body>                                    
                                </Table>
                            </Section>
                        ))
                    }        
                </form>
            </Panel>
                
            <DialogBox
                title={translate("LABEL_CLOSE_DIALOG_HEADER")}
                messageContentTitle={translate("LABEL_RUNTIME_SAVE_DIALOG_TITLE")}
                messageContentBody={translate("LABEL_RUNTIME_SAVE_DIALOG_BODY")}
                clickHandler={onSubmit}
                dialogBox={saveMessageBox}
                actionButtonText={translate("LABEL_CLOSE_BUTTON")}
                cancelButtonText={translate("LABEL_CLOSE_BUTTON_CANCEL")}
            />                     
        </>
    );
};

export default RuntimeConfig;
