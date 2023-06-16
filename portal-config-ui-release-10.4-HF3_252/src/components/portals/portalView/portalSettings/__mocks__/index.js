const generalInformationInitalData = {
    generalSettings: {
        header:{},
        footer:{},
        login:{},
        isStateEnabled:false,
        isExternalUserManagementEnabled: true,
        signup:{
           maxColumns:2
        },
        roleSettings: {},
        userManagement:{
           createAdditionalUsers:false,
           fieldMapping:{},
        }
    }
 };

 const pageSettingsData = [
    {
       label:["LABEL_HOME"],
       type:"LABEL_HOME",
       url:"/portals",
       icon:"/portal-config/static/media/home.95fd2d69.svg",
       id:"LABEL_HOME"
    }
 ];

 const portalConfigMapData = {
    "localhost-orcl-C360_ORS__2":{
       name:"Customer Portal",
       orsId:"localhost-orcl-C360_ORS",
       version:"22",
       isDraft:true
    },
    "localhost-orcl-C360_ORS__20019":{
       name:"test one",
       orsId:"localhost-orcl-C360_ORS",
       version:"7",
       isDraft:true
    },
    "localhost-orcl-C360_ORS__40033":{
       name:"test two",
       orsId:"localhost-orcl-C360_ORS",
       version:"7",
       isDraft:false
    },
    "localhost-orcl-C360_ORS__40034":{
       name:"test three",
       orsId:"localhost-orcl-C360_ORS",
       version:"3",
       isDraft:false
    }
 };

 const currentPageData = {
    label:["LABEL_HOME"],
    type:"LABEL_HOME",
    url:"/portals",
    icon:"/portal-config/static/media/home.95fd2d69.svg",
    id: "LABEL_HOME"
 };

 const generalInformationEditData = {
    portalId:"2",
    isDraft:true,
    hasPublished:true,
    version:"22",
    status:"Running",
    generalSettings:{
       beName:"CustomerOrg",
       isExternalUserManagementEnabled: true,
       userManagement:{
          inviteEmailTemplate:"setPassword",
          bevName:"CustomerOrgRegistrationView",
          userRoles:[
             "Customer Administrators"
          ],
          fieldMapping:{
             firstName:{
                code:"Contact.frstNm",
                label:"First Name"
             },
             lastName:{
                code:"Contact.lstNm",
                label:"Last Name"
             },
             phoneNumber:{
                code:"Contact.phnNum",
                label:"Phone Number"
             },
             userState:{
                code:"prtlState"
             },
             countryDialingCode:{
                code:"Contact.phnDlngCd",
                label:"Name of the field to store the country dialing code."
             },
             jobTitle:{
                code:"Contact.title",
                label:"Title"
             },
             portalAssociation:{
                code:"portalAssc"
             },
             userName:{
                code:"Contact.prtlUsrNm",
                label:"User Name"
             },
             userRole:{
                code:"Contact.prtlUsrRle",
                label:"User Role"
             },
             email:{
                code:"Contact.emailAdd",
                label:"Email Address"
             }
          },
          userStates:[
             "Approved"
          ],
          hasSameEmailAndUsername:true,
          hasUserRole:true,
          resetPasswordEmailSuccessTemplate:"setPasswordSuccessful",
          sectionHeading:"Contact Details",
          createAdditionalUsers: true
       },
       roleSettings:{
          fieldName:"roleCode",
          referenceEntity:"LookupPortalUserRole"
       },
       footer:{
          "footerText":"Copyright 1993-2020 Informatica LLC. All Rights"
       },
       sourceSystem:"Portal",
       login:{
          fieldMapping:{
             userState:{
                code:"CustomerOrgState.prmryRleStsVal.prtyRleStsVal"
             },
             portalAssociation:{
                code:"portalAssc.portalId"
             },
             userName:{
                code:"CustomerOrgContacts.Party.prtlUsrNm"
             },
             userRole:{
                code:"CustomerOrgContacts.Party.prtlUsrRle.roleCode"
             },
             email:{
                code:"CustomerOrgContacts.Party.RelatedPersonPrimaryEmail.prmryEml"
             }
          },
          backgroundImage:"http://<host>:<port>/portal-ui/images/login.jpg",
          title:"Log In",
          isCaptchaEnabled:false,
          resetPasswordEmailTemplate:"resetPassword",
          resetPasswordEmailSuccessTemplate:"resetPasswordSuccessful"
       },
       portalTitle:"Customer Portal",
       signup:{
          bevName:"CustomerOrgRegistrationView",
          beFormComponent:{
             configName:"CustomerOrgRegistrationView",
             componentType:"BeFormComponent",
             beFormSections:[
                {
                   beFormFields:[
                      {
                         "configName":"CustomerOrgRegistrationView",
                         "enableAlternateView":false,
                         "hierarchyName":"cmpnyLglNm",
                         "enableDynamicFields":false,
                         "attributeSelector":"$.object.field[?(@.name==\"cmpnyLglNm\")]",
                         "configType":"BEView",
                         "many":false,
                         "required":true,
                         "saveParentInfo":false,
                         "hideParent":false,
                         "isHidden":false,
                         "isReadOnly":false,
                         "beFormFields":[
                            
                         ],
                         "enableValidation":false,
                         name:"cmpnyLglNm",
                         id:"_ncrvkLEaEeqjz4p14YS8pg",
                         "fieldType":"textField",
                         "enableDependency":false,
                         "key":"cmpnyLglNm__ncrvkbEaEeqjz4p14YS8pg",
                         "order":0,
                         "metadata":{
                            "operations":{
                               read:{
                                  allowed:true
                               },
                               create:{
                                  allowed:true
                               },
                               update:{
                                  allowed:true
                               }
                            },
                            name:"cmpnyLglNm",
                            label:"Company Legal Name",
                            "dataType":"String",
                            "length":0,
                            "trust":false,
                            "applyNullValues":false,
                            "filterable":false,
                            "sortable":false
                         }
                      },
                      {
                         "configName":"CustomerOrgRegistrationView",
                         "enableAlternateView":false,
                         "hierarchyName":"cmpnyStrtAdd",
                         "enableDynamicFields":false,
                         "attributeSelector":"$.object.field[?(@.name==\"cmpnyStrtAdd\")]",
                         "configType":"BEView",
                         "many":false,
                         "required":true,
                         "saveParentInfo":false,
                         "hideParent":false,
                         "isHidden":false,
                         "isReadOnly":false,
                         "beFormFields":[
                            
                         ],
                         "enableValidation":false,
                         name:"cmpnyStrtAdd",
                         id:"_ncs9sLEaEeqjz4p14YS8pg",
                         "fieldType":"textField",
                         "enableDependency":false,
                         "key":"cmpnyStrtAdd__ncs9sbEaEeqjz4p14YS8pg",
                         "order":0,
                         "metadata":{
                            "operations":{
                               read:{
                                  allowed:true
                               },
                               create:{
                                  allowed:true
                               },
                               update:{
                                  allowed:true
                               }
                            },
                            name:"cmpnyStrtAdd",
                            label:"Company Street Address",
                            "dataType":"String",
                            "length":0,
                            "trust":false,
                            "applyNullValues":false,
                            "filterable":false,
                            "sortable":false
                         }
                      },
                      {
                         "configName":"CustomerOrgRegistrationView",
                         "enableAlternateView":false,
                         "hierarchyName":"city",
                         "enableDynamicFields":false,
                         "attributeSelector":"$.object.field[?(@.name==\"city\")]",
                         "configType":"BEView",
                         "many":false,
                         "required":true,
                         "saveParentInfo":false,
                         "hideParent":false,
                         "isHidden":false,
                         "isReadOnly":false,
                         "beFormFields":[
                            
                         ],
                         "enableValidation":false,
                         name:"city",
                         id:"_nctkwLEaEeqjz4p14YS8pg",
                         "fieldType":"textField",
                         "enableDependency":false,
                         "key":"city__nctkwbEaEeqjz4p14YS8pg",
                         "order":0,
                         "metadata":{
                            "operations":{
                               read:{
                                  allowed:true
                               },
                               create:{
                                  allowed:true
                               },
                               update:{
                                  allowed:true
                               }
                            },
                            name:"city",
                            label:"City",
                            "dataType":"String",
                            "length":0,
                            "trust":false,
                            "applyNullValues":false,
                            "filterable":false,
                            "sortable":false
                         }
                      },
                      {
                         "configName":"CustomerOrgRegistrationView",
                         "enableAlternateView":false,
                         "hierarchyName":"pstlCd",
                         "enableDynamicFields":false,
                         "attributeSelector":"$.object.field[?(@.name==\"pstlCd\")]",
                         "configType":"BEView",
                         "many":false,
                         "required":false,
                         "saveParentInfo":false,
                         "hideParent":false,
                         "isHidden":false,
                         "isReadOnly":false,
                         "beFormFields":[
                            
                         ],
                         "enableValidation":false,
                         name:"pstlCd",
                         id:"_ncuL0LEaEeqjz4p14YS8pg",
                         "fieldType":"textField",
                         "enableDependency":false,
                         "key":"pstlCd__ncuL0bEaEeqjz4p14YS8pg",
                         "order":0,
                         "metadata":{
                            "operations":{
                               read:{
                                  allowed:true
                               },
                               create:{
                                  allowed:true
                               },
                               update:{
                                  allowed:true
                               }
                            },
                            name:"pstlCd",
                            label:"Zip/Postal Code",
                            "dataType":"String",
                            "length":0,
                            "trust":false,
                            "applyNullValues":false,
                            "filterable":false,
                            "sortable":false
                         }
                      },
                      {
                         "configName":"CustomerOrgRegistrationView",
                         "enableAlternateView":false,
                         "hierarchyName":"country",
                         "enableDynamicFields":false,
                         "attributeSelector":"$.object.field[?(@.name==\"country\")]",
                         "configType":"BEView",
                         "many":false,
                         "required":true,
                         "saveParentInfo":false,
                         "hideParent":false,
                         "isHidden":false,
                         "isReadOnly":false,
                         "beFormFields":[
                            
                         ],
                         "enableValidation":false,
                         name:"country",
                         id:"_ncuy4LEaEeqjz4p14YS8pg",
                         "fieldType":"dropdown",
                         "enableDependency":false,
                         "key":"country__ncuy4bEaEeqjz4p14YS8pg",
                         "order":0,
                         "metadata":{
                            "operations":{
                               read:{
                                  allowed:true
                               },
                               create:{
                                  allowed:true
                               },
                               update:{
                                  allowed:true
                               }
                            },
                            name:"country",
                            label:"Country",
                            "dataType":"lookup",
                            "readOnly":false,
                            "required":true,
                            "system":false,
                            "trust":false,
                            "applyNullValues":false,
                            "filterable":false,
                            "sortable":false,
                            "lookup":{
                               "link":[
                                  {
                                     "href":"http://localhost:8080/cmx/lookup/localhost-orcl-C360_ORS/id-label/CustomerOrgRegistrationView/country",
                                     "rel":"lookup"
                                  },
                                  {
                                     "href":"http://localhost:8080/cmx/lookup/localhost-orcl-C360_ORS/object/CustomerOrgRegistrationView/country",
                                     "rel":"list"
                                  }
                               ],
                               "object":"LookupCountry",
                               "key":"cntryCd",
                               "value":"cntryDesc"
                            }
                         }
                      },
                      {
                         "configName":"CustomerOrgRegistrationView",
                         "enableAlternateView":false,
                         "hierarchyName":"state",
                         "enableDynamicFields":false,
                         "attributeSelector":"$.object.field[?(@.name==\"state\")]",
                         "configType":"BEView",
                         "many":false,
                         "required":false,
                         "saveParentInfo":false,
                         "hideParent":false,
                         "isHidden":false,
                         "isReadOnly":false,
                         "beFormFields":[
                            
                         ],
                         "enableValidation":false,
                         name:"state",
                         id:"_bSSk4LcxEeqLP5lDUaPQBQ",
                         "fieldType":"dropdown",
                         "enableDependency":false,
                         "key":"state__bSSk4bcxEeqLP5lDUaPQBQ",
                         "order":0,
                         "metadata":{
                            "operations":{
                               read:{
                                  allowed:true
                               },
                               create:{
                                  allowed:true
                               },
                               update:{
                                  allowed:true
                               }
                            },
                            name:"state",
                            label:"State/Province",
                            "dataType":"lookup",
                            "readOnly":false,
                            "required":false,
                            "system":false,
                            "trust":false,
                            "applyNullValues":false,
                            "filterable":false,
                            "sortable":false,
                            "lookup":{
                               "link":[
                                  {
                                     "href":"http://localhost:8080/cmx/lookup/localhost-orcl-C360_ORS/id-label/CustomerOrgRegistrationView/state",
                                     "rel":"lookup"
                                  },
                                  {
                                     "href":"http://localhost:8080/cmx/lookup/localhost-orcl-C360_ORS/object/CustomerOrgRegistrationView/state",
                                     "rel":"list"
                                  }
                               ],
                               "object":"LookupCountry.LookupState",
                               "key":"stateCd",
                               "value":"stateDesc"
                            }
                         }
                      }
                   ],
                   name:"Company Details",
                   id:"_ncqhcLEaEeqjz4p14YS8pg",
                   "hideName":false,
                   "key":"Company Details__ncqhcbEaEeqjz4p14YS8pg",
                   "order":0
                }
             ],
             attributeSelector:"$",
             configType:"BEView",
             maxColumns:0,
             metadata:{
                operations:{
                   read:{
                      allowed:true
                   },
                   search:{
                      allowed:true
                   },
                   create:{
                      allowed:true,
                      task:{
                         template:{
                            title:"{taskRecord[0].label}",
                            priority:"NORMAL",
                            dueDate:"2021-04-27T12:57:32.126+05:30",
                            taskType:"AVOSBeDraftState"
                         },
                         comment:"AS_REQUIRED",
                         attachment:"NEVER"
                      }
                   },
                   update:{
                      allowed:true,
                      "task":{
                         "template":{
                            "title":"{taskRecord[0].label}",
                            "priority":"NORMAL",
                            "dueDate":"2021-04-27T12:57:32.126+05:30",
                            "taskType":"AVOSBeDraftState"
                         },
                         "comment":"AS_REQUIRED",
                         "attachment":"NEVER"
                      }
                   },
                   "merge":{
                      allowed:true
                   },
                   "delete":{
                      allowed:true
                   },
                   "unmerge":{
                      allowed:false
                   }
                },
                "objectType":"ENTITY",
                "timeline":false,
                "viewOf":"CustomerOrg"
             }
          },
          userState:"Registered",
          backgroundImage:"http://<host>:<port>/portal-ui/images/signup.jpg",
          registrationEmailTemplate:"OnboardingRegistration",
          welcomeText:"Fill in the fields to create a customer account.",
          title:"Sign Up Form",
          userRole:"Customer Administrators",
          isCaptchaEnabled:false,
          maxColumns:2
       },
       stateSettings:{
          fieldName:"prtyRleStsVal",
          referenceEntity:"LookupPartyRoleStatusValue",
          filterFieldValue:"",
          filterFieldName:"prtyRleStsTyp"
       },
       portalName:"Customer Portal",
       isStateEnabled:true,
       header:{},
       databaseId:"localhost-orcl-C360_ORS",
       navigationType:""
    },
    pages:[
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_Y2olsKHcEeuj5-JGwDUhmA",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "bevName":"CustomerOrgPortalView",
          "isReadOnly":false,
          "roles":[
             "Customer Administrators",
             "Customer Users"
          ],
          name:"Financial Details",
          id:"120012",
          "type":"Record Page",
          "maxColumns":2,
          "key":"Financial Details__lidCALHfEeqmFe_WR7weag",
          "order":1,
          "states":[
             "Approved"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_5SzrMKHeEeuj5-JGwDUhmA",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "bevName":"CustomerOrgPortalView",
          "isReadOnly":false,
          "roles":[
             "Customer Administrators",
             "Customer Users"
          ],
          name:"Key Executives",
          id:"120013",
          "type":"Record Page",
          "maxColumns":2,
          "key":"Key Executives__0fK48LHfEeqmFe_WR7weag",
          "order":2,
          "states":[
             "Approved"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_6uOq8La7EeqLP5lDUaPQBQ",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "bevName":"CustomerOrgPortalView",
          "isReadOnly":false,
          "roles":[
             "Customer Administrators",
             "Customer Users"
          ],
          name:"Documents",
          id:"120014",
          "type":"Record Page",
          "maxColumns":2,
          "key":"Documents__-gOHILHfEeqmFe_WR7weag",
          "order":3,
          "states":[
             "Approved"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_IRGA0LEbEeqjz4p14YS8pg",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "isReadOnly":false,
          "roles":[
             "Customer Administrators"
          ],
          name:"Registration",
          id:"20003",
          "type":"Custom Page",
          "maxColumns":2,
          "key":"Registration__IRFZwLEbEeqjz4p14YS8pg",
          "order":4,
          "states":[
             "Registered"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_NQ3RYMTuEeqaBJntey2OEA",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "bevName":"CustomerOrgPortalView",
          "isReadOnly":false,
          "roles":[
             "Customer Administrators",
             "Customer Users"
          ],
          name:"Additional Details",
          id:"120010",
          "type":"Record Page",
          "maxColumns":2,
          "key":"Additional Details__4SMJgLHdEeqmFe_WR7weag",
          "order":7,
          "states":[
             "Approved"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_BeZXMLa8EeqLP5lDUaPQBQ",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "bevName":"CustomerOrgPortalView",
          "isReadOnly":false,
          "roles":[
             "Customer Administrators",
             "Customer Users"
          ],
          name:"Insurance",
          id:"120011",
          "type":"Record Page",
          "maxColumns":2,
          "key":"Insurance__kUblILHeEeqmFe_WR7weag",
          "order":8,
          "states":[
             "Approved"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_dhRZ4LEbEeqjz4p14YS8pg",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "isReadOnly":false,
          "roles":[
             "Customer Administrators"
          ],
          name:"Registration",
          id:"20004",
          "type":"Custom Page",
          "maxColumns":2,
          "key":"Registration__dhQy0LEbEeqjz4p14YS8pg",
          "order":9,
          "states":[
             "Send Back"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_rlrIwLEbEeqjz4p14YS8pg",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "isReadOnly":false,
          "roles":[
             "Customer Administrators"
          ],
          name:"Review in Progress",
          id:"20005",
          "type":"Custom Page",
          "maxColumns":2,
          "key":"Review in Progress__rlqhsLEbEeqjz4p14YS8pg",
          "order":10,
          "states":[
             "Submitted"
          ]
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_yHhtIJnDEeurn71GzS3vZw",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "bevName":"CustomerOrgPortalView",
          "isReadOnly":false,
          name:"sadad",
          id:"20004",
          "type":"Record Page",
          "maxColumns":2,
          "key":"sadad__yHhGEJnDEeurn71GzS3vZw",
          "order":10
       },
       {
          "layout":{
             "sections":[
                {
                   "displayIcon":"rectangle",
                   "isDefault":false,
                   id:"_1GWHUZnGEeurn71GzS3vZw",
                   "sectionType":"Section-Type 1"
                }
             ]
          },
          "bevName":"CustomerOrgRegistrationView",
          "isReadOnly":false,
          name:"we",
          id:"20005",
          "type":"Record Page",
          "maxColumns":2,
          "key":"we__1GWHUJnGEeurn71GzS3vZw",
          "order":11
       }
    ]
 };

 const pageSettingsEditData = [
    {
       label:[
          "LABEL_HOME"
       ],
       "type":"LABEL_HOME",
       "url":"/portals",
       "icon":"/portal-config/static/media/home.95fd2d69.svg",
       id:"LABEL_HOME"
    },
    {
       label:[
          "Customer Portal"
       ],
       "type":"LABEL_EDIT_PORTAL",
       "url":"/portals/localhost-orcl-C360_ORS/2",
       "icon":"/portal-config/icons/portal.svg",
       id:"LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2"
    }
 ];

 const currentPageEditData = {
    label:[
       "Customer Portal"
    ],
    type:"LABEL_EDIT_PORTAL",
    url:"/portals/localhost-orcl-C360_ORS/2",
    icon:"/portal-config/icons/portal.svg",
    id:"LABEL_EDIT_PORTAL_localhost-orcl-C360_ORS_2"
 }

 export {
     generalInformationInitalData,
     pageSettingsData,
     portalConfigMapData,
     currentPageData,
     generalInformationEditData,
     pageSettingsEditData,
     currentPageEditData,
}