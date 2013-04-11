analyze = function (diameters) {

    _.each(diameters, function (diameter) {
        console.log("Analyzing diameter: " + diameter + "\n============================");
        Graphs.insert({
            diameter: diameter
        });

        // build adjacency network
        var timeFrameGraphs = {};
        _.each(TimeFrames.find().fetch(), function(timeFrame) {
            timeFrameGraphs[timeFrame.index] = getTimeFrameGraph(timeFrame, diameter);
        });
        Graphs.update(
            {diameter: diameter},
            {$set: {timeFrames: timeFrameGraphs}
        });

        // evaluate stability

        var cellHistory = {};
        var numTimeFrames = _.size(timeFrameGraphs);

        // get history of contacts
        _.each(Cells.find().fetch(), function(cell) {
            cellHistory[cell._id] = _.range(numTimeFrames);
            _.each(timeFrameGraphs, function(timeFrameGraph, timeFrameIndex) {
                // console.log(JSON.stringify(timeFrameGraph));
                if (timeFrameGraph[cell._id] == undefined) {
                    cellHistory[cell._id][timeFrameIndex] = 0;
                } else {
                    cellHistory[cell._id][timeFrameIndex] = timeFrameGraph[cell._id].length;
                }
                Graphs.update({diameter:diameter}, {$set: {history: cellHistory}});
            });
           // console.log("Cell history:" + cellHistory[cell._id]);
        });

        // evaluate stability history
        var cellStability = {};
        var cellStabilityHistory = {};
        _.each(Cells.find().fetch(), function(cell) {
            var prevHistory = [];
            cellStabilityHistory[cell._id] = _.range(numTimeFrames);
            _.each(cellHistory[cell._id], function(contacts, timeFrameIndex) {
                var stability = evalStability(
                    {precomputed: true},
                    prevHistory,
                    contacts)
                cellStabilityHistory[cell._id][timeFrameIndex] = stability;
                prevHistory.push(stability);
            });
            // normalize stability by dividing by the length of the time frame
            // cellStability[cell._id] = _.map(cellStability[cell._id], function(d, i) {
            //     return d / i;
            // });
            cellStability[cell._id] = cellStabilityHistory[cell._id][numTimeFrames-1];
            Graphs.update({diameter:diameter}, {$set: 
                {stability: cellStability, 
                stabilityHistory: cellStabilityHistory}});
        });

        _.each(Cells.find().fetch(), function(cell) {
            console.log("    Cell "+ cell._id + ":\n  StabilityHistory: " + cellStabilityHistory[cell._id]);
        });
    });

    // evaluate stability of a cell based on history of contacts
    // [1,0,1,0,1] => 3
    // [1,1,1,0,0] => 1+2+3 = 6
    // [2,0,1] = [0,1,1] => 3 (maybe this is a problem...)
    function evalStability(method, history, lastContacts) {

        var score = 0;
        var prev = 0;

        function singlePointStability(contacts) {
            var score = 0;
            if(contacts > 0) {
                score = 1 + Math.log(contacts);
            } else {
                score = 0;
            }
            return score;
        }

        if(method['precomputed']) {
            if(history.length) {
                prev = history[history.length-1];
            }
            if(lastContacts > 0) {
                score =  prev + singlePointStability(lastContacts);
            } else {
                score = prev;
            }
            // otherwise the score is 0
        } else {
            _.each(history, function(contacts) {
                var cur;
                if(contacts == 0){
                    cur = 0;
                } else {
                    cur = prev + singlePointStability(contacts);
                }
                score += cur;
                prev = cur;
            });
        }
        return score;
    }

    function getTimeFrameGraph(timeFrame, diameter) {
        var allCells = _.map(timeFrame.visible, function (cellId) { 
            var cell = Cells.findOne({_id: cellId}); 
            return {
                id: cellId,
                x: cell.positions[timeFrame.index][0],
                y: cell.positions[timeFrame.index][1]
            };
        });
        // console.log("Cells in the timeframe: " + JSON.stringify(allCells));
        var knownPairs = [];
        var graph = {};

        var pairHash = function(cell1, cell2) {
            var pair = [cell1.id, cell2.id];
            pair.sort();
            return pair[0] + "--"+ pair[1];
        };

        var addToCellAdjacencyList = function(cell, neighbor) {
            graph[cell.id].push(neighbor.id);
            // console.log("Update graph to " + JSON.stringify(graph));
        };

        var isNeighbor = function(cell1, cell2, diameter) {
            var distance = Math.sqrt(
                Math.pow(cell1.x - cell2.x, 2) + Math.pow(cell1.y - cell2.y, 2));
            return distance <= diameter;
        };

        // initialise graph
        _.each(allCells, function(cell) {
            graph[cell.id] = [];
        });

        // populate dictionary graph such that:
        // cell -> [neighbor1, neighbor2, ...]
        _.each(allCells, function(cell1) {
            _.each(_.without(allCells, cell1), function (cell2) {
                if(knownPairs.indexOf(pairHash(cell1, cell2)) < 0) {
                    if(isNeighbor(cell1, cell2, diameter)) {
                        addToCellAdjacencyList(cell1, cell2);
                        addToCellAdjacencyList(cell2, cell1);
                    }        
                    knownPairs.push(pairHash(cell1, cell2));
                }
            });
        });
        // console.log("Graph at timeframe " + timeFrame.index + ": "+ JSON.stringify(graph));
        return graph;
    }
}



