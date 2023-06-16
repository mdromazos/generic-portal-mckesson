import React, { useEffect, useState } from 'react';
import { Tree, useTreeState, useTreeRenderers, treeExpand, treeCheck, Section } from "@informatica/droplets-core";
import { fetchLookupListData} from "./beFormUtility";
import "./beForm.css";
import BEFORM_CONFIG from "./beFormConfig";

const BeFormHierarchyField = ({ beField, formikProps, disabled, getLookupHandler, getOneToManyBEDataHandler, fieldName, beData}) => {

    const [selectedValues, setSelectedValues] = useState(undefined);
    const [initialSelectedValues, setInitialSelectedValues] = useState(undefined);
    const [lookupData, setLookupData] = useState([]);
    const [hierarchyData, setHierarchyData] = useState([]);
    const { LOOKUP_LINKS, ONE_TO_MANY } = BEFORM_CONFIG;
    const [oneToManyData, setOneToManyData] = useState(undefined);
    const [hierarchyKeyItemMap, setHierarchyKeyItemMap] = useState([]);

    useEffect(() => {
        retrieveAndUpdateReferenceLookupFieldData();
    }, []);

    useEffect(() => {
        /*
        const fieldName = getFieldName(beField);
        let keyObjects = constructSelectedData(formikProps.values[fieldName]);
        setSelectedValues(keyObjects);
        */
        let params = "recordsToReturn=100&many=true&firstRecord=1&returnTotal=true";
        fetchOneToManyData(params);
    }, [disabled, beData]);

    const fetchOneToManyData = (params) => {
        if (typeof (getOneToManyBEDataHandler) === "function") {
            let dataPath = beField.name;
            getOneToManyBEDataHandler(dataPath, params)
                .then(resp => {
                    if (formikProps) {
                        let dataObj = { ...resp };// Stringify
                        dataObj[ONE_TO_MANY.ORIGINAL_COPY] = resp;
                        formikProps.setFieldValue(fieldName, dataObj, false);
                        let keyObjects = constructSelectedData(resp);
                        setSelectedValues(keyObjects);
                        setInitialSelectedValues(keyObjects);
                        setOneToManyData(JSON.parse(JSON.stringify(resp)));
                    }
                })
                .catch(error=> { console.log(error) });
        }
    };

    const constructSelectedData = (fieldValues) => {
        let {lookup: { key }} = getBeFormField(beField.referenceLookupField);
        if(beField.referenceLookupField && fieldValues
                && fieldValues.item && Array.isArray(fieldValues.item)) {

            //create the map
            let hierarchyKeyItemMapList =   fieldValues.item.map(
                itemObject => {
                    let itemKeyObject = {}
                    itemKeyObject[itemObject[beField.referenceLookupField][key]] = itemObject;
                    return itemKeyObject;
                }
            );
            setHierarchyKeyItemMap(hierarchyKeyItemMapList);
            return  fieldValues.item.map(
                itemObject => itemObject[beField.referenceLookupField][key]
            );
        }
        return [];
    };

    const retrieveAndUpdateReferenceLookupFieldData = () => {
        if(beField.referenceLookupField && beField.beFormFields && Array.isArray(beField.beFormFields)) {
            let referenceLookupField = getBeFormField(beField.referenceLookupField);
            if(referenceLookupField && referenceLookupField.lookup) {
                const lookupLink = referenceLookupField.lookup.link.filter(
                    linkObj => linkObj.rel === LOOKUP_LINKS.LIST
                );
                if (lookupLink[0] && typeof (getLookupHandler) === "function") {
                    triggerLookupHandler(lookupLink[0].href, referenceLookupField);
                }
            }
        }
    };

    const triggerLookupHandler = (lookupLink, referenceLookupField) => {
        const lookupDataResponseHandler = (respData) => {
            let lookupDataMap = createLookupDataMap(respData, referenceLookupField);
            setLookupData(lookupDataMap);
            updateTransformedHierarchyData(respData, referenceLookupField.lookup.key, beField.parentColumn);
        };
        fetchLookupListData(getLookupHandler, lookupLink, lookupDataResponseHandler);
    };

    const createLookupDataMap = (lookupData, referenceLookupField) => {
        let lookupDataMap = {};
        if(lookupData && lookupData.item && Array.isArray(lookupData.item)) {
            lookupData.item.forEach(lookupDatum => {
                lookupDataMap[lookupDatum[referenceLookupField.lookup.key]] = lookupDatum;
            });
        }
        return lookupDataMap;
    };

    const getBeFormField = (fieldName) => {
        if(beField.beFormFields && Array.isArray(beField.beFormFields)) {
            for(let field of beField.beFormFields) {
                if(field.name === fieldName) {
                    return field;
                }
            }
        }
    };

    const getItemFromHierArchy = (itemKey) => {
        let matchedItem = null;
        if (hierarchyKeyItemMap && Array.isArray(hierarchyKeyItemMap)) {
            for (let i = 0; i < hierarchyKeyItemMap.length; i++) {
                if (hierarchyKeyItemMap[i][itemKey]) {
                    matchedItem = hierarchyKeyItemMap[i][itemKey];
                    break;
                }
            }
        }
        return matchedItem;
    };

    const saveHierarchyView = (selected, isChecked) => {
        if(selected && Array.isArray(selected)) {
            
            let selectedIds;
            selectedIds = isChecked ?  [...new Set([...selectedValues, ...selected])] : selectedValues.filter((elem) => !selected.includes(elem));
            
            setSelectedValues(selectedIds);

            let {lookup: { key, value }} = getBeFormField(beField.referenceLookupField);
            let dataToBeSaved = selectedIds.map(selectedItem => {
                let matchedItem = getItemFromHierArchy(selectedItem);
                if(matchedItem) {
                    let itemObject = JSON.parse(JSON.stringify(matchedItem));
                    return itemObject;
                } else {
                    let itemObject = {};
                    let refItem = {};
                    refItem[key] = lookupData[selectedItem][key];
                    refItem[value] = lookupData[selectedItem][value];
                    itemObject[beField.referenceLookupField] = refItem;
                    return itemObject;
                }

            });
            //const fieldName = getFieldName(beField);
            let newObj = { item: dataToBeSaved };
            newObj[ONE_TO_MANY.ORIGINAL_COPY] = oneToManyData;

            formikProps.setFieldValue(fieldName, newObj);
        }
    };

    const updateTransformedHierarchyData = (hierarchyData, referenceColumn, parentColumn) => {

        if(hierarchyData && hierarchyData.item && hierarchyData.item.length) {
            const childNodeMap = constructChildNodeMap(hierarchyData.item, parentColumn);
            let hierarchyMap = {};
            hierarchyData.item.forEach(hierarchyItem => {
                hierarchyMap[hierarchyItem[referenceColumn]] = hierarchyItem;
            });
            let transformedHierarchyData = [];
            for(let hierarchyItem of hierarchyData.item) {
                if(!hierarchyItem[parentColumn]) {
                    let updatedHierarchyItem = JSON.parse(JSON.stringify(hierarchyItem));
                    constructChildNodes(updatedHierarchyItem, childNodeMap, referenceColumn);
                    transformedHierarchyData.push(updatedHierarchyItem);
                }
            }// Gets the root nodes and sets its child nodes under items
            setHierarchyData(transformedHierarchyData);
        }
    };

    const constructChildNodes = (parentNode, childNodeMap, referenceColumn) => {
        let childNodes = childNodeMap[parentNode[referenceColumn]];
        if(childNodes && childNodes.length) {
            parentNode.items = [];
            for(let childNode of childNodes) {
                constructChildNodes(childNode, childNodeMap, referenceColumn);
                parentNode.items.push(childNode);
            }
        }
        return parentNode;
    };

    const constructChildNodeMap = (hierarchyItems, parentColumn) => {
        let childNode = {};
        for(let hierarchyItem of hierarchyItems) {
            if(!childNode[hierarchyItem[parentColumn]]) {
                childNode[hierarchyItem[parentColumn]] = [];
            }
            childNode[hierarchyItem[parentColumn]].push(hierarchyItem);
        }
        return childNode;
    };

    const renderHierarchyModel = () => {
        let {lookup: { key, value }} = getBeFormField(beField.referenceLookupField);
        return hierarchyData.map(hierarchyItem => createTreeModel(hierarchyItem, key, value));
    };

    const getSectionLabel = () => {
        return beField.required === true ? 
            <>{beField.label} <span className="one-to-many-section-mandatory"> * </span></>
            : beField.label;
    }

    const createTreeModel = (hierarchyItem, keyColumn, valueColumn) => {
        
        const treeNode = {};
        treeNode.id = hierarchyItem[keyColumn];
        treeNode.name= hierarchyItem[valueColumn];
        treeNode.state = {
            expanded: true,
            disabled : disabled,
            checked : initialSelectedValues && initialSelectedValues.includes(treeNode.id)
        }
        if(hierarchyItem.items && hierarchyItem.items.length) { 
            treeNode.children = hierarchyItem.items.map(childNode => createTreeModel(childNode, keyColumn, valueColumn))
        }

        return treeNode;
    };
   
    const treeProps = useTreeState({nodes : renderHierarchyModel()})
    const renderers = useTreeRenderers(treeExpand(), treeCheck());

    useEffect(()=> {
        treeProps.setTreeState({nodes : renderHierarchyModel()})
    },[hierarchyData,initialSelectedValues]);

    return <>
        {
            selectedValues && !!(hierarchyData && hierarchyData.length)
            && <div className={"one-to-many-child-section"}>

                <Section title={getSectionLabel()} data-testid="hierarchy-section">
                    <div className='tree-container' data-testid="tree-container">
                        {   
                            beField.sectionError != null && 
                            <p className="one__to__many__section__error" data-testid="tree-container-error">
                                <i className="aicon aicon__close-solid close-icon"></i> {beField.sectionError}
                            </p>
                        }
                        <Tree 
                            data-testid="tree-hierarchy"
                            renderers={renderers}
                            onCheck={(selected,isChecked) => saveHierarchyView(selected, isChecked)}  
                            {...treeProps} 
                        />
                    </div>
                </Section>
            </div>
        }
    </>;
};

export default BeFormHierarchyField;
