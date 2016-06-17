/*
 * DORIS VIEWS RENDERER
 * Eduardo Lovatti
 */
'use strict';

var uuid = require('uuid'),
    extend = require('lodash/extend'),
    resolvePath = require('path').resolve,
    fileExists = require('fs').existsSync,
    getFileContents = require('fs').readFileSync;

/*
 * Module begins
 */ 

module.exports = DorisConfig;

var settings = {
    "name": 'Doris', 
    "version": '0.0.1', 
    "port": 8888, 
    "secret": uuid.v4(), 
    "resave": true, 
    "saveUninitialized": true,  
    "root_path":"./src",
    "view_path":"/views",
    "ctrl_path":"/controllers",
    "view_ext":"tpl",
    "ctrl_ext":"js",
    "locales":["pt_BR","pt","en", "en_US", "es"],
    "locales_domains":{},
    "static_aliases":{
        "/":"index"
    },
    "static_folders":[
        {"remote":"/libs/bower/", "local":"/bower_components/"},
        {"remote":"/libs/node/", "local":"/node_modules/"},
    ],
};

function DorisConfig(options){
    
    /*Doris.json config file*/
    var config = parseConfigFile(options||false);
    
    //Extend default then config 
    //file if exist, then options from constructor
    //as overrider.
    return extend(settings, config, options||{});

};

function parseConfigFile(hasOptions){
    
    try {
        
        var path = resolvePath('./doris.json');
        
        if(fileExists(path)){
            return JSON.parse(String(getFileContents(path)));
        };
        
        if(!hasOptions){
            console.log("No config file found in " + resolvePath('./'));
            process.exit();
        }
        
    } catch (err){
        
        console.error('Config file error',err);
        
        return {};
        
    };
    
};