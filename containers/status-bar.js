'use strict';

import { connect } from 'react-redux';
import StatusBar from '../components/status-bar.jsx';

export default connect(state => ({
    text: state.status.text,
    timeout: state.status.timeout
}), dispatch => ({
    expire: () => dispatch({ type: 'STATUS_UPDATE', text: '' })
}))(StatusBar);

