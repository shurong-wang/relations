function renderTree() {
    // 当前根节点 ID
    const MID_NODE_ID = '24416401'; 
    const API_L = './data/huawei_left.json'; 
    const API_L_2 = './data/huawei_left2.json'; 
    const API_R = './data/huawei_right.json'; 
    const API_R_2 = './data/huawei_right2.json'; 

    // 此处应该使用 async/await + Promise 但当前项目不允许
    d3.json(API_L, (error, respL) => {
        if (error) {
            return console.error(error);
        }

        d3.json(API_R, (error, respR) => {
            if (error) {
                return console.error(error);
            }

            if (typeof respL === 'string') {
                respL = JSON.parse(respL);
            }
            if (typeof respR === 'string') {
                respR = JSON.parse(respR);
            }

            var treeLeft = respL[MID_NODE_ID][0];
            var treeRight = respR[MID_NODE_ID][0];

            try {
                // 初始化
            	render(treeRight, treeLeft, MID_NODE_ID);
            } catch (error) {
                console.error(error);
            }
            
        });
    });
}

renderTree();

// 渲染簇图
function render(treeRight = {}, treeLeft = {}, MID_NODE_ID) {
    
    const INIT_SCALE = .7;
	const treeBoxId = '#tree';
	const width = 1162;
    const height = window.innerHeight;
    
    
    const maxLength = Math.max(treeRight.children.length, treeLeft.children.length);

    var m = [20, 120, 20, 120];
    var w = 1280 - m[1] - m[3];
    var h = 600 - m[0] - m[2];
    var i = 0;
    
    const gap = 0.05 * maxLength; // 树枝密度

    var tree = d3.layout.cluster()
        .size([h, w])
        .separation(function (a, b) {
            return a.parent == b.parent ? 1 : 2;
        });

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            // x, y 坐标对调，形成横向的树图
            return [d.y, d.x * gap];
        });

    // 全图缩放器
    const zoom = d3.behavior.zoom()
        .scaleExtent([0.25, 2])
        .on('zoom', zoomFn);
    
    // SVG 画布
    var svg = d3.select(treeBoxId).append('svg:svg')
        .attr('width', width)
        // .attr('height', h + m[0] + m[2])
        .attr('height', Math.max((h + m[0] + m[2]) * gap, height))
        .append('g')
	    .call(zoom)
	    .on('dblclick.zoom', null);
    
    // 缩放层（位置必须在 svg 画布之后， container 之前）
    const zoomOverlay = svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all');
    
     var container = svg.append('svg:g')
        .attr('transform', 'translate(' + h + ',' + (m[0]) + ')scale('+ INIT_SCALE + ')')
        .attr('class', 'container');

	function zoomFn() {
	    const {
	        translate,
	        scale
	    } = d3.event;
	    const [x, y] = translate;
	    const [dx, dy] = [h, m[0]];
	    const zoomTranslate = [x + dx, y + dy];
	    container.attr('transform', 'translate(' + zoomTranslate + ')scale(' + scale * INIT_SCALE + ')');
	}
	
    // 标识左侧树枝
    treeLeft = defLeftNode(treeLeft);

    update(treeRight, treeLeft);

    function update(source, sourceL) {

        // 布局节点
        var nodes = layoutNodes(source);
        var nodesLeft = layoutNodes(sourceL);
        var lastIndex = nodes.length;
        for (const key in nodesLeft) {
            if (nodesLeft.hasOwnProperty(key)) {
                nodes[lastIndex++] = nodesLeft[key];
            }
        }
        // 设置树枝深度和方向
        nodes.forEach(function (d) {
            // 树枝方向：负值向左/正值向右
            var direction = d.direction || 1;
            d.y = d.depth * 200 * direction;
        });

        // 更新节点
        var node = container.selectAll('g.node')
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // 在容器插入节点分组
        var nodeEnter = node.enter().append('svg:g')
            .attr('class', 'tree-node')
            .attr('transform', function (d) {
                return 'translate(' + source.y0 + ',' + source.x0 * gap + ')';
            })
            .on('click', function (d) {
                // ajax_get_server(d.name);
                console.log(d.name);
            });

        // 插入节点圆
        nodeEnter.append('svg:circle')
            .attr('r', 1e-6)
            .style('fill', '#333');

        // 插入节点文字
        nodeEnter.append('svg:text')
            .attr('x', function (d) {
                if (d.id == MID_NODE_ID) {
                    return 10;
                }
                return d.children || d._children ? -10 : 10;
            }
            )
            .attr('dy', '.35em')
            .attr('text-anchor', function (d) {
                if (d.id == MID_NODE_ID) {
                    return 'start';
                }
                return d.children || d._children ? 'end' : 'start';
            })
            .text(function (d) {
                return d.name;
            })
            .style('fill-opacity', 1e-6);

        // 展开树枝节点
        var duration = d3.event && d3.event.altKey ? 5000 : 500;
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', function (d) {
                return 'translate(' + d.y + ',' + d.x * gap + ')';
            });

        nodeUpdate.select('circle')
            .attr('r', function (d) {
                return d.open ? 8 : 5;
            })
            .style('fill', function (d) {
                return d.open ? '#333' : '#aaa';
            });

        nodeUpdate.select('text')
            .style('fill-opacity', 1);

        // 关闭树枝节点
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', function (d) {
                return 'translate(' + source.y + ',' + source.x * gap + ')';
            })
            .remove();

        nodeExit.select('circle')
            .attr('r', 1e-6);

        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // 更新树枝
        var link = container.selectAll('path.link')
            .data(tree.links(nodes), function (d) {
                return d.target.id;
            });

        // 插入新树枝
        link.enter()
            .insert('svg:path', 'g')
            .attr('class', 'link')
            .attr('d', function (d) {
                var o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
            })
            .transition()
            .duration(duration)
            .attr('d', diagonal);

        // 展开树枝
        link.transition()
            .duration(duration)
            .attr('d', diagonal);

        // 关闭树枝
        link.exit()
            .transition()
            .duration(duration)
            .attr('d', function (d) {
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

    // 标识左侧树枝
    function defLeftNode(node) {
        return deepAssign(node, {direction: -1});
    }

    // 深拷贝并扩展属性
    function deepAssign(obj, sub = {}) {
        const getType = o => Object.prototype.toString.call(o).slice(8, -1);
        const isObject = o => getType(o) === 'Object';
        const isArray = o => getType(o) === 'Array';
        const isIterable = o => typeof o === 'object' && typeof o !== 'null';
        let newObj;
        if (isIterable(obj)) {
            newObj = isArray(obj) ? [] : {};
            for (let [k, v] of Object.entries(obj)) {
                if (isIterable(v)) { 
                    newObj[k] = deepAssign(v, sub); // 递归
                    if(isObject(v)) {
                        Object.assign(newObj[k], sub);
                    }
                } else {
                    newObj[k] = v;
                }
            }
        } else {
            return obj;
        }
        if(isObject(newObj)) {
            Object.assign(newObj, sub);
        }
        
        return newObj;
    }
}