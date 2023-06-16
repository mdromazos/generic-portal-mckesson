import React from 'react';
import { StateContext } from '../../../../context/stateContext';
import { portalMetadataStore } from '../../../__mocks__/portal-metadata';
import PortalFooter from '../index';
import { render } from '@testing-library/react';

describe('Examining Portal Footer component', () => {
    const { 123: globalSettings } = portalMetadataStore;

    const renderForm = () => render(
        <StateContext.Provider value={[{globalSettings: globalSettings.generalSettings}]}>
            <PortalFooter />
        </StateContext.Provider>
    );

    it("Renders Portal Footer text properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('portal__footer__text').textContent).toMatch(globalSettings.generalSettings.footer.footerText);
    });

});