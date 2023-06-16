import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, Checkbox } from "@informatica/droplets-core";
import { handleChange, handleBlur } from '../../../../utils/utilityService';
import "./index.css";

const ExternalLinkSettings = ({ formikProps }) => {
    const { t: translate } = useTranslation();

    return (
        <div className="external__container">
            <Form.Group className="form-group" required>
                <Form.Label className="form-label" help={translate("LABEL_URL_INFO")}>{translate("LABEL_URL")}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="url"
                    as={Input}
                    value={formikProps.values.url}
                    onChange={formikProps.handleChange}
                    onBlur={formikProps.handleBlur}
                    data-testid="external-link-setting-url"
                />
                  {formikProps.touched.url
                    && formikProps.errors.url
                    &&(<div className="form-error">
                        <Form.Error>{formikProps.errors.url}</Form.Error></div>)}
            </Form.Group>
             <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_PARAMETER_INFO")}>{translate("LABEL_PARAMETER")}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="hasBEName"
                    as={Checkbox}
                    value='hasBEName'
                    onChange={(e) => {
                        const { checked } = e.target;
                        handleChange(formikProps, 'hasBEName', checked);
                        handleBlur(formikProps, 'hasBEName');
                    }}
                    checked={formikProps.values.hasBEName}                    
                    data-testid="external-link-setting-hasBEName"
                >{translate("LABEL_BE_PARAM")}</Form.Control>
            </Form.Group>
            <div className="row__id__param">
                <Form.Group className="form-group">
                    <Form.Control
                        className="form-field"
                        name="hasBERowid" 
                        as={Checkbox}
                        value='hasBERowid'
                        onChange={(e) => {
                            const { checked } = e.target;
                            handleChange(formikProps, 'hasBERowid', checked);
                            handleBlur(formikProps, 'hasBERowid');
                        }}
                        checked={formikProps.values.hasBERowid}
                        data-testid="external-link-setting-hasBERowid"
                    >{translate("LABEL_BE_ROWID")}</Form.Control>
                </Form.Group>
            </div>
        </div>
    );
};

export default ExternalLinkSettings;
