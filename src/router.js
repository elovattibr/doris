/*
 * DORIS VIEWS RENDERER
 * Eduardo Lovatti
 */
'use strict';

var extend = require('lodash/extend'),
    resolvePath = require('path').resolve,
    fileExists = require('fs').existsSync,
    Express = require('express'),
    ExpressRouter = Express.Router,
    ExpressStatic = Express.static;

/*
 * Module begins
 */ 

module.exports = DorisRouter;

var instance = null,
    settings = null,
    router = null;

function DorisRouter(options){
    
    //Make instance visible out of clousure
    instance = this;
    
    settings = options;
    
    router = ExpressRouter();
    
    settings.static_folders.forEach(function(folder){
        router.use(folder.remote, autoStatic(folder.local));
    });
    
    router.use(autoAliasing);
    
    router.use(autoController);
    
    router.use(autoRenderer);
    
    return router;

};

function autoAliasing(request, response, next){
    
    var aliases = settings.static_aliases;
    
    var target = request.path;
    
    request.__target = (target in aliases)?aliases[target]:target;
    
    next();
    
};

function autoController(request, response, next){
    
    var ctrlpath = autoMount(request.__target, 'ctrl');
    
    request.__controller = {};

    if(!ctrlpath){
        return next();
    };
    
    delete require.cache[ctrlpath];
    
    var controller = require(ctrlpath);
    
    switch(typeof controller){
        
        case 'function': 
            return controller( controllerRouterHandler(request, next) );
            
        case 'object': 
            request.__controller = controller;
            return next();
            
        default:
            return next();
        
    }
    
};

function controllerRouterHandler(request, next){
    
    return {
        release:next,
        reply:request.send,
        redirect:request.redirect,
        request:request,
        setData:function(data){
            data = (typeof data === 'object') ? data : [data];
            request.__controller = extend(request.__controller, data);
            return this;
        }
    };
    
};

function autoRenderer(request, response, next){
    
    var view = autoMount(request.__target, 'view');
    
    if(!view){
        return next();
    };
    
    return render(request, response, view);
    
};

function autoStatic(folder){
    
    return ExpressStatic(resolvePath('./'+folder));
    
};

function autoMount(target, type){
    
    var file;
    
    switch(type){
        case 'ctrl':
            file  = resolvePath(settings.root_path+"/"+settings.ctrl_path+'/'+target+'.'+settings.ctrl_ext);
            break;
            
        case 'view':
            file  = resolvePath(settings.root_path+"/"+settings.view_path+'/'+target+'.'+settings.view_ext);
            break;
    };
    
    try {
        if(fileExists(file)) {
            return file;
        }
    } catch (err) {
        return false;
    }
    
};

function extractRequestedData(request){
    
    return request.__controller;
    
};

function render(request, response, view){
    
    var data = extractRequestedData(request);
    
    return instance.render.view.apply(this, 
        [view, data, function(content){
            response.contentType("text/html");
            response.send(content);
        }]
    );
    
};





























    //Logging capability
//    express.use(ExpressWinston.logger({
//      transports: [
//        new Winston.transports.Console({
//          json: true,
//          colorize: true
//        })
//      ],
//      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
//      msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
//      expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
//      colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
//      ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
//    }))