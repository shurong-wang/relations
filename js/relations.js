// 当前企业 ID
let focusNodeId = 22822;

// 企业关系 API
const APIS = [
    'data/baidu.json',
    'data/tencent.json',
    'data/alibaba.json',
    'data/huawei.json'
];
const RELATIONS_MAP = APIS[0];
// const RELATIONS_MAP = 'http://192.168.1.18/api.php?req=http://192.168.1.27:8080/jstx/getRelationNode.do?companyId=209522';

// 企业信息 API
const NODE_INFO = 'data/nodeInfo.json';

const width = Math.max(window.innerWidth, 1366);
const height = window.innerHeight;

const initScale = .7;

const nodeConf = {
    fillColor: {
        Human: 'rgb(255, 76, 10)',
        Company: 'rgb(35, 148, 206)'
    },
    strokeColor: {
        Human: 'rgb(244,56,0)',
        Company: 'rgb(35, 148, 206)'
    },
    strokeWidth: {
        Human: 3,
        Company: 0
    },
    textFillColor: {
        Human: '#fff',
        Company: '#fff'
    },
    radius: {
        Human: 36,
        Company: 56
    }
};

const lineConf = {
    strokeColor: {
        SERVE: 'rgb(128, 194, 216)',
        OWN: 'rgb(204, 225, 152)',
        INVEST_C: 'rgb(242, 90, 41)',
        INVEST_H: 'rgb(242, 90, 41)'
    }
};

const nodeTextFontSize = 16;
const lineTextFontSize = 12;

let nodesMap = {};
let linkMap = {};

const menuConf = {
    width: 500,
    height: 500,
    offetRadius: 30,
    color: '#00B9C4',
    dataset: [{
            per: 25,
            action: 'info',
            lable: '企业信息',
            url: '#'
        },
        {
            per: 25,
            action: 'equity',
            lable: '股权结构',
            url: 'http://www.qq.com/'
        },
        {
            per: 25,
            action: 'tree',
            lable: '投资族谱',
            url: 'http://www.sohu.com'
        },
        {
            per: 25,
            action: 'relation',
            lable: '企业族谱',
            url: 'http://www.163.com'
        },
    ],
    iconPath: 'menu-icon/',
    iconSize: {
        width: 15,
        height: 15
    }
};
menuConf.innerRadius = nodeConf.radius.Company;
menuConf.outerRadius = menuConf.innerRadius + menuConf.offetRadius;

const initTranslate = [menuConf.outerRadius, menuConf.outerRadius];

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

// SVG
const svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .call(zoom)
    .on('dblclick.zoom', null);

// 缩放层（位置必须在 container 之前）
const zoomOverlay = svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'all');

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

    // 初始化
    initialize(resp);
});

// 初始化
function initialize(resp) {
    let {
        nodes,
        relationships: relations
    } = resp;

    const nodesLength = nodes.length;

    // 生成 nodes map
    nodesMap = genNodesMap(nodes);

    // 构建 nodes（不能直接使用请求数据中的 nodes）
    nodes = d3.values(nodesMap);

    // 起点和终点相同的关系映射
    linkMap = genLinkMap(relations);

    // 构建 links（source 属性必须从 0 开始）
    const links = genLinks(relations);

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

    // 箭头
    const marker = container.append('svg:defs').selectAll('marker')
        .data(force.links())
        .enter().append('svg:marker')
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
        .attr('fill', link => lineConf.strokeColor[link.type]);

    // 节点连线    
    const linkLine = container.selectAll('.link')
        .data(force.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr({
            'marker-end': link => 'url(#' + 'marker-' + link.id + ')', // 标记箭头
            'd': link => genLinkPath(link),
            'id': link => 'link-' + link.id,
        })
        .style('stroke', link => lineConf.strokeColor[link.type]);

    // 连线的文字
    const lineText = container.append('g').selectAll('.linetext')
        .data(force.links())
        .enter()
        .append('text')
        .style('font-size', lineTextFontSize)
        .attr({
            'class': 'linetext',
            'id': link => 'linktext' + link.id,
            'dx': link => getLineTextDx(link),
            'dy': 5
        });

    lineText.append('textPath')
        .attr('xlink:href', link => '#link-' + link.id)
        .text(link => link.label);

    // 节点（圆）
    const nodeCircle = container.append('g')
        .selectAll('.node')
        .data(force.nodes())
        .enter()
        .append('g')
        .style('cursor', 'pointer')
        .attr('class', 'node')
        .attr('cx', node => node.x)
        .attr('cy', node => node.y)
        .call(drag); // 节点可拖动

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
    nodeCircle.on('mouseenter', function (currNode) {
            toggleNode(nodeCircle, currNode, true);
            toggleMenu(menuWrapper, currNode, true);
            toggleLine(linkLine, currNode, true);
            toggleMarker(marker, currNode, true);
            toggleLineText(lineText, currNode, true);
        })
        .on('mouseleave', function (currNode) {
            toggleNode(nodeCircle, currNode, false);
            toggleMenu(menuWrapper, currNode, false);
            toggleLine(linkLine, currNode, false);
            toggleMarker(marker, currNode, false);
            toggleLineText(lineText, currNode, false);
        });

    // 节点文字
    const nodeText = nodeCircle.append('text')
        .attr('class', 'nodetext')
        .attr('id', node => 'node-text-' + node.id)
        .style('font-size', nodeTextFontSize)
        .style('font-weight', 400)
        .style('fill', ({
            ntype
        }) => nodeConf.textFillColor[ntype])
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('x', function ({
            name
        }) {
            return textBreaking(d3.select(this), name);
        });

    // 节点菜单
    const pie = d3.layout.pie().value(d => d.per);
    const piedata = pie(menuConf.dataset);

    // 聚焦节点
    const focusNode = nodeCircle.filter(({
        ntype,
        id
    }) => ntype === 'Company' && +id === +focusNodeId);

    focusNode.append('circle')
        .attr('r', node => nodeConf.radius[node.ntype] + 8)
        .style('fill', 'rgba(0,0,0,.0)')
        .style('stroke', 'rgb(0,209,218)')
        .style('stroke-width', 5)
        .style('stroke-dasharray', node => 2 * Math.PI * (nodeConf.radius[node.ntype] + 8) / 8);

    focusNode.append('circle')
        .attr('r', node => nodeConf.radius[node.ntype] + 8)
        .style('fill', 'rgba(0,0,0,.0)')
        .style('stroke', 'rgb(0,209,218)')
        .style('stroke-width', 5)
        .style('stroke-dasharray', node => 2 * Math.PI * (nodeConf.radius[node.ntype] + 8) / 8)
        .style('stroke-dashoffset', -45);

    // 环形菜单
    const menuWrapper = nodeCircle.filter(({
            ntype
        }) => ntype === 'Company')
        .append('g')
        .attr('id', node => 'menu-wrapper-' + node.id)
        .style('display', 'none');

    const wheelMenu = menuWrapper
        .selectAll('.wheel-menu')
        .data(piedata)
        .enter()
        .append('g')
        .on('click', function (d, i) {
            if (d.data.action === 'info') {
                toggleMask(true);
                toggleNodeInfo(false, null);
                d3.json(NODE_INFO, (error, resp) => {
                    if (error) {
                        toggleMask(false);
                        return console.error(error);
                    }
                    setTimeout(function () {
                        toggleMask(false);
                        toggleNodeInfo(true, resp);
                    }, 1000);
                });
                return;
            }
            location = d.data.url + '?id=' + hoverNodeId;
        });

    const menuArc = d3.svg.arc()
        .innerRadius(menuConf.innerRadius)
        .outerRadius(menuConf.outerRadius);

    wheelMenu.append('path')
        .attr('fill', menuConf.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('d', d => menuArc(d));

    wheelMenu.append('image')
        .attr('width', menuConf.iconSize.width)
        .attr('height', menuConf.iconSize.height)
        .attr('x', -(menuConf.iconSize.width / 2))
        .attr('y', -(menuConf.iconSize.width / 2))
        .attr('transform', d => 'translate(' + menuArc.centroid(d) + ')')
        .attr('xlink:href', (d, i) => menuConf.iconPath + d.data.action + '.png');


    // 更新力导向图
    function tick() {

        console.log('tick...');

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

    // 停止力布局
    force.stop();

    // 固定所有节点
    nodes.forEach(node => {
        node.fixed = true;
    });

    // 更新力导向图
    // 注意1：必须调用一次 tick （否则，节点会堆积在左上角）
    // 注意2：调用位置必须在 nodeCircle, nodeText, linkLine, lineText 后
    tick();

    // 监听力学图运动事件，更新坐标
    force.on('tick', tick);

}


function genLinks(relations) {
    const indexHash = {};

    return relations.map(function ({
        id,
        startNode,
        endNode,
        properties: {labels},
        type
    }, i) {
        const label = labels + '';
        const linkKey = startNode + '-' + endNode;
        if (indexHash[linkKey]) {
            indexHash[linkKey] -= 1;
        } else {
            indexHash[linkKey] = linkMap[linkKey] - 1;
        }

        return {
            id,
            source: nodesMap[startNode],
            target: nodesMap[endNode],
            label,
            type,
            count: linkMap[linkKey],
            index: indexHash[linkKey]
        }
    })
}

function genLinkMap(relations) {
    const hash = {};
    relations.map(function ({
        startNode,
        endNode
    }) {
        const key = startNode + '-' + endNode;
        hash[key] = hash[key] ? hash[key] + 1 : 1;
    });
    return hash;
}

function genNodesMap(nodes) {
    const hash = {};
    nodes.map(function (node) {
        const {
            id,
            labels,
            properties: {name}
        } = node;
        const ntype = labels + '';

        hash[id] = {
            id,
            name,
            ntype
        };
    });
    return hash;
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
    const hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
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

function isLinkNode(currNode, node) {
    if (currNode.id === node.id) {
        return true;
    }
    return linkMap[currNode.id + '-' + node.id] || linkMap[node.id + '-' + currNode.id];
}

function textBreaking(d3text, text) {
    const len = text.length;
    if (len <= 4) {
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', 2)
            .text(text);
    } else {
        const topText = text.substring(0, 4);
        const midText = text.substring(4, 9);
        let botText = text.substring(9, len);
        let topY = -22;
        let midY = 8;
        let botY = 34;
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

function toggleNode(nodeCircle, currNode, isHover) {
    if (isHover) {
        // 提升节点层级 
        nodeCircle.sort((a, b) => a.id === currNode.id ? 1 : -1);
        // this.parentNode.appendChild(this);
        nodeCircle
            .style('opacity', .1)
            .filter(node => isLinkNode(currNode, node))
            .style('opacity', 1);

    } else {
        nodeCircle.style('opacity', 1);
    }

}

function toggleMenu(menuWrapper, currNode, isHover) {
    if (isHover) {
        hoverNodeId = currNode.id;
        // 显示节点菜单
        menuWrapper.filter(node => node.id === currNode.id)
            .style('display', 'block');
    } else {
        hoverNodeId = 0;
        // 隐藏节点菜单
        menuWrapper.filter(node => node.id === currNode.id)
            .style('display', 'none');
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
    const angle = 180 * Math.asin(dx / hypotenuse) / Math.PI;

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

function toggleNodeInfo(flag, data) {

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

        const html = `
            <div class="company-title">
                <span class="close-info">×</span>
                <span class="company-name">${name}</span>
                <span class="company-reg-status">${regStatus}</span>
            </div>
            <div class="node-title-split"></div>
            <div class="company-info">
                <div>法人：${legalPersonName}</div>
                <div>企业类型：${companyOrgType}</div>
                <div>注册资本：${regCapital}</div>
                <div>成立日期：${formatDate(estiblishTime)}</div>
                <div>注册地址：${regLocation}</div>
            </div>
        `;
        nodeInfoWarp.innerHTML = html;
        document.querySelector('.close-info').addEventListener('click', function () {
            toggleNodeInfo(false, null);
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
                <div class="ball-spin-fade-loader">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
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


function formatDate(timestamp) {
    const date = new Date(+timestamp);
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
}