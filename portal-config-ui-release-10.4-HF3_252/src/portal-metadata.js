export const portalMetadataStore = {
    portalConfig: {
        portalName: "Supplier Portal",
        databaseId: "orcl.informatica.com-TSR_HUB",
        isStateEnabled: "true",
        navigationType: 0,
        header: {
            backgroundColor: "#000000",
            fontColor: "#FFFFFF",
            logo: 'https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg'
        },
        footer: {
            footerText: "Supplier 360. Powered by Informatica. All Rights Reserved. 2019",
            backgroundColor: "#000000",
            fontColor: "#FFFFFF"
        },
        signup: {
            backgroundImage: "https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg",
            welcomeText: "Supplier Portal",
            title: "Sign up to Supplier Portal",
            beViewName: "Supplier"
        },
        login: {
            backgroundImage: "https://www.supplychaindigital.com/sites/default/files/bizclik-drupal-prod/topic/image/warehouse.jpg",
            portalName: "Supplier Portal",
            title: "Login to Supplier Portal",
            isCaptchaEnabled: true
        }
    }
};
export const emptyPortalMetadataStore = {
    portalConfig: {
        header: { },
        footer: { },
        login: { }
    }
};
