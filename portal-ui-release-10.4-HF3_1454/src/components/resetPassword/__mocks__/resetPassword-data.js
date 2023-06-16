const runtime_data = {
    "Password Section" : {
        passwordPolicy: {
            desc: "Password policy for the portal. The policy appears in the sign up page.",
            isMandatory: true,
            key: "passwordPolicy",
            label: "Password Policy",
            type: "String",
            value: "Valid passwords must be between 4 and 9 characters in length",

        },
        passwordResetLinkExpiry: {
            desc: "Time Period after which the password reset link must expire. Use the hh:mm:ss format.",
            isMandatory: true,
            key: "passwordResetLinkExpiry",
            label: "Password Reset Link Expiry Time",
            value: "1:0:0"
        }
    }
};

const match = {
    params: {
        id: '1',
        orsId: 'orcl-localhost-Supplier'
    }
};

export {runtime_data, match};