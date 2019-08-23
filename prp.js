#!/usr/bin/env node
'use strict';
const util = require('util');
const readFile = util.promisify(require('fs').readFile);
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

(async function () {
	let config = await readFile(program.config);
	config = JSON.parse(config);

	proxy(config);
})();
