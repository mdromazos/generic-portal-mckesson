const portalConfigDefaultData = {
    generalSettings: {
        beName: "CustomerOrg",
        databaseId: "localhost-orcl-C360_ORS",
        navigationType: "",
        sourceSystem: "Portal",
        roleSettings: {
            fieldName: "roleCode",
            referenceEntity: "LookupPortalUserRole",
        },
        login: {
            backgroundImage: "http://<ho",
        },
       footer:{
            footerText: "Copyright 1993-2020 Informatica",
       },
       userManagement:{
        bevName: "CustomerOrgRegistrationView",
        createAdditionalUsers: true,
        fieldMapping: {
            countryDialingCode: {code: "Contact.phnDlngCd", label: "Name of the field to store the country dialing code."},
            email: {code: "Contact.emailAdd", label: "Email Address"},
            firstName: {code: "Contact.frstNm", label: "First Name"},
            jobTitle: {code: "Contact.title", label: "Title"},
            lastName: {code: "Contact.lstNm", label: "Last Name"},
            phoneNumber: {code: "Contact.phnNum", label: "Phone Number"},
            portalAssociation: {code: "portalAssc"},
            userName: {code: "Contact.prtlUsrNm", label: "User Name"},
            userRole: {code: "Contact.prtlUsrRle", label: "User Role"},
            userState: {code: "prtlState"},
        },
        hasSameEmailAndUsername: true,
        hasUserRole: true,
        inviteEmailTemplate: "setPassword",
        resetPasswordEmailSuccessTemplate: "setPasswordSuccessful",
        sectionHeading: "Contact Details",
        userRoles: ["Customer Administrators"],
        userStates: ["Approved"],
       },
       isStateEnabled:true,
       header:{},
       signup: {
        maxColumns: 2,
        backgroundImage: "signup.jpg",
        beFormComponent: {
            configName: "CustomerOrgRegistrationView", 
            componentType: "BeFormComponent", 
            beFormSections: [{
                beFormFields: [{
                    attributeSelector: "$.object.field[?(@.name=='cmpnyLglNm')]",
                    beFormFields: [],
                    configName: "CustomerOrgRegistrationView",
                    configType: "BEView",
                    enableAlternateView: false,
                    enableDependency: false,
                    enableDynamicFields: false,
                    enableValidation: false,
                    fieldType: "textField",
                    hideParent: false,
                    hierarchyName: "cmpnyLglNm",
                    id: "_ncrvkLEaEeqjz4p14YS8pg",
                    isHidden: false,
                    isReadOnly: false,
                    key: "cmpnyLglNm__ncrvkbEaEeqjz4p14YS8pg",
                    many: false,
                    metadata: {
                        applyNullValues: false,
                        dataType: "String",
                        filterable: false,
                        label: "Company Legal Name",
                        length: 0,
                        name: "cmpnyLglNm",
                        operations: {
                            create: {allowed: true},
                            read: {allowed: true},
                            update: {allowed: true},                         
                        },
                        sortable: false,
                        trust: false,                  
                    },
                    name: "cmpnyLglNm",
                    order: 0,
                    required: true,
                    saveParentInfo: false,
                }],
                hideName: false,
                id: "_ncqhcLEaEeqjz4p14YS8pg",
                key: "Company Details__ncqhcbEaEeqjz4p14YS8pg",
                name: "Company Details",
                order: 0,         
            }], 
            attributeSelector: "$", 
            configType: "BEView",
        },
        bevName: "CustomerOrgRegistrationView",
        isCaptchaEnabled: false,
        registrationEmailTemplate: "OnboardingRegistration",
        title: "Sign Up Form",
        userRole: "Customer Administrators",
        userState: "Registered",
        welcomeText: "Fill in the fields to create a",
       },
       stateSettings: {
        fieldName: "prtyRleStsVal",
        filterFieldName: "prtyRleStsTyp",
        filterFieldValue: "",
        referenceEntity: "LookupPartyRoleStatusValue",
       }
    },
       hasPublished: true,
       isDraft: true,       
       portalId: "2",
       status: "Stopped",
       version: "15",
       pages: [{
            bevName: "CustomerOrgPortalView",
            id: "120012",
            isReadOnly: false,
            key: "Financial Details__lidCALHfEeqmFe_WR7weag",
            layout: {sections: [{
                displayIcon: "rectangle",
                id: "_5XKxkLRvEeqMxoM3ornfiw",
                isDefault: false,
                sectionType: "Section-Type 1",
            }]},
            maxColumns: 2,
            name: "Financial Details",
            order: 1,
            roles: ["Customer Administrators", "Customer Users"],
            states: ["Approved"],
            type: "Record Page",         
           }]   
};

const portalConfigMap = {
    "localhost-orcl-C360_ORS__2": {
        isDraft: true,
        name: "Customer Portal",
        orsId: "localhost-orcl-C360_ORS",
        version: "15",
    },
    "localhost-orcl-C360_ORS__20019": {
        isDraft: true,
        name: "New Portal",
        orsId: "localhost-orcl-C360_ORS",
        version: "4",
    },
 };


 const defaultCurrentPage = {
    icon: "home_icon",
    id: "LABEL_HOME",
    label: ["LABEL_HOME"],
    type: "LABEL_HOME",
    url: "/portals",
 }


const portalPages = [{
    id: "40031",
    isReadOnly: false,
    key: "we__0Yc8AKEYEeuj5-JGwDUhmA",
    layout: {
        sections: [{
        displayIcon: "rectangle",
        isDefault: false, 
        id: "_0Yc8AaEYEeuj5-JGwDUhmA",
        sectionType: "Section-Type 1"
    }]},
    maxColumns: 2,
    name: "test",
    order: 1,
    type: "Custom Page",
}]

export { portalConfigDefaultData, portalConfigMap, defaultCurrentPage, portalPages };
