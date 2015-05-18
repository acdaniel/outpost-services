var _ = require('lodash');
var util = require('util');
var Entity = require('./entity');

function Collection (options) {
  Entity.apply(this, arguments);
  this.itemType = options.itemType;
  this.body = _.merge({}, options.body, {
    count: 0,
    items: []
  });
  if (options.items) {
    this.body.items = options.items;
    this.body.count = this.body.items.length;
  }
}

util.inherits(Collection, Entity);

Collection.prototype.addItem = function (obj) {
  this.body.items.push(new Entity({
    type: this.itemType,
    body: obj
  }));
  this.body.count += 1;
};

module.exports = Collection;
