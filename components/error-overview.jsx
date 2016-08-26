'use strict';

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { clickable } from '../styles/elements';
import moment from 'moment';

const ErrorStatsContainer = connect()(ErrorStatsComponent());
const ErrorMessageContainer = connect()(ErrorMessageComponent());

const ErrorOverview = React.createClass({
    propTypes: {
        message: PropTypes.string,
        type: PropTypes.string,
        env: PropTypes.string,
        app: PropTypes.string.isRequired,
        occurrences: PropTypes.number,
        lastOccurrence: PropTypes.string,
        isActive: PropTypes.bool.isRequired,
        aboutToDelete: PropTypes.bool,

        onClick: PropTypes.func.isRequired,
        onAppBadgeClick: PropTypes.func.isRequired,
        onEnvBadgeClick: PropTypes.func.isRequired
    },

    render() {
        const {
            type,
            app,
            env,
            message,
            occurrences,
            lastOccurrence,
            isActive,
            aboutToDelete,

            onClick,
            onAppBadgeClick,
            onEnvBadgeClick
        } = this.props;

        const isCaught = type === 'caught-exception';
        const className = `${isCaught ? 'caught' : 'uncaught'}-exception`;

        return (
            <li
                style={{
                    outline: 0,
                    position: 'relative',
                    listStyle: 'none',
                    margin: '5px 0 5px 5px',
                    display: 'flex'
                }}
                tabIndex="1"
                ref={ anchor => {
                    if (anchor !== null && isActive && isHidden(anchor)) {
                        anchor.focus();
                    }
                }}
                onClick={ onClick }
            >

                <div
                    className={ className }
                    style={{
                        fontFamily: 'menlo, monospace',
                        justifyContent: 'space-between',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        borderRadius: '1px',
                        padding: '6px',
                        background: isActive ? '#CACFD3' : 'rgba(0, 0, 0, 0.05)',
                        position: 'relative',
                        borderLeft: `5px solid ${ isCaught
                            ? 'rgba(0,0,0,0.1)'
                            : 'crimson' }`,
                        boxSizing: 'border-box',
                        width: '100%',
                        transition: 'all .2s',
                        WebkitFilter: aboutToDelete ? 'blur(1px) grayscale(50%) brightness(145%)' : '',
                    }}>

                    <ErrorMessageContainer
                        {...{ message, app, onAppBadgeClick }}
                    />

                    <ErrorStatsContainer
                        {...{ env, occurrences, lastOccurrence, onEnvBadgeClick }}
                    />
                </div>

                { aboutToDelete
                    ? <DeleteErrorConfirmationContainer text="remove? sure?" />
                    : null
                }

            </li>
        );
    }
});

export default ErrorOverview;

const ConfirmationComponent = React.createClass({
    displayName: 'Confirmation',

    propTypes: {
        text: PropTypes.string,

        onConfirm: PropTypes.func,
        onCancel: PropTypes.func,
    },

    componentDidMount() {
        const { style } = this.refs.container;
        style.transition = 'width 0.2s ease-in-out';
        const max = this.refs.container.scrollWidth;
        style.width = max + 'px';
        document.addEventListener('keydown', this.keydownHandler);
    },

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keydownHandler);
    },

    keydownHandler(e) {
        if (e.srcElement && e.srcElement.tagName === 'INPUT') {
            return;
        }

        // confirm on 'Y' or 'Return'
        if (e.keyCode === 89 || e.keyCode === 13) {
            this.props.onConfirm();
        // cancel on 'N' or 'Esc'
        } else if (e.keyCode === 78 || e.keyCode === 27) {
            this.props.onCancel();
        }

    },

    render() {
        const {
            text,

            onConfirm,
            onCancel
        } = this.props;

        const container = {
            position: 'absolute',
            borderRadius: '1px',
            right: 0,
            width: 0,
            overflow: 'hidden',
            display: 'flex',
            height: '28px',
            lineHeight: '28px',
            backgroundColor: '#6161a0',
            color: 'white',
            textAlign: 'right',
            boxShadow: 'rgba(50, 50, 100, 0.2) -5px 0px 20px inset'
        };

        const message = {
            padding: '0 40px',
            fontSize: '9px',
            letterSpacing: '0.075em',
            fontWeight: 900,
            whiteSpace: 'nowrap'
        };

        const baseButton = {
            lineHeight: '28px',
            textAlign: 'center',
            fontWeight: '100',
            fontSize: '10px',
            display: 'inline-block',
            height: '28px',
            padding: '0 16px',
        };

        const confirmButton = {
            ...baseButton,
            color: 'white',
            backgroundColor: '#d66060'
        };

        const cancelButton = {
            ...baseButton,
            color: 'black',
            backgroundColor: '#94cd94'
        };

        return (
            <span ref="container" style={ container }>
                <span style={ message }> { text }</span>
                <span onClick={ onConfirm } style={ confirmButton }>Y</span>
                <span onClick={ onCancel } style={ cancelButton }>N</span>
            </span>
        );
    }
});

const DeleteErrorConfirmationContainer = connect(null, dispatch => ({
    onConfirm: () => dispatch({ type: 'DELETE_ERROR_CONFIRM' }),
    onCancel: () => dispatch({ type: 'DELETE_ERROR_CANCEL' }),
}))(ConfirmationComponent);

function isHidden(el) {
    const { offsetTop, offsetHeight, parentNode } = el;
    const topEdge = offsetTop - parentNode.offsetTop;
    const bottomEdge = topEdge + offsetHeight;
    return bottomEdge > parentNode.scrollTop + parentNode.offsetHeight ||
        topEdge < parentNode.scrollTop;
}

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

