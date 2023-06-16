import { SET_RUNTIME_CONFIGURATION } from "./types";

export const useRuntimeConfigActions = (state, dispatch) => {

  const setRuntimeConfigurationAction = runtimeConfiguration => {
    
    dispatch({
      type: SET_RUNTIME_CONFIGURATION,
      payload: runtimeConfiguration
    });
  };

  return {
    setRuntimeConfigurationAction
  };
};
