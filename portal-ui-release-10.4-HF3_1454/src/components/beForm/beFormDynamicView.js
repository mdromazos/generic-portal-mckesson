import React, { useEffect, useState, useRef } from 'react';
import { Section } from "@informatica/droplets-core";
import {isLookupField, isDependantLookup, getLookupFieldValue, isParentLookup, getFieldValue} from "./beFormUtility";
import BEFormOneToManyRowItem from "./beFormOneToManyRowItem";
import BEFormField from "./beFormField";
import { useTranslation } from "react-i18next";
import BEFORM_CONFIG from "./beFormConfig";
import BeFormDynamicField from "./beFormDynamicField";

const BeFormDynamicFieldView = ({
        beField, index, fieldName, isChild, beData, formDisabled, formikProps,
        getLookupHandler, getOneToManyBEDataHandler, fileHandler, lookupDataSet, lookupFullDataSet, dateFormat,
        maxColumns, locale, updateBEData, view, parentDataPath = "", dynamicViewProps, parentLookupKeyValue, hideParentStatus, setBeFormdynamicFieldFormikProps
}) => {

    const { t: translate } = useTranslation();
    const { LOOKUP_LINKS, VIEW_TYPE, ONE_TO_MANY } = BEFORM_CONFIG;
    const [lookupData, setLookupData] = useState({});
    const [lookupFullData, setLookupFullData] = useState({});
    const [oneToManyData, setOneToManyData] = useState(undefined);
    const [oneToManyFullData, setOneToManyFullData] = useState(undefined);
    const productServiceNode = useRef();
    const [dynamicViewProperties, setDynamicViewProperties] = useState(undefined);
    const [referenceLookupField, setReferenceLookupField] = useState(undefined);
    const [dynamicValueField, setDynamicValueField] = useState(undefined);

    useEffect(() => {
        if(!isChild && beField.dynamicViewOn && beField.referenceLookupField) {
            updateDynamicViewProperties(beField);
        }
    }, []);

    useEffect(() => {
        oneToManyData && beField.beFormFields && Array.isArray(beField.beFormFields)
        && beField.beFormFields.forEach(beManyChild => {
            if (isLookupField(beManyChild) && !isDependantLookup(beManyChild)) {
                if (beManyChild.lookup && beManyChild.lookup.link && Array.isArray(beManyChild.lookup.link)) {
                    const lookupLink = beManyChild.lookup.link.filter(linkObj => linkObj.rel === LOOKUP_LINKS.LIST);
                    if (lookupLink[0] && typeof (getLookupHandler) === "function") {
                        triggerLookupHandler(lookupLink[0].href, beManyChild, beManyChild.name);
                    }
                }
            }
        });
    }, [oneToManyData]);

    useEffect(() => {
        let params = "recordsToReturn=100&many=true&firstRecord=1&returnTotal=true";
        fetchOneToManyData(params);
    }, [beData]);

    useEffect(() => {
        if(dynamicViewProps && dynamicViewProps.dynamicViewOn === beField.name) {
            setDynamicViewProperties(dynamicViewProps);
            generateDynamicView(dynamicViewProps);

        } else if(!isChild && dynamicViewProperties && beField.dynamicViewOn === beField.name) {
            generateDynamicView(dynamicViewProperties);
        }
    }, [lookupFullData, lookupDataSet, lookupFullDataSet]);

    const generateDynamicView = (dynamicViewProperties) => {
        if(dynamicViewProperties && dynamicViewProperties.enableDynamicFields && dynamicViewProperties.dynamicFieldValue) {
            let dynamicFldValue = getBeFormField(beField, dynamicViewProperties.dynamicFieldValue);
            setDynamicValueField(dynamicFldValue);
        }

        let refLkpField = getLookupByName(beField, dynamicViewProperties.referenceLookupField, false);
        setReferenceLookupField(refLkpField);
        let refLkpFieldKey = refLkpField.lookup.key;
        let refLkpFieldDesc = refLkpField.lookup.value;

        if(refLkpField && refLkpField.name) {
            let referenceFullDataToUpdate = getLookupFullDataOptions(refLkpField);

            if(oneToManyData) {
                let oneToManyDataCopy = JSON.parse(JSON.stringify(oneToManyData));
                if(oneToManyDataCopy.item && Array.isArray(oneToManyDataCopy.item)) {

                    if(oneToManyDataCopy.item.length === 0 && referenceFullDataToUpdate.length > 0) {
                        let itemList = [];
                        referenceFullDataToUpdate.forEach(refLookupData => {
                            let itemData = {};
                            itemData[dynamicViewProperties.referenceLookupField] = {};
                            itemData[dynamicViewProperties.referenceLookupField][refLkpFieldKey] = refLookupData[refLkpFieldKey];
                            itemData[dynamicViewProperties.referenceLookupField][refLkpFieldDesc] = refLookupData[refLkpFieldDesc];
                            itemList.push(itemData);
                        });
                        oneToManyDataCopy.item = JSON.parse(JSON.stringify(itemList));
                    } else if(oneToManyDataCopy.item.length > 0 && referenceFullDataToUpdate.length > 0) {
                        let refFullDataMap = {};
                        referenceFullDataToUpdate.forEach(refLookupData => {
                            refFullDataMap[refLookupData[refLkpFieldKey]] = refLookupData;
                        });
                        let itemList = JSON.parse(JSON.stringify(oneToManyDataCopy.item));
                        for(let itemIndex = 0; itemIndex < oneToManyDataCopy.item.length; itemIndex++) {
                            if(oneToManyDataCopy.item[itemIndex][dynamicViewProperties.referenceLookupField]
                                && oneToManyDataCopy.item[itemIndex][dynamicViewProperties.referenceLookupField][refLkpFieldKey]
                                && !refFullDataMap[oneToManyDataCopy.item[itemIndex][dynamicViewProperties.referenceLookupField][refLkpFieldKey]]) {

                                itemList.splice(itemIndex, 1);
                            } else {
                                refFullDataMap[oneToManyDataCopy.item[itemIndex][dynamicViewProperties.referenceLookupField][refLkpFieldKey]] = undefined;
                            }
                        }
                        Object.keys(refFullDataMap).forEach(key => {
                            if(refFullDataMap[key] && refFullDataMap[key][refLkpFieldKey]) {
                                let itemData = {};
                                itemData[dynamicViewProperties.referenceLookupField] = {};
                                itemData[dynamicViewProperties.referenceLookupField][refLkpFieldKey] = refFullDataMap[key][refLkpFieldKey];
                                itemData[dynamicViewProperties.referenceLookupField][refLkpFieldDesc] = refFullDataMap[key][refLkpFieldDesc];
                                itemList.push(itemData);
                            }
                        });
                        oneToManyDataCopy.item = JSON.parse(JSON.stringify(itemList));
                    }
                }
                let dataObj = JSON.parse(JSON.stringify(oneToManyDataCopy));
                dataObj[ONE_TO_MANY.ORIGINAL_COPY] = oneToManyData;
                setOneToManyFullData(oneToManyDataCopy);
                formikProps.setFieldValue(fieldName, dataObj, false);
            }
        }
    };

    const updateDynamicViewProperties = ({ dynamicViewOn, referenceLookupField, enableDependency,
                dependentLookup, enableDynamicFields, dynamicFieldLabel, dynamicFieldType,
                dynamicFieldMandatoryInd, dynamicFieldValueOptions, dynamicFieldValue }) => {

        let dynamicViewProps = {
            dynamicViewOn, referenceLookupField, enableDependency, dependentLookup, enableDynamicFields,
            dynamicFieldLabel, dynamicFieldType, dynamicFieldMandatoryInd, dynamicFieldValue,
            dynamicFieldValueOptions
        };
        if(beField.dynamicViewOn === beField.name) {
            let viewOnField = JSON.parse(JSON.stringify(beField));
            let referenceLkpField = getLookupByName(viewOnField, referenceLookupField, false);
            dynamicViewProps = {...dynamicViewProps, referenceLkpField};

        } else {
            let viewOnField = getBeFormField(beField, beField.dynamicViewOn);
            let referenceLkpField = getLookupByName(viewOnField, referenceLookupField, false);
            dynamicViewProps = {...dynamicViewProps, referenceLkpField};

            if(enableDependency && dependentLookup) {
                let dependentLookupField = getLookupByName(beField, dependentLookup, true);
                let parentName = dependentLookupField.parents[0].substring(dependentLookupField.parents[0].lastIndexOf(".") + 1);
                let parentLookupField = getLookupByName(beField, parentName, false);
                dynamicViewProps = {...dynamicViewProps, parentLookupField};
            }
        }
        setDynamicViewProperties(dynamicViewProps);
    };

    const fetchOneToManyData = (params) => {
        if (typeof (getOneToManyBEDataHandler) === "function") {
            let dataPath = parentDataPath !== "" ? parentDataPath + "/" + beField.name : beField.name;
            getOneToManyBEDataHandler(dataPath, params)
                .then(resp => {
                    if (formikProps) {
                        let dataObj = JSON.parse(JSON.stringify(resp));
                        dataObj[ONE_TO_MANY.ORIGINAL_COPY] = JSON.parse(JSON.stringify(resp));
                        formikProps.setFieldValue(fieldName, dataObj, false);
                    }
                    setOneToManyData(JSON.parse(JSON.stringify(resp)));
                    setOneToManyFullData(JSON.parse(JSON.stringify(resp)));
                })
                .catch(error => { console.log(error) });
        }
    };

    const getBeFormField = (beFormField, fieldName) => {
        if(beFormField.beFormFields && Array.isArray(beFormField.beFormFields)) {
            for(let field of beFormField.beFormFields) {
                if(field.name === fieldName) {
                    return field;
                }
            }
        }
    };

    const getLookupByName = (beFormField, fieldName, isDependent) => {
        if(beFormField.beFormFields && Array.isArray(beFormField.beFormFields)) {
            if(isDependent) {
                return beFormField.beFormFields.filter(
                    field => isDependantLookup(field) && field.name === fieldName
                )[0];
            } else {
                return beFormField.beFormFields.filter(
                    field => isLookupField(field) && field.name === fieldName
                )[0];
            }
        }
    };

    const fetchLookupData = (getLookupHandler, lookupLink, lookupDataResponseHandler) => {
        if(lookupLink.includes("=")) {
            let stringTobeEncode = lookupLink.substring(lookupLink.lastIndexOf("=")+1, lookupLink.length);
            let encodedString = encodeURIComponent(stringTobeEncode);
            let slicedString = lookupLink.slice(0, lookupLink.lastIndexOf("=")+1);
            lookupLink = slicedString + encodedString;
        }
        getLookupHandler(lookupLink)
            .then(resp => {
                if (resp && resp.item && resp.item.length > 0) {
                    lookupDataResponseHandler(resp.item);
                }
            })
            .catch(error => { console.log(error)});
    };

    const triggerLookupHandler = (lookupLink, lookupField, lookupDataName) => {
        const lookupDataResponseHandler = (lookupItems) => {
            updateReferenceLookupDataItems(lookupItems, lookupField, lookupDataName);

            if (isParentLookup(lookupField)) {
                let dataObj = getFieldValue(formikProps.values, fieldName);
                dataObj && Array.isArray(dataObj.item) && dataObj.item.forEach((itemObj, index) => {
                    let parentManyDt = { parentName: fieldName, row: index };
                    let fieldValue = getLookupFieldValue(lookupField, formikProps.values, parentManyDt);
                    if (fieldValue) {
                        getDependantLookUpData(lookupField, fieldValue);
                    }
                });
            }
        };
        fetchLookupData(getLookupHandler, lookupLink, lookupDataResponseHandler);
    };

    const updateReferenceLookupDataItems = (lookupItems, lookupField, lookupName) => {
        let lookupValues = lookupItems.map(lookupItem => ({
            value: lookupItem[lookupField.lookup.key],
            text: lookupItem[lookupField.lookup.value]
        }));
        setLookupData(lookupData => ({ ...lookupData, [lookupName]: lookupValues }));
        setLookupFullData(lookupData => ({ ...lookupData, [lookupName]: lookupItems }));
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
            if (formikProps && dependantField && resetDependantField) { //reset the lookup options for child
                formikProps.setFieldValue(`${fieldManyDt["parentName"]}.item[${fieldManyDt["row"]}].${dependantField.name}`, null, false);
            }
            if (lookupData && dependantField && lookupData[`${dependantField.name}_${fieldValue}`]) return;

            if (dependantField && dependantField.lookup && dependantField.lookup.link && Array.isArray(dependantField.lookup.link)) {
                const lookupLinkObj = dependantField.lookup.link.filter(linkObj => linkObj.rel === LOOKUP_LINKS.LIST);
                let lookupLink = (lookupLinkObj[0]) ? (lookupLinkObj[0].href).replace(`{${dependantField.parents[0]}}`, fieldValue) : "";
                if (lookupLink !== "" && typeof (getLookupHandler) === "function") {
                    triggerLookupHandler(lookupLink, dependantField, `${dependantField.name}_${fieldValue}`);
                }
            }
        });
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

    const getLookupDataOptions = (beFormField) => {
        if(dynamicViewProps && dynamicViewProps.enableDependency
            && dynamicViewProps.dependentLookup && parentLookupKeyValue) {
            let fullFieldName = `${beFormField.lookup.key}_${parentLookupKeyValue}`;

            return lookupDataSet && lookupDataSet[fullFieldName] ? lookupDataSet[fullFieldName] : [];
        } else if (dynamicViewProps && dynamicViewProps.enableDynamicFields) {
            return lookupData && lookupData[dynamicViewProps.referenceLookupField]
                ? lookupData[dynamicViewProps.referenceLookupField] : [];
        }  else {
            return lookupData && lookupData[beFormField.name] ? lookupData[beFormField.name] : [];
        }
    };

    const getLookupFullDataOptions = (beFormField) => {
        if(dynamicViewProps && dynamicViewProps.enableDependency
            && dynamicViewProps.dependentLookup && parentLookupKeyValue) {
            let fullFieldName = `${beFormField.lookup.key}_${parentLookupKeyValue}`;

            return lookupFullDataSet && lookupFullDataSet[fullFieldName] ? lookupFullDataSet[fullFieldName] : [];
        } else if (dynamicViewProps && dynamicViewProps.enableDynamicFields) {

            return lookupFullData && lookupFullData[dynamicViewProps.referenceLookupField]
                ? lookupFullData[dynamicViewProps.referenceLookupField] : [];
        } else {
            return lookupFullData && lookupFullData[beFormField.name] ? lookupFullData[beFormField.name] : [];
        }
    };

    const getParentFieldValue = (field, manyDetails) => {
        if (formikProps && formikProps.values && field && field.parents
            && Array.isArray(field.parents) && field.parents[0]) {
            let parentFieldName = ((field.parents[0]).split('.')).pop();
            let parentField = getFieldFromList(parentFieldName, beField);
            return getLookupFieldValue(parentField, formikProps.values, manyDetails);
        }
    };

    const getFieldFromList = (fieldNamValue, fieldList) => {
        if(fieldList && fieldList.beFormFields && Array.isArray(fieldList.beFormFields)) {
            for(let beFieldChild of fieldList.beFormFields) {
                if (beFieldChild.name === fieldNamValue) {
                    return beFieldChild;
                }
            }
        }
    };

    const deleteOneToManyRow = function (index) {
        let data = (formikProps && formikProps.values) ? formikProps.values : beData;
        let dataObj = getFieldValue(data, fieldName);
        if (dataObj) {
            let newObj = { ...dataObj };
            newObj.item.splice(index, 1);
            formikProps && formikProps.setFieldValue(fieldName, newObj);
            setOneToManyFullData(newObj);
        }
    };

    const isReferenceLookupField = (beManyChild) => {
        return referenceLookupField && referenceLookupField.name === beManyChild.name;
    };

    const isDynamicViewField = (beManyChild) => {
        return dynamicValueField && dynamicValueField.name === beManyChild.name;
    };

    const renderBeParentChild = (beManyChild, childIndex, manyIndex) => {
        let parentDataPathName = "";
        if (oneToManyFullData.item && oneToManyFullData.item[manyIndex] && oneToManyFullData.item[manyIndex].rowidObject) {
            parentDataPathName = beField.name + "/" + oneToManyFullData.item[manyIndex].rowidObject;
        }
        parentDataPathName = (parentDataPath !== "") ? "/ " + parentDataPathName : parentDataPathName;

        if(!isChild && dynamicViewProperties.dynamicViewOn && dynamicViewProperties.dynamicViewOn === beManyChild.name) {
            let parentLkpKeyValue = "";
            if(dynamicViewProperties.enableDependency && dynamicViewProperties.parentLookupField) {
                if(oneToManyFullData.item[manyIndex] && oneToManyFullData.item[manyIndex][dynamicViewProperties.parentLookupField.name]) {
                    let parentLookupData = oneToManyFullData.item[manyIndex][dynamicViewProperties.parentLookupField.name];
                    parentLkpKeyValue = parentLookupData[dynamicViewProperties.parentLookupField.lookup.key];
                }
            }
            return <BeFormDynamicFieldView
                key={`formOneToManyGroup_${childIndex}_${index}`}
                beField={beManyChild}
                index={`${childIndex}_${index}`}
                formikProps={formikProps}
                formDisabled={formDisabled}
                dateFormat={dateFormat}
                maxColumns={maxColumns}
                fileHandler={fileHandler}
                getLookupHandler={getLookupHandler}
                beData={beData}
                dynamicViewProps={dynamicViewProperties}
                isChild={true}
                fieldName={`${fieldName}.item[${manyIndex}].${beManyChild.name}`}
                updateBEData={updateBEData}
                view={VIEW_TYPE.CARD}
                getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                parentDataPath={parentDataPathName}
                lookupDataSet={lookupData}
                lookupFullDataSet={lookupFullData}
                parentLookupKeyValue={parentLkpKeyValue}
                hideParentStatus={hideParentStatus}
                setBeFormdynamicFieldFormikProps={setBeFormdynamicFieldFormikProps}
            />;
        } else {
            return <BeFormDynamicFieldView
                key={`formOneToManyGroup_${childIndex}_${index}`}
                beField={beManyChild}
                index={`${childIndex}_${index}`}
                formikProps={formikProps}
                formDisabled={formDisabled}
                dateFormat={dateFormat}
                maxColumns={maxColumns}
                fileHandler={fileHandler}
                getLookupHandler={getLookupHandler}
                beData={beData}
                dynamicViewProps={dynamicViewProperties}
                isChild={true}
                fieldName={`${fieldName}.item[${manyIndex}].${beManyChild.name}`}
                updateBEData={updateBEData}
                view={VIEW_TYPE.CARD}
                getOneToManyBEDataHandler={getOneToManyBEDataHandler}
                parentDataPath={parentDataPathName}
                hideParentStatus={hideParentStatus}
                setBeFormdynamicFieldFormikProps={setBeFormdynamicFieldFormikProps}
            />;
        }
    };

    const renderBeManyChild = (beManyChild, childIndex, manyIndex, refLookupField, refLookupFieldVal) => {
        let oneToManyRowIdCondition = (oneToManyFullData && oneToManyFullData.item
            && oneToManyFullData.item[manyIndex] && oneToManyFullData.item[manyIndex].rowidObject);
        let oneToManyRowId = oneToManyRowIdCondition ? `${oneToManyFullData.item[manyIndex].rowidObject}_${manyIndex}` : `row_${manyIndex}`;
        let manyDt = { parentName: fieldName, row: manyIndex };
        
        if(isReferenceLookupField(beManyChild)) {
            return <BeFormDynamicField
                key={`formField_${oneToManyRowId}_${childIndex}`}
                beField={beManyChild}
                index={`${index}_${childIndex}`}
                formikProps={formikProps}
                formDisabled={formDisabled}
                dateFormat={dateFormat}
                maxColumns={maxColumns}
                manyDt={manyDt}
                locale={locale}
                dynamicViewProps={dynamicViewProperties}
                lookupOptions={getLookupDataOptions(beManyChild)}
                lookupFullDataSet={getLookupFullDataOptions(beManyChild)}
                lookupValueChangeHandler={lookupValueChangeHandler}
                setBeFormdynamicFieldFormikProps={setBeFormdynamicFieldFormikProps}
            />
        } else if(isDynamicViewField(beManyChild)) {
            return <BeFormDynamicField
                key={`formField_${oneToManyRowId}_${childIndex}`}
                beField={beManyChild}
                index={`${index}_${childIndex}`}
                formikProps={formikProps}
                formDisabled={formDisabled}
                dateFormat={dateFormat}
                maxColumns={maxColumns}
                manyDt={manyDt}
                locale={locale}
                dynamicViewProps={dynamicViewProperties}
                lookupFullDataSet={getLookupFullDataOptions(refLookupField)}
                referenceLookupField={refLookupField}
                refLookupFieldVal={refLookupFieldVal}
                setBeFormdynamicFieldFormikProps={setBeFormdynamicFieldFormikProps}
            />
        } else {
            return <BEFormField
                key={`formField_${oneToManyRowId}_${childIndex}`}
                beField={beManyChild}
                index={`${index}_${childIndex}`}
                formikProps={formikProps}
                formDisabled={formDisabled}
                dateFormat={dateFormat}
                lookupOptionsHandler={lookupOptionsHandler}
                maxColumns={maxColumns}
                manyDt={manyDt}
                locale={locale}
                lookupValueChangeHandler={lookupValueChangeHandler}
                view={VIEW_TYPE.CARD}
                fileHandler={fileHandler}
            />
        }
    };

    const getCardView = (manyLength) => {
        let itemList = [];
        for (let i = 0; i < manyLength; i++) {
            let refLookupFieldVal = "";
            let refLookupField = undefined;
            if(referenceLookupField && referenceLookupField.name) {
                refLookupField = getLookupByName(beField, referenceLookupField.name, false);
                if(refLookupField && oneToManyFullData.item[i][refLookupField.name]) {
                    refLookupFieldVal = oneToManyFullData.item[i][refLookupField.name][refLookupField.lookup.key];
                }
            }
            let itemRow = beField && beField.beFormFields && Array.isArray(beField.beFormFields)
                && beField.beFormFields.map((beManyChild, childIndex) => {
                    if (!beManyChild.many) {
                        if(!beManyChild.isHidden) {
                            return renderBeManyChild(beManyChild, childIndex, i, refLookupField, refLookupFieldVal);
                        }
                    } else {
                        return renderBeParentChild(beManyChild, childIndex, i);
                    }
                    return undefined;
                });
            itemList.push(
                <BEFormOneToManyRowItem
                    formikProps={formikProps}
                    beField={beField}
                    fieldName={fieldName}
                    isChild={isChild}
                    formDisabled={true}
                    deleteOneToManyRow={deleteOneToManyRow}
                    rowIndex={i}
                    dyanamicView={true}
                >
                    {itemRow}
                </BEFormOneToManyRowItem>
            )
            let itemCount =  document.querySelectorAll('.one-to-many-body .one-to-many-grid-row-parent').length;
            if(itemCount){
                productServiceNode.current = document.querySelectorAll('.one-to-many-body .one-to-many-grid-row-parent')[i];
                if(productServiceNode.current){
                    let hideParent = productServiceNode.current.querySelectorAll('.hideParent');
                    if(hideParent.length > 0){
                        productServiceNode.current.style.display = "none";
                    }else{
                        productServiceNode.current.style.display = "";
                    }
                }
            }
        }
        
        if(itemList &&  itemList.length  === 0) {
            if(hideParentStatus){
                itemList =  <div className='hideParent'></div>;
            }else{
                itemList =  <div className='one-to-many-no-items-message'>
                    {translate("BE_FORM_ITEMS_NOT_ADDED_MESSAGE", { FIELD_NAME: `${beField.label}` })}
                </div>;
            }
        }
        return itemList;
    };
    
    const renderDynamicFieldView = () => {

        const manyLength = (oneToManyFullData && oneToManyFullData.item) ? oneToManyFullData.item.length : 0;
        let itemList = getCardView(manyLength);
        if (isChild) {
            return (
                <div className={"one-to-many-child-section"}>
                    <Section title={beField.label} collapsible data-testid={"section_"+beField.label}>
                        <div className='one-to-many-body'>
                            {itemList}
                        </div>
                    </Section>
                </div>
            );
        } else {
            return (
                <div className="one-to-many-container" data-testid="one_to_many_container">
                    <div className='one-to-many-header' data-testid="one_to_many_header">
                        <div className="one-to-many-header-title" data-testid="one_to_many_header_title">{beField.label}
                            {beField.required === true && <span className="one-to-many-section-mandatory"> * </span>}
                        </div>
                    </div>
                    {   
                        beField.sectionError != null && 
                        <p className="one__to__many__section__error">
                            <i className="aicon aicon__close-solid close-icon"></i> {beField.sectionError}
                        </p>
                    }
                    <div className='one-to-many-body' data-testid="one_to_many_body">
                        { itemList }
                    </div>
                </div>
            );
        }
    };
    return <>
        {
            dynamicViewProperties && renderDynamicFieldView()
        }
    </>;
};
export default BeFormDynamicFieldView;
