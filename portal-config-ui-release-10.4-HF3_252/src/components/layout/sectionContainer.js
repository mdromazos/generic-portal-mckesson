import React from 'react';
import PropTypes from "prop-types";

import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import { IconButton} from "@informatica/droplets-core";

import { useTranslation } from "react-i18next";

const SectionContainer = (props) => {

    const { t: translate } = useTranslation();

    const getAddComponentButton = () => {
        let addComponentButton = null;
        if (props.editMode) {
            addComponentButton = (
                <div className='layout__container__add__component'>
                    <IconButton onClick={()=>{props.layoutData.handlers.addComponent(props.id, props.sectionOrder)}}>
                        <span className='layout__container__add__component__label'>
                            {translate("LAYOUT_ADD_COMPONENT")}
                        </span>
                        <i className="layout-ctrl-icon aicon aicon aicon__add-v1" />
                    </IconButton>
                </div>);
        }
        return addComponentButton;
    };

 //To get the highlighed effect
    const containerEditClass = (props.editMode) ? "layout__section__container__edit__mode" : "";
    return (

        <div style={{ flex: props.data.style.width }} className={'layout__section__container '} >
            {
                props.data.components && props.data.components.map((component,componentIndex) => {
                    return props.layoutData.handlers.renderComponentContent(component, componentIndex, props.id, props.sectionOrder);
                })
            }

            <div className={containerEditClass} style={{ flex: props.data.style.width }}>
                {getAddComponentButton()}
            </div>
        </div>

    );
};

SectionContainer.defaultProps = {
    editMode: false
};

SectionContainer.propTypes = {
    editMode: PropTypes.bool,
    data: PropTypes.shape({
        style: PropTypes.shape({
            width: PropTypes.number.isRequired
        }).isRequired,
        component: PropTypes.arrayOf(PropTypes.object)
    }).isRequired
};

export default SectionContainer;
