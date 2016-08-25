'use strict';

import { combineReducers } from 'redux';

import sources from './sources.js';
import errors from './errors.js';
import status from './status.js';

export default combineReducers({
    sources,
    errors,
    status
});

