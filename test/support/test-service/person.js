var db = require('../data');

module.exports = {

  get: function (ctx) {
    return db.findOne('people', { username: ctx.params.username });
  }
  
};