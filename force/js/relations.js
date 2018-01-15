// 当前企业 ID
const IDS = [8, 650397229, 650397229, 24762997, 1463816270, 26044960]
// 企业关系 API 
const APIS = [
    'data/bianlifeng.simple.json',
    'data/xiecheng.json',
    'data/baidu.json',
    'data/tencent.json',
    'data/alibaba.json',
    'data/huawei.json'
];

// 企业关系 API
const RELATIONS_MAP = APIS[0];
let companyId = IDS[0];

// 企业信息 API
const NODE_INFO = 'data/bianlifeng.info.json';

const width = 1162;
const height = Math.max(window.innerHeight, 600);
let drawinData = {};

const initScale = .7;

const nodeConf = {
    fillColor: {
        Human: 'rgb(255, 76, 10)',  // 个人
        Company: 'rgb(35, 148, 206)'// 公司
    },
    strokeColor: {
        Human: 'rgb(244,56,0)',
        Company: 'rgb(35, 148, 206)'
    },
    strokeWidth: {
        Human: 3,
        Company: 0
    },
    radius: {
        Human: 36,
        Company: 56
    }
};

const lineConf = {
    strokeColor: {
        SERVE: 'rgb(128, 194, 216)', // 任职 [ 执行董事, 监事, 经理, 总经理 ]
        OWN: 'rgb(204, 225, 152)',   // 法人 [ 法人 ] 
        INVEST_C: 'rgb(242, 90, 41)',// 企业投资 [ 参股 ]
        INVEST_H: 'rgb(242, 90, 41)',// 个人投资 [ 参股 ]
        BRANCH: 'rgb(135,170,205)'   // 分支 [ 企业分支 ]
    }
};

const nodeTextFontSize = 16;
const lineTextFontSize = 12;

const menuConf = {
    width: 500,
    height: 500,
    offetRadius: 30,
    color: '#00B9C4',
    dataset: [{
        per: 25,
        action: 'info',
        hash: '',
        lable: '企业信息'
    },
    {
        per: 25,
        action: 'equity',
        hash: 'reigon',
        lable: '股权结构'
    },
    {
        per: 25,
        action: 'tree',
        hash: 'investment',
        lable: '投资族谱'
    },
    {
        per: 25,
        action: 'relation',
        hash: 'genealogy',
        lable: '企业族谱'
    }],
    iconPath: 'menu-icon/',
    iconSize: {
        width: 15,
        height: 15
    }
};
menuConf.innerRadius = nodeConf.radius.Company;
menuConf.outerRadius = menuConf.innerRadius + menuConf.offetRadius;

const initTranslate = [menuConf.outerRadius, menuConf.outerRadius];

let nodeCircle;
let linkLine;
let marker;
let lineText;
let focusHalo;
let wheelMenu;

// 力导向图
const force = d3.layout.force()
    .size([width, height]) // 画布的大小
    .linkDistance(220) // 连线长度
    .charge(-3000); // 排斥/吸引，值越小越排斥

// 全图缩放器
const zoom = d3.behavior.zoom()
    .scaleExtent([0.25, 2])
    .on('zoom', zoomFn);

// 节点拖拽器（使用 d3.behavior.drag 节点拖动失效）
const drag = force.drag()
    .origin(d => d)
    .on('dragstart', dragstartFn)
    .on('drag', dragFn)
    .on('dragend', dragendFn);


// SVG 画布
const svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(zoom)
    .on('dblclick.zoom', null);

const container = svg.append('g')
    .attr('transform', 'translate(' + initTranslate + ')scale(' + initScale + ')')
    .attr('class', 'container');

// 阴影
const shadow = svg.append('defs').append('filter')
    .attr('id', 'drop-shadow')
    .attr("width", "150%")
    .attr("height", "150%");
shadow.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 3)
    .attr('result', 'blur');
shadow.append('feOffset')
    .attr('in', 'blur')
    .attr('dx', 1)
    .attr('dy', 1)
    .attr('result', 'offsetBlur');

const feMerge = shadow.append('feMerge');
feMerge.append('feMergeNode')
    .attr('in', 'offsetBlur')
feMerge.append('feMergeNode')
    .attr('in', 'SourceGraphic');

// 请求数据，绘制图表
d3.json(RELATIONS_MAP, (error, resp) => {
    if (error) {
        return console.error(error);
    }
    if (typeof resp === 'string') {
        resp = JSON.parse(resp);
    }
    let pureNodes = resp.nodes;
    let relations = resp.relations || resp.relationships;
    // 统一接口数据格式（格式固定后可删除）
    [pureNodes, relations] = formatApiData(pureNodes, relations);

    // 生成绘图数据
    genDrawinData(pureNodes, relations);

    // 绘图
	setTimeout(function() {
		initialize();
	}, 10);
});

// 生成画图数据
function genDrawinData(pureNodes, relations) {
    // 生成 nodes map
    const [nodesMap, { Human: hnum = 0, Company: cnum = 0 }] = genNodesMap(pureNodes);
    // 起点和终点相同的关系映射
    const [linkMap] = genLinkMap(relations);
    // 构建 nodes（不能直接使用请求数据中的 nodes）
    const nodes = d3.values(nodesMap);
    // 构建 links（source 属性必须从 0 开始）
    const links = genLinks(relations, linkMap, nodesMap);
    // 将画图数据保存到全局变量
    drawinData = { pureNodes, relations, nodes, links, nodesMap, linkMap, hnum, cnum };
}

// 初始化绘图
function initialize() {
    const { nodes, links, linkMap, hnum, cnum } = drawinData;
    // 绑定力导向图数据
    force
        .nodes(nodes) // 设定节点数组
        .links(links); // 设定连线数组
    // 开启力导向布局
    force.start();
    // 手动快速布局
    for (let i = 0, n = 1000; i < n; ++i) {
        force.tick();
    }
    // 停止力布局
    force.stop();
    // 监听力学图运动事件，更新坐标
    force.on('tick', tick);
    // 固定所有节点
    nodes.forEach(node => {
        node.fixed = true;
    });

    // 箭头
    const markerUpdate = container.selectAll('.marker-box').append('svg:defs')
        .attr('class', 'marker-box')
        .data(force.links());
    const markerEnter = markerUpdate.enter();
    const markerExit = markerUpdate.exit();
    marker = markerEnter.append('svg:marker')
        .attr('id', link => 'marker-' + link.id)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', link => {
            const nodeType = link.source.ntype;
            if (nodeType === 'Company') {
                return 9;
            }
            if (nodeType === 'Human') {
                if (link.count === 1) {
                    return 25;
                } else if (link.count === 2) {

                } else if (link.count === 3) {
                    if (link.index === 1) {
                        return 25;
                    }
                } else if (link.count === 4) {
                    if (link.index === 1 || link.index === 2) {
                        return 25;
                    }
                }
            }
            return 28;
        })
        .attr('refY', 0)
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('orient', 'auto')
        .attr('stroke-width', 2)
        .append('svg:path')
        .attr('d', 'M2,0 L0,-3 L9,0 L0,3 M2,0 L0,-3')
        .attr('fill', link => lineConf.strokeColor[link.type] || '#333');
    markerExit.remove();

    // 节点连线
    const linkLineUpdate = container.selectAll('.link')
        .data(force.links());
    const linkLineEnter = linkLineUpdate.enter();
    const linkLineExit = linkLineUpdate.exit();
    linkLine = linkLineEnter.append('path')
        .attr('class', 'link')
        .attr({
            'marker-end': link => 'url(#' + 'marker-' + link.id + ')', // 标记箭头
            'd': link => genLinkPath(link),
            'id': link => 'link-' + link.id,
        })
        .style('stroke', link => lineConf.strokeColor[link.type] || '#333');
    linkLineExit.remove();

    // 连线文字
    const lineTextUpdate = container.selectAll('.linetext-box').append('g')
        .attr('class', 'linetext-box')
        .data(force.links());
    const lineTextEnter = lineTextUpdate.enter();
    const lineTextExit = lineTextUpdate.exit();
    lineText = lineTextEnter.append('text')
        .attr('class', 'linetext')
        .style('font-size', lineTextFontSize)
        .attr({
            'id': link => 'linktext' + link.id,
            'dx': link => getLineTextDx(link),
            'dy': 5
        });
    lineTextExit.remove();
    lineText.append('textPath')
        .attr('xlink:href', link => '#link-' + link.id)
        .text(link => link.label);

    // 节点（圆）
    const nodeCircleUpdate = container.selectAll('.node-box').append('g')
        .attr('class', 'node-box')
        .data(force.nodes());
    const nodeCircleEnter = nodeCircleUpdate.enter();
    const nodeCircleExit = nodeCircleUpdate.exit();
    nodeCircle = nodeCircleEnter.append('g')
        .attr('class', 'node')
        .attr('cx', node => node.x)
        .attr('cy', node => node.y)
        .style('cursor', 'pointer')
        .call(drag); // 节点可拖动
    nodeCircleExit.remove();

    nodeCircle.append('circle')
        // .style('fill-opacity', .3) // debug
        .style('fill', node => nodeConf.fillColor[node.ntype])
        .style('stroke', node => nodeConf.strokeColor[node.ntype])
        .style('stroke-width', node => nodeConf.strokeWidth[node.ntype])
        .attr('class', 'node-circle')
        .attr('id', node => 'node-circle-' + node.id)
        .attr('r', node => nodeConf.radius[node.ntype])
        .style('filter', 'url(#drop-shadow)');

    // 鼠标交互
    nodeCircle
        .on('mouseenter', function (currNode) {
            highlightNode(true, currNode);
        })
        .on('mouseleave', function (currNode) {
            highlightNode(false);
        });

    // 节点文字
    nodeText = nodeCircle.append('text')
        .attr('class', 'nodetext')
        .attr('id', node => 'node-text-' + node.id)
        .style('font-size', nodeTextFontSize)
        .style('font-weight', 400)
        .style('fill', '#fff')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('x', function ({
            name,
            ntype
        }) {
            return textBreaking(d3.select(this), name, ntype);
        });

    // 节点菜单
    const pie = d3.layout.pie().value(d => d.per);
    const piedata = pie(menuConf.dataset);

    // 聚焦光环
    focusHalo = nodeCircle.filter(node => node.ntype === 'Company' && +node.id === +companyId);
    focusHalo.append('circle')
        .attr('r', node => nodeConf.radius[node.ntype] + 8)
        .style('fill', 'rgba(0,0,0,.0)')
        .style('stroke', 'rgb(0,209,218)')
        .style('stroke-width', 5)
        .style('stroke-dasharray', node => 2 * Math.PI * (nodeConf.radius[node.ntype] + 8) / 8);
    focusHalo.append('circle')
        .attr('r', node => nodeConf.radius[node.ntype] + 8)
        .style('fill', 'rgba(0,0,0,.0)')
        .style('stroke', 'rgb(0,209,218)')
        .style('stroke-width', 5)
        .style('stroke-dasharray', node => 2 * Math.PI * (nodeConf.radius[node.ntype] + 8) / 8)
        .style('stroke-dashoffset', -45);

    // 环形菜单
    wheelMenu = nodeCircle.filter(node => node.ntype === 'Company')
        .append('g')
        .attr('id', node => 'menu-wrapper-' + node.id)
        .style('display', 'none');
    const menuPie = wheelMenu
        .selectAll('.wheel-menu')
        .data(piedata)
        .enter()
        .append('g')
        .on('click', (d) => handleWheelMenu(d));
    const menuArc = d3.svg.arc()
        .innerRadius(menuConf.innerRadius)
        .outerRadius(menuConf.outerRadius);
    menuPie.append('path')
        .attr('fill', menuConf.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('d', d => menuArc(d));
    menuPie.append('image')
        .attr('width', menuConf.iconSize.width)
        .attr('height', menuConf.iconSize.height)
        .attr('x', -(menuConf.iconSize.width / 2))
        .attr('y', -(menuConf.iconSize.width / 2))
        .attr('transform', d => 'translate(' + menuArc.centroid(d) + ')')
        .attr('xlink:href', (d, i) => menuConf.iconPath + d.data.action + '.png');

    // 更新力导向图
    // 注意1：必须调用一次 tick （否则，节点会堆积在左上角）
    // 注意2：调用位置必须在 nodeCircle, nodeText, linkLine, lineText 后
    tick();

    // 设置节点数目
    setNum(cnum, hnum);

    // 生成节点搜索 HTML
    genSuggest(nodes);

    // 生成关系筛选 HTML
    genFilter(links);
}

// 临时性解决关系文字偏移问题（后期需要优化）
if (nodeCircle && linkLine && lineText) {
    svg
        .on('mouseenter', function () {
            tick();
        })
        .on('mouseleave', function () {
            tick();
        });
}

// 更新力导向图
function tick() {
    // 节点位置
    nodeCircle.attr('transform', node => 'translate(' + node.x + ',' + node.y + ')');
    // 连线路径
    linkLine.attr('d', link => genLinkPath(link));
    // 连线文字位置
    lineText.attr('dx', link => getLineTextDx(link));
    // 连线文字角度 
    lineText.attr('transform', function (link) {
        return getLineTextAngle(link, this.getBBox());
    });
}

function genLinks(relations, linkMap, nodesMap) {
    const indexHash = {};

    return relations.map(function (item, i) {

        let {
            id,
            startNode,
            endNode,
            type,
            label
        } = item;

        const hashKey = startNode + '-' + endNode;
        if (indexHash[hashKey]) {
            indexHash[hashKey] -= 1;
        } else {
            indexHash[hashKey] = linkMap[hashKey] - 1;
        }

        return {
            id,
            source: nodesMap[startNode],
            target: nodesMap[endNode],
            label,
            type,
            count: linkMap[hashKey],
            index: indexHash[hashKey]
        }
    })
}

function genNodesMap(pureNodes) {
    const nodeHash = {};
    const countHash = {};
    const suggestHash = {};
    pureNodes = pureNodes.map(function (node) {
        const { id, name, ntype } = node;
        nodeHash[id] = node;
        countHash[ntype] = countHash[ntype] ? countHash[ntype] + 1 : 1;
        return node;
    });
    return [nodeHash, countHash];
}

function genLinkMap(relations) {
    const linkHash = {};
    const countHash = {};
    relations.map(function (item) {
        const { startNode, endNode, type, id } = item;
        const k = startNode + '-' + endNode;
        linkHash[k] = linkHash[k] ? linkHash[k] + 1 : 1;
    });
    return [linkHash];
}

// 生成关系连线路径
function genLinkPath(link) {

    const count = link.count;
    const index = link.index;
    const r = nodeConf.radius[link.source.ntype];

    const sx = link.source.x;
    const sy = link.source.y;
    const tx = link.target.x;
    const ty = link.target.y;

    const {
        parallelSx,
        parallelSy,
        parallelTx,
        parallelTy
    } = getParallelLine(
            count,
            index,
            r,
            sx,
            sy,
            tx,
            ty
        );

    return 'M' + parallelSx + ',' + parallelSy + ' L' + parallelTx + ',' + parallelTy;
}

function getLineAngle(sx, sy, tx, ty) {
    // 两点 x, y 坐标偏移值
    const x = tx - sx;
    const y = ty - sy;
    // 斜边长度
    const hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) | 1;
    // 求出弧度
    const cos = x / hypotenuse;
    const radian = Math.acos(cos);
    // 用弧度算出角度   
    let angle = 180 / (Math.PI / radian);
    if (y < 0) {
        angle = -angle;
    } else if ((y == 0) && (x < 0)) {
        angle = 180;
    }
    return angle;
}

function zoomFn() {
    const {
        translate,
        scale
    } = d3.event;
    const [x, y] = translate;
    const [dx, dy] = initTranslate;
    const zoomTranslate = [x + dx, y + dy];

    container.attr('transform', 'translate(' + zoomTranslate + ')scale(' + scale * initScale + ')');
}

function dragstartFn(d) {
    d3.event.sourceEvent.stopPropagation();
    force.start();
}

function dragFn(d) {
    d3.select(this)
        .attr('cx', d.x = d3.event.x)
        .attr('cy', d.y = d3.event.y);
}

function dragendFn(d) {
    force.stop();
}

function isLinkLine(node, link) {
    return link.source.id == node.id || link.target.id == node.id;
}

function isLinkNode(currNode, node, linkMap) {
    if (currNode.id === node.id) {
        return true;
    }
    return linkMap[currNode.id + '-' + node.id] || linkMap[node.id + '-' + currNode.id];
}

function textBreaking(d3text, text, ntype) {
    const len = text.length;
    if (len <= 4) {
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', 2)
            .text(text);
    } else {
        // 企业节点
        let topText = text.substring(0, 4);
        let midText = text.substring(4, 9);
        let botText = text.substring(9, len);
        let topY = -22;
        let midY = 8;
        let botY = 34;

        // 个人节点
        if (ntype === 'Human') {
            topText = text.substring(0, 3);
            midText = text.substring(3, 7);
            botText = text.substring(7, len);
            topY = -18;
            midY = 6;
            botY = 24;
        }

        if (len <= 10) {
            topY += 10;
            midY += 10;
        } else {
            botText = text.substring(9, 11) + '...';
        }

        d3text.text('');
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', topY)
            .text(function () {
                return topText;
            });
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', midY)
            .text(function () {
                return midText;
            });
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', botY)
            .text(function () {
                return botText;
            });
    }
}

function getLineTextDx(d) {
    const sx = d.source.x;
    const sy = d.source.y;
    const tx = d.target.x;
    const ty = d.target.y;

    const distance = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
    const textLength = d.label.length;
    const sr = nodeConf.radius[d.source.ntype];
    const tr = nodeConf.radius[d.target.ntype];

    const dx = (distance - sr - tr - textLength * lineTextFontSize) / 2;

    return dx;
}

function getLineTextAngle(d, bbox) {
    if (d.target.x < d.source.x) {
        const {
            x,
            y,
            width,
            height
        } = bbox;
        const rx = x + width / 2;
        const ry = y + height / 2;
        return 'rotate(180 ' + rx + ' ' + ry + ')';
    } else {
        return 'rotate(0)';
    }
}

function handleWheelMenu(d) {
    if (d.data.action === 'info') {
        toggleMask(true);
        toggleInfo(false, null);
        d3.json(NODE_INFO, (error, resp) => {
            if (error) {
                toggleMask(false);
                return console.error(error);
            }

            if (typeof resp === 'string') {
                resp = JSON.parse(resp);
            }
            setTimeout(function () {
                toggleMask(false);
                toggleInfo(true, resp);
            }, 1000);
        });
        return;
    }
    location.href = '#' + d.data.hash + ((new Date().getTime() + '').substr(-5));
}

function highlightNode(bool = false, node = null) {
    toggleNode(nodeCircle, node, bool);
    toggleMenu(wheelMenu, node, bool);
    toggleLine(linkLine, node, bool);
    toggleMarker(marker, node, bool);
    toggleLineText(lineText, node, bool);
}

function toggleNode(nodeCircle, currNode, isHover = false) {
    if (isHover) {
        // 提升节点层级 
        nodeCircle.sort((a, b) => a.id === currNode.id ? 1 : -1);
        // this.parentNode.appendChild(this);
        nodeCircle
            .style('opacity', .1)
            .filter(node => isLinkNode(currNode, node, drawinData.linkMap))
            .style('opacity', 1);

    } else {
        nodeCircle.style('opacity', 1);
    }

}

function toggleMenu(wheelMenu, currNode, isHover) {
    if (isHover) {
        hoverNodeId = currNode.id;
        // 显示节点菜单
        wheelMenu.style('display', node => node.id === currNode.id ? 'block' : 'none');
    } else {
        hoverNodeId = 0;
        // 隐藏节点菜单
        wheelMenu.style('display', 'none');
    }
}

function toggleLine(linkLine, currNode, isHover) {
    if (isHover) {
        // 加重连线样式
        linkLine
            .style('opacity', .1)
            .filter(link => isLinkLine(currNode, link))
            .style('opacity', 1)
            .classed('link-active', true);
    } else {
        // 连线恢复样式
        linkLine
            .style('opacity', 1)
            .classed('link-active', false);
    }
}

function toggleLineText(lineText, currNode, isHover) {
    if (isHover) {
        // 只显示相连连线文字
        lineText
            .style('fill-opacity', link => isLinkLine(currNode, link) ? 1.0 : 0.0);
    } else {
        // 显示所有连线文字
        lineText
            .style('fill-opacity', '1.0');
    }
}

function toggleMarker(marker, currNode, isHover) {
    if (isHover) {
        // 放大箭头
        marker.filter(link => isLinkLine(currNode, link))
            .style('transform', 'scale(1.5)');
    } else {
        // 恢复箭头
        marker
            .attr('refX', nodeConf.radius.Company)
            .style('transform', 'scale(1)');
    }
}

function round(index, pow = 2) {
    const multiple = Math.pow(10, pow);
    return Math.round(index * multiple) / multiple;
}

// 设置平行线坐标
function getParallelLine(
    count,
    index,
    r,
    sx,
    sy,
    tx,
    ty
) {

    // 把圆理解为一个盒子，平行线是装在盒子里
    // offet 控制内边距，取值范围是 -r/2 到 r/2
    const offet = -6;

    const dx = tx - sx;
    const dy = ty - sy;
    const hypotenuse = Math.sqrt(dx * dx + dy * dy);
    const angle = 180 * Math.asin(dx / hypotenuse) / Math.PI | 1;

    const a = Math.cos(angle * Math.PI / 180) * r;
    const b = Math.sin(angle * Math.PI / 180) * r;

    const sourceX = sx + b;
    const targetX = tx - b;
    const sourceY = dy < 0 ? sy - a : sy + a;
    const targetY = dy < 0 ? ty + a : ty - a;

    const maxCount = 4; // 最大连线数
    const minStart = count === 1 ? 0 : -r / 2 + offet;
    const start = minStart * (count / maxCount); // 连线线开始位置
    const space = count === 1 ? 0 : Math.abs(minStart * 2 / (maxCount - 1)); // 连线间隔
    const position = start + space * index; // 位置分布
    const isY = dy < 0;

    if (position > r) {
        return {
            parallelSx: sx,
            parallelSy: sy,
            parallelTx: tx,
            parallelTy: ty
        }
    } else {
        const s = r - Math.sin(180 * Math.acos(position / r) / Math.PI * Math.PI / 180) * r;
        const _a = Math.cos(angle * Math.PI / 180);
        const _b = Math.sin(angle * Math.PI / 180);
        const a = _a * position;
        const b = _b * position;
        const rx = _b * s;
        const ry = _a * s;

        return {
            parallelSx: (isY ? sourceX + a : sourceX - a) - rx,
            parallelSy: (isY ? sourceY + ry : sourceY - ry) + b,
            parallelTx: (isY ? targetX + a : targetX - a) + rx,
            parallelTy: (isY ? targetY - ry : targetY + ry) + b
        };
    }
}

function toggleInfo(flag, data) {

    let nodeInfoWarp = document.querySelector('.node-info-warp');

    if (flag && data) {
        if (!nodeInfoWarp) {
            const graph = document.querySelector('#graph');
            nodeInfoWarp = document.createElement('div');
            nodeInfoWarp.setAttribute('class', 'node-info-warp');
            graph.appendChild(nodeInfoWarp);
        }

        const {
            id, // 企业 ID
            name, // 公司名称
            regStatus, // 状态标识
            legalPersonName, // 法人
            companyOrgType, // 企业类型
            regCapital, // 注册资本
            estiblishTime, // 成立日期
            regLocation // 注册地址
        } = data;

        const { origin, pathname, search } = window.location;
        const companyLink = origin + pathname + search;

        const html = `
            <div class="company-title">
                <span class="close-info">×</span>
                <span class="company-name">
                	<a class="company-link" href="${companyLink}" title="${name || '--'}" >
                		${name}
                	</a>
                </span>
                <span class="company-reg-status">${regStatus}</span>
            </div>
            <div class="node-title-split"></div>
            <div class="company-info">
                <div>法人：${legalPersonName || '--'}</div>
                <div>企业类型：${companyOrgType || '--'}</div>
                <div>注册资本：${regCapital || '--'}</div>
                <div>成立日期：${estiblishTime || '--'}</div>
                <div>注册地址：${regLocation || '--'}</div>
            </div>
        `;
        nodeInfoWarp.innerHTML = html;
        $('.close-info').on('click', function () {
            toggleInfo(false, null);
        });
        nodeInfoWarp.style.cssText = 'display: block';
    } else {
        if (nodeInfoWarp) {
            nodeInfoWarp.innerHTML = '';
            nodeInfoWarp.style.cssText = 'display: none';
        }
    }
}

function toggleMask(flag) {
    let loadingMask = document.querySelector('#loading-mask');

    if (flag) {
        if (!loadingMask) {
            const graph = document.querySelector('#graph');
            loadingMask = document.createElement('div');
            loadingMask.setAttribute('id', 'loading-mask');
            graph.appendChild(loadingMask);
        }
        const html = `
            <div class="loader">
                <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                <span class="sr-only">Loading...</span>
            </div>
        `;
        loadingMask.innerHTML = html;
        loadingMask.style.cssText = 'display: flex';
    } else {
        if (loadingMask) {
            loadingMask.innerHTML = '';
            loadingMask.style.cssText = 'display: none';
        }
    }
}

function setNum(cnum, hnum) {
    d3.select('#company-num').text(cnum);
    d3.select('#human-num').text(hnum);
}

function formatDate(timestamp) {
    const date = new Date(+timestamp);
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
}


// 搜索节点
const suggestHash = {};
const $searchInput = $('#searchInputText');
const $searchContainer = $('#searchEntryContainer');
$searchInput.on("input", userInput);


function genSuggest(nodes) {
    const html = nodes.map(node => {
        const { id, name, ntype } = node;
        suggestHash[name] = node;
        return `<li data-cid="${id}" class="dbEntry company-${id}" title="${name}" onclick="onSelectSuggest(this)">${name}</li>`
    });
    $searchContainer.html(html.join(''));
}

function userInput() {
    const $suggestItems = $searchContainer.find('li');
    let inputText = this.value;
    if (inputText.length === 0) {
        $suggestItems.show();
    } else {
        toggleSuggestList(inputText);
    }
}

function onSelectSuggest(o) {
    const { nodesMap, linkMap } = drawinData;
    const cid = $(o).data('cid');
    const cname = $(o).text();
    // 填充输入框，关闭搜索列表
    $searchInput.val(cname);
    toggleSuggestList(cname);
    // 高亮显示搜索节点
    highlightNode(true, nodesMap[cid]);

}

function toggleSuggestList(inputText) {
    const result = [];
    let selector = '';
    const $suggestItems = $searchContainer.find('li');

    for (let [name, node] of Object.entries(suggestHash)) {
        if (name.indexOf(inputText) > -1 || inputText.indexOf(name) > -1) {
            result.push(node.id);
        }
    }
    selector = result.join(',.company-');
    selector = selector ? '.company-' + selector : '';

    if (selector) {
        $suggestItems.not(selector).hide();
        $suggestItems.find(selector).show();
        $searchContainer.show();
    } else {
        $searchContainer.hide();
    }

}

// 关系筛选
const checkboxHash = {};
function genFilter() {

    let { relations, nodes, nodesMap } = drawinData;
    const relationHash = {
        SERVE: '任职',
        OWN: '法人',
        INVEST_C: '企业投资',
        INVEST_H: '个人投资',
        BRANCH: '分支'
    };
    const typeHash = {};

    relations.map(function (item) {
        const { startNode, endNode, type, id } = item;
        typeHash[type] ? typeHash[type].push(id) : typeHash[type] = [id];
        checkboxHash[type] = true;

        // 在节点上添加关系类型
        for (const node of nodes) {
            if (node.id === startNode || node.id === endNode) {
                if (node.ltype) {
                    node.ltype[type] ? node.ltype[type] += 1 : node.ltype[type] = 1;
                } else {
                    node.ltype = { [type]: 1 };
                }
                node.linkWeight = node.linkWeight ? node.linkWeight += 1 : 1;
            }
        }
    });

    const filterLi = Object.entries(typeHash).map(([type, relation]) => {
        return `` +
            `
            <li class="toggleOption" id="${type}FilteringOption">
                <div class="checkboxContainer">
                    <input class="filterCheckbox" id="${type}FilterCheckbox" data-type="${type}"
                        onChange="onChangeFilter(this)" type="checkbox" checked>
                    <label for="${type}FilterCheckbox">${relationHash[type]}</label>
                </div>
            </li>
            `;
    });

    $('#filterOption ul.filter').html(filterLi.join(''));
}

function onChangeFilter(o) {
    highlightNode(false);

    const checked = $(o).prop('checked');
    const display = checked ? 'block' : 'none';
    const type = $(o).data('type');
    const { nodes, relations } = drawinData;

    linkLine
        .filter(link => link.type === type)
        .style('display', display);

    lineText
        .filter(link => link.type === type)
        .style('display', display);

    for (const node of nodes) {
        const typeWeight = node.ltype[type] | 0;
        if (typeWeight) {
            checked ? node.linkWeight += typeWeight : node.linkWeight -= typeWeight;
        }
    }
    nodeCircle
        .style('display', node => node.linkWeight > 0 ? 'block' : 'none');

    
    checkboxHash[type] = checked;
    const filterRelations = relations.filter(relation => checkboxHash[relation.type]);
    const filterNodes = nodes.filter(node => node.linkWeight > 0);
    
    const filterDate = updateDrawinData(filterNodes, filterRelations);
    updateByFilter(filterDate);
}

// 更新画图
function updateByFilter(filterDate) {
    const { hnum, cnum, nodes } = filterDate;

    // 设置节点数目
    setNum(cnum, hnum);

    // 生成节点搜索 HTML
    genSuggest(nodes);

    tick();
}

// 更新画图数据
function updateDrawinData(pureNodes, relations) {
    // 生成 nodes map
    const [nodesMap, { Human: hnum = 0, Company: cnum = 0 }] = genNodesMap(pureNodes);
    // 起点和终点相同的关系映射
    const [linkMap] = genLinkMap(relations);
    // 构建 nodes（不能直接使用请求数据中的 nodes）
    const nodes = d3.values(nodesMap);
    // 构建 links（source 属性必须从 0 开始）
    const links = genLinks(relations, linkMap, nodesMap);
    // 将画图数据保存到全局变量
    return { pureNodes, relations, nodes, links, nodesMap, linkMap, hnum, cnum };
}


// 统一接口数据格式（格式固定后可删除）
function formatApiData(pureNodes, relations) {
    pureNodes = pureNodes.map(node => {
        return {
            id: node.id,
            name: node.properties ? node.properties.name : node.name,
            ntype: node.labels ? node.labels + '' : node.ntype
        };
    });
    relations = relations.map(item => {
        return {
            id: item.id,
            startNode: item.startNode,
            endNode: item.endNode,
            type: item.type,
            label: label = item.properties ? item.properties.labels + '' : item.label
        };
    });
    return [pureNodes, relations];
}
