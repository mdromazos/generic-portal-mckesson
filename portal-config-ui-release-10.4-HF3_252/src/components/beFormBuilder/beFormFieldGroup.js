import React, { useEffect, useState } from 'react';
import BeFormFields from './beFormFields';
import { Input } from "@informatica/droplets-core";
import "./beFormBuilder.css";
import { useTranslation } from "react-i18next";

const BeFormFieldGroup = ({ beFormFields, title, selectedField, selectField, isSelectedFields}) => {

    let [beFields, setBeFields] = useState([]);
    let [selectedFormField, setSelectedFormField] = useState({});

    const { t: translate } = useTranslation();

    useEffect(() => {
        if(beFormFields)
            setBeFields(beFormFields);
        if(selectedField)
            setSelectedFormField(selectedField)
    }, [beFormFields]);

    const updateFieldList = (key, beFieldsMetadata, newBeFormFiledMetadata, isSelectedFields) => {
        if(!beFieldsMetadata) return;

        beFieldsMetadata.forEach(beFieldMetadata => {
            if(isSelectedFields && beFieldMetadata.metadata.label.toUpperCase().includes(key)) {
                newBeFormFiledMetadata.push(beFieldMetadata);
            } else if(!isSelectedFields && beFieldMetadata.label.toUpperCase().includes(key)) {
                newBeFormFiledMetadata.push(beFieldMetadata);
            } else if(beFieldMetadata.many){
                let filteredBeFormFields = updateFieldList(
                    key, beFieldMetadata.beFormFields, [], isSelectedFields);
                if(filteredBeFormFields && filteredBeFormFields.length > 0) {
                    beFieldMetadata.beFormFields = filteredBeFormFields;
                    newBeFormFiledMetadata.push(beFieldMetadata);
                }
            }
        });
        return newBeFormFiledMetadata;
    };

    const filterFieldName = (event) => {
        let key = event.target.value.toUpperCase();
        let formFields = [];
        formFields = updateFieldList(key, beFormFields, formFields, isSelectedFields);
        setBeFields(formFields);
    };

    const selectFormField = (beField) => {
        setSelectedFormField(beField);
        selectField(beField);
    };

    return (
        <>
            {
                beFields && Array.isArray(beFields) &&
                <div className="field__group_container">
                    <p className="section__title">{ title }</p>
                    <Input
                        placeholder={translate("LABEL_FIND")}
                        className="field__group__input__box"
                        onChange={filterFieldName}
                        data-testid="field__search__textbox"
                    />
                    <div className="field__group__items">
                        <div className="fields__container">
                            <BeFormFields
                                beFields={beFields}
                                isSelectedFields={isSelectedFields}
                                selectedField={selectedFormField}
                                selectField={(beField) => selectFormField(beField)}
                                showFormChildren={{}}
                            />
                        </div>
                    </div>
                </div>
            }
        </>
    );
};
export default BeFormFieldGroup;
