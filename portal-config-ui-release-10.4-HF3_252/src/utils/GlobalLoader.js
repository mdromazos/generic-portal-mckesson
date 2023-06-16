import React from "react";
import { Loader } from '@informatica/droplets-core';
import '@informatica/droplets-core/dist/themes/archipelago/components/loader.css';
import {useAxiosLoader} from "./Interceptors";

const GlobalLoader = () => {
  const [loading] = useAxiosLoader();
  return <>
            {
                loading ? <Loader darken /> : null
            }
        </>;
};

export default GlobalLoader;