import React from 'react';
import { Checkbox } from '@informatica/droplets-core';
import { useTranslation } from "react-i18next";

const PortalWizardHome = ({ overviewHeading, overviewBody, stepOverview }) => {

    const { t: translate } = useTranslation();

    const getStepOverview = () => {
        return stepOverview && stepOverview.map((stepOverviewObject, index) => {
            return (<div className='wizard__step__overview__item' data-testid="wizard_step_overview_item">
                <Checkbox 
                    data-testid={"checkbox_"+stepOverviewObject.name}
                    value={index}
                    key={index}
                    checked={stepOverviewObject.status}
                >
                    {stepOverviewObject.name}
                </Checkbox>
            </div>)
        });
    };

    return (
        <div className='portal__wizard__home_container' data-testid="portal_wizard_home_container">
            <div className='portal__wizard__home_overview' data-testid="portal_wizard_home_overview">
                <div className='portal__wizard__home_overview_title' data-testid="portal_wizard_home_overview_title">
                    {overviewHeading}
                </div>
                <div className='portal__wizard__home_overview_body' data-testid="portal_wizard_home_overview_body">
                    {overviewBody}
                </div>
            </div>
            <div className='portal__wizard__home_progress' data-testid="portal_wizard_home_progress">
                <div className="progress__title" data-testid="portal_wizard_home_progress_title">
                    {translate("LABEL_WIZARD_HOME_PROGRESS")}
                </div>
                {getStepOverview()}
            </div>
        </div>
    );

};
export default PortalWizardHome;
