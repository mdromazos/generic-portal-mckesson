import React from 'react';
import { Tooltip } from "@informatica/droplets-core";
import '../index.css';
import CONFIG from '../../../config/config';
import { useTranslation } from "react-i18next";

const About = () => {

    const { t: translate } = useTranslation();

    const redirectToOnlineHelp = () => {
        window.open(CONFIG.HELP_URL);
    };

    return <>
        <div className="help-img-container" onClick={redirectToOnlineHelp}>
            <Tooltip content={translate("LABEL_HELP")}>
                <img src={`${CONFIG.ICONS.HELP}`} alt="" className="help-img"/>
            </Tooltip>
        </div>
    </>;
};

export default About;
