'use strict';

import React, {
    PropTypes
} from 'react';

import Overview  from '../containers/error-overview.js';
import Details   from '../containers/error-details.js';
import StatusBar from '../containers/status-bar.js';
import Filters   from '../containers/filters.jsx';

const Errors = React.createClass({

    propTypes: {
        errors: PropTypes.array,
        error: PropTypes.object
    },

    getInitialState() {
        return { limit: 20 };
    },

    render() {
        const {
            errors,
            error
        } = this.props;

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

        const { limit } = this.state;

        function isAllTheWayDown(list) {
            return list.scrollHeight < list.scrollTop + list.offsetHeight + 20
        }

        function hasMoreItemsToShow() {
            return errors.length > limit + 1;
        }

        return (
            <div style={ wrapperStyle }>
                <div style={ leftPaneStyle } className="panel fixed">

                    <Filters />

                    <ul className="errors-list" ref="list" onScroll={ () => {
                        if (isAllTheWayDown(this.refs.list) &&
                            hasMoreItemsToShow()) {
                            this.setState({ limit: limit + 20 });
                        }
                    }}> { errors.slice(0, limit).map(e =>
                        <Overview { ...e} key={ e.id } />) }
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
});

export default Errors;

