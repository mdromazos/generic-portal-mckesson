import React from 'react';
import PortalPageWizard from '../PortalPageWizard';
import { render } from '@testing-library/react';
import { stepOverviewData } from '../__mocks__/mock-data';
import { Shell } from '@informatica/droplets-core';

Shell.Page = jest.fn().mockImplementation(()=> 'mock-shell-page');

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

describe('Rendering the portal page wizard component', () => {
    const match = {
        params: {
            id: '1',
            orsId: 'orcl-localhost-Supplier'
        }
    };
    
    const renderForm = () => render(
        <PortalPageWizard 
            match={match} 
            className='portal-wizard'
            height={"auto"}
            steps={stepOverviewData.rest.steps}
            wizardStepChangeHandler={stepOverviewData.rest.wizardStepChangeHandler}
            page={stepOverviewData.page}
        />
    );

    it("should render the portal wizard container and mocked shell", () => {
        const { getByTestId, getByText } = renderForm();
        expect(getByTestId('portal-wizard')).not.toBeNull();
        expect(getByText('mock-shell-page')).not.toBeNull();
    });

});

describe('Rendering the portal page wizard component without page props', () => {
    
    const renderForm = () => render(
        <PortalPageWizard 
            className='portal-wizard'
            height={"auto"}
            steps={stepOverviewData.rest.steps}
            wizardStepChangeHandler={stepOverviewData.rest.wizardStepChangeHandler}
        />
    );

    it("should throw error without page prop", () => {
        expect(renderForm).toThrow('PageWizard: `page` prop is required');
    });

});