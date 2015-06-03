var http = require('http')
var httpProxy = require('http-proxy')
var config = require('./config.js')

var port = 9000;

var addresses = config.servers


var proxy = httpProxy.createProxyServer();
var count = 0;
var server = http.createServer(function(req,res){
    loadBalanceProxy(req,res);
}).listen(port);

currentServer = 0;
function loadBalanceProxy(req, res){
    var cur = currentServer%addresses.length;
    currentServer++;
    var target = addresses[cur];
    proxy.web(req, res, {
        target: target
    }, function(e){
    	//console.log("Server " + addresses[cur] + " has failed");
    	loadBalanceProxy(req,res);
    });



}



console.log("listening at "+port);

