
var args = process.argv.splice(2)
var http = require('http')

var server = http.createServer(function (req, res)
{
	res.writeHead(200, {'Content-Type' : 'text/plain'})
	res.end('Server: B')
})

var port = args[0] || 2032
console.log('listening on port', port)
server.listen(port)
