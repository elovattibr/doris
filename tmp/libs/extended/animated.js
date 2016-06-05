$(function(){
    
    //Animate on page change
    $(document).on("pagechange", function(e, data){
        $('.animate',$(data.target)).each(function(){
            var transition = $(this).data('transition') || 
                             $(this).data('animation') || 
                             'noTransition';
            if(!$(this).hasClass(transition))         
                    $(this).addClass(transition);
                     
        });
    });      
    
});