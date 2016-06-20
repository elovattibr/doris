/*
 * DORIS VIEWS RENDERER
 * Eduardo Lovatti
 */
'use strict';

var extend = require('lodash/extend'),
    tools = require('./tools'),
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
    router = null,
    cache = {};

function DorisRouter(options){
    
    //Make instance visible out of clousure
    instance = this;
    
    settings = options;
    
    router = ExpressRouter();
    
    settings.static_folders.forEach(function(folder){
        router.use(folder.remote, autoStatic(folder.local));
    });
    
    router.use(autoLocale);
    
    router.use(autoRuntime);
    
    router.use(autoAliasing);
    
    router.use(autoController);
    
    router.use(sendToBrowser);
    
    return router;

};

function autoAliasing(request, response, next){
    
    var aliases = settings.static_aliases;
    
    var target = request.path;
    
    request.__url = target.replace(/^\//, '');
    
    switch(true) {
        
        case ('*' in aliases):
            request.__target = aliases['*'];
            break;
            
        default:
            request.__target = (target in aliases)?aliases[target]:target;
            break;
        
    }
    
    request.__origin = (target in aliases)?aliases[target]:target;
    
    next();
    
};

function autoLocale(request, response, next){
    
    var domain_language = settings.locales_domains[request.hostname];
    var local_language = request.locale;
    
    request.language = domain_language || local_language;
    
    next();
    
};

function autoCache(request, response, next, mode){
    
    var type = (mode=='system')?'__main':'__controller',
        main = type=='__main'?(settings.main_module || false):(request.__origin || false),
        path = main?autoMount(main, (type=='__main')?'system':'ctrl'):false,
        data = request[type] = {},
        module = null;

    if(main === false || path === false){
        return next();
    };
    
    var hexname = tools.strToHex(path);

    switch(true) {
        
        case (hexname in cache && settings.debug !== true):
            module = cache[hexname];
            break;
            
        default:
            module = (cache[hexname] = require(path));
        
    }
    
    if(typeof module == 'object'){
        data = module;
        return next();
    }
    
    return module(controllerRouterHandler(request, response, next));
    
};

function autoRuntime(request, response, next){
    
    return autoCache(request, response, next, 'system');
    
};

function autoController(request, response, next){
    
    return autoCache(request, response, next, 'ctrl');
    
};

function controllerRouterHandler(request, response, next){
    
    function setMainControllerData(key, data){
        request[key] = data;
        return this;
    };
    
    function getParsedRequestedUrl(){
        return request.query;
    };
    
    function getRequestedPost(){
        return request.body;
    };
    
    function setViewData(data){
        data = (typeof data === 'object') ? data : [data];
        request.__controller = extend(request.__controller, data);
        return this;
    };
    
    return {
        /*Middleware*/
        release:next,
        request:request,
        response:response,
        /*Custom getters*/
        ssid:request.sessionID,
        method:request.method,
        post:getRequestedPost,
        query:getParsedRequestedUrl,
        /*Custom setters*/
        set:setMainControllerData,
        data:setViewData
    };
    
};

function autoStatic(folder){
    
    return ExpressStatic(resolvePath('./'+folder));
    
};

function autoMount(target, type){
    
    var basedir = settings.root_path,
        typedir = {
            'ctrl':{path:settings.ctrl_path, ext:'.'+settings.ctrl_ext},
            'view':{path:settings.view_path, ext:'.'+settings.view_ext},
            'module':{path:settings.view_path, ext:'/main.'+settings.view_ext},
            'system':{path:'/', ext:'.'+settings.ctrl_ext},
        },
        filedir = basedir+'/'+typedir[type]['path']+'/'+target,
        filepath = filedir + typedir[type]['ext'],
        file  = resolvePath(filepath);

    try {
        
        if (fileExists(file)){
            return file;
        }
        
    } catch (err) {
        return false;
    }
    
    return false;
    
};

function extractRequestedData(request){
    return {
        get:request.params,
        post:request.body,
        request:request,
        controller:request.__controller
    };
};

function sendToBrowser(request, response, next){
    
    var view = autoMount(request.__target, 'view');
    var module = autoMount(request.__target, 'module');
    
    switch(true) {
        
        case (view !== false):
            return render(request, response, view);
            
        case (module !== false):
            return render(request, response, module);
            
        case (Object.keys(request.__controller).length > 0):
            response.json(request.__controller);
            break;
            
        default: return next();
        
    }
    
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
