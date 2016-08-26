'use strict';

import React, { PropTypes } from 'react';

export default createFilter();

function createFilter() {

    const {
        containerStyle,
        baseInputStyle,
        baseResetIconStyle,
        popupStyle,
        popupItemStyle
    } = styles();

    return React.createClass({

        propTypes: {
            options: PropTypes.array.isRequired,
            filter: PropTypes.string,
            placeholder: PropTypes.string,
            width: PropTypes.number,

            onFilterChanged: PropTypes.func,
            onFilterReset: PropTypes.func,
        },

        getInitialState() {
            return {
                focused: false
            };
        },

        render() {
            const {
                width = 100,
                placeholder,
                filter,
                options,

                onFilterChanged,
                onFilterReset
            } = this.props;

            const { focused } = this.state;

            const inputStyle = {
                ...baseInputStyle,
                width: `${ width + (filter ? 0 : 22) }px`,
            };

            const resetIconStyle = {
                ...baseResetIconStyle,
                display: filter ? 'flex' : 'none',
            };

            return (
                <span style={ containerStyle }>

                    <input
                        ref="input"
                        placeholder={ placeholder }
                        style={ inputStyle }
                        value={ filter }
                        onChange={ e => onFilterChanged(e.target.value) }
                        onKeyDown={ e => {
                            if (e.keyCode === 27) {
                                if (this.state.focused) {
                                    this.setState({ focused: false });
                                } else {
                                    e.target.blur();
                                }
                            }
                        }}
                        onFocus={ () => {
                            this.setState({ focused: true });
                        }}
                        onBlur={ () => {
                            setTimeout(() => this.setState({ focused: false }), 300);
                        }}
                    />

                    { focused ? renderOptions(this) : null }

                    <a
                        href="#"
                        style={ resetIconStyle }
                        onClick={ onFilterReset }
                    >&times;</a>
                </span>
            );

            function renderOptions(component) {
                const { input } = component.refs;
                const visibleOptions = options
                    .filter(opt => opt.indexOf(input.value) === 0);

                if (visibleOptions.length <= 1) {
                    return null;
                }

                return (
                    <ul style={ popupStyle }>
                        { visibleOptions
                            .map((opt, i) =>
                                <li
                                    key={ i }
                                    onMouseDown={ () => {
                                        input.value = opt;
                                        component.setState({ focused: false });
                                        onFilterChanged(opt);
                                    }}
                                    style={ popupItemStyle }>{ opt }</li>) }
                   </ul>
                );
            }
        }
    });
}

function styles() {
    const border = '1px solid rgba(0, 0, 0, .1)';
    const iconBackground = 'rgba(100, 0, 0, .05)';
    const height = 20;
    const heightPx = `${ height }px`;

    const popupStyle = {
        position: 'absolute',
        top: `${ height + 3 }px`,
        left: '-1px',
        right: '-1px',
        listStyle: 'none',
        background: 'white',
        zIndex: 3,
        border,
        margin: 0,
        padding: 0,
        borderTop: 0,
        maxHeight: '200px',
        overflowY: 'auto',
        fontSize: '9px'
    };

    const popupItemStyle = {
        margin: 0,
        padding: '5px',
        cursor: 'default'
    };

    const containerStyle = {
        display: 'inline-flex',
        position: 'relative',
        alignItems: 'center',
        border,
        marginLeft: '5px'
    };

    const baseInputStyle = {
        height: heightPx,
        border: 0,
        paddingLeft: '5px',
        outline: 0,
        fontSize: '9px',
        fontWeight: 100
    };

    const baseResetIconStyle = {
        textDecoration: 'none',
        color: 'chocolate',
        backgroundColor: iconBackground,
        fontWeight: 'bold',
        borderRadius: '1px',
        lineHeight: heightPx,
        height: heightPx,
        width: heightPx,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '15px',
        margin: '1px'
    };

    return {
        containerStyle,
        baseInputStyle,
        baseResetIconStyle,
        popupStyle,
        popupItemStyle
    };

}
