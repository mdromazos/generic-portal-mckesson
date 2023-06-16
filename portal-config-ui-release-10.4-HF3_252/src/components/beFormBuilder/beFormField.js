import React from 'react';
import "./beFormBuilder.css";

const BeFormField = ({formField, onFormFieldClick, activeClass}) => {

    return (
        <div className={`${activeClass}`}
             onClick={onFormFieldClick}>
            <span className="form__field">{formField.label}</span>
            {
                formField.required && <span className="field__mandatory">*</span>
            }
        </div>
    );
};
export default BeFormField;
