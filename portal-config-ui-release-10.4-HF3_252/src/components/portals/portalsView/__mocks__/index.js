const dbData = [{
    databaseId: "orcl-CMX_ORS",
    label: "cmx_ors"
}];

const portalsData = [{
    portalId: 3,
    portalName: "portal 2",
    createdBy: "admin",
    createdDate: "08 Jul 2019 19:23:08",
    lastUpdatedBy: "admin",
    lastUpdatedDate: "08 Jul 2019 19:23:08",
    databaseId: "orcl-CMX_ORS",
    version: 1,
    status: "INVALID",
    isDraft: true,
    hasSSO: false,
    hasPublished: false,
}, {
    portalId: 8,
    portalName: "portal 3",
    createdBy: "admin",
    createdDate: "17 Jul 2019 17:29:03",
    lastUpdatedBy: "admin",
    lastUpdatedDate: "07 Aug 2019 14:38:26",
    databaseId: "orcl-CMX_ORS",
    version: 5,
    status: "STOPPED",
    isDraft: false,
    hasSSO: true,
    hasPublished: true,
}, {
    portalId: 7,
    portalName: "portal 1",
    createdBy: "admin",
    createdDate: "25 Jul 2019 11:10:42",
    lastUpdatedBy: "admin",
    lastUpdatedDate: "25 Jul 2019 11:10:42",
    databaseId: "orcl-CMX_ORS",
    version: 3,
    status: "RUNNING",
    isDraft: false,
    hasSSO: true,
    hasPublished: true,
}];

const portalConfigMap = {
    portalConfigMap: {
        "orcl-CMX_ORS__3": {
            isDraft: true,
            name: "portal 2",
            orsId: "orcl-CMX_ORS",
            version: 1
        },
        "orcl-CMX_ORS__7": {
            isDraft: false,
            name: "portal 1",
            orsId: "orcl-CMX_ORS",
            version: 3
        },
        "orcl-CMX_ORS__8": {
            isDraft: false,
            name: "portal 3",
            orsId: "orcl-CMX_ORS",
            version: 5
        }
    },
    portals: portalsData,
    type: "CREATE_PORTAL_CONFIG_MAP"
 };

export { portalsData, dbData, portalConfigMap };