define('main', ['draw', 'meta', 'NFA'], function(draw, meta, NFA) {
	function init(inputStr, regexpStr) {
		if (regexpStr === '') {
			return;
		} else if (/^\//.test(regexpStr) && /(?:\/|\/i|\/g|\/m)$/.test(regexpStr)) {
			regexpStr = regexpStr.replace(/^\//, '').replace(/(\/|\/i|\/g|\/m)$/, '');
		}
		try {
			var reg = new RegExp(regexpStr);
		} catch (e) {
			alert(e);
		}
		var metas = [];
		meta(regexpStr, metas, 1);
		console.log('该正则表达式的生成数据结构如下：');
		console.log(metas);
		var obj = document.getElementById('flowChart');
		draw.drawModel(metas, obj);
		//NFA(inputStr, meta, showMatch);//二期代码 todo
	}
	return {
		init: init
	}
});