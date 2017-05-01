const fs = require('fs')
const is = require('is-type-of')
const assert = require('assert')
const _ = require('lodash')

const getModuleObject = (files,path,type) =>{
	assert(is.array(files), `Files of util.getModuleObject should be Array`)
	let result = []
	files.map((item)=>{
		let name = item
		if(name[0] !== '.' && !(/node_modules/.test(path) && !RegExp(`${type}-`).test(name))){
			if(/corgie-/.test(name)){
				name = name.replace("corgie-",'')
			}
			if(RegExp(`${type}-`).test(name)){
				name = name.replace(`${type}-`,'')
			}
			result.push({ "name": name.replace('.js',''), "path": `${path}/${item}`})
		}
		if (/lib\/plugin/.test(path)) {
			result.push({ "name": name.replace('.js',''), "path": `${path}/${item}`})
		}
	})
	return result
}

const existsModule = function(path) {
  	return fs.existsSync(path)
}

const getAllImport = (paths,type) => {
	assert(is.array(paths), `Paths of util.getAllImport should be Array`)
	let result = []
	paths.map((item)=>{
		result = result.concat(getModuleObject(fs.readdirSync(item),item,type))
	})
	return result
}

const getImportOrder = (all,need) => {
	assert(is.array(all) && is.array(need), `Input of util.getImportOrder should both be Array`)
	let order = []
	need.map((item) => {
		let moduleItem = _.find(all,{"name":item.name})
		assert(moduleItem, `Can't find the module ${item.name}.`)
		if(moduleItem){
			order.push(moduleItem)
		}
	})
	all.map((item) => {
		if(!_.find(order,{"name":item.name})){
			order.push(item)
		}
	})
	return order
}
module.exports = {
	getImportOrder : getImportOrder,
	getAllImport : getAllImport,
	existsModule : existsModule
}