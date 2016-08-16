'use strict';

import React, { PropTypes } from 'react';
import moment from 'moment';

export default React.createClass({

    displayName: 'Settings',

    getInitialState() {
        return {
            loading: false,
            metaData: {}
        };
    },

    propTypes: {
        sources: PropTypes.array.isRequired,

        onSourceAdded: PropTypes.func,
        onSourceRemoved: PropTypes.func,
        onSourceConfigured: PropTypes.func
    },

    loadMetaData(url) {
        this.setState({ loading: true });
        let err = null;
        let res = null;
        return fetch(url + '/status.json')
            .then(r => r.json())
            .then(s => {
                this.setState(prevState => {
                    return {
                        ...prevState,
                        metaData: {
                            ...prevState.metaData,
                            [url]: s
                        }
                    };
                });
                res = s;
            })
            .catch(e => {
                err = e;
            })
            .then(() => this.setState({ loading: false }))
            .then(() => {
                if (err) {
                    throw err;
                }
                return res;
            });
    },

    render() {

        const {
            sources,
            onSourceAdded,
            onSourceRemoved,
            onSourceConfigured
        } = this.props;

        const { loading, metaData } = this.state;

        return (
            <div className="settings">
                <ul className="sources-list">
                    { sources.map((source, index) => (
                    <li key={ index }>
                        <label>
                            <input
                                type="checkbox"
                                checked={ source.enabled }
                                onChange={ e => onSourceConfigured(
                                    index,
                                    e.target.checked)
                                }
                            />
                            { source.url }
                            { ' ' }
                            { metaData[source.url]
                                ? <span> { metaData[source.url].stats.count } events, {moment(Date.now() - metaData[source.url].stats.timeSinceLastEvent).fromNow(true) } since last event</span>
                                : <a href="#" onClick={
                                    () => this.loadMetaData(source.url)
                                }>check</a>
                            }
                        </label>
                        { ' ' }
                        <a href="#" onClick={ () => onSourceRemoved(index) }
                        >&times;</a>
                    </li>
                    )) }
                </ul>
                <form
                    onSubmit={ e => {
                        e.preventDefault();
                        const url = this.refs.sourceUrl.value;
                        this.loadMetaData(url)
                            .then(status => {
                                if (status && status.version) {
                                    onSourceAdded(url);
                                }
                            })
                            .catch(err => {
                                console.error('addSource error', err);
                            })
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

    }

});

