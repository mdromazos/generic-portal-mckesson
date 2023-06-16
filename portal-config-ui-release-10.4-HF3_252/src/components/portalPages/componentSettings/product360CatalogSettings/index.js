import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@informatica/droplets-core";
import "./index.css";
import CONFIG from "../../../../config/config"

const P360CatalogSettings = ({ formikProps }) => {
    const { t: translate } = useTranslation();

    return <div className="product__catalog__container">
        <Form.Group className="form-group" required>
            <Form.Label className="form-label" help={translate("LABEL_SERVER_URL_INFO")}>{translate("LABEL_SERVER_URL")}</Form.Label>
            <Form.Control
                className="form-field"
                name="serverUrl"
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
        <Form.Group required className="form-group">
            <Form.Label className="form-label" help={translate("LABEL_PRODUCT_USER_INFO")}>{translate("LABEL_PRODUCT_USER")}</Form.Label>
            <Form.Control
                className="form-field"
                name="user"
                as={Input}
                value={formikProps.values.user}
                onChange={formikProps.handleChange}
                onBlur={formikProps.handleBlur} 
            />
            {formikProps.touched.user
                && formikProps.errors.user
                &&(<div className="form-error">
                    <Form.Error>{formikProps.errors.user}</Form.Error></div>)}
        </Form.Group>
        <Form.Group className="form-group">
            <Form.Label className="form-label" help={translate("LABEL_EXTERNAL_ID_PATH_INFO")}>{translate("LABEL_EXTERNAL_ID_PATH")}</Form.Label>
            <Form.Control
                className="form-field"
                name="externalIdPath"
                as={Input}
                disabled
                placeholder={translate(CONFIG.PRODUCT_360_ROW_ID)}
                value={formikProps.values.externalIdPath}
                onChange={formikProps.handleChange}
                onBlur={formikProps.handleBlur} 
            />
        </Form.Group>
    </div>;
};

export default P360CatalogSettings;
