#!/bin/bash
# This is a shell script to provision the vagrant-lead setup of our dev env.

function installAnsible() {
  echo "installing pip.."
  apt-get install -y python-pip python-dev
  echo "installing ansible via pip.."
  pip install ansible
}

function installNodeRelated() {
 curl -sL https://deb.nodesource.com/setup | sudo bash -
 sudo apt-get install -y nodejs
}

function installGitRelated() {
  echo "installing git & tig"
  apt-get install -y git tig
}

function installSystemProgs() {
  echo "installing htop"
  apt-get install -y htop
}

function buildInfluxDB() {
  echo "building influxdb"
  docker build -t influxdb /vagrant/influxdb/
}

function buildMqttServer() {
  cp -r /vagrant/distribution /vagrant/mqtt_server/
  echo "building MQTT server"
  docker build -t mqtt_server /vagrant/mqtt_server/
  rm -r /vagrant/mqtt_server/distribution
}

apt-get update
installGitRelated
installSystemProgs
buildInfluxDB
buildMqttServer
installNodeRelated
source run_devenv.sh
