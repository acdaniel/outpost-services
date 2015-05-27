var _ = require('lodash');
var path = require('path');
var url = require('url');
var uriTemplate = require('uri-template');
var Action = require('./action');
var Rel = require('./rel');
var Link = require('./link');

function Resource (service, def, impl) {
  this.service = service;
  this.name = def.name;
  this.description = def.description || '';
  this.path = def.path || '';
  this.schema = def.schema || { type: 'object' };
  this._actions = {};
  this._rels = {};
  // build fullPath
  this.fullPath = path.join(this.service.basePath, this.path);
  this._uriTemplate = uriTemplate.parse(this.fullPath);
  this._pathParams = [];
  for (var i = 0, el = this._uriTemplate.expressions.length; i < el; i++) {
    var exp = this._uriTemplate.expressions[i];
    if (exp.params) {
      for (var j = 0, pl = exp.params.length; j < pl; j++) {
        this._pathParams.push(exp.params[j].name);
      }
    }
  }
  this.pattern = this._buildRegex();
  // add actions
  for (var actionName in def.actions) {
    var actionDef = def.actions[actionName];
    actionDef.name = actionName;
    this.addAction(actionDef, impl[actionName]);
  }
  // add rels
  for (var relName in def.rels) {
    var relDef = def.rels[relName];
    relDef.name = relName;
    this.addRel(relDef);
  }
}

Resource.prototype.addAction = function (def, fn) {
  this._actions[def.name.toLowerCase()] = new Action(this, def, fn);
};

Resource.prototype.getAction = function (name) {
  return this._actions[name.toLowerCase()];
};

Resource.prototype.getActions = function () {
  return this._actions;
};

Resource.prototype.addRel = function (def) {
  this._rels[def.name.toLowerCase()] = new Rel(this, def);
};

Resource.prototype.getRel = function (name) {
  return this._rels[name.toLowerCase()];
};

Resource.prototype.getRels = function () {
  return this._rels;
};

Resource.prototype.matches = function (uri) {
  if (_.isString(uri)) {
    uri = url.parse(uri, true);
  }
  var results = this.pattern.exec(uri.path);
  if (!results) { return false; }
  var params = uri.query;
  for (var i = 0, l = this._pathParams.length; i < l; i++) {
    params[this._pathParams[i]] = results[i + 1];
  }
  return params;
};

Resource.prototype.buildUri = function (params) {
  params = params || {};
  // TODO return undefined if missing path any params
  return this._uriTemplate.expand(params);
};

Resource.prototype.buildLink = function (params, rel, text) {
  return new Link({
    href: this.buildUri(params),
    rel: rel,
    title: text,
    template: this.fullPath
  });
};

Resource.prototype._buildRegex = function () {
  var valReg = '((?:[\\w.~-]|(?:%[0-9A-F]{2}))+)';
  var matchableExps = ['SimpleExpression', 'NamedExpression',
    'ReservedExpression', 'LabelExpression', 'PathSegmentExpression',
    'PathParamExpression'];
  var escape = function (str) {
    str = str || '';
    return str.replace(/[.*+?|()\[\]{}\\]/g, '\'$&') ;
  };
  var regex = escape(this._uriTemplate.prefix);
  this._uriTemplate.expressions.forEach(function (exp, i) {
    var delim = '';
    regex += escape(exp.prefix);
    if (matchableExps.indexOf(exp.constructor.name) >= 0) {
      regex += escape(exp.first);
      exp.params.forEach(function () {
        regex += delim + valReg;
        delim = escape(exp.sep);
      });
      regex += escape(exp.last);
    }
    regex += escape(exp.suffix);
  }.bind(this));
  regex += escape(this._uriTemplate.suffix);
  return new RegExp('^' + regex + '(?:\\?.*(?=$))?$', 'i');
};


module.exports = Resource;
