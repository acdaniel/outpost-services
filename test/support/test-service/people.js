var db = require('../data');

module.exports = {

  get: function () {
    var people = db.find('people');
    var collection = this.createCollection('person', {
      count: people.length,
      totalCount: db.count('people'),
      page: 1,
      pageCount: 1,
      startIndex: 0,
      endIndex: people.length - 1,
      items: people
    });
    return collection;
  }

};