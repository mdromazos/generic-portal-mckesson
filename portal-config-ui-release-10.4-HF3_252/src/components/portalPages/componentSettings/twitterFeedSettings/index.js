import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "@informatica/droplets-core";

const TwitterFeedSettings = ({ formikProps }) => {
    const { t: translate } = useTranslation();

    return <Form.Group className="form-group" required>
        <Form.Label className="form-label" help={translate("LABEL_TWITTER_URL_INFO")}>{translate("LABEL_TWITTER_URL")}</Form.Label>
        <Form.Control
            className="form-field"
            name="url"
            placeholder={translate("LABEL_TWITTER_FEED_URL")}
            as={Input}
            value={formikProps.values.url}
            onChange={formikProps.handleChange}
            onBlur={formikProps.handleBlur}
        />
        {formikProps.touched.url
            && formikProps.errors.url
            &&(<div className="form-error">
                <Form.Error>{formikProps.errors.url}</Form.Error></div>)}
    </Form.Group>;
};
export default TwitterFeedSettings;
