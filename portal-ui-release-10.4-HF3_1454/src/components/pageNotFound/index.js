import React from 'react';
import { useTranslation } from "react-i18next";
import CONFIG from "../../config/config";

const PageNotFound = () => {
    const { t: translate } = useTranslation();
    return (
        <div className="portal_page__not__found" data-testid="page-not-found">
            <img alt="" src={CONFIG.IMAGES.ERROR_404} />
            <span className="portal__error__heading">
                { translate("LABEL_PAGE_NOT_FOUND") }
            </span>
        </div>        
    )
};

export default PageNotFound;