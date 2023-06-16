import * as Yup from "yup";
import BEFORM_CONFIG from "./beFormConfig";

const getYupSchema = (yupSchemas) => {

    const [first, ...rest] = yupSchemas.filter(schema => schema);
    if (rest.length) {
        return rest.reduce((schemaObject, schema) => schemaObject.concat(schema), first);
    } else {
        return first;
    }
};

const getObjectPropertyValue = (obj, ...properties) => {

    let objClone = { ...obj };
    let isPathValid = true;
    if (properties.length) {
        for (let i = 0; i < properties.length; i++) {
            if (objClone[properties[i]]) {
                objClone = objClone[properties[i]];
            } else {
                isPathValid = false;
                break;
            }
        }
    } else {
        return false;
    }
    return isPathValid ? objClone : isPathValid;
};

const defineRequiredFieldValidation = (dataType, beField, errorMsg = null) => {

    const { DATA_TYPES, FIELD_TYPES } = BEFORM_CONFIG;
    if (beField.required) {
        switch (dataType) {
            case DATA_TYPES.DECIMAL:
            case DATA_TYPES.FILE_ATTACHMENT:
            case DATA_TYPES.IMAGE_URL:
            case DATA_TYPES.STRING:
            case DATA_TYPES.LOOKUP:
                return Yup.string().trim().required(errorMsg);
            case DATA_TYPES.INTEGER:
                return Yup.number().required(errorMsg);
            case DATA_TYPES.DATE:
                return Yup.date().required(errorMsg).nullable().default(null);
            case DATA_TYPES.BOOLEAN:
                if(beField.fieldType === FIELD_TYPES.RADIO_BUTTON)
                    return Yup.mixed().oneOf([1, true, 0, false], errorMsg);
                break;
            default:
                break;
        }
    }
};

const defineFieldMaxLengthValidation = (dataType, beField, errorMessage = null) => {

    const { DATA_TYPES } = BEFORM_CONFIG;

    if (dataType === DATA_TYPES.STRING) {
        if (beField.length) {
            return Yup.string().test(
                "stringLen",
                errorMessage,
                (stringRef) => !stringRef || stringRef.length <= beField.length,
            );
        }
    }
};

export {
    getYupSchema,
    getObjectPropertyValue,
    defineRequiredFieldValidation,
    defineFieldMaxLengthValidation,
};
