const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
const http = require('http');
const fs = require('fs');
const net = require('net');
const socket = new net.Server();
const config = require('./config.json');

socket.listen(config.port);

console.log('Listening on ' + config.port);

try {
    process.setgid('nobody');
    process.setuid('nobody');
    process.setegid('nobody');
    process.seteuid('nobody');
} catch (e) {
    console.error(e);
}

var auth = 'Basic ' + new Buffer(config.username + ":" + config.password).toString('base64');

function validAuth(req) {
    return req.headers['authorization'] && req.headers['authorization'] === auth
}

http.createServer(function(req, res) {
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
