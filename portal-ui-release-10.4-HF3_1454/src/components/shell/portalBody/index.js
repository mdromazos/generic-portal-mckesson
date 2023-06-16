import React, { useContext } from 'react';
import PortalWorkspace from '../portalWorkspace';
import PortalNavigator from '../portalNavigator';
import { MessageBubble } from "@informatica/droplets-core";
import {StateContext} from "../../../context/stateContext";
import CONFIG from '../../../config/config';
import './index.css';

const PortalBody = ({ match, history }) => {

    const [{
        notificationActions : {removeAppNotification},
        appNotification
    }] = useContext(StateContext);
    const { CONSTANTS } = CONFIG;

    return (
        <>
            {
                appNotification && <MessageBubble type={appNotification[0].type}
                    data-testid="message_bubble"
                    timeout={CONSTANTS.NOTIFICATION_TIMEOUT}
                    onClose={removeAppNotification} dismissible>
                    {
                        appNotification.map(notificationConfig => (
                            <div data-testid="message_bubble_message">
                                {notificationConfig.message}
                            </div>
                        ))
                    }
                </MessageBubble>
            }
            <PortalNavigator match={ match } />
            <div className="portal-main-body" data-testid="portal__body">
                <PortalWorkspace key={`matchPage-${match.params.pageId}`} match={match} history={history} />
            </div>
        </>
    );
};

export default PortalBody;