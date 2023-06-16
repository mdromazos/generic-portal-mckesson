import React, {useContext, useEffect} from "react";
import { Form, Button, IconButton, Tooltip, Input } from "@informatica/droplets-core";
import {useFormik} from 'formik';
import * as Yup from "yup";
import {withRouter} from "react-router-dom";
import {URLMap} from "../../utils/urlMappings";
import APIService from "../../utils/apiService";
import {StateContext} from "../../context/stateContext";
import "@informatica/droplets-core/dist/themes/archipelago/components/form.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/button.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css";
import {useTranslation} from "react-i18next";
import CONFIG from "../../config/config";
import "./index.css";
import PageNotFound from "../pageNotFound";

const ChangePassword = ({match, history}) => {

    const {t: translate} = useTranslation();
    const {
        CONSTANTS: {NOTIFICATION_ERROR, NOTIFICATION_SUCCESS},
        SESSION_POLICY: { SESSION_TIMEOUT_VALUE, SESSION_TIMEOUT_WARNING_VALUE }, ORS_ID
    } = CONFIG;
    const [{
        globalSettings: { isExternalUserManagementEnabled },
        notificationActions: {dispatchAppNotification},
        runtimeConfigurationActions: {setRuntimeConfigurationAction},
        runtimeConfigurationData
    }] = useContext(StateContext);

    useEffect(() => {
        fetchRuntimeConfigurationData();
    }, []);

    const validationYupObject = () => {
        return Yup.object().shape({
            oldPassword: Yup.string().required(translate("ERROR_REQUIRED_PASSWORD")),
            newPassword: Yup.string().required(translate("ERROR_REQUIRED_NEW_PASSWORD")),
            confirmPassword: Yup.string()
                .oneOf(
                    [Yup.ref("newPassword"), null],
                    translate("ERROR_PASSWORD_MATCH")
                )
                .required(translate("ERROR_REQUIRED_CONFIRM_PASSWORD"))
        });
    };

    const fetchRuntimeConfigurationData = () => {
        const successCallback = resp => {
            let runtimeTransformedData = [];
            for (let section = 0; section < resp.length; section++) {
                runtimeTransformedData[resp[section].name] = {};
                for (let configIndex = 0; configIndex < resp[section].configuration.length; configIndex++) {
                    runtimeTransformedData[resp[section].name][
                        resp[section].configuration[configIndex].key
                        ] = resp[section].configuration[configIndex];
                }
            }
            setRuntimeConfigurationAction(runtimeTransformedData);
        };
        const failureCallback = errorCode => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(
                    translate("GENERIC__ERROR__MESSAGE"),
                    NOTIFICATION_ERROR
                );
            }
        };
        APIService.getRequest(
            URLMap.getRuntimeConfigurationData(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId)
        );
    };

    const redirectToLogin = () => {
        const successCallback = () => {
            localStorage.removeItem(SESSION_TIMEOUT_VALUE +"_"+ match.params.id);
            localStorage.removeItem(SESSION_TIMEOUT_WARNING_VALUE+"_"+ match.params.id);
            history.push(`/${match.params.id}/${match.params.orsId}/login`);
        };

        const failureCallback = ({response:{data:{errorCode}}}) => {
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
            { [CONFIG.PORTAL_ID_HEADER]: match.params.id,[CONFIG.ORS_ID]: match.params.orsId}
        );
    };


    const handleChangePassword = (values) => {
        const successCallback = () => {
            dispatchAppNotification(
                translate("CHANGE_PASSWORD_SUCCESSFULLY"),
                NOTIFICATION_SUCCESS
            );
            redirectToLogin();
        };
        const failureCallback = ({response: {data: {errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
        };
        let loginPayload = {};
        loginPayload.oldPassword = values.oldPassword;
        loginPayload.newPassword = values.newPassword;

        APIService.postRequest(
            URLMap.postChangePassword(match.params.id),
            loginPayload,
            successCallback,
            failureCallback,
            { [CONFIG.PORTAL_ID_HEADER]: match.params.id,[ORS_ID]: match.params.orsId}
        );
    };

    const getPasswordPolicy = () => {
        if (Object.keys(runtimeConfigurationData).length > 0) {
            return runtimeConfigurationData[CONFIG.PASSWORD_POLICY.PASSWORD_SECTION][
                CONFIG.PASSWORD_POLICY.PASSWORD_POLICY_KEY
                ].value;
        }
    };

    const FormikForm = useFormik({
        initialValues: {},
        onSubmit: handleChangePassword,
        validationSchema: validationYupObject,
    });

    return (
        !isExternalUserManagementEnabled
        ? <div className="change__password__container">
            <form
                className="change__password__form"
                onSubmit={FormikForm.handleSubmit}
            >
                <div className="login__form__title" data-testid="change_password_title">
                    {translate("CHANGE_PASSWORD")}
                </div>
                <Form.Group required>
                    <div data-testid="current_password">
                        <Form.Label className="form__field__title" >
                            {translate("LABEL_VERIFY_CURRENT_PASSWORD")}
                        </Form.Label>
                    </div>
                    <Form.Control 
                        className="login__input"  
                        name="oldPassword" 
                        type="password" 
                        as={Input} 
                        value={FormikForm.values.oldPassword}
                        onChange={FormikForm.handleChange}
                        onBlur={FormikForm.handleBlur}
                    />
                    {FormikForm.errors.oldPassword && FormikForm.touched.oldPassword && 
                        <Form.Error>{FormikForm.errors.oldPassword}</Form.Error>
                    }
                </Form.Group>
                <Form.Group required>
                    <div className="new__password__container">
                        <div data-testid="new_password">
                            <Form.Label className="form__field__title" >
                                {translate("LABEL_VERIFY_NEW_PASSWORD")}
                            </Form.Label>
                        </div>
                        <Form.Control 
                            className="login__input" 
                            name="newPassword" 
                            type="password" 
                            as={Input} 
                            value={FormikForm.values.newPassword}
                            onChange={FormikForm.handleChange}
                            onBlur={FormikForm.handleBlur}
                        />
                        {FormikForm.errors.newPassword && FormikForm.touched.newPassword &&
                            <Form.Error>{FormikForm.errors.newPassword}</Form.Error>
                        }
                        <IconButton className="password__strength__icon">
                            <Tooltip content={getPasswordPolicy()} position="right">
                                <i className="aicon aicon__info info__icon" />
                            </Tooltip>
                        </IconButton>
                    </div>
                </Form.Group>
                <Form.Group required>
                    <div data-testid="confirm_new_password">
                        <Form.Label className="form__field__title" >
                            {translate("LABEL_VERIFY_CONFIRM_PASSWORD")}
                        </Form.Label>
                    </div>
                    <Form.Control 
                        className="login__input" 
                        name="confirmPassword" 
                        type="password"
                        value={FormikForm.values.confirmPassword}
                        onChange={FormikForm.handleChange}
                        onBlur={FormikForm.handleBlur}
                        as={Input} 
                    />
                    {FormikForm.errors.confirmPassword && FormikForm.touched.confirmPassword &&
                        <Form.Error>{FormikForm.errors.confirmPassword}</Form.Error>
                    }
                </Form.Group>
                <div className="login__div">
                    <span className="button__group">
                        <Button type="submit" className="login__button" data-testid="change_password_button">
                            {" "}
                            {translate("CHANGE_PASSWORD_UPDATE_BUTTON")}
                        </Button>
                    </span>
                </div>
            </form>
        </div>
        : <PageNotFound />
    );

};
export default withRouter(ChangePassword);
