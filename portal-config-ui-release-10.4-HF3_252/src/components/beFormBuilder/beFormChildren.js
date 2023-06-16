import React, { useState, useEffect } from 'react';
import BeFormFields from "./beFormFields";
import "./beFormBuilder.css";
import BeFormField from "./beFormField";

const BeFormChildren = ({beChildren, isSelectedFields, selectedField, selectField, showFormChildren}) => {

    let [selectedFormField, setSelectedFormField] = useState(selectedField);
    let [showChildGroup, setShowChildGroup] = useState(showFormChildren);
    let [beFormChildren, setBeFormChildren] = useState(undefined);

    useEffect(() => {
        setSelectedFormFieldValue(selectedField);
        setBeFormChildren(beChildren);
    }, [beChildren, selectedField]);

    const setSelectedFormFieldValue = (beField) => {
        setSelectedFormField(beField);
        selectField(beField);
    };

    const loadBeFormFields = (beFormChild, index) => {
        if(showChildGroup && showChildGroup.hasOwnProperty(beFormChild.hierarchyName)) {
            if(beFormChild.beFormFields && Array.isArray(beFormChild.beFormFields)) {
                return (
                    <BeFormFields
                        key={`BE_FIELDS_${index}`}
                        beFields={beFormChild.beFormFields}
                        isSelectedFields={isSelectedFields}
                        selectedField={selectedField}
                        selectField={(beField) => selectField(beField)}
                    />
                );
            }
        }
        return false;
    };

    const isChildGroupOpen = (groupName) => {
        return showChildGroup && showChildGroup.hasOwnProperty(groupName);
    };

    const toggleShowChildGroup = (groupName) => {
        let updatedChildGroup = JSON.parse(JSON.stringify(showChildGroup));
        if(updatedChildGroup.hasOwnProperty(groupName)) {
            delete updatedChildGroup[groupName];
        } else {
            updatedChildGroup[groupName] = true;
        }
        setShowChildGroup(updatedChildGroup);
    };

    const calculateFieldStyle = (hierarchyName) => {
        let childOrder = hierarchyName && hierarchyName.split('.') ? hierarchyName.split('.').length : 0;
        let baseMargin = -50;
        if(childOrder >= 1) {
            return ({
                'margin-left': `${baseMargin + childOrder*20}px`
            });
        }
        return {};
    };

    const loadBeFormChildren = () => {
        if(beFormChildren && Array.isArray(beFormChildren)) {
            return (
                beFormChildren.map((beFormChild, index) =>
                    <>
                        <div>
                            <div onClick={() => toggleShowChildGroup(beFormChild.hierarchyName)}
                                 style={calculateFieldStyle(beFormChild.hierarchyName)}>
                                <BeFormField
                                    isParentField={true}
                                    isParentFieldGroupOpen={isChildGroupOpen(beFormChild.hierarchyName)}
                                    formField={isSelectedFields ? beFormChild.metadata : beFormChild}
                                    onFormFieldClick={() => setSelectedFormFieldValue(beFormChild)}
                                    activeClass={
                                        (selectedFormField && beFormChild.hierarchyName === selectedFormField.hierarchyName)
                                            ? "field__active" : "field__inactive"
                                    }
                                />
                            </div>
                            {
                                loadBeFormFields(beFormChild, index)
                            }
                            {
                                isChildGroupOpen(beFormChild.hierarchyName) &&
                                <BeFormChildren
                                    key={`BE_CHILDREN_${index}`}
                                    showFormChildren={showChildGroup}
                                    beChildren={beFormChild.beFormChildren}
                                    isSelectedFields={isSelectedFields}
                                    selectedField={selectedField}
                                    selectField={(beField) => selectField(beField)}
                                />
                            }
                        </div>
                    </>
                )
            );
        }
        return false;
    };

    return (
        <div>
            { loadBeFormChildren() }
        </div >
    );
};
export default BeFormChildren;
