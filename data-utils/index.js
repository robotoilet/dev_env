var logger = require('./logger')
  , _ = require('underscore');


// Parse a string using regular expression 'recipes' from the configuration
// and simple basic rules:
// -> the data has to be chunked into named series
// -> each series chunk has to have a name and only one
//    (A string can have repeated series with the same name though)
// -> each series chunk can have an arbitrary amount of data points
// -> a data point has to start with a timestamp followed by n values,
//    each item matchable by [\w\.-]+, hence separators can be any
//    non-alphanumeric character excluding '_', '-' and '.'.
//
// parseConfig: an Object holding regular expressions for
//  - getting each chunk out of the string
//  - getting one name (== identifier for this chunk) out of each chunk
//  - getting an arbitrary amount of datapoints out of each chunk
//
// dataDefs: once a series name is found, it expected format will be looked
//           up here:
//  {
//    <seriesName>: {
//      dataType: <String|parseInt|parseFloat> // optional, default: parseInt
//      columns: [<columName>, ..] // optional, default: ['time', 'line']
//    }
//  }
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
module.exports.parseData = function(dataString, parseConfig, dataDefs) {
  var chunks = dataString.match(parseConfig.chunk);

  function buildObject(s) {
    var seriesName = s.match(parseConfig.seriesName)[0];
    var dataDef = dataDefs[seriesName];
    var columns = (dataDef && dataDef.columns) || ['time', 'line'];
    var dataType = (dataDef && dataDef.dataType) || parseInt;
    var dataPoints = s.match(parseConfig.dataPoints);

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
// NOTE: creates prototype children of the objects, but shadows the `keys`
// properties with their namespaced counterparts.
module.exports.namespace = function(keys, prefix, objArray) {
  return _.map(objArray, function(obj) {
    newObj = Object.create(obj);
    var allProperties = Object.keys(obj);
    for (var i in allProperties) {
      var propName = allProperties[i];
      var propValue = obj[propName];
      if (_.contains(keys, propName)) propValue =  prefix + "_" + propValue;
      newObj[propName] = propValue;
    }
    return newObj;
  });
}
