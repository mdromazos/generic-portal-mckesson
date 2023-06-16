import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import LayoutSection from "./layoutSection";
import { LayoutProvider } from "./layoutContext";
import './layout.css';
import { isArray } from 'util';

const Layout = (props) => {
    /*
    * To get the default section from the list of sections
    * If there is no default, the first item from the section will be returned
    */
    const getDefaultSection = () => {
        let defaultSection;

        const templates = JSON.parse(JSON.stringify(props.sectionTemplates));
        if (!templates || !isArray(templates)) {
            return null;
        }
        const templateLength = templates.length;
        for (let i = 0; i < templateLength; i++) {
            if (templates[i].isDefault === true) {
                defaultSection = templates[i];
                break;
            }
        }
        //If there is no section with isDefault=true, return the  first item from the template list
        return (!defaultSection) ? templates[0] : defaultSection;
    }

    let sectionListData = props.sectionList ? props.sectionList : [getDefaultSection()];
    
    //adding the sectionList input into state
    const [sectionList, updateSectionList] = useState(sectionListData);
    
   /*
    * To get the list of Sections
    */
    const getSectionList = () => {

        if (!sectionList || !isArray(sectionList)) {
            return null;
        }

        return sectionList.map(
            (sectionData, index) => (
                <LayoutSection
                    order={index}
                    key={'section_' + index}
                    data={sectionData}
                   />
            ));
    };

    /*
    * To update the caller on section list update
    */
    useEffect(() => {
        if (props.dataUpdateNotification && typeof (props.dataUpdateNotification === "function")) {
            props.dataUpdateNotification(sectionList);
         }
    }, [sectionList]);

    /*
    * Handler to move down the specified section 
    */
    const moveSectionUpHandler = (sectionIndex) => {

        //To avoid moving the top most section 
        if (sectionIndex === 0) {
            return;
        }

        let newSectionList = [...sectionList];
        newSectionList.splice(sectionIndex - 1, 0, ...newSectionList.splice(sectionIndex, 1));

        updateSectionList(newSectionList);
    };

    /*
    * Handler to move up the specified section 
    */
    const moveSectionDownHandler = (sectionIndex) => {

        //To avoid moving the bottom most section 
        if (sectionIndex === sectionList.length - 1) {
            return;
        }

        let newSectionList = [...sectionList];
        newSectionList.splice(sectionIndex + 1, 0, ...newSectionList.splice(sectionIndex, 1));

        updateSectionList(newSectionList);
    };

    /*
    * Handler to move the sections. Will be triggered from LayoutSection component
    */
    const moveSectionHandler = (sectionIndex, direction) => {
        if (direction === 'UP') {
            moveSectionUpHandler(sectionIndex);
        } else {
            moveSectionDownHandler(sectionIndex);
        }
    };

    /*
    * Handler to delete the sections. Will be triggered from LayoutSection component
    * @input : index : index of the section to be deleted
    */
    const deleteSectionHandler = (sectionIndex) => {
        //To avoid deletion of the default section
        if (sectionList.length === 1) {
            return;
        }

        let newSectionList = [...sectionList];
        newSectionList.splice(sectionIndex, 1);

        updateSectionList(newSectionList);

    };

    /*
    *Handler to add a new section below the passed index.
    *Will be triggered from LayoutSection component
    */
    const addSectionHandler = (sectionIndex) => {
        let defaultSection = getDefaultSection();
        let newSectionList = [...sectionList];
        newSectionList.splice(sectionIndex + 1, 0, defaultSection);
        updateSectionList(newSectionList);
    };

    /*
    *Handler to update the cntainers of a section.
    *Will be triggered from LayoutSection component
    */
    const updateSectionTemplateHandler = (sectionIndex, layoutOption) => {

        let newSectionList = [...sectionList];
        let layoutType = JSON.parse(JSON.stringify(props.sectionTemplates[layoutOption]));
        let sectionToBeUpdated = Object.assign({}, layoutType);
        newSectionList.splice(sectionIndex, 1, sectionToBeUpdated);
        updateSectionList(newSectionList);
    };

    const addComponent = (containerIndex,sectionIndex) => {
        props.onAddComponent(containerIndex, sectionIndex);
     }

    //This data will be passed to provder and it will be consumed from the child components
     const layoutData = {
        handlers: {
            moveSectionHandler: moveSectionHandler,
            deleteSectionHandler: deleteSectionHandler,
            addSectionHandler: addSectionHandler,
            updateSectionTemplateHandler: updateSectionTemplateHandler,
            addComponent : addComponent,
            renderComponentContent:props.renderComponentContent
        },
        sectionList: sectionList,
        sectionTemplates: props.sectionTemplates
    };

    return (
        <LayoutProvider value={layoutData}>
            <React.Fragment>
                {getSectionList()}
            </React.Fragment>
        </LayoutProvider>
    );
};

Layout.propTypes = {
    dataUpdateNotification: PropTypes.func.isRequired,//handler which will notify the caller regarding the sectionList update
    onAddComponent: PropTypes.func.isRequired,
    renderComponentContent: PropTypes.func.isRequired,
    sectionList: PropTypes.arrayOf(
        PropTypes.shape({
            containers: PropTypes.arrayOf(PropTypes.shape({
                style: PropTypes.shape({
                    width: PropTypes.number
                }),
                component: PropTypes.arrayOf(PropTypes.object)
            })),
            displayIcon: PropTypes.string.isRequired
        })),
    sectionTemplates: PropTypes.arrayOf(
        PropTypes.shape({
            containers: PropTypes.arrayOf(PropTypes.shape({
                style: PropTypes.shape({
                    width: PropTypes.number
                }),
                component: PropTypes.arrayOf(PropTypes.object)
            })).isRequired,
            displayIcon: PropTypes.string.isRequired
        })).isRequired    
};

export default Layout;
