$(function(){
    
    //NAVIGATE DATA ROLE
    $(document).ready(function(){
        
        //NAVIGATE TO TARGET
        $('body').on('click', '[data-role=navigate]', function(e){
            e.preventDefault();
            var data       = $(this).data();
            var target     = $(this).data('target')   || '.target';
            var collapse   = $(this).data('collapse') || false;
            var page       = $(this).data('page')     || false;
            var action     = $(this).data('action')   || false;
            var form       = $(this).parents('form');
            var parent     = $(this).parents('ul.nav');
            var post       = form.size()>0?form.serializeArray():[];
            
            if(!(page||action)) return shell.error('Página ou ação não informada.');
            
            var url        = shell.server+prefix+page;
            $('li:has(a[data-role=navigate])', parent).removeClass('active');
            $(this).parents('li').addClass('active');
            if(collapse) $('.navbar-toggle[aria-expanded=true]',parent.parents('.navbar')).click()
            $(target).load(url, post, function(){
                $(document).trigger('pagechange', {
                   'target':target,
                   'url':url,
                   'post':post,
                   'data':data
                });
            });
            return false;
        });
        
        //APPEND TO END OF BODY [MODAL, DIALOG, ETC]
        $('body').on('click', '[data-role=popup]', function(e){
            
            e.preventDefault();
            var data       = $(this).data();
            var target     = $(this).data('target') || 'body';
            var page       = $(this).data('page') || false;
            var url        = shell.server+'pages_'+page;
            var form       = $(this).parents('form');
            var post       = form.size()>0?form.serializeArray():[];
            if(!page) return shell.error('Página não informada.');
            
            $.post(url, post, function(response){
                var html = $(response);
                $(target).append(html);
                $(document).trigger('pagechange', {
                   'target':target,
                   'url':url,
                   'post':post,
                   'data':data
                });                
            }, 'html');
            return false;
        });        
    });
    
});