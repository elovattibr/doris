/*
 * DORIS SERVER
 * Eduardo Lovatti
 */
'use strict';

var Express = require('express'),
    Winston = require('winston'),
    ExpressSession = require('express-session'),
    ExpressWinston = require('express-winston'),
    ExpressBodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    ExpressLocale = require("locale");

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
    
    //Enable locale support
    express.use(ExpressLocale(settings.locales));
    
    express.use(ExpressBodyParser.json() );       // to support JSON-encoded bodies
    express.use(ExpressBodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    }));     

    //Enable access reporting
    express.use(accessReporting());
    
    //Method override capability
    express.use(methodOverride());
    
    if(!(route||this.router)){
        throw new Error("A middleware function must be set as router.");
    }
    
    express.use(route||this.router);

};


function accessReporting(){
    return ExpressWinston.logger({
      transports: [
        new Winston.transports.Console({json: false, colorize: true})
      ],
      meta: false, 
      expressFormat: true,
      colorStatus: true, 
    });
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
