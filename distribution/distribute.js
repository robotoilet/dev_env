// This library is meant to be fead used by any server once it has received
// data; the data should be passed on using 'distribute', which takes care
// that it ends up where it should.

var request = require('request-json');
var logger = require('./logger.js');
var _ = require('underscore');

// TODO: move config to own node module
var config = {};  
config.httpApi = "http://localhost:8086";
config.dbName = "toilets";

function namespace(prefix, arrayOfObjects) {
  return _.map(arrayOfObjects, function(obj) {
    obj.name = prefix + "_" + obj.name;
    return obj;
  });
}

// distribute takes an `auth` object and a json string containing
//            the data to forward to the database.
//  auth: {clientId: <id>, username: <..>, password: <..>}
module.exports = function distribute(auth, jsonString) {
  var client = request.newClient(config.httpApi);
  client.setBasicAuth(auth.username, auth.password);
  var dbUrl = config.httpApi + "/db/" + config.dbName + "/series";
  var namespacedData = namespace(auth.id, JSON.parse(jsonString));
  logger.debug("dbUrl: %s, namespacedData: %s", dbUrl, namespacedData);
  client.post(dbUrl, namespacedData, function (err, res, body) {
    if (err) {
      logger.error("got error response while attempting to send data: %s",
          err.message);
    } else {
      logger.info("successfully sent data. response statusCode was : %s",
          res.statusCode);
    }
  });
}

