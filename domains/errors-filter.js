'use strict';

export default getVisibleErrors;

function getVisibleErrors(errors, filters) {
    return errors.filter(e => {
        const filteredBySearch = checkErr(e.message, filters.msg);
        const filteredByApp = checkErr(e.app, filters.app);
        const filteredByEnv = checkErr(e.env, filters.env);

        return filteredByApp && filteredByEnv && filteredBySearch;
    });

}

export function extendedFilter(errors, filters) {
    const result = {
        visible: [],
        hidden: [],
        explainHidden: {
            message: 0,
            app: 0,
            env: 0
        }
    };

    errors.forEach(e => {
        if (!checkErr(e.app, filters.app)) {
            result.explainHidden.app += 1;
            result.hidden.push(e);
        } else if (!checkErr(e.message, filters.msg)) {
            result.explainHidden.message += 1;
            result.hidden.push(e);
        } else if (!checkErr(e.env, filters.env)) {
            result.explainHidden.env += 1;
            result.hidden.push(e);
        } else {
            result.visible.push(e);
        }
    });

    return result;
}

function checkErr(prop, filter) {
    return filter === '' || prop.indexOf(filter) === 0;
}

