'use strict';

import ErrorOverview from '../components/error-overview.jsx';
import { connect } from 'react-redux';

export default connect((state, ownProps) => {
    return {
        isActive: ownProps.id === state.errors.activeErrorId
    };
}, (dispatch, ownProps) => ({

    onAppBadgeClick: () => dispatch({
        type: 'FILTER_CHANGED',
        name: 'app',
        value: ownProps.app
    }),

    onEnvBadgeClick: () => dispatch({
        type: 'FILTER_CHANGED',
        name: 'env',
        value: ownProps.env
    }),

    onClick: () => dispatch({
        type: 'ERROR_SELECTED',
        id: ownProps.id
    })

}))(ErrorOverview);

