'use strict';

import React from 'react';

export default React.createClass({

    displayName: 'Settings',

    contextTypes: {
        store: React.PropTypes.object
    },

    getInitialState() {
        return {
            loading: false,
        };
    },

    shouldComponentUpdate() {
        return true;
    },

    componentDidUpdate() {
        console.log('componentDidUpdate: Settings');
    },

    render() {

        const component = this;
        const { store } = this.context;
        const { sources } = store.getState();
        const { loading } = component.state;

        return (
            <div className="settings">
                <ul className="sources-list">
                    { sources.map((source, index) => (
                    <li key={ index }>
                        <label>
                            <input
                                type="checkbox"
                                checked={ source.enabled }
                                onChange={ e => store.dispatch({
                                    type: 'SOURCE_CONFIGURED',
                                    index,
                                    enabled: e.target.checked
                                })} />
                            { source.url }
                        </label>
                        <a href="#" onClick={ () => store.dispatch({
                            type: 'SOURCE_REMOVED',
                            index
                            })}
                        >&times;</a>
                    </li>
                    )) }
                </ul>
                <form
                    onSubmit={ e => {
                        e.preventDefault();
                        addSource(this.refs.sourceUrl.value)
                            .then(() => this.refs.sourceUrl.value = '')
                    }} >
                    <input
                        disabled={ loading }
                        type="text"
                        size="30"
                        name="sourceUrl"
                        ref="sourceUrl" />
                </form>
            </div>
        );

        function addSource(url) {
            component.setLoading(true);
            return fetch(url + '/status.json')
                .then(r => r.json())
                .then(status => {
                    if (status.version) {
                        store.dispatch({ type: 'SOURCE_ADDED', url });
                    }
                })
                .catch(err => {
                    console.error('addSource error', err);
                })
                .then(() => component.setLoading(false));
        }
    },

    setLoading(loading) {
        this.setState(prevState => ({ ...prevState, loading }));
    }
});

