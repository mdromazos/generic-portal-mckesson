const portals = [
    {
       createdBy:"admin",
       lastUpdatedDate:"22 Apr 2021 20:07:44",
       lastUpdatedBy:"admin",
       portalId:40040,
       createdDate:"22 Apr 2021 20:07:30",
       version:"2",
       portalName:"NEWEEWWWW",
       databaseId:"localhost-orcl-C360_ORS",
       isDraft:true,
       hasPublished:false,
       status:"Stopped"
    },
    {
       createdBy:"admin",
       lastUpdatedDate:"22 Apr 2021 20:03:06",
       lastUpdatedBy:"admin",
       portalId:2,
       createdDate:"08 Apr 2021 16:43:31",
       version:"24",
       portalName:"Customer Portal",
       databaseId:"localhost-orcl-C360_ORS",
       isDraft:true,
       hasPublished:true,
       status:"Running"
    },
    {
       createdBy:"admin",
       lastUpdatedDate:"22 Apr 2021 20:01:41",
       lastUpdatedBy:"admin",
       portalId:20019,
       createdDate:"20 Apr 2021 12:24:20",
       version:"8",
       portalName:"qew",
       databaseId:"localhost-orcl-C360_ORS",
       isDraft:true,
       hasPublished:true,
       status:"Stopped"
    },
    {
       createdBy:"admin",
       lastUpdatedDate:"20 Apr 2021 10:29:43",
       lastUpdatedBy:"admin",
       portalId:40033,
       createdDate:"19 Apr 2021 20:36:48",
       version:"7",
       portalName:"weq",
       status:"Stopped",
       databaseId:"localhost-orcl-C360_ORS",
       isDraft:false,
       hasPublished:true
    },
    {
       createdBy:"admin",
       lastUpdatedDate:"19 Apr 2021 21:10:30",
       lastUpdatedBy:"admin",
       portalId:40034,
       createdDate:"19 Apr 2021 21:10:30",
       version:"3",
       portalName:"wqeqwe",
       status:"Stopped",
       databaseId:"localhost-orcl-C360_ORS",
       isDraft:false,
       hasPublished:true
    }
 ];

 const databases = [
     {
        databaseId: "localhost-orcl-C360_ORS",
        label: "c360_ors",
     }
 ];

 const sourceSystems = {
    totalCount:4,
    firstRecord:1,
    pageSize:4,
    sourceSystems:[
       {
          name:"DNB"
       },
       {
          name:"Lookup"
       },
       {
          name:"Portal"
       },
       {
          name:"Admin"
       }
    ]
 }


 export { portals, databases, sourceSystems }