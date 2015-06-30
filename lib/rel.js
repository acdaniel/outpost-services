var uriTemplate = require('uri-template');
var Link = require('./link');

function Rel (resource, def) {
  this.resource = resource;
  this.name = def.name;
  this.uri = def.uri;
  this.template = def.template;
  this.type = def.type || this.resource.name;
  this.params = def.params;
  this.title = def.title;
}

Rel.prototype.checkTargetAuthorization = function (granted) {
  var resource = this.resource.service.getResource(this.type);
  return resource.getAction('get').checkAuthorization(granted);
};

Rel.prototype.buildTargetLink = function (params) {
  if (this.uri) {
    return new Link({
      rel: this.name,
      href: this.uri,
      title: this.title
    });
  }
  if (this.template) {
    return new Link({
      rel: this.name,
      href: uriTemplate.expand(this.template, params),
      title: this.title
    });
  }
  var resource = this.resource.service.getResource(this.type);
  return resource.buildLink(params, this.rel, this.title);
};

Rel.prototype.getTargetEntity = function (ctx) {
  var resource = this.resource.service.getResource(this.type);
  var action = resource.getAction('get');
  return action.invoke(ctx);
};

module.exports = Rel;
