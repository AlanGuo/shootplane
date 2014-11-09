var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var WebSocketServer = require('websocket').server;
var webSocketObject = require('../backend/requestHandlers').websocket;
var getLocalIP = require('./getIP').getLocalIP;

var port = 3000;

// Serve up public/ftp folder
var serve = serveStatic('../', {'index': ['index.html', 'index.htm']});

// Create server
var server = http.createServer(function(req, res){
	//final step to respond the req.
  var done = finalhandler(req, res);
  serve(req, res, done);
});

// Listen
console.log('server started on port '+port+'.');
server.listen(port);
//websocket

var protocol = ["echo-protocol-pc","echo-protocol-mobile"];
//start a websocket server
//端口和webserver一致
wsServer = new WebSocketServer({
    //{port: 8080}
    httpServer: server,
    //port:port,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    //判断方法
    if (webSocketObject["originIsAllowed"])
        return webSocketObject["originIsAllowed"].call(webSocketObject, origin);
    else return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log(new Date() + ' Connection from origin ' + request.origin + ' rejected.');
        webSocketObject["reject"].call(webSocketObject, request);
        return;
    }

    var available = false;
    var specifiedProtocol = null;

    if (protocol.indexOf(request.requestedProtocols[0]) > -1) {
        available = true;
        specifiedProtocol = request.requestedProtocols[0];
    }

    if (available) {
        var connection = request.accept(specifiedProtocol, request.origin);
        console.log(new Date() + ' Connection frome origin ' + request.origin + ' accepted.');
        webSocketObject["accept"].call(webSocketObject, specifiedProtocol, connection);
    } else {
        request.reject();
        console.log(new Date() + ' Connection from origin ' + request.origin + ' rejected.');
        webSocketObject["reject"].call(webSocketObject, request);
    }
});
