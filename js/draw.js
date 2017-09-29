define('draw', ['description'], function(des) {

	/*var getBreadth=function(arr){
		var breadth=arr.length;
		var tempBreadth=0;
		for(var i=0,len=arr.length;i<len;i++){
			tempBreadth=0;

		}
	};*/
	var obj = {
		drawModel: function(arr) {
			var g = new dagreD3.graphlib.Graph().setGraph({});
			g.setGraph({
				nodesep: 70,
				ranksep: 50,
				rankdir: "LR",
				marginx: 20,
				marginy: 20
			});
			var preNodes = [];
			var depth = [];
			var topIndex = 0;
			// node命名规则 'node'+顶级index+深度+分支号+名称+随机数
			function drawBranch(branchArr, curPreNodes, type, operator) {
				//type = type ? type : '分支';
				depth.push(1);
				var curNodeName = '';
				var bPreNodes = [];
				var len = depth.length;


				if (type) {
					preNodes = curPreNodes;
					curNodeName = 'node' + topIndex + depth.length + 't' + 's' + Math.random();
					g.setNode(curNodeName, {
						label: '进入' + type
					});
					if (type === '捕获分组') {
						g.node(curNodeName).style = "fill:#3B639F";
					} else if (type === '非捕获分组') {
						g.node(curNodeName).style = "fill:#f5f8fc";
					} else if (type === '肯定环视') {
						g.node(curNodeName).style = "fill:#10c2ce";
					} else if (type === '否定环视') {
						g.node(curNodeName).style = "fill:#BBFFFF";
					}
					preNodes.forEach(function(nodeName) {
						g.setEdge(nodeName, curNodeName, {
							//label: curNodeName
							label: ''
						});
					});
					curPreNodes = [curNodeName];
					preNodes = curPreNodes;
				}

				for (var i = 0, len = branchArr.length; i < len; i++) { //进入分支
					if (len !== 1) {
						preNodes = curPreNodes;
						curNodeName = 'node' + topIndex + depth.length + i + 's' + Math.random();
						g.setNode(curNodeName, {
							label: '进入' + '分支'
						});

						g.node(curNodeName).style = "fill:#aa73d1";
						preNodes.forEach(function(nodeName) {
							g.setEdge(nodeName, curNodeName, {
								//label: curNodeName
								label: ''
							});
						});
						preNodes = [curNodeName];
					}


					for (var j = 0, c = branchArr[i].length; j < c; j++) {
						// 顶级Index
						if (depth.length === 1) {
							topIndex = '' + i + j;
						}
						if (branchArr[i][j].branch.length === 0) { //内容元素
							curNodeName = 'node' + topIndex + depth.length + i + j + Math.random();
							g.setNode(curNodeName, {
								label: des(branchArr[i][j].atom, j) + ' 匹配' + des(branchArr[i][j].operator, j, true)
							});
							preNodes.forEach(function(nodeName) {
								g.setEdge(nodeName, curNodeName, {
									//label: curNodeName
									label: ''
								});
							});
							preNodes = [curNodeName];
						} else { //递归
							preNodes = drawBranch(branchArr[i][j].branch, preNodes, branchArr[i][j].type, branchArr[i][j].operator);
						}
					}

					if (len !== 1) {
						curNodeName = 'node' + topIndex + depth.length + i + 'e' + Math.random();
						g.setNode(curNodeName, {
							label: ('分支' + '结束') + (operator ? ' 匹配' + des(operator, undefined, true) : '')
						});

						g.node(curNodeName).style = "fill:#aa73d1";
						preNodes.forEach(function(nodeName) {
							g.setEdge(nodeName, curNodeName, {
								//label: curNodeName
								label: ''
							});
						});
						preNodes = [curNodeName];
					}

					bPreNodes.push(preNodes);
				}

				if (type) {
					curNodeName = 'node' + topIndex + depth.length + 't' + 'e' + Math.random();
					g.setNode(curNodeName, {
						label: (type + '结束') + (operator ? ' 匹配' + des(operator, undefined, true) : '')
					});
					if (type === '捕获分组') {
						g.node(curNodeName).style = "fill:#3B639F";
					} else if (type === '非捕获分组') {
						g.node(curNodeName).style = "fill:#f5f8fc";
					} else if (type === '肯定环视') {
						g.node(curNodeName).style = "fill:#10c2ce";
					} else if (type === '否定环视') {
						g.node(curNodeName).style = "fill:#BBFFFF";
					}
					bPreNodes.forEach(function(nodeName) {
						g.setEdge(nodeName, curNodeName, {
							//label: curNodeName
							label: ''
						});
					});
					preNodes = [curNodeName];
					bPreNodes = preNodes;
				}
				depth.pop();
				return bPreNodes;
			}
			g.setNode('start', {
				label: 'start',
				title:'ssss'
			});
			preNodes.push('start');
			g.node('start').style = "fill: #999";
			//preNodes = drawBranch(arr, preNodes);
			preNodes = drawBranch(arr, preNodes);
			g.setNode('end', {
				label: 'end'
			});
			g.node('end').style = "fill: #999";
			preNodes.forEach(function(nodeName) {
				g.setEdge(nodeName, 'end', {
					//label: 'end'
					label: ''
				});
			});
			// Set some general styles
			g.nodes().forEach(function(v) {
				var node = g.node(v);
				node.rx = node.ry = 5;
			});

			var svg = d3.select("svg"),
				inner = svg.select("g");

			// Create the renderer
			var render = new dagreD3.render();
			// Run the renderer. This is what draws the final graph.
			render(inner, g);
			// Center the graph
			//var initialScale = 0.75;
			var zoom = d3.behavior.zoom().on("zoom", function() {
				inner.attr("transform", "scale(" + d3.event.scale + ")");
			});
			svg.call(zoom);
			var initialScale = Math.max(0.6, $(window).width() / g.graph().width);
			zoom
				.scale(initialScale)
				.event(svg);
			//svg.attr('height', g.graph().height * initialScale + 40);
			svg.attr('width', g.graph().width * initialScale);
			d3.selectAll('g').data([1,2,3,4,5,6,7]).enter().append('text').text(function(d){return d;});
		}
	};
	return obj;
});