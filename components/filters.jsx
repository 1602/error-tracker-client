'use strict';

import React, { PropTypes } from 'react';
import Filter from '../containers/filter.js';

Filters.propTypes = {
    visibleItems: PropTypes.array
};

export default Filters;

function Filters({
    visibleItems
}) {

    return (
        <div style={{ marginTop: '7px', marginBottom: '3px' }}>
            <Filter
                name="app"
                options={ calcOptions(visibleItems, 'app', 10) }
                placeholder="App name"
            />

            <Filter
                name="msg"
                width={ 200 }
                options={ calcOptions(visibleItems, 'message', 40) }
                placeholder="Error message"
            />

            <Filter
                name="env"
                options={ calcOptions(visibleItems, 'env', 3) }
                placeholder="Environment"
            />

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

