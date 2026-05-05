const { getBaseUrl } = require('./config');

const constants = {
    get MAIN_URL() {
        return getBaseUrl();
    },
    toString() {
        return getBaseUrl();
    },
    valueOf() {
        return getBaseUrl();
    }
};

module.exports = constants;
