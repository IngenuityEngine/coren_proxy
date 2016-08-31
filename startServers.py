
import sys
import time
import subprocess
import psutil

def startServer(command):
	if sys.platform.startswith('win'):
		return psutil.Popen(command, creationflags=subprocess.CREATE_NEW_CONSOLE)
	else:
		linuxCommand = 'xterm -hold -e "%s"' % command
		return psutil.Popen(linuxCommand, shell=True)

def main(baseCommand, startingPort, count):

	servers = {}
	for i in range(1,count + 1):

		command = baseCommand + ' ' + str(startingPort + i)
		servers[i] = {
			'command': command,
			'process': startServer(command),
		}
		time.sleep(3)

	while True:
		for i, server in servers.iteritems():
			if not server['process'].is_running():
				servers[i]['process'] = startServer(servers[i]['command'])



if __name__ == '__main__':
	print sys.argv
	main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
