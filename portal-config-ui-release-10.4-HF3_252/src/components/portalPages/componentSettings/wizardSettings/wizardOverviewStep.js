import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Textarea, Input } from "@informatica/droplets-core";
import "./index.css";

const WizardOverviewStep = ({ formikProps }) => {
    const { t: translate } = useTranslation();
    return <>
        <div className="wizard__overview__heading">
            <Form.Group className="form-group">
                <Form.Control
                    className="form-group"
                    name="overviewHeading"
                    placeholder={translate("LABEL_WELCOME_TEXT")}
                    as={Input}
                    value={formikProps.values.overviewHeading}
                    onChange={formikProps.handleChange}
                    onBlur={formikProps.handleBlur}
                />
            </Form.Group>
        </div>
        <div className="wizard__overview__body">
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_TITLE_INFO")}>{translate("LABEL_TITLE")}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="overviewTitle"
                    placeholder={translate("LABEL_OVERVIEW_TITLE")}
                    as={Input}
                    value={formikProps.values.overviewTitle}
                    onChange={formikProps.handleChange}
                    onBlur={formikProps.handleBlur}                    
                />
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label className="form-label" help={translate("LABEL_BODY_INFO")}>{translate("LABEL_BODY")}</Form.Label>
                <Form.Control
                    className="form-field"
                    name="overviewBody"
                    placeholder={translate("LABEL_OVERVIEW_BODY")}
                    as={Textarea}
                    value={formikProps.values.overviewBody}
                    onChange={formikProps.handleChange}
                    onBlur={formikProps.handleBlur}                    
                />
            </Form.Group>
        </div>
    </>;
};
export default WizardOverviewStep;
