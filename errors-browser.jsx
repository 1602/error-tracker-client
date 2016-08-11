'use strict';

import React from 'react';
import ErrorOverview from './error-overview.jsx';
import ErrorDetails from './error-details.jsx';
import Filters from './filters.jsx';
import createNotifier from './domains/client-side-notifications';
import getVisibleErrors from './domains/errors-filter';

/* global document, fetch */

const ErrorsBrowser = React.createClass({

    propTypes: {
        source: React.PropTypes.string
    },

    contextTypes: {
        store: React.PropTypes.object
    },

    getInitialState() {
        return this.context.store.getState();
    },

    reloadErrors() {
        if (!this.state.source) {
            return;
        }

        this.context.store.dispatch({type: 'RELOAD_ERRORS'});
        return fetch(this.state.source + '/errors.json')
            .then(response => response.json())
            .then(data => {
                this.context.store.dispatch({
                    type: 'ERRORS_LOADED',
                    errors: data.errors
                });
            });
    },

    connectToServer(src) {
        const notifier = createNotifier(window);
        const store = this.context.store;
        const es = new EventSource(src);

        es.onerror = e => {
            console.warn(e);
            console.info('close es');
            store.dispatch({ type: 'DISCONNECTED' });
            es.close();
            this.connectToServer(src);
        };

        es.onopen = function() {
            console.log('connected!');
            store.dispatch({ type: 'CONNECTED' });
        };

        es.onmessage = e => {
            const error = JSON.parse(e.data);
            store.dispatch({
                type: 'ERROR_ARRIVED',
                error
            });

            notifier.notify({
                subscriptionTag: error.id,
                title: error.message,
                body: error.stack,
                onClick: () => {
                    const { errors } = this.context.store.getState();
                    let index;
                    getVisibleErrors(errors.items, errors.filters).forEach((e, i) => {
                        if (e.id === error.id) {
                            index = i;
                        }
                    });
                    store.dispatch({
                        type: 'ERROR_SELECTED',
                        index
                    });
                }
            });
        };
    },

    componentDidUpdate(prevProps, prevState) {
        console.log('componentDidUpdate: ErrorDetails');
        if (prevState.source && this.state.source !== prevState.source) {
            this.reloadErrors();
        }
    },

    componentDidMount() {
        this.subscriber = this.context.store.subscribe(() => {
            this.setState(this.context.store.getState());
        });

        document.addEventListener('keydown', this.shortcutHandler);
        window.addEventListener('message', e => {
            const data = JSON.parse(e.data);
            if (data.event === 'notification_clicked' && data.entityType === 'error') {
                const { errors } = this.context.store.getState();
                let index;
                getVisibleErrors(errors.items, errors.filters).forEach((e, i) => {
                    if (String(e.id) === data.id) {
                        index = i;
                    }
                });
                this.context.store.dispatch({
                    type: 'ERROR_SELECTED',
                    index
                });

            }
        });
        this.reloadErrors();

        this.connectToServer(this.state.source + '/live-updates', this.context.store);

        window.addEventListener('online', () => {
            console.log('back online');
            this.reloadErrors();
            // this.connectToServer(this.props.source + '/live-updates', this.context.store);
            // Re-sync data with server.
        }, false);

    },

    shortcutHandler(e) {
        if (e.srcElement && e.srcElement.tagName === 'INPUT') {
            return;
        }

        const handlers = {
            '121': () => this.context.store.dispatch({type: 'TOGGLE_VIEW'}),
            '120': () => this.context.store.dispatch({type: 'TOGGLE_VIEW'}),
            // 'r'+cmd: reload
            '82': () => {
                if (e.metaKey || e.ctrlKey) {
                    this.reloadErrors();
                }
            },
            // 'j': down
            '74': () => {
                if (!(e.metaKey && e.shiftKey)) {
                    console.log('dispatch NEXT_ERROR');
                    this.context.store.dispatch({type: 'NEXT_ERROR'});
                }
            },
            // 'k': up
            '75': () => {
                this.context.store.dispatch({type: 'PREV_ERROR'});
            },
            // '/': search
            '191': () => {
                this.context.store.dispatch({type: 'SEARCH_BEGIN'});
                // vm.searchMode = 'forward';
            },
            // 'Esc'
            '27': () => {
                this.context.store.dispatch({type: 'SEARCH_END'});
                // vm.searchMode = null;
            },
            // 'e': expand all details
            '69': () => {
                this.context.store.dispatch({type: 'EXPAND_ERROR_DETAILS'});
                // vm.$broadcast('expand_all');
            },
            // 'f': display filters
            '70': () => {
                this.context.store.dispatch({type: 'DISPLAY_FILTERS'});
                // vm.$broadcast('nav');
            }
        };

        if (e.keyCode in handlers) {
            handlers[e.keyCode]();
        } else {
            console.log(e.keyCode);
        }

    },

    componentWillUnmount() {
        this.context.store.unsubscribe(this.subscriber);
        document.removeListener('keydown', this.shortcutHandler);
        // this.serverRequest.abort();
    },

    render() {
        const { store } = this.context;
        const { errors, connected } = store.getState();
        const visibleErrors = getVisibleErrors(errors.items, errors.filters);
        const error = visibleErrors[errors.activeErrorIndex];

        const errorDetails = error ? (
            <ErrorDetails

                expandAll={() => this.context.store.dispatch({
                    type: 'EXPAND_ERROR_DETAILS'
                })}

                expandDetails={(index) => this.context.store.dispatch({
                    type: 'TOGGLE_ERROR_DETAILS_NODE',
                    index
                })}

                toggleSubscription={() => this.context.store.dispatch({
                    type: 'TOGGLE_SUBSCRIPTION',
                    errorId: error.id
                })}

                {...error} />
        ) : '';

        if (!connected) {
            return <center style={{color: 'red', padding: '100px'}}>disconnected</center>;
        }

        if (this.state.view === 'settings') {
            return (
                <form
                    onSubmit={ e => {
                        store.dispatch({
                            type: 'SOURCE_CONFIGURED',
                            source: e.target.sourceUrl.value
                        });
                        e.preventDefault();
                    }} >
                    <input type="text" size="30" name="sourceUrl"
                        defaultValue={store.getState().source}
                    />
                </form>
            );
        }

        const ui = this.state.loading ? (
            <center style={{padding: '100px'}}>loading...</center>
        ) : (
            <div style={{ height: '100%', display: 'flex' }}>
                <div style={{
                    display: 'flex',
                    height: '100%',
                    width: '60%'
                }} className="panel fixed">
                    <Filters />
                    <ul className="errors-list">
                        {visibleErrors.map((error, index) => (
                            <ErrorOverview
                                error={error}
                                isActive={errors.activeErrorIndex === index}
                                onClick={() => this.context.store.dispatch({
                                    type: 'ERROR_SELECTED', index
                                })}
                                key={error.id} />))}
                    </ul>
                </div>
                <div
                    style={{ display: 'flex', height: '100%', width: '40%' }}
                    className="panel fixed">
                    {errorDetails}
                </div>
            </div>
        );
        return ui;
    }
});

export default ErrorsBrowser;

