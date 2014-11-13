#!/bin/bash

# re-usable functions to start up our dev env

function runInfluxDB() {
  echo "starting influxdb"
  docker run -d -p 8083:8083 -p 8086:8086 influxdb
}

function runMqttServer() {
  echo "starting the MQTT server"
  docker run -d -p 1883:1883 mqtt_server
}

function runIntegrationTests() {
  echo "waiting for influx-db to show up.."
  while ! netstat -an | grep 8086; do sleep 1; done
  sleep 4 # wait 4 more seconds as it can take time to fully start
  echo "..can see a listening port 8086 :-)"
  echo "waiting for mqtt-server to show up.."
  while ! netstat -an | grep 1883; do sleep 1; done
  sleep 4 # wait 4 more seconds as it can take time to fully start
  echo "..can see a listening port 1883 :-)"
  echo "doing some basic integration tests ensuring all is up and running"
  cd /vagrant/integration-tests
  echo "(1. installing required node modules..)"
  npm install
  echo "(2. running the tests..)"
  node_modules/.bin/mocha
}

runInfluxDB
runMqttServer
runIntegrationTests
