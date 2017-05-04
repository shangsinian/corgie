const mysql = require('promise-mysql');

module.exports = function(app, config, baseDir){
	const pool = mysql.createPool(config);

	return async(ctx, next) => {
		ctx.db = pool
		await next()
	}
}

