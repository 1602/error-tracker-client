'use strict';

import React, { PropTypes } from 'react';
import OccurrenceDetails from './occurrence-details.jsx';

Occurrences.propTypes = {
    occurrences: React.PropTypes.array.isRequired,
    expanded: React.PropTypes.array,
    expandDetails: React.PropTypes.func,
    expandAll: React.PropTypes.func
};

export default Occurrences;

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
                    <OccurrenceDetails
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
