import React, {useState, useContext} from "react";
import {Button, Form, Input} from "@informatica/droplets-core";
import { useFormik } from 'formik';
import * as yup from "yup";
import APIService from "../../utils/apiService";
import {URLMap} from "../../utils/urlMappings";
import {StateContext} from "../../context/stateContext";

import "@informatica/droplets-core/dist/themes/archipelago/components/form.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/button.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css";
import {useTranslation} from "react-i18next";
import CONFIG from "../../config/config";
import "./index.css";

const ResetPassword = ({match, history}) => {

    const {t: translate} = useTranslation();
    const { CONSTANTS: {NOTIFICATION_ERROR},INITIAL_VALUES, ORS_ID, CHECK_USER: {EXISTING_USER}} = CONFIG;
    const [{notificationActions: {dispatchAppNotification},runtimeConfigurationData}] = useContext(StateContext);
    const [successText, setSuccessText] = useState("");

    const validationYupObject = () => {
        return yup.object().shape({
            password: yup.string()
                .required(translate("ERROR_REQUIRED_PASSWORD")),
            confirmPassword: yup.string()
                .oneOf([yup.ref("password"), null], translate("ERROR_PASSWORD_MATCH"))
                .required(translate("ERROR_REQUIRED_PASSWORD"))
        });
    };

    const loginHandler = () => {
        history.push(`/${match.params.id}/${match.params.orsId}/login`);
    };

    const handleResetPassword = (values) => {
        const successCallback = () => {
            setSuccessText(translate("RESET_PASSWORD_SUCCESSFULLY"));
        };
        const failureCallback = ({response: {data: {errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(
                    translate(errorCode),
                    NOTIFICATION_ERROR
                );
            }
        };
        let pathName = history.location.pathname.split("?")[0];
        let loginPayload = {};
        loginPayload.newPassword = values.confirmPassword;
        loginPayload.ForgotPwdlinkHashValue = new URLSearchParams(history.location.search).get("hash");
        loginPayload.ChangePasswordIsNewUser = pathName.substring(pathName.lastIndexOf('/') + 1) !== EXISTING_USER;

        APIService.postRequest(
            URLMap.postResetPassword(match.params.id),
            loginPayload,
            successCallback,
            failureCallback,
            {[ORS_ID]: match.params.orsId}
        );
    };

    const getPasswordPolicy = () => {
        if (Object.keys(runtimeConfigurationData).length > 0) {
            return runtimeConfigurationData[CONFIG.PASSWORD_POLICY.PASSWORD_SECTION][CONFIG.PASSWORD_POLICY.PASSWORD_POLICY_KEY].value;
        }
    };

    const FormikForm = useFormik({
        initialValues: INITIAL_VALUES,
        onSubmit: handleResetPassword,
        validationSchema: validationYupObject,
    });

    return (
        <div>
            <form className="reset__form" onSubmit={FormikForm.handleSubmit}>
                <div className="login__form__title" data-testid="reset_password_title">
                    {translate("RESET_PASSWORD_TITLE")}
                </div>
                {
                    successText ? <p className="password__instruction">{successText}</p>
                        : <>
                            <p className="password__instruction" data-testid="password_policy">{getPasswordPolicy()}</p>
                            <Form.Element
                                label={translate("LABEL_NEW_PASSWORD")}
                                name="password"
                                type="password"
                                value={FormikForm.values.password}
                                onChange={FormikForm.handleChange}
                                as={Input}
                                onBlur={FormikForm.handleBlur}
                                error={FormikForm.touched.password && FormikForm.errors.password}
                                required
                            />
                            <Form.Element
                                label={translate("LABEL_CONFIRM_PASSWORD")}
                                name="confirmPassword"
                                type="password"
                                value={FormikForm.values.confirmPassword}
                                onChange={FormikForm.handleChange}
                                as={Input}
                                onBlur={FormikForm.handleBlur}
                                error={FormikForm.touched.confirmPassword && FormikForm.errors.confirmPassword}
                                required
                            />
                            <div className="login__div">
                                <span className="button__group">
                                    <Button type="submit" className="login__button" data-testid="reset_password_button">
                                        {" "}
                                        {translate("RESET_PASSWORD_SEND_BUTTON")}
                                    </Button>
                                </span>
                            </div>
                        </>
                }
            </form>
            <div className="login__links" data-testid="login_link">
                <span className="link__color" onClick={loginHandler} data-testid="login_link">
                    {translate("BACK_TO_LOGIN")}
                </span>
            </div>
            <div className="copyright__style" data-testid="copyright_text">{translate("LABEL_COPYRIGHT_TEXT")}</div>
        </div>
    );
};

export default ResetPassword;
