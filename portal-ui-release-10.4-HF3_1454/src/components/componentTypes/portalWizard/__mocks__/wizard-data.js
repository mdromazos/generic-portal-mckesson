export const portalPages ={
    pages : [
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
]};

