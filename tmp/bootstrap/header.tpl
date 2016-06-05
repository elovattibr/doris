<div class="header clearfix">
    <nav>
        <ul class="nav nav-pills pull-right">
            {{for ~getDataFrom(props.dataset) }}
                <li role="presentation" class="active"><a href="{{>href}}">{{>label}}</a></li>
            {{/for}}
        </ul>        
    </nav>
    <h3 class="text-muted">{{:props.name}}</h3>
</div>