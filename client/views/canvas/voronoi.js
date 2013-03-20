function voronoi() {

// initial canvas configurations
var margin = {top: 10, right: 20, bottom: 10, left: 20},
    width = 960,
    height = 500;


var svg = d3.select("#chart")
  .append("svg:svg")
    .attr("width", width )
    .attr("height", height )

// drawAxis(svg, width, height, margin);

var paths, points, clips;
  clips = svg.append("svg:g").attr("id", "point-clips");
  points = svg.append("svg:g").attr("id", "points");
  paths = svg.append("svg:g").attr("id", "point-paths");

$( "#time_slider" ).slider({
      value:Session.get("current_timeframe"),
      min: 1,
      max: TimeFrames.find().count(),
      step: 1,
      slide: function( event, ui ) {
        Session.set("current_timeframe", ui.value);
        return update();
      }
    })

$( "#diameter_slider" ).slider({
      value:Session.get("current_diameter"),
      min: 1,
      max: Config.findOne({key: 'MAX_DIAMETER'}).value,
      step: 1,
      slide: function( event, ui ) {
        Session.set("current_diameter", ui.value);
        return update();
      }
    })

draw();

// control functions
function celldata(frameindex) {
  var timeframe = TimeFrames.findOne({index:frameindex-1});
  var cells = [];
  _.each(timeframe.visible, function(cell) { 
    var cell = Cells.findOne({_id: cell});
    cells.push({
      id: cell._id,
      x: cell.positions[timeframe.index][0],
      y: cell.positions[timeframe.index][1],
    });
    if (_.has(color_dict, cell._id) == false) {
      console.log("key does not exist: "+cell._id);
    }
  });
  return cells;
}

// _.map(cells, function(cell) { return [cell.x, cell.y];});

function update() {
  clearTimeout(timeout);

  d3.transition()
      .duration(100)
      .each(draw);
}


function draw() {
  cells = celldata(Session.get("current_timeframe"));
  if (cells == undefined || cells[0] == undefined )
    console.log("UNDEFINED");

  var DIAMETER = Session.get("current_diameter");

  // initial
  var clipsInit = clips.selectAll("clipPath")
        .data(cells, function(c,i) { return c.id;});

  var voronoi_cells = _.map(cells, function(c) { return [c.x, c.y];});

 pathsInit = paths.selectAll("path")
        .data(_.map(d3.geom.voronoi(voronoi_cells), function (path, i) {
            return {path: path, id: cells[i].id, color: cells[i].color };
          }), function(c) { return c.id; });

  var pointsInit = points.selectAll("circle")
        .data(cells, function(c) { return c.id; });

  // enter
  var clipsEnter = clipsInit.enter()
    .append("svg:clipPath")
      .attr("id", function(c) { 
        return "clip-"+c.id;})
    .append("svg:circle")
      .attr('cx', function(c) { return c.x;})
      .attr('cy', function(c) { return c.y;})
      .attr('r', DIAMETER);

  var pathsEnter = pathsInit.enter()
    .append("svg:path")
      .attr("d", function(d) { 
        return "M" + d.path.join(",") + "Z"; })
      .attr("clip-path", function(c, i) { 
        return "url(#clip-"+c.id+")"; })
      .style("fill", function(d) { return color_dict[d.id];})
      .style('fill-opacity', 0.4)
      .style("stroke", d3.rgb(200,200,200));

  var pointsEnter = pointsInit.enter().append("svg:circle")
      .attr("id", function(d, i) { 
        return "point-"+d.id; })
      .attr("cx", function(d) {return d.x;})
      .attr("cy", function(d) {return d.y;})
      .attr("r", 2)
      .attr('stroke', 'none');

  // update
  var clipsUpdate = d3.transition(clipsInit)
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .style("fill-opacity", 1);

  var pathsUpdate = d3.transition(pathsInit)
      .attr("d", function(d) {

        return "M" + d.path.join(",") + "Z";
      })
  var pointsUpdate = d3.transition(pointsInit)
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  // var pathsUpdate = d3.transition(pathsInit)
  // not sure how to do paths...

  // exit
  var clipsExit = d3.transition(clipsInit.exit())
      .style("fill-opacity", 0)
      .remove();

  var pointsExit = d3.transition(pointsInit.exit())
      .style("fill-opacity", 0)
      .remove();

  var pathsExit = d3.transition(pathsInit.exit())
      .style("fill-opacity", 0)
      .remove();

  // mouse events
  paths.selectAll("path")
    .on("mouseover", function(d, i) {
      d3.select(this)
        .style('fill', d3.rgb(31, 120, 180));
      svg.select('circle#point-'+cells[i].id)
        .style('fill', d3.rgb(31, 120, 180))
    })
    .on("mouseout", function(d, i) {
      d3.select(this)
        .style("fill", color_dict[d.id]);
      svg.select('circle#point-'+cells[i].id)
        .style('fill', 'black')
    });
}

var timeout = setTimeout(function() {
    update();
}, 1000);

function drawAxis(svg, w,h,margin) {
  var x = d3.scale.linear().domain([0,1]).range([0,w]);
  var y = d3.scale.linear().domain([0,1]).range([h,0]);
 
   
  var vis = svg.append("svg:g")
      .attr("transform", "translate(50,30)")
   
  var rules = vis.append("svg:g").classed("rules", true)
   
  function make_x_axis() {
    return d3.svg.axis()
        .scale(x)
        .orient("top")
        .ticks(10)
  }
   
  function make_y_axis() {
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10)
  }
   
  rules.append("svg:g").classed("grid x_grid", true)
      .call(make_x_axis()
        .tickSize(-h,0,0)
        .tickFormat("")
      )
   
  rules.append("svg:g").classed("grid y_grid", true)
      .call(make_y_axis()
        .tickSize(-w,0,0)
        .tickFormat("")
      )
   
  rules.append("svg:g").classed("labels x_labels", true)
      .call(make_x_axis()
        .tickSubdivide(1)
        .tickSize(5)
        // .tickFormat(d3.time.format("%Y/%m"))
      )
   
  rules.append("svg:g").classed("labels y_labels", true)
      .call(make_y_axis()
        .tickSubdivide(1)
        .tickSize(5)
      )
}

}









