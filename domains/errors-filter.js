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

function checkErr(prop, filter) {
    return filter === '' || prop.indexOf(filter) === 0;
}

