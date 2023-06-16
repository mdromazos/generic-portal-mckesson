import React, { useState, useContext, useEffect } from "react";
import "@informatica/droplets-core/dist/themes/archipelago/components/form.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/button.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css";
import { useTranslation } from "react-i18next";
import CONFIG from "../../config/config";
import { Form, Button, Section, Dropdown } from "@informatica/droplets-core";
import { useFormik } from 'formik';
import * as Yup from "yup";
import "./index.css";
import { StateContext } from "../../context/stateContext";
import { URLMap } from "../../utils/urlMappings";
import APIService from "./../../utils/apiService";
import "./index.css";
 
const UserManagementForm = ({
    match,
    edit,
    selectedRowId,
    setUserForm,
    setaddUserForm,
    setEditUser,
    setEditUserMessage
}) => {
    const [
        {
            globalSettings: { sourceSystem, signup, userManagement},
            notificationActions : {dispatchAppNotification}
        }
    ] = useContext(StateContext);
    const { t: translate } = useTranslation();
    let initialValues = {
        userName: edit ? selectedRowId.prtlUsrNm : "",
        firstName: edit ? selectedRowId.frstNm : "",
        lastName: edit ? selectedRowId.lstNm : "",
        email: edit ? selectedRowId.prtlUsrNm : "",
        jobTitle: edit ? selectedRowId.title:""
 
    };
    const { CONSTANTS,
        LOOKUP_PROXY_PAYLOAD: { API_URL, HTTP_METHOD, PROXY_ATTRIBUTE },
        PROXY_PAYLOAD,
        HTTP_METHOD: { GET, POST },
        USER_CREATION_STATIC_SECTION: { FIRST_NAME, LAST_NAME, USER_NAME, EMAIL, JOB_TITLE, COUNTRY_CODE, PHONE_NUMBER }
    } = CONFIG;
    let beRowId = decodeURIComponent(document.cookie.match(/rowId=([^;]*)/)
        ? document.cookie.match(/rowId=([^;]*)/)[1]
        : "");
    const [portalRole, setPortalRole] = useState([]);
    const [fieldName, setFieldName] = useState([])
 
    const handleUserCreation = (values,actions) => {
        userCreatioWithoutBERequest(values,actions)
    };
 
    useEffect(() => {
        getRoleStates();
    }, []);
 
    const getFieldmapping = userData => {
        let contactObject = {};
        let contactFieldObject = {};
        let fieldMappingPayload = {};
 
        if (userManagement.hasSameEmailAndUsername) {
            userData.userName = userData.email;
        }
        for (let fieldIndex in userManagement.fieldMapping) {
            contactFieldObject[
                userManagement.fieldMapping[fieldIndex].code.includes(".")
                    ? userManagement.fieldMapping[fieldIndex].code.split(".")[1]
                    : userManagement.fieldMapping[fieldIndex].code
            ] = userData[fieldIndex];
        }
        contactFieldObject.prtlUsrRle = {
            roleCode: userData.userRole
        };
 
        if (!userManagement.fieldMapping.userName.code.includes(".")) {
            contactObject = { ...contactFieldObject };
        } else {
            contactObject[userManagement.fieldMapping.userName.code.split(".")[0]] = {
                item: [{ ...contactFieldObject }],
                $original: {
                    item: [null]
                }
            };
        }
        fieldMappingPayload = { ...contactObject };
         
        return fieldMappingPayload;
    };
 
 
    const showStaticSectionErrorFields = (errorDetails, formikActions) => {
 
        if (errorDetails && Array.isArray(errorDetails)) {
            let errorArray = [];
            errorDetails.forEach(errorData => {
                if (errorData.field && Array.isArray(errorData.field)) {
                    if (errorData.field.length >= 1) {
                        for (let error = 0; error < errorData.field.length; error++) {
                            let errorUserManagement = { ...userManagement };
                            let formikFieldKey = errorData.field[error].slice(errorData.field[error].lastIndexOf('.') + 1);
                            if (errorUserManagement.fieldMapping.userName.code.includes(".")) {
                                for (let fieldIndex in errorUserManagement.fieldMapping) {
                                    if (errorUserManagement.fieldMapping[fieldIndex].code.split(".")[1] === formikFieldKey) {
                                        formikActions.setFieldError(fieldIndex, errorData.message);
                                        errorArray.push(fieldIndex)
                                        setFieldName(errorArray);
                                        break;
                                    }
                                }
                            }
                            else {
                                for (let fieldIndex in errorUserManagement.fieldMapping) {
                                    if (errorUserManagement.fieldMapping[fieldIndex].code === formikFieldKey) {
                                        formikActions.setFieldError(fieldIndex, errorData.message);
                                        errorArray.push(fieldIndex)
                                        setFieldName(errorArray);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    };
 
    const userCreatioWithoutBERequest = (values,actions) => {
        const fieldMappingPayLoad = getFieldmapping(values);
        let editUserCreationPayload;
        let userCreationPayload = {
            BEData: { ...fieldMappingPayLoad, rowidObject: beRowId },
            userData: {
                userName: userManagement.hasSameEmailAndUsername
                    ? values.email
                    : values.userName,
                orsId: match.params.orsId,
                email: values.email,
                firstName: values.firstName,
                lastName: values.lastName
            }
        };
        if (edit) {
            editUserCreationPayload = { ...fieldMappingPayLoad};
        }
 
        const successCallback = resp => {
            if (edit) {
                setUserForm(true);
                setaddUserForm(false);
                setEditUser(false);
                dispatchAppNotification(translate("LABEL_USER_CREATION_SUCCESS"), CONSTANTS.NOTIFICATION_SUCCESS)
                setEditUserMessage(false);
            } else {
                setUserForm(true);
                setaddUserForm(false);
                setEditUser(false);
                dispatchAppNotification(translate("LABEL_USER_CREATION_SUCCESS"), CONSTANTS.NOTIFICATION_SUCCESS)
                dispatchAppNotification(translate("LABEL_EDIT_USER_CREATION_SUCESS"), CONSTANTS.NOTIFICATION_SUCCESS)
            }
        };
        const failureCallback = ({ response: { data: {errorData,errorCode } } }) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
            showStaticSectionErrorFields(errorData, actions)
        };
        if (edit) {
            let payLoad = {};
            let apiUrl = URLMap.getBEData(match.params.orsId, userManagement.bevName, beRowId);
            payLoad[API_URL] = `${apiUrl}&systemName=${sourceSystem}`;
            payLoad[HTTP_METHOD] = POST;
            payLoad[PROXY_ATTRIBUTE] = beRowId;
            payLoad[PROXY_PAYLOAD] = editUserCreationPayload;
 
            APIService.postRequest(
                URLMap.getProxy(), payLoad,
                successCallback,
                failureCallback
            );
        } else {
            APIService.postRequest(
                URLMap.createAdditionalUser(userManagement.bevName, sourceSystem),
                userCreationPayload,
                successCallback,
                failureCallback,
                { [CONFIG.SIGN_UP_HEADER]: match.params.orsId ,
                    [CONFIG.PORTAL_ID_HEADER]: match.params.id
                },
                {}
            );
        }
    };
 
    const getFilterRoles = (portalRoleDropDownData) => {
        return portalRoleDropDownData.filter((dropDownData) => {
            if (userManagement.hasUserRole) {
                return dropDownData.value !== signup.userRole;
            }
            else {
                return true;
            }
        });
    }
 
    const getRoleStates = () => {
        const successCallback = (resp) => {
            if (resp && resp.hasOwnProperty('item') && resp.item.length > 0) {
                const portalRoleDropDownData = resp.item.map((portalState) => ({
                    value : portalState.id,
                    text : portalState.label
                }));
                const filterRoles = getFilterRoles(portalRoleDropDownData)
                setPortalRole(filterRoles);
            }
        };
        let payLoad = {};
        let beViewName = userManagement && userManagement.bevName;
        let lookupCode = userManagement && userManagement.fieldMapping && userManagement.fieldMapping.userRole.code;
        payLoad[API_URL] = URLMap.getPortalRoles(
            match.params.orsId,
            beViewName,
            lookupCode
        );
        payLoad[HTTP_METHOD] = GET;
        payLoad[PROXY_ATTRIBUTE] = beRowId
 
        APIService.postRequest(
            URLMap.getProxy(), payLoad,
            successCallback,
            ({ response: { data: { errorCode } } }) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR)
                }
                else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), CONSTANTS.NOTIFICATION_ERROR)
                }
            },
            {
                [CONFIG.SIGN_UP_HEADER]: match.params.orsId,
                [CONFIG.PORTAL_ID_HEADER]: match.params.id
            },
        );
    };
    const validationYupObject = () => {
        if (userManagement.hasSameEmailAndUsername) {
            return Yup.object().shape({
                firstName: Yup.string().required(translate("ERROR_REQUIRED_FIRST_NAME")),
                lastName: Yup.string().required(translate("ERROR_REQUIRED_LAST_NAME")),
                email: Yup.string().required(translate("ERROR_REQUIRED_EMAIL")),
                userRole: Yup.string().required(translate("ERROR_REQUIRED_USER_ROLE"))
            });
        } else {
            return Yup.object().shape({
                userName: Yup.string().required(translate("ERROR_REQUIRED_USERNAME")),
                firstName: Yup.string().required(translate("ERROR_REQUIRED_FIRST_NAME")),
                lastName: Yup.string().required(translate("ERROR_REQUIRED_LAST_NAME")),
                email: Yup.string().required(translate("ERROR_REQUIRED_EMAIL")),
                userRole: Yup.string().required(translate("ERROR_REQUIRED_USER_ROLE"))
            });
        }
    };

    const FormikForm = useFormik({
        initialValues: initialValues,
        onSubmit: handleUserCreation,
        validationSchema: edit ? null : validationYupObject
    });
 
    return (
        <form className="form" onSubmit={FormikForm.handleSubmit}>
            <Section title={userManagement.sectionHeading} collapsible data-testid="add_user_section">
                <div className="usermanagement__user">
                    {userManagement.fieldMapping.firstName &&
                        <div data-testid="firstName"
                            className={`user__row ${(fieldName.indexOf(FIRST_NAME) !== -1 && FormikForm.errors.firstName) ? 'error__box' : ''}`}
                        >
                            <Form.Group required className="form-group">
                                <Form.Label
                                    className="form-label"
                                >
                                    {userManagement.fieldMapping.firstName.label}
                                </Form.Label>
                                <Form.Control
                                    name="firstName"
                                    type="text"
                                    className="form-field"
                                    as={FormikForm.Input}
                                    disabled={edit}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.firstName && FormikForm.errors.firstName &&
                                    <div className="field__error">
                                        <Form.Error>
                                            {FormikForm.errors.firstName}
                                        </Form.Error>
                                    </div>
                                }
                            </Form.Group>
                        </div>
                    }
                    {userManagement.fieldMapping.lastName &&
                        <div data-testid="lastName"
                            className={`user__row ${(fieldName.indexOf(LAST_NAME) !== -1 && FormikForm.errors.lastName) ? 'error__box' : ''}`}>
                            <Form.Group required className="form-group">
                                <Form.Label
                                    className="form-label"
                                >
                                    {userManagement.fieldMapping.lastName.label}
                                </Form.Label>
                                <Form.Control
                                    name="lastName"
                                    type="text"
                                    className="form-field"
                                    as={FormikForm.Input}
                                    disabled={edit}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.lastName && FormikForm.errors.lastName &&
                                    <div className="field__error">
                                        <Form.Error>
                                            {FormikForm.errors.lastName}
                                        </Form.Error>
                                    </div>
                                }

                            </Form.Group>
                        </div>
                    }
                    <div data-testid="email"
                        className={`user__row ${(fieldName.indexOf(EMAIL) !== -1 && FormikForm.errors.email) ? 'error__box' : ''}`}>
                        <Form.Group required className="form-group">
                            <Form.Label
                                className="form-label"
                            >
                                {userManagement.fieldMapping.email.label}
                            </Form.Label>
                            <Form.Control
                                name="email"
                                className="form-field"
                                type="text"
                                as={FormikForm.Input}
                                disabled={edit}
                                onChange={FormikForm.handleChange}
                                onBlur={FormikForm.handleBlur}
                            />
                            {FormikForm.touched.email && FormikForm.errors.email &&
                                <div className="field__error">
                                    <Form.Error>
                                        {FormikForm.errors.email}
                                    </Form.Error>
                                </div>
                            }
                        </Form.Group>
                    </div>
                    {
                        !userManagement.hasSameEmailAndUsername && (
                            <div className={`user__row ${(fieldName.indexOf(USER_NAME) !== -1 && FormikForm.errors.userName) ? 'error__box' : ''}`}>
                                <Form.Group required className="form-group">
                                    <Form.Label className="form-label" >
                                        {userManagement.fieldMapping.userName.label}
                                    </Form.Label>
                                    <Form.Control
                                        name="userName"
                                        type="text"
                                        className="form-field"
                                        as={FormikForm.Input}
                                        disabled={edit}
                                        onChange={FormikForm.handleChange}
                                        onBlur={FormikForm.handleBlur}
                                    />
                                    {FormikForm.touched.userName && FormikForm.errors.userName &&
                                        <div className="field__error">
                                            <Form.Error>
                                                {FormikForm.errors.userName}
                                            </Form.Error>
                                        </div>
                                    }
                                </Form.Group>
                            </div>
                        )
                    }
                    {userManagement.fieldMapping.jobTitle && <div data-testid="jobTitle"
                        className={`user__row ${(fieldName.indexOf(JOB_TITLE) !== -1 && FormikForm.errors.jobTitle) ? 'error__box' : ''}`}>
                        <Form.Group className="form-group">
                            <Form.Label className="form-label">
                                {userManagement.fieldMapping.jobTitle.label}
                            </Form.Label>
                            <Form.Control
                                name="jobTitle"
                                type="text"
                                className="form-field"
                                as={FormikForm.Input}
                                disabled={edit}
                                onChange={FormikForm.handleChange}
                                onBlur={FormikForm.handleBlur}
                            />
                            {FormikForm.touched.jobTitle && FormikForm.errors.jobTitle &&
                                <div className="field__error">
                                    <Form.Error>
                                        {FormikForm.errors.jobTitle}
                                    </Form.Error>
                                </div>
                            }
                        </Form.Group>
                    </div>}
                    {userManagement.fieldMapping.countryDialingCode && <div data-testid="countryDialingCode"
                        className={`user__row ${(fieldName.indexOf(COUNTRY_CODE) !== -1 && FormikForm.errors.countryDialingCode) ? 'error__box' : ''}`}>
                        <Form.Group className="form-group">
                            <Form.Label className="form-label">
                                {userManagement.fieldMapping.countryDialingCode.label}
                            </Form.Label>
                            <Form.Control
                                name="countryDialingCode"
                                type="text"
                                className="form-field"
                                as={FormikForm.Input}
                                disabled={edit}
                                onChange={FormikForm.handleChange}
                                onBlur={FormikForm.handleBlur}
                            />
                            {FormikForm.touched.countryDialingCode && FormikForm.errors.countryDialingCode &&
                                <div className="field__error">
                                    <Form.Error>
                                        {FormikForm.errors.countryDialingCode}
                                    </Form.Error>
                                </div>
                            }
                        </Form.Group>
                    </div>}
                    {userManagement.fieldMapping.phoneNumber && <div data-testid="phoneNumber"
                        className={`user__row ${(fieldName.indexOf(PHONE_NUMBER) !== -1 && FormikForm.errors.phoneNumber) ? 'error__box' : ''}`}>
                        <Form.Group className="form-group">
                            <Form.Label className="form-label">
                                {userManagement.fieldMapping.phoneNumber.label}
                            </Form.Label>
                            <Form.Control
                                name="phoneNumber"
                                type="text"
                                className="form-field"
                                as={FormikForm.Input}
                                disabled={edit}
                                onChange={FormikForm.handleChange}
                                onBlur={FormikForm.handleBlur}
                            />
                            {FormikForm.touched.phoneNumber && FormikForm.errors.phoneNumber &&
                                <div className="field__error">
                                    <Form.Error>
                                        {FormikForm.errors.phoneNumber}
                                    </Form.Error>
                                </div>
                            }
                        </Form.Group>
                    </div>}
                    <div className="user__row" data-testid="userRole">
                        <Form.Group required className="form-group">
                            <Form.Label className="form-label">
                                {translate("LABEL_USER__MANAGEMENT_ROLE")}
                            </Form.Label>
                            <Form.Control
                                name="userRole"
                                className="form-field"
                                as={Dropdown}
                                options={portalRole}
                                disabled={edit}
                                onChange={(event) => { FormikForm.setFieldValue('userRole', event.value) }}
                                onBlur={() => { FormikForm.setFieldTouched('userRole', true) }}
                                search
                            />
                            {FormikForm.touched.userRole && FormikForm.errors.userRole &&
                                <div className="field__error">
                                    <Form.Error>
                                        {FormikForm.errors.userRole}
                                    </Form.Error>
                                </div>
                            }
                        </Form.Group>
                    </div>
                </div>
            </Section>
            <div className="user__div">
                <span className="button__group">
                    <Button type="submit" className="add__user" data-testid="save_user_button">
                        {translate("LABEL_SAVE_USER")}
                    </Button>
                </span>
            </div>
        </form>
    );
};
 
export default UserManagementForm;