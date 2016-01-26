'use strict';
const Promise = require('bluebird');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
const https = require('https');
const fs = require('fs');
const net = require('net');
const socket = new net.Server();
const config = require('./config.json');
const pem = Promise.promisifyAll(require('pem'));

socket.listen(config.port);

console.log('https://localhost:' + config.port);

try {
    process.setgid('nobody');
    process.setuid('nobody');
    process.setegid('nobody');
    process.seteuid('nobody');
} catch (e) {
    console.error(e);
}

Promise.coroutine(function* () {
    const auth = 'Basic ' + new Buffer(config.username + ":" + config.password).toString('base64');

    const keys = yield pem.createCertificateAsync({
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
        } else
            proxy.web(req, res, {
                target: config.target
            });
    }).listen(socket);

})();
