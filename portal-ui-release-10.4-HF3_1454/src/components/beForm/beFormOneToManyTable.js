import React, { useEffect, useState, useRef } from 'react';
import { Pagination, Table, IconButton, Tooltip ,FilterGroup, createTable} from '@informatica/droplets-core';
import { useTranslation } from "react-i18next";
import BEFORM_CONFIG from "./beFormConfig";
import BEFormField from "./beFormField";
import { getObjectPropertyValue } from "./validations";
import { getIconButton, getFieldValue } from "./beFormUtility";
import { success_icon } from "@informatica/archipelago-icons";

export const BEFormOneToManyTable = ({
    beField, sectionMetaData, index, fieldName, beData, formDisabled, formikProps, getOneToManyBEDataHandler,
    fileHandler, dateFormat, maxColumns, manyDt, locale, updateBEData, parentDataPath = "", lookupValueChangeHandler,
    lookupOptionsHandler, changeViewHandler, handleDataValidation, groupValidationErrors, previewMode = false
}) => {

    const { t: translate } = useTranslation();
    const { VIEW_TYPE, ONE_TO_MANY, META_KEYS, OPERATIONS, DATA_TYPES, SCROLL_TYPE : { SMOOTH }, 
        FIELD_TYPES : { DROPDOWN, RADIO_BUTTON, CHECKBOX } } = BEFORM_CONFIG;
    const [oneToManyData, setOneToManyData] = useState({ data: {}, total: 0 });//initialize to undefined
    const [rowAction, setRowAction] = useState(null);
    const [beFieldTypeMap, setBeFieldTypeMap] = useState(null);
    const viewMode = VIEW_TYPE.GRID;
    const allowDeletion = getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.DELETE, META_KEYS.ALLOWED);

    const oneToManyTableRef = useRef(null);

    useEffect(() => {
        let beFieldTypeMap = {};
        beField && beField.beFormFields && Array.isArray(beField.beFormFields) && beField.beFormFields.forEach(beManyChild => {
            if (!beManyChild.many) {
                beFieldTypeMap[beManyChild.name] = beManyChild.dataType;
            }
        });
        setBeFieldTypeMap(beFieldTypeMap);
    },[beField]);


    const getFilterOptions = () => {
        let optionList = { "filter": [] };
        beField && beField.beFormFields && Array.isArray(beField.beFormFields) && beField.beFormFields.forEach(beManyChild => {
            if (!beManyChild.many) {
                if (beManyChild.fieldType === DROPDOWN) {
                    let lookupOptions = lookupOptionsHandler(beManyChild, manyDt);
                    let lookupOptionValues = lookupOptions.filter(lookupOption =>
                            lookupOption.text !== translate("LABEL_NONE") && lookupOption.value
                        ).map(lookupOption => (
                            {
                                label: lookupOption.text,
                                value: lookupOption.value,
                            }
                        )
                    );
                    optionList.filter.push({
                        label: beManyChild.label,
                        key: beManyChild.name,
                        controlType: FilterGroup.Controls.SingleSelect({
                            options: lookupOptionValues,
                        }),
                    });
                } 
                else if(beManyChild.dataType === DATA_TYPES.DATE) {
                    optionList.filter.push({
                        label: beManyChild.label,
                        key: beManyChild.name,
                        controlType: FilterGroup.Controls.DateRangeFilter(),
                    });
                }   
                else if(beManyChild.fieldType !== CHECKBOX && beManyChild.fieldType !== RADIO_BUTTON) {
                    optionList.filter.push({
                        label: beManyChild.label,
                        key: beManyChild.name,
                        controlType: FilterGroup.Controls.Text(),
                    });
                }
            }
        });
        return optionList;
    };

    let tableOptionsList = getFilterOptions();

    const OneToManyTable = React.useMemo(
        () =>
            createTable(
                Table.Features.withToolbar(),
                Table.Features.withRowActions(),
                Table.Features.withColumnSorting()
            ),
        [formDisabled, oneToManyData]
    );

    const tableOptions =  {
        renderRowActions : rowId => renderRowActions(rowId)
    };

    const tableProps = OneToManyTable.useTable(tableOptions);

    const renderRowActions = (rowId) => {
        let rowActions = [];
        if (!formDisabled && beField.enableValidation) {
            rowActions.push({
                icon: <i className="aicon aicon__validation" />,
                handler: () => triggerRowActons(OPERATIONS.VALIDATION, rowId)

            });
        }
        if (!formDisabled && allowDeletion) {
            rowActions.push({
                icon: <i className="aicon aicon__delete" />,
                handler: () => triggerRowActons(OPERATIONS.DELETE, rowId)
            });
        }
        return rowActions;
    };

    const handleTableDataValidation = (rowIndex) => {
        setRowAction(null);
        handleDataValidation(beField, formikProps, fieldName, rowIndex);
    };

    const getFilterParam = (filterObj) => {
        let filterOption = "";

        switch(beFieldTypeMap[filterObj.field]) {
            case DATA_TYPES.STRING : 
                return filterOption += `${filterObj['field']}+%3D+%27${filterObj['value']}%27`;
            case DATA_TYPES.DATE : 
                return filterObj.value && filterObj.value.start && filterObj.value.end && (filterOption += 
                `${filterObj['field']}+%3D+[${filterObj.value.start.toISOString()},${filterObj.value.end.toISOString()}]`);
            default : 
                return filterOption += `${filterObj['field']}+%3D+%27${filterObj['value']}%27`;
        }
    }

    const [OneToManyTableState] = tableProps.store;

    const queryParams = React.useMemo(() => {
        let sortOption = "";
        let filterOption = "";
        if (OneToManyTableState.sortedColumns) {
            let sortList = Object.keys(OneToManyTableState.sortedColumns);
            if (sortList.length > 0) {
                let order = (OneToManyTableState.sortedColumns)[sortList[0]] === ONE_TO_MANY.SORT.ASCENDING ? "" : "-";
                sortOption = `&order=${order}${sortList[0]}`;
            }
        }
        if (OneToManyTableState.filter.state && OneToManyTableState.filter.state.length > 0) {
            OneToManyTableState.filter.state.forEach((filterObj) => {
                if (filterObj['value'] !== "") {
                    if (filterOption !== "") {
                        filterOption += "+and+";
                    }
                    filterOption += getFilterParam(filterObj);
                }
            });
            if (filterOption !== "") {
                filterOption = `&filter=${filterOption}`;
            }
        }

        return sortOption + filterOption;
    }, [OneToManyTableState.sortedColumns, OneToManyTableState.filter.state]);

    const paginationProps = Pagination.usePagination({
        totalItems: oneToManyData.total,
        initialPage: 0,
        initialPageSize: ONE_TO_MANY.GRID.DEFAULT_PAGE_SIZE
    });

    useEffect(() => {
        let params;
        let sortOption = queryParams;
        if (!paginationProps) return;

        if(previewMode) {
            params = `recordsToReturn=1000&many=true&firstRecord=1&returnTotal=true${sortOption}`;
        }
        else if (paginationProps.startIndex === 0) {
            params = `recordsToReturn=${paginationProps.pageSize}&many=true&firstRecord=1&returnTotal=true${sortOption}`;
        } else {
            params = `recordsToReturn=${paginationProps.pageSize}&many=true&firstRecord=${paginationProps.startIndex + 1}&multi=true&searchToken=multi${sortOption}`;
        }
        fetchOneToManyData(params, paginationProps.startIndex);

    }, [paginationProps.startIndex, paginationProps.pageSize, queryParams, beData]);

    const fetchOneToManyData = (params) => {
        if (typeof (getOneToManyBEDataHandler) === "function") {

            let dataPath = parentDataPath !== "" ? parentDataPath + "/" + beField.name : beField.name;
            getOneToManyBEDataHandler(dataPath, params)
                .then(resp => {
                    let oneToManyTotal = (resp && resp.recordCount) ? resp.recordCount : oneToManyData.total;
                    setOneToManyData({ data: resp, total: oneToManyTotal });
                    if (formikProps) {
                        let dataObj = JSON.parse(JSON.stringify(resp));
                        dataObj[ONE_TO_MANY.ORIGINAL_COPY] = JSON.parse(JSON.stringify(resp));
                        formikProps.setFieldValue(fieldName, dataObj, false);
                    }
                })
                .catch(error => { console.log(error) });
        }
    };

    const getTableView = (manyLength) => {

        let headRow = [];
        let bodyRows = [];
        let errorObj = null;
        let touchedObj = null;
        let valuesObj = null;

        if (formikProps && formikProps.errors && formikProps.touched) {
            errorObj = getFieldValue(formikProps.errors, fieldName);
            touchedObj = getFieldValue(formikProps.touched, fieldName);
            valuesObj = getFieldValue(formikProps.values, fieldName);
        }
        let displayOneToManyErrorColumn = false;
        let oneToManyTableRowList = [];
        for (let rowIndex = 0; rowIndex < manyLength; rowIndex++) {
            let bodyCells = [];
            let headCells = [];
            beField && beField.beFormFields && Array.isArray(beField.beFormFields) && beField.beFormFields.forEach((beManyChild, childIndex) => {
                if (!beManyChild.many && !beManyChild.isHidden) {
                    if (rowIndex === 0) {
                        headCells.push(<OneToManyTable.HeaderCell 
                            sortable={beManyChild.fieldType !== CHECKBOX && beManyChild.fieldType !== RADIO_BUTTON} 
                            data-id={beManyChild.name} data-testid={beManyChild.name}
                        >
                            {beManyChild.label}
                            {beManyChild.required && <span className="column__required__indicator">*</span>}
                        </OneToManyTable.HeaderCell>);
                    }

                    let manyDt = { parentName: fieldName, row: rowIndex };
                    bodyCells.push(<OneToManyTable.Cell>
                        <BEFormField
                            key={`formField_${childIndex}_{index}`}
                            beField={beManyChild}
                            index={`${index}_${childIndex}`}
                            sectionMetaData={sectionMetaData}
                            formikProps={formikProps}
                            formDisabled={formDisabled}
                            dateFormat={dateFormat}
                            lookupOptionsHandler={lookupOptionsHandler}
                            maxColumns={maxColumns}
                            manyDt={manyDt}
                            locale={locale}
                            lookupValueChangeHandler={lookupValueChangeHandler}
                            view={viewMode}
                            fileHandler={fileHandler}
                        />
                    </OneToManyTable.Cell>);
                }
            });
            let oneToManyTableRowObj = {};
            if (groupValidationErrors && groupValidationErrors[`${fieldName}_${rowIndex}`]) {
                displayOneToManyErrorColumn = true;
                let content = <div className="field-validation-message">
                    <img src={success_icon} alt="success icon" className="field-validation-message-icon" />
                </div>;

                oneToManyTableRowObj.errorHeadCell = (<OneToManyTable.HeaderCell className="column__validation__error__th">
                    <span>{" "}</span>
                </OneToManyTable.HeaderCell>);
                oneToManyTableRowObj.errorBodyCell = (<OneToManyTable.Cell className="column__validation__error__td">
                    {content}
                </OneToManyTable.Cell>);

            } else if (errorObj && touchedObj && valuesObj) {
                let content = "";
                let toucedFields = false;
                let className = "column__validation__error__td";
                if (errorObj.item && errorObj.item[rowIndex] && touchedObj.item && touchedObj.item[rowIndex]
                    && valuesObj.item && valuesObj.item[rowIndex]) {
                        
                    let toolTip = <></>;
                    if (errorObj.item[rowIndex].rootError) {
                        className += " column__validation__error__item__td";
                        toolTip = <>{errorObj.item[rowIndex].rootError}</>;
                        toucedFields = true;
                    } else {
                        let errorMsg = [];
                        let errorItem = errorObj.item[rowIndex];
                        let columnList = Object.keys(errorItem);

                        for (let fieldIndex = 0; fieldIndex < columnList.length; fieldIndex++) {
                            let errorItemObj = errorItem[columnList[fieldIndex]];
                            if (errorItemObj && touchedObj.item[rowIndex][columnList[fieldIndex]]
                                && valuesObj.item[rowIndex][columnList[fieldIndex]]==="") {
                                if (typeof (errorItemObj) === "string") {
                                    errorMsg.push(<p>{errorItemObj}</p>);
                                    toucedFields = true;

                                } else if (typeof (errorItemObj) === "object") {
                                    if (Object.keys(errorItemObj).length > 0) {
                                        for (let k in errorItemObj) {
                                            if (typeof (errorItemObj[k]) === "string") {
                                                errorMsg.push(<p>{errorItemObj[k]}</p>);
                                            }
                                        }
                                    }
                                    toucedFields = true;
                                }
                            }
                        }
                        if (toucedFields) {
                            className += " column__validation__error__item__td";
                            toolTip = <>{errorMsg}</>;
                        }
                    }
                    if (toucedFields) {
                        displayOneToManyErrorColumn = true;
                        content = <div className="column__validation__error">
                            <Tooltip content={toolTip} className="beform__column__error">
                                <IconButton>
                                    <i className={"beform__ctrl__icon__error aicon aicon__error"} />
                                </IconButton>
                            </Tooltip>
                        </div>;
                    }
                }
                oneToManyTableRowObj.errorHeadCell = (<OneToManyTable.HeaderCell className="column__validation__error__th">
                    <span>{" "}</span>
                </OneToManyTable.HeaderCell>);
                oneToManyTableRowObj.errorBodyCell = (<OneToManyTable.Cell className={className}>
                    {content}
                </OneToManyTable.Cell>);
            } else {    
                let className = "column__validation__error__td";
                oneToManyTableRowObj.errorHeadCell = (<OneToManyTable.HeaderCell className="column__validation__error__th">
                    <span>{" "}</span>
                </OneToManyTable.HeaderCell>);
                oneToManyTableRowObj.errorBodyCell = (<OneToManyTable.Cell className={className}>
                    {" "}
                </OneToManyTable.Cell>);
            }
            oneToManyTableRowObj.headCell = headCells;
            oneToManyTableRowObj.bodyCell = bodyCells;
            oneToManyTableRowList.push(oneToManyTableRowObj);
        }
        for (let rowIndex = 0; rowIndex < manyLength; rowIndex++) {
            let rowHeadCells = oneToManyTableRowList[rowIndex].headCell;
            let rowBodyCells = oneToManyTableRowList[rowIndex].bodyCell;

            if (displayOneToManyErrorColumn) {
                rowHeadCells.unshift(oneToManyTableRowList[rowIndex].errorHeadCell);
                rowBodyCells.unshift(oneToManyTableRowList[rowIndex].errorBodyCell);
            }

            if (rowIndex === 0) {
                headRow.push(
                    <OneToManyTable.HeaderRow className="table__row">
                        {rowHeadCells}
                    </OneToManyTable.HeaderRow>
                );
            }
            bodyRows.push(
                <OneToManyTable.Row
                    key={"item_" + rowIndex}
                    data-id={"item_" + rowIndex}
                    className="table__row__body">
                    {rowBodyCells}
                </OneToManyTable.Row>
            );
        }

        let tableViewContent;
        let noDataMsg;

        if (manyLength === 0) {
            let headCells = [];
            beField && beField.beFormFields && Array.isArray(beField.beFormFields)
                && beField.beFormFields.forEach(beManyChild => {
                    if (!beManyChild.many) {
                        headCells.push(
                            <OneToManyTable.HeaderCell>
                                {beManyChild.label}
                            </OneToManyTable.HeaderCell>
                        );
                    }
                });
            headRow.push(
                <OneToManyTable.HeaderRow className="table__row">
                    {headCells}
                </OneToManyTable.HeaderRow>
            );
            noDataMsg = (
                <div className='one-to-many-no-items-message one-to-many-no-items-message-table'>
                    {
                        translate("BE_FORM_ITEMS_NOT_ADDED_MESSAGE", { FIELD_NAME: `${beField.label}` })
                    }
                </div>
            );
            tableViewContent = (
                <OneToManyTable {...tableProps} filterModel={{fields: tableOptionsList.filter}} className={"one__to__many__table"}>
                    <OneToManyTable.Header>
                        {headRow}
                    </OneToManyTable.Header>
                    <OneToManyTable.Body>
                    </OneToManyTable.Body>
                </OneToManyTable>
            )
        } else {
            tableViewContent = <>
                <OneToManyTable {...tableProps} filterModel={{fields: tableOptionsList.filter}} className={"one__to__many__table"}>
                    <OneToManyTable.Header>
                        {headRow}
                    </OneToManyTable.Header>
                    <OneToManyTable.Body>
                        {bodyRows}

                    </OneToManyTable.Body>
                </OneToManyTable>
            </>
        }
        return <>
            {tableViewContent}
            {noDataMsg}
        </>
    };

    const renderOneToManyTable = () => {
        const manyLength = (oneToManyData && oneToManyData.data && oneToManyData.data.item) ? oneToManyData.data.item.length : 0;
        let itemList = getTableView(manyLength);
        const allowCreation = getObjectPropertyValue(beField, META_KEYS.OPERATIONS, OPERATIONS.CREATE, META_KEYS.ALLOWED);

        return (
            <div className="one-to-many-container" >
                <div className='one-to-many-header'>
                    <div className="one-to-many-header-title">{beField.label}
                        {beField.required === true && <span className="one-to-many-section-mandatory"> * </span>}
                    </div>
                    <div className="field-controls" data-testid="field-controls">
                        {
                            allowCreation && !formDisabled
                            && getIconButton(
                                () => { addNewOneToManyRow() },
                                translate("BE_FORM_LABEL_ADD"),
                                "add-v1",
                                "iconClass"
                            )
                        }
                        {
                            beField[ONE_TO_MANY.SWITCH_VIEW] && formDisabled
                            && getIconButton(
                                () => { changeViewHandler() },
                                translate("BE_FORM_LABEL_CARD_VIEW"),
                                "card-view",
                                "iconClass"
                            )
                        }
                        <OneToManyTable.Toolbar {...tableProps} filter settings={false}/>
                    </div>
                </div>
                {   
                    beField.sectionError != null && 
                    <p className="one__to__many__section__error">
                        <i className="aicon aicon__close-solid close-icon"></i> {beField.sectionError}
                    </p>
                }
                <div ref={oneToManyTableRef} className='one-to-many-body'>
                    {itemList}
                </div>
                {
                    !previewMode && manyLength !== 0 && <Pagination.DefaultLayout {...paginationProps} pageSizeChoices={ONE_TO_MANY.GRID.PAGE_SIZE_LIST} />
                }
            </div>
        );
    };

    const getOneToManyRequiredFileds = () => {
        let obj = {};
        beField && beField.beFormFields && Array.isArray(beField.beFormFields)
        && beField.beFormFields.forEach(beManyChild => {
            if(beManyChild.required) {
                if(beManyChild.dataType === DATA_TYPES.LOOKUP) {
                    obj[beManyChild.name] = {};
                } else {
                    obj[beManyChild.name] = "";
                }  
            }
        });
        return obj;
    };

    const addNewOneToManyRow = () => {

        oneToManyTableRef.current.scrollTo({
            left: 0,
            behavior: SMOOTH
        });

        let data = (formikProps && formikProps.values) ? formikProps.values : {};
        let dataObj = getFieldValue(data, fieldName);
        let newObj = dataObj ? JSON.parse(JSON.stringify(dataObj)) : {};

        if (!newObj.item || !Array.isArray(newObj.item)) {
            newObj.item = [];
        }
        newObj.item.push(getOneToManyRequiredFileds());
        formikProps && formikProps.setFieldValue(fieldName, newObj);

        setOneToManyData({ data: newObj, total: oneToManyData.total });
    };

    const deleteOneToManyRow = function (rowIndex) {
        setRowAction(null);
        if(formikProps) {
            let fieldErrors = getFieldValue(formikProps.errors, fieldName);
            if(fieldErrors) {
                let fieldErrorCopy = JSON.parse(JSON.stringify(fieldErrors));
                fieldErrorCopy.item.splice(rowIndex, 1);
                formikProps.setFieldError(fieldName, fieldErrorCopy);
            }
            let fieldsTouched = getFieldValue(formikProps.touched, fieldName);
            if(fieldsTouched) {
                let fieldsTouchedCopy = JSON.parse(JSON.stringify(fieldsTouched));
                fieldsTouchedCopy.item.splice(rowIndex, 1);
                formikProps.setFieldTouched(fieldName, fieldsTouchedCopy);
            }
            let fieldValues = getFieldValue(formikProps.values, fieldName);
            if (fieldValues) {
                let fieldValueCopy = JSON.parse(JSON.stringify(fieldValues));
                fieldValueCopy.item.splice(rowIndex, 1);
                formikProps.setFieldValue(fieldName, fieldValueCopy);
                setTimeout(() => setOneToManyData({ data: fieldValueCopy, total: oneToManyData.total }), 0);
            }
        }
    };

    const invokeRowActionHandlers = (rowAction) => {
        if (rowAction && rowAction.index) {
            let rowIndex = rowAction.index.split("_")[1];
            switch (rowAction.action) {
                case OPERATIONS.DELETE:
                    deleteOneToManyRow(rowIndex);
                    break;
                case OPERATIONS.VALIDATION:
                    handleTableDataValidation(rowIndex);
                    break;
                default:
                    break;
            }
        }
    };
    invokeRowActionHandlers(rowAction);

    const triggerRowActons = (rowAction, rowIndex) => {
        setRowAction({ action: rowAction, index: rowIndex });
    };

    return (
        renderOneToManyTable()
    );
};
BEFormOneToManyTable.propTypes = {};

export default BEFormOneToManyTable;
