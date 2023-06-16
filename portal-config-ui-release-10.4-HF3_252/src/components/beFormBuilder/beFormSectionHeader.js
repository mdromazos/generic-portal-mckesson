import React, { useState } from 'react';
import { IconButton, Tooltip, Input, Form, Checkbox } from "@informatica/droplets-core";
import { useFormik } from 'formik';
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import "./beFormBuilder.css";
import { useTranslation } from "react-i18next";
import CONFIG from "../../config/config";
import { handleChange, handleBlur } from '../../utils/utilityService';

const BeFormSectionHeader = ({
    beFormSection,
    addNewSection,
    deleteSection,
    moveSectionUp,
    moveSectionDown,
    updateBeSectionField,
}) => {

    const { t: translate } = useTranslation();
    const [hideSectionName, setHideSectionName] = useState(!!beFormSection.hideName);

    const toggleHiddenField = () => {
        setHideSectionName(!hideSectionName);
        updateBeSectionField(CONFIG.HIDE_SECTION_NAME, !hideSectionName);
    };

    const formikProps = useFormik({
        initialValues: beFormSection,
        enableReinitialize: true,
    });

    return (
        <div className="section__header__main">
            <div className="section__header__name">
                <form>
                    <Form.Group className="form-group">
                        <Form.Control
                            className="form-field"
                            name="name"
                            as={Input}
                            placeholder={translate("LABEL_SECTION_NAME")}
                            value={formikProps.values.name}
                            onChange={formikProps.handleChange}
                            onBlur={(event) => {
                                formikProps.handleBlur(event);
                                updateBeSectionField(CONFIG.SECTION_NAME, event.currentTarget.value);
                            }}
                        />
                        <span className="section__header__hide__name">
                            <Form.Control
                                name="hideName"
                                as={Checkbox}
                                checked={formikProps.values.hideName}
                                onChange={(e) => {
                                    const { checked } = e.target;
                                    handleChange(formikProps, 'hideName', checked);
                                    handleBlur(formikProps, 'hideName');
                                    toggleHiddenField(e);
                                }}                              
                            >
                                {translate("LABEL_HIDE_SECTION_NAME")}
                            </Form.Control>
                        </span>
                    </Form.Group>
                </form>
            </div>
            <div className="section__header__controls">
                <IconButton onClick={() => moveSectionUp(beFormSection.order)} className="section__header__controls__item">
                    <Tooltip content={translate("LABEL_MOVE_SECTION_UP")}>
                        <i className="template__rotate__down aicon aicon__toolbar_move_up_down section_icons" />
                    </Tooltip>
                </IconButton>
                <IconButton onClick={() => moveSectionDown(beFormSection.order)} className="section__header__controls__item">
                    <Tooltip content={translate("LABEL_MOVE_SECTION_DOWN")}>
                        <i className="aicon aicon__toolbar_move_up_down section_icons" />
                    </Tooltip>
                </IconButton>
                <IconButton onClick={() => deleteSection(beFormSection.order)} className="section__header__controls__item">
                    <Tooltip content={translate("LABEL_DELETE_SECTION")}>
                        <i className="aicon aicon__close section_icons" />
                    </Tooltip>
                </IconButton>
                <IconButton onClick={() => addNewSection()} className="section__header__controls__item">
                    <Tooltip content={translate("LABEL_ADD_SECTION")}>
                        <i className="aicon aicon__add-v1 section_icons" />
                    </Tooltip>
                </IconButton>
            </div>
        </div>
    );
};
export default BeFormSectionHeader;
