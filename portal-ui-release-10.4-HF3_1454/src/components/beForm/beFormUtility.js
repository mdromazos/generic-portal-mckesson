import React from 'react';
import BEFORM_CONFIG from "./beFormConfig";
import { IconButton, Tooltip } from '@informatica/droplets-core';
import moment from 'moment';


function objectDeepKeys(obj){
    return Object.keys(obj)
      .filter(key => obj[key] instanceof Object)
      .map(key => objectDeepKeys(obj[key]).map(k => `${key}.${k}`))
      .reduce((x, y) => x.concat(y), Object.keys(obj))
};

const handleFormikErrors = ({ errors, setFieldTouched, handleSubmit }) => {
    const errorrKeys = objectDeepKeys(errors);
    if (Object.entries(errors).length === 0) {
        return handleSubmit();
    }
    errorrKeys.map((err) => setFieldTouched(err, true));
    return false;
};

const getFieldName = (beField, manyDt) => {

    let fieldName;

    if (manyDt) {
        fieldName = isLookupField(beField) ? `${manyDt["parentName"]}.item[${manyDt["row"]}].${beField.name}.${beField.lookup.key}` : `${manyDt["parentName"]}.item[${manyDt["row"]}].${beField.name}`;
    } else {
        fieldName = isLookupField(beField) ? `${beField.name}.${beField.lookup.key}` : beField.name;
    }
    return fieldName;
};

const getLookUpRootFieldName = (beField, manyDt) => {
    let fieldName;
    if (manyDt) {
        fieldName = `${manyDt["parentName"]}.item[${manyDt["row"]}].${beField.name}`;
    } else {
        fieldName = `${beField.name}`;
    }
    return fieldName;
};

const getLookupFieldValue = (beField, data, manyDt) => {
    const fieldName = (manyDt) ? `${manyDt["parentName"]}.item[${manyDt["row"]}].${beField.name}` : beField.name;
    return getFieldValue(data,`${fieldName}.${beField.lookup.key}` );
};

const getLookupDispalyValue = (beField, data, manyDt) => {
    const fieldName = (manyDt) ? `${manyDt["parentName"]}.item[${manyDt["row"]}].${beField.name}` : beField.name;
    return getFieldValue(data,`${fieldName}.${beField.lookup.value}` );
};

const isLookupField = (beField) => {
    const { DATA_TYPES } = BEFORM_CONFIG;
    return !!(beField && beField.dataType === DATA_TYPES.LOOKUP && beField.lookup
        && beField.lookup.link  && Array.isArray(beField.lookup.link));
};

const isDependantLookup = (beField) => {
    return !!beField.parents;
};

const isParentLookup = (beField) => {
    return !!(beField.dependents && Array.isArray(beField.dependents) && beField.dependents.length > 0);
};

const getFieldValue = (dataObj, fieldName) => {
    const { ONE_TO_MANY } = BEFORM_CONFIG;
    let tokens = fieldName.split('.');
    let output = dataObj ? JSON.parse(JSON.stringify(dataObj)): {};
    // let output = dataObj;
    
    for (let i = 0; i < tokens.length; i++) {

        if(tokens[i].indexOf("[")!==-1 && tokens[i].indexOf("]")!==-1) {
            let arrayKeys = tokens[i].split("[");
            if (!output || typeof output[arrayKeys[0]] === 'undefined') {
                return null;                        
            }
            let indexValue = (arrayKeys[1]).substring(0, arrayKeys[1].length-1);
            if (typeof output[arrayKeys[0]][indexValue] === 'undefined') {
                return null;   
            }
            output = output[arrayKeys[0]][indexValue];

        } else {
            if(!output || typeof output[tokens[i]] === 'undefined'){
                return null;
            }
            output = output[tokens[i]];
        }
    }
    return (tokens.pop() === ONE_TO_MANY.ROW_ID_KEY) ? output.trim() : output;


    // const { ONE_TO_MANY } = BEFORM_CONFIG;
    // let tokens = fieldName.split('.');
    // console.log("TOKENS: " + tokens);

    // if (tokens.length === 1) {
    //     if(!dataObj || typeof dataObj[tokens[0]] === 'undefined'){
    //         return null;
    //     }
    //     return (tokens.pop() === ONE_TO_MANY.ROW_ID_KEY) ? dataObj[tokens[0]].trim() : dataObj[tokens[0]];
    // } else {
    //     if(tokens[0].indexOf("[")!==-1 && tokens[0].indexOf("]")!==-1) {
    //         let arrayKeys = tokens[0].split("[");
    //         if (!dataObj || typeof dataObj[arrayKeys[0]] === 'undefined') {
    //             return null;                        
    //         }
    //         let indexValue = (arrayKeys[1]).substring(0, arrayKeys[1].length-1);
    //         if (typeof dataObj[arrayKeys[0]][indexValue] === 'undefined') {
    //             return null;   
    //         }
    //         return getFieldValueRec(dataObj[arrayKeys[0]][indexValue], tokens[1]);
    //     } else {
    //         if(!dataObj || typeof dataObj[tokens[0]] === 'undefined'){
    //             return null;
    //         }
            
    //         return getFieldValueRec(dataObj[tokens[0]], tokens[1]);
    //     }
    // }
};

const setFieldValue = (obj, fieldName, fieldValue) => {

    let putInto = obj;
    let tokens = fieldName.split('.');
    for (let i = 0; i < tokens.length; i++) {
        let name = tokens[i];
      
        if(name.indexOf("[")!==-1 && name.indexOf("]")!==-1) {
            let tokenKey = name.split("[");
            let indexValue = (tokenKey[1]).substring(0, tokenKey[1].length-1);
            if (typeof putInto[tokenKey[0]] === 'undefined') {
                putInto[tokenKey[0]] =[];
            }
            if(i === tokens.length - 1) {
                putInto[tokenKey[0]][indexValue] = fieldValue;
            } else {
                putInto[tokenKey[0]][indexValue] = (putInto[tokenKey[0]][indexValue]) ? putInto[tokenKey[0]][indexValue] :{};
            }
            putInto = putInto[tokenKey[0]][indexValue];
        } else {
            if(i === tokens.length - 1) {
                putInto[name] = fieldValue;
            } else {
                putInto[name] = (putInto[name]) ? putInto[name] :{};
            }

            putInto = putInto[name];						
        }
    }
};

const fetchLookupData = (getLookupHandler, lookupLink, lookupDataResponseHandler) => {
    getLookupHandler(lookupLink)
        .then(resp => {
            if (resp && resp.hasOwnProperty('item') && resp.item.length > 0) {
                const lookupItems = resp.item.map((lookupObject) => ({
                    value: lookupObject['id'],
                    text: lookupObject['label']
                }));
                lookupDataResponseHandler(lookupItems);
            }
        })
        .catch(error => { console.log(error)});
};

const fetchLookupListData = (getLookupHandler, lookupLink, lookupDataResponseHandler) => {
    getLookupHandler(lookupLink)
        .then(resp => lookupDataResponseHandler(resp))
        .catch(error => { console.log(error)});
};

const getIconButton = (clickHandler, toolTipLabel, iconName, iconClass, toolTipClass, toolTipPosition = 'top') => {    
    return (<Tooltip content={toolTipLabel} position={toolTipPosition} className = {toolTipClass? toolTipClass : ""}>
        <IconButton onClick={clickHandler} data-testid={toolTipLabel+"_button"}>
            <i className={"beform__ctrl__icon__" + iconClass + " aicon aicon__" + iconName} />
        </IconButton>
    </Tooltip>);
};

const getFieldFromSectionList = (fieldName, sectionMetaData) => {
    let field;
    sectionMetaData.beFormFields.forEach(function (beField) {
        if (beField.name === fieldName) {
            field = beField;
        }
    });
    return field;
};

const updateDateValue = (formikProps, beField, e, manyDt ) => {
    const fieldName = getFieldName(beField, manyDt);
    formikProps.setFieldValue(fieldName, e);
};

const formatDateTime = (value, dateFormat) => {
    return (value) ? moment(value).format(dateFormat) : "";
};

const renderCustomError = (errorMessage, customCssClass = '') => {

    return (
        <div className={`d-form__error ${customCssClass}`}>
            <i class="d-form__error-icon"></i>
            <span class="d-form__error-message">{errorMessage}</span>
        </div>
    )
};



/**
 * Function used to giving out difference between form object representing
 * Formik value object and the initial post-BE load object
 * @param obj1
 * @param obj2
 * @returns {*}
 * @constructor
 */
const getObjectDiff = function (obj1, obj2) {

    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
        return obj1;
    }

    let diffs = {};
    let key;

    let arraysMatch = function (arr1, arr2) {

        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;

    };

    let compare = function (item1, item2, key, itemObj2) {

        let type1 = Object.prototype.toString.call(item1);
        let type2 = Object.prototype.toString.call(item2);

        if (type2 === '[object Undefined]') {
            diffs[key] = null;
            if(itemObj2) itemObj2[key] = null;
            return;
        }

        if (type1 !== type2) {
            diffs[key] = item2;
            return;
        }

        if (type1 === '[object Object]') {
            let objDiff = getObjectDiff(item1, item2);
            if (Object.keys(objDiff).length > 1) {
                diffs[key] = objDiff;
            }
            return;
        }

        if (type1 === '[object Array]') {
            if (!arraysMatch(item1, item2)) {
                diffs[key] = item2;
            }
            return;
        }

        if (type1 === '[object Function]') {
            if (item1.toString() !== item2.toString()) {
                diffs[key] = item2;
            }
        } else {
            if (item1 !== item2 ) {
                diffs[key] = item2;
            }
        }

    };

    for (key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            compare(obj1[key], obj2[key], key, obj2);
        }
    }

    for (key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (obj1 && !obj1[key] && obj1[key] !== obj2[key] ) {
                diffs[key] = obj2[key];
            }
        }
    }

    return diffs;
};

/**
 * BES CRUD requires the creation of $original object for update comparisons
 * @param diffObject
 * @param originalObject
 * @returns {{}}
 */
const create$Original = function (diffObject, originalObject) {
    const obj = {};
    Object.keys(diffObject).forEach(function (value) {
        if (diffObject[value] === '' || diffObject[value] === null) {
            diffObject[value] = null;
            obj[value] = originalObject[value];
            return;
        }

        if (diffObject.hasOwnProperty(value) && ( originalObject && (originalObject[value] === false || originalObject[value] === true))) {
            obj[value] = originalObject[value];
            return;
        }
        if (diffObject[value]) {
            obj[value] = !originalObject[value] ? null : originalObject[value];
        }
    });
    return obj;
};

const getMatchingItemFromList = (item, itemList, matchProperty) => {

    let matcheditem = null;

    if (itemList && Array.isArray(itemList)) {
        for (let i = 0; i < itemList.length; i++) {
            if (item[matchProperty] && itemList[i][matchProperty] === item[matchProperty]) {
                matcheditem = itemList[i];
                break;
            }
        }
    }
    return matcheditem;
};

const getDeletedOneToManyItems = (originalItemList, itemList) => {
    
    const { ONE_TO_MANY } = BEFORM_CONFIG;

    let deletedItems = [];
    if (originalItemList && Array.isArray(originalItemList) && itemList && Array.isArray(itemList)) {
        for (let i = 0; i < originalItemList.length; i++) {
            let itemMatch = false;
            let originalItem = originalItemList[i];
            for (let k = 0; k < itemList.length; k++) {
                if (originalItem[ONE_TO_MANY.ROW_ID_KEY] === itemList[k][ONE_TO_MANY.ROW_ID_KEY]) {
                    itemMatch = true;
                    break;
                }
            }
            if (!itemMatch) {
                deletedItems.push(originalItemList[i]);
            }
        }

    }
    return deletedItems;
};

export {
    getFieldName,
    getLookupFieldValue,
    getLookupDispalyValue,
    getLookUpRootFieldName,
    isLookupField,
    isDependantLookup,
    isParentLookup,
    getFieldValue,
    setFieldValue,
    fetchLookupData,
    getIconButton,
    getFieldFromSectionList,
    formatDateTime,
    updateDateValue,
    renderCustomError,
    fetchLookupListData,
    getObjectDiff,
    create$Original,
    getMatchingItemFromList,
    getDeletedOneToManyItems,
    objectDeepKeys,
    handleFormikErrors
};
