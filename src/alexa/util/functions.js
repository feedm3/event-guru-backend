'use strict';

const isFunction = (obj) => {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};

module.exports = {
    isFunction
};
