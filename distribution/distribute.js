/**
 * This module is meant to be used by any server (MQTT/COAP,..) once it has
 * received data; the data should be passed on using 'distribute', which takes
 * care that it ends up where it should.
 */

var request = require('request-json');
var logger = require('./logger.js');
var _ = require('underscore');

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


// Parses a string using regular expression 'recipes' from the configuration
// and simple basic rules:
// -> the data has to be chunked into named series
// -> each series chunk has to have a name and only one
//    (A string can have repeated series with the same name though)
// -> each series chunk can have an arbitrary amount of data points
// -> a data point has to start with a timestamp followed by n values,
//    each item matchable by [\w\.-]+, hence separators can be any
//    non-alphanumeric character excluding '_', '-' and '.'.
//
// output format:
// [
//  {
//    name: <name>,
//    points: [
//      [<timestamp>, <value1>, .., <valueN>],
//      ..
//    ]
//  },
//  ..
// ]
function parseData(dataString) {
  var reConf = config.dataParsers.regex;
  var chunks = dataString.match(reConf.chunk);

  function buildObject(s) {
    var seriesName = s.match(reConf.seriesName)[0];
    var series = config.sensors[seriesName];
    var columns = (series && series.columns) || ['time', 'line'];
    var dataType = (series && series.dataType) || parseInt;
    var dataPoints = s.match(reConf.dataPoints);

    dataPoints = _.map(dataPoints, function(p) {
      return _.map(p.match(/[\w\.-]+/g), function(s) {
        return dataType(s);
      });
    });

    return {
      name: seriesName,
      columns: columns,
      points: dataPoints
    };
  }

  return _.map(chunks, buildObject);
}

function validateData(objArray) {
}

// Adds a <`prefix` + '_'> to the values of all `keys` for each object in the
// provided `objArray`.
//
// NOTE: creates flat copies of the objects
function namespace(keys, prefix, objArray) {
  return _.map(objArray, function(obj) {
    newObj = {};
    var allProperties = Object.keys(obj);
    for (i in allProperties) {
      var propName = allProperties[i];
      var propValue = obj[propName];
      if (_.contains(keys, propName)) propValue =  prefix + "_" + propValue;
      newObj[propName] = propValue;
    }
    return newObj;
  });
}

// Takes an `auth` object and a string (the msg/data)
//   auth: {id: <clientId>, username: <..>, password: <..>}
//
module.exports = function distribute(auth, dataString, callback) {
  var client = request.newClient(config.httpApi);
  client.setBasicAuth(auth.username, auth.password);
  var dbUrl = "/db/" + config.dbName + "/series";
  var namespacedData = namespace(['name'], auth.id, parseData(dataString));
  logger.debug("dbUrl: %s, namespacedData: %s", dbUrl, namespacedData);
  client.post(dbUrl, namespacedData, function (err, res, body) {
    if (err) {
      return callback(err);
    } else {
      return callback(res);
    }
  });
};

module.testExports = {
  namespace: namespace,
  parseData: parseData
};

