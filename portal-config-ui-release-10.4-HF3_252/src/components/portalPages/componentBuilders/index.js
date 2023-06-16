import { Card, Toolbar, useMessageBoxState } from "@informatica/droplets-core";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import React from "react";
import "./index.css";
import PropTypes from "prop-types";
import CONFIG from "../../../config/config";
import { useTranslation } from "react-i18next";
import DialogBox from "../../dialogBox";

const ComponentBuilder = (props) => {
    const {MOVE_ARROWS:{UP, DOWN}} = CONFIG;
    const { t: translate } = useTranslation();
    const deleteComponentMessageBox = useMessageBoxState();
    
    /**
    * Function used to reorder the components
    * @param propsData
    * @param direction
    * @param id
    * @returns {*}
    */

    const handleMove = (propsData, direction, id) => {
        let sectionDataCopy = [...propsData.sectionData];
        let containerIndexCopy = parseInt(propsData.containerIndex.slice(propsData.containerIndex.length - 1));
        let sectionContainer = sectionDataCopy[propsData.sectionIndex].containers[containerIndexCopy];
        let sectionID = 0;
        let transformContainers = [];
        sectionContainer.components.map((component)=>{
            if(component.id === id){
                transformContainers.push(sectionContainer);
                sectionID = sectionDataCopy[propsData.sectionIndex];
            }
            return component;
        });
        const items = transformContainers[0].components;
        const position = items.findIndex((i) => i.id === id);
        if (position < 0) {
          return; //Given item not found.
        } else if ((direction === UP && position === 0) || (direction === DOWN && position === items.length - 1)) {
          return; // reached top most position, cannot move.
        }
        const item = items[position];
        const newItems = items.filter((i) => i.id !== id) // remove item from array
        newItems.splice(position + direction, 0, item)
        transformContainers[0].components = newItems;
        const reorderedComponents = sectionDataCopy.filter((customComponent)=>{
            if(customComponent.id === sectionID){
                customComponent.containers = transformContainers;
            }
            return true;
        });
        propsData.setComponentData(reorderedComponents);
    }

    const componentSettingHandler = (propsData) => {
        props.openDialogBox()
        props.setComponentData(propsData);
    };

    const deleteComponentHandler = (propsData) => {
        //#TODO :: let sectionDataCopy = JSON.parse(JSON.stringify(propsData.sectionData));
        let sectionDataCopy = [...propsData.sectionData];
        let containerIndexCopy = parseInt(propsData.containerIndex.slice(propsData.containerIndex.length - 1));
        sectionDataCopy[propsData.sectionIndex].containers[containerIndexCopy].components.splice(propsData.componentIndex, 1);
        propsData.setSectionData(sectionDataCopy);
    };

    const DeleteConfirmationBox = () => (
        <DialogBox
            dialogBox={deleteComponentMessageBox}
            title={translate("LABEL_COMPONENT_DELETE_MESSAGE_TITLE")}
            messageContentTitle={translate("LABEL_COMPONENT_DELETE_MESSAGE_CONTENT",
                { COMPONENT_NAME: `${props.component.title}` })}
            clickHandler={() => deleteComponentHandler(props)}
            actionButtonText={translate("LAYOUT_BUTTON_DELETE")}
            cancelButtonText={translate("LAYOUT_BUTTON_CANCEL")}
        />
    );

    return (
        <div className="render-component">
            <Card className="card-section">
                <Card.Header title={props.component.title}>
                    <Toolbar>
                        <i className="aicon aicon__settings" onClick={() => componentSettingHandler(props)}/>
                        <i className="aicon aicon__toolbar_move_up_down rotate_up" onClick={() => handleMove(props, UP, props.component.id)} />
                        <i className="aicon aicon__toolbar_move_up_down" onClick={() => handleMove(props, DOWN, props.component.id)} />
                        <i className="aicon aicon__delete" onClick={deleteComponentMessageBox.open}/>
                    </Toolbar>
                </Card.Header>
                <Card.Body/>
            </Card>
            {!deleteComponentMessageBox.closed && <DeleteConfirmationBox />}
        </div>
    );
};

ComponentBuilder.propTypes = {
    openDialogBox: PropTypes.func.isRequired,
    setComponentData: PropTypes.func.isRequired,
};
export default ComponentBuilder;
