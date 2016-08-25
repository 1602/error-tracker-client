'use strict';

export default status;

function status(state = {
    text: '',
    timeout: null
}, action) {

    if (action.type === 'STATUS_UPDATE') {
        state = {
            ...state,
            text: action.text,
            timeout: action.timeout
        };
    }

    return state;
}

