const runtimeConfiguration = [
    {
        name: "Session Section",
        desc: "Session Settings",
        label: "Session Settings",
        configuration: [
        {
            key: "session.timeout",
            desc: "Number of minutes to wait before an idle session times out.",
            label: "Session Timeout Interval",
            value: 420,
            type: "Integer",
            isMandatory: true
        },
        {
            key: "session.timeout.warning",
            desc: "Number of minutes before a session times out you want to display a warning message.",
            label: "Session Timeout Warning Time",
            value: 60,
            type: "Integer",
            isMandatory: true
        }
      ]
    },
    {
        name: "Password Section",
        desc: "Password Settings",
        label: "Password Settings",
        configuration: [
        {
            key: "passwordResetLinkExpiry",
            desc: "Time Period after which the password reset link must expire. Use the hh:mm:ss format.",
            label: "Password Reset Link Expiry Time",
            value: "1:0:0",
            type: "String",
            isMandatory: true
        },
        {
            key: "passwordPolicy",
            desc: "Password policy for the portal. The policy appears in the sign up page.",
            label: "Password Policy",
            value: "Valid passwords must be between 4 and 9 characters in length",
            type: "String",
            isMandatory: true
        }
      ]
    },
    {
        name: "Portal Administrator User",
        desc: "Portal Administrator User",
        label: "Portal Administrator User",
        configuration: [
        {
            key: "username",
            desc: "User name with administrative privileges to access the portal.",
            label: "Username",
            value: "admin",
            type: "String",
            isMandatory: true
        }
      ]
    }
];

const runtimeConfigurationWithoutPasswordSection = [
    {
        name: "Session Section",
        desc: "Session Settings",
        label: "Session Settings",
        configuration: [
        {
            key: "session.timeout",
            desc: "Number of minutes to wait before an idle session times out.",
            label: "Session Timeout Interval",
            value: 420,
            type: "Integer",
            isMandatory: true
        },
        {
            key: "session.timeout.warning",
            desc: "Number of minutes before a session times out you want to display a warning message.",
            label: "Session Timeout Warning Time",
            value: 60,
            type: "Integer",
            isMandatory: true
        }
      ]
    },
    {
        name: "Portal Administrator User",
        desc: "Portal Administrator User",
        label: "Portal Administrator User",
        configuration: [
        {
            key: "username",
            desc: "User name with administrative privileges to access the portal.",
            label: "Username",
            value: "admin",
            type: "String",
            isMandatory: true
        }
      ]
    }
];


const match = {
    params: {
        databaseId: 'localhost-orcl-C360_ORS',
        portalId: 2
    }
};

export { runtimeConfiguration, match, runtimeConfigurationWithoutPasswordSection };