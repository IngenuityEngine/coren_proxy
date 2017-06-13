
# Coren
Component-based client/server MVC.

- [Getting Started](#getting_started)
- [Environment Setup](#environment_setup)
- [Coren Plugins](#coren_plugins)
- [Creating a New Site](#creating_a_new_site)


<a id="getting_started"></a>
## Getting Started

This portion assumes you have node.js, mongoDB, git, and perl already installed, if not follow the [Environment Setup](Environment-Setup) instructions.

1. Open a command line to where you'd like install Coren (ex: C:\dev\), then download Coren from github
```
	git clone https://github.com/IngenuityEngine/coren.git
```
2. Install the npm modules

	Windows:```npm install```

	Linux:```sudo npm install```

2. Run the Coren installer

	Windows:```install.bat```

	Linux:```bash install```

3. Run ```coren -test``` to run Coren's server tests and ensure everything is working properly
4. Run ```coren --startTestServer``` and navigate to the [test page](http://127.0.0.1:2150/_test) to run the client tests
5. Read through the rest of the [documentation](#documentation) to get a better understanding of how Coren works

<a id="environment_setup"></a>
## Environment Setup

- [Linux Basics](#Linux-Basics)
- [node.js Setup](#node.js-Setup)
- [MongoDB Setup](#MongoDB-Setup)
- [Git Setup](#Git-Setup)
- [Merge Tool Setup](#Merge-Tool-Setup)
- [Perl Setup](#Perl-Setup)
- [Manual SSH Setup](#Manual-SSH-Setup)

<a id="Linux-Basics"></a>
### Linux Basics
Linux requires a bunch of setup before you even start installing node.js, etc.

0. Use the setup script, then skip to step 10

	- ```vi setup``` to edit the setup file
	- hit i, paste the contents of <corenRoot>/linuxSetup into the file
	- hit ESC, :, w, q to write the file out
	- ```bash setup``` to run the script

1. Update yum
```
	yum update -y
```
2. Add a web user
```
	useradd -mrU web
```
	- adds a user "web"
	- m = make home directory
	- r = create system account
	- U = make group w/ same name and add user to group

3. Create a folder your app:
```
	mkdir /var/www
```
	- www is created in var as it's the system directory for non-static data that's specific to each computer and not shared over a network

5. Set folder permissions:
```
	chown web /var/www
	chgrp web /var/www
	chown -R :web /var/www
	chmod -R g+w /var/www
	find /var/www -type d -exec chmod g+s '{}' \;
```
7. (optional, difficult) Disable root logins and change the SSH port if you want

	- edit the sshd_config
```
	vi /etc/ssh/sshd_config
```
	- contents
```
	disable root logins
	Port 22
	Protocol 2
	PermitRootLogin no
```
	- insert the above lines
	- NOTE: If you modify the port number you'll have to be sure it's open for SSH to work
	- SUPER NOTE!: Be sure you can log in as some other user before you disable the root login

8. Restart ssh

	- systemd variant
```
	systemctl reload sshd
```
	- Debian variant
```
	service ssh reload
```
9. Install a bunch of compiling tools for C++ (needed for Mongodb's BSON module)
```
	yum install -y make automake gcc gcc-c++ kernel-devel
```
10. Turn off writing access times for the filesystem

	- add noatime to the drive's options
```
	vi /etc/fstab
```
	- after ext4, replace 'defaults' with 'noatime,defaults'
	- remount the partition
```
	mount -o remount /
```
	- ensure the settings were aplied
```
	mount | grep noatime
```

<a id="node.js-Setup"></a>
### node.js Setup

##### Windows
1. Download and install [node](http://nodejs.org/)
	- default global modules path:

	C:\Users\<username>\AppData\Roaming\npm

	- to modify global_modules path:

	npm config set prefix C:\whatever\node_modules

##### Linux
1. Install node.js and npm using yum

	yum install -y nodejs npm

2. Install [n](https://github.com/tj/n) to handle node.js versions

	npm install -g n
	n stable

<a id="MongoDB-Setup"></a>
### MongoDB Setup

##### Windows
1. Download and install [mongoDB](https://www.mongodb.org/downloads)
2. Extract download to C:\mongodb\
3. Run install_mongo.bat from the Coren root. It's contents:
```
	mkdir C:\mongodb\log\
	mkdir C:\mongodb\database
	echo logpath=C:\mongodb\log\mongo.log > C:\mongodb\mongo.cfg
	echo dbpath=C:\mongodb\database >> C:\mongodb\mongo.cfg
	echo logappend=1 >> C:\mongodb\mongo.cfg
	C:\mongodb\bin\mongod.exe --config C:\mongodb\mongo.cfg --install
	net start MongoDB
```
4. Additinal info can be found in the [MongoDB installation guide](http://docs.mongodb.org/manual/installation/)

##### Linux
1. Configure the package management system to add MongoDB

	- make a new repo file
```
	vi /etc/yum.repos.d/mongodb.repo
```
	- paste this as it's contents
```
	[mongodb]
	name=MongoDB Repository
	baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/
	gpgcheck=0
	enabled=1
```
	- alternately in one line
```
	echo -e "[mongodb]\nname=MongoDB Repository\nbaseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64/\ngpgcheck=0\nenabled=1\n" > /etc/yum.repos.d/mongodb.repo
```
2. Install MongoDB via yum
```
	yum install -y mongodb-org
```
3. Implement the rest of the [MongoDB Recommended Configuration](http://docs.mongodb.org/manual/administration/production-notes/#recommended-configuration) for Linux

	- set the max open files to 20,480 (defaults to 1024)
```
	ulimit -n 20480
```
	- set the read ahead to a lower value (defaults to 256)
```
	blockdev --setra 32 /dev/vda
	blockdev --setra 32 /dev/vda1
	blockdev --report
```
	- disable NUMA when running MongoDB
```
	echo 0 > /proc/sys/vm/zone_reclaim_mode
	numactl --interleave=all <MONGODB_PATH>
```
4. Make the log directory and set it's permissions
```
	mkdir -p /var/log/mongodb
	chown -R :web /var/log/mongodb
	chmod -R g+w /var/log/mongodb
	find /var/log/mongodb -type d -exec chmod g+s '{}' \;

	mkdir -p /var/lib/mongo
	chown -R :web /var/lib/mongo
	chmod -R g+w /var/lib/mongo
	find /var/lib/mongo -type d -exec chmod g+s '{}' \;
```
4. MongoDB service commands

	- start service:
```
	service mongod start
```
	- stop service:
```
	sudo service mongod stop
```
	- ensure service starts on reboot:
```
	sudo chkconfig mongod on
```
	8a. List background processes

		```ps ax | grep mongo```

		- ps = list currently running processes
		- a = list all process including those from other users
		- x = select processes without controlly ttys

5. Configure your [firewall for Mongo](http://docs.mongodb.org/manual/tutorial/configure-linux-iptables-firewall/)
	- only allow traffic from your application server mongod instances
```
	iptables -A INPUT -s 10.132.89.210 -p tcp --destination-port 27017 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A OUTPUT -d 10.132.89.210 -p tcp --source-port 27017 -m state --state ESTABLISHED -j ACCEPT
```
	- allow SSH through
```
	iptables -A INPUT -p tcp -m tcp --dport 22 -j ACCEPT
	iptables -A OUTPUT -p tcp --sport 22 -m state --state ESTABLISHED,RELATED -j ACCEPT
```
	- block everything else
```
	iptables -P INPUT DROP
	iptables -P OUTPUT DROP
```
	- edit /etc/mongod.conf to allow external connections
```
	vi /etc/mongod.conf
```
	- comment out bind_ip =127.0.0.1

6. Check [MongoDB Performance Considerations](http://info.mongodb.com/rs/mongodb/images/MongoDB-Performance-Considerations_2.4.pdf) for more info about improving MongoDB performance.  Highlights:

	- Scale out horizontally w/ more cheap computers, not vertically w/ a more expensive computer
	- Ensure your working set fits in ram
	- Use SSD's
	- Favor faster CPUs over more cores
	- Avoid negation in queries, they result in scanning the entire collection
	- Use explain on every query in your system
	- Use short field names

7. Scaling MongoDB: Sharding vs. Replica sets

	- Replica sets
		- single master that accepts writes
		- writes replicated to slaves
		- increases read performance but not write performance
		- good for a CMS where writing is rare
		- good fault-tolerance, if master goes down mongo elects a new master

	- Sharding
		- each server holds part of the data
		- data is located via shard-key (ex: username)
		- both read and write performance increase as you add shards
		- more difficult to set up
		- needs a TON of servers.. [10 to be precise](https://www.digitalocean.com/community/tutorials/how-to-create-a-sharded-cluster-in-mongodb-using-an-ubuntu-12-04-vps):
			- 3 Config Servers
			- 2 Query Routers
			- 4 Shard Servers (2 pairs of 2 replica sets)

<a id="Git-Setup"></a>
### Git Setup
##### Windows
Download and install [Git](http://git-scm.com/downloads)

##### Linux
Install git using yum

```yum install -y git```

##### Generic
Some useful git configuration settings
```
	git config --global user.email "<your@email.com>"
	git config --global user.name "Your Name"
```

<a id="Merge-Tool-Setup"></a>
### Merge Tool Setup
1. Download and install [p4MergeTool](http://www.perforce.com/downloads/helix#product-10)
2. Add ```C:\Program Files\Perforce\``` to your PATH environment variable
3. Set p4merge as your global merge tool ```git config --global merge.tool p4merge```
4. When you have a merge conflict, open the shell and type ```git mergetool```
5. Fix the conflicts using the merge tool then save and close

<a id="Perl-Setup"></a>
### Perl Setup
##### Windows
Download and install [Perl](http://www.activestate.com/activeperl/downloads)

##### Linux
Install perl using yum (likely already installed)

```yum install -y perl```

<a id="Manual-SSH-Setup"></a>
### Manually Installing SSH Keys
You shouldn't need to do this.  It's recommended that you add the keys automatically via your host's backend

1. Add SSH keys:

	- make the ~/.ssh directory if it doesn't already exist
```
	mkdir ~/.ssh
	chmod 0700 ~/.ssh
	touch ~/.ssh/authorized_keys
	chmod 0644 ~/.ssh/authorized_keys
```
	- open ~/.ssh/authorized_keys for editing
```
	vi ~/.ssh/authorized_keys
```
	- hit "i" to enter insert mode
	- paste your PUBLIC ssh key into ~/.ssh/authorized_keys by right clicking
	- save and exit by pressing ESC, :, w, q (this (w)rites and (q)uits)

2. Restart ssh

	- systemd variant
```
	systemctl reload sshd
```
	- Debian variant
```
	service ssh reload
```
3. Ensure you can log in with your SSH keys.  There's a nice guide covering this on [Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-create-ssh-keys-with-putty-to-connect-to-a-vps)

<a id="coren_plugins"></a>
## Coren Plugins
- database_mongoDB
- javascript_browserify
- coren_templateManager
- templates_hogan
- coren_styleManager
- styles_stylus
- coren_testManager
- docs_naturalDocs
- [convertMySQL](#convertMySQL)
- [importMySQL](#importMySQL)

<a id="convertMySQL"></a>
### MySQL Converter
- Purpose: Creates entity definitions from your sql data (given that it was set up w/ a previous version of Coren)
- Usage: ```coren --convertMySQL```
- Settings: <site_root>/config/mysqlSettings.js

<a id="importMySQL"></a>
### MySQL Importer
- Purpose: Uses the entity definitions to import
- Usage: ```coren --importMySql```
- Settings: <site_root>/config/mysqlSettings.js

<a id="Creating-a-new-site"></a>
## Creating a New Site
1. From the Coren root folder (ex: C:/dev/coren) run:
```
	coren --newsite
```
2. Fill in the requested information
3. A new folder and basic site is created for you.  To start the server, from the site's root run:
```
	coren -s
```

<a id="Documentation"></a>
## Documentation
### Coren: Sever
- Server is started by running coren -s from the site root
- this runs ```coren.cmd``` which runs ```node ./server/cli.js``` from <global node modules>/coren
- cli.js requires('./server') from the site's root
	- server/package.json defines the 'main' for the server folder (typically startup.js)
- startup.js loads the site's
- Server creates an instance of server/Controller which handles high level matching
	- Controller typically matches all paths with a catchAll
		- ex: both coren.com and coren.com/some/file.html would match and go to the callback
	- typically the catchAll route calls Controller.loadUrl()
		- Controller.loadUrl goes through the Controller's routes added by Backbone.Routers and looks for a match
		- when the controller finds a match, it runs the match's callback
	- if no match is found the Controller continues, attempting to serve public files
- Server creates an instance of mainApp
	- this entry point is defined in config/<config_mode>.js
- MainApp sets up the routers for the site
	- api router and coren backend are on by default
		- these can be turned off in the coren section of config
	- the api root, which defaults to /api/, is configurable as well
- The server waits for a client connection
- Client goes to www.yoursite.com
	- Controller catch all is called
	- Controller calls loadUrl
	- loadUrl matches homepage route
	- homepage route loads homepageTemplate and renders

- Routers:
	- code in route functions should be very short
		- typically just getView(), set options, view.collection.fetch(), and app.showView()
	- break routers up into separate files based on what they do
		- ex: all login routers in one file, etc
		- components can define routes

- Components:
	- each component must be wrapped in a single element
		- ex: <div class="coren_grid"> that holds everything
	- they are namespaced with their site
		- ex: coren_grid, caretaker_grid, ingenuity_backend
	- coren_backend is an example component
	- components can themselves be made of other smaller components
		- ex: coren_backend uses the coren_navbar component
	- components can be easily copied to other projects
		- this lets us improve the backend and easily move it from project to project
	- components contain templates, stylesheets, and javascript
	- they can define apps, views, routes, and anything else
	- they can be extended
		- ex: many components might be based on coren_grid, expanding upon it's basic functionality and styling

- Multiple clients
	- Instance per client
		- appView
	- Server singletons
		- server
		- coren
		- manager
		- templateManager
		- routers

### Using Coren
- create a new site using ```coren --newsite```
- this sets up some basic files, similar to Coren's internal folder structure:

	Site Root
	|-bin  			-> coren executable for building and automation
	|-build			-> assets for building the site and docs
	|-client  		-> base site files (main.js, templates, stylesheets)
		|-lib		-> modular namespaced client components
		|-vendor	-> vender components (ex: twitter-bootstrap)
	|-config  		-> client and server configuration files
	|-docs  		-> latest build of the documentation in html format
	|-node_modules  -> vendor modules managed by npm, linked Coren
	|-public  		-> static assets, typically content, to be served as is
		|-img 		-> common images, ideally compiled into sheets
		|-css 		-> compiled css, do not modify
		|-js 		-> compiled javascript, do not modify
	|-private  		-> static assets that require authentication to be served
	|-shared  		-> classes and other code shared on the server and client
	|-server  		-> base server + various modules
		|-lib		-> namespaced modular server components (ex: coren-backend)
	|-test  		-> client and server unit tests

### REST Implementation

	Resource	Verb		Action
	/users      -> GET      -> index
	/users      -> POST     -> create
	/users/1    -> GET      -> show
	/users/1    -> PUT      -> update
	/users/1    -> DELETE   -> destroy

### Testing
- Coren wraps testing, creating a test server and test database
- This allows you to use all of Coren's functionality withouth fear of destroying your working data
- Tests are run via command line
	- run all coren_* tests: ```coren --test```
	- run a specific test: ```coren --test test/query```

- Test files are automatically created when you use the component wizard
- A template file can be found in ```<coren>/test/testTemplate.js```

### Fixing MongoDB
1. remove the file /data/db/mongod.lock
2. run mongod.exe --repair
3. start the mongod service

### Useful Linux Commands
- delete a folder and all it's files
```
	rm -rf /some/directory
```
- edit a file
```
	vi /some/file
```
	- i = insert mode (so you can type stuff)
	- ESC = exit insert mode
	- :wq = write, quit
	- :q! = quit without saving

- check disk space
	- list summary of used and free space
```
	df -h
```
	- list space used by a given folder
```
	du -h -s /var/www/coren
```

- check free ram
```
	free -m
```
- get processor info
```
	cat /proc/cpuinfo
```
- test connection speed
```
	wget -O /dev/null http://speedtest.wdc01.softlayer.com/downloads/test10.zip
```
	- /dev/null looks empty when you read from it.
	- writing to /dev/null does nothing: data written to this device simply disappears

- monitor performance
```
	iostat -xmt 1
```
- Give your web user root privelages

	- opens the root privelages doc to edit
```
	vi sudo
```
	- find this line
```
	root    ALL=(ALL:ALL) ALL
```
	- add this line below it:
```
	web    ALL=(ALL:ALL) ALL
```
	- save and exit by pressing ESC, :, w, q (this (w)rites and (q)uits)

- Passwords
```
	passwd <user>
	passwd -r <user>
```


## CRUD for _entity and _field
Creating entities and fields requires updating the Coren schema and other additional steps as detailed below

Entities (_entity)

- create
	- creates the _entity entry
	- adds default fields
	- updates schema after creation
- modify
	- renames the collection if the name has changed
		collection.rename(new_name, callback)
	- errors if a collection by that name already exists
	- updates schema after modification
- delete
	- renames the collection _trash_{entityName}
		- allows for ease of undo and quick deletes
	- can drop any _trash_ collections via admin
		collection.drop(callback)
	- removes the _entity entry
	- updates schema after deletion

Fields (_field)

- create
	- setsFieldOptions, ie: uniqueness
	- creates the _field entry
	- updates schema after creation
- modify
	- renames the field if the name has changed
		db.post.update({}, {$rename: {"created":"created_date"}})
	- errors if a field by that name already exists
	- setsFieldOptions
	- updates schema after modification
- delete
	- renames the specified field _trash_{fieldName}
		- allows for ease of undo and quick deletes
	- can unsets any _trash_ fields via admin
	- removes the _field entry
	- updates schema after deletion

## Cloud Server Setup and Suggestions
- DigitalOcean (http://digitalocean.com) is our pick for cloud-based serving
- Fedora is the winning distro: systemd and ControlPersist for SSH

- use npm shrinkwrap (https://docs.npmjs.com/cli/shrinkwrap) to lock down dependency versions

## Server reading list
- [Node.js in Production](http://blog.carbonfive.com/2014/06/02/node-js-in-production/)
- [Ansible](http://docs.ansible.com/intro_getting_started.html)
- [Siege testing](http://blog.remarkablelabs.com/2012/11/benchmarking-and-load-testing-with-siege)
- [Github SSH Forwarding](https://developer.github.com/guides/using-ssh-agent-forwarding/)
- [Github Webhooks](https://developer.github.com/webhooks/)

## Examples
_(Coming soon, check the tests til then)_

## Release History
_(Nothing yet)_

