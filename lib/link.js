function Link (options) {
  this.rel = options.rel || '';
  this.href = options.href || '';
  this.title = options.title || '';
  this.template = options.template || '';
};

module.exports = Link;