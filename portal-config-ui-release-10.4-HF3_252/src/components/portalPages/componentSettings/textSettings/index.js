import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Textarea, Input } from "@informatica/droplets-core";

const TextSettings = ({ formikProps }) => {
    const { t: translate } = useTranslation();
    return <>
        <Form.Group className="form-group">
            <Form.Label className="form-label" help={translate("LABEL_TEXT_HEADING_INFO")}>{translate("LABEL_TEXT_HEADING")}</Form.Label>
            <Form.Control
                className="form-field"
                name="heading"
                as={Input}
                value={formikProps.values.heading}
                onChange={formikProps.handleChange}
                onBlur={formikProps.handleBlur}            
            />
        </Form.Group>
        <Form.Group className="form-group">
            <Form.Label className="form-label" help={translate("LABEL_TEXT_BODY_INFO")}>{translate("LABEL_TEXT_BODY")}</Form.Label>
            <Form.Control
                className="form-field"
                name="body"
                as={Textarea}
                value={formikProps.values.body}
                onChange={formikProps.handleChange}
                onBlur={formikProps.handleBlur}                
            />
        </Form.Group>
    </>;
};
export default TextSettings;
