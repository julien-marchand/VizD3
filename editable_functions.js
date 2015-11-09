function make_editable(d, field)
{
    this.on("mouseover", function() {
        d3.select(this).style("fill", "red");
      })
      .on("mouseout", function() {
        d3.select(this).style("fill", null);
      })
      .on("click", function(d) {
        var p = this.parentNode;
        
        // inject a HTML form to edit the content here...
        
        // bug in the getBBox logic here, but don't know what I've done wrong here;
        // anyhow, the coordinates are completely off & wrong. :-((
        var xy = this.getBBox();
        var p_xy = p.getBBox();
        
        xy.x -= p_xy.x;
        xy.y -= p_xy.y;

        var el = d3.select(this);

        var p_el = d3.select(p);
        var frm = p_el.append("foreignObject");
        
        var inp = frm
            .attr("x", function(d) { return d.children || d._children ? xy.y + 10 : xy.y - 10; })
            .attr("y", xy.y - 12)
            .attr("width", 300)
            .attr("height", 25)
            .append("xhtml:form")
                    .append("input")
                        .attr("value", function() {
                            // nasty spot to place this call, but here we are sure that the <input> tag is available
                            // and is handily pointed at by 'this':
                            this.focus();
                            return d.name;
                        })
                        .attr("style", "width: 294px;")
                        // make the form go away when you jump out (form looses focus) or hit ENTER:
                        .on("blur", function() {
                           // console.log("blur", this, arguments);
    
                            var txt = inp.node().value;
                            
                            d.name = txt;
                            el.text(function(d) { return d.name; });
                            
                            // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                            p_el.select("foreignObject").remove();
                        })
                        .on("keypress", function() {
                            console.log("keypress", this, arguments);
                            
                            // IE fix
                            if (!d3.event)
                                d3.event = window.event;

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
                                p_el.select("foreignObject").remove();
                            }
                        });
      });
}

function make_editable_path(d, field)
{
    // this.on("mouseover", function() {
    //     console.log(this);
    //     d3.select(this).style("fill", "red");
    // })
        this.on("click", function(d) {
        var p = this.parentNode;
		
        // d3.select("path.link").style("stroke", function(d) {
        //     console.log("c'est d",d);
        //     return d._children ? "green" : "white"; 
        // });

 
        // inject a HTML form to edit the content here...
        
        // bug in the getBBox logic here, but don't know what I've done wrong here;
        // anyhow, the coordinates are completely off & wrong. :-((
        var xy = this.getBBox();
        var p_xy = p.getBBox();
        
        xy.x -= p_xy.x;
        xy.y -= p_xy.y;

        var el = d3.select(this);
        var p_el = d3.select(p);
        var frm = p_el.append("foreignObject");

        souris_x=d3.mouse(this)[0];
        souris_y=d3.mouse(this)[1];
        console.log("Pointeur souris",souris_y);

        var inp = frm
            .attr("x", souris_x -35)
            .attr("y", souris_y -38)
            .attr("width", 10)
            .attr("height", 25)
            .append("xhtml:form")
                    .append("input")
                        .attr("value", function() {
                            // nasty spot to place this call, but here we are sure that the <input> tag is available
                            // and is handily pointed at by 'this':
                            this.focus();
                            console.log(d);
                            return  parseFloat(d.target.proba);
                        })
                        .attr("style", "width:  94px;")
                        // make the form go away when you jump out (form looses focus) or hit ENTER:
                        .on("blur", function() {
                           // console.log("blur", this, arguments);
    
                            var txt = inp.node().value;
                            
                            d.target.proba = parseFloat(txt);
                            console.log(d.target.proba )
                            el.text(function(d) { return d.target.proba; });
                            
                            // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                            p_el.select("foreignObject").remove();
                        })
                        .on("keypress", function() {
                            //console.log("keypress", this, arguments);
                            
                            // IE fix
                            if (!d3.event)
                                d3.event = window.event;

                            var e = d3.event;
                            console.log(e);
                            // A chaque event keypress (d3.event on recup le dernier élément réalisé)
                            // il y a un keycode associé et le 13 c'est Entrer
                            if (e.keyCode == 13)
                            {
                                if (typeof(e.cancelBubble) !== 'undefined') // IE
                                  e.cancelBubble = true;
                                if (e.stopPropagation)
                                  e.stopPropagation();
                                e.preventDefault();
        
                                var txt = inp.node().value;
                                d.target.proba = parseFloat(txt);
                          
                                d3.selectAll("path.link")
                                   .style("stroke-width",function(d) {
                                    return d.target.proba*20 ;
                                         });
                                // odd. Should work in Safari, but the debugger crashes on this instead.
                                // Anyway, it SHOULD be here and it doesn't hurt otherwise.
                                p_el.select("foreignObject").remove();
                            }
                        });
      });
}