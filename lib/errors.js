var util = require('util');

// Errors
// ---

var errors = {
  // Requestor is not authorized to access the requested resource.
  'Unauthorized': { status: 401, message: 'User or client is not authorized' },
  // The requested resource action has not been implemented.
  'NotImplemented': { status: 501, message: ' Not implemented' },
  // A request was given that does not matched defined requirements.
  'ValidationError': { status: 400 },
  // The requested resource was not found.
  'NotFound': { status: 404, message: 'Resource not found' }
};

function ServerError(args, constr) {
  constr = arguments[arguments.length - 1];
  Error.captureStackTrace(this, constr || this);
  this.status = 500;
  this.message = arguments.length > 1 ? arguments[0] : 'Error';
}
util.inherits(ServerError, Error);
ServerError.prototype.name = 'ServerError';
ServerError.prototype.toString = function () {
  return this.name + ': ' + this.message;
};

exports.ServerError = ServerError;

var factory = function (errName, errOptions) {
  var constr = function () {
    var args = Array.prototype.slice.call(arguments).concat(constr);
    if (errOptions.message) { this.message = errOptions.message; }
    ServerError.apply(this, args);
    this.status = errOptions.status;
  };
  util.inherits(constr, ServerError);
  constr.name = errName;
  return constr;
};

for (var errorName in errors) {
  var errOptions = errors[errorName];
  var errConstr = factory(errorName, errOptions);
  exports[errorName] = errConstr;
}