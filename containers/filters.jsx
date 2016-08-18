'use strict';

import { connect } from 'react-redux';
import getVisibleErrors from '../domains/errors-filter.js';
import Filters from '../components/filters.jsx';

export default connect(state => ({
    visibleItems: getVisibleErrors(state.errors.items, state.errors.filters)
}))(Filters);
