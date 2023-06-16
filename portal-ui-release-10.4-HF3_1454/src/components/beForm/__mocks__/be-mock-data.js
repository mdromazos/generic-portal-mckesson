const beMeta = {
    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
    id: "_zaA5sEqPEeqOZOqLd8MgeA",
    componentType: "BeFormComponent",
    configName: "SupplierPortalView",
    configType: "BEView",
    attributeSelector: "$",
    beFormSections: [
        {
            id: "_zaHnYEqPEeqOZOqLd8MgeA",
            key: "Additional Details__zaHnYUqPEeqOZOqLd8MgeA",
            name: "Additional Details",
            hideName: true,
            beFormFields: [
                {   applyNullValues: false,
                    configName: "SupplierPortalView",
                    configType: "BEView",
                    dataType: "String",
                    displayFormat: "DATETIME_LONG_FORMAT",
                    fieldType: "textField",
                    filterable: true,
                    hierarchyName: "fullNm",
                    id: "_QI0SYEqOEeqOZOqLd8MgeA",
                    isReadOnly: true,
                    key: "fullNm__QI0SYUqOEeqOZOqLd8MgeA",
                    label: "Company Legal Name",
                    length: 100,
                    name: "fullNm",
                    operations:{
                        create: {allowed: true},
                        read: {allowed: true},
                        update: {allowed: true}
                    },
                    required: true,
                    sortable: true,
                    trust: false
                },
                {
                    configName: "SupplierPortalView",
                    configType: "BEView",
                    attributeSelector: "$.object.child[?(@.name==\"Address\")]",
                    id: "_zaO8IEqPEeqOZOqLd8MgeA",
                    key: "Address__zaO8IUqPEeqOZOqLd8MgeA",
                    name: "Address",
                    fieldType: "cardView",
                    hierarchyName: "Address",
                    many: true,
                    enableValidation: true,
                    enableAlternateView: true,
                    beFormFields: [
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"prmryInd\")]",
                            id: "_zaRYYEqPEeqOZOqLd8MgeA",
                            key: "prmryInd__zaRYYUqPEeqOZOqLd8MgeA",
                            name: "prmryInd",
                            fieldType: "radioButton",
                            hierarchyName: "Address.prmryInd"
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"pstlAddrTyp\")]",
                            id: "_zaSmgEqPEeqOZOqLd8MgeA",
                            key: "pstlAddrTyp__zaSmgUqPEeqOZOqLd8MgeA",
                            name: "pstlAddrTyp",
                            fieldType: "dropdown",
                            hierarchyName: "Address.pstlAddrTyp",
                            required: true
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"addrLn1\")]",
                            id: "_zaTNkEqPEeqOZOqLd8MgeA",
                            key: "addrLn1__zaTNkUqPEeqOZOqLd8MgeA",
                            name: "addrLn1",
                            fieldType: "textField",
                            hierarchyName: "Address.addrLn1",
                            required: true
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"city\")]",
                            id: "_zaXfAEqPEeqOZOqLd8MgeA",
                            key: "city__zaXfAUqPEeqOZOqLd8MgeA",
                            name: "city",
                            fieldType: "textField",
                            hierarchyName: "Address.city",
                            required: true
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"cntryCd\")]",
                            id: "_zaYtIEqPEeqOZOqLd8MgeA",
                            key: "cntryCd__zaYtIUqPEeqOZOqLd8MgeA",
                            name: "cntryCd",
                            fieldType: "dropdown",
                            hierarchyName: "Address.cntryCd",
                            required: true
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"state\")]",
                            id: "_zaZ7QEqPEeqOZOqLd8MgeA",
                            key: "state__zaZ7QUqPEeqOZOqLd8MgeA",
                            name: "state",
                            fieldType: "dropdown",
                            hierarchyName: "Address.state"
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"pstlCd\")]",
                            id: "_zaaiUEqPEeqOZOqLd8MgeA",
                            key: "pstlCd__zaaiUUqPEeqOZOqLd8MgeA",
                            name: "pstlCd",
                            fieldType: "textField",
                            hierarchyName: "Address.pstlCd"
                        }
                    ],
                    operations:{
                        create: {allowed: true},
                        read: {allowed: true},
                        update: {allowed: true}
                    },
                },
                {
                    configName: "SupplierPortalView",
                    configType: "BEView",
                    attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")]",
                    id: "_zabwcEqPEeqOZOqLd8MgeA",
                    key: "PhoneCommunication__zabwcUqPEeqOZOqLd8MgeA",
                    name: "PhoneCommunication",
                    fieldType: "cardView",
                    hierarchyName: "PhoneCommunication",
                    many: true,
                    enableValidation: true,
                    enableAlternateView: true,
                    beFormFields: [
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"prmryInd\")]",
                            id: "_zago8EqPEeqOZOqLd8MgeA",
                            key: "prmryInd__zago8UqPEeqOZOqLd8MgeA",
                            name: "prmryInd",
                            fieldType: "radioButton",
                            hierarchyName: "PhoneCommunication.prmryInd"
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"phnTyp\")]",
                            id: "_zah3EEqPEeqOZOqLd8MgeA",
                            key: "phnTyp__zah3EUqPEeqOZOqLd8MgeA",
                            name: "phnTyp",
                            fieldType: "dropdown",
                            hierarchyName: "PhoneCommunication.phnTyp",
                            required: true
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"prfxNum\")]",
                            id: "_zajFMEqPEeqOZOqLd8MgeA",
                            key: "prfxNum__zajFMUqPEeqOZOqLd8MgeA",
                            name: "prfxNum",
                            fieldType: "textField",
                            hierarchyName: "PhoneCommunication.prfxNum",
                            required: true
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"phnNum\")]",
                            id: "_zajsQEqPEeqOZOqLd8MgeA",
                            key: "phnNum__zajsQUqPEeqOZOqLd8MgeA",
                            name: "phnNum",
                            fieldType: "textField",
                            hierarchyName: "PhoneCommunication.phnNum",
                            required: true
                        }
                    ]
                },
                {
                    configName: "SupplierPortalView",
                    configType: "BEView",
                    attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")]",
                    id: "_zaokwEqPEeqOZOqLd8MgeA",
                    key: "ExecutiveMembers__zaokwUqPEeqOZOqLd8MgeA",
                    name: "ExecutiveMembers",
                    fieldType: "gridView",
                    hierarchyName: "ExecutiveMembers",
                    many: true,
                    enableAlternateView: true,
                    beFormFields: [
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")].field[?(@.name==\"fullNm\")]",
                            id: "_zapy4EqPEeqOZOqLd8MgeA",
                            key: "fullNm__zapy4UqPEeqOZOqLd8MgeA",
                            name: "fullNm",
                            fieldType: "textField",
                            hierarchyName: "ExecutiveMembers.fullNm"
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")].field[?(@.name==\"cmpnyNm\")]",
                            id: "_zaqZ8EqPEeqOZOqLd8MgeA",
                            key: "cmpnyNm__zaqZ8UqPEeqOZOqLd8MgeA",
                            name: "cmpnyNm",
                            fieldType: "textField",
                            hierarchyName: "ExecutiveMembers.cmpnyNm"
                        },
                        {
                            configName: "SupplierPortalView",
                            configType: "BEView",
                            attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")].field[?(@.name==\"bsnsTitle\")]",
                            id: "_zaroEEqPEeqOZOqLd8MgeA",
                            key: "bsnsTitle__zaroEUqPEeqOZOqLd8MgeA",
                            name: "bsnsTitle",
                            fieldType: "textField",
                            hierarchyName: "ExecutiveMembers.bsnsTitle"
                        }
                    ]
                }
            ]
        }
    ],
    operations: {
        create: { allowed: true },
        delete: { allowed: true },
        merge: { allowed: false },
        read: { allowed: true },
        search: { allowed: true },
        unmerge: { allowed: false },
        update: { allowed: true },
    }
};

const oneToManyGroupData = {
    beField: {
        beFormFields: [
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "Boolean",
                fieldType: "radioButton",
                filterable: false,
                fractionDigits: 0,
                hierarchyName: "Address.prmryInd",
                label: "Primary",
                length: 0,
                name: "prmryInd",
                operations:
                {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: false,
                sortable: false,
                totalDigits: 0,
                trust: false
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "lookup",
                fieldType: "dropdown",
                filterable: true,
                hierarchyName: "Address.pstlAddrTyp",
                label: "Type",
                lookup: {
                    key: "addressType",
                    link: [
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/id-label/SupplierPortalView/Address/pstlAddrTyp",
                            rel: "lookup"
                        },
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/object/SupplierPortalView/Address/pstlAddrTyp",
                            rel: "list"
                        }
                    ],
                    object: "LookupPostalAddressType",
                    value: "addressTypeDesc"
                },
                name: "pstlAddrTyp",
                operations: { 
                    read: { allowed: true }, 
                    create: { allowed: true }, 
                    update: { allowed: true } 
                },
                readOnly: false,
                required: true,
                sortable: true,
                system: false,
                trust: false
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "String",
                displayFormat: "DATETIME_LONG_FORMAT",
                fieldType: "textField",
                filterable: true,
                hierarchyName: "Address.addrLn1",
                id: "_zaTNkEqPEeqOZOqLd8MgeA",
                key: "addrLn1__zaTNkUqPEeqOZOqLd8MgeA",
                label: "Street",
                length: 200,
                name: "addrLn1",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: true,
                sortable: true,
                trust: false,
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "String",
                displayFormat: "DATETIME_LONG_FORMAT",
                fieldType: "textField",
                filterable: true,
                hierarchyName: "Address.city",
                id: "_zaXfAEqPEeqOZOqLd8MgeA",
                key: "city__zaXfAUqPEeqOZOqLd8MgeA",
                label: "City",
                length: 50,
                name: "city",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: true,
                sortable: true,
                trust: false,
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "lookup",
                dependents: ["SupplierPortalView.Address.state"],
                fieldType: "dropdown",
                filterable: true,
                hierarchyName: "Address.cntryCd",
                id: "_zaYtIEqPEeqOZOqLd8MgeA",
                key: "cntryCd__zaYtIUqPEeqOZOqLd8MgeA",
                label: "Country",
                lookup: {
                    key: "countryCode",
                    link:
                        [{
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/id-label/SupplierPortalView/Address/cntryCd",
                            rel: "lookup"
                        },
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/object/SupplierPortalView/Address/cntryCd",
                            rel: "list"
                        }],
                    object: "LookupCountry",
                    value: "countryDesc",
                },
                name: "cntryCd",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                readOnly: false,
                required: true,
                sortable: true,
                system: false,
                trust: false
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "lookup",
                fieldType: "dropdown",
                filterable: true,
                hierarchyName: "Address.state",
                id: "_zaZ7QEqPEeqOZOqLd8MgeA",
                key: "state__zaZ7QUqPEeqOZOqLd8MgeA",
                label: "State",
                lookup: {
                    key: "stateCode",
                    link:
                        [{
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/id-label/SupplierPortalView/Address/state?parents=SupplierPortalView.Address.cntryCd={SupplierPortalView.Address.cntryCd}",
                            rel: "lookup"
                        },
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/object/SupplierPortalView/Address/state?parents=SupplierPortalView.Address.cntryCd={SupplierPortalView.Address.cntryCd}",
                            rel: "list"
                        }
                        ],
                    object: "LookupCountry.LookupState",
                    value: "stateDesc"
                },
                name: "state",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                parents: ["SupplierPortalView.Address.cntryCd"],
                readOnly: false,
                required: false,
                sortable: true,
                system: false,
                trust: false,
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "String",
                displayFormat: "DATETIME_LONG_FORMAT",
                fieldType: "textField",
                filterable: true,
                hierarchyName: "Address.pstlCd",
                id: "_zaaiUEqPEeqOZOqLd8MgeA",
                key: "pstlCd__zaaiUUqPEeqOZOqLd8MgeA",
                label: "Zip",
                length: 10,
                name: "pstlCd",
                operations:
                {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: false,
                sortable: true,
                trust: false
            }
        ],
        color: "#d6ebfc",
        configName: "SupplierPortalView",
        configType: "BEView",
        enableAlternateView: true,
        enableValidation: true,
        fieldType: "cardView",
        hierarchyName: "Address",
        id: "_zaO8IEqPEeqOZOqLd8MgeA",
        key: "Address__zaO8IUqPEeqOZOqLd8MgeA",
        label: "Company Addresses",
        many: true,
        name: "Address",
        operations: {
            create: { allowed: true },
            delete: { allowed: true },
            merge: { allowed: false },
            read: { allowed: true },
            unmerge: { allowed: false },
            update: { allowed: true }
        },
        required: false,
    },
    sectionMetaData: {
        beFormFields: [
            { hierarchyName: "Address" },
            { hierarchyName: "PhoneCommunication" },
            { hierarchyName: "ExecutiveMembers" }
        ],
        hideName: true,
        id: "_zaHnYEqPEeqOZOqLd8MgeA",
        key: "Additional Details__zaHnYUqPEeqOZOqLd8MgeA",
        name: "Additional Details"
    }
};

const hierarchyData = {
    beFormFields: [
        {
            applyNullValues: false,
            configName: "SupplierPortalView",
            configType: "BEView",
            dataType: "lookup",
            dependents: ["SupplierPortalView.ProductsAndServices.questionCode"],
            fieldType: "dropdown",
            filterable: true,
            hierarchyName: "ProductsAndServices.prdctSrvcCd",
            label: "Product and Service Code",
            lookup: {
                key: "productAndServiceCode",
                link: [
                    {
                        href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/id-label/SupplierPortalView/ProductsAndServices/prdctSrvcCd",
                        rel: "lookup",
                    },
                    {
                        href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/object/SupplierPortalView/ProductsAndServices/prdctSrvcCd",
                        rel: "list",
                    }
                ],
                object: "LookupProductsandServices",
                value: "productAndServiceDesc",
            },
            name: "prdctSrvcCd",
            operations: {
                create: { allowed: true },
                read: { allowed: true },
                update: { allowed: true }
            },
            readOnly: false,
            required: true,
            sortable: true,
            system: false,
            trust: false,
        }
    ],
    configName: "SupplierPortalView",
    configType: "BEView",
    fieldType: "multiSelectView",
    hierarchyName: "ProductsAndServices",
    label: "Product And Services",
    many: true,
    name: "ProductsAndServices",
    operations: {
        create: { allowed: true },
        delete: { allowed: true },
        merge: { allowed: false },
        read: { allowed: true },
        unmerge: { allowed: false },
        update:{ allowed: true }
    },
    sectionError : "ERROR",
    parentColumn: "parentProductServiceCode",
    referenceLookupField: "prdctSrvcCd",
    required: true
}

const OneToManyTableBEField = {
    beField: {
        beFormFields: [
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "FileAttachment",
                displayFormat: "DATETIME_LONG_FORMAT",
                fieldType: "",
                filterable: true,
                hierarchyName: "SupplierDocuments.fileName",
                label: "File",
                length: 100,
                name: "fileName",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: true,
                sortable: true,
                trust: false
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "String",
                displayFormat: "DATETIME_LONG_FORMAT",
                fieldType: "textField",
                filterable: true,
                hierarchyName: "SupplierDocuments.docName",
                label: "Name",
                length: 100,
                name: "docName",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: true,
                sortable: true,
                trust: false,
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "lookup",
                fieldType: "dropdown",
                filterable: true,
                hierarchyName: "SupplierDocuments.docType",
                label: "Type",
                lookup: {
                    link: [{}, {}],
                    object: "LookupDocumentType",
                    key: "docTypCd",
                    value: "docTypDesc"
                },
                name: "docType",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                readOnly: false,
                required: true,
                sortable: true,
                system: false,
                trust: false
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "Date",
                displayFormat: "DATETIME_LONG_FORMAT",
                fieldType: "",
                filterable: true,
                hierarchyName: "SupplierDocuments.validFrom",
                label: "Valid From",
                name: "validFrom",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: false,
                sortable: true,
                trust: false,
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "Date",
                displayFormat: "DATETIME_LONG_FORMAT",
                fieldType: "",
                filterable: true,
                hierarchyName: "SupplierDocuments.validTo",
                label: "Valid To",
                name: "validTo",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                required: false,
                sortable: true,
                trust: false,
            }
        ],
        color: "#00CCCC",
        configName: "SupplierPortalView",
        configType: "BEView",
        enableAlternateView: true,
        fieldType: "cardView",
        hierarchyName: "SupplierDocuments",
        label: "Documents",
        many: true,
        name: "SupplierDocuments",
        sectionError : 'ERROR',
        operations: {
            create: { allowed: true },
            delete: { allowed: true },
            merge: { allowed: false },
            read: { allowed: true },
            unmerge: { allowed: false },
            update: { allowed: true }
        },
        required: false
    }
};

const dyanamicFieldData = {
    beField: {
        applyNullValues: false,
        configName: "SupplierPortalView",
        configType: "BEView",
        dataType: "String",
        displayFormat: "DATETIME_LONG_FORMAT",
        fieldType: "textField",
        filterable: true,
        hierarchyName: "ProductsAndServices.ProductServicesAnswer.answer",
        label: "Answer",
        length: 250,
        name: "answer",
        operations: {
            create: { allowed: true },
            read: { allowed: true },
            update: { allowed: true }
        },
        required: false,
        sortable: true,
        trust: false
    }
}

const dyanamicViewData = {
    beField: {
        beFormFields: [
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "lookup",
                dependents: ["SupplierPortalView.ProductsAndServices.questionCode"],
                fieldType: "dropdown",
                filterable: true,
                hierarchyName: "ProductsAndServices.prdctSrvcCd",
                id: "_aKedMEqREeqOZOqLd8MgeA",
                isReadOnly: true,
                key: "prdctSrvcCd__aKedMUqREeqOZOqLd8MgeA",
                label: "Product and Service Code",
                lookup: {
                    key: "productAndServiceCode",
                    link: [
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/id-label/SupplierPortalView/ProductsAndServices/prdctSrvcCd",
                            rel: "lookup"
                        },
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/object/SupplierPortalView/ProductsAndServices/prdctSrvcCd",
                            rel: "list"
                        }
                    ],
                    object: "LookupProductsandServices",
                    value: "productAndServiceDesc"
                },
                name: "prdctSrvcCd",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true }
                },
                readOnly: false,
                required: false,
                sortable: true,
                system: false,
                trust: false
            },
            {
                applyNullValues: false,
                configName: "SupplierPortalView",
                configType: "BEView",
                dataType: "lookup",
                fieldType: "dropdown",
                filterable: true,
                hierarchyName: "ProductsAndServices.questionCode",
                id: "_aKiuoEqREeqOZOqLd8MgeA",
                isHidden: true,
                key: "questionCode__aKiuoUqREeqOZOqLd8MgeA",
                label: "Question Code",
                lookup: {
                    key: "questionCode",
                    link: [
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/id-label/SupplierPortalView/ProductsAndServices/questionCode?parents=SupplierPortalView.ProductsAndServices.prdctSrvcCd={SupplierPortalView.ProductsAndServices.prdctSrvcCd}",
                            rel: "lookup"
                        },
                        {
                            href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/object/SupplierPortalView/ProductsAndServices/questionCode?parents=SupplierPortalView.ProductsAndServices.prdctSrvcCd={SupplierPortalView.ProductsAndServices.prdctSrvcCd}",
                            rel: "list"
                        }],
                    object: "LookupProductsandServices.LookupQuestions",
                    value: "questionDesc"
                },
                name: "questionCode",
                operations: {
                    create: { allowed: true },
                    read: { allowed: true },
                    update: { allowed: true },
                },
                parents: ["SupplierPortalView.ProductsAndServices.prdctSrvcCd"],
                readOnly: false,
                required: false,
                sortable: true,
                system: false,
                trust: false,
            },
            {
                beFormFields: [
                    {
                        applyNullValues: false,
                        configName: "SupplierPortalView",
                        configType: "BEView",
                        dataType: "String",
                        displayFormat: "DATETIME_LONG_FORMAT",
                        fieldType: "textField",
                        filterable: true,
                        hierarchyName: "ProductsAndServices.ProductServicesAnswer.answer",
                        id: "_aKlK4EqREeqOZOqLd8MgeA",
                        key: "answer__aKlK4UqREeqOZOqLd8MgeA",
                        label: "Answer",
                        length: 250,
                        name: "answer",
                        operations: {
                            create: { allowed: true },
                            read: { allowed: true },
                            update: { allowed: true }
                        },
                        required: false,
                        sortable: true,
                    },
                    {
                        applyNullValues: false,
                        configName: "SupplierPortalView",
                        configType: "BEView",
                        dataType: "lookup",
                        fieldType: "dropdown",
                        filterable: true,
                        hierarchyName: "ProductsAndServices.ProductServicesAnswer.question",
                        id: "_aKlx8EqREeqOZOqLd8MgeA",
                        isHidden: true,
                        key: "question__aKlx8UqREeqOZOqLd8MgeA",
                        label: "Question",
                        lookup: {
                            key: "questionCode",
                            link: [
                                {
                                    href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/id-label/SupplierPortalView/ProductsAndServices/ProductServicesAnswer/question",
                                    rel: "lookup"
                                },
                                {
                                    href: "http://localhost:8080/cmx/lookup/localhost-orcl-SUPPLIER_ORS/object/SupplierPortalView/ProductsAndServices/ProductServicesAnswer/question",
                                    rel: "list"
                                }
                            ],
                            object: "LookupQuestions",
                            value: "questionDesc"
                        },
                        name: "question",
                        operations: {
                            create: { allowed: true },
                            read: { allowed: true },
                            update: { allowed: true }
                        },
                        readOnly: false,
                        required: false,
                        sortable: true,
                        system: false,
                        trust: false
                    },
                ],
                configName: "SupplierPortalView",
                configType: "BEView",
                hierarchyName: "ProductsAndServices.ProductServicesAnswer",
                id: "_aKj8wEqREeqOZOqLd8MgeA",
                key: "ProductServicesAnswer__aKj8wUqREeqOZOqLd8MgeA",
                label: "Product Services Answer",
                many: true,
                name: "ProductServicesAnswer",
                operations: {
                    create: { allowed: true },
                    delete: { allowed: true },
                    merge: { allowed: false },
                    read: { allowed: true },
                    unmerge: { allowed: false },
                    update: { allowed: true }
                },
                required: false
            }
        ],
        configName: "SupplierPortalView",
        configType: "BEView",
        dependentLookup: "questionCode",
        dynamicFieldLabel: "questionDesc",
        dynamicFieldMandatoryInd: "mandatoryInd",
        dynamicFieldType: "answerType",
        dynamicFieldValue: "answer",
        dynamicFieldValueOptions: "lookupOptions",
        dynamicViewOn: "ProductServicesAnswer",
        enableDependency: true,
        enableDynamicFields: true,
        fieldType: "dynamicFieldView",
        hideParent: true,
        hierarchyName: "ProductsAndServices",
        id: "_aKcA8EqREeqOZOqLd8MgeA",
        key: "ProductsAndServices__aKcA8UqREeqOZOqLd8MgeA",
        label: "Product And Services",
        many: true,
        name: "ProductsAndServices",
        operations: {
            create: { allowed: true },
            delete: { allowed: true },
            merge: { allowed: false },
            read: { allowed: true },
            unmerge: { allowed: false },
            update: { allowed: true }
        },
        referenceLookupField: "question",
        required: false
    },
    oneToManyData: {
        firstRecord: 1,
        item: [
            {
                consolidationInd: 4,
                createDate: "2020-08-20T19:43:47.749+05:30",
                creator: "sosrivastava@informatica.com",
                hubStateInd: 1,
                interactionId: "2022000",
                label: "Products And Services",
                lastRowidSystem: "PORTAL        ",
                lastUpdateDate: "2020-08-20T19:50:37.514+05:30",
                link: [
                    {
                        href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/SupplierPortalView/5/ProductsAndServices/2?readSystemFields=true",
                        rel: "self"
                    },

                    {
                        href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/SupplierPortalView/5/ProductsAndServices/2?depth=2&readSystemFields=true",
                        rel: "children"
                    },

                    {
                        href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/SupplierPortalView/5/ProductsAndServices?readSystemFields=true",
                        rel: "parent"
                    }
                ],
                prdctSrvcCd:
                {
                    consolidationInd: 4,
                    createDate: "2020-08-20T15:26:20.261+05:30",
                    creator: "admin",
                    hubStateInd: 1,
                    label: "Lookup Products and Services",
                    lastRowidSystem: "SYS0          ",
                    lastUpdateDate: "2020-08-20T15:26:20.261+05:30",
                    link: [
                        {
                            href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/SupplierPortalView/5/ProductsAndServices/2?readSystemFields=true",
                            rel: "parent"
                        },

                        {
                            href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/SupplierPortalView/5/ProductsAndServices/2/prdctSrvcCd/1?depth=2&readSystemFields=true",
                            rel: "children"
                        },

                        {
                            href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/SupplierPortalView/5/ProductsAndServices/2/prdctSrvcCd/1?readSystemFields=true",
                            rel: "self"
                        }
                    ],
                    productAndServiceCode: "101",
                    productAndServiceDesc: "Electronics",
                    rowidObject: "1             ",
                    updatedBy: "admin"

                },
                rowidObject: "2             ",
                updatedBy: "avos/admin",
            }
        ],
        link: [
            {
                href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/SupplierPortalView/5?readSystemFields=true",
                rel: "parent"
            },
            {
                href: "http://localhost:8080/cmx/cs/localhost-orcl-SUPPLI…lView/5/ProductsAndServices?readSystemFields=true",
                rel: "self"
            }
        ],
        pageSize: 100,
        recordCount: 1,
        searchToken: "multi"
    }
}



export { beMeta, hierarchyData, OneToManyTableBEField, dyanamicFieldData, dyanamicViewData, oneToManyGroupData };