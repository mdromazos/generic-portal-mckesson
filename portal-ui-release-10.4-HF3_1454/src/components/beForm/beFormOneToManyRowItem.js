import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import {MessageBox, Button, Tooltip, Form, useMessageBoxState} from '@informatica/droplets-core';
import { success_icon } from "@informatica/archipelago-icons";
import BEFORM_CONFIG from "./beFormConfig";
import { getObjectPropertyValue } from "./validations";
import { getIconButton } from "./beFormUtility";

export const BEFormOneToManyRowItem = ({
    beField, fieldName, isChild, formDisabled, deleteOneToManyRow, dyanamicView,
    children, rowIndex, handleDataValidation, formikProps, groupValidationErrors,
    pendingProtected /* Added */
}) => {

    const [highlighted, setHighlight] = useState(false);
    const { t: translate } = useTranslation();
    const { META_KEYS, OPERATIONS,ICONS: { ALERT } } = BEFORM_CONFIG;

    const messageBox = useMessageBoxState();

    const handleMouseOver = () => {
        setHighlight(true);
    };

    const handleMouseOut = () => {
        setHighlight(false);
    };

    const deleteConfirmationMessageBox = () => {
        return (
            <MessageBox
                type="warning"
                title={translate("BE_FORM_DELETE_CONFIRMATION_TITLE")}
                data-testid="be_form_delete_box"
                {...messageBox}    
            >
                <MessageBox.Content data-testid="be_form_delete_box_content">
                    <div className="beform__content__header">
                        <img src={ALERT} alt={translate("LABEL_ALERT_ICON")} className="beform__cancel__alert__icon" />
                        <span className="beform__cancel__message__title">{`${translate("BE_FORM_DELETE_CONFIRMATION_MESSAGE")}`}</span>
                    </div>
                </MessageBox.Content>
                <MessageBox.Footer data-testid="be_form_delete_box_footer">
                    <Button
                        data-testid="be_form_delete_cancel_button"
                        onClick={() => {
                            messageBox.close();
                        }}>
                        {translate("BE_FORM_LABEL_CANCEL")}
                    </Button>
                    <Button
                        onClick={() => {
                            messageBox.close();
                            deleteOneToManyRow(rowIndex);
                        }}
                        data-testid="be_form_delete_button"
                        variant="primary"
                    >
                        {translate("BE_FORM_LABEL_DELETE")}
                    </Button>

                </MessageBox.Footer>
            </MessageBox>
        );
    };

    const renderOneToManyItem = () => {
        let rowClassName = (isChild) ? "one-to-many-grid-row-child" : "one-to-many-grid-row-parent";
        rowClassName += dyanamicView ? " one-to-many-dyanamic-view" : "";
        const allowDeletion = getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.DELETE, META_KEYS.ALLOWED) 
            && !pendingProtected; // ADDED

        let oneToManyItemHeader;
        if (isChild) {
            oneToManyItemHeader =
            <div className='one-to-many-row-header' data-testid='one-to-many-row-header'>
                <div className="field-controls">
                    {
                        allowDeletion && highlighted && !formDisabled
                        && getIconButton(
                            () => messageBox.open(),
                            translate("BE_FORM_LABEL_DELETE"),
                            OPERATIONS.DELETE,
                            OPERATIONS.DELETE
                        )
                    }
                </div>
            </div>    
        } else {
            oneToManyItemHeader = <>
                <div className="field-validation-message" data-testid='field-validation-message'>
                    {
                        groupValidationErrors && groupValidationErrors[`${fieldName}_${rowIndex}`]
                        && <Tooltip
                            content={<div>{translate("BE_FORM_LABEL_VALIDATED")}</div>}>
                            <img src={success_icon} alt="success icon" className="field-validation-message-icon" />
                        </Tooltip>
                    }
                </div>
                <div className='one-to-many-row-header' data-testid='one-to-many-row-header'>
                    <div className="field-controls">
                        {
                            highlighted && beField && beField.enableValidation && !formDisabled
                            && getIconButton(
                                () => handleDataValidation(beField, formikProps, fieldName, rowIndex),
                                translate("BE_FORM_LABEL_VALIDATE"),
                                OPERATIONS.VALIDATION,
                                OPERATIONS.VALIDATION
                            )
                        }
                        {
                            allowDeletion && highlighted && !formDisabled
                            && getIconButton(
                                () => messageBox.open(),
                                translate("BE_FORM_LABEL_DELETE"),
                                OPERATIONS.DELETE,
                                OPERATIONS.DELETE
                            )
                        }
                    </div>
                </div>
            </>
        }
        return <>
            {!messageBox.closed && deleteConfirmationMessageBox()}
            <div className={rowClassName}
                onMouseEnter={handleMouseOver}
                onMouseLeave={handleMouseOut}
                data-testid="one-to-many-row"
            >
                { oneToManyItemHeader }
                {formikProps.touched[fieldName] && formikProps.touched[fieldName].item[rowIndex] && formikProps.touched[fieldName].item[rowIndex].rootError
                && formikProps.errors[fieldName] && formikProps.errors[fieldName].item[rowIndex] && formikProps.errors[fieldName].item[rowIndex].rootError &&
                    <div className="be-form-many-root-error" data-testid='be-form-many-root-error'>
                        <Form.Group name={`${fieldName}.item[${rowIndex}].rootError`} key={`${fieldName}.item[${rowIndex}].rootError`}>
                            <Form.Error>{formikProps.errors[fieldName].item[rowIndex].rootError}</Form.Error>
                        </Form.Group>
                    </div>
                }
                {/* Added */}
                { pendingProtected &&
                    <div className="be-form-many-root-error" data-testid='be-form-many-root-error'>
                        <Form.Group name={`${fieldName}.item[${rowIndex}].rootError`} key={`${fieldName}.item[${rowIndex}].rootError`}>
                            <Form.Warning>{translate("BE_FORM_ONE_TO_MANY_ITEM_PENDING")}</Form.Warning>
                        </Form.Group>
                    </div>
                }
                <div className='one-to-many-row-body' data-testid='one-to-many-row-body'>
                    {children}
                </div>
            </div>
        </>;
    };

    return (
        renderOneToManyItem()
    );
};

BEFormOneToManyRowItem.propTypes = {};

export default BEFormOneToManyRowItem;
