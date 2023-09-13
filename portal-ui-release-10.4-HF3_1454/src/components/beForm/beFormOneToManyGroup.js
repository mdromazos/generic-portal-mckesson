import React, { useEffect, useState } from 'react';
import { Section, Toolbar } from '@informatica/droplets-core';
import { useTranslation } from "react-i18next";
import BEFORM_CONFIG from "./beFormConfig";
import BEFormField from "./beFormField";
import BEFormOneToManyRowItem from "./beFormOneToManyRowItem";
import BEFormOneToManyTable from "./beFormOneToManyTable";
import { getObjectPropertyValue } from "./validations";
import getObject from "lodash/get";
import mergeObject from "lodash/merge";

import {
    isLookupField,
    isDependantLookup,
    getLookupFieldValue,
    isParentLookup,
    getFieldValue,
    fetchLookupData,
    getIconButton
} from "./beFormUtility";

export const BEFormOneToManyGroup = ({
    beField, sectionMetaData, index, fieldName, isChild, beData, formDisabled, formikProps, metaConfigName,
    getLookupHandler, getOneToManyBEDataHandler, fileHandler, dateFormat, maxColumns, manyDt,
    locale, updateBEData, view, parentDataPath = "", handleDataValidation, groupValidationErrors, manyLevel = 0, previewMode =  false 
}) => {

    const { t: translate } = useTranslation();
    const { LOOKUP_LINKS, VIEW_TYPE, DATA_TYPES } = BEFORM_CONFIG;
    const [viewMode, setViewMode] = useState(view);
    const [lookupData, setLookupData] = useState(undefined);
    const [oneToManyData, setOneToManyData] = useState(undefined);
    const { ONE_TO_MANY, META_KEYS, OPERATIONS } = BEFORM_CONFIG;

    useEffect(() => {
        setViewMode(view);
    }, [view]);

    useEffect(() => {
        !lookupData && oneToManyData && beField.beFormFields && Array.isArray(beField.beFormFields)
            && beField.beFormFields.forEach(beManyChild => {
                if (isLookupField(beManyChild) && !isDependantLookup(beManyChild)) {
                    if (beManyChild.lookup && beManyChild.lookup.link && Array.isArray(beManyChild.lookup.link)) {
                        const lookupLink = beManyChild.lookup.link.filter(linkObj => linkObj.rel === LOOKUP_LINKS.LOOKUP);
                        if (lookupLink[0] && typeof (getLookupHandler) === "function") {
                            triggerLookupHandler(lookupLink[0].href, beManyChild, beManyChild.name);
                        }
                    }
                }
            });
    }, [oneToManyData]);

    useEffect(() => {
        if (viewMode === VIEW_TYPE.CARD || (viewMode === VIEW_TYPE.GRID && !oneToManyData)) {
            let params = "recordsToReturn=1000&many=true&firstRecord=1&returnTotal=true";
            parentDataPath !== null && fetchOneToManyData(params);
        }
    }, [beData, viewMode, parentDataPath]);

    const fetchOneToManyData = (params) => {
        if (typeof (getOneToManyBEDataHandler) === "function") {
            let dataPath = parentDataPath !== "" ? parentDataPath + "/" + beField.name : beField.name;
            getOneToManyBEDataHandler(dataPath, params)
                .then(resp => {
                    if (formikProps) {
                        let dataObj = JSON.parse(JSON.stringify(resp));
                        const retrievedObject = getObject(formikProps.values, fieldName);
                        const mergedObject = mergeObject(retrievedObject,dataObj);
                        mergedObject[ONE_TO_MANY.ORIGINAL_COPY] = resp;
                        formikProps.setFieldValue(fieldName, mergedObject, false);
                    }
                    setOneToManyData(resp);
                })
                .catch(error => { console.log(error) });
        }
    };

    const triggerLookupHandler = (lookupLink, field, lookupDataName) => {
        const lookupDataResponseHandler = (lookupItems) => {
            updateLookupData(lookupItems, lookupDataName);
            if (isParentLookup(field)) {
                let dataObj = getFieldValue(formikProps.values, fieldName);
                dataObj && Array.isArray(dataObj.item) && dataObj.item.forEach((itebObj, index) => {
                    let parentManyDt = { parentName: fieldName, row: index };
                    let fieldValue = getLookupFieldValue(field, formikProps.values, parentManyDt);
                    if (fieldValue) {
                        getDependantLookUpData(field, fieldValue);
                    }
                });
            }
        };
        fetchLookupData(getLookupHandler, lookupLink, lookupDataResponseHandler);
    };

    const updateLookupData = (lookupItems, lookupName) => {
        setLookupData((lookupData) => { return { ...lookupData, [lookupName]: lookupItems } });
    };

    const lookupValueChangeHandler = (field, event, fieldManyDt) => {
        if (isParentLookup(field)) {
            getDependantLookUpData(field, event.value, true, fieldManyDt);
        }
    };

    const getDependantLookUpData = (field, fieldValue, resetDependantField, fieldManyDt) => {
        field.dependents.forEach(dependentName => {
            let dependantFieldName = dependentName && dependentName.split(".").pop();

            let dependantField = getFieldFromList(dependantFieldName, beField);
            if (formikProps && dependantField && resetDependantField) {
                let defaultValue = (dependantField.required) ? {} : undefined;
                formikProps.setFieldValue(`${fieldManyDt["parentName"]}.item[${fieldManyDt["row"]}].${dependantField.name}`, defaultValue, false);
            }
            if (lookupData && dependantField && lookupData[`${dependantField.name}_${fieldValue}`]) return;

            if (dependantField && dependantField.lookup && dependantField.lookup.link && Array.isArray(dependantField.lookup.link)) {
                const lookupLinkObj = dependantField.lookup.link.filter(linkObj => linkObj.rel === LOOKUP_LINKS.LOOKUP);
                let lookupLink = (lookupLinkObj[0]) ? (lookupLinkObj[0].href).replace(`{${dependantField.parents[0]}}`, fieldValue) : "";
                if (lookupLink !== "" && typeof (getLookupHandler) === "function") {
                    triggerLookupHandler(lookupLink, dependantField, `${dependantField.name}_${fieldValue}`);
                }
            }
        });
    };

    const getFieldFromList = (fieldNamValue, fieldList) => {
        let field;
        fieldList && fieldList.beFormFields && Array.isArray(fieldList.beFormFields)
            && fieldList.beFormFields.forEach(beFieldChild => {
                if (beFieldChild.name === fieldNamValue) {
                    field = beFieldChild;
                }
            });
        return field;
    };

    const changeView = () => {
        let newViewMode = (viewMode === VIEW_TYPE.GRID) ? VIEW_TYPE.CARD : VIEW_TYPE.GRID;
        setViewMode(newViewMode);
    };

    const lookupOptionsHandler = (field, manyDetails) => {

        let lookupOptions = [];
        if (isDependantLookup(field)) {
            let parentFieldValue = getParentFieldValue(field, manyDetails);
            if (parentFieldValue && lookupData && lookupData[`${field.name}_${parentFieldValue}`]) {
                lookupOptions = lookupData[`${field.name}_${parentFieldValue}`];
            }
        } else {
            lookupOptions = lookupData && lookupData[field.name] ? lookupData[field.name] : [];
        }
        return lookupOptions;
    };

    const getParentFieldValue = (field, manyDetails) => {
        let fieldValue = null;
        if (formikProps && formikProps.values && field && field.parents && Array.isArray(field.parents) && field.parents[0]) {
            let parentFieldName = ((field.parents[0]).split('.')).pop();
            let parentField = getFieldFromList(parentFieldName, beField);
            fieldValue = getLookupFieldValue(parentField, formikProps.values, manyDetails);

        }
        return fieldValue;
    };

    const getCardView = (manyLength) => {
        let itemList = [];

        for (let i = 0; i < manyLength; i++) {
            let oneToManyRowId = (oneToManyData && oneToManyData.item && oneToManyData.item[i]
                && oneToManyData.item[i].rowidObject) ? oneToManyData.item[i].rowidObject + "_" + i : "row_" + i;
            let pendingProtected = oneToManyData && oneToManyData.item && oneToManyData.item[i] && oneToManyData.item[i].pendingProtected;
            let itemRow = beField && beField.beFormFields && Array.isArray(beField.beFormFields)
                && beField.beFormFields.map((beManyChild, childIndex) => {
                    if (!beManyChild.many) {
                        if (!beManyChild.isHidden) {
                            // if (!beManyChild.isReadOnly) beManyChild.isReadOnly = pendingProtected;
                            let manyDt = { parentName: fieldName, row: i };
                            return <BEFormField
                                key={`formField_${oneToManyRowId}_${childIndex}`}
                                beField={beManyChild}
                                index={`${index}_${childIndex}`}
                                sectionMetaData={sectionMetaData}
                                formikProps={formikProps}
                                formDisabled={formDisabled}
                                dateFormat={dateFormat}
                                lookupOptionsHandler={lookupOptionsHandler}
                                maxColumns={maxColumns}
                                manyDt={manyDt}
                                locale={locale}
                                lookupValueChangeHandler={lookupValueChangeHandler}
                                view={viewMode}
                                fileHandler={fileHandler}
                                pendingProtected={pendingProtected}
                            />
                        }
                    } else {
                        const allowRender = (formDisabled) ?
                            getObjectPropertyValue(beManyChild, META_KEYS.OPERATIONS, OPERATIONS.READ, META_KEYS.ALLOWED) :
                            (getObjectPropertyValue(beManyChild, META_KEYS.OPERATIONS, OPERATIONS.UPDATE, META_KEYS.ALLOWED) ||
                                getObjectPropertyValue(beManyChild, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED));
                        if (allowRender) {
                            let parentDataPathName = "";
                            if (oneToManyData.item && oneToManyData.item[i] && oneToManyData.item[i].rowidObject) {
                                parentDataPathName = beField.name + "/" + oneToManyData.item[i].rowidObject;
                            }
                            parentDataPathName = (parentDataPath !== "") ? parentDataPath + "/" + parentDataPathName : parentDataPathName;

                            return <BEFormOneToManyGroup
                                key={`formOneToManyGroup_${childIndex}_${index}_${oneToManyRowId}`}
                                beField={beManyChild}
                                index={`${childIndex}_${index}`}
                                sectionMetaData={sectionMetaData}
                                formikProps={formikProps}
                                formDisabled={formDisabled}
                                dateFormat={dateFormat}
                                lookupData={lookupData}
                                maxColumns={maxColumns}
                                fileHandler={fileHandler}
                                getLookupHandler={getLookupHandler}
                                beData={beData}
                                isChild={true}
                                fieldName={`${fieldName}.item[${i}].${beManyChild.name}`}
                                updateBEData={updateBEData}
                                view={viewMode}
                                getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                                parentDataPath={parentDataPathName !== "" ? parentDataPathName : null}
                                manyLevel={manyLevel + 1}
                            />
                        }
                    }
                    return undefined;
                });
            itemList.push(
                <BEFormOneToManyRowItem
                    formikProps={formikProps}
                    beField={beField}
                    fieldName={fieldName}
                    isChild={isChild}
                    formDisabled={formDisabled}
                    deleteOneToManyRow={deleteOneToManyRow}
                    handleDataValidation={handleDataValidation}
                    groupValidationErrors={groupValidationErrors}
                    rowIndex={i}
                    pendingProtected={pendingProtected}
                    key={`beFormOnetoManyRowItem__${i}`}
                >
                    {itemRow}
                </BEFormOneToManyRowItem>
            );
        }
        return itemList;
    };

    const renderOneToMany = () => {

        let itemList;
        const manyLength = (oneToManyData && oneToManyData.item) ? oneToManyData.item.length : 0;

        if (viewMode === VIEW_TYPE.GRID) {
            return <BEFormOneToManyTable
                beField={beField}
                sectionMetaData={sectionMetaData}
                index={index}
                fieldName={fieldName}
                isChild={isChild}
                beData={beData}
                formDisabled={formDisabled}
                formikProps={formikProps}
                metaConfigName={metaConfigName}
                getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                fileHandler={fileHandler}
                dateFormat={dateFormat}
                maxColumns={maxColumns}
                manyDt={manyDt}
                locale={locale}
                updateBEData={updateBEData}
                view={view}
                parentDataPath={parentDataPath}
                lookupData={lookupData}
                lookupValueChangeHandler={lookupValueChangeHandler}
                lookupOptionsHandler={lookupOptionsHandler}
                changeViewHandler={changeView}
                handleDataValidation={handleDataValidation}
                groupValidationErrors={groupValidationErrors}
                previewMode={previewMode}
            />
        } else {
            if (manyLength !== 0) {
                itemList = getCardView(manyLength);
            } else {
                itemList = <div className='one-to-many-no-items-message'>{translate("BE_FORM_ITEMS_NOT_ADDED_MESSAGE", { FIELD_NAME: `${beField.label}` })}</div>;
            }
        }
        const allowCreation = getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED);

        if (isChild) {
            const oneToManyChildLeft = (manyLevel > 1) ? (manyLevel - 1) * 20 : "";
            return (
                <div className={"one-to-many-child-section"} style={{"padding-left": oneToManyChildLeft}}>
                    <Section title={beField.label} collapsible
                        data-testid={beField.label+"_section"}
                        toolbar={({ expanded }) => (
                            <Toolbar>
                                {allowCreation && !formDisabled && getIconButton(() => { addNewOneToManyRow() }, translate("BE_FORM_LABEL_ADD"), "add-v1", "iconClass")}
                            </Toolbar>
                        )}>
                        <div className='one-to-many-body'>
                            {itemList}
                        </div>
                    </Section>
                </div>
            )
        } else {
            return (
                <div className="one-to-many-container" data-testid="one-to-many-container">
                    <div className='one-to-many-header'>
                        <div className="one-to-many-header-title" data-testid="one-to-many-header-title">{beField.label}
                            {beField.required === true && <span className="one-to-many-section-mandatory"> * </span>}
                        </div>
                        <div className="field-controls" data-testid="field-controls">
                            {allowCreation && !formDisabled && getIconButton(() => { addNewOneToManyRow() }, translate("BE_FORM_LABEL_ADD"), "add-v1", "iconClass")}
                            {beField[ONE_TO_MANY.SWITCH_VIEW] && formDisabled && getIconButton(() => { changeView() }, translate(viewMode === VIEW_TYPE.GRID ? "BE_FORM_LABEL_CARD_VIEW" : "BE_FORM_LABEL_TABLE_VIEW"), (viewMode === VIEW_TYPE.GRID) ? "card-view" : "grid-view", "iconClass")}
                        </div>
                    </div>
                    {   beField.sectionError != null && 
                        <p className="one__to__many__section__error">
                           <i className="aicon aicon__close-solid close-icon"></i> {beField.sectionError}
                        </p>
                    }
                    <div className='one-to-many-body'>
                        {itemList}
                    </div>
                </div>
            );
        }
    };

    const getOneToManyRequiredFileds = () => {
        let obj = {};
        beField && beField.beFormFields && Array.isArray(beField.beFormFields)
            && beField.beFormFields.forEach(beManyChild => {
                if (beManyChild.required) {
                    if (beManyChild.dataType === DATA_TYPES.LOOKUP) {
                        obj[beManyChild.name] = {};
                    } else {
                        obj[beManyChild.name] = "";
                    }
                }
            });
        return obj;
    };

    const addNewOneToManyRow = function () {
        let data = (formikProps && formikProps.values) ? formikProps.values : {};
        let dataObj = getFieldValue(data, fieldName);
        let newObj = dataObj ? JSON.parse(JSON.stringify(dataObj)) : {};

        if (!newObj.item || !Array.isArray(newObj.item)) {
            newObj.item = [];
        }
        newObj.item.push(getOneToManyRequiredFileds());
        formikProps && formikProps.setFieldValue(fieldName, newObj);
        setOneToManyData(newObj);
    };

    const deleteOneToManyRow = function (rowIndex) {
        if(formikProps) {
            let fieldErrors = getFieldValue(formikProps.errors, fieldName);
            if(fieldErrors) {
                let fieldErrorCopy = JSON.parse(JSON.stringify(fieldErrors));
                fieldErrorCopy.item.splice(rowIndex, 1);
                formikProps.setFieldError(fieldName, fieldErrorCopy);
            }
            let fieldsTouched = getFieldValue(formikProps.touched, fieldName);
            if(fieldsTouched) {
                let fieldsTouchedCopy = JSON.parse(JSON.stringify(fieldsTouched));
                fieldsTouchedCopy.item.splice(rowIndex, 1);
                formikProps.setFieldTouched(fieldName, fieldsTouchedCopy);
            }
            let fieldValues = getFieldValue(formikProps.values, fieldName);
            if (fieldValues) {
                let fieldValueCopy = JSON.parse(JSON.stringify(fieldValues));
                fieldValueCopy.item.splice(rowIndex, 1);
                formikProps.setFieldValue(fieldName, fieldValueCopy);
                setOneToManyData(fieldValueCopy);
            }
        }
    };

    return (
        renderOneToMany()
    );
};

BEFormOneToManyGroup.propTypes = {};

export default BEFormOneToManyGroup;
