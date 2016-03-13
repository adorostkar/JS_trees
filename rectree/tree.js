var margin = {top: 30, right: 20, bottom: 30, left: 20},
    width = 960 - margin.left - margin.right,
    barHeight = 20,
    barWidth = width * .6;

var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 20]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("#tree").append("svg")
    .attr("width", width + margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//d3.json("flare.json", function(error, flare) {
//  if (error) throw error;
  var flare = {
   "name":"Roadmap",
      "url":"www.google.com",
   "children":[
      {
         "name":"Numerical Simulation",
          "url":"www.google.com",
         "children":[
            {
               "name":"Physical Phenomenon",
                "url":"www.google.com",
               "children":[
                  {
                     "name":"Fluid Dynamics",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Mechanics",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Acustics",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Finance",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Geoscience",
                     "url":"www.google.com"
                  }
               ]
            },
            {
               "name":"Continuous Model",
                "url":"www.google.com",
               "children":[
                  {
                     "name":"PDE",
                     "url":"www.google.com"
                  },
                  {
                     "name":"ODE",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Inetgral Equations",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Stochastic",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Optimization",
                     "url":"www.google.com"
                  }
               ]
            },
            {
               "name":"Disrete Model",
                "url":"www.google.com",
               "children":[
                  {
                     "name":"Mesh-Based",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Meshless",
                     "url":"www.google.com"
                  }
               ]
            },
            {
               "name":"Numerical Solution Method",
                "url":"www.google.com",
               "children":[
                  {
                     "name":"Nonlinear Problems",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Linear Problems",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Tensor-Based",
                     "url":"www.google.com"
                  }
               ]
            },
            {
               "name":"Computer Impelementation",
                "url":"www.google.com",
               "children":[
                  {
                     "name":"Serial",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Parallel",
                     "url":"www.google.com"
                  },
                  {
                     "name":"Cloud",
                     "url":"http://www.google.com"
                  }
               ]
            },
            {
               "name":"Verification"
            }
         ]
      },
      {
         "name":"Big Data Analytics",
         "children":[
            {
               "name":"Prepare",
               "size":17010
            },
            {
               "name":"Analyse",
               "size":9201
            },
            {
               "name":"Visualise",
               "size":1116
            }
         ]
      }
   ]
};

  root = flare;
  root.x0 = 0;
  root.y0 = 0;
  update(root);
//});

function update(source) {

  // Compute the flattened node list. TODO use d3.layout.hierarchy.
  var nodes = tree.nodes(root);

  var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

  d3.select("svg").transition()
      .duration(duration)
      .attr("height", height);

  d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
    nodeEnter.append("a")
        .attr("xlink:href", function(d){
            if(!d.children && !d._children)
                return d.url;})  // <-- reading the new "url" property
        .append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .style("fill", color)
        .on("click", click);

  nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) { return d.name; });

  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", color);

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
    if(!d.children && !d._children)
        return;
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}