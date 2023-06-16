import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { getLookupHandler, getHeight, getCommentDetails, getUserPreferenceIdBasedOnComponentId } from '../../../common/helperUtils';
import { Button, Menu, IconButton, MessageBox, Dialog, Tooltip, useDialogState, useMessageBoxState } from '@informatica/droplets-core';
import PortalPageWizard from "./PortalPageWizard";
import PortalWizardHome from "./PortalWizardHome";
import './index.css';
import { StateContext } from '../../../context/stateContext';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService';
import BEForm from "../../beForm/beForm";
import '@informatica/droplets-core/dist/themes/archipelago/components/form.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/button.css';
import { useTranslation } from "react-i18next";
import CONFIG from './../../../config/config';
import { base64StringToBlob } from 'blob-util';
import { saveAs } from 'file-saver';

import Text from "../textComponent";

const PortalWizardHandler = ({ match, beMeta, beName, history }) => {

    const [initialData, setInitialData] = useState({});
    const [taskDt, setTaskDt] = useState(undefined);
    const [selectedTaskActionDt, setSelectedTaskActionDt] = useState({});
    const [{ 
        globalSettings: { sourceSystem }, 
        notificationActions: { dispatchAppNotification }, 
        userPreferenceActions: {updateUserPreference, removeUserPreference },
        userPreferences   
    }] = useContext(StateContext);
    const { t: translate } = useTranslation();

    const taskLogoutMessageBox = useMessageBoxState();
    const taskConfirmationBox = useDialogState();
    const commentsDialogBox = useDialogState();
    const previewDialogBox = useDialogState();

    const {
        LOOKUP_PROXY_PAYLOAD: { API_URL, HTTP_METHOD, PROXY_ATTRIBUTE }, PROXY_PAYLOAD,
        HTTP_METHOD: { GET, POST, PUT }, DEFAULT_FILENAME, BE_FORM_MODES, ORS_ID, PORTAL_ID_HEADER,
        CONSTANTS: { NOTIFICATION_ERROR, NOTIFICATION_SUCCESS, NOTIFICATION_INFO, COMMENT_MAX_LEN }, 
        RECORD_STATE : { ACTIVE, PENDING }, IMAGES, COMMENT, TASK_DETAILS, CONTENT_TYPE, 
        SESSION_POLICY: { SESSION_TIMEOUT_VALUE, SESSION_TIMEOUT_WARNING_VALUE },
        PREFERENCE_TYPE : { WIZARD_COMPLETED_STEPS }
    } = CONFIG;
    const [dataRequestCompleted, setDataRequestCompleted] = useState(false);
    const [validSteps, setValidSteps] = useState({});
    const [visitedSteps, setVisitedSteps] = useState({});
    const [initialVisitedSteps, setInitialVisitedSteps] = useState([]);
    const [stepChangeDt, setStepChangeDt] = useState({});
    const [executeTask, setExecuteTask] = useState(false);
    const [userPreferenceId, setUserPreferenceId] = useState(null);

    const childRef = useRef();
    const commentInput = useRef(null);
    const commentInputError = useRef(null);
    const commentMaxLengthError = useRef(null);

    useEffect(() => {
        fetchTaskLists();
    }, []);

    useEffect(() => {
        if(userPreferenceId === null) {
            setUserPreferenceId(getUserPreferenceIdBasedOnComponentId(userPreferences, beMeta.id, "WizardId"))
        }
    }, [userPreferences]);

    useEffect(() => {
        let completedSteps = [];
        if(userPreferenceId && userPreferences[userPreferenceId]) {
            completedSteps = JSON.parse(JSON.stringify(userPreferences[userPreferenceId].USER_PREFERENCE.completedSteps))
        }
        if(beMeta && beMeta.showOverview) {
            completedSteps.unshift(true);
        }
        setInitialVisitedSteps(completedSteps);
    }, [userPreferenceId]);

    const getRowId = () => {
        return decodeURIComponent(document.cookie.match(/rowId=([^;]*)/) ? document.cookie.match(/rowId=([^;]*)/)[1] : '');
    };

    const getUsername = () => {
        return decodeURIComponent(document.cookie.match(/username=([^;]*)/) ? document.cookie.match(/username=([^;]*)/)[1] : '');
    };

    const beRowId = getRowId();

    const getLogoutMessageBox = () => {
        return <MessageBox 
                type={NOTIFICATION_INFO}
                title={translate('WIZARD_TASK_LOGOUT_DIALOG_TITLE')} 
                data-testid="wizard_logout_box"
                {...taskLogoutMessageBox}
            >
            <MessageBox.Content data-testid="wizard_logout_box_content">
                <div className="wizard__logout__message__content">
                    <MessageBox.Title className="message__box__title" data-testid="wizard_logout_box_title">
                        {translate("WIZARD_TASK_SUCCESS_MESSAGE", { TASK_NAME: `${selectedTaskActionDt[TASK_DETAILS.ACTION.LABEL]}` })}
                    </MessageBox.Title>
                    <p className="wizard__logout__message__content__body">
                        {translate("WIZARD_TASK_LOGOUT_MESSAGE")}
                    </p>
                </div>
            </MessageBox.Content>
            <MessageBox.Footer data-testid="wizard_logout_box_footer">
                <Button
                    onClick={() => {
                        handleLogout();
                        taskLogoutMessageBox.close();
                    }}
                    data-testid="wizard_logout_box_button"
                    variant="primary"
                >
                    {translate("BE_FORM_LABEL_OK")}
                </Button>
            </MessageBox.Footer>
        </MessageBox>
    };

    const fetchTaskDetails = (taskDt) => {
        const successCallback = (response) => {
            fetchBEData();
            setTaskDt(response);
        };
        let rowId = beRowId;
        let payLoad = {};
        payLoad[API_URL] = URLMap.getTaskDetails(match.params.orsId, taskDt[TASK_DETAILS.TASK_ID]);
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        APIService.postRequest(URLMap.getProxy(), payLoad, successCallback,
            (error) => { console.log(error); },
            {
                [ORS_ID]: match.params.orsId,
                [PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    const fetchTaskLists = function () {
        const successCallback = (response) => {
            if (response && response.task && Array.isArray(response.task) && response.task.length > 0) {
                fetchTaskDetails(response.task[0]);
            }
        };

        let rowId = beRowId;
        let payLoad = {};
        payLoad[API_URL] = URLMap.getTaskList(match.params.orsId, beName, getUsername(), beMeta.associatedTaskType, "OPEN");
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        APIService.postRequest(URLMap.getProxy(), payLoad, successCallback,
            (error) => { setDataRequestCompleted(true); console.log(error); },
            {
                [ORS_ID]: match.params.orsId,
                [PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    const getUserPreferencePayload = (stepIndex) => {
        
        let payloadObject = {};
        let stepid;

        payloadObject.shouldSavePreference = true;

        if(beMeta && beMeta.steps) {
            stepid = beMeta.steps[stepIndex].id;
        }
        
        if(userPreferenceId) {
            payloadObject.payload = JSON.parse(JSON.stringify(userPreferences[userPreferenceId]))
        } else {
            payloadObject.payload = { 
                WizardId: beMeta.id,
                PREFERENCE_TYPE: WIZARD_COMPLETED_STEPS,
                USER_PREFERENCE: {
                    completedSteps: []
                }
            }
        }
    
        if (!payloadObject.payload.USER_PREFERENCE.completedSteps.includes(stepid)) {
            payloadObject.payload.USER_PREFERENCE.completedSteps.push(stepid);
        } else {
            payloadObject.shouldSavePreference = false;
        }

        return payloadObject;
    };


    const saveUserPreference = (stepIndex) => {

        let retrievedPayload = getUserPreferencePayload(stepIndex);

        const successCallback = response => {
            updateUserPreference(response);
        };

        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
        };

        if(retrievedPayload.shouldSavePreference) {
            if(userPreferenceId) {
                APIService.putRequest(
                    URLMap.savePortalPreferences(getUsername(), userPreferenceId), 
                    retrievedPayload.payload, 
                    successCallback,
                    failureCallback, 
                    {
                        [ORS_ID]: match.params.orsId,
                        [PORTAL_ID_HEADER]: match.params.id
                    }
                );
            } else {
                APIService.postRequest(
                    URLMap.savePortalPreferences(getUsername()),
                    retrievedPayload.payload, 
                    successCallback,
                    failureCallback, 
                    {
                        [ORS_ID]: match.params.orsId,
                        [PORTAL_ID_HEADER]: match.params.id
                    }
                );
            }
        }
    };

    const handlePost = (values, actions, onSaveSuccess, onSaveFailure, stepIndex) => {
        actions.setSubmitting(true);

        let payLoad = {};
        let rowId = beRowId;
        let apiUrl = URLMap.postBEData(match.params.orsId, beMeta.configName, rowId, taskDt[TASK_DETAILS.INTERACTION_ID], true);

        payLoad[API_URL] = `${apiUrl}&systemName=${sourceSystem}`;
        payLoad[HTTP_METHOD] = POST;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        payLoad[PROXY_PAYLOAD] = values;

        const successCallback = resp => {
            fetchBEData();
            onSaveSuccess();
            saveUserPreference(stepIndex);
            if (executeTask) {
                if (selectedTaskActionDt) {
                    if (selectedTaskActionDt[TASK_DETAILS.ACTION.MESSAGE] ||
                        selectedTaskActionDt[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.MANDATORY ||
                        selectedTaskActionDt[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.OPTIONAL) {
                        taskConfirmationBox.open();
                    } else {
                        executeTaskActionOnConfirmation(selectedTaskActionDt);
                    }
                }
                setExecuteTask(false);
            } else if (stepChangeDt.handleStepChange && typeof (stepChangeDt.handleStepChange) === "function") {
                stepChangeDt.handleStepChange(stepChangeDt.stepNumber);
                setStepChangeDt({});
            }
        };

        const failureCallback = ({ response: { data } }) => {
            setStepChangeDt({});
            setExecuteTask(false);
            if (data.errorCode) {
                dispatchAppNotification(translate(data.errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
            if (data.errorData) {
                onSaveFailure(data.errorData);
            }
        };

        APIService.postRequest(
            URLMap.getProxy(), 
            payLoad, 
            successCallback,
            failureCallback, 
            {
                [ORS_ID]: match.params.orsId,
                [PORTAL_ID_HEADER]: match.params.id
            }
        );
    };

    const fetchBEData = function () {
        const successCallback = (response) => {
            setInitialData(response);
            setDataRequestCompleted(true);
        };

        let rowId = beRowId;
        let payLoad = {};
        const recordState = `${ACTIVE},${PENDING}`;
        payLoad[API_URL] = URLMap.getBEData(match.params.orsId, beMeta.configName, rowId, recordState);
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        APIService.postRequest(URLMap.getProxy(), payLoad,
            successCallback,
            (error) => { setDataRequestCompleted(true); console.log(error); },
            {
                [ORS_ID]: match.params.orsId,
                [PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    const fileHandler = {
        getFileMetadataHandler: (storageType, fileId) => {
            let payLoad = {};
            payLoad[API_URL] = URLMap.getFileMetadata(match.params.orsId, storageType, fileId);
            payLoad[HTTP_METHOD] = GET;
            payLoad[PROXY_ATTRIBUTE] = beRowId;
            return new Promise((resolve, reject) => {
                APIService.postRequest(URLMap.getProxy(), payLoad,
                    (response) => {
                        resolve(response);
                    },
                    (error) => {
                        reject(error);
                    },
                    {
                        [ORS_ID]: match.params.orsId,
                        [PORTAL_ID_HEADER]: match.params.id
                    },
                );
            })
        },
        createFileMetadataHandler: (storageType, fileObj) => {
            let payLoad = {};
            payLoad[API_URL] = URLMap.createFileMetadata(match.params.orsId, storageType);
            payLoad[HTTP_METHOD] = POST;
            payLoad[PROXY_ATTRIBUTE] = beRowId;
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
                    {
                        [ORS_ID]: match.params.orsId,
                        [PORTAL_ID_HEADER]: match.params.id
                    },
                );
            })
        },
        uploadFileContentHandler: (storageType, fileId, fileObj) => {
            let payLoad = {};
            payLoad[API_URL] = URLMap.uploadFileContent(match.params.orsId, storageType, fileId);
            payLoad[HTTP_METHOD] = PUT;
            payLoad[PROXY_ATTRIBUTE] = beRowId;
            const uploadFormData = new FormData();
            uploadFormData.append("file", fileObj);
            uploadFormData.append("payload", JSON.stringify(payLoad));
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
                    {
                        [ORS_ID]: match.params.orsId,
                        [PORTAL_ID_HEADER]: match.params.id,
                        [CONTENT_TYPE.KEY]: CONTENT_TYPE.FILE_UPLAOD
                    }
                );
            })
        },
        getFileDownloadLinkHandler: (storageType, fileId) => {
            let payLoad = {};
            payLoad[API_URL] = URLMap.uploadFileContent(match.params.orsId, storageType, fileId);
            payLoad[HTTP_METHOD] = GET;
            payLoad[PROXY_ATTRIBUTE] = beRowId;
            const downloadUrl = URLMap.getFileDownloadProxy();

            APIService.postRequest(
                downloadUrl,
                payLoad,
                (response, responseHeader) => {
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
                (error) => {
                    console.log(error);
                }, 
                {
                    [ORS_ID]: match.params.orsId,
                    [PORTAL_ID_HEADER]: match.params.id, 
                    responseType: 'blob'
                }
            );
            return downloadUrl;
        }
    };

    const getOneToManyBEDataHandler = (fieldName, paramString) => {
        const { LOOKUP_PROXY_PAYLOAD: { API_URL, HTTP_METHOD, PROXY_ATTRIBUTE },
            HTTP_METHOD: { GET } } = CONFIG;

        let rowId = beRowId;//getCookie(BE_ROW_ID);
        let payLoad = {};
        const recordState = `${ACTIVE},${PENDING}`;
        payLoad[API_URL] = URLMap.getBEDataForOneToMany(
            match.params.orsId,
            beMeta.configName,
            rowId,
            fieldName,
            paramString,
            recordState
        );
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = rowId;
        return new Promise((resolve, reject) => {
            APIService.postRequest(URLMap.getProxy(), payLoad,
                (response) => {
                    resolve(response);
                },
                (error) => {
                    reject(error);
                },
                {
                    [ORS_ID]: match.params.orsId,
                    [PORTAL_ID_HEADER]: match.params.id
                },
            );
        });
    };

    const handleDataValidation = (values, successCallback, failureCallback) => {
        let dataToValidate = { ...values, rowidObject: beRowId };
        let payLoad = {};
        let rowId = beRowId;
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
            }, (errorResponse) => {
                dispatchAppNotification(translate("GENERIC__ERROR__MESSAGE"), NOTIFICATION_ERROR);

                if (errorResponse && errorResponse.response && errorResponse.response.data
                    && errorResponse.response.data.errorData) {
                    failureCallback(errorResponse.response.data.errorData);
                }
            }, {
            [ORS_ID]: match.params.orsId,
            [PORTAL_ID_HEADER]: match.params.id
        });

    };

    const validateWizardStep = () => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    };

    const wizardStepsList = useMemo(
        () => {
            let stepsList = [];
            let stepOverviewList = [];

            if (dataRequestCompleted && Object.keys(initialData).length) {
                beMeta && Array.isArray(beMeta.steps) && beMeta.steps.forEach(function (stepObj, index) {
                    let content = "";
                    if (stepObj.beFormComponent) {
                        content = (
                            <div>
                                <BEForm beData={initialData}
                                    beMeta={stepObj.beFormComponent}
                                    onSave={(values, actions, onSaveSuccess, onSaveFailure) => 
                                        handlePost(values, actions, onSaveSuccess, onSaveFailure, index)
                                    }
                                    getLookupHandler={getLookupHandler.bind(this, match)}
                                    fileHandler={fileHandler}
                                    ref={childRef}
                                    validateData={handleDataValidation}
                                    getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                                    mode={BE_FORM_MODES.EDIT_ONLY}
                                    key={"beform_" + index}
                                    history={history}
                                />
                                <Text
                                    component ={{heading: "", body: stepObj.description}}
                                />


                            </div>
                        );
                    }
                    let stepStatus = userPreferenceId && userPreferences[userPreferenceId] ? 
                        userPreferences[userPreferenceId].USER_PREFERENCE.completedSteps.includes(stepObj.id) : false;
                    stepOverviewList.push({ name: stepObj.title, status: stepStatus });
                    stepsList.push(
                        {
                            name: stepObj.title,
                            stepNumber: index + 1,
                            circleText: index + 1,
                            className: "stepClass_" + index,
                            render: ({ setStep }) => (
                                content
                            ),
                            isValid: (currentStepNumber) => {
                                return validateWizardStep().then(errors => {
                                    let isStepValid = true;
                                    if (childRef.current) {
                                        isStepValid = childRef.current.getBeFormStatus();
                                    }
                                    if (!isStepValid && childRef.current) {
                                        childRef.current.triggerBEFormSave();
                                    }
                                    let validStepsDt = { ...validSteps };
                                    if (validStepsDt[currentStepNumber] !== isStepValid) {
                                        validStepsDt[currentStepNumber] = isStepValid;
                                        setValidSteps(validStepsDt);
                                    }

                                    return isStepValid;
                                });
                            },
                            beforeLeave: (currentStepNumber) => {
                                return validateWizardStep().then(errors => {
                                    let visitedStepsDt = { ...visitedSteps };
                                    visitedStepsDt[currentStepNumber] = true;
                                    setVisitedSteps(visitedStepsDt);
                                    return true;
                                });
                            }
                        }
                    );
                });
            };

            if (beMeta && beMeta.showOverview) {
                stepsList.unshift({
                    name: beMeta.overviewHeading,
                    className: "stepClass_home",
                    stepNumber: 0,
                    imageIcon: CONFIG.ICONS.STEP_HOME,
                    render: ({ setStep }) => (
                        <PortalWizardHome
                            validSteps={validSteps}
                            overviewHeading={beMeta.overviewTitle}
                            overviewBody={beMeta.overviewBody}
                            stepOverview={stepOverviewList}
                        />
                    )
                });
            };
            return stepsList;
        },
        [dataRequestCompleted, initialData, validSteps, visitedSteps, stepChangeDt, executeTask, sourceSystem]
    );

    const getTaskDt = (taskName) => {
        let taskObj;
        if (taskName && taskDt && taskDt.taskType && taskDt.taskType.taskAction) {
            let taskActions = taskDt.taskType.taskAction;
            for (let i = 0; i < taskActions.length; i++) {
                if (taskName && (taskName.trim()).toUpperCase() === (taskActions[i].name).toUpperCase()) {
                    taskObj = taskActions[i];
                    break;
                }
            }
        }
        return taskObj;
    };

    const wizardButtonList = useMemo(
        () => {
            let buttonList = [];

            if (taskDt && taskDt.taskType && taskDt.taskType.taskAction && taskDt.taskType.taskAction.length > 0) {

                let taskActions = taskDt.taskType.taskAction;

                let primaryActionDt = getTaskDt(beMeta.primaryAction);
                primaryActionDt = primaryActionDt ? primaryActionDt : taskActions[0];
                let menuItemList = [];

                buttonList.push(
                    <Button 
                        variant="primary" 
                        className="preview__button"
                        data-testid="wizard_preview_button"
                        onClick={() => { previewDialogBox.open() }}
                    >
                        {translate("LABEL_PREVIEW")}
                    </Button>);

                buttonList.push(
                    <Button 
                        variant="call-to-action" 
                        className="task__button"
                        data-testid={"wizard_task_button_"+primaryActionDt.label}
                        onClick={() => { executeTaskAction(primaryActionDt ? primaryActionDt.name : taskActions[0].name) }}
                    >
                        {primaryActionDt.label}
                    </Button>);

                if (taskActions.length > 1) {
                    for (let i = 0; i < taskActions.length; i++) {
                        if (taskActions[i].name !== primaryActionDt.name) {
                            menuItemList.push(<Menu.Item 
                                onClick={e => { executeTaskAction(taskActions[i].name) }}
                                data-testid={"menu_item_"+taskActions[i].label}
                                >
                                    {taskActions[i].label}
                            </Menu.Item>);
                        }
                    }

                    buttonList.push(
                        <Menu
                            trigger={<IconButton className="task__dropdown__icon">
                                <i className="aicon aicon__dropdown-arrow" />
                            </IconButton>}
                            data-testid="wizard_task_menu"
                        >
                            {menuItemList}
                        </Menu>
                    );
                }
            }
            return buttonList;
        },
        [taskDt, validSteps]
    );

    const isLogoutAction = (taskAction) => {
        let logoutAction = false;
        if (taskAction && beMeta && beMeta.logoutActions) {
            let logOutActionsList = beMeta.logoutActions.split(",");
            for (let i = 0; i < logOutActionsList.length; i++) {
                if (taskAction.toUpperCase() === logOutActionsList[i].trim().toUpperCase()) {
                    logoutAction = true;
                    break;
                }
            }
        }
        return logoutAction;
    };

    const executeTaskActionOnConfirmation = (taskObj) => {

        let taskObjDt = (taskObj) ? taskObj : selectedTaskActionDt;

        const successCallback = (response) => {
            if (taskObjDt) {
                if (isLogoutAction(taskObjDt[TASK_DETAILS.ACTION.NAME])) {
                    taskLogoutMessageBox.open()
                } else {
                    dispatchAppNotification(translate("WIZARD_TASK_SUCCESS_MESSAGE"), NOTIFICATION_SUCCESS);
                }
            }
        };

        let payLoad = {};
        payLoad[API_URL] = URLMap.executeTask(match.params.orsId, taskDt[TASK_DETAILS.TASK_ID], taskObjDt[TASK_DETAILS.ACTION.NAME]);
        payLoad[HTTP_METHOD] = POST;
        payLoad[PROXY_ATTRIBUTE] = beRowId;
        let taskPayload = JSON.parse(JSON.stringify(taskDt));
        let comments = commentInput.current ? commentInput.current.value : "";
        if (taskObjDt[TASK_DETAILS.ACTION.COMMENT] !== COMMENT.TYPE.AS_REQUIRED && comments && comments.trim() !== "") {
            taskPayload[TASK_DETAILS.COMMENTS] = comments;
        }
        payLoad[PROXY_PAYLOAD] = taskPayload;

        APIService.postRequest(URLMap.getProxy(), payLoad, successCallback,
            ({ response: { data: { errorCode } } }) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
                }
                else {
                    dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
                }
            },
            {
                [ORS_ID]: match.params.orsId,
                [PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    const executeTaskAction = (taskAction) => {

        const taskObj = getTaskDt(taskAction);
        setSelectedTaskActionDt(taskObj);

        if (!taskObj) return;

        if (childRef.current) {
            let isStepValid = true;
            if (childRef.current) {
                isStepValid = childRef.current.getBeFormStatus();
            }
            if (isStepValid) {
                setExecuteTask(true);
            }
            if (childRef.current) {
                childRef.current.triggerBEFormSave();
            }
        } else {
            if (taskObj[TASK_DETAILS.ACTION.MESSAGE] || taskObj[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.MANDATORY || taskObj[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.OPTIONAL) {
                taskConfirmationBox.open();
            } else {
                executeTaskActionOnConfirmation(taskObj);
            }
        }

        return;
    };

    const handleLogout = () => {
        const successCallback = () => {
            localStorage.removeItem(SESSION_TIMEOUT_VALUE +"_"+ match.params.id);
            localStorage.removeItem(SESSION_TIMEOUT_WARNING_VALUE+"_"+ match.params.id);
            removeUserPreference();
            history.push(`/${match.params.id}/${match.params.orsId}/login`); 
        };

        const failureCallback = ({ response: { data: { errorCode } } }) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
        };

        APIService.putRequest(
            URLMap.postLogout(match.params.id),
            {},
            successCallback,
            failureCallback,
            {
                [ORS_ID]: match.params.orsId,
                [PORTAL_ID_HEADER]: match.params.id
            },
        );
    };

    const getTaskConfirmationDialogBox = () => {
        let commentSection, messageSection;
        if (selectedTaskActionDt) {
            if (selectedTaskActionDt[TASK_DETAILS.ACTION.MESSAGE]) {
                messageSection = <p>{selectedTaskActionDt[TASK_DETAILS.ACTION.MESSAGE]}</p>;
            }

            let mandatoryIcon, requiredError, commentLengthError;
            if (selectedTaskActionDt[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.MANDATORY ||
                selectedTaskActionDt[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.OPTIONAL) {
                if (selectedTaskActionDt[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.MANDATORY) {
                    mandatoryIcon = <span className='wizard__add__comments__required'> * </span>;
                    requiredError = <div className='wizard__add__comments__error d-form__error-message'
                        ref={commentInputError}>
                        <i className="aicon aicon__error" />
                        <span className='wizard__add__comments__error_text'>
                            {translate('ERROR_REQUIRED_COMMENTS')}
                        </span>
                    </div>;
                }
                
                commentLengthError = <div className='wizard__add__comments__error d-form__error-message'
                    ref={commentMaxLengthError}>
                    <i className="aicon aicon__error" />
                    <span className='wizard__add__comments__error_text'>
                        {translate('ERROR_COMMENTS_MAX_LENGTH')}
                    </span>
                </div>;

                commentSection =
                    <div className='wizard__add__comments_section'>
                        <div className='wizard__add__comments__header'>
                            {translate('WIZARD_COMMENTS')}
                            {mandatoryIcon}
                        </div>
                        <div className='wizard__add__comments__body'>
                            <textarea ref={commentInput}
                                placeholder={translate('WIZARD_ADD_COMMENTS_PLACE_HOLDER_MESSAGE')}
                                maxLength = {COMMENT_MAX_LEN}
                                onChange={() => {
                                    if (commentMaxLengthError.current) {
                                        commentMaxLengthError.current.style.display = 
                                            commentInput.current.textLength !== COMMENT_MAX_LEN ? "none" : "inline";
                                    }
                                    if (commentInputError.current) {
                                        commentInputError.current.style.display = commentInput.current.value !== "" ? "none" : "inline";
                                    }
                                }
                                }>
                            </textarea>
                            {requiredError}
                            {commentLengthError}
                        </div>
                    </div>
            }

            return <Dialog
                    className="task__confirmation__container"
                    bounds="parent"
                    data-testid="task_confirmation_container"
                    {...taskConfirmationBox}
                >
                <Dialog.Header title={selectedTaskActionDt[TASK_DETAILS.ACTION.LABEL]} data-testid="task_confirmation_header"/>
                <Dialog.Content data-testid="task_confirmation_content">{({ id }) =>
                    <>
                        {messageSection}
                        {commentSection}
                    </>}
                </Dialog.Content>
                <Dialog.Footer data-testid="task_confirmation_footer">
                    <Button variant="primary"
                        data-testid="task_confirmation_button"
                        onClick={() => {
                            let commentsVal = commentInput.current ? commentInput.current.value : "";
                            if (selectedTaskActionDt[TASK_DETAILS.ACTION.COMMENT] === COMMENT.TYPE.MANDATORY &&
                                (!commentsVal || commentsVal.trim() === "")) {
                                commentInputError.current.style.display = 'block';
                                return;
                            }
                            executeTaskActionOnConfirmation();
                            taskConfirmationBox.close();
                        }}>
                        {translate("BE_FORM_LABEL_OK")}
                    </Button>
                    <Button onClick={taskConfirmationBox.close} 
                        data-testid="task_confirmation_cancel_button"
                    >
                            {translate("BE_FORM_LABEL_CANCEL")}
                    </Button>
                </Dialog.Footer>
            </Dialog>
        }
    };

    const getTaskComments = () => {
        let comments;
        if (taskDt && taskDt[TASK_DETAILS.COMMENTS] && taskDt[TASK_DETAILS.COMMENTS] !== "") {
            let commentsListDt = (taskDt[TASK_DETAILS.COMMENTS]).split(COMMENT.SEPARATOR.LINE);
            let commentsList = [];
            for (let i = 0; i < commentsListDt.length; i++) {
                //To extract user name, time and comments
                let commentDt = getCommentDetails(commentsListDt[i]);
                let className = (commentDt[COMMENT.DETAILS.USER_NAME] &&
                    commentDt[COMMENT.DETAILS.USER_NAME].trim() === (getUsername()).trim()) ?
                    "wizard__comments wizard__comments__current__user" : "wizard__comments";
                commentsList.push(<div className={className}>
                    <div className='comment__header'>
                        <span className='comment__user'>{commentDt[COMMENT.DETAILS.USER_NAME]} </span>
                        <span className='comment__time'>{commentDt[COMMENT.DETAILS.TIME]} </span>
                    </div>
                    <div className='comment__body'>
                        {commentDt[COMMENT.DETAILS.COMMENTS]}
                    </div>
                </div>);
            }
            comments = <>
                {commentsList}
            </>;
        } else {
            comments = translate("WIZARD_NO_COMMENTS_MESSAGE");
        }
        return comments;
    };

    const getCommentsDialogBox = () => {

        if (selectedTaskActionDt) {
            return <Dialog
                    className="wizard__comments__container"
                    bounds="parent"
                    data-testid="wizard_comments_container"
                    {...commentsDialogBox}
                >
                <Dialog.Header title={translate('WIZARD_COMMENTS')} data-testid="wizard_comments_header"/>
                <Dialog.Content data-testid="wizard_comments_content">{({ id }) =>
                    <div className="wizard__comments__content">
                        {getTaskComments()}
                    </div>}
                </Dialog.Content>
                <Dialog.Footer data-testid="wizard_comments_footer">
                    <Button onClick={commentsDialogBox.close} data-testid="wizard_comments_cancel_button">{translate("BE_FORM_LABEL_CANCEL")}</Button>
                </Dialog.Footer>
            </Dialog>
        }
    };

    const printPreview = () => {
        window.print();
    };

    const getPreviewDetails = () => {
        let previewItemList = [];
        let stepItemList = [];
        previewItemList.push(<div className="preview__print__wizard__title">{beMeta.title}</div>);

        if (dataRequestCompleted && Object.keys(initialData).length) {
            beMeta && Array.isArray(beMeta.steps) && beMeta.steps.forEach(function (stepObj, index) {
                if (stepObj.beFormComponent) {
                    let stepItem = <>
                        <div className="preview__step__title">
                            {stepObj.title}
                        </div>

                        <BEForm beData={initialData}
                            beMeta={stepObj.beFormComponent}
                            onSave={() => { }}
                            getLookupHandler={getLookupHandler.bind(this, match)}
                            fileHandler={fileHandler}
                            validateData={() => { }}
                            getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                            mode={BE_FORM_MODES.READ_ONLY}
                            key={"beform_" + index}
                            history={history}
                            previewMode={true}
                        />
                    </>;
                    stepItemList.push(stepItem);
                }
            });
        }
        previewItemList.push(<div className="wizard__preview__content" >
            {stepItemList}
        </div>);

        return previewItemList;
    };

    const getPreviewDialogBox = () => {

        let menuItemList = [];
        const getTaskActionButton = (onClose) => {
            let buttonList = [];
            if (taskDt && taskDt.taskType && taskDt.taskType.taskAction && taskDt.taskType.taskAction.length > 0) {
                let taskActions = taskDt.taskType.taskAction;
                let primaryActionDt = getTaskDt(beMeta.primaryAction);
                buttonList.push(
                    <Button 
                        variant="call-to-action" 
                        className="task__button"
                        data-testid={"wizard_preview_task_button_"+primaryActionDt.label}
                        onClick={() => { executeTaskAction(primaryActionDt ? primaryActionDt.name : taskActions[0].name); onClose(); }}
                    >
                        {primaryActionDt.label}
                    </Button>);

                if (taskActions.length > 1) {
                    for (let i = 0; i < taskActions.length; i++) {
                        if (taskActions[i].name !== primaryActionDt.name) {
                            menuItemList.push(<Menu.Item 
                                onClick={e => { executeTaskAction(taskActions[i].name); onClose(); }} 
                                data-testid={"menu_item_"+taskActions[i].label}
                                >
                                    {taskActions[i].label}
                            </Menu.Item>);
                        }
                    }

                    buttonList.push(
                        <Menu
                            trigger={<IconButton className="task__dropdown__icon">
                                <i className="aicon aicon__dropdown-arrow" />
                            </IconButton>}
                            data-testid="wizard_preview_task_menu"
                        >{menuItemList}
                        </Menu>
                    );
                }
            }
            return buttonList;
        };

        return <Dialog
                className="wizard__preview__container"
                data-testid="wizard_preview_container"
                bounds="parent"
                {...previewDialogBox}
            >
            <Dialog.Header 
                data-testid="wizard_preview_heading" 
                title={beMeta.title + " : " + translate('LABEL_PREVIEW')} 
            />
            <Dialog.Content data-testid="wizard_preview_content">{({ id }) =>
                <div className="wizard__preview__body">
                    {getPreviewDetails()}
                </div>}
            </Dialog.Content>
            <Dialog.Footer data-testid="wizard_preview_footer">
                <Button 
                    variant="primary" 
                    className="print__button"
                    data-testid="print_preview_button"
                    onClick={() => { printPreview(); }}
                >
                    {translate("LABEL_PRINT")}
                </Button>
                {getTaskActionButton(previewDialogBox.close)}
            </Dialog.Footer>
        </Dialog>
    };

    const wizardStepChangeHandler = (handleStepChange, stepNumber, currentStep) => {
        if ((beMeta && beMeta.showOverview && currentStep === 0) || (stepNumber < currentStep)) {
            handleStepChange(stepNumber);
        } else {
            let isStepValid = true;
            if (childRef.current) {
                isStepValid = childRef.current.getBeFormStatus();
            }

            if (isStepValid) {
                setStepChangeDt({ handleStepChange: handleStepChange, stepNumber: stepNumber });
            }

            if (childRef.current) {
                childRef.current.triggerBEFormSave();
            }
        }
    };

    const getWizardCommentIcon = () => {
        let commentIcon = (taskDt && taskDt[TASK_DETAILS.COMMENTS] && taskDt[TASK_DETAILS.COMMENTS] !== "") ?
            IMAGES.VIEW_COMMENTS_NEW : IMAGES.VIEW_COMMENTS;
        return <>
            <Tooltip
                content={translate("WIZARD_COMMENTS")} >
                <span className="wizard__comments__icon__container" onClick={() => {
                    commentsDialogBox.open()
                }}>
                    <img src={commentIcon} alt={translate("WIZARD_COMMENTS")} className="wizard__comments__icon" />
                </span>
            </Tooltip>
            <span className="comment__icon__seperator" />
        </>;
    };

    const previewDialog = useMemo(()=> (
        !previewDialogBox.closed ? getPreviewDialogBox()  : ""
    ),[previewDialogBox.closed]);

    const taskLogoutMessage = useMemo(()=> (
        !taskLogoutMessageBox.closed ? getLogoutMessageBox()  : ""
    ),[taskLogoutMessageBox.closed]);

    const taskConfirmationMessage = useMemo(()=> (
        !taskConfirmationBox.closed ? getTaskConfirmationDialogBox()  : ""
    ),[taskConfirmationBox.closed]);

    const commentsDialog = useMemo(()=> (
        !commentsDialogBox.closed ? getCommentsDialogBox()  : ""
    ),[commentsDialogBox.closed]);

    const wizardExtraButtons = (beMeta.showComments === true) ? getWizardCommentIcon() : [];

    return (
        Object.keys(initialData).length > 0 && dataRequestCompleted &&
        <>
            <PortalPageWizard
                className='portal-wizard'
                steps={wizardStepsList}
                height={getHeight(beMeta, "auto")}
                wizardStepChangeHandler={wizardStepChangeHandler}
                initialVisited = {initialVisitedSteps}
                page={{
                    breadcrumbs: [beMeta.title],
                    buttonGroup: wizardButtonList,
                    extraButtonsGroup: wizardExtraButtons
                }}
            />
            {previewDialog}
            {taskLogoutMessage}
            {taskConfirmationMessage}
            {commentsDialog}
        </>
    );
};

export default PortalWizardHandler;
