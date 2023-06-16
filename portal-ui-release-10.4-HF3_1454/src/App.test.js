import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { StateProvider } from "./context/stateContext";

jest.mock('./components/login/index', () => () => 'login')
jest.mock('./components/shell/index', () => () => 'shell');
jest.mock('./components/errorPage/index', () => () => 'errorPage');
jest.mock('./components/signUp/index', () => () => 'signUp');
jest.mock('./components/forgotPassword', () => () => 'forgotPassword');
jest.mock("./components/resetPassword", () => () => 'resetPassword');
jest.mock("./components/changePassword", () => () => 'changePassword');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
      <StateProvider>
        <Router>
          <App />
        </Router>
      </StateProvider>, div);
  ReactDOM.unmountComponentAtNode(div);
});