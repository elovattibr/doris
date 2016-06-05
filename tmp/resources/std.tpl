<script type="text/javascript" src="/modules/socket.io-client/socket.io.js"></script>
<script>
(function(dom){
    
    dom.socket = io();
    
    dom.socket.on('refresh', function(){
        dom.window.location.reload();
    });
    
})(this);    
</script>