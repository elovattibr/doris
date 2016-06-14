<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Doris - Error</title>
        {{Bower "jquery, bootstrap"/}}
    </head>
    <body>
        <center>
            <h1>{{:error.number}}</h1>
            <h2>{{:error.name}}</h2>
            <hr/>
        </center>
        <div class="container">
            <pre>
                {{:error.message}}
            </pre>
        </div>
    </body>
</html>