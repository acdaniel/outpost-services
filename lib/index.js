var Service = require('./service');
var Entity = require('./entity');
var Link = require('./link');

module.exports = {

  Service: Service,
  Entity: Entity,
  Link: Link,

  load: function (dirs) {
    if (!Array.isArray(dirs)) {
      dirs = [dirs]
    }
    var services = {};
    for (var i = 0, l = dirs.length; i < l; i++) {
      var service = Service.load(dirs[i]);
      services[service.name] = service;
    }
    return services;
  }

};
