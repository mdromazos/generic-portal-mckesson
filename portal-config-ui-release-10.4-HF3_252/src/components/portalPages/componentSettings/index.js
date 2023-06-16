import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from 'formik';
import { Dialog, Tabs, Button } from "@informatica/droplets-core";
import ExternalLinkSettings from "./externalLinkSettings";
import TwitterFeedSettings from "./twitterFeedSettings";
import TextSettings from "./textSettings";
import GeneralSettings from "./generalSettings";
import WizardSettings from "./wizardSettings";
import * as yup from "yup";
import { StateContext } from "../../../context/stateContext";
import CONFIG from "../../../config/config";
import PropTypes from "prop-types";
import P360CatalogSettings from "./product360CatalogSettings";
import P360CatalogUploadSettings from "./product360CatalogUploadSettings";
import P360TimelineSettings from "./product360TimelineSettings";
import P360TaskViewSettings from "./product360TaskViewSettings";
import "./index.css";

const ComponentSettings = ({ settingsDisplayDialogBox, componentData: {
    component, sectionData, sectionIndex, containerIndex, setSectionData, componentIndex }}) => {

    const { dispatch } = useContext(StateContext);
    const { t: translate } = useTranslation();
    const [currentTab, setCurrentTab] = useState("GENERAL");
    const [componentData, setComponentData] = useState(null);
    const [wizardStepIndex, setWizardStepIndex] = useState(0);
    const { ACTIONS, COMPONENTS, NOTIFICATION_TYPE } = CONFIG;
    let componentTitle = component.title;

    useEffect(() => {
        let componentSettings = JSON.parse(JSON.stringify(component));
        if (componentSettings.componentType === COMPONENTS.WIZARD
                    && componentSettings.showOverview === undefined) {
            componentSettings.showOverview = true;
        }
        setComponentData(componentSettings);
    }, []);

    const updateWizardStepIndex = (wizardData, stepIndex) => {
        if(stepIndex >= 0) {
            setWizardStepIndex(stepIndex);
        }
        if(wizardData) {
            setComponentData(wizardData);
        }
    };

    const  renderComponentSetting = (formikProps) => {
        switch (component.componentType) {
            case COMPONENTS.WIZARD:
                return <WizardSettings
                    wizardData={JSON.parse(JSON.stringify(componentData))}
                    updateWizardData={updateWizardStepIndex}
                    formikProps={formikProps}
                    stepIndex={wizardStepIndex}
                />;
            case COMPONENTS.EXTERNAL_LINK:
                return <ExternalLinkSettings formikProps={formikProps} />;
            case COMPONENTS.TWITTER_FEED:
                return <TwitterFeedSettings formikProps={formikProps} />;
            case COMPONENTS.TEXT:
                return <TextSettings formikProps={formikProps} />; 
            case COMPONENTS.P360_CATALOG:
                return <P360CatalogSettings formikProps={formikProps} />;
            case COMPONENTS.P360_CATALOG_UPLOAD:
                return <P360CatalogUploadSettings formikProps={formikProps} />;
            case COMPONENTS.P360_CATALOG_TIMELINE:
                return <P360TimelineSettings formikProps={formikProps} />;
            case COMPONENTS.P360_TASK_VIEW:
                return <P360TaskViewSettings formikProps={formikProps} />;
            default:
                return "";
        }
    };

    const pageContent = {
        GENERAL: (formikProps) => <GeneralSettings formikProps={formikProps} />,
        COMPONENT: (formikProps) => renderComponentSetting(formikProps),
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

    const handleBuilderSave = (values) => {
        let componentSettings = JSON.parse(JSON.stringify(values));

        if(componentSettings.componentType === COMPONENTS.WIZARD) {
            if(!componentSettings.showOverview) {
                componentSettings.overviewHeading = undefined;
                componentSettings.overviewTitle = undefined;
                componentSettings.overviewBody = undefined;
            }
        }
        if (componentSettings.componentType === COMPONENTS.EXTERNAL_LINK) {
            let paramArray = [];
            if (componentSettings.url.includes(CONFIG.EXTERNAL_LINK_PARAMS.PARAMETERS)) {
                componentSettings.url = componentSettings.url.slice(0, componentSettings.url.indexOf("?"));
            }
            if (values.hasBEName) {
                paramArray.push(CONFIG.EXTERNAL_LINK_PARAMS.BE_NAME_PARAM);
            }
            if (values.hasBERowid) {
                paramArray.push(CONFIG.EXTERNAL_LINK_PARAMS.ROW_ID_PARAM);
            }
            if (paramArray.length > 0) {
                componentSettings.url =
                    `${componentSettings.url}?${CONFIG.EXTERNAL_LINK_PARAMS.PARAMETERS}=${paramArray.join()}`;
            }
        }
        let sectionDataCopy = [...sectionData];
        let currentContainerIndex = parseInt(containerIndex.slice(containerIndex.length - 1));
        sectionDataCopy[sectionIndex].containers[currentContainerIndex].components[componentIndex] = componentSettings;

        setSectionData(sectionDataCopy);
        setComponentData(componentSettings);
        settingsDisplayDialogBox.close();
        dispatchAppNotification(`${translate("LABEL_COMPONENT_SETTINGS")}`, NOTIFICATION_TYPE.SUCCESS);
    };

    const validationSchema = () => {
        switch (component.componentType) {
            case COMPONENTS.WIZARD:
                return yup.object().shape({
                    configName: yup.string().required(translate("ERROR_REQUIRED_BUSINESS_ENTITY_VIEW")),
                    associatedTaskType: yup.string().required(translate("ERROR_REQUIRED_ASSOCIATED_TASK_TYPE")),
                    primaryAction: yup.string().required(translate("ERROR_REQUIRED_PRIMARY_ACTION")),
                    customHeight: yup.number().when('displayHeight', {
                        is: heightType => heightType === CONFIG.DISPLAY_HEIGHT_OPTIONS.CUSTOM,
                        then: yup.number()
                            .typeError(translate("ERROR_NUMBER_HEIGHT"))
                            .min(CONFIG.DEFAULT_HEIGHT_CUSTOM, translate("ERROR_MIN_HEIGHT"))
                            .required(translate("ERROR_REQUIRED_HEIGHT"))
                    })
                });
            case COMPONENTS.EXTERNAL_LINK:
                return yup.object().shape({
                    url: yup.string().matches(/((http:\/\/|https:\/\/|ftp\/\/))/,{
                        message:translate("ERROR_REQUIRED_VALID_URL")
                    }).required(translate("ERROR_REQUIRED_URL")),
                    customHeight: yup.number().when('displayHeight', {
                        is: heightType => heightType === CONFIG.DISPLAY_HEIGHT_OPTIONS.CUSTOM,
                        then: yup.number()
                            .typeError(translate("ERROR_NUMBER_HEIGHT"))
                            .min(CONFIG.DEFAULT_HEIGHT_CUSTOM, translate("ERROR_MIN_HEIGHT"))
                            .required(translate("ERROR_REQUIRED_HEIGHT"))
                    })
                });
            case COMPONENTS.TWITTER_FEED: 
             return yup.object().shape({
                url: yup.string().matches(/twitter.com/, {
                    message: translate("ERROR_DOMAIN_URL")   
                }).required(translate("ERROR_REQUIRED_TWITTER_URL")),
                customHeight: yup.number().when('displayHeight', {
                    is: heightType => heightType === CONFIG.DISPLAY_HEIGHT_OPTIONS.CUSTOM,
                    then: yup.number()
                        .typeError(translate("ERROR_NUMBER_HEIGHT"))
                        .min(CONFIG.DEFAULT_HEIGHT_CUSTOM,translate("ERROR_MIN_HEIGHT"))
                        .required(translate("ERROR_REQUIRED_HEIGHT"))
                })
            });
            case COMPONENTS.TEXT:
                return yup.object().shape({
                    customHeight: yup.number().when('displayHeight', {
                        is: heightType => heightType === CONFIG.DISPLAY_HEIGHT_OPTIONS.CUSTOM,
                        then: yup.number()
                            .typeError(translate("ERROR_NUMBER_HEIGHT"))
                            .min(CONFIG.DEFAULT_HEIGHT_CUSTOM, translate("ERROR_MIN_HEIGHT"))
                            .required(translate("ERROR_REQUIRED_HEIGHT"))
                    })
                });
            case COMPONENTS.P360_CATALOG:
                return yup.object().shape({
                    serverUrl: yup.string().required(translate("ERROR_REQUIRED_SERVER_URL")),
                    user: yup.string().required(translate("ERROR_REQUIRED_PRODUCT_360_USER")),
                });
            case COMPONENTS.P360_CATALOG_UPLOAD:
                return yup.object().shape({
                    serverUrl: yup.string().required(translate("ERROR_REQUIRED_SERVER_URL")),
                    user: yup.string().required(translate("ERROR_REQUIRED_PRODUCT_360_USER")),
                });
            case COMPONENTS.P360_CATALOG_TIMELINE:
                return yup.object().shape({
                    serverUrl: yup.string().required(translate("ERROR_REQUIRED_SERVER_URL")),
                });
            case COMPONENTS.P360_TASK_VIEW:
                return yup.object().shape({
                    serverUrl: yup.string().required(translate("ERROR_REQUIRED_SERVER_URL")),
                });
            default: break;
        }
    };

    const formikProps = useFormik({
        initialValues: JSON.parse(JSON.stringify(componentData)),
        enableReinitialize: true,
        onSubmit: handleBuilderSave,
        validationSchema,
    });

    return <>
        {componentData && 
            (<div className="component__settings__dialog">
                    <Dialog
                        {...settingsDisplayDialogBox} 
                        className="component__settings__dialog"
                        bounds="parent"
                    >
                        <Dialog.Header
                            title={`${componentTitle}${" "}${translate("LABEL_COMPONENT_SETTING_CONFIGURATION")}`}
                        />                        
                        <form className="form" onSubmit={formikProps.handleSubmit} data-testid="component-settings-form">
                            <Dialog.Content>
                                <Tabs>
                                    <Tabs.Tab
                                        aria-current={currentTab === "GENERAL" ? "page" : undefined}
                                        onClick={() => setCurrentTab("GENERAL")}>
                                        {translate("LABEL_GENERAL")}
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        aria-current={currentTab === "COMPONENT" ? "page" : undefined}
                                        onClick={() => setCurrentTab("COMPONENT")}>
                                        {translate("LABEL_COMPONENT")}
                                    </Tabs.Tab>
                                </Tabs>
                                <div className="component__container">
                                    {pageContent[currentTab](formikProps)}
                                </div>
                            </Dialog.Content>
                            <Dialog.Footer>
                                <Button type="submit" variant="primary" data-testid="component-settings-save-button">
                                    {translate("LABEL_SAVE")}
                                </Button>
                                <Button onClick={settingsDisplayDialogBox.close}> {translate("LAYOUT_BUTTON_CANCEL")}</Button>
                            </Dialog.Footer>                
                        </form>                        
                    </Dialog>
            </div>)
        }
    </>;
};
ComponentSettings.propTypes = {
    settingsDisplayDialogBox: PropTypes.object.isRequired
};
export default ComponentSettings;
