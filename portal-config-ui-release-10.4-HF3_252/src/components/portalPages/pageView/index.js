import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Wizard, MessageBubble, Button, Panel } from "@informatica/droplets-core";
import { useFormik } from 'formik';
import PageForm from "../../portals/portalView/pageForm";
import CustomPageDesigner from "../customPageDesigner";
import RecordPageDesigner from "../recordPageDesigner";
import { StateContext } from "../../../context/stateContext";
import CONFIG from "../../../config/config";
import APIService from "../../../utils/apiService";
import { URLMap } from "../../../utils/urlMappings";
import { APIMap } from "../../../utils/apiMappings";
import { getPortalConfigMapKey, generateViewId, getPageSetting, getCookie, objectDeepKeys } from "../../../utils/utilityService";
import * as yup from "yup";

const PageView = (props) => {

    const { PAGES, ACTIONS, ICONS, HEADERS, PAGE_TYPE, NOTIFICATION_TYPE, OBJECT_KEYS: {VERSION} } = CONFIG;
    const { match: { params: { databaseId, portalId, pageId } } } = props;
    const { state: { portalConfigMap, pageSettings, portalConfig, currentPage }, dispatch } = useContext(StateContext);
    const { t: translate } = useTranslation();

    const [sectionTemplates, setSectionTemplate] = useState(undefined);
    const [pageData, setPageData] = useState({});
    const [sectionData, setSectionData] = useState(undefined);
    const [formData, setFormData] = useState({});
    const [editMode] = useState(!!pageId);
    const [pageDesignerType, setPageDesignerType] = useState(PAGE_TYPE.RECORD);
    const [bevName, setBevName] = useState("");
    const [bevMetadata, setBeMetadata] = useState(undefined);

    const portalConfigMapDt = (portalConfigMap[getPortalConfigMapKey(databaseId, portalId)]) 
        ? portalConfigMap[getPortalConfigMapKey(databaseId, portalId)] : {};
    const { version } = portalConfigMapDt;

    useEffect(() => {
        if (portalId !== portalConfig.portalId) {
            updatePortalConfigInfo();
        } else {
            getPageData();
        }
    }, [databaseId, portalId, pageId]);

    const updatePortalConfigInfo = () => {
        APIService.getRequest(
            APIMap.getPortalBasicDetails(portalId),
            (resp) => {
                handleDispatch(resp);
                getPageData();
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR)
                }
                else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR)
                }
            },
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version,
            },
        );
    };

    const handleDispatch = (portalConfigInfo) => {
        dispatch({
            type: ACTIONS.SET_PORTAL_CONFIGURATION,
            portalConfig: portalConfigInfo,
        });
    };

    const setCurrentPageInfo = (pageName) => {

        let currentPageId = editMode ? generateViewId(PAGES.EDIT_PAGE, databaseId, portalId, pageId) : generateViewId(PAGES.CREATE_PAGE, databaseId, portalId);
        let breadCrumb = [portalConfigMapDt.name ? portalConfigMapDt.name : "", editMode ? pageName ? pageName : "" : translate("LABEL_CREATE_PAGE")];
        let pageUrl = editMode ? URLMap.editPortalPage(databaseId, portalId, pageId) : URLMap.createPortalPage(databaseId, portalId);

        let currentPageMatch = getPageSetting(currentPageId, pageSettings);
        let actionType = (currentPageMatch.length > 0) ? ACTIONS.UPDATE_PAGE_SETTINGS : ACTIONS.ADD_PAGE_SETTINGS;
        let currentPageInfo = {
            label: breadCrumb,
            type: editMode ? PAGES.EDIT_PAGE : PAGES.CREATE_PAGE,
            url: pageUrl,
            icon: ICONS.PAGE,
            id: currentPageId,
        };
        dispatch({
            type: ACTIONS.SET_CURRENT_PAGE_SETTINGS,
            currentPage: currentPageInfo,
        });
        dispatch({
            type: actionType,
            pageSettings: currentPageInfo,
        });
    };

    const getBevMetadata = (databaseId, beName) => {
        APIService.getRequest(
            APIMap.getBevMetadata(databaseId, beName),
            (resp) => {
                setBeMetadata(resp);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
                setBeMetadata(undefined);
            },
            { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)}
        );
    };

    const getSectionTemplates = () => {
        APIService.getRequest(
            APIMap.getSectionTemplates(),
            (resp) => {
                if (resp && Array.isArray(resp)) {
                    setSectionTemplate(resp);
                }
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            },
        );
    };

    const bevNameHandler = (newBevName) => {
        if (bevName && bevName !== newBevName && !bevMetadata) {
            return bevMetadata;
        }
        setBevName(newBevName);
        return getBevMetadata(databaseId, newBevName);
    };

    const pageTypeHandler = (pageType) => {
        if (pageType === PAGE_TYPE.CUSTOM && !sectionData) {
            getSectionTemplates();
        }
        setPageDesignerType(pageType);
    };

    const getPageData = () => {
        if (!editMode) {
            setCurrentPageInfo(pageData.name);
            setPageData({"maxColumns" : 2});
            return;
        }
        let pageEditUrl = APIMap.editPortalPage(portalId, pageId);
        APIService.getRequest(
            pageEditUrl,
            (resp) => {
                setPageData(resp);
                setPageDesignerType(resp.type);
                if (resp.type === PAGE_TYPE.RECORD) {
                    setFormData(transformInputBeFormData(resp.layout.sections));
                    bevNameHandler(resp.bevName);
                } else {
                    setSectionData(resp.layout.sections);
                    getSectionTemplates();
                }
                setCurrentPageInfo(resp.name);
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
                // Handle failure seamlessly
                setCurrentPageInfo(PAGES.CREATE_PAGE);
            },
            {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version,
            },
        );
    };

    const handleFormikErrors = (errors, setFieldTouched) => {
        const errorrKeys = objectDeepKeys(errors);
        if (Object.entries(errors).length === 0) {
            return true;
        }
        errorrKeys.map((err) => setFieldTouched(err, true));
        return false;
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

    const updatePortalConfigMap = async (newVersion) => {
        let portalConfigMapDtUpdated = {};
        let portalMapKey = getPortalConfigMapKey(databaseId, portalId);
        portalConfigMapDtUpdated[portalMapKey] = { ...portalConfigMapDt, [VERSION] : newVersion };
        
        await dispatch({
            type: ACTIONS.UPDATE_PORTAL_CONFIG_MAP,
            portalConfigMap: portalConfigMapDtUpdated,
        });
        props.history.push(URLMap.portalDetails(databaseId, portalId));
    };

    const transformOutputBeFormData = () => {
        let beFormData = JSON.parse(JSON.stringify(formData));
        beFormData.componentType = "BeFormComponent";
        let defaultSectionTemplate = {
            "displayIcon": "rectangle",
            "isDefault": false,
            "containers": [{
                "components": [beFormData],
                "style": {
                    "width": 1,
                },
            }],
            "sectionType": "Section-Type 1",
        };
        return [defaultSectionTemplate];
    };

    const transformInputBeFormData = (sections) => {
        let beFormData = {};
        if (sections && Array.isArray(sections) && sections[0].containers
                && Array.isArray(sections[0].containers) && sections[0].containers[0].components
                && Array.isArray(sections[0].containers[0].components)
                && sections[0].containers[0].components.length === 1) {
            beFormData = JSON.parse(JSON.stringify(sections[0].containers[0].components[0]));
        }
        return beFormData;
    };

    const onSubmit = (values) => {
        let PAGE_NAME = values.name;

        if (values.type === PAGE_TYPE.RECORD) {
            values.layout = { sections: transformOutputBeFormData() };
        } else {
            values.layout = { sections: sectionData };
        }
        const successCallback = (resp) => {
            let currentPageId = editMode ? generateViewId(PAGES.EDIT_PAGE, databaseId, portalId, pageId) : generateViewId(PAGES.CREATE_PAGE, databaseId, portalId);
            dispatch({
                type: ACTIONS.REMOVE_PAGE_SETTINGS,
                pageSettings: {
                    id: currentPageId,
                },
            });
            if (resp.version) {
                updatePortalConfigMap(resp.version);
            }
            let message = !editMode ? translate("CREATE_PAGE_SUCCESS_MESSAGE",{ PAGE_NAME: `${PAGE_NAME}`})
                : translate("EDIT_PAGE_SUCCESS_MESSAGE",{ PAGE_NAME: `${PAGE_NAME}`});
            dispatchAppNotification(message, NOTIFICATION_TYPE.SUCCESS);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
            } else {
                const message = !editMode ? translate("CREATE_PAGE_ERROR_MESSAGE") : translate("EDIT_PAGE_ERROR_MESSAGE");
                dispatchAppNotification(message, NOTIFICATION_TYPE.ERROR);
            }
        };
        if (!editMode) {
            let createPageUrl = APIMap.createPortalPage(portalId);
            APIService.postRequest(createPageUrl, values, successCallback, failureCallback, {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version,
            });
        } else {
            let updatePageUrl = APIMap.editPortalPage(portalId, pageId);
            APIService.putRequest(updatePageUrl, values, successCallback, failureCallback, {
                [HEADERS.ORS]: databaseId,
                [HEADERS.VERSION]: version,
            });
        }
    };

    function editGeneralSettings(status, visible, redirectURL, navClick){
        dispatch({
            type: ACTIONS.EDIT_GENERAL_SETTINGS_PAGE_STATUS,
            editStatus: status,
            dialogBoxVisible: visible,
            nextPage: redirectURL,
            pageType: navClick
        });
    }
    
    const getSaveButton = ({ errors, handleSubmit }) => {
        if (errors && Object.keys(errors).length > 0) {
            return <MessageBubble type={NOTIFICATION_TYPE.ERROR} timeout={5000}>
                {translate("ERROR_MISSING_MANDATORY_FIELDS")}
            </MessageBubble>;
        } else {
            return <span className="save__button">
                <Button 
                    data-testid="save-button"
                    onClick={()=>{
                        editGeneralSettings(false, false, currentPage.url);
                        handleSubmit();
                    }} 
                variant="call-to-action">{translate("LABEL_SAVE")}</Button>
            </span>;
        }
    };

    const validationSchema = () => {
        return yup.object().shape({
            name: yup.string().required(translate("ERROR_REQUIRED_PAGE_NAME")),
            type: yup.string().required(translate("ERROR_REQUIRED_PAGE_TYPE")),
            bevName: yup.string().when('type', {
                is: PAGE_TYPE.RECORD,
                then: yup.string().required(translate("ERROR_REQUIRED_BUSINESS_ENTITY_VIEW"))
            })
        });
    };

    const getPageDesigner = () => {
        if (pageDesignerType === PAGE_TYPE.RECORD) {
            return <RecordPageDesigner
                configName={bevName}
                bevMetadata={bevMetadata}
                handleFormUpdate={(updatedFormData) => setFormData(updatedFormData)}
                bevFormData={formData}
            />;
        } else {
            return <CustomPageDesigner
                setSectionData={(updatedSectionList) => setSectionData(updatedSectionList)}
                sectionData={sectionData}
                sectionTemplates={sectionTemplates}
            />;
        }
    };

    const formikProps = useFormik({
        initialValues: pageData,
        enableReinitialize: true,
        onSubmit: onSubmit,
        validationSchema,
    });
    
    return (
        <Panel className="portal__config__panel">
            <form className="form" onSubmit={formikProps.handleSubmit}>
                <Wizard
                    steps={[
                        {
                            name: translate("LABEL_GENERAL"),
                            isValid: () => {
                                return formikProps.validateForm().then(errors => {
                                    return handleFormikErrors(errors, formikProps.setFieldTouched);
                                });
                            },
                            render: () => {
                                let pageFormLayout = null;
                                if (!editMode || (editMode && pageData && pageData.id === pageId)) {
                                    pageFormLayout = (
                                        <PageForm
                                            pageId={pageId}
                                            pageTypeHandler={(pageType) => pageTypeHandler(pageType)}
                                            bevNameHandler={bevNameHandler}
                                            formikProps={formikProps}
                                            editMode={editMode}
                                        />
                                    );
                                }
                                return pageFormLayout;
                            },
                        },
                        {
                            name: translate("LABEL_PAGE_DESIGNER"),
                            render: () => getPageDesigner(),
                        },
                    ]}
                >
                    <div className="d-wizard__toolbar wizard__toolbar">
                        <Wizard.Roadmap/>
                        <Wizard.Controls renderNextOnLastStep={getSaveButton(formikProps)}/>
                    </div>
                    <Wizard.View/>
                </Wizard>
            </form>
        </Panel>        
    );
};
export default PageView;
