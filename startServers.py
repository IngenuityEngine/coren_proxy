
import sys
import time
import subprocess

def main(baseCommand, startingPort, count):
	procs = []
	for i in range(1,count + 1):
		command = baseCommand + ' ' + str(startingPort + i)
		if sys.platform.startswith('win'):
			process = subprocess.Popen(command, creationflags=subprocess.CREATE_NEW_CONSOLE)
		else:
			process = subprocess.Popen(command, shell=True)
		procs.append(process)
		time.sleep(1)

	try:
		input('Enter to exit from Python script...')
	except:
		pass


if __name__ == '__main__':
	print sys.argv
	main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
