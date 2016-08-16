'use strict';

import React from 'react';
import Filter from '../containers/filter.jsx';

export default Filters;

function Filters() {
    return (
        <div style={{ marginTop: '7px', marginBottom: '3px' }}>
            <Filter
                name="app"
                propName="app"
                placeholder="App name"
            />

            <Filter
                name="msg"
                width={ 200 }
                propName="message"
                placeholder="Error message"
            />

            <Filter
                name="env"
                propName="env"
                placeholder="Environment"
            />

        </div>
    );
}

