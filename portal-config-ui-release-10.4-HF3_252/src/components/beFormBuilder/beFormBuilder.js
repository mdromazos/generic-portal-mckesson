import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import BeFormSections from './beFormSections';
import BeFormFieldProperties from './beFormFieldProperties';
import {getBeFormFieldFromSelectedFields, getInitialSectionData, transformBeMetaData} from './beFormBuilderUtility';
import "./beFormBuilder.css"

const BeFormBuilder = ({ 
    beFormBuilderData, 
    beFieldsMetaModel,
    saveFormData,
    configName,
    componentType,
    maxColumns,
    configType,
    getLookupTableMetadata,
    currentStep,
}) => {

    let [beFormData, setBeFormData] = useState({});
    let [selectedFormField, setSelectedFormField] = useState({});
    let [selectedFormSection, setSelectedFormSection] = useState({});
    let [beFormMetadata, setBeFormMetadata] = useState({});

    useEffect(() => {
        let beFormData = beFormBuilderData ? JSON.parse(JSON.stringify(beFormBuilderData)) : { };
        beFormData.configName = configName;
        beFormData.configType = configType;
        beFormData.componentType = componentType;
        beFormData.maxColumns = maxColumns;
        beFormData.attributeSelector = "$";

        if(!beFormData.beFormSections || !(Array.isArray(beFormData.beFormSections))
            || (Array.isArray(beFormData.beFormSections)
                && beFormData.beFormSections.length === 0)) {
            beFormData.beFormSections = [getInitialSectionData()];
        }
        setBeFormData(beFormData);

        let beMetadataTransformed = transformBeMetaData(
            beFieldsMetaModel.object, '$.object', false);
        setBeFormMetadata(beMetadataTransformed);
    }, [beFormBuilderData]);

    const updateFormBuilderData = (beFormData) => {
        saveFormData(beFormData);
        setBeFormData(beFormData);
    };

    const updateFormField = (selectedBeFormField) => {
        let beFormSection = JSON.parse(JSON.stringify(selectedFormSection));
        let hierarchyNames = selectedBeFormField.hierarchyName.split('.');
        let immediateParentNode = beFormSection;
        let currentHierarchyName = "";

        for(let hierarchyName of hierarchyNames) {
            currentHierarchyName = `${currentHierarchyName}${hierarchyName}`;
            if(hierarchyName !== selectedBeFormField.name) {
                immediateParentNode = getBeFormFieldFromSelectedFields(
                    currentHierarchyName, immediateParentNode.beFormFields);
            }
            currentHierarchyName = `${currentHierarchyName}.`;
        }
        immediateParentNode.beFormFields = immediateParentNode.beFormFields.map((beFormField) => {
            if(beFormField.name === selectedBeFormField.name) {
                return selectedBeFormField;
            } else return beFormField;
        });
        return beFormSection;
    };

    const updateFormSectionField = (selectedBeFormField) => {
        if(selectedBeFormField) {
            let selectedBeFormFieldCopy = JSON.parse(JSON.stringify(selectedBeFormField));
            let updatedBeFormData = JSON.parse(JSON.stringify(beFormData));
            if(updatedBeFormData.beFormSections && selectedFormSection) {
                updatedBeFormData.beFormSections = updatedBeFormData.beFormSections.map((beFormSection) => {
                    if(beFormSection.order === selectedFormSection.order) {
                        let selectedBeFormSection = updateFormField(selectedBeFormFieldCopy);
                        setSelectedFormSection(selectedBeFormSection);
                        return selectedBeFormSection;
                    } else  return beFormSection;
                });
                updateFormBuilderData(updatedBeFormData);
                setSelectedFormField(selectedBeFormFieldCopy);
            }
        }
    };

    return (
        <div className="beFormBuilder__component__container">
            <div className="container">
                <div className="builder__container">
                    <BeFormSections
                        beFormData={beFormData}
                        beFormMetadata={beFormMetadata}
                        setBeFormData={(beFormData) => updateFormBuilderData(beFormData)}
                        setSelectedFormSection={(beFormSection => setSelectedFormSection(beFormSection))}
                        setSelectedFormField={(beFormField) => setSelectedFormField(beFormField)}
                        currentStep={currentStep}
                    />
                </div>
                <div className="properties__container">
                    <BeFormFieldProperties
                        selectedFormField={selectedFormField}
                        updateFormSectionField={(beFormField) => updateFormSectionField(beFormField)}
                        getLookupTableMetadata={getLookupTableMetadata}
                        currentStep={currentStep}
                    />
                </div>
            </div>
        </div>
    );
};

BeFormBuilder.propTypes = {
    configName: PropTypes.string.isRequired,
    configType: PropTypes.string.isRequired,
    saveFormData: PropTypes.func.isRequired,
    beFieldsMetaModel: PropTypes.shape({
        object: PropTypes.shape({
            field: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
                label: PropTypes.string,
                dataType: PropTypes.string
            })),
            child: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
                label: PropTypes.string
            }))
        })
    }).isRequired,
    beFormBuilderData: PropTypes.shape({
        beFormSections: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            order: PropTypes.number,
            beFormFields: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
                fieldType: PropTypes.string,
                metadata: PropTypes.shape({
                    name: PropTypes.string,
                    label: PropTypes.string,
                    dataType: PropTypes.string
                })
            }))
        }))
    })
};
export default BeFormBuilder;
