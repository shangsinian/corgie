'use strict'
const is = require('is-type-of')
const assert = require('assert')
const Router = require('koa-router')
const mount = require('koa-mount')
const homedir = require('node-homedir');
const FileLoader = require('./file-loader');
const util = require('./util')
const path = require('path')
const fs = require('fs')

class CorgieLoader {
  constructor(options){
    this.options = options;
    this.app = this.options.app;
    this.baseDir = this.options.baseDir
    this.pkg = require(path.join(this.options.baseDir, 'package.json'));
    this.serverEnv = this.getServerEnv();
    this.config = this.getConfig()

    new FileLoader(this).init()
  }

  getConfig(){
    let envconfigPath = path.join(this.baseDir,`config/config.${this.serverEnv}.js`)
    let defaultConfig = require(path.join(this.baseDir,'config/config.js'))
    let envconfig = {}
    if (fs.existsSync(envconfigPath)) {
      envconfig = require(envconfigPath)
    }
    return Object.assign(defaultConfig, envconfig)
  }

  getAppName() {
    if (this.pkg.name) {
      return this.pkg.name;
    }
    const pkg = path.join(this.options.baseDir, 'package.json');
    throw new Error(`name is required from ${pkg}`);
  }

  getAppInfo() {
    const env = this.serverEnv;
    const home = this.getHomedir();
    const baseDir = this.options.baseDir;

    return {
      name: this.getAppName(),
      baseDir,
      env,
      HOME: home,
      pkg: this.pkg,
      root: env === 'local' || env === 'unittest' ? baseDir : home,
    };
  }

  getHomedir() {
    return process.env.CORGIE_HOME || homedir() || '/home/admin';
  }

  getServerEnv() {
    let serverEnv;

    const envPath = path.join(this.options.baseDir, 'config/env');
    if (fs.existsSync(envPath)) {
      serverEnv = fs.readFileSync(envPath, 'utf8').trim();
    }

    if (!serverEnv) {
      serverEnv = process.env.CORGIE_SERVER_ENV;
    }

    if (!serverEnv) {
      if (process.env.NODE_ENV === 'test') {
        serverEnv = 'unittest';
      } else if (process.env.NODE_ENV === 'production') {
        serverEnv = 'prod';
      } else {
        serverEnv = 'local';
      }
    }

    return serverEnv;
  }

   
}

module.exports = CorgieLoader