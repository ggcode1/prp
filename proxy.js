'use strict';
const util = require('util');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
const https = require('https');
const fs = require('fs');
const net = require('net');
const createCertificate = util.promisify(require('pem').createCertificate);

module.exports = async function(config) {
	const socket = new net.Server();
	socket.listen(config.port);

	try {
		process.setgid('nobody');
		process.setuid('nobody');
		process.setegid('nobody');
		process.seteuid('nobody');
	} catch (e) {
		console.error(e);
	}

	await (async function() {
		const auth = 'Basic ' + new Buffer(config.username + ":" + config.password).toString('base64');

		const keys = await createCertificate({
			days: 1,
			selfSigned: true
		}); // generate a cert/keypair on the fly

		const options = {
			key: keys.serviceKey,
			cert: keys.certificate
		};

		function validAuth(req) {
			return req.headers['authorization'] && req.headers['authorization'] === auth
		}

		https.createServer(options, function(req, res) {
			if (!validAuth(req)) {
				res.writeHead(401, {
					'WWW-Authenticate': 'Basic realm="users"'
				});
				res.end();
			} else {
				proxy.web(req, res, {
					target: config.target
				});
				proxy.on('error', function (err) {
					console.error(err);
					res.end();
				})
			}

		}).listen(socket);

		console.log('prp listening on https://localhost:' + config.port);

	})();
}
