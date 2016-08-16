'use strict';

import { connect } from 'react-redux';
import ErrorDetails from '../components/error-details.jsx';

export default connect(null, dispatch => {
    expandAll: () => dispatch({
        type: 'EXPAND_ERROR_DETAILS'
    }),

    expandDetails: index => dispatch({
        type: 'TOGGLE_ERROR_DETAILS_NODE',
        index
    }),

    toggleSubscription: () => dispatch({
        type: 'TOGGLE_SUBSCRIPTION',
        errorId: error.id
    })
})(ErrorDetails);

