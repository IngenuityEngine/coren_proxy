var _ = require('lodash')
var http = require('http')
var args = require('optimist').argv
var httpProxy = require('http-proxy')
var config = require('./config/default.js')

config = _.merge(config, args)
console.log('Config:')
console.log(config)

var port
var servers = _.map(_.range(config.serverCount), function(i)
{
	port = config.startingPort + i + 1
	return config.baseUrl + ':' + port
})

console.log('Proxy URLs:', servers)

var proxy = httpProxy.createProxyServer()

var currentServer = 0
function loadBalanceProxy(req, res)
{
	var index = currentServer % servers.length
	currentServer += 1
	var target = servers[index]
	proxy.web(req, res,
	{
		target: target
	}, function(err)
	{
		if (err)
			console.log('Error:', err)
		loadBalanceProxy(req, res)
	})
}

var server = http.createServer(function(req, res)
{
	loadBalanceProxy(req, res)
})

server.listen(config.port)

console.log('Proxy listening on port ' + config.port)
