const portalConfigDefaultData = {
    generalSettings: {
       isStateEnabled: true,
       roleSettings: {
            fieldName: "roleCode",
            referenceEntity: "LookupPortalUserRole",
        },
        stateSettings: {
            fieldName: "prtyRleStsVal",
            filterFieldName: "prtyRleStsTyp",
            filterFieldValue: "",
            referenceEntity: "LookupPartyRoleStatusValue",
        },
        databaseId: "localhost-orcl-C360_ORS",
        beName: "CustomerOrg",
        header:{},
        signup: { maxColumns: 2 },
        login: {},
        footer:{},
    },
};

const bevViews = ['CustomerOrgPortalView', 'CustomerOrgRegistrationView', 'CustomerOrgView'];

const states = {
    firstRecord: 1,
    link: [],
    pageSize: 1000,
    searchToken: "SVR1.1AIDW",    
    item: [
        {
            label: "Lookup Party Role Status Value",
            prtyRleStsTyp: "Primary Status",
            prtyRleStsVal: "Active",
            prtyRleStsValDesc: "Active",
            rowidObject: "1",               
        },
        {
            label: "Lookup Party Role Status Value",
            prtyRleStsTyp: "Onboarding Status",
            prtyRleStsVal: "Approved",
            prtyRleStsValDesc: "Approved",
            rowidObject: "20001",        
        }
    ]
};

const roles = {
    link: [],
    pageSize: 1000,
    searchToken: "SVR1.1AIDX",
    firstRecord: 1,
    item: [
        {
            label: "Lookup Portal User Role",
            roleCode: "Customer Administrators",
            roleDesc: "Customer Administrators",
            rowidObject: "1",
        },
        {
            label: "Lookup Portal User Role",
            roleCode: "Customer Users",
            roleDesc: "Customer Users",
            rowidObject: "2",            
        }
    ]
};

export { portalConfigDefaultData, bevViews, states, roles }