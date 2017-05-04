var views = require('koa-views');
const path = require('path')

const defaultConfig = {
  extension: 'ejs'
}

module.exports = function(app, config, baseDir){
	return views(path.join(baseDir, 'app/views'), config || defaultConfig)
}
