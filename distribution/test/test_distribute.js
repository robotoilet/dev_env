var requireFrom = require('require-from');

var should = require('should');
var _ = require('underscore');
var nock = require('nock');


// TODO: move config to own node module
var config = {};
config.httpApi = "http://localhost:8086";
config.dbName = "toilets";

describe('parse_dataString', function() {
  var parseData = requireFrom('testExports', 'parseData', './distribute.js').parseData;

  it('should parse a dataString to a javascript object', function(done) {
    var testString = 'SensorX (1415707255749 12) (1415707255759 13) (1415707255809 15)\n' +
                     'SensorY (1415707255743 23.356)\n' +
                     'SensorZ (1415707255748 400) (1415707255799 600)';

    var t = parseData(testString);
    parseData(testString).should.eql([
      {
        name: 'SensorX',
        points: [
          [1415707255749, 12],
          [1415707255759, 13],
          [1415707255809, 15]
        ]
      },
      {
        name: 'SensorY',
        points: [
          [1415707255743, 23.356]
        ]
      },
      {
        name: 'SensorZ',
        points: [
          [1415707255748, 400],
          [1415707255799, 600]
        ]
      }
    ]);
    done();
  });
});

describe('namespace_objects', function() {

  var namespace = requireFrom('testExports', 'namespace', './distribute.js').namespace;

  var objects = [
    {a: 'b', name: 'bla'},
    {a: 'c', b: 'haha', name: 'blub'}]

  var newObjects = namespace(['name'], 'new', objects);

  it('should return a list of objects with prefixed name property', function(done) {
    newObjects[0].name.should.equal('new_bla');
    newObjects[0].a.should.equal('b');
    newObjects[1].name.should.equal('new_blub');
    newObjects[1].a.should.equal('c');
    newObjects[1].b.should.equal('haha');
    done();
  });
  it('..but should leave the old objects in peace', function(done) {
    objects[0].name.should.equal('bla');
    objects[1].name.should.equal('blub');
    done();
  });
});

describe('distribute_mainfunction', function() {
  var distribute = require('../distribute.js');
  var dbUrl = "/db/" + config.dbName + "/series";
  var dataString = "sensorschmensor (123 456) (789 10)";
  var dataObj = [
    {
      name: 'clientX_toiletX_sensorschmensor',
      points: [[123, 456], [789, 10]]
    }
  ];
  var http_api = nock(config.httpApi)
    .post(dbUrl, dataObj)
    .reply(200);
  distribute({id: 'clientX_toiletX', username: 'clientX', password:'clientX'},
             dataString, function(msg){http_api.done();nock.cleanAll();});
});
