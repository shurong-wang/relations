(function () {
    var wordRegexp;
    wordRegexp = function (words) {
            return new RegExp("^(?:" + words.join("|") + ")$", "i")
        },
        CodeMirror.defineMode("cypher",
            function (config) {
                var curPunc, funcs, indentUnit, keywords, operatorChars, popContext, preds, pushContext, tokenBase, tokenLiteral;
                return tokenBase = function (stream) {
                        var ch, curPunc, type, word;
                        return ch = stream.next(),
                            curPunc = null,
                            '"' === ch || "'" === ch ? (stream.match(/.+?["']/), "string") : /[{}\(\),\.;\[\]]/.test(ch) ? (curPunc = ch, "node") : "/" === ch && stream.eat("/") ? (stream.skipToEnd(), "comment") : operatorChars.test(ch) ? (stream.eatWhile(operatorChars), null) : (stream.eatWhile(/[_\w\d]/), stream.eat(":") ? (stream.eatWhile(/[\w\d_\-]/), "atom") : (word = stream.current(), type = void 0, funcs.test(word) ? "builtin" : preds.test(word) ? "def" : keywords.test(word) ? "keyword" : "variable"))
                    },
                    tokenLiteral = function (quote) {
                        return function (stream, state) {
                            var ch, escaped;
                            for (escaped = !1, ch = void 0; null != (ch = stream.next());) {
                                if (ch === quote && !escaped) {
                                    state.tokenize = tokenBase;
                                    break
                                }
                                escaped = !escaped && "\\" === ch
                            }
                            return "string"
                        }
                    },
                    pushContext = function (state, type, col) {
                        return state.context = {
                            prev: state.context,
                            indent: state.indent,
                            col: col,
                            type: type
                        }
                    },
                    popContext = function (state) {
                        return state.indent = state.context.indent,
                            state.context = state.context.prev
                    },
                    indentUnit = config.indentUnit,
                    curPunc = void 0,
                    funcs = wordRegexp(["str", "min", "labels", "max", "type", "lower", "upper", "length", "type", "id", "coalesce", "head", "last", "nodes", "relationships", "extract", "filter", "tail", "range", "reduce", "abs", "round", "sqrt", "sign", "replace", "substring", "left", "right", "ltrim", "rtrim", "trim", "collect", "distinct", "split", "toInt", "toFloat"]),
                    preds = wordRegexp(["all", "any", "none", "single", "not", "in", "has", "and", "or"]),
                    keywords = wordRegexp(["start", "merge", "load", "csv", "using", "periodic commit", "on create", "on match", "match", "index on", "drop", "where", "with", "limit", "skip", "order", "by", "return", "create", "delete", "set", "unique", "unwind"]),
                    operatorChars = /[*+\-<>=&|~]/, {
                        startState: function () {
                            return {
                                tokenize: tokenBase,
                                context: null,
                                indent: 0,
                                col: 0
                            }
                        },
                        token: function (stream, state) {
                            var style;
                            if (stream.sol() && (state.context && null == state.context.align && (state.context.align = !1), state.indent = stream.indentation()), stream.eatSpace()) return null;
                            if (style = state.tokenize(stream, state), "comment" !== style && state.context && null == state.context.align && "pattern" !== state.context.type && (state.context.align = !0), "(" === curPunc) pushContext(state, ")", stream.column());
                            else if ("[" === curPunc) pushContext(state, "]", stream.column());
                            else if ("{" === curPunc) pushContext(state, "}", stream.column());
                            else if (/[\]\}\)]/.test(curPunc)) {
                                for (; state.context && "pattern" === state.context.type;) popContext(state);
                                state.context && curPunc === state.context.type && popContext(state)
                            } else "." === curPunc && state.context && "pattern" === state.context.type ? popContext(state) : /atom|string|variable/.test(style) && state.context && (/[\}\]]/.test(state.context.type) ? pushContext(state, "pattern", stream.column()) : "pattern" !== state.context.type || state.context.align || (state.context.align = !0, state.context.col = stream.column()));
                            return style
                        },
                        indent: function (state, textAfter) {
                            var closing, context, firstChar;
                            if (firstChar = textAfter && textAfter.charAt(0), context = state.context, /[\]\}]/.test(firstChar))
                                for (; context && "pattern" === context.type;) context = context.prev;
                            return closing = context && firstChar === context.type,
                                context ? "keywords" === context.type ? newlineAndIndent : context.align ? context.col + (closing ? 0 : 1) : context.indent + (closing ? 0 : indentUnit) : 0
                        }
                    }
            }),
        CodeMirror.modeExtensions.cypher = {
            autoFormatLineBreaks: function (text) {
                var i, lines, reProcessedPortion;
                for (lines = text.split("\n"), reProcessedPortion = /\s+\b(return|where|order by|match|with|skip|limit|create|delete|set)\b\s/g, i = 0; i < lines.length;) lines[i] = lines[i].replace(reProcessedPortion, " \n$1 ").trim(),
                    i++;
                return lines.join("\n")
            }
        },
        CodeMirror.defineMIME("application/x-cypher-query", "cypher")
}).call(this),
    function () {
        "function" != typeof String.prototype.trim && (String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, "")
            }),
            Object.keys = Object.keys ||
            function (o, k, r) {
                r = [];
                for (k in o) r.hasOwnProperty.call(o, k) && r.push(k);
                return r
            }
    }.call(this),
    function () {
        var baseURL, restAPI;
        // baseURL = "",
        baseURL = "http://123.57.173.60:7488",
            restAPI = "" + baseURL + "/db/data",
            angular.module("neo4jApp.settings", []).constant("Settings", {
                cmdchar: ":",
                endpoint: {
                    console: "" + baseURL + "/db/manage/server/console",
                    jmx: "" + baseURL + "/db/manage/server/jmx/query",
                    rest: restAPI,
                    cypher: "" + restAPI + "/cypher",
                    transaction: "" + restAPI + "/transaction"
                },
                host: baseURL,
                maxExecutionTime: 3600,
                heartbeat: 60,
                maxFrames: 50,
                maxHistory: 100,
                maxNeighbours: 200,
                maxNodes: 1e3,
                maxRows: 1e3,
                maxRawSize: 5e3,
                scrollToTop: !0,
                showDemo: true
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.utils", []).service("Utils", ["$timeout",
            function ($timeout) {
                return {
                    argv: function (input) {
                        var rv;
                        return rv = input.toLowerCase().split(" "),
                            rv || []
                    },
                    debounce: function (func, wait, immediate) {
                        var result, timeout;
                        return result = void 0,
                            timeout = null,
                            function () {
                                var args, callNow, context, later;
                                return context = this,
                                    args = arguments,
                                    later = function () {
                                        return timeout = null,
                                            immediate ? void 0 : result = func.apply(context, args)
                                    },
                                    callNow = immediate && !timeout,
                                    $timeout.cancel(timeout),
                                    timeout = $timeout(later, wait),
                                    callNow && (result = func.apply(context, args)),
                                    result
                            }
                    },
                    parseId: function (resource) {
                        var id;
                        return null == resource && (resource = ""),
                            id = resource.substr(resource.lastIndexOf("/") + 1),
                            parseInt(id, 10)
                    },
                    stripComments: function (input) {
                        var row, rows, rv, _i, _len;
                        for (rows = input.split("\n"), rv = [], _i = 0, _len = rows.length; _len > _i; _i++) row = rows[_i],
                            0 !== row.indexOf("//") && rv.push(row);
                        return rv.join("\n")
                    },
                    firstWord: function (input) {
                        return input.split(/\n| /)[0]
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        var app;
        angular.module("neo4jApp.controllers", ["neo4jApp.utils"]),
            angular.module("neo4jApp.directives", ["ui.bootstrap.dialog"]),
            angular.module("neo4jApp.filters", []),
            angular.module("neo4jApp.services", ["LocalStorageModule", "neo4jApp.settings", "neo4jApp.utils"]),
            app = angular.module("neo4jApp", ["ngAnimate", "neo4jApp.controllers", "neo4jApp.directives", "LiveSearch", "neo4jApp.filters", "neo4jApp.services", "neo4jApp.animations", "ui.bootstrap.dropdownToggle", "ui.bootstrap.position", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.tabs", "ui.bootstrap.carousel", "ui.codemirror", "ui.sortable", "angularMoment", "ngSanitize"])
    }.call(this),
    function () {
        angular.module("neo4jApp").config(["$httpProvider",
            function ($httpProvider) {
                var _base;
                return $httpProvider.defaults.headers.common["X-stream"] = !0,
                    $httpProvider.defaults.headers.common["Content-Type"] = "application/json",
                    (_base = $httpProvider.defaults.headers).get || (_base.get = {}),
                    $httpProvider.defaults.headers.get["Cache-Control"] = "no-cache",
                    $httpProvider.defaults.headers.get.Pragma = "no-cache",
                    $httpProvider.defaults.headers.get["If-Modified-Since"] = "Wed, 11 Dec 2013 08:00:00 GMT"
            }
        ])
    }.call(this),
    function () {
        angular.module("neo4jApp").run(["$rootScope", "$http", "$timeout", "Server", "Settings",
            function ($scope, $http, $timeout, Server, Settings) {
                var check, timer;
                return timer = null,
                    (check = function () {
                        var ts;
                        return $timeout.cancel(timer),
                            ts = (new Date).getTime(),
                            Server.status("?t=" + ts).then(function () {
                                    return $scope.offline = !1,
                                        timer = $timeout(check, 1e3 * Settings.heartbeat)
                                },
                                function () {
                                    return $scope.offline = !0,
                                        timer = $timeout(check, 1e3 * Settings.heartbeat)
                                })
                    })()
            }
        ])
    }.call(this),
    function () {
        angular.module("neo4jApp").config(["$tooltipProvider",
            function ($tooltipProvider) {
                return $tooltipProvider.options({
                    popupDelay: 1e3
                })
            }
        ])
    }.call(this),
    function () {
        angular.module("neo4jApp").run(["$rootScope", "Document", "Folder",
            function ($rootScope, Document, Folder) {
                var doc, folders, general_scripts, node_scripts, relationship_scripts, system_scripts, _i, _len, _ref, _results;
                for (general_scripts = [{
                            folder: "general",
                            content: '// Create a node\nCREATE (n {name:"World"}) RETURN "hello", n.name'
                        },
                        {
                            folder: "general",
                            content: "// Get some data\nMATCH (n) RETURN n LIMIT 100"
                        },
                        {
                            folder: "general",
                            content: "// What is related, and how\nMATCH (a)-[r]->(b)\nWHERE labels(a) <> [] AND labels(b) <> []\nRETURN DISTINCT head(labels(a)) AS This, type(r) as To, head(labels(b)) AS That\nLIMIT 10"
                        },
                        {
                            folder: "general",
                            content: "// REST API\n:GET /db/data"
                        }
                    ], node_scripts = [{
                            folder: "nodes",
                            content: "// Count nodes\n// Warning: may take a long time.\nMATCH (n)\nRETURN count(n)"
                        },
                        {
                            folder: "nodes",
                            content: "// Create index\n// Replace:\n//   'LabelName' with label to index\n//   'propertyKey' with property to be indexed\nCREATE INDEX ON :LabelName(propertyKey)"
                        },
                        {
                            folder: "nodes",
                            content: "// Create indexed node\n// Replace:\n//   'LabelName' with label to apply to new node\n//   'propertyKey' with property to add\n//   'property_value' with value of the added property\nCREATE (n:LabelName { propertyKey:\"property_value\" }) RETURN n"
                        },
                        {
                            folder: "nodes",
                            content: "// Create node\nCREATE (n) RETURN n"
                        },
                        {
                            folder: "nodes",
                            content: "// Delete a node\n// Replace:\n//   'LabelName' with label of node to delete\n//   'propertyKey' with property to find\n//   'expected_value' with value of property\nSTART n=node(*) \nMATCH (n:LabelName)-[r?]-()\nWHERE n.propertyKey = \"expected_value\"\nDELETE n,r"
                        },
                        {
                            folder: "nodes",
                            content: "// Drop index\n// Replace:\n//   'LabelName' with label index\n//   'propertyKey' with indexed property\nDROP INDEX ON :LabelName(propertyKey)"
                        },
                        {
                            folder: "nodes",
                            content: "// Find a node\nMATCH (n{{':'+label-name}})\nWHERE n.{{property-name}} = \"{{property-value}}\" RETURN n"
                        }
                    ], relationship_scripts = [{
                            folder: "relationships",
                            content: "// Isolate node\n// Description: Delete some relationships to a particular node\n// Replace:\n//   'RELATIONSHIP' with relationship type to match (or remove for all)\n//   'propertyKey' with property by which to find the node\n//   'expected_value' with the property value to find\nMATCH (a)-[r:RELATIONSHIP]-()\nWHERE a.propertyKey = \"expected_value\"\nDELETE r"
                        },
                        {
                            folder: "relationships",
                            content: "// Relate nodes\n// Replace:\n//   'propertyKey' with property to evaluate on either node\n//   'expected_value_a' with property value to find node a\n//   'expected_value_b' with property value to find node b\n//   'RELATIONSHP' with type of new relationship between a and b\nMATCH (a),(b)\nWHERE a.propertyKey = \"expected_value_a\"\nAND b.propertyKey = \"expected_value_b\"\nCREATE (a)-[r:RELATIONSHIP]->(b)\nRETURN a,r,b"
                        },
                        {
                            folder: "relationships",
                            content: "// Shortest path\n// Replace:\n//   'propertyKey' with property to evaluate on either node\n//   'expected_value_a' with property value to find node a\n//   'expected_value_b' with property value to find node b\nMATCH p = shortestPath( (a)-[*..4]->(b) )\nWHERE a.propertyKey='expected_value_a' AND b.propertyKey='expected_value_b'\nRETURN p"
                        },
                        {
                            folder: "relationships",
                            content: "// Whats related\n// Description: find a random sample of nodes, revealing how they are related\nMATCH (a)-[r]-(b)\nRETURN DISTINCT head(labels(a)), type(r), head(labels(b)) LIMIT 100"
                        }
                    ], system_scripts = [{
                            folder: "system",
                            content: "// Server configuration\n:GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DConfiguration"
                        },
                        {
                            folder: "system",
                            content: "// Kernel information\n:GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DKernel"
                        },
                        {
                            folder: "system",
                            content: "// ID Allocation\n:GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DPrimitive%20count"
                        },
                        {
                            folder: "system",
                            content: "// Store file sizes\n:GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DStore%20file%20sizes"
                        },
                        {
                            folder: "system",
                            content: "// Extensions\n:GET /db/data/ext"
                        }
                    ], folders = [{
                            id: "general",
                            name: "General",
                            expanded: !0
                        },
                        {
                            id: "system",
                            name: "System",
                            expanded: !1
                        }
                    ], 0 === Document.length && (Document.add(general_scripts.concat(system_scripts)).save(), Folder.add(folders).save()), _ref = Document.all(), _results = [], _i = 0, _len = _ref.length; _len > _i; _i++) doc = _ref[_i],
                    doc.folder && _results.push(Folder.get(doc.folder) ? void 0 : Folder.create({
                        id: doc.folder
                    }));
                return _results
            }
        ])
    }.call(this),
    function () {
        angular.module("neo4jApp.services").run(["GraphRenderer", "GraphStyle",
            function (GraphRenderer, GraphStyle) {
                var arrowPath, nodeSelector, nodeCaption, nodeOutline, nodeOverlay, noop, relationshipOverlay, relationshipType;
                return noop = function () {

                    },

                    nodeOutline = new GraphRenderer.Renderer({
                        onGraphChange: function (selection) {
                            var circles;
                            return circles = selection.selectAll("circle.outline").data(function (node) {
                                    return [node]
                                }),
                                circles.enter().append("circle").classed("outline", !0).attr({
                                    cx: 0,
                                    cy: 0
                                }),
                                circles.attr({
                                    r: function (node) {
                                        return node.radius
                                    },
                                    fill: function (node) {
                                        if (node.enable) {
                                            return GraphStyle.forNode(node).get("color")
                                        } else {
                                            return "#e5e5e5";
                                        }
                                    },
                                    stroke: function (node) {
                                        if (node.enable) {
                                            return GraphStyle.forNode(node).get("border-color")
                                        } else {
                                            return "#e5e5e5";
                                        }
                                    },
                                    "stroke-width": function (node) {
                                        return GraphStyle.forNode(node).get("border-width")
                                    }
                                }),
                                circles.exit().remove()
                        },
                        onTick: noop
                    }),
                    nodeCaption = new GraphRenderer.Renderer({
                        onGraphChange: function (selection) {
                            var text;
                            return text = selection.selectAll("text").data(function (node) {
                                    return node.caption
                                }),
                                text.enter().append("text").attr({
                                    "text-anchor": "middle"
                                }),
                                text.text(function (line) {
                                    return line.text
                                }).attr("y",
                                    function (line) {
                                        return line.baseline
                                    }).attr("font-size",
                                    function (line) {
                                        return GraphStyle.forNode(line.node).get("font-size")
                                    }).attr({
                                    fill: function (line) {
                                        return GraphStyle.forNode(line.node).get("text-color-internal")
                                    }
                                }),
                                text.exit().remove()
                        },
                        onTick: noop
                    }),
                    nodeOverlay = new GraphRenderer.Renderer({
                        onGraphChange: function (selection) {
                            var circles;
                            return circles = selection.selectAll("circle.overlay").data(function (node) {
                                    return node.selected ? [node] : []
                                }),
                                circles.enter().insert("circle", ".outline").classed("ring", !0).classed("overlay", !0).attr({
                                    cx: 0,
                                    cy: 0,
                                    fill: "#f5F6F6",
                                    stroke: "#6de7f9",
                                    "stroke-width": "3px"
                                }),
                                circles.attr({
                                    r: function (node) {
                                        return node.radius + 6
                                    }
                                }),
                                circles.exit().remove()
                            //                                circles = selection.selectAll("circle.outline"),
                            //                                console.log(circles),
                            //                                circles.on('mouseover',function(){
                            //                                alert('over');
                            //                                }),
                            //                                circles.on('mouseout',function(){
                            //                                alert('out');
                            //                                })
                        },
                        onTick: noop
                    }),
                    nodeSelector = new GraphRenderer.Renderer({
                        onGraphChange: function (selection) {
                            var circles;
                            circles = selection.selectAll("foreignObject").data(function (node) {
                                return (node.shouldHideCheckbox == null || node.shouldHideCheckbox == true) ? [] : [node]
                            });
                            return circles.enter().insert("foreignObject")
                                .attr("width", 16)
                                .attr("height", 30)
                                .attr("x", function (node) {
                                    return node.radius
                                })
                                .attr("y", function (node) {
                                    return 0 - node.radius
                                })
                                .html(function (node) {
                                    var checkStatus = node.checkStatus == null || node.checkStatus == false ? "" : "checked='checked'";
                                    return "<input type=checkbox id=check " + checkStatus + "/>"
                                })
                                .on("click", function (d, i) {
                                    d.checkStatus = d.checkStatus == null ? true : !d.checkStatus;
                                    console.log("clicked:" + d.checkStatus);
                                }),
                                circles.exit().remove()
                        },
                        onTick: noop
                    }),
                    arrowPath = new GraphRenderer.Renderer({
                        onGraphChange: function (selection) {
                            var paths, linePaths, tracks;
                            var animateFun = function (obj) {
                                obj.transition()
                                    .duration(2000)
                                    .ease("linear")
                                    .attrTween("transform", function (d, i) {
                                        var path = this.parentNode.firstChild.nextSibling;
                                        return function (t) {
                                            var p = path.getPointAtLength(path.getTotalLength() * t);
                                            //                                        var p = pathNode.getPointAtLength(pathLength * t);
                                            return "translate(" + [p.x, p.y] + ")";
                                        }
                                    })
                                    .each('end', function () {
                                        //                                  d3.select( this )
                                        //                                    .transition()
                                        //                                    .duration(600)
                                        //                                    .attr('r', 32)
                                        //                                    .style('opacity', 0.0);
                                        // .remove();   

                                        animateFun(obj);
                                    });
                            };
                            return paths = selection.selectAll("path.path-arrow").data(function (rel) {
                                    return [rel]
                                }),
                                paths.enter().append("path").attr("class", "path-arrow"),
                                paths.attr("fill",
                                    function (rel) {
                                        if (rel.enable) {
                                            return GraphStyle.forRelationship(rel).get("color");
                                        } else {
                                            return "#e5e5e5";
                                        }
                                    }).attr("stroke", "none"),
                                paths.exit().remove(),
                                linePaths = selection.selectAll("path.path-line").data(function (rel) {
                                    return [rel]
                                }),
                                linePaths.enter().append("path").attr("class", "path-line"),
                                linePaths.attr("opacity", 0),
                                tracks = selection.selectAll("circle").data(function (rel) {
                                    if (rel.type == 'telecom' || rel.type == 'transform')
                                        return [rel];
                                    else
                                        return [];
                                }).enter().append("circle").attr('class', 'animated-object')
                                .attr({
                                    transform: function () {
                                        var p = this.parentNode.firstChild.nextSibling.getPointAtLength(0);
                                        //                                        var p = pathNode.getPointAtLength(0);
                                        return "translate(" + [p.x, p.y] + ")";
                                    },
                                    fill: function (rel) {
                                        if (rel.type == "transform")
                                            return "#DDAA00";
                                        else
                                            return "#40bcd1";
                                    },
                                    display: function (rel) {
                                        return "none";
                                    }
                                })
                                .attr('r', function (rel) {
                                    var r = 5;
                                    if (rel.type == "transform" && rel.propertyMap.amount) {
                                        r = rel.propertyMap.amount * 1;
                                        r = Math.pow(r, 1 / 3) * 2;
                                    }
                                    return r;
                                }),
                                animateFun(tracks)

                        },
                        onTick: function (selection) {
                            return selection.selectAll("path.path-arrow").attr("d",
                                    function (d) {
                                        return d.arrowOutline
                                    }).attr("transform",
                                    function (d) {
                                        return "translate(" + d.startPoint.x + " " + d.startPoint.y + ") rotate(" + d.angle + ")"
                                    }),
                                selection.selectAll("path.path-line").attr("d", function (d) {
                                    return "M " + d.startPoint.x + " " + d.startPoint.y + " " + " L " + d.endPoint.x + " " + d.endPoint.y;
                                });
                        }
                    }),
                    relationshipType = new GraphRenderer.Renderer({
                        onGraphChange: function (selection) {
                            var texts;
                            return texts = selection.selectAll("text").data(function (rel) {
                                    return [rel]
                                }),
                                texts.enter().append("text").attr({
                                    "text-anchor": "middle"
                                }),
                                texts.attr("font-size",
                                    function (rel) {
                                        return GraphStyle.forRelationship(rel).get("font-size")
                                    }).attr("fill",
                                    function (rel) {
                                        if (rel.enable) {
                                            return GraphStyle.forRelationship(rel).get("text-color-" + rel.captionLayout)
                                        } else {
                                            return "#e5e5e5";
                                        }
                                    }),
                                texts.exit().remove()
                        },
                        onTick: function (selection) {
                            return selection.selectAll("text").attr("x",
                                function (rel) {
                                    return rel.midShaftPoint.x
                                }).attr("y",
                                function (rel) {
                                    return rel.midShaftPoint.y + parseFloat(GraphStyle.forRelationship(rel).get("font-size")) / 2 - 1
                                }).attr("transform",
                                function (rel) {
                                    return "rotate(" + rel.textAngle + " " + rel.midShaftPoint.x + " " + rel.midShaftPoint.y + ")"
                                }).text(function (rel) {
                                return rel.shortCaption
                            })
                        }
                    }),
                    relationshipOverlay = new GraphRenderer.Renderer({
                        onGraphChange: function (selection) {
                            var band, rects;
                            return rects = selection.selectAll("rect").data(function (rel) {
                                    return [rel]
                                }),
                                band = 20,
                                rects.enter().append("rect").classed("overlay", !0).attr("fill", "yellow").attr("x", 0).attr("y", -band / 2).attr("height", band),
                                rects.attr("opacity",
                                    function (rel) {
                                        return rel.selected ? .3 : 0
                                    }),
                                rects.exit().remove()
                        },
                        onTick: function (selection) {
                            return selection.selectAll("rect").attr("width",
                                function (d) {
                                    return d.arrowLength > 0 ? d.arrowLength : 0
                                }).attr("transform",
                                function (d) {
                                    return "translate(" + d.startPoint.x + " " + d.startPoint.y + ") rotate(" + d.angle + ")"
                                })
                        }
                    }),
                    //                    isHaveHover = new GraphRenderer.Renderer({
                    //                        onGraphChange: function (selection) {
                    //                            var band, rects;
                    //                            return rects = selection.selectAll("rect").data(function (rel) {
                    //                                return [rel]
                    //                            }),
                    //                                band = 20,
                    //                                rects.enter().append("rect").classed("overlay", !0).attr("fill", "yellow").attr("x", 0).attr("y", -band / 2).attr("height", band),
                    //                                rects.attr("opacity",
                    //                                    function (rel) {
                    //                                        return rel.selected ? .3 : 0
                    //                                    }),
                    //                                rects.exit().remove()
                    //                        },
                    //                        onTick: noop;
                    //                    }),

                    GraphRenderer.nodeRenderers.push(nodeOutline),
                    GraphRenderer.nodeRenderers.push(nodeCaption),
                    GraphRenderer.nodeRenderers.push(nodeOverlay),
                    GraphRenderer.nodeRenderers.push(nodeSelector),
                    GraphRenderer.relationshipRenderers.push(arrowPath),
                    GraphRenderer.relationshipRenderers.push(relationshipType),
                    GraphRenderer.relationshipRenderers.push(relationshipOverlay)
            }
        ])
    }.call(this),
    function () {
        angular.module("neo4jApp").config(["FrameProvider", "Settings",
            function (FrameProvider, Settings) {
                var argv, cmdchar, error, topicalize;
                return cmdchar = Settings.cmdchar,
                    topicalize = function (input) {
                        return null != input ? input.toLowerCase().trim().replace(/\s+/g, "-") : null
                    },
                    argv = function (input) {
                        var rv;
                        return rv = input.toLowerCase().split(" "),
                            rv || []
                    },
                    error = function (msg, exception, data) {
                        return null == exception && (exception = "Error"), {
                            message: msg,
                            exception: exception,
                            data: data
                        }
                    },
                    FrameProvider.interpreters.push({
                        type: "clear",
                        matches: "" + cmdchar + "clear",
                        exec: ["$rootScope", "Frame",
                            function ($rootScope, Frame) {
                                return function () {
                                    return Frame.reset(), !0
                                }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "shell",
                        templateUrl: "views/frame-rest.html",
                        matches: "" + cmdchar + "schema",
                        exec: ["Server",
                            function (Server) {
                                return function (input, q) {
                                    return Server.console(input.substr(1)).then(function (r) {
                                            var response;
                                            return response = r.data[0],
                                                response.match("Unknown") ? q.reject(error("Unknown action", null, response)) : q.resolve(response)
                                        }),
                                        q.promise
                                }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "play",
                        templateUrl: "views/frame-help.html",
                        matches: "" + cmdchar + "play",
                        exec: ["$http",
                            function ($http) {
                                var step_number;
                                return step_number = 1,
                                    function (input, q) {
                                        var topic, url;
                                        return topic = topicalize(input.slice("play".length + 1)) || "welcome",
                                            url = "content/guides/" + topic + ".html",
                                            $http.get(url).success(function () {
                                                return q.resolve({
                                                    page: url
                                                })
                                            }).error(function () {
                                                return q.reject(error("No such topic to play"))
                                            }),
                                            q.promise
                                    }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "help",
                        templateUrl: "views/frame-help.html",
                        matches: ["" + cmdchar + "help", "" + cmdchar + "man"],
                        exec: ["$http",
                            function ($http) {
                                return function (input, q) {
                                    var topic, url;
                                    return topic = topicalize(input.slice("help".length + 1)) || "help",
                                        url = "content/help/" + topic + ".html",
                                        $http.get(url).success(function () {
                                            return q.resolve({
                                                page: url
                                            })
                                        }).error(function () {
                                            return q.reject(error("No such help topic"))
                                        }),
                                        q.promise
                                }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "account",
                        templateUrl: "views/frame-login.html",
                        matches: ["" + cmdchar + "login"],
                        exec: ["NTN",
                            function (NTN) {
                                return function (input, q) {
                                    return NTN.open().then(q.resolve,
                                            function () {
                                                return q.reject({
                                                    message: "Unable to log in"
                                                })
                                            }),
                                        q.promise
                                }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "account",
                        templateUrl: "views/frame-logout.html",
                        matches: ["" + cmdchar + "logout"],
                        exec: ["NTN",
                            function (NTN) {
                                return function (input, q) {
                                    var p;
                                    return p = NTN.logout(),
                                        p.then(q.resolve,
                                            function () {
                                                return q.reject({
                                                    message: "Unable to log out"
                                                })
                                            }),
                                        q.promise
                                }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "config",
                        templateUrl: "views/frame-config.html",
                        matches: ["" + cmdchar + "config"],
                        exec: ["Settings",
                            function (Settings) {
                                return function (input, q) {
                                    var key, matches, property, value, _ref;
                                    if (matches = /^[^\w]*config\s+([^:]+):?([\S\s]+)?$/.exec(input), null != matches) {
                                        if (_ref = [matches[1], matches[2]], key = _ref[0], value = _ref[1], null != value) {
                                            try {
                                                value = eval(value)
                                            } catch (_error) {}
                                            Settings[key] = value
                                        } else value = Settings[key];
                                        property = {},
                                            property[key] = value,
                                            q.resolve(property)
                                    } else q.resolve(Settings);
                                    return q.promise
                                }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "http",
                        templateUrl: "views/frame-rest.html",
                        matches: ["" + cmdchar + "get", "" + cmdchar + "post", "" + cmdchar + "delete", "" + cmdchar + "put", "" + cmdchar + "head"],
                        exec: ["Server",
                            function (Server) {
                                return function (input, q) {
                                    var data, e, regex, result, url, verb, _ref;
                                    regex = /^[^\w]*(get|GET|put|PUT|post|POST|delete|DELETE|head|HEAD)\s+(\S+)\s*([\S\s]+)?$/i,
                                        result = regex.exec(input);
                                    try {
                                        _ref = [result[1], result[2], result[3]],
                                            verb = _ref[0],
                                            url = _ref[1],
                                            data = _ref[2]
                                    } catch (_error) {
                                        return e = _error,
                                            q.reject(error("Unparseable http request")),
                                            q.promise
                                    }
                                    if (verb = null != verb ? verb.toLowerCase() : void 0, !verb) return q.reject(error("Invalid verb, expected 'GET, PUT, POST, HEAD or DELETE'")),
                                        q.promise;
                                    if (!(null != url ? url.length : void 0) > 0) return q.reject(error("Missing path")),
                                        q.promise;
                                    if (("post" === verb || "put" === verb) && data) try {
                                        JSON.parse(data.replace(/\n/g, ""))
                                    } catch (_error) {
                                        return e = _error,
                                            q.reject(error("Payload does not seem to be valid data.")),
                                            q.promise
                                    }
                                    return "function" == typeof Server[verb] && Server[verb](url, data).then(function (r) {
                                                return q.resolve(r.data)
                                            },
                                            function (r) {
                                                return q.reject(error("Server responded " + r.status))
                                            }),
                                        q.promise
                                }
                            }
                        ]
                    }),
                    FrameProvider.interpreters.push({
                        type: "cypher",
                        matches: function (input) {
                            var pattern;
                            return pattern = new RegExp("^[^" + cmdchar + "]"),
                                input.match(pattern)
                        },
                        templateUrl: "views/frame-cypher.html",
                        exec: ["Cypher", "GraphModel",
                            function (Cypher, GraphModel) {
                                return function (input, q) {
                                    return Cypher.transaction().commit(input).then(function (response) {
                                                return response.size > Settings.maxRows ? q.reject(error("Resultset too large (over " + Settings.maxRows + " rows)")) : q.resolve({
                                                    table: response,
                                                    graph: new GraphModel(response)
                                                })
                                            },
                                            q.reject),
                                        q.promise
                                }
                            }
                        ]
                    })
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("StreamCtrl", ["$scope", "$timeout", "Document", "Frame", "Editor", "motdService",
            function ($scope, $timeout, Document, Frame, Editor, motdService) {
                return $scope.frames = Frame,
                    $scope.motd = motdService
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("LayoutCtrl", ["$rootScope", "$timeout", "$dialog", "Editor", "Frame", "GraphStyle", "Utils",
            function ($scope, $timeout, $dialog, Editor, Frame, GraphStyle, Utils) {
                var check, dialog, dialogOptions, resize, timer, _codeMirror;
                return _codeMirror = null,
                    dialog = null,
                    dialogOptions = {
                        backdrop: !0,
                        backdropClick: !0,
                        backdropFade: !0,
                        dialogFade: !0,
                        keyboard: !0
                    },
                    $scope.showDoc = function () {
                        return Frame.create({
                            input: ":play"
                        })
                    },
                    $scope.showStats = function () {
                        return Frame.create({
                            input: ":schema"
                        })
                    },
                    $scope.focusEditor = function (ev) {
                        return null != ev && ev.preventDefault(),
                            null != _codeMirror ? _codeMirror.focus() : void 0
                    },
                    $scope.codemirrorLoaded = function (_editor) {
                        return _codeMirror = _editor,
                            _codeMirror.focus(),
                            _codeMirror.setValue(" "),
                            _codeMirror.setCursor(1, 1),
                            _codeMirror.setValue(""),
                            _codeMirror.on("change",
                                function (cm) {
                                    return $scope.editorChanged(cm)
                                }),
                            _codeMirror.on("focus",
                                function (cm) {
                                    return $scope.editorChanged(cm)
                                })
                    },
                    $scope.isEditorFocused = function () {
                        return $(".CodeMirror-focused").length > 0
                    },
                    $scope.editor = Editor,
                    $scope.editorOneLine = !0,
                    $scope.editorChanged = function (codeMirror) {
                        return $scope.editorOneLine = 1 === codeMirror.lineCount(),
                            $scope.disableHighlighting = ":" === codeMirror.getValue().trim()[0]
                    },
                    $scope.isDrawerShown = !0,
                    $scope.whichDrawer = "database",
                    $scope.toggleDrawer = function (selectedDrawer, state) {
                        return null == selectedDrawer && (selectedDrawer = ""),
                            null == state && (state = !$scope.isDrawerShown || selectedDrawer !== $scope.whichDrawer),
                            $scope.isDrawerShown = state,
                            $scope.whichDrawer = selectedDrawer
                    },
                    $scope.$watch("isDrawerShown",
                        function () {
                            return $timeout(function () {
                                return $scope.$emit("layout.changed", 0)
                            })
                        }),
                    $scope.isInspectorShown = !1,
                    $scope.toggleInspector = function () {
                        $scope.selectedGraphItem = null;
                        return $scope.isInspectorShown ^= !0;
                    },
                    $scope.$watch("selectedGraphItem", Utils.debounce(function (val) {
                            console.log('POP--->', val);
                            return $scope.isInspectorShown = !!val
                        },
                        200)),
                    $scope.isPopupShown = !1,
                    $scope.togglePopup = function (content) {
                        return null != content ? (null != dialog ? dialog.isOpen() : void 0) || (dialogOptions.templateUrl = "popup-" + content, dialog = $dialog.dialog(dialogOptions), dialog.open().then(function () {
                                return $scope.popupContent = null,
                                    $scope.isPopupShown = !1
                            })) : null != dialog && dialog.close(),
                            $scope.popupContent && dialog.modalEl.removeClass("modal-" + $scope.popupContent),
                            content && dialog.modalEl.addClass("modal-" + content),
                            $scope.popupContent = content,
                            $scope.isPopupShown = !!content
                    },
                    $scope.globalKey = function (e) {
                        return $scope.isPopupShown && 191 !== e.keyCode ? void 0 : (e.metaKey || e.ctrlKey) && 13 === e.keyCode ? (e.preventDefault(), Editor.execCurrent()) : e.ctrlKey && 38 === e.keyCode ? (e.preventDefault(), Editor.historyPrev()) : e.ctrlKey && 40 === e.keyCode ? (e.preventDefault(), Editor.historyNext()) : 27 === e.keyCode ? $scope.isPopupShown ? $scope.togglePopup() : Editor.maximize() : 191 !== e.keyCode || $scope.isEditorFocused() ? void 0 : (e.preventDefault(), $scope.focusEditor())
                    },
                    timer = null,
                    resize = function () {
                        return $("#stream").css({
                                "max-height": $(window).height() - $("#editor").height()
                            }),
                            $scope.$emit("layout.changed")
                    },
                    $(window).resize(resize),
                    (check = function () {
                        return resize(),
                            $timeout.cancel(timer),
                            timer = $timeout(check, 500, !1)
                    })()
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("keydown", ["$parse",
            function ($parse) {
                return {
                    restrict: "A",
                    link: function (scope, elem, attr) {
                        return elem.bind("keydown",
                            function (e) {
                                var exp;
                                return exp = $parse(attr.keydown),
                                    scope.$apply(function () {
                                        return exp(scope, {
                                            $event: e
                                        })
                                    })
                            })
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.filters").filter("uncomment",
            function () {
                return function (input) {
                    var row;
                    return null == input ? "" : function () {
                        var _i, _len, _ref, _results;
                        for (_ref = input.split("\n"), _results = [], _i = 0, _len = _ref.length; _len > _i; _i++) row = _ref[_i],
                            0 !== row.indexOf("//") && _results.push(row);
                        return _results
                    }().join("\n")
                }
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.filters").filter("autotitle",
            function () {
                return function (input) {
                    var firstRow;
                    return null == input ? "" : (firstRow = input.split("\n")[0], 0 === firstRow.indexOf("//") ? firstRow.slice(2) : input)
                }
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.filters").filter("basename",
            function () {
                return function (input) {
                    return null == input ? "" : input.replace(/\\/g, "/").replace(/.*\//, "")
                }
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.filters").filter("dirname",
            function () {
                return function (input) {
                    return null == input ? "" : input.replace(/\\/g, "/").replace(/\/[^\/]*$/, "")
                }
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.filters").filter("neo4jdoc",
            function () {
                return function (input) {
                    return null == input ? "" : input.indexOf("SNAPSHOT") > 0 ? "snapshot" : input
                }
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.filters").filter("humanReadableBytes", [function () {
            return function (input) {
                var number, unit, units, _i, _len;
                if (number = +input, !isFinite(number)) return "-";
                if (1024 > number) return "" + number + " B";
                for (number /= 1024, units = ["KiB", "MiB", "GiB", "TiB"], _i = 0, _len = units.length; _len > _i; _i++) {
                    if (unit = units[_i], 1024 > number) return "" + number.toFixed(2) + " " + unit;
                    number /= 1024
                }
                return "" + number.toFixed(2) + " PiB"
            }
        }])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("Cypher", ["$q", "$rootScope", "Server",
            function ($q, $rootScope, Server) {
                var CypherResult, CypherService, CypherTransaction, parseId, promiseResult;
                return parseId = function (resource) {
                        var id;
                        return null == resource && (resource = ""),
                            id = resource.split("/").slice(-2, -1),
                            parseInt(id, 10)
                    },
                    CypherResult = function () {
                        function CypherResult(_response) {
                            var node, relationship, row, _base, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
                            if (this._response = null != _response ? _response : {},
                                this.nodes = [], this.other = [], this.relationships = [], this.size = 0, this.stats = {},
                                this.size = (null != (_ref = this._response.data) ? _ref.length : void 0) || 0, this._response.stats && this._setStats(this._response.stats), null == (_base = this._response).data && (_base.data = []), null == this._response.data) return this._response;
                            for (_ref1 = this._response.data, _i = 0, _len = _ref1.length; _len > _i; _i++) {
                                for (row = _ref1[_i], _ref2 = row.graph.nodes, _j = 0, _len1 = _ref2.length; _len1 > _j; _j++) node = _ref2[_j],
                                    this.nodes.push(node);
                                for (_ref3 = row.graph.relationships, _k = 0, _len2 = _ref3.length; _len2 > _k; _k++) relationship = _ref3[_k],
                                    this.relationships.push(relationship)
                            }
                            this._response
                        }

                        return CypherResult.prototype.response = function () {
                                return this._response
                            },
                            CypherResult.prototype.rows = function () {
                                var cell, entry, _i, _len, _ref, _results;
                                for (_ref = this._response.data, _results = [], _i = 0, _len = _ref.length; _len > _i; _i++) entry = _ref[_i],
                                    _results.push(function () {
                                        var _j, _len1, _ref1, _results1;
                                        for (_ref1 = entry.row, _results1 = [], _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) cell = _ref1[_j],
                                            _results1.push(null == cell ? null : angular.copy(null != cell.self ? cell.data : cell));
                                        return _results1
                                    }());
                                return _results
                            },
                            CypherResult.prototype.columns = function () {
                                return this._response.columns
                            },
                            CypherResult.prototype.isTextOnly = function () {
                                return 0 === this.nodes.length && 0 === this.relationships.length
                            },
                            CypherResult.prototype._setStats = function (stats) {
                                return this.stats = stats,
                                    null != this.stats ? stats.labels_added > 0 || stats.labels_removed > 0 ? $rootScope.$broadcast("db:changed:labels", angular.copy(this.stats)) : void 0 : void 0
                            },
                            CypherResult
                    }(),
                    promiseResult = function (promise) {
                        var q;
                        return q = $q.defer(),
                            promise.success(function (result) {
                                var r, results, _i, _len, _ref;
                                if (result) {
                                    if (result.errors.length > 0) return q.reject(result.errors);
                                    for (results = [], _ref = result.results, _i = 0, _len = _ref.length; _len > _i; _i++) r = _ref[_i],
                                        results.push(new CypherResult(r));
                                    return q.resolve(results[0])
                                }
                                return q.reject()
                            }).error(q.reject),
                            q.promise
                    },
                    CypherTransaction = function () {
                        function CypherTransaction() {
                            this._reset()
                        }

                        return CypherTransaction.prototype._onSuccess = function () {},
                            CypherTransaction.prototype._onError = function () {},
                            CypherTransaction.prototype._reset = function () {
                                return this.id = null
                            },
                            CypherTransaction.prototype.begin = function (query) {
                                var q, statements, _this = this;
                                return statements = query ? [{
                                        statement: query
                                    }] : [],
                                    q = $q.defer(),
                                    Server.transaction({
                                        path: "",
                                        statements: statements
                                    }).success(function (r) {
                                            return _this.id = parseId(r.data.commit),
                                                q.resolve(r)
                                        },
                                        function (r) {
                                            return q.reject(r)
                                        }),
                                    promiseResult(q.promise)
                            },
                            CypherTransaction.prototype.execute = function (query) {
                                return this.id ? promiseResult(Server.transaction({
                                    path: "/" + this.id,
                                    statements: [{
                                        statement: query
                                    }]
                                })) : this.begin(query)
                            },
                            CypherTransaction.prototype.commit = function (query) {
                                var q, statements, _this = this;
                                return statements = query ? [{
                                        statement: query
                                    }] : [],
                                    this.id ? (q = $q.defer(), Server.transaction({
                                        path: "/" + this.id + "/commit",
                                        statements: statements
                                    }).success(function (r) {
                                            return _this._reset(),
                                                q.resolve(r)
                                        },
                                        function (r) {
                                            return q.reject(r)
                                        }), promiseResult(q.promise)) : promiseResult(Server.transaction({
                                        path: "/commit",
                                        statements: statements
                                    }))
                            },
                            CypherTransaction.prototype.rollback = function () {
                                var _this = this;
                                return this.id ? Server.transaction({
                                    method: "DELETE",
                                    path: "/" + this.id
                                }).success(function () {
                                    return _this._reset()
                                }) : void 0
                            },
                            CypherTransaction
                    }(),
                    CypherService = function () {
                        function CypherService() {}

                        return CypherService.prototype.profile = function (query) {
                                var q;
                                return q = $q.defer(),
                                    Server.cypher("?profile=true", {
                                        query: query
                                    }).success(function (r) {
                                        return q.resolve(r.plan)
                                    }).error(q.reject),
                                    q.promise
                            },
                            CypherService.prototype.send = function (query) {
                                return this.transaction().commit(query)
                            },
                            CypherService.prototype.transaction = function () {
                                return new CypherTransaction
                            },
                            CypherService
                    }(),
                    window.Cypher = new CypherService
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("Collection", [function () {
            var Collection;
            return Collection = function () {
                function Collection(items, _model) {
                    this._model = _model,
                        this._reset(),
                        null != items && this.add(items)
                }

                return Collection.prototype.add = function (items, opts) {
                        var i, itemsToAdd, _i, _len;
                        if (null == opts && (opts = {}), null != items) {
                            for (items = angular.isArray(items) ? items : [items], itemsToAdd = [], _i = 0, _len = items.length; _len > _i; _i++) i = items[_i], !this._model || i instanceof this._model || (i = new this._model(i)),
                                null == i || this.get(i) || (this._byId[null != i.id ? i.id : i] = i, itemsToAdd.push(i));
                            return itemsToAdd.length && (angular.isNumber(opts.at) ? [].splice.apply(this.items, [opts.at, 0].concat(itemsToAdd)) : [].push.apply(this.items, itemsToAdd), this.length += itemsToAdd.length),
                                this
                        }
                    },
                    Collection.prototype.all = function () {
                        return this.items
                    },
                    Collection.prototype.first = function () {
                        return this.items[0]
                    },
                    Collection.prototype.get = function (id) {
                        return null == id ? void 0 : (id = null != id.id ? id.id : id, this._byId[id])
                    },
                    Collection.prototype.indexOf = function (item) {
                        return this.items.indexOf(item)
                    },
                    Collection.prototype.last = function () {
                        return this.items[this.length - 1]
                    },
                    Collection.prototype.next = function (item) {
                        var idx;
                        return idx = this.indexOf(item),
                            null != idx ? this.items[++idx] : void 0
                    },
                    Collection.prototype.remove = function (items) {
                        var index, item, itemsToRemove, _i, _len;
                        for (itemsToRemove = angular.isArray(items) ? items : [items], _i = 0, _len = itemsToRemove.length; _len > _i; _i++) item = itemsToRemove[_i],
                            item = this.get(item),
                            item && (delete this._byId[item.id], index = this.items.indexOf(item), this.items.splice(index, 1), this.length--);
                        return items
                    },
                    Collection.prototype.reset = function (items) {
                        return this._reset(),
                            this.add(items)
                    },
                    Collection.prototype.pluck = function (attr) {
                        var i, _i, _len, _ref, _results;
                        if (!angular.isString(attr)) return void 0;
                        for (_ref = this.items, _results = [], _i = 0, _len = _ref.length; _len > _i; _i++) i = _ref[_i],
                            _results.push(i[attr]);
                        return _results
                    },
                    Collection.prototype.prev = function (item) {
                        var idx;
                        return idx = this.indexOf(item),
                            null != idx ? this.items[--idx] : void 0
                    },
                    Collection.prototype.where = function (attrs) {
                        var item, key, matches, numAttrs, rv, val, _i, _len, _ref;
                        if (rv = [], !angular.isObject(attrs)) return rv;
                        for (numAttrs = Object.keys(attrs).length, _ref = this.items, _i = 0, _len = _ref.length; _len > _i; _i++) {
                            item = _ref[_i],
                                matches = 0;
                            for (key in attrs) val = attrs[key],
                                item[key] === val && matches++;
                            numAttrs === matches && rv.push(item)
                        }
                        return rv
                    },
                    Collection.prototype.save = function () {
                        return this._model || angular.isFunction(this._model.save) ? (this._model.save(this.all()), this) : void 0
                    },
                    Collection.prototype.fetch = function () {
                        return this._model || angular.isFunction(this._model.fetch) ? (this.reset(this._model.fetch()), this) : void 0
                    },
                    Collection.prototype._reset = function () {
                        return this.items = [],
                            this._byId = {},
                            this.length = 0
                    },
                    Collection
            }()
        }])
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty;
        angular.module("neo4jApp.services").factory("GraphModel", ["Node", "Relationship", "unknownNodeService",
            function (Node, Relationship, unknownNodeService) {
                var GraphModel, malformed;
                return GraphModel = function () {
                        function GraphModel(cypher) {
                            var node, relationship, _i, _j, _len, _len1, _ref, _ref1;
                            for (this.nodeMap = {},
                                this.relationshipMap = {},
                                _ref = cypher.nodes, _i = 0, _len = _ref.length; _len > _i; _i++) node = _ref[_i],
                                this.addNode(node);
                            for (_ref1 = cypher.relationships, _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) relationship = _ref1[_j],
                                this.addRelationship(relationship)
                        }

                        return GraphModel.prototype.nodes = function () {
                                var key, value, _ref, _results;
                                _ref = this.nodeMap,
                                    _results = [];
                                for (key in _ref) __hasProp.call(_ref, key) && (value = _ref[key], _results.push(value));
                                return _results
                            },
                            GraphModel.prototype.relationships = function () {
                                var key, value, _ref, _results;
                                _ref = this.relationshipMap,
                                    _results = [];
                                for (key in _ref) __hasProp.call(_ref, key) && (value = _ref[key], _results.push(value));
                                return _results
                            },
                            GraphModel.prototype.addNode = function (raw) {
                                var _base, _name;
                                if ((_base = this.nodeMap)[_name = raw.id]) {
                                    return (_base = this.nodeMap)[_name = raw.id];
                                } else {
                                    return _base[_name] = new Node(raw.id, raw.labels, raw.properties);
                                }
                                //return (_base = this.nodeMap)[_name = raw.id] || (_base[_name] = new Node(raw.id, raw.labels, raw.properties))
                            },
                            GraphModel.prototype.addNodeWithUnknown = function (raw, actionType) {
                                var _base, _name;
                                if ((_base = this.nodeMap)[_name = raw.id]) {
                                    return (_base = this.nodeMap)[_name = raw.id];
                                } else {
                                    unknownNodeService.addUnknownNode(raw.id, raw.labels, raw.properties);
                                    console.log('RAW--->', raw);
                                    //raw.properties = {};
                                    if (actionType == 'discover') {
                                        raw.labels = ['Unknown'];
                                        raw.properties = {};
                                    }
                                    _base[_name] = new Node(raw.id, raw.labels, raw.properties);
                                    return _base[_name];
                                }
                                //return (_base = this.nodeMap)[_name = raw.id] || (_base[_name] = new Node(raw.id, raw.labels, raw.properties))
                            },
                            GraphModel.prototype.addRelationship = function (raw) {
                                var source, target;
                                return source = this.nodeMap[raw.startNode] ||
                                    function () {
                                        throw malformed()
                                    }(),
                                    target = this.nodeMap[raw.endNode] ||
                                    function () {
                                        throw malformed()
                                    }(),
                                    this.relationshipMap[raw.id] = new Relationship(raw.id, source, target, raw.type, raw.properties)
                            },
                            GraphModel.prototype.removeRelationshipById = function (relationShipId) {
                                delete this.relationshipMap[relationShipId];
                            },
                            GraphModel.prototype.removeNodeById = function (nodeId) {
                                delete this.nodeMap[nodeId];
                            },
                            GraphModel.prototype.getNodeById = function (nodeId) {
                                return this.nodeMap[nodeId];
                            },
                            GraphModel.prototype.getRelationshipById = function (relationShipId) {
                                return this.relationshipMap[relationShipId];
                            },
                            GraphModel.prototype.merge = function (result) {
                                var n, _i, _len, _ref;
                                for (_ref = result.nodes, _i = 0, _len = _ref.length; _len > _i; _i++) n = _ref[_i],
                                    this.addNode(n);
                                return this.addRelationships(result.relationships)
                            },
                            GraphModel.prototype.mergeWithUnknown = function (result, actionType) {
                                var n, _i, _len, _ref;
                                for (_ref = result.nodes, _i = 0, _len = _ref.length; _len > _i; _i++) {
                                    n = _ref[_i],
                                        this.addNodeWithUnknown(n, actionType);
                                }
                                return this.addRelationships(result.relationships)
                            },
                            GraphModel.prototype.addRelationships = function (relationships) {
                                var r, _i, _len, _results;
                                for (_results = [], _i = 0, _len = relationships.length; _len > _i; _i++) r = relationships[_i],
                                    _results.push(this.addRelationship(r));
                                return _results
                            },
                            GraphModel.prototype.boundingBox = function () {
                                var accessor, axes, bounds, key;
                                axes = {
                                        x: function (node) {
                                            return node.x
                                        },
                                        y: function (node) {
                                            return node.y
                                        }
                                    },
                                    bounds = {};
                                for (key in axes) accessor = axes[key],
                                    bounds[key] = {
                                        min: Math.min.apply(null, this.nodes().map(function (node) {
                                            return accessor(node) - node.radius
                                        })),
                                        max: Math.max.apply(null, this.nodes().map(function (node) {
                                            return accessor(node) + node.radius
                                        }))
                                    };
                                return bounds
                            },
                            GraphModel
                    }(),
                    malformed = function () {
                        return new Error("Malformed graph: must add nodes before relationships that connect them")
                    },
                    GraphModel
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module('neo4jApp.services').service('unknownNodeService', function () {
            var unknownNodeList = [];
            this.addUnknownNode = function (id, labels, properties) {
                var item = {};
                item = {
                    id: id,
                    labels: labels,
                    properties: properties
                }
                unknownNodeList.push(item);
            }

            this.getUnknownNodeList = function () {
                return unknownNodeList;
            }

            this.getUnknownNodeById = function (id) {
                for (var i = 0; i < unknownNodeList.length; i++) {
                    if (id == unknownNodeList[i].id) {
                        return unknownNodeList[i];
                    }
                }
            }
        })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("Timer",
            function () {
                var Timer, TimerService, currentTime;
                return currentTime = function () {
                        return (new Date).getTime()
                    },
                    Timer = function () {
                        function Timer() {
                            this._start = null,
                                this._end = null
                        }

                        return Timer.prototype.isRunning = function () {
                                return null != this._start
                            },
                            Timer.prototype.start = function () {
                                return null == this._start && (this._start = currentTime()),
                                    this
                            },
                            Timer.prototype.started = function () {
                                return this._start
                            },
                            Timer.prototype.stop = function () {
                                return null == this._end && (this._end = currentTime()),
                                    this
                            },
                            Timer.prototype.stopped = function () {
                                return this._end
                            },
                            Timer.prototype.time = function () {
                                var end;
                                return null == this._start ? 0 : (end = this._end || currentTime(), end - this._start)
                            },
                            Timer
                    }(),
                    new(TimerService = function () {
                        function TimerService() {}

                        var timers;
                        return timers = {},
                            TimerService.prototype["new"] = function (name) {
                                return null == name && (name = "default"),
                                    timers[name] = new Timer
                            },
                            TimerService.prototype.start = function (name) {
                                var timer;
                                return null == name && (name = "default"),
                                    timer = this["new"](name),
                                    timer.start()
                            },
                            TimerService.prototype.stop = function (name) {
                                return null == name && (name = "default"),
                                    null == timers[name] ? void 0 : timers[name].stop()
                            },
                            TimerService.prototype.currentTime = currentTime,
                            TimerService
                    }())
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("focusOn", ["$timeout",
            function ($timeout) {
                return function (scope, element, attrs) {
                    return scope.$watch(attrs.focusOn,
                        function (val) {
                            return val ? $timeout(function () {
                                    return element[0].focus()
                                },
                                0, !1) : void 0
                        })
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("CSV", [function () {
            var Serializer;
            return Serializer = function () {
                function Serializer(opts) {
                    null == opts && (opts = {}),
                        this.options = angular.extend(opts, {
                            delimiter: ","
                        }),
                        this._output = "",
                        this._columns = null
                }

                return Serializer.prototype.append = function (row) {
                        var cell, _ref;
                        if (!angular.isArray(row) && row.length === (null != (_ref = this._columns) ? _ref.length : void 0)) throw "CSV: Row must an Array of column size";
                        return this._output += "\n",
                            this._output +=
                            function () {
                                var _i, _len, _results;
                                for (_results = [], _i = 0, _len = row.length; _len > _i; _i++) cell = row[_i],
                                    _results.push(this._escape(cell));
                                return _results
                            }.call(this).join(this.options.delimiter)
                    },
                    Serializer.prototype.columns = function (cols) {
                        var c;
                        if (null == cols) return this._columns;
                        if (!angular.isArray(cols)) throw "CSV: Columns must an Array";
                        return this._columns = function () {
                                var _i, _len, _results;
                                for (_results = [], _i = 0, _len = cols.length; _len > _i; _i++) c = cols[_i],
                                    _results.push(this._escape(c));
                                return _results
                            }.call(this),
                            this._output = this._columns.join(this.options.delimiter)
                    },
                    Serializer.prototype.output = function () {
                        return this._output
                    },
                    Serializer.prototype._escape = function (string) {
                        return angular.isString(string) || (string = JSON.stringify(string)),
                            (string.indexOf(this.options.delimiter) > 0 || string.indexOf('"') >= 0) && (string = '"' + string.replace(/"/g, '""') + '"'),
                            string
                    },
                    Serializer
            }(), {
                Serializer: Serializer
            }
        }])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp").directive("resizable", [function () {
            return {
                controller: function () {
                    var startCallbacks, stopCallbacks;
                    return startCallbacks = [],
                        stopCallbacks = [],
                        this.onStart = function (func) {
                            return startCallbacks.push(func)
                        },
                        this.onStop = function (func) {
                            return stopCallbacks.push(func)
                        },
                        this.start = function (amount) {
                            var callback, _i, _len, _results;
                            for (_results = [], _i = 0, _len = startCallbacks.length; _len > _i; _i++) callback = startCallbacks[_i],
                                _results.push(callback.call(void 0, amount));
                            return _results
                        },
                        this.stop = function () {
                            var callback, _i, _len, _results;
                            for (_results = [], _i = 0, _len = stopCallbacks.length; _len > _i; _i++) callback = stopCallbacks[_i],
                                _results.push(callback.call(void 0));
                            return _results
                        }
                }
            }
        }]).directive("resize",
            function () {
                return {
                    require: "^resizable",
                    link: function (scope, element, attrs, resizableCtrl) {
                        var initialValue, property;
                        return property = attrs.resize,
                            initialValue = +element.css(property).slice(0, -2),
                            resizableCtrl.onStart(function (amount) {
                                return element[0].style[property] = "" + (initialValue + amount) + "px"
                            }),
                            resizableCtrl.onStop(function () {
                                return initialValue = +element[0].style[property].slice(0, -2)
                            })
                    }
                }
            }).directive("resizeChild",
            function () {
                return {
                    require: "^resizable",
                    link: function (scope, element, attrs, resizableCtrl) {
                        var child, initialValue, property;
                        return attrs = scope.$eval(attrs.resizeChild),
                            child = Object.keys(attrs)[0],
                            property = attrs[child],
                            initialValue = null,
                            resizableCtrl.onStart(function (amount) {
                                return initialValue || (initialValue = +$(child, element).css(property).slice(0, -2)),
                                    $(child, element).css(property, "" + (initialValue + amount) + "px")
                            }),
                            resizableCtrl.onStop(function () {
                                return initialValue = +element[0].style[property].slice(0, -2)
                            })
                    }
                }
            }).directive("handle",
            function () {
                return {
                    require: "^resizable",
                    link: function (scope, element, attrs, resizableCtrl) {
                        return element.bind("mousedown",
                            function (e) {
                                var initialValue, lastValue;
                                return e.preventDefault(),
                                    initialValue = lastValue = e.clientY,
                                    angular.element(document).bind("mousemove",
                                        function (e) {
                                            var mousePos, newValue;
                                            return mousePos = e.clientY,
                                                newValue = element[0].clientHeight - (lastValue - mousePos),
                                                lastValue = mousePos,
                                                resizableCtrl.start(lastValue - initialValue)
                                        }),
                                    angular.element(document).bind("mouseup",
                                        function () {
                                            return angular.element(document).unbind("mousemove"),
                                                angular.element(document).unbind("mouseup"),
                                                resizableCtrl.stop()
                                        })
                            })
                    }
                }
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").controller("fileUpload", ["$attrs", "$parse", "$rootScope", "$scope", "$window",
                function ($attrs, $parse, $rootScope, $scope, $window) {
                    var INITIAL_STATUS, getFirstFileFromEvent, onUploadSuccess, scopeApply, _this = this;
                    return INITIAL_STATUS = $attrs.message || "Drop Cypher script file to import",
                        $scope.status = INITIAL_STATUS,
                        onUploadSuccess = function (content) {
                            var exp;
                            return $attrs.upload ? (exp = $parse($attrs.upload), $scope.$apply(function () {
                                return exp($scope, {
                                    $content: content
                                })
                            })) : void 0
                        },
                        getFirstFileFromEvent = function (evt) {
                            var files;
                            return files = evt.originalEvent.dataTransfer.files,
                                files[0]
                        },
                        scopeApply = function (fn) {
                            return function () {
                                return fn.apply($scope, arguments),
                                    $scope.$apply()
                            }
                        },
                        this.onDragEnter = scopeApply(function (evt) {
                            return getFirstFileFromEvent(evt),
                                $scope.active = !0
                        }),
                        this.onDragLeave = scopeApply(function () {
                            return $scope.active = !1
                        }),
                        this.onDrop = scopeApply(function (evt) {
                            var file, reg;
                            return _this.preventDefault(evt),
                                $scope.active = !1,
                                file = getFirstFileFromEvent(evt), !file || $attrs.type && file.type.indexOf($attrs.type) < 0 ? void 0 : $attrs.extension && (reg = new RegExp($attrs.extension + "$"), !file.name.match(reg)) ? alert("Only ." + $attrs.extension + " files are supported") : ($scope.status = "Uploading...", _this.readFile(file))
                        }),
                        this.preventDefault = function (evt) {
                            return evt.stopPropagation(),
                                evt.preventDefault()
                        },
                        this.readFile = function (file) {
                            var reader;
                            return reader = new $window.FileReader,
                                reader.onerror = scopeApply(function (evt) {
                                    return $scope.status = function () {
                                            switch (evt.target.error.code) {
                                                case 1:
                                                    return "" + file.name + " not found.";
                                                case 2:
                                                    return "" + file.name + " has changed on disk, please re-try.";
                                                case 3:
                                                    return "Upload cancelled.";
                                                case 4:
                                                    return "Cannot read " + file.name;
                                                case 5:
                                                    return "File too large for browser to upload."
                                            }
                                        }(),
                                        $rootScope.$broadcast("fileUpload:error", $scope.error)
                                }),
                                reader.onloadend = scopeApply(function (evt) {
                                    var data;
                                    return data = evt.target.result,
                                        data = data.split("base64,")[1],
                                        onUploadSuccess($window.atob(data)),
                                        $scope.status = INITIAL_STATUS
                                }),
                                reader.readAsDataURL(file)
                        },
                        this
                }
            ]),
            angular.module("neo4jApp.directives").directive("fileUpload", ["$window",
                function ($window) {
                    return {
                        controller: "fileUpload",
                        restrict: "E",
                        scope: "@",
                        transclude: !0,
                        template: '<div class="file-drop-area" ng-class="{active: active}" ng-bind="status"></div>',
                        link: function (scope, element, attrs, ctrl) {
                            return $window.FileReader && $window.atob ? (element.bind("dragenter", ctrl.onDragEnter), element.bind("dragleave", ctrl.onDragLeave), element.bind("drop", ctrl.onDrop), element.bind("dragover", ctrl.preventDefault), element.bind("drop")) : void 0
                        }
                    }
                }
            ])
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty;
        angular.module("neo4jApp.directives").directive("neoTable", [function () {
            return {
                replace: !0,
                restrict: "E",
                link: function (scope, elm, attr) {
                    var cell2html, entityMap, escapeHtml, json2html, render, unbind;
                    return entityMap = {
                            "&": "&amp;",
                            "<": "&lt;",
                            ">": "&gt;",
                            '"': "&quot;",
                            "'": "&#39;",
                            "/": "&#x2F;"
                        },
                        escapeHtml = function (string) {
                            return String(string).replace(/[&<>"'\/]/g,
                                function (s) {
                                    return entityMap[s]
                                })
                        },
                        unbind = scope.$watch(attr.tableData,
                            function (result) {
                                return result ? (elm.html(render(result)), unbind()) : void 0
                            }),
                        json2html = function (obj) {
                            var html, k, v;
                            html = "<table class='json-object'><tbody>";
                            for (k in obj) __hasProp.call(obj, k) && (v = obj[k], html += "<tr><th>" + k + "</th><td>" + cell2html(v) + "</td></tr>");
                            return html += "</tbody></table>"
                        },
                        cell2html = function (cell) {
                            var el;
                            return angular.isString(cell) ? escapeHtml(cell) : angular.isArray(cell) ?
                                function () {
                                    var _i, _len, _results;
                                    for (_results = [], _i = 0, _len = cell.length; _len > _i; _i++) el = cell[_i],
                                        _results.push(cell2html(el));
                                    return _results
                                }().join(", ") : angular.isObject(cell) ? json2html(cell) : escapeHtml(JSON.stringify(cell))
                        },
                        render = function (result) {
                            var cell, col, html, row, rows, _i, _j, _k, _len, _len1, _len2, _ref;
                            if (rows = result.rows(), !rows.length) return "";
                            for (html = "<table class='table data'>", html += "<thead><tr>", _ref = result.columns(), _i = 0, _len = _ref.length; _len > _i; _i++) col = _ref[_i],
                                html += "<th>" + col + "</th>";
                            for (html += "</tr></thead>", html += "<tbody>", _j = 0, _len1 = rows.length; _len1 > _j; _j++) {
                                for (row = rows[_j], html += "<tr>", _k = 0, _len2 = row.length; _len2 > _k; _k++) cell = row[_k],
                                    html += "<td>" + cell2html(cell) + "</td>";
                                html += "</tr>"
                            }
                            return html += "</tbody>",
                                html += "</table>"
                        }
                }
            }
        }])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("neoGraph", [function () {
            return {
                require: "ngController",
                restrict: "A",
                link: function (scope, elm, attr, ngCtrl) {
                    var unbind;
                    return unbind = scope.$watch(attr.graphData,
                        function (graph) {
                            return graph ? (ngCtrl.render(graph), unbind()) : void 0
                        })
                }
            }
        }])
    }.call(this),
    function () {
        "use strict";
        var clickcancel;
        clickcancel = function () {
                var cc, event;
                return cc = function (selection) {
                        var dist, down, last, tolerance, wait;
                        return dist = function (a, b) {
                                return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2))
                            },
                            down = void 0,
                            tolerance = 5,
                            last = void 0,
                            wait = null,
                            selection.on("mousedown",
                                function () {

                                    //========== LS BEGIN========
                                    //To avoid checkbox
                                    if (d3.event.target.attributes != null && d3.event.target.attributes["type"] != null)
                                        return;
                                    //========== LS END ========
                                    return d3.event.target.__data__.fixed = !0,
                                        down = d3.mouse(document.body),
                                        last = +new Date
                                }),
                            selection.on("mouseup",
                                function () {
                                    //========== LS BEGIN========
                                    //To avoid checkbox
                                    if (d3.event.target.attributes != null && d3.event.target.attributes["type"] != null)
                                        return;
                                    //========== LS END ========
                                    var holdPeriod = new Date - last;
                                    if (dist(down, d3.mouse(document.body)) > tolerance) {
                                        //d3.event.target.__data__.fixed = !0;
                                    } else {

                                        //if (holdPeriod>200 && (d3.event.target.__data__.fixed == 7 || d3.event.target.__data__.fixed==3)){
                                        //    d3.event.target.__data__.fixed = 6;
                                        //    return;
                                        //}
                                        if (holdPeriod > 200) {
                                            return event.ltclick(d3.event.target.__data__),
                                                wait = null
                                        }

                                        if (wait) {
                                            (window.clearTimeout(wait), wait = null, event.dblclick(d3.event.target.__data__));
                                        } else {
                                            wait = window.setTimeout(function (e) {
                                                return function () {
                                                    return event.click(e.target.__data__),
                                                        wait = null
                                                }
                                            }(d3.event), 250);
                                        }
                                    }
                                    //return dist(down, d3.mouse(document.body)) > tolerance ? void 0 : wait ? (window.clearTimeout(wait), wait = null, event.dblclick(d3.event.target.__data__)) : wait = window.setTimeout(function (e) {
                                    //    return function () {
                                    //        return event.click(e.target.__data__),
                                    //            wait = null
                                    //    }
                                    //}(d3.event), 250)
                                })
                    },
                    event = d3.dispatch("click", "dblclick", "ltclick"),
                    d3.rebind(cc, event, "on")
            },
            angular.module("neo4jApp.controllers").controller("D3GraphCtrl", ["$element", "$window", "$rootScope", "$scope", "$http", "CircularLayout", "GraphExplorer", "GraphRenderer", "GraphStyle", "GraphGeometry", "GraphDisplay",
                function ($element, $window, $rootScope, $scope, $http, CircularLayout, GraphExplorer, GraphRenderer, GraphStyle, GraphGeometry, GraphDisplay) {
                    var changeTimeLine, selectedGraph, showSelecter, accelerateLayout, clickHandler, el, force, graph, linkDistance, hideAllCheckbox, getAllPoolNeighbourAndRelations, getUncheckedPoolNeighbourAndRelations, onNodeClick, onNodeLTClick, discoverCommonFriends, printSelectedNode, onNodeDblClick, onRelationshipClick, render, resize, selectItem, selectedItem, toggleSelection, _this = this;
                    $scope.showTracks = false;
                    $scope.showMenu = false;
                    $scope.isMultipleSelect = false;
                    $scope.showSelecter = true;
                    $scope.location = {};
                    $scope.location.x1 = 0;
                    $scope.location.y1 = 0;
                    $scope.location.x2 = 0;
                    $scope.location.y2 = 0;
                    $rootScope.selectedNode = null;
                    $scope.selectStatus = {};
                    $scope.selectStatus.isMoving = false;
                    $scope.selectStatus.isHover = false;

                    $scope.$watch("graph.relationships().length", function (len) {
                        //                    	if(len&&len>0){
                        //                    		changeTimeLine();
                        //                    	}
                        //                    	console.log(len,graph);
                    });

                    changeTimeLine = function () {
                        $scope.$emit("timeLine:change", graph);
                    };

                    //轨迹展示测试
                    $scope.testAnimateFun = function () {
                        var relGroups = el.select("g.layer.relationships").selectAll("g.relationship");

                        relGroups.selectAll('circle').data(function (rel) {
                            if (rel.type == 'telecom' || rel.type == 'transform')
                                return [rel];
                            else
                                return [];
                        }).attr({
                            display: function (rel) {
                                if (rel.enable && $scope.showTracks)
                                    return "block";
                                else
                                    return "none";
                            }
                        });
                    };
                    $scope.$on("reDrawTimeLine", function () {
                        $scope.testAnimateFun();
                    });
                    $scope.$on("changeTracksShow", function (event, tracks) {
                        $scope.showTracks = tracks;
                        $scope.testAnimateFun();
                    });
                    //对在选中区域的关系及其节点添加禁用效果
                    $scope.$on("disableUnInRangeRelations", function (event, rangeData) {

                        if (graph) {
                            for (var i = 0; i < graph.relationships().length; i++) {
                                graph.relationships()[i].enable = false;
                            }
                            for (var i = 0; i < graph.nodes().length; i++) {
                                graph.nodes()[i].enable = false;
                            }
                            if (rangeData) {
                                for (var i = 0; i < graph.relationships().length; i++) {
                                    var rel = graph.relationships()[i];
                                    if (rel.type == "telecom" || rel.type == "transform") {
                                        var date = new Date(rel.propertyMap.datetime);
                                        if (date >= rangeData[0].getTime() && date <= rangeData[1].getTime()) {
                                            //                                             graph.removeRelationshipById(graph.relationships()[i].id);
                                            graph.getRelationshipById(graph.relationships()[i].id).enable = true;
                                            graph.getNodeById(graph.relationships()[i].target.id).enable = true;
                                            graph.getNodeById(graph.relationships()[i].source.id).enable = true;
                                            //                                             resultRelations.push(graph.relationships()[i]);
                                        }
                                    } else {
                                        graph.getRelationshipById(graph.relationships()[i].id).enable = true;
                                        graph.getNodeById(graph.relationships()[i].target.id).enable = true;
                                        graph.getNodeById(graph.relationships()[i].source.id).enable = true;
                                    }
                                    //                                              console.log(graph.relationshipMap[graph.relationships()[i].id]);
                                    //                                          if(graph.relationships()[i].testData!=undefined){
                                    //                                                 var date = graph.relationships()[i].testData[1].date;
                                    //                                                 if(date>= rangeData[0].getTime()&&date<=rangeData[1].getTime()){
                                    ////                                                     graph.removeRelationshipById(graph.relationships()[i].id);
                                    //                                                       graph.getRelationshipById(graph.relationships()[i].id).enable = true;
                                    //                                                       graph.getNodeById(graph.relationships()[i].target.id).enable = true;
                                    //                                                       graph.getNodeById(graph.relationships()[i].source.id).enable = true;
                                    ////                                                     resultRelations.push(graph.relationships()[i]);
                                    //                                                }
                                    //                                         }
                                }
                            } else {
                                for (var i = 0; i < graph.relationships().length; i++) {
                                    graph.getRelationshipById(graph.relationships()[i].id).enable = true;
                                }
                                for (var i = 0; i < graph.nodes().length; i++) {
                                    graph.getNodeById(graph.nodes()[i].id).enable = true;
                                }
                            }

                            //置灰未选中关系
                            d3.select($element[0]).selectAll("g.relationship").selectAll('text').data(function (rel) {
                                return [rel]
                            }).attr("fill", function (rel) {
                                if (rel.enable) {
                                    return "#000000";
                                } else {
                                    return "#e5e5e5";
                                }
                            });
                            d3.select($element[0]).selectAll("g.relationship").selectAll('path').data(function (rel) {
                                return [rel]
                            }).attr("fill", function (rel) {
                                if (rel.enable) {
                                    return GraphStyle.forRelationship(rel).get("color");
                                } else {
                                    return "#e5e5e5";
                                }
                            }).attr("stroke", "none");

                            //隐藏未选中轨迹
                            var relGroups = el.select("g.layer.relationships").selectAll("g.relationship");
                            relGroups.selectAll('circle').data(function (rel) {
                                if (rel.type == 'telecom' || rel.type == 'transform')
                                    return [rel];
                                else
                                    return [];
                            }).attr({
                                display: function (rel) {
                                    if (rel.enable && $scope.showTracks)
                                        return "block";
                                    else
                                        return "none";
                                }
                            });

                            //置灰未选中节点
                            d3.select($element[0]).selectAll("g.node").selectAll("circle.outline").data(function (node) {
                                return [node]
                            }).attr({
                                r: function (node) {
                                    return node.radius
                                },
                                opacity: function (node) {
                                    if (node.enable) {
                                        return null;
                                    }
                                    return 0.9;
                                },
                                fill: function (node) {
                                    if (node.enable) {
                                        return GraphStyle.forNode(node).get("color");
                                    } else {
                                        return "#e5e5e5";
                                    }
                                },
                                stroke: function (node) {
                                    if (node.enable) {
                                        return GraphStyle.forNode(node).get("border-color")
                                    } else {
                                        return "#e5e5e5";
                                    }
                                },
                                "stroke-width": function (node) {
                                    return GraphStyle.forNode(node).get("border-width")
                                }
                            });
                        }
                    });

                    //移除未在选中区间的关系及节点。
                    $scope.$on("removeUnInRangeRelations", function (event, rangeData) {
                        //                    	$('body').append("<div style='background-color:#bcbcbc;width:"+$(window).width()+"px;height:"+$(window).height()+"px;position: absolute;top: 0;left: 0;opacity: 0.58;z-index: 100000;'><i class='fa fa-spinner fa-spin fa-5x' style='color: black; top: 30%;    left: 50%;   position: absolute;'></i></div>");
                        //                    	return;
                        //                      var drag = d3.behavior.drag()
                        //                        .on( "dragstart", function (){
                        //                            return;
                        //                        });
                        //                           d3.select($element[0]).selectAll("g.node").attr("xxxx",function(node){
                        //                                console.log(node);
                        //                                return "1";
                        //                         }).call(function(d,i){
                        //                                if(d.id != 319)
                        //                                       return drag;
                        //                         });//.call(drag);
                        //                           d3.select($element[0]).selectAll("g.relationship").selectAll('g').on("click",null);
                        //                           d3.select($element[0]).selectAll("g.relationship").selectAll( 'path').data( function(rel){
                        //                            return [rel]
                        //                     }).attr( "fill",function (rel) {
                        //                           rel.enable = false;
                        //                            return "#acb6b7" ;
                        //                        }).attr( "stroke", "none" );
                        //                           d3.select($element[0]).selectAll("g.node").selectAll( "circle.outline").data(function (node) {
                        //                            return [node]
                        //                        }).attr({
                        //                            r: function (node) {
                        //                                return node.radius
                        //                            },
                        //                            fill: function (node) {
                        //                                  node.enable = false;
                        //                                   if(node.id == 319){
                        //                                         node.enable = true;
                        //                                          return GraphStyle.forNode(node).get("color" );
                        //                                  }
                        //                                return "#acb6b7" ;
                        //                            },
                        //                            stroke: function (node) {
                        //                                return "#acb6b7" ;
                        //                            },
                        //                            "stroke-width": function (node) {
                        //                                return GraphStyle.forNode(node).get("border-width" )
                        //                            }
                        //                        });
                        //                      return;
                        //                     console.log(rangeData);
                        //                      var inRangeDataRelationships = [];
                        //                      var resultRelations = [];
                        var unIns = [];
                        unIns.push([]);
                        unIns.push([]);
                        for (var i = 0; i < graph.relationships().length; i++) {
                            if (!graph.relationships()[i].enable) {
                                unIns[0].push(graph.relationships()[i].id);
                                //                            	graph.removeRelationshipById(graph.relationships()[i].id);
                                //                                   var date = graph.relationships()[i].testDate.date;
                                //                                   if(graph.relationships()[i].testDate.date.getTime()<= rangeData[0].getTime()||graph.relationships()[i].testDate.date.getTime()>=rangeData[1].getTime()){
                                ////                                              graph.removeRelationshipById(graph.relationships()[i].id);
                                //                                         resultRelations.push(graph.relationships()[i]);
                                //                                  }
                            }
                        }
                        for (var i = 0; i < graph.nodes().length; i++) {
                            if (!graph.nodes()[i].enable) {
                                //                    		  graph.removeNodeById(graph.nodes()[i].id);
                                unIns[1].push(graph.nodes()[i].id);
                            }
                        }
                        for (var i = 0; i < unIns.length; i++) {
                            for (var j = 0; j < unIns[i].length; j++) {
                                if (i == 0)
                                    graph.removeRelationshipById(unIns[i][j]);
                                if (i == 1)
                                    graph.removeNodeById(unIns[i][j]);
                            }
                        }
                        //                      for(var i=0;i<resultRelations.length;i++){
                        //                           graph.removeRelationshipById(resultRelations[i].id);
                        //                     }

                        _this.update();
                    });



                    hideAllCheckbox = function () {
                        //hide all checkbox
                        for (var key in graph.nodeMap) {
                            graph.nodeMap[key].shouldHideCheckbox = true;
                        }
                    };
                    var removePoolNeighbour = function (d) {
                        hideAllCheckbox();
                        var poolNeighbourResult = getUncheckedPoolNeighbourAndRelations(d);

                        //remove relationShips
                        for (var key in poolNeighbourResult.relations) {
                            graph.removeRelationshipById(poolNeighbourResult.relations[key].id);
                        }

                        //remove nodes
                        for (var key in poolNeighbourResult.nodes) {
                            graph.removeNodeById(poolNeighbourResult.nodes[key].id);
                        }
                        d.expanded = !1;
                        _this.update();
                    };

                    var hasUncheckedNeighbour = function (d) {
                        var poolNeighbourResult = getAllPoolNeighbourAndRelations(d);
                        for (var key in poolNeighbourResult.nodes) {
                            if (poolNeighbourResult.nodes[key].checkStatus == null || poolNeighbourResult.nodes[key].checkStatus == false)
                                return true;
                        }
                        return false;
                    };
                    $scope.refreshNodeRelations = function () {
                        var nodes = selectedGraph.nodes();
                        $rootScope.showLoading = true;
                        GraphExplorer.refreshNodeRelations(nodes, $scope.graph).then(function () {
                            $rootScope.showLoading = false;
                            _this.update();
                        });

                    };
                    $scope.removeSelectedNodeRelations = function () {
                        var nodes = selectedGraph.nodes();
                        var relations = selectedGraph.relationships();
                        for (var i = 0; i < nodes.length; i++) {
                            for (var j = 0; j < relations.length; j++) {
                                if (relations[j].source == nodes[i] || relations[j].target == nodes[i]) {
                                    $scope.graph.removeRelationshipById(relations[j].id);
                                }
                            }
                            $scope.graph.removeNodeById(nodes[i].id);
                        }
                        _this.update();
                    };
                    $scope.unSelectNode = function () { //反选已选中node
                        var nodes = $scope.graph.nodes();
                        for (var i = 0; i < nodes.length; i++) {
                            nodes[i].selected = false;
                        }
                        var circles;
                        return circles = d3.select($element[0]).selectAll("circle.overlay").data([]),

                            circles.exit().remove()
                    };
                    $scope.selectNode = function () {
                        if ($scope.location.x1 != 0 && $scope.location.x2 != 0 && $scope.location.y1 != 0 && $scope.location.y2 != 0) {
                            $scope.graphCopy = $.extend(true, {}, $scope.graph);
                            var nodes = $scope.graphCopy.nodes();
                            for (var i = 0; i < nodes.length; i++) {
                                if ((nodes[i].x > $scope.location.x1 && nodes[i].y > $scope.location.y1) && (nodes[i].x < $scope.location.x2 && nodes[i].y < $scope.location.y2)) {
                                    console.log("node:" + nodes[i].id + " is in selected area");

                                    //selected
                                    $scope.graph.nodeMap[nodes[i].id].selected = true;
                                } else {
                                    $scope.graphCopy.removeNodeById(nodes[i].id);
                                }
                            }
                            if ($scope.graphCopy.nodes().length == 0) {} else {
                                //                                	  GraphRenderer.nodeRenderers;
                                var nodeGroups = el.select("g.layer.nodes").selectAll("g.node").data(nodes,
                                    function (d) {
                                        return d.id
                                    });
                                var circles;
                                return circles = nodeGroups.selectAll("circle.overlay").data(function (node) {
                                        return node.selected ? [node] : []
                                    }),
                                    circles.enter().insert("circle", ".outline").classed("ring", !0).classed("overlay", !0).attr({
                                        cx: 0,
                                        cy: 0,
                                        fill: "#f5F6F6",
                                        stroke: "#6de7f9",
                                        "stroke-width": "3px"
                                    }),
                                    circles.attr({
                                        r: function (node) {
                                            return node.radius + 6
                                        }
                                    }),
                                    circles.exit().remove();
                                //                                         _this.update();
                            }
                        }
                    };
                    $scope.toggleSelection = function () {
                        var node = selectedGraph.nodes()[0];
                        toggleSelection(node);
                    }
                    $scope.openNodeRelations = function () {
                        var node = selectedGraph.nodes()[0];
                        hideAllCheckbox();
                        $rootScope.showLoading = true;
                        (GraphExplorer.exploreNeighboursWithInternalRelationships(node, graph).then(function () {
                                $rootScope.showLoading = false;
                                return CircularLayout.layout(graph.nodes(), node, linkDistance),
                                    node.expanded = !0,
                                    _this.update()
                            },
                            function (msg) {
                                return alert(msg)
                            }), $rootScope.$$phase ? void 0 : $rootScope.$apply())
                    }
                    $scope.closeNodeRelations = function () {
                        var node = selectedGraph.nodes()[0];
                        removePoolNeighbour(node);
                    }
                    $scope.findRelationsDeep = function () { //发现三级关系
                        $rootScope.showLoading = true;
                        GraphExplorer.exploreCommonFriendsWithInternalRelationshipsBySelectedDeep($scope.graph, selectedGraph, 'discover').then(function () {
                            $rootScope.showLoading = false;
                            _this.update();
                        }, function (msg) {
                            return alert(msg);
                        });
                    }
                    $scope.findRelations = function () { //发现二级关系

                        $rootScope.showLoading = true;
                        GraphExplorer.exploreCommonFriendsWithInternalRelationshipsBySelected($scope.graph, selectedGraph, 'discover').then(function () {
                            $rootScope.showLoading = false;
                            //                         $scope.$parent.selectNodes.push({test:1});
                            _this.update();
                        }, function (msg) {
                            return alert(msg);
                        });
                    }
                    $rootScope.$watch("execScriptInMainFrame", function () {
                        _this.update();
                    });
                    //                    $scope.$watch("location",function(newValue,oldValue){
                    //                           console.log('x1:'+$scope.location.x1+',y1:'+$scope.location.y1+',x2:'+$scope.location.x2+',y2:'+$scope.location.y2);
                    //                    },true);
                    $scope.$watch("selectStatus.isMoving", function (newValue, oldValue) {
                        $scope.showSelecter = false;
                        if (!$scope.selectStatus.isMoving) { //事实上只需要判断是否为移动即可。
                            $scope.showSelecter = true;
                        } else {
                            $scope.showSelecter = false;
                        }
                    }, true);
                    return linkDistance = 180,
                        el = d3.select($element[0]),
                        el.append("defs"),
                        graph = null,
                        selectedItem = null,
                        $scope.style = GraphStyle.rules,
                        $scope.$watch("style",
                            function (val) {
                                return val ? _this.update() : void 0
                            }, !0),
                        resize = function () {
                            var currentSize, height, width;
                            return height = $element.height(),
                                width = $element.width(),
                                currentSize = force.size(),
                                currentSize[0] !== width || currentSize[1] !== height ? (force.size([width, height]), force.start()) : void 0
                        },
                        selectItem = function (item) {
                            return $rootScope.selectedGraphItem = item,
                                $rootScope.$$phase ? void 0 : $rootScope.$apply()
                        },
                        getAllPoolNeighbourAndRelations = function (d) {
                            var result = {};
                            var nodes = graph.nodes();
                            var relationships = graph.relationships();
                            var neighbourSet = {};
                            for (var i = 0; i < relationships.length; i++) {
                                var curRelationship = relationships[i];
                                if (curRelationship.target.id == d.id) {
                                    neighbourSet[curRelationship.source.id] = curRelationship.source;
                                } else if (curRelationship.source.id == d.id) {
                                    neighbourSet[curRelationship.target.id] = curRelationship.target;
                                }
                            }
                            var poolNeighbours = {};
                            var poolNeighbourRelationships = {};
                            for (var key in neighbourSet) {
                                if (!neighbourSet[key]) {
                                    continue;
                                }
                                var hasExternalNeighbour = 0;
                                var curNeighbour = neighbourSet[key];
                                var neighbourRelationship = [];
                                for (var j = 0; j < relationships.length; j++) {
                                    var curRelationship = relationships[j];

                                    if (curRelationship.target.id != curNeighbour.id && curRelationship.source.id != curNeighbour.id)
                                        continue;

                                    // external relationship
                                    if ((neighbourSet[curRelationship.target.id] == null && curRelationship.target.id != d.id) ||
                                        (neighbourSet[curRelationship.source.id] == null && curRelationship.source.id != d.id)) {
                                        hasExternalNeighbour = true;
                                    } else { //internal relationship
                                        neighbourRelationship.push(curRelationship);
                                    }
                                }
                                //if (hasExternalNeighbour == false && (curNeighbour.fixed == false||curNeighbour.fixed == null)) {

                                if (hasExternalNeighbour == false) {
                                    poolNeighbours[curNeighbour.id] = curNeighbour;
                                    for (var i = 0; i < neighbourRelationship.length; i++)
                                        poolNeighbourRelationships[neighbourRelationship[i].id] = neighbourRelationship[i];
                                }
                            }
                            result.nodes = poolNeighbours;
                            result.relations = poolNeighbourRelationships;
                            return result;
                        },

                        getUncheckedPoolNeighbourAndRelations = function (d) {
                            var result = {};
                            var nodes = graph.nodes();
                            var relationships = graph.relationships();
                            var neighbourSet = {};
                            for (var i = 0; i < relationships.length; i++) {
                                var curRelationship = relationships[i];
                                if (curRelationship.target.id == d.id) {
                                    neighbourSet[curRelationship.source.id] = curRelationship.source;
                                } else if (curRelationship.source.id == d.id) {
                                    neighbourSet[curRelationship.target.id] = curRelationship.target;
                                }
                            }
                            var poolNeighbours = {};
                            var poolNeighbourRelationships = {};
                            for (var key in neighbourSet) {
                                if (!neighbourSet[key]) {
                                    continue;
                                }
                                var hasExternalNeighbour = 0;
                                var curNeighbour = neighbourSet[key];
                                var neighbourRelationship = [];
                                for (var j = 0; j < relationships.length; j++) {
                                    var curRelationship = relationships[j];

                                    if (curRelationship.target.id != curNeighbour.id && curRelationship.source.id != curNeighbour.id)
                                        continue;

                                    // external relationship
                                    if ((neighbourSet[curRelationship.target.id] == null && curRelationship.target.id != d.id) ||
                                        (neighbourSet[curRelationship.source.id] == null && curRelationship.source.id != d.id)) {
                                        hasExternalNeighbour = true;
                                    } else { //internal relationship
                                        neighbourRelationship.push(curRelationship);
                                    }
                                }
                                //if (hasExternalNeighbour == false && (curNeighbour.fixed == false||curNeighbour.fixed == null)) {

                                if (hasExternalNeighbour == false && (curNeighbour.checkStatus == null || curNeighbour.checkStatus == false)) {
                                    poolNeighbours[curNeighbour.id] = curNeighbour;
                                    for (var i = 0; i < neighbourRelationship.length; i++)
                                        poolNeighbourRelationships[neighbourRelationship[i].id] = neighbourRelationship[i];
                                }
                            }
                            result.nodes = poolNeighbours;
                            result.relations = poolNeighbourRelationships;
                            return result;
                        },
                        onNodeDblClick = function (d) {
                            if (d.expanded) {
                                removePoolNeighbour(d)
                            } else if (hasUncheckedNeighbour(d)) {
                                removePoolNeighbour(d)
                            } else {
                                hideAllCheckbox();
                                $rootScope.showLoading = true;
                                (GraphExplorer.exploreNeighboursWithInternalRelationships(d, graph).then(function () {
                                        $rootScope.showLoading = false;
                                        return CircularLayout.layout(graph.nodes(), d, linkDistance),
                                            d.expanded = !0,
                                            _this.update()
                                    },
                                    function (msg) {
                                        return alert(msg)
                                    }), $rootScope.$$phase ? void 0 : $rootScope.$apply())
                            }
                            /*
                                                        return d.expanded ? removePoolNeighbour(d) : (GraphExplorer.exploreNeighboursWithInternalRelationships(d, graph).then(function () {
                                                                return CircularLayout.layout(graph.nodes(), d, linkDistance),
                                                                    d.expanded = !0,
                                                                    _this.update()
                                                            },
                                                            function (msg) {
                                                                return alert(msg)
                                                            }), $rootScope.$$phase ? void 0 : $rootScope.$apply())*/
                        },
                        onNodeLTClick = function (d) {
                            var poolNeighbourResult = getAllPoolNeighbourAndRelations(d);
                            hideAllCheckbox();

                            for (var key in poolNeighbourResult.nodes) {
                                poolNeighbourResult.nodes[key].shouldHideCheckbox = false;
                            }
                            console.log(poolNeighbourResult);
                            _this.update();
                            return
                        },
                        onNodeClick = function (d) {
                            console.log('d--->', d);
                            window.nodef = d;
                            $rootScope.selectedNode = d.id;
                            if (d.shouldHideCheckbox == null || d.shouldHideCheckbox == true)
                                hideAllCheckbox();
                            if (d.labels != undefined && d.labels[0] == 'Unknown') {
                                toggleSelection(d);
                            }
                            return
                        },
                        onRelationshipClick = function (d) {
                            hideAllCheckbox();
                            return toggleSelection(d)
                        },
                        toggleSelection = function (d) {
                            if (d.labels != undefined && d.labels[0] == 'Unknown') {
                                //GraphStyle.changeUnknown(d);
                                graph.removeNodeById(d.id);
                                $rootScope.showLoading = true;
                                GraphExplorer.exploreNodeById(graph, d.id).then(function () {
                                    $rootScope.showLoading = false;
                                    _this.update();
                                }, function (msg) {
                                    return alert(msg);
                                });
                                //                                GraphExplorer.exploreCommonFriendsWithInternalRelationships(graph).then(function(){
                                //                                    _this.update();
                                //                                }, function(msg){
                                //                                    return alert(msg);
                                //                                })
                                return selectItem(null);
                            } else {
                                if (d === $rootScope.selectedGraphItem) {
                                    d.selected = false, $rootScope.selectedGraphItem = null
                                } else {
                                    null != $rootScope.selectedGraphItem && ($rootScope.selectedGraphItem.selected = !1);
                                    d.selected = true;
                                    $rootScope.selectedGraphItem = d
                                }
                                _this.update();
                                return selectItem($rootScope.selectedGraphItem);
                            }
                            // return d === selectedItem ? (d.selected = !1, selectedItem = null) : (null != selectedItem && (selectedItem.selected = !1), d.selected = !0, selectedItem = d),
                            //     _this.update(),
                            //     selectItem(selectedItem)
                        },
                        //============LS BEGIN===========
                        $scope.printSelectedNode = function () {
                            if ($rootScope.selectedNode == null)
                                return alert("Please select one Node");
                            var url = "/plugins/service/pdf/" + this.selectedNode;
                            window.open(url);
                            //$http({
                            //    method: 'get',
                            //    url: url,
                            //    headers: {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}//可以加入任意的头信息
                            //});
                        },
                        $scope.$watch("relationshipShowStatusChange",
                            function () {
                                _this.update();
                            }),
                        $scope.$on("graph:reallyChanged", function (event, graph) {
                            $scope.$parent.selectNodes;
                            _this.update();
                        }),
                        //============LS END=============
                        clickHandler = clickcancel(),
                        clickHandler.on("click", onNodeClick),
                        clickHandler.on("dblclick", onNodeDblClick),
                        clickHandler.on("ltclick", onNodeLTClick),
                        accelerateLayout = function (force, render) {
                            var d3Tick, maxAnimationFramesPerSecond, maxComputeTime, maxStepsPerTick, now;
                            return maxStepsPerTick = 100,
                                maxAnimationFramesPerSecond = 60,
                                maxComputeTime = 1e3 / maxAnimationFramesPerSecond,
                                now = angular.isDefined(window.performance) && angular.isFunction(window.performance.now) ?
                                function () {
                                    return window.performance.now()
                                } : function () {
                                    return Date.now()
                                },
                                d3Tick = force.tick,
                                force.tick = function () {
                                    var startTick, step;
                                    for (startTick = now(), step = maxStepsPerTick; step-- && now() - startTick < maxComputeTime;) {
                                        if (d3Tick()) {
                                            return maxStepsPerTick = 2, !0;
                                        }
                                    }
                                    if (force.alpha() < 0.06) {
                                        force.stop();
                                    }
                                    return render(), !1
                                }
                        },
                        render = function () {
                            //                        	changeTimeLine();
                            var nodeGroups, relationshipGroups, renderer, _i, _j, _len, _len1, _ref, _ref1, _results;
                            for (GraphGeometry.onTick(graph), nodeGroups = el.selectAll("g.node").attr("transform",
                                    function (node) {
                                        return "translate(" + node.x + "," + node.y + ")"
                                    }), _ref = GraphRenderer.nodeRenderers, _i = 0, _len = _ref.length; _len > _i; _i++) renderer = _ref[_i],
                                nodeGroups.call(renderer.onTick);
                            for (relationshipGroups = el.selectAll("g.relationship"), _ref1 = GraphRenderer.relationshipRenderers, _results = [], _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) renderer = _ref1[_j],
                                _results.push(relationshipGroups.call(renderer.onTick));
                            return _results
                        },
                        force = d3.layout.force().linkDistance(linkDistance).charge(-1e3),
                        accelerateLayout(force, render),
                        this.update = function () {
                            //                           changeTimeLine();
                            var center, layers, nodeGroups, nodes, radius, relationshipGroups, relationships, renderer, _i, _j, _len, _len1, _ref, _ref1;
                            if (graph) {
                                nodes = graph.nodes();
                                relationships = graph.relationships();
                                radius = nodes.length * linkDistance / (2 * Math.PI);
                                center = {
                                    x: $element.width() / 2,
                                    y: $element.height() / 2
                                };
                                CircularLayout.layout(nodes, center, radius);
                                force.nodes(nodes).links(relationships).start();
                                resize();
                                $rootScope.$on("layout.changed", resize);
                                layers = el.selectAll("g.layer").data(["relationships", "nodes"]);
                                layers.enter().append("g").attr("class",
                                    function (d) {
                                        return "layer " + d
                                    });
                                relationshipGroups = el.select("g.layer.relationships")
                                    .selectAll("g.relationship")
                                    .data(relationships,
                                        function (d) {
                                            return d.id
                                        });
                                //==============LS BEGIN==============
                                relationshipGroups
                                    .attr("class", function (d) {
                                        return GraphDisplay.getRelationshipStatus(d.type) ? "relationship" : "relationship ng-hide";
                                    })
                                    .on("click", onRelationshipClick);
                                //==============LS END==============
                                relationshipGroups.enter().append("g")
                                    //.attr("class", "relationship")
                                    .attr("class", function (d) {
                                        return GraphDisplay.getRelationshipStatus(d.type) ? "relationship" : "relationship ng-hide";
                                    })
                                    .on("click", onRelationshipClick);
                                GraphGeometry.onGraphChange(graph);
                                _ref = GraphRenderer.relationshipRenderers;
                                for (_i = 0, _len = _ref.length; _len > _i; _i++) {
                                    renderer = _ref[_i];
                                    relationshipGroups.call(renderer.onGraphChange);
                                }
                                for (relationshipGroups.exit().remove(), nodeGroups = el.select("g.layer.nodes").selectAll("g.node").data(nodes,
                                        function (d) {
                                            return d.id
                                        }), nodeGroups.enter().append("g").attr("class", "node").call(force.drag).call(clickHandler), _ref1 = GraphRenderer.nodeRenderers, _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) renderer = _ref1[_j],
                                    nodeGroups.call(renderer.onGraphChange);


                                nodeGroups.on('mousedown.nd', function () {

                                    $scope.$apply(function () {
                                        $scope.location.x1 = 0;
                                        $scope.location.x2 = 0;
                                        $scope.location.y1 = 0;
                                        $scope.location.y2 = 0;
                                        $scope.selectStatus.isMoving = true;
                                    });
                                    console.log('in in');
                                    d3.select(this.parentElement.parentElement).on("mouseup.nd", function () {
                                        $scope.$apply(function () {
                                            $scope.selectStatus.isMoving = false;
                                        });
                                        console.log('out out');
                                    });
                                });
                                d3.select($element[0]).on('mousedown.svg', function () {
                                    $scope.$apply(function () {
                                        $scope.location.x1 = 0;
                                        $scope.location.x2 = 0;
                                        $scope.location.y1 = 0;
                                        $scope.location.y2 = 0;
                                    });

                                });
                                d3.select($element[0]).on('mouseup.svg', function () {
                                    if ($scope.location.x1 != 0 && $scope.location.x2 != 0 && $scope.location.y1 != 0 && $scope.location.y2 != 0) {
                                        $scope.graphCopy = $.extend(true, {}, $scope.graph);
                                        var nodes = $scope.graphCopy.nodes();
                                        for (var i = 0; i < nodes.length; i++) {
                                            if ((nodes[i].x > $scope.location.x1 && nodes[i].y > $scope.location.y1) && (nodes[i].x < $scope.location.x2 && nodes[i].y < $scope.location.y2)) {
                                                console.log("node:" + nodes[i].id + " is in selected area");

                                                //selected
                                                $scope.graph.nodeMap[nodes[i].id].selected = true;
                                            } else {
                                                $scope.graphCopy.removeNodeById(nodes[i].id);
                                            }
                                        }
                                        if ($scope.graphCopy.nodes().length == 0) {
                                            $scope.$apply(function () {
                                                $scope.showMenu = false;
                                            });
                                        } else {

                                            $scope.$apply(function () {
                                                if ($scope.graphCopy.nodes().length > 1) {
                                                    $scope.isMultipleSelect = true;
                                                } else {
                                                    $scope.isMultipleSelect = false;
                                                }
                                                $scope.showMenu = true;
                                            });
                                        }
                                        selectedGraph = $scope.graphCopy;
                                        //                                              console.log($scope.selectStatus.isMoving);
                                        //                                              console.log('x1:'+$scope.location.x1+',y1:'+$scope.location.y1+',x2:'+$scope.location.x2+',y2:'+$scope.location.y2);
                                    } else {
                                        $scope.$apply(function () {
                                            $scope.showMenu = false;
                                        });
                                    }
                                });
                                nodeGroups.on('mouseover', function () {
                                    if (!$scope.selectStatus.isMoving) {
                                        $scope.$apply(function () {
                                            $scope.selectStatus.isHover = true;
                                        });
                                    }
                                });
                                nodeGroups.on('mouseout', function () {
                                    if (!$scope.selectStatus.isMoving) {
                                        $scope.$apply(function () {
                                            $scope.selectStatus.isHover = false;
                                        });
                                    }
                                });
                                return nodeGroups.exit().remove(),
                                    $rootScope.$broadcast("graph:changed", graph),
                                    $scope.$emit("emit-graph:changed", graph);

                            }
                        },
                        this.updateWithGraph = function () {
                            var center, layers, nodeGroups, nodes, radius, relationshipGroups, relationships, renderer, _i, _j, _len, _len1, _ref, _ref1;
                            graph = this.graph;
                            if (graph) {
                                nodes = graph.nodes();
                                relationships = graph.relationships();
                                radius = nodes.length * linkDistance / (2 * Math.PI);
                                center = {
                                    x: $element.width() / 2,
                                    y: $element.height() / 2
                                };
                                CircularLayout.layout(nodes, center, radius);
                                force.nodes(nodes).links(relationships).start();
                                resize();
                                $rootScope.$on("layout.changed", resize);
                                layers = el.selectAll("g.layer").data(["relationships", "nodes"]);
                                layers.enter().append("g").attr("class",
                                    function (d) {
                                        return "layer " + d
                                    });
                                relationshipGroups = el.select("g.layer.relationships")
                                    .selectAll("g.relationship")
                                    .data(relationships,
                                        function (d) {
                                            return d.id
                                        });
                                //==============LS BEGIN==============
                                relationshipGroups
                                    .attr("class", function (d) {
                                        return GraphDisplay.getRelationshipStatus(d.type) ? "relationship" : "relationship ng-hide";
                                    })
                                    .on("click", onRelationshipClick);
                                //==============LS END==============
                                relationshipGroups.enter().append("g")
                                    //.attr("class", "relationship")
                                    .attr("class", function (d) {
                                        return GraphDisplay.getRelationshipStatus(d.type) ? "relationship" : "relationship ng-hide";
                                    })
                                    .on("click", onRelationshipClick);
                                GraphGeometry.onGraphChange(graph);
                                _ref = GraphRenderer.relationshipRenderers;
                                for (_i = 0, _len = _ref.length; _len > _i; _i++) {
                                    renderer = _ref[_i];
                                    relationshipGroups.call(renderer.onGraphChange);
                                }
                                for (relationshipGroups.exit().remove(), nodeGroups = el.select("g.layer.nodes").selectAll("g.node").data(nodes,
                                        function (d) {
                                            return d.id
                                        }), nodeGroups.enter().append("g").attr("class", "node").call(force.drag).call(clickHandler), _ref1 = GraphRenderer.nodeRenderers, _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) renderer = _ref1[_j],
                                    nodeGroups.call(renderer.onGraphChange);
                                return nodeGroups.exit().remove(),
                                    $rootScope.$broadcast("graph:changed", graph)
                            }
                        },
                        this.render = function (g) {
                            var _this = this;
                            $scope.graph = g;
                            return graph = g,
                                0 !== graph.nodes().length ? GraphExplorer.internalRelationships(graph.nodes()).then(function (result) {
                                    return graph.addRelationships(result.relationships),
                                        _this.update()
                                }) : void 0
                        },
                        this
                }
            ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp").directive("editInPlace", ["$parse", "$timeout",
            function ($parse, $timeout) {
                return {
                    restrict: "A",
                    scope: {
                        value: "=editInPlace",
                        callback: "&onBlur"
                    },
                    replace: !0,
                    template: '<div ng-class=" {editing: editing} " class="edit-in-place"><form ng-submit="save()"><span ng-bind="value" ng-hide="editing"></span><input ng-show="editing" ng-model="value" class="edit-in-place-input"><div ng-click="edit($event)" ng-hide="editing" class="edit-in-place-trigger"></div></form></div>',
                    link: function (scope, element) {
                        var inputElement;
                        return scope.editing = !1,
                            inputElement = element.find("input"),
                            scope.edit = function (e) {
                                return e.preventDefault(),
                                    e.stopPropagation(),
                                    scope.editing = !0,
                                    $timeout(function () {
                                            return inputElement.focus()
                                        },
                                        0, !1)
                            },
                            scope.save = function () {
                                return scope.editing = !1,
                                    scope.callback ? scope.callback() : void 0
                            },
                            inputElement.bind("blur",
                                function () {
                                    return scope.save(),
                                        scope.$$phase ? void 0 : scope.$apply()
                                })
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("Server", ["$http", "$q", "Settings",
            function ($http, $q, Settings) {
                var Server, httpOptions, returnAndUpdate, returnAndUpdateArray, returnAndUpdateObject;
                return httpOptions = {
                        timeout: 1e3 * Settings.maxExecutionTime
                    },
                    returnAndUpdate = function (Type, promise) {
                        var rv;
                        return rv = new Type,
                            promise.success(function (r) {
                                return angular.isArray(rv) ? rv.push.apply(rv, r) : angular.extend(rv, r)
                            }),
                            rv
                    },
                    returnAndUpdateArray = function (promise) {
                        return returnAndUpdate(Array, promise)
                    },
                    returnAndUpdateObject = function (promise) {
                        return returnAndUpdate(Object, promise)
                    },
                    new(Server = function () {
                        function Server() {}

                        return Server.prototype.options = function (path, options) {
                                return null == path && (path = ""),
                                    null == options && (options = {}),
                                    0 !== path.indexOf(Settings.host) && (path = Settings.host + path),
                                    options.method = "OPTIONS",
                                    options.url = path,
                                    $http(options)
                            },
                            Server.prototype.head = function (path, options) {
                                return null == path && (path = ""),
                                    0 !== path.indexOf(Settings.host) && (path = Settings.host + path),
                                    $http.head(path, options || httpOptions)
                            },
                            Server.prototype["delete"] = function (path, data) {
                                return null == path && (path = ""),
                                    null == data && (data = null),
                                    0 !== path.indexOf(Settings.host) && (path = Settings.host + path),
                                    $http["delete"](path, httpOptions)
                            },
                            Server.prototype.get = function (path, options) {
                                return null == path && (path = ""),
                                    0 !== path.indexOf(Settings.host) && (path = Settings.host + path),
                                    $http.get(path, options || httpOptions)
                            },
                            Server.prototype.post = function (path, data) {
                                return null == path && (path = ""),
                                    0 !== path.indexOf(Settings.host) && (path = Settings.host + path),
                                    $http.post(path, data, httpOptions)
                            },
                            Server.prototype.put = function (path, data) {
                                return null == path && (path = ""),
                                    0 !== path.indexOf(Settings.host) && (path = Settings.host + path),
                                    $http.put(path, data, httpOptions)
                            },
                            Server.prototype.transaction = function (opts) {
                                var method, path, s, statements, _i, _len;
                                for (opts = angular.extend({
                                            path: "",
                                            statements: [],
                                            method: "post"
                                        },
                                        opts), path = opts.path, statements = opts.statements, method = opts.method, path = Settings.endpoint.transaction + path, method = method.toLowerCase(), _i = 0, _len = statements.length; _len > _i; _i++) s = statements[_i],
                                    s.resultDataContents = ["row", "graph"],
                                    s.includeStats = !0;
                                return "function" == typeof this[method] ? this[method](path, {
                                    statements: statements
                                }) : void 0
                            },
                            Server.prototype.console = function (command, engine) {
                                return null == engine && (engine = "shell"),
                                    this.post(Settings.endpoint.console, {
                                        command: command,
                                        engine: engine
                                    })
                            },
                            Server.prototype.cypher = function (path, data) {
                                return null == path && (path = ""),
                                    this.post("" + Settings.endpoint.cypher + path, data)
                            },
                            Server.prototype.jmx = function (query) {
                                return this.post(Settings.endpoint.jmx, query)
                            },
                            Server.prototype.labels = function () {
                                return returnAndUpdateArray(this.get(Settings.endpoint.rest + "/labels"))
                            },
                            Server.prototype.relationships = function () {
                                return returnAndUpdateArray(this.get(Settings.endpoint.rest + "/relationship/types"))
                            },
                            Server.prototype.propertyKeys = function () {
                                return returnAndUpdateArray(this.get(Settings.endpoint.rest + "/propertykeys"))
                            },
                            Server.prototype.info = function () {
                                return returnAndUpdateObject(this.get(Settings.endpoint.rest + "/"))
                            },
                            Server.prototype.status = function (params) {
                                return null == params && (params = ""),
                                    this.options("" + Settings.endpoint.rest + "/", {
                                        timeout: 1e3 * Settings.heartbeat
                                    })
                            },
                            Server.prototype.log = function (path) {
                                return this.get(path).then(function (r) {
                                    return console.log(r)
                                })
                            },
                            Server.prototype.hasData = function () {
                                var q;
                                return q = $q.defer(),
                                    this.cypher("?profile=true", {
                                        query: "MATCH (n) RETURN ID(n) LIMIT 1"
                                    }).success(function (r) {
                                        return q.resolve(1 === r.plan.rows)
                                    }).error(q.reject),
                                    q.promise
                            },
                            Server
                    }())
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").config(function ($provide, $compileProvider, $filterProvider, $controllerProvider) {
            return $controllerProvider.register("MainCtrl", ["$rootScope", "$window", "Server", "Settings", "motdService",
                function ($scope, $window, Server, Settings, motdService) {
                    var license, refresh;
                    return refresh = function () {
                            return $scope.labels = Server.labels(),
                                $scope.relationships = Server.relationships(),
                                $scope.propertyKeys = Server.propertyKeys(),
                                $scope.server = Server.info(),
                                $scope.host = $window.location.host
                        },
                        $scope.motd = motdService,
                        $scope.neo4j = license = {
                            type: "GPLv3",
                            url: "http://www.gnu.org/licenses/gpl.html",
                            edition: "Enterprise",
                            hasData: Server.hasData()
                        },
                        $scope.$on("db:changed:labels", refresh),
                        $scope.today = Date.now(),
                        $scope.cmdchar = Settings.cmdchar,
                        $scope.goodBrowser = "Microsoft Internet Explorer" !== navigator.appName && -1 === navigator.userAgent.indexOf("Trident"),
                        Server.jmx(["org.neo4j:instance=kernel#0,name=Configuration", "org.neo4j:instance=kernel#0,name=Kernel", "org.neo4j:instance=kernel#0,name=Store file sizes"]).success(function (response) {
                            var a, r, _i, _len, _results;
                            for ($scope.kernel = {},
                                _results = [], _i = 0, _len = response.length; _len > _i; _i++) r = response[_i],
                                _results.push(function () {
                                    var _j, _len1, _ref, _results1;
                                    for (_ref = r.attributes, _results1 = [], _j = 0, _len1 = _ref.length; _len1 > _j; _j++) a = _ref[_j],
                                        _results1.push($scope.kernel[a.name] = a.value);
                                    return _results1
                                }());
                            return _results
                        }),
                        $scope.$watch("offline",
                            function (serverIsOffline) {
                                return serverIsOffline ? void 0 : refresh()
                            }),
                        $scope.$watch("server",
                            function (val) {
                                return $scope.neo4j.version = val.neo4j_version
                            }, !0),
                        refresh()
                }
            ])
        }).run(["$rootScope", "Editor",
            function () {}
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").filter("PropertyNameFilter", function () {
            return function (oldName) {
                var keyMap = {
                    'name': '名称',
                    //'sourceFlag': '来源',
                    //'companyId': 'id',
                    'staffTypeName': '职务',
                    'staffSalary': '薪酬',
                    'staffStakeNum': '薪酬',
                    'amount': '投资额',
                    'ownershipStake': '占股比例',
                    //
                    'contacts': '联系人',
                    'email': '邮箱',
                    'phone': '电话',
                    'mobilephone': '手机号',
                    'faxNum': '传真',
                    'website': '主页',
                    //'humanId': 'id',
                    //'gender': '性别',
                    //'age': '年龄',
                    'hukouLocation': '住址',
                    'identification': '身份证号',
                    'nation': '民族',
                    'businessScope': '经营范围',
                    'regStatus': '营业状态',
                    'estiblishTime': '注册时间',
                    'approvedTime': '批准时间',
                    'fromTime': '营业有效期起',
                    'legalPersonName': '法人',
                    'toTime': '营业有效期止',
                    'regNumber': '工商注册号',
                    'companyOrgType': '企业组织形式',
                    'regCapital': '注册资金',
                    'regInstitute': '注册机构',
                    'regLocation': '注册地',
                    'orgApprovedInstitute': '组织机构注册单位',
                    'orgNumber': '组织机构代码',
                    'caseStr': '裁判文书号',
                    'content': '内容',
                    'title': '名称',
                    'submitTime': '提交时间',
                    'typeStr': '裁决书类型',
                    'court': '法院',
                    'referCaseStr': '引用案号',
                    'relation': '关系',
                    //dishonest
                    'regDate': "立案时间",
                    'iname': "被执行人",
                    'disruptTypeName': "具体失信行为",
                    'caseCode': "执行文号",
                    'areaName': "省份",
                    'duty': "生效法律文书确定的义务",
                    'courtName': "执行单位",
                    'performance': "被执行人履行情况",
                    'gistUnit': "做出执行依据单位",
                    'gistId': "执行依据文号",
                    'publishDate': "发布时间",
                    'cardNum': "身份证号/组织机构代码",
                    'businessEntity': "被执行机构负责人",
                    //accountRecord
                    'datetime': "日期",
                    'moneytransfer': "金额",
                    //human++
                    'birthdate': "出生日期",
                    'addr': "籍贯",
                    'birthcity': "户口所在地",
                    //phonerecord
                    'phoneperiod': "时长",
                    'phonetitle': "名称"
                };

                return keyMap[oldName] == null ? "" : keyMap[oldName];
            }
        })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").filter("CompanyBaseFilter", function () {
            return function (company) {
                var result = "";

                var base = company.base;
                var keyMap = {
                    'gj': '工商总局',
                    'bj': '北京',
                    'tj': '天津',
                    'heb': '河北',
                    'sx': '山西',
                    'nmg': '内蒙',
                    'ln': '辽宁',
                    'jl': '吉林',
                    'hlj': '黑龙江',
                    'sh': '上海',
                    'js': '江苏',
                    'zj': '浙江',
                    'ah': '安徽',
                    'fj': '福建',
                    'jx': '江西',
                    'sd': '山东',
                    'gx': '广西',
                    'gd': '广东',
                    'han': '海南',
                    'hen': '河南',
                    'hb': '湖北',
                    'hn': '湖南',
                    'qc': '重庆',
                    'sc': '四川',
                    'gz': '贵州',
                    'yn': '云南',
                    'xz': '西藏',
                    'snx': '陕西',
                    'gs': '甘肃',
                    'qh': '青海',
                    'nx': '宁夏',
                    'xj': '新疆'
                };

                if (base != null)
                    result = keyMap[base] == null ? "" : keyMap[base];

                if (result == "") {
                    if (company.name.indexOf("北京") >= 0)
                        result = "北京";
                    else if (company.name.indexOf("浙江") >= 0 || company.name.indexOf("杭州") >= 0)
                        result = "浙江";
                }

                if (result != "")
                    result = "[" + result + "]";
                return result;
            }
        })
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty;
        angular.module("neo4jApp.services").factory("Node", [function () {
            var Node;
            return Node = function () {
                function Node(id, labels, properties) {
                    var key, value;
                    this.id = id,
                        this.enable = true,
                        this.labels = labels,
                        this.propertyMap = properties,
                        this.propertyList = function () {
                            var _results;
                            _results = [];
                            for (key in properties) __hasProp.call(properties, key) && (value = properties[key], _results.push({
                                key: key,
                                value: value
                            }));
                            return _results
                        }()
                }

                return Node.prototype.toJSON = function () {
                        return this.propertyMap
                    },
                    Node.prototype.isNode = !0,
                    Node.prototype.isRelationship = !1,
                    Node
            }()
        }])
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty;
        angular.module("neo4jApp.services").factory("Relationship", [function () {
            var Relationship;
            return Relationship = function () {
                function Relationship(id, source, target, type, properties) {
                    var key, value;
                    this.id = id,
                        this.enable = true,
                        this.source = source,
                        this.target = target,
                        this.type = type,
                        this.propertyMap = properties,
                        this.propertyList = function () {
                            var _ref, _results;
                            _ref = this.propertyMap,
                                _results = [];
                            for (key in _ref) __hasProp.call(_ref, key) && (value = _ref[key], _results.push({
                                key: key,
                                value: value
                            }));
                            return _results
                        }.call(this)
                }

                return Relationship.prototype.toJSON = function () {
                        return this.propertyMap
                    },
                    Relationship.prototype.isNode = !1,
                    Relationship.prototype.isRelationship = !0,
                    Relationship
            }()
        }])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("JMXCtrl", ["$scope", "Server",
            function ($scope, Server) {
                var parseName, parseSection;
                return parseName = function (str) {
                        return str.split("=").pop()
                    },
                    parseSection = function (str) {
                        return str.split("/")[0]
                    },
                    Server.jmx(["*:*"]).success(function (response) {
                        var r, section, sections, _i, _len;
                        for (sections = {},
                            _i = 0, _len = response.length; _len > _i; _i++) r = response[_i],
                            r.name = parseName(r.name),
                            section = parseSection(r.url),
                            null == sections[section] && (sections[section] = {}),
                            sections[section][r.name] = r;
                        return $scope.sections = sections,
                            $scope.currentItem = sections[section][r.name]
                    }),
                    $scope.stringify = function (val) {
                        return angular.isString(val) ? val : JSON.stringify(val, null, " ")
                    },
                    $scope.selectItem = function (section, name) {
                        return $scope.currentItem = $scope.sections[section][name]
                    },
                    $scope.simpleValues = function (item) {
                        return !$scope.objectValues(item)
                    },
                    $scope.objectValues = function (item) {
                        return angular.isObject(item.value)
                    }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("GraphExplorer", ["$q", "Cypher", "Settings",
            function ($q, Cypher, Settings) {
                return {
                    nodeArrayUnique: function (array) {
                        var res = [];
                        var json = {};
                        for (var i = 0; i < array.length; i++) {
                            if (!json[array[i]]) {
                                res.push(array[i]);
                                json[array[i]] = 1;
                            }
                        }
                        return res;
                    },
                    refreshNodeRelations: function (nodes, graph) {
                        var q;
                        return q = $q.defer(),
                            this.internalRelationships(nodes).then(function (result) {
                                return graph.addRelationships(result.relationships),
                                    q.resolve()
                            }),
                            q.promise
                    },
                    importDBByScripts: function (scripts, index, success) {
                        var _this = this;
                        _this.importDBByScript(scripts, index).then(function (index) {

                            if (index < scripts.length) {
                                _this.importDBByScripts(scripts, index, success);
                            } else {
                                success();
                            }
                        });



                    },
                    importDBByScript: function (scripts, index) {
                        var q;
                        return q = $q.defer(),
                            Cypher.transaction().commit(scripts[index]).then(function () {
                                q.resolve(++index);
                                console.log(index);
                                console.log(scripts[index - 1])
                            }),
                            q.promise
                    },
                    execScript: function (input, graph) {
                        var q, _this = this;
                        return q = $q.defer(),
                            Cypher.transaction().commit(input).then(function (neighboursResult) {
                                return _this.nodeArrayUnique(neighboursResult.nodes).length > Settings.maxNeighbours ? q.reject("Sorry! Too many neighbours") : (graph.merge(neighboursResult), _this.internalRelationships(graph.nodes()).then(function (result) {
                                    return graph.addRelationships(result.relationships),
                                        q.resolve()
                                }))
                            }),
                            q.promise
                    },
                    exploreNeighboursWithInternalRelationships: function (node, graph) {
                        var q, _this = this;
                        return q = $q.defer(),
                            this.exploreNeighbours(node).then(function (neighboursResult) {
                                return _this.nodeArrayUnique(neighboursResult.nodes).length > Settings.maxNeighbours ? q.reject("Sorry! Too many neighbours") : (graph.merge(neighboursResult), _this.internalRelationships(graph.nodes()).then(function (result) {
                                    return graph.addRelationships(result.relationships),
                                        q.resolve()
                                }))
                            }),
                            q.promise
                    },
                    exploreNeighbours: function (node) {
                        var q;
                        return q = $q.defer(),
                            Cypher.transaction().commit("START a = node(" + node.id + ") MATCH (a)-[r]-() RETURN r;").then(q.resolve),
                            q.promise
                    },
                    internalRelationships: function (nodes) {
                        var ids, q;
                        return q = $q.defer(),
                            0 === nodes.length ? (q.resolve(), q.promise) : (ids = nodes.map(function (node) {
                                return node.id
                            }), Cypher.transaction().commit("START a = node(" + ids.join(",") + "), b = node(" + ids.join(",") + ")\nMATCH a -[r]-> b RETURN r;").then(q.resolve), q.promise)
                    },
                    exploreOneNodeById: function (id) {
                        var q;
                        return q = $q.defer(),
                            Cypher.transaction().commit("START a = node(" + id + ") RETURN a;").then(q.resolve),
                            q.promise
                    },
                    exploreNodeById: function (graph, id) {
                        var q, _this = this;
                        return q = $q.defer(),
                            this.exploreOneNodeById(id).then(function (neighboursResult) {
                                return _this.nodeArrayUnique(neighboursResult.nodes).length > Settings.maxNeighbours ? q.reject("Sorry! Too many neighbours") : (graph.merge(neighboursResult), _this.internalRelationships(graph.nodes()).then(function (result) {
                                    return graph.addRelationships(result.relationships),
                                        q.resolve()
                                }))
                            }),
                            q.promise


                        //                         this.exploreOneNodeById(id).then(function(result){
                        //                                
                        //                         });
                    },
                    exploreCommonFriendsWithInternalRelationships: function (graph, actionType) {
                        var q, _this = this;
                        var uniqueArray = function (array) {
                            var res = [];
                            var json = {};
                            for (var i = 0; i < array.length; i++) {
                                if (!json[array[i]]) {
                                    res.push(array[i]);
                                    json[array[i]] = 1;
                                }
                            }
                            return res;
                        }
                        var findNewNode = function (arr1, arr2) {
                            var arr3 = [];
                            for (var i = 0; i < arr1.length; i++) {
                                var flag = true;
                                for (var j = 0; j < arr2.length; j++) {
                                    if (arr1[i] == arr2[j])
                                        flag = false;
                                }
                                if (flag)
                                    arr3.push(arr1[i]);
                            }
                            return arr3;
                        }
                        return q = $q.defer(),
                            this.exploreCommonFriends(graph).then(function (neighboursResult) {
                                var oldNodesIds = uniqueArray(graph.nodes().map(function (v) {
                                    return v.id
                                }));
                                var newNodesIds = uniqueArray(neighboursResult.nodes.map(function (v) {
                                    return v.id
                                }));
                                var newComeNodesIds = findNewNode(newNodesIds, oldNodesIds);
                                console.log('nodesLen', newComeNodesIds, neighboursResult.nodes.length);
                                return _this.nodeArrayUnique(neighboursResult.nodes).length > Settings.maxNeighbours ? q.reject("Sorry! Too many neighbours") : (graph.mergeWithUnknown(neighboursResult, actionType), _this.internalRelationships(graph.nodes()).then(function (result) {
                                    return graph.addRelationships(result.relationships),
                                        q.resolve()
                                }))
                            }),
                            q.promise
                    },
                    exploreCommonFriendsWithInternalRelationshipsBySelectedDeep: function (graph, graphSelected, actionType) {
                        var q, _this = this;
                        var uniqueArray = function (array) {
                            var res = [];
                            var json = {};
                            for (var i = 0; i < array.length; i++) {
                                if (!json[array[i]]) {
                                    res.push(array[i]);
                                    json[array[i]] = 1;
                                }
                            }
                            return res;
                        }
                        var findNewNode = function (arr1, arr2) {
                            var arr3 = [];
                            for (var i = 0; i < arr1.length; i++) {
                                var flag = true;
                                for (var j = 0; j < arr2.length; j++) {
                                    if (arr1[i] == arr2[j])
                                        flag = false;
                                }
                                if (flag)
                                    arr3.push(arr1[i]);
                            }
                            return arr3;
                        }
                        return q = $q.defer(),
                            this.exploreCommonFriendsDeep(graphSelected).then(function (neighboursResult) {
                                var oldNodesIds = uniqueArray(graph.nodes().map(function (v) {
                                    return v.id
                                }));
                                var newNodesIds = uniqueArray(neighboursResult.nodes.map(function (v) {
                                    return v.id
                                }));
                                var newComeNodesIds = findNewNode(newNodesIds, oldNodesIds);
                                console.log('nodesLen', newComeNodesIds, neighboursResult.nodes.length);
                                return _this.nodeArrayUnique(neighboursResult.nodes).length > Settings.maxNeighbours ? q.reject("Sorry! Too many neighbours") : (graph.mergeWithUnknown(neighboursResult, actionType), _this.internalRelationships(graph.nodes()).then(function (result) {
                                    return graph.addRelationships(result.relationships),
                                        q.resolve()
                                }))
                            }),
                            q.promise
                    },
                    exploreCommonFriendsWithInternalRelationshipsBySelected: function (graph, graphSelected, actionType) {
                        var q, _this = this;
                        var uniqueArray = function (array) {
                            var res = [];
                            var json = {};
                            for (var i = 0; i < array.length; i++) {
                                if (!json[array[i]]) {
                                    res.push(array[i]);
                                    json[array[i]] = 1;
                                }
                            }
                            return res;
                        }
                        var findNewNode = function (arr1, arr2) {
                            var arr3 = [];
                            for (var i = 0; i < arr1.length; i++) {
                                var flag = true;
                                for (var j = 0; j < arr2.length; j++) {
                                    if (arr1[i] == arr2[j])
                                        flag = false;
                                }
                                if (flag)
                                    arr3.push(arr1[i]);
                            }
                            return arr3;
                        }
                        return q = $q.defer(),
                            this.exploreCommonFriends(graphSelected).then(function (neighboursResult) {
                                var oldNodesIds = uniqueArray(graph.nodes().map(function (v) {
                                    return v.id
                                }));
                                var newNodesIds = uniqueArray(neighboursResult.nodes.map(function (v) {
                                    return v.id
                                }));
                                var newComeNodesIds = findNewNode(newNodesIds, oldNodesIds);
                                console.log('nodesLen', newComeNodesIds, neighboursResult.nodes.length);
                                return _this.nodeArrayUnique(neighboursResult.nodes).length > Settings.maxNeighbours ? q.reject("Sorry! Too many neighbours") : (graph.mergeWithUnknown(neighboursResult, actionType), _this.internalRelationships(graph.nodes()).then(function (result) {
                                    return graph.addRelationships(result.relationships),
                                        q.resolve()
                                }))
                            }),
                            q.promise
                    },
                    exploreCommonFriends: function (graph) {
                        var q = $q.defer();
                        var ids = graph.nodes().map(function (node) {
                            return node.id
                        });
                        var neighboursResult = Cypher.transaction().commit("START a = node(" + ids.join(",") + "),b = node(" + ids.join(",") + ") MATCH p = (a)-[*..2]-(b) WHERE id(a)>id(b) RETURN RELATIONSHIPS(p);");
                        q.resolve(neighboursResult);
                        return q.promise;
                    },
                    exploreCommonFriendsDeep: function (graph) {
                        var q = $q.defer();
                        var ids = graph.nodes().map(function (node) {
                            return node.id
                        });
                        var neighboursResult = Cypher.transaction().commit("START a = node(" + ids.join(",") + "), b = node(" + ids.join(",") + ") MATCH p=(a)-[*..3]-(b) WHERE id(a)<>id(b) RETURN p;");
                        q.resolve(neighboursResult);
                        return q.promise;
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").provider("GraphRenderer", [function () {
            return this.Renderer = function () {
                    function Renderer(opts) {
                        null == opts && (opts = {}),
                            angular.extend(this, opts),
                            null == this.onGraphChange && (this.onGraphChange = function () {}),
                            null == this.onTick && (this.onTick = function () {})
                    }

                    return Renderer
                }(),
                this.nodeRenderers = [],
                this.relationshipRenderers = [],
                this.nodesHasHover = false,
                this.$get = function () {
                    return {
                        nodeRenderers: this.nodeRenderers,
                        relationshipRenderers: this.relationshipRenderers,
                        Renderer: this.Renderer,
                        nodesHasHover: this.nodesHasHover
                    }
                },
                this
        }])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").provider("GraphStyle", [function () {
            var GraphStyle, Selector, StyleElement, StyleRule, provider;
            return provider = this,
                this.defaultStyle = {
                    node: {
                        diameter: "40px",
                        color: "#DFE1E3",
                        "border-color": "#D4D6D7",
                        "border-width": "2px",
                        "text-color-internal": "#000000",
                        caption: "{id}",
                        "font-size": "10px"
                    },
                    "node.Unknown": {
                        "border-color": "#D4D6D7",
                        "border-width": "2px",
                        "caption": "?",
                        "color": "#DFE1E3",
                        "diameter": "30px",
                        "font-size": "10px",
                        "text-color-internal": "#000000"
                    },
                    "node.Company": {
                        "border-color": "#0879b3",
                        "border-width": "2px",
                        "caption": "{name}",
                        "color": "#2394ce",
                        "diameter": "80px",
                        "font-size": "10px",
                        "text-color-internal": "#FFFFFF"
                    },
                    "node.Human": {
                        "border-color": "#DC4717",
                        "border-width": "2px",
                        "caption": "{name}",
                        "color": "#F25A29",
                        diameter: "40px",
                        "font-size": "10px",
                        "text-color-internal": "#FFFFFF"
                    },
                    "node.Lawsuit": {
                        "border-color": "#01a78a",
                        "border-width": "2px",
                        "caption": "{caseStr}",
                        color: "#0ac7a6",
                        diameter: "65px",
                        "font-size": "10px",
                        "text-color-internal": "#FFFFFF"
                    },
                    "node.PhoneRecord": {
                        "border-color": "#F3BA25",
                        "border-width": "2px",
                        "caption": "{phonetitle}",
                        color: "#FCC940",
                        diameter: "50px",
                        "font-size": "10px",
                        "text-color-internal": "#000000"
                    },
                    "node.AccountRecord": {
                        "border-color": "#EB5D6C",
                        "border-width": "2px",
                        "caption": "{moneytransfer}",
                        color: "#FF6C7C",
                        diameter: "65px",
                        "font-size": "10px",
                        "text-color-internal": "#FFFFFF"
                    },
                    "node.Dishonest": {
                        "border-color": "#EB5D6C",
                        "border-width": "2px",
                        "caption": "{caseCode}",
                        color: "#FF6C7C",
                        diameter: "65px",
                        "font-size": "10px",
                        "text-color-internal": "#FFFFFF"
                    },
                    relationship: {
                        color: "#D4D6D7",
                        "shaft-width": "1px",
                        "font-size": "8px",
                        padding: "3px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.invest": {
                        "border-color": "#DC4717",
                        "color": "#f19d43",
                        "font-size": "8px",
                        "padding": "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.invest_c": {
                        "border-color": "#DC4717",
                        "color": "#F25A29",
                        "font-size": "8px",
                        "padding": "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.invest_h": {
                        "border-color": "#DC4717",
                        "color": "#F25A29",
                        "font-size": "8px",
                        "padding": "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.own": {
                        color: "#cce198",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.branch": {
                        color: "#91abd1",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.participate": {
                        "border-color": "#46A39E",
                        color: "#80c2d8",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.involve": {
                        "border-color": "#46A39E",
                        color: "#6c9e81",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.transform": {
                        "border-color": "#DDAA00",
                        color: "#DDAA00",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.telecom": {
                        "border-color": "#D4D6D7",
                        color: "#30B6AF",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.relativ": {
                        "border-color": "#F3BA25",
                        color: "#AD62CE",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#000000"
                    },
                    "relationship.serve": {
                        "border-color": "#9453B1",
                        color: "#80c2d8",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    },
                    "relationship.dishonest": {
                        "border-color": "#EB5D6C",
                        color: "#FF6C7C",
                        "font-size": "8px",
                        padding: "3px",
                        "shaft-width": "2px",
                        "text-color-external": "#000000",
                        "text-color-internal": "#FFFFFF"
                    }
                },
                this.defaultSizes = [{
                        diameter: "10px"
                    },
                    {
                        diameter: "20px"
                    },
                    {
                        diameter: "30px"
                    },
                    {
                        diameter: "50px"
                    },
                    {
                        diameter: "65px"
                    },
                    {
                        diameter: "80px"
                    }
                ],
                this.defaultArrayWidths = [{
                        "shaft-width": "1px"
                    },
                    {
                        "shaft-width": "2px"
                    },
                    {
                        "shaft-width": "3px"
                    },
                    {
                        "shaft-width": "5px"
                    },
                    {
                        "shaft-width": "8px"
                    },
                    {
                        "shaft-width": "13px"
                    },
                    {
                        "shaft-width": "25px"
                    },
                    {
                        "shaft-width": "38px"
                    }
                ],
                this.defaultColors = [{
                        color: "#DFE1E3",
                        "border-color": "#D4D6D7",
                        "text-color-internal": "#000000"
                    },
                    {
                        color: "#F25A29",
                        "border-color": "#DC4717",
                        "text-color-internal": "#FFFFFF"
                    },
                    {
                        color: "#AD62CE",
                        "border-color": "#9453B1",
                        "text-color-internal": "#FFFFFF"
                    },
                    {
                        color: "#30B6AF",
                        "border-color": "#46A39E",
                        "text-color-internal": "#FFFFFF"
                    },
                    {
                        color: "#FF6C7C",
                        "border-color": "#EB5D6C",
                        "text-color-internal": "#FFFFFF"
                    },
                    {
                        color: "#FCC940",
                        "border-color": "#F3BA25",
                        "text-color-internal": "#000000"
                    },
                    {
                        color: "#4356C0",
                        "border-color": "#3445A2",
                        "text-color-internal": "#FFFFFF"
                    }
                ],
                Selector = function () {
                    function Selector(selector) {
                        var _ref;
                        _ref = selector.indexOf(".") > 0 ? selector.split(".") : [selector, void 0],
                            this.tag = _ref[0],
                            this.klass = _ref[1]
                    }

                    return Selector.prototype.toString = function () {
                            var str;
                            return str = this.tag,
                                null != this.klass && (str += "." + this.klass),
                                str
                        },
                        Selector
                }(),
                StyleRule = function () {
                    function StyleRule(selector, props) {
                        this.selector = selector,
                            this.props = props
                    }

                    return StyleRule.prototype.matches = function (selector) {
                            return this.selector.tag !== selector.tag || this.selector.klass !== selector.klass && this.selector.klass ? !1 : !0
                        },
                        StyleRule.prototype.matchesExact = function (selector) {
                            return this.selector.tag === selector.tag && this.selector.klass === selector.klass
                        },
                        StyleRule
                }(),
                StyleElement = function () {
                    function StyleElement(selector, data) {
                        this.data = data,
                            this.selector = selector,
                            this.props = {}
                    }

                    return StyleElement.prototype.applyRules = function (rules) {
                            var rule, _i, _j, _len, _len1;
                            for (_i = 0, _len = rules.length; _len > _i; _i++)
                                if (rule = rules[_i], rule.matches(this.selector)) {
                                    angular.extend(this.props, rule.props);
                                    break
                                }
                            for (_j = 0, _len1 = rules.length; _len1 > _j; _j++)
                                if (rule = rules[_j], rule.matchesExact(this.selector)) {
                                    angular.extend(this.props, rule.props);
                                    break
                                }
                            return this
                        },
                        StyleElement.prototype.get = function (attr) {
                            return this.props[attr] || ""
                        },
                        StyleElement
                }(),
                GraphStyle = function () {
                    function GraphStyle(storage) {
                        var e, _ref;
                        this.storage = storage,
                            this.rules = [];
                        try {
                            this.loadRules(null != (_ref = this.storage) ? _ref.get("grass") : void 0)
                        } catch (_error) {
                            e = _error
                        }
                    }

                    return GraphStyle.prototype.selector = function (item) {
                            return item.isNode ? this.nodeSelector(item) : item.isRelationship ? this.relationshipSelector(item) : void 0
                        },
                        GraphStyle.prototype.calculateStyle = function (selector, data) {
                            return new StyleElement(selector, data).applyRules(this.rules)
                        },
                        GraphStyle.prototype.forEntity = function (item) {
                            return this.calculateStyle(this.selector(item), item)
                        },
                        GraphStyle.prototype.forNode = function (node) {
                            var selector, _ref;
                            return null == node && (node = {}),
                                selector = this.nodeSelector(node),
                                (null != (_ref = node.labels) ? _ref.length : void 0) > 0 && this.setDefaultStyling(selector),
                                this.calculateStyle(selector, node)
                        },
                        GraphStyle.prototype.forRelationship = function (rel) {
                            return this.calculateStyle(this.relationshipSelector(rel), rel)
                        },
                        GraphStyle.prototype.findAvailableDefaultColor = function () {
                            var defaultColor, rule, usedColors, _i, _j, _len, _len1, _ref, _ref1;
                            for (usedColors = {},
                                _ref = this.rules, _i = 0, _len = _ref.length; _len > _i; _i++) rule = _ref[_i],
                                null != rule.props.color && (usedColors[rule.props.color] = !0);
                            for (_ref1 = provider.defaultColors, _j = 0, _len1 = _ref1.length; _len1 > _j; _j++)
                                if (defaultColor = _ref1[_j], null == usedColors[defaultColor.color]) return defaultColor;
                            return provider.defaultColors[0]
                        },
                        GraphStyle.prototype.setDefaultStyling = function (selector) {
                            var rule;
                            return rule = this.findRule(selector),
                                null == rule ? (rule = new StyleRule(selector, this.findAvailableDefaultColor()), this.rules.push(rule), this.persist()) : void 0
                        },
                        GraphStyle.prototype.change = function (item, props) {
                            var rule, selector;
                            selector = this.selector(item);
                            rule = this.findRule(selector);
                            null == rule && (rule = new StyleRule(selector, {}), this.rules.push(rule));
                            angular.extend(rule.props, props);
                            this.persist();
                            return rule;
                            // return selector = this.selector(item),
                            //     rule = this.findRule(selector),
                            // null == rule && (rule = new StyleRule(selector, {}), this.rules.push(rule)),
                            //     angular.extend(rule.props, props),
                            //     this.persist(),
                            //     rule
                        },
                        // GraphStyle.prototype.changeUnknown = function(item){
                        //     var type = item.propertyMap.companyId ? 'Company' : 'Human';
                        //     var rule, selector;
                        //     selector = new Selector('node.Unknown');
                        //     var selectorCompany = new Selector('node.Company');
                        //     var selectorHuman = new Selector('node.Human');
                        //     rule = this.findRule(selector);
                        //     var ruleCompany = this.findRule(selectorCompany);
                        //     var ruleHuman = this.findRule(selectorHuman);
                        //     if(type == 'Company'){
                        //         angular.extend(rule.props, ruleCompany.props);
                        //     }else{
                        //         angular.extend(rule.props, ruleHuman.props);
                        //     }
                        //     console.log('RULE--->', rule, 'TYPE--->', type);
                        //     return rule;
                        // },
                        GraphStyle.prototype.destroyRule = function (rule) {
                            var idx;
                            return idx = this.rules.indexOf(rule),
                                null != idx && this.rules.splice(idx, 1),
                                this.persist()
                        },
                        GraphStyle.prototype.findRule = function (selector) {
                            var r, rule, _i, _len, _ref;
                            for (_ref = this.rules, _i = 0, _len = _ref.length; _len > _i; _i++) r = _ref[_i],
                                r.matchesExact(selector) && (rule = r);
                            return rule
                        },
                        GraphStyle.prototype.nodeSelector = function (node) {
                            var selector, _ref;
                            return null == node && (node = {}),
                                selector = "node",
                                (null != (_ref = node.labels) ? _ref.length : void 0) > 0 && (selector += "." + node.labels[0]),
                                new Selector(selector)
                        },
                        GraphStyle.prototype.relationshipSelector = function (rel) {
                            var selector;
                            return null == rel && (rel = {}),
                                selector = "relationship",
                                null != rel.type && (selector += "." + rel.type),
                                new Selector(selector)
                        },
                        GraphStyle.prototype.importGrass = function (string) {
                            var e, rules;
                            try {
                                return rules = this.parse(string),
                                    this.loadRules(rules),
                                    this.persist()
                            } catch (_error) {
                                e = _error
                            }
                        },
                        GraphStyle.prototype.loadRules = function (data) {
                            var props, rule;
                            angular.isObject(data) || (data = provider.defaultStyle),
                                this.rules.length = 0;
                            for (rule in data) props = data[rule],
                                this.rules.push(new StyleRule(new Selector(rule), angular.copy(props)));
                            return this
                        },
                        GraphStyle.prototype.parse = function (string) {
                            var c, chars, insideProps, insideString, k, key, keyword, prop, props, rules, skipThis, v, val, _i, _j, _len, _len1, _ref, _ref1;
                            for (chars = string.split(""), insideString = !1, insideProps = !1, keyword = "", props = "", rules = {},
                                _i = 0, _len = chars.length; _len > _i; _i++) {
                                switch (c = chars[_i], skipThis = !0, c) {
                                    case "{":
                                        insideString ? skipThis = !1 : insideProps = !0;
                                        break;
                                    case "}":
                                        insideString ? skipThis = !1 : (insideProps = !1, rules[keyword] = props, keyword = "", props = "");
                                        break;
                                    case "'":
                                    case '"':
                                        insideString ^= !0;
                                        break;
                                    default:
                                        skipThis = !1
                                }
                                skipThis || (insideProps ? props += c : c.match(/[\s\n]/) || (keyword += c))
                            }
                            for (k in rules)
                                for (v = rules[k], rules[k] = {},
                                    _ref = v.split(";"), _j = 0, _len1 = _ref.length; _len1 > _j; _j++) prop = _ref[_j],
                                    _ref1 = prop.split(":"),
                                    key = _ref1[0],
                                    val = _ref1[1],
                                    key && val && (rules[k][null != key ? key.trim() : void 0] = null != val ? val.trim() : void 0);
                            return rules
                        },
                        GraphStyle.prototype.persist = function () {
                            var _ref;
                            return null != (_ref = this.storage) ? _ref.add("grass", JSON.stringify(this.toSheet())) : void 0
                        },
                        GraphStyle.prototype.resetToDefault = function () {
                            return this.loadRules(),
                                this.persist()
                        },
                        GraphStyle.prototype.toSheet = function () {
                            var rule, sheet, _i, _len, _ref;
                            for (sheet = {},
                                _ref = this.rules, _i = 0, _len = _ref.length; _len > _i; _i++) rule = _ref[_i],
                                sheet[rule.selector.toString()] = rule.props;
                            return sheet
                        },
                        GraphStyle.prototype.toString = function () {
                            var k, r, str, v, _i, _len, _ref, _ref1;
                            for (str = "", _ref = this.rules, _i = 0, _len = _ref.length; _len > _i; _i++) {
                                r = _ref[_i],
                                    str += r.selector.toString() + " {\n",
                                    _ref1 = r.props;
                                for (k in _ref1) v = _ref1[k],
                                    "caption" === k && (v = "'" + v + "'"),
                                    str += "  " + k + ": " + v + ";\n";
                                str += "}\n\n"
                            }
                            return str
                        },
                        GraphStyle.prototype.nextDefaultColor = 0,
                        GraphStyle.prototype.defaultSizes = function () {
                            return provider.defaultSizes
                        },
                        GraphStyle.prototype.defaultArrayWidths = function () {
                            return provider.defaultArrayWidths
                        },
                        GraphStyle.prototype.defaultColors = function () {
                            return angular.copy(provider.defaultColors)
                        },
                        GraphStyle.prototype.interpolate = function (str, id, properties) {
                            return str.replace(/\{([^{}]*)\}/g,
                                function (a, b) {
                                    var r;
                                    return r = properties[b] || id,
                                        "string" == typeof r || "number" == typeof r ? r : a
                                })
                        },
                        GraphStyle
                }(),
                this.$get = ["localStorageService",
                    function (localStorageService) {
                        return new GraphStyle(localStorageService)
                    }
                ],
                this
        }])
    }.call(this),
    //=========LS BEGIN===========
    function () {
        "use strict";
        angular.module("neo4jApp.services").service("GraphDisplay", ["$rootScope", "GraphStyle",
            function ($rootScope, GraphStyle) {
                var relationshipShowStatus = {};
                relationshipShowStatus["own"] = true;
                relationshipShowStatus["invest"] = true;
                relationshipShowStatus["serve"] = true;
                relationshipShowStatus["branch"] = true;
                relationshipShowStatus["participate"] = true;
                relationshipShowStatus["relativ"] = true;
                relationshipShowStatus["dishonest"] = true;
                relationshipShowStatus["invest_c"] = true;
                relationshipShowStatus["invest_h"] = true;
                relationshipShowStatus["involve"] = true;
                relationshipShowStatus["transform"] = true;
                relationshipShowStatus["telecom"] = true;

                $rootScope.relationshipShowStatusChange = 0;

                this.getRelationshipStatus = function (name) {
                    return relationshipShowStatus[name];
                };

                this.clickRelationshipStatus = function (name) {
                    relationshipShowStatus[name] = !relationshipShowStatus[name];
                    $rootScope.relationshipShowStatusChange++;
                };

                return this;
            }
        ])
    }.call(this),
    //=========LS END==========
    function () {
        "use strict";
        angular.module("neo4jApp.services").service("GraphGeometry", ["GraphStyle", "TextMeasurement",
            function (GraphStyle, TextMeasurent) {
                var captionFitsInsideArrowShaftWidth, formatNodeCaptions, layoutRelationships, measureRelationshipCaption, measureRelationshipCaptions, setNodeRadii, shortenCaption, square, getRelationCaption;
                var formatNodeText1, formatNodeText2;
                return square = function (distance) {
                        return distance * distance
                    },
                    setNodeRadii = function (nodes) {
                        var node, _i, _len, _results;
                        for (_results = [], _i = 0, _len = nodes.length; _len > _i; _i++) node = nodes[_i],
                            _results.push(node.radius = parseFloat(GraphStyle.forNode(node).get("diameter")) / 2);
                        return _results
                    },
                    formatNodeText1 = function (input, splitLength) {
                        var result = "";
                        var i = 0;
                        for (; i < input.length / splitLength; i++) {
                            result += input.substr(i * splitLength, splitLength) + " ";
                        }
                        if (input.length > i * splitLength) {
                            result += input.substr(i * splitLength);
                        } else {
                            result = result.substr(0, result.length - 1);
                        }
                        return result;
                    },
                    formatNodeText2 = function (input, splitLength) {
                        var result = "";
                        if (input != null) {
                            if (input.length <= splitLength * 2) {
                                var i = 0;
                                for (; i < input.length / splitLength; i++) {
                                    result += input.substr(i * splitLength, splitLength) + " ";
                                }
                                if (input.length > i * splitLength) {
                                    result += input.substr(i * splitLength);
                                } else {
                                    result = result.substr(0, result.length - 1);
                                }
                            } else {
                                var split1 = Math.ceil(input.length * 0.3);
                                var split2 = Math.ceil(input.length * 0.7);
                                result += input.substr(0, split1) + " ";
                                result += input.substr(split1, split2 - split1) + " ";
                                result += input.substr(split2);
                            }
                        }
                        return result;
                    },
                    formatNodeCaptions = function (nodes) {
                        var captionText, i, lines, node, template, words, _i, _j, _len, _ref, _results;
                        var splitLength = 7;
                        for (_results = [], _i = 0, _len = nodes.length; _len > _i; _i++) {
                            for (node = nodes[_i], template = GraphStyle.forNode(node).get("caption"), captionText = GraphStyle.interpolate(template, node.id, node.propertyMap), captionText = formatNodeText2(captionText, splitLength), words = captionText.split(" "), lines = [], i = _j = 0, _ref = words.length - 1; _ref >= 0 ? _ref >= _j : _j >= _ref; i = _ref >= 0 ? ++_j : --_j) lines.push({
                                node: node,
                                text: words[i],
                                baseline: 10 * (1 + i - words.length / 2)
                            });
                            _results.push(node.caption = lines)
                        }
                        return _results
                    },
                    measureRelationshipCaption = function (relationship, caption) {
                        var fontFamily, fontSize, padding;
                        return fontFamily = "sans-serif",
                            fontSize = parseFloat(GraphStyle.forRelationship(relationship).get("font-size")),
                            padding = parseFloat(GraphStyle.forRelationship(relationship).get("padding")),
                            TextMeasurent.measure(caption, fontFamily, fontSize) + 2 * padding
                    },
                    captionFitsInsideArrowShaftWidth = function (relationship) {
                        return parseFloat(GraphStyle.forRelationship(relationship).get("shaft-width")) > parseFloat(GraphStyle.forRelationship(relationship).get("font-size"))
                    },
                    measureRelationshipCaptions = function (relationships) {
                        var relationship, _i, _len, _results;
                        for (_results = [], _i = 0, _len = relationships.length; _len > _i; _i++) relationship = relationships[_i],
                            relationship.captionLength = measureRelationshipCaption(relationship, relationship.type),
                            _results.push(relationship.captionLayout = captionFitsInsideArrowShaftWidth(relationship) ? "internal" : "external");
                        return _results
                    },
                    getRelationCaption = function (relationship) {
                        var caption = relationship.type;
                        if (relationship.type == "own") {
                            caption = "法人";
                        } else if (relationship.type == "invest" || relationship.type == "invest_c" || relationship.type == "invest_h") {
                            caption = "投资" + (relationship.propertyMap['amount'] == 0.0 ? "额未知" : (relationship.propertyMap['amount'] + "万"));
                            if (relationship.propertyMap['ownershipStake'] != null && relationship.propertyMap['ownershipStake'] != "-")
                                caption = caption + "（" + relationship.propertyMap['ownershipStake'] + "%）";
                        } else if (relationship.type == "branch") {
                            caption = "分支机构";
                        } else if (relationship.type == "serve") {
                            caption = "职务:" + relationship.propertyMap['staffTypeName'];
                        } else if (relationship.type == "relativ") {
                            caption = "关系:" + relationship.propertyMap['relation'];
                        } else if (relationship.type == "involve") {
                            caption = "涉及";
                        } else if (relationship.type == "telecom") {
                            caption = relationship.propertyMap['phonetitle'];
                        } else if (relationship.type == "transform") {
                            caption = relationship.propertyMap['title'] + relationship.propertyMap['moneytransfer'];
                        } else if (relationship.type == "participate") {
                            var role = relationship.propertyMap['role']
                            if (role == 1)
                                caption = "上诉方";
                            else
                                caption = "被诉方";
                        } else if (relationship.type == "dishonest") {
                            caption = "失信人";
                        }
                        return caption;
                    },
                    shortenCaption = function (relationship, caption, targetWidth) {
                        var shortCaption, width;
                        caption = getRelationCaption(relationship);
                        for (shortCaption = caption;;) {
                            if (shortCaption.length <= 2) return ["", 0];
                            if (shortCaption = shortCaption.substr(0, shortCaption.length - 2) + "…", width = measureRelationshipCaption(relationship, shortCaption), targetWidth > width) return [shortCaption, width]
                        }
                    },
                    layoutRelationships = function (relationships) {
                        var alongPath, dx, dy, endBreak, headHeight, headRadius, length, relationship, shaftLength, shaftRadius, startBreak, _i, _len, _ref, _results;
                        var relCountMap = {},
                            relCountKey, relCount;
                        var trackRadius = 33; //默认轨迹半径为33
                        for (_results = [], _i = 0, _len = relationships.length; _len > _i; _i++) {
                            relationship = relationships[_i];
                            var offset = 0,
                                caption, reverse = false;
                            caption = getRelationCaption(relationship);
                            relCountKey = relationship.source.id <= relationship.target.id ? relationship.source.id + "_" + relationship.target.id : relationship.target.id + "_" + relationship.source.id;
                            //                            relCountKey = relationship.source.id+"_"+relationship.target.id;
                            relCount = (relCountMap[relCountKey] == null && relCountMap[relationship.target.id + "_" + relationship.source.id] == null) ? 1 : relCountMap[relCountKey] + 1;
                            relCountMap[relCountKey] = relCount;
                            if (relationship.source.id > relationship.target.id) {
                                reverse = true;
                            }
                            //console.log(relCountKey+":"+relCount);
                            //设置偏移量像素
                            if (relCount == 1)
                                offset = 0;
                            else if (relCount == 2)
                                offset = 11;
                            else if (relCount == 3)
                                offset = -11;
                            else if (relCount == 4)
                                offset = 20;
                            else if (relCount == 5)
                                offset = -20;
                            if (reverse) {
                                offset = -offset;
                            }
                            dx = relationship.target.x - relationship.source.x;
                            dy = relationship.target.y - relationship.source.y;
                            length = Math.sqrt(square(dx) + square(dy));
                            var target = {},
                                source = {};
                            if (offset != 0) { //根据圆心间的连线，计算偏移量为offset的直线与两圆的不同交点（offset为0时同样适用）
                                var trackAoS = 0,
                                    trackAoT = 0;
                                if (Math.abs(offset) >= relationship.source.radius) {
                                    offset = relationship.source.radius;
                                }
                                trackAoS = Math.asin(offset / relationship.source.radius);
                                if (Math.abs(offset) >= relationship.target.radius) {
                                    offset = relationship.target.radius;
                                }
                                trackAoT = Math.asin(offset / relationship.target.radius);
                                var s = {};
                                s.x = relationship.source.x;
                                s.y = relationship.source.y;
                                var t = {};
                                t.x = relationship.target.x;
                                t.y = relationship.target.y;
                                var position = {};
                                position.s = {};
                                position.t = {};

                                position.s.x = (relationship.source.radius / length) * (Math.cos(trackAoS) * (t.x - s.x) - Math.sin(trackAoS) * (t.y - s.y)) + s.x;
                                position.s.y = (relationship.source.radius / length) * (Math.sin(trackAoS) * (t.x - s.x) + Math.cos(trackAoS) * (t.y - s.y)) + s.y;
                                position.t.x = (relationship.target.radius / length) * (Math.cos(-trackAoT) * (s.x - t.x) - Math.sin(-trackAoT) * (s.y - t.y)) + t.x;
                                position.t.y = (relationship.target.radius / length) * (Math.sin(-trackAoT) * (s.x - t.x) + Math.cos(-trackAoT) * (s.y - t.y)) + t.y;
                                target.x = position.t.x;
                                target.y = position.t.y;
                                source.x = position.s.x;
                                source.y = position.s.y;
                                dx = target.x - source.x;
                                dy = target.y - source.y;
                                length = Math.sqrt(square(dx) + square(dy));
                                relationship.arrowLength = length;
                                alongPath = function (from, distance) {
                                    return {
                                        x: from.x + dx * distance / length,
                                        y: from.y + dy * distance / length
                                    }
                                };

                                shaftRadius = parseFloat(GraphStyle.forRelationship(relationship).get("shaft-width")) / 2;
                                headRadius = shaftRadius + 3;
                                headHeight = 2 * headRadius;
                                shaftLength = relationship.arrowLength - headHeight;
                                relationship.startPoint = source;
                                relationship.endPoint = target;
                                relationship.midShaftPoint = alongPath(relationship.startPoint, shaftLength / 2);

                            } else { //旧的计算偏移量方法
                                target.x = relationship.target.x + dy * offset / length;
                                target.y = relationship.target.y + dx * offset / length;
                                source.x = relationship.source.x + dy * offset / length;
                                source.y = relationship.source.y + dx * offset / length;
                                relationship.arrowLength = length - relationship.source.radius - relationship.target.radius;
                                alongPath = function (from, distance) {
                                    return {
                                        x: from.x + dx * distance / length,
                                        y: from.y + dy * distance / length
                                    }
                                };

                                shaftRadius = parseFloat(GraphStyle.forRelationship(relationship).get("shaft-width")) / 2;
                                headRadius = shaftRadius + 3;
                                headHeight = 2 * headRadius;
                                shaftLength = relationship.arrowLength - headHeight;
                                relationship.startPoint = alongPath(source, relationship.source.radius);
                                relationship.endPoint = alongPath(target, -relationship.target.radius);
                                relationship.midShaftPoint = alongPath(relationship.startPoint, shaftLength / 2);
                            }
                            relationship.angle = Math.atan2(dy, dx) / Math.PI * 180;
                            relationship.textAngle = relationship.angle;
                            (relationship.angle < -90 || relationship.angle > 90) && (relationship.textAngle += 180);
                            _ref = shaftLength > relationship.captionLength ? [caption, measureRelationshipCaption(relationship, caption)] : shortenCaption(relationship, relationship.type, shaftLength);
                            relationship.shortCaption = _ref[0];
                            relationship.shortCaptionLength = _ref[1];
                            if ("external" === relationship.captionLayout) {
                                startBreak = (shaftLength - relationship.shortCaptionLength) / 2;
                                endBreak = shaftLength - startBreak;
                                _results.push(relationship.arrowOutline = ["M", 0, shaftRadius, "L", startBreak, shaftRadius, "L", startBreak, -shaftRadius, "L", 0, -shaftRadius, "Z", "M", endBreak, shaftRadius, "L", shaftLength, shaftRadius, "L", shaftLength, headRadius, "L", relationship.arrowLength, 0, "L", shaftLength, -headRadius, "L", shaftLength, -shaftRadius, "L", endBreak, -shaftRadius, "Z"].join(" "));

                            } else {
                                _results.push(relationship.arrowOutline = ["M", 0, shaftRadius, "L", shaftLength, shaftRadius, "L", shaftLength, headRadius, "L", relationship.arrowLength, 0, "L", shaftLength, -headRadius, "L", shaftLength, -shaftRadius, "L", 0, -shaftRadius, "Z"].join(" "));
                            }

                        }
                        return _results
                    },
                    this.onGraphChange = function (graph) {
                        return setNodeRadii(graph.nodes()),
                            formatNodeCaptions(graph.nodes()),
                            measureRelationshipCaptions(graph.relationships())
                    },
                    this.onTick = function (graph) {
                        return layoutRelationships(graph.relationships())
                    },
                    this
            }
        ])
    }.
call(this),
    function () {
        "use strict";
        angular.module("neo4jApp").service("TextMeasurement",
            function () {
                var cache, measureUsingCanvas;
                return measureUsingCanvas = function (text, font) {
                        var canvas, canvasSelection, context;
                        return canvasSelection = d3.select("canvas#textMeasurementCanvas").data([this]),
                            canvasSelection.enter().append("canvas").attr("id", "textMeasuringCanvas").style("display", "none"),
                            canvas = canvasSelection.node(),
                            context = canvas.getContext("2d"),
                            context.font = font,
                            context.measureText(text).width
                    },
                    cache = function () {
                        var cacheSize, list, map;
                        return cacheSize = 1e4,
                            map = {},
                            list = [],
                            function (key, calc) {
                                var cached, result;
                                return cached = map[key],
                                    cached ? cached : (result = calc(), list.length > cacheSize && (delete map[list.splice(0, 1)], list.push(key)), map[key] = result)
                            }
                    }(),
                    this.measure = function (text, fontFamily, fontSize) {
                        var font;
                        return font = "normal normal normal " + fontSize + "px/normal " + fontFamily,
                            cache(text + font,
                                function () {
                                    return measureUsingCanvas(text, font)
                                })
                    },
                    this
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").service("CircularLayout",
            function () {
                var CircularLayout;
                return CircularLayout = {},
                    CircularLayout.layout = function (nodes, center, radius) {
                        var i, n, unlocatedNodes, _i, _len, _results;
                        for (unlocatedNodes = nodes.filter(function (node) {
                                return !(null != node.x && null != node.y)
                            }), _results = [], i = _i = 0, _len = unlocatedNodes.length; _len > _i; i = ++_i) n = unlocatedNodes[i],
                            n.x = center.x + radius * Math.sin(2 * Math.PI * i / unlocatedNodes.length),
                            _results.push(n.y = center.y + radius * Math.cos(2 * Math.PI * i / unlocatedNodes.length));
                        return _results
                    },
                    CircularLayout
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").service("CircumferentialDistribution",
            function () {
                return this.distribute = function (arrowAngles, minSeparation) {
                        var angle, center, expand, i, key, length, list, rawAngle, result, run, runLength, runsOfTooDenseArrows, tooDense, wrapAngle, wrapIndex, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3;
                        list = [],
                            _ref = arrowAngles.floating;
                        for (key in _ref) angle = _ref[key],
                            list.push({
                                key: key,
                                angle: angle
                            });
                        for (list.sort(function (a, b) {
                                return a.angle - b.angle
                            }), runsOfTooDenseArrows = [], length = function (startIndex, endIndex) {
                                return endIndex > startIndex ? endIndex - startIndex + 1 : endIndex + list.length - startIndex + 1
                            },
                            angle = function (startIndex, endIndex) {
                                return endIndex > startIndex ? list[endIndex].angle - list[startIndex].angle : 360 - (list[startIndex].angle - list[endIndex].angle)
                            },
                            tooDense = function (startIndex, endIndex) {
                                return angle(startIndex, endIndex) < length(startIndex, endIndex) * minSeparation
                            },
                            wrapIndex = function (index) {
                                return -1 === index ? list.length - 1 : index >= list.length ? index - list.length : index
                            },
                            wrapAngle = function (angle) {
                                return angle >= 360 ? angle - 360 : angle
                            },
                            expand = function (startIndex, endIndex) {
                                if (length(startIndex, endIndex) < list.length) {
                                    if (tooDense(startIndex, wrapIndex(endIndex + 1))) return expand(startIndex, wrapIndex(endIndex + 1));
                                    if (tooDense(wrapIndex(startIndex - 1), endIndex)) return expand(wrapIndex(startIndex - 1), endIndex)
                                }
                                return runsOfTooDenseArrows.push({
                                    start: startIndex,
                                    end: endIndex
                                })
                            },
                            i = _i = 0, _ref1 = list.length - 2; _ref1 >= 0 ? _ref1 >= _i : _i >= _ref1; i = _ref1 >= 0 ? ++_i : --_i) tooDense(i, i + 1) && expand(i, i + 1);
                        for (result = {},
                            _j = 0, _len = runsOfTooDenseArrows.length; _len > _j; _j++)
                            for (run = runsOfTooDenseArrows[_j], center = list[run.start].angle + angle(run.start, run.end) / 2, runLength = length(run.start, run.end), i = _k = 0, _ref2 = runLength - 1; _ref2 >= 0 ? _ref2 >= _k : _k >= _ref2; i = _ref2 >= 0 ? ++_k : --_k) rawAngle = center + (i - (runLength - 1) / 2) * minSeparation,
                                result[list[wrapIndex(run.start + i)].key] = wrapAngle(rawAngle);
                        _ref3 = arrowAngles.floating;
                        for (key in _ref3) angle = _ref3[key],
                            result[key] || (result[key] = arrowAngles.floating[key]);
                        return result
                    },
                    this
            })
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("InspectorCtrl", ["$scope", "GraphStyle",
            function ($scope, GraphStyle) {
                return $scope.sizes = GraphStyle.defaultSizes(),
                    $scope.arrowWidths = GraphStyle.defaultArrayWidths(),
                    $scope.colors = GraphStyle.defaultColors(),
                    $scope.style = {
                        color: $scope.colors[0].color,
                        "border-color": $scope.colors[0]["border-color"],
                        diameter: $scope.sizes[0].diameter
                    },
                    $scope.$watch("selectedGraphItem",
                        function (item) {
                            return item ? ($scope.item = item, $scope.style = GraphStyle.forEntity(item).props, $scope.style.caption ? $scope.selectedCaption = $scope.style.caption.replace(/\{([^{}]*)\}/, "$1") : void 0) : void 0
                        }),
                    $scope.selectSize = function (size) {
                        return $scope.style.diameter = size.diameter,
                            $scope.saveStyle()
                    },
                    $scope.selectArrowWidth = function (arrowWidth) {
                        return $scope.style["shaft-width"] = arrowWidth["shaft-width"],
                            $scope.saveStyle()
                    },
                    $scope.selectScheme = function (color) {
                        return $scope.style.color = color.color,
                            $scope.style["border-color"] = color["border-color"],
                            $scope.style["text-color-internal"] = color["text-color-internal"],
                            $scope.saveStyle()
                    },
                    $scope.selectCaption = function (caption) {
                        return $scope.selectedCaption = caption,
                            $scope.style.caption = "{" + caption + "}",
                            $scope.saveStyle()
                    },
                    $scope.saveStyle = function () {
                        return GraphStyle.change($scope.item, $scope.style)
                    }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("inspector", ["$dialog",
            function ($dialog) {
                return {
                    restrict: "EA",
                    terminal: !0,
                    link: function (scope, element, attrs) {
                        var dialog, opts, shownExpr;
                        return opts = {
                                backdrop: !1,
                                dialogClass: "inspector",
                                dialogFade: !0,
                                keyboard: !1,
                                template: element.html(),
                                resolve: {
                                    $scope: function () {
                                        return scope
                                    }
                                }
                            },
                            dialog = $dialog.dialog(opts),
                            dialog.backdropEl.remove(),
                            dialog.modalEl.css({
                                position: "absolute",
                                top: element.css("top"),
                                right: element.css("right")
                            }),
                            element.remove(),
                            shownExpr = attrs.inspector || attrs.show,
                            scope.$watch(shownExpr,
                                function (val) {
                                    var _base;
                                    return val ? (dialog.open(), "function" == typeof (_base = dialog.modalEl).draggable ? _base.draggable({
                                        handle: ".header"
                                    }) : void 0) : dialog.isOpen() ? dialog.close() : void 0
                                })
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp").controller("LegendCtrl", ["$rootScope", "$scope", "Frame", "GraphStyle", "GraphDisplay", "GraphExplorer",
            function ($rootScope, $scope, resultFrame, graphStyle, graphDisplay, graphExplorer) {
                var graphChanged, update;
                return $scope.graph = null,
                    update = function (graph) {
                        window.graphf = graph;
                        window.graphStylef = graphStyle;
                        var label, node, resultLabels, resultRules, rule, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
                        var relationship, resultRelationshipLabels;
                        for (resultLabels = {},
                            _ref = graph.nodes(), _i = 0, _len = _ref.length; _len > _i; _i++)
                            for (node = _ref[_i], _ref1 = node.labels, _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) label = _ref1[_j],
                                resultLabels[label] = (resultLabels[label] || 0) + 1;
                        //====  LS Begin======
                        for (_ref = graph.relationships(), _i = 0, _len = _ref.length; _len > _i; _i++) {
                            relationship = _ref[_i], _ref1 = relationship.type;
                            resultLabels[_ref1] = (resultLabels[_ref1] || 0) + 1;
                        }
                        //====  LS End======
                        for (resultRules = [], _ref2 = graphStyle.rules, _k = 0, _len2 = _ref2.length; _len2 > _k; _k++) {
                            rule = _ref2[_k];
                            //====  LS Begin======
                            if (resultLabels.hasOwnProperty(rule.selector.klass)) {
                                if (rule.selector.klass == "Company")
                                    rule.selector.fakeKlass = "公司";
                                else if (rule.selector.klass == "Human")
                                    rule.selector.fakeKlass = "自然人";
                                else if (rule.selector.klass == "Lawsuit")
                                    rule.selector.fakeKlass = "诉讼";
                                else if (rule.selector.klass == "AccountRecord")
                                    rule.selector.fakeKlass = "账户交易记录";
                                else if (rule.selector.klass == "PhoneRecord")
                                    rule.selector.fakeKlass = "通信记录";
                                else if (rule.selector.klass == "own")
                                    rule.selector.fakeKlass = "法人关系";
                                else if (rule.selector.klass == "invest")
                                    rule.selector.fakeKlass = "投资关系";
                                else if (rule.selector.klass == "invest_c")
                                    rule.selector.fakeKlass = "企业投资关系";
                                else if (rule.selector.klass == "invest_h")
                                    rule.selector.fakeKlass = "个人投资关系";
                                else if (rule.selector.klass == "serve")
                                    rule.selector.fakeKlass = "任职关系";
                                else if (rule.selector.klass == "participate")
                                    rule.selector.fakeKlass = "诉讼关系";
                                else if (rule.selector.klass == "branch")
                                    rule.selector.fakeKlass = "分支关系";
                                else if (rule.selector.klass == "relativ")
                                    rule.selector.fakeKlass = "户籍关系";
                                else if (rule.selector.klass == "transform")
                                    rule.selector.fakeKlass = "账户交易记录";
                                else if (rule.selector.klass == "telecom")
                                    rule.selector.fakeKlass = "通信记录";
                                else if (rule.selector.klass == "involve")
                                    rule.selector.fakeKlass = "诉讼关系";
                                else if (rule.selector.klass == "dishonest")
                                    rule.selector.fakeKlass = "失信关系";
                                else if (rule.selector.klass == 'Unknown')
                                    rule.selector.fakeKlass = '?'
                            }
                            //====  LS End======
                            resultLabels.hasOwnProperty(rule.selector.klass) && resultRules.push(rule);
                        }
                        return $scope.rules = resultRules
                    },
                    $scope.$watch("frame.response",
                        function (frameResponse) {
                            return frameResponse ? frameResponse.graph ? ($scope.graph = frameResponse.graph, update(frameResponse.graph)) : void 0 : void 0
                        }),
                    graphChanged = function (event, graph) {
                        return graph === $scope.graph ? update(graph) : void 0
                    },
                    $scope.$on("graph:changed", graphChanged),
                    $scope.rules = [],
                    $scope.isNode = function (rule) {
                        return "node" === rule.selector.tag
                    },
                    $scope.isRelationship = function (rule) {
                        return "relationship" === rule.selector.tag
                    },
                    $scope.remove = function (rule) {
                        return graphStyle.destroyRule(rule)
                    },
                    $scope.clickRelationship = function (klass) {
                        graphDisplay.clickRelationshipStatus(klass);
                    },
                    $scope.showRelationship = function (klass) {
                        return graphDisplay.getRelationshipStatus(klass);
                    },
                    $scope.discoverCommonFriends = function () {
                        if ($scope.$parent.selectNodes != null) {
                            $rootScope.showLoading = true;
                            graphExplorer.exploreCommonFriendsWithInternalRelationshipsBySelected($scope.graph, $scope.$parent.selectNodes, 'discover').then(function () {
                                $rootScope.showLoading = false;
                                //                         $scope.$parent.selectNodes.push({test:1});
                                $rootScope.$broadcast("graph:reallyChanged", $scope.graph);
                            }, function (msg) {
                                return alert(msg);
                            });
                        }
                    }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("StylePreviewCtrl", ["$scope", "$window", "GraphStyle",
            function ($scope, $window, GraphStyle) {
                var serialize;
                return serialize = function () {
                        return $scope.code = GraphStyle.toString()
                    },
                    $scope.rules = GraphStyle.rules,
                    $scope.$watch("rules", serialize, !0),
                    $scope["import"] = function (content) {
                        return GraphStyle.importGrass(content)
                    },
                    $scope.reset = function () {
                        return GraphStyle.resetToDefault()
                    },
                    serialize()
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("CypherResultCtrl", ["$rootScope", "$scope", "Frame",
            function ($rootScope, $scope, Frame) {
                var testData;
                $scope.rangeData;
                $scope.showTimeLine = true;
                $scope.changeTimeLine = 0;
                $scope.showTracks = false;
                return $scope.setTracksShow = function () { //控制运动轨迹显隐
                        $scope.showTracks = !$scope.showTracks;
                        $scope.$broadcast("changeTracksShow", $scope.showTracks);
                    }, $scope.setMainFrame = function (frame) { //设置当前画布frame为主frame
                        if (frame.isMain) {
                            frame.isMain = !frame.isMain;
                        } else {
                            for (var i = 0; i < Frame.items.length; i++) {
                                Frame.items[i].isMain = false;
                            }
                            frame.isMain = true;
                        }
                    }, $scope.reDrawTimeLine = function () {
                        $scope.$broadcast("reDrawTimeLine");
                    },
                    $scope.$on("emit-graph:changed", function (event, graph) {
                        if (graph == null) return;
                        ++$scope.changeTimeLine;
                    }), $scope.$watch("rangeData", function () {
                        //                         console.log("XXXXXXXXXXXXXXXXX");
                        //                         console.log($scope.rangeData);
                        $scope.$broadcast("disableUnInRangeRelations", $scope.rangeData);
                    }), $scope.removeUnInRange = function (frame) {
                        //                         console.log($scope);
                        $scope.$broadcast("removeUnInRangeRelations", $scope.rangeData);
                        //                         console.log(frame);
                        //                         console.log($scope.rangeData);
                    }, $scope.$watch("frame.response",
                        function (resp) {
                            console.log("============================================================== fram is change");
                            var showGraph;
                            return resp ? ($scope.tab = $rootScope.stickyTab, null == $scope.tab ? (showGraph = resp.table.nodes.length, $scope.tab = showGraph ? "graph" : "table") : void 0) : void 0
                        }),
                    $scope.setActive = function (tab) {
                        return $rootScope.stickyTab = $scope.tab = tab
                    },
                    $scope.isActive = function (tab) {
                        return tab === $scope.tab
                    },
                    $scope.selectNodes = [],
                    $scope.resultStatistics = function (frame) {
                        var field, fields, joinedMessages, messages, nonZeroFields, stats;
                        return (null != frame ? frame.response : void 0) ? (stats = frame.response.table.stats, fields = [{
                                plural: "constraints",
                                singular: "constraint",
                                verb: "added",
                                field: "constraints_added"
                            },
                            {
                                plural: "constraints",
                                singular: "constraint",
                                verb: "removed",
                                field: "constraints_removed"
                            },
                            {
                                plural: "indexes",
                                singular: "index",
                                verb: "added",
                                field: "indexes_added"
                            },
                            {
                                plural: "indexes",
                                singular: "index",
                                verb: "removed",
                                field: "indexes_removed"
                            },
                            {
                                plural: "labels",
                                singular: "label",
                                verb: "added",
                                field: "labels_added"
                            },
                            {
                                plural: "labels",
                                singular: "label",
                                verb: "removed",
                                field: "labels_removed"
                            },
                            {
                                plural: "nodes",
                                singular: "node",
                                verb: "created",
                                field: "nodes_created"
                            },
                            {
                                plural: "nodes",
                                singular: "node",
                                verb: "deleted",
                                field: "nodes_deleted"
                            },
                            {
                                plural: "properties",
                                singular: "property",
                                verb: "set",
                                field: "properties_set"
                            },
                            {
                                plural: "relationships",
                                singular: "relationship",
                                verb: "deleted",
                                field: "relationship_deleted"
                            },
                            {
                                plural: "relationships",
                                singular: "relationship",
                                verb: "created",
                                field: "relationships_created"
                            }
                        ], nonZeroFields = fields.filter(function (field) {
                            return stats[field.field] > 0
                        }), messages = function () {
                            var _i, _len, _results;
                            for (_results = [], _i = 0, _len = nonZeroFields.length; _len > _i; _i++) field = nonZeroFields[_i],
                                _results.push("" + field.verb + " " + stats[field.field] + " " + (1 === stats[field.field] ? field.singular : field.plural));
                            return _results
                        }(), messages.push("returned " + frame.response.table.size + " " + (1 === frame.response.table.size ? "row" : "rows")), joinedMessages = messages.join(", "), "" + joinedMessages.substring(0, 1).toUpperCase() + joinedMessages.substring(1)) : void 0
                    }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("motdService", ["$log", "rssFeedService",
            function ($log, rssFeedService) {
                var Motd;
                return new(Motd = function () {
                    function Motd() {
                        this.refresh()
                    }

                    var choices;
                    return choices = {
                            quotes: [{
                                    text: "When you label me, you negate me.",
                                    author: "Soren Kierkegaard"
                                },
                                {
                                    text: "In the beginning was the command line.",
                                    author: "Neal Stephenson"
                                },
                                {
                                    text: "Remember, all I'm offering is the truth – nothing more.",
                                    author: "Morpheus"
                                },
                                {
                                    text: "Testing can show the presence of bugs, but never their absence.",
                                    author: "Edsger W. Dijkstra"
                                },
                                {
                                    text: "We think your graph is a special snowflake.",
                                    author: "Neo4j"
                                },
                                {
                                    text: "Still he'd see the matrix in his sleep, bright lattices of logic unfolding across that colorless void.",
                                    author: "William Gibson"
                                },
                                {
                                    text: "Eventually everything connects.",
                                    author: "Charles Eames"
                                },
                                {
                                    text: "To develop a complete mind: study the science of art. Study the art of science. Develop your senses - especially learn how to see. Realize that everything connects to everything else.",
                                    author: "Leonardo da Vinci"
                                }
                            ],
                            tips: ["Use <shift-return> for multi-line, <cmd-return> to evaluate command", "Navigate history with <ctrl- up/down arrow>", "When in doubt, ask for :help"],
                            unrecognizable: ["Interesting. How does this make you feel?", "Even if I squint, I can't make out what that is. Is it an elephant?", "This one time, at bandcamp...", "Ineffable, enigmatic, possibly transcendent. Also quite good looking.", "I'm not (yet) smart enough to understand this.", "Oh I agree. Kaaviot ovat suuria!"],
                            emptiness: ["No nodes. Know nodes?", "Waiting for the big bang of data.", "Ready for anything.", "Every graph starts with the first node."],
                            disconnected: ["Please check if the cord is unplugged."],
                            callToAction: [{
                                d: "Every good graph starts with Neo4j.",
                                u: "http://neo4j.org"
                            }]
                        },
                        Motd.prototype.quote = "",
                        Motd.prototype.tip = "",
                        Motd.prototype.unrecognized = "",
                        Motd.prototype.emptiness = "",
                        Motd.prototype.refresh = function () {
                            var _this = this;
                            return this.quote = this.pickRandomlyFrom(choices.quotes),
                                this.tip = this.pickRandomlyFrom(choices.tips),
                                this.unrecognized = this.pickRandomlyFrom(choices.unrecognizable),
                                this.emptiness = this.pickRandomlyFrom(choices.emptiness),
                                this.disconnected = this.pickRandomlyFrom(choices.disconnected),
                                this.callToAction = this.pickRandomlyFrom(choices.callToAction),
                                rssFeedService.get().then(function (feed) {
                                    return feed[0] ? _this.callToAction = feed[0] : void 0
                                })
                        },
                        Motd.prototype.pickRandomlyFrom = function (fromThis) {
                            return fromThis[Math.floor(Math.random() * fromThis.length)]
                        },
                        Motd
                }())
            }
        ])
    }.call(this),
    function () {
        angular.module("neo4jApp.directives").directive("fancyLogo", ["$window",
            function () {
                return {
                    template: "<h1>fancified</h1>",
                    link: function (scope, element) {
                        return element.html(Modernizr.inlinesvg ? '<span class="ball one"/><span class="ball two"/><span class="ball three"/>' : '<svg viewBox="41 29 125 154" width="125pt" height="154pt"><defs><pattern id="img1" patternUnits="objectBoundingBox" width="90" height="90"><image href="images/faces/abk.jpg" x="0" y="0" width="64" height="64"></image></pattern></defs><g class="logo" stroke="none" stroke-opacity="1" stroke-dasharray="none" fill-opacity="1"><circle class="node" cx="129.63533" cy="84.374286" r="32.365616" fill="#fad000"></circle><circle class="node" cx="62.714058" cy="50.834676" r="18.714163" fill="#fad000"></circle><circle class="node" cx="83.102398" cy="152.22447" r="26.895987" fill="#fad000"></circle><circle class="relationship" cx="91.557016" cy="45.320086" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="104.57301" cy="49.659258" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="55.755746" cy="78.59023" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="55.755746" cy="92.690676" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="58.64808" cy="108.24096" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="65.87916" cy="121.25976" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="118.67652" cy="138.25673" r="5.0627656" fill="#ff4907" stroke="none"></circle><circle class="relationship" cx="127.35707" cy="127.40609" r="5.0627656" fill="#ff4907" stroke="none"></circle><path class="swish" d="M 157.176255 67.359654 C 155.88412 65.2721 154.33242 63.29959 152.52118 61.488342 C 139.88167 48.84871 119.389024 48.84871 106.74953 61.488342 C 94.109954 74.127904 94.109954 94.620657 106.74953 107.260246 C 107.89654 108.40725 109.10819 109.45017 110.37279 110.38901 C 102.64778 97.90879 104.199466 81.316687 115.027814 70.488345 C 126.520325 58.995706 144.50541 57.952786 157.176255 67.35964 Z" fill="#f5aa00"></path><path class="swish" d="M 78.48786 41.29777 C 77.75747 40.117761 76.88036 39.00278 75.856537 37.978957 C 68.711942 30.834292 57.12829 30.834292 49.983703 37.978957 C 42.839068 45.123583 42.839068 56.707297 49.983703 63.85194 C 50.63206 64.500294 51.316958 65.089815 52.031784 65.6205 C 47.665153 58.565944 48.542256 49.187108 54.663076 43.06629 C 61.159322 36.569972 71.325554 35.980452 78.48786 41.297761 Z" fill="#f5aa00"></path><path class="swish" d="M 104.91025 138.61693 C 103.88164 136.955135 102.64641 135.384915 101.20457 133.94307 C 91.142876 123.88128 74.829684 123.88128 64.768004 133.94307 C 54.706255 144.00481 54.706255 160.31808 64.768004 170.37984 C 65.68108 171.29292 66.64562 172.12314 67.652304 172.8705 C 61.502802 162.93561 62.73802 149.727445 71.35794 141.10753 C 80.506564 131.958805 94.82361 131.12859 104.91025 138.61692 Z" fill="#f5aa00"></path><circle class="node-outline" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" cx="129.63533" cy="84.374286" r="32.365616" stroke="#eb7f00"></circle><circle class="node-outline" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" cx="62.714058" cy="50.834676" r="18.714163" stroke="#eb7f00"></circle><circle class="node-outline" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" fill="none" cx="83.102394" cy="152.22448" r="26.895992" stroke="#eb7f00"></circle></g></svg>')
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").factory("Persistable", ["localStorageService",
            function (localStorageService) {
                var Persistable;
                return Persistable = function () {
                    function Persistable(data) {
                        null == data && (data = {}),
                            angular.isObject(data) && angular.extend(this, data),
                            null == this.id && (this.id = UUID.genV1().toString())
                    }

                    return Persistable.fetch = function () {
                            var p, persisted, _i, _len, _results;
                            if (persisted = function () {
                                    try {
                                        return localStorageService.get(this.storageKey)
                                    } catch (_error) {
                                        return null
                                    }
                                }.call(this), !angular.isArray(persisted)) return [];
                            for (_results = [], _i = 0, _len = persisted.length; _len > _i; _i++) p = persisted[_i],
                                _results.push(new this(p));
                            return _results
                        },
                        Persistable.save = function (data) {
                            return localStorageService.add(this.storageKey, JSON.stringify(data))
                        },
                        Persistable
                }()
            }
        ])
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty,
            __extends = function (child, parent) {
                function ctor() {
                    this.constructor = child
                }

                for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
                return ctor.prototype = parent.prototype,
                    child.prototype = new ctor,
                    child.__super__ = parent.prototype,
                    child
            };
        angular.module("neo4jApp.services").factory("Folder", ["Collection", "Document", "Persistable",
            function (Collection, Document, Persistable) {
                var Folder, Folders, _ref;
                return Folder = function (_super) {
                        function Folder(data) {
                            this.expanded = !0,
                                Folder.__super__.constructor.call(this, data),
                                null == this.name && (this.name = "Unnamed folder")
                        }

                        return __extends(Folder, _super),
                            Folder.storageKey = "folders",
                            Folder.prototype.toJSON = function () {
                                return {
                                    id: this.id,
                                    name: this.name,
                                    expanded: this.expanded
                                }
                            },
                            Folder
                    }(Persistable),
                    Folders = function (_super) {
                        function Folders() {
                            return _ref = Folders.__super__.constructor.apply(this, arguments)
                        }

                        return __extends(Folders, _super),
                            Folders.prototype.create = function (data) {
                                var folder;
                                return folder = new Folder(data),
                                    this.add(folder),
                                    this.save(),
                                    folder
                            },
                            Folders.prototype.expand = function (folder) {
                                return folder.expanded = !folder.expanded,
                                    this.save()
                            },
                            Folders.prototype.klass = Folder,
                            Folders.prototype["new"] = function (args) {
                                return new Folder(args)
                            },
                            Folders.prototype.remove = function (folder) {
                                var documentsToRemove;
                                return Folders.__super__.remove.call(this, folder),
                                    documentsToRemove = Document.where({
                                        folder: folder.id
                                    }),
                                    Document.remove(documentsToRemove),
                                    this.save()
                            },
                            Folders
                    }(Collection),
                    new Folders(null, Folder).fetch()
            }
        ])
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty,
            __extends = function (child, parent) {
                function ctor() {
                    this.constructor = child
                }

                for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
                return ctor.prototype = parent.prototype,
                    child.prototype = new ctor,
                    child.__super__ = parent.prototype,
                    child
            };
        angular.module("neo4jApp.services").factory("Document", ["Collection", "Persistable",
            function (Collection, Persistable) {
                var Document, Documents, _ref;
                return Document = function (_super) {
                        function Document(data) {
                            Document.__super__.constructor.call(this, data),
                                null == this.name && (this.name = "Unnamed document"),
                                null == this.folder && (this.folder = !1)
                        }

                        return __extends(Document, _super),
                            Document.storageKey = "documents",
                            Document.prototype.toJSON = function () {
                                return {
                                    id: this.id,
                                    name: this.name,
                                    folder: this.folder,
                                    content: this.content
                                }
                            },
                            Document
                    }(Persistable),
                    Documents = function (_super) {
                        function Documents() {
                            return _ref = Documents.__super__.constructor.apply(this, arguments)
                        }

                        return __extends(Documents, _super),
                            Documents.prototype.create = function (data) {
                                var d;
                                return d = new Document(data),
                                    this.add(d),
                                    this.save(),
                                    d
                            },
                            Documents.prototype.klass = Document,
                            Documents.prototype["new"] = function (args) {
                                return new Document(args)
                            },
                            Documents.prototype.remove = function () {
                                return Documents.__super__.remove.apply(this, arguments),
                                    this.save()
                            },
                            Documents
                    }(Collection),
                    new Documents(null, Document).fetch()
            }
        ])
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty,
            __extends = function (child, parent) {
                function ctor() {
                    this.constructor = child
                }

                for (var key in parent) __hasProp.call(parent, key) && (child[key] = parent[key]);
                return ctor.prototype = parent.prototype,
                    child.prototype = new ctor,
                    child.__super__ = parent.prototype,
                    child
            };
        angular.module("neo4jApp.services").provider("Frame", [function () {
            var self;
            return self = this,
                this.interpreters = [],
                this.$get = ["$injector", "$q", "Collection", "Settings", "Timer", "Utils",
                    function ($injector, $q, Collection, Settings, Timer, Utils) {
                        var Frame, Frames, frames, _ref;
                        return Frame = function () {
                                function Frame(data) {
                                    null == data && (data = {}),
                                        this.templateUrl = null,
                                        angular.isString(data) ? this.input = data : angular.extend(this, data),
                                        null == this.id && (this.id = UUID.genV1().toString())
                                }

                                return Frame.prototype.toJSON = function () {
                                        return {
                                            id: this.id,
                                            input: this.input
                                        }
                                    },
                                    Frame.prototype.exec = function () {
                                        var intr, intrFn, query, timer, _this = this;
                                        return query = Utils.stripComments(this.input.trim()),
                                            query && (intr = frames.interpreterFor(query)) ? (this.type = intr.type, intrFn = $injector.invoke(intr.exec), this.setProperties(), this.errorText = !1, this.detailedErrorText = !1, this.isMain = !1, this.hasErrors = !1, this.isLoading = !0, this.response = null, this.templateUrl = intr.templateUrl, timer = Timer.start(), this.startTime = timer.started(), $q.when(intrFn(query, $q.defer())).then(function (result) {
                                                    return _this.isLoading = !1,
                                                        _this.response = result,
                                                        _this.runTime = timer.stop().time()
                                                },
                                                function (result) {
                                                    return null == result && (result = {}),
                                                        _this.isLoading = !1,
                                                        _this.hasErrors = !0,
                                                        _this.response = null,
                                                        _this.errorText = result.message || "Unknown error",
                                                        result.length > 0 && result[0].code && (_this.errorText = result[0].code, result[0].message && (_this.detailedErrorText = result[0].message)),
                                                        _this.runTime = timer.stop().time()
                                                }), this) : void 0
                                    },
                                    Frame.prototype.setProperties = function () {
                                        var _ref;
                                        return this.exportable = "cypher" === (_ref = this.type) || "http" === _ref,
                                            this.fullscreenable = !0
                                    },
                                    Frame
                            }(),
                            Frames = function (_super) {
                                function Frames() {
                                    return _ref = Frames.__super__.constructor.apply(this, arguments)
                                }

                                return __extends(Frames, _super),
                                    Frames.prototype.create = function (data) {
                                        var frame, intr, rv;
                                        if (null == data && (data = {}), data.input) {
                                            if (intr = this.interpreterFor(data.input), !intr) return void 0;
                                            if (intr.templateUrl ? frame = new Frame(data) : rv = $injector.invoke(intr.exec)(), frame)
                                                for (this.add(frame.exec()); !(this.length <= Settings.maxFrames);) this.remove(this.first());
                                            return frame || rv
                                        }
                                    },
                                    Frames.prototype.interpreterFor = function (input) {
                                        var cmds, firstWord, i, intr, _i, _len, _ref1;
                                        for (null == input && (input = ""), intr = null, input = Utils.stripComments(input.trim()), firstWord = Utils.firstWord(input).toLowerCase(), _ref1 = self.interpreters, _i = 0, _len = _ref1.length; _len > _i; _i++)
                                            if (i = _ref1[_i], angular.isFunction(i.matches)) {
                                                if (i.matches(input)) return i
                                            } else if (cmds = i.matches, angular.isString(i.matches) && (cmds = [cmds]), angular.isArray(cmds) && cmds.indexOf(firstWord) >= 0) return i;
                                        return intr
                                    },
                                    Frames.prototype.klass = Frame,
                                    Frames
                            }(Collection),
                            frames = new Frames(null, Frame)
                    }
                ],
                this
        }])
    }.call(this),
    function () {
        angular.module("neo4jApp.animations", []).animation(".frame-in", ["$window",
            function () {
                return {
                    enter: function (element, done) {
                        var afterFirst;
                        return element.css({
                                position: "absolute",
                                top: "-100px",
                                opacity: 0
                            }),
                            afterFirst = function () {
                                return element.css({
                                        position: "relative"
                                    }),
                                    element.animate({
                                        opacity: 1,
                                        top: 0,
                                        maxHeight: element.height()
                                    }, {
                                        duration: 400,
                                        easing: "easeInOutCubic",
                                        complete: function () {
                                            return element.css({
                                                    maxHeight: 1e4
                                                }),
                                                done()
                                        }
                                    })
                            },
                            element.animate({
                                    opacity: .01
                                },
                                200,
                                function () {
                                    return setTimeout(afterFirst, 0)
                                }),
                            function () {}
                    },
                    leave: function (element, done) {
                        return element.css({
                                height: element.height()
                            }),
                            element.animate({
                                opacity: 0,
                                height: 0
                            }, {
                                duration: 400,
                                easing: "easeInOutCubic",
                                complete: done
                            }),
                            function () {}
                    }
                }
            }
        ]).animation(".intro-in", ["$window",
            function () {
                return {
                    enter: function (element, done) {
                        return element.css({
                                opacity: 0,
                                top: 0,
                                display: "block"
                            }),
                            element.animate({
                                opacity: 1,
                                top: 0
                            }, {
                                duration: 1600,
                                easing: "easeInOutCubic",
                                complete: done
                            })
                    },
                    leave: function (element, done) {
                        return element.animate({
                            opacity: 0,
                            top: 40
                        }, {
                            duration: 400,
                            easing: "easeInOutCubic",
                            complete: done
                        })
                    }
                }
            }
        ]).animation(".slide-down", ["$window",
            function () {
                return {
                    enter: function (element, done) {
                        return element.css({
                                height: 0,
                                display: "block"
                            }),
                            element.animate({
                                height: 49
                            }, {
                                duration: 400,
                                easing: "easeInOutCubic",
                                complete: done
                            }),
                            function () {}
                    },
                    leave: function (element, done) {
                        return element.animate({
                                height: 0
                            }, {
                                duration: 400,
                                easing: "easeInOutCubic",
                                complete: done
                            }),
                            function () {}
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("outputRaw", ["Settings",
            function (Settings) {
                return {
                    restrict: "A",
                    link: function (scope, element, attrs) {
                        var unbind;
                        return unbind = scope.$watch(attrs.outputRaw,
                            function (val) {
                                var rest, str;
                                return val ? (angular.isString(val) || (val = JSON.stringify(val, null, 2)), str = val.substring(0, Settings.maxRawSize), rest = val.substring(Settings.maxRawSize + 1), rest && (rest = rest.split("\n")[0] || "", str += rest + "\n...\n<truncated output>\n\nPress download to see complete response"), element.text(str), unbind()) : void 0
                            })
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").factory("fullscreenService", [function () {
                var container, root;
                return root = angular.element("body"),
                    container = angular.element('<div class="fullscreen-container"></div>'),
                    container.hide().appendTo(root), {
                        display: function (element) {
                            return container.append(element).show()
                        },
                        hide: function () {
                            return container.hide()
                        }
                    }
            }]),
            angular.module("neo4jApp.directives").directive("fullscreen", ["fullscreenService",
                function (fullscreenService) {
                    return {
                        restrict: "A",
                        controller: ["$scope",
                            function ($scope) {
                                return $scope.toggleFullscreen = function (state) {
                                    return null == state && (state = !$scope.fullscreen),
                                        $scope.fullscreen = state
                                }
                            }
                        ],
                        link: function (scope, element) {
                            var parent;
                            return parent = element.parent(),
                                scope.fullscreen = !1,
                                scope.$watch("fullscreen",
                                    function (val, oldVal) {
                                        return val !== oldVal ? (val ? fullscreenService.display(element) : (parent.append(element), fullscreenService.hide()), scope.$emit("layout.changed")) : void 0
                                    })
                        }
                    }
                }
            ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("exportable", [function () {
            return {
                restrict: "A",
                controller: ["$scope", "$window", "CSV",
                    function ($scope, $window, CSV) {
                        var saveAs;
                        return saveAs = function (data, filename, mime) {
                                var blob;
                                return null == mime && (mime = "text/csv;charset=utf-8"),
                                    navigator.userAgent.match(/Version\/[\d\.]+.*Safari/) ? alert("Exporting data is currently not supported in Safari. Please use another browser.") : (blob = new Blob([data], {
                                        type: mime
                                    }), $window.saveAs(blob, filename))
                            },
                            $scope.exportJSON = function (data) {
                                return data ? saveAs(JSON.stringify(data), "result.json") : void 0
                            },
                            $scope.exportCSV = function (data) {
                                var csv, row, _i, _len, _ref;
                                if (data) {
                                    for (csv = new CSV.Serializer, csv.columns(data.columns()), _ref = data.rows(), _i = 0, _len = _ref.length; _len > _i; _i++) row = _ref[_i],
                                        csv.append(row);
                                    return saveAs(csv.output(), "export.csv")
                                }
                            },
                            $scope.exportGraSS = function (data) {
                                return saveAs(data, "graphstyle.grass")
                            }
                    }
                ]
            }
        }])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("article", ["$rootScope", "Editor", "Frame",
            function ($rootScope, Editor) {
                return {
                    restrict: "E",
                    link: function (scope, element) {
                        return element.on("click", ".runnable",
                            function (e) {
                                var code;
                                return code = e.currentTarget.textContent || e.currentTarget.innerText,
                                    (null != code ? code.length : void 0) > 0 ? (Editor.setContent(code.trim()), $rootScope.$$phase ? void 0 : $rootScope.$apply()) : void 0
                            })
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("helpTopic", ["$rootScope", "Editor", "Frame",
            function ($rootScope, Editor, Frame) {
                return {
                    restrict: "A",
                    link: function (scope, element, attrs) {
                        var command, topic;
                        return topic = attrs.helpTopic,
                            command = "help",
                            topic ? element.on("click",
                                function (e) {
                                    return e.preventDefault(),
                                        topic = topic.toLowerCase().trim().replace("-", " "),
                                        Frame.create({
                                            input: ":" + command + " " + topic
                                        }),
                                        $rootScope.$$phase ? void 0 : $rootScope.$apply()
                                }) : void 0
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("playTopic", ["$rootScope", "Editor", "Frame",
            function ($rootScope, Editor, Frame) {
                return {
                    restrict: "A",
                    link: function (scope, element, attrs) {
                        var command, topic;
                        return topic = attrs.playTopic,
                            command = "play",
                            topic ? element.on("click",
                                function (e) {
                                    return e.preventDefault(),
                                        topic = topic.toLowerCase().trim().replace("-", " "),
                                        Frame.create({
                                            input: ":" + command + " " + topic
                                        }),
                                        $rootScope.$$phase ? void 0 : $rootScope.$apply()
                                }) : void 0
                    }
                }
            }
        ])
    }.call(this),
    function () {
        angular.module("LocalStorageModule").value("prefix", "neo4j")
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("EditorCtrl", ["$scope", "Editor", "motdService",
            function ($scope, Editor, motdService) {
                return $scope.editor = Editor,
                    $scope.motd = motdService,
                    $scope.star = function () {
                        return Editor.document || $scope.toggleDrawer("scripts", !0),
                            Editor.saveDocument()
                    }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        var __hasProp = {}.hasOwnProperty;
        angular.module("neo4jApp.controllers").controller("SidebarCtrl", ["$scope", "Document", "Editor", "Frame", "Folder", "GraphExplorer", "Settings",
            function ($scope, Document, Editor, Frame, Folder, GraphExplorer, Settings) {
                $scope.settings = Settings;
                $scope.resetAll = function () {
                    var cyphers = ["Match ()-[r]-() WHERE type(r)<>'own' AND type(r)<>'invest_h' AND type(r)<>'invest_c' AND type(r)<>'branch' AND type(r)<>'serve' delete r",
                        "Match (n:PhoneRecord) delete n",
                        "Match (n:AccountRecord) delete n",
                        "Match (n:Lawsuit) delete n"
                    ];
                    GraphExplorer.importDBByScripts(cyphers, 0, function () {
                        console.log('complate');
                        //                                $scope.$parent.dbs;
                        for (var i = 0; i < $scope.$parent.dbs.length; i++) {
                            $scope.$parent.dbs[i].progressing = false;
                            $scope.$parent.dbs[i].percent = 0;
                        }
                    });

                };
                $scope.demoFun = function () {
                    Frame;
                    Editor.execScript("Match (n:Company{name:'科学技术文献出版社'}) return n");
                    //                         var cyphers = ["Match (n:Company{name:'科学技术文献出版社'}),(m:Company{name:'北京天域新网科技有限公司'}) return m,n"];
                    //                         GraphExplorer.importDBByScripts(cyphers,0,function(){
                    //                                console.log('complate');
                    //                         });
                };
                var scopeApply;
                return scopeApply = function (fn) {
                        return function () {
                            return fn.apply($scope, arguments),
                                $scope.$apply()
                        }
                    },
                    $scope.showingDrawer = function (named) {
                        return $scope.isDrawerShown && $scope.whichDrawer === named
                    },
                    $scope.removeFolder = function (folder) {
                        return confirm("Are you sure you want to delete the folder?") ? Folder.remove(folder) : void 0
                    },
                    $scope.removeDocument = function (doc) {
                        var k, v, _results;
                        Document.remove(doc),
                            _results = [];
                        for (k in doc) __hasProp.call(doc, k) && (v = doc[k], _results.push(doc[k] = null));
                        return _results
                    },
                    $scope.importDocument = function (content) {
                        return Document.create({
                            content: content
                        })
                    },
                    $scope.playDocument = function (content) {
                        return Frame.create({
                            input: content
                        })
                    },
                    $scope.sortableOptions = {
                        stop: scopeApply(function (e, ui) {
                            var doc, first, folder, idx, idxOffset, offsetLeft;
                            return doc = ui.item.scope().document,
                                folder = null != ui.item.folder ? ui.item.folder : doc.folder,
                                offsetLeft = Math.abs(ui.position.left - ui.originalPosition.left),
                                ui.item.relocate ? (doc.folder = folder, doc.starred = !!folder) : offsetLeft > 200 && $scope.documents.remove(doc),
                                ui.item.resort && (idxOffset = ui.item.index(), first = $scope.documents.where({
                                    folder: folder
                                })[0], idx = $scope.documents.indexOf(first), 0 > idx && (idx = 0), $scope.documents.remove(doc), $scope.documents.add(doc, {
                                    at: idx + idxOffset
                                })),
                                $scope.documents.save()
                        }),
                        update: function (e, ui) {
                            return ui.item.resort = !0
                        },
                        receive: function (e, ui) {
                            var folder;
                            return ui.item.relocate = !0,
                                folder = angular.element(e.target).scope().folder,
                                ui.item.folder = null != folder ? folder.id : !1
                        },
                        cursor: "move",
                        dropOnEmpty: !0,
                        connectWith: ".droppable",
                        items: "li"
                    },
                    $scope.editor = Editor,
                    $scope.folders = Folder,
                    $scope.documents = Document
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.services").service("Editor", ["Document", "Frame", "Settings", "localStorageService", "motdService",
            function (Document, Frame, Settings, localStorageService) {
                var Editor, editor, storageKey;
                return storageKey = "history",
                    Editor = function () {
                        function Editor() {
                            this.history = localStorageService.get(storageKey),
                                angular.isArray(this.history) || (this.history = []),
                                this.content = "",
                                this.current = "",
                                this.cursor = -1,
                                this.document = null
                        }

                        return Editor.prototype.exeScriptInMainFrame = function (input, frame) {

                            },
                            Editor.prototype.execScript = function (input) {
                                var frame;
                                return this.showMessage = !1,
                                    frame = Frame.create({
                                        input: input
                                    }),
                                    frame || "" === input ? (this.addToHistory(input), this.maximize(!1)) : this.setMessage("<b>Unrecognized:</b> <i>" + input + "</i>.", "error")
                            },
                            Editor.prototype.addToHistory = function (input) {
                                if (this.current = "", (null != input ? input.length : void 0) > 0 && this.history[0] !== input) {
                                    for (this.history.unshift(input); !(this.history.length <= Settings.maxHistory);) this.history.pop();
                                    localStorageService.add(storageKey, JSON.stringify(this.history))
                                }
                                return this.historySet(-1)
                            },
                            Editor.prototype.execCurrent = function () {
                                return this.execScript(this.content)
                            },
                            Editor.prototype.focusEditor = function () {
                                return $("#editor textarea").focus()
                            },
                            Editor.prototype.hasChanged = function () {
                                var _ref;
                                return (null != (_ref = this.document) ? _ref.content : void 0) && this.document.content.trim() !== this.content.trim()
                            },
                            Editor.prototype.historyNext = function () {
                                var idx;
                                return idx = this.cursor,
                                    null == idx && (idx = this.history.length),
                                    idx--,
                                    this.historySet(idx)
                            },
                            Editor.prototype.historyPrev = function () {
                                var idx;
                                return idx = this.cursor,
                                    null == idx && (idx = -1),
                                    idx++,
                                    this.historySet(idx)
                            },
                            Editor.prototype.historySet = function (idx) {
                                var item;
                                return -1 === this.cursor && -1 !== idx && (this.current = this.content),
                                    0 > idx && (idx = -1),
                                    idx >= this.history.length && (idx = this.history.length - 1),
                                    this.cursor = idx,
                                    item = this.history[idx] || this.current,
                                    this.content = item,
                                    this.document = null
                            },
                            Editor.prototype.loadDocument = function (id) {
                                var doc;
                                return (doc = Document.get(id)) ? (this.content = doc.content, this.focusEditor(), this.document = doc) : void 0
                            },
                            Editor.prototype.maximize = function (state) {
                                return null == state && (state = !this.maximized),
                                    this.maximized = !!state
                            },
                            Editor.prototype.saveDocument = function () {
                                var input, _ref, _ref1;
                                return (input = this.content.trim()) ? ((null != (_ref = this.document) ? _ref.id : void 0) && (this.document = Document.get(this.document.id)), (null != (_ref1 = this.document) ? _ref1.id : void 0) ? (this.document.content = input, Document.save()) : this.document = Document.create({
                                    content: this.content
                                })) : void 0
                            },
                            Editor.prototype.setContent = function (content) {
                                return null == content && (content = ""),
                                    this.content = content,
                                    this.focusEditor(),
                                    this.document = null
                            },
                            Editor.prototype.setMessage = function (message, type) {
                                return null == type && (type = "info"),
                                    this.showMessage = !0,
                                    this.errorCode = type,
                                    this.errorMessage = message
                            },
                            Editor
                    }(),
                    editor = new Editor,
                    CodeMirror.commands.handleEnter = function (cm) {
                        return 1 === cm.lineCount() ? editor.execCurrent() : CodeMirror.commands.newlineAndIndent(cm)
                    },
                    CodeMirror.commands.handleUp = function (cm) {
                        return 1 === cm.lineCount() ? editor.historyPrev() : CodeMirror.commands.goLineUp(cm)
                    },
                    CodeMirror.commands.handleDown = function (cm) {
                        return 1 === cm.lineCount() ? editor.historyNext() : CodeMirror.commands.goLineDown(cm)
                    },
                    CodeMirror.keyMap["default"].Enter = "handleEnter",
                    CodeMirror.keyMap["default"]["Shift-Enter"] = "newlineAndIndent",
                    CodeMirror.keyMap["default"].Up = "handleUp",
                    CodeMirror.keyMap["default"].Down = "handleDown",
                    editor
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.controllers").controller("SearchCtrl", ["$scope", "$rootScope", "$http", "$q", "GraphExplorer", "Frame",
            function ($scope, $rootScope, $http, $q, GraphExplorer, Frame) {

                $rootScope.execScriptInMainFrame = false;
                $scope.findMainFrame = function () { //查找当前主画布
                    for (var i = 0; i < Frame.items.length; i++) {
                        if (Frame.items[i].isMain) {
                            return Frame.items[i];
                        }
                    }
                    return false;
                };

                $scope.execScriptInMainFrame = function (input) {
                    var mainFrame = $scope.findMainFrame();
                    if (mainFrame) {
                        GraphExplorer.execScript(input, mainFrame.response.graph).then(function () {
                            $rootScope.execScriptInMainFrame = !$rootScope.execScriptInMainFrame;
                        });
                    }
                };
                //数据库导入部分
                $scope.dbs = [{
                        id: 0,
                        name: '企业工商信息数据库（已公开）',
                        info: '涵盖全国各省市企业及机构的工商注册信息',
                        percent: 0,
                        progressing: false,
                        cyphers: []
                        //                                 cyphers:["USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM 'file:files/Human.csv' AS row CREATE (n:Human)  Set n = row",
                        //                                          "USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM 'file:files/Company.csv' AS row CREATE (n:Company)  Set n = row WITH n, row Match (m:Human{name:row.legalPersonName}) CREATE (m)-[:own]->(n)",
                        //                                          "LOAD CSV WITH HEADERS FROM 'file:files/CompanyInvestorCompany.csv' AS row Match (n:Company{name:row.company1}), (m:Company{name:row.company2}) Create (n)-[r:invest_c]->(m) set r.amount = row.amount",
                        //                                          "LOAD CSV WITH HEADERS FROM 'file:files/CompanyInvestorHuman.csv' AS row Match (n:Company{name:row.company}), (m:Human{name:row.human}) Create (m)-[r:invest_h]->(n) set r.amount = row.amount",
                        //                                          "LOAD CSV WITH HEADERS FROM 'file:files/CompanyBranch.csv' AS row Match (n:Company{name:row.mu_company}), (m:Company{name:row.zi_company}) Create (n)-[r:branch]->(m)",
                        //                                          "LOAD CSV WITH HEADERS FROM 'file:files/CompanyStaff.csv' AS row Match (n:Human{name:row.humanname}), (m:Company{name:row.companyname}) Create (n)-[r:serve]->(m) set r.staffTypeName = row.staffTypeName"]
                    },
                    {
                        id: 1,
                        name: '诉讼信息数据库（已公开）',
                        info: '主要包含各省市各级法院以及最高人民法院的民事/刑事判决书以及涉事方关系',
                        percent: 0,
                        progressing: false,
                        cyphers: ["USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM 'file:files/Lawsuit.csv' AS row Match (n{name:row.personup}), (m{name:row.persondown}) Create (l:Lawsuit) set l = row Create (n)-[:involve]->(l),(m)-[:involve]->(l)"]
                    },
                    {
                        id: 2,
                        name: '银行交易信息数据库',
                        info: '主要包含人员、帐号信息，以及帐号之间的转账信息',
                        percent: 0,
                        progressing: false,
                        cyphers: ["USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM 'file:files/AccountRecord.csv' AS row Match (n{name:row.moneyfrom}), (m{name:row.moneyto}) Create (n)-[r:transform]->(m) set r = row"]
                    },
                    {
                        id: 3,
                        name: '通信记录数据库',
                        info: '主要包含人员手机通信记录',
                        percent: 0,
                        progressing: false,
                        cyphers: ["USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM 'file:files/PhoneRecord.csv' AS row Match (n:Human{name:row.phonefrom}), (m:Human{name:row.phoneto}) Create (n)-[r:telecom]->(m) Set r=row"]
                    },
                    {
                        id: 4,
                        name: '户籍信息数据库',
                        info: '主要包含人员的户籍详细信息以及户籍关系信息',
                        percent: 0,
                        progressing: false,
                        cyphers: ["USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM 'file:files/HumanRelationship.csv' AS row Match (n:Human{name:row.human1}), (m:Human{name:row.human2}) Create (n)-[r:relativ]->(m) set r.relation = row.relationship"]
                    }
                ];
                $scope.importDB = function (db) { //导入数据库方法

                    GraphExplorer.importDBByScripts(db.cyphers, 0, function () {
                        console.log('complate');
                    });


                    db.progressing = true;
                    var timer, update;
                    var speed = 20;
                    update = function () {
                        timer = setTimeout(function () {
                            $scope.$apply(function () {
                                db.percent += Math.random() * 1.1;
                                db.percent = parseFloat(db.percent.toFixed(1));
                                if (db.percent >= 100) {
                                    clearTimeout(timer);
                                } else {
                                    speed = Math.floor(Math.random() * 80);
                                    update();
                                }
                            });
                        }, 20);
                    };
                    update();
                };
                $scope.maxResultNum = 20;
                $scope.shouldShowNoResult = false;
                $scope.shouldShowTooManyResult = false;
                $scope.mySearch = "";
                $scope.progress = {};
                $scope.progress.percent = 40;
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.progress.percent = 80;
                    });
                }, 3000);
                $scope.mySearchCallback = function (params) {
                    var defer = $q.defer();

                    $http({
                        method: 'GET',
                        url: '/plugins/index/mindex/' + params.query,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {}
                    }).success(function (data, status, headers, config) {

                        defer.resolve(data);
                    }).error(function (data, status, headers, config) {
                        console.log(status);
                    });

                    return defer.promise;
                };

                $scope.enter = function (ev) {
                    if (ev.keyCode !== 13)
                        return;
                    $scope.searchCompanyWithLucene();
                };

                $scope.searchCompanyWithLucene = function () {

                    console.log("incoming name:" + $scope.mySearch);
                    $scope.shouldShowTooManyResult = false;
                    $scope.companys = [];
                    var resultMap = {};
                    $http({
                        method: 'GET',
                        url: '/plugins/index/mindex/' + $scope.mySearch,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {}
                    }).success(function (data, status, headers, config) {
                        console.log(data);

                        $scope.shouldShowNoResult = data.length == 0;
                        $scope.shouldShowTooManyResult = data.length == $scope.maxResultNum;
                        $scope.companys = data;
                    }).error(function (data, status, headers, config) {
                        console.log(status);
                    });
                };
                $scope.searchCompany = function () {

                    console.log("incoming name:" + $scope.searchCompanyName);
                    $scope.shouldShowTooManyResult = false;
                    $scope.companys = [];
                    var resultMap = {};
                    $http({
                        method: 'POST',
                        url: '/db/data/transaction/commit',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            "statements": [{
                                "statement": "MATCH (n:Company) Where n.name=~'.*" + $scope.searchCompanyName + ".*' RETURN n LIMIT " + $scope.maxResultNum,
                                "resultDataContents": ["row"],
                                "includeStats": false
                            }]
                        }
                    }).success(function (data, status, headers, config) {
                        console.log(data);
                        var results = [];
                        for (var i = 0; i < data.results.length; i++) {
                            var record = data.results[i];
                            for (var j = 0; j < record.data.length; j++) {
                                var rowRecord = record.data[j];
                                if (resultMap[rowRecord.row[0]] == null) {
                                    results = results.concat(rowRecord.row[0]);
                                    resultMap[rowRecord.row[0].name] = rowRecord.row[0];
                                }
                            }
                        }
                        $scope.shouldShowNoResult = results.length == 0;
                        $scope.shouldShowTooManyResult = results.length == $scope.maxResultNum;
                        $scope.companys = results;
                    }).error(function (data, status, headers, config) {
                        console.log(status);
                    });
                };

            }
        ]);
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.filters").filter("commandError", [function () {
            return function (input) {
                return ":" === (null != input ? input.charAt(0) : void 0) ? "Not-a-command" : "Unrecognized"
            }
        }])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("clickToCode", ["Editor",
            function (Editor) {
                return {
                    restrict: "A",
                    link: function (scope, element, attrs) {
                        return element.click(function () {
                            var code;
                            return code = scope.$eval(attrs.clickToCode),
                                (null != code ? code.length : void 0) > 0 ? (Editor.setContent(code.trim()), scope.$apply()) : void 0
                        })
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("href", ["Editor",
            function () {
                return {
                    restrict: "A",
                    link: function (scope, element, attrs) {
                        return attrs.href.match(/^http/) ? element.attr("target", "_blank") : void 0
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("scrollTopWhen", ["Settings",
            function (Settings) {
                return function (scope, element, attrs) {
                    return Settings.scrollToTop ? scope.$watch(attrs.scrollTopWhen,
                        function () {
                            return element.scrollTop(0)
                        }) : void 0
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        angular.module("neo4jApp.directives").directive("frameStream", ["Frame", "Editor", "motdService",
            function () {
                return {
                    restrict: "A",
                    priority: 0,
                    templateUrl: "views/partials/stream.html",
                    replace: !1,
                    transclude: !1,
                    scope: !1,
                    controller: ["$scope", "Frame", "Editor", "motdService",
                        function ($scope, Frame, Editor, motdService) {
                            console.log('Frame', Frame);
                            return $scope.frames = Frame,
                                $scope.motd = motdService,
                                $scope.editor = Editor
                        }
                    ],
                    link: function (scope) {
                        return scope.frames.create({
                            input: ":play welcome"
                        })
                    }
                }
            }
        ])
    }.call(this),
    function () {
        "use strict";
        var RssFeedService;
        RssFeedService = function () {
                function RssFeedService($log, $http) {
                    RssFeedService.prototype.get = function () {
                        var apiUrl, format, username;
                        return format = "json",
                            username = "neo4jmotd",
                            apiUrl = "http://assets.neo4j.org/v2/" + format + "/" + username + "?callback=JSON_CALLBACK&count=10?plain=true",
                            $http.jsonp(apiUrl).success(function () {}).error(function (results) {
                                return $log.error("Error fetching feed: ", results)
                            }).then(function (response) {
                                return response.data ? response.data : []
                            })
                    }
                }

                return RssFeedService
            }(),
            angular.module("neo4jApp.services").service("rssFeedService", ["$log", "$http", RssFeedService])
    }.call(this),
    function () {
        "user strict";
        var AreaSelecter = angular.module("neo4jApp.directives").directive("areaSelecter", [function () {
            return {
                require: "ngController",
                restrict: "A",
                scope: {
                    show: '=',
                    sx: '=',
                    sy: '=',
                    ex: '=',
                    ey: '=',
                    menu: '=',
                    multiple: '=',
                    find: '&',
                    findDeep: '&',
                    open: '&',
                    close: '&',
                    unSelectNode: '&',
                    selectNode: '&',
                    refreshNodeRelations: "&",
                    toggleSelection: '&',
                    removeNodesAndRelations: '&'
                },
                link: function (scope, elm, attr, ngCtrl) {
                    var timerId = null;
                    //                   var inMenu = false;
                    d3.select(elm[0]).append('rect')
                        .attr('id', 'rect_select');
                    d3.select(elm[0]).onselectstart = function () {
                        return false;
                    }
                    //                   d3.select(elm[0]).append('foreignObject')
                    //                   
                    //                   .attr("width",128)
                    //                   .attr("height",128)
                    //                   .attr("x",90)
                    //                   .attr("y",50)
                    //                   .style('display','none')
                    //                   .html(function () {
                    //                        return "<div class='menu-circle'><div class='menu-ring'><a class='menuItem fa fa-home fa-2x'></a><a class='menuItem fa fa-comment fa-2x'></a><a class='menuItem fa fa-play fa-2x'></a><a class='menuItem fa fa-camera fa-2x'></a><a class='menuItem fa fa-music fa-2x'></a><a class='menuItem fa fa-user fa-2x'></a><a class='menuItem fa fa-trash-o fa-2x'></a><a class='menuItem fa fa-star fa-2x'></a></div><a href='#' class='center fa fa-th fa-2x'></a></div>"
                    //                    });



                    var svg = d3.select(elm[0]);

                    var x = 0;
                    var y = 0;
                    scope.$watch('show', function () {
                        if (scope.show) {
                            var isShow = false;
                            scope.sx = 0;
                            scope.sy = 0;
                            scope.ex = 0;
                            scope.ey = 0;
                            svg.on('mousemove', function () {
                                scope.$apply(function () {
                                    scope.sx = 0;
                                    scope.sy = 0;
                                    scope.ex = 0;
                                    scope.ey = 0;
                                });
                                if (scope.show) {

                                    svg.select("#rect_select").remove();
                                    d3.select(elm[0]).append('rect')
                                        .attr('id', 'rect_select');
                                    var mouse = d3.mouse(this);
                                    //以起始点为坐标轴，对四个象限位置分别进行运算
                                    if (mouse[0] - x > 0 && mouse[1] - y > 0) {
                                        svg.select("#rect_select")
                                            .attr("x", x)
                                            .attr("y", y)
                                            .attr("width", mouse[0] - x)
                                            .attr("height", mouse[1] - y)
                                            .attr("fill", "#cccccc")
                                            .attr("stroke", "#cccccc")
                                            .style("opacity", "0.7");
                                        scope.$apply(function () {
                                            scope.sx = x;
                                            scope.sy = y;
                                            scope.ex = mouse[0];
                                            scope.ey = mouse[1];
                                        });
                                    } else if (mouse[0] - x < 0 && mouse[1] - y < 0) {
                                        svg.select("#rect_select")
                                            .attr("x", mouse[0])
                                            .attr("y", mouse[1])
                                            .attr("width", x - mouse[0])
                                            .attr("height", y - mouse[1])
                                            .attr("fill", "#cccccc")
                                            .style("opacity", "0.7");
                                        scope.$apply(function () {
                                            scope.sx = mouse[0];
                                            scope.sy = mouse[1];
                                            scope.ex = x;
                                            scope.ey = y;
                                        });
                                    } else if (mouse[0] - x > 0 && mouse[1] - y < 0) {
                                        svg.select("#rect_select")
                                            .attr("x", x)
                                            .attr("y", mouse[1])
                                            .attr("width", mouse[0] - x)
                                            .attr("height", y - mouse[1])
                                            .attr("fill", "#cccccc")
                                            .style("opacity", "0.7");
                                        scope.$apply(function () {
                                            scope.sx = x;
                                            scope.sy = mouse[1];
                                            scope.ex = mouse[0];
                                            scope.ey = y;
                                        });
                                    } else if (mouse[0] - x < 0 && mouse[1] - y > 0) {
                                        svg.select("#rect_select")
                                            .attr("x", mouse[0])
                                            .attr("y", y)
                                            .attr("width", x - mouse[0])
                                            .attr("height", mouse[1] - y)
                                            .attr("fill", "#cccccc")
                                            .style("opacity", "0.7");
                                        scope.$apply(function () {
                                            scope.sx = mouse[0];
                                            scope.sy = y;
                                            scope.ex = x;
                                            scope.ey = mouse[1];
                                        });
                                    }

                                    if (isShow && scope.show) {
                                        svg.select("#rect_select").style('display', 'inherit');
                                    } else {
                                        svg.select("#rect_select").style('display', 'none');
                                    }
                                }




                            });


                            svg.on('mousedown', function () {
                                scope.$apply(function () {
                                    scope.sx = 0;
                                    scope.sy = 0;
                                    scope.ex = 0;
                                    scope.ey = 0;
                                });
                                var mouse = d3.mouse(this)
                                x = mouse[0];
                                y = mouse[1];
                                isShow = true;
                                //                                       if(!inMenu){
                                //                                              svg.select("#circle_menu").remove();
                                //                                       }

                                svg.on('mouseup.as', function (event) {
                                    isShow = false;
                                    svg.select("#rect_select").style('display', 'none');
                                    for (var i = 0; i < d3.event.path.length; i++) { //firefox不支持d3.event.path
                                        if (d3.event.path[i].id == "circle_menu") {
                                            return;
                                        }
                                    }
                                    scope.unSelectNode();
                                    svg.select("#circle_menu").remove();
                                    var mouse = d3.mouse(this);
                                    if ((mouse[0] != x && mouse[1] != y) && scope.menu) {
                                        var hideMenuAndUnSelectNode = function () {
                                            svg.select("#circle_menu").remove();
                                            scope.unSelectNode();
                                        }
                                        //控制显示菜单
                                        svg.select("#circle_menu").remove();
                                        d3.select(elm[0]).append('foreignObject')
                                            .attr('id', 'circle_menu')
                                            .attr("width", 128)
                                            .attr("height", 128)
                                            .attr("x", mouse[0] - 64)
                                            .attr("y", mouse[1] - 64)
                                            //                                .style('display','none')
                                            .html(function () {
                                                var html = "<div class='menu-circle'>";
                                                if (scope.multiple) {
                                                    html += "<div class='menu-ring multiple-menu'>";
                                                } else {
                                                    html += "<div class='menu-ring single-menu'>";
                                                }
                                                html += "<a class='menuItem fa  fa-share-alt icon-white'></a>";
                                                html += "<a id='menu_btn_findRelations' class='menuItem fa fa-search icon-white multiple-btn'></a>";
                                                html += "<a id='menu_btn_findDeepRelations'  class='menuItem fa fa-search-plus icon-white multiple-btn'></a>";
                                                html += "<a id='menu_btn_trash' class='menuItem fa fa-trash icon-white '></a>";
                                                html += "<a id='menu_btn_toggleSelection' class='menuItem fa fa-th-list icon-white single-btn'></a>";
                                                html += "<a id ='menu_btn_closeNodeRelations' class='menuItem fa fa-compress icon-white single-btn'></a>";
                                                html += "<a id ='menu_btn_openNodeRelations'  class='menuItem fa fa-expand icon-white single-btn'></a>";
                                                html += "<a id='menu_btn_refresh' class='menuItem fa fa-refresh icon-white multiple-btn'></a>";
                                                //                                                            html+="<a id='menu_btn_findRelations' class='menuItem fa fa-search icon-white multiple-btn'></a>";
                                                html += "</div>";
                                                html += "<a href='#' class='center fa fa-remove icon-white'></a>";
                                                html += "</div>";
                                                return html;
                                            });
                                        scope.selectNode();
                                        //                                                     svg.select("#circle_menu .menu-ring").on('mouseover.mcenter',function(){
                                        //                                                            inMenu = true;
                                        //                                                     });
                                        //                                                     svg.select("#circle_menu .menu-ring").on('mouseout.mcenter',function(){
                                        //                                                            inMenu = false;
                                        //                                                     });
                                        var items = elm[0].querySelectorAll('.menuItem');

                                        for (var i = 0, l = items.length; i < l; i++) {
                                            items[i].style.left = (50 - 35 * Math.cos(-0.5 * Math.PI - 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";

                                            items[i].style.top = (50 + 35 * Math.sin(-0.5 * Math.PI - 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";
                                        }
                                        window.clearTimeout(timerId);
                                        timerId = setTimeout(function () {
                                            elm[0].querySelector('.menu-circle').classList.toggle('open');
                                        }, 20); //默认展开
                                        //                                                 elm[0].querySelector('.menu-circle' ).classList.toggle('open');


                                        svg.select(".center").on('click', function () {
                                            hideMenuAndUnSelectNode();
                                        });
                                        //                                                     document.querySelector('.center').onclick = function(e) {
                                        ////                                                          e.preventDefault(); document.querySelector('.menu-circle').classList.toggle('open');
                                        //                                                            svg.select("#circle_menu").remove();
                                        //                                                     }

                                        svg.select('#menu_btn_trash').on('click', function () {
                                            scope.removeNodesAndRelations();
                                            hideMenuAndUnSelectNode();
                                        });
                                        svg.select('#menu_btn_refresh').on('click', function () {
                                            if (scope.multiple) {
                                                scope.refreshNodeRelations();
                                                hideMenuAndUnSelectNode();
                                            }
                                        });

                                        svg.select('#menu_btn_toggleSelection').on('click', function () {
                                            if (!scope.multiple) {
                                                scope.toggleSelection();
                                                hideMenuAndUnSelectNode();
                                            }
                                        });
                                        svg.select("#menu_btn_openNodeRelations").on('click', function () {
                                            if (!scope.multiple) {
                                                scope.open();
                                                hideMenuAndUnSelectNode();
                                            }
                                        });
                                        svg.select("#menu_btn_closeNodeRelations").on('click', function () {
                                            if (!scope.multiple) {
                                                scope.close();
                                                hideMenuAndUnSelectNode();
                                            }
                                        });
                                        svg.select("#menu_btn_findRelations").on('click', function () {
                                            if (scope.multiple) {
                                                scope.find();
                                                hideMenuAndUnSelectNode();
                                            }
                                        });
                                        svg.select("#menu_btn_findDeepRelations").on('click', function () {
                                            if (scope.multiple) {
                                                scope.findDeep();
                                                hideMenuAndUnSelectNode();
                                            }
                                        });
                                    }
                                });
                            });
                            // });



                        }
                    });

                }
            }
        }]);
        return AreaSelecter;
    }(),
    function () {
        "user strict";
        var AreaSelecter = angular.module("neo4jApp.directives").directive("progressBar", [function () {
            return {
                restrict: "A",
                templateUrl: "views/partials/progress-bar.html",
                scope: {
                    percent: '='
                },
                link: function (scope, elm, attr, ngCtrl) {
                    var $progress = $(elm).find('.progress'),
                        $bar = $(elm).find('.progress__bar'),
                        $text = $(elm).find('.progress__text'),
                        percent = 0,
                        update, resetColors, orange = 30,
                        yellow = 55,
                        green = 85,
                        timer;
                    resetColors = function () {
                        $bar.removeClass('progress__bar--green').removeClass('progress__bar--yellow').removeClass('progress__bar--orange').removeClass('progress__bar--blue');
                        $progress.removeClass('progress--complete');
                    };
                    update = function () {
                        if (scope.percent == 0) {
                            resetColors();
                        }
                        percent = parseFloat(scope.percent.toFixed(1));
                        $text.find('em').text(percent + '%');
                        $bar.css({
                            width: percent + '%'
                        });
                        if (percent >= 100) {
                            percent = 100;
                            $progress.addClass('progress--complete');
                            $bar.addClass('progress__bar--blue');
                            $text.find('em').text('Complete');
                        } else {
                            if (percent >= green) {
                                $bar.addClass('progress__bar--green');
                            } else if (percent >= yellow) {
                                $bar.addClass('progress__bar--yellow');
                            } else if (percent >= orange) {
                                $bar.addClass('progress__bar--orange');
                            }
                        }
                    };
                    scope.$watch('percent', function () {
                        update();
                    });
                    setTimeout(function () {
                        $progress.addClass('progress--active');
                        update();
                    }, 10);
                    //                   $(document).on('click', function (e) {
                    //                       percent = 0;
                    //                       clearTimeout(timer);
                    //                       resetColors();
                    //                       update();
                    //                   });
                }
            }
        }]);
        return AreaSelecter;
    }(),

    function () {
        "user strict";
        var AreaSelecter = angular.module("neo4jApp.directives").directive("timeLine", [function () {
            return {
                restrict: "A",
                scope: {
                    data: '=',
                    rangeDate: '=',
                    length: '=',
                    reDrawTimeLine: '&',
                    showTimeline: '='
                },
                link: function (scope, elm, attr, ngCtrl) {

                    var yAxisMax = 0;
                    /*     Margin, Width and height */
                    var margin = {
                        top: 10,
                        right: 20,
                        bottom: 3,
                        left: 50,
                        mid: 12
                    };
                    var width = 930;
                    if ($(elm[0]).width() <= 930)
                        width = $(elm[0]).width() * 0.8;
                    var height = 80 - margin.top - margin.mid - margin.bottom;
                    var rectCount = 100; //柱状体数量
                    var topData = [];
                    var tempData = [];
                    var unit = 0;

                    var svg = null;
                    var brush = null;
                    var barsGroup = null;

                    /* arc */
                    var arc = d3.svg.arc()
                        .outerRadius(height / 2)
                        .startAngle(0)
                        .endAngle(function (d, i) {
                            return i ? -Math.PI : Math.PI;
                        });


                    /*     Scales */
                    var yScale = d3.scale.linear()
                        .range([height, 0]);

                    var xScale = d3.scale.ordinal()
                        .rangeBands([0, width], 0.2, 0);
                    //                   xScale.rangeBands([0,width+],0.4,0);


                    var xScaleAxis = d3.time.scale().range([0, width]);

                    /*     Define y axis */
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left");

                    /* Define y axis */
                    var xAxis = d3.svg.axis()
                        .scale(xScaleAxis)
                        .tickSize(3, 0)
                        //                       .ticks(d3.time.weeks, 1)
                        .tickFormat(d3.time.format("%Y-%m"))
                        .orient("bottom");

                    /* Prepare the x axis */
                    //                   var XAxis = svg.append("g")
                    //                     .attr("class", "x axis")
                    //                     .attr("transform", "translate(" + margin.left + "," + (margin.top+height) + ")")
                    //                     .call(xAxis)
                    //                     .append("g")
                    //                     .attr("class", "axisLabel");



                    function update(grp, data, main) {
                        grp.selectAll("rect").data(data, function (d) {
                                return d.key;
                            })
                            .attr("x", function (d, i) {
                                return xScaleAxis(d.date);
                            })
                            .attr("width", function (d) {
                                return xScale.rangeBand();
                            })
                            .attr("y", function (d) {
                                return main ? yScale(d.score) : 0;
                            })
                            .attr("height", function (d) {
                                return main ? height - yScale(d.score) : miniHeight;
                            });
                    }

                    function enter(grp, data, main, index) {
                        grp.selectAll("rect").data(data, function (d) {
                                return d.key;
                            })
                            .enter()
                            .append("rect")
                            .attr("x", function (d, i) {
                                return xScaleAxis(d.date);
                            })
                            .attr("width", function (d) {
                                return xScale.rangeBand();
                            })
                            .attr("y", function (d) {
                                return main ? yScale(d.score) : 0;
                            })
                            .attr("height", function (d) {
                                return main ? height - yScale(d.score) : miniHeight;
                            })
                            .attr("fill", function (d, i) {
                                var deg = 0;
                                if (index != null && index != undefined) {
                                    if (index == 0)
                                        return "#DDAA00";
                                    if (index == 1)
                                        return "#40bcd1";
                                    deg = (index + 1) * 50;

                                } else {
                                    deg = 50;
                                }
                                return "hsl(" + deg + ", 50%, 50%)";
                                //                             if(index){
                                //                                   deg = (index+1)*50;
                                //                            } 
                            })
                            .attr("opacity", function () {
                                return 0.6;
                            });
                    }

                    function exit(grp, data) {
                        grp.selectAll("rect").data(data, function (d) {
                                return d.key;
                            }).exit()
                            .remove();
                    }

                    function updateBars(data, content, index) {

                        xScale.domain(d3.range(data.length - 1));
                        //                       var max = d3.max(data, function(d) {
                        //                         return d.score;
                        //                       });
                        //                       if(max >= yAxisMax){
                        //                    	   yAxisMax = max;
                        //                       }

                        //                       yScale.domain([0, d3.max(data, function(d) {
                        //                         return d.score;
                        //                       })]);

                        //为避免柱状图现实范围超出X轴长度，X轴多加一单位时间
                        //                           var xTempData = data;
                        //                                  var b = moment(xTempData[xTempData.length-1].date.getTime());
                        //                                  b = b.add(unit, 'milliseconds');
                        //                                  xTempData.push({date:new Date(b.valueOf()),score:0,key:xTempData.length+1});

                        //                           xScaleAxis.domain(d3.extent(xTempData.map(function(d) { return d.date; })));

                        svg.select(".x.axis").remove();
                        var XAxis = svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
                            .call(xAxis)
                            .append("g")
                            .attr("class", "axisLabel");


                        /* Update */
                        update(content, data, true);

                        /* Enter… */
                        enter(content, data, true, index);

                        /* Exit */
                        exit(content, data);

                        /* Call the Y axis to adjust it to the new scale */
                        svg.select(".outer-wrapper .chart .y")
                            .transition()
                            .duration(10)
                            .call(yAxis);
                    }


                    scope.$watch('length', function () { //只监听长度减少资源浪费
                        scope.showTimeline = false;
                        if (scope.length != undefined && scope.data != null && scope.data.relationships().length > 0) {
                            topData = [];
                            var topData1 = [];
                            var testDatas = [];
                            var index2 = 0;
                            var index1 = 0;

                            d3.select(elm[0]).select("svg").remove();
                            svg = d3.select(elm[0]).append("svg")
                                .attr("width", width + margin.left + margin.right)
                                .attr("height", height + margin.top + margin.mid + margin.bottom);

                            //                                   return;
                            for (var i = 0; i < scope.data.relationships().length; i++) {
                                var rel = scope.data.relationships()[i];
                                if (rel.type == "transform") {
                                    var obj = {};
                                    obj.key = index1;
                                    obj.date = new Date(rel.propertyMap.datetime);
                                    obj.score = 1;
                                    topData.push(obj);
                                    index1++;

                                } else if (rel.type == "telecom") {
                                    var obj = {};
                                    obj.key = index2;
                                    obj.date = new Date(rel.propertyMap.datetime);
                                    obj.score = 1;
                                    topData1.push(obj);
                                    index2++;
                                } else {
                                    continue;
                                }
                                //                                          if(!scope.data.relationships()[i].testData){
                                ////                                              console.log(scope.data.relationships()[i].propertyMap.datetime);
                                //                                                 var a = new Date('2012-02-10' );
                                //                                                 var b = new Date('2015-02-10' );
                                //                                                
                                //                                                a = a.getTime();
                                //                                                b = b.getTime();
                                //                                                 var my_object = {};
                                //                                                              my_object.key = i;
                                //                                                              my_object.score = Math.floor(Math.random() * 600);
                                //                                                              my_object.date = new Date(Math.round(a + Math.random() * (b - a)));
                                //                                                              topData.push(my_object);
                                //                                                               var my_object1 = {};
                                //                                                              my_object1.key = i;
                                //                                                              my_object1.score = Math.floor(Math.random()*600);
                                //                                                              my_object1.date = new Date(Math.round(a + Math.random() * (b - a)));
                                //                                                              topData2.push(my_object1);
                                //                                                              scope.data.relationships()[i].testData = [my_object,my_object1];
                                //                                         } else{
                                //                                                topData.push(scope.data.relationships()[i].testData[0]);
                                //                                                topData2.push(scope.data.relationships()[i].testData[1]);
                                //                                         }
                            }
                            testDatas.push(topData);
                            testDatas.push(topData1);

                            var tempXScaleData = [];
                            for (var i = 0; i < testDatas.length; i++) {
                                tempXScaleData = tempXScaleData.concat(testDatas[i]);
                            }
                            if (tempXScaleData.length == 0) {
                                scope.showTimeline = false;
                                return;
                            } else {
                                scope.showTimeline = true;
                            }
                            //先计算时间轴
                            var minAndMax = d3.extent(tempXScaleData.map(function (d) {
                                return d.date;
                            }));
                            var diffMis = minAndMax[1].getTime() - minAndMax[0].getTime();
                            unit = 0;
                            if (diffMis != 0) {
                                unit = diffMis / rectCount;
                            }
                            var b = moment(minAndMax[1].getTime());
                            b = b.add(unit * 10, 'milliseconds');
                            minAndMax[1] = new Date(b.valueOf());
                            b = moment(minAndMax[0].getTime());
                            b = b.subtract(unit * 10, 'milliseconds');
                            minAndMax[0] = new Date(b.valueOf());
                            //                                xTempData.push({date:new Date(b.valueOf()),score:0,key:xTempData.length+1});
                            xScaleAxis.domain(minAndMax);

                            var tempDatas = []; //记录中间量计算Y轴
                            //多种数据展现在同一时间轴
                            for (var index = 0; index < testDatas.length; index++) {
                                tempData = []; //产生中间量




                                //对数据进行排序
                                var temp = {};
                                for (var i = 0; i < testDatas[index].length - 1; i++) {
                                    for (var j = 0; j < testDatas[index].length - 1 - i; j++) {
                                        if (testDatas[index][j].date.getTime() > testDatas[index][j + 1].date.getTime()) {
                                            temp = testDatas[index][j + 1];
                                            testDatas[index][j + 1] = testDatas[index][j];
                                            testDatas[index][j] = temp;
                                        }

                                    }
                                }

                                unit = 0;
                                if (diffMis != 0) {
                                    unit = diffMis / rectCount;
                                }
                                var b = moment(minAndMax[0].getTime());
                                for (var i = 0; i <= rectCount + 20; i++) {
                                    tempData.push({
                                        date: new Date(b.valueOf()),
                                        score: 0,
                                        key: i
                                    });
                                    b = b.add(unit, 'milliseconds');
                                }
                                for (var i = 0; i < testDatas[index].length; i++) {
                                    for (var j = 0; j < tempData.length; j++) {
                                        if ((tempData[j].date.getTime()) <= testDatas[index][i].date.getTime() && (tempData[j].date.getTime() + unit) >= testDatas[index][i].date.getTime()) {
                                            tempData[j].score += testDatas[index][i].score;
                                            break;
                                        }
                                    }
                                }

                                tempDatas.push(tempData);

                            }
                            var tempYScaleData = [];
                            for (var i = 0; i < tempDatas.length; i++) {
                                tempYScaleData = tempYScaleData.concat(tempDatas[i]);
                            }
                            var yMax = d3.max(tempYScaleData, function (d) {
                                return d.score;
                            });
                            yScale.domain([0, yMax]);

                            yAxis.ticks(yMax);


                            var YAxis = svg.append("g")
                                .attr("class", "y axis")
                                .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
                                .call(yAxis)
                                .append("g")
                                .attr("class", "axisLabel");

                            for (var i = 0; i < tempDatas.length; i++) {
                                var barsGroup = svg.append('g')
                                    .attr("class", "barsGroup")
                                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                                updateBars(tempDatas[i], barsGroup, i);
                            }


                            var brushGroup = svg.append('g')
                                .attr("class", "brushGroup")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                            /* brush */
                            brush = d3.svg.brush()
                                .x(xScaleAxis)
                                .on("brush", brushed);

                            brushGroup.append("g")
                                .attr("class", "brush")
                                .call(brush)
                                .selectAll("rect")
                                .attr("opacity", 0.5)
                                .attr("height", height);

                            brushGroup.selectAll(".resize").append("path")
                                .attr("transform", "translate(0," + height / 2 + ")")
                                .attr("d", arc);

                            scope.rangeDate = minAndMax;

                            if (scope.reDrawTimeLine)
                                scope.reDrawTimeLine();
                        }
                    }, true);

                    //拖拽rang回调函数
                    function brushed() {
                        //                         console.log(brush.empty() ? null : brush.extent());
                        scope.$apply(function () {
                            scope.rangeDate = brush.empty() ? null : brush.extent();
                        });
                    }
                }
            }
        }]);
        return AreaSelecter;
    }(),
    function () {
        "user strict";
        var Loading = angular.module("neo4jApp.directives").directive("loading", ["$rootScope", function ($rootScope) {
            return {
                restrict: "A",
                templateUrl: "views/partials/loading.html",
                transclude: true,
                replace: true,
                scope: {
                    percent: '='
                },
                link: function (scope) {
                    console.log($rootScope);
                    scope.show = false;
                    if ($rootScope.showLoading == undefined)
                        $rootScope.showLoading = false;
                    $rootScope.$watch("showLoading", function () {
                        if ($rootScope.showLoading != undefined) {
                            scope.show = $rootScope.showLoading;
                        }
                    });
                }
            }
        }]);
        return Loading;
    }();