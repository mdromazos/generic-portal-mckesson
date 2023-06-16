import React from "react";
import { Form, Input, IconButton, Button } from "@informatica/droplets-core";
import * as Yup from "yup";
import { useFormik } from 'formik';
import "@informatica/droplets-core/dist/themes/archipelago/components/form.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/button.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { APIMap } from "../../utils/apiMappings";
import { URLMap } from "../../utils/urlMappings";
import CONFIG from "../../config/config";
import { getDefaultHeaders, setCookie, getCookie, deleteCookie } from "../../utils/utilityService";
import "../../pages/login/index.css";

const LoginForm = props => {

    const { USERNAME, HEADERS : { ICT, ICT_CONFIG } } = CONFIG;
    const { t: translate } = useTranslation();
    const initialValues = {
        username: "",
        password: ""
    };
    const validationSchema = () => {
        return Yup.object().shape({
            username: Yup.string().required(translate("ERROR_REQUIRED_USERNAME")),
            password: Yup.string().required(translate("ERROR_REQUIRED_PASSWORD"))
        });
    };

    const handleLogin = (values, actions) => {
        axios.post(APIMap.LOGIN, values, getDefaultHeaders())
            .then(resp => {
                if(getCookie(USERNAME)) {
                    deleteCookie(USERNAME);
                }
                setCookie(USERNAME, resp.data.username);
                setCookie(ICT,resp.headers[ICT_CONFIG]);
                props.history.push(URLMap.portals());
            })
            .catch(() => {
                actions.setFieldError("generalLogin", translate("ERROR_INVALID_CREDENTIALS"));
            });
    };

    const formikProps = useFormik({
        initialValues,
        onSubmit: handleLogin,
        validationSchema,
    });

    const commonProps = {
        onChange: formikProps.handleChange,
        onBlur: formikProps.handleBlur,
    };
    return (
    <>
        <div className="login-form-field login-error login-error-color">
            <IconButton className="login-error-btn">
                {
                    formikProps.errors.generalLogin && 
                    <i className="login-error-color login-error-close aicon aicon__close-solid" data-testid="general-login-error"/>
                }
            </IconButton>
            {formikProps.errors.generalLogin}
        </div>
        <form id="login-form" onSubmit={formikProps.handleSubmit} className="form">
            <Form.Group required>
                <div className="form-field-label">
                    <Form.Label>{translate("LABEL_USERNAME")}</Form.Label>
                </div>                
                <Form.Control
                    name="username"
                    as={Input}
                    value={formikProps.values.username}
                    className="username-field-input"
                    {...commonProps}
                    data-testid="username-input"
                />
                {formikProps.touched.username && formikProps.errors.username &&
                    <div className="username-field-error">
                        <Form.Error>
                            {formikProps.errors.username}
                        </Form.Error>
                    </div>    
                }
            </Form.Group>

            <Form.Group required>
                <div className="form-field-label password-label">
                    <Form.Label required>
                        {translate("LABEL_PASSWORD")}
                    </Form.Label>
                </div>
                <Form.Control
                    name="password"
                    type="password"
                    as={Input}
                    value={formikProps.values.password}
                    className="username-field-input"
                    {...commonProps}
                    data-testid="password-input"
                />
                {formikProps.touched.password && formikProps.errors.password &&
                    <div className="username-field-error">
                        <Form.Error>
                            {formikProps.errors.password}
                        </Form.Error>
                    </div>
                }                                  
            </Form.Group>
            <div className="login-btn-group login-form-field">
                <Button type="submit" variant="primary" className="login-button" data-testid="login-button">
                    {translate("LABEL_LOGIN")}
                </Button>
            </div>            
        </form>        
    </>)

};

export default LoginForm;
