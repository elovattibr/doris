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
        "Document":'../dist/ui/defaults/document.tpl',
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
        "Component":function(){
            var ctx = this.tagCtx;
            var args = ctx.args;
            var props = ctx.props;
            var component = args[0];
            var compiled = '<div style="background-color: red; color: white;">'+component+' not exists</div>';
            var variations = [
                resolvePath(settings.root_path,component+'.tpl'),
                resolvePath(settings.root_path+'/components/',component+'.tpl'),
                resolvePath(settings.root_path+'/repository/',component+'.tpl'),
                resolvePath(__dirname,'dist/ui/',component+'.tpl')
            ];
            while(variations.length > 0) {
                var variation = variations.shift();
                if(fileExists(variation)){
                    compiled = getRendered(variation,{
                        args:args, props:props, content:ctx.render() //, parents:ctx.view.ctx.parentTags
                    });
                    break;
                };
            };
            return compiled;
        },
        "Template":function(){ return tags.Component.apply(this, [arguments]); },
    },
    helpers = {
        data:function(xpath){
            return this.data[xpath];
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

function getRendered(view, data){
    
    data = data || {};
    
    var raw = getTemplate(view);
    
    var tpl = JSRender.templates(raw);
    
    return tpl.render(data, helpers);
    
};

function getBowerResource(resource){

    try {
        
        var compiled = '';

        var path = resolvePath('./bower_components', resource);

        if(!fileExists(path)){
            console.error('Resource ' + resource + ' not found in ' + path);
            return compiled;
        };
        
        var bowerConfig = JSON.parse(String(getFileContents(path+'/bower.json')));
        var importFiles = (typeof bowerConfig.main == 'object')?bowerConfig.main:[bowerConfig.main];
        
        foreach(importFiles, function(file){
            var url = '/libs/bower/'+resource+'/'+file;
            switch(true) {
                //ENDS WITH .JS
                case ((/\.(js||JS)$/i).test(url)) : {
                    compiled += '<script type="text/javascript" src="'+url+'"></script>';
                    break
                };
                //ENDS WITH .CSS
                case ((/\.(css||CSS)$/i).test(url)) : {
                    compiled += '<link rel="stylesheet" type="text/css" href="'+url+'" />';
                    break
                };
            }            
        });
        
    } catch (err) {
        console.error('Doris renderer could not read bower config file from resource requested.');
        return compiled;
    }

    return compiled;
    
};

function registerCustomTags(){
    /*Register custom tags*/
    foreach(tags, function(target, tag){
        var fromFile = function(){
            var resolved = resolvePath(__dirname, target);
            var contents = String(getFileContents(resolved));
            var template = JSRender.templates(contents);
            return template.render({
                args    : this.tagCtx.args,
                props   : this.tagCtx.props,
                content : this.tagCtx.render()
            }, helpers);
        };
        JSRender.views.tags(tag, (typeof target === 'function')?target:fromFile);
    });    
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
    
    view: function(view, data, reply){
        
        var html = getRendered(view,data||{});
        
        reply(alignDocument(html));
        
    }
    
};
