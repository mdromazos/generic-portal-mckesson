import React, {useContext, useEffect, useState} from 'react';
import { StateContext } from '../../context/stateContext';
import { Button, Dropdown, IconButton, Form, Input } from '@informatica/droplets-core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { URLMap } from '../../utils/urlMappings';
import APIService from '../../utils/apiService';
import '@informatica/droplets-core/dist/themes/archipelago/components/form.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/button.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css';
import { useTranslation } from "react-i18next";
import CONFIG from '../../config/config';
import i18n from '../../i18n/index';

const LoginForm = ({ match, history, locale, handleLocaleHandler }) => {
    
    const [{ globalSettings: { login, beName, isStateEnabled, disableSignup, isExternalUserManagementEnabled},
        notificationActions: { dispatchAppNotification }, runtimeConfigurationData}] = useContext(StateContext);
    const [localeValue, setLocaleValue] = useState(locale);
    const [localizationOptions, setLocalisationOptions] = useState([]);
    const { t: translate } = useTranslation();
    const {
        CONSTANTS: { NOTIFICATION_ERROR }, LANGUAGE, LOGIN_FIELD_MAPPING, ORS_ID_HEADER, EMAIL, 
        SESSION_POLICY: { SESSION_SECTION,SESSION_TIMEOUT,SESSION_TIMEOUT_LOGIN_VALUE}, ICONS : {SSO_LOGIN}
    } = CONFIG;

    useEffect(() => {
        loadPortalLocale();
    }, []);

    const loadPortalLocale = () => {
        const successCallback = (response) => {
            let localeOptions = [];
            if(response && Array.isArray(response)) {
                localeOptions = response.map(localeData => ({
                    value: localeData.key,
                    text: localeData.desc
                }));
            }
            setLocalisationOptions(localeOptions);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
        };
        APIService.getRequest(
            URLMap.getPortalLocales(match.params.id),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId)
        );
    };

    const validationYupObject = () => {
        return Yup.object().shape({
            email: Yup.string().required(translate("ERROR_REQUIRED_USERNAME")),
            password: Yup.string().required(translate("ERROR_REQUIRED_PASSWORD")),
        });
    };

    const fetchLoginConfigurationData=()=>{
        let loginConfigPayLoad = {};
        let { RECORD_ID, PROJECTIONS} = LOGIN_FIELD_MAPPING;

        loginConfigPayLoad[RECORD_ID.KEY] = RECORD_ID.VALUE;
        loginConfigPayLoad[LOGIN_FIELD_MAPPING.UNIQUE_FIELD_PATH]=login.fieldMapping.userName.code;
        loginConfigPayLoad.projections = {};
        loginConfigPayLoad.projections[PROJECTIONS.PROJECTION_BE_ROLE] = login.fieldMapping.userRole.code;
        loginConfigPayLoad.projections[PROJECTIONS.PROJECTION_BE_PATH] = login.fieldMapping.portalAssociation.code;
        if (login.fieldMapping.userState) {
            loginConfigPayLoad.projections[PROJECTIONS.PROJECTION_BE_STATE] = login.fieldMapping.userState.code;
        }

        loginConfigPayLoad[SESSION_TIMEOUT_LOGIN_VALUE] = runtimeConfigurationData[SESSION_SECTION][SESSION_TIMEOUT].value
        return loginConfigPayLoad;
    };

    const signUpHandler = () => {
        history.push(`/${match.params.id}/${match.params.orsId}/signup`);
    };

    const ssoLoginHandler = () => {
        
        const successCallback = (response) => {
            window.location.href = `${window.location.origin}/infa-portal/portals/login/saml/${match.params.orsId}/${match.params.id}`;
        };

        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
        };

        APIService.getRequest(
            URLMap.validateSSOLogin(match.params.id, match.params.orsId),
            successCallback,
            failureCallback,
            URLMap.generateHeader(match.params.orsId)
        );
    };

    const handleLogin = (values, actions) => {
        let loginRunTimeConfigPayload=fetchLoginConfigurationData();
        const successCallback = (resp) => {
            document.cookie = CONFIG.BE_ROW_ID + "=" + resp.recordId;
            document.cookie = CONFIG.USER_NAME + "=" + resp.username;
            document.cookie = CONFIG.USER_ROLE + "=" + resp.roleCode;
            document.cookie = CONFIG.PORTAL_STATE + "=" + resp.partyStatusValue;
            document.cookie = `${ORS_ID_HEADER}=${match.params.orsId}; path=/`;
            history.push(`/${match.params.id}/${match.params.orsId}/shell`);
        };
        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            }
            else {
                actions.setFieldError('generalLogin', translate("ERROR_INVALID_CREDENTIALS"));
            }
        };
        let loginPayload = { ...loginRunTimeConfigPayload, beName, isStateEnabled};
        loginPayload.username = values.email;
        loginPayload.password = values.password;
        loginPayload.orsId = match.params.orsId;
        document.cookie = `${EMAIL}=${values.email}`;

        APIService.postRequest(
            URLMap.postLogin(match.params.id),
            loginPayload,
            successCallback,
            failureCallback,
            { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
        );
    };

    const localisationChangeHandler = (selectedItem) => {
        i18n.init({
            lng: selectedItem.value
        });
        document.cookie = `${LANGUAGE}=${selectedItem.value}; path=/`;
        setLocaleValue(selectedItem.value);
        handleLocaleHandler(selectedItem.value);
    };

    const forgotPasswordHandler = () => {
        history.push(`/${match.params.id}/${match.params.orsId}/forgotPassword`);
    };

    const ssoForgotPasswordHandler = () => {
        window.open(login.ssoForgotPasswordLink);
    };

    const FormikForm = useFormik({
        initialValues: CONFIG.INITIAL_VALUES,
        onSubmit: handleLogin,
        validationSchema: validationYupObject,
    });
    

    return (
        <div>
            {FormikForm.errors.generalLogin && <div className="login__form__field login__error login__error__color">
                {
                    <IconButton className="login__error__btn">
                        <i className="login__error__color login__error__close aicon aicon__close-solid" />
                    </IconButton>
                }
                {FormikForm.errors.generalLogin}
            </div>}
            <div className="login__form__title" data-testid="login__form__title">{login.title}</div>
            <form className="form" onSubmit={FormikForm.handleSubmit}>
                <Form.Group required>
                <div className="form__field__label">
                    <Form.Label>{translate("USER_NAME")}</Form.Label>
                </div>                
                <Form.Control
                    name="email"
                    as={Input}
                    value={FormikForm.values.email}
                    data-testid="username-input"
                    onChange= {FormikForm.handleChange}
                    onBlur= {FormikForm.handleBlur}
                />
                {FormikForm.touched.email && FormikForm.errors.email &&
                    <div className="field__error">
                        <Form.Error>
                            {FormikForm.errors.email}
                        </Form.Error>
                    </div>    
                }
            </Form.Group>
            <Form.Group required>
                <div className="form__field__label password-label">
                    <Form.Label>
                        {translate("PASSWORD")}
                    </Form.Label>
                </div>
                <Form.Control
                    name="password"
                    type="password"
                    as={Input}
                    value={FormikForm.values.password}
                    data-testid="password-input"
                    onChange= {FormikForm.handleChange}
                    onBlur= {FormikForm.handleBlur}
                />
                {FormikForm.touched.password && FormikForm.errors.password &&
                    <div className="field__error">
                        <Form.Error>
                            {FormikForm.errors.password}
                        </Form.Error>
                    </div>
                }                                  
            </Form.Group>
                <div className="login__div">
                    <span className="button__group">
                        <Button variant="primary" type="submit" className='login__button' data-testid="login__button"> {translate("LOGIN_BUTTON")}</Button>
                    </span>
                </div>
            </form>
            {login.enableSSO && <div className="saml__login__container">
                <div className="login__saml__seperator">
                    <span>{translate("LABEL_OR")}</span>
                </div>
                <Button className="saml__login__button" onClick={ssoLoginHandler}>
                    <img alt="" src={SSO_LOGIN} />
                    <span>{translate("LABEL_SSO_SIGN_IN")}</span>
                </Button>
                <div className="login__saml__seperator bottom__seperator"/>
            </div>}

            {!disableSignup && <div className="login__links" data-testid="signup__link">
                <span className="login__check__account">{translate("ACCOUNT")}</span>
                <span className="link__color" onClick={signUpHandler}>
                    {translate("SIGN_UP")}
                </span>
            </div>}

            <div className="login__links__fp" data-testid="forgot_password_link">
                <span className="link__color" onClick={isExternalUserManagementEnabled ? ssoForgotPasswordHandler : forgotPasswordHandler}>
                    {translate("FORGOT_PASSWORD")}
                </span>
            </div>
            
            <Dropdown
                className="locale__holder"
                options={localizationOptions}
                search
                value={localeValue}
                onChange={localisationChangeHandler}
                data-testid="locale_dropdown"
            />
            <div className="copyright__style" data-testid="login__copyright__text">{translate("LABEL_COPYRIGHT_TEXT")}</div>
        </div>
    );
};
export default LoginForm;