import React, { useContext, useEffect,useState} from 'react';
import { StateContext } from '../../../context/stateContext';
import { Menu, IconButton} from '@informatica/droplets-core';
import {Link} from 'react-router-dom';
import { URLMap } from '../../../utils/urlMappings';
import APIService from '../../../utils/apiService';
import CONFIG from './../../../config/config';
import { useTranslation } from "react-i18next";
import '@informatica/archipelago-icons/dist/archipelago_icons.css';
import '@informatica/droplets-core/dist/themes/archipelago/components/menu.css';
import './index.css';

const PortalHeader = ({ match, history }) => {

    const [{    
        globalSettings: { header, portalTitle, isExternalUserManagementEnabled },
        notificationActions : {dispatchAppNotification, editStatusAction},
        confirmDialog:{ editStatus, type},
        userPreferenceActions : { removeUserPreference }
    }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    const { CONSTANTS, SESSION_POLICY: { SESSION_TIMEOUT_VALUE, SESSION_TIMEOUT_WARNING_VALUE },LOG_OUT,CHANGE_PASSWORD} = CONFIG;
    const [changePasswordVisible, setChangePasswordVisible] = useState(true);

    useEffect(()=>{
        if(!editStatus && type === LOG_OUT) {
            logOut();
        }
    },[!editStatus, type]);

    const logOut = () => {
        const successCallback = (response) => {
            localStorage.removeItem(SESSION_TIMEOUT_VALUE +"_"+ match.params.id);
            localStorage.removeItem(SESSION_TIMEOUT_WARNING_VALUE+"_"+ match.params.id);
            removeUserPreference();
            editStatusAction(false, null, false, null);
            if(response && response.samlLogoutURL) {
                window.location.href = response.samlLogoutURL;
            } else {
                history.push(`/${match.params.id}/${match.params.orsId}/login`);
            }
        };

        const failureCallback = ({response:{data:{errorCode}}}) => {
            if (errorCode) {
                dispatchAppNotification(translate(errorCode), CONSTANTS.NOTIFICATION_ERROR);
            }
            else {
                dispatchAppNotification(translate('GENERIC__ERROR__MESSAGE'), CONSTANTS.NOTIFICATION_ERROR);
            }
        };

        APIService.putRequest(
            URLMap.postLogout(match.params.id),
            {},
            successCallback,
            failureCallback,
            { [CONFIG.PORTAL_ID_HEADER]: match.params.id, [CONFIG.ORS_ID]: match.params.orsId }
        );
    }

    function handleLogout(event, clickEventType){
        const editDialogStatus = checkForEdit(event,`#`, clickEventType);
        if(editDialogStatus){
            logOut();
        } 
    };

    let username= decodeURIComponent(document.cookie.match(/username=([^;]*)/) ? document.cookie.match(/username=([^;]*)/)[1] : "" );

    function checkForEdit(event, pageID, linkType){
        if(editStatus){
            event.preventDefault();
            editStatusAction(true, pageID, true, linkType);
            return false;
        }
        return true;
    }

    const checkChangePasswordVisibility = () => {
        if (match.params.pageId === CHANGE_PASSWORD) {
            setChangePasswordVisible(false);
        }
        else {
            setChangePasswordVisible(true);
        }
    }

    return (
        <>
            {
                !header.logo && <div className="portal__header" data-testid="portal_header_logo"></div> 
            }
            {
                header.logo && <div className="portal__header" style={{ backgroundColor: header.backgroundColor }}>
                    <div className="portal__header__outer__image" data-testid="portal_header_logo_image">
                        <img alt={translate('LABEL_COMPANY_LOGO')} className="portal__header__logo" src={header.logo}/>
                    </div>
                    <span className="portal__header__name" style={{ color: header.fontColor }} data-testid="portal__header__title">
                        { portalTitle }
                    </span>
                    <div className="profile__section">
                        <div className="user__icon__div">
                            <Menu 
                                trigger={
                                    <IconButton className="button button__icon portal__header__user__icon"
                                        style={{ color: header.fontColor }} data-testid="portal__header__menu"
                                    >
                                        <i className="aicon aicon__user user-icon" />
                                    </IconButton>
                                }
                                onOpen={() => {
                                    checkChangePasswordVisibility()
                                }}
                            >
                                <Menu.Item disabled data-testid="header__menu__item">
                                    {username}
                                </Menu.Item>
                                <Menu.Separator />
                                {changePasswordVisible && !isExternalUserManagementEnabled &&
                                    <Menu.Item data-testid="header__menu__item">
                                        <Link to={`/${match.params.id}/${match.params.orsId}/shell/changePassword`}
                                            onClick={(event) => checkForEdit(event, `/${match.params.id}/${match.params.orsId}/shell/changePassword`)}
                                            className="change__password">{translate("CHANGE_PASSWORD")}
                                        </Link>
                                    </Menu.Item>}
                                <Menu.Item data-testid="header__menu__item" onClick={(event) => handleLogout(event, LOG_OUT)}>{translate("LOG_OUT")}</Menu.Item>
                            </Menu>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default PortalHeader;