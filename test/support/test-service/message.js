var db = require('../data');

module.exports = {
  
  get: function (ctx) {
    return db.findOne('messages', { to: ctx.params.username, id: ctx.params.id });
  }

};