'use strict';

import React from 'react';

export default Filters;

function Filters() {
    const filterTypes = {
        env: 'Env',
        app: 'App',
        host: 'Host',
        severity: 'Type'
    };

    return (
        <nav>
            {Object.keys(filterTypes).map(type => (
                <span key={type}>
                    { ` ${filterTypes[type]}: ` }
                    <Filter name={type} />
                </span>
            ))}
        </nav>
    );
}

const Filter = React.createClass({

    propTypes: {
        name: React.PropTypes.string
    },

    contextTypes: {
        store: React.PropTypes.object
    },

    render() {
        const name = this.props.name;
        const { store } = this.context;
        const filter = store.getState().errors.filters[name];

        return (
            <select onChange={e => store.dispatch({
                type: 'FILTER_CHANGED',
                name,
                value: Number(e.target.value)
            })}>
                <option value="-1">any</option>
                {filter.options.map((option, index) => (
                    <option key={index} value={index}>{option}</option>
                ))}
            </select>
        );
    }
});


