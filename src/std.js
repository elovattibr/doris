/* 
 * Usefull things go in here 
 * Be aware that you are in global scope
 */
_fs = require('fs'),
_path = require('path'),
foreach = require('lodash/forEach'),
resolvePath = require('path').resolve,
_util = require('util'),
_inspect = _util.inspect,
_childProcess = require('child_process'),
uuid = require('uuid').v4,
extend = require('lodash/extend'),
ajax = require('ajax-request'),
realPath = _fs.realpathSync,
fileExists = function(file){ try { return (_fs.existsSync(file)?true:false) } catch (err) { return false }; return false; };


