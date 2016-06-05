$(function(){
    
    $(document).on("pagechange", function(e, data){
        
        $('[data-role=mask]', $(data.target)).each(function(){
            var element = $(this);
            var mask    = element.data('mask') || false;
            switch(mask){
                case 'currency':
                    element.inputmask("decimal",{
                         radixPoint:".", 
                         groupSeparator: ",", 
                         digits: 2,
                         autoGroup: true,
                         prefix: 'R$ '
                     });
                    break;
                    
                case 'date':
                    break;
                
            }

        });
        
        $('[data-role=autocompletebox]', $(data.target)).each(function(){
            
            var element  = $(this);
            var enhanced = element.data('enhanced')   || false;
            var action   = element.data('action')     || false;
            var label    = element.data('col-label')  || false;
            var id       = element.data('col-id')     || false;
            var input    = element.data('set-input')  || false;
            
            if(!action) return shell.error('Ação indefinida', true);
            
            if(!enhanced){

                element.data('enhanced',true).autocomplete({

                  source: function(options, callback){
                      shell.request({
                          'action':action,
                          'data':(function(){
                               var post = {};
                               post[label] = options.term;
                               return post;
                          })(),
                          'callback':function(response){
                              var options = [];
                              $.each(response.dataset, function(index, row){
                                  options.push({
                                      'id':row[id],
                                      'value':row[label],
                                  })
                              });
                              callback(options);
                          }
                      });
                  },
                  minLength: 1,
                  autoFocus: true,
                  select: function( event, ui ) {
                      $(input, $(data.target)).val(ui.item.id);
                  },
                  change:function(e,ui){
                      if(!ui.item){
                          element.val('').trigger('change');
                          $(input, $(data.target)).val('');
                      }
                  },
   
                });
                
            }
            
        });
        
        $('[data-role=selectpicker]', $(data.target)).each(function(){
            
            var element  = $(this);
            var post     = element.dataPrefix('post');
            var enhanced = element.data('enhanced')   || false;
            var append   = element.data('append')     || false;            
            var action   = element.data('action')     || false;
            var template = $('.template',element);
            var target   = $('.render',element);                    
            
            if(!enhanced){
                
                element.selectpicker({'liveSearch':true});
                
                if(action && (template.size() && target.size())) {

                    shell.request({
                        action: action,
                        data: post,
                        callback:function(response){
                            if(!response.status) return shell.error(response.msg, true);
                            var selected = element.data('option-selected');
                            var jsvwtpl  = $.templates(template.get(0));
                            var rendered = jsvwtpl.render(response.dataset, views);                
                            if(append) target.append(rendered);
                            else       target.html(rendered);
                            element.selectpicker('refresh');
                            if(selected>0) {
                                $('option[value='+selected+']', element).prop('selected',true);
                                element.selectpicker('val',selected).trigger('change');
                            }
                        }
                    });     
                    
                    return true;

                } else {
                    
                    var selected = element.data('option-selected');
                    if(selected>0) {
                        $('option[value='+selected+']', element).prop('selected',true);
                        element.selectpicker('val',selected).trigger('change');
                    }
                }
                
            }            
            
        });        
                
    });       
    
});