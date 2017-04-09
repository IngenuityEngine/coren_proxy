var cluster = require('cluster')
var numCPUs = require('os').cpus().length

if (cluster.isMaster)
{
	var pidToPort = {}
	var worker, port
	for (var i = 0; i < numCPUs; i++)
	{
		port = 8000 + i
		worker = cluster.fork({port: port})
		pidToPort[worker.process.pid] = port
	}

	console.log(pidToPort)

	cluster.on('exit', function(worker, code, signal)
	{
		// Use `worker.process.pid` and `pidToPort` to spin up a new worker with
		// the port that's now missing.  If you do so, don't forget to delete the
		// old `pidToPort` mapping and add the new one.
		console.log('worker ' + worker.process.pid + ' died')
		var port = pidToPort[worker.process.pid]
		var newWorker = cluster.fork({port: port})
		delete pidToPort[worker.process.pid]
		pidToPort[newWorker.process.pid] = port
	})
} else {
	// Start listening on `process.env.port` - but first, remember that it has
	// been cast to a string, so you'll need to parse it.
	console.log('New server:', process.env.port)
	setTimeout(function()
	{
		process.exit()
	}, 3000)
}
