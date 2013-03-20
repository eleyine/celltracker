// Cells -- {positions: [[float,float], [float,float], ...]}
// where:
//    positions is a list of coordinates whose index corresponds to the timeframe index

Cells = new Meteor.Collection("cells");

// Publish complete set of cells to all clients.
Meteor.publish('cells', function () {
  return Cells.find();
});

// TimeFrames -- {index: int,
//                visible: [String, String, ...]}
// where:
//    visible is a list of cell ids

TimeFrames = new Meteor.Collection("timeframes");

// Publish complete set of cells to all clients.
Meteor.publish('timeframes', function () {
  return TimeFrames.find();
});

// Colors -- {name: String}
Colors = new Meteor.Collection("colors");

Meteor.publish('colors', function () {
    return Colors.find();
})

// Graphs
Graphs = new Meteor.Collection("graphs")

Meteor.publish('graphs', function () {
    return Graphs.find();
})

// Configurations
Config = new Meteor.Collection("config")

Meteor.publish("config", function() {
    return Config.find();
})