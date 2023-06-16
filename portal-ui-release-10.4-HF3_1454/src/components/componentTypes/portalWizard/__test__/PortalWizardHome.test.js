import React from 'react';
import PortalWizardHome from '../PortalWizardHome';
import { portalPages } from '../__mocks__/wizard-data';
import { render } from '@testing-library/react';
import { stepOverview } from '../__mocks__/mock-data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

describe('Rendering the portal wizard home component', () => {
    const match = {
        params: {
            id: '1',
            orsId: 'orcl-localhost-Supplier'
        }
    };
    const pages_data = portalPages.pages[0].layout.sections[0].containers[0].components[0];
    
    const renderForm = () => render(
        <PortalWizardHome match={match} 
            overviewHeading={pages_data.overviewTitle} 
            overviewBody={pages_data.overviewBody} 
            stepOverview={stepOverview}
        />
    ); 

    it("Renders the wizard home overview properly", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('portal_wizard_home_container')).not.toBeNull();
        expect(queryAllByTestId('portal_wizard_home_overview')).not.toBeNull();
        expect(queryAllByTestId('portal_wizard_home_overview_title')).not.toBeNull();
        expect(queryAllByTestId('portal_wizard_home_overview_body')).not.toBeNull();
        expect(queryAllByTestId('portal_wizard_home_progress')).not.toBeNull();
        expect(queryAllByTestId('portal_wizard_home_progress_title')).not.toBeNull();
        expect(queryAllByTestId('wizard_step_overview_item')).not.toBeNull();
    });

    it("number of overview steps should be equal to number of pages", () => {
        const { queryAllByTestId } = renderForm();
        expect(queryAllByTestId('wizard_step_overview_item').length).toStrictEqual(8);
    });

});