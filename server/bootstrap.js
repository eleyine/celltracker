// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  console.log("New startup.");
    if(Cells.find().count() == 0) {
    console.log("Building database.");

    // load json
    var require = __meteor_bootstrap__.require;
    var fs = require('fs');
    var cells_json = JSON.parse(fs.readFileSync('server/fixtures/cells.json', 'UTF8'));
    var colors_json = JSON.parse(fs.readFileSync('server/fixtures/colors.json', 'UTF8'));

    // populate Cells collection
    var num_timeframes = cells_json[0]['positions'].length
    var timeframes = {}
    for (var i = 0; i < cells_json.length; i++) {
      var cell_id = Cells.insert({
        positions: cells_json[i]['positions'],
        name: i
      });

      // extract data in timeframes dictionary for further use
      _.each(cells_json[i]['positions'], function (item, index) {
        if (item) {
          if (! _.has(timeframes, index)) {
            timeframes[index] = {
              visible: [],
              index: index
            };
          }
          timeframes[index].visible.push(cell_id);
        }
      });
    }

    // populate TimeFrames collection
    _.each(timeframes, function(value) {
      TimeFrames.insert(value);
    });

    // populate Colors collection with PyMol default colors
    var array_to_rgb = function(val){
      val = val.map( function(item) { return Math.floor(item * 255);});
      return 'rgb('+val[0]+','+val[1]+','+val[2]+')';
    }
    for (var key in colors_json) {
      Colors.insert({
        name: key, 
        rgb_array: colors_json[key],
        rgb: array_to_rgb(colors_json[key])
      });
    }

    // populate Configurations
    Config.insert({
      key: 'MAX_DIAMETER',
      value: 30
    })

    // do preliminary analysis
    var MAX_DIAMETER = Config.findOne({key:'MAX_DIAMETER'}).value;
      analyze(_.range(1, MAX_DIAMETER+1));
    }
});
