'use strict';

import moment from 'moment';
import React from 'react';
import Explore from './explore.jsx';

ErrorDetails.propTypes = {
    message: React.PropTypes.string.isRequired,
    occurrences: React.PropTypes.number,
    lastOccurrence: React.PropTypes.string,
    stack: React.PropTypes.string,
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

export default function ErrorDetails({
    message,
    occurrences,
    lastOccurrence,
    stack,
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

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div className="info-block">
                <b className="error-message-verbose">{message}</b>
                <span onClick={toggleSubscription}>
                    <span style={{opacity: isSubscribed ? 1 : 0.1 }}>
                        🔔
                    </span>
                </span>
                <p style={{
                    fontSize: '10px'
                }}>
                    Reported <b>{occurrences}</b> times;
                    last occurence <b>{moment(lastOccurrence).format('HH:mm:ss DD MMM YYYY')}</b>;<br/>
                    host: {host}; process id: {pid};<br/>
                    path: {cwd};
                </p>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                <StackTrace stack={stack} />

                <Occurrences 
                    occurrences={details}
                    expanded={expanded}
                    expandDetails={expandDetails}
                    expandAll={expandAll} />
            </div>

        </div>
    );
}

Occurrences.propTypes = {
    occurrences: React.PropTypes.array.isRequired,
    expanded: React.PropTypes.array,
    expandDetails: React.PropTypes.func,
    expandAll: React.PropTypes.func
};

function Occurrences({
    occurrences,
    expanded,
    expandDetails,
    expandAll
}) {
    return (
        <div className="info-block" style={{
            height: '100%',
            overflow: 'auto'
        }}>
            <div style={{ textAlign: 'right' }}>
                <span className="button" onClick={expandAll}>
                    [E]xpand all
                </span>
            </div>
            <ul className="error-details">
                {occurrences.map((info, index) => (
                    <OccurenceDetails
                        key={index}
                        info={info}
                        expanded={expanded[index]}
                        toggle={() => expandDetails(index)}
                    />
                ))}
            </ul>
        </div>
    );
}

StackTrace.propTypes = {
    stack: React.PropTypes.string
};

function StackTrace({stack}) {
    return (
        <div className="info-block" style={{
            flexShrink: 0,
            marginTop: 0,
            maxHeight: '13.3em',
            overflowY: 'scroll'
        }}>
            <pre>{fixStackTrace(stack)}</pre>
        </div>
    );
}

OccurenceDetails.propTypes = {
    info: React.PropTypes.object,
    expanded: React.PropTypes.bool,
    toggle: React.PropTypes.func
};

function OccurenceDetails({
    info,
    expanded,
    toggle
}) {
    const header = (
        <span onClick={toggle}>
            reported {moment(info.timestamp).fromNow()}
            {' '}
            ({moment(info.timestamp).format('HH:mm:ss DD MMM YYYY')})
        </span>
    );

    const details = expanded ?
        Object.keys(info)
            .filter(k => k !== 'timestamp')
            .map((value, key) => (
                <div key={key}>
                    <span>
                        {value + ':'} 
                        {
                            'object' === typeof info[value]
                            ? (<Explore data={info[value]} />)
                            : (<span style={{color: 'green'}}> {info[value]} </span>)
                        }
                    </span>
                </div>
            ))
        : '';

    return (
        <li>
            {header}
            {details}
        </li>
    );
}

function fixStackTrace(stack) {
    return stack && stack.replace(/\n {2}at/g, '\n    at');
}

