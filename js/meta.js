define('meta', function() {
	var operatorsReg = /^(?:\+\?|\*\?|\?\?|\+|\*|\?|\{\d+,\d*\}\??|\{\d+,?\}\??)/;

	function findOperator(str) {
		var oResult = operatorsReg.exec(str);
		if (oResult === null) {
			return {
				operator: '',
				length: 0
			}
		} else {
			return {
				operator: oResult[0],
				length: oResult[0].length
			}
		}
	}

	function readGroup(str) {
		var r = /[(|)]|\(\?\:/g,
			res,
			leftGroup = [],
			rightGroup = [],
			orGroup = [];
		var tempStr = str.replace(/\\./g, '&&');
		while (res = r.exec(str)) {
			if (res[0] === '(' || res[0] === '(?:') {
				leftGroup.push(r.lastIndex - 1);
			} else if (res[0] === '|') {
				orGroup.push(r.lastIndex - 1);
			} else if (res[0] === ')') {
				rightGroup.push(r.lastIndex - 1);
			}
		}

		var paraArr = [],
			tempParaCL = 0,
			tempParaCR = 0,
			paraL = 0,
			paraR = 0;
		for (var k = 0, b = 0, c = tempStr.length; k < c; k++) {
			tempParaCL = 0,
			tempParaCR = 0,
			paraL = 0,
			paraR = 0;
			if (tempStr.charAt(k) === '(') {
				paraL = k;
				for (b = k + 1; b < c; b++) {
					if (tempStr.charAt(b) === ')') {
						tempParaCR++;
						if (tempParaCR > tempParaCL) {
							paraR = b;
							paraArr.push({
								l: paraL,
								r: paraR
							});
							break;
						}
					} else if (tempStr.charAt(b) === '(') {
						tempParaCL++;
					}
				}

			}
		}

		var resArr = [];
		if (leftGroup.length === 0) {
			if (orGroup.length) {
				for (var j = 0, l = orGroup.length; j < l; j++) {
					if (j === 0) {
						resArr.push({
							l: 0,
							r: orGroup[j] - 1,
							or: orGroup[j]
						});
					} else {
						resArr.push({
							l: orGroup[j - 1] + 1,
							r: orGroup[j] - 1,
							or: orGroup[j]
						});
					}
				}
			} else {
				resArr = [];
			}
		} else {
			if (orGroup.length) {
				var tempCountL = 0,
					tempCountR = 0,
					realL = 0,
					realR = 0;
				for (var j = 0, l = orGroup.length; j < l; j++) {
					tempCountL = 0,
					tempCountR = 0,
					realL = 0,
					realR = 0;
					for (var n = orGroup[j]; n > 0; n--) {
						if (tempStr[n] === ')') {
							tempCountR++;
						} else if (tempStr[n] === '(') {
							tempCountL++;
							if (tempCountL > tempCountR) {
								realL = n;
								break;
							}
						}
					}
					tempCountL = 0,
					tempCountR = 0;
					for (n = orGroup[j]; n < tempStr.length; n++) {
						if (tempStr[n] === '(') {
							tempCountL++;
						} else if (tempStr[n] === ')') {
							tempCountR++;
							if (tempCountR > tempCountL) {
								realR = n;
								break;
							}
						}
					}
					resArr.push({
						l: realL,
						r: realR,
						or: orGroup[j]
					});
				}
			} else {
				resArr = [];
			}
		}
		return {
			leftGroup: leftGroup,
			rightGroup: rightGroup,
			orGroup: orGroup,
			resArr: resArr,
			paraArr: paraArr
		}
	}

	function getRightPara(leftPara, paraArr) {
		for (var i = 0, len = paraArr.length; i < len; i++) {
			if (paraArr[i].l === leftPara) {
				return paraArr[i].r;
			}
		}
	}

	var groupIndex = 1;

	function parseMeta(str, arr, isInit) {
		if (isInit) {
			groupIndex = 1;
		}
		var groupObj = readGroup(str);
		var atIndex = 0,
			atChar = '',
			tempAtom = '',
			isUnicode = false,
			isHex = false,
			paraRight = 0,
			finaIndex = 0;
		for (var len = str.length; atIndex < len; atIndex++) {
			isUnicode = false;
			isHex = false;
			atChar = str.charAt(atIndex);
			//finaIndex=arr.length;
			if (arr[finaIndex] === undefined) {
				arr[finaIndex] = [];
			}
			arr[finaIndex][arr[finaIndex].length] = {};
			if (atChar === '\\') {
				subStr = str.substring(atIndex + 1);
				if (/^u[0-9a-fA-F]{4}/.test(subStr)) { // unicode转义
					tempAtom = '\\\\' + /^u[0-9a-fA-F]{4}/.exec(subStr)[0];
					isUnicode = true;
					atIndex += 5;
				} else {
					isUnicode = false;
				}
				if (/^x[0-9a-fA-F]{2}/.test(subStr)) { // 16进制转义
					tempAtom = '\\\\' + /^x[0-9a-fA-F]{2}/.exec(subStr);
					atIndex += 3;
					isHex = true;
				} else {
					isHex = false;
				}
				if (!isUnicode && !isHex) {
					tempFun = makeMeta(atChar);
					atIndex++;
					tempAtom = tempFun(str.charAt(atIndex));
				}

				arr[finaIndex][arr[finaIndex].length - 1].index = atIndex;

				arr[finaIndex][arr[finaIndex].length - 1].atom = tempAtom;

				operatorObj = findOperator(str.substring(atIndex + 1));
				arr[finaIndex][arr[finaIndex].length - 1].operator = operatorObj.operator;
				atIndex += operatorObj.length;

				arr[finaIndex][arr[finaIndex].length - 1].branch = [];

				arr[finaIndex][arr[finaIndex].length - 1].length = 0;
			} else if (atChar === '[') {
				arr[finaIndex][arr[finaIndex].length - 1].index = atIndex;

				subStr = str.substring(atIndex);
				tempFun = makeMeta('');
				tempAtom = tempFun((/\[.*?(?=([^\\])(\]))/.exec(subStr)[0]) + (/\[.*?(?=([^\\])(\]))/.exec(subStr)[1]) + (/\[.*?(?=([^\\])(\]))/.exec(subStr)[2]));
				atIndex += tempAtom.length;
				arr[finaIndex][arr[finaIndex].length - 1].atom = tempAtom;

				operatorObj = findOperator(str.substring(atIndex));
				arr[finaIndex][arr[finaIndex].length - 1].operator = operatorObj.operator;
				atIndex += operatorObj.length - 1;

				arr[finaIndex][arr[finaIndex].length - 1].branch = [];

				arr[finaIndex][arr[finaIndex].length - 1].length = 0;
			} else if (atChar === '|') {
				arr[finaIndex].pop();
				finaIndex++;
				if (atIndex === 0) {
					arr[finaIndex - 1] = [];
					arr[finaIndex - 1][0] = {};
					arr[finaIndex - 1][0].index = atIndex;

					tempAtom = '';
					arr[finaIndex - 1][0].atom = tempAtom;

					arr[finaIndex - 1][0].operator = '';

					arr[finaIndex - 1][0].branch = [];

					arr[finaIndex - 1][0].length = 0;
				}
				if (atIndex === str.length - 1 || str[atIndex + 1] === '|') {

					arr[finaIndex] = [];
					arr[finaIndex][0] = {};
					arr[finaIndex][0].index = atIndex;

					tempAtom = '';
					arr[finaIndex][0].atom = tempAtom;

					arr[finaIndex][0].operator = '';

					arr[finaIndex][0].branch = [];

					arr[finaIndex][0].length = 0;
				}
			} else if (atChar === '(') {
				paraRight = getRightPara(atIndex, groupObj.paraArr);

				arr[finaIndex][arr[finaIndex].length - 1].index = atIndex;

				subStr = str.substring(atIndex + 1, paraRight);
				if (/^\?:/.test(subStr)) {
					atIndex += 2;
					subStr = /^\?:(.*)$/.exec(subStr)[1];
					arr[finaIndex][arr[finaIndex].length - 1].type = '非捕获分组';
				} else if (/^\?=/.test(subStr)) {
					atIndex += 2;
					subStr = /^\?=(.*)$/.exec(subStr)[1];
					arr[finaIndex][arr[finaIndex].length - 1].type = '肯定环视';
				} else if (/^\?!/.test(subStr)) {
					atIndex += 2;
					subStr = /^\?!(.*)$/.exec(subStr)[1];
					arr[finaIndex][arr[finaIndex].length - 1].type = '否定环视';
				} else {
					arr[finaIndex][arr[finaIndex].length - 1].type = '捕获分组' + groupIndex++;
				}
				atIndex += subStr.length + 1;
				arr[finaIndex][arr[finaIndex].length - 1].atom = subStr;

				operatorObj = findOperator(str.substring(atIndex + 1));
				arr[finaIndex][arr[finaIndex].length - 1].operator = operatorObj.operator;
				atIndex += operatorObj.length;

				arr[finaIndex][arr[finaIndex].length - 1].branch = [];
				parseMeta(subStr, arr[finaIndex][arr[finaIndex].length - 1].branch);
				arr[finaIndex][arr[finaIndex].length - 1].length = 0;
			} else {
				arr[finaIndex][arr[finaIndex].length - 1].index = atIndex;

				tempAtom = str.charAt(atIndex);
				arr[finaIndex][arr[finaIndex].length - 1].atom = tempAtom;

				operatorObj = findOperator(str.substring(atIndex + 1));
				arr[finaIndex][arr[finaIndex].length - 1].operator = operatorObj.operator;
				atIndex += operatorObj.length;

				arr[finaIndex][arr[finaIndex].length - 1].branch = [];

				arr[finaIndex][arr[finaIndex].length - 1].length = 0;
			}
		}
	}

	function makeMeta(firstChar) {
		var meta = firstChar;
		return function(atChar) {
			meta += atChar;
			return meta;
		}
	}
	return parseMeta;
});