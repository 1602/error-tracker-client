'use strict';

import React, { PropTypes } from 'react';

Filter.propTypes = {
    name: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    filter: PropTypes.string,
    placeholder: PropTypes.string,
    width: PropTypes.number,

    onFilterChanged: PropTypes.func,
    onFilterReset: PropTypes.func,
};

export default Filter;

function Filter({
    name,
    width = 100,
    placeholder,
    filter,
    options,

    onFilterChanged,
    onFilterReset
}) {
    const containerStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid rgba(0, 0, 0, .1)',
        marginLeft: '5px'
    };

    const inputStyle = {
        width: `${ width + (filter ? 0 : 22) }px`,
        height: '20px',
        border: 0,
        paddingLeft: '5px',
        outline: 0
    };

    const resetIconStyle = {
        display: filter ? 'flex' : 'none',
        textDecoration: 'none',
        color: 'chocolate',
        backgroundColor: 'rgba(0, 0, 0, .05)',
        fontWeight: 'bold',
        borderRadius: '1px',
        lineHeight: '20px',
        height: '20px',
        width: '20px',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '15px',
        margin: '1px',
    };

    const dataListId = `datalist-${ name }`;

    return (
        <span style={ containerStyle }>

            <datalist id={ dataListId }>
                { options.map((opt, i) => <option key={ i }>{ opt }</option>) }
            </datalist>

            <input
                list={ dataListId }
                placeholder={ placeholder }
                style={ inputStyle } 
                value={ filter }
                onChange={ e => onFilterChanged(e.target.value) }
                onFocus={ e => {
                    console.log('focused', e);
                }}
                onBlur={ e => {
                    console.log('blured', e);
                }}
            />
            
            <a
                href="#"
                style={ resetIconStyle }
                onClick={ onFilterReset }
            >&times;</a>
        </span>
    );
}

