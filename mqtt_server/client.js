var mqtt = require('mqtt')

client = mqtt.createClient(1883, 'localhost', {
  clientId: "toiletX",
  username: "clientX",
  password: "clientX"
});

var dataSensorX = {
  "name": "sensorX",
  "columns": ["time", "line"],
  "points": [
    [new Date(2007,8,9,10).valueOf(), 12],
    [new Date(2007,8,9,11).valueOf(), 11]
  ]
};
var dataSensorY = {
  "name": "sensorY",
  "columns": ["time", "line"],
  "points": [
    [new Date(2007,8,9,10,11,12,13).valueOf(), 100.1],
    [new Date(2007,8,9,10,11,12,14).valueOf(), 1.12]
  ]
};
var sensorData = [dataSensorX, dataSensorY];

//client.subscribe('presence');
client.publish('presence', JSON.stringify(sensorData));

client.on('message', function (topic, message) {
    console.log(message);
});

client.end();
