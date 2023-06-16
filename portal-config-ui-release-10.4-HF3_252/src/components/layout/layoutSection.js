import React, { useState } from 'react';
import PropTypes from "prop-types";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import { IconButton, Tooltip, useMessageBoxState } from "@informatica/droplets-core";
import LayoutContainer from "./sectionContainer";
import { LayoutConsumer } from "./layoutContext";
import TemplateMenu from "./templateMenu"
import { isArray } from 'util';
import DialogBox from '../dialogBox'

import { useTranslation } from "react-i18next";

const LayoutSection = (props) => {

    const { t: translate } = useTranslation();

    //For switching the edit mode
    const [editMode, setEditMode] = useState(false);

    //For delete confirmation
    const deleteSectionMessageBox = useMessageBoxState();

    const handleMouseOver = (e) => {
        setEditMode(true);
    };

    const handleMouseOut = (e) => {
        setEditMode(false);
        if(!deleteSectionMessageBox.closed) { deleteSectionMessageBox.close() };
    };

    const deleteSectionConfirmation = () => {
        deleteSectionMessageBox.open();
    };

    const getContainerList = (layoutData) => {
        const sectionData = props.data;
        if (!sectionData || !sectionData.containers || !isArray(sectionData.containers)) {
            return null;
        }

        let containersList = sectionData.containers;
        return containersList.map(
            (containerData, index) => (
                <LayoutContainer
                    key={'container_' + index}
                    id={'container_' + index}
                    data={containerData}
                    editMode={editMode}
                    layoutData={layoutData}
                    sectionOrder={props.order}
                    />
            ));
    };

    const getAddSectionButton = (layoutData) => {
        let addSectionObj = null;
        let addNewClassName = "layout__section__add";

        if (editMode) {
            addNewClassName += " layout__section__add__active";
            addSectionObj = (
                <IconButton
                    data-testid="layout__section__add"
                    onClick={() => layoutData.handlers.addSectionHandler(props.order)}>
                    <span className='layout__section__add__label'>{translate("LAYOUT_ADD_SECTION")}</span>
                    <i className="layout__ctrl__icon__add__section aicon aicon aicon__add-v1" />
                </IconButton>);
        }
        return (<div className={addNewClassName} > {addSectionObj}</div>);
    };

    /*
    * For getting the list of section templates which will allow user to swithch the section template
    */
    const getSectionTemplateControls = (layoutData) => {

        //ToDo: update the "displayIcon" and the handler icon

        if (!layoutData.sectionTemplates) {
            return null;
        }
        let sectionTemplateItems = (layoutData.sectionTemplates).map(
            (containerLayoutData, index) => (
                <li key={index} onClick={() => layoutData.handlers.updateSectionTemplateHandler(props.order, index)}>
                    <i className={"layout__ctrl__icon aicon aicon aicon__" + containerLayoutData.displayIcon + " template__" + containerLayoutData.displayIcon} />
                </li>
            ));

        if (sectionTemplateItems.length === 0) {
            return null;
        }

        return (<TemplateMenu
            content={
                <ul className='layout__section__template__controls' data-testid="layout-template-controls">
                    {sectionTemplateItems}
                </ul>
            }
            position="bottom">

            <IconButton data-testid={props.data.displayIcon} className={"template__menu__button"}>
                <i className={"layout__ctrl__icon__templates aicon aicon__" + props.data.displayIcon + " template__" + props.data.displayIcon} />
                <i className="aicon aicon__expand-collapse" />
            </IconButton>
        </TemplateMenu>)
    };

    /*
    * For getting the list of actionable button/icon controls to perform delete, switch, mov up/down, section functionality
    */
    const getSectionControls = (layoutData) => {

        let sectionControls = null;
        let controlsClassName = "layout__section__controls";
        const sectionOrder = props.order;
        if (editMode) {
            controlsClassName += " layout__section__controls__active";
            // let disableDelete = (layoutData.sectionList.length === 1) ? true : false;
            let disableMoveUp = (sectionOrder === 0) ? true : false;
            let disableMoveDown = (sectionOrder === layoutData.sectionList.length - 1) ? true : false;
            sectionControls = (
                <>
                    {getIconButton(() => deleteSectionConfirmation(), "LAYOUT_DELETE_SECTION", "delete", "delete")}
                    {getIconButton(() => { layoutData.handlers.moveSectionHandler(sectionOrder, 'DOWN') }, "LAYOUT_MOVE_SECTION_DOWN", "move-up-down", "movedown", disableMoveDown)}
                    {getIconButton(() => { layoutData.handlers.moveSectionHandler(sectionOrder, 'UP') }, "LAYOUT_MOVE_SECTION_UP", "move-up-down", "moveup", disableMoveUp)}
                    {getSectionTemplateControls(layoutData)}
                    {getDeleteConfirmationBox(layoutData)}
                </>
            );
        }
        return (<div className={controlsClassName} >{sectionControls}</div>);
    };

    const getIconButton = (clickHandler, toolTipLabel, iconName, iconClass, disabled = false, toolTipPosition = 'top') => {

        let iconButton;

        if (disabled) {
            iconButton = (<IconButton disabled={true}>
                <i className={"layout__ctrl__icon__" + iconClass + " aicon aicon__" + iconName + " layout__ctrl__icon__disabled"} />
            </IconButton>);
        } else {
            iconButton = (<Tooltip content={translate(toolTipLabel)} position={toolTipPosition}>
                <IconButton onClick={clickHandler} data-testid={iconClass}>
                    <i className={"layout__ctrl__icon__" + iconClass + " aicon aicon__" + iconName} />
                </IconButton>
            </Tooltip>);
        }

        return iconButton;
    }

    /*
    * To bring up dialogue box for propting user for confirmation mefore performing delete action
    */

    const getDeleteConfirmationBox = (layoutData) => {
        if(layoutData.sectionList.length > 1) {
            return (
                <DialogBox
                    dialogBox={deleteSectionMessageBox}
                    title={translate("LAYOUT_DELETE_MESSAGE_TITLE")}
                    messageContentTitle={translate("LAYOUT_DELETE_MESSAGE_CONTENT")}
                    clickHandler={() => {
                        deleteSectionMessageBox.close();
                        layoutData.handlers.deleteSectionHandler(props.order);
                    }}
                    className="layout__ctrl__delete_ok"
                    data-testid="delete-action-button"
                    actionButtonText={translate("LAYOUT_BUTTON_DELETE")}
                    cancelButtonText={translate("PORTAL_DELETE_DIALOG_CANCEL_BTN")}
                >
                </DialogBox>
            );
        } else {
            return (
                <DialogBox
                    dialogBox={deleteSectionMessageBox}
                    title={translate("LABEL_DELETE_SECTION_DIALOG_HEADER")}
                    messageContentTitle={translate("LABEL_DELETE_SECTION_DIALOG_FAILURE_TITLE")}
                    actionButtonText={translate("LABEL_CLOSE_BUTTON")}
                    clickHandler={deleteSectionMessageBox.close}
                >
                </DialogBox>
            );
        }
    };

    return (
        <LayoutConsumer>
            {layoutData => (
                <div id={"section_" + props.order}
                    className='layout__section'
                    onMouseEnter={handleMouseOver}
                    onMouseLeave={handleMouseOut}>
                    {getSectionControls(layoutData)}
                    <div id={"section_" + props.order + "_body"} className='layout__section__body'>
                        <React.Fragment>
                            {getContainerList(layoutData)}
                        </React.Fragment>
                    </div>
                    {getAddSectionButton(layoutData)}

                </div>
            )}
        </LayoutConsumer>
    );
};

LayoutSection.propTypes = {
    order: PropTypes.number.isRequired,
    data: PropTypes.shape({
        containers: PropTypes.arrayOf(PropTypes.shape({
            style: PropTypes.shape({
                width: PropTypes.number
            }),
            component: PropTypes.arrayOf(PropTypes.object)
        })),
        displayIcon: PropTypes.string.isRequired
    })
};

export default LayoutSection;
