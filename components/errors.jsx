'use strict';

import React, {
    PropTypes
} from 'react';

import Overview  from '../containers/error-overview.jsx';
import Details   from '../containers/error-details.jsx';
import StatusBar from '../containers/status-bar.jsx';
import Filters   from './filters.jsx';

Errors.propTypes = {
    errors: PropTypes.array,
    error: PropTypes.object
};

export default Errors;

function Errors({
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
                    { errors.map(e => <Overview { ...e} key={ e.id } />) }
                </ul>
            </div>

            <div style={ rightPaneStyle }
                className="panel fixed">
                { error ? <Details {...error} /> : '' }
            </div>

            <StatusBar />
        </div>
    );
}

