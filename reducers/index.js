'use strict';

import { combineReducers } from 'redux';
import createNotifier from '../domains/client-side-notifications';
import getVisibleErrors from '../domains/errors-filter';

const notifier = createNotifier(window);

export default combineReducers({
    view,
    sources,
    loading,
    errors,
    connected
});

function view(state, action) {

    if (typeof state === 'undefined') {
        state = 'browser';
    }

    // cmd+comma toggles settings back and forth
    if (action.type === 'TOGGLE_SETTINGS') {
        state = state === 'browser' ? 'settings' : 'browser';
    }

    // switch to browser mode when error selected (e.g. notification clicked)
    if (action.type === 'ERROR_SELECTED') {
        state = 'browser';
    }

    return state;
}

function sources(state, action) {

    if (typeof state === 'undefined') {
        state = localStorage.sources
            ? JSON.parse(localStorage.sources)
            : [ { enabled: true, url: 'http://errors.ub.io' } ];
    }

    if (action.type === 'SOURCE_CONFIGURED') {
        const newState = [
            ...state.slice(0, action.index),
            {
                ...state[action.index],
                enabled: action.enabled
            },
            ...state.slice(action.index + 1)
        ];

        localStorage.sources = JSON.stringify(newState);
        return newState;
    }

    if (action.type === 'SOURCE_ADDED') {
        if (!state.find(source => source.url === action.url)) {
            const newState = [
                ...state,
                { url: action.url, enabled: true }
            ];

            localStorage.sources = JSON.stringify(newState);
            return newState;
        }
    }

    if (action.type === 'SOURCE_REMOVED') {
        const newState = [
            ...state.slice(0, action.index),
            ...state.slice(action.index + 1)
        ];

        localStorage.sources = JSON.stringify(newState);
        return newState;
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
        state = ['app', 'env', 'host'].reduce((newState, filterType) => {
            newState[filterType] = action.errors.reduce((res, err) => {
                if (!res.options.includes(err[filterType])) {
                    res.options.push(err[filterType]);
                }
                return res;
            }, {
                options: state[filterType].options,
                selected: state[filterType].selected
            });
            return newState;
        }, {
            severity: state.severity
        });
    } else if (action.type === 'FILTER_CHANGED') {
        return {
            ...state,
            [action.name]: filter(state[action.name], action)
        };
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
            activeErrorId: 0,
            filters: filters(null, action)
        };
    }

    if (action.type === 'ERRORS_LOADED') {
        const items = state.items
            .concat(
                action.errors
                    .filter(e => !state.items.find(ee => ee.id === e.id))
                    .map(e => error(e, action))
            )
            .sort((a, b) => a.lastOccurrence < b.lastOccurrence ? 1 : -1);

        const activeErrorId = items.length > 0 ? items[0].id : 0;

        return {
            items,
            activeErrorId,
            filters: filters(state.filters, action)
        };
    }

    if (action.type === 'FILTER_CHANGED') {
        const activeErrorId = state.items.length > 0 ? state.items[0].id : 0;

        return {
            ...state,
            activeErrorId,
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
            const newState = {
                ...state,
                items: [
                    error(state.items.find(e => e.id === action.error.id) ||
                          action.error, action),
                    ...state.items.filter(e => e.id !== action.error.id)
                ]
            };
            return newState;
        }
        case 'NEXT_ERROR': {
            const visibleErrors = getVisibleErrors(state.items, frs);
            const id = state.activeErrorId;
            const currentIndex = visibleErrors.findIndex(err => err.id === id);
            const next = visibleErrors[currentIndex + 1] || visibleErrors[0] || 0;

            return {
                ...state,
                activeErrorId: next.id
            };
        }
        case 'PREV_ERROR':
            const visibleErrors = getVisibleErrors(state.items, frs);
            const id = state.activeErrorId;
            const currentIndex = visibleErrors.findIndex(err => err.id === id);
            const next = visibleErrors[currentIndex - 1] || visibleErrors[0] || 0;

            return {
                ...state,
                activeErrorId: next.id
            };
        case 'ERROR_SELECTED':
            console.log('about to select', action.id);
            return {
                ...state,
                activeErrorId: action.id
            };
        case 'TOGGLE_ERROR_DETAILS_NODE':
        case 'EXPAND_ERROR_DETAILS':
            const i = state.items.findIndex(err => err.id === state.activeErrorId);
            return {
                ...state,
                items: [
                    ...state.items.slice(0, i),
                    error(state.items[i], action),
                    ...state.items.slice(i + 1)
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
    } else if (action.type === 'ERRORS_LOADED') {

        return {
            ...state,
            severity: state.type,
            isSubscribed: notifier.isSubscribed(state.id),
            expanded: Object.keys(state.details)
                .map((node, i) => i === 0)
        };
    } else if (action.type === 'ERROR_ARRIVED') {

        return {
            ...action.error,
            severity: state.type,
            isSubscribed: notifier.isSubscribed(state.id),
            expanded: [ true ].concat(state.expanded)
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

