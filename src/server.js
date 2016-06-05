/*
 * DORIS SERVER
 * Eduardo Lovatti
 */
'use strict';

var extend = require('lodash/extend'),
    Express = require('express'),
    Winston = require('winston'),
    ExpressSession = require('express-session'),
    ExpressWinston = require('express-winston'),
    methodOverride = require('method-override');

/*
 * Module begins
 */ 
module.exports = DorisServer;
 
var session = null,
    express = null,
    settings = null;

/*Server constructor*/
function DorisServer(options, route){
    
    settings = options;
    
    //Instantiate session
    session = new ExpressSession(settings);

    //Instantiate express
    express = new Express(session);

    //Method override capability
    express.use(methodOverride());
    
    if(!(route||this.router)){
        throw new Error("A middleware function must be set as router.");
    }
    
    express.use(route||this.router);

};

/*Proto methods*/
DorisServer.prototype = {
    
    //Start server method
    start:function(callback){
        
        //Listen
        express.listen(settings.port, function(){

            (callback||function(){})(express, session, settings);

        });

    }    
    
};
