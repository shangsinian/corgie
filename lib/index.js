'use strict';

const KoaApplication = require('koa');
const assert = require('assert');

const CorgieLoader = require('./loader/corgie-loader');

class CorgieApplication extends KoaApplication {
	constructor(options) {
		options = options || {};
    options.baseDir = options.baseDir || process.cwd();
    options.type = options.type || 'application';

    super()

    this.loader = new CorgieLoader({
      baseDir: options.baseDir,
      app: this,
      // plugins: options.plugins,
      // logger: this.console,
    })
	}
}

module.exports = CorgieApplication;