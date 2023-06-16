import React from 'react';
import TwitterFeed from '../index';
import { render, cleanup } from '@testing-library/react';
import { component_data } from '../__mocks__/twitterFeed-data';

afterEach(cleanup);

describe('Rendering Portal Twitter component', () => {

    const renderForm = () => render(
        <TwitterFeed component={component_data}/>
    );

    it("Renders Portal Twitter component properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('twitter__component')).not.toBeNull();
        expect(getByTestId('twitter__component__body')).not.toBeNull();
        expect(getByTestId('twitter__link')).not.toBeNull();
    });

    it("Portal Twitter component Heading should match with the data", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('twitter__component').textContent).toMatch(component_data.title);
    });
});

