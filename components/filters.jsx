'use strict';

import React, { PropTypes } from 'react';
import Filter from '../containers/filter.js';

Filters.propTypes = {
    items: PropTypes.object
};

export default Filters;

function Filters({
    items
}) {

    const { visible, hidden } = items;
    const visibleCount = visible.length;
    const hiddenCount = hidden.length;

    const legend = {
        text: hiddenCount > 0
            ? `${ visibleCount } out of ${ hiddenCount + visibleCount }
                records shown`
            : `${ visibleCount } records total`,

        style: {
            padding: '5px',
            fontSize: '9px',
            display: 'inline-flex'
        }
    };

    return (
        <div style={{ marginTop: '7px', marginBottom: '3px' }}>
            <Filter
                name="app"
                options={ calcOptions(visible, 'app', 10) }
                placeholder="App name"
            />

            <Filter
                name="msg"
                width={ 200 }
                options={ calcOptions(visible, 'message', 40) }
                placeholder="Error message"
            />

            <Filter
                name="env"
                options={ calcOptions(visible, 'env', 3) }
                placeholder="Environment"
            />

            <div style={ legend.style }>
                { legend.text }
            </div>

        </div>
    );
}

function calcOptions(items, propName, maxLength) {
    return items.reduce((list, e) => {
        const opt = e[propName] &&
            e[propName].substring(0, maxLength);

        if (!list.includes(opt)) {
            list.push(opt);
        }

        return list;
    }, []);
}

