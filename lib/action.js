var _ = require('lodash');
var q = require('q');
var path = require('path');
var di = require('outpost-di');
var InputOutput = require('./input-output');
var Entity = require('./entity');
var Collection = require('./collection');
var Link = require('./link');

var SCHEMA_TYPES = ['array', 'boolean', 'integer', 'number', 'null', 'object', 'string'];

function Action (resource, def, fn) {
  var service = resource ? resource.service : undefined;
  this.resource = resource;
  this.name = def.name;
  this.input = def.input ? new InputOutput(service, def.input) : undefined;
  this.output = def.output ? new InputOutput(service, def.output) : undefined;
  this.auth = def.auth;
  this.fn = fn;
}

Action.prototype.createEntity = function (body, meta) {
  return new Entity({ type: this.output.schema.type, body: body, meta: meta });
};

Action.prototype.createCollection = function (itemType, body) {
  return new Collection({
    type: this.output.schema.type,
    itemType: itemType,
    body: body
  });
};

Action.prototype.checkAuthorization = function (granted) {
  if (!this.auth || !this.auth.scope) { return true; }
  var commonScope = _.intersection(this.auth.scope, granted);
  return _.isEmpty(commonScope) ? false : commonScope;
};

Action.prototype.invoke = function (ctx) {
  var granted = ctx.auth ? ctx.auth.scope : [];
  if (!this.checkAuthorization(granted)) {
    var err = new Error('UNAUTHORIZED');
    err.status = 401;
    return q.reject(err);
  }
  try {
    if (this.input) {
      this.input.validate(ctx.params.input || {});
    }
    return q(di.invoke(this.fn, { ctx: ctx, params: ctx.params, auth: ctx.auth }, this))
      .then(function (output) {
        var entity = output;
        if (!(output instanceof Entity)) {
          entity = this.createEntity(output);
        }
        if (this.output) {
          this.output.validate(entity.body);
        }
        return this.finalizeEntity(entity, ctx);
      }.bind(this));
  } catch (err) {
    return q.reject(err);
  }
};

Action.prototype.finalizeEntity = function (entity, ctx) {
  if (!entity.type || SCHEMA_TYPES.indexOf(entity.type) !== -1) {
    return q.resolve(entity);
  }
  var resource = this.resource.service.getResource(entity.type);
  if (!resource) {
    return q.reject(new Error('Invalid resource type: ' + entity.type));
  }

  // finalize collection
  if (entity instanceof Collection) {
    entity.body.count = entity.body.items.length;
    if ('undefined' === typeof entity.body.page || entity.body.page < 1) {
      entity.body.page = 1;
    }
    // finalize collection items
    for (var i = 0, l = entity.body.items.length; i < l; i++) {
      var item = entity.body.items[i];
      if (!(item instanceof Entity)) {
        entity.body.items[i] = new Entity({
          type: entity.itemType,
          body: item
        });
      }
      this.finalizeEntity(entity.body.items[i], ctx);
    }
  }

  // populate actions
  var actions = resource.getActions();
  actions.forEach(function (action) {
    if (action.checkAuthorization(ctx.auth.scope)) {
      entity.actions[action.name] = {
        // name: a,
        input: action.input ? action.input.schema : undefined,
        output: action.output ? action.output.schema : undefined,
      };
    }
  });

  // populate rels
  var paramsSource = _.merge({}, entity.body, ctx.params);
  if (!resource.getRel('self')) {
    entity.link('self', resource.buildLink(paramsSource, 'self'));
  }
  var rels = resource.getRels();
  var embed = ctx.params && ctx.params._embed ? ctx.params._embed.split(/,?\s+/) : false;
  var promises = [];
  for (var r in rels) {
    var rel = rels[r];
    if (entity instanceof Collection) {
      if (r === 'prev' && entity.body.page <= 1) {
        continue;
      }
      if (r === 'next' && entity.body.page >= entity.body.pageCount) {
        continue;
      }
    }
    var relCtx = _.clone(ctx);
    relCtx.params = {};
    var isEmbedded = (embed && embed.indexOf(r) >= 0);
    if (!rel.checkTargetAuthorization(ctx.auth.scope)) {
      continue;
    }
    // build rel params
    for (var rp in rel.params) {
      var relParam = rel.params[rp];
      if (relParam.substr(0, 1) === '$') {
        if (relParam.substr(-2) === '++') {
          relCtx.params[rp] = parseInt(paramsSource[relParam.substr(1, relParam.length - 3)]) + 1;
        } else if (relParam.substr(-2) === '--') {
          relCtx.params[rp] = parseInt(paramsSource[relParam.substr(1, relParam.length - 3)]) - 1;
        } else {
          relCtx.params[rp] = paramsSource[relParam.substr(1)];
        }
      } else {
        relCtx.params[rp] = relParam;
      }
    }
    if (isEmbedded) {
      promises.push(
        rel.getTargetEntity(relCtx)
          .then(function (childEntity) {
            entity.embed(rel.name, childEntity);
            return entity;
          })
          .catch(function (e) {
            throw e;
          })
        );
    } else {
      entity.link(rel.name, rel.buildTargetLink(relCtx.params));
    }
  }
  return q.allSettled(promises)
    .then(function () {
      return entity;
    });
};

module.exports = Action;
