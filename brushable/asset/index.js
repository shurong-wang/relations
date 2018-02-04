var width = 960,
    height = 500,
    shiftKey;

var svg = d3.select("body")
    .attr("tabindex", 1)
    // .on("keydown.brush", keydowned)
    // .on("keyup.brush", keyupped)
    // .each(function () {
    //     this.focus();
    // })
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.append("g").attr("class", "link").selectAll("line");

var brush = svg.append("g").attr("class", "brush");

var node = svg.append("g").attr("class", "node").selectAll("circle");

d3.json("asset/graph.json", function (error, graph) {
    if (error) throw error;

    graph.links.forEach(function (d) {
        d.source = graph.nodes[d.source];
        d.target = graph.nodes[d.target];
    });

    graph.nodes.forEach(function (d) {
        d.selected = false;
        d.previouslySelected = false;
    });

    link = link.data(graph.links).enter().append("line")
        .attr("x1", function (d) {
            return d.source.x;
        }).attr("y1", function (d) {
            return d.source.y;
        }).attr("x2", function (d) {
            return d.target.x;
        }).attr("y2", function (d) {
            return d.target.y;
        });

    brush.call(d3.brush().extent([
            [0, 0],
            [width, height]
        ])
        .on("start", brushstarted)
        .on("brush", brushed)
        .on("end", brushended));

    node = node.data(graph.nodes).enter()
        .append("circle").attr("r", 4)
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        })
        // .on("mousedown", mousedowned)
        // .call(d3.drag().on("drag", dragged));

    function brushstarted() {
        if (d3.event.sourceEvent.type !== "end") {
            node.classed("selected", function (d) {
                return d.selected = d.previouslySelected = shiftKey && d.selected;
            });
        }
    }

    function brushed() {
        if (d3.event.sourceEvent.type !== "end") {
            var selection = d3.event.selection;
            node.classed("selected", function (d) {
                return d.selected = d.previouslySelected ^ (
                    selection != null &&
                    selection[0][0] <= d.x &&
                    d.x < selection[1][0] &&
                    selection[0][1] <= d.y &&
                    d.y < selection[1][1]
                );
            });
        }
    }

    function brushended() {
        if (d3.event.selection != null) {
            d3.select(this).call(d3.event.target.move, null);
        }
    }

    // function mousedowned(d) {
    //     if (shiftKey) {
    //         d3.select(this).classed("selected", d.selected = !d.selected);
    //         d3.event.stopImmediatePropagation();
    //     } else if (!d.selected) {
    //         node.classed("selected", function (p) {
    //             return p.selected = d === p;
    //         });
    //     }
    // }

    // function dragged(d) {
    //     nudge(d3.event.dx, d3.event.dy);
    // }
});

// function nudge(dx, dy) {
//     node.filter(function (d) {
//         return d.selected;
//     }).attr("cx", function (d) {
//         return d.x += dx;
//     }).attr("cy", function (d) {
//         return d.y += dy;
//     });
//     link.filter(function (d) {
//         return d.source.selected;
//     }).attr("x1", function (d) {
//         return d.source.x;
//     }).attr("y1", function (d) {
//         return d.source.y;
//     });

//     link.filter(function (d) {
//         return d.target.selected;
//     }).attr("x2", function (d) {
//         return d.target.x;
//     }).attr("y2", function (d) {
//         return d.target.y;
//     });
// }

// function keydowned() {
//     if (!d3.event.metaKey) {
//         switch (d3.event.keyCode) {
//             case 38:
//                 nudge(0, -1);
//                 break; // UP
//             case 40:
//                 nudge(0, +1);
//                 break; // DOWN
//             case 37:
//                 nudge(-1, 0);
//                 break; // LEFT
//             case 39:
//                 nudge(+1, 0);
//                 break; // RIGHT
//         }
//     }
//     shiftKey = d3.event.shiftKey || d3.event.metaKey;
// }

// function keyupped() {
//     shiftKey = d3.event.shiftKey || d3.event.metaKey;
// }