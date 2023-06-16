import { ADD_APP_NOTIFICATION, REMOVE_APP_NOTIFICATION, CANCEL_EDIT } from './types';

export const useNotificationActions = (state, dispatch) => {

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        })
    };

    const removeAppNotification = () => {
        dispatch({
            type: REMOVE_APP_NOTIFICATION
        })
    }; 

    const editStatusAction = (editStatus, id, visible = false, type = null) => {
        dispatch({
            type: CANCEL_EDIT,
            status: {
                edit: editStatus,
                display: visible,
                nextPageID: id,
                linkType: type
            }
        })
    }

    return {
        dispatchAppNotification,
        removeAppNotification,
        editStatusAction
    }
};