import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LoginPage from './components/login/index';
import Shell from './components/shell/index';
import ErrorPage from './components/errorPage/index';
import SignUpPage from './components/signUp/index';
import ForgotPasswordView from './components/forgotPassword';
import ResetPasswordView from "./components/resetPassword";
import ChangePassword from "./components/changePassword";

const App = () => {

    const Default = () => <h3>Not a valid portal page</h3>;

    const renderSignUpComponent = props => {
        if (props.history.action === "POP") {
            if(props.history.location.state){
                delete props.history.location.state
            }
            return <SignUpPage {...props} />;
        } else {
            return <SignUpPage {...props} />;
        }
    };
    
    const renderLoginComponent = props => {
        if (props.history.action === "POP") {
            if(props.history.location.state){
               delete props.history.location.state
            }
            return <LoginPage {...props} />; 
        } else{
            return <LoginPage {...props} />;
        }
    };

    return (
        <Switch>
            <Route path="/:id/:orsId" component={LoginPage} exact />
            <Route path="/:id/:orsId/forgotPassword" component={ForgotPasswordView} exact />
            <Route path="/:id/:orsId/:resetPassword(resetPassword|resetPasswordNewUser)" component={ResetPasswordView} exact />
            <Route path="/:id/:orsId/login" render={props => renderLoginComponent(props)} exact />
            <Route path="/:id/:orsId/shell" component={Shell} exact />
            <Route path="/:id/:orsId/signup" render={props => renderSignUpComponent(props)} exact />
            <Route path="/:id/:orsId/shell/:pageId" component={Shell} />
            <Route path="/:id/:orsId/shell/:changePassword" component={ChangePassword} exact />
            <Route path="/:id/:orsId/shell/users" component={Shell} exact/>
            <Route path="/:id/:orsId/error" component={ErrorPage} exact/>
            <Route component={Default} />
        </Switch>
    );
};
export default App;
