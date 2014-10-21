#!/bin/bash

# This is a shell script to provision the vagrant-lead setup of our dev env.

function installAnsible() {
  echo "installing pip.."
  apt-get install -y python-pip python-dev
  echo "installing ansible via pip.."
  pip install ansible
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

function runInfluxDB() {
  echo "starting influxdb"
  docker run -p 8083:8083 -p 8086:8086 influxdb
}

apt-get update
installGitRelated
installSystemProgs
buildInfluxDB
runInfluxDB
