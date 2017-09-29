define('description', function() {
	//字符类转义
	var characterClassEscape = {
		'\\d': '数字',
		'\\D': '非数字',
		'\\s': '空白',
		'\\S': '非空白',
		'\\w': '字母数字下划线',
		'\\W': '非字母数字下划线',
		'.': '单个任意字符',
	};
	//控制符转义
	var controlEscape = {
		'\\f': '进纸',
		'\\n': '换行',
		'\\r': '回车',
		'\\t': '水平制表符',
		'\\v': '竖直制表符'
	};
	//断言
	var assertion = {
		'^': '匹配输入字符串的开始位置',
		'$': '匹配输入字符串的结束位置',
		'\\b': '匹配一个单词边界',
		'\\B': '匹配非单词边界',
		'?=': '正向肯定预查',
		'?!': '正向否定预查'
	};
	//量词
	var quantifier = {
		'*': '零次或多次(尽量多)',
		'+': '一次或多次(尽量多)',
		'?': '零次或一次(尽量多)',
		'*?': '零次或多次(尽量少)',
		'+?': '一次或多次(尽量少)',
		'??': '零次或一次(尽量少)',
		'': '一次'
	};
	// 字符组解释
	function charSets(str) {
		var returnStr = '',
			c = '',
			isUnicode = false,
			isHex = false,
			vArr = [assertion, characterClassEscape, controlEscape],
			desRes = '';
		for (var i = 0, len = str.length; i < len; i++) {
			isUnicode = false;
			isHex = false;
			c = str[i];
			if (c === '-') {
				returnStr += i === 0 ? '-' : '到';
			} else if (c === '^' && i === 0) {
				returnStr += '排除';
			} else if (c === '\\') {
				desRes = '';
				subStr = str.substring(i + 1);
				if (/^u[0-9a-fA-F]{4}/.test(subStr)) { // unicode转义
					desRes = '\\\\' + (/^u[0-9a-fA-F]{4}/.exec(subStr)[0]);
					returnStr += desRes;
					isUnicode = true;
					i += 5;
				} else {
					isUnicode = false;
				}
				if (/^x[0-9a-fA-F]{2}/.test(subStr)) { // 16进制转义
					desRes = '\\\\' + (/^x[0-9a-fA-F]{2}/.exec(subStr)[0]);
					returnStr += desRes;
					i += 3;
					isHex = true;
				} else {
					isHex = false;
				}
				if (!isUnicode && !isHex) {
					desRes = '\\' + subStr.substr(0,1);
					i += 1;
					vArr.some(function(value) {
						if (value.hasOwnProperty(subStr)) {
							desRes = value[subStr];
							return true;
						}
					});
					returnStr += desRes;
				}
			} else {
				returnStr += c === ' ' ? '空格' : c;
			}
			returnStr += (c === '-' && i !== 0 || str.charAt(i + 1) === '-' || c === '^' && i === 0) ? '' : '或';
		}
		returnStr = returnStr.replace(/或$/, '');
		return returnStr;
	}
	var des = function(s, index, isOperator) {
		if (s === '' && !isOperator) {
			return '空字符串';
		} else if (s === ' ' && !isOperator) {
			return '空格';
		}
		var vArr = [assertion, characterClassEscape, controlEscape];
		var r = /^\{(\d+)(?:(,)(\d*))*\}(\??)$/;
		var res;
		var desRes = '';
		if (isOperator) {
			if (quantifier.hasOwnProperty(s)) {
				desRes = quantifier[s];
			} else {
				res = r.exec(s);
				desRes = res[1] ? res[1] + '次' : '';
				desRes += !res[2] ? '' : (res[3] ? '到' + res[3] + '次' : '到' + '无穷次');
				desRes += res[2] ? (res[4] ? '(尽量少)' : '(尽量多)') : '';
			}
		} else {
			if (s.charAt(0) === '[') {
				desRes = charSets(s.substring(1, s.length - 1));
			} else {
				vArr.some(function(value) {
					if (value.hasOwnProperty(s)) {
						desRes = value[s];
						return true;
					}
				});
			}
		}
		return desRes === '' ? s : desRes;
	}
	return des;
});