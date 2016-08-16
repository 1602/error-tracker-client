'use strict';

import React, {
    PropTypes
} from 'react';

import Overview from '../containers/error-overview.jsx';
import Details  from './error-details.jsx';
import StatusBar     from './status-bar.jsx';
import Filters       from './filters.jsx';

Errors.propTypes = {
    activeErrorId: PropTypes.string,
    errors: PropTypes.array,
    error: PropTypes.object
};

export default Errors;

function Errors({
    activeErrorId,
    errors,
    error
}) {
    const wrapperStyle = {
        height: '100%',
        display: 'flex'
    };

    const leftPaneStyle = {
        display: 'flex',
        height: '100%',
        width: '60%'
    };

    const rightPaneStyle = {
        display: 'flex',
        height: '100%',
        width: '40%'
    };

    return (
        <div style={ wrapperStyle }>
            <div style={ leftPaneStyle } className="panel fixed">

                <Filters />

                <ul className="errors-list">
                    { errors.map((error, i) => <Overview { ...error } key={ i } />) }
                </ul>
            </div>

            <div style={ rightPaneStyle }
                className="panel fixed">
                { error ? <Details {...error} /> : '' }
            </div>

            <StatusBar />
        </div>
    );
};

