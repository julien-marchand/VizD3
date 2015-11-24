function make_editable(d, nodes, type) {
  this.on("click", function(d) {
      svg.on(".zoom", null);
    
      d3.selectAll("foreignObject").remove()
      
      var el = d3.select(this),
        p = d3.select(this.parentNode.parentNode);
      var h = 214, w = 358;
      
      var inp = p.append("foreignObject")
          .attr("x", -w/2)
          .attr("y", -h/2)
          .attr("transform", d3.select(this.parentNode).attr("transform"))
          .attr("width", w)
          .attr("height", h)
          .attr("z-index", 9999)
          .append("xhtml:form");
          
      if(type == "cause")
        inp.html('<table style="padding:5px;z-index:2;background:rgb(255, 230, 0);">'
                  + trtd('Name', '<input id="iName" type="text" value="' + d.name + '">')
                  + trtd('Description', '<input id="iDescription" type="text" value="' + nvl(d.description, "")+ '">')
                  + trtd('Proba', '<input id="iProba" placeholder="auto: ' + Math.round(d.computed_proba*10000)/100 + '%" type="number" value="' + nvl(d.proba, "")+ '">')
                  + ((d.children || d._children) ? trtd('Risk interaction', '<input id="opAnd" type="radio" name="op" value="AND" ' + (d.op == "AND" ? "checked" : "") + '><label for="opAnd">AND</label><input id="opOr" type="radio" name="op" value="OR" ' + (d.op == "OR" ? "checked" : "") + '><label for="opOr">OR</label>') : '')
                  + trtd('<input id="riskReductionName1" placeholder="Reduction risk measure" value="' + nvl(d.riskReductionName1, "") + '" type="text">', '<input id="riskReduction1" placeholder="Impact (e.g. 0.2)" value="' + d.riskReduction1 + '" type="number">')
                  + trtd('<input id="riskReductionName2" placeholder="Reduction risk measure" value="' + nvl(d.riskReductionName2, "") + '" type="text">', '<input id="riskReduction2" placeholder="Impact (e.g. 0.2)" value="' + d.riskReduction2 + '" type="number">')
                  + trtd('<input id="riskReductionName3" placeholder="Reduction risk measure" value="' + nvl(d.riskReductionName3, "") + '" type="text">', '<input id="riskReduction3" placeholder="Impact (e.g. 0.2)" value="' + d.riskReduction3 + '" type="number">')
                  + trtd('<input id="riskReductionName4" placeholder="Reduction risk measure" value="' + nvl(d.riskReductionName4, "") + '" type="text">', '<input id="riskReduction4" placeholder="Impact (e.g. 0.2)" value="' + d.riskReduction4 + '" type="number">')
                  + '<tr><td style="text-align: center"><button id="saveButton" class="btn" type="button">Save</button></td><td style="text-align: center"><button id="cancelButton" class="btn" type="button">Cancel</button></td></tr>'
                  + '</table>');
      else {
        inp.html('<table style="z-index:2;background:rgb(255, 230, 0);">'
                  + trtd('Name', '<input id="iName" type="text" value="' + d.name + '">')
                  + trtd('Description', '<input id="iDescription" type="text" value="' + nvl(d.description, "")+ '">')
                  + '<tr><td style="text-align: center"><button id="saveButton" class="btn" type="button">Save</button></td><td style="text-align: center"><button id="cancelButton" class="btn" type="button">Cancel</button></td></tr>'
                  + '</table>');
      }
                  
      d3.select(cancelButton)
        .on("click", function() {
          d3.select("foreignObject").remove();
          svg.call(zoomListener);
        });
        
      d3.select(saveButton)
        .on("click", function() {
          var formObject = d3.select("foreignObject>form");
          if(newName = formObject.select("#iName").node().value) 
            d.name = newName;
          el.text(function(d) { return d.name; });
          d.description = formObject.select("#iDescription").node().value;
          
          proba = formObject.select("#iProba").node().value
          d.proba = (proba && proba != "" ? proba : undefined);
          if (d.children || d._children) d.op = formObject.select("#opAnd").node().checked ? "AND" : "OR";
          d.riskReductionName1 = formObject.select("#riskReductionName1").node().value;
          d.riskReductionName2 = formObject.select("#riskReductionName2").node().value;
          d.riskReductionName3 = formObject.select("#riskReductionName3").node().value;
          d.riskReductionName4 = formObject.select("#riskReductionName4").node().value;
          d.riskReduction1 = formObject.select("#riskReduction1").node().value;
          d.riskReduction2 = formObject.select("#riskReduction2").node().value;
          d.riskReduction3 = formObject.select("#riskReduction3").node().value;
          d.riskReduction4 = formObject.select("#riskReduction4").node().value;

          nodes.forEach(function(d_node) {
            d_node.computed_proba = computeProbability(d_node);
          })
                        
          d3.selectAll("path.link")
             .style("stroke-width",function(d) {return d.target.computed_proba*20;});
          d3.select("foreignObject").remove();
          svg.call(zoomListener);
        });
      
      
      /*inp.append("input")
          .attr("value", function() { this.focus(); return d.name; })
          .attr("style", "width: 294px;")*/
                  
    });
}

function make_editable_old(d) {
  this.on("mouseover", function() {
      d3.select(this).style("fill", "red");
    })
    .on("mouseout", function() {
      d3.select(this).style("fill", null);
    })
    .on("click", function(d) {
      var p = this.parentNode;
      var xy = this.getBBox();
      var p_xy = p.getBBox();
      
      xy.x -= p_xy.x;
      xy.y -= p_xy.y;

      var el = d3.select(this);
      var p_el = d3.select(p);
      
      d3.selectAll("foreignObject").remove();
      var frm = p_el.append("foreignObject");
      
      var inp = frm
          .attr("x", function(d) { return (d.children || d._children) ? 0 : 12 * (type == "cause" ? -1 : 1);})
          .attr("y", function(d) { return 16 * (d.children || d._children ? 1 : 0); })
          .attr("width", 300)
          .attr("text-anchor", function(d) { return "end"; })
          .attr("height", 25)
          .append("xhtml:form")
              .append("input")
                  .attr("value", function() { this.focus(); return d.name; })
                  .attr("style", "width: 294px;")
                  .on("blur", function() {
                      var txt = inp.node().value;
                      
                      d.name = txt;
                      el.text(function(d) { return d.name; });
                      
                      // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                      p_el.select("foreignObject").remove();
                  })
                  .on("keypress", function() {
                      if (!d3.event) d3.event = window.event; // IE fix

                      var e = d3.event;
                      // A chaque event keypress (d3.event on recup le dernier élément réalisé)
                      // il y a un keycode associé et le 13 c'est entré
                      if (e.keyCode == 13)
                      {
                          if (typeof(e.cancelBubble) !== 'undefined') // IE
                            e.cancelBubble = true;
                          if (e.stopPropagation)
                            e.stopPropagation();
                          e.preventDefault();
  
                          var txt = inp.node().value;
                          
                          d.name = txt;
                          el.text(function(d) { return d.name; });
                          
                          // odd. Should work in Safari, but the debugger crashes on this instead.
                          // Anyway, it SHOULD be here and it doesn't hurt otherwise.
                          //p_el.select("foreignObject").remove();
                      }
                  });
    });
}

function make_editable_path(d, nodes) {
  this.on("click", function(d) {
    var p = this.parentNode,
        el = d3.select(this),
        p_el = d3.select(p);
    
    d3.selectAll("foreignObject").remove();
    var frm = p_el.append("foreignObject");

    souris_x=d3.mouse(this)[0];
    souris_y=d3.mouse(this)[1];

    var inp = frm
        .attr("x", souris_x - 35)
        .attr("y", souris_y - 38)
        .attr("width", 10)
        .attr("height", 25)
        .append("xhtml:form")
            .append("input")
                .attr("value", function() {
                    // and is handily pointed at by 'this':
                    this.focus();
                    return  parseFloat(d.target.computed_proba);
                })
                .attr("style", "width:  94px;")
                // make the form go away when you jump out (form looses focus) or hit ENTER:
                .on("blur", function() {
                    d.target.proba = parseFloat(inp.node().value);
                    
                    // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                    d3.selectAll("foreignObject").remove();
                })
                .on("keypress", function() {
                    if (!d3.event) d3.event = window.event; // IE fix

                    var e = d3.event;

                    // A chaque event keypress (d3.event on recup le dernier élément réalisé)
                    // il y a un keycode associé et le 13 c'est Entrer
                    if (e.keyCode == 13) {
                        if (typeof(e.cancelBubble) !== 'undefined') // IE
                          e.cancelBubble = true;
                        if (e.stopPropagation)
                          e.stopPropagation();
                        e.preventDefault();

                        d.target.proba = parseFloat(inp.node().value);
                  
                        // odd. Should work in Safari, but the debugger crashes on this instead.
                        // Anyway, it SHOULD be here and it doesn't hurt otherwise.
                        
                        nodes.forEach(function(d_node) {
                          d_node.computed_proba = computeProbability(d_node);
                        })
                        
                        d3.selectAll("path.link")
                           .style("stroke-width",function(d) {return d.target.computed_proba*20;});
                    }
                });
  });
}