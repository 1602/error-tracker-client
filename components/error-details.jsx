'use strict';

import React from 'react';
import moment from 'moment';
import Occurrences from './occurrences.jsx';
import StackTrace from './stack-trace.jsx';

ErrorDetails.propTypes = {
    message: React.PropTypes.string.isRequired,
    occurrences: React.PropTypes.number,
    lastOccurrence: React.PropTypes.string,
    stack: React.PropTypes.string,
    app: React.PropTypes.string,
    host: React.PropTypes.string,
    cwd: React.PropTypes.string,
    pid: React.PropTypes.string,
    details: React.PropTypes.array,
    isSubscribed: React.PropTypes.bool,

    expanded: React.PropTypes.array,

    expandAll: React.PropTypes.func,
    expandDetails: React.PropTypes.func,
    toggleSubscription: React.PropTypes.func
};

export default ErrorDetails;

function ErrorDetails({
    message,
    occurrences,
    lastOccurrence,
    stack,
    app,
    host,
    cwd,
    pid,
    details,
    isSubscribed,

    expanded,

    expandAll,
    expandDetails,
    toggleSubscription
}) {

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    };

    const subscribeIconStyle = {
        opacity: isSubscribed ? 1 : 0.1
    };

    const errorInformationStyle = {
        fontSize: '10px'
    };

    const detailsContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    };

    return (
        <div style={ containerStyle }>
            <div className="info-block">
                <b className="error-message-verbose">{ message }</b>

                <span onClick={ toggleSubscription }>
                    <span style={ subscribeIconStyle }>
                        🔔
                    </span>
                </span>

                <p style={ errorInformationStyle }>
                    Reported <b>{ occurrences }</b> times;
                    last occurence <b>{ moment(lastOccurrence).format('HH:mm:ss DD MMM YYYY') }</b>;<br/>
                    host: { host }; process id: { pid };<br/>
                    path: { cwd }; app: { app }
                </p>

            </div>

            <div style={ detailsContainerStyle }>
                <StackTrace stack={ stack } />
                <Occurrences 
                    occurrences={ details }
                    expanded={ expanded }
                    expandDetails={ expandDetails }
                    expandAll={ expandAll } />
            </div>

        </div>
    );
}

