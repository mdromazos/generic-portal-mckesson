import React, { useState, useEffect } from 'react';
import BeFormField from "./beFormField";
import "./beFormBuilder.css";

const BeFormFields = ({ beFields, isSelectedFields, selectedField, selectField, showFormChildren }) => {

    let [selectedFormField, setSelectedFormField] = useState({});
    let [showChildGroup, setShowChildGroup] = useState(showFormChildren);
    let [beFormFields, setBeFormFields] = useState(undefined);

    useEffect(() => {
        setSelectedFormFieldValue(selectedField);
        setBeFormFields(beFields);
    }, [beFields, selectedField]);

    const setSelectedFormFieldValue = (beField) => {
        setSelectedFormField(beField);
        selectField(beField);
    };

    const isChildGroupOpen = (groupName) => {
        return showChildGroup && showChildGroup[groupName];
    };

    const toggleShowChildGroup = (groupName) => {
        let updatedChildGroup = JSON.parse(JSON.stringify(showChildGroup));
        updatedChildGroup[groupName] = !updatedChildGroup[groupName];
        setShowChildGroup(updatedChildGroup);
    };

    const loadBeFormFields = (beFormField, index) => {
        if(beFormField.many) {
            return (
                <div key={index}>
                    <li className="field__label__section">
                        <div className="field__dropdown__arrow"
                             onClick={() => toggleShowChildGroup(beFormField.hierarchyName)}
                        >
                            {
                                (isChildGroupOpen(beFormField.hierarchyName) ?
                                    <i className="aicon aicon__dropdown-arrow field__dropdown__arrow__close"/>
                                    : <i className="aicon aicon__dropdown-arrow field__dropdown__arrow__open"/>)
                            }
                        </div>
                        <div className="field__heading">
                            {
                                (beFormField || beFormField.metadata)
                                && <BeFormField
                                    key={`${beFormField.hierarchyName}`}
                                    formField={isSelectedFields ? beFormField.metadata : beFormField}
                                    onFormFieldClick={() => setSelectedFormFieldValue(beFormField)}
                                    activeClass={
                                        (selectedFormField && beFormField.hierarchyName === selectedFormField.hierarchyName)
                                            ? "field__active" : "field__inactive"
                                    }
                                />
                            }
                        </div>
                    </li>
                    <li>
                        {
                            isChildGroupOpen(beFormField.hierarchyName) && beFormField.beFormFields
                            && Array.isArray(beFormField.beFormFields)
                            && <BeFormFields
                                key={`${beFormField.hierarchyName}`}
                                showFormChildren={{}}
                                beFields={beFormField.beFormFields}
                                isSelectedFields={isSelectedFields}
                                selectedField={selectedField}
                                selectField={(beField) => selectField(beField)}
                            />
                        }
                    </li>
                </div>
            );
        } else {
            return (
                <div key={index}>
                    {
                        (beFormField || beFormField.metadata)
                        && <li>
                            <BeFormField
                                key={`${beFormField.hierarchyName}`}
                                formField={isSelectedFields ? beFormField.metadata : beFormField}
                                onFormFieldClick={() => setSelectedFormFieldValue(beFormField)}
                                activeClass={
                                    (selectedFormField && beFormField.hierarchyName === selectedFormField.hierarchyName)
                                        ? "field__active" : "field__inactive"
                                }
                            />
                        </li>
                    }
                </div>
            );
        }
    };

    return (
        <div className="field__group">
            <ul className="field__label__section">
                {
                    beFormFields && Array.isArray(beFormFields) &&
                    beFormFields.map((beFormField, index) => loadBeFormFields(beFormField, index))
                }
            </ul>
        </div >
    );
};
export default BeFormFields;
