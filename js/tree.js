function initialize() {
    // 当前企业 ID
    const MID_NODE_NAME = '上海携程商务有限公司';
    const TREE_MAP = '../data/tree/tree2.json';
    const aim = '#main';

    // 请求数据，绘制图表 模拟分别请求左右分支的情况
    d3.json(TREE_MAP, (error, lResp) => {
        if (error) {
            return console.error(error);
        }

        // 此处应该使用 async/await + Promise 但当前项目不允许
        d3.json(TREE_MAP, (error, rResp) => {
            if (error) {
                return console.error(error);
            }
    
            if (typeof lResp === 'string') {
                lResp = JSON.parse(lResp);
            }
            if (typeof rResp === 'string') {
                rResp = JSON.parse(rResp);
            }
    
            var treeRight = rResp.r;
            var treeLeft = rResp.l;

            // 初始化
            renderTree(treeRight, treeLeft, aim, MID_NODE_NAME);
        });
    });
}

// 渲染簇图
function renderTree(treeRight = {}, treeLeft = {}, aim, MID_NODE_NAME) {
    var m = [20, 120, 20, 120];
    var w = 1280 - m[1] - m[3];
    var h = 600 - m[0] - m[2];  //靠左
    var i = 0;

    var tree = d3.layout.cluster().size([h, w]);

    var diagonal = d3.svg.diagonal().projection(function (d) { return [d.y, d.x]; });

    var vis = d3.select(aim).append("svg:svg")
        .attr("width", 1200)
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + h + "," + m[0] + ")"); // translate(靠左，靠上)

    update(treeRight, treeLeft);

    function layout(node) {
        node.x0 = h / 2;
        node.y0 = 0;
        return tree.nodes(node);
    }

    function update(source, lsource) {
        var duration = d3.event && d3.event.altKey ? 5000 : 500;

        // Compute the new tree layout.
        var nodes = layout(source);
        var leftNodes = layout(lsource);
        var lastIndex = nodes.length;
        for (var i in leftNodes) {
            nodes[lastIndex++] = leftNodes[i];
        }

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            // 方向控制
            var direction = d.pos == 'l' ? -1 : 1;
            d.y = d.depth * 200 * direction;
        });

        // Update the nodes…
        var node = vis.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("click", function(d) { 
                // ajax_get_server(d.name);
                console.log(d.name);
            });

        nodeEnter.append("svg:circle")
            .attr("r", 1e-6)
            .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("svg:text")
            .attr("x", function (d) {
                if (d.name === MID_NODE_NAME) {
                    return 10;
                }
                return d.children || d._children ? -10 : 10; }
            )
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                if (d.name === MID_NODE_NAME) {
                    return "start";
                }
                return d.children || d._children ? "end" : "start"; 
            })
            .text(function (d) { return d.name; })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text").style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = vis.selectAll("path.link")
            .data(tree.links(nodes), function (d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter()
            .insert("svg:path", "g")
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
        link.exit()
            .transition()
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
}