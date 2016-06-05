$(function(){
    
    //Animate on page change
    $(document).on("pagechange", function(e, data){
        
        $('[data-role=modal]',$(data.target)).each(function(){
            var target   = $(this);
            var enhanced = target.data('enhanced') || false;
            var dataset  = target.data('dataset')  || false;
            var state    = target.data('state')    || 'show';
            var multiple = ($('.modal-dialog',target).size()>0);
            
            if(!enhanced) {
                target.modal(state).data('enhanced',true).on({
                    'init':function(){
                       
                       if(multiple){

                            var sections   = $('.modal-dialog', target);
                            var togglers = $('.show-section',target);

                            sections.on({
                                show:function(){
                                    $(this).trigger('hide').css('display','block');
                                },
                                hide:function(){
                                    sections.each(function(){
                                        $(this).css('display','none');
                                    });
                                },
                            });         

                            togglers.on({
                                click:function(){
                                    var section = $(this).data('section') || false;
                                    if(!section) return false;
                                    $('[data-modal-section='+section+']').trigger('show');
                                }
                            });                           
                           
                       }
                       
                    },
                    'shown.bs.modal':function(){
                       target.trigger('open', data);    
                    },
                    'hidden.bs.modal':function(){
                        target.trigger('close');    
                        target.off().remove();
                        if(dataset){
                            return $('[data-role=dataset][data-dataset='+dataset+']').triggerHandler('refresh');
                        }                    
                    },                
                }).trigger('init');
            };
        });
        
    });      
    
});