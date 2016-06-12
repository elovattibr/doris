/*!
 * Doris
 */

'use strict';

/**
 * Module dependencies.
 */

var DorisConfig = require('./config'),
    DorisServer = require('./server'),
    DorisRouter = require('./router'),
    DorisRender = require('./render');

/**
 * Expose `startDoris()`
 * use: require('doris')();
 */

exports = module.exports = startDoris;

function startDoris(options) {

    /*
     * When using doris as standalone 
     * we setup the rendering and routing for you
     * if you use it as a module you must set them yourself
     */
    
    var settings = new DorisConfig(options||false);
    
    DorisRouter.prototype.render = new DorisRender(settings);
   
    DorisServer.prototype.router = new DorisRouter(settings);

    return new DorisServer(settings);
  
};

/**
 * Expose submodules
 * use: require('doris').submodule;
 */

//Express router encapsulation
exports.router = DorisRouter;

//JsRender encapsulation
exports.render = DorisRender;

//JsRender encapsulation
exports.config = DorisConfig;