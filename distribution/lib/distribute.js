/**
 * This module is meant to be used by any server (MQTT/COAP,..) once it has
 * received data; the data should be passed on using 'distribute', which takes
 * care that it ends up where it should.
 */

var request = require('request-json')
  , logger = require('./logger')
  , _ = require('underscore')
  , utils = require('data-utils');

// TODO: move config to own node module
var config = {};
config.httpApi = "http://localhost:8086";
config.dbName = "toilets";
config.dataParsers = {
  regex: {
    chunk: /[^\n]+/g,
    seriesName: /^[^\(\s]+/,
    dataPoints: /\(([^)]+)/g
  }
};
config.sensors = {
  sensorschmensor: {
    dataType: parseInt,
  },
  SensorY: {
    dataType: parseFloat,
  }
};

// Takes an `auth` object and a string (the msg/data)
//   auth: {id: <clientId>, username: <..>, password: <..>}
//
module.exports = function distribute(auth, dataString, callback) {
  var client = request.newClient(config.httpApi);
  client.setBasicAuth(auth.username, auth.password);
  var dbUrl = "/db/" + config.dbName + "/series";
  var parsedData = utils.parseData(dataString, config.dataParsers.regex,
                                   config.sensors);
  var namespacedData = utils.namespace(['name'], auth.id, parsedData);
  logger.debug("dbUrl: %s, namespacedData: %s", dbUrl, namespacedData);
  client.post(dbUrl, namespacedData, function (err, res, body) {
    if (err) {
      return callback("" + err);
    } else {
      return callback(res.statusCode);
    }
  });
};

