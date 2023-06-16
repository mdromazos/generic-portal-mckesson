import * as React from "react";
import PortalWizard from "./PortalWizard";
import {Shell} from '@informatica/droplets-core';

function PortalPageWizard({ page, controls, className, height, ...rest }) {
    if (!page) {
        throw new Error("PageWizard: `page` prop is required");
    }

    const { buttonGroup = [], extraButtonsGroup = [], ...restPage } = page;

    return (
        <div className={className} style={{height: height}} data-testid="portal-wizard">
            <PortalWizard {...rest}>
                <Shell.Page
                    {...restPage}
                    buttonGroup={[<PortalWizard.Controls {...controls} renderOnStepsCompleted={buttonGroup} extraButtons={extraButtonsGroup} />]}>
                    <div className= "portal__wizard__roadmap">
                        <PortalWizard.Roadmap />
                    </div>
                    <div className="d-panel portal__wizard__view">
                        <PortalWizard.View />
                    </div>
                </Shell.Page>
            </PortalWizard>
        </div>
    );
}

export default PortalPageWizard;
