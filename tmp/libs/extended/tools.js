//Extended
$.fn.getValue = function(value){

    var tag  = $(this).prop('tagName');
    var type = $(this).attr('type');
    switch(true){

        case (tag == 'SELECT'): 
            return $('option:selected', this).val();
            break;

        case (tag == 'INPUT' && type == 'radio'): 
            this.each(function(){
                if($(this).prop('checked')){
                    return $(this).val()
                }
                return false;
            });
            break;

        case (tag == 'INPUT'): 
            return this.val();
            break;

        case 'TEXTAREA': case 'textarea':
            return this.val();
            break;

    }
};

$.fn.setValue = function(value){

    var tag  = $(this).prop('tagName');
    var type = $(this).attr('type');
    switch(true){

        case (tag == 'SELECT'): 
            $('option[value='+value+']', $(this)).prop('selected',true);
            this.data('option-selected',value);
            break;

        case (tag == 'INPUT' && type == 'radio'): 
            this.each(function(){
                if($(this).val() == value){
                    $('.btn', $(this).parents('.btn-group')).removeClass('active');
                    $(this).prop('checked',true).parents('.btn').addClass('active');
                }
            });
            break;

        case (tag == 'INPUT'): 
            this.val(value);
            break;

        case 'TEXTAREA': case 'textarea':
            this.val(value);
            break;

    }

    return this.trigger('change');

};

$.fn.renderBox = function(dataset, helpers){
    var me      = $(this);
    var tpl     = $('.template', me).get(0);
    var from    = $.templates(tpl);
    var tgt     = $('.render',me);
    var helpers = helpers || views.tools;
    tgt.html(from.render(dataset, helpers));
    $(document).trigger('pagechange', {
       'target':me,
    });   
};

$.fn.dataPostable = function(){
    var post = $(this).data('post') || 'default';
    switch(true){
        case (post=='none'):     return [];
        case (post=='relative'): return $('form',$(this)).serializeArray();
        case (post=='parent'):   return $(this).parents().find('form:first').serializeArray();
        case ($(post).size()>0): return $(post).serializeArray();
        default:                 return this.dataPrefix('post');
    }
};

$.fn.dataPrefix = function(prefix){
    var data   = this.data();
    var result = {};
    for (var p in data) {
        if (data.hasOwnProperty(p) && new RegExp("^"+prefix+"[a-zA-Z]+").test(p)) {
            var shortName = p.substr(prefix.length).toLowerCase();
            result[shortName] = data[p];
        }
    }
    console.log(result);
    return result;
};

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {  
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$.len = function(obj){
    switch(true){
        case (typeof obj == 'object'):
            return Object.keys(obj).length;
        case (typeof obj == 'string'):
        case (typeof obj == 'array'):
            return obj.length;
    }
    return 0;
}

//3th party functions
function executeFunctionByName(functionName, context /*, args */) {
  var args = [].slice.call(arguments).splice(2);
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for(var i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func].apply(context, args);
}

var lateCall = (function(){
  var timer = 0;
  return function(callback, ms){
  clearTimeout (timer);
  timer = setTimeout(callback, ms);
 };
})();