var requireFrom = require('require-from')
  , should = require('should')
  , _ = require('underscore')
  , nock = require('nock')
  , logger = require('../lib/logger')
  , distribute = require('../lib/distribute');


// TODO: move config to own node module
var config = {};
config.httpApi = "http://localhost:8086";
config.dbName = "toilets";


describe('distribute_mainfunction', function() {
  var http_api;
  var dbUrl = "/db/" + config.dbName + "/series";
  var dataString = "sensorschmensor (123 456) (789 10)";
  var dataObj = [
    {
      name: 'clientX_toiletX_sensorschmensor',
      columns: ['time', 'line'],
      points: [[123, 456], [789, 10]]
    }
  ];
  beforeEach(function(){
    http_api = nock(config.httpApi)
      .post(dbUrl, dataObj)
      .reply(200);
  });
  it('should convert a data string and post as json to the http api', function(done) {
    var auth = {
      id: 'clientX_toiletX',
      username: 'clientX',
      password:'clientX'
    };
    function nockHappy(msg) {
      logger.debug(msg);
      http_api.done();
      done()
    }
    distribute(auth, dataString, nockHappy);
  });
  afterEach(function(){
    nock.cleanAll();
  });
});
