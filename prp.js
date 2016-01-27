'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const program = require('commander');
const packagejson = require('./package.json');

const proxy = require('./proxy');

const example = {
    "username": "test",
    "password": "test",
    "port": 7000,
    "target": "http://www.yahoo.com"
}

program
    .version(packagejson.version)
    .description('prp (password reverse proxy)')
    .option('-c, --config [filename]', 'JSON configuration file')
    .parse(process.argv);

if (!program.config) {
    console.error('Need a config file with the format:\n' + JSON.stringify(example, null, 4));
    program.help();
}

Promise.coroutine(function* () {
	let config = yield fs.readFileAsync(program.config);
	config = JSON.parse(config);

	proxy(config);
})();
