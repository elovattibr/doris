$(function(){
    
    $(document).on("pagechange", function(e, request){
        
        var data = request;
        
        $('[data-role=form]',$(data.target)).each(function(){
            
            var target   = $(this);
            var enhanced = target.data('enhanced')  || false;
            var formname = target.data('form')      || false;
            var fget     = target.data('get')       || false;
            var fset     = target.data('set')       || false;
            var dataset  = target.data('dataset')   || false;
            
            if(!enhanced) {
                
                target.on({
                    
                    'submit':function(e){
                        e.preventDefault();
                        if(!fset) return shell.error('Ação submit não informada.');
                        
                        shell.request({
                            action:fset,
                            data:target.serializeArray(),
                            callback:function(response){
                                if(!response.status)
                                    return shell.error(response.msg, true);
                                
                                if(dataset)
                                    $('[data-role=dataset][data-dataset='+dataset+']').triggerHandler('refresh');
                            }
                        });
                        
                        return false;
                    },
                    
                    'fill':function(e, post){
                        
                        post = post || data.post;
                        
                        if(!fget) return shell.error('Ação request não informada.');
                        
                        if($.len(post)>0){
                            
                            shell.request({
                                action:fget,
                                data:post,
                                callback:function(response){

                                    if(!response.status)
                                        return shell.error(response.msg, true);

                                    $.each(response.dataset, function(name, value){
                                        $('[name='+name+']', target).setValue(value);
                                    });
                                    
                                    $('[data-role=render]', target).each(function(){
                                        
                                        $(this).renderBox(response.dataset);
                                        
//                                        var me      = $(this);
//                                        var tpl     = $('.template', me).get(0);
//                                        var from    = $.templates(tpl);
//                                        var tgt     = $('.render',me);
//                                        tgt.html(from.render(response.dataset, views.tools));
//                                        $(document).trigger('pagechange', {
//                                           'target':me,
//                                        });   
                                    });

                                }
                            });   
                            
                        }
                    }
                    
                }).triggerHandler('fill');
            
                if(formname) {
                    
                    $('[data-role=submit][data-form='+formname+']', $(data.target)).on({
                        click:function(){
                            if(!($('.input-group-addon.danger',target).size()>0)){
                                target.trigger('submit');
                                target.parents('[data-role=modal]').modal('hide');
                            } else {
                                alert('Complete os campos em vermelho');
                            }
                            return false;
                        }
                    });

//                    $('[data-reload='+formname+']', $(data.target)).on({
//                        'keyup blur change':function(e){
//                            if(e.originalEvent){
//                                lateCall(function(){
//                                    var x = target.serializeObject();
//                                    console.log(x);
//                                    target.trigger('fill', x);
//                                },500);
//                            }
//                        }
//                    });                    

                };
            };
            
            setTimeout(function(){
                $(':input:not(:button):visible:first',target).focus().prop('autofocus',true);
            },600);
            
        });
        
    });       
    
});