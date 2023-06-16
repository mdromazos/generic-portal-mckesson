import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { StateProvider } from "./context/stateContext";
import App from './App';
import './i18n/index';
import * as serviceWorker from './serviceWorker';
import './index.css';
import GlobalLoader from './utils/GlobalLoader';

ReactDOM.render(
        <StateProvider>
            <BrowserRouter basename={process.env.REACT_APP_ROUTER_BASE || ''}>
                <>
                    <GlobalLoader />
                    <App />
                </>
            </BrowserRouter>
        </StateProvider>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
