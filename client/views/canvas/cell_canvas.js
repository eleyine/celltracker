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

  inspected_cells : function () {
    // var visible = TimeFrames.findOne({index: Session.get("current_timeframe") - 1}).visible;
    var visible = Session.get("inspected_cells");
    var cells = {};
    _.each(visible, function(cell){
      cells[cell] = {};
      cells[cell].color = color_dict[cell];
      cells[cell].name = Cells.findOne({_id: cell}).name;
      cells[cell].id = cell;

      var graph = Graphs.findOne(
        {diameter: Session.get("current_diameter")}
      );

      var history = graph.history[cell];
      var stabilityHistory = graph.stabilityHistory[cell];

      cells[cell].history = _.map(history, function(item, index) {
        var isCurrent = (index + 1) == Session.get("current_timeframe");
        return {value: item, isCurrent: isCurrent};
      });
      cells[cell].stabilityHistory = _.map(stabilityHistory, function(item, index) {
        var isCurrent = (index + 1) == Session.get("current_timeframe");
        return {value: Math.round(item*10)/10, isCurrent: isCurrent};
      });
      cells[cell].stability = graph.stability[cell];
    });
    return _.sortBy(_.map(cells, function(d) { return d;}), function(d) {
      return d.name;
    });
  }
});

// Template.cell_canvas.events({
//   'click a.close': function () {
//     _.each(toolbar_session_vars, function (v){
//       Session.set(v, null);
//     });
//   }
// });


Template.cell_canvas.rendered = function () {

    // assign a random color to each cell
    if (_.size(color_dict) == 0 && Colors.find().count() > 0) {
      var colors = Colors.find().fetch();
      _.each(Cells.find().fetch(), function(d) {
        color_dict[d._id] = d3.rgb(colors[_.random(0, colors.length)].rgb);
      });
    } 

    if(Config.find().count() > 0) {
      drawVoronoi();
      drawStabilityChart();
    }
    $('#viewStability').click(function(){
    $('#stabilityModal').modal({
        backdrop: true,
        keyboard: true
    }).css({
        width: '1000px',
        'margin-left': function () {
            return -($(this).width() / 2);
        }
    });
    });
    // modal width is too small


}

function drawStabilityChart() {
  console.log("Drawing stability...");
  var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'stabilityChart',
                type: 'line',
                width: 980
            },
            xAxis: {
                title: {
                  text: 'Timeframes'
                }
            },
            yAxis: {
                title: {
                    text: 'Stability'
                }
            },
            tooltip: {
                enabled: false,
                formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+
                        this.x +': '+ this.y +'°C';
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                    },
                    enableMouseTracking: true
                }
            },
            series: getSeries()
        });

  function getSeries() {
    var visible = Session.get("inspected_cells");
    var cells = _.map(visible, function(cell){
      var graph = Graphs.findOne(
        {diameter: Session.get("current_diameter")}
      );

      var history = graph.history[cell];
      var stabilityHistory = graph.stabilityHistory[cell];
      var celldata = {};
      celldata.color = color_dict[cell].toString();
      celldata.name = ''+Cells.findOne({_id: cell}).name;
      celldata.data = _.map(_.zip(stabilityHistory, history), function(item, index) {
        var stability = item[0];
        var contacts = item[1];
        return {dataLabels:
          {enabled: true,
            align: 'left',
            crop: false,
            style: { fontWeight: 'bold' },
            formatter: function() { return contacts },
            verticalAlign: 'top'},
          y: stability
        }
      });
      return celldata;
    });
    console.log(cells);
    return cells;
  }
}

Template.cell_canvas.created = function () {
  Session.set("current_timeframe", 72);
  Session.set("current_diameter", 50);
  Session.set("inspected_cells", []);
  color_dict = {};



}