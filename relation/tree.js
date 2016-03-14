var width = 1200,
    height = 600,
    boxWidth = 170,
    boxHeight = 20,
    gap = {
        width: 70,
        height: 6
    },
    margin = {
        top: 16,
        right: 16,
        bottom: 16,
        left: 16
    },
    data,
    svg;

// test layout
var Nodes = [];
var links = [];
var numLvls = 0,
    marginLvls = [],
    count = [];

var diagonal = d3.svg.diagonal()
    .projection(function (d) {
        "use strict";
        return [d.y, d.x];
    });

function find(text) {
    "use strict";
    var i;
    for (i = 0; i < Nodes.length; i += 1) {
        if (Nodes[i].name === text) {
            return Nodes[i];
        }
    }
    return null;
}

// Bring the current selection to the front of drawing.
// This is neccessary when there are to many links 
// and the highlighted link is behind all of them.
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

// Reverse function to moveToFront
d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
};

function switch_state (d, stat) {
    if (stat){
        d3.select("#" + d.id).moveToFront().classed("activelink", stat); // change link color
        d3.select("#" + d.id).moveToFront().classed("link", !stat); // change link color
    }else{
        d3.select("#" + d.id).moveToBack().classed("activelink", stat); // change link color
        d3.select("#" + d.id).moveToBack().classed("link", !stat); // change link color
    }
}

function mouse_action(val, stat, direction) {
    "use strict";
    d3.select("#" + val.id).classed("active", stat);

    links.forEach(function (d) {
        if (direction == "root") {
            if (d.source.id === val.id) {
                switch_state(d, stat);
//                d3.select("#" + d.id).moveToFront().classed("activelink", stat); // change link color
//                d3.select("#" + d.id).moveToFront().classed("link", !stat); // change link color
                if (d.target.lvl < val.lvl)
                    mouse_action(d.target, stat, "left");
                else if (d.target.lvl > val.lvl)
                    mouse_action(d.target, stat, "right");
            }
            if (d.target.id === val.id) {
                switch_state(d, stat);
//                d3.select("#" + d.id).moveToFront().classed("activelink", stat); // change link color
//                d3.select("#" + d.id).moveToFront().classed("link", !stat); // change link color
                if (direction == "root") {
                    if(d.source.lvl < val.lvl)
                        mouse_action(d.source, stat, "left");
                    else if (d.source.lvl > val.lvl)
                        mouse_action(d.source, stat, "right");
                }
            }
        }else if (direction == "left") {
            if (d.source.id === val.id && d.target.lvl < val.lvl) {
                switch_state(d, stat);
//                d3.select("#" + d.id).moveToFront().classed("activelink", stat); // change link color
//                d3.select("#" + d.id).moveToFront().classed("link", !stat); // change link color
                mouse_action(d.target, stat, direction);
            }
            if (d.target.id === val.id && d.source.lvl < val.lvl) {
                switch_state(d, stat);
//                d3.select("#" + d.id).moveToFront().classed("activelink", stat); // change link color
//                d3.select("#" + d.id).moveToFront().classed("link", !stat); // change link color
                mouse_action(d.source, stat, direction);
            }
        }else if (direction == "right") {
            if (d.source.id === val.id && d.target.lvl > val.lvl) {
                switch_state(d, stat);
//                d3.select("#" + d.id).moveToFront().classed("activelink", stat); // change link color
//                d3.select("#" + d.id).moveToFront().classed("link", !stat); // change link color
                mouse_action(d.target, stat, direction);
            }
            if (d.target.id === val.id && d.source.lvl > val.lvl) {
                switch_state(d, stat);
//                d3.select("#" + d.id).moveToFront().classed("activelink", stat); // change link color
//                d3.select("#" + d.id).moveToFront().classed("link", !stat); // change link color
                mouse_action(d.source, stat, direction);
            }
        }
    });
}

function renderRelationshipGraph(data) {
    "use strict";

    data.Nodes.forEach(function (d, i) {
        d.x = margin.left + d.lvl * (boxWidth + gap.width);
        d.y = marginLvls[d.lvl] + (boxHeight + gap.height) * count[d.lvl];
        d.id = "n" + i;
        count[d.lvl] += 1;
        Nodes.push(d);
    });

    data.links.forEach(function (d) {
        links.push({
            source: find(d.source),
            target: find(d.target),
            id: "l" + find(d.source).id + find(d.target).id
        });
    });

    svg.append("g")
        .attr("class", "nodes");

    var node = svg.select(".nodes")
        .selectAll("g")
        .data(Nodes)
        .enter()
        .append("g")
        .attr("class", "unit");

    node.append("rect")
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .attr("id", function (d) { return d.id; })
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("class", "node")
        .attr("rx", 6)
        .attr("ry", 6)
        .on("mouseover", function () {
            mouse_action(d3.select(this).datum(), true, "root");
        })
        .on("mouseout", function () {
            mouse_action(d3.select(this).datum(), false, "root");
        });

    node.append("text")
        .attr("class", "label")
        .attr("x", function (d) { return d.x + 14; })
        .attr("y", function (d) { return d.y + 15; })
        .text(function (d) { return d.text; });

    links.forEach(function (li) {
        svg.append("path", "g")
            .attr("class", "link")
            .attr("id", li.id)
            .attr("d", function () {
                var oTarget = {
                    x: li.target.y + 0.5 * boxHeight,
                    y: li.target.x
                };
                var oSource = {
                    x: li.source.y + 0.5 * boxHeight,
                    y: li.source.x
                };
                
                if (oSource.y < oTarget.y) {
                    oSource.y += boxWidth;
                } else {
                    oTarget.y += boxWidth;
                }
                return diagonal({
                    source: oSource,
                    target: oTarget
                });
            });
    });
}

// M A I N   C O D E

d3.json("flare.json", function (json) {
    "use strict";
    data = json;
    
    svg = d3.select("#tree").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");
    
    data.Nodes.forEach(function (d) {
        count[d.lvl] = 0;
        marginLvls[d.lvl] = 0;
    });
    numLvls = count.length;
    
    data.Nodes.forEach(function (d) {
        marginLvls[d.lvl] += 1;
    });
    
    for (var i = 0; i < marginLvls.length; i++){
        marginLvls[i] = (height - marginLvls[i]*boxHeight - (marginLvls[i]-1)*gap.height)/2;
    }
    
    renderRelationshipGraph(data);
});