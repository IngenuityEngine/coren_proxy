
var args = process.argv.splice(2)
var http = require('http')

var server = http.createServer(function (req, res)
{
	res.writeHead(200, {'Content-Type' : 'text/plain'})
	res.end('Server: C')
})

var port = args[0] || 2064
console.log('listening on port', port)
server.listen(port)
