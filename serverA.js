var args = process.argv.splice(2);
var http = require('http');

function whoareU() {
    var n = 'A';
    return n;
}

var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.end('Server: ' + whoareU());
});

server.listen(args[0] || 8081);