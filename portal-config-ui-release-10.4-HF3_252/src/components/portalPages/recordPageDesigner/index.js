import React, { useContext } from "react";
import { APIMap } from '../../../utils/apiMappings';
import BeFormBuilder from "../../beFormBuilder/beFormBuilder"
import APIService from "../../../utils/apiService";
import { StateContext } from "../../../context/stateContext";
import { getCookie } from '../../../utils/utilityService';
import CONFIG from '../../../config/config';

const RecordPageDesigner = ({
    bevMetadata,
    bevFormData,
    configName,
    handleFormUpdate,
}) => {

    const { state: { portalConfig: { generalSettings: { databaseId }}}} = useContext(StateContext);

    const getLookupTableMetadata = (lookupFieldName) => {
        return new Promise((resolve, reject) => {
            APIService.getRequest(APIMap.getLookupTableMetadata(databaseId, lookupFieldName),
                response => { resolve(response) },
                error => { reject(error) },
                { [CONFIG.HEADERS.ICT]:getCookie(CONFIG.HEADERS.ICT)});
        });
    };

    return <BeFormBuilder
        configName={configName}
        configType="BEView"
        beFormBuilderData={bevFormData}
        beFieldsMetaModel={bevMetadata}
        saveFormData={builderFormData => handleFormUpdate(builderFormData)}
        getLookupTableMetadata={getLookupTableMetadata}
    />;
};
export default RecordPageDesigner;
