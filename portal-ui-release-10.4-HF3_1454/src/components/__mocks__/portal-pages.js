export const portalPages ={
    pages : [
    {
        id: "10",
        key: "Submitted__09qOQE7jEeqA49h5_v7zzA",
        name: "Review in Progress",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Custom Page",
        isReadOnly: true,
        layout: {
            sections: [
                {
                    id: "_02NicE7jEeqA49h5_v7zzA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_DOBhgE5gEeqA49h5_v7zzA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//TextComponent",
                                    id: "_02NicU7jEeqA49h5_v7zzA",
                                    key: "Review__P89vcFIoEeq2z_N67ix5UA",
                                    title: "Review",
                                    displayHeight: "FIT_TO_CONTENT",
                                    componentType: "TextComponent",
                                    heading: "",
                                    body: "Your application is still under review. We will notify you when the status changes. If you have any questions, call us or send email."
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 15,
        states: [
            "Submitted"
        ],
        roles: [
            "Supplier Administrators"
        ]
    },
    {
        id: "1400067",
        key: "Additional Details__zcHygEqPEeqOZOqLd8MgeA",
        name: "Additional Details",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_huZ6EFLTEeq2z_N67ix5UA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_hueykFLTEeq2z_N67ix5UA",
                            components: [
                                {
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
                                                    ]
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
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 6,
        states: [
            "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "1400068",
        key: "Products and Services__ioxUoEqQEeqOZOqLd8MgeA",
        name: "Products and Services",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_jIYkwFLTEeq2z_N67ix5UA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_jIZy4FLTEeq2z_N67ix5UA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
                                    id: "_imrC4EqQEeqOZOqLd8MgeA",
                                    componentType: "BeFormComponent",
                                    configName: "SupplierPortalView",
                                    configType: "BEView",
                                    attributeSelector: "$",
                                    beFormSections: [
                                        {
                                            id: "_ims4EEqQEeqOZOqLd8MgeA",
                                            key: "__ims4EUqQEeqOZOqLd8MgeA",
                                            name: "Products and Services",
                                            hideName: true,
                                            beFormFields: [
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")]",
                                                    id: "_imtfIEqQEeqOZOqLd8MgeA",
                                                    key: "ProductsAndServices__imtfIUqQEeqOZOqLd8MgeA",
                                                    name: "ProductsAndServices",
                                                    fieldType: "multiSelectView",
                                                    hierarchyName: "ProductsAndServices",
                                                    many: true,
                                                    required: true,
                                                    parentColumn: "parentProductServiceCode",
                                                    referenceLookupField: "prdctSrvcCd",
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                            id: "_imutQEqQEeqOZOqLd8MgeA",
                                                            key: "prdctSrvcCd__imutQUqQEeqOZOqLd8MgeA",
                                                            name: "prdctSrvcCd",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "ProductsAndServices.prdctSrvcCd",
                                                            required: true
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 7,
        states: [
           "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "1400069",
        key: "Product Related Questions__aMyKUEqREeqOZOqLd8MgeA",
        name: "Product-Related Questions",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_kpxfAFLTEeq2z_N67ix5UA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_kpz7QFLTEeq2z_N67ix5UA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
                                    id: "_aKVTQEqREeqOZOqLd8MgeA",
                                    componentType: "BeFormComponent",
                                    configName: "SupplierPortalView",
                                    configType: "BEView",
                                    attributeSelector: "$",
                                    beFormSections: [
                                        {
                                            id: "_aKXvgEqREeqOZOqLd8MgeA",
                                            key: "__aKXvgUqREeqOZOqLd8MgeA",
                                            name: "Product-Related Questions",
                                            hideName: true,
                                             beFormFields: [
                                                {
                                                     configName: "SupplierPortalView",
                                                     configType: "BEView",
                                                     attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")]",
                                                     id: "_aKcA8EqREeqOZOqLd8MgeA",
                                                     key: "ProductsAndServices__aKcA8UqREeqOZOqLd8MgeA",
                                                    name: "ProductsAndServices",
                                                    fieldType: "dynamicFieldView",
                                                    hierarchyName: "ProductsAndServices",
                                                    many: true,
                                                    dynamicViewOn: "ProductServicesAnswer",
                                                    referenceLookupField: "question",
                                                    enableDependency: true,
                                                    dependentLookup: "questionCode",
                                                    enableDynamicFields: true,
                                                    dynamicFieldLabel: "questionDesc",
                                                    dynamicFieldType: "answerType",
                                                    dynamicFieldMandatoryInd: "mandatoryInd",
                                                    dynamicFieldValueOptions: "lookupOptions",
                                                    dynamicFieldValue: "answer",
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                            id: "_aKedMEqREeqOZOqLd8MgeA",
                                                            key: "prdctSrvcCd__aKedMUqREeqOZOqLd8MgeA",
                                                            name: "prdctSrvcCd",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "ProductsAndServices.prdctSrvcCd",
                                                            isReadOnly: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"questionCode\")]",
                                                            id: "_aKiuoEqREeqOZOqLd8MgeA",
                                                            key: "questionCode__aKiuoUqREeqOZOqLd8MgeA",
                                                            name: "questionCode",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "ProductsAndServices.questionCode",
                                                            isHidden: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")]",
                                                            id: "_aKj8wEqREeqOZOqLd8MgeA",
                                                            key: "ProductServicesAnswer__aKj8wUqREeqOZOqLd8MgeA",
                                                            name: "ProductServicesAnswer",
                                                            hierarchyName: "ProductsAndServices.ProductServicesAnswer",
                                                            many: true,
                                                            beFormFields: [
                                                                {
                                                                    configName: "SupplierPortalView",
                                                                    configType: "BEView",
                                                                    attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")].field[?(@.name==\"answer\")]",
                                                                    id: "_aKlK4EqREeqOZOqLd8MgeA",
                                                                    key: "answer__aKlK4UqREeqOZOqLd8MgeA",
                                                                    name: "answer",
                                                                    fieldType: "textField",
                                                                    hierarchyName: "ProductsAndServices.ProductServicesAnswer.answer"
                                                                },
                                                                {
                                                                    configName: "SupplierPortalView",
                                                                    configType: "BEView",
                                                                    attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")].field[?(@.name==\"question\")]",
                                                                    id: "_aKlx8EqREeqOZOqLd8MgeA",
                                                                    key: "question__aKlx8UqREeqOZOqLd8MgeA",
                                                                    name: "question",
                                                                    fieldType: "dropdown",
                                                                    hierarchyName: "ProductsAndServices.ProductServicesAnswer.question",
                                                                    isHidden: true
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    hideParent: true
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 8,
        states: [
            "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "1400070",
        key: "Financials__iLpn4EqdEeqOZOqLd8MgeA",
        name: "Financial Details",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_mggXIFLTEeq2z_N67ix5UA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_mgoS8FLTEeq2z_N67ix5UA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
                                    id: "_iHp4sEqdEeqOZOqLd8MgeA",
                                    componentType: "BeFormComponent",
                                    configName: "SupplierPortalView",
                                    configType: "BEView",
                                    attributeSelector: "$",
                                    beFormSections: [
                                        {
                                            id: "_iHzCoEqdEeqOZOqLd8MgeA",
                                            key: "Financials__iHzCoUqdEeqOZOqLd8MgeA",
                                            name: "Financial Details",
                                            hideName: true,
                                            beFormFields: [
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")]",
                                                    id: "_iH37IEqdEeqOZOqLd8MgeA",
                                                    key: "AnnualRevenue__iH37IUqdEeqOZOqLd8MgeA",
                                                    name: "AnnualRevenue",
                                                    fieldType: "gridView",
                                                    hierarchyName: "AnnualRevenue",
                                                    many: true,
                                                    enableAlternateView: true,
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"yr\")]",
                                                            id: "_iH8zoEqdEeqOZOqLd8MgeA",
                                                            key: "yr__iH8zoUqdEeqOZOqLd8MgeA",
                                                            name: "yr",
                                                            fieldType: "",
                                                            hierarchyName: "AnnualRevenue.yr",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"rvn\")]",
                                                            id: "_iH9asEqdEeqOZOqLd8MgeA",
                                                            key: "rvn__iH9asUqdEeqOZOqLd8MgeA",
                                                            name: "rvn",
                                                            fieldType: "textField",
                                                            hierarchyName: "AnnualRevenue.rvn"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"crncy\")]",
                                                            id: "_XORk8E56EeqA49h5_v7zzA",
                                                            key: "crncy__XORk8U56EeqA49h5_v7zzA",
                                                            name: "crncy",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "AnnualRevenue.crncy",
                                                            required: true
                                                        }
                                                    ]
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")]",
                                                    id: "_iH_28EqdEeqOZOqLd8MgeA",
                                                    key: "TaxInformation__iH_28UqdEeqOZOqLd8MgeA",
                                                    name: "TaxInformation",
                                                    fieldType: "cardView",
                                                    hierarchyName: "TaxInformation",
                                                    many: true,
                                                    required: true,
                                                    enableAlternateView: true,
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxNumTyp\")]",
                                                            id: "_iICTMEqdEeqOZOqLd8MgeA",
                                                            key: "taxNumTyp__iICTMUqdEeqOZOqLd8MgeA",
                                                            name: "taxNumTyp",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "TaxInformation.taxNumTyp"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxNum\")]",
                                                            id: "_iIGkoEqdEeqOZOqLd8MgeA",
                                                            key: "taxNum__iIGkoUqdEeqOZOqLd8MgeA",
                                                            name: "taxNum",
                                                            fieldType: "textField",
                                                            hierarchyName: "TaxInformation.taxNum"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxAuth\")]",
                                                            id: "_iIHywEqdEeqOZOqLd8MgeA",
                                                            key: "taxAuth__iIHywUqdEeqOZOqLd8MgeA",
                                                            name: "taxAuth",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "TaxInformation.taxAuth"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxpyrTyp\")]",
                                                            id: "_iIIZ0EqdEeqOZOqLd8MgeA",
                                                            key: "taxpyrTyp__iIIZ0UqdEeqOZOqLd8MgeA",
                                                            name: "taxpyrTyp",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "TaxInformation.taxpyrTyp"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"cntry\")]",
                                                            id: "_iIJA4EqdEeqOZOqLd8MgeA",
                                                            key: "cntry__iIJA4UqdEeqOZOqLd8MgeA",
                                                            name: "cntry",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "TaxInformation.cntry"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"state\")]",
                                                            id: "_iIKPAEqdEeqOZOqLd8MgeA",
                                                            key: "state__iIKPAUqdEeqOZOqLd8MgeA",
                                                            name: "state",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "TaxInformation.state"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"efctvDt\")]",
                                                            id: "_iIOgcEqdEeqOZOqLd8MgeA",
                                                            key: "efctvDt__iIOgcUqdEeqOZOqLd8MgeA",
                                                            name: "efctvDt",
                                                            fieldType: "",
                                                            hierarchyName: "TaxInformation.efctvDt"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"expryDt\")]",
                                                            id: "_iIPukEqdEeqOZOqLd8MgeA",
                                                            key: "expryDt__iIPukUqdEeqOZOqLd8MgeA",
                                                            name: "expryDt",
                                                            fieldType: "",
                                                            hierarchyName: "TaxInformation.expryDt"
                                                        }
                                                    ]
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"BankDetails\")]",
                                                    id: "_iIQ8sEqdEeqOZOqLd8MgeA",
                                                    key: "BankDetails__iIQ8sUqdEeqOZOqLd8MgeA",
                                                    name: "BankDetails",
                                                    fieldType: "cardView",
                                                    hierarchyName: "BankDetails",
                                                    many: true,
                                                    enableAlternateView: true,
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntTyp\")]",
                                                            id: "_iISx4EqdEeqOZOqLd8MgeA",
                                                            key: "accntTyp__iISx4UqdEeqOZOqLd8MgeA",
                                                            name: "accntTyp",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "BankDetails.accntTyp"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntNum\")]",
                                                            id: "_iIWcQEqdEeqOZOqLd8MgeA",
                                                            key: "accntNum__iIXDUEqdEeqOZOqLd8MgeA",
                                                            name: "accntNum",
                                                            fieldType: "textField",
                                                            hierarchyName: "BankDetails.accntNum"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"branchNum\")]",
                                                            id: "_iIYRcEqdEeqOZOqLd8MgeA",
                                                            key: "branchNum__iIYRcUqdEeqOZOqLd8MgeA",
                                                            name: "branchNum",
                                                            fieldType: "textField",
                                                            hierarchyName: "BankDetails.branchNum"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"branchNm\")]",
                                                            id: "_iIY4gEqdEeqOZOqLd8MgeA",
                                                            key: "branchNm__iIY4gUqdEeqOZOqLd8MgeA",
                                                            name: "branchNm",
                                                            fieldType: "textField",
                                                            hierarchyName: "BankDetails.branchNm"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"bnkNm\")]",
                                                            id: "_iIZfkEqdEeqOZOqLd8MgeA",
                                                            key: "bnkNm__iIaGoEqdEeqOZOqLd8MgeA",
                                                            name: "bnkNm",
                                                            fieldType: "textField",
                                                            hierarchyName: "BankDetails.bnkNm"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntHldr\")]",
                                                            id: "_iIatsEqdEeqOZOqLd8MgeA",
                                                            key: "accntHldr__iIatsUqdEeqOZOqLd8MgeA",
                                                            name: "accntHldr",
                                                            fieldType: "textField",
                                                            hierarchyName: "BankDetails.accntHldr"
                                                        }
                                                    ]
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"Insurances\")]",
                                                    id: "_VkwIoE2ZEeqlsaPV4pp0Tw",
                                                    key: "Insurances__VkwIoU2ZEeqlsaPV4pp0Tw",
                                                    name: "Insurances",
                                                    fieldType: "cardView",
                                                    hierarchyName: "Insurances",
                                                    many: true,
                                                    required: true,
                                                    enableAlternateView: true,
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncTyp\")]",
                                                            id: "_Vkyk4E2ZEeqlsaPV4pp0Tw",
                                                            key: "insrncTyp__Vkyk4U2ZEeqlsaPV4pp0Tw",
                                                            name: "insrncTyp",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "Insurances.insrncTyp",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncVal\")]",
                                                            id: "_VkzL8E2ZEeqlsaPV4pp0Tw",
                                                            key: "insrncVal__VkzL8U2ZEeqlsaPV4pp0Tw",
                                                            name: "insrncVal",
                                                            fieldType: "",
                                                            hierarchyName: "Insurances.insrncVal"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"crncy\")]",
                                                            id: "_VkzzAE2ZEeqlsaPV4pp0Tw",
                                                            key: "crncy__VkzzAU2ZEeqlsaPV4pp0Tw",
                                                            name: "crncy",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "Insurances.crncy",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncPrvdr\")]",
                                                            id: "_Vk0aEE2ZEeqlsaPV4pp0Tw",
                                                            key: "insrncPrvdr__Vk0aEU2ZEeqlsaPV4pp0Tw",
                                                            name: "insrncPrvdr",
                                                            fieldType: "textField",
                                                            hierarchyName: "Insurances.insrncPrvdr"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"effEndDt\")]",
                                                            id: "_Vk1BIE2ZEeqlsaPV4pp0Tw",
                                                            key: "effEndDt__Vk1BIU2ZEeqlsaPV4pp0Tw",
                                                            name: "effEndDt",
                                                            fieldType: "",
                                                            hierarchyName: "Insurances.effEndDt"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"effStrtDt\")]",
                                                            id: "_Vk1oME2ZEeqlsaPV4pp0Tw",
                                                            key: "effStrtDt__Vk1oMU2ZEeqlsaPV4pp0Tw",
                                                            name: "effStrtDt",
                                                            fieldType: "",
                                                            hierarchyName: "Insurances.effStrtDt"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 9,
        states: [
            "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "1400073",
        key: "Documents__EufJ0EqeEeqOZOqLd8MgeA",
        name: "Documents",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_rlzdAFLTEeq2z_N67ix5UA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_rl1SMFLTEeq2z_N67ix5UA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
                                    id: "_EqO78EqeEeqOZOqLd8MgeA",
                                    componentType: "BeFormComponent",
                                    configName: "SupplierPortalView",
                                    configType: "BEView",
                                    attributeSelector: "$",
                                    beFormSections: [
                                        {
                                            id: "_EqQKEEqeEeqOZOqLd8MgeA",
                                            key: "Documents__EqQKEUqeEeqOZOqLd8MgeA",
                                            name: "Documents",
                                            hideName: true,
                                            beFormFields: [
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")]",
                                                    id: "_EqT0cEqeEeqOZOqLd8MgeA",
                                                    key: "SupplierDocuments__EqT0cUqeEeqOZOqLd8MgeA",
                                                    name: "SupplierDocuments",
                                                    fieldType: "cardView",
                                                    hierarchyName: "SupplierDocuments",
                                                    many: true,
                                                    enableAlternateView: true,
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"fileName\")]",
                                                            id: "_EqVpoEqeEeqOZOqLd8MgeA",
                                                            key: "fileName__EqWQsEqeEeqOZOqLd8MgeA",
                                                            name: "fileName",
                                                            fieldType: "",
                                                            hierarchyName: "SupplierDocuments.fileName",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"docName\")]",
                                                            id: "_EqW3wEqeEeqOZOqLd8MgeA",
                                                            key: "docName__EqW3wUqeEeqOZOqLd8MgeA",
                                                            name: "docName",
                                                            fieldType: "textField",
                                                            hierarchyName: "SupplierDocuments.docName",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"docType\")]",
                                                            id: "_EqYF4EqeEeqOZOqLd8MgeA",
                                                            key: "docType__EqYF4UqeEeqOZOqLd8MgeA",
                                                            name: "docType",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "SupplierDocuments.docType",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"validFrom\")]",
                                                            id: "_EqbJMEqeEeqOZOqLd8MgeA",
                                                            key: "validFrom__EqbJMUqeEeqOZOqLd8MgeA",
                                                            name: "validFrom",
                                                            fieldType: "",
                                                            hierarchyName: "SupplierDocuments.validFrom"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"validTo\")]",
                                                            id: "_EqcXUEqeEeqOZOqLd8MgeA",
                                                            key: "validTo__EqcXUUqeEeqOZOqLd8MgeA",
                                                            name: "validTo",
                                                            fieldType: "",
                                                            hierarchyName: "SupplierDocuments.validTo"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 12,
        states: [
            "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "1400071",
        key: "References__rFG74EqdEeqOZOqLd8MgeA",
        name: "References",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_xr8U0FLTEeq2z_N67ix5UA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_xr-xEFLTEeq2z_N67ix5UA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
                                    id: "_rBMFMEqdEeqOZOqLd8MgeA",
                                    componentType: "BeFormComponent",
                                    configName: "SupplierPortalView",
                                    configType: "BEView",
                                    attributeSelector: "$",
                                    beFormSections: [
                                        {
                                            id: "_rBNTUEqdEeqOZOqLd8MgeA",
                                            key: "__rBNTUUqdEeqOZOqLd8MgeA",
                                            name: "References",
                                            hideName: true,
                                            beFormFields: [
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")]",
                                                    id: "_rBQ9sEqdEeqOZOqLd8MgeA",
                                                    key: "ReferenceDetails__rBQ9sUqdEeqOZOqLd8MgeA",
                                                    name: "ReferenceDetails",
                                                    fieldType: "cardView",
                                                    hierarchyName: "ReferenceDetails",
                                                    many: true,
                                                    enableAlternateView: true,
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cmpnyNm\")]",
                                                            id: "_rBSy4EqdEeqOZOqLd8MgeA",
                                                            key: "cmpnyNm__rBSy4UqdEeqOZOqLd8MgeA",
                                                            name: "cmpnyNm",
                                                            fieldType: "textField",
                                                            hierarchyName: "ReferenceDetails.cmpnyNm",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cntctNm\")]",
                                                            id: "_rBTZ8EqdEeqOZOqLd8MgeA",
                                                            key: "cntctNm__rBTZ8UqdEeqOZOqLd8MgeA",
                                                            name: "cntctNm",
                                                            fieldType: "textField",
                                                            hierarchyName: "ReferenceDetails.cntctNm"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cntctNum\")]",
                                                            id: "_rBUBAEqdEeqOZOqLd8MgeA",
                                                            key: "cntctNum__rBUBAUqdEeqOZOqLd8MgeA",
                                                            name: "cntctNum",
                                                            fieldType: "textField",
                                                            hierarchyName: "ReferenceDetails.cntctNum"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                            id: "_rBUoEEqdEeqOZOqLd8MgeA",
                                                            key: "prdctSrvcCd__rBUoEUqdEeqOZOqLd8MgeA",
                                                            name: "prdctSrvcCd",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "ReferenceDetails.prdctSrvcCd"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 10,
        states: [
            "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "1400072",
        key: "Sub Suppliers__6TBQgEqdEeqOZOqLd8MgeA",
        name: "Sub-suppliers",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_63lmAFobEeq0NYHBCdX9ww",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_63opUFobEeq0NYHBCdX9ww",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
                                    id: "_6OeuwEqdEeqOZOqLd8MgeA",
                                    componentType: "BeFormComponent",
                                    configName: "SupplierPortalView",
                                    configType: "BEView",
                                    attributeSelector: "$",
                                    beFormSections: [
                                        {
                                            id: "_6OhLAEqdEeqOZOqLd8MgeA",
                                            key: "Sub Suppliers__6OhLAUqdEeqOZOqLd8MgeA",
                                            name: "Sub-suppliers",
                                            hideName: true,
                                            beFormFields: [
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")]",
                                                    id: "_6OmDgEqdEeqOZOqLd8MgeA",
                                                    key: "SubSupplierDetails__6OmDgUqdEeqOZOqLd8MgeA",
                                                    name: "SubSupplierDetails",
                                                    fieldType: "cardView",
                                                    hierarchyName: "SubSupplierDetails",
                                                    many: true,
                                                    enableAlternateView: true,
                                                    beFormFields: [
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"fullNm\")]",
                                                            id: "_OTBVIFSkEeqev_1CI5JYzg",
                                                            key: "fullNm__OTBVIVSkEeqev_1CI5JYzg",
                                                            name: "fullNm",
                                                            fieldType: "textField",
                                                            hierarchyName: "SubSupplierDetails.fullNm",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"dunsNum\")]",
                                                            id: "_6OsxMEqdEeqOZOqLd8MgeA",
                                                            key: "dunsNum__6OsxMUqdEeqOZOqLd8MgeA",
                                                            name: "dunsNum",
                                                            fieldType: "textField",
                                                            hierarchyName: "SubSupplierDetails.dunsNum",
                                                            required: true
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"prdctCtgry\")]",
                                                            id: "_6OtYQEqdEeqOZOqLd8MgeA",
                                                            key: "prdctCtgry__6OtYQUqdEeqOZOqLd8MgeA",
                                                            name: "prdctCtgry",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "SubSupplierDetails.prdctCtgry"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"addrLn1\")]",
                                                            id: "_6Ot_UEqdEeqOZOqLd8MgeA",
                                                            key: "addrLn1__6Ot_UUqdEeqOZOqLd8MgeA",
                                                            name: "addrLn1",
                                                            fieldType: "textField",
                                                            hierarchyName: "SubSupplierDetails.addrLn1"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"city\")]",
                                                            id: "_6OumYEqdEeqOZOqLd8MgeA",
                                                            key: "city__6OumYUqdEeqOZOqLd8MgeA",
                                                            name: "city",
                                                            fieldType: "textField",
                                                            hierarchyName: "SubSupplierDetails.city"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"cntryCd\")]",
                                                            id: "_6OvNcEqdEeqOZOqLd8MgeA",
                                                            key: "cntryCd__6OvNcUqdEeqOZOqLd8MgeA",
                                                            name: "cntryCd",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "SubSupplierDetails.cntryCd"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"state\")]",
                                                            id: "_6Ov0gEqdEeqOZOqLd8MgeA",
                                                            key: "state__6Ov0gUqdEeqOZOqLd8MgeA",
                                                            name: "state",
                                                            fieldType: "dropdown",
                                                            hierarchyName: "SubSupplierDetails.state"
                                                        },
                                                        {
                                                            configName: "SupplierPortalView",
                                                            configType: "BEView",
                                                            attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"pstlCd\")]",
                                                            id: "_6OwbkEqdEeqOZOqLd8MgeA",
                                                            key: "pstlCd__6OwbkUqdEeqOZOqLd8MgeA",
                                                            name: "pstlCd",
                                                            fieldType: "textField",
                                                            hierarchyName: "SubSupplierDetails.pstlCd"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 11,
        states: [
            "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "8",
        key: "On boarding__Dg9LIE6NEeqA49h5_v7zzA",
        name: "Registration",
        maxColumns: 2,
        type: "Custom Page",
        layout: {
            sections: [
                {
                    id: "_Dapu0E6NEeqA49h5_v7zzA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_DOBhgE5gEeqA49h5_v7zzA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//WizardComponent",
                                    id: "_Dapu0U6NEeqA49h5_v7zzA",
                                    key: "Onboarding Form__QADfsFIoEeq2z_N67ix5UA",
                                    title: "Registration Form",
                                    displayHeight: "FIT_TO_CONTENT",
                                    componentType: "WizardComponent",
                                    configName: "SupplierPortalView",
                                    showOverview: true,
                                    overviewHeading: "Overview",
                                    overviewTitle: "Welcome to the Supplier Portal",
                                    overviewBody: "We invite you to fill in the details and submit your application to become an approved supplier.\nClick Next to begin.",
                                    associatedTaskType: "AVOSBeUpdate",
                                    primaryAction: "Submit For Approval",
                                    logoutActions: "Submit For Approval,Cancel",
                                    steps: [
                                        {
                                            id: "_BwMFUEqhEeqOZOqLd8MgeA",
                                            key: "General Information__QAN3wFIoEeq2z_N67ix5UA",
                                            title: "General Information",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_BwTaEEqhEeqOZOqLd8MgeA",
                                                        key: "Company Information__BwTaEUqhEeqOZOqLd8MgeA",
                                                        name: "Company Information",
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"fullNm\")]",
                                                                id: "_BwYSkEqhEeqOZOqLd8MgeA",
                                                                key: "fullNm__BwYSkUqhEeqOZOqLd8MgeA",
                                                                name: "fullNm",
                                                                fieldType: "textField",
                                                                hierarchyName: "fullNm",
                                                                required: true,
                                                                isReadOnly: true
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"dbaNm\")]",
                                                                id: "_BwZgsEqhEeqOZOqLd8MgeA",
                                                                key: "dbaNm__BwZgsUqhEeqOZOqLd8MgeA",
                                                                name: "dbaNm",
                                                                fieldType: "textField",
                                                                hierarchyName: "dbaNm"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"DunsNumber\")]",
                                                                id: "_BwaHwEqhEeqOZOqLd8MgeA",
                                                                key: "DunsNumber__BwaHwUqhEeqOZOqLd8MgeA",
                                                                name: "DunsNumber",
                                                                fieldType: "textField",
                                                                hierarchyName: "DunsNumber",
                                                                required: true
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"TaxId\")]",
                                                                id: "_Bwau0EqhEeqOZOqLd8MgeA",
                                                                key: "TaxId__Bwau0UqhEeqOZOqLd8MgeA",
                                                                name: "TaxId",
                                                                fieldType: "textField",
                                                                hierarchyName: "TaxId"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"yrOfEstblshmnt\")]",
                                                                id: "_BwdyIEqhEeqOZOqLd8MgeA",
                                                                key: "yrOfEstblshmnt__BwdyIUqhEeqOZOqLd8MgeA",
                                                                name: "yrOfEstblshmnt",
                                                                fieldType: "",
                                                                hierarchyName: "yrOfEstblshmnt"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"numOfEmp\")]",
                                                                id: "_BweZMEqhEeqOZOqLd8MgeA",
                                                                key: "numOfEmp__BweZMUqhEeqOZOqLd8MgeA",
                                                                name: "numOfEmp",
                                                                fieldType: "",
                                                                hierarchyName: "numOfEmp"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"countryOfIncorporation\")]",
                                                                id: "_BwfAQEqhEeqOZOqLd8MgeA",
                                                                key: "countryOfIncorporation__BwfAQUqhEeqOZOqLd8MgeA",
                                                                name: "countryOfIncorporation",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "countryOfIncorporation",
                                                                required: true
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"ownrshpTyp\")]",
                                                                id: "_BwgOYEqhEeqOZOqLd8MgeA",
                                                                key: "ownrshpTyp__BwgOYUqhEeqOZOqLd8MgeA",
                                                                name: "ownrshpTyp",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "ownrshpTyp"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"lglFrm\")]",
                                                                id: "_Bwg1cEqhEeqOZOqLd8MgeA",
                                                                key: "lglFrm__Bwg1cUqhEeqOZOqLd8MgeA",
                                                                name: "lglFrm",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "lglFrm"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"bsnsTyp\")]",
                                                                id: "_BwhcgEqhEeqOZOqLd8MgeA",
                                                                key: "bsnsTyp__BwhcgUqhEeqOZOqLd8MgeA",
                                                                name: "bsnsTyp",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "bsnsTyp"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"tckrSymbl\")]",
                                                                id: "_BwiDkEqhEeqOZOqLd8MgeA",
                                                                key: "tckrSymbl__BwiDkUqhEeqOZOqLd8MgeA",
                                                                name: "tckrSymbl",
                                                                fieldType: "textField",
                                                                hierarchyName: "tckrSymbl"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"onlnSellFlg\")]",
                                                                id: "_BwiqoEqhEeqOZOqLd8MgeA",
                                                                key: "onlnSellFlg__BwiqoUqhEeqOZOqLd8MgeA",
                                                                name: "onlnSellFlg",
                                                                fieldType: "radioButton",
                                                                hierarchyName: "onlnSellFlg"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"websiteURL\")]",
                                                                id: "_Bwlt8EqhEeqOZOqLd8MgeA",
                                                                key: "websiteURL__Bwlt8UqhEeqOZOqLd8MgeA",
                                                                name: "websiteURL",
                                                                fieldType: "textField",
                                                                hierarchyName: "websiteURL"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"facebook\")]",
                                                                id: "_BwmVAEqhEeqOZOqLd8MgeA",
                                                                key: "facebook__BwmVAUqhEeqOZOqLd8MgeA",
                                                                name: "facebook",
                                                                fieldType: "textField",
                                                                hierarchyName: "facebook"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_BwnjIEqhEeqOZOqLd8MgeA",
                                            key: "Additional Details__QAfkkFIoEeq2z_N67ix5UA",
                                            title: "Additional Details",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_PpwnwEqiEeqOZOqLd8MgeA",
                                                        key: " Company Addresses__PpwnwUqiEeqOZOqLd8MgeA",
                                                        name: "Additional Details",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"Address\")]",
                                                                id: "_Ppyc8EqiEeqOZOqLd8MgeA",
                                                                key: "Address__Ppyc8UqiEeqOZOqLd8MgeA",
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
                                                                        id: "_Pp0SIEqiEeqOZOqLd8MgeA",
                                                                        key: "prmryInd__Pp0SIUqiEeqOZOqLd8MgeA",
                                                                        name: "prmryInd",
                                                                        fieldType: "radioButton",
                                                                        hierarchyName: "Address.prmryInd"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"pstlAddrTyp\")]",
                                                                        id: "_Pp38gEqiEeqOZOqLd8MgeA",
                                                                        key: "pstlAddrTyp__Pp38gUqiEeqOZOqLd8MgeA",
                                                                        name: "pstlAddrTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Address.pstlAddrTyp",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"addrLn1\")]",
                                                                        id: "_Pp4jkEqiEeqOZOqLd8MgeA",
                                                                        key: "addrLn1__Pp4jkUqiEeqOZOqLd8MgeA",
                                                                        name: "addrLn1",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Address.addrLn1",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"city\")]",
                                                                        id: "_Pp5KoEqiEeqOZOqLd8MgeA",
                                                                        key: "city__Pp5KoUqiEeqOZOqLd8MgeA",
                                                                        name: "city",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Address.city",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"cntryCd\")]",
                                                                        id: "_Pp5xsEqiEeqOZOqLd8MgeA",
                                                                        key: "cntryCd__Pp5xsUqiEeqOZOqLd8MgeA",
                                                                        name: "cntryCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Address.cntryCd",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"state\")]",
                                                                        id: "_Pp6YwEqiEeqOZOqLd8MgeA",
                                                                        key: "state__Pp6YwUqiEeqOZOqLd8MgeA",
                                                                        name: "state",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Address.state"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"pstlCd\")]",
                                                                        id: "_Pp6_0EqiEeqOZOqLd8MgeA",
                                                                        key: "pstlCd__Pp6_0UqiEeqOZOqLd8MgeA",
                                                                        name: "pstlCd",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Address.pstlCd"
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")]",
                                                                id: "_BZ2ewErqEeqOZOqLd8MgeA",
                                                                key: "PhoneCommunication__BZ2ewUrqEeqOZOqLd8MgeA",
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
                                                                        id: "_BZ3s4ErqEeqOZOqLd8MgeA",
                                                                        key: "prmryInd__BZ3s4UrqEeqOZOqLd8MgeA",
                                                                        name: "prmryInd",
                                                                        fieldType: "radioButton",
                                                                        hierarchyName: "PhoneCommunication.prmryInd"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"phnTyp\")]",
                                                                        id: "_8r1yoE56EeqA49h5_v7zzA",
                                                                        key: "phnTyp__8r1yoU56EeqA49h5_v7zzA",
                                                                        name: "phnTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "PhoneCommunication.phnTyp",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"prfxNum\")]",
                                                                        id: "_BZ8lYErqEeqOZOqLd8MgeA",
                                                                        key: "prfxNum__BZ8lYUrqEeqOZOqLd8MgeA",
                                                                        name: "prfxNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "PhoneCommunication.prfxNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"phnNum\")]",
                                                                        id: "_BZ9McErqEeqOZOqLd8MgeA",
                                                                        key: "phnNum__BZ9McUrqEeqOZOqLd8MgeA",
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
                                                                id: "_BZ-akErqEeqOZOqLd8MgeA",
                                                                key: "ExecutiveMembers__BZ-akUrqEeqOZOqLd8MgeA",
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
                                                                        id: "_BZ_BoErqEeqOZOqLd8MgeA",
                                                                        key: "fullNm__BZ_BoUrqEeqOZOqLd8MgeA",
                                                                        name: "fullNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ExecutiveMembers.fullNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")].field[?(@.name==\"cmpnyNm\")]",
                                                                        id: "_BaCsAErqEeqOZOqLd8MgeA",
                                                                        key: "cmpnyNm__BaCsAUrqEeqOZOqLd8MgeA",
                                                                        name: "cmpnyNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ExecutiveMembers.cmpnyNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")].field[?(@.name==\"bsnsTitle\")]",
                                                                        id: "_BaD6IErqEeqOZOqLd8MgeA",
                                                                        key: "bsnsTitle__BaD6IUrqEeqOZOqLd8MgeA",
                                                                        name: "bsnsTitle",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ExecutiveMembers.bsnsTitle"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_BwnjIUqhEeqOZOqLd8MgeA",
                                            key: "Products and Services__QAyfgFIoEeq2z_N67ix5UA",
                                            title: "Products and Services",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_R7qOwErrEeqOZOqLd8MgeA",
                                                        key: "Products and Services__R7qOwUrrEeqOZOqLd8MgeA",
                                                        name: "Products and Services",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")]",
                                                                id: "_R7q10ErrEeqOZOqLd8MgeA",
                                                                key: "ProductsAndServices__R7q10UrrEeqOZOqLd8MgeA",
                                                                name: "ProductsAndServices",
                                                                fieldType: "multiSelectView",
                                                                hierarchyName: "ProductsAndServices",
                                                                many: true,
                                                                required: true,
                                                                parentColumn: "parentProductServiceCode",
                                                                referenceLookupField: "prdctSrvcCd",
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                                        id: "_R7sD8ErrEeqOZOqLd8MgeA",
                                                                        key: "prdctSrvcCd__R7sD8UrrEeqOZOqLd8MgeA",
                                                                        name: "prdctSrvcCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ProductsAndServices.prdctSrvcCd"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_q9JG0E57EeqA49h5_v7zzA",
                                            key: "Product-Related Questions__QA2J4FIoEeq2z_N67ix5UA",
                                            title: "Product-Related Questions",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_q9MxME57EeqA49h5_v7zzA",
                                                        key: " Product Related Questions__q9MxMU57EeqA49h5_v7zzA",
                                                        name: "Product-Related Questions",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")]",
                                                                id: "_q9PNcE57EeqA49h5_v7zzA",
                                                                key: "ProductsAndServices__q9PNcU57EeqA49h5_v7zzA",
                                                                name: "ProductsAndServices",
                                                                fieldType: "dynamicFieldView",
                                                                hierarchyName: "ProductsAndServices",
                                                                many: true,
                                                                dynamicViewOn: "ProductServicesAnswer",
                                                                referenceLookupField: "question",
                                                                enableDependency: true,
                                                                dependentLookup: "questionCode",
                                                                enableDynamicFields: true,
                                                                dynamicFieldLabel: "questionDesc",
                                                                dynamicFieldType: "answerType",
                                                                dynamicFieldMandatoryInd: "mandatoryInd",
                                                                dynamicFieldValueOptions: "lookupOptions",
                                                                dynamicFieldValue: "answer",
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                                        id: "_q9RpsE57EeqA49h5_v7zzA",
                                                                        key: "prdctSrvcCd__q9RpsU57EeqA49h5_v7zzA",
                                                                        name: "prdctSrvcCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ProductsAndServices.prdctSrvcCd",
                                                                        isReadOnly: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"questionCode\")]",
                                                                        id: "_q9S30E57EeqA49h5_v7zzA",
                                                                        key: "questionCode__q9S30U57EeqA49h5_v7zzA",
                                                                        name: "questionCode",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ProductsAndServices.questionCode",
                                                                        isHidden: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")]",
                                                                        id: "_q9UF8E57EeqA49h5_v7zzA",
                                                                        key: "ProductServicesAnswer__q9UF8U57EeqA49h5_v7zzA",
                                                                        name: "ProductServicesAnswer",
                                                                        hierarchyName: "ProductsAndServices.ProductServicesAnswer",
                                                                        many: true,
                                                                        beFormFields: [
                                                                            {
                                                                                configName: "SupplierPortalView",
                                                                                configType: "BEView",
                                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")].field[?(@.name==\"answer\")]",
                                                                                id: "_q9VUEE57EeqA49h5_v7zzA",
                                                                                key: "answer__q9VUEU57EeqA49h5_v7zzA",
                                                                                name: "answer",
                                                                                fieldType: "textField",
                                                                                hierarchyName: "ProductsAndServices.ProductServicesAnswer.answer"
                                                                            },
                                                                            {
                                                                                configName: "SupplierPortalView",
                                                                                configType: "BEView",
                                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")].field[?(@.name==\"question\")]",
                                                                                id: "_q9V7IE57EeqA49h5_v7zzA",
                                                                                key: "question__q9V7IU57EeqA49h5_v7zzA",
                                                                                name: "question",
                                                                                fieldType: "dropdown",
                                                                                hierarchyName: "ProductsAndServices.ProductServicesAnswer.question",
                                                                                isHidden: true
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                hideParent: true
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_V7e1cE58EeqA49h5_v7zzA",
                                            key: "Financial Details__QA_64FIoEeq2z_N67ix5UA",
                                            title: "Financial Details",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_V7qboE58EeqA49h5_v7zzA",
                                                        key: "Financials__V7qboU58EeqA49h5_v7zzA",
                                                        name: "Financial Details",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")]",
                                                                id: "_V7xwYE58EeqA49h5_v7zzA",
                                                                key: "AnnualRevenue__V7xwYU58EeqA49h5_v7zzA",
                                                                name: "AnnualRevenue",
                                                                fieldType: "cardView",
                                                                hierarchyName: "AnnualRevenue",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"yr\")]",
                                                                        id: "_V7y-gE58EeqA49h5_v7zzA",
                                                                        key: "yr__V7y-gU58EeqA49h5_v7zzA",
                                                                        name: "yr",
                                                                        fieldType: "",
                                                                        hierarchyName: "AnnualRevenue.yr",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"rvn\")]",
                                                                        id: "_V7zlkE58EeqA49h5_v7zzA",
                                                                        key: "rvn__V7zlkU58EeqA49h5_v7zzA",
                                                                        name: "rvn",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "AnnualRevenue.rvn"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"crncy\")]",
                                                                        id: "_V70MoE58EeqA49h5_v7zzA",
                                                                        key: "crncy__V70MoU58EeqA49h5_v7zzA",
                                                                        name: "crncy",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "AnnualRevenue.crncy",
                                                                        required: true
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")]",
                                                                id: "_V71awE58EeqA49h5_v7zzA",
                                                                key: "TaxInformation__V71awU58EeqA49h5_v7zzA",
                                                                name: "TaxInformation",
                                                                fieldType: "cardView",
                                                                hierarchyName: "TaxInformation",
                                                                many: true,
                                                                required: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxNumTyp\")]",
                                                                        id: "_V733AE58EeqA49h5_v7zzA",
                                                                        key: "taxNumTyp__V733AU58EeqA49h5_v7zzA",
                                                                        name: "taxNumTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.taxNumTyp"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxNum\")]",
                                                                        id: "_V74eEE58EeqA49h5_v7zzA",
                                                                        key: "taxNum__V74eEU58EeqA49h5_v7zzA",
                                                                        name: "taxNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "TaxInformation.taxNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxAuth\")]",
                                                                        id: "_V75FIE58EeqA49h5_v7zzA",
                                                                        key: "taxAuth__V75FIU58EeqA49h5_v7zzA",
                                                                        name: "taxAuth",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.taxAuth"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxpyrTyp\")]",
                                                                        id: "_V76TQE58EeqA49h5_v7zzA",
                                                                        key: "taxpyrTyp__V76TQU58EeqA49h5_v7zzA",
                                                                        name: "taxpyrTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.taxpyrTyp"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"cntry\")]",
                                                                        id: "_V766UE58EeqA49h5_v7zzA",
                                                                        key: "cntry__V766UU58EeqA49h5_v7zzA",
                                                                        name: "cntry",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.cntry"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"state\")]",
                                                                        id: "_V77hYE58EeqA49h5_v7zzA",
                                                                        key: "state__V77hYU58EeqA49h5_v7zzA",
                                                                        name: "state",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.state"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"efctvDt\")]",
                                                                        id: "_V78IcE58EeqA49h5_v7zzA",
                                                                        key: "efctvDt__V78IcU58EeqA49h5_v7zzA",
                                                                        name: "efctvDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "TaxInformation.efctvDt"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"expryDt\")]",
                                                                        id: "_V78vgE58EeqA49h5_v7zzA",
                                                                        key: "expryDt__V78vgU58EeqA49h5_v7zzA",
                                                                        name: "expryDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "TaxInformation.expryDt"
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"BankDetails\")]",
                                                                id: "_V799oE58EeqA49h5_v7zzA",
                                                                key: "BankDetails__V799oU58EeqA49h5_v7zzA",
                                                                name: "BankDetails",
                                                                fieldType: "cardView",
                                                                hierarchyName: "BankDetails",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntTyp\")]",
                                                                        id: "_V7_LwE58EeqA49h5_v7zzA",
                                                                        key: "accntTyp__V7_LwU58EeqA49h5_v7zzA",
                                                                        name: "accntTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "BankDetails.accntTyp"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntNum\")]",
                                                                        id: "_V7_y0E58EeqA49h5_v7zzA",
                                                                        key: "accntNum__V7_y0U58EeqA49h5_v7zzA",
                                                                        name: "accntNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.accntNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"branchNum\")]",
                                                                        id: "_V8AZ4E58EeqA49h5_v7zzA",
                                                                        key: "branchNum__V8AZ4U58EeqA49h5_v7zzA",
                                                                        name: "branchNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.branchNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"branchNm\")]",
                                                                        id: "_V8BA8E58EeqA49h5_v7zzA",
                                                                        key: "branchNm__V8BA8U58EeqA49h5_v7zzA",
                                                                        name: "branchNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.branchNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"bnkNm\")]",
                                                                        id: "_V8BoAE58EeqA49h5_v7zzA",
                                                                        key: "bnkNm__V8BoAU58EeqA49h5_v7zzA",
                                                                        name: "bnkNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.bnkNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntHldr\")]",
                                                                        id: "_V8CPEE58EeqA49h5_v7zzA",
                                                                        key: "accntHldr__V8CPEU58EeqA49h5_v7zzA",
                                                                        name: "accntHldr",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.accntHldr"
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"Insurances\")]",
                                                                id: "_V8DdME58EeqA49h5_v7zzA",
                                                                key: "Insurances__V8DdMU58EeqA49h5_v7zzA",
                                                                name: "Insurances",
                                                                fieldType: "cardView",
                                                                hierarchyName: "Insurances",
                                                                many: true,
                                                                required: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncTyp\")]",
                                                                        id: "_V8FSYE58EeqA49h5_v7zzA",
                                                                        key: "insrncTyp__V8FSYU58EeqA49h5_v7zzA",
                                                                        name: "insrncTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Insurances.insrncTyp",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncVal\")]",
                                                                        id: "_V8F5cE58EeqA49h5_v7zzA",
                                                                        key: "insrncVal__V8F5cU58EeqA49h5_v7zzA",
                                                                        name: "insrncVal",
                                                                        fieldType: "",
                                                                        hierarchyName: "Insurances.insrncVal"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"crncy\")]",
                                                                        id: "_V8GggE58EeqA49h5_v7zzA",
                                                                        key: "crncy__V8GggU58EeqA49h5_v7zzA",
                                                                        name: "crncy",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Insurances.crncy",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncPrvdr\")]",
                                                                        id: "_V8HHkE58EeqA49h5_v7zzA",
                                                                        key: "insrncPrvdr__V8HHkU58EeqA49h5_v7zzA",
                                                                        name: "insrncPrvdr",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Insurances.insrncPrvdr"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"effStrtDt\")]",
                                                                        id: "_V8HuoE58EeqA49h5_v7zzA",
                                                                        key: "effStrtDt__V8HuoU58EeqA49h5_v7zzA",
                                                                        name: "effStrtDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "Insurances.effStrtDt"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"effEndDt\")]",
                                                                        id: "_V8IVsE58EeqA49h5_v7zzA",
                                                                        key: "effEndDt__V8IVsU58EeqA49h5_v7zzA",
                                                                        name: "effEndDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "Insurances.effEndDt"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_gS2R4E58EeqA49h5_v7zzA",
                                            key: "References__QBfDEFIoEeq2z_N67ix5UA",
                                            title: "References",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_gS5VME58EeqA49h5_v7zzA",
                                                        key: "References__gS5VMU58EeqA49h5_v7zzA",
                                                        name: "References",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")]",
                                                                id: "_gS6jUE58EeqA49h5_v7zzA",
                                                                key: "ReferenceDetails__gS6jUU58EeqA49h5_v7zzA",
                                                                name: "ReferenceDetails",
                                                                fieldType: "cardView",
                                                                hierarchyName: "ReferenceDetails",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cmpnyNm\")]",
                                                                        id: "_gS8YgE58EeqA49h5_v7zzA",
                                                                        key: "cmpnyNm__gS8YgU58EeqA49h5_v7zzA",
                                                                        name: "cmpnyNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ReferenceDetails.cmpnyNm",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cntctNm\")]",
                                                                        id: "_gS8_kE58EeqA49h5_v7zzA",
                                                                        key: "cntctNm__gS8_kU58EeqA49h5_v7zzA",
                                                                        name: "cntctNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ReferenceDetails.cntctNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cntctNum\")]",
                                                                        id: "_gS9moE58EeqA49h5_v7zzA",
                                                                        key: "cntctNum__gS9moU58EeqA49h5_v7zzA",
                                                                        name: "cntctNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ReferenceDetails.cntctNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                                        id: "_gS-0wE58EeqA49h5_v7zzA",
                                                                        key: "prdctSrvcCd__gS-0wU58EeqA49h5_v7zzA",
                                                                        name: "prdctSrvcCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ReferenceDetails.prdctSrvcCd"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_wJah8E58EeqA49h5_v7zzA",
                                            key: "Sub-suppliers__QBmX0FIoEeq2z_N67ix5UA",
                                            title: "Sub-suppliers",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_wJezYE58EeqA49h5_v7zzA",
                                                        key: "Sub Suppliers__wJezYU58EeqA49h5_v7zzA",
                                                        name: "Sub-suppliers",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")]",
                                                                id: "_wJhPoE58EeqA49h5_v7zzA",
                                                                key: "SubSupplierDetails__wJhPoU58EeqA49h5_v7zzA",
                                                                name: "SubSupplierDetails",
                                                                fieldType: "cardView",
                                                                hierarchyName: "SubSupplierDetails",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"fullNm\")]",
                                                                        id: "_hu--kFSkEeqev_1CI5JYzg",
                                                                        key: "fullNm__hu--kVSkEeqev_1CI5JYzg",
                                                                        name: "fullNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.fullNm",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"dunsNum\")]",
                                                                        id: "_wJk6AE58EeqA49h5_v7zzA",
                                                                        key: "dunsNum__wJk6AU58EeqA49h5_v7zzA",
                                                                        name: "dunsNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.dunsNum",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"prdctCtgry\")]",
                                                                        id: "_wJmIIE58EeqA49h5_v7zzA",
                                                                        key: "prdctCtgry__wJmIIU58EeqA49h5_v7zzA",
                                                                        name: "prdctCtgry",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SubSupplierDetails.prdctCtgry"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"addrLn1\")]",
                                                                        id: "_wJmvME58EeqA49h5_v7zzA",
                                                                        key: "addrLn1__wJmvMU58EeqA49h5_v7zzA",
                                                                        name: "addrLn1",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.addrLn1"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"city\")]",
                                                                        id: "_wJnWQE58EeqA49h5_v7zzA",
                                                                        key: "city__wJnWQU58EeqA49h5_v7zzA",
                                                                        name: "city",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.city"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"cntryCd\")]",
                                                                        id: "_wJnWQk58EeqA49h5_v7zzA",
                                                                        key: "cntryCd__wJnWQ058EeqA49h5_v7zzA",
                                                                        name: "cntryCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SubSupplierDetails.cntryCd"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"state\")]",
                                                                        id: "_wJn9UE58EeqA49h5_v7zzA",
                                                                        key: "state__wJn9UU58EeqA49h5_v7zzA",
                                                                        name: "state",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SubSupplierDetails.state"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"pstlCd\")]",
                                                                        id: "_wJokYE58EeqA49h5_v7zzA",
                                                                        key: "pstlCd__wJokYU58EeqA49h5_v7zzA",
                                                                        name: "pstlCd",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.pstlCd"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_43E1oE58EeqA49h5_v7zzA",
                                            key: "Documents__QBzMIFIoEeq2z_N67ix5UA",
                                            title: "Documents",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_43HR4E58EeqA49h5_v7zzA",
                                                        key: "Documents__43HR4U58EeqA49h5_v7zzA",
                                                        name: "Documents",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")]",
                                                                id: "_43JHEE58EeqA49h5_v7zzA",
                                                                key: "SupplierDocuments__43JHEU58EeqA49h5_v7zzA",
                                                                name: "SupplierDocuments",
                                                                fieldType: "cardView",
                                                                hierarchyName: "SupplierDocuments",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"fileName\")]",
                                                                        id: "_43KVME58EeqA49h5_v7zzA",
                                                                        key: "fileName__43KVMU58EeqA49h5_v7zzA",
                                                                        name: "fileName",
                                                                        fieldType: "",
                                                                        hierarchyName: "SupplierDocuments.fileName",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"docName\")]",
                                                                        id: "_43K8QE58EeqA49h5_v7zzA",
                                                                        key: "docName__43K8QU58EeqA49h5_v7zzA",
                                                                        name: "docName",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SupplierDocuments.docName",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"docType\")]",
                                                                        id: "_43LjUE58EeqA49h5_v7zzA",
                                                                        key: "docType__43LjUU58EeqA49h5_v7zzA",
                                                                        name: "docType",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SupplierDocuments.docType",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"validFrom\")]",
                                                                        id: "_43MxcE58EeqA49h5_v7zzA",
                                                                        key: "validFrom__43MxcU58EeqA49h5_v7zzA",
                                                                        name: "validFrom",
                                                                        fieldType: "",
                                                                        hierarchyName: "SupplierDocuments.validFrom"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"validTo\")]",
                                                                        id: "_43NYgE58EeqA49h5_v7zzA",
                                                                        key: "validTo__43NYgU58EeqA49h5_v7zzA",
                                                                        name: "validTo",
                                                                        fieldType: "",
                                                                        hierarchyName: "SupplierDocuments.validTo"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    showComments: true
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 14,
        states: [
            "Send Back"
        ],
        roles: [
            "Supplier Administrators"
        ]
    },
    {
        id: "1400066",
        key: "General Information__QJx7sEqOEeqOZOqLd8MgeA",
        name: "General Information",
        bevName: "SupplierPortalView",
        maxColumns: 2,
        type: "Record Page",
        layout: {
            sections: [
                {
                    id: "_miHxcF7sEeqsSvctAhViTw",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_miMC4F7sEeqsSvctAhViTw",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//BeFormComponent",
                                    id: "_QIqhYEqOEeqOZOqLd8MgeA",
                                    componentType: "BeFormComponent",
                                    configName: "SupplierPortalView",
                                    configType: "BEView",
                                    attributeSelector: "$",
                                    beFormSections: [
                                        {
                                            id: "_QIs9oEqOEeqOZOqLd8MgeA",
                                            key: " Company Information__QItksEqOEeqOZOqLd8MgeA",
                                            name: " Company Information",
                                            beFormFields: [
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"fullNm\")]",
                                                    id: "_QI0SYEqOEeqOZOqLd8MgeA",
                                                    key: "fullNm__QI0SYUqOEeqOZOqLd8MgeA",
                                                    name: "fullNm",
                                                    fieldType: "textField",
                                                    hierarchyName: "fullNm",
                                                    required: true,
                                                    isReadOnly: true
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"dbaNm\")]",
                                                    id: "_QI0SYkqOEeqOZOqLd8MgeA",
                                                    key: "dbaNm__QI0SY0qOEeqOZOqLd8MgeA",
                                                    name: "dbaNm",
                                                    fieldType: "textField",
                                                    hierarchyName: "dbaNm"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"DunsNumber\")]",
                                                    id: "_QI38wEqOEeqOZOqLd8MgeA",
                                                    key: "DunsNumber__QI38wUqOEeqOZOqLd8MgeA",
                                                    name: "DunsNumber",
                                                    fieldType: "textField",
                                                    hierarchyName: "DunsNumber",
                                                    required: true
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"TaxId\")]",
                                                    id: "_QI5K4EqOEeqOZOqLd8MgeA",
                                                    key: "TaxId__QI5K4UqOEeqOZOqLd8MgeA",
                                                    name: "TaxId",
                                                    fieldType: "textField",
                                                    hierarchyName: "TaxId"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"yrOfEstblshmnt\")]",
                                                    id: "_QI5x8EqOEeqOZOqLd8MgeA",
                                                    key: "yrOfEstblshmnt__QI5x8UqOEeqOZOqLd8MgeA",
                                                    name: "yrOfEstblshmnt",
                                                    fieldType: "",
                                                    hierarchyName: "yrOfEstblshmnt"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"numOfEmp\")]",
                                                    id: "_QI6ZAEqOEeqOZOqLd8MgeA",
                                                    key: "numOfEmp__QI6ZAUqOEeqOZOqLd8MgeA",
                                                    name: "numOfEmp",
                                                    fieldType: "",
                                                    hierarchyName: "numOfEmp"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"countryOfIncorporation\")]",
                                                    id: "_QI7AEEqOEeqOZOqLd8MgeA",
                                                    key: "countryOfIncorporation__QI7AEUqOEeqOZOqLd8MgeA",
                                                    name: "countryOfIncorporation",
                                                    fieldType: "dropdown",
                                                    hierarchyName: "countryOfIncorporation",
                                                    required: true
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"ownrshpTyp\")]",
                                                    id: "_QI_RgEqOEeqOZOqLd8MgeA",
                                                    key: "ownrshpTyp__QI_RgUqOEeqOZOqLd8MgeA",
                                                    name: "ownrshpTyp",
                                                    fieldType: "dropdown",
                                                    hierarchyName: "ownrshpTyp"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"lglFrm\")]",
                                                    id: "_QJAfoEqOEeqOZOqLd8MgeA",
                                                    key: "lglFrm__QJAfoUqOEeqOZOqLd8MgeA",
                                                    name: "lglFrm",
                                                    fieldType: "dropdown",
                                                    hierarchyName: "lglFrm"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"bsnsTyp\")]",
                                                    id: "_QJBGsEqOEeqOZOqLd8MgeA",
                                                    key: "bsnsTyp__QJBGsUqOEeqOZOqLd8MgeA",
                                                    name: "bsnsTyp",
                                                    fieldType: "dropdown",
                                                    hierarchyName: "bsnsTyp"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"tckrSymbl\")]",
                                                    id: "_QJBtwEqOEeqOZOqLd8MgeA",
                                                    key: "tckrSymbl__QJBtwUqOEeqOZOqLd8MgeA",
                                                    name: "tckrSymbl",
                                                    fieldType: "textField",
                                                    hierarchyName: "tckrSymbl"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"onlnSellFlg\")]",
                                                    id: "_QJC74EqOEeqOZOqLd8MgeA",
                                                    key: "onlnSellFlg__QJC74UqOEeqOZOqLd8MgeA",
                                                    name: "onlnSellFlg",
                                                    fieldType: "radioButton",
                                                    hierarchyName: "onlnSellFlg"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"websiteURL\")]",
                                                    id: "_QJDi8EqOEeqOZOqLd8MgeA",
                                                    key: "websiteURL__QJDi8UqOEeqOZOqLd8MgeA",
                                                    name: "websiteURL",
                                                    fieldType: "textField",
                                                    hierarchyName: "websiteURL"
                                                },
                                                {
                                                    configName: "SupplierPortalView",
                                                    configType: "BEView",
                                                    attributeSelector: "$.object.field[?(@.name==\"facebook\")]",
                                                    id: "_QJEKAEqOEeqOZOqLd8MgeA",
                                                    key: "facebook__QJEKAUqOEeqOZOqLd8MgeA",
                                                    name: "facebook",
                                                    fieldType: "textField",
                                                    hierarchyName: "facebook"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 5,
        states: [
            "Approved"
        ],
        roles: [
            "Supplier Administrators",
            "Supplier Users"
        ]
    },
    {
        id: "1400074",
        key: "Registration__B0XasEqhEeqOZOqLd8MgeA",
        name: "Registration",
        maxColumns: 2,
        type: "Custom Page",
        layout: {
            sections: [
                {
                    id: "_BwAfIEqhEeqOZOqLd8MgeA",
                    displayIcon: "rectangle",
                    containers: [
                        {
                            id: "_aySvUUqKEeqOZOqLd8MgeA",
                            components: [
                                {
                                    eClass: "http://www.informatica.com/mdm/config/model/v1#//WizardComponent",
                                    id: "_BwIa8EqhEeqOZOqLd8MgeA",
                                    key: "Onboarding Form__P9mBkFIoEeq2z_N67ix5UA",
                                    title: "Registration Form",
                                    displayHeight: "FIT_TO_CONTENT",
                                    componentType: "WizardComponent",
                                    configName: "SupplierPortalView",
                                    showOverview: true,
                                    overviewHeading: "Overview",
                                    overviewTitle: "Welcome to the Supplier Portal",
                                    overviewBody: "We invite you to fill in the details and submit your application to become an approved supplier.\nClick Next to begin.",
                                    associatedTaskType: "AVOSBeDraftState",
                                    primaryAction: "Submit",
                                    logoutActions: "Submit,Discard",
                                    steps: [
                                        {
                                            id: "_BwMFUEqhEeqOZOqLd8MgeA",
                                            key: "General Information__P9wZoFIoEeq2z_N67ix5UA",
                                            title: "General Information",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_BwTaEEqhEeqOZOqLd8MgeA",
                                                        key: "Company Information__BwTaEUqhEeqOZOqLd8MgeA",
                                                        name: "Company Information",
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"fullNm\")]",
                                                                id: "_BwYSkEqhEeqOZOqLd8MgeA",
                                                                key: "fullNm__BwYSkUqhEeqOZOqLd8MgeA",
                                                                name: "fullNm",
                                                                fieldType: "textField",
                                                                hierarchyName: "fullNm",
                                                                required: true,
                                                                isReadOnly: true
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"dbaNm\")]",
                                                                id: "_BwZgsEqhEeqOZOqLd8MgeA",
                                                                key: "dbaNm__BwZgsUqhEeqOZOqLd8MgeA",
                                                                name: "dbaNm",
                                                                fieldType: "textField",
                                                                hierarchyName: "dbaNm"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"DunsNumber\")]",
                                                                id: "_BwaHwEqhEeqOZOqLd8MgeA",
                                                                key: "DunsNumber__BwaHwUqhEeqOZOqLd8MgeA",
                                                                name: "DunsNumber",
                                                                fieldType: "textField",
                                                                hierarchyName: "DunsNumber",
                                                                required: true
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"TaxId\")]",
                                                                id: "_Bwau0EqhEeqOZOqLd8MgeA",
                                                                key: "TaxId__Bwau0UqhEeqOZOqLd8MgeA",
                                                                name: "TaxId",
                                                                fieldType: "textField",
                                                                hierarchyName: "TaxId"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"yrOfEstblshmnt\")]",
                                                                id: "_BwdyIEqhEeqOZOqLd8MgeA",
                                                                key: "yrOfEstblshmnt__BwdyIUqhEeqOZOqLd8MgeA",
                                                                name: "yrOfEstblshmnt",
                                                                fieldType: "",
                                                                hierarchyName: "yrOfEstblshmnt"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"numOfEmp\")]",
                                                                id: "_BweZMEqhEeqOZOqLd8MgeA",
                                                                key: "numOfEmp__BweZMUqhEeqOZOqLd8MgeA",
                                                                name: "numOfEmp",
                                                                fieldType: "",
                                                                hierarchyName: "numOfEmp"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"countryOfIncorporation\")]",
                                                                id: "_BwfAQEqhEeqOZOqLd8MgeA",
                                                                key: "countryOfIncorporation__BwfAQUqhEeqOZOqLd8MgeA",
                                                                name: "countryOfIncorporation",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "countryOfIncorporation",
                                                                required: true
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"ownrshpTyp\")]",
                                                                id: "_BwgOYEqhEeqOZOqLd8MgeA",
                                                                key: "ownrshpTyp__BwgOYUqhEeqOZOqLd8MgeA",
                                                                name: "ownrshpTyp",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "ownrshpTyp"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"lglFrm\")]",
                                                                id: "_Bwg1cEqhEeqOZOqLd8MgeA",
                                                                key: "lglFrm__Bwg1cUqhEeqOZOqLd8MgeA",
                                                                name: "lglFrm",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "lglFrm"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"bsnsTyp\")]",
                                                                id: "_BwhcgEqhEeqOZOqLd8MgeA",
                                                                key: "bsnsTyp__BwhcgUqhEeqOZOqLd8MgeA",
                                                                name: "bsnsTyp",
                                                                fieldType: "dropdown",
                                                                hierarchyName: "bsnsTyp"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"tckrSymbl\")]",
                                                                id: "_BwiDkEqhEeqOZOqLd8MgeA",
                                                                key: "tckrSymbl__BwiDkUqhEeqOZOqLd8MgeA",
                                                                name: "tckrSymbl",
                                                                fieldType: "textField",
                                                                hierarchyName: "tckrSymbl"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"onlnSellFlg\")]",
                                                                id: "_BwiqoEqhEeqOZOqLd8MgeA",
                                                                key: "onlnSellFlg__BwiqoUqhEeqOZOqLd8MgeA",
                                                                name: "onlnSellFlg",
                                                                fieldType: "radioButton",
                                                                hierarchyName: "onlnSellFlg"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"websiteURL\")]",
                                                                id: "_Bwlt8EqhEeqOZOqLd8MgeA",
                                                                key: "websiteURL__Bwlt8UqhEeqOZOqLd8MgeA",
                                                                name: "websiteURL",
                                                                fieldType: "textField",
                                                                hierarchyName: "websiteURL"
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.field[?(@.name==\"facebook\")]",
                                                                id: "_BwmVAEqhEeqOZOqLd8MgeA",
                                                                key: "facebook__BwmVAUqhEeqOZOqLd8MgeA",
                                                                name: "facebook",
                                                                fieldType: "textField",
                                                                hierarchyName: "facebook"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_BwnjIEqhEeqOZOqLd8MgeA",
                                            key: "Additional Details__P-ARQFIoEeq2z_N67ix5UA",
                                            title: "Additional Details",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_PpwnwEqiEeqOZOqLd8MgeA",
                                                        key: " Company Addresses__PpwnwUqiEeqOZOqLd8MgeA",
                                                        name: "Additional Details",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"Address\")]",
                                                                id: "_Ppyc8EqiEeqOZOqLd8MgeA",
                                                                key: "Address__Ppyc8UqiEeqOZOqLd8MgeA",
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
                                                                        id: "_Pp0SIEqiEeqOZOqLd8MgeA",
                                                                        key: "prmryInd__Pp0SIUqiEeqOZOqLd8MgeA",
                                                                        name: "prmryInd",
                                                                        fieldType: "radioButton",
                                                                        hierarchyName: "Address.prmryInd"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"pstlAddrTyp\")]",
                                                                        id: "_Pp38gEqiEeqOZOqLd8MgeA",
                                                                        key: "pstlAddrTyp__Pp38gUqiEeqOZOqLd8MgeA",
                                                                        name: "pstlAddrTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Address.pstlAddrTyp",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"addrLn1\")]",
                                                                        id: "_Pp4jkEqiEeqOZOqLd8MgeA",
                                                                        key: "addrLn1__Pp4jkUqiEeqOZOqLd8MgeA",
                                                                        name: "addrLn1",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Address.addrLn1",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"city\")]",
                                                                        id: "_Pp5KoEqiEeqOZOqLd8MgeA",
                                                                        key: "city__Pp5KoUqiEeqOZOqLd8MgeA",
                                                                        name: "city",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Address.city",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"cntryCd\")]",
                                                                        id: "_Pp5xsEqiEeqOZOqLd8MgeA",
                                                                        key: "cntryCd__Pp5xsUqiEeqOZOqLd8MgeA",
                                                                        name: "cntryCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Address.cntryCd",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"state\")]",
                                                                        id: "_Pp6YwEqiEeqOZOqLd8MgeA",
                                                                        key: "state__Pp6YwUqiEeqOZOqLd8MgeA",
                                                                        name: "state",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Address.state"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Address\")].field[?(@.name==\"pstlCd\")]",
                                                                        id: "_Pp6_0EqiEeqOZOqLd8MgeA",
                                                                        key: "pstlCd__Pp6_0UqiEeqOZOqLd8MgeA",
                                                                        name: "pstlCd",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Address.pstlCd"
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")]",
                                                                id: "_BZ2ewErqEeqOZOqLd8MgeA",
                                                                key: "PhoneCommunication__BZ2ewUrqEeqOZOqLd8MgeA",
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
                                                                        id: "_BZ3s4ErqEeqOZOqLd8MgeA",
                                                                        key: "prmryInd__BZ3s4UrqEeqOZOqLd8MgeA",
                                                                        name: "prmryInd",
                                                                        fieldType: "radioButton",
                                                                        hierarchyName: "PhoneCommunication.prmryInd"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"phnTyp\")]",
                                                                        id: "_8r1yoE56EeqA49h5_v7zzA",
                                                                        key: "phnTyp__8r1yoU56EeqA49h5_v7zzA",
                                                                        name: "phnTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "PhoneCommunication.phnTyp",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"prfxNum\")]",
                                                                        id: "_BZ8lYErqEeqOZOqLd8MgeA",
                                                                        key: "prfxNum__BZ8lYUrqEeqOZOqLd8MgeA",
                                                                        name: "prfxNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "PhoneCommunication.prfxNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"PhoneCommunication\")].field[?(@.name==\"phnNum\")]",
                                                                        id: "_BZ9McErqEeqOZOqLd8MgeA",
                                                                        key: "phnNum__BZ9McUrqEeqOZOqLd8MgeA",
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
                                                                id: "_BZ-akErqEeqOZOqLd8MgeA",
                                                                key: "ExecutiveMembers__BZ-akUrqEeqOZOqLd8MgeA",
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
                                                                        id: "_BZ_BoErqEeqOZOqLd8MgeA",
                                                                        key: "fullNm__BZ_BoUrqEeqOZOqLd8MgeA",
                                                                        name: "fullNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ExecutiveMembers.fullNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")].field[?(@.name==\"cmpnyNm\")]",
                                                                        id: "_BaCsAErqEeqOZOqLd8MgeA",
                                                                        key: "cmpnyNm__BaCsAUrqEeqOZOqLd8MgeA",
                                                                        name: "cmpnyNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ExecutiveMembers.cmpnyNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ExecutiveMembers\")].field[?(@.name==\"bsnsTitle\")]",
                                                                        id: "_BaD6IErqEeqOZOqLd8MgeA",
                                                                        key: "bsnsTitle__BaD6IUrqEeqOZOqLd8MgeA",
                                                                        name: "bsnsTitle",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ExecutiveMembers.bsnsTitle"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_BwnjIUqhEeqOZOqLd8MgeA",
                                            key: "Products and Services__P-W2kFIoEeq2z_N67ix5UA",
                                            title: "Products and Services",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_R7qOwErrEeqOZOqLd8MgeA",
                                                        key: "Products and Services__R7qOwUrrEeqOZOqLd8MgeA",
                                                        name: "Products and Services",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")]",
                                                                id: "_R7q10ErrEeqOZOqLd8MgeA",
                                                                key: "ProductsAndServices__R7q10UrrEeqOZOqLd8MgeA",
                                                                name: "ProductsAndServices",
                                                                fieldType: "multiSelectView",
                                                                hierarchyName: "ProductsAndServices",
                                                                many: true,
                                                                required: true,
                                                                parentColumn: "parentProductServiceCode",
                                                                referenceLookupField: "prdctSrvcCd",
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                                        id: "_R7sD8ErrEeqOZOqLd8MgeA",
                                                                        key: "prdctSrvcCd__R7sD8UrrEeqOZOqLd8MgeA",
                                                                        name: "prdctSrvcCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ProductsAndServices.prdctSrvcCd"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_q9JG0E57EeqA49h5_v7zzA",
                                            key: "Product-Related Questions__P-ag8FIoEeq2z_N67ix5UA",
                                            title: "Product-Related Questions",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_q9MxME57EeqA49h5_v7zzA",
                                                        key: " Product Related Questions__q9MxMU57EeqA49h5_v7zzA",
                                                        name: "Product-Related Questions",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")]",
                                                                id: "_q9PNcE57EeqA49h5_v7zzA",
                                                                key: "ProductsAndServices__q9PNcU57EeqA49h5_v7zzA",
                                                                name: "ProductsAndServices",
                                                                fieldType: "dynamicFieldView",
                                                                hierarchyName: "ProductsAndServices",
                                                                many: true,
                                                                dynamicViewOn: "ProductServicesAnswer",
                                                                referenceLookupField: "question",
                                                                enableDependency: true,
                                                                dependentLookup: "questionCode",
                                                                enableDynamicFields: true,
                                                                dynamicFieldLabel: "questionDesc",
                                                                dynamicFieldType: "answerType",
                                                                dynamicFieldMandatoryInd: "mandatoryInd",
                                                                dynamicFieldValueOptions: "lookupOptions",
                                                                dynamicFieldValue: "answer",
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                                        id: "_q9RpsE57EeqA49h5_v7zzA",
                                                                        key: "prdctSrvcCd__q9RpsU57EeqA49h5_v7zzA",
                                                                        name: "prdctSrvcCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ProductsAndServices.prdctSrvcCd",
                                                                        isReadOnly: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].field[?(@.name==\"questionCode\")]",
                                                                        id: "_q9S30E57EeqA49h5_v7zzA",
                                                                        key: "questionCode__q9S30U57EeqA49h5_v7zzA",
                                                                        name: "questionCode",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ProductsAndServices.questionCode",
                                                                        isHidden: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")]",
                                                                        id: "_q9UF8E57EeqA49h5_v7zzA",
                                                                        key: "ProductServicesAnswer__q9UF8U57EeqA49h5_v7zzA",
                                                                        name: "ProductServicesAnswer",
                                                                        hierarchyName: "ProductsAndServices.ProductServicesAnswer",
                                                                        many: true,
                                                                        beFormFields: [
                                                                            {
                                                                                configName: "SupplierPortalView",
                                                                                configType: "BEView",
                                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")].field[?(@.name==\"answer\")]",
                                                                                id: "_q9VUEE57EeqA49h5_v7zzA",
                                                                                key: "answer__q9VUEU57EeqA49h5_v7zzA",
                                                                                name: "answer",
                                                                                fieldType: "textField",
                                                                                hierarchyName: "ProductsAndServices.ProductServicesAnswer.answer"
                                                                            },
                                                                            {
                                                                                configName: "SupplierPortalView",
                                                                                configType: "BEView",
                                                                                attributeSelector: "$.object.child[?(@.name==\"ProductsAndServices\")].child[?(@.name==\"ProductServicesAnswer\")].field[?(@.name==\"question\")]",
                                                                                id: "_q9V7IE57EeqA49h5_v7zzA",
                                                                                key: "question__q9V7IU57EeqA49h5_v7zzA",
                                                                                name: "question",
                                                                                fieldType: "dropdown",
                                                                                hierarchyName: "ProductsAndServices.ProductServicesAnswer.question",
                                                                                isHidden: true
                                                                            }
                                                                        ]
                                                                    }
                                                                ],
                                                                hideParent: true
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_V7e1cE58EeqA49h5_v7zzA",
                                            key: "Financial Details__P-k5AFIoEeq2z_N67ix5UA",
                                            title: "Financial Details",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_V7qboE58EeqA49h5_v7zzA",
                                                        key: "Financials__V7qboU58EeqA49h5_v7zzA",
                                                        name: "Financial Details",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")]",
                                                                id: "_V7xwYE58EeqA49h5_v7zzA",
                                                                key: "AnnualRevenue__V7xwYU58EeqA49h5_v7zzA",
                                                                name: "AnnualRevenue",
                                                                fieldType: "cardView",
                                                                hierarchyName: "AnnualRevenue",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"yr\")]",
                                                                        id: "_V7y-gE58EeqA49h5_v7zzA",
                                                                        key: "yr__V7y-gU58EeqA49h5_v7zzA",
                                                                        name: "yr",
                                                                        fieldType: "",
                                                                        hierarchyName: "AnnualRevenue.yr",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"rvn\")]",
                                                                        id: "_V7zlkE58EeqA49h5_v7zzA",
                                                                        key: "rvn__V7zlkU58EeqA49h5_v7zzA",
                                                                        name: "rvn",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "AnnualRevenue.rvn"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"AnnualRevenue\")].field[?(@.name==\"crncy\")]",
                                                                        id: "_V70MoE58EeqA49h5_v7zzA",
                                                                        key: "crncy__V70MoU58EeqA49h5_v7zzA",
                                                                        name: "crncy",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "AnnualRevenue.crncy",
                                                                        required: true
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")]",
                                                                id: "_V71awE58EeqA49h5_v7zzA",
                                                                key: "TaxInformation__V71awU58EeqA49h5_v7zzA",
                                                                name: "TaxInformation",
                                                                fieldType: "cardView",
                                                                hierarchyName: "TaxInformation",
                                                                many: true,
                                                                required: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxNumTyp\")]",
                                                                        id: "_V733AE58EeqA49h5_v7zzA",
                                                                        key: "taxNumTyp__V733AU58EeqA49h5_v7zzA",
                                                                        name: "taxNumTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.taxNumTyp"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxNum\")]",
                                                                        id: "_V74eEE58EeqA49h5_v7zzA",
                                                                        key: "taxNum__V74eEU58EeqA49h5_v7zzA",
                                                                        name: "taxNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "TaxInformation.taxNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxAuth\")]",
                                                                        id: "_V75FIE58EeqA49h5_v7zzA",
                                                                        key: "taxAuth__V75FIU58EeqA49h5_v7zzA",
                                                                        name: "taxAuth",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.taxAuth"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"taxpyrTyp\")]",
                                                                        id: "_V76TQE58EeqA49h5_v7zzA",
                                                                        key: "taxpyrTyp__V76TQU58EeqA49h5_v7zzA",
                                                                        name: "taxpyrTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.taxpyrTyp"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"cntry\")]",
                                                                        id: "_V766UE58EeqA49h5_v7zzA",
                                                                        key: "cntry__V766UU58EeqA49h5_v7zzA",
                                                                        name: "cntry",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.cntry"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"state\")]",
                                                                        id: "_V77hYE58EeqA49h5_v7zzA",
                                                                        key: "state__V77hYU58EeqA49h5_v7zzA",
                                                                        name: "state",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "TaxInformation.state"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"efctvDt\")]",
                                                                        id: "_V78IcE58EeqA49h5_v7zzA",
                                                                        key: "efctvDt__V78IcU58EeqA49h5_v7zzA",
                                                                        name: "efctvDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "TaxInformation.efctvDt"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"TaxInformation\")].field[?(@.name==\"expryDt\")]",
                                                                        id: "_V78vgE58EeqA49h5_v7zzA",
                                                                        key: "expryDt__V78vgU58EeqA49h5_v7zzA",
                                                                        name: "expryDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "TaxInformation.expryDt"
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"BankDetails\")]",
                                                                id: "_V799oE58EeqA49h5_v7zzA",
                                                                key: "BankDetails__V799oU58EeqA49h5_v7zzA",
                                                                name: "BankDetails",
                                                                fieldType: "cardView",
                                                                hierarchyName: "BankDetails",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntTyp\")]",
                                                                        id: "_V7_LwE58EeqA49h5_v7zzA",
                                                                        key: "accntTyp__V7_LwU58EeqA49h5_v7zzA",
                                                                        name: "accntTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "BankDetails.accntTyp"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntNum\")]",
                                                                        id: "_V7_y0E58EeqA49h5_v7zzA",
                                                                        key: "accntNum__V7_y0U58EeqA49h5_v7zzA",
                                                                        name: "accntNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.accntNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"branchNum\")]",
                                                                        id: "_V8AZ4E58EeqA49h5_v7zzA",
                                                                        key: "branchNum__V8AZ4U58EeqA49h5_v7zzA",
                                                                        name: "branchNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.branchNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"branchNm\")]",
                                                                        id: "_V8BA8E58EeqA49h5_v7zzA",
                                                                        key: "branchNm__V8BA8U58EeqA49h5_v7zzA",
                                                                        name: "branchNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.branchNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"bnkNm\")]",
                                                                        id: "_V8BoAE58EeqA49h5_v7zzA",
                                                                        key: "bnkNm__V8BoAU58EeqA49h5_v7zzA",
                                                                        name: "bnkNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.bnkNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"BankDetails\")].field[?(@.name==\"accntHldr\")]",
                                                                        id: "_V8CPEE58EeqA49h5_v7zzA",
                                                                        key: "accntHldr__V8CPEU58EeqA49h5_v7zzA",
                                                                        name: "accntHldr",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "BankDetails.accntHldr"
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"Insurances\")]",
                                                                id: "_V8DdME58EeqA49h5_v7zzA",
                                                                key: "Insurances__V8DdMU58EeqA49h5_v7zzA",
                                                                name: "Insurances",
                                                                fieldType: "cardView",
                                                                hierarchyName: "Insurances",
                                                                many: true,
                                                                required: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncTyp\")]",
                                                                        id: "_V8FSYE58EeqA49h5_v7zzA",
                                                                        key: "insrncTyp__V8FSYU58EeqA49h5_v7zzA",
                                                                        name: "insrncTyp",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Insurances.insrncTyp",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncVal\")]",
                                                                        id: "_V8F5cE58EeqA49h5_v7zzA",
                                                                        key: "insrncVal__V8F5cU58EeqA49h5_v7zzA",
                                                                        name: "insrncVal",
                                                                        fieldType: "",
                                                                        hierarchyName: "Insurances.insrncVal"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"crncy\")]",
                                                                        id: "_V8GggE58EeqA49h5_v7zzA",
                                                                        key: "crncy__V8GggU58EeqA49h5_v7zzA",
                                                                        name: "crncy",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "Insurances.crncy",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"insrncPrvdr\")]",
                                                                        id: "_V8HHkE58EeqA49h5_v7zzA",
                                                                        key: "insrncPrvdr__V8HHkU58EeqA49h5_v7zzA",
                                                                        name: "insrncPrvdr",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "Insurances.insrncPrvdr"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"effStrtDt\")]",
                                                                        id: "_V8HuoE58EeqA49h5_v7zzA",
                                                                        key: "effStrtDt__V8HuoU58EeqA49h5_v7zzA",
                                                                        name: "effStrtDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "Insurances.effStrtDt"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"Insurances\")].field[?(@.name==\"effEndDt\")]",
                                                                        id: "_V8IVsE58EeqA49h5_v7zzA",
                                                                        key: "effEndDt__V8IVsU58EeqA49h5_v7zzA",
                                                                        name: "effEndDt",
                                                                        fieldType: "",
                                                                        hierarchyName: "Insurances.effEndDt"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_gS2R4E58EeqA49h5_v7zzA",
                                            key: "References__P_Bk8FIoEeq2z_N67ix5UA",
                                            title: "References",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_gS5VME58EeqA49h5_v7zzA",
                                                        key: "References__gS5VMU58EeqA49h5_v7zzA",
                                                        name: "References",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")]",
                                                                id: "_gS6jUE58EeqA49h5_v7zzA",
                                                                key: "ReferenceDetails__gS6jUU58EeqA49h5_v7zzA",
                                                                name: "ReferenceDetails",
                                                                fieldType: "cardView",
                                                                hierarchyName: "ReferenceDetails",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cmpnyNm\")]",
                                                                        id: "_gS8YgE58EeqA49h5_v7zzA",
                                                                        key: "cmpnyNm__gS8YgU58EeqA49h5_v7zzA",
                                                                        name: "cmpnyNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ReferenceDetails.cmpnyNm",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cntctNm\")]",
                                                                        id: "_gS8_kE58EeqA49h5_v7zzA",
                                                                        key: "cntctNm__gS8_kU58EeqA49h5_v7zzA",
                                                                        name: "cntctNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ReferenceDetails.cntctNm"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"cntctNum\")]",
                                                                        id: "_gS9moE58EeqA49h5_v7zzA",
                                                                        key: "cntctNum__gS9moU58EeqA49h5_v7zzA",
                                                                        name: "cntctNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "ReferenceDetails.cntctNum"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"ReferenceDetails\")].field[?(@.name==\"prdctSrvcCd\")]",
                                                                        id: "_gS-0wE58EeqA49h5_v7zzA",
                                                                        key: "prdctSrvcCd__gS-0wU58EeqA49h5_v7zzA",
                                                                        name: "prdctSrvcCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "ReferenceDetails.prdctSrvcCd"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_wJah8E58EeqA49h5_v7zzA",
                                            key: "Sub-suppliers__P_HrkFIoEeq2z_N67ix5UA",
                                            title: "Sub-suppliers",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_wJezYE58EeqA49h5_v7zzA",
                                                        key: "Sub Suppliers__wJezYU58EeqA49h5_v7zzA",
                                                        name: "Sub-suppliers",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")]",
                                                                id: "_wJhPoE58EeqA49h5_v7zzA",
                                                                key: "SubSupplierDetails__wJhPoU58EeqA49h5_v7zzA",
                                                                name: "SubSupplierDetails",
                                                                fieldType: "gridView",
                                                                hierarchyName: "SubSupplierDetails",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"fullNm\")]",
                                                                        id: "_cr-XsFSkEeqev_1CI5JYzg",
                                                                        key: "fullNm__cr-XsVSkEeqev_1CI5JYzg",
                                                                        name: "fullNm",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.fullNm",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"dunsNum\")]",
                                                                        id: "_wJk6AE58EeqA49h5_v7zzA",
                                                                        key: "dunsNum__wJk6AU58EeqA49h5_v7zzA",
                                                                        name: "dunsNum",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.dunsNum",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"prdctCtgry\")]",
                                                                        id: "_wJmIIE58EeqA49h5_v7zzA",
                                                                        key: "prdctCtgry__wJmIIU58EeqA49h5_v7zzA",
                                                                        name: "prdctCtgry",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SubSupplierDetails.prdctCtgry"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"addrLn1\")]",
                                                                        id: "_wJmvME58EeqA49h5_v7zzA",
                                                                        key: "addrLn1__wJmvMU58EeqA49h5_v7zzA",
                                                                        name: "addrLn1",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.addrLn1"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"city\")]",
                                                                        id: "_wJnWQE58EeqA49h5_v7zzA",
                                                                        key: "city__wJnWQU58EeqA49h5_v7zzA",
                                                                        name: "city",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.city"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"cntryCd\")]",
                                                                        id: "_wJnWQk58EeqA49h5_v7zzA",
                                                                        key: "cntryCd__wJnWQ058EeqA49h5_v7zzA",
                                                                        name: "cntryCd",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SubSupplierDetails.cntryCd"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"state\")]",
                                                                        id: "_wJn9UE58EeqA49h5_v7zzA",
                                                                        key: "state__wJn9UU58EeqA49h5_v7zzA",
                                                                        name: "state",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SubSupplierDetails.state"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SubSupplierDetails\")].field[?(@.name==\"pstlCd\")]",
                                                                        id: "_wJokYE58EeqA49h5_v7zzA",
                                                                        key: "pstlCd__wJokYU58EeqA49h5_v7zzA",
                                                                        name: "pstlCd",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SubSupplierDetails.pstlCd"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "_43E1oE58EeqA49h5_v7zzA",
                                            key: "Documents__P_Uf4FIoEeq2z_N67ix5UA",
                                            title: "Documents",
                                            beFormComponent: {
                                                componentType: "BeFormComponent",
                                                configName: "SupplierPortalView",
                                                configType: "BEView",
                                                attributeSelector: "$",
                                                maxColumns: 2,
                                                beFormSections: [
                                                    {
                                                        id: "_43HR4E58EeqA49h5_v7zzA",
                                                        key: "Documents__43HR4U58EeqA49h5_v7zzA",
                                                        name: "Documents",
                                                        hideName: true,
                                                        beFormFields: [
                                                            {
                                                                configName: "SupplierPortalView",
                                                                configType: "BEView",
                                                                attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")]",
                                                                id: "_43JHEE58EeqA49h5_v7zzA",
                                                                key: "SupplierDocuments__43JHEU58EeqA49h5_v7zzA",
                                                                name: "SupplierDocuments",
                                                                fieldType: "cardView",
                                                                hierarchyName: "SupplierDocuments",
                                                                many: true,
                                                                enableAlternateView: true,
                                                                beFormFields: [
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"fileName\")]",
                                                                        id: "_43KVME58EeqA49h5_v7zzA",
                                                                        key: "fileName__43KVMU58EeqA49h5_v7zzA",
                                                                        name: "fileName",
                                                                        fieldType: "",
                                                                        hierarchyName: "SupplierDocuments.fileName",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"docName\")]",
                                                                        id: "_43K8QE58EeqA49h5_v7zzA",
                                                                        key: "docName__43K8QU58EeqA49h5_v7zzA",
                                                                        name: "docName",
                                                                        fieldType: "textField",
                                                                        hierarchyName: "SupplierDocuments.docName",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"docType\")]",
                                                                        id: "_43LjUE58EeqA49h5_v7zzA",
                                                                        key: "docType__43LjUU58EeqA49h5_v7zzA",
                                                                        name: "docType",
                                                                        fieldType: "dropdown",
                                                                        hierarchyName: "SupplierDocuments.docType",
                                                                        required: true
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"validFrom\")]",
                                                                        id: "_43MxcE58EeqA49h5_v7zzA",
                                                                        key: "validFrom__43MxcU58EeqA49h5_v7zzA",
                                                                        name: "validFrom",
                                                                        fieldType: "",
                                                                        hierarchyName: "SupplierDocuments.validFrom"
                                                                    },
                                                                    {
                                                                        configName: "SupplierPortalView",
                                                                        configType: "BEView",
                                                                        attributeSelector: "$.object.child[?(@.name==\"SupplierDocuments\")].field[?(@.name==\"validTo\")]",
                                                                        id: "_43NYgE58EeqA49h5_v7zzA",
                                                                        key: "validTo__43NYgU58EeqA49h5_v7zzA",
                                                                        name: "validTo",
                                                                        fieldType: "",
                                                                        hierarchyName: "SupplierDocuments.validTo"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ],
                            style: {
                                width: 1
                            }
                        }
                    ],
                    sectionType: "Section-Type 1"
                }
            ]
        },
        order: 13,
        states: [
            "Registered"
        ],
        roles: [
            "Supplier Administrators"
        ]
    }
]};

