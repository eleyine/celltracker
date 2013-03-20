// Client-side JavaScript, bundled and sent to client.
Session.set('initialLoad', true);

// Define Minimongo collections to match server/publish.js.
Cells = new Meteor.Collection("cells");
TimeFrames = new Meteor.Collection("timeframes");
Colors = new Meteor.Collection("colors");
Graphs = new Meteor.Collection("graphs");
Config = new Meteor.Collection("config");
Data = [Cells, TimeFrames, Colors, Config, Graphs];

// Session variables
Session.set('current_timeframe', null);
Session.set('cells_loaded', false);
Session.set('graphs_loaded', false);
Session.set('timeframes', false);

Meteor.subscribe('cells', function onComplete() {
  return Session.set('cells_loaded', true);
});

Meteor.subscribe('timeframes', function onComplete() {
  return Session.set('timeframes_loaded', true);
});

Meteor.subscribe('colors', function onComplete() {
  return Session.set('colors_loaded', true);
});

Meteor.subscribe('graphs', function onComplete() {
  return Session.set('graphs_loaded', true);
});

Meteor.subscribe('config', function onComplete() {
  return Session.set('config_loaded', true);
});

Meteor.startup(function () {
   // Backbone.history.start({pushState: true});
});
