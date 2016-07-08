'use strict';

var log = require('util').log;

require('./start.js').preBuild(() => {
	log('prebuild 开始 ...');
});