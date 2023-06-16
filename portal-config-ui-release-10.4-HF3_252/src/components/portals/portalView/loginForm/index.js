import React, { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Form, Section, Toolbar, Tooltip, Input, Radio } from "@informatica/droplets-core";
import "./index.css";

const LoginForm = ({ formikProps, commonProps, setActiveStep, handleBlur, handleChange }) => {
    const { t: translate } = useTranslation();
    // const [isCaptchaEnabled, setChecked] = React.useState(true);
    // const handleChecked = React.useCallback(() => setChecked(!isCaptchaEnabled), [isCaptchaEnabled, setChecked]);

    useEffect(() => {
        setActiveStep();
    }, [setActiveStep]);      
    
    return <>
        <div className="default_message">
            { translate('LABEL_LOGIN_MESSAGE') }
        </div>
        <Section title={translate("LABEL_PAGE_DETAILS_LOGIN_PAGE")}>
            <Form.Group className="form-group">
                <Form.Label className="form-label">{ translate('LABEL_BACKGROUND_IMAGE') }</Form.Label>
                <Form.Control
                    className="form-field" 
                    value={formikProps.values.login && formikProps.values.login.backgroundImage}
                    name="login.backgroundImage"
                    as={Input}
                    {...commonProps}
                />
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label">{ translate('LABEL_TITLE') }</Form.Label>
                <Form.Control
                    className="form-field" 
                    name="login.title"
                    value={formikProps.values.login && formikProps.values.login.title}
                    as={Input}
                    {...commonProps}
                />
            </Form.Group>
            {/* <Form.Group className="form-group" name="login.isCaptchaEnabled">
                <Form.Control className="form-field" as={Form.Checkbox} checked={isCaptchaEnabled} onChange={handleChecked}>
                    { translate('LABEL_ENABLE_CAPTCHA') }
                </Form.Field>
                {formikProps.touched.login
                    && formikProps.touched.login.backgroundImage
                    && formikProps.errors.login
                    && formikProps.errors.login.backgroundImage
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.login.backgroundImage}</Form.Error></div>)}
            </Form.Group> */}
        </Section>
        <Section title={translate("LABEL_LOGIN_BE_FIELD_MAPPING")}>
            <div className="default_message">
                {translate('LABEL_LOGIN_FIELD_MAPPING_MESSAGE')}
            </div>
            <Form.Group className="form-group" required>
                <Form.Label className="form-label" help={translate('LABEL_TABLE_EMAIL_INFO')}>
                    {translate('LABEL_TABLE_EMAIL')}
                </Form.Label>
                <Form.Control
                    value={formikProps.values.login 
                        && formikProps.values.login.fieldMapping
                        && formikProps.values.login.fieldMapping.email
                        && formikProps.values.login.fieldMapping.email.code}
                    className="form-field"
                    name="login.fieldMapping.email.code"
                    as={Input}
                    {...commonProps}
                />
                {formikProps.touched.login
                    && formikProps.touched.login.fieldMapping
                    && formikProps.touched.login.fieldMapping.email
                    && formikProps.touched.login.fieldMapping.email.code
                    && formikProps.errors.login
                    && formikProps.errors.login.fieldMapping
                    && formikProps.errors.login.fieldMapping.email
                    && formikProps.errors.login.fieldMapping.email.code
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.login.fieldMapping.email.code}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group" required>
                <Form.Label className="form-label" help={translate('LABEL_TABLE_USER_NAME_INFO')} required>
                    {translate('LABEL_TABLE_USER_NAME')}
                </Form.Label>
                <Form.Control
                    value={formikProps.values.login 
                        && formikProps.values.login.fieldMapping
                        && formikProps.values.login.fieldMapping.userName
                        && formikProps.values.login.fieldMapping.userName.code}
                    className="form-field"
                    name="login.fieldMapping.userName.code"
                    as={Input} 
                    {...commonProps}
                />
                {formikProps.touched.login
                    && formikProps.touched.login.fieldMapping
                    && formikProps.touched.login.fieldMapping.userName
                    && formikProps.touched.login.fieldMapping.userName.code
                    && formikProps.errors.login
                    && formikProps.errors.login.fieldMapping
                    && formikProps.errors.login.fieldMapping.userName
                    && formikProps.errors.login.fieldMapping.userName.code
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.login.fieldMapping.userName.code}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group" required>
                <Form.Label className="form-label" help={translate('LABEL_TABLE_USER_ROLE_INFO')}>
                    {translate('LABEL_TABLE_USER_ROLE')}
                </Form.Label>
                <Form.Control
                    value={formikProps.values.login 
                        && formikProps.values.login.fieldMapping
                        && formikProps.values.login.fieldMapping.userRole
                        && formikProps.values.login.fieldMapping.userRole.code}
                    className="form-field"
                    name="login.fieldMapping.userRole.code" 
                    as={Input} 
                    {...commonProps}
                />
                {formikProps.touched.login
                    && formikProps.touched.login.fieldMapping
                    && formikProps.touched.login.fieldMapping.userRole
                    && formikProps.touched.login.fieldMapping.userRole.code
                    && formikProps.errors.login
                    && formikProps.errors.login.fieldMapping
                    && formikProps.errors.login.fieldMapping.userRole
                    && formikProps.errors.login.fieldMapping.userRole.code
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.login.fieldMapping.userRole.code}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group" required={formikProps.values.isStateEnabled}>
                <Form.Label className="form-label" help={translate('LABEL_PORTAL_STATES_INFO')}>
                    {translate('LABEL_PORTAL_STATES')}
                </Form.Label>
                {
                    formikProps.values.isStateEnabled
                        ? <Form.Control
                            className="form-field"
                            value={formikProps.values.login 
                                && formikProps.values.login.fieldMapping
                                && formikProps.values.login.fieldMapping.userState
                                && formikProps.values.login.fieldMapping.userState.code}                            
                            as={Input}
                            name="login.fieldMapping.userState.code"
                            {...commonProps}
                        />
                        : <Form.Control
                            className="form-field"
                            value={formikProps.values.login 
                                && formikProps.values.login.fieldMapping
                                && formikProps.values.login.fieldMapping.userState
                                && formikProps.values.login.fieldMapping.userState.code}                            
                            as={Input} 
                            name="login.fieldMapping.userState.code" 
                            disabled={true}
                            {...commonProps} />
                }
                {formikProps.touched.login
                    && formikProps.touched.login.fieldMapping
                    && formikProps.touched.login.fieldMapping.userState
                    && formikProps.touched.login.fieldMapping.userState.code
                    && formikProps.errors.login
                    && formikProps.errors.login.fieldMapping
                    && formikProps.errors.login.fieldMapping.userState
                    && formikProps.errors.login.fieldMapping.userState.code
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.login.fieldMapping.userState.code}</Form.Error></div>)}
            </Form.Group>
            <Form.Group className="form-group" required>
                <Form.Label className="form-label" help={translate('LABEL_LOGIN_PORTAL_NAME_INFO')}>
                    {translate('LABEL_LOGIN_PORTAL_NAME')}
                </Form.Label>
                <Form.Control
                    value={formikProps.values.login 
                        && formikProps.values.login.fieldMapping 
                        && formikProps.values.login.fieldMapping.portalAssociation
                        &&formikProps.values.login.fieldMapping.portalAssociation.code} 
                    className="form-field"
                    name="login.fieldMapping.portalAssociation.code"
                    as={Input}
                    {...commonProps}
                />
                {formikProps.touched.login
                    && formikProps.touched.login.fieldMapping
                    && formikProps.touched.login.fieldMapping.portalAssociation
                    && formikProps.touched.login.fieldMapping.portalAssociation.code
                    && formikProps.errors.login
                    && formikProps.errors.login.fieldMapping
                    && formikProps.errors.login.fieldMapping.portalAssociation
                    && formikProps.errors.login.fieldMapping.portalAssociation.code
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.login.fieldMapping.portalAssociation.code}</Form.Error>
                    </div>)
                }
            </Form.Group>
        </Section>
        
        {!formikProps.values.isExternalUserManagementEnabled && (
            <Section title={translate("LABEL_LOGIN_EMAIL_TEMPLATE")}  className="general__settings__section" 
                toolbar={() => (
                    <Toolbar className="email-templates-toolbar">
                        <Tooltip content={translate("LABEL_LOGIN_EMAIL_TEMPLATE_INFO")}>
                            <i className="aicon aicon__help tooltip__icon" />
                        </Tooltip>
                    </Toolbar>)}
            >
                <Form.Group className="form-group">
                    <Form.Label className="form-label" help={translate('LABEL_RESET_PASSWORD_INFO')}>
                        {translate('LABEL_RESET_PASSWORD')}
                    </Form.Label>
                    <Form.Control
                        value={formikProps.values.login && formikProps.values.login.resetPasswordEmailTemplate}
                        className="form-field" 
                        name="login.resetPasswordEmailTemplate" 
                        as={Input}
                        {...commonProps}
                    />
                </Form.Group>
                <Form.Group className="form-group">
                    <Form.Label className="form-label" help={translate('LABEL_RESET_PASSWORD_SUCCESS_INFO')}>
                        {translate('LABEL_RESET_PASSWORD_SUCCESS')}
                    </Form.Label>
                    <Form.Control
                        value={formikProps.values.login && formikProps.values.login.resetPasswordEmailSuccessTemplate}
                        className="form-field" 
                        name="login.resetPasswordEmailSuccessTemplate"
                        as={Input}
                        {...commonProps}
                    />
                </Form.Group>
            </Section>
        )}
        {formikProps.values.isExternalUserManagementEnabled && (
            <Section title={translate("LABEL_SSO_CONFIGURATION")} >
                <Form.Group className="form-group">
                    <Form.Label className="form-label" help={translate('LABEL_ENABLE_SSO_INFO')}>
                        {translate('LABEL_ENABLE_SSO')}
                    </Form.Label>
                    <div className="radio-form-group">
                        <Form.Control
                            className="radio-form-field"
                            name="login.enableSSO"
                            onChange={ (e) => {
                                const { value } = e.target;
                                handleChange('login.enableSSO', JSON.parse(value));
                                handleBlur('login.enableSSO');
                            }}
                            value={true}
                            as={Radio}
                            data-testid="is-sso-enabled-true"
                            checked={Boolean(formikProps.values.login.enableSSO) === true}
                        >
                            {translate("LABEL_YES")}
                        </Form.Control>
                        <Form.Control
                            name="login.enableSSO"
                            onChange={(e) => {
                                const { value } = e.target;
                                handleChange('login.enableSSO', JSON.parse(value));
                                handleBlur('login.enableSSO');
                            }}
                            value={false}
                            as={Radio}
                            data-testid="is-sso-enabled-false"
                            checked={Boolean(formikProps.values.login.enableSSO) === false}
                        >
                            {translate("LABEL_NO")}
                        </Form.Control>
                    </div>
                </Form.Group>
                <Form.Group className="form-group" required>
                    <Form.Label className="form-label" help={translate('LABEL_SSO_FORGOT_PASSWORD_INFO')}>
                        {translate('LABEL_SSO_FORGOT_PASSWORD')}
                    </Form.Label>
                    <Form.Control
                        value={formikProps.values.login && formikProps.values.login.ssoForgotPasswordLink}
                        className="form-field" 
                        name="login.ssoForgotPasswordLink"
                        as={Input}
                        {...commonProps}
                    />
                    {formikProps.touched.login && formikProps.touched.login.ssoForgotPasswordLink
                        && formikProps.errors.login && formikProps.errors.login.ssoForgotPasswordLink
                        && <div className="form-error">
                            <Form.Error>{formikProps.errors.login.ssoForgotPasswordLink}</Form.Error>
                        </div>
                    }
                </Form.Group>
            </Section>
        )}
    </>;
};
export default LoginForm;
