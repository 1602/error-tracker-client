'use strict';

import Errors from '../components/errors.jsx';
import { connect } from 'react-redux';
import getVisibleErrors from '../domains/errors-filter.js';

export default connect(state => {
    const errors = getVisibleErrors(state.errors.items, state.errors.filters);
    const error = errors.find(err => err.id === state.errors.displayedErrorId);

    return {
        errors,
        error
    };

})(Errors);

