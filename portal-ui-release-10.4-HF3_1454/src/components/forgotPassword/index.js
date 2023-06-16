import React, { useContext, useEffect } from "react";
import { StateContext } from "../../context/stateContext";
import ForgotPassword from "./ForgotPassword";
import CONFIG from "./../../config/config";
import APIService from "../../utils/apiService";
import { URLMap } from "../../utils/urlMappings";
import { MessageBubble } from "@informatica/droplets-core";
import { useTranslation } from "react-i18next";
import PageNotFound from "../pageNotFound";

const ForgotPasswordView = ({ match, history }) => {
  const [
    {
      globalSettings: { loadPortalConfig, header, login, portalTitle, isExternalUserManagementEnabled },
      globalActions: { setPortalConfiguration },
      runtimeConfigurationActions: { setRuntimeConfigurationAction },
      notificationActions: { removeAppNotification },
      appNotification
    }
  ] = useContext(StateContext);
  const { t: translate } = useTranslation();
  const { CONSTANTS: { NOTIFICATION_TIMEOUT } } = CONFIG;
  useEffect(() => {
    loadPortalConfiguration(match);
    validateSession(match, history);
    fetchRuntimeConfigurationData();
  }, []);

  const loadPortalConfiguration = match => {
    if (loadPortalConfig) {
      const successCallback = response => {
        let portalConfig = JSON.parse(JSON.stringify(response));
        portalConfig.loadPortalConfig = false;
        setPortalConfiguration(portalConfig);
      };
      APIService.getRequest(
        URLMap.getPortalData(match.params.id),
        successCallback,
        error => {
          console.log(error);
        },
        URLMap.generateHeader(match.params.orsId, match.params.id)
      );
    }
  };

  const fetchRuntimeConfigurationData = () => {
    const successCallback = resp => {
      setRuntimeConfigurationAction(resp);
    };
    const failureCallback = error => {};
    APIService.getRequest(
      URLMap.getRuntimeConfigurationData(match.params.id),
      successCallback,
      failureCallback,
      URLMap.generateHeader(match.params.orsId)
    );
  };

  const validateSession = (match, history) => {
    let successCallback = () => {
      console.log("SESSION :: VALID");
      history.push(`/${match.params.id}/${match.params.orsId}/shell`);
    };
    let failureCallback = () => {
      console.log("SESSION :: INVALID");
    };
    APIService.getRequest(
      URLMap.getSessionValidate(match.params.id),
      successCallback,
      failureCallback,
      URLMap.generateHeader(match.params.orsId, match.params.id)
    );
  };

    return (
        <>
            {!isExternalUserManagementEnabled && header.logo 
              ? <div className="login__page"
                      style={{ backgroundImage: 'url("' + login.backgroundImage + '")' }}>
                      <div className="login__box">
                          {appNotification &&
                              <MessageBubble type={appNotification[0].type} 
                                  data-testid="message_bubble"
                                  timeout={NOTIFICATION_TIMEOUT}
                                  onClose={removeAppNotification} dismissible>
                                  {appNotification.map(notificationConfig => (
                                      <div data-testid="message_bubble_message">
                                          {notificationConfig.message}
                                      </div>
                                  ))}
                              </MessageBubble>
                          }
                          <div className="login__box__header">
                              <div className="login__header__div">
                                  <img alt={translate('LABEL_COMPANY_LOGO')} className="login__header__logo" src={header.logo} />
                              </div>
                              <div className="login__header__content" data-testid="portal_title">
                                  {portalTitle}
                              </div>
                          </div>
                          <div className="login__box__content">
                              <ForgotPassword match={match} history={history} />
                          </div>
                      </div>
                  </div>
              : <PageNotFound />
            }
        </>
    );
};
export default ForgotPasswordView;
