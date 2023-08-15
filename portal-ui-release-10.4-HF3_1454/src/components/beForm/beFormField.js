import React, { useCallback } from "react";
import { Form, Tooltip, IconButton, Input, Dropdown, Checkbox, Radio, Textarea, DateTimePicker } from "@informatica/droplets-core";
import moment from "moment";
import momentLocalizer from "react-widgets-moment";
import { useTranslation } from "react-i18next";
import BEFORM_CONFIG from "./beFormConfig";
import FileUploader from "./upload/fileUploader";
import { getObjectPropertyValue } from "./validations";

import {
    getFieldName,
    getLookupDispalyValue,
    getLookUpRootFieldName,
    getFieldValue,
    formatDateTime,
    updateDateValue,
    renderCustomError
} from "./beFormUtility";

export const BEFormField = ({ beField, beData, formDisabled, formikProps, lookupValueChangeHandler,
    fileHandler, dateFormat, maxColumns, lookupOptionsHandler, index,
    manyDt, locale, view, pendingProtected}) => {

    const { t: translate } = useTranslation();
    const { DATA_TYPES, FIELD_TYPES, VIEW_TYPE, META_KEYS, OPERATIONS } = BEFORM_CONFIG;

    moment.locale(locale);
    momentLocalizer();

    const getFieldMeta = () => {
        let fieldName = getFieldName(beField, manyDt);
        let labelClassName;
        switch (beField.dataType) {
            case DATA_TYPES.IMAGE_URL:
                labelClassName = "be-form-field-image-label ";
                break;
            case DATA_TYPES.FILE_ATTACHMENT:
                labelClassName = "be-form-field-file-label ";
                break;
            default:
                labelClassName = "";
        }
        let displayLabel = !(beField.fieldType === FIELD_TYPES.CHECKBOX && !formDisabled);
        displayLabel = (displayLabel && view === VIEW_TYPE.GRID) ? false : displayLabel;
        const beFormCheckboxLabelLineBreak = beField.fieldType === FIELD_TYPES.CHECKBOX ?  'beform__checkbox__linebreak' : '';

        let fieldErrorMsg = undefined;
        let isFieldTouched = false;
        let fieldValue = undefined;

        if(!formDisabled && formikProps && formikProps.errors) {
            fieldErrorMsg = getFieldValue(formikProps.errors, fieldName);
            if (beField.dataType === DATA_TYPES.LOOKUP) {
                isFieldTouched = getFieldValue(formikProps.touched, getLookUpRootFieldName(beField, manyDt))
                fieldValue = getFieldValue(formikProps.values, getLookUpRootFieldName(beField, manyDt))
            } else {
                isFieldTouched = getFieldValue(formikProps.touched, fieldName);
                fieldValue = getFieldValue(formikProps.values, fieldName);
            }
        }
        let fieldContent = <>
            {
                isFieldTouched && fieldErrorMsg && view === VIEW_TYPE.GRID && !fieldValue
                    ? <Tooltip
                        className="beform__column__error"
                        content={
                            <>
                                <IconButton>
                                    <i className={"aicon aicon__error"} />
                                </IconButton>
                                {fieldErrorMsg}
                            </>
                        }
                    >
                        <div>{getFormikField(fieldName)}</div>
                    </Tooltip>
                    : getFormikField(fieldName)
            }
        </>;
        let className = fieldErrorMsg && isFieldTouched && !fieldValue ? "input__error__box" : "";
        return <>
            {
                ((formDisabled && getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.READ, META_KEYS.ALLOWED))
                    || (!formDisabled && getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED)))
                && 
                <div className={`formik-group-${maxColumns}-column-layout ${className}`}>
                    <Form.Group required={beField.required} key={`${beField.name}_${index}`}  className={`beForm_group ${(formDisabled || beField.isReadOnly) ? '' : beFormCheckboxLabelLineBreak}`} data-testid={beField.label+"_group"}>
                        {displayLabel &&
                            <Form.Label className={labelClassName + ' beForm_label'} data-testid={beField.label+"_label"}>
                                {beField.label}
                            </Form.Label>
                        }
                        {fieldContent}
                        {view !== VIEW_TYPE.GRID && isFieldTouched && fieldErrorMsg && 
                            <div className="beForm_error" data-testid={fieldName+"_error"}>
                                <Form.Error>
                                    {fieldErrorMsg}
                                </Form.Error>
                            </div>
                        }
                    </Form.Group>
                </div>
            }
        </>;
    };

    const getLookupOptions = () => {
        let lookupOptions = lookupOptionsHandler(beField, manyDt);
        if(!beField.required) {
            let emptyOption = lookupOptions.filter(
                lookupOption => lookupOption.text === translate("LABEL_NONE") && !lookupOption.value
            );
            if(emptyOption.length === 0) {
                lookupOptions.unshift({
                    text: translate("LABEL_NONE"),
                    value: undefined
                });
            }
        }
        return lookupOptions;
    };

    const getFieldInViewMode = () => {
        const fieldClassName = "be-form-display-value";

        if (formikProps && formikProps.values) {
            let fieldName = getFieldName(beField, manyDt);
            let fieldVal = getFieldValue(formikProps.values, fieldName);
            fieldVal = fieldVal ? fieldVal : "";

            switch (beField.dataType) {
                case DATA_TYPES.IMAGE_URL:
                    return <div className="be-form-field-image-container">
                        <img className="be-form-field-image-display" alt=""
                            src={fieldVal} />
                    </div>;

                case DATA_TYPES.DATE:
                    fieldVal = formatDateTime(fieldVal, dateFormat);
                    return <div className={fieldClassName}><span>{fieldVal}</span></div>;

                case DATA_TYPES.LOOKUP:
                    fieldVal = getLookupDispalyValue(beField, formikProps.values, manyDt);
                    return <div className={fieldClassName}><span>{fieldVal}</span></div>;

                case DATA_TYPES.FILE_ATTACHMENT:
                    return <FileUploader
                        beField={beField}
                        isReadOnly={beField.isReadOnly}
                        beData={beData}
                        fileHandler={fileHandler}
                        formDisabled={formDisabled}
                        formikProps={formikProps}
                        manyDt={manyDt}
                    />;

                case DATA_TYPES.HYPERLINKTEXT: // ADDED
                    return <div className={fieldClassName}><a href={fieldVal} target="_blank" rel="noopener noreferrer">{fieldVal}</a></div>;

                default:
                    if (beField.fieldType === FIELD_TYPES.CHECKBOX || beField.fieldType === FIELD_TYPES.RADIO_BUTTON) {
                        return <div className={fieldClassName}>
                            <span>{fieldVal ? translate("BE_FORM_LABEL_RADIO_YES") : translate("BE_FORM_LABEL_RADIO_NO")}</span>
                        </div>;
                    }
                    return <div className={fieldClassName}><span>{fieldVal}</span></div>;
            }
        }
        return <div className={fieldClassName} />;
    };

    const lookupChangeHandler = (event) => {
        if(event.text === translate("LABEL_NONE") && !event.value) {
            let fieldName = getFieldName(beField, manyDt);
            fieldName = fieldName.substring(0, fieldName.lastIndexOf("."));
            formikProps.setFieldValue(fieldName, undefined);
        } else {
            lookupValueChangeHandler(beField, event, manyDt);
        }
    };

    const onBlurUpdateFieldValue = useCallback(
        (props, fieldName, isRequired) => {
            if(isRequired) {
                formikProps.setFieldTouched(fieldName, true);
            } else {
                formikProps.setFieldTouched(fieldName, true, false);
            }
          if (props.target.value) {
            formikProps.setFieldValue(fieldName, props.target.value, !!isRequired);
          } else {
            formikProps.setFieldValue(fieldName, undefined, !!isRequired);
          }
        },
        [formikProps],
      );
    
    const onBlurUpdateDropDownFieldValue = useCallback((props, fieldName, isRequired) => {
        if(isRequired) {
            formikProps.setFieldTouched(fieldName, true);
        } else {
            formikProps.setFieldTouched(fieldName, true, false);
        }
        if (props && props.length > 0 && props[0].value) {
            lookupChangeHandler(props[0]);
            formikProps.setFieldValue(fieldName, props[0].value, !!isRequired);
        } else {
            formikProps.setFieldValue(fieldName, undefined, !!isRequired);
        }
    }, [formikProps, lookupChangeHandler])  

    const getFieldInEditMode = (fieldName) => {

        let fieldErrorMsg = getFieldValue(formikProps.errors, fieldName);
        switch (beField.fieldType) {
            case FIELD_TYPES.TEXT_BOX:
                return <Form.Control
                    as={Input}
                    data-testid={fieldName+"_input"}
                    className='beForm_field'
                    variant={fieldErrorMsg ? "error" : ""}
                    defaultValue={getFieldValue(formikProps.values, fieldName)}
                    onBlur={(props) => onBlurUpdateFieldValue(props, fieldName, beField.required)}
                    name={fieldName}
                />;

            case FIELD_TYPES.TEXT_AREA:
                return <Form.Control
                    as={Textarea}
                    data-testid={fieldName+"_input"}
                    className="beForm_field beform__textarea"
                    variant={fieldErrorMsg ? "error" : ""}
                    defaultValue={getFieldValue(formikProps.values, fieldName)}
                    onBlur={(props) => onBlurUpdateFieldValue(props, fieldName, beField.required)}
                    name={fieldName}
                    rows={6}
                />;

            case FIELD_TYPES.CHECKBOX:
                return <Form.Control 
                    as={Checkbox} 
                    data-testid={fieldName+"_input"}
                    variant={fieldErrorMsg ? "error" : ""}
                    onChange={({target})=> formikProps.setFieldValue(fieldName,target.checked)}
                    checked={getFieldValue(formikProps.values, fieldName)}
                    onBlur={formikProps.handleBlur}
                    name={fieldName}
                >
                    {beField.label}
                </Form.Control>;

            case FIELD_TYPES.RADIO_BUTTON:
                return <div className="beForm__radio__group">
                    <Form.Control 
                        name={fieldName} 
                        data-testid={fieldName+"_input"}
                        variant={fieldErrorMsg ? "error" : ""}
                        value={true} 
                        as={Radio}
                        checked={getFieldValue(formikProps.values, fieldName)}
                        onChange={()=> formikProps.setFieldValue(fieldName,true)}
                    >
                        {translate("BE_FORM_LABEL_RADIO_YES")}
                    </Form.Control>
                    <Form.Control 
                        name={fieldName}
                        data-testid={fieldName+"_input"}
                        variant={fieldErrorMsg ? "error" : ""}
                        value={false}
                        as={Radio}
                        checked={!getFieldValue(formikProps.values, fieldName)}
                        onChange={()=> formikProps.setFieldValue(fieldName,false)}
                    >
                        {translate("BE_FORM_LABEL_RADIO_NO")}
                    </Form.Control>
                </div>;
            case FIELD_TYPES.DROPDOWN:
                return <Form.Control as={Dropdown}
                    onChange={event => {
                        lookupChangeHandler(event);
                        formikProps.setFieldValue(fieldName, event.value);
                    }}
                    className={`beForm_field ${fieldErrorMsg ? 'dropdown__field__error' : ''}`}
                    data-testid={fieldName+"_input"}
                    options={getLookupOptions()}
                    name={fieldName}
                    onBlur={(props) => onBlurUpdateDropDownFieldValue(props, fieldName, beField.required)}
                    value={getFieldValue(formikProps.values, fieldName)}
                    search
                />;
            default:
                break;
        }
        switch (beField.dataType) {
            case DATA_TYPES.IMAGE_URL:
                return <Form.Control
                    as={Input}
                    className='beForm_field'
                    variant={fieldErrorMsg ? "error" : ""}
                    data-testid={fieldName+"_input"}
                    value={getFieldValue(formikProps.values, fieldName)}
                    disabled={formDisabled}
                    name={fieldName}
                    onBlur={(props) => onBlurUpdateDropDownFieldValue(props, fieldName, beField.required)}
                />;

            case DATA_TYPES.INTEGER:
            case DATA_TYPES.DECIMAL:
                return <Form.Control
                    as={Input}
                    data-testid={fieldName+"_input"}
                    className='beForm_field'
                    variant={fieldErrorMsg ? "error" : ""}
                    value={getFieldValue(formikProps.values, fieldName)}
                    disabled={formDisabled}
                    name={fieldName}
                    onBlur={(props) => onBlurUpdateDropDownFieldValue(props, fieldName, beField.required)}
                />;

            case DATA_TYPES.DATE:
                return <>
                    <Form.Control as={DateTimePicker}
                        onChange={event => updateDateValue(formikProps, beField, event, manyDt)}
                        className={`beForm_field ${fieldErrorMsg ? 'datepicker__field__error' : ''}`}
                        data-testid={fieldName+"_input"}
                        defaultValue={null}
                        time={false}
                        format={"dd/MM/yyyy"}
                        onBlur={formikProps.handleBlur}
                        name={fieldName}
                        value={formikProps.values && getFieldValue(formikProps.values, fieldName) ? new Date(getFieldValue(formikProps.values, fieldName)) : null}
                    />
                </>;
            case DATA_TYPES.FILE_ATTACHMENT:
                return <>
                    <FileUploader
                        beField={beField}
                        isReadOnly={beField.isReadOnly}
                        beData={beData}
                        fieldErrorMessage={fieldErrorMsg ? "file__upload__field__error" : ""}
                        fileHandler={fileHandler}
                        formDisabled={formDisabled}
                        formikProps={formikProps}
                        manyDt={manyDt}/>
                    {
                        formikProps.errors && formikProps.errors.hasOwnProperty(beField.name)
                        && renderCustomError(formikProps.errors[beField.name])
                    }
                </>;
            default:
                return <Form.Control
                    as={Input}
                    data-testid={fieldName+"_input"}
                    className='beForm_field'
                    variant={fieldErrorMsg ? "error" : ""}
                    value={getFieldValue(formikProps.values, fieldName)}
                    maxLength={beField.length}
                    name={fieldName}
                    onBlur={(props) => onBlurUpdateDropDownFieldValue(props, fieldName, beField.required)}
                />;
        }
    };

    const getFormikField = (fieldName) => {
        return (formDisabled || beField.isReadOnly || pendingProtected) ? getFieldInViewMode() : getFieldInEditMode(fieldName);
    };

    return (getFieldMeta());
};

BEFormField.propTypes = {};

export default BEFormField;
