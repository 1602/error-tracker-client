'use strict';

import React, { PropTypes } from 'react';

let _timeout;

const StatusBar = ({ text, timeout, expire }) => {

    const statusBarStyle = {
        position: 'absolute',
        bottom: 0,
        right: 0,
        background: 'white',
        fontSize: '8px',
        color: 'grey',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderBottom: 0,
        borderRight: 0,
        borderTopLeftRadius: '3px',
        padding: '3px',
        display: text ? '' : 'none'
    };

    if (_timeout) {
        clearTimeout(_timeout);
    }

    if (timeout) {
        _timeout = setTimeout(expire, timeout);
    }

    return <div style={ statusBarStyle }>{ text }</div>;
};

StatusBar.propTypes = {
    text: PropTypes.string,
    timeout: PropTypes.number,
    expire: PropTypes.func
};

export default StatusBar;

