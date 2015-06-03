var args = process.argv.splice(2);
var http = require('http');

function whoareU() {
    var n = 'B';
    return n;
}

var server = http.createServer(function (req, res) {
	//res.send(404);
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    //res.send(404);
    res.status(404).send('Not found');
    res.end('Server: ' + whoareU());
});

server.listen(args[0] || 8082);