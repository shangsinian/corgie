var views = require('koa-views');
const path = require('path')

const defaultConfig = {
  extension: 'ejs'
}

module.exports = function(config, baseDir){
	return views(path.join(baseDir, 'views'), config || defaultConfig)
}
