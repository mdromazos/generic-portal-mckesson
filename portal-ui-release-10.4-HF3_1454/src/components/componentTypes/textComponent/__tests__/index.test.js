import React from 'react';
import Text from '../index';
import { render, cleanup } from '@testing-library/react';
import {component_data, data__without__heading__and___body} from '../__mocks__/text-component-data';

afterEach(cleanup);

describe('Rendering Portal Text component', () => {

    const renderForm = () => render(
        <Text component={component_data}/>
    );

    it("Renders Portal Text component properly", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('text__component')).not.toBeNull();
        expect(getByTestId('text__component__heading')).not.toBeNull();
        expect(getByTestId('text__component__body')).not.toBeNull();
    });

    it("Portal Text component Heading and body should match with the data", () => {
        const { getByTestId } = renderForm();
        expect(getByTestId('text__component__heading').textContent).toMatch(component_data.heading);
        expect(getByTestId('text__component__body').textContent).toMatch(component_data.body);
    });
});

describe('Rendering Portal Text component without header and body', () => {

    const renderForm = () => render(
        <Text component={data__without__heading__and___body}/>
    );

    it("Renders Portal Text component properly without header and body", () => {
        const { getByTestId, queryAllByTestId } = renderForm();
        expect(getByTestId('text__component')).not.toBeNull();
        expect(queryAllByTestId('text__component__heading').length).toStrictEqual(0);
        expect(queryAllByTestId('text__component__body').length).toStrictEqual(0);
    });
});
