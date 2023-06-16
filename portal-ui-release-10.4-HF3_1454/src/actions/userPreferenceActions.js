import { UPDATE_USER_PREFERENCE, REMOVE_USER_PREFERENCE } from './types';

export const useUserPreferenceActions = (state, dispatch) => {

    const updateUserPreference = userPreferences => {

        dispatch({
            type: UPDATE_USER_PREFERENCE,
            payload: userPreferences
        });
    };

    const removeUserPreference = () => {

        dispatch({
            type: REMOVE_USER_PREFERENCE
        });
    };

    return {
        updateUserPreference, removeUserPreference
    };
};