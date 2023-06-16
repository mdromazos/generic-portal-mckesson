import axios from "axios";
import {useState,useCallback,useEffect,useMemo} from "react";
const axiosInstance = axios.create();

const useAxiosLoader = (props) => {
    const [apiCounter, setAPICounter] = useState(0);
  
    const apiCounterIncrement = useCallback(() => setAPICounter(apiCounter => apiCounter + 1), [
      setAPICounter
    ]); // add to counter
    const apiCounterDecrement = useCallback(() => setAPICounter(apiCounter => apiCounter - 1), [
      setAPICounter
    ]); // remove from counter
  
    const interceptors = useMemo(
      () => ({
        request: config => {
          apiCounterIncrement();
          return config;
        },
        response: response => {
          apiCounterDecrement();
          return response;
        },
        error: error => {
          apiCounterDecrement();
          return Promise.reject(error);
        }
      }),
      [apiCounterIncrement, apiCounterDecrement]
    ); // create the interceptors
  
    useEffect(() => {
      // add request interceptors
      axiosInstance.interceptors.request.use(interceptors.request, interceptors.error);
      // add response interceptors
      axiosInstance.interceptors.response.use(interceptors.response, interceptors.error);
      return () => {
        // remove all intercepts when done
        axiosInstance.interceptors.request.eject(interceptors.request);
        axiosInstance.interceptors.request.eject(interceptors.error);
        axiosInstance.interceptors.response.eject(interceptors.response);
        axiosInstance.interceptors.response.eject(interceptors.error);
      };
    }, [interceptors]);
  
    return [apiCounter > 0];
  };

  export  {axiosInstance, useAxiosLoader};