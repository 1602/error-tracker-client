'use strict';

import React, { PropTypes } from 'react';
import moment from 'moment';
import Explore from './explore.jsx';

OccurrenceDetails.propTypes = {
    info: PropTypes.object,
    expanded: PropTypes.bool,
    toggle: PropTypes.func
};

export default OccurrenceDetails;

function OccurrenceDetails({
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

