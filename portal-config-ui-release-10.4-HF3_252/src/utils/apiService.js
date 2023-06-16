import {axiosInstance} from "./Interceptors";
import CONFIG from "../config/config";
import { URLMap } from '../utils/urlMappings';
import { getDefaultHeaders } from '../utils/utilityService';

const APIService = {

    getRequestHeader: (customHeader) => {
        let defaultHeader = getDefaultHeaders();
        defaultHeader.headers = { ...defaultHeader.headers, ...customHeader };
        return defaultHeader;
    },

    redirectToLoginPage: () => {
        window.location = URLMap.getLoginPage();
    },

    isAuthorizationError: (error) => {

        let authError = false;
        //Instead of checking for response status, we can rely on the error codes generated at the backend once it is avalable
        if (error.response && error.response.status === CONFIG.CONSTANTS.AUTHORIZATION_ERROR_STATUS) {
            APIService.redirectToLoginPage();
            authError = true;
        }
        return authError;
    },

    getRequest: (url, successCallback, failureCallback, headers = {},responseTypeObj) => {
        let headerObj={"headers":headers};

        axiosInstance.get(url, { ...responseTypeObj, ...headerObj })
            .then(resp => {
                successCallback(resp.data);
            })
            .catch(err => {
                if (!APIService.isAuthorizationError(err)) {
                    failureCallback(err);
                }
            });
    },

    postRequest: (url, data, successCallback, failureCallback, customHeader = {}) => {

        axiosInstance.post(url, data, APIService.getRequestHeader(customHeader))
            .then(resp => {
                successCallback(resp.data);
            })
            .catch(err => {
                if (!APIService.isAuthorizationError(err)) {
                    failureCallback(err);
                }
            });
    },

    putRequest: (url, data, successCallback, failureCallback, customHeader = {}) => {

        axiosInstance.put(url, data, APIService.getRequestHeader(customHeader))
            .then(resp => {
                successCallback(resp.data);
            })
            .catch(err => {
                if (!APIService.isAuthorizationError(err)) {
                    failureCallback(err);
                }
            });
    },

    patchRequest: (url, data, successCallback, failureCallback, customHeader = {}) => {

        axiosInstance.patch(url, data, APIService.getRequestHeader(customHeader))
            .then(resp => {
                successCallback(resp.data);
            })
            .catch(err => {
                if (!APIService.isAuthorizationError(err)) {
                    failureCallback(err);
                }
            });
    },

    deleteRequest: (url, successCallback, failureCallback, headers = {}) => {

        axiosInstance.delete(url, { "headers": headers })
            .then(resp => {
                successCallback(resp.data);
            })
            .catch(err => {
                if (!APIService.isAuthorizationError(err)) {
                    failureCallback(err);
                }
            });
    }

}

export default APIService;
