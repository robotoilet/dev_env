var request = require('request-json');
var should = require('should');
var _ = require('underscore');

var SERVER_URL = "http://localhost:8086/";
var client = request.newClient(SERVER_URL);
client.setBasicAuth('root', 'root');


function checkForPoints(responseData, expectedData) {
  var cleanedPoints = _.map(responseData.points, function(point) {
    // return the point without the sequence number
    return [point[0]].concat(point.slice(2))
  });
  _.every(expectedData.points, function(point) {
    cleanedPoints.should.containEql(point);
  });

}

// The following function is abused as a high-level test that checks
// whether one can (1) create a db, (2) add point series to it and
// (3) delete it
//
// TODO: It is horrible but serves as an initial starting point.
describe('receive_sensorreading', function(){

  it('should accept a http post and write the data', function(done) {

    // make sure we can create a test database
    client.post("db", {"name": "toiletX"}, function(err, res, body){
      res.should.have.property('statusCode', '201');

      // some made up data for two sensors, each for two timestamp-value pairs
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
        "columns": ["time", "temperature", "humidity"],
        "points": [
          [new Date(2007,8,9,10,11,12,13).valueOf(), 100.1, 3],
          [new Date(2007,8,9,10,11,12,14).valueOf(), 1.12, 4],
          [new Date(2007,8,9,10,11,12,15).valueOf(), 122.1, 6]
        ]
      };
      var sensorData = [dataSensorX, dataSensorY];

      // create the data series and look whether it's there.
      var dbUrl = "db/toiletX/series";
      client.post(dbUrl, sensorData, function (err, res, body) {

        res.should.have.property('statusCode', '200'); // shouldn't it be 201??

        var queryX = "?q=select * from sensorX";
        var queryY = "?q=select * from sensorY";
        client.get(dbUrl + queryX, function(err, res, body) {
          res.should.have.property('statusCode', '200');
          checkForPoints(_.first(body), dataSensorX);

          // if we're happy with sensorX data we finish with checking for Y
          client.get(dbUrl + queryY, function(err, res, body) {
            res.should.have.property('statusCode', '200');
            checkForPoints(_.first(body), dataSensorY);

            // make sure we can delete the db
            client.del("db/toiletX", function(err, res, body){
              res.should.have.property('statusCode', '204');
              done();
            });
          });
        });
      });
    });
  });
  afterEach(function(){
    client.del("db/toiletX", function(err, res, body){});
  });
});
