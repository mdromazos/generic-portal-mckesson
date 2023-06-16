import React from 'react';
import BEFormOneToManyRowItem from '../BEFormOneToManyRowItem';
import { render } from '@testing-library/react';
import { beMeta } from '../__mocks__/be-mock-data';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('@informatica/archipelago-icons', () => () => 'mocking-archipelago-icons');

const children = 'Sample_Text';

const formikProps= {
    touched: {
        "OneToManyGroup.Address" : {
            item : {
                1 : {
                    rootError : true
                }
            }
        }
    },
    errors: {
        "OneToManyGroup.Address" : {
            item : {
                1 : {
                    rootError : 'ROOT_ERROR'
                }
            }
        }
    }
}

describe('Testing the BE Form One to Many Row Item component', () => {

    const beFields = beMeta.beFormSections[0].beFormFields[1];

    const handleDataValidation = jest.fn();

    const renderForm = () => render(
        <BEFormOneToManyRowItem 
            beField={beFields} 
            fieldName={"OneToManyGroup."+`${beFields.name}`} 
            children={children} 
            handleDataValidation={handleDataValidation} 
            isChild={true}
            rowIndex={1}
            formDisabled={true}
            formikProps={formikProps}
        />
    );

    it('Should render the skeleton for BE form one to many row item', () => { 
        const { getByTestId } = renderForm();
        expect(getByTestId("one-to-many-row")).not.toBeNull();
        expect(getByTestId("one-to-many-row-header")).not.toBeNull();
        expect(getByTestId("be-form-many-root-error")).not.toBeNull();
        expect(getByTestId("one-to-many-row-body")).not.toBeNull();
    });

    it('Should render the children in the row', () => { 
        const { getByTestId } = renderForm();
        expect(getByTestId("one-to-many-row-body").textContent).toMatch(children);
    });

});