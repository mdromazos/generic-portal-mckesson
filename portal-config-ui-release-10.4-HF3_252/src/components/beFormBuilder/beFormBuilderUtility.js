
const getInitialSectionData = () => {
    return {
        "name":"",
        "order": 0,
        "beFormFields": []
    };
};

const getBeFormFieldFromSelectedFields = (hierarchyName, selectedBeFields = []) => {
    if(!selectedBeFields) return;

    for(const selectedBeField of selectedBeFields) {
        if(selectedBeField.hierarchyName === hierarchyName) {
            return selectedBeField;
        }
        if(selectedBeField.many) {
            let selectedBeFormChild = getBeFormFieldFromSelectedFields(hierarchyName, selectedBeField.beFormFields);
            if(selectedBeFormChild) return selectedBeFormChild;
        }
    }
};

const getImmediateParentFromFieldList = (beField, beFieldList) => {
    let hierarchyNames = beField.hierarchyName.split('.');

    let immediateParentNode = { 'beFormFields' : beFieldList};
    let currentHierarchyName = "";
    for(let hierarchyName of hierarchyNames) {
        currentHierarchyName = `${currentHierarchyName}${hierarchyName}`;
        if(hierarchyName !== beField.name) {
            immediateParentNode = getBeFormFieldFromSelectedFields(
                currentHierarchyName, immediateParentNode.beFormFields);
        }
        currentHierarchyName = `${currentHierarchyName}.`;
    }
    return immediateParentNode;
};

const getHierarchyNames = (hierarchyNames, beFormFields) => {
    if(!beFormFields) return hierarchyNames;

    beFormFields && beFormFields.forEach(beFormField => {
        hierarchyNames.push(beFormField.hierarchyName);
        if(beFormField.many && Array.isArray(beFormField.beFormFields)) {
            hierarchyNames = getHierarchyNames(hierarchyNames, beFormField.beFormFields);
        }
    });
    return hierarchyNames
};

const getDefaultFieldType = (many, hierarchyName, dataType) => {
    if(many && hierarchyName.split('.').length === 1) {
        return "cardView";
    } else if(!many) {
        switch(dataType.toUpperCase()) {
            case "STRING": return "textField";
            case "BOOLEAN": return "radioButton";
            case "LOOKUP": return "dropdown";
            case "HYPERLINKTEXT": return "textField";
            default: return "";
        }
    }
};

const transformBeMetaData = (beFormMetadata, metadataPath, hierarchyName, many) => {
    if(!beFormMetadata) {
        return;
    }
    let transformedFields = JSON.parse(JSON.stringify(beFormMetadata));
    transformedFields.attributeSelector = metadataPath;
    transformedFields.hierarchyName = hierarchyName;
    transformedFields.many = many;
    transformedFields.beFormFields = [];
    if(beFormMetadata.field && Array.isArray(beFormMetadata.field)) {
        let beFormFields = beFormMetadata.field.filter(beFieldMetadata => {
            return !beFieldMetadata.system;
        }).map(beFieldMetadata => {
            let fieldMetadata = JSON.parse(JSON.stringify(beFieldMetadata));
            fieldMetadata.attributeSelector = `${metadataPath}.field[?(@.name=="${beFieldMetadata.name}")]`;
            fieldMetadata.hierarchyName = hierarchyName ? `${hierarchyName}.${beFieldMetadata.name}` : `${beFieldMetadata.name}`;
            fieldMetadata.many = false;
            return fieldMetadata;
        }).sort((field1, field2) => {
            return field1.name.localeCompare(field2.name);
        });
        transformedFields.beFormFields = transformedFields.beFormFields.concat(beFormFields);
        transformedFields.field = null;
    }
    if(beFormMetadata.child && Array.isArray(beFormMetadata.child)) {
        let beFormFields = beFormMetadata.child.map(beFieldMetadata => {
            let attributeSelector = `${metadataPath}.child[?(@.name=="${beFieldMetadata.name}")]`;
            let newHierarchyName = hierarchyName ? `${hierarchyName}.${beFieldMetadata.name}` : `${beFieldMetadata.name}`;

            return transformBeMetaData(beFieldMetadata, attributeSelector, newHierarchyName, true);
        }).sort((field1, field2) => {
            return field1.name.localeCompare(field2.name);
        });
        transformedFields.beFormFields = transformedFields.beFormFields.concat(beFormFields);
        transformedFields.child = null;
    }
    return transformedFields;
};

export {
    getBeFormFieldFromSelectedFields,
    getHierarchyNames,
    getDefaultFieldType,
    getImmediateParentFromFieldList,
    getInitialSectionData,
    transformBeMetaData
};
