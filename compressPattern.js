function compress1D(str){

	var res, mid, multiples, replacement;

	//logTime("Compress");
	str = Array.isArray(str) ? str.join("") : str;
	res = cleanPattern(str);
	res = decompress1D(res);
	mid = "";
	// find multiples of same letters individually
	// if multiple is 1 then dont add digit to code
	var multiplesRegex = /([a-zA-Z])\1*/g;
	while (match = multiplesRegex.exec(res) ) {
		multiples = match[0].length;
		if ( multiples === 1 ){
			mid += match[1];
		} else {
			mid += multiples + match[1];
		}
	}
	res = mid;
	// find repeating pattern parts and put them in braces
	var bracesRegex = /(((?:\d+[a-zA-Z])+?)\2+)/;
	while (match = bracesRegex.exec(res) ) {
		multiples = countMatches(match[1], match[2]);
		replacement = multiples+"("+match[2]+")";
		res = replaceFirstMatch(res, match[1], replacement);
	}
	//logTimeEnd("Compress");
	return res;
}

// With non-named capturing groups
function decompress1D(str){
	var res, match, replacement;
	res = cleanPattern(str);
	var openBracesRegex = /(([0-9]*)\(((?:\d*[a-zA-Z])+)\))/;
	while (match = openBracesRegex.exec(res) ) { 
		replacement = match[3].repeat(match[2]);
		res = replaceFirstMatch(res, match[1], replacement);
	}
	var openMultiplyRegex = /((\d+)([a-zA-Z]))/;
	while (match = openMultiplyRegex.exec(res) ) {
		replacement = match[3].repeat(match[2]);
		res = replaceFirstMatch(res, match[1], replacement);
	}
	// remove any lone digit
	res = res.replace(/\d+/g,"");
	return res;
}

function compress2D(arr){
	var str = "";
	arr.forEach(function(e){
		str += "_"+compress1D(e.join(""));
	});
	return str.substring(1);
}

function decompress2D(str){
	var arr = [];
	str.split("_").forEach(function(e){
		arr.push(decompress1D(e).split(""));
	});
	return arr;
}

function replaceFirstMatch(string, search, replacement) {
    return string.replace(search, replacement);
}

function countMatches(string, search){
	return string.split(search).length - 1;
}

// Remove all except a-zA-Z0-9()
function cleanPattern(string){
	return string.replace(/[^a-zA-Z0-9\(\)]/g, "");
}