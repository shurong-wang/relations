const API1 = "./data/tree_toggle_r.json";
const API2 = "./data/tree_toggle_l.json";

var m = [20, 120, 20, 20],
    w = 1280 - m[1] - m[3],
    h = 600 - m[0] - m[2],
    i = 0,
    root,
    rootLeft;
const gap = 0.2; // 树枝间隙缩密度
const aim = '#main';

var tree = d3.layout.tree()
    .size([h, w])
    .separation(function(a, b) {
        return a.parent == b.parent ? 1 : 2;
    });

var diagonal = d3.svg.diagonal()
    .projection(function (d) { 
        // x, y 坐标对调，形成横向的树图
        return [d.y, d.x * gap];
    });

var vis = d3.select(aim).append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    // .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    .attr("transform", "translate(" + h + "," + m[0] + ")");

// 树右侧
d3.json(API1, function (json) {
    root = json;
    root.x0 = h / 2;
    root.y0 = 0;

    // Initialize the display to show a few nodes.
    // root.children.forEach(toggleAll);
    // toggle(root.children[1]);
    // toggle(root.children[1].children[2]);

    update(root, 1);
});

// // 树左侧
// d3.json(API2, function (json) {
//     rootLeft = json;
//     rootLeft.x0 = h / 2;
//     rootLeft.y0 = 0;

//     // Initialize the display to show a few nodes.
//     // toggle(root.children[9]);
//     // toggle(root.children[9].children[0]);

//     update(rootLeft, -1);
// });

function update(source, direction = 1) {
    var _root = direction === -1 ? rootLeft : root;

    // Compute the new tree layout.
    var nodes = tree.nodes(_root).reverse();

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 180 * direction;
    });

    // Update the nodes…
    var node = vis.selectAll("g.node")
        .data(nodes, function (d) { 
            return d.id || (d.id = ++i); 
        });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function (d) { 
            return "translate(" + source.y0 + "," + source.x0 * gap + ")"; 
        })
        .on("click", function (d) {
            toggle(d);
            update(d, direction);
        });

    nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .style("fill", function (d) { 
            return d._children ? "lightsteelblue" : "#fff"; 
        });

    nodeEnter.append('a')
        .attr('xlink:href', function (d) {
            return d.url;
        })
        .append("svg:text")
        .attr("x", function (d) { 
            return d.children || d._children ? -10 : 10; 
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) { 
            return d.children || d._children ? "end" : "start"; 
        })
        .text(function (d) { return d.name; })
        .style('fill', function (d) {
            return d.free ? 'black' : '#999';
        })
        .style("fill-opacity", 1e-6);

    nodeEnter.append("svg:title")
        .text(function (d) {
            return d.description;
        });

    // Transition nodes to their new position.
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x * gap + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x * gap + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = vis.selectAll("path.link")
        .data(tree.links(nodes), function (d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
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
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle all children.
function toggleAll(d) {
    if (d.children) {
        d.children.forEach(toggleAll);
        toggle(d);
    }
}

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