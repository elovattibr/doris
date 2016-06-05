$(function(){
    
    //LOADBAR DATA ROLE
    var processes = 0;
    
    $(document).ready(function(){
    
        var bar = $('[data-role=loadbar]');
        
        bar.progressbar({
            value: 0
        }).removeClass('ui-corner-all');            
        
        $(document).on({
            ajaxStart:function(){
                bar.progressbar("option", "value" , 0);
                $('*',$('body')).css('cursor','wait');
            },        
            ajaxSend:function(){
                processes += 6;
                $('*',$('body')).css('cursor','progress');
                bar.progressbar("option", "max" , processes);
                var value = bar.progressbar( "option", "value" );
                bar.progressbar("option", "value" , value + 2);
            },
            ajaxComplete:function(){
                $('*',$('body')).css('cursor','wait');
                var value = bar.progressbar( "option", "value" );
                bar.progressbar("option", "value" , value + 4);
            },
            ajaxStop:function(){
                setTimeout(function(){
                    $('*',$('body')).css('cursor','');
                    bar.progressbar("option", "value" , 0);
                    setTimeout(function(){
                        bar.progressbar("option", "max" , 0);
                        bar.progressbar("option", "value" , 0);
                        $('*',$('body')).css('cursor','');
                    },100);
                },100);
            },
        });         
        
    });
    
});