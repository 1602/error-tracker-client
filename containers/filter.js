'use stict';

import Filter from '../components/filter.jsx';
import { connect } from 'react-redux';

export default connect((state, ownProps) => ({
    filter: state.errors.filters[ownProps.name],
}), (dispatch, ownProps) => ({
    onFilterReset: () => dispatch({
        type: 'FILTER_CHANGED',
        name: ownProps.name,
        value: ''
    }),

    onFilterChanged: value => dispatch({
        type: 'FILTER_CHANGED',
        name: ownProps.name,
        value
    })
}))(Filter);

