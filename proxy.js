var _ = require('lodash')
var http = require('http')
var args = require('optimist').argv
var httpProxy = require('http-proxy')
var cOS = require('commonos')
var arkUtil = require('arkutil')

var userHome = cOS.getUserHome()
console.log('home directory:', userHome)

var config = require('./config/default.js')

var testConfig = {}
if (process.env.mode && process.env.mode == 'test')
	testConfig = require('./config/test.js')

var userConfig = {}
var userConfigPath = userHome + 'config/proxy.js'
try {
	userConfig = require(userConfigPath)
} catch (err) {
	console.log('\n\n\nERROR: could not find user config:', userConfigPath)
}

delete args._
delete args.$0
config = _.merge(config, testConfig, userConfig, args)
// console.log('Config:')
// console.log(config)

var headerRegex = new RegExp(/[^A-Za-z0-9_\(\)<>\@\,\;\:\\\/\[\]\?\=\{\}]/g)
var servers = []

var proxy = httpProxy.createProxyServer()

var currentServer = 0

function loadBalanceProxy(request, response)
{
	// if we have no servers
	// or we've tried more times than we have servers
	if (!servers.length || request._coren_proxyTries >= servers.length)
	{
		var err = 'Error: No servers online!'
		console.log(err)
		response.writeHead(500, {'Content-Type': 'text/html'})
		response.write(err)
		response.end()
		return
	}

	request._coren_proxyTries += 1
	var index = currentServer % servers.length
	currentServer += 1
	var target = servers[index]
	if (!target.online)
	{
		console.log('server not online:', target.url)
		return loadBalanceProxy(request, response)
	}
	proxy.web(request, response,
	{
		target: target.url
	}, function(err)
	{
		if (err)
			console.log('\n\nError:', err)

		// remove the server from the list
		// servers.splice(index,1)
		// currentServer -= 1
		// set online = false
		servers[index].online = false
		servers[index].lastError = err
		loadBalanceProxy(request, response)
	})
}

var server = http.createServer(function(request, response)
{
	_.each(request.headers, function(val, key)
	{
		request.headers[key] = val.replace(headerRegex, '')
	})

	// register proxy
	if (request.url == '/_proxy/addServer' && request.method == 'POST')
	{
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
			var index = -1
			_.each(servers, function(info, i)
			{
				if (info.url == data.url)
					index = i
			})

			var responseData = {registered: 1}
			response.writeHead(200, {'Content-Type': 'application/json'})
			response.write(JSON.stringify(responseData))
			response.end()

			// if we're re-registering a server
			// just set it back to online
			if (index != -1)
			{
				console.log('\nUpdating server:', data.url)
				servers[index].online = true
			}
			// otherwise add the new server
			else
			{
				console.log('\nAdding server:', data.url)
				servers.push({
					url: data.url,
					online: true,
					lastError: null,
				})
			}
			return
		})
	}
	// proxy status
	else if (request.url == '/_proxy/status')
	{
		response.writeHead(200, {'Content-Type': 'application/json'})
		response.write(JSON.stringify(servers))
		response.end()
	}
	// proxy
	else
	{
		console.log('request.url:', request.url)
		request._coren_proxyTries = 0
		loadBalanceProxy(request, response)
	}
})

server.listen(config.port)

console.log('Proxy listening on port ' + config.port)
