var boxWidth = 170,
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
    data,   // set after main code comment
    svg,    // set after main code comment
    width,  // set after main code comment
    height; // set after main code comment

// test layout
var Nodes = [];
var links = [];
var numLvls = 0,
    topMarginLvl = [],
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
    if(val.url)
        d3.select("#" + val.id).classed("witurl", !stat);

    links.forEach(function (d) {
        // This is used to reduce the amount of repetition in the code. 
        // For previous implementation see git log.
        var st = [d.source, d.target];
        for (var i = 0; i < 2; i++){
            if (direction == "root") {
                if (st[i].id === val.id) {
                    switch_state(d, stat);
                    if (st[(i+1)%2].lvl < val.lvl)
                        mouse_action(st[(i+1)%2], stat, "left");
                    else if (st[(i+1)%2].lvl > val.lvl)
                        mouse_action(st[(i+1)%2], stat, "right");
                }
            }else if (direction == "left") {
                if (st[i].id === val.id && st[(i+1)%2].lvl < val.lvl) {
                    switch_state(d, stat);
                    mouse_action(st[(i+1)%2], stat, direction);
                }
            }else if (direction == "right") {
                if (st[i].id === val.id && st[(i+1)%2].lvl > val.lvl) {
                    switch_state(d, stat);
                    mouse_action(st[(i+1)%2], stat, direction);
                }
            }
        }
    });
}

var tip = d3.tip()
    .attr('class', 'd3-tip')
//    .direction('e')
    .offset([-10, 0])
    .html(function(d) {
        var str = "";
        if (d.url && d.dsc){
            str = "<font color=\"red\">Click to open website</font><br/><br/>";
            str += d.dsc;
        }else if(d.url)
            str = "<font color=\"red\">Click to open website</font>";
        else
            str = d.dsc;
            
        return str;
    })

function renderRelationshipGraph(data) {
    "use strict";

    data.Nodes.forEach(function (d, i) {
        d.x = margin.left + d.lvl * (boxWidth + gap.width);
        d.y = topMarginLvl[d.lvl] + (boxHeight + gap.height) * count[d.lvl];
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
        .attr("class", function (d) { return d.url? "node witurl":"node";})
        .attr("rx", 6)
        .attr("ry", 6)
        .on("mouseover", function () {
            var d = d3.select(this).datum();
            mouse_action(d, true, "root");
            if(d.url || d.dsc) tip.show(d)
        })
        .on("mouseout", function () {
            var d = d3.select(this).datum();
            mouse_action(d, false, "root");
            if(d.url || d.dsc) tip.hide(d)
        })
        .on("click", function(d) { if(d.url) window.open(d.url); }); // If a url is available, put a click event

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
    
    data.Nodes.forEach(function (d) {
        count[d.lvl] = 0;
        topMarginLvl[d.lvl] = 0;
    });
    numLvls = count.length;
    
    data.Nodes.forEach(function (d) {
        topMarginLvl[d.lvl] += 1;
    });
    
    var largest = Math.max.apply(Math, topMarginLvl);
    
    // Update height and width to have all the nodes in the image and also have 
    // the smallest image possible.
    height = margin.top + margin.bottom + largest*boxHeight + (largest - 1) * gap.height;
    width  = margin.left + margin.right + topMarginLvl.length*boxWidth + (topMarginLvl.length - 1)*gap.width;
    
    for (var i = 0; i < topMarginLvl.length; i++){
        topMarginLvl[i] = (height - topMarginLvl[i]*boxHeight - (topMarginLvl[i]-1)*gap.height)/2;
    }
    
    svg = d3.select("#tree").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g");
    
    svg.call(tip);
    
    renderRelationshipGraph(data);
});