/* global localStorage, chrome */

export default createNotifier;

function createNotifier(win) {
    const storage = typeof chrome === 'undefined' ? localStorage : {};
    if (!win.Notification) {
        return function() {};
    }

    if (win.Notification.permission !== 'granted') {
        win.Notification.requestPermission();
    }

    /**
     * Notiication modes:
     *  - whitelist: subscribe to whitelisted tags only
     *  - blacklist: subscribe to all expect blacklisted
     */
    let mode = storage.notificationMode || 'blacklist';

    return {
        notify,
        subscribe,
        unsubscribe,
        isSubscribed,
        setMode,
        getMode: () => mode,
    };

    function setMode(newMode) {
        mode = newMode === 'whitelist' ? newMode : 'blacklist';
        storage.notificationMode = mode;
    }

    function subscribe(tag) {
        const key = getKey(tag);
        if (mode === 'blacklist') {
            delete storage[key];
        } else {
            storage[key] = '1';
        }
    }

    function unsubscribe(tag) {
        const key = getKey(tag);
        if (mode === 'whitelist') {
            delete storage[key];
        } else {
            storage[key] = '0';
        }
    }

    function isSubscribed(tag) {
        const key = getKey(tag);
        if (mode === 'whitelist') {
            return storage[key] === '1';
        }
        return storage[key] !== '0';
    }

    function getKey(str) {
        return 'subscribe:' + str;
    }

    function notify(spec) {

        if (win.Notification.permission !== 'granted') {
            return null;
        }

        if (!isSubscribed(spec.subscriptionTag)) {
            return null;
        }

        const notification = new win.Notification(spec.title, {
            body: spec.body,
            tag: spec.title
        });

        notification.onclick = function(e) {
            if (typeof spec.onClick === 'function') {
                window.focus();
                spec.onClick(e);
                notification.close();
            }
        };

        return notification;

    }

}

