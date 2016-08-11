'use strict';

export default getVisibleErrors;

function getVisibleErrors(errors, filters) {
    return errors.filter(e => {
        // const filteredBySearch = !this.search ||
        // e.message && e.message.indexOf(this.search) > -1;
        const filteredByHost = checkErr(e.host, filters.host);
        const filteredByApp = checkErr(e.app, filters.app);
        const filteredByEnv = checkErr(e.env, filters.env);
        const filteredBySeverity = checkErr(e.type, filters.severity);

        return filteredByApp && filteredByEnv && filteredBySeverity
            && filteredByHost/* && filteredBySearch */;

    });

}

function checkErr(prop, filter) {

    return filter.selected === -1 ||
        prop.indexOf(
            filter.options[filter.selected]
        ) === 0;
}

