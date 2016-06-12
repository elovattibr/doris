/*
 * DORIS VIEWS RENDERER
 * Eduardo Lovatti
 */

'use strict';

var foreach = require('lodash/forEach'),
    JSRender = require('jsrender'),
    jQuery = require('jqdom'),
    fileExists = require('fs').existsSync,
    resolvePath = require('path').resolve,
    getFileContents = require('fs').readFileSync;

/*
 * Module begins
 */ 

module.exports = DorisRender;

var settings,    
    tags = {
        /*Document is a file based component*/
        "Document":'defaults/document',
        /*Resource is a function based component*/
        "Bower":function(){
            var compiled = '';
            foreach(this.tagCtx.args, function(arg, idx){
                var list = arg.split(',');
                foreach(list, function(item, idx){
                    compiled += getBowerResource(item.trim());
                });
            });
            return compiled;
        },
        "Require":function(){
            var compiled = '';
            foreach(this.tagCtx.args, function(arg, idx){
                var list = arg.split(',');
                foreach(list, function(item, idx){
                    compiled += getExternalResourceTag(item.trim());
                });
            });
            return compiled;            
        },
        "Component":function(){
            return handleCustomTag.apply(this,[arguments[0],0]);
        },
        "Include":function(){
            return handleCustomTag.apply(this,[arguments[0],0]);
        },
        "Widget":function(){
            return handleCustomTag.apply(this,[arguments[0],2]);
        },

    },
    helpers = {
        getDataFrom:function(xpath){
            return getDataFromXPath.apply(this, [xpath]);
        }
    };

function DorisRender(options){
    
    settings = options;
    
    registerCustomTags();
    
};

function getTemplate(path){
    
    var raw = getFileContents(path);
    
    return String(raw);
    
};

function findTemplateByName(component, jump){
    
    var variations = [
    /*0*/    [settings.root_path+'/'+settings.view_path,component+'.tpl'], //View
    /*1*/    [settings.root_path, component+'.tpl'], //Project root
    /*2*/    [settings.root_path+'/repository/',component+'.tpl'], //Repository alternative
    /*3*/    [__dirname, '../dist/ui/',component+'.tpl'], //Doris common repository
    /*4*/    ['./repository/',component+'.tpl'], //Repository
    ].slice(jump||0);

    while(variations.length > 0) {
        var variation = variations.shift();
        var resolved = resolvePath.apply(null, variation);
        if(fileExists(resolved)){
            return resolved;
        };
    };
    
    return false;
    
};

function getRendered(view, data){
        
    var raw = getTemplate(view);

    var tpl = JSRender.templates(raw);

    var compiled = tpl.render(data || {}, helpers);
    
    return compiled ;
    
};

function getBowerResource(resource){

    try {
        
        var compiled = '';

        var path = resolvePath('./bower_components', resource);

        if(!fileExists(path)){
            console.error('Resource ' + resource + ' not found in ' + path);
            return compiled;
        };
        
        if(fileExists(path + '/bower.json')){
            
            var bowerConfig = JSON.parse(String(getFileContents(path+'/bower.json')));
            var importFiles = (typeof bowerConfig.main == 'object')?bowerConfig.main:[bowerConfig.main];

            foreach(importFiles, function(file){
                var url = './bower_components/'+resource+'/'+file;
                compiled += getExternalResourceTag(url);
            });
            
            return compiled;
            
        };
        
        if(fileExists(path + '/'+ resource +'.js')){
            var url = './bower_components/'+resource+'/'+resource+'.js';
            return getExternalResourceTag(url);
        };
        
        console.error('Resource ' + resource + ' not found in ' + path);
        return compiled;
        
    } catch (err) {
        console.error('Doris renderer could not read bower config file from resource requested.');
        return compiled;
    }

    return compiled;
    
};

function getDataFromXPath(xpath){
    var ret = this.ctx.root.dataset[xpath]||{};
    return ret;
};

function getExternalResourceTag (url) {
    switch(true) {
        case ((/\.(js||JS)$/i).test(url)):
            return'<script type="text/javascript" src="'+url+'"></script>';
        case ((/\.(css||CSS)$/i).test(url)):
            return '<link rel="stylesheet" type="text/css" href="'+url+'" />';
        case ((/\.(ttf||woff||woff2)$/i).test(url)):
            return '<link rel="stylesheet" href="'+url+'" />';
        default: return '';
    }     
}

function registerCustomTags(){
    
    JSRender.views.settings.debugMode(true);
    
    /*Register custom tags*/
    foreach(tags, function(target, tag){
        
        var fromFile = function(){
            return tags.Component.apply(this, [target]);
        };
        
        JSRender.views.tags(
            tag, (typeof target === 'function')?target:fromFile
        );
        
    });    
    
};

function handleCustomTag(target, jump){
    
    /*WARNING ONLY USE IN JSRENDER CONTEXT*/
    var ctx = this.tagCtx;
    var args = ctx.args;
    var props = ctx.props;
    var component = target||args[0];
    var compiled = '<div style="background-color: red; color: white;">'+component+' not exists</div>';
    var template = findTemplateByName(component, jump||0);
    var data = {};

    if(template === false){
        return compiled;
    }

    data.args = args, 
    data.props = props, 
    data.dataset = this.ctx.root.dataset||this.ctx.root;
    data.content = ctx.render(data, helpers);

    return getRendered(template, data); 
    
};

function alignDocument(html){
    
    var $ = jQuery(html);
    
    var head = $('head');
    
    $('[include_once]').each(function(){
        var name = $(this).attr('name');
        if($('[name='+name+']',head).size()>0){
            $(this).remove(); 
            return;
        }
        head.append($(this));
        return; 
    });
    
    return $('html').get(0).outerHTML;
    
}

/*Proto methods*/
DorisRender.prototype = {
    
    /*USE WITHIN DORIS STANDALONE */
    view: function(view, data, reply){
        
        try {

            var html = getRendered(view, data||{});
        
            reply(alignDocument(html));
            
        } catch (err) {
            
            reply(JSON.stringify(err));
            
        }
        
    },
    
    /*USE WITHIN DORIS CLIENTS [Eg. Cordova/Electron] */
    template: function(name, data, callback) {
        
        var template = findTemplateByName(name);
        
        if(template !== false){
            var rendered = getRendered(template, data||{});
//            var html = alignDocument(rendered);
            return (callback||function(){})(rendered);
        }
        
        throw ('Cannot find template"'+name+'"');
        
    }
    
};
