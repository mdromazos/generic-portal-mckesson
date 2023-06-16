import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@informatica/droplets-core";
import "./index.css";

const P360TaskViewSettings = ({ formikProps }) => {

    const { t: translate } = useTranslation();

    return <div className="product__task__view__container">
        <Form.Group required className="form-group">
            <Form.Label className="form-label" help={translate("LABEL_SERVER_URL_INFO")}>{translate("LABEL_SERVER_URL")}</Form.Label>
            <Form.Control
                name="serverUrl"
                className="form-field"
                as={Input}
                value={formikProps.values.serverUrl}
                onChange={formikProps.handleChange}
                onBlur={formikProps.handleBlur}                    
            />
            {formikProps.touched.serverUrl
                && formikProps.errors.serverUrl
                &&(<div className="form-error">
                    <Form.Error>{formikProps.errors.serverUrl}</Form.Error></div>)}
        </Form.Group>        
    </div>;
};
export default P360TaskViewSettings;
