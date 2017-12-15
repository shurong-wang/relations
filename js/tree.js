function initialize() {
    // 当前根节点 ID
    const MID_NODE_NAME = '上海携程商务有限公司';
    const API = '../data/tree/tree2.json';
    const aim = '#main';

    // 请求数据，绘制图表 模拟分别请求左右分支的情况
    d3.json(API, (error, lResp) => {
        if (error) {
            return console.error(error);
        }

        // 此处应该使用 async/await + Promise 但当前项目不允许
        d3.json(API, (error, rResp) => {
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
            render(treeRight, treeLeft, aim, MID_NODE_NAME);
        });
    });
}

// 渲染簇图
function render(treeRight = {}, treeLeft = {}, aim, MID_NODE_NAME) {
    var m = [20, 120, 20, 120];
    var w = 1280 - m[1] - m[3];
    var h = 600 - m[0] - m[2];
    var i = 0;
    const gap = 0.1; // 树枝间隙缩密度

    var tree = d3.layout.cluster()
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
        .attr("width", 1200)
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + h + "," + m[0] + ")");

    update(treeRight, treeLeft);

    function update(source, lSource) {

        // 布局节点
        var nodes = layoutNodes(source);
        var leftNodes = layoutNodes(lSource);
        var lastIndex = nodes.length;
        for (var i in leftNodes) {
            nodes[lastIndex++] = leftNodes[i];
        }

        // 设置树枝深度和方向
        nodes.forEach(function (d) {
            var direction = d.pos == 'l' ? -1 : 1;  // 树枝方向 负值向左/负值向右
            d.y = d.depth * 200 * direction;
        });

        // 更新节点
        var node = vis.selectAll("g.node")
            .data(nodes, function (d) { 
                return d.id || (d.id = ++i); 
            });

        // 在容器插入节点分组
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function (d) { 
                return "translate(" + source.y0 + "," + source.x0 * gap + ")"; 
            })
            .on("click", function(d) { 
                // ajax_get_server(d.name);
                console.log(d.name);
            });

        // 插入节点圆
        nodeEnter.append("svg:circle")
            .attr("r", 1e-6)
            .style("fill", function (d) { 
                return d._children ? "lightsteelblue" : "#fff"; 
            });

        // 插入节点文字
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

        // 展开树枝节点
        var duration = d3.event && d3.event.altKey ? 5000 : 500;
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) { 
                return "translate(" + d.y + "," + d.x * gap + ")"; 
            });

        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function (d) { 
                return d._children ? "lightsteelblue" : "#fff"; 
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // 关闭树枝节点
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) { 
                return "translate(" + source.y + "," + source.x * gap + ")"; 
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // 更新树枝
        var link = vis.selectAll("path.link")
            .data(tree.links(nodes), function (d) { 
                return d.target.id; 
            });

        // 插入新树枝
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

        // 展开树枝
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // 关闭树枝
        link.exit()
            .transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            })
            .remove();

        // 备份旧节点
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // 布局节点
    function layoutNodes(node) {
        node.x0 = h / 2;
        node.y0 = 0;
        return tree.nodes(node);
    }
}