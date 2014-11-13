var should = require('should');
var _ = require('underscore');
var request = require('request-json');
var mqtt = require('mqtt')


var FIX = {
  sensorX: {
    "name": "sensorX",
    "columns": ["time", "line"],
    "points": [
      [new Date(2007,8,9,10).valueOf(), 12],
      [new Date(2007,8,9,11).valueOf(), 11]
    ]
  },
  sensorY: {
    "name": "sensorY",
    "columns": ["time", "temperature", "humidity"],
    "points": [
      [new Date(2007,8,9,10,11,12,13).valueOf(), 100.1, 3],
      [new Date(2007,8,9,10,11,12,14).valueOf(), 1.12, 4],
      [new Date(2007,8,9,10,11,12,15).valueOf(), 122.1, 6]
    ]
  },
  dbUrl: "db/toiletX/series"
}

FIX.sensorData = [FIX.sensorX, FIX.sensorY];


// Compare actual to expected data
function checkForPoints(responseData, expectedData) {
  var cleanedPoints = _.map(responseData.points, function(point) {
    // return the point without the sequence number
    return [point[0]].concat(point.slice(2))
  });
  _.every(expectedData.points, function(point) {
    cleanedPoints.should.containEql(point);
  });

}

// Make a http get request to get and compare the data to what is expected.
function queryDbForData(callback) {
  var http_client = request.newClient( "http://localhost:8086/");
  http_client.setBasicAuth('root', 'root');

  var queryX = "?q=select * from sensorX";
  var queryY = "?q=select * from sensorY";
  http_client.get(FIX.dbUrl + queryX, function(err, res, body) {
    res.should.have.property('statusCode', '200');
    checkForPoints(_.first(body), FIX.sensorX);

    // if we're happy with sensorX data we finish with checking for Y
    http_client.get(FIX.dbUrl + queryY, function(err, res, body) {
      res.should.have.property('statusCode', '200');
      checkForPoints(_.first(body), FIX.sensorY);

      // make sure we can delete the db
      http_client.del("db/toiletX", function(err, res, body){
        res.should.have.property('statusCode', '204');
        callback();
      });
    });
  });
}

// The following function is abused as a high-level test that checks
// whether one can (1) create a db, (2) add point series to it and
// (3) delete it
//
describe('incoming_http', function() {
  var http_client = request.newClient( "http://localhost:8086/");
  http_client.setBasicAuth('root', 'root');

  it('should accept a http post and write the data', function(done) {

    // make sure we can create a test database
    http_client.post("db", {"name": "toiletX"}, function(e, res, b){
      res.should.have.property('statusCode', '201');

      // create the data series and look whether it's there.
      http_client.post(FIX.dbUrl, FIX.sensorData, function(e, res, b) {
        res.should.have.property('statusCode', '200'); // shouldn't it be 201??
        queryDbForData(done);
      });
    });
  });

  afterEach(function(){
    http_client.del("db/toiletX", function(err, res, body){});
  });

});

describe('incoming_mqtt', function() {
  var http_client = request.newClient( "http://localhost:8086/");
  http_client.setBasicAuth('root', 'root');

  it('should accept an mqtt publish by a known client and distribute the data', function(done) {
    // create a test database
    http_client.post("db", {"name": "toiletX"}, function(err, res, body){
      res.should.have.property('statusCode', '201');

      client = mqtt.createClient(1883, 'localhost', {
        clientId: "toiletX",
        username: "clientX",
        password: "clientX"
      });
      client.publish('unimportant_tag', JSON.stringify(FIX.sensorData));
      client.end();
      queryDbForData(done);
    });
  });

  afterEach(function(){
    http_client.del("db/toiletX", function(err, res, body){});
  });

});

