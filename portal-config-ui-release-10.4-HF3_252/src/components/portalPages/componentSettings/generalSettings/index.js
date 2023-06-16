import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Dropdown } from "@informatica/droplets-core";
import CONFIG from "../../../../config/config";
import { handleBlur, handleChange } from '../../../../utils/utilityService';

const GeneralSettings = ({ formikProps }) => {
    const { t: translate } = useTranslation();
    const { DISPLAY_HEIGHT_OPTIONS } = CONFIG;

    const displayHeightOptions = [
        {
            text: translate("LABEL_FIT_TO_CONTENT"),
            value: DISPLAY_HEIGHT_OPTIONS.FIT_TO_CONTENT
        },
        {
            text: translate("LABEL_CUSTOM"),
            value: DISPLAY_HEIGHT_OPTIONS.CUSTOM
        }
    ];

    return <>
        <Form.Group className="form-group">
            <Form.Label className="form-label">{translate("LABEL_TITLE")}</Form.Label>
            <Form.Control
                className="form-field"
                name="title"
                value={formikProps.values && formikProps.values.title}
                as={Input}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
            />
        </Form.Group>
        <Form.Group className="form-group">
            <Form.Label className="form-label" help={translate("LABEL_DISPLAY_HEIGHT_INFO")}>{translate("LABEL_DISPLAY_HEIGHT")}</Form.Label>
            <Form.Control
                className="form-field"
                name="displayHeight"
                value={formikProps.values && formikProps.values.displayHeight}
                as={Dropdown}
                options={displayHeightOptions}
                onChange={({ value }) => handleChange(formikProps, 'displayHeight', value)}
                onBlur={() => handleBlur(formikProps, 'displayHeight')}
            />
        </Form.Group>
        {
            formikProps.values && formikProps.values.displayHeight === DISPLAY_HEIGHT_OPTIONS.CUSTOM
            && <Form.Group required className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_CUSTOM_HEIGHT_INFO")}>{translate("LABEL_CUSTOM_HEIGHT")}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="customHeight"
                    as={Input}
                    value={formikProps.values.customHeight}
                    onBlur={formikProps.handleBlur}
                    onChange={formikProps.handleChange}
                />
                {formikProps.touched.customHeight 
                && formikProps.errors.customHeight
                &&(<div className="form-error">
                    <Form.Error>
                        {formikProps.errors.customHeight}
                    </Form.Error></div>)}
            </Form.Group>
        }
    </>;
};
export default GeneralSettings;
