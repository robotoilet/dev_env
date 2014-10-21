# -*- mode: ruby -*-
# vi: set ft=ruby :
#
# This Vagrantfile defines the set up of our development environment.
#
# The components of this environment are meant to live in docker containers
# which are defined somewhere else.

# guest port configuration
NODE_PORT=8080
INFLUXDB_HTTP_PORT=8086 # influxdb http api, default: 8086
INFLUXDB_ADMIN_PORT=8083 # influxdb admin interface, default: 8083

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "ubuntu/trusty64"

  # Node port forwarding
  config.vm.network "forwarded_port", guest: NODE_PORT, host: 8080

  # influxdb port forwarding TODO: set up https api?
  config.vm.network "forwarded_port", guest: INFLUXDB_HTTP_PORT, host: 8086
  config.vm.network "forwarded_port", guest: INFLUXDB_ADMIN_PORT, host: 8083

  config.vm.provider :virtualbox do |vb|
    vb.memory = 2048
    vb.cpus = 2
  end

  # install docker and pull our default docker base image
  config.vm.provision "docker" do |d|
    d.pull_images "ubuntu:trusty"
  end

  config.vm.provision "shell", path: "scripts/vagrant.sh"
end
