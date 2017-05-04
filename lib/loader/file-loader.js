'use strict'
const is = require('is-type-of')
const assert = require('assert')
const Router = require('koa-router')
const mount = require('koa-mount')
const path = require('path')

const util = require('./util')

class AppLoader {
  constructor(options){
    this.options = options;
    this.app = this.options.app;
    this.baseDir = this.options.baseDir
    this.pkg = this.options.pkg
    this.config = this.options.config
    
    this.controller = {}
    this.service = {}
    this.dao = {}
    this.plugin = {}
  }

  init(){
    this._loadPlugin()
    this._loadMiddleware()
    this._loadService()
    this._loadDao()
    this._loadController(()=>{
        this._loadRouter()
    })
  }
 
  _loadPlugin () {
    const pluginPaths = [
        `${this.baseDir}node_modules`,
        path.join(__dirname, '../plugin')
    ]

    this._loadModule(pluginPaths,'plugin')
  }

  _loadMiddleware () {
    const middlewarePaths = [
        `${this.baseDir}app/middleware`,
    ]

    this._loadModule(middlewarePaths,'middleware')
  }

  _loadRouter () {
    const routerPaths = [
        `${this.baseDir}app/router`,
    ]

    this._loadModule(routerPaths,'router')
  }

  _loadController (cb) {
    const controllerPaths = [
        `${this.baseDir}app/controller`,
    ]

    cb(this._loadModule(controllerPaths,'controller'))
  }

  _loadService () {
    const servicePaths = [
        `${this.baseDir}app/service`,
    ]

    this._loadModule(servicePaths,'service')
  }

  _loadDao () {
    const daoPaths = [
        `${this.baseDir}app/dao`,
    ]

    this._loadModule(daoPaths,'dao')
  }

    _loadModule (paths,type){
        let allImport = util.getAllImport(paths,type)
        // let needImport = (this.config[type])?this.config[type]:[]
        let needImport = []
        let importOrder = util.getImportOrder(allImport,needImport)
        assert(is.array(importOrder), `Modules of util.loadModule should be Array`)
        importOrder.map((item)=>{
            assert(item.name && item.path, `Modules of util.loadModule is illegal`)
            assert(util.existsModule(item.path), `Module ${item.name} path ${item.path} is not exists`)
            assert(!this[item.name], `Duplicate module imports`)
            let module = require(`${item.path}`)
            if(type === "plugin"){
                let config = this.config[item.name]
                let app = this.app
                this.app.use(module(app,config, this.baseDir))
            }else if(type === "middleware"){
                let config = this.config[item.name]
                let app = this.app
                this.app.use(module(app, config, this.baseDir))
            }else if(type === "router"){
                let router = new Router()
                module( router, this.controller)
                this.app.use(router.routes())
                this.app.use(router.allowedMethods());
            }else{
                this[type][item.name] = module
                let self = this
                this.app.use(async (ctx, next) => {
                    ctx.controller = self.controller
                    ctx.service = self.service
                    ctx.dao = self.dao
                    await next();
                })
            }
        })
    }
}

module.exports = AppLoader