var http = require('http')
var httpProxy = require('http-proxy')
var config = require('./config.js')

var port = 9000

var addresses = config.servers


var proxy = httpProxy.createProxyServer()



var currentServer = 0
function loadBalanceProxy(req, res)
{
	var cur = currentServer%addresses.length
	currentServer += 1
	var target = addresses[cur]
	proxy.web(req, res,
	{
		target: target
	}, function(err)
	{
		if (err)
			throw err
		loadBalanceProxy(req,res)
	})
}

var server = http.createServer(function(req,res)
{
	loadBalanceProxy(req,res)
})

server.listen(port)

console.log("listening at "+port)

