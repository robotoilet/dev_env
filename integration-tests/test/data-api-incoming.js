var should = require('should')
  , _ = require('underscore')
  , request = require('request-json')
  , utils = require('data-utils')
  , mqtt = require('mqtt');


var FIX = {
  httpTestApi: "http://localhost:8086/",
  httpTestRoot: "root",
  httpTestRootPwd: "root",
  sensorX: {
    "name": "SensorX",
    "columns": ["time", "line"],
    "points": [
      [new Date(2007,8,9,10).valueOf(), 12],
      [new Date(2007,8,9,11).valueOf(), 11]
    ]
  },
  sensorY: {
    "name": "SensorY",
    "columns": ["time", "temperature", "humidity"],
    "points": [
      [new Date(2007,8,9,10,11,12,13).valueOf(), 100.1, 3],
      [new Date(2007,8,9,10,11,12,14).valueOf(), 1.12, 4],
      [new Date(2007,8,9,10,11,12,15).valueOf(), 122.1, 6]
    ]
  },
  dbUrl: "db/toilets",
  site: 'siteX',
  punter: {name: 'punterX', password: 'punterX'}
};

FIX.sensorData = [FIX.sensorX, FIX.sensorY];
FIX.sensorDataAsString = "" +
  "(a " + Math.floor(new Date(2007,8,9,10).valueOf() / 1000) + " 12) " +
  "(a " + Math.floor(new Date(2007,8,9,11).valueOf() / 1000)+ " 11) " +
  "(b " + Math.floor(new Date(2007,8,9,10,12,13).valueOf() / 1000) + " 100.1 3) " +
  "(b " + Math.floor(new Date(2007,8,9,11,12,14).valueOf() / 1000) + " 1.12 4) " +
  "(b " + Math.floor(new Date(2007,8,9,11,12,15).valueOf() / 1000) + " 122.1 6)";


// Compare actual to expected data
function checkForPoints(responseData, expectedData) {
  var cleanedPoints = _.map(responseData.points, function(point) {
    // return the point without the sequence number
    return [point[0]].concat(point.slice(2));
  });
  _.every(expectedData.points, function(point) {
    cleanedPoints.should.containEql(point);
  });

}

// Make a http get request to get and compare the data to what is expected.
function queryDbForData(callback) {
  var http_client = request.newClient(FIX.httpTestApi);
  http_client.setBasicAuth(FIX.httpTestRoot, FIX.httpTestRootPwd);

  var prefix = FIX.punter.name + '_' + FIX.site;

  var queryX = "?q=select * from " + prefix + "_SensorX";
  var queryY = "?q=select * from " + prefix + "_SensorY";
  http_client.get(FIX.dbUrl + "/series" + queryX, function(err, res, body) {
    res.should.have.property('statusCode', '200');
    var namespacedX = utils.namespace(['name'], prefix, [FIX.sensorX]);
    checkForPoints(_.first(body), namespacedX);

    // if we're happy with sensorX data we finish with checking for Y
    http_client.get(FIX.dbUrl + "/series" + queryY, function(err, res, body) {
      res.should.have.property('statusCode', '200');
      var namespacedY = utils.namespace(['name'], prefix, [FIX.sensorY]);
      checkForPoints(_.first(body), namespacedY);

      // make sure we can delete the db
      deleteDatabase(callback);
    });
  });
}

function deleteDatabase(callback){
  var http_client = request.newClient(FIX.httpTestApi);
  http_client.setBasicAuth(FIX.httpTestRoot, FIX.httpTestRootPwd);
  http_client.del("db/toilets", function(err, res, body){
    res.should.have.property('statusCode', '204');
    callback();
  });
}

// High-level test for http api that checks whether one can
// (1) create a database
// (2) add point series to it
// (3) delete it
describe('incoming_http', function() {
  var http_client = request.newClient(FIX.httpTestApi);
  http_client.setBasicAuth(FIX.httpTestRoot, FIX.httpTestRootPwd);

  it('should accept a http post and write the data', function(done) {
    http_client.post("db", {"name": "toilets"}, function(err, res, b) {
      if (err) deleteDatabase(function(){ throw err });
      res.should.have.property('statusCode', '201');
      var userUrl = FIX.dbUrl + "/users";
      http_client.post(userUrl, FIX.punter, function(err, res, b) {
        if (err) deleteDatabase(function(){ throw err });
        res.should.have.property('statusCode', '200');
        // now newly created, for the rest set auth to normal user
        http_client.setBasicAuth(FIX.punter.name, FIX.punter.password);

        // create the data series and look whether it's there.
        var prefix = FIX.punter.name + '_' + FIX.site;
        var namespaced = utils.namespace(['name'], prefix, FIX.sensorData);

        var seriesUrl = FIX.dbUrl + "/series";
        http_client.post(seriesUrl, namespaced, function(err, res, b) {
          if (err) deleteDatabase(function(){ throw err });
          res.should.have.property('statusCode', '200'); // shouldn't it be 201??
          queryDbForData(done);
        });
      });
    });
  });
});

// High-level blackbox test for mqtt api that checks implicitely whether
// submitted data is
// (1) parsed correctly
// (2) its checksum is verified correctly
// (3) it is sent to the http dataserver which then is being checked for the
//     existence of this data
describe('incoming_mqtt', function() {
  var http_client = request.newClient(FIX.httpTestApi);
  http_client.setBasicAuth(FIX.httpTestRoot, FIX.httpTestRootPwd);

  it('should accept an mqtt publish by a known client and distribute the data', function(done) {
    // create a test database
    http_client.post("db", {"name": "toilets"}, function(err, res, body){
      if (err) deleteDatabase(function(){ throw err });
      res.should.have.property('statusCode', '201');
      http_client.post(FIX.dbUrl + "/users", FIX.punter, function(e, res, b) {
        if (e) deleteDatabase(function(){ throw e });
        // now newly created, for the rest set auth to normal user
        http_client.setBasicAuth(FIX.punter.name, FIX.punter.password);

        var mqtt_client = mqtt.createClient(1883, 'localhost', {
          clientId: FIX.site,
          username: FIX.punter.name,
          password: FIX.punter.password
        });

        var checksum = utils.checkchecksum(FIX.sensorDataAsString);

        // We assume here that the last thing the server does is to send out
        // the verified Data message. Still, we check for the data in the
        // database at the very end.
        mqtt_client.on('message', function(toppic, message) {
          toppic.should.equal('verifiedData');
          message.should.equal(checksum);
          mqtt_client.end();
          queryDbForData(done);
        });
        mqtt_client.publish(checksum, FIX.sensorDataAsString);
      });
    });
  });
});

