import React, { useState, useEffect } from "react";
import information_icon from "@informatica/archipelago-icons/src/icons/information.svg";
import alert_icon from "@informatica/archipelago-icons/src/icons/alert.svg";
import { Form, Section, Tooltip, Checkbox, Radio, Dropdown } from "@informatica/droplets-core";
import { useFormik } from 'formik';
import "./beFormBuilder.css";
import { useTranslation } from "react-i18next";
import BEFORM_BUILDER_CONFIG from "./beFormBuilderConfig";
import { handleBlur } from '../../utils/utilityService';

const BeFormFieldProperties = ({ selectedFormField, updateFormSectionField, currentStep, getLookupTableMetadata }) => {
    const { t: translate } = useTranslation();
    const { ATTRIBUTES, DATA_TYPES, FIELD_TYPES, DATA_TYPE_VALUE } = BEFORM_BUILDER_CONFIG;

    const [selectedField, setSelectedField] = useState({});
    const [referenceLookupField, setReferenceLookupField] = useState(undefined);
    const [lookupColumnOptions, setLookupColumnOptions] = useState(undefined);
    const [childrenOfDynamicViewOn, setChildrenOfDynamicViewOn] = useState(undefined);
    const [manyParents, setManyParents] = useState(undefined);
    const [lookupOptions, setLookupOptions] = useState(undefined);
    const [parentLookupOptions, setParentLookupOptions] = useState(undefined);

    const formikProps = useFormik({
        initialValues: JSON.parse(JSON.stringify(selectedFormField)),
        enableReinitialize: true,
    });

    useEffect(() => {
        setSelectedField({});
    }, [currentStep]);

    useEffect(() => {
        if (selectedFormField && selectedFormField.name) {
            if (selectedFormField.many && selectedFormField.hierarchyName.split(".").length === 1) {
                switch(selectedFormField.fieldType) {
                    case FIELD_TYPES.DYNAMIC_FIELD_VIEW :
                        let manyParentsOptions = constructDynamicViewOnOptions(selectedFormField);
                        setManyParents(manyParentsOptions);
                        if(selectedFormField.dynamicViewOn) {

                            let dynamicViewOnField = {};
                            if(selectedFormField.dynamicViewOn !== selectedFormField.name) {
                                dynamicViewOnField = getChildFromFormField(selectedFormField, selectedFormField.dynamicViewOn);
                            } else {
                                dynamicViewOnField = JSON.parse(JSON.stringify(selectedFormField));
                            }
                            let lookupFields = getChildrenLookupOptionsFromFormField(dynamicViewOnField);
                            setParentLookupOptions(lookupFields);

                            if(selectedFormField.referenceLookupField) {
                                let refLookupField = getChildFromFormField(dynamicViewOnField, selectedFormField.referenceLookupField);
                                setReferenceLookupField(refLookupField);

                                if(selectedFormField.enableDependency) {
                                    let lookupObjectType = refLookupField.metadata.lookup.object;
                                    let lookupOptions = getLookupFieldsOption(selectedFormField, lookupObjectType);
                                    setLookupOptions((lookupOptions && Array.isArray(lookupOptions)) ? lookupOptions : undefined);
                                } else {
                                    setLookupOptions(undefined);
                                }
                                if(selectedFormField.enableDynamicFields) {
                                    let referenceField = updateAndRetrieveReferenceLookupField(
                                        dynamicViewOnField.beFormFields, selectedFormField.referenceLookupField
                                    );
                                    updateLookupColumnOptions(referenceField, false);

                                    let childrenOfDynamicViewOnField = getChildrenOptionsFromFormField(dynamicViewOnField);
                                    setChildrenOfDynamicViewOn(childrenOfDynamicViewOnField);
                                } else {
                                    setLookupColumnOptions(undefined);
                                    setChildrenOfDynamicViewOn(undefined);
                                }
                            } else {
                                setReferenceLookupField(undefined);
                            }
                        } else {
                            setChildrenOfDynamicViewOn(undefined);
                            setLookupOptions(undefined);
                            setLookupColumnOptions(undefined);
                            setReferenceLookupField(undefined);
                            setParentLookupOptions(undefined);
                        }
                        break;
                    case FIELD_TYPES.MULTI_SELECT_VIEW :
                        let fieldOptions = getLookupFieldsOption(selectedFormField);
                        setLookupOptions((fieldOptions && Array.isArray(fieldOptions)) ? fieldOptions : undefined);

                        if(selectedFormField.referenceLookupField) {
                            let referenceField = updateAndRetrieveReferenceLookupField(
                                selectedFormField.beFormFields, selectedFormField.referenceLookupField
                            );
                            updateLookupColumnOptions(referenceField, true);
                        } else {
                            setLookupColumnOptions(undefined);
                            setReferenceLookupField(undefined);
                        }
                        break;
                    default: break;
                }
            }
            setSelectedField(JSON.parse(JSON.stringify(selectedFormField)));
        }
    }, [selectedFormField]);

    const getChildrenOptionsFromFormField = (formField) => {
        if(formField && formField.beFormFields && formField.beFormFields.length) {
            let childFields = formField.beFormFields.filter(beFormField => !beFormField.many);
            return childFields.map(field => ({
                value: field.name,
                text: field.metadata.label
            }));
        }
    };

    const getChildrenLookupOptionsFromFormField = (formField) => {
        if(formField && formField.beFormFields && formField.beFormFields.length) {
            let childFields = formField.beFormFields.filter(
                beFormField => !beFormField.many && beFormField.metadata.dataType === DATA_TYPE_VALUE.LOOKUP
            );
            return childFields.map(field => ({
                value: field.name,
                text: field.metadata.label
            }));
        }
    };

    const getChildFromFormField = (formField, childName) => {
        if(formField && formField.beFormFields && formField.beFormFields.length) {
            let childFields = formField.beFormFields.filter(beFormField => beFormField.name === childName);
            return childFields.length > 0 ? childFields[0] : undefined;
        }
    };

    const updateLookupColumnOptions = (referenceLookupField, skipFields) => {
        if(typeof getLookupTableMetadata === "function") {
            const successHandler = (respData) => {
                if(respData && respData.object && respData.object.field && Array.isArray(respData.object.field)) {
                    let { metadata: { lookup: { key, value }} } = referenceLookupField;
                    let referenceColumns = respData.object.field.filter(fieldData => !fieldData.system);

                    if(skipFields) {
                        referenceColumns = referenceColumns.filter(
                            referenceColumn => referenceColumn.name !== key && referenceColumn.name !== value
                        );
                    }
                    let referenceColumnOptions = referenceColumns.map(fieldData => ({
                        value: fieldData.name,
                        text: fieldData.label,
                    }));
                    setLookupColumnOptions(referenceColumnOptions);
                }
            };
            let lookupFieldName = referenceLookupField.metadata.lookup.object;
            lookupFieldName = lookupFieldName.substring(lookupFieldName.lastIndexOf(".") + 1);
            getLookupTableMetadata(lookupFieldName)
                .then(successHandler)
                .catch(error => { console.log(error) });
        }
    };

    const constructDynamicViewOnOptions = (formField) => {
        if (formField.many && formField.beFormFields && Array.isArray(formField.beFormFields)
            && formField.beFormFields.length > 0) {
            let updatedChildFields = formField.beFormFields.filter(beFormField => beFormField.many);
            updatedChildFields = updatedChildFields.map((beFormField) => {
                return {
                    text: beFormField.metadata.label,
                    value: beFormField.name,
                };
            });
            updatedChildFields.unshift({
                text: formField.metadata.label,
                value: formField.name,
            });
            return updatedChildFields;
        }
    };

    const getLookupFieldsOption = (formField, lookupObjectType) => {
        if (formField.many && formField.beFormFields && formField.beFormFields.length) {
            let updatedChildFields = formField.beFormFields.filter(
                beFormField => !beFormField.many && beFormField.metadata.dataType === "lookup");

            if(lookupObjectType) {
                updatedChildFields = updatedChildFields.filter(
                    beField => (beField.metadata.lookup.object.includes(lookupObjectType))
                );
            }
            return updatedChildFields.map(beFormField => ({
                text: beFormField.metadata.label,
                value: beFormField.name,
            }));
        }
    };

    const updateAndRetrieveReferenceLookupField = (lookupFields, fieldName) => {
        let referenceField = lookupFields.filter(field => field.name === fieldName)[0];
        setReferenceLookupField(referenceField);
        return referenceField;
    };

    const toggleBooleanField = (fieldName) => {
        let selectedBeFormField = JSON.parse(JSON.stringify(selectedField));
        selectedBeFormField[fieldName] = !selectedBeFormField[fieldName];
        updateFormSectionField(selectedBeFormField);
    };

    const toggleRequiredField = () => {
        let selectedBeFormField = JSON.parse(JSON.stringify(selectedField));
        selectedBeFormField.required = !selectedBeFormField.required;
        updateFormSectionField(selectedBeFormField);
    };

    const toggleAlternateFieldView = () => {
        let selectedBeFormField = JSON.parse(JSON.stringify(selectedField));
        selectedBeFormField.enableAlternateView = !selectedBeFormField.enableAlternateView;
        updateFormSectionField(selectedBeFormField);
    };

    const toggleHiddenField = () => {
        let selectedBeFormField = JSON.parse(JSON.stringify(selectedField));
        selectedBeFormField.isHidden = !selectedBeFormField.isHidden;
        updateFormSectionField(selectedBeFormField);
    };

    const toggleReadOnlyField = () => {
        let selectedBeFormField = JSON.parse(JSON.stringify(selectedField));
        selectedBeFormField.isReadOnly = !selectedBeFormField.isReadOnly;
        updateFormSectionField(selectedBeFormField);
    };

    const toggleEnableValidation = () => {
        let selectedBeFormField = JSON.parse(JSON.stringify(selectedField));
        selectedBeFormField.enableValidation = !selectedBeFormField.enableValidation;
        updateFormSectionField(selectedBeFormField);
    };

    const clearFullCustomAttributesOfField = (selectedBeFormField) => {
        let formField = JSON.parse(JSON.stringify(selectedBeFormField));
        formField.dynamicViewOn = undefined;
        formField.referenceLookupField = undefined;
        formField.enableDependency = false;
        formField.dependentLookup = undefined;
        formField.enableDynamicFields = false;
        formField.dynamicFieldLabel = undefined;
        formField.dynamicFieldType = undefined;
        formField.dynamicFieldMandatoryInd = undefined;
        formField.dynamicFieldValueOptions = undefined;
        formField.dynamicFieldValue = undefined;
        return formField;
    };

    const clearCustomAttributesOfField = (selectedBeFormField) => {
        let formField = JSON.parse(JSON.stringify(selectedBeFormField));
        formField.referenceLookupField = undefined;
        formField.enableDependency = false;
        formField.dependentLookup = undefined;
        formField.enableDynamicFields = false;
        formField.dynamicFieldLabel = undefined;
        formField.dynamicFieldType = undefined;
        formField.dynamicFieldMandatoryInd = undefined;
        formField.dynamicFieldValueOptions = undefined;
        formField.dynamicFieldValue = undefined;
        return formField;
    };

    const updateSelectedFormField = (fieldName, fieldValue) => {
        let selectedBeFormField = JSON.parse(JSON.stringify(selectedField));

        if(ATTRIBUTES.FIELD_TYPE === fieldName) {
            selectedBeFormField = clearFullCustomAttributesOfField(selectedBeFormField);
        } else if (ATTRIBUTES.DYNAMIC_FIELD_VIEW_ON === fieldName) {
            selectedBeFormField = clearCustomAttributesOfField(selectedBeFormField);
        }
        selectedBeFormField[fieldName] = fieldValue;
        updateFormSectionField(selectedBeFormField);
    };

    const renderRequiredField = () => (
        <Form.Group className="flex align-items-center">
            <Form.Control
                name="required"
                as={Checkbox}
                className="width-auto"
                disabled={selectedField.metadata.required}
                checked={formikProps.values.required}
                onChange={() => toggleRequiredField()}
            >
                {translate("LABEL_REQUIRED_FIELD")}
            </Form.Control>
            <Tooltip content={translate("LABEL_REQUIRED_FIELD_INFO")}>
                <i className="aicon aicon__help tooltip__icon" />
            </Tooltip>
        </Form.Group>
    );
    
    const renderHiddenField = () => (
        <Form.Group>
            <Form.Control
                name="isHidden"
                as={Checkbox}
                onChange={() => toggleHiddenField()}
                checked={formikProps.values.isHidden}
            >
                {translate("LABEL_HIDDEN_FIELD")}
            </Form.Control>
            
        </Form.Group>
    );

    const renderReadOnlyField = () => (
        <Form.Group>
            <Form.Control
                name="isReadOnly"
                as={Checkbox}
                onChange={() => toggleReadOnlyField()}
                checked={formikProps.values.isReadOnly}
            >
                {translate("LABEL_READ_ONLY_FIELD")}
            </Form.Control>
        </Form.Group>
    );

    const renderEnableAlternateView = () => (
        <Form.Group className="flex align-items-center">
            <Form.Control
                name="enableAlternateView"
                as={Checkbox}
                className="width-auto"
                onChange={() => toggleAlternateFieldView()}
                checked={formikProps.values.enableAlternateView}
            >
                {translate("LABEL_ALTERNALE_FIELD_VIEW")}
            </Form.Control>
            <Tooltip content={translate("LABEL_ALTERNALE_FIELD_VIEW_INFO")}>
                <i className="aicon aicon__help tooltip__icon" />
            </Tooltip>
        </Form.Group>
    );

    const renderEnableValidation = () => (
        <Form.Group className="flex align-items-center">
            <Form.Control
                name="enableValidation"
                as={Checkbox}
                className="width-auto"
                onChange={() => toggleEnableValidation()}
                checked={formikProps.values.enableValidation}
            >
                {translate("LABEL_ENABLE_VALIDATION")}
            </Form.Control>
            <Tooltip content={translate("LABEL_ENABLE_VALIDATION_INFO")}>
                <i className="aicon aicon__help tooltip__icon" />
            </Tooltip>
        </Form.Group>
    );

    const renderDynamicView = () => (<>
        {
            manyParents && manyParents.length > 0 && <>
                <Form.Group required className="form-group">
                    <Form.Label className="form-label">{translate("LABEL_DYNAMIC_VIEW_ON")}</Form.Label>
                    <Form.Control
                        className="form-field"
                        name="dynamicViewOn"
                        as={Dropdown}
                        options={manyParents}
                        value={formikProps.values.dynamicViewOn}
                        onBlur={() => handleBlur(formikProps, 'dynamicViewOn')}
                        onChange={({ value }) => updateSelectedFormField(ATTRIBUTES.DYNAMIC_FIELD_VIEW_ON, value)}
                    />
                </Form.Group>
                <Form.Group required className="form-group">
                    <Form.Label className="form-label">{translate("LABEL_REFERENCE_COLUMN")}</Form.Label>
                    <Form.Control
                        className="form-field"
                        name="referenceLookupField"
                        as={Dropdown}
                        options={parentLookupOptions}
                        value={formikProps.values.referenceLookupField}
                        onChange={({ value }) => updateSelectedFormField(ATTRIBUTES.REFERENCE_LOOKUP_FIELD, value)}
                        onBlur={() => handleBlur(formikProps, 'referenceLookupField')}
                    />
                </Form.Group>
                {
                    referenceLookupField && <>
                        <div>
                            <img src={information_icon} alt="" className="draft__icon"/>
                            { translate("LABEL_KEY_COLUMN") }: { referenceLookupField.metadata.lookup.key },
                            { translate("LABEL_VALUE_COLUMN") }: { referenceLookupField.metadata.lookup.value }
                        </div>
                        <br/>
                        {
                            selectedField.dynamicViewOn !== selectedField.name && <>
                                <Form.Group>
                                    <Form.Control
                                        name="enableDependency"
                                        as={Checkbox}
                                        checked={formikProps.values.enableDependency}
                                        onChange={() => toggleBooleanField(ATTRIBUTES.ENABLE_DEPENDENCY)}
                                    >
                                        {translate("LABEL_ENABLE_DEPENDENCY")}
                                    </Form.Control>
                                </Form.Group>
                                {
                                    selectedField.enableDependency && lookupOptions && lookupOptions.length > 0 && <>
                                        <Form.Group required className="form-group">
                                            <Form.Label className="form-label">{translate("LABEL_DEPENDENT_LOOKUP")}</Form.Label>
                                            <Form.Control
                                                className="form-field"
                                                name="dependentLookup"
                                                as={Dropdown}
                                                value={formikProps.values.dependentLookup}
                                                options={lookupOptions}
                                                onChange={event => updateSelectedFormField(ATTRIBUTES.DEPENDENT_LOOKUP, event.value)}
                                                onBlur={() => handleBlur(formikProps, 'dependentLookup')}
                                            />
                                        </Form.Group>
                                    </>
                                }
                                {
                                    selectedField.enableDependency && lookupOptions && lookupOptions.length === 0 && <div>
                                        <img src={alert_icon} alt="" className="draft__icon"/>
                                        { translate("LABEL_NO_LOOKUP_FIELDS") }
                                    </div>
                                }
                            </>
                        }
                        <Form.Group>
                            <Form.Control
                                name="enableDynamicFields"
                                as={Checkbox}
                                checked={formikProps.values.enableDynamicFields}
                                onChange={() => toggleBooleanField(ATTRIBUTES.ENABLE_DYNAMIC_FIELDS)}
                            >
                                {translate("LABEL_ENABLE_DYNAMIC_FIELD")}
                            </Form.Control>
                        </Form.Group>
                        {
                            selectedField.enableDynamicFields && <>
                                <br/>
                                <p>{ translate("LABEL_SELECT_DYNAMIC_ATTRIBUTES") }</p>
                                <br/>
                                {
                                    lookupColumnOptions && lookupColumnOptions.length > 0 && <>
                                        <Form.Group required className="form-group">
                                            <Form.Label className="form-label">{translate("LABEL_FIELD_LABEL")}</Form.Label>
                                            <Form.Control
                                                className="form-field"
                                                name="dynamicFieldLabel"
                                                value={formikProps.values.dynamicFieldLabel}
                                                as={Dropdown}
                                                options={lookupColumnOptions}
                                                onChange={event => updateSelectedFormField(ATTRIBUTES.DYNAMIC_FIELD_LABEL, event.value)}
                                                onBlur={() => handleBlur(formikProps, 'dynamicFieldLabel')}
                                            />
                                        </Form.Group>
                                        <Form.Group className="form-group">
                                            <Form.Label className="form-label">{translate("LABEL_MANDATORY_INDICATOR")}</Form.Label>
                                            <Form.Control
                                                className="form-field"
                                                name="dynamicFieldMandatoryInd"
                                                value={formikProps.values.dynamicFieldMandatoryInd}
                                                as={Dropdown}
                                                options={lookupColumnOptions}
                                                onChange={event => updateSelectedFormField(ATTRIBUTES.DYNAMIC_MANDATORY_INDICATOR, event.value)}
                                                onBlur={() => handleBlur(formikProps, 'dynamicFieldMandatoryInd')}
                                            />
                                        </Form.Group>
                                        <Form.Group required className="form-group">
                                            <Form.Label className="form-label">{translate("LABEL_FIELD_TYPE")}</Form.Label>
                                            <Form.Control
                                                className="form-field"
                                                name="dynamicFieldType"
                                                value={formikProps.values.dynamicFieldType}
                                                as={Dropdown}
                                                options={lookupColumnOptions}
                                                onChange={event => updateSelectedFormField(ATTRIBUTES.DYNAMIC_FIELD_TYPE, event.value)}
                                                onBlur={() => handleBlur(formikProps, 'dynamicFieldType')}
                                            />
                                        </Form.Group>
                                        <Form.Group required className="form-group">
                                            <Form.Label className="form-label">{translate("LABEL_DYNAMIC_FIELD_VIEW_OPTIONS")}</Form.Label>
                                            <Form.Control
                                                className="form-field"
                                                name="dynamicFieldValueOptions"
                                                value={formikProps.values.dynamicFieldValueOptions}
                                                as={Dropdown}
                                                options={lookupColumnOptions}
                                                onChange={event => updateSelectedFormField(ATTRIBUTES.DYNAMIC_FIELD_VALUE_OPTIONS, event.value)}
                                                onBlur={() => handleBlur(formikProps, 'dynamicFieldValueOptions')}
                                            />
                                        </Form.Group>
                                    </>
                                }
                                {
                                    lookupColumnOptions && lookupColumnOptions.length === 0 && <div>
                                        <img src={alert_icon} alt="" className="draft__icon"/>
                                        { translate("LABEL_NO_LOOKUP_COLUMNS") }
                                    </div>
                                }
                                {
                                    childrenOfDynamicViewOn && childrenOfDynamicViewOn.length > 0 && <>
                                        <br/>
                                        <p>{ translate("LABEL_SELECT_DYNAMIC_VIEW_FIELD") }</p>
                                        <br/>
                                        {
                                            childrenOfDynamicViewOn && childrenOfDynamicViewOn.length > 0 && <>
                                                <Form.Group required className="form-group">
                                                    <Form.Label className="form-label">{translate("LABEL_FIELD_VALUE")}</Form.Label>
                                                    <Form.Control
                                                        className="form-field"
                                                        name="dynamicFieldValue"
                                                        value={formikProps.values.dynamicFieldValue}
                                                        as={Dropdown}
                                                        options={childrenOfDynamicViewOn}
                                                        onChange={event => updateSelectedFormField(ATTRIBUTES.DYNAMIC_FIELD_VALUE, event.value)}
                                                        onBlur={() => handleBlur(formikProps, 'dynamicFieldValue')}
                                                    />
                                                </Form.Group>
                                                <br />
                                                <Form.Group className="form-group">
                                                    <Form.Control
                                                        className="form-field width-auto"
                                                        name="hideParent"
                                                        checked={formikProps.values.hideParent}
                                                        as={Checkbox}
                                                        onChange={() => toggleBooleanField(ATTRIBUTES.HIDE_PARENT_IF_NO_CHILD)}
                                                    >
                                                        {translate("LABEL_HIDE_PARENT_IF_NO_CHILD")}
                                                    </Form.Control>
                                                    <Tooltip content={translate("LABEL_HIDE_PARENT_IF_NO_CHILD_INFO")}>
                                                        <i className="aicon aicon__help tooltip__icon" />
                                                    </Tooltip>
                                                </Form.Group>
                                            </>
                                        }
                                    </>
                                }
                                {
                                    childrenOfDynamicViewOn && childrenOfDynamicViewOn.length === 0 && <div>
                                        <img src={alert_icon} alt="" className="draft__icon"/>
                                        { translate("LABEL_NO_CHILD_FIELDS") }
                                    </div>
                                }
                            </>
                        }
                    </>
                }
            </>
        }
        {
            manyParents && manyParents.length === 0 && <div>
                <img src={alert_icon} alt="" className="draft__icon"/>
                { translate("LABEL_NO_DYNAMIC_VIEW_ON_FIELDS") }
            </div>
        }
    </>);

    const renderMultiSelectView = () => (
        <>
            {
                lookupOptions && lookupOptions.length > 0 && <>
                    <Form.Group required className="form-group">
                        <Form.Label className="form-label">{translate("LABEL_REFERENCE_COLUMN")}</Form.Label>
                        <Form.Control
                            className="form-field"
                            name="referenceLookupField"
                            as={Dropdown}
                            options={lookupOptions}
                            value={formikProps.values.referenceLookupField}
                            onChange={event => updateSelectedFormField(ATTRIBUTES.REFERENCE_LOOKUP_FIELD, event.value)}
                            onBlur={() => handleBlur(formikProps, 'referenceLookupField')}
                        />
                    </Form.Group>
                    {
                        referenceLookupField && <>
                            <div>
                                <img src={information_icon} alt="" className="draft__icon"/>
                                { translate("LABEL_KEY_COLUMN") }: { referenceLookupField.metadata.lookup.key },
                                { translate("LABEL_VALUE_COLUMN") }: { referenceLookupField.metadata.lookup.value }
                            </div>
                            <br/>
                            <br/>
                        </>
                    }
                    {
                        referenceLookupField && lookupColumnOptions && lookupColumnOptions.length > 0
                        && <>
                            <Form.Group className="form-group">
                                <Form.Label className="form-label">{translate("LABEL_PARENT_COLUMN")}</Form.Label>
                                <Form.Control
                                    className="form-field"
                                    name="parentColumn"
                                    as={Dropdown}
                                    options={lookupColumnOptions}
                                    value={formikProps.values.parentColumn}
                                    onChange={event => updateSelectedFormField(ATTRIBUTES.PARENT_COLUMN, event.value)}
                                    onBlur={() => handleBlur(formikProps, 'parentColumn')}
                                />
                            </Form.Group>
                        </>
                    }
                </>
            }
            {
                lookupOptions && lookupOptions.length === 0 && <div>
                    <img src={alert_icon} alt="" className="draft__icon"/>
                    { translate("LABEL_NO_LOOKUP_FIELD") }
                </div>
            }
            {
                referenceLookupField && lookupColumnOptions && lookupColumnOptions.length === 0 && <div>
                    <img src={alert_icon} alt="" className="draft__icon"/>
                    { translate("LABEL_NO_PARENT_COLUMN_PRESENT") }
                </div>
            }
        </>
    );

    const renderFieldTypeString = () => (
        <Form.Group className="form-group">
            <Form.Label className="form-label" help={getFieldTypeInfo(DATA_TYPES.STRING)}>{translate("LABEL_VIEW_AS")}</Form.Label>
            <Form.Control
                name="fieldType"
                as={Radio}
                value={FIELD_TYPES.TEXT_FIELD}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.TEXT_FIELD)}
                checked={formikProps.values.fieldType === FIELD_TYPES.TEXT_FIELD}
            >
                {translate("LABEL_TEXT_FIELD")}
            </Form.Control>
            <Form.Control
                name="fieldType"
                as={Radio}
                value={FIELD_TYPES.TEXT_AREA}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.TEXT_AREA)}
                checked={formikProps.values.fieldType === FIELD_TYPES.TEXT_AREA}
            >
                {translate("LABEL_TEXT_BOX")}
            </Form.Control>
        </Form.Group>
    );

    const renderFieldTypeLookup = () => (
        <Form.Group className="form-group">
            <Form.Label className="form-label" help={getFieldTypeInfo(DATA_TYPES.LOOKUP)}>{translate("LABEL_VIEW_AS")}</Form.Label>
            <Form.Control
                className="form-field margin-bottom-none"
                name="fieldType"
                as={Radio}
                value={FIELD_TYPES.DROPDOWN}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.DROPDOWN)}
                checked={formikProps.values.fieldType === FIELD_TYPES.DROPDOWN}
            >
                {translate("LABEL_DROPDOWN")}
            </Form.Control>
        </Form.Group>
    );

    const renderFieldTypeBoolean = () => (
        <Form.Group className="form-group">
            <Form.Label className="form-label" help={getFieldTypeInfo(DATA_TYPES.BOOLEAN)}>{translate("LABEL_VIEW_AS")}</Form.Label>
            <Form.Control
                name="fieldType"
                as={Radio}
                value={FIELD_TYPES.RADIO_BUTTON}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.RADIO_BUTTON)}
                checked={formikProps.values.fieldType === FIELD_TYPES.RADIO_BUTTON}
            >
                {translate("LABEL_RADIO_BUTTON")}
            </Form.Control>
            <Form.Control
                name="fieldType"
                as={Radio}
                value={FIELD_TYPES.CHECKBOX}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.CHECKBOX)}
                checked={formikProps.values.fieldType === FIELD_TYPES.CHECKBOX}
            >
                {translate("LABEL_CHECKBOX")}
            </Form.Control>
        </Form.Group>
    );

    const renderFieldTypeMany = () => (
        <Form.Group className="form-group">
            <Form.Label className="form-label">{translate("LABEL_VIEW_AS")}</Form.Label>
            <Form.Control
                className="form-field margin-bottom-none flex"
                name="fieldType"
                as={Radio}
                value={FIELD_TYPES.CARD_VIEW}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.CARD_VIEW)}
                checked={formikProps.values.fieldType === FIELD_TYPES.CARD_VIEW}
            >
                {translate("LABEL_CARD_VIEW")}
            </Form.Control>
            <Form.Control
                name="fieldType"
                className="form-field margin-bottom-none flex"
                as={Radio}
                value={FIELD_TYPES.GRID_VIEW}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.GRID_VIEW)}
                checked={formikProps.values.fieldType === FIELD_TYPES.GRID_VIEW}
            >
                {translate("LABEL_GRID_VIEW")}
            </Form.Control>
            <Form.Control
                name="fieldType"
                className="form-field margin-bottom-none flex"
                as={Radio}
                value={FIELD_TYPES.MULTI_SELECT_VIEW}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.MULTI_SELECT_VIEW)}
                checked={formikProps.values.fieldType === FIELD_TYPES.MULTI_SELECT_VIEW}
            >
                {translate("LABEL_MULTI_SELECT_VIEW")}
            </Form.Control>
            <Form.Control
                name="fieldType"
                as={Radio}
                className="form-field margin-bottom-none flex"
                value={FIELD_TYPES.DYNAMIC_FIELD_VIEW}
                onChange={() => updateSelectedFormField(ATTRIBUTES.FIELD_TYPE, FIELD_TYPES.DYNAMIC_FIELD_VIEW)}
                checked={formikProps.values.fieldType === FIELD_TYPES.DYNAMIC_FIELD_VIEW}
            >
                {translate("LABEL_DYNAMIC_FIELD_VIEW")}
            </Form.Control>
        </Form.Group>
    );

    const getFieldTypeInfo = (fieldType) => {
        switch (fieldType) {
            case DATA_TYPES.MANY: return <>
                <p>{translate("LABEL_GRID_VIEW")}: {translate("LABEL_GRID_VIEW_INFO")}</p>
                <p>{translate("LABEL_CARD_VIEW")}: {translate("LABEL_CARD_VIEW_INFO")}</p>
                <p>{translate("LABEL_DYNAMIC_FIELD_VIEW")}: {translate("LABEL_DYNAMIC_FIELD_VIEW_INFO")}</p>
                <p>{translate("LABEL_MULTI_SELECT_VIEW")}: {translate("LABEL_MULTI_SELECT_VIEW_INFO")}</p>
            </>;
            case DATA_TYPES.STRING: return <>
                <p>{translate("LABEL_TEXT_FIELD")}: {translate("LABEL_TEXT_FIELD_INFO")}</p>
                <p>{translate("LABEL_TEXT_BOX")}: {translate("LABEL_TEXT_BOX_INFO")}</p>
            </>;
            case DATA_TYPES.BOOLEAN: return <>
                <p>{translate("LABEL_RADIO_BUTTON")}: {translate("LABEL_RADIO_BUTTON_INFO")}</p>
                <p>{translate("LABEL_CHECKBOX")}: {translate("LABEL_CHECKBOX_INFO")}</p>
            </>;
            case DATA_TYPES.LOOKUP: return <>
                <p>{translate("LABEL_DROPDOWN")}: {translate("LABEL_DROPDOWN_INFO")}</p>
            </>;
            case DATA_TYPES.HYPERLINKTEXT: return <>
                <p>{translate("LABEL_TEXT_FIELD")}: {translate("LABEL_TEXT_FIELD_INFO")}</p>
                <p>{translate("LABEL_TEXT_BOX")}: {translate("LABEL_TEXT_BOX_INFO")}</p>
            </>;
            default: break;
        }
    };

    const renderViewAsField = () => {
        if (selectedField.many && selectedField.hierarchyName.split(".").length === 1) {
            return renderFieldTypeMany();

        } else if (!selectedField.many) {
            switch (selectedField.metadata.dataType.toUpperCase()) {
                case DATA_TYPES.STRING:
                    return renderFieldTypeString();
                case DATA_TYPES.BOOLEAN:
                    return renderFieldTypeBoolean();
                case DATA_TYPES.LOOKUP:
                    return renderFieldTypeLookup();
                case DATA_TYPES.HYPERLINKTEXT:
                    return renderFieldTypeString();
                default:
                    return "";
            }
        }
    };

    return <>
        {
            (selectedField && selectedField.metadata && selectedField.metadata.name) && 
                (<Section title={`${translate("LABEL_PROPERTIES")} ${selectedField.metadata.label}`}>
                    <form className="form">
                        {
                            renderViewAsField()
                        }
                        {
                            formikProps.values.fieldType === FIELD_TYPES.DYNAMIC_FIELD_VIEW ?
                            false : renderRequiredField() 
                        }
                        {
                            !formikProps.values.many && renderHiddenField()
                        }
                        {
                            !formikProps.values.many && renderReadOnlyField()
                        }
                        {
                            formikProps.values.many && formikProps.values.fieldType === FIELD_TYPES.MULTI_SELECT_VIEW
                            && renderMultiSelectView()
                        }
                        {
                            formikProps.values.many && formikProps.values.fieldType === FIELD_TYPES.DYNAMIC_FIELD_VIEW
                            && renderDynamicView()
                        }
                        {
                            formikProps.values.many && (formikProps.values.fieldType === FIELD_TYPES.GRID_VIEW
                                || formikProps.values.fieldType === FIELD_TYPES.CARD_VIEW)
                            && renderEnableAlternateView()
                        }
                        {
                            formikProps.values.many && (formikProps.values.fieldType === FIELD_TYPES.GRID_VIEW
                                || formikProps.values.fieldType === FIELD_TYPES.CARD_VIEW)
                            && renderEnableValidation()
                        }
                        {
                            formikProps.values.many && (formikProps.values.fieldType === FIELD_TYPES.GRID_VIEW)
                            && formikProps.values.fieldType
                            && <div className="properties__notification">
                                <img src={alert_icon} alt="" className="draft__icon"/>
                                { translate("LABEL_GRID_VIEW_MESSAGE") }
                            </div>
                        }
                    </form>
            </Section>)
        }
    </>;
};
export default BeFormFieldProperties;
