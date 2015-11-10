var jsonCause = {
  "name": "",
  "children": [
      {
          "name": "Cause 1",
          "proba": 0.2,
          "children": [
              {
                  "name": "Sur-cause 1",
                  "proba": 0.5
              },
              {
                  "name": "Sur-cause 2",
                  "proba": 0.5
              }
          ]
      },
      {
          "name": "Cause 2",
          "proba": 0.8
      }
  ]
}

var jsonConseqence = {
  "name": "Contamination Produit",
  "children": [
      {
          "name": "Produit Contaminé",
          "description": "Proba : 0.6",
          "proba": 0.6,
          "children": [
              {
                  "name": "Matières première",
                  "description": "Proba : 0.8",
                  "proba": 0.18,
                  "children": [
                      {
                          "name": "Manipulation personnel/ Sous-traitant",
                          "description": "Proba : 0.5 ",
                          "proba": 0.18
                      }
                  ]
              },
              {
                  "name": "Stockage/transport",
                  "description": "Proba : 0.8",
                  "proba": 0.18,
                  "children": [
                      {
                          "name": "Non respect de la procédure de la production",
                          "description": "Proba : 0.8",
                          "proba": 0.1
                      },
                      {
                          "name": "Contamination sur le site/stockage",
                          "description": "Proba : 0.8",
                          "proba": 0.072
                      }
                  ]
              },
              {
                  "name": "Production",
                  "description": "Proba : 0.8",
                  "proba": 0.24,
                  "children": [
                      {
                          "name": "Défaillance système de production",
                          "description": "Proba : 0.8",
                          "proba": 0.168
                      },
                      {
                          "name": "Contamination emballages",
                          "description": "Proba : 0.8",
                          "proba": 0.072
                      }
                  ]
              }
          ]
      },
      {
          "name": "Défaillance du Contrôle",
          "description": "proba : 0.7",
          "proba": 0.4,
          "children": [
              {
                  "name": "Non respectde la procédure de production",
                  "description": "proba : 0.7",
                  "proba": 0.24
              },
              {
                  "name": "Défaillance contrôle réception client",
                  "description": "proba : 0.7",
                  "proba": 0.16
              }
          ]
      }
  ]
};

var m = [20, 120, 20, 20],
w = window.screen.availWidth - m[1] - m[3],
h = window.screen.availHeight - m[0] - m[2],
i = 0,
root;

var tree = d3.layout.tree()
  .size([h, w]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

var svg = d3.select("#graph").append("svg:svg")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .call(zoomListener);
  
var vis = svg.append("svg:g")
  // .attr("transform", "translate("+ parseInt(m[3] - 640) + "," + m[0] + ")");
  

// d3.json(json, function(json) {
root = jsonCause;
root.x0 = h / 2;
root.y0 = w / 2;
update(root, type = "cause", root);


root2 = jsonConseqence;
root2.x0 = h / 2;
root2.y0 = w / 2;
update(root2, type = "consequence", root2);

// });

var tooltip = d3.select("body").append("div") 
  .attr("class", "tooltip")      
  .style("opacity", 0);

function update(source, type, root) {
  
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root);
  
  // Normalize for fixed-depth of path.
  nodes.forEach(function(d) {
    d.x = d.x - nodes[0].x + root.x0;
    d.y = w / 2 + 200 * d.depth * (type == "cause" ? -1 : 1);
  });

  // Update the nodes
  var node = vis.selectAll("g.node." + type)
    .data(nodes, function(d) { return d.id || (d.id = ++i); });
  
  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node " + type)
    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
    .on("click", function(d) { toggle(d); update(d, type, root); });
  
  nodeEnter.append("svg:circle")
    .attr("r", 50)
    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("svg:text")
    // Question : est ce que tu as un enfant pour le placement de ton texte
    .attr("x", function(d) { return (d.children || d._children) ? 0 : 12 * (type == "cause" ? -1 : 1); })
    .attr("y", function(d) { return 16 * (d.children || d._children ? 1 : 0); })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { return (d.children || d._children) ? "middle" : (type == "cause" ? "end" : "start"); })
    .text(function(d) { return d.name; })
    .style('fill',  'black' )
    .style("fill-opacity", 1e-6)  
    .call(make_editable, "nodeEnter");


  nodeEnter.select("circle")
    .attr("r", 9)
    .style("fill","lightsteelblue")
    .style("fill-opacity",0.8 );

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
    .attr("r", 9)
    .style("fill", function(d) { return d._children ? "green" : "white"; })
    .style("fill-opacity",1 );

  nodeUpdate.select("text")
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  /*******************************
  Links
  ********************************/
  var link = vis.selectAll("path.link." + type)
    .data(tree.links(nodes), function(d) { return d.target.id; });

  //  Enter any new links at the parent's previous position.
  var linkPath = link.enter().insert("svg:path", "g")
    .attr("class", "link " + type)
    .attr("id", function(d){
                     return "path_" + ++i  ;
                   })
    .attr("d", function(d) {
      var o = {x: source.x0, y: source.y0};
      return diagonal({source: o, target: o});
    })
    .style("stroke-width",function(d) {
            return d.target.proba*20 ;
          })
    .call(make_editable_path, "link")
    .transition()
    .duration(duration)
    .attr("d", diagonal);

  link.on("mouseover", function(d) {
    tooltip.transition()
      .duration(100)
      .style("opacity", .9);
    tooltip.html("<center> Probabilité " +d.target.proba + "</center>")
      .style("left", (d3.event.pageX ) + "px")
      .style("top", (d3.event.pageY + 10) + "px");
  })
  .on("mouseout", function(d) {
    tooltip.transition()
      .duration(500)
      .style("opacity", 0);
  });

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

  console.log("x0: " + nodes[0].x0, "y0: " + nodes[0].y0)
  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
  
  console.log("x0: " + nodes[0].x0, "y0: " + nodes[0].y0)
}

/*
function toggleAll(d) {
if (d.children) {
  d.children.forEach(toggleAll);
  toggle(d);
}
}
*/

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}

function zoom() {
  vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}