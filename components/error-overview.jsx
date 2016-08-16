'use strict';

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { clickable } from '../styles/elements';
import moment from 'moment';

const ErrorStatsContainer = connect()(ErrorStatsComponent());
const ErrorMessageContainer = connect()(ErrorMessageComponent());

ErrorOverview.propTypes = {
    message: PropTypes.string,
    type: PropTypes.string,
    env: PropTypes.string,
    app: PropTypes.string.isRequired,
    occurrences: PropTypes.number,
    lastOccurrence: PropTypes.string,
    isActive: PropTypes.bool.isRequired,

    onClick: PropTypes.func.isRequired,
    onAppBadgeClick: PropTypes.func.isRequired,
    onEnvBadgeClick: PropTypes.func.isRequired
};

function ErrorOverview({
    type,
    app,
    env,
    message,
    occurrences,
    lastOccurrence,
    isActive,

    onClick,
    onAppBadgeClick,
    onEnvBadgeClick
}) {
    const isCaught = type === 'caught-exception';
    const className = `${isCaught ? 'caught' : 'uncaught'}-exception ${isActive ? 'is-active' : ''}`;

    return (
        <li
            className={ className }
            tabIndex="1"
            style={{ outline: 0 }}
            ref={ anchor => {
                if (anchor !== null && isActive) {
                    anchor.focus();
                }
            }}
            onClick={ onClick }
        >

            <ErrorMessageContainer
                {...{ message, app, onAppBadgeClick }}
            />

            <ErrorStatsContainer
                {...{ env, occurrences, lastOccurrence, onEnvBadgeClick }}
            />

        </li>
    );

}

export default ErrorOverview;

function ErrorMessageComponent() {

    ErrorMessage.propTypes = {
        app: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        onAppBadgeClick: PropTypes.func,
    };

    const appColors = {
        'agent':    'rgba(85, 136, 38, 0.72)',
        'frontend': 'rgba(255, 0, 153, 0.71)',
        'api':      'rgba(136, 38, 106, 0.48)',
        'broker':   'rgba(0, 0, 0, 0.3)',
        // default color
        'def':      'rgba(136, 83, 38, 0.45)'
    };

    return ErrorMessage;

    function ErrorMessage({ app, message, onAppBadgeClick }) {

        const appName = app.split('@')[0];

        const style = {
            ...clickable,
            backgroundColor: appColors[appName] || appColors.def
        };

        return (
            <a className="error">
                <span
                    onClick={ onAppBadgeClick }
                    className="app-name"
                    style={ style }> { appName } </span>
                <span className="error-message"> { message } </span>
            </a>
        );
    }

}

function ErrorStatsComponent() {

    ErrorStats.propTypes = {
        occurrences: PropTypes.number,
        env: PropTypes.string,
        lastOccurrence: PropTypes.string,
        onEnvBadgeClick: PropTypes.func
    };

    return ErrorStats;

    function ErrorStats({
        occurrences,
        env,
        lastOccurrence,
        onEnvBadgeClick
    }) {

        const envBadgeClassName = {
            production: 'env-badge env-pro',
            staging: 'env-badge env-sta',
            development: 'env-badge env-dev'
        }[env];

        const envName = env.substr(0, 3);

        const howLongAgo = moment(lastOccurrence).fromNow(true);

        return (
            <span className="error-info">
                <span>&times;{ occurrences }</span>
                {' '}
                <span
                    style={ clickable }
                    className={ envBadgeClassName }
                    onClick={ onEnvBadgeClick }
                >{ envName }</span>
                {' '}
                <span>{howLongAgo}</span>
            </span>
        );
    }

}

