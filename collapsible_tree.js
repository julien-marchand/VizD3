var jsonConsequence = {
  "name": "",
  "children": [
      {
          "name": "Consequence 1",
          "proba": 0.2,
          "children": [
              {
                  "name": "Sur-consequence 1",
                  "proba": 0.5
              },
              {
                  "name": "Sur-consequence 2",
                  "proba": 0.5
              }
          ]
      },
      {
          "name": "Consequence 2",
          "proba": 0.8
      }
  ]
}

var jsonCause = {
  "name": "Contamination Produit",
  "children": [
      {
          "name": "Produit Contaminé",
          "description": "Proba : 0.6",
          "op": "OR",
          "children": [
              {
                  "name": "Matières première",
                  "description": "Proba : 0.8",
                  "op": "AND",
                  "children": [
                      {
                          "name": "Manipulation personnel/ Sous-traitant",
                          "description": "Proba : 0.5 ",
                          "proba": 1
                      }
                  ]
              },
              {
                  "name": "Stockage/transport",
                  "description": "Proba : 0.8",
                  "op": "OR",
                  "children": [
                      {
                          "name": "Non respect de la procédure de la production",
                          "description": "Proba : 0.8",
                          "proba": 0.6
                      },
                      {
                          "name": "Contamination sur le site/stockage",
                          "description": "Proba : 0.8",
                          "proba": 0.4
                      }
                  ]
              },
              {
                  "name": "Production",
                  "description": "Proba : 0.8",
                  "op": "AND",
                  "children": [
                      {
                          "name": "Défaillance système de production",
                          "description": "Proba : 0.8",
                          "proba": 0.9
                      },
                      {
                          "name": "Contamination emballages",
                          "description": "Proba : 0.8",
                          "proba": 0.5
                      }
                  ]
              }
          ]
      },
      {
          "name": "Défaillance du Contrôle",
          "description": "proba : 0.7",
          "op": "OR",
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
i = 0;

var tree = d3.layout.tree()
  .size([h, w]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 10]).on("zoom", zoom);

var svg = d3.select("#graph").append("svg:svg")
  .attr("width", w + m[1] + m[3])
  .attr("height", h + m[0] + m[2])
  .call(zoomListener);
  
var vis = svg.append("svg:g")

// d3.json(json, function(json) {
root = jsonCause;
root.x0 = h / 2;
root.y0 = w / 2;
update(root, type = "cause", root);


root2 = jsonConsequence;
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
    d.computed_proba = computeProbability(d);
  });
  

  // Update the nodes
  var node = vis.selectAll("g.node." + type)
    .data(nodes, function(d) { return d.id || (d.id = ++i); });
  
  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node " + type)
    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
  
  nodeEnter.append("svg:polygon")
    .attr("points", function(d) { return d != root ? drawShapePoints("circle") : (type == "cause" ? drawShapePoints("semi-circle left") : drawShapePoints("semi-circle right"))})
    .attr("stroke", "lightsteelblue")
    .attr("stroke-width", 2)
    .attr("fill", "white")
    .on("click", function(d) { if(d == root) expandAll(d); else toggle(d); update(d, type, root); })
    .on("mouseover", function(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html("<table> \
        <tr><td>Name</td><td>" + d.name + "</td></tr> \
        <tr><td>Description</td><td>" + nvl(d.description, "") + "</td></tr>"
        + ((type == "cause" && (d.children || d._children)) ? ("<tr><td>Risk interaction</td><td>" + nvl(d.op, "") + "</td></tr>") : "")
        + "</table>")
        .style("left", (d3.event.pageX ) + "px")
        .style("top", (d3.event.pageY + 10) + "px");})
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  nodeEnter.append("svg:text")
    .attr("x", function(d) { return (d.children || d._children) ? 0 : 12 * (type == "cause" ? -1 : 1); })
    .attr("y", function(d) { return 16 * (d.children || d._children ? 1 : 0); })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { return (d.children || d._children) ? "middle" : (type == "cause" ? "end" : "start"); })
    .text(function(d) { return d.name; })
    .style('fill',  'black' )
    .style("fill-opacity", 1e-6)
    .call(make_editable, nodes, type);

  nodeEnter.select("polygon")
    .attr("points", function(d) { return d != root ? drawShapePoints("circle") : (type == "cause" ? drawShapePoints("semi-circle left") : drawShapePoints("semi-circle right"))})
    .attr("stroke", "lightsteelblue")
    .attr("fill", "white")
    .style("fill-opacity",0.8 );

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("polygon")
    .attr("points", function(d) { return d != root ? drawShapePoints("circle") : (type == "cause" ? drawShapePoints("semi-circle left") : drawShapePoints("semi-circle right"))})
    .attr("stroke", "rgb(255, 230, 0)")
    .attr("stroke-width", 2 )
    .style("fill", function(d) { return d._children ? "rgb(255, 230, 0)" : "white"; })
    .style("fill-opacity",1 );

  nodeUpdate.select("text")
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
    .remove();

  nodeExit.select("polygon")
    .attr("points", "0,0");

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
    .attr("id", function(d){return "path_" + ++i;})
    .attr("d", function(d) {
      var o = {x: source.x0, y: source.y0};
      return diagonal({source: o, target: o});
    })
    .style("stroke-width",function(d) {return d.target.computed_proba*20;})
    .call(make_editable_path, nodes, type)
    .transition()
    .duration(duration)
    .attr("d", diagonal);
    
  link.on("mouseover", function(d) {
    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
    tooltip.html("Risk: " + Math.round(d.target.computed_proba*10000)/100 + " %")
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

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function computeProbability(d) {
  if(d.proba)
    d.computed_proba = d.proba;
  else if(d.children || d._children) {
    var allChildren = d.children ? d.children : d._children
    var probab = 1;
    if(d.op == "AND") {
      for(var i = 0; i < allChildren.length; i++) {
        probab *= computeProbability(allChildren[i])
      }
    } else if (d.op == "OR") {
      for(var i = 0; i < allChildren.length; i++) {
        probab *= 1 - computeProbability(allChildren[i])
      }
      probab = 1 - probab;
    }
    d.computed_proba = probab;
  } else
    d.computed_proba = 1;
  
  if(d.riskReduction1) d.computed_proba = d.computed_proba * (1 - d.riskReduction1)
  if(d.riskReduction2) d.computed_proba = d.computed_proba * (1 - d.riskReduction2)
  if(d.riskReduction3) d.computed_proba = d.computed_proba * (1 - d.riskReduction3)
  if(d.riskReduction4) d.computed_proba = d.computed_proba * (1 - d.riskReduction4)
  console.log(d);
  return d.computed_proba
}

/*
function toggleAll(d) {
  if (d.children) {
    d.children.forEach(toggleAll);
    toggle(d);
  }
}
*/

function expandAll(d) {
  if(d._children) {
    console.log("Expand");
    expand(d);
  } else {
    console.log("Group all");
    groupAll(d);
  }
}

function groupAll(d) {
  if(d.children) d.children.forEach(groupAll);
  if(d._children) d._children.forEach(groupAll);
  group(d);
}

function expand(d) {
  if(d._children) {
    d.children = d._children;
    d._children = null;
  }
}

function group(d) {
  if(d.children) {
    d._children = d.children;
    d.children = null;
  }
}

function toggle(d) {
  if (d.children) group(d);
  else expand(d);
}

function zoom() {
  if(!d3.select("foreignObject").node())
    vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function drawShapePoints(type) {
  var left = "-5,8.7 -7.1,7.1 -8.7,5 -10,0 -8.7,-5 -7.1,-7.1 -5,-8.7",
      right = "5,-8.7 7.1,-7.1 8.7,-5 10,0 8.7,5 7.1,7.1 5,8.7"
  switch(type) {
    case "semi-circle left":
        return "0,10 " + left + " 0,-10";
        break;
    case "semi-circle right":
        return "0,10 0,-10 " + right;
        break;
    default:
        return "0,10 " + left + " 0,-10 " + right;
  }
}

function nvl(value1, value2) {
  if (value1 == null)
    return value2;
  return value1;
}

function trtd(a, b) {
  return "<tr><td>" + a + "</td><td>" + b + "</td></tr>";
}