var chai = require('chai');

var expect = chai.expect;

describe('Service', function () {
  
  var Service = require('../lib/service');
  var Resource = require('../lib/resource');

  describe('#constructor', function () {
    
    it('should create a service with the proper def', function () {
      var def = {
        name: 'TestService',
        info: {
          title: 'Test',
          description: 'This is a test service'
        }
      };
      var service = new Service(def);
      expect(service.title).to.equal(def.title);
      expect(service.description).to.equal(def.description);
      expect(service.path).to.equal(def.path);
    });

  });

  describe('.addResource()', function () {
    
    it('should add the resource to the service', function () {
      var def = {
        name: 'TestService',
        info: {
          title: 'Test',
          description: 'This is a test service'
        }
      };
      var service = new Service(def);
      var resDef = { name: 'TestResource' };
      var resImpl = {};
      service.addResource(resDef, resImpl);
      expect(service.getResource(resDef.name).name).to.equal(resDef.name);
    });

  });

  describe('.getResource()', function () {
    
    it('should return a resource if it exists', function () {
      var service = Service.load('./test/support/test-service/index.json');
      var res1 = service.getResource('people');
      var res2 = service.getResource('PEOPLE');
      expect(res1).to.exist();
      expect(res2).to.exist();
      expect(res1).to.equal(res2);
    });

  });

  describe('.load()', function () {
    
    it('should load a service definition from a file', function () {
      var service = Service.load('./test/support/test-service/index.json');
      expect(service).to.exist();
    });

    it('should load a service definition from a directory', function () {
      var service = Service.load('./test/support/test-service');
      expect(service).to.exist();
    });

  });

});