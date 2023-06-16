import { SET_PORTAL_PAGES } from './types'

export const usePageActions = (state, dispatch) => {
    const setPortalPages = pagesConfiguration => {
        dispatch({
            type: SET_PORTAL_PAGES,
            payload: pagesConfiguration
        })
    };

    return {
        setPortalPages
    }
};