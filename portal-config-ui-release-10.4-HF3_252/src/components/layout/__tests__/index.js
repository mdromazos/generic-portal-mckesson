import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom'
import Layout from '../layout';
import { fireEvent, render } from '@testing-library/react';
import { sectionList, sectionTemplates } from '../__mocks__';

jest.mock('nanoid/non-secure', () => ({
    nanoid: () => jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

const renderPage = ({ sectionTemplates= null } = {}) => render(
    <Router>
        <Layout
            sectionList={sectionList}
            sectionTemplates={sectionTemplates}
            dataUpdateNotification= {jest.fn()}
            onAddComponent= {jest.fn()}
            renderComponentContent= {jest.fn()}
        />
    </Router>
);

describe('Layout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new section and move the section up when user clicks on up button ', async () => {
        const { queryByTestId } = renderPage({ sectionTemplates });

        // Add new section
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__add')[0])
        const addNew = queryByTestId('layout__section__add');
        fireEvent.click(addNew)

        // Move section up
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__controls')[1])
        const moveUp = queryByTestId("moveup");
        fireEvent.click(moveUp);
    }, 30000);

    it('should add a new section and move the section down when user clicks on down button ', async () => {
        const { queryByTestId } = renderPage({ sectionTemplates });

        // Add new section
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__add')[0])
        const addNew = queryByTestId('layout__section__add');
        fireEvent.click(addNew)

        // Move section up
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__controls')[0])
        const moveDown = queryByTestId("movedown");
        fireEvent.click(moveDown);
    }, 30000);    

    it('should be able to delete a section ', async () => {
        const { queryByTestId, queryAllByTestId } = renderPage({ sectionTemplates });

        // Add new section
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__add')[0])
        const addNew = queryByTestId('layout__section__add');
        fireEvent.click(addNew)

        // Move section up
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__controls')[1])
        const deleteSection = queryAllByTestId("delete")[1];
        fireEvent.click(deleteSection);

        expect(queryByTestId('message-box')).toBeInTheDocument();

        // Click on delete button
        fireEvent.click(queryByTestId('delete-action-button'));
    }, 30000);

    it('should be able to delet ', async () => {
        const { container, debug, queryByTestId, queryAllByTestId } = renderPage({ sectionTemplates });
    
        // Add new section
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__add')[0])
        const addNew = queryByTestId('layout__section__add');
        fireEvent.click(addNew)
    
        fireEvent.mouseOver(document.querySelectorAll('.layout__section__controls')[1]);
        const layoutControlIcon = queryAllByTestId("rectangle")[1];
        fireEvent.mouseOver(layoutControlIcon)
    
        expect(queryByTestId('layout-template-controls')).toBeInTheDocument();
    
    }, 30000);                                                            

});
