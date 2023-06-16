import React, { useContext } from "react";
import { IconButton, Menu, Tooltip } from "@informatica/droplets-core";
import "@informatica/archipelago-icons/dist/archipelago_icons.css";
import APIService from "../../../utils/apiService";
import { URLMap } from "../../../utils/urlMappings";
import { APIMap } from "../../../utils/apiMappings";
import CONFIG from "../../../config/config";
import { useTranslation } from "react-i18next";
import { StateContext } from "../../../context/stateContext";
import "../index.css";
import { getCookie, deleteCookie } from "../../../utils/utilityService";

const User = () => {

    const { dispatch } = useContext(StateContext);
    const { ACTIONS, NOTIFICATION_TYPE, USERNAME } = CONFIG;
    const { t: translate } = useTranslation();

    const dispatchAppNotification = (message, notificationType) => {
        dispatch({
            type: ACTIONS.ADD_APP_NOTIFICATION,
            notificationConfig: {
                type: notificationType,
                message: message,
            },
        });
    };

    const handleLogout = () => {
        APIService.putRequest(
            APIMap.LOGOUT,
            {},
            () => {
                deleteCookie(USERNAME);
                window.location = URLMap.getLoginPage();
            },
            ({response:{data:{errorCode}}}) => {
                if (errorCode) {
                    dispatchAppNotification(translate(errorCode), NOTIFICATION_TYPE.ERROR);
                } else {
                    dispatchAppNotification(translate('ERROR_GENERIC_MESSAGE'), NOTIFICATION_TYPE.ERROR);
                }
            }
        );
    };

    let userName = getCookie(USERNAME);

    return <Menu
        trigger = {
            <IconButton
                data-testid="user-menu-button"
                className="button button__icon portal-header-user-icon">
                <Tooltip content={userName}>
                    <i className="aicon aicon__user user-icon" />
                </Tooltip>
            </IconButton>
        }
    >
        <Menu.Item disabled className="user__info__menu user_name">{userName}</Menu.Item>
        <Menu.Separator />
        <Menu.Item data-testid="logout" onClick={handleLogout} >{translate("LABEL_LOG_OUT")}</Menu.Item>
    </Menu>;
};
export default User;
