'use strict';

import { connect } from 'react-redux';
import Settings from '../components/settings.jsx';

export default connect(store => ({
    sources: store.sources
}), dispatch => ({

    onSourceAdded: url => dispatch({
        type: 'SOURCE_ADDED',
        url
    }),

    onSourceRemoved: index => dispatch({
        type: 'SOURCE_REMOVED',
        index
    }),

    onSourceConfigured: (index, enabled) => dispatch({
        type: 'SOURCE_CONFIGURED',
        index,
        enabled
    })
}))(Settings);

