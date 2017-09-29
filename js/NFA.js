define('NFA', function() {
	/*
	spareObj:{
	    stringIndex:0,
	    metaIndex:0
	}
	*/
	var matchLen = 0;

	function lineTry(tryString, metas, showMatch) {
		var strChars = '',
			tempReg = null,
			tempMeta = null,
			branchLength = metas.length, //分支数
			branchTest;
		var branchIndex = 0; //从左至右的分支匹配
		//分支回溯
		function parseBranch(metaBranch) {
				for (var i = 0, metaIndex = 0, len = metaBranch.length; metaIndex < len; metaIndex++) {
					tempMeta = metaBranch[metaIndex];
					if (tempMeta.branch.length) {
						branchTest = lineTry(tryString.substring(i), tempMeta.branch, showMatch);
						if (branchTest === false) {
							return false;
						} else {
							i += matchLen;
						}

					} else {
						if (!tempMeta.operator) {
							tempReg = new RegExp(tempMeta.atom);
							strChars = tryString[i] === undefined ? '' : tryString[i];
							if (!tempReg.test(strChars)) {
								showMatch(strChars, tempMeta.atom, false);
								//如果之前的操作符是可回溯的量词，则尝试回溯
								//todo
								return false;
							} else {
								showMatch(strChars, tempMeta.atom, true);
								i++;
							}
						} else {
							tempReg = new RegExp('^' + tempMeta.atom + tempMeta.operator + '$');
							switch (tempMeta.operator) {
								case '+':
									strChars = tryString.substring(i);
									while (!tempReg.test(strChars) && strChars.length > 0) {
										showMatch(strChars, tempReg, false);
										strChars = tryString.substr(i, strChars.length - 1);
									}
									if (strChars.length === 0) {
										return false;
									} else {
										showMatch(strChars, tempReg, true);
										i = i + strChars.length;
									}
									break;
								case '*':
									strChars = tryString.substring(i);
									while (!tempReg.test(strChars)) {
										showMatch(strChars, tempReg, false);
										strChars = tryString.substr(i, strChars.length - 1);
									}
									showMatch(strChars, tempReg, true);
									i = i + strChars.length;
									break;
								case '?':
									strChars = tryString.substr(i, 1);
									if (!tempReg.test(strChars)) {
										showMatch(strChars, tempReg, false);
										strChars = tryString.substr(i, 0);
									}
									showMatch(strChars, tempReg, true);
									i = i + strChars.length;
									break;
							}
						}
					}
				}
				matchLen = i;
				return true;
			}
			//量词回溯
		function parseBack() {

		}
		for (; branchIndex < branchLength; branchIndex++) {
			if (parseBranch(metas[branchIndex])) {
				return true;
			}
		}
		return false;

	}

	function nfa(inputStr, metas, showMatch) {
		var spareArr = [],
			tempStr = '',
			tempReg = null,
			isMatch = false; //备用状态
		showMatch('---------------------------------匹配开始------------------------------------');
		for (var i = 0, len = inputStr.length; i < len; i++) {
			tempStr = inputStr.substring(i);
			if (!lineTry(tempStr, metas, showMatch)) {} else {
				//showMatch('匹配成功！');
				isMatch = true;
				break;
			}
		}
		isMatch ? showMatch('匹配成功！') : showMatch('匹配失败！');
		showMatch('---------------------------------匹配结束------------------------------------');
	}

	return nfa;
});