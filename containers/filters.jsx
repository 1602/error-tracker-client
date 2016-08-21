'use strict';

import { connect } from 'react-redux';
import { extendedFilter } from '../domains/errors-filter.js';
import Filters from '../components/filters.jsx';

export default connect(state => ({
    items: extendedFilter(state.errors.items, state.errors.filters)
}))(Filters);
