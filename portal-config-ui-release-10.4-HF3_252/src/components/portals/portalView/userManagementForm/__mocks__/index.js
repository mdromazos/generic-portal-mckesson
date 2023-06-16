const bevNamesData = ["CustomerOrgPortalView","CustomerOrgRegistrationView","CustomerOrgView"];

const bevMetadata = {
    object: {
        field: [
            {
                name: "cmpnyLglNm",
                label: "Company Legal Name",
                required: true,
                dataType: "String",
            },
            {
                name: "cmpnyStrtAdd",
                label: "Company Street Address",
                required: true,
                dataType: "String",
            },
            {
                name: "city",
                label: "City",
                required: true,
                dataType: "String",
            },
            {
                name: "pstlCd",
                label: "Zip/Postal Code",
                dataType: "String",
            },
            {
                name: "state",
                label: "State/Province",
                required: true,
                dataType: "lookup",
            },
            {
                name: "prtlState",
                label: "Portal State",
                dataType: "String",
            },
            {
                name: "country",
                label: "Country",
                dataType: "lookup",
            },
            {
                name: "portalAssc",
                label: "Portal Association",
                dataType: "lookup",
            },
            {
                name: "consolidationInd",
                label: "Consolidation Ind",
                system: true,
                dataType: "Integer",
            },
            {
                name: "creator",
                label: "Creator",
                system: true,
                dataType: "String",
            },
        ],
        child: [
            {
                name: "Contact",
                label: "Contact",
                many: true,
                color: "#d6ebfc",
                field: [
                    {
                        name: "frstNm",
                        label: "First Name",
                        dataType: "String",
                    },
                    {
                        name: "lstNm",
                        label: "Last Name",
                        dataType: "String",
                    },
                    {
                        name: "title",
                        label: "Title",
                        dataType: "String",
                    },
                    {
                        name: "phnDlngCd",
                        label: "Phone Dialing Code",
                        dataType: "String",
                    },
                    {
                        name: "emailAdd",
                        label: "Email Address",
                        dataType: "String",
                    },
                    {
                        name: "phnNum",
                        label: "Phone Number",
                        dataType: "String",
                    },
                    {
                        name: "prtlUsrNm",
                        label: "Portal User Name",
                        dataType: "String",
                    },
                    {
                        name: "prtlUsrRle",
                        label: "Portal User Role",
                        dataType: "lookup",
                    },
                ]
            }
        ],
        name: "CustomerOrgRegistrationView",
        label: "Customer Org Registration View",
        many: false
    }
};

const portalRolesData = {
    item: [
        { fieldName: 'portal role 1' },
        { fieldName: 'portal role 2' },
        { fieldName: 'portal role 3' },
    ],
};

const portalStatesData = {
    item: [
        { fieldName: 'portal state 1' },
        { fieldName: 'portal state 2' },
        { fieldName: 'portal state 3' },
    ],
};

export { bevNamesData, bevMetadata, portalRolesData, portalStatesData };