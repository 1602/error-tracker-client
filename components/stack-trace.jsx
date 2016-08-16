'use strict';

import React, { PropTypes } from 'react';

StackTrace.propTypes = {
    stack: PropTypes.string
};

export default StackTrace;

function StackTrace({stack}) {
    const stackContainerStyle = {
        flexShrink: 0,
        marginTop: 0,
        maxHeight: '13.3em',
        overflowY: 'scroll'
    };

    return (
        <div className="info-block" style={ stackContainerStyle }>
            <pre>{ fixStackTrace(stack) || 'Stack trace missing' }</pre>
        </div>
    );
}

function fixStackTrace(stack) {
    return stack && stack.replace(/\n {2}at/g, '\n    at');
}

