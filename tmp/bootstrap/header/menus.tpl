<div class="header clearfix">
    <nav>
        <ul class="nav nav-pills pull-right">
            {{if props.menus}}
                {{for ~jsonDecode(props.menus)}}
                    <li role="presentation"><a href="#">{{>name}}</a></li>
                {{/for}}
            {{/if}}
        </ul>
    </nav>
    <h3 class="text-muted">{{:name}}</h3>
</div>