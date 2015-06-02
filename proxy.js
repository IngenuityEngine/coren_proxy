var http = require('http')
var httpProxy = require('http-proxy')

var server = httpProxy.createServer(
{
	hostnameOnly: true,
	router: {
		'<ingenuity-proxy>:1234': '127.0.0.1:2200',   // start one server locally
		'<ingenuity-proxy>:5678': '<ingenuity-webOne>:2200', // start another server on our current node
		'caretaker.<ingenuity-proxy>': '108.', // start another server on our current node
	}
})

server.listen(80)
