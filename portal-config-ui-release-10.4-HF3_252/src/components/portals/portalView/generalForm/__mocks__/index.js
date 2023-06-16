const portalConfigData = {
    "generalSettings":{
       "beName":"CustomerOrg",
       "roleSettings":{
          "fieldName":"roleCode",
          "referenceEntity":"LookupPortalUserRole"
       },
       "footer":{
          "footerText":"Copyright 1993-2020 Informatica LLC. All Rights"
       },
       "sourceSystem":"Portal",
       "portalTitle":"Customer Portal",
       "stateSettings":{
          "fieldName":"prtyRleStsVal",
          "referenceEntity":"LookupPartyRoleStatusValue",
          "filterFieldValue":"",
          "filterFieldName":"prtyRleStsTyp"
       },
       "portalName":"Customer Portal",
       "isStateEnabled":true,
       "header":{
          
       },
       "databaseId":"localhost-orcl-C360_ORS",
       "navigationType":""
    },
};

const dbData = [
    {
       "databaseId": "localhost-orcl-C360_ORS",
       "label": "c360_ors"
    }
];

const entityData = {
    "item": [
       {
          "object": {
             "name": "Household",
             "label": "Household",
          }
       },
       {
          "object": {
             "name": "CustomerOrg",
             "label": "Organization",
          }
       },
       {
          "object": {
             "name": "Campaign",
             "label": "Campaign",
          }
       },
       {
          "object": {
             "name": "TimePeriod",
             "label": "Time Period",
          }
       },
       {
          "object": {
             "name": "Contact",
             "label": "Related Person",
          }
       }
    ]
};

const sourceSystemData = {
    sourceSystems: [
        {
            "name": "DNB"
        },
        {
            "name": "Lookup"
        },
        {
            "name": "Portal"
        },
        {
            "name": "Admin"
        }
    ]
};

const lookupData = {
    "item": [
        {
            "object": {
                "field": [
                    {
                        "name": "roleCode",
                        "label": "Role Code",
                    },
                    {
                        "name": "roleDesc",
                        "label": "Role Desc",
                    },
                    {
                        "name": "consolidationInd",
                        "label": "Consolidation Ind",
                        "system": true,
                    },
                ],
                "name": "LookupPortalUserRole",
                "label": "Lookup Portal User Role",
            }
        },
        {
            "object": {
                "field": [
                    {
                        "name": "prtyRleStsValDesc",
                        "label": "Party Role Status Value Desc",
                    },
                    {
                        "name": "prtyRleStsVal",
                        "label": "Party Role Status Value",
                    },
                    {
                        "name": "prtyRleStsTyp",
                        "label": "Party Role Status Type",
                    },
                    {
                        "name": "consolidationInd",
                        "label": "Consolidation Ind",
                        "system": true,
                    },
                ],
                "name": "LookupPartyRoleStatusValue",
                "label": "Lookup Party Role Status Value",
            }
        },
    ]
};

export { portalConfigData, dbData, entityData, sourceSystemData, lookupData };