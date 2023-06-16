import React from "react";
import { Route, Switch } from "react-router-dom";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import PortalSettings from "../../components/portals/portalView/portalSettings";
import PortalsView from "../../components/portals/portalsView";
import PortalView from "../../components/portals/portalView";
import PageView from "../../components/portalPages/pageView";
import RuntimeConfig from "../../components/portals/runtimeConfig";
import SSOConfiguration from "../../components/portals/ssoConfig"
import { URLMap } from '../../utils/urlMappings';

const renderComponent = props => {
    if (props.history.action === "POP") {
            props.history.push(URLMap.portals());
    } else {
        if (props.match.path === "/portals/:databaseId/:portalId/page/new" 
            || props.match.path === "/portals/:databaseId/:portalId/page/:pageId")
            return <PageView {...props} />;
        if (props.match.path === "/portals/:databaseId/:portalId")
            return <PortalView {...props} />;
        if (props.match.path === "/portals/:databaseId/:portalId/runtime")
            return <RuntimeConfig {...props}/>;
        if (props.match.path === "/portals/:databaseId/:portalId/general")
            return <PortalSettings isEdit={true} history={props.history} />;
        if (props.match.path === "/portals/:databaseId/:portalId/sso")
            return <SSOConfiguration {...props}/>;            
    }
};

const Workspace = () => {
    return (
        <Switch>
            <Route path="/portals" component={PortalsView} exact />
            <Route key="{Math.random()*(1000-1)}" path="/portals/new" render={props => <PortalSettings history={props.history} />} exact/>
            <Route path="/portals/:databaseId/:portalId" render={props => renderComponent(props)} exact />
            <Route path="/portals/:databaseId/:portalId/general" render={props => renderComponent(props)} exact />
            <Route path="/portals/:databaseId/:portalId/page/new" render={props => renderComponent(props)} exact />
            <Route path="/portals/:databaseId/:portalId/page/:pageId" render={props => renderComponent(props)} exact />
            <Route path="/portals/:databaseId/:portalId/runtime" render={props => renderComponent(props)} exact />
            <Route path="/portals/:databaseId/:portalId/sso" render={props => renderComponent(props)} exact />
        </Switch>
    );
};
export default Workspace;
