import React, {useState, useContext} from "react";
import { Button, Form, Input} from "@informatica/droplets-core";
import { useFormik } from 'formik';
import * as Yup from "yup";
import {URLMap} from "../../utils/urlMappings";
import APIService from "../../utils/apiService";
import {StateContext} from "../../context/stateContext";
import "@informatica/droplets-core/dist/themes/archipelago/components/form.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/button.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css";
import {useTranslation} from "react-i18next";
import CONFIG from "../../config/config";
import "./index.css";

const ForgotPassword = ({match, history}) => {
    
    const {t: translate} = useTranslation();
    const [successText, setSuccessText] = useState("");
    const {CONSTANTS: {NOTIFICATION_ERROR}, INITIAL_VALUES, ORS_ID} = CONFIG;
    const [{notificationActions: {dispatchAppNotification}}] = useContext(StateContext);

    const validationYupObject = () => {
        return Yup.object().shape({
            email: Yup.string().required(translate("ERROR_REQUIRED_EMAIL")).email(translate("ERROR_EMAIL_FORMAT"))
        });
    };

    const loginHandler = () => {
        history.push(`/${match.params.id}/${match.params.orsId}/login`);
    };

    const handleForgotPassword = (values) => {
        const successCallback = () => {
            setSuccessText(translate("FORGOT_PASSWORD_SUCCESS_INFO", {EMAIL_ID: `${values.email}`}))
        };
        const failureCallback = ({response: {data: {errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(
                    translate(errorCode),
                    NOTIFICATION_ERROR
                );
            }
        };
        let loginPayload = {};
        loginPayload.userEmail = values.email;
        loginPayload.orsId = match.params.orsId;

        APIService.postRequest(
            URLMap.postForgotPassword(match.params.id),
            loginPayload,
            successCallback,
            failureCallback,
            {[ORS_ID]: match.params.orsId}
        );
    };

    const FormikForm = useFormik({
        initialValues: INITIAL_VALUES,
        onSubmit: handleForgotPassword,
        validationSchema: validationYupObject,
    });

    return (
        <div>
            <form className="forgot__form" onSubmit={FormikForm.handleSubmit}>
                <div className="login__form__title" data-testid="forgot_password_title">
                    {translate("FORGOT_PASSWORD_TITLE")}
                </div>
                {
                    successText ? <p className="password__instruction">{successText}</p>
                        : <>
                            <p className="password__instruction" data-testid="password_instruction">{
                                translate("FORGOT_PASSWORD_DEFAULT_INFO")}
                            </p>
                            <Form.Element
                                label={translate("LABEL_EMAIL_ADDRESS")}
                                name="email"
                                as={Input}
                                value={FormikForm.values.email}
                                error={FormikForm.errors.email}
                                required
                                onChange={FormikForm.handleChange}
                                onBlur={FormikForm.handleBlur}
                            />
                            <div className="login__div">
                                <span className="button__group">
                                    <Button variant="primary" type="submit" className="login__button" data-testid="password_reset_button">
                                        {" "}
                                        {translate("FORGOT_PASSWORD_SEND_BUTTON")}
                                    </Button>
                                </span>
                            </div>
                        </>
                }
            </form>
            <div className="login__links">
                <span className="link__color" onClick={loginHandler} data-testid="login_link">
                    {translate("BACK_TO_LOGIN")}
                </span>
            </div>
            <div className="copyright__style">{translate("LABEL_COPYRIGHT_TEXT")}</div>
        </div>
    );
};
export default ForgotPassword;
