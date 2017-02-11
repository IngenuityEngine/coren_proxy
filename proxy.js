var _ = require('lodash')
var http = require('http')
var args = require('optimist').argv
var httpProxy = require('http-proxy')
var config = require('./config/default.js')

config = _.merge(config, args)
console.log('Config:')
console.log(config)

// var port
// var servers = _.map(_.range(config.serverCount), function(i)
// {
// 	port = config.startingPort + i + 1
// 	return config.baseUrl + ':' + port
// })
var headerRegex = new RegExp(/[^A-Za-z0-9_\(\)<>\@\,\;\:\\\/\[\]\?\=\{\}]/g)
var servers = config.urls

console.log('Proxy URLs:', servers)

var proxy = httpProxy.createProxyServer()

var currentServer = 0
function loadBalanceProxy(request, response)
{
	var index = currentServer % servers.length
	currentServer += 1
	var target = servers[index]
	proxy.web(request, response,
	{
		target: target
	}, function(err)
	{
		if (err)
			console.log('\n\nError:', err)
		loadBalanceProxy(request, response)
	})
}

var server = http.createServer(function(request, response)
{
	// console.log(request.headers)
	_.each(request.headers, function(val, key)
	{
		request.headers[key] = val.replace(headerRegex, '')
	})
	loadBalanceProxy(request, response)
})

server.listen(config.port)

console.log('Proxy listening on port ' + config.port)
