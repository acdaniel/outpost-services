var chai = require('chai');
var util = require('util');

var expect = chai.expect;

describe('Action', function () {
  
  var Service = require('../lib/service');
  var Action = require('../lib/action');
  var Entity = require('../lib/entity');
  var Collection = require('../lib/collection');

  describe('.createEntity()', function () {
    
    it('should return a proper Entity', function () {
      var action = new Action(null, {
        name: 'test',
        output: { type: 'object' }
      });
      var entity = action.createEntity({ foo: 'bar' });
      expect(entity).to.exist();
      expect(entity).to.be.instanceOf(Entity);
      expect(entity.type).to.equal('object');
      expect(entity.body).to.eql({ foo: 'bar' });
    });

  });

  describe('.checkAuthorization()', function () {
    
    it('should return true if no auth on action', function () {
      var action = new Action(null, {
        name: 'test',
        output: { type: 'test' }
      });
      expect(action.checkAuthorization(['test'])).to.be.true();
    });

    it('should return false if action scope is not granted', function () {
      var action = new Action(null, {
        name: 'test',
        output: { type: 'test' },
        auth: ['test', 'test.read']
      });
      expect(action.checkAuthorization(['test.write'])).to.be.false();
    });

    it('should return matched action scopes if granted ', function () {
      var action = new Action(null, {
        name: 'test',
        output: { type: 'test' },
        auth: ['test', 'test.read']
      });
      expect(action.checkAuthorization(['test'])).to.eql(['test']);
    });

  });

  describe('.invoke()', function () {
    
    it('should execute the implementation function and return an entity', function (done) {
      var service = Service.load('./test/support/test-service');
      var person = service.getResource('person');
      person
        .getAction('get')
        .invoke({ auth: { scope: ['people', 'messages'] }, params: { username: 'bob' } })
        .then(function (entity) {
          expect(entity).to.exist();
          expect(entity).to.be.instanceOf(Entity);
          done();
        })
        .done(null, done);
    });

    it('should execute the implementation function and return a collection', function (done) {
      var service = Service.load('./test/support/test-service');
      var res = service.getResource('messages');
      res
        .getAction('get')
        .invoke({ auth: { scope: ['people', 'messages'] }, params: { username: 'bob' }  })
        .then(function (collection) {
          expect(collection).to.exist();
          expect(collection).to.be.instanceOf(Collection);
          done();
        })
        .done(null, done);
    });

  });

});