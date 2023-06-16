export const portalMetadataStore = {
    123: {
        portalId: "80020",
        metamodelVersion: "1.1.0",
        version: 8,
        isDraft: false,
        hasPublished: true,
        status: "Running",
        generalSettings: {
            portalName: "Demo_Arka",
            portalTitle: "Supplier Portal",
            databaseId: "inwasdb201-sip104-TSR_HUB",
            beName: "Supplier",
            sourceSystem: "Portal",
            isStateEnabled: true,
            isExternalUserManagementEnabled: false,
            stateSettings: {
                referenceEntity: "LookupPartyStatusValue",
                fieldName: "partyStatusValue"
            },
            roleSettings: {
                referenceEntity: "LookupPortalUserRole",
                fieldName: "roleCode"
            },
            header: {
                fontColor: "#000000",
                logo : "https://cissltd.com/wp-content/uploads/2017/06/bigstock-Industrial-Warehouse-6200839.jpg"
            },
            footer: {
                footerText: "Copyright 1993-2020 Informatica LLC. All Rights",
                fontColor: "#000000",
                backgroundColor: "#000000",
            },
            signup: {
                backgroundImage: "https://cissltd.com/wp-content/uploads/2017/06/bigstock-Industrial-Warehouse-6200839.jpg",
                title: "Sign Up Form",
                welcomeText: "Fill in the fields to create a supplier account.",
                bevName: "SupplierRegistrationView",
                userRole: "Supplier Administrators",
                userState: "Registered",
                maxColumns: 2,
                beFormComponent: {
                    configName: "SupplierRegistrationView",
                    configType: "BEView",
                    attributeSelector: "$",
                    beFormSections: [
                        {
                            id: "_beu3MEqNEeqOZOqLd8MgeA",
                            key: "__beu3MUqNEeqOZOqLd8MgeA",
                            name: "Company Details",
                            beFormFields: [
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"fullNm\")]",
                                    id: "_bezIoEqNEeqOZOqLd8MgeA",
                                    key: "fullNm__bezIoUqNEeqOZOqLd8MgeA",
                                    name: "fullNm",
                                    fieldType: "textField",
                                    hierarchyName: "fullNm",
                                    required: true
                                },
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"TaxId\")]",
                                    id: "_be090EqNEeqOZOqLd8MgeA",
                                    key: "TaxId__be090UqNEeqOZOqLd8MgeA",
                                    name: "TaxId",
                                    fieldType: "textField",
                                    hierarchyName: "TaxId"
                                },
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"DunsNumber\")]",
                                    id: "_be2L8EqNEeqOZOqLd8MgeA",
                                    key: "DunsNumber__be2L8UqNEeqOZOqLd8MgeA",
                                    name: "DunsNumber",
                                    fieldType: "textField",
                                    hierarchyName: "DunsNumber",
                                    required: true
                                },
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"cmpnyStreetAddr\")]",
                                    id: "_be52UEqNEeqOZOqLd8MgeA",
                                    key: "cmpnyStreetAddr__be52UUqNEeqOZOqLd8MgeA",
                                    name: "cmpnyStreetAddr",
                                    fieldType: "textField",
                                    hierarchyName: "cmpnyStreetAddr",
                                    required: true
                                },
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"city\")]",
                                    id: "_be7EcEqNEeqOZOqLd8MgeA",
                                    key: "city__be7EcUqNEeqOZOqLd8MgeA",
                                    name: "city",
                                    fieldType: "textField",
                                    hierarchyName: "city",
                                    required: true
                                },
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"pstlCode\")]",
                                    id: "_be8SkEqNEeqOZOqLd8MgeA",
                                    key: "pstlCode__be8SkUqNEeqOZOqLd8MgeA",
                                    name: "pstlCode",
                                    fieldType: "textField",
                                    hierarchyName: "pstlCode"
                                },
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"country\")]",
                                    id: "_be85oEqNEeqOZOqLd8MgeA",
                                    key: "country__be85oUqNEeqOZOqLd8MgeA",
                                    name: "country",
                                    fieldType: "dropdown",
                                    hierarchyName: "country",
                                    required: true
                                },
                                {
                                    configName: "SupplierRegistrationView",
                                    configType: "BEView",
                                    attributeSelector: "$.object.field[?(@.name==\"state\")]",
                                    id: "_be9gsEqNEeqOZOqLd8MgeA",
                                    key: "state__be9gsUqNEeqOZOqLd8MgeA",
                                    name: "state",
                                    fieldType: "dropdown",
                                    hierarchyName: "state",
                                    required: true
                                }
                            ]
                        }
                    ]
                },
                registrationEmailTemplate: "OnboardingRegistration"
            },
            login: {
                title: "Log In",
                backgroundImage: "https://cissltd.com/wp-content/uploads/2017/06/bigstock-Industrial-Warehouse-6200839.jpg",
                fieldMapping: {
                    userName: {
                        code: "Contacts.contacts.prtlUsrNm",
                        label: "userName"
                    },
                    email: {
                        code: "Contacts.contacts.ContactElectronicAddress.etrncAddr",
                        label: "email"
                    },
                    userRole: {
                        code: "Contacts.contacts.prtlUsrRle.roleCode",
                        label: "userRole"
                    },
                    userState: {
                        code: "Status.prtyStsVal.partyStatusValue",
                        label: "userState"
                    },
                    portalAssociation: {
                        code: "portalAssc.portalId",
                        label: "portalAssociation"
                    }
                },
                resetPasswordEmailTemplate: "resetPassword",
                resetPasswordEmailSuccessTemplate: "resetPasswordSuccessful"
            },
            userManagement: {
                bevName: "SupplierRegistrationView",
                fieldMapping: {
                    firstName: {
                        code: "Contacts.frstNm",
                        label: "First Name"
                    },
                    lastName: {
                        code: "Contacts.lstNm",
                        label: "Last Name"
                    },
                    userName: {
                        code: "Contacts.prtlUsrNm",
                        label: "User Name"
                    },
                    email: {
                        code: "Contacts.prmryEmail",
                        label: "Email Address"
                    },
                    userRole: {
                        code: "Contacts.prtlUsrRle",
                        label: "User Role"
                    },
                    userState: {
                        code: "prtlSts",
                        label: "userState"
                    },
                    countryDialingCode: {
                        code: "Contacts.prfxNum",
                        label: "Country Dialing Code"
                    },
                    phoneNumber: {
                        code: "Contacts.primaryPhnNumber",
                        label: "Phone Number"
                    },
                    jobTitle: {
                        code: "Contacts.title",
                        label: "Title"
                    },
                    portalAssociation: {
                        code: "portalAssc",
                        label: "portalAssociation"
                    }
                },
                userRoles: [
                    "Supplier Administrators"
                ],
                userStates: [
                    "Approved"
                ],
                createAdditionalUsers: true,
                inviteEmailTemplate: "setPassword",
                resetPasswordEmailSuccessTemplate: "setPasswordSuccessful",
                hasSameEmailAndUsername: true,
                sectionHeading: "Contact Details",
                hasUserRole: true
            }
        }
    }
};