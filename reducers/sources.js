'use strict';

export default sources;

function sources(state = [
    { enabled: true, url: 'http://errors.ub.io' }
], action) {
    /*
    const sources = [
        { url: 'http://localhost:8090/data/production', enabled: true },
        { url: 'http://localhost:8090/data/staging', enabled: true },
        // { url: 'http://errors.loc.ub.io', enabled: true },
    ];
    return sources;
    //*/

    if (action.type === 'SOURCE_CONFIGURED') {
        state = [
            ...state.slice(0, action.index),
            {
                ...state[action.index],
                enabled: action.enabled
            },
            ...state.slice(action.index + 1)
        ];
    }

    if (action.type === 'SOURCE_ADDED') {
        if (!state.find(source => source.url === action.url)) {
            state = [
                ...state,
                { url: action.url, enabled: true }
            ];
        }
    }

    if (action.type === 'SOURCE_REMOVED') {
        state = [
            ...state.slice(0, action.index),
            ...state.slice(action.index + 1)
        ];
    }

    return state;
}
