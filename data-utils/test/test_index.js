var should = require('should')
  , parseData = require('../index').parseData
  , namespace = require('../index').namespace;

describe('parse_dataString', function() {


  it('should parse a dataString to a javascript object', function(done) {
    var testString = 'SensorX (1415707255749 12) (1415707255759 13) (1415707255809 15)\n' +
                     'SensorY (1415707255743 23.356)\n' +
                     'SensorZ (1415707255748 400) (1415707255799 600)';
    var parserConfig = {
      chunk: /[^\n]+/g,
      seriesName: /^[^\(\s]+/,
      dataPoints: /\(([^)]+)/g
    };
    var sensors = {
      sensorschmensor: {
        dataType: parseInt,
      },
      SensorY: {
        dataType: parseFloat,
      }
    }; 

    parseData(testString, parserConfig, sensors).should.eql([
      {
        name: 'SensorX',
        columns: ['time', 'line'],
        points: [
          [1415707255749, 12],
          [1415707255759, 13],
          [1415707255809, 15]
        ]
      },
      {
        name: 'SensorY',
        columns: ['time', 'line'],
        points: [
          [1415707255743, 23.356]
        ]
      },
      {
        name: 'SensorZ',
        columns: ['time', 'line'],
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

  var objects = [
    {a: 'b', name: 'bla'},
    {a: 'c', b: 'haha', name: 'blub'}
  ];

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

