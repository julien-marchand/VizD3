function make_editable(d) {
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
    var p = this.parentNode;
    var xy = this.getBBox();
    var p_xy = p.getBBox();
    
    xy.x -= p_xy.x;
    xy.y -= p_xy.y;

    var el = d3.select(this);
    var p_el = d3.select(p);
    
    d3.selectAll("foreignObject").remove();
    var frm = p_el.append("foreignObject");

    souris_x=d3.mouse(this)[0];
    souris_y=d3.mouse(this)[1];
    console.log("Pointeur souris",souris_y);

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
                    
                    //console.log("blur")
                    // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                    d3.selectAll("foreignObject").remove();
                })
                .on("keypress", function() {
                    if (!d3.event) d3.event = window.event; // IE fix

                    var e = d3.event;

                    // A chaque event keypress (d3.event on recup le dernier élément réalisé)
                    // il y a un keycode associé et le 13 c'est Entrer
                    if (e.keyCode == 13)
                    {
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
                           .style("stroke-width",function(d) {console.log(d.target.computed_proba);
                            return d.target.computed_proba*20 ;
                        });
                    }
                });
  });
}