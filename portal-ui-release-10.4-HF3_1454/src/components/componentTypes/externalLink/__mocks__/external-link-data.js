const component_data = {
    componentType: "ExternalLink",
    customHeight: "200",
    displayHeight: "CUSTOM",
    title: "External Links",
    url: "http://localhost:8080/portal-config/portals?params=beName,rowId"
};

const match = {
    isExact: true,
    params: {
        id: "2", 
        orsId: "localhost-orcl-SUPPLIER_ORS", 
        pageId: "160011"
    },
    path: "/:id/:orsId/shell/:pageId",
    url: "/2/localhost-orcl-SUPPLIER_ORS/shell/160011"
};

const beData = {
    link:[
       {
          href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5?readSystemFields=true",
          rel:"self"
       },
       {
          href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5?depth=2&readSystemFields=true",
          rel:"children"
       },
       {
          href:"http://localhost:8080/cmx/file/localhost-orcl-SUPPLIER_ORS/IMAGE/Supplier.svg/content",
          rel:"icon"
       }
    ],
    rowidObject:"5             ",
    creator:"admin",
    createDate:"2020-08-20T19:42:19.464+05:30",
    updatedBy:"avos/admin",
    lastUpdateDate:"2020-08-20T19:50:37.505+05:30",
    consolidationInd:4,
    lastRowidSystem:"PORTAL        ",
    interactionId:"2022000",
    hubStateInd:1,
    effectivePeriod:{
       
    },
    label:"Supplier sosrivastava",
    fullNm:"sosrivastava",
    prtyBoClassCd:"Organization",
    draftInd:"N",
    countryOfIncorporation:{
       link:[
          {
             href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5?readSystemFields=true",
             rel:"parent"
          },
          {
             href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5/countryOfIncorporation?readSystemFields=true",
             rel:"self"
          },
          {
             href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5/countryOfIncorporation?depth=2&readSystemFields=true",
             rel:"children"
          }
       ],
       countryCode:"US"
    },
    portalAssc:{
       link:[
          {
             href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5?readSystemFields=true",
             rel:"parent"
          },
          {
             href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5/portalAssc?readSystemFields=true",
             rel:"self"
          },
          {
             href:"http://localhost:8080/cmx/cs/localhost-orcl-SUPPLIER_ORS/Supplier/5/portalAssc?depth=2&readSystemFields=true",
             rel:"children"
          }
       ],
       portalId:"2"
    }
 }
export { component_data, match, beData};