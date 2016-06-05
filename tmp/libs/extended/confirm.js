$(function(){
    
    //NAVIGATE DATA ROLE
    $(document).ready(function(){
        
        $('body').on('click', '[data-role=confirm]', function(e){
            
            var elem    = $(this);
            var post    = elem.data();
            var form    = elem.parents('form');
            var msg     = elem.data('message') || false;
            var action  = elem.data('action')  || false;
            var dataset = elem.data('dataset') || false;
            var callback = elem.data('callback') || false;
            
            if(!action) return shell.error('Ação indefinida', true);
            if(!msg)    return shell.error('Mensagem indefinida', true);
            
            if(confirm(msg)){
                
                return shell.request({
                    action:action,
                    data:post,
                    callback:function(response){
                        if(dataset){
                            return $('[data-role=dataset][data-dataset='+dataset+']').triggerHandler('refresh');
                        }
                        if(callback){
                            return executeFunctionByName(callback, window, response);                            
                        }
                    }
                });
                
            }
            
            return false;
            
        });
        
    });
    
});