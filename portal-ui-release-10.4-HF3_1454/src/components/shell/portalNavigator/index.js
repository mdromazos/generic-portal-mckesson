import React, { useContext,useEffect, useState} from 'react';
import { StateContext } from '../../../context/stateContext';
import { Link } from "react-router-dom";
import CONFIG from '../../../config/config';
import './index.css';
import { useTranslation } from "react-i18next";
import { getCookie } from "../../../common/helperUtils";

const PortalNavigator = ({match}) => {

    const [{ globalSettings, pageMetadata: { pages },
             notificationActions : { editStatusAction }, confirmDialog:{ editStatus } }] = useContext(StateContext);
    const { t: translate } = useTranslation();
    let existingURL = match.url.split('/');
    existingURL.pop();
    let newURL = existingURL.join('/');
    const { USER_ROLE, PORTAL_STATE} = CONFIG;
    const [userAuth, setUserAuth] = useState(false);
    const loggedInUserRole = getCookie(USER_ROLE);
    const loggedInUserState = getCookie(PORTAL_STATE);
    if (!newURL.includes('shell')) {
            newURL = `${newURL}/shell`;
    }

    const getUserAuth = (userManagement,isStateEnabled) => {
        let userRole = [...userManagement.userRoles];
        let userState = isStateEnabled ? [...userManagement.userStates] : [];
        let userAuthCookieValue;
        if (isStateEnabled) {
            if (userRole.indexOf(loggedInUserRole) === -1 || userState.indexOf(loggedInUserState) === -1) {
                setUserAuth(false);
                userAuthCookieValue=false;
            }
            else{
                setUserAuth(true);
                userAuthCookieValue=true;
            }
        }
        else {
            if (userRole.indexOf(loggedInUserRole) === -1) {
                setUserAuth(false);
                userAuthCookieValue = false;
            }
            else{
                setUserAuth(true);
                userAuthCookieValue = true;
            }
        }
        document.cookie = `userAuth=${userAuthCookieValue}`;

    }

    const checkForEdit = (event, id) => {
        if(editStatus){
            event.preventDefault();
             if(event.target.className !== CONFIG.SIDENAV_ACTIVE && event.target.parentNode.className !== CONFIG.SIDENAV_ACTIVE){
                editStatusAction(true, id, true);
             }
             return false;
        }
        return true;
     }

     useEffect(() => {
        if (globalSettings.userManagement && globalSettings.userManagement.createAdditionalUsers) {
            getUserAuth(globalSettings.userManagement, globalSettings.isStateEnabled);
        }
     }, [globalSettings.userManagement, globalSettings.isStateEnabled]);

     return (
        <div className="portal-navigator" data-testid="portal-navigator">
            {
                pages &&  pages.map(page => {
                    
                    return (
                        <Link to={`${newURL}/${page.id}`} key={page.id} onClick={(e)=>checkForEdit(e, `${newURL}/${page.id}`)} className={page.id === match.params.pageId ? 'selected' : ''}>
                            <span data-testid="portal__nav__tab">{page.name}</span>
                        </Link>
                    );
                })
            }

            {userAuth && globalSettings.userManagement && globalSettings.userManagement.createAdditionalUsers &&
                < Link to={`${newURL}/users`} onClick={(e)=>checkForEdit(e, `${newURL}/users`)} key="user" 
                    className={CONFIG.USER_MANAGEMENT_PATH=== match.params.pageId ? 'selected' : ''}
                >
                    <span data-testid="portal__nav__tab">{translate("LABEL_USER_MANAGEMENT")}</span>
                </Link>
            }
        </div>
    );
};
export default PortalNavigator;
