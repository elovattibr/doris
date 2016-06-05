//Helpers for VIEWS 
views.addHelper('formatDateBr', function(date){
    return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY')
});

views.addHelper('formatDecimalToReal', function(n){
    return 'R$ ' + numeral(n).format('0,0.00');
});

views.addHelper('formPorTipoLancamento', function(n){
    switch(n){
        case "0": return "form-despesa";
        case "1": return "form-receita";
        case "2": return "form-ajuste";
    }
    return '';
});
