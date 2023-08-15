import React, { useEffect, useState, useContext, forwardRef, useImperativeHandle, useRef } from "react";
import { Button, MessageBox, useMessageBoxState, Form } from "@informatica/droplets-core";
import { Formik } from 'formik';
import PropTypes from "prop-types";
import moment from "moment";
import * as Yup from "yup";
import "./beForm.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/panel.css";
import "@informatica/droplets-core/dist/themes/archipelago/components/section.css";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import "react-widgets/dist/css/react-widgets.css";
import { useTranslation } from "react-i18next";
import BEFORM_CONFIG from "./beFormConfig";
import BEFormSection from "./beFormSection";
import {StateContext} from "../../context/stateContext";
import CONFIG from "../../config/config";
import {
    getYupSchema,
    getObjectPropertyValue,
    defineRequiredFieldValidation,
    defineFieldMaxLengthValidation
} from "./validations";
import {
    setFieldValue,
    getObjectDiff,
    create$Original,
    getMatchingItemFromList,
    getDeletedOneToManyItems,
    getFieldName,
    handleFormikErrors
} from "./beFormUtility";


export const BEForm = forwardRef(({
    onSave, validateData, beMeta, beData, dateFormat, dateLocal, maxColumns,
    getLookupHandler, fileHandler, mode, getOneToManyBEDataHandler, skipOriginalCreation = false, history, previewMode = false}, ref) => {

    const { t: translate } = useTranslation();
    const { DATA_TYPES, MODES, META_KEYS, OPERATIONS, ONE_TO_MANY, ICONS:{ALERT} } = BEFORM_CONFIG;

    const {LOG_OUT, CONSTANTS: { NOTIFICATION_ERROR }} = CONFIG;
    const [formDisabled, setFormDisabled] = useState(true);
    const [updatedBEData, updateBEData] = useState(undefined);
    const beFormSaveTriggerRef = useRef();
    const [groupValidationErrors, setGroupValidationErrors] = useState({});
    const [formValid, setFormValid] = useState(true);
    const [{notificationActions:{editStatusAction,dispatchAppNotification}, confirmDialog:{visible, nextPageID, type}}] = useContext(StateContext);

    const messageBox = useMessageBoxState();

    const [beFormdynamicFieldFormikProps, setBeFormdynamicFieldFormikProps] = useState({});
    
    /* Creating a blank validation object */
    let yupObject = {};
    useEffect(() => {
        const enableEditMode = mode === MODES.EDIT_READ || mode === MODES.EDIT_ONLY || mode === MODES.EDIT_AUTO_SAVE;
        setFormDisabled(!enableEditMode);
        let beDataObj = beData ? JSON.parse(JSON.stringify(beData)) : {};

        // For required check validation of root fields, also added in cancel handler
        beMeta.hasOwnProperty("beFormSections") && Array.isArray(beMeta.beFormSections)
        && beMeta.beFormSections.forEach((beSection) => {
            if (beSection.beFormFields && Array.isArray(beSection.beFormFields)) {
                beSection.beFormFields.forEach((beField) => {
                    if(beField.required && !beField.many && typeof(beDataObj[beField.name]) === "undefined") {
                        if(beField.dataType === DATA_TYPES.LOOKUP) {
                            beDataObj[beField.name] = {};
                        } else {
                            beDataObj[beField.name] = "";
                        }
                    }
                });
            }
        });
        updateBEData(beDataObj);
    }, [beData]);

    useImperativeHandle(ref, () => ({
        triggerBEFormSave() {
            if (beFormSaveTriggerRef.current) {
                beFormSaveTriggerRef.current.click();
            }
        },
        getBeFormStatus() {
            return formValid; 
        }
    }));

    const handleEditClick = () => {
        editStatusAction(true);
        setFormDisabled(false);
    };
    
    const formValidationCreation = () => {
        if (!formDisabled && (Object.keys(yupObject).length === 0)) {
            const fieldMap = {};
            let oneToManyValidationList = {};
            if (beMeta.beFormSections && Array.isArray(beMeta.beFormSections)) {
                beMeta.beFormSections.forEach((beSection) => {
                    if (beSection.beFormFields && Array.isArray(beSection.beFormFields)) {
                        beSection.beFormFields.forEach((beField) => {
                            if (!beField.many) {
                                let yupValidationObj = getYupValidationObj(beField);
                                assignYupValidationToField(beField, fieldMap, yupValidationObj);
                            } else {
                                let getOneToManyValidationObject = getOneToManyValidationObj(beField);
                                assignYupValidationToField(beField, oneToManyValidationList, getOneToManyValidationObject);
                            }
                        });
                    }
                });
            }
            if (Object.keys(oneToManyValidationList).length > 0) {
                fieldMap[ONE_TO_MANY.DATA_KEY] = Yup.object().shape(oneToManyValidationList);
            }
            yupObject = Yup.object().shape(fieldMap);
        }
        return yupObject;
    };

    const getOneToManyValidationObj = (beFieldObj) => {

        let manyFieldMap = {};
        beFieldObj && beFieldObj.beFormFields &&
            Array.isArray(beFieldObj.beFormFields) && beFieldObj.beFormFields.forEach((beManyChild) => {
                if (!beManyChild.many) {
                    let yupValidationObj = getYupValidationObj(beManyChild);
                    assignYupValidationToField(beManyChild, manyFieldMap, yupValidationObj);
                } else {
                    let yupValidationObj = getOneToManyValidationObj(beManyChild);
                    assignYupValidationToField(beManyChild, manyFieldMap, yupValidationObj);
                }
            });
        return Yup.array().of(Yup.object().shape(manyFieldMap));
    };

    const assignYupValidationToField = (beField, fieldYupObj, yupValidationObj) => {

        if (fieldYupObj && yupValidationObj) {
            let yupFieldName = getFieldName(beField);
            if (yupFieldName.indexOf(".") !== -1) {
                let yupFieldNameList = yupFieldName.split(".");
                let childObj = {};
                if(!beField.many) {
                    childObj[yupFieldNameList[1]] = yupValidationObj;
                } else {
                    childObj[yupFieldNameList[1]] = Yup.object().shape({ item: yupValidationObj });
                }
                fieldYupObj[yupFieldNameList[0]] = Yup.object().shape(childObj);
            } else {
                if(!beField.many) {
                    fieldYupObj[yupFieldName] = yupValidationObj;
                } else {
                    fieldYupObj[yupFieldName] = Yup.object().shape({ item: yupValidationObj });
                }
            }
        }
    };

    const getYupValidationObj = (beField) => {
        if(beField.dataType === DATA_TYPES.DECIMAL) {
            beField.dataType = beField.fractionDigits > 0 ? DATA_TYPES.DECIMAL : DATA_TYPES.INTEGER;
        }
        let yupValidationObj = null;
        if (getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED) ||
            getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED)
        ) {
            let yupSchemas = [];
            yupSchemas.push(defineRequiredFieldValidation(beField.dataType, beField, `${translate("BE_FORM_ERROR_FIELD_REQUIRED", {
                FIELD_LABEL: `${beField.label}`
            })}`));
            switch (beField.dataType) {
                case DATA_TYPES.STRING:
                    yupSchemas.push(Yup.string());
                    yupSchemas.push(defineFieldMaxLengthValidation(DATA_TYPES.STRING, beField, `${translate("BE_FORM_ERROR_MAX_LENGTH", {
                        FIELD_LABEL: `${beField.label}`,
                        FIELD_LENGTH: `${beField.length}`,
                    })}`));
                    break;
                case DATA_TYPES.HYPERLINKTEXT:
                    yupSchemas.push(Yup.string());
                    yupSchemas.push(defineFieldMaxLengthValidation(DATA_TYPES.STRING, beField, `${translate("BE_FORM_ERROR_MAX_LENGTH", {
                        FIELD_LABEL: `${beField.label}`,
                        FIELD_LENGTH: `${beField.length}`,
                    })}`));
                    break;
                case DATA_TYPES.INTEGER:
                    yupSchemas.push(Yup.number());
                    yupSchemas.push(Yup.number()
                        .integer(`${translate("BE_FORM_ERROR_INVALID_DATA_TYPE", { DATA_TYPE: `${DATA_TYPES.INTEGER}` })}`)
                        .typeError(`${translate("BE_FORM_ERROR_INVALID_DATA_TYPE", { DATA_TYPE: `${DATA_TYPES.INTEGER}` })}`));
                    break;
                case DATA_TYPES.IMAGE_URL:
                    yupSchemas.push(Yup.string());
                    yupSchemas.push(defineFieldMaxLengthValidation(DATA_TYPES.STRING, beField, `${translate("BE_FORM_ERROR_MAX_LENGTH", {
                        FIELD_LABEL: `${beField.label}`,
                        FIELD_LENGTH: `${beField.length}`,
                    })}`));
                    yupSchemas.push(Yup.string().url(`${translate("BE_FORM_ERROR_INVALID_URL")}`));
                    break;
                case DATA_TYPES.DECIMAL:
                    yupSchemas.push(Yup.string());
                    yupSchemas.push(Yup.string()
                        .test("isValidDecimal",
                            `${translate("BE_FORM_ERROR_INVALID_DATA_TYPE", { DATA_TYPE: `${DATA_TYPES.DECIMAL}` })}`,
                            (decimalValue) => {
                                if (!decimalValue) {
                                    return true;
                                }
                                let isInputValid = true;
                                try {
                                    isInputValid = /^[0-9][0-9]{0,}(\.[0-9]+){1,1}$/.test(decimalValue);
                                } catch (err) {
                                    isInputValid = false;
                                }
                                return isInputValid;
                            })
                        .typeError(`${translate("BE_FORM_ERROR_INVALID_DATA_TYPE", { DATA_TYPE: `${DATA_TYPES.DECIMAL}` })}`),
                    );
                    break;
                case DATA_TYPES.DATE:
                    yupSchemas.push(Yup.date());
                    yupSchemas.push(
                        Yup.date().test("format", "", function (inputDate) {
                            if (!inputDate) {
                                return true;
                            }
                            let value = moment(new Date(inputDate), dateFormat);
                            return !!value.isValid();
                        }).typeError(`${translate("BE_FORM_ERROR_INVALID_DATE")}`),
                    );
                    break;
                case DATA_TYPES.BOOLEAN:
                    yupSchemas.push(Yup.mixed());
                    break;
                case DATA_TYPES.FILE_ATTACHMENT:
                    yupSchemas.push(Yup.string());
                    break;
                case DATA_TYPES.LOOKUP:
                    yupSchemas.push(Yup.string());
                    break;
                default:
                    yupSchemas.push(Yup.mixed().notRequired());
                    break;
            }
            yupValidationObj = getYupSchema(yupSchemas);
        }
        return yupValidationObj;
    };

    const updateBEDataFields = (fieldName, updatedObject, updateFormikProps, formikProps) => {
        let newObj = (formikProps && formikProps.values) ? { ...formikProps.values } : { ...updatedBEData };
        setFieldValue(newObj, fieldName, updatedObject);
        if (updateFormikProps && formikProps) {
            formikProps.setFieldValue(fieldName, updatedObject);
        }
        updateBEData(newObj);
    };

    const beFormCancelHandler = (props) => {
        setFormDisabled(true);
        let beDataObj = beData ? JSON.parse(JSON.stringify(beData)) : {};

        // For required check validation of root fields, also added in useEffect()
        beMeta.hasOwnProperty("beFormSections") && Array.isArray(beMeta.beFormSections)
        && beMeta.beFormSections.forEach((beSection) => {
            if (beSection.beFormFields && Array.isArray(beSection.beFormFields)) {
                beSection.beFormFields.forEach((beField) => {
                    if(beField.required && !beField.many && typeof(beDataObj[beField.name]) === "undefined") {
                        if(beField.dataType === DATA_TYPES.LOOKUP) {
                            beDataObj[beField.name] = {};
                        } else {
                            beDataObj[beField.name] = "";
                        }
                    }
                    if(beField.required && beField.many && beField.sectionError) {
                        delete beField.sectionError;
                    }
                });
            }
        });
        updateBEData(beDataObj);
        props.resetForm();
    };

    const enrichFieldData = (formikProps, beFieldMeta, enrichedFieldData, fieldName, rowIndex) => {

        let rootEnrichedData = enrichedFieldData[beFieldMeta.configName][beFieldMeta.name].item[0];
        let rootFieldName = `${ONE_TO_MANY.DATA_KEY}.${beFieldMeta.name}.item[${rowIndex}]`;

        if(beFieldMeta && beFieldMeta.beFormFields && Array.isArray(beFieldMeta.beFormFields)) {
            beFieldMeta.beFormFields.forEach(({ name, many }) => {
                if(!many && rootEnrichedData[name]) {
                    formikProps.setFieldValue(`${rootFieldName}.${name}`, rootEnrichedData[name]);
                }
            });
        }
    };

    /* WILL USED AFTER DROPLET DROPDOWN ISSUE IS FIXED
    const enrichFieldData = (formikProps, beFieldMeta, enrichedFieldData, fieldName, rowIndex) => {

        let rootEnrichedData = enrichedFieldData[beFieldMeta.configName][beFieldMeta.name].item[0];
        let rootFieldName = `${ONE_TO_MANY.DATA_KEY}.${beFieldMeta.name}.item[${rowIndex}]`;

        if(beFieldMeta && beFieldMeta.beFormFields && Array.isArray(beFieldMeta.beFormFields)) {
            beFieldMeta.beFormFields.forEach(({ name, dataType, many, lookup }) => {
                if(!many && rootEnrichedData[name]) {
                    if(dataType === DATA_TYPES.LOOKUP && lookup && lookup.key && rootEnrichedData[name][lookup.key]) {
                        formikProps.setFieldValue(`${rootFieldName}.${name}.${lookup.key}`, rootEnrichedData[name][lookup.key]);
                    } else {
                        formikProps.setFieldValue(`${rootFieldName}.${name}`, rootEnrichedData[name]);
                    }
                }
            });
        }
    };*/

    const filterDataBasedOnFieldName = (fieldData, fieldName, rowIndex) => {

        let initialData = JSON.parse(JSON.stringify(fieldData));
        let fields = fieldName.split(".");
        let finalObject = {};
        let tempFinalObject = finalObject;

        for(let field of fields) {
            tempFinalObject[field] = {};
            tempFinalObject = tempFinalObject[field];
            initialData = initialData[field];
        }
        tempFinalObject.item = [];
        tempFinalObject.item.push(initialData.item[rowIndex]);

        for(let fieldDatum of Object.keys(fieldData)) {
            if(fieldDatum !== ONE_TO_MANY.DATA_KEY) {
                finalObject[fieldDatum] = fieldData[fieldDatum];
            }
        }
        return finalObject;
    };

    const invokeDataValidationAndEnrichment = (beFieldMeta, formikProps, fieldName, rowIndex) => {

        let dataToValidate = filterDataBasedOnFieldName(formikProps.values, fieldName, rowIndex);
        let oneToManyGroupItems = null;

        if (dataToValidate[ONE_TO_MANY.DATA_KEY]) {
            oneToManyGroupItems = JSON.parse(JSON.stringify(dataToValidate.OneToManyGroup));
            dataToValidate.OneToManyGroup = null;
            delete dataToValidate.OneToManyGroup;
        }
        let objDiff = getObjectDiff(beData ? beData : {}, dataToValidate);
        let originalData = create$Original(objDiff, beData ? beData : {});
        if (!skipOriginalCreation && originalData) {
            dataToValidate[ONE_TO_MANY.ORIGINAL] = originalData;
        }
        if (oneToManyGroupItems) {
            populateOneToManyGroup(oneToManyGroupItems, dataToValidate);
        }
        if(typeof validateData === "function") {
            let groupErrorKey = `${fieldName}_${rowIndex}`;

            const onValidationSuccess = (responseData) => {
                setGroupValidationErrors(prevGroupErrors => {
                    let finalGroupError = JSON.parse(JSON.stringify(prevGroupErrors));
                    finalGroupError[groupErrorKey] = true;
                    return finalGroupError;
                });
                enrichFieldData(formikProps, beFieldMeta, responseData, fieldName, rowIndex);
            };
            const onValidationFailure = (errorResponse) => {
                showValidationErrorFields(errorResponse, formikProps, fieldName, rowIndex);
            };
            validateData(dataToValidate, onValidationSuccess, onValidationFailure);
        }
    };

    const handleDataValidation = (beFieldMeta, formikProps, fieldName, rowIndex) => {

        let fields = fieldName.split(".");
        let formikFieldData = JSON.parse(JSON.stringify(formikProps.values));
        let hasFieldData = true;

        for(let field of fields) {
            if(formikFieldData[field]) {
                formikFieldData = formikFieldData[field];
            } else {
                hasFieldData = false;
            }
        }
        if(hasFieldData && formikFieldData.item && formikFieldData.item[rowIndex]) {
            formikProps.validateForm()
                .then((formikErrors) => {
                    let formikErrorsCopy = JSON.parse(JSON.stringify(formikErrors));

                    for(let index = 0; index < Object.keys(fields).length; index++) {
                        if(formikErrorsCopy[fields[index]]) {
                            formikErrorsCopy = formikErrorsCopy[fields[index]];
                        } else {
                            formikErrorsCopy = undefined;
                            break;
                        }
                    }
                    if(formikErrorsCopy && formikErrorsCopy.item && formikErrorsCopy.item[rowIndex]) {
                        for(let errorField of Object.keys(formikErrorsCopy.item[rowIndex])) {
                            if(typeof formikErrorsCopy.item[rowIndex][errorField] === 'object') {
                                let childFields = Object.keys(formikErrorsCopy.item[rowIndex][errorField]);
                                if(childFields && childFields.length === 1) {
                                    formikProps.setFieldTouched(`${fieldName}.item[${rowIndex}].${errorField}.${childFields[0]}`, true, true);
                                }
                            } else {
                                formikProps.setFieldTouched(`${fieldName}.item[${rowIndex}].${errorField}`, true, true);
                            }
                        }
                        let groupErrorKey = `${fieldName}_${rowIndex}`;
                        setGroupValidationErrors(prevGroupErrors => {
                            let finalGroupError = JSON.parse(JSON.stringify(prevGroupErrors));
                            finalGroupError[groupErrorKey] = false;
                            return finalGroupError;
                        });
                    } else {
                        invokeDataValidationAndEnrichment(beFieldMeta, formikProps, fieldName, rowIndex);
                    }
                });
        } else if(hasFieldData && formikFieldData.item) {
            let rootField = `${fieldName}.item[${rowIndex}]`;
            formikProps.setFieldValue(rootField, {});

            if(beFieldMeta && beFieldMeta.beFormFields) {
                beFieldMeta.beFormFields.forEach(({ name, many }) => {
                    if(!many) {
                        formikProps.setFieldTouched(`${rootField}.${name}`, true, true);
                    }
                });
            }
        }
    };


    const handleBeFormSave = (values, actions) => {
       
        let newValue = JSON.parse(JSON.stringify(values));

        let oneToManyGroupItems = null;
        if (newValue[ONE_TO_MANY.DATA_KEY]) {
            oneToManyGroupItems = JSON.parse(JSON.stringify(newValue.OneToManyGroup));
            newValue.OneToManyGroup = null;
            delete newValue.OneToManyGroup;
        }
        let objDiff = getObjectDiff(beData ? beData : {}, newValue);
        let originalData = create$Original(objDiff, beData ? beData : {});
        if (!skipOriginalCreation && originalData) {
            newValue[ONE_TO_MANY.ORIGINAL] = originalData;
        }
        if (oneToManyGroupItems) {
            populateOneToManyGroup(oneToManyGroupItems, newValue);
        }
        const onSaveSuccess = () => {
            if (mode !== MODES.EDIT_ONLY && mode !== MODES.EDIT_AUTO_SAVE) {
                setFormDisabled(true);
            }
            editStatusAction(false);
        };
        const onSaveFailure = (errorResponse) => {
            if(errorResponse && Array.isArray(errorResponse)) {
                showFullValidationErrorFields(errorResponse, actions);
            }
            editStatusAction(false);
        };
        
        let isOnSave = true;
        if(!validateMandatorySection(values,isOnSave)){
            onSave(newValue, actions, onSaveSuccess, onSaveFailure);
        }
    };

    const validateMandatorySection = (values,actionType,touchedFields) => {
        let sectionErrorStatus = false;
        let isRequiredSectionMissing = false;
        let emptyField = false;
        if (beMeta.hasOwnProperty("beFormSections") && Array.isArray(beMeta.beFormSections)) {
            beMeta.beFormSections.forEach((section) => {
                section.beFormFields.forEach((field)=> {
                    if(field.required === true && field.beFormFields && field.beFormFields.length > 0 && 
                        ( actionType  || (touchedFields && touchedFields.OneToManyGroup !== undefined && 
                            touchedFields.OneToManyGroup.hasOwnProperty(field.name))) ) {
                        field.sectionError = null;
                        if(values && values.OneToManyGroup !== undefined && values.OneToManyGroup[field.name] !== "" && 
                            values.OneToManyGroup[field.name]) {
                            if(typeof values.OneToManyGroup[field.name].item !== undefined &&
                                values.OneToManyGroup[field.name].item.length !== 0) {
                                field.beFormFields.forEach((validateField)=> {
                                    const fieldName = validateField.name;
                                    values.OneToManyGroup[field.name].item.forEach((formikField)=>{
                                        if(formikField[fieldName] !== undefined && formikField[fieldName] !== ""){
                                            emptyField = true;
                                            sectionErrorStatus = false;
                                            field.sectionError = null;
                                        }else if(!emptyField){
                                            sectionErrorStatus = true;
                                            isRequiredSectionMissing = true;
                                        }   
                                    });
                                });
                                if(sectionErrorStatus){
                                    field.sectionError = translate("ERROR_ONE_TO_MANY_SECTION_EMPTY", { SECTION_NAME: `${field.label}` })
                                   if(actionType){
                                        dispatchAppNotification(translate("ERROR_ONE_TO_MANY_SECTION_EMPTY", { SECTION_NAME: `${field.label}` }),NOTIFICATION_ERROR);
                                   }
                                }
                            }else{
                                sectionErrorStatus = true;
                                isRequiredSectionMissing = true;
                                field.sectionError = translate("ERROR_ONE_TO_MANY_SECTION_EMPTY", { SECTION_NAME: `${field.label}` })
                                if(actionType){
                                    dispatchAppNotification(translate("ERROR_ONE_TO_MANY_SECTION_EMPTY", { SECTION_NAME: `${field.label}` }),NOTIFICATION_ERROR);
                                }
                            }
                        }else if(values && (values[field.name] === undefined || 
                                typeof values[field.name].item === undefined || 
                                values[field.name].item.length === 0)){ 
                                    sectionErrorStatus = true;
                                    isRequiredSectionMissing = true;
                                    field.sectionError = translate("ERROR_ONE_TO_MANY_SECTION_EMPTY", { SECTION_NAME: `${field.label}` })
                                    if(actionType){
                                        dispatchAppNotification(translate("ERROR_ONE_TO_MANY_SECTION_EMPTY", { SECTION_NAME: `${field.label}` }),NOTIFICATION_ERROR);
                                    }
                        } 
                    }
                });
            });
        }
        return isRequiredSectionMissing;
    }
  
    const getUpdatedValues = ({values,touched}) => {
        let isOnSave = false;
        validateMandatorySection(values, isOnSave, touched);
    };


    const getFormikFieldName = (errorFields, rowIndex) => {

        let formikFieldKey = "";
        let errorFieldsCopy = JSON.parse(JSON.stringify(errorFields));

        if(errorFieldsCopy.length > 1) {
            if(errorFieldsCopy[0] === beMeta.configName) {
                errorFieldsCopy.shift();
            }

            if(errorFieldsCopy[0].includes('[') && errorFieldsCopy[0].includes(']')) {
                formikFieldKey = ONE_TO_MANY.DATA_KEY;
            }

            for(let i=0; i<errorFieldsCopy.length; i++) {
                if(errorFieldsCopy[i].includes('[') && errorFieldsCopy[i].includes(']')) {
                    let formikFieldChildKey = errorFieldsCopy[i].slice(0, errorFieldsCopy[i].indexOf("["));
                    let formikFieldChildItemIndex = errorFieldsCopy[i].substring(
                        errorFieldsCopy[i].lastIndexOf("[") + 1,
                        errorFieldsCopy[i].lastIndexOf("]")
                    );
                    formikFieldChildItemIndex = rowIndex ? rowIndex : formikFieldChildItemIndex;
                    formikFieldKey = `${formikFieldKey}.${formikFieldChildKey}.item[${formikFieldChildItemIndex}]`;
                }else {
                    if(formikFieldKey === "") {
                        formikFieldKey = `${formikFieldKey}${errorFieldsCopy[i]}`;
                    } else {
                        formikFieldKey = `${formikFieldKey}.${errorFieldsCopy[i]}`;
                    }
                }
            }
        }
        return formikFieldKey;
    };

    const getFormikRootFieldName = (errorFields, rowIndex) => {

        let rootformikFieldKey = "";
        let errorFieldsCopy = JSON.parse(JSON.stringify(errorFields));

        if(errorFieldsCopy.length > 1) {
            if(errorFieldsCopy[0] === beMeta.configName) {
                rootformikFieldKey = errorFieldsCopy[0];
                errorFieldsCopy.shift();
            }
            if(errorFieldsCopy[0].includes('[') && errorFieldsCopy[0].includes(']')) {
                rootformikFieldKey = ONE_TO_MANY.DATA_KEY;
                let formikFieldChildKey = errorFieldsCopy[0].slice(0, errorFieldsCopy[0].indexOf("["));
                let formikFieldChildItemIndex = errorFieldsCopy[0].substring(
                    errorFieldsCopy[0].lastIndexOf("[") + 1,
                    errorFieldsCopy[0].lastIndexOf("]")
                );
                formikFieldChildItemIndex = rowIndex ? rowIndex : formikFieldChildItemIndex;
                rootformikFieldKey = `${rootformikFieldKey}.${formikFieldChildKey}.item[${formikFieldChildItemIndex}]`;
            }
        }
        return rootformikFieldKey;
    };

    const isOneToManyFieldError = (formikFieldKey, fieldName, rowIndex) => {
        let fullFieldName = `${fieldName}.item[${rowIndex}]`;
        return formikFieldKey.includes(fullFieldName);
    };

    const showValidationErrorFields = (errorDetails, formikActions, fieldName, rowIndex) => {

        let hasOneToManyFieldError = false;

        if(errorDetails && Array.isArray(errorDetails)) {
            let rootFieldKeys = {};
            errorDetails.forEach(errorData => {
                if(errorData.field && Array.isArray(errorData.field)) {
                    if (errorData.field.length > 0) {

                        let formikRootFieldKeys = getFormikRootFieldName(errorData.field[0].split("."), rowIndex);
                        if(rootFieldKeys[formikRootFieldKeys]) {
                            rootFieldKeys[formikRootFieldKeys] = `${rootFieldKeys[formikRootFieldKeys]}, ${errorData.message}`;
                        } else {
                            rootFieldKeys[formikRootFieldKeys] = errorData.message;
                        }
                        for(let errorFieldInfo of errorData.field) {
                            let fieldNames = errorFieldInfo.split(".");
                            let formikFieldKey = getFormikFieldName(fieldNames, rowIndex);

                            formikActions.setFieldTouched(formikFieldKey, true, false);
                            formikActions.setFieldError(formikFieldKey, errorData.message || translate("ERROR_FIELD_VALIDATION"));

                            if(!hasOneToManyFieldError && isOneToManyFieldError(formikFieldKey, fieldName, rowIndex)) {
                                hasOneToManyFieldError = true;
                            }
                        }
                    }
                } else {
                    formikActions.setFieldError(`rootError`, errorData.message);
                }
            });
            for(let fieldKey of Object.keys(rootFieldKeys)) {
                if(beMeta.configName === fieldKey) {
                    formikActions.setFieldTouched(`rootError`, true, false);
                    formikActions.setFieldError(`rootError`, rootFieldKeys[fieldKey]);

                } else {
                    formikActions.setFieldTouched(`${fieldKey}.rootError`, true, false);
                    formikActions.setFieldError(`${fieldKey}.rootError`, rootFieldKeys[fieldKey]);
                }
            }
        }
        let groupErrorKey = `${fieldName}_${rowIndex}`;
        if(hasOneToManyFieldError) {
            setGroupValidationErrors(prevGroupErrors => {
                let finalGroupError = JSON.parse(JSON.stringify(prevGroupErrors));
                finalGroupError[groupErrorKey] = false;
                return finalGroupError;
            });
        } else {
            setGroupValidationErrors(prevGroupErrors => {
                let finalGroupError = JSON.parse(JSON.stringify(prevGroupErrors));
                finalGroupError[groupErrorKey] = true;
                return finalGroupError;
            });
        }
    };

    const showFullValidationErrorFields = (errorDetails, formikActions) => {

        if(errorDetails && Array.isArray(errorDetails)) {
            let rootFieldKeys = {};
            errorDetails.forEach(errorData => {
                if(errorData.field && Array.isArray(errorData.field)) {

                    let formikRootFieldKeys = getFormikRootFieldName(errorData.field[0].split("."));
                    if(rootFieldKeys[formikRootFieldKeys]) {
                        rootFieldKeys[formikRootFieldKeys] = `${rootFieldKeys[formikRootFieldKeys]}, ${errorData.message}`;
                    } else {
                        rootFieldKeys[formikRootFieldKeys] = errorData.message;
                    }
                    if (errorData.field.length > 0) {
                        for(let errorFieldInfo of errorData.field) {
                            let fieldNames = errorFieldInfo.split(".");
                            let formikFieldKey = getFormikFieldName(fieldNames);

                            formikActions.setFieldTouched(formikFieldKey, true, false);
                            formikActions.setFieldError(formikFieldKey, errorData.message || translate("ERROR_FIELD_VALIDATION"));
                        }
                    }
                } else {
                    formikActions.setFieldError(`rootError`, errorData.message);
                }
            });
            for(let fieldKey of Object.keys(rootFieldKeys)) {
                if(beMeta.configName === fieldKey) {
                    formikActions.setFieldTouched(`rootError`, true, false);
                    formikActions.setFieldError(`rootError`, rootFieldKeys[fieldKey]);

                } else {
                    formikActions.setFieldTouched(`${fieldKey}.rootError`, true, false);
                    formikActions.setFieldError(`${fieldKey}.rootError`, rootFieldKeys[fieldKey]);
                }
            }
        }
    };

    const populateOneToManyGroup = (oneToManyGroupItems, newValue) => {

        if (!oneToManyGroupItems) return;
        let oneToManyKeys = Object.keys(oneToManyGroupItems);

        for (let i = 0; i < oneToManyKeys.length; i++) {
            let manyItem = oneToManyGroupItems[oneToManyKeys[i]];
            populateOneToManyGroupItems(manyItem, newValue, oneToManyKeys[i]);
        }
    };

    const populateOneToManyGroupItems = (manyItem, newValue, key, isChild) => {

        let itemLength = manyItem.item ? manyItem.item.length : 0;
        //To update existing and add new items
        for (let j = 0; j < itemLength; j++) {
            let itemObj = manyItem.item[j];
            if(itemObj) {
                let itemObjKeys = Object.keys(itemObj);
                let oneToManyFieldKeys = [];

                //To find oneTomany children and grand children
                for (let k = 0; k < itemObjKeys.length; k++) {
                    let oneToManyGroupItemChild = null;
                    if (itemObj[itemObjKeys[k]] && itemObj[itemObjKeys[k]][ONE_TO_MANY.ORIGINAL_COPY]) {
                        oneToManyGroupItemChild = itemObj[itemObjKeys[k]];
                        oneToManyFieldKeys.push(itemObjKeys[k]);
                    }
                    if (oneToManyGroupItemChild) {
                        populateOneToManyGroupItems(oneToManyGroupItemChild, itemObj, itemObjKeys[k], true);
                        itemObj[itemObjKeys[k]][ONE_TO_MANY.ORIGINAL_COPY] = null;
                        delete itemObj[itemObjKeys[k]][ONE_TO_MANY.ORIGINAL_COPY];
                    }
                }
                let originalObject = (manyItem[ONE_TO_MANY.ORIGINAL_COPY])
                    ? getMatchingItemFromList(itemObj, manyItem[ONE_TO_MANY.ORIGINAL_COPY].item, ONE_TO_MANY.ROW_ID_KEY)
                    : null;

                if (!originalObject) {
                    if (!newValue[key]) {
                        newValue[key] = {};
                    }
                    let manyObj = newValue[key];

                    if (!skipOriginalCreation) {
                        if (!manyObj[ONE_TO_MANY.ORIGINAL]) {
                            manyObj[ONE_TO_MANY.ORIGINAL] = { item: [] };
                        }
                        let manyObjOrgItem = manyObj[ONE_TO_MANY.ORIGINAL].item;
                        manyObjOrgItem.push(null);
                    }
                    if (!manyObj.item) {
                        manyObj.item = [];
                    }
                    if (!isChild) {
                        let itemRowObj = { ...itemObj };
                        manyObj.item.push(itemRowObj);
                    }
                } else {
                    let objDiffMany = getObjectDiff(originalObject, itemObj);
                    let originalDataMany = create$Original(objDiffMany, originalObject);

                    if (originalDataMany) {
                        if (oneToManyFieldKeys.length > 0) {
                            oneToManyFieldKeys.forEach((fieldKey) => {
                                    delete originalDataMany[fieldKey];
                                }
                            );
                        }
                        if (!newValue[key]) {
                            newValue[key] = {};
                        }
                        let manyObj = newValue[key];

                        if (!skipOriginalCreation) {
                            if (!manyObj[ONE_TO_MANY.ORIGINAL]) {
                                manyObj[ONE_TO_MANY.ORIGINAL] = { item: [] };
                            }
                            let manyObjOrgItem = manyObj[ONE_TO_MANY.ORIGINAL].item;
                            manyObjOrgItem.push({});
                        }
                        if (!manyObj.item) {
                            manyObj.item = [];
                        }
                        if (!isChild) {
                            let itemRowObj = { ...itemObj };
                            if (!skipOriginalCreation) {
                                itemRowObj[ONE_TO_MANY.ORIGINAL] = originalDataMany;
                            }
                            manyObj.item.push(itemRowObj);
                        } else {
                            if (!skipOriginalCreation) {
                                itemObj[ONE_TO_MANY.ORIGINAL] = originalDataMany;
                            }
                        }
                    }
                }
            }
        }
        if (manyItem[ONE_TO_MANY.ORIGINAL_COPY] && manyItem[ONE_TO_MANY.ORIGINAL_COPY].item) {
            //To handle deleted items
            let deletedItems = getDeletedOneToManyItems(manyItem[ONE_TO_MANY.ORIGINAL_COPY].item, manyItem.item);
            for (let l = 0; l < deletedItems.length; l++) {
                if (!newValue[key]) {
                    newValue[key] = {};
                }
                let manyObj = newValue[key];
                if (!skipOriginalCreation) {

                    if (!manyObj[ONE_TO_MANY.ORIGINAL]) {
                        manyObj[ONE_TO_MANY.ORIGINAL] = { item: [] };
                    }
                    let manyObjOrgItem = manyObj[ONE_TO_MANY.ORIGINAL].item;
                    manyObjOrgItem.push(deletedItems[l]);
                }
                if (!manyObj.item) {
                    manyObj.item = [];
                }
                manyObj.item.push(null);
            }
        }
    };

    
    const dispatchCloseDialog = () => {
        switch (type) {
            case LOG_OUT: editStatusAction(false, "", false, type);
                break;
            default:editStatusAction(false);
                    if(nextPageID !== null || nextPageID !== undefined){
                        history.push(nextPageID);
                    }
        }
    };

    const cancelConfirmationMessageBox = (props) => {
        return (
            <MessageBox
                type="warning"
                title={translate("BE_FORM_CANCEL_CONFIRMATION_TITLE")}
                data-testid="be_form_cancel_box"
                {...messageBox}
            >
                <MessageBox.Content data-testid="be_form_cancel_box_content">
                    <div className="beform__content__header">
                        <img src={ALERT} alt={translate("LABEL_ALERT_ICON")} className="beform__cancel__alert__icon" /> 
                        <span className="beform__cancel__message__title">{translate("BE_FORM_CANCEL_CONFIRMATION_MESSAGE")}</span>
                    </div>
                    <p className="beform__cancel__message__body">{translate("BE_FORM_CANCEL_CONFIRMATION_MESSAGE_BODY")}</p>
                </MessageBox.Content>
                <MessageBox.Footer data-testid="be_form_cancel_box_footer">
                            <Button
                                data-testid="be_form_cancel_box_cancel_button"
                                onClick={() => {
                                    messageBox.close();
                                    editStatusAction(true);
                                }}>
                                {translate("BE_FORM_LABEL_CANCEL")}
                            </Button>
                            <Button
                                data-testid="be_form_cancel_box_discard_button"
                                onClick={() => {
                                    messageBox.close();
                                    beFormCancelHandler(props);
                                    dispatchCloseDialog();
                                }}
                                variant="primary">
                                {translate("BE_FORM_LABEL_DISCARD")} 
                            </Button>
                </MessageBox.Footer>
            </MessageBox>
        );
    };


    const getBEFormButton = (type, handler) => {
        let beFormButton;
        switch (type) {
            case "SAVE":
                const displaySaveButton = !formDisabled && mode !== MODES.EDIT_AUTO_SAVE;
                if (displaySaveButton && (getObjectPropertyValue(beMeta, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED)
                        || getObjectPropertyValue(beMeta, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED) )) {
                    beFormButton = <Button className="be-form-save" variant="primary" data-testid="be_form_save_button"
                        onClick={() => {
                            /** "IF condition" will exectue only for the beFormDynamicFields
                             *  Refer beformDynamicField.js file
                             */
                            if(Object.keys(beFormdynamicFieldFormikProps).length > 0) {
                                beFormdynamicFieldFormikProps.validateForm().then(errors => {
                                    handleFormikErrors({
                                        errors,
                                        setFieldTouched: beFormdynamicFieldFormikProps.setFieldTouched,
                                        handleSubmit: beFormdynamicFieldFormikProps.handleSubmit
                                    });
                                }); 
                            } else {
                                handler.handleSubmit();
                            }                    
                        }}>
                        {translate("BE_FORM_LABEL_SAVE")}
                    </Button>
                }
                break;
            case "EDIT":
                const displayEditButton = formDisabled && mode !== MODES.READ_ONLY && mode !== MODES.EDIT_AUTO_SAVE;

                if (displayEditButton && getObjectPropertyValue(beMeta, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED)) {
                    beFormButton = <Button className="be-form-edit" data-testid="be_form_edit_button"
                        onClick={handler}>
                        {translate("BE_FORM_LABEL_EDIT")}
                    </Button>
                }
                break;
            case "CANCEL":
                const displayCancelButton = !formDisabled && mode !== MODES.EDIT_ONLY && mode !== MODES.EDIT_AUTO_SAVE;
                if (displayCancelButton && getObjectPropertyValue(beMeta, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED)) {
                    beFormButton = <Button className="be-form-cancel" data-testid="be_form_cancel_button"
                        onClick={handler}>
                        {translate("BE_FORM_LABEL_CANCEL")}
                    </Button>
                }
                break;

            default:
                break;
        }
        return beFormButton;
    };

    const getSectionDetails = (beMeta, props) => {
        if (beMeta.hasOwnProperty("beFormSections") && Array.isArray(beMeta.beFormSections)) {
            return <>
                {
                    beMeta.beFormSections.map((section, index) => {
                        return <BEFormSection
                            key={`formSection_${index}`}
                            sectionMetaData={section}
                            beData={updatedBEData}
                            formDisabled={formDisabled}
                            formikProps={props}
                            getLookupHandler={getLookupHandler}
                            fileHandler={fileHandler}
                            dateFormat={dateFormat}
                            maxColumns={maxColumns}
                            dateLocal={dateLocal}
                            metaConfigName={beMeta.configName}
                            updateBEData={updateBEDataFields}
                            handleDataValidation={handleDataValidation}
                            groupValidationErrors={groupValidationErrors}
                            getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                            previewMode={previewMode}
                            setBeFormdynamicFieldFormikProps={setBeFormdynamicFieldFormikProps}
                        />;
                    })
                }
            </>;
        }
    };

    const triggerCancelDialog = () => {
        messageBox.open();
    }

    const renderForm = (formikProps) => {
        if(formikProps.touched && Object.keys(formikProps.touched).length > 0){
            getUpdatedValues(formikProps);
        }
        formikProps.isValid = Object.keys(formikProps.errors).length === 0;
        if (formikProps.isValid !== formValid) {
            setFormValid(formikProps.isValid);
        }                         
        return <>
            {
                visible && messageBox.closed && messageBox.open()
            }
            {
                !messageBox.closed && cancelConfirmationMessageBox(formikProps)
            }
            <form className="form">
                <div className="be-form-header" data-testid="be_form_buttons">
                    {getBEFormButton("EDIT", handleEditClick)}
                    {getBEFormButton("CANCEL", triggerCancelDialog)}
                    {getBEFormButton("SAVE", formikProps)}
                    {
                        (getObjectPropertyValue(beMeta, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED) ||
                            getObjectPropertyValue(beMeta, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED))
                        && <span
                            className={"beForm__save__trigger"}
                            onClick={() => {
                                /** "IF condition" will exectue only for the beFormDynamicFields
                                 *  Refer beformDynamicField.js file
                                 */
                                if(Object.keys(beFormdynamicFieldFormikProps).length > 0) {
                                    beFormdynamicFieldFormikProps.validateForm().then(errors => {
                                        handleFormikErrors({
                                            errors,
                                            setFieldTouched: beFormdynamicFieldFormikProps.setFieldTouched,
                                            handleSubmit: beFormdynamicFieldFormikProps.handleSubmit
                                        });
                                    }); 
                                } else {
                                    formikProps.handleSubmit();
                                } 
                            }}
                            ref={beFormSaveTriggerRef}
                        />
                    }
                </div>
                {/* ADDED */}
                {updatedBEData && updatedBEData.pendingProtected && <div className="beForm_error" data-testid={"rootError"}>	
                    <Form.Group name={"rootError"} key={"root"}>	
                        <Form.Error>{translate("BE_FORM_ROOT_PENDING")}</Form.Error>	
                    </Form.Group>	
                </div>}
                <div className="be-form-group-data">
                    {
                        getSectionDetails(beMeta, formikProps)
                    }
                </div>
            </form>
        </>
    
    }

    return <>
    <Formik
        initialValues= {updatedBEData}
        enableReinitialize= {true}
        onSubmit= {handleBeFormSave}
        validationSchema= {formValidationCreation}
    >
        {(props) => (
            <div>
            { 
                updatedBEData && <div className="be-form-component-container">
                    {renderForm(props)}
                </div>
            }
        </div>)}        
    </Formik>
    </>;
});

BEForm.propTypes = {
    onSave: PropTypes.func.isRequired, //Provides the updated form values for the consumer component to interact with BES
    mode: PropTypes.string,
    beMeta: PropTypes.shape({
        title: PropTypes.string,
        configName: PropTypes.string,
        configType: PropTypes.string,
        maxColumns: PropTypes.number,
        beFormSections: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                beFormFields: PropTypes.arrayOf(
                    PropTypes.shape({
                        name: PropTypes.string,
                        fieldType: PropTypes.string,
                        label: PropTypes.string,
                        dataType: PropTypes.string,
                        length: PropTypes.number,
                        trust: PropTypes.bool,
                        required: PropTypes.bool,
                        readOnly: PropTypes.bool,
                        applyNullValues: PropTypes.boolean,
                        filterable: PropTypes.bool,
                        sortable: PropTypes.bool,
                        lookup: PropTypes.shape({
                            link: PropTypes.arrayOf(
                                PropTypes.shape({
                                    href: PropTypes.string,
                                    rel: PropTypes.string,
                                }),
                            ),
                            key: PropTypes.string,
                            value: PropTypes.string,

                        }),
                        dependents: PropTypes.array,
                        parents: PropTypes.array,
                    }),
                ),
            }),
        ).isRequired,
    }),
    dateFormat: PropTypes.string,
    dateLocal: PropTypes.string,
    maxColumns: PropTypes.number,
    getLookupHandler: PropTypes.func, //For fetching the lookup data
    fileHandler: PropTypes.shape({
        getFileMetadataHandler: PropTypes.func,
        createFileMetadataHandler: PropTypes.func,
        uploadFileContentHandler: PropTypes.func,
        getFileDownloadLinkHandler: PropTypes.func,
    }),
    getOneToManyBEDataHandler: PropTypes.func,
    skipOriginalCreation: PropTypes.bool,
    previewMode: PropTypes.bool
};

BEForm.defaultProps = {
    mode: "READ_EDIT",
    maxColumns: 2,
};

export default BEForm;
