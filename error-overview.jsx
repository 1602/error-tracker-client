'use strict';

import React from 'react';
import moment from 'moment';

export default React.createClass({

    displayName: 'ErrorOverview',

    propTypes: {
        error: React.PropTypes.object,
        isActive: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },

    appColors: {
        'agent': 'rgba(85, 136, 38, 0.72)',
        'ub-frontend': 'rgba(255, 0, 153, 0.71)',
        'ub': 'rgba(136, 38, 106, 0.48)',
        'broker': 'rgba(0,0,0, 0.3)'
    },

    calcClassName() {
        const isCaught = this.props.error.type === 'caught-exception';
        // const isUncaught = this.props.error.type === 'uncaught-exception';
        return `${isCaught ? 'caught' : 'uncaught'}-exception ${this.props.isActive ? 'is-active' : ''}`;
    },

    shouldComponentUpdate(prevProps) {
        return this.props.isActive !== prevProps.isActive;
    },

    componentDidUpdate() {
        console.log('componentDidUpdate: ErrorOverview');
    },

    render() {
        const style = {
            backgroundColor: this.appColors[this.props.error.app.split('@')[0]] ||
                'rgba(136, 83, 38, 0.45)'
        };

        const appName = this.props.error.app.split('@')[0];
        const { message, occurrences } = this.props.error;
        const envBadge = {
            production: 'env-pro',
            staging: 'env-sta',
            development: 'env-dev'
        }[this.props.error.env];
        const env = this.props.error.env.substr(0, 3);

        const howLongAgo = moment(this.props.error.lastOccurrence).fromNow(true);

        return (
            <li className={ this.calcClassName() }
                onClick={ this.props.onClick }>
                <a className="error" tabIndex="1" ref={ anchor => {
                    if (anchor !== null && this.props.isActive) {
                        anchor.focus();
                    }
                }}>
                    <span className="app-name" style={ style }> { appName } </span>
                    <span className="error-message"> { message } </span>
                </a>
                <span className="error-info">
                    <span>&times;{ occurrences }</span>
                    {' '}
                    <span className={`env-badge ${ envBadge }`}>{env}</span>
                    {' '}
                    <span>{howLongAgo}</span>
                </span>
            </li>
        );
    }
});

