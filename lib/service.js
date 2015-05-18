var _ = require('lodash');
var os = require('os');
var fs = require('fs');
var path = require('path');
var debug = require('debug')('outpost-services');
var Jsonnet = require('jsonnet');
var Resource = require('./resource');

function Service (def) {
  if (!def.name) {
    throw new Error('service name is required');
  }
  this.name = def.name;
  this.basePath = def.basePath || '/';

  this.info = {
    title: def.info ? def.info.title : '',
    description: def.info ? def.info.description : '',
    termsOfService: def.info ? def.info.termsOfService : '',
    contact: {
      name: def.info && def.info.contact ? def.info.contact.name : '',
      url: def.info && def.info.contact ? def.info.contact.url : '',
      email: def.info && def.info.contact ? def.info.contact.email : ''
    },
    license: {
      name: def.info && def.info.license ? def.info.license.name : '',
      url: def.info && def.info.license ? def.info.license.url : ''
    },
    version: def.info ? def.info.version : ''
  };
  this._resources = {};
}

Service.load = function (file) {
  var parser = new Jsonnet();
  var defFile = path.resolve(file);
  if (fs.statSync(defFile).isDirectory()) {
    defFile = path.join(defFile, 'index.json');
  }
  var defDir = path.dirname(defFile);
  var def = parser.eval(fs.readFileSync(defFile));
  var service = new Service(def);
  var indexDef = {
    name: 'index',
    path: '',
    description: service.info.description,
    actions: {
      get: {
        output: { type: 'index' }
      }
    }
  };
  service.addResource(indexDef, {
    get: function () {
      var entity = this.createEntity({
        name: service.name,
        basePath: service.basePath,
        info: service.info
      });
      for (var r in service._resources) {
        var resource = service._resources[r];
        entity.link(r, resource.buildLink({}, r));
      }
      return entity;
    }
  });

  var resFiles = fs.readdirSync(defDir);
  for (var i = 0, l = resFiles.length; i < l; i++) {
    var resDef;
    var resImpl;
    var resFile = path.join(defDir, resFiles[i]);
    var resFileExt = path.extname(resFile);
    var resFileName = path.basename(resFile, resFileExt);
    if (resFileExt === '.json' && resFileName !== 'index') {
      resDef = parser.eval(fs.readFileSync(resFile));
      resImpl = require(path.join(defDir, resFileName + '.js'));
      resDef.name = resFileName;
      service.addResource(resDef, resImpl);
    }
  }
  return service;
};

Service.prototype.addResource = function (def, impl) {
  var resource = new Resource(this, def, impl);
  this._resources[def.name.toLowerCase()] = resource;
  return this;
};

Service.prototype.getResource = function (name) {
  return this._resources[name.toLowerCase()];
};

Service.prototype.getResources = function () {
  return _.values(this._resources);
};

module.exports = Service;
