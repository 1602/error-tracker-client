'use strict';

import React from 'react';
import ErrorOverview from './error-overview.jsx';
import ErrorDetails from './error-details.jsx';
import Settings from './settings.jsx';
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
        const { sources } = this.state;
        if (!sources) {
            return;
        }

        this.context.store.dispatch({ type: 'RELOAD_ERRORS' });

        return Promise.all(sources
            .filter(s => s.enabled)
            .map(source => fetch(`${source.url}/errors.json`))
        )
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(datas => {
                datas.forEach(data => this.context.store.dispatch({
                    type: 'ERRORS_LOADED',
                    errors: data.errors
                }));
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
                        id: error.id
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
            const { event, entityType, id } = JSON.parse(e.data);
            if (event === 'notification_clicked' && entityType === 'error') {
                this.context.store.dispatch({ type: 'ERROR_SELECTED', id });
            }
        });

        this.reloadErrors();

        if (this.state.sources) {
            this.state.sources.forEach(source =>
                this.connectToServer(source.url + '/live-updates', this.context.store)
            );
        }

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
            // cmd
            '93': () => {
                // do nothing (for now);
            },
            // cmd+, (cmd+comma): settings
            '188': () => {
                e.preventDefault();
                if (e.metaKey || e.ctrlKey) {
                    this.context.store.dispatch({ type: 'TOGGLE_SETTINGS' });
                }
            },
            // fallback to F10 for those who use win/linux
            '121': () => this.context.store.dispatch({ type: 'TOGGLE_SETTINGS' }),
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
                    this.context.store.dispatch({ type: 'NEXT_ERROR' });
                }
            },
            // 'k': up
            '75': () => {
                this.context.store.dispatch({ type: 'PREV_ERROR' });
            },
            // '/': search
            '191': () => {
                this.context.store.dispatch({ type: 'SEARCH_BEGIN' });
                // vm.searchMode = 'forward';
            },
            // 'Esc'
            '27': () => {
                this.context.store.dispatch({ type: 'SEARCH_END' });
                // vm.searchMode = null;
            },
            // 'e': expand all details
            '69': () => {
                this.context.store.dispatch({ type: 'EXPAND_ERROR_DETAILS' });
                // vm.$broadcast('expand_all');
            },
            // 'f': display filters
            '70': () => {
                this.context.store.dispatch({ type: 'DISPLAY_FILTERS' });
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
        const error = visibleErrors.find(err => err.id === errors.activeErrorId);

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

        if (this.state.view === 'settings') {
            return (<Settings />);
        }

        if (!connected) {
            return <center style={{color: 'red', padding: '100px'}}>disconnected</center>;
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
                                isActive={errors.activeErrorId === error.id}
                                onClick={() => this.context.store.dispatch({
                                    type: 'ERROR_SELECTED',
                                    id: error.id
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

