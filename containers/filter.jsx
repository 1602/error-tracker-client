'use stict';

import Filter from '../components/filter.jsx';
import { connect } from 'react-redux'
import getVisibleErrors from '../domains/errors-filter';

export default connect((state, ownProps) => ({
    options: getVisibleErrors(state.errors.items, state.errors.filters)
        .reduce((list, e) => {
            const opt = e[ownProps.propName] &&
                e[ownProps.propName].substring(0, ownProps.maxLength);

            if (!list.includes(opt)) {
                list.push(opt);
            }

            return list;
        }, []),
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

