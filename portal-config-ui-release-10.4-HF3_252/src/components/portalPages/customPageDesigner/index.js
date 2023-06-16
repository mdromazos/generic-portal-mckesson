import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDialogState } from "@informatica/droplets-core";
import Layout from "../../layout/layout";
import ComponentBuilder from "../componentBuilders";
import ComponentSettings from "../componentSettings";
import PropTypes from "prop-types";
import SideBarView from "../sideBarView";

const CustomPageDesigner = ({ sectionData, sectionTemplates, setSectionData }) => {

    const [componentData, setComponentData] = useState({});
    const [cssState, setCssState] = useState("side-bar-div-closed");
    const [renderComponent, setRenderComponent] = useState([]);
    const { t: translate } = useTranslation();
    const settingsDisplayDialogBox = useDialogState();

    const onAddComponentHandler = (component) => {
        const [containerIndex, sectionIndex] = [...renderComponent];
        let containerIndexValue = parseInt(containerIndex.slice(containerIndex.length - 1));
        let componentObject = {
            "title": translate(component.label),
            "componentType": component.type,
        };
        let updatedSectionData = Object.assign([{}], sectionData);
        if (updatedSectionData[sectionIndex].containers[containerIndexValue].components === undefined) {
            updatedSectionData[sectionIndex].containers[containerIndexValue].components = [];
        }
        updatedSectionData[sectionIndex].containers[containerIndexValue].components.push(componentObject);
        setSectionData(updatedSectionData);
        setCssState("side-bar-div-closed");
    };

    const onAddComponent = (containerIndex, sectionIndex) => {
        const arrayParameters = [containerIndex, sectionIndex];
        setRenderComponent(arrayParameters);
        setCssState("side-bar-div-open");
    };

    const onSideBarClosed = () => {
        setCssState("side-bar-div-closed");
    };
    const renderComponentBuilder = (componentData, componentIndex, containerIndex, sectionIndex) => {
        return (
            <ComponentBuilder
                sectionData={sectionData}
                componentIndex={componentIndex}
                containerIndex={containerIndex}
                component={componentData}
                sectionIndex={sectionIndex}
                setSectionData={setSectionData}
                openDialogBox={settingsDisplayDialogBox.open}
                setComponentData={setComponentData}
            />
        );
    };

    return <>
        {
            !settingsDisplayDialogBox.closed && <ComponentSettings
                settingsDisplayDialogBox={settingsDisplayDialogBox}
                componentData={componentData}
            />
        }
        <SideBarView cssClassName={cssState} closeSideBar={onSideBarClosed} addComponent={onAddComponentHandler}/>
        <Layout
            dataUpdateNotification={(data) => setSectionData(data)}
            sectionList={sectionData}
            sectionTemplates={sectionTemplates}
            onAddComponent={onAddComponent}
            renderComponentContent={renderComponentBuilder}
        />
    </>;
};

CustomPageDesigner.propTypes = {
    setSectionData: PropTypes.func.isRequired,
    sectionTemplates: PropTypes.arrayOf(
        PropTypes.shape({
            containers: PropTypes.arrayOf(PropTypes.shape({
                style: PropTypes.shape({
                    width: PropTypes.number,
                }),
                component: PropTypes.arrayOf(PropTypes.object),
            })).isRequired,
            displayIcon: PropTypes.string.isRequired,
        })).isRequired,
};
export default CustomPageDesigner;
