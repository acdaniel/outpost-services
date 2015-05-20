var jsonValidator = require('is-my-json-valid');
var _ = require('lodash');
var q = require('q');

var SCHEMA_TYPES = ['array', 'boolean', 'integer', 'number', 'null', 'object', 'string'];

function InputOutput (service, schema) {
  this.service = service;
  this.schema = schema || { type: 'object' };
  this._validator = null;
  // if the schema type references a resource, wait to load it
  if (!schema.type || SCHEMA_TYPES.indexOf(schema.type) !== -1) {
    this._validator = jsonValidator(this.schema);
  }
}

InputOutput.prototype.validate = function (data) {
  if (!this._validator && this.schema.type) {
    var resource = this.service.getResource(this.schema.type);
    if (!resource) {
      throw new Error('Invalid resource type "' + this.schema.type + '" given in schema');
    }
    this._validator = jsonValidator(resource.schema || { type: 'object' });
  }
  var pass = this._validator(data);
  if (!pass) {
    var err = this._validator.errors[0];
    throw err;
  }
  return pass;
};

module.exports = InputOutput;
