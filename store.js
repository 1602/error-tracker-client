'use strict';

import { createStore } from 'redux';
import reducers from './reducers';

let savedState;

try {
    savedState = JSON.parse(localStorage.state);
} catch (e) {
    console.log('No saved state');
}

const store = createStore(reducers, savedState);

store.subscribe(() => {
    const state = store.getState();
    const { errors } = state;
    localStorage.state = JSON.stringify({
        ...state,
        errors: {
            ...errors,
            items: []
        }
    });
});

export default store;

