var db = require('../data');

module.exports = {
  
  get: function (ctx) {
    var messages = db.find('messages', { to: ctx.params.username });
    var collection = this.createCollection('message', {
      count: messages.length,
      totalCount: db.count('messages'),
      page: 1,
      pageCount: 1,
      startIndex: 0,
      endIndex: messages.length - 1,
      items: messages
    });
    return collection;
  }

};