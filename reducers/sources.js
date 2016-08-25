'use strict';

export default sources;

function sources(state, action) {
    //*
    const sources = [
        { url: 'http://localhost:8090/data/production', enabled: true },
        { url: 'http://localhost:8090/data/staging', enabled: true },
        // { url: 'http://errors.loc.ub.io', enabled: true },
    ];
    return sources;
    //*/

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
