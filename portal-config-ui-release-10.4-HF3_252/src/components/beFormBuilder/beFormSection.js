import React, { useEffect, useState } from "react";
import { IconButton, Section } from "@informatica/droplets-core";
import BeFormFieldGroup from "./beFormFieldGroup";
import BeFormSectionHeader from "./beFormSectionHeader";
import {getBeFormFieldFromSelectedFields, getHierarchyNames,
    getDefaultFieldType, getImmediateParentFromFieldList} from './beFormBuilderUtility';
import CONFIG from "../../config/config";
import "./beFormBuilder.css";
import { useTranslation } from "react-i18next";

const BeFormSection = ({
    configName,
    configType,
    beFormSection,
    beFormMetadata,
    addNewSection,
    deleteSection,
    currentStep,
    moveSectionUp,
    moveSectionDown,
    updateBeFormSection,
    setSelectedFormSection,
    setSelectedFormField,
}) => {

    let [selectedField, setSelectedField] = useState({});
    let [availableField, setAvailableField] = useState({});
    let [beFormFields, setBeFormFields] = useState([]);
    let [beFormFieldsMetadata, setBeFormFieldsMetadata] = useState([]);

    const { t: translate } = useTranslation();

    useEffect(() => {
        if(beFormSection.beFormFields && Array.isArray(beFormSection.beFormFields)
            && beFormSection.beFormFields.length > 0) {

            if(selectedField && selectedField.hierarchyName)
                enrichSelectedField(beFormSection.beFormFields);

            if(availableField && availableField.hierarchyName)
                enrichAvailableField(beFormSection.beFormFields);

            let hierarchyNames = getHierarchyNames([], beFormSection.beFormFields);

            let newBeFieldsMetadata = JSON.parse(JSON.stringify(beFormMetadata.beFormFields));
            let updatedBeFieldMetadata = updateAvailableFieldList(newBeFieldsMetadata, hierarchyNames, []);
            setBeFormFieldsMetadata(updatedBeFieldMetadata);
        } else {
            setBeFormFieldsMetadata(beFormMetadata.beFormFields);
        }
        setBeFormFields(beFormSection.beFormFields);
    }, [beFormSection]);

    useEffect(() => {
        setSelectedFieldData({});
    }, [currentStep]);

    const enrichSelectedField = (beFormFields) => {
        let immediateParentNode = getImmediateParentFromFieldList(selectedField, beFormFields);
        for(let beFormField of immediateParentNode.beFormFields) {
            if(beFormField.hierarchyName === selectedField.hierarchyName) {
                setSelectedField(beFormField);
            }
        }
    };

    const enrichAvailableField = (beFormFields) => {
        let immediateParentNode = getImmediateParentFromFieldList(selectedField, beFormFields);
        for(let beFormField of immediateParentNode.beFormFields) {
            if(beFormField.hierarchyName === availableField.hierarchyName) {
                setAvailableField(beFormField);
            }
        }
    };

    const updateAvailableFieldList = (beFieldsMetadata, selectedFieldHierarchyNames, newBeFormFiledMetadata) => {
        if(!beFieldsMetadata) return;

        beFieldsMetadata.forEach(beFieldMetadata => {
            if(beFieldMetadata.many) {

                let filteredBeFormFields = updateAvailableFieldList(
                    beFieldMetadata.beFormFields, selectedFieldHierarchyNames, []);
                if(filteredBeFormFields && filteredBeFormFields.length > 0) {
                    beFieldMetadata.beFormFields = filteredBeFormFields;
                    newBeFormFiledMetadata.push(beFieldMetadata);
                }
            } else if(selectedFieldHierarchyNames.indexOf(beFieldMetadata.hierarchyName) === -1) {
                newBeFormFiledMetadata.push(beFieldMetadata);
            }
        });
        return newBeFormFiledMetadata;
    };

    const setSelectedFieldData = (beField) => {
        setSelectedFormSection(beFormSection);
        setSelectedFormField(beField);
        setSelectedField(beField);
    };

    const updateBeSectionField = (fieldName, fieldValue) => {
        if(fieldName) {
            let beFormSectionCopy = JSON.parse(JSON.stringify(beFormSection));
            switch(fieldName) {
                case CONFIG.SECTION_NAME:
                    beFormSectionCopy.name = fieldValue;
                    break;
                case CONFIG.HIDE_SECTION_NAME:
                    beFormSectionCopy.hideName = fieldValue;
                    break;
                case CONFIG.BE_FORM_FIELDS:
                    if(fieldValue) {
                        beFormSectionCopy.beFormFields = fieldValue;
                    }
                    break;
                default:
                    break;
            }
            updateBeFormSection(beFormSectionCopy);
        }
    };

    const formatSelectedBeFieldAndChildren = (beFormFieldData) => {
        if(!beFormFieldData) {
            return beFormFieldData;
        }
        let { name, attributeSelector, hierarchyName, many, lookup, dataType, label, readOnly, required } = beFormFieldData;
        let selectedBeField = { name, attributeSelector, hierarchyName, many, configName, configType };
        selectedBeField.fieldType = selectedBeField.fieldType ? selectedBeField.fieldType : getDefaultFieldType(many, hierarchyName, dataType);

        if(!many) {
            selectedBeField.required = selectedBeField.required ? selectedBeField.required : (required ? required : false);
        } else {
            selectedBeField.enableValidation = selectedBeField.enableAlternateView ? selectedBeField.enableAlternateView : false;
        }
        selectedBeField.metadata = { name, attributeSelector, hierarchyName, many, dataType, label, readOnly, required, lookup };

        if(beFormFieldData.beFormFields && Array.isArray(beFormFieldData.beFormFields)) {
            selectedBeField.beFormFields = beFormFieldData.beFormFields.map(beFormField => {
                if(beFormField.many) {
                    return formatSelectedBeFieldAndChildren(beFormField);
                } else {
                    let { name, attributeSelector, hierarchyName, many, dataType, lookup, label, readOnly, required } = beFormField;
                    let newBeFormField = { name, attributeSelector, hierarchyName, many, configName, configType };
                    newBeFormField.fieldType = newBeFormField.fieldType ? newBeFormField.fieldType : getDefaultFieldType(many, hierarchyName, dataType);
                    newBeFormField.required = newBeFormField.required ? newBeFormField.required : (required ? required : false);
                    newBeFormField.metadata = { name, attributeSelector, hierarchyName, many, dataType, label, lookup, readOnly, required };
                    return newBeFormField
                }
            });
        }
        return selectedBeField;
    };

    const getBeFormFieldFromMetadataList = (hierarchyName, beFieldsMetadata = []) => {

        if(!beFieldsMetadata) return;

        for(const beFieldMetadata of beFieldsMetadata) {
            if(beFieldMetadata.hierarchyName === hierarchyName) {
                return beFieldMetadata;
            }
            if(beFieldMetadata.many) {
                let childBeFormFieldMetadata = getBeFormFieldFromMetadataList(hierarchyName, beFieldMetadata.beFormFields);
                if(childBeFormFieldMetadata) return childBeFormFieldMetadata;
            }
        }
    };

    const trimBeFormField = (beFormField) => {
        if(!beFormField) return;

        let beField = beFormField;
        if(beFormField.metadata) {
            beField = beFormField.metadata;
        }
        let { name, attributeSelector, hierarchyName, many, dataType, label, readOnly, required, lookup } = beField;
        let selectedBeField = { name, attributeSelector, hierarchyName, many, configName, configType };
        selectedBeField.fieldType = selectedBeField.fieldType ? selectedBeField.fieldType : getDefaultFieldType(many, hierarchyName, dataType);
        if(!many) {
            selectedBeField.required = selectedBeField.required ? selectedBeField.required : (required ? required : false);
        } else {
            selectedBeField.enableValidation = selectedBeField.enableAlternateView ? selectedBeField.enableAlternateView : false;
        }
        selectedBeField.metadata = { name, attributeSelector, hierarchyName, many, dataType, label, readOnly, required, lookup };
        return selectedBeField;
    };

    const trimBeChildrenMetadata = (beFieldMetadata) => {
        if(!beFieldMetadata) return;

        let trimmedBeFormData = trimBeFormField(beFieldMetadata);
        if(beFieldMetadata.many) {
            trimmedBeFormData.beFormFields = beFieldMetadata.beFormFields.map(beField => {
                return trimBeChildrenMetadata(beField);
            });
        }
        return trimmedBeFormData;
    };

    const updateSelectedBeFormFields = (selectedBeField, hierarchyNames, beFormFieldsCopy) => {

        let immediateParentNode = { 'beFormFields' : beFormFieldsCopy};
        let immediateParentNodeMeta = JSON.parse(JSON.stringify(beFormMetadata));
        let currentHierarchyName = "";
        for(let hierarchyName of hierarchyNames) {
            currentHierarchyName = `${currentHierarchyName}${hierarchyName}`;
            if(hierarchyName !== availableField.name) {
                let tempFieldNode = getBeFormFieldFromSelectedFields(currentHierarchyName, immediateParentNode.beFormFields);
                immediateParentNodeMeta = getBeFormFieldFromMetadataList(currentHierarchyName, immediateParentNodeMeta.beFormFields);

                if(!tempFieldNode) {
                    if(!immediateParentNode.beFormFields) {
                        immediateParentNode.beFormFields = [];
                    }
                    tempFieldNode = trimBeFormField(immediateParentNodeMeta);
                    immediateParentNode.beFormFields.push(tempFieldNode);
                    immediateParentNode = tempFieldNode;
                } else {
                    immediateParentNode = tempFieldNode;
                }
            } else {
                selectedBeField = getBeFormFieldFromMetadataList(currentHierarchyName, immediateParentNodeMeta.beFormFields);
                selectedBeField = formatSelectedBeFieldAndChildren(selectedBeField);
            }
            currentHierarchyName = `${currentHierarchyName}.`;
        }
        currentHierarchyName = currentHierarchyName.slice(0, -1);
        if(!immediateParentNode.beFormFields) {
            immediateParentNode.beFormFields = [];
        }
        if(selectedBeField.many) {
            let isChildPresentInParent = false;
            for(let index in immediateParentNode.beFormFields) {
                if(currentHierarchyName === immediateParentNode.beFormFields[index].hierarchyName) {
                    immediateParentNode.beFormFields[index] = selectedBeField;
                    isChildPresentInParent = true;
                }
            }
            if(!isChildPresentInParent) {
                immediateParentNode.beFormFields.push(selectedBeField);
            }
        } else {
            immediateParentNode.beFormFields.push(selectedBeField);
        }
    };

    const updateRootBeFieldFromMetadataFields = (hierarchyNames, selectedField, beFieldMetadata) => {

        if(hierarchyNames.length > 0) {
            if(hierarchyNames.length === 1 && hierarchyNames[0] === beFieldMetadata.hierarchyName) {
                return trimBeChildrenMetadata(beFieldMetadata);
            }
            hierarchyNames.shift();
            for(let index in beFieldMetadata.beFormFields) {
                if(beFieldMetadata.beFormFields[index].name === hierarchyNames[0]) {
                    if(beFieldMetadata.beFormFields[index].many) {
                        let beFieldChildren = updateRootBeFieldFromMetadataFields(
                            hierarchyNames, selectedField, beFieldMetadata.beFormFields[index]);
                        if(beFieldChildren) {
                            beFieldMetadata.beFormFields = [];
                            beFieldMetadata.beFormFields.push(beFieldChildren);
                            break;
                        }
                    } else {
                        beFieldMetadata.beFormFields = [];
                        beFieldMetadata.beFormFields.push(selectedField);
                        break;
                    }
                }
            }
            return trimBeChildrenMetadata(beFieldMetadata);
        }
    };

    const filterSelectedFromBeFormField = (hierarchyNames, beFormFields = []) => {
        if(hierarchyNames.length > 0) {
            for(const index in beFormFields) {
                if(beFormFields[index].name === hierarchyNames[0]) {
                    if(hierarchyNames.length === 1) {
                        beFormFields.splice(index, 1);
                        break;
                    } else {
                        hierarchyNames.shift();
                        validateAndDiscardDynamicFieldValues(beFormFields[index], hierarchyNames[0]);
                        beFormFields[index].beFormFields =
                            filterSelectedFromBeFormField(hierarchyNames, beFormFields[index].beFormFields);
                        if(beFormFields[index].beFormFields.length === 0) {
                            beFormFields.splice(index, 1);
                            break;
                        }
                    }
                }
            }
            return beFormFields;
        }
    };

    const validateAndDiscardDynamicFieldValues = (parentField, childFieldName) => {
        if(parentField.fieldType && parentField.fieldType === "dynamicFieldView") {
            if(parentField.dynamicFieldLabel && parentField.dynamicFieldLabel === childFieldName)
                parentField.dynamicFieldLabel = undefined;
            if(parentField.dynamicFieldMandatoryInd && parentField.dynamicFieldMandatoryInd === childFieldName)
                parentField.dynamicFieldMandatoryInd = undefined;
            if(parentField.dynamicFieldValue && parentField.dynamicFieldValue === childFieldName)
                parentField.dynamicFieldValue = undefined;
            if(parentField.dynamicFieldType && parentField.dynamicFieldType === childFieldName)
                parentField.dynamicFieldType = undefined;
        }
    };

    const selectField = () => {
        if(availableField && availableField.hierarchyName) {
            let selectedBeFormFields = JSON.parse(JSON.stringify(beFormFields));
            let hierarchyNames = availableField.hierarchyName.split('.');

            let rootHierarchyName = hierarchyNames[0];
            let rootFieldNode = getBeFormFieldFromSelectedFields(rootHierarchyName, selectedBeFormFields);
            let selectedBeField = formatSelectedBeFieldAndChildren(availableField);

            if(rootFieldNode) {
                updateSelectedBeFormFields(selectedBeField, hierarchyNames, selectedBeFormFields);
            } else {
                let beFieldsMetadata = JSON.parse(JSON.stringify(beFormFieldsMetadata));
                let rootMetadata = getBeFormFieldFromMetadataList(rootHierarchyName, beFieldsMetadata);
                rootFieldNode = trimBeFormField(rootMetadata);
                rootFieldNode.beFormFields = rootMetadata.beFormFields;
                rootFieldNode = updateRootBeFieldFromMetadataFields(hierarchyNames, selectedBeField, rootFieldNode);
                selectedBeFormFields.push(rootFieldNode);
            }
            updateBeSectionField(CONFIG.BE_FORM_FIELDS, selectedBeFormFields);
            setAvailableField({});
        }
    };

    const deselectField = () => {
        if(selectedField && selectedField.hierarchyName) {
            let beFormFieldsCopy = JSON.parse(JSON.stringify(beFormFields));
            let hierarchyNames = selectedField.hierarchyName.split('.');
            filterSelectedFromBeFormField(hierarchyNames, beFormFieldsCopy);

            updateBeSectionField(CONFIG.BE_FORM_FIELDS, beFormFieldsCopy);
            setSelectedField({});
        }
    };

    const selectAllFields = () => {
        let newBeFormFields = beFormMetadata.beFormFields.map(beFormFieldMetadata => {
            if(beFormFieldMetadata.many) {
                return formatSelectedBeFieldAndChildren(beFormFieldMetadata);
            } else {
                let { name, attributeSelector, hierarchyName, many, dataType, label, readOnly, required } = beFormFieldMetadata;
                let newFormField = { name, attributeSelector, hierarchyName, many, configName, configType };
                newFormField.metadata = { name, attributeSelector, hierarchyName, many, dataType, label, readOnly,required };
                newFormField.fieldType = newFormField.fieldType ? newFormField.fieldType : getDefaultFieldType(many, hierarchyName, dataType);
                newFormField.required = newFormField.required ? newFormField.required : (required ? required : false);
                return newFormField
            }
        });
        setSelectedField({});
        setAvailableField({});
        updateBeSectionField(CONFIG.BE_FORM_FIELDS, newBeFormFields);
    };

    const deselectAllFields = () => {
        setSelectedField({});
        setAvailableField({});
        updateBeSectionField(CONFIG.BE_FORM_FIELDS, []);
    };

    const moveSelectFieldUp = () => {
        if(selectedField && selectedField.name) {
            let selectedBeFormFields = JSON.parse(JSON.stringify(beFormFields));
            let immediateParentNode = getImmediateParentFromFieldList(selectedField, selectedBeFormFields);

            let fieldIndex = immediateParentNode.beFormFields.findIndex(
                beFormField => beFormField.name === selectedField.name);
            if(fieldIndex > 0) {
                [immediateParentNode.beFormFields[fieldIndex - 1], immediateParentNode.beFormFields[fieldIndex]] =
                    [immediateParentNode.beFormFields[fieldIndex], immediateParentNode.beFormFields[fieldIndex - 1]];
                setSelectedField(selectedField);
                updateBeSectionField(CONFIG.BE_FORM_FIELDS, selectedBeFormFields);
            }
        }
    };

    const moveSelectFieldDown = () => {
        if(selectedField && selectedField.name) {
            let selectedBeFormFields = JSON.parse(JSON.stringify(beFormFields));
            let immediateParentNode = getImmediateParentFromFieldList(selectedField, selectedBeFormFields);

            let fieldIndex = immediateParentNode.beFormFields.findIndex(
                beFormField => beFormField.name === selectedField.name);
            if(fieldIndex < (immediateParentNode.beFormFields.length - 1)) {
                [immediateParentNode.beFormFields[fieldIndex + 1], immediateParentNode.beFormFields[fieldIndex]] =
                    [immediateParentNode.beFormFields[fieldIndex], immediateParentNode.beFormFields[fieldIndex + 1]];
                setSelectedField(selectedField);
                updateBeSectionField(CONFIG.BE_FORM_FIELDS, selectedBeFormFields);
            }
        }
    };

    const moveSelectFieldTop = () => {
        if(selectedField && selectedField.name) {
            let selectedBeFormFields = JSON.parse(JSON.stringify(beFormFields));
            let immediateParentNode = getImmediateParentFromFieldList(selectedField, selectedBeFormFields);

            for(let index in immediateParentNode.beFormFields) {
                if(immediateParentNode.beFormFields[index].hierarchyName === selectedField.hierarchyName) {
                    immediateParentNode.beFormFields.splice(index, 1);
                }
            }
            immediateParentNode.beFormFields.unshift(selectedField);
            updateBeSectionField(CONFIG.BE_FORM_FIELDS, selectedBeFormFields);
        }
    };

    const moveSelectFieldBottom = () => {
        if(selectedField && selectedField.name) {
            let selectedBeFormFields = JSON.parse(JSON.stringify(beFormFields));
            let immediateParentNode = getImmediateParentFromFieldList(selectedField, selectedBeFormFields);

            for(let index in immediateParentNode.beFormFields) {
                if(immediateParentNode.beFormFields[index].hierarchyName === selectedField.hierarchyName) {
                    immediateParentNode.beFormFields.splice(index, 1);
                }
            }
            immediateParentNode.beFormFields.push(selectedField);
            updateBeSectionField(CONFIG.BE_FORM_FIELDS, selectedBeFormFields);
        }
    };

    const getBeFormSectionHeader = () => {
        return (
            <BeFormSectionHeader
                beFormSection={beFormSection}
                addNewSection={() => addNewSection(beFormSection.order)}
                deleteSection={() => deleteSection(beFormSection.order)}
                moveSectionUp={() => moveSectionUp(beFormSection.order)}
                moveSectionDown={() => moveSectionDown(beFormSection.order)}
                updateBeSectionField={updateBeSectionField}
            />
        );
    };

    return (
        <>
            {
                beFormFields && beFormFieldsMetadata &&
                <Section
                    title={getBeFormSectionHeader()}
                    className="section__container__main"
                    collapsible
                >
                    <div className="section__available__fields">
                        <BeFormFieldGroup
                            beFormFields={beFormFieldsMetadata}
                            title={translate("LABEL_AVAILABLE_FIELD")}
                            isSelectedFields={false}
                            selectedField={availableField}
                            selectField={(beField) => setAvailableField(beField)}
                        />
                    </div>
                    <div className="section__available__controls">
                        <IconButton onClick={selectField} className="section__control__icon">
                            <i className="aicon aicon__chevron-right section__control__icon__style__right" />
                        </IconButton>
                        <IconButton onClick={deselectField} className="section__control__icon">
                            <i className="aicon aicon__chevron-left section__control__icon__style" />
                        </IconButton><br/>
                        {
                            beFormFieldsMetadata.length > 0 &&
                            <IconButton onClick={selectAllFields} className="section__control__icon">
                                <i className="aicon aicon__chevron-double-right section__control__icon__style" />
                            </IconButton>
                        }
                        {
                            beFormFields.length > 0  &&
                            <IconButton onClick={() => deselectAllFields()} className="section__control__icon">
                                <i className="aicon aicon__chevron-double-left section__control__icon__style" />
                            </IconButton>
                        }
                        
                    </div>
                    <div className="section__selected__fields">
                        <BeFormFieldGroup
                            beFormFields={beFormFields}
                            title={translate("LABEL_SELECTED_FIELD")}
                            isSelectedFields={true}
                            selectedField={selectedField}
                            selectField={(beField) => setSelectedFieldData(beField)}
                        />
                    </div>
                    <div className="section__selected__controls">
                        <IconButton onClick={moveSelectFieldTop} className="section__control__icon">
                            <i className="aicon aicon__chevron-double-up section__control__icon__style" />
                        </IconButton>
                        <IconButton onClick={moveSelectFieldUp} className="section__control__icon">
                            <i className="aicon aicon__chevron-up section__control__icon__style" />
                        </IconButton>
                        <IconButton onClick={moveSelectFieldDown} className="section__control__icon">
                            <i className="aicon aicon__chevron-down section__control__icon__style" />
                        </IconButton>
                        <IconButton onClick={moveSelectFieldBottom} className="section__control__icon">
                            <i className="aicon aicon__chevron-double-down section__control__icon__style" />
                        </IconButton>
                    </div>
                </Section >
            }
        </>
    );
};
export default BeFormSection;
