'use strict';

import React from 'react';
import { connect } from 'react-redux';
import Errors from './containers/errors.jsx';
import Settings from './settings.jsx';
import createNotifier from './domains/client-side-notifications';

/* global document, fetch */

const ErrorsBrowser = React.createClass({

    propTypes: {
        source: React.PropTypes.string
    },

    contextTypes: {
        store: React.PropTypes.object
    },

    reloadErrors() {
        const { store } = this.context;
        const { sources } = store.getState();
        // const sources = [
        // cons{ url: 'http://localhost:8090/data/production', enabled: true },
        // cons{ url: 'http://localhost:8090/data/staging', enabled: true },
        // cons{ url: 'http://errors.loc.ub.io', enabled: true },
        // ]

        if (!sources) {
            return;
        }

        return sources
            .filter(s => s.enabled)
            .reduce((flow, source) => {
                return flow.then(() => {
                    store.dispatch({
                        type: 'STATUS_UPDATE',
                        text: `Loading data from ${ source.url }`
                    });
                    return fetch(`${source.url}/errors.json`);
                })
                    .then(response => response.json())
                    .then(data => store.dispatch({
                        type: 'ERRORS_LOADED',
                        errors: data.errors
                    }));
            }, Promise.resolve())
            .then(() => {
                store.dispatch({
                    type: 'STATUS_UPDATE',
                    text: `All done`,
                    timeout: 1000
                });
            })
            .catch(err => {
                store.dispatch({
                    type: 'STATUS_UPDATE',
                    text: err.message
                });
            });
    },

    liveUpdates(src) {
        const notifier = createNotifier(window);
        const { store } = this.context;
        const es = new EventSource(src);

        es.onerror = () => {
            store.dispatch({
                type: 'STATUS_UPDATE',
                text: 'Disconnected from live updates stream'
            });
            es.close();
            setTimeout(() => this.liveUpdates(src), 1000);
        };

        es.onopen = function() {
            store.dispatch({
                type: 'STATUS_UPDATE',
                text: 'Conneted to live updates stream',
                timeout: 1000
            });
        };

        es.onmessage = e => {
            const data = JSON.parse(e.data);
            const { id, message, stack } = data;
            store.dispatch({ type: 'ERROR_ARRIVED', error: data });
            notifier.notify({
                subscriptionTag: id,
                title: message,
                body: stack,
                onClick: () => store.dispatch({ type: 'ERROR_SELECTED', id })
            });
        };
    },

    componentDidMount() {
        const { sources } = this.context.store.getState();
        this.subscriber = this.context.store.subscribe(() => {
            this.setState(this.context.store.getState());
        });

        document.addEventListener('keydown', this.shortcutHandler);
        document.addEventListener('keyup', this.delayedShortcutHandler);

        window.addEventListener('message', e => {
            if (typeof e.data === 'string') {
                try {
                    const { event, entityType, id } = JSON.parse(e.data);
                    if (event === 'notification_clicked' && entityType === 'error') {
                        this.context.store.dispatch({
                            type: 'ERROR_SELECTED',
                            id
                        });
                    }
                } catch (err) {
                    console.error(err, e.data);
                }
            }
        });

        this.reloadErrors();

        if (sources) {
            /*
            return ;
            sources.forEach(source =>
                this.liveUpdates(source.url + '/live-updates', this.context.store)
            );
            */
        }

        window.addEventListener('online', () => {
            console.log('back online');
            this.reloadErrors();
            // this.liveUpdates(this.props.source + '/live-updates', this.context.store);
            // Re-sync data with server.
        }, false);

    },

    toggleSettings() {
        this.setState({
            view: this.state.view === 'browse'
                ? 'settings'
                : 'browse'
        });
    },

    delayedShortcutHandler(e) {
        if (e.srcElement && e.srcElement.tagName === 'INPUT') {
            return;
        }

        const { store } = this.context;

        if (e.keyCode === 74 || e.keyCode === 75) {
            store.dispatch({ type: 'ERROR_SELECTED' });
        }

    },

    shortcutHandler(e) {
        if (e.srcElement && e.srcElement.tagName === 'INPUT') {
            return;
        }

        const { store } = this.context;

        const handlers = {
            // cmd
            '93': () => {
                // do nothing (for now);
            },
            // cmd+, (cmd+comma): settings
            '188': () => {
                e.preventDefault();
                if (e.metaKey || e.ctrlKey) {
                    this.toggleSettings();
                }
            },
            // fallback to F10 for those who use win/linux
            '121': () => this.toggleSettings(),
            // 'r'+cmd: reload
            '82': () => {
                if (e.metaKey || e.ctrlKey) {
                    this.reloadErrors();
                }
            },
            // 'j': down
            '74': () => {
                if (!(e.metaKey && e.shiftKey)) {
                    store.dispatch({ type: 'NEXT_ERROR' });
                }
            },
            // 'k': up
            '75': () => {
                store.dispatch({ type: 'PREV_ERROR' });
            },
            // 'e': expand all details
            '69': () => {
                store.dispatch({ type: 'EXPAND_ERROR_DETAILS' });
                // vm.$broadcast('expand_all');
            },
        };

        if (e.keyCode in handlers) {
            handlers[e.keyCode]();
        } else {
            console.log(e.keyCode);
        }

    },

    componentWillUnmount() {
        // this.context.store.unsubscribe(this.subscriber);
        document.removeListener('keydown', this.shortcutHandler);
        document.removeListener('keyup', this.delayedShortcutHandler);
        // this.serverRequest.abort();
    },

    getInitialState() {
        return { view: 'browse' };
    },

    render() {
        const { view } = this.state;

        switch (view) {
            case 'settings':
                return <Settings />;
            case 'browse':
                return <Errors />;
        }

    }
});

export default connect()(ErrorsBrowser);

