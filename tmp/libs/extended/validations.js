$(function() {
    
    
    $(document).on("pagechange", function(e, data){
        
        var inputs = $([
            '.input-group input[required]',
            '.input-group textarea[required]',
            '.input-group select[required]',
        ].join(', '), $(data.target));
    
        inputs.on('keyup focusout change', function() {
            
            var $element = $(this),
                $form    = $element.closest('form'),
                $group   = $element.closest('.input-group'),
                $type    = $element.attr('type'),
                $addon   = $group.find('.input-group-addon'),
                $icon    = $addon.find('span'),
                state    = false;
                
            if($type == 'radio'){
                state = $group.find(':checked').size()?true:false;
            } else if (!$group.data('validate')) {
                state = $element.val() ? true : false;
            }else if ($group.data('validate') == "email") {
                    state = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($element.val())
            }else if($group.data('validate') == 'phone') {
                state = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/.test($element.val())
            }else if ($group.data('validate') == "length") {
                    state = $element.val().length >= $group.data('length') ? true : false;
            }else if ($group.data('validate') == "number") {
                state = !isNaN(parseFloat($element.val())) && isFinite($element.val());
            }

            if (state) {
                $addon.removeClass('danger');
                $addon.addClass('success');
                $icon.attr('class', 'glyphicon glyphicon-ok');
            }else{
                $addon.removeClass('success');
                $addon.addClass('danger');
                $icon.attr('class', 'glyphicon glyphicon-remove');
            }

            if ($form.find('.input-group-addon.danger').length == 0) {
                $form.find('[type="submit"]').prop('disabled', false);
            }else{
                $form.find('[type="submit"]').prop('disabled', true);
            }
            
        }).trigger('change');

    });
    
});