import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { StateProvider } from "./context/stateContext";
import './index.css';
import './i18n/index';
import "typeface-roboto";
import GlobalLoader from './utils/GlobalLoader';

ReactDOM.render(
    <StateProvider>
        <Router basename={process.env.REACT_APP_ROUTER_BASE || ''}>
            <>
                <GlobalLoader />
                <App />
            </>
        </Router>
    </StateProvider>,
    document.getElementById('root')
);


