$(function(){
    
    //NAVIGATE DATA ROLE
    $(document).ready(function(){
        
        //NAVIGATE TO TARGET
        $('body').on('click', '[data-role=navigate],[data-role=popup]', function(e){
            
            e.preventDefault();
            
            var data       = $(this).data();
            var parent     = $(this).parents('ul.nav');
            var post       = $(this).dataPostable();
            
            var target     = data.target    || '.target';
            var role       = data.role      || false;
            var collapse   = data.collapse  || false;
            var page       = data.page      || false;
            var action     = data.action    || false;
            
            if(!(page||action)) return shell.error('Página ou ação não informada.');
            
            var url = shell.server+(page?'pages_'+page:action||'pages_404');
            
            switch(role){
                case 'navigate':
                    $('li:has(a[data-role=navigate])', parent).removeClass('active');
                    $(this).parents('li').addClass('active');
                    if(collapse) $('.navbar-toggle[aria-expanded=true]',parent.parents('.navbar')).click();
                    $(target).load(url, post, function(){
                        $(document).trigger('pagechange', {
                           'target':target,
                           'url':url,
                           'post':post,
                        });
                    });
                    break;
                    
                case 'popup':
                    $.post(url, post, function(response){
                        var html = $(response);
                        $(target).append(html);
                        $(document).trigger('pagechange', {
                           'target':target,
                           'url':url,
                           'post':post,
                        });                
                    }, 'html');                    
                    break;
            }
            
            return false;
        });
    
    });
    
});