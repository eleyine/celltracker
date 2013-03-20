Template.cell_canvas.helpers({
  data_loaded: function () {
    return _.every(Data, function(data) { return data.find().count() > 0 });
  },
  current_time: function () {
    return Session.get("current_timeframe");
  },
  current_diameter: function () {
    return Session.get("current_diameter");
  },
  cells : function () {
    var visible = TimeFrames.findOne({index: Session.get("current_timeframe") - 1}).visible;
    console.log("visible cells: " + visible);
    var cells = {};
    _.each(visible, function(cell){
            console.log(Graphs.findOne(
        {diameter: Session.get("current_diameter")}
      ));
      cells[cell] = {};
      cells[cell].color = color_dict[cell];
      cells[cell].name = Cells.findOne({_id: cell}).name;

      var history = Graphs.findOne(
        {diameter: Session.get("current_diameter")}
      ).history[cell];

      cells[cell].history = _.map(history, function(item, index) {
        var isCurrent = (index + 1) == Session.get("current_timeframe");
        return {value: item, isCurrent: isCurrent};
      });
      cells[cell].stability = Graphs.findOne(
        {diameter: Session.get("current_diameter")}
      ).stability[cell];
    });
    return _.sortBy(_.map(cells, function(d) { return d;}), function(d) {
      return d.name;
    });
  }
});

Template.cell_canvas.rendered = function () {

    // assign a random color to each cell
    var colors = Colors.find().fetch();
    if (_.size(color_dict) == 0 && Colors.find().count() > 0) {
      console.log("Initializing color dictionary");
      _.each(Cells.find().fetch(), function(d) {
        color_dict[d._id] = d3.rgb(colors[_.random(0, colors.length)].rgb);
      });
    } 
    voronoi();
}

Template.cell_canvas.created = function () {
  Session.set("current_timeframe", 1);
  Session.set("current_diameter", 10);
  color_dict = {};
}