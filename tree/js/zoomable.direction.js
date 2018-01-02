const API_R = 'data/zoomable.direction.json';
const MID_NODE = 'flare';

// Get JSON data
d3.json(API_R, function (error, treeData) {
    initialize(treeData);
});

function initialize(treeData) {
    var nodeIndex = 0;
    var duration = 300;
    var root;

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }


    // define the zoomListener which calls the zoom function on the 'zoom' event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on('zoom', zoom);

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select('#tree-container').append('svg')
        .attr('width', viewerWidth)
        .attr('height', viewerHeight)
        .attr('class', 'overlay')
        .call(zoomListener)
        .on('dblclick.zoom', null);

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle all children function

    function toggleAll(d) {
        if (d.children) {
            d.children.forEach(toggleAll);
            toggleChildren(d);
        }
    }

    // Ajax expand children on click.

    function ajaxExpand(d) {
        d3.json(API_R, function (error, treeData) {
            var resp = d.direction === -1 ? treeData.childrenLeft : treeData.children;
            if (resp) {
                var data = resp.filter(function (item) {
                    return item.name === d.name || item.name === '';
                }) || [];
                if (data[0] && data[0].children) {
                    d.children = data[0].children;
                    d._children = null;
                    update(d);
                }
            }
        });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append('g');

    // Define the root
    root = treeData;

    // Collapse children
    root.children.forEach(toggleAll);
    if (root.childrenLeft) {
        root.childrenLeft.forEach(toggleAll);
    }

    // Layout the tree initially.
    update(root);
    // center on the root node.
    centerNode(root);


    
    // Layout the tree
    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function (level, ndata) {
            if (ndata.children && ndata.children.length > 0) {
                if (levelWidth.length <= level + 1) {
                    levelWidth.push(0);
                }
                levelWidth[level + 1] += ndata.children.length;
                ndata.children.forEach(function (d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);

        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = layoutNode(root);

        // For left nodes
        if (root.childrenLeft) {
            var nodesLeft = layoutNode({
                name: '',
                children: root.childrenLeft
            });
            for (const key in nodesLeft) {
                if (nodesLeft.hasOwnProperty(key)) {
                    nodes[nodes.length++] = nodesLeft[key];
                }
            }
        }
      
        var links = tree.links(nodes);

        // Set widths between levels.
        nodes.forEach(function (d) {
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            d.y = (d.depth * 200) * (d.direction || 1); //200px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll('g.node')
            .data(nodes, function (d) {
                return d.id || (d.id = ++nodeIndex);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) {
                return 'translate(' + source.y0 + ',' + source.x0 + ')';
            })
            .on('click', ajaxExpand);

        nodeEnter.append('circle')
            .attr('class', 'nodeCircle')
            .attr('r', 0)
            .style('fill', function (d) {
                return d._children ? 'lightsteelblue' : '#fff';
            });

        nodeEnter.append('text')
            .attr('x', function (d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr('dy', '.35em')
            .attr('class', 'nodeText')
            .attr('text-anchor', function (d) {
                return d.children || d._children ? 'end' : 'start';
            })
            .text(function (d) {
                return d.name;
            })
            .style('fill-opacity', 0);

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr('x', function (d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr('text-anchor', function (d) {
                return d.children || d._children ? 'end' : 'start';
            })
            .text(function (d) {
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select('circle.nodeCircle')
            .attr('r', 4.5)
            .style('fill', function (d) {
                return d._children ? 'lightsteelblue' : '#fff';
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', function (d) {
                return 'translate(' + d.y + ',' + d.x + ')';
            });

        // Fade the text in
        nodeUpdate.select('text')
            .style('fill-opacity', 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', function (d) {
                return 'translate(' + source.y + ',' + source.x + ')';
            })
            .remove();

        nodeExit.select('circle')
            .attr('r', 0);

        nodeExit.select('text')
            .style('fill-opacity', 0);

        // Update the links…
        var link = svgGroup.selectAll('path.link')
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr('d', diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr('d', function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr('transform', 'translate(' + x + ',' + y + ')scale(' + scale + ')');
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // 布局树形图节点
    function layoutNode(node) {
        node.x0 = viewerHeight / 2;
        node.y0 = 0;
        return tree.nodes(node).reverse();
    }

    // 标识左侧树枝
    function defLeftNode(node) {
        return deepAssign(node, { direction: -1 });
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
                    if (isObject(v)) {
                        Object.assign(newObj[k], sub);
                    }
                } else {
                    newObj[k] = v;
                }
            }
        } else {
            return obj;
        }
        if (isObject(newObj)) {
            Object.assign(newObj, sub);
        }

        return newObj;
    }

}


