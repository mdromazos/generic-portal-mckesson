import {axiosInstance} from "./Interceptors";

const APIService = {
    getDefaultHeader: () => {
        return {
            "Content-Type": "application/json"
        };
    },
    getRequest: (url, successCallback, failureCallback, headers = {}) => {
        axiosInstance.get(url, headers)
        .then(resp => {
            successCallback(resp.data);
        })
        .catch(err => {
            failureCallback(err);
        });
    },
    postRequest: (url, data, successCallback, failureCallback, headers = {}, params) => {

        const defaultHeaders = APIService.getDefaultHeader();
        const reqHeaders = { ...defaultHeaders, ...headers };
        
        axiosInstance.post(url, data, { headers: reqHeaders, params: params })
            .then(resp => {
                successCallback(resp.data, resp);
            })
            .catch(err => {
                failureCallback(err);
            });
    },
    putRequest: (url, data, successCallback, failureCallback, headers = {}) => {

        const defaultHeaders = APIService.getDefaultHeader();
        const reqHeaders = { ...defaultHeaders, ...headers };

        axiosInstance.put(url, data, { headers: reqHeaders })
            .then(resp => {
                successCallback(resp.data);
            })
            .catch(err => {
                failureCallback(err);
            });
    },
    deleteRequest: (url,data,successCallback, failureCallback, headers = {}) => {
        const defaultHeaders = APIService.getDefaultHeader();
        const reqHeaders = { ...defaultHeaders, ...headers };

        axiosInstance.delete(url, { data: data , "headers": reqHeaders})
        .then(resp => {
            successCallback(resp.data);
        })
        .catch(err => {
            failureCallback(err);
        });
    }
};

export default APIService;