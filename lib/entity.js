var _ = require('lodash');
var Link = require('./link');

function Entity (options) {
  options = options || {};
  this.type = options.type;
  this.body = _.clone(options.body);
  this.meta = _.clone(options.meta) || {};
  this.actions = _.clone(options.actions) || {};
  this.links = _.clone(options.links) || {};
  this.embedded = _.clone(options.embedded) || {};
}

Entity.prototype.link = function (rel, link) {
  if (!(link instanceof Link)) {
    link = new Link(link);
  }
  this.links = this.links || {};
  link.rel = rel;
  if (this.links[rel]) {
    if (!_.isArray(this.links[rel])) {
      this.links[rel] = [this.links[rel]];
    }
    this.links[rel].push(link);
  } else {
    this.links[rel] = link;
  }
};

Entity.prototype.embed = function (rel, entity) {
  if (entity && !(entity instanceof Entity)) {
    entity = new Entity(entity);
  }
  this.embedded = this.embedded || {};
  if (this.embedded[rel]) {
    if (!_.isArray(this.embedded[rel])) {
      this.embedded[rel] = [this.embedded[rel]];
    }
    this.embedded[rel].push(entity);
  } else {
    this.embedded[rel] = entity;
  }
};

module.exports = Entity;