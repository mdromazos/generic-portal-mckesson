import React, {useEffect, useState } from 'react';
import { useMessageBoxState } from '@informatica/droplets-core';
import BeFormSection from './beFormSection';
import { useTranslation } from "react-i18next";
import DialogBox from "../dialogBox";

const BeFormSections = ({
    beFormData,
    beFormMetadata,
    setBeFormData,
    setSelectedFormSection,
    setSelectedFormField,
    currentStep,
}) => {

    const { t: translate } = useTranslation();

    let [beFormSections, setBeFormSections] = useState([]);
    let [sectionOrder, setSectionsOrder] = useState(-1);
    const deleteSectionMessageBox = useMessageBoxState();

    useEffect(() => {
        setBeFormSections(beFormData.beFormSections);
    }, [beFormData]);

    const getNewSectionData = () => {
        return {
            "name":"",
            "order": getMaxSectionOrder(),
            "beFormFields": []
        };
    };

    const resetSectionOrderValue = (beFormSections) => {
        let order = 0;
        return beFormSections.map(beFormSection => {
            beFormSection.order = ++order;
            return beFormSection;
        });
    };

    const getMaxSectionOrder = () => {
        if(beFormData && beFormData.beFormSections) {
            let maxOrder = beFormData.beFormSections.reduce((max, beSection)=> {
                return  beSection.order > max ?  beSection.order : max;
            }, 0);
            return Number(maxOrder) + 1;
        }
        return -1;
    };

    const updateBeFormSections = (beFormSections) => {
        let beFormDataCopy = JSON.parse(JSON.stringify(beFormData));
        beFormDataCopy.beFormSections = beFormSections;
        setBeFormData(beFormDataCopy);
    };

    const updateBeFormSection = (newBeFormSection) => {
        updateBeFormSections(beFormSections.map(beFormSection => {
            return newBeFormSection.order === beFormSection.order ? newBeFormSection : beFormSection;
        }));
    };

    const addNewSection = () => {
        let newSectionData = getNewSectionData();
        updateBeFormSections([...beFormData.beFormSections, newSectionData]);
    };

    const deleteSectionConfirmationBox = () => {
        if(beFormData.beFormSections.length > 1) {
            return (
                <DialogBox
                    dialogBox={deleteSectionMessageBox}
                    title={translate("LABEL_DELETE_SECTION_DIALOG_HEADER")}
                    messageContentTitle={translate("LABEL_DELETE_SECTION_DIALOG_TITLE")}
                    clickHandler={deleteSection}
                    actionButtonText={translate("PORTAL_DELETE_DIALOG_DELETE_BTN")}
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

    const openDeleteSectionBox = (sectionOrder) => {
        setSectionsOrder(sectionOrder);
        deleteSectionMessageBox.open()
    };

     const deleteSection = () => {
        if(beFormData.beFormSections.length > 1 && sectionOrder >= 0) {
            let updatedSectionList = beFormData.beFormSections.filter((beFormSection) => {
                return beFormSection.order !== sectionOrder;
            });
            setSectionsOrder(-1);
            updateBeFormSections(updatedSectionList);
        }
    };

    const moveSectionUp = (sectionOrder) => {
        if(beFormData.beFormSections.length > 1) {
            let sectionIndex = beFormData.beFormSections.findIndex(
                beFormSection => beFormSection.order === sectionOrder);

            if (sectionIndex > 0) {
                let updatedBeFormSections = beFormData.beFormSections.map(beFormSection => beFormSection);
                [updatedBeFormSections[sectionIndex - 1], updatedBeFormSections[sectionIndex]] =
                    [updatedBeFormSections[sectionIndex], updatedBeFormSections[sectionIndex - 1]];
                updateBeFormSections(resetSectionOrderValue(updatedBeFormSections));
            }
        }
    };

    const moveSectionDown = (sectionOrder) => {
        if(beFormData.beFormSections.length > 1) {
            let sectionIndex = beFormData.beFormSections.findIndex(
                beFormSection => beFormSection.order === sectionOrder);

            if(sectionIndex < (beFormData.beFormSections.length - 1)) {
                let updatedBeFormSections = beFormData.beFormSections.map(beFormSection => beFormSection);
                [updatedBeFormSections[sectionIndex + 1], updatedBeFormSections[sectionIndex]] =
                    [updatedBeFormSections[sectionIndex], updatedBeFormSections[sectionIndex + 1]];
                updateBeFormSections(resetSectionOrderValue(updatedBeFormSections));
            }
        }
    };

    return (
        <>
            {!deleteSectionMessageBox.closed && deleteSectionConfirmationBox()}
            <div className="builder__heading">
                <span className="builder__heading_title">{translate("LABEL_FIELDS")}</span>
            </div>
            <div className="builder__body">
                {
                    beFormSections && beFormSections.map((beFormSection, index) =>
                        <BeFormSection
                            key={index}
                            configName={beFormData.configName}
                            configType={beFormData.configType}
                            beFormSection={beFormSection}
                            beFormMetadata={beFormMetadata}
                            addNewSection={() => addNewSection()}
                            deleteSection={(sectionOrder) => openDeleteSectionBox(sectionOrder)}
                            moveSectionUp={(sectionOrder) => moveSectionUp(sectionOrder)}
                            moveSectionDown={(sectionOrder) => moveSectionDown(sectionOrder)}
                            updateBeFormSection={(beFormSection) => updateBeFormSection(beFormSection)}
                            setSelectedFormSection={(beFormSection) => setSelectedFormSection(beFormSection)}
                            setSelectedFormField={(selectedField)=> {setSelectedFormField(selectedField)}}
                            currentStep={currentStep}
                        />
                    )
                }
        </div>
        </>
    );
};
export default BeFormSections;
