#!/usr/bin/env node
/*!
 * Doris
 */

'use strict';

var resolvePath = require('path').resolve;

(function(cli, doris){
    
    var dir = resolvePath('./');
    
    switch(true) {
        
        //Accept any of these arguments as project path
        case('directory' in cli.argv): dir = resolvePath(cli.argv.folder); break;
        case('location' in cli.argv): dir = resolvePath(cli.argv.location); break;
        case('project' in cli.argv): dir = resolvePath(cli.argv.project); break;
        case('folder' in cli.argv): dir = resolvePath(cli.argv.folder); break;
        case('dir' in cli.argv): dir = resolvePath(cli.argv.dir); break;
        default: console.log('Using cwd as project directory.');
    };
    
    process.chdir(dir);
    
    doris().start(function(server, session, settings){

       console.log('Doris server is running @localhost:', settings.port);

    });
    
})(require('yargs'), require('./src/doris'));
