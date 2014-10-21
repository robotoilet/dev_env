Development Environment
=======================
The development environment for the RoboToilet project consists of a Vagrant
configured Virtualbox image, the distribution is Ubuntu.

Installation
------------
* Get and install Virtualbox (https://www.virtualbox.org/) for you OS
* Get and install Vagrant (https://www.vagrantup.com/) for your OS
* Clone this repository
    $ git clone https://github.com/robotoilet/dev_env.git
* Download, provision and run the vagrant box
    $ vagrant up
  This will take a while, as it has to 
    - download the ubuntu base image for the vagrant box
    - download and install docker on the machine
    - download the base box for the docker container(s)
    - create the containers configured in the Vagrantfile

Components
----------
The different components of this project are meant to be managed in a modular way,
each within its own docker container.

### Databases
#### InfluxDB
InfluxDB is the timeseries database of our choice for the first phase of our
project. There's a simple Dockerfile to set up a docker container with an
influxdb instance on it. The exposed ports are forwarded to the host host
(outside of the virtualbox box).
##### Usage
Currently the database can be access directly via an http api (TODO: think
about putting an mqtt broker inbetween) at port 8083.
The following are just a few commands cut&paste from the influxdb docs
* Create a new database
curl -X POST 'http://<influxdb-url>:8086/db?u=root&p=root' \
  -d '{"name": "NAME_OF_DATABASE"}'
