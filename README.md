Development Environment
=======================
The development environment for the RoboToilet project consists of a Vagrant
configured Virtualbox image, the distribution is Ubuntu.

The current version of each component is meant to run within its own Docker
container, such as the MQTT server, the database with its HTTP API, etc, see
below.

Installation
------------
* Get and install Virtualbox (https://www.virtualbox.org/) for your OS
* Get and install Vagrant (https://www.vagrantup.com/) for your OS
* Clone this repository

    $ git clone https://github.com/robotoilet/dev_env.git

* Download, provision and run the vagrant box

    $ vagrant up

  This will take a while, as it has to 
    - download the ubuntu base image for the vagrant box
    - download and install docker on the machine
    - download the base box for the Docker container(s)
    - build the containers configured in the Vagrantfile

Components
----------
The different components of this project are meant to be managed in a modular
way, each within its own Docker container. Each container should be built by
default on 'vagrant provision'. In order to run the containers on a already
provisioned environment, after the vm has started, do
  $ ./start_dev_env.sh

This will run the containers incl. some integration tests.

### Databases
#### InfluxDB
InfluxDB is the timeseries database of our choice for the first phase of our
project. There's a simple Dockerfile to set up a docker container with an
influxdb instance on it. The exposed ports are forwarded to the host host
(outside of the virtualbox box).
##### Usage
The database can be access directly via an http api at port 8086.
For examples see integration-test/test/http_incoming.js
If run locally there is a admin user inteface http://localhost:8083/
