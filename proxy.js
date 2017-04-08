var _ = require('lodash')
var http = require('http')
var args = require('optimist').argv
var httpProxy = require('http-proxy')
var cOS = require('commonos')
var arkUtil = require('arkutil')

var userHome = cOS.getUserHome()
console.log('home directory:', userHome)

var config = require('./config/default.js')
var userConfig = {}
var userConfigPath = userHome + 'config/proxy.js'
try {
	userConfig = require(userConfigPath)
} catch (err) {
	console.log('could not find user config:', userConfigPath)
}

config = _.merge(config, userConfig, args)
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
	_.each(request.headers, function(val, key)
	{
		request.headers[key] = val.replace(headerRegex, '')
	})
	console.log('request.url:', request.url)

	if (request.url == '/_proxy/addServer' && request.method == 'POST')
	{
		console.log('Adding server')
		var body = ''

		request.on('data', function (data) {
			body += data

			// Too much POST data, kill the connection!
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
			if (body.length > 1e6)
				request.connection.destroy()
		})

		request.on('end', function ()
		{
			var data = arkUtil.parseJSON(body)
			console.log(data)

			var err
			if (!data ||
				!_.isObject(data) ||
				!data.url ||
				!data.secret)
			{
				err = 'Invalid request, need url and secret'
				console.log(err)
				response.writeHead(500, {'Content-Type': 'text/html'})
				response.write(err)
				response.end()
				return
			}
			if (data.secret != config.secret)
			{
				err = 'Incorrect proxy secret'
				console.log(err)
				response.writeHead(500, {'Content-Type': 'text/html'})
				response.write(err)
				response.end()
				return
			}

			var responseData = {registered: 1}

			response.writeHead(200, {'Content-Type': 'application/json'})
			response.write(JSON.stringify(responseData))
			response.end()
			return
		})
	}
	else if (request.url == '/_proxy/status')
	{
		var data = {'tacos': true}
		response.writeHead(200, {'Content-Type': 'application/json'})
		response.write(JSON.stringify(data))
		response.end()
	}
	else
	{
		loadBalanceProxy(request, response)
	}
})

server.listen(config.port)

console.log('Proxy listening on port ' + config.port)
