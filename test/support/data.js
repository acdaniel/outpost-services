var sift = require('sift');

var data = {
  people: [
    { username: 'bob', firstName: 'Bob', lastName: 'Gunderson' },
    { username: 'john', firstName: 'John', lastName: 'Smith' },
    { username: 'jane', firstName: 'Jane', lastName: 'Doe' }
  ],
  messages: [
    { id: 1, to: 'bob', from: 'jane', message: 'hello bob. -jane' },
    { id: 2, to: 'bob', from: 'john', message: 'hello bob. -john'},
    { id: 3, to: 'jane', from: 'bob', message: 'nice to meet you jane. -bob' }
  ]
};

module.exports = {
  
  create: function (collection, obj) {
    data[collection].push(obj);
  },

  find: function (collection, where) {
    where = where || {};
    return sift(where, data[collection]);
  },

  findOne: function (collection, where) {
    where = where || {};
    var arr = sift(where, data[collection]);
    return arr ? arr[0] : undefined;
  },

  count: function (collection, where) {
    var arr = sift(where, data[collection]);
    return arr ? arr.length : 0;
  },

  update: function (collection, where, data) {
    var updatedCount = 0;
    var filter = sift(where);
    for (var i = 0, l = data[collection].length; i < l; i++) {
      if (filter(data[collection][i])) {
        for (var p in data) {
          arr[i][p] = data[p];
        }
        updatedCount++;
      }
    }
    return updatedCount;
  },

  remove: function (collection, where) {
    where = where || {};    
    var deletedCount = 0;
    var filter = sift(where);
    for (var i = data[collection].length - 1; i >= 0; i--) {
      if (filter(data[collection][i])) {
        data[collection].splice(i, 1);
        deletedCount++;
      }
    }
    return deletedCount;
  }

};