'use strict';

import getVisibleErrors from '../domains/errors-filter';
import createNotifier from '../domains/client-side-notifications';

export default errors;

const notifier = createNotifier(window);

function filters(state = {
    app: '',
    env: '',
    msg: ''
}, action) {

    if (action.type === 'FILTER_CHANGED') {
        state = {
            ...state,
            [action.name]: action.value
        };
    }

    return state;
}

function errors(state = {
    items: [],
    deleteErrorId: null,
    activeErrorId: 0,
    displayedErrorId: 0,
    filters: filters(undefined, {})
}, action) {

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
            displayedErrorId: activeErrorId,
            filters: filters(state.filters, action)
        };
    }

    if (action.type === 'DELETE_ERROR') {
        return {
            ...state,
            deleteErrorId: state.activeErrorId
        };
    }

    if (action.type === 'DELETE_ERROR_CONFIRM' && state.deleteErrorId) {
        const activeErrorId = getSiblingError(state.items, state.filters, state.activeErrorId, 1);
        return {
            ...state,
            deleteErrorId: null,
            activeErrorId,
            displayedErrorId: activeErrorId,
            items: state.items.filter(e => e.id !== state.deleteErrorId)
        };
    }

    if (action.type === 'DELETE_ERROR_CANCEL') {
        return {
            ...state,
            deleteErrorId: null
        };
    }

    if (action.type === 'FILTER_CHANGED') {
        const newFilters = filters(state.filters, action);
        const items = getVisibleErrors(state.items, newFilters);
        const activeErrorId = items.length > 0 ? items[0].id : 0;

        return {
            ...state,
            activeErrorId,
            displayedErrorId: activeErrorId,
            deleteErrorId: null,
            filters: newFilters,
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
            const activeErrorId = getSiblingError(state.items, frs, state.activeErrorId, 1);

            return {
                ...state,
                deleteErrorId: null,
                activeErrorId
            };
        }
        case 'PREV_ERROR': {
            const activeErrorId = getSiblingError(state.items, frs, state.activeErrorId, -1);

            return {
                ...state,
                deleteErrorId: null,
                activeErrorId
            };
        }
        case 'ERROR_SELECTED': {
            const activeErrorId = action.id || state.activeErrorId;
            return {
                ...state,
                activeErrorId,
                deleteErrorId: null,
                displayedErrorId: activeErrorId
            };
        }
        case 'TOGGLE_ERROR_DETAILS_NODE':
        case 'EXPAND_ERROR_DETAILS': {
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
    }

    return state;
}

function getSiblingError(items, filters, id, incr) {
    const visibleErrors = getVisibleErrors(items, filters);
    const currentIndex = visibleErrors.findIndex(err => err.id === id);
    const next = visibleErrors[currentIndex + incr] || visibleErrors[0];
    return next ? next.id : 0;
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

