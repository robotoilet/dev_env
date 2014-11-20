#!/bin/bash

# re-usable functions to start up our dev env

function runInfluxDB() {
  if docker ps -a | grep 'sensorDB'; then
    echo "starting existing sensorDB container.."
    docker start sensorDB
  else
    echo "running new influxdb instance as 'sensorDB'.."
    docker run -d -p 8083:8083 -p 8086:8086 --name sensorDB influxdb
  fi
}

function runMqttServer() {
  if docker ps -a | grep 'mqttServer'; then
    echo "starting existing mqttServer container.."
    docker start mqttServer
  else
    echo "running new mqtt_server instance as 'mqttServer.."
    docker run -d -p 1883:1883 --link sensorDB:sensorDB --name mqttServer mqtt_server
  fi
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
  npm test
}

runInfluxDB
runMqttServer
runIntegrationTests
