import React, { useEffect, useState } from 'react';
import { Section, Form } from '@informatica/droplets-core';
import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import BEFORM_CONFIG from "./beFormConfig";
import BEFormOneToManyGroup from "./beFormOneToManyGroup";
import BEFormField from "./beFormField";
import { getObjectPropertyValue } from "./validations";
import {
    getLookupFieldValue, isLookupField, isDependantLookup, isParentLookup, fetchLookupData, getFieldFromSectionList
} from "./beFormUtility";
import BeFormHierarchyField from "./beFormFieldHierarchy";
import BeFormDynamicFieldView from "./beFormDynamicView";

export const BEFormSection = ({
    sectionMetaData, beData, formDisabled, formikProps, metaConfigName, getLookupHandler,
    getOneToManyBEDataHandler, fileHandler, dateLocal, dateFormat, maxColumns, updateBEData,
    handleDataValidation, groupValidationErrors, previewMode = false, setBeFormdynamicFieldFormikProps
}) => {

    const { LOOKUP_LINKS, DATE_FORMAT, FIELD_TYPES, ONE_TO_MANY, META_KEYS, OPERATIONS } = BEFORM_CONFIG;
    const [locale] = useState(dateLocal ? dateLocal : 'en');
    const [lookupData, setLookupData] = useState({});
    const dateFormatValue = dateFormat ? dateFormat : DATE_FORMAT;
    
    moment.locale(locale);
    momentLocalizer();

    useEffect(() => {
        sectionMetaData.beFormFields.forEach((beField) => {
            if (isLookupField(beField) && !isDependantLookup(beField)) {
                if (beField.lookup && beField.lookup.link && Array.isArray(beField.lookup.link)) {
                    const lookupLink = beField.lookup.link.filter(linkObj => linkObj.rel === LOOKUP_LINKS.LOOKUP);
                    if (lookupLink[0] && typeof (getLookupHandler) === "function") {
                        triggerLookupHandler(lookupLink[0].href, beField);
                    }
                }
            }
        });
    }, []);

    const lookupOptionsHandler = (field) => {
        return lookupData[field.name] ? lookupData[field.name] : [];
    };

    const getSectionLayout = (section) => {
        return <div key={section.name} className="section-container">
            {formikProps.touched.rootError && formikProps.errors.rootError && <div className="be-form-root-error" data-testid={section.name+"rootError"}>	
                <Form.Group name={"rootError"} key={"rootError"}>	
                    <Form.Error>{formikProps.errors.rootError}</Form.Error>	
                </Form.Group>	
            </div>}
            {/* ADDED */}
            {beData && beData.pendingProtected && <div className="be-form-root-error" data-testid={section.name+"rootError"}>	
                <Form.Group name={"rootError"} key={"root"}>	
                    <Form.Error>Root fields are currently pending under review by supplier liaison</Form.Error>	
                </Form.Group>	
            </div>}
            <Section title={section.name} collapsible className={section.hideName ? "hide-section-header" : ""} data-testid={section.name}>
                <div className="section-body">
                    {
                        section.beFormFields && Array.isArray(section.beFormFields) && section.beFormFields.map((beField, index) => {
                            if (!beField.many) {
                                if (!beField.isHidden) {
                                    beField.isReadOnly = beData && beData.pendingProtected; // ADDED
                                    return <BEFormField
                                        key={`formField_${index}`}
                                        beField={beField}
                                        index={index}
                                        sectionMetaData={sectionMetaData}
                                        formikProps={formikProps}
                                        formDisabled={formDisabled}
                                        dateFormat={dateFormatValue}
                                        lookupOptionsHandler={lookupOptionsHandler}
                                        maxColumns={maxColumns}
                                        locale={locale}
                                        fileHandler={fileHandler}
                                        lookupValueChangeHandler={lookupValueChangeHandler}
                                    />
                                }
                            } else if (beField.many && beField.fieldType === FIELD_TYPES.MULTI_SELECT_VIEW) {
                                const allowRender = (formDisabled) ?
                                    getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.READ, META_KEYS.ALLOWED) :
                                    (getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED) ||
                                        getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED));

                                if (allowRender) {
                                    return <BeFormHierarchyField
                                        key={`hierarchyField_${index}`}
                                        formikProps={formikProps}
                                        disabled={formDisabled}
                                        getLookupHandler={getLookupHandler}
                                        fieldName={`${ONE_TO_MANY.DATA_KEY}.${beField.name}`}
                                        getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                                        beField={beField} 
                                        beData={beData} />;
                                }
                            } else if (beField.many && beField.fieldType === FIELD_TYPES.DYNAMIC_FIELD_VIEW) {
                                const allowRender = (formDisabled) ?
                                    getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.READ, META_KEYS.ALLOWED) :
                                    (getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED) ||
                                        getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED));

                                if (allowRender) {
                                    return <BeFormDynamicFieldView
                                        key={`formOneToManyGroup_${index}`}
                                        beField={beField}
                                        index={index}
                                        formikProps={formikProps}
                                        formDisabled={formDisabled}
                                        dateFormat={dateFormatValue}
                                        maxColumns={2}
                                        beData={beData}
                                        fieldName={`${ONE_TO_MANY.DATA_KEY}.${beField.name}`}
                                        updateBEData={updateBEData}
                                        fileHandler={fileHandler}
                                        getLookupHandler={getLookupHandler}
                                        lookupValueChangeHandler={lookupValueChangeHandler}
                                        getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                                        hideParentStatus={beField.hideParent}
                                        setBeFormdynamicFieldFormikProps={setBeFormdynamicFieldFormikProps}
                                    />
                                }
                            } else {
                                const allowRender = (formDisabled) ?
                                    getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.READ, META_KEYS.ALLOWED) :
                                    (getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED) ||
                                        getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED));

                                if (allowRender) {
                                    return <BEFormOneToManyGroup
                                        key={`formOneToManyGroup_${index}`}
                                        beField={beField}
                                        index={index}
                                        sectionMetaData={sectionMetaData}
                                        formikProps={formikProps}
                                        formDisabled={formDisabled}
                                        dateFormat={dateFormatValue}
                                        maxColumns={maxColumns}
                                        fileHandler={fileHandler}
                                        getLookupHandler={getLookupHandler}
                                        beData={beData}
                                        fieldName={`${ONE_TO_MANY.DATA_KEY}.${beField.name}`}
                                        lookupValueChangeHandler={lookupValueChangeHandler}
                                        updateBEData={updateBEData}
                                        handleDataValidation={handleDataValidation}
                                        groupValidationErrors={groupValidationErrors}
                                        metaConfigName={metaConfigName}
                                        getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                                        view={beField.fieldType}
                                        previewMode={previewMode}
                                    />
                                }
                            }
                            return undefined;
                        })
                    }
                </div>
            </Section>
        </div>;
    };

    const updateLookupData = (lookupItems, beField) => {
        setLookupData((lookupData) => { return { ...lookupData, [beField.name]: lookupItems } });
    };

    const getDependantLookUpData = (beField, fieldValue, resetDependantField) => {
        beField.dependents.forEach((dependentName) => {
            let dependantFieldName = dependentName.replace(`${metaConfigName}.`, "");
            let dependantField = getFieldFromSectionList(dependantFieldName, sectionMetaData);
            if (resetDependantField && formikProps && dependantField) { //reset the lookup options for child
                if(dependantField.required) {
                    formikProps.setFieldValue(dependantField['name'], {}, true);
                } else {
                    formikProps.setFieldValue(dependantField['name'], undefined, true);
                }
            }
            if (dependantField && dependantField.lookup && dependantField.lookup.link && Array.isArray(dependantField.lookup.link)) {
                updateLookupData([], dependantField);

                const lookupLinkObj = dependantField.lookup.link.filter(linkObj => linkObj.rel === LOOKUP_LINKS.LOOKUP);
                let lookupLink = (lookupLinkObj[0]) ? (lookupLinkObj[0].href).replace(`{${dependantField.parents[0]}}`, fieldValue) : "";
                if (lookupLink !== "" && typeof (getLookupHandler) === "function") {
                    triggerLookupHandler(lookupLink, dependantField);
                }
            }
        });
    };

    const triggerLookupHandler = (lookupLink, field) => {
        const lookupDataResponseHandler = (lookupItems) => {
            updateLookupData(lookupItems, field);
            if (isParentLookup(field)) {
                let fieldValue = getLookupFieldValue(field, beData);
                if (fieldValue) {
                    getDependantLookUpData(field, fieldValue);
                }
            }
        };

        fetchLookupData(getLookupHandler, lookupLink, lookupDataResponseHandler);
    };

    const lookupValueChangeHandler = (beField, event) => {
        if (isParentLookup(beField)) {
            getDependantLookUpData(beField, event.value, true);
        }
    };

    return (
        getSectionLayout(sectionMetaData)
    );
};

BEFormSection.propTypes = {};

export default BEFormSection;
