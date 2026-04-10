const crudHandlers = require('./crudHandlers');
const importHandlers = require('./importHandlers');
const wishHandlers = require('./wishHandlers');

module.exports = {
    ...crudHandlers,
    ...importHandlers,
    ...wishHandlers
};
