import React, {useState, useContext, useRef, useCallback, useEffect} from 'react';
import '@informatica/droplets-core/dist/themes/archipelago/components/form.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/button.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/dropdown.css';
import { useTranslation } from "react-i18next";
import CONFIG from '../../config/config';
import { Form, Button, Dropdown, MessageBubble,Section, Checkbox} from '@informatica/droplets-core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './index.css';
import { StateContext } from '../../context/stateContext';
import BEForm from "../beForm/beForm";
import { URLMap } from '../../utils/urlMappings';
import APIService from './../../utils/apiService';
import './index.css';
import i18n from '../../i18n/index'

const SignUpForm = ({ match, history, locale, handleLocaleHandler }) => {
    
    const [{
        globalSettings: { signup, userManagement, sourceSystem}, runtimeConfigurationData,
        notificationActions : {dispatchAppNotification,removeAppNotification}, appNotification
    }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const [localeValue, setLocaleValue] = useState(locale);
    const [localizationOptions, setLocalisationOptions] = useState([]);
    const [userData, setUserData] = useState({});
    const {
        CONSTANTS: {NOTIFICATION_SUCCESS, NOTIFICATION_TIMEOUT, NOTIFICATION_ERROR},
        LOOKUP_PROXY_PAYLOAD:{API_URL, REST_TYPE, HTTP_METHOD }, HTTP_METHOD:{GET}, LANGUAGE,
        USER_CREATION_STATIC_SECTION: { FIRST_NAME, LAST_NAME, USER_NAME, EMAIL, JOB_TITLE, COUNTRY_CODE, PHONE_NUMBER}
    } = CONFIG;
    const childRef = useRef();
    const initialValues = CONFIG.INITIAL_VALUES;
    const [checked, setChecked] = useState(false);
    const handleChecked = useCallback(() => setChecked(!checked), [checked, setChecked]);
    const [userActions, setUserActions]=useState(undefined);
    const [fieldName,setFieldName]=useState([])

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

    const handleSignUp =  (values,actions) => {
        setUserData(values);
        setUserActions(actions);
        childRef.current ? childRef.current.triggerBEFormSave() : signUpWithoutBERequest(values);
    };
   
    const getFieldMapping = (userData)=>{

        let contactObject = {};
        let contactFieldObject = {};
        let statusObject = {};
        let fieldMappingPayload = {};
        let portalAssociationObj = {};

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
            roleCode: signup.userRole
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
        if (signup.userState) {
            statusObject[userManagement.fieldMapping.userState.code] = signup.userState;
            fieldMappingPayload = { ...contactObject, ...statusObject };
        } else{
            fieldMappingPayload = { ...contactObject};
        }

        portalAssociationObj[userManagement.fieldMapping.portalAssociation.code] = {
            portalId : match.params.id,
            $original : {
                 item : [null]
            }
        }
        return {...fieldMappingPayload, ...portalAssociationObj};
    };

    const getBeDataPayLoad = (bePayload, fieldMappingPayLoad) => {
        if (bePayload) {
            return {
                ...bePayload,
                ...fieldMappingPayLoad
            };
        } else {
            return {
                ...fieldMappingPayLoad
            };
        }
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

    const signUpWithoutBERequest = values => {
        const fieldMappingPayLoad = getFieldMapping(values);

        let signUpPayload = {
            "BEData": {...fieldMappingPayLoad},
            "userData": {
                "userName": userManagement.hasSameEmailAndUsername ? values.email : values.userName,
                "password": values.password,
                "orsId": match.params.orsId,
                "email": values.email,
                "firstName": values.firstName,
                "lastName": values.lastName
            }
        };
        const successCallback = () => {
            history.push({
                pathname: `/${match.params.id}/${match.params.orsId}/login`
            });
            dispatchAppNotification(translate("LABEL_SIGNUP_SUCCESS"), NOTIFICATION_SUCCESS);
        };
        const failureCallback = ({ response: { data: {errorData,errorCode } } }) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
            showStaticSectionErrorFields(errorData, userActions)
        };
        APIService.postRequest(
            URLMap.postSignUp(signup.bevName, sourceSystem),
            signUpPayload,
            successCallback,
            failureCallback,
            { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
        );
    };

    const signUpRequest = (bePayload, actions, onSaveSuccess, onSaveFailure) => {

        const fieldMappingPayLoad = getFieldMapping(userData);
        let bePayLoad = getBeDataPayLoad(bePayload, fieldMappingPayLoad);
        if (bePayLoad) {
            for (let keys = 0; keys < Object.keys(bePayload).length; keys++) {
                if (typeof bePayload[Object.keys(bePayload)[keys]] === CONFIG.DATA_TYPE.OBJECT) {
                    bePayload[Object.keys(bePayload)[keys]]["$original"] = {
                        item: [null]
                    };
                }
            }
        }
        let signUpPayload = {
            "BEData": bePayLoad,
            "userData": {
                "userName": userManagement.hasSameEmailAndUsername ? userData.email : userData.userName,
                "password": userData.password,
                "orsId": match.params.orsId,
                "email": userData.email,
                "firstName": userData.firstName,
                "lastName": userData.lastName
            }
        };
        const successCallback = () => {
            history.push({
                pathname: `/${match.params.id}/${match.params.orsId}/login`
            });
            dispatchAppNotification(translate("LABEL_SIGNUP_SUCCESS"), NOTIFICATION_SUCCESS);
        };
        const failureCallback = ({response:{data:{errorData, errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), NOTIFICATION_ERROR);
            } else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), NOTIFICATION_ERROR);
            }
            onSaveFailure(errorData);
            showStaticSectionErrorFields(errorData, userActions)
        };
        APIService.postRequest(
            URLMap.postSignUp(signup.bevName, sourceSystem),
            signUpPayload,
            successCallback,
            failureCallback,
            { [CONFIG.SIGN_UP_HEADER]: match.params.orsId ,
              [CONFIG.SIGN_UP_PORTAL_HEADER]: match.params.id
            }
        );
    };

    const getLookupHandler = (lookupUrl, restType = CONFIG.LOOKUP_REL_TYPE.LOOKUP) => {
        return new Promise((resolve, reject) => {
            let lookUpUrl = new URL(lookupUrl);
            let payLoad = {};
            let {pathname, search} = lookUpUrl;
            payLoad[API_URL] = `${pathname + search}`;
            payLoad[REST_TYPE] = restType;
            payLoad[HTTP_METHOD] = GET;
            APIService.postRequest(
                URLMap.getLookUpProxy(),
                payLoad,
                (response) => {
                    resolve(response)
                },
                (error) => {
                    reject(error)
                },
                { [CONFIG.SIGN_UP_HEADER]: match.params.orsId,
                  [CONFIG.SIGN_UP_PORTAL_HEADER]: match.params.id
                }
            );
        });
    };

    const validationYupObject = () => {
        if (userManagement.hasSameEmailAndUsername){
            return Yup.object().shape({
                password: Yup.string().required(translate("ERROR_REQUIRED_PASSWORD")),
                firstName: Yup.string().required(translate("ERROR_REQUIRED_FIRST_NAME")),
                lastName: Yup.string().required(translate("ERROR_REQUIRED_LAST_NAME")),
                email: Yup.string().required(translate("ERROR_REQUIRED_EMAIL")),
            });
        }
        else{
            return Yup.object().shape({
                userName: Yup.string().required(translate("ERROR_REQUIRED_USERNAME")),
                password: Yup.string().required(translate("ERROR_REQUIRED_PASSWORD")),
                firstName: Yup.string().required(translate("ERROR_REQUIRED_FIRST_NAME")),
                lastName: Yup.string().required(translate("ERROR_REQUIRED_LAST_NAME")),
                email: Yup.string().required(translate("ERROR_REQUIRED_EMAIL")),
            });
        }
    };

    const loginHandler = () => {
        history.push(`/${match.params.id}/${match.params.orsId}/login`)
    };

    const getPasswordPolicyInfo = () => {
        if(runtimeConfigurationData && runtimeConfigurationData[CONFIG.PASSWORD_POLICY.PASSWORD_SECTION]) {
            return runtimeConfigurationData[CONFIG.PASSWORD_POLICY.PASSWORD_SECTION][CONFIG.PASSWORD_POLICY.PASSWORD_POLICY_KEY].value;
        }
        return "";
    };

    const localisationChangeHandler = (selectedItem) => {
        i18n.init({
            lng: selectedItem.value
        });
        document.cookie = `${LANGUAGE}=${selectedItem.value}; path=/`;
        setLocaleValue(selectedItem.value);
        handleLocaleHandler(selectedItem.value);
    };

    const FormikForm = useFormik({
        initialValues: initialValues,
        onSubmit: handleSignUp,
        validationSchema: validationYupObject,
    });

    return <>
        <div>
            {
                appNotification && <MessageBubble
                    data-testid="message_bubble"
                    type={appNotification[0].type}
                    timeout={NOTIFICATION_TIMEOUT}
                    onClose={removeAppNotification}
                    dismissible
                >
                    {appNotification.map(notificationConfig => (
                        <div data-testid="message_bubble_message">
                            {notificationConfig.message}
                        </div>
                    ))}
                </MessageBubble>
            }
        </div>
        <form className="form" onSubmit={FormikForm.handleSubmit}>
            <div className="signup__form__title" data-testid="signup__form__title">{signup.title}
                {
                    signup.welcomeText ? <div className="signup__form__welcome__title">{signup.welcomeText}</div> : ""
                }
            </div>
            <Section className="signup__section" title={userManagement.sectionHeading} collapsible data-testid="signup_section">
                <div className="signup__user ">
                    {
                        userManagement.fieldMapping.firstName && <div className={`signup_${signup.maxColumns}_row ${(fieldName.indexOf(FIRST_NAME) !== -1 && FormikForm.errors.firstName) ? 'error__box' : ''}`}>
                            <Form.Group required className="form__group__signup" data-testid="signup_firstname_group">
                                <Form.Label className="form__label__signup" data-testid="signup_firstname_label">
                                    {userManagement.fieldMapping.firstName.label}
                                </Form.Label>
                                <Form.Control
                                    data-testid="signup_firstname_input"
                                    name="firstName"
                                    type="text"
                                    className="form__field__signup"
                                    variant={FormikForm.errors.firstName ? "error" : ""}
                                    as={FormikForm.Input}
                                    value={FormikForm.values.firstName}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.firstName && FormikForm.errors.firstName &&
                                    <div className="field__error" data-testid="signup_firstname_error">
                                        <Form.Error>
                                            {FormikForm.errors.firstName}
                                        </Form.Error>
                                    </div>
                                }
                            </Form.Group>
                        </div>
                    }
                    {
                        userManagement.fieldMapping.lastName && <div className={`signup_${signup.maxColumns}_row ${(fieldName.indexOf(LAST_NAME) !== -1 && FormikForm.errors.lastName) ? 'error__box' : ''}`}>
                            <Form.Group required className="form__group__signup" data-testid="signup_lastName_group">
                                <Form.Label className="form__label__signup" data-testid="signup_lastName_label">
                                    {userManagement.fieldMapping.lastName.label}
                                </Form.Label>
                                <Form.Control
                                    data-testid="signup_lastName_input"
                                    name="lastName"
                                    type="text"
                                    className="form__field__signup"
                                    variant={FormikForm.errors.lastName ? "error" : ""}
                                    as={FormikForm.Input}
                                    value={FormikForm.values.lastName}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.lastName && FormikForm.errors.lastName &&
                                    <div className="field__error" data-testid="signup_lastName_error">
                                        <Form.Error>
                                            {FormikForm.errors.lastName}
                                        </Form.Error>
                                    </div>
                                }
                            </Form.Group>
                        </div>
                    }
                    {
                        !userManagement.hasSameEmailAndUsername && <div className={`signup_${signup.maxColumns}_row ${(fieldName.indexOf(USER_NAME) !== -1 && FormikForm.errors.userName) ? 'error__box' : ''}`}>
                            <Form.Group required className="form__group__signup" data-testid="signup_userName_group">
                                <Form.Label className="form__label__signup" data-testid="signup_userName_label">
                                    {userManagement.fieldMapping.userName.label}
                                </Form.Label>
                                <Form.Control
                                    data-testid="signup_userName_input"
                                    name="userName"
                                    type="text"
                                    className="form__field__signup"
                                    variant={FormikForm.errors.userName ? "error" : ""}
                                    as={FormikForm.Input}
                                    value={FormikForm.values.userName}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.userName && FormikForm.errors.userName &&
                                    <div className="field__error" data-testid="signup_userName_error">
                                        <Form.Error>
                                            {FormikForm.errors.userName}
                                        </Form.Error>
                                    </div>
                                }
                            </Form.Group>
                        </div>
                    }
                    {
                        userManagement.fieldMapping.jobTitle && <div className={`signup_${signup.maxColumns}_row ${(fieldName.indexOf(JOB_TITLE) !== -1 && FormikForm.errors.jobTitle) ? 'error__box' : ''}`}>
                            <Form.Group className="form__group__signup" data-testid="signup_jobTitle_group">
                                <Form.Label className="form__label__signup" data-testid="signup_jobTitle_label">
                                    {userManagement.fieldMapping.jobTitle.label}
                                </Form.Label>
                                <Form.Control
                                    name="jobTitle"
                                    data-testid="signup_jobTitle_input"
                                    type="text"
                                    className="form__field__signup"
                                    variant={FormikForm.errors.jobTitle ? "error" : ""}
                                    as={FormikForm.Input}
                                    value={FormikForm.values.jobTitle}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.jobTitle && FormikForm.errors.jobTitle &&
                                    <div className="field__error" data-testid="signup_jobTitle_error">
                                        <Form.Error>
                                            {FormikForm.errors.jobTitle}
                                        </Form.Error>
                                    </div>
                                }
                            </Form.Group>
                        </div>
                    }
                    {
                        userManagement.fieldMapping.countryDialingCode && <div className={`signup_${signup.maxColumns}_row ${(fieldName.indexOf(COUNTRY_CODE) !== -1 && FormikForm.errors.countryDialingCode) ? 'error__box' : ''}`}>
                            <Form.Group className="form__group__signup" data-testid="signup_countryDialingCode_group">
                                <Form.Label className="form__label__signup" data-testid="signup_countryDialingCode_label">
                                    {userManagement.fieldMapping.countryDialingCode.label}
                                </Form.Label>
                                <Form.Control
                                    name="countryDialingCode"
                                    data-testid="signup_countryDialingCode_input"
                                    type="text"
                                    className="form__field__signup"
                                    variant={FormikForm.errors.countryDialingCode ? "error" : ""}
                                    as={FormikForm.Input}
                                    value={FormikForm.values.countryDialingCode}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.countryDialingCode && FormikForm.errors.countryDialingCode &&
                                    <div className="field__error" data-testid="signup_countryDialingCode_error">
                                        <Form.Error>
                                            {FormikForm.errors.countryDialingCode}
                                        </Form.Error>
                                    </div>
                                }
                            </Form.Group>
                        </div>
                    }
                    {
                        userManagement.fieldMapping.phoneNumber && <div className={`signup_${signup.maxColumns}_row ${(fieldName.indexOf(PHONE_NUMBER) !== -1 && FormikForm.errors.phoneNumber) ? 'error__box' : ''}`}>
                            <Form.Group className="form__group__signup" data-testid="signup_phoneNumber_group">
                                <Form.Label className="form__label__signup" data-testid="signup_phoneNumber_label">
                                    {userManagement.fieldMapping.phoneNumber.label}
                                </Form.Label>
                                <Form.Control
                                    name="phoneNumber"
                                    data-testid="signup_phoneNumber_input"
                                    type="text"
                                    className="form__field__signup"
                                    variant={FormikForm.errors.phoneNumber ? "error" : ""}
                                    as={FormikForm.Input}
                                    value={FormikForm.values.phoneNumber}
                                    onChange={FormikForm.handleChange}
                                    onBlur={FormikForm.handleBlur}
                                />
                                {FormikForm.touched.phoneNumber && FormikForm.errors.phoneNumber &&
                                    <div className="field__error" data-testid="signup_phoneNumber_error">
                                        <Form.Error>
                                            {FormikForm.errors.phoneNumber}
                                        </Form.Error>
                                    </div>
                                }
                            </Form.Group>
                        </div>
                    }
                    <div className={`signup_${signup.maxColumns}_row ${(fieldName.indexOf(EMAIL) !== -1 && FormikForm.errors.email) ? 'error__box' : ''}`}>
                        <Form.Group required className="form__group__signup" data-testid="signup_email_group">
                            <Form.Label className="form__label__signup" data-testid="signup_email_label">
                                {userManagement.fieldMapping.email.label}
                            </Form.Label>
                            <Form.Control
                                name="email"
                                type="text"
                                data-testid="signup_email_input"
                                className="form__field__signup"
                                variant={FormikForm.errors.email ? "error" : ""}
                                as={FormikForm.Input}
                                value={FormikForm.values.email}
                                onChange={FormikForm.handleChange}
                                onBlur={FormikForm.handleBlur}
                            />
                            {FormikForm.touched.email && FormikForm.errors.email &&
                                <div className="field__error" data-testid="signup_email_error">
                                    <Form.Error>
                                        {FormikForm.errors.email}
                                    </Form.Error>
                                </div>
                            }
                        </Form.Group>
                    </div>
                </div>
                <div className="signup__user">
                    <div className={`signup_${signup.maxColumns}_row`}>
                        <Form.Group required className="form__group__signup" data-testid='signup_password_group'>
                            <Form.Label help={getPasswordPolicyInfo()} className="form__label__signup" data-testid="signup_password_label">
                                {translate("PASSWORD")}
                            </Form.Label>
                            <Form.Control
                                name="password"
                                data-testid="signup_password_input"
                                className="form__field__signup"
                                variant={FormikForm.errors.password ? "error" : ""}
                                type={checked ? "text" : "password"}
                                as={FormikForm.Input}
                                value={FormikForm.values.password}
                                onChange={FormikForm.handleChange}
                                onBlur={FormikForm.handleBlur}
                            />
                            {FormikForm.touched.password && FormikForm.errors.password &&
                                <div className="field__error" data-testid="signup_password_error">
                                    <Form.Error>
                                        {FormikForm.errors.password}
                                    </Form.Error>
                                </div>
                            }
                        </Form.Group>
                    </div>
                    <div className={`signup_${signup.maxColumns}_row__show__password`}>
                        <Form.Group data-testid="signup_showPassword_group">
                            <Form.Control
                                data-testid="signup_showPassword_input"
                                checked={checked}
                                onChange={handleChecked}
                                name="showPassword"
                                as={Checkbox}
                            >{translate("LABEL_SHOW_PASSWORD")}</Form.Control>
                        </Form.Group>
                    </div>
                </div>
            </Section>
            <div>
                {
                    signup.beFormComponent && <BEForm
                        beMeta={signup.beFormComponent}
                        getLookupHandler={getLookupHandler}
                        ref={childRef}
                        onSave={signUpRequest}
                        mode={"EDIT_AUTO_SAVE"}
                        maxColumns={signup.maxColumns}
                        skipOriginalCreation={true}
                    />
                }
            </div>
            <div className="signup__div">
                <span className="button__group">
                    <Button type="submit" className="signup__button" data-testid="signup__button">
                        {translate("SIGN_UP_BUTTON")}
                    </Button>
                </span>
            </div>
        </form>
        <div className="signup__links">
            <span className="signup__check__account">
                {translate("LABEL_ACCOUNT_SIGN_UP")}
            </span>
            <span className="link__color" onClick={loginHandler} data-testid="login__link">
                {translate("LOGIN_BUTTON")}
            </span>
        </div>
        <Dropdown
            className="locale__holder__signup"
            data-testid="signup_locale_dropdown"
            options={localizationOptions}
            search
            value={localeValue}
            onChange={localisationChangeHandler}
        />
        <div className="copyright__style" data-testid="signup__copyright__text">{translate("LABEL_COPYRIGHT_TEXT")}</div>
    </>
};
export default SignUpForm;
