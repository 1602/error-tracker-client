'use strict';

import { combineReducers } from 'redux';
import createNotifier from '../domains/client-side-notifications';
import getVisibleErrors from '../domains/errors-filter';

const notifier = createNotifier(window);

export default combineReducers({
    view,
    source,
    loading,
    errors,
    connected
});

function view(state, action) {

    if (typeof state === 'undefined') {
        state = 'browser';
    }

    if (action.type === 'TOGGLE_VIEW') {
        state = state === 'browser' ? 'settings' : 'browser';
    }

    return state;
}

function source(state, action) {

    if (typeof state === 'undefined') {
        state = localStorage.source || 'http://1602.ws:9876';
    }

    if (action.type === 'SOURCE_CONFIGURED') {
        state = action.source;
        localStorage.source = action.source;
    }

    return state;
}

function connected(state, action) {
    if (typeof state === 'undefined') {
        state = false;
    }

    if (action.type === 'CONNECTED') {
        return true;
    }

    if (action.type === 'DISCONNECTED') {
        return false;
    }

    return state;
}

function loading(state, action) {
    if (typeof state === 'undefined') {
        state = true;
    }

    if (action.type === 'ERRORS_LOADED') {
        return false;
    }

    if (action.type === 'RELOAD_ERRORS') {
        return true;
    }

    return state;
}

function filters(state, action) {
    if (!state) {
        state = {
            severity: {
                options: ['caught', 'uncaught'],
                selected: -1
            },
            app: {
                options: [],
                selected: -1
            },
            env: {
                options: [],
                selected: -1
            },
            host: {
                options: [],
                selected: -1
            },
        };
    }

    if (action.type === 'ERRORS_LOADED') {
        state = ['app', 'env', 'host'].reduce(grab, {
            severity: state.severity
        });
    } else if (action.type === 'FILTER_CHANGED') {
        return {
            ...state,
            [action.name]: filter(state[action.name], action)
        };
    }

    function grab(newState, filterType) {
        newState[filterType] = action.errors.reduce((res, err) => {
            if (!res.options.includes(err[filterType])) {
                res.options.push(err[filterType]);
            }
            return res;
        }, {options: [], selected: -1});
        return newState;
    }

    return state;
}

function filter(state, action) {
    if (action.type === 'FILTER_CHANGED') {
        return {
            ...state,
            selected: action.value
        };
    }
    return state;
}

function errors(state, action) {
    if (!state) {
        state = {
            items: [],
            activeErrorIndex: 0,
            filters: filters(null, action)
        };
    }

    if (action.type === 'ERRORS_LOADED') {
        return {
            items: action.errors.map(e => error(e, action)),
            activeErrorIndex: state.activeErrorIndex,
            filters: filters(state.filters, action)
        };
    }

    if (action.type === 'FILTER_CHANGED') {
        return {
            ...state,
            activeErrorIndex: 0,
            filters: filters(state.filters, action)
        };
    }

    if (action.type === 'TOGGLE_SUBSCRIPTION') {
        return {
            ...state,
            items: state.items.map(e => error(e, action)),
        };
    }

    const frs = state.filters;

    switch (action.type) {
        case 'ERROR_ARRIVED': {
            const selError = getVisibleErrors(state.items, frs)[state.activeErrorIndex];
            const newState = {
                ...state,
                items: [
                    error(state.items.find(e => e.id === action.error.id) ||
                          action.error, action),
                    ...state.items.filter(e => e.id !== action.error.id)
                ]
            };
            newState.activeErrorIndex = Math.max(0, newState.items.indexOf(selError));
            return newState;
        }
        case 'NEXT_ERROR': {
            const visibleErrors = getVisibleErrors(state.items, frs);
            return {
                ...state,
                activeErrorIndex: Math.min(
                    visibleErrors.length - 1,
                    state.activeErrorIndex + 1
                ),
            };
        }
        case 'PREV_ERROR':
            return {
                ...state,
                activeErrorIndex: Math.max(
                    0,
                    state.activeErrorIndex - 1
                ),
            };
        case 'ERROR_SELECTED':
            return {
                ...state,
                activeErrorIndex: action.index
            };
        case 'TOGGLE_ERROR_DETAILS_NODE':
        case 'EXPAND_ERROR_DETAILS':
            return {
                ...state,
                items: [
                    ...state.items.slice(0, state.activeErrorIndex),
                    error(state.items[state.activeErrorIndex], action),
                    ...state.items.slice(state.activeErrorIndex + 1)
                ]
            };
    }

    return state;
}

function error(state, action) {
    if (action.type === 'TOGGLE_ERROR_DETAILS_NODE') {

        return {
            ...state,
            expanded: (state.expanded || Object.keys(state.details))
                .map((exp, index) => action.index === index ? !exp : exp)
        };
    } else if (action.type === 'EXPAND_ERROR_DETAILS') {

        return {
            ...state,
            expanded: Object.keys(state.details)
                .map(() => true)
        };
    } else if (action.type === 'ERRORS_LOADED' || action.type === 'ERROR_ARRIVED') {

        return {
            ...state,
            severity: state.type,
            isSubscribed: notifier.isSubscribed(state.id),
            expanded: state.expanded || Object.keys(state.details)
                .map((node, i) => i === 0)
        };

    } else if (action.type === 'TOGGLE_SUBSCRIPTION') {
        if (action.errorId !== state.id) {
            return state;
        }

        if (state.isSubscribed) {
            notifier.unsubscribe(state.id);
        } else {
            notifier.subscribe(state.id);
        }

        return {
            ...state,
            isSubscribed: !state.isSubscribed
        };
    }
}

