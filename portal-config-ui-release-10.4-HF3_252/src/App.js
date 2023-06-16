import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import LoginPage from "./pages/login";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import ShellPage from "./pages/shell";

const App = () => {

    const productTitle = "Informatica MDM Portal";

    useEffect(() => {
        document.title = productTitle;
    });

    return (
        <Switch>
            <Route path="/" component={LoginPage} exact />
            <Route path="/portals" component={ShellPage} />
            <Route component={PageNotFound} />
        </Switch>
    )
};

const PageNotFound = (props) => (<h1>404 Page Not Found - {props.location.pathname}</h1>);
export default App;
