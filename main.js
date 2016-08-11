/* global document */
// main.js

import store from './store.js';
import ErrorsBrowser from './errors-browser.jsx';

import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';

render(
    <Provider store={ store }>
        <div>
            <ErrorsBrowser />
        </div>
    </Provider>,
    document.querySelector('#app')
);

