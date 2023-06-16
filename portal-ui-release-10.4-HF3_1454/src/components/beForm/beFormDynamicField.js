import React, { useEffect, useState } from "react";
import { Form, Dropdown, Input, DateTimePicker } from "@informatica/droplets-core";
import { Field } from "formik";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";
import BEFORM_CONFIG from "./beFormConfig";
import { getObjectPropertyValue } from "./validations";

import {
    formatDateTime,
    getFieldName, getFieldValue,
    getLookupDispalyValue, updateDateValue,
} from "./beFormUtility";
import {useTranslation} from "react-i18next";

export const BeFormDynamicField = ({ beField, formDisabled, formikProps, lookupValueChangeHandler,
    maxColumns, lookupOptions, lookupFullDataSet, dynamicViewProps, refLookupFieldVal, setBeFormdynamicFieldFormikProps,
    referenceLookupField, index, manyDt, locale, dateFormat }) => {

    const { META_KEYS, OPERATIONS, DATA_TYPES } = BEFORM_CONFIG;

    const { t: translate } = useTranslation();
    const [lookupData, setLookupData] = useState(undefined);
    const [formikPropsData, setFormikPropsData] = useState(undefined);
    const [referenceLookupFieldObject, setReferenceLookupFieldObject] = useState(undefined);

    moment.locale(locale);
    momentLocalizer();

    useEffect(() => {
        setLookupData(lookupOptions);
    }, [lookupOptions, lookupFullDataSet]);

    useEffect(() => {
        setFormikPropsData(formikProps);
    }, [formikProps]);

    useEffect(() => {
        setBeFormdynamicFieldFormikProps(formikProps);
    }, [setBeFormdynamicFieldFormikProps]);

    useEffect(() => {
        let refLkpFieldObject = retrieveReferenceLookupObject();
        setReferenceLookupFieldObject(refLkpFieldObject);

    }, [lookupFullDataSet, refLookupFieldVal, refLookupFieldVal]);

    const retrieveReferenceLookupObject = () => {
        if(refLookupFieldVal && referenceLookupField && lookupFullDataSet && Array.isArray(lookupFullDataSet)
            && lookupFullDataSet.length > 0) {
            return lookupFullDataSet.filter(
                lookupFullData => refLookupFieldVal === lookupFullData[referenceLookupField.lookup.key]
            )[0];
        }
    };

    const requiredValidation = value => (value ? undefined : `${translate("BE_FORM_ERROR_FIELD_REQUIRED", { FIELD_LABEL: `${beField.label}` })}`);

    const renderDynamicFormField = () => {
        return <>
            {
                ((formDisabled && getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.READ, META_KEYS.ALLOWED))
                    || (!formDisabled && getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED)))
                && <div className={`formik-group-${maxColumns}-column-layout`}>
                    {
                        renderFormField()
                    }
                </div>
            }
        </>;
    };

    const renderFormField = () => {
        let fieldName = getFieldName(beField, manyDt);
        let required = dynamicViewProps.dynamicFieldMandatoryInd && referenceLookupFieldObject
            && referenceLookupFieldObject[dynamicViewProps.dynamicFieldMandatoryInd];
        required = required ? required === "Y" : beField.required;

        const fieldErrorMsg = getFieldValue(formikProps.errors, fieldName);
        const isFieldTouched = getFieldValue(formikProps.touched, fieldName);
        if (beField.name === dynamicViewProps.referenceLookupField) {
            return (
                <Form.Group required={required} key={`${beField.name}_${index}`} className="beForm_group" data-testid={fieldName+"_group"}>
                    {
                        (formDisabled || beField.isReadOnly) ? getLookupFieldInViewMode() : getLookupFieldInEditMode(fieldName)
                    }
                    {isFieldTouched && fieldErrorMsg &&
                        <div className="beForm_error">
                            <Form.Error>
                                {fieldErrorMsg}
                            </Form.Error>
                        </div>
                    }
                </Form.Group>
            );
        } else if (beField.name === dynamicViewProps.dynamicFieldValue) {
            return (
                <Form.Group required={required} key={`${beField.name}_${index}`} className="beForm_group" data-testid={fieldName+"_group"}>
                    {
                        displayDynamicFieldLabel()
                    }
                    {
                        (formDisabled || beField.isReadOnly) ? getLookupFieldInViewMode() : getLookupFieldInEditMode(fieldName)
                    }
                    {isFieldTouched && fieldErrorMsg &&
                        <div className="beForm_error">
                            <Form.Error>
                                {fieldErrorMsg}
                            </Form.Error>
                        </div>
                    }                    
                </Form.Group>
            );
        }
    };

    const displayDynamicFieldLabel = () => {
        let fieldLabel = dynamicViewProps.dynamicFieldLabel && referenceLookupFieldObject
            && referenceLookupFieldObject[dynamicViewProps.dynamicFieldLabel];

        fieldLabel = fieldLabel ? fieldLabel : beField.label;
        return <Form.Label className='beForm_label' data-testid={fieldLabel+"_label"}>{fieldLabel}</Form.Label>
    };

    const getLookupFieldInViewMode = () => {
        let fieldVal = "";
        if (formikPropsData && formikPropsData.values) {
            if (beField.name === dynamicViewProps.referenceLookupField) {
                fieldVal = getLookupDispalyValue(beField, formikPropsData.values, manyDt);

            } else if(beField.name === dynamicViewProps.dynamicFieldValue) {
                let fieldName = getFieldName(beField, manyDt);

                let dataType = dynamicViewProps.dynamicFieldType && referenceLookupFieldObject
                    && referenceLookupFieldObject[dynamicViewProps.dynamicFieldType];

                fieldVal = getFieldValue(formikPropsData.values, fieldName);

                if(dataType === DATA_TYPES.DATE) {
                    fieldVal = formatDateTime(fieldVal, dateFormat);
                }
            }
            fieldVal = fieldVal ? fieldVal : "";
            return <div className="be-form-display-value"><span>{fieldVal}</span></div>;
        }
    };


    const getLookupFieldInEditMode = (fieldName) => {
        let required = dynamicViewProps.dynamicFieldMandatoryInd && referenceLookupFieldObject
            && referenceLookupFieldObject[dynamicViewProps.dynamicFieldMandatoryInd];
        required = required ? required === "Y" : beField.required;

        if (beField.name === dynamicViewProps.referenceLookupField) {
            return <Field
                        className='beForm_field'
                        name={fieldName}
                        options={lookupData}
                        data-testid={fieldName+"_input"}
                        as={Dropdown}
                        validate={required && requiredValidation}
                        search
                        onChange={event => {
                            formikProps.setFieldValue(fieldName, event.value);
                            lookupValueChangeHandler(beField, event, manyDt);
                        }}
                        onBlur={() => formikProps.setFieldTouched(fieldName, true)}
                    />;
        } else if(beField.name === dynamicViewProps.dynamicFieldValue) {
            let dataType = dynamicViewProps.dynamicFieldType && referenceLookupFieldObject
                && referenceLookupFieldObject[dynamicViewProps.dynamicFieldType];

            switch(dataType) {
                case DATA_TYPES.LOOKUP_FIELD:
                    let loopupOptionText = dynamicViewProps.dynamicFieldValueOptions && referenceLookupFieldObject
                        && referenceLookupFieldObject[dynamicViewProps.dynamicFieldValueOptions];

                    let lookupOptions = [];
                    if(loopupOptionText) {
                        let lookupTexts = loopupOptionText.split(",");
                        lookupTexts.forEach(lookupText => {
                            lookupOptions.push({
                                text: lookupText.slice(1,-1),
                                value: lookupText.slice(1,-1),
                            });
                        });
                    }
                    return <Field
                        className='beForm_field'
                        name={fieldName}
                        options={lookupOptions}
                        data-testid={fieldName+"_input"}
                        validate={required && requiredValidation}
                        as={Dropdown}
                        onBlur={() => formikProps.setFieldTouched(fieldName, true)}
                        onChange={event => formikProps.setFieldValue(fieldName, event.value)}
                    />;
                case DATA_TYPES.DATE:
                    let fieldValue = formikProps.values && getFieldValue(formikProps.values, fieldName)
                        ? new Date(getFieldValue(formikProps.values, fieldName)) : null;
                    return <Field
                            as={DateTimePicker}
                            className='beForm_field'
                            name={fieldName}
                            data-testid={fieldName+"_input"}
                            onChange={event => {
                                formikProps.setFieldValue(fieldName, event.value);
                                updateDateValue(formikProps, beField, event, manyDt);
                            }}
                            defaultValue={null}
                            time={false}
                            format={"dd/MM/yyyy"}
                            value={fieldValue}
                            validate={required && requiredValidation}
                    />;
                default: return <Field
                    className='beForm_field'
                    data-testid={fieldName+"_input"}
                    name={fieldName}
                    validate={required ? requiredValidation : ""}
                    as={Input}
                />;
            }
        }
    };

    return <>
        {
            formikPropsData && dynamicViewProps && <>
                {
                    beField.name === dynamicViewProps.referenceLookupField && lookupData && renderDynamicFormField()
                }
                {
                    beField.name === dynamicViewProps.dynamicFieldValue && renderDynamicFormField()
                }
            </>
        }
    </>;
};

BeFormDynamicField.propTypes = {};
export default BeFormDynamicField;
