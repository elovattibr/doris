/*
 * DORIS SERVER
 * Eduardo Lovatti
 */
'use strict';

var Express = require('express'),
    Winston = require('winston'),
    ExpressSession = require('express-session'),
    ExpressSessionFileStore = require('session-file-store')(ExpressSession),
    ExpressWinston = require('express-winston'),
    ExpressBodyParser = require('body-parser'),
    ExpressCookieParser = require('cookie-parser'),
    ExpressMethodOverride = require('method-override'),
    ExpressLocale = require("locale");

/*
 * Module begins
 */ 
module.exports = DorisServer;
 
var express =  new Express(),
    settings = null;

/*Server constructor*/
function DorisServer(options, route){
    
    settings = options;
    
    //X-Forward-for 
    express.set("trust proxy", true);
    
    //Instantiate session
    express.use(ExpressSession({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        store: new ExpressSessionFileStore({
            path:'data/sessions/',
        })
    }));
    
    //Enable locale support
    express.use(ExpressLocale(settings.locales));
    
    //Enable multi-part parsing support
    express.use(ExpressBodyParser.json());  
    express.use(ExpressBodyParser.urlencoded({extended: true}));     

    //Enable cookie support
    express.use(ExpressCookieParser());
    
    //Enable access/error reporting
    express.use(accessReporting());
    
    //Method override capability
    express.use(ExpressMethodOverride());
    
    if(!(route||this.router)){
        throw new Error("A middleware function must be set as router.");
    }
    
    express.use(route||this.router);

    express.use(function(request, response){
        response.send(404);
    });

};

function accessReporting(){
    return ExpressWinston.logger({
      transports: [
        new Winston.transports.Console({json: false, colorize: false}),
        new Winston.transports.File( {json: false, colorize: true, filename: './logs/access.log'}),
      ],
      msg: "HTTP {{req.method}} {{req.ip}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms ",
      meta: false, 
      colorStatus: true
    });
};

/*Proto methods*/
DorisServer.prototype = {
    
    //Start server method
    start:function(callback){
        
        //Listen
        express.listen(settings.port, function(){

            (callback||function(){})(express, settings);

        });

    }    
    
};
