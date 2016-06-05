$(function(){

    function render(page, element){
        var action   = element.data('action') || false;
        var append   = element.data('append') || false;
        var dataset  = element.data('dataset') || '';
        var template = $('.template',element);
        var target   = $('.render',element);

        if(!action)             return shell.error('Requisição indefinida', true);
        if(!template.size()>0)  return shell.error('Template não encontrada', true);
        if(!target.size()>0)    return shell.error('Tpl target não encontrado', true);        
        
        shell.request({
            action: action,
            data:   filter(page, dataset),
            callback:function(response){
                
                if(!response.status) return shell.error(response.msg, true);
                
                var jsvwtpl  = $.templates(template.get(0));
                var rendered = jsvwtpl.render(response.dataset, views.tools);                

                if(append) target.append(rendered);
                else       target.html(rendered);
                
                paginate(page, dataset, response);

            }
        });        
        
    }
    
    function filter(page, dataset){
        
        $('[data-role=filter-apply]', page).each(function(){
          
            var element  = $(this);
            var enhanced = element.data('enhanced') || false;
            
            if(!enhanced){
                element.data('enhanced',true).on({
                    click:function(){
                        if(!element.is('input,select,checkbox, radio')){
                            $('[data-role=dataset][data-dataset='+dataset+']', page).triggerHandler('refresh');
                        }
                    },
                    keypress:function(e){
                        var keycode = (e.keyCode ? e.keyCode : e.which);
                        if(keycode == '13'){
                            e.preventDefault();
                            e.stopPropagation();
                            $('[data-role=dataset][data-dataset='+dataset+']', page).triggerHandler('refresh');
                        }
                    }
                });           
            }
            
        });
        
        return $('[data-role=filter][data-dataset='+dataset+']', page).serializeArray();
    }
    
    function paginate(page, dataset, result){
        
        if(!result.paginate) return false;
        
        var options = {
            total:      result.paginate.pages,
            page:       result.paginate.page,
            maxVisible: 5,      
            leaps: true 
        };        
        
        $('[data-role=paginator][data-dataset='+dataset+']', page).each(function(){
            var target   = $(this);
            target.bootpag(options)
            if(!target.data('paginator')){         
                target.on("page", function(event, num){
                    var filters = $('[data-role=filter][data-dataset='+dataset+']',page);
                    $('[name=_pn]',filters).val(num);
                    $('[name=_tp]',filters).val(result.paginate.pages);
                    $('[data-role=dataset][data-dataset='+dataset+']',page).triggerHandler('refresh');
                }).data('paginator',true);
            }
        });
        
    }
    
    $(document).on("pagechange", function(e, data){
        $('[data-role=dataset]', $(data.target)).each(function(){
            var target   = $(this);
            var page     = $(data.target);
            var enhanced = target.data('enhanced') || false;
            if(!enhanced) return target.data('enhanced',true).on({
                'create':function(){
                    target.triggerHandler('refresh');
                },
                'refresh':function(e){
                    render(page, target);
                }
            }).triggerHandler('create');
        });
    });      
    
});