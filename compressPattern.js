function compress1D_B(str){

	console.log("Compress B Start");
	logTime("Compress B End");

	console.log(str);
	
	str = Array.isArray(str) ? str.join("") : str;
	var out = cleanPattern(str);
	out = decompress1D(out);
	var outA = out.split("");
	var outA = recursiveCompression(outA);

	console.log("Compress B Cycles : "+cycles);

	logTimeEnd("Compress B End");

	return outA;

}

var cycles = 0;
var counter = 0;

function recursiveCompression(outA){

	var marker = counter++;

	console.log([marker, "IN", outA.join("")]);
	
	var maxGroupSize = Math.floor(outA.length/2);
	//var maxGroupSize = 2;

	var ai, bi, multiples, matchCount, replacement, arrayL, groupA, groupB, regrouped, deepReplacement, groupL;

	for (var groupSize = maxGroupSize; groupSize >= 1; groupSize--) {


		regrouped = false;
		ai = 0;
		multiples = 1;
		matchCount = 0;
		replacement = "";
		arrayL = outA.length;
		bi = ai + groupSize;
		groupA = outA.slice(ai, ai+groupSize);

		while ( groupA.length == groupSize && groupA.length > 0){


			cycles++;
			groupB = outA.slice(bi, bi+groupSize);


			if ( groupA.join() == groupB.join() ){
				
				multiples++;
				bi = bi + groupSize;
			
			} else {
				
				if ( multiples > 1 ){

					matchCount = multiples * groupSize;

					if ( groupA.length > 1 ){

						replacement = recursiveCompression(groupA).join("");

					} else {

						replacement = groupA.join("");

					}
					var insideMultiplesRegex = /^(\d+)\(([a-zA-Z0-9]+)\)$|^(\d+)([a-zA-Z])$/;
					var match = insideMultiplesRegex.exec(replacement) || [];

					if ( match.length && match[1] > 1 || match[3] > 1){

						replacement = match[2] == undefined ? match[4] : match[2];
						var newMultiple = Number(match[1] == undefined ? match[3] : match[1]);

						multiples = multiples * newMultiple;

					}

					if ( replacement.length > 1){
						replacement = multiples + "(" + replacement + ")";
					} else if ( replacement.length == 1){
						replacement = multiples + replacement;
					}
					
					//replacement = [multiples, replacement];

					outA.splice(ai, matchCount, replacement);
					arrayL = arrayL - matchCount + 1;
					multiples = 1;
					ai = bi - matchCount + 1;
					groupA = groupB;
					bi = bi + groupSize - matchCount + 1;
					regrouped = true;
				} else {
					ai = ai + 1;
					bi = ai + groupSize;
					groupA = outA.slice(ai, ai+groupSize);
				}
			}

			if ( regrouped ){
				groupSize = Math.floor(outA.length/2);
			}

			if ( cycles > 10000 ){
				console.log("cycles exceeding limit : exit loop");
				break;
			}

		}
		
	}

	if ( cycles > 10000){
		console.log("cycles exceeding limit : exit function");
		return;
	}

	console.log([marker, "OUT", outA.join("")]);

	return outA;
}

function compress1D_A(str){
	
	logTime("Compress A");

	str = Array.isArray(str) ? str.join("") : str;
	var out = cleanPattern(str);
	out = decompress1D(out);
	var outA = out.split("");
	var cycles = 0;

	var maxGroupSize = Math.floor(outA.length/2);
	//var maxGroupSize = 2;

	var ai, bi, multiples, matchCount, replacement, arrayL, groupA, groupB, regrouped;

	for (var groupSize = 1; groupSize <= maxGroupSize; groupSize++) {

		regrouped = false;
		ai = 0;
		multiples = 1;
		matchCount = 0;
		replacement = "";
		arrayL = outA.length;
		bi = ai + groupSize;
		groupA = outA.slice(ai, ai+groupSize);
		complet = true;

		while ( groupA.length == groupSize ){

			cycles++;
			groupB = outA.slice(bi, bi+groupSize);

			if ( groupA.join() == groupB.join() ){
				multiples++;
				bi = bi + groupSize;
			} else {
				if ( multiples > 1 ){
					matchCount = multiples * groupSize;
					replacement = groupSize > 1 ? multiples + "(" + groupA.join("") + ")" : multiples + groupA.join("");
					outA.splice(ai, matchCount, replacement);
					arrayL = arrayL - matchCount + 1;
					multiples = 1;
					ai = bi - matchCount + 1;
					groupA = groupB;
					bi = bi + groupSize - matchCount + 1;
					regrouped = true;
				} else {
					ai = ai + 1;
					bi = ai + groupSize;
					groupA = outA.slice(ai, ai+groupSize);
				}
			}

			if ( regrouped ){
				groupSize = 1;
			}

			if ( cycles > 10000 ){
				console.log("cycles exceeding limit");
				break;
			}

		}
		
	}

	console.log("A : "+cycles);

	logTimeEnd("Compress A");

	return outA;
}

function compress1D(str){

	//logTime("Compress");

	var strL = Array.isArray(str) ? str.join("").length : str.length;

	var out, mid, multiples, replacement;

	str = Array.isArray(str) ? str.join("") : str;

	out = cleanPattern(str);
	out = decompress1D(out);
	mid = "";

	// find multiples of same letters individually
	// if multiple is 1 then don"t add digit to code
	var multiplesRegex = /([a-zA-Z])\1*/g;
	while (match = multiplesRegex.exec(out) ) {
		multiples = match[0].length;

		if ( multiples == 1 ){
			mid += match[1];
		} else {
			mid += multiples + match[1];
		}

	}
	out = mid;

	// find repeating pattern parts and put them in braces
	var bracesRegex = /(((?:\d+[a-zA-Z])+?)\2+)/;
	while (match = bracesRegex.exec(out) ) {
		multiples = countMatches(match[1], match[2]);
		replacement = multiples+"("+match[2]+")";
		out = replaceFirstMatch(out, match[1], replacement);
	}

	//logTimeEnd("Compress");

	return out;
}

function compress1D_old(str){
	var out, mid, multiples, replacement;

	str = Array.isArray(str) ? str.join("") : str;

	out = cleanPattern(str);
	out = decompress1D(out);
	mid = "";

	// find multiples of same letters individually
	//var multiplesRegex = /([a-zA-Z])\1*/g;
	var multiplesRegex = /(?<ful>(?<sub>[a-zA-Z])\k<sub>*)/gy;
	while (match = multiplesRegex.exec(out) ) {

		multiples = countMatches(match.groups.ful, match.groups.sub);
		mid += multiples + match.groups.sub;
	}
	out = mid;

	var bracesRegex = /(?<ful>(?<sub>(?:\d*[a-zA-Z])+?)\k<sub>+)/;
	while (match = bracesRegex.exec(out) ) {
		multiples = countMatches(match.groups.ful, match.groups.sub);
		replacement = multiples+"("+match.groups.sub+")";
		out = replaceFirstMatch(out, match.groups.ful, replacement);
	}
	var oneRegex = /(?<ful>[1](?<alpha>[a-zA-Z]))/;
	while (match = oneRegex.exec(out) ) {
		out = replaceFirstMatch(out, match.groups.ful, match.groups.alpha);
	}
	return out;
}

function decompress1D(str){

	var out, match, replacement;
	out = cleanPattern(str);
	var openBracesRegex = /(?<ful>(?<mul>[0-9]*)\((?<sub>(?:\d*[a-zA-Z])+)\))/;
	while (match = openBracesRegex.exec(out) ) { 
		replacement = match.groups.sub.repeat(match.groups.mul);
		out = replaceFirstMatch(out, match.groups.ful, replacement);
	}
	var openMultiplyRegex = /(?<ful>(?<num>\d+)(?<alpha>[a-zA-Z]))/;
	while (match = openMultiplyRegex.exec(out) ) {
		replacement = match.groups.alpha.repeat(match.groups.num);
		out = replaceFirstMatch(out, match.groups.ful, replacement);
	}

	// remove any lone digit
	out = out.replace(/\d+/g,"");

	return out;
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

function decodePattern(string){

	var match, matches = [[],[],[]], matchString, multiplier, subPattern, multipleRepeat;

	var cleanString = decompress1D(string);

	var regex = /(\d*)([a-zA-Z])/yg;
	while (match = regex.exec(cleanString) ) {

		if ( match[1] == "" ){
			matches[0].push("1"+match[0]);
			matches[1].push("1");
			matches[2].push(match[2]);
		} else {
			matches[0].push(match[0]);
			matches[1].push(match[1]);
			matches[2].push(match[2]);
		}

	}

	var n, alpha, num, numSum = 0;

	var patternObj = {};
    patternObj.terms = matches[0];
    patternObj.nums = matches[1];
    patternObj.alphas = matches[2];
    patternObj.alpha = {};
    patternObj.unique = [];
    patternObj.termcount = patternObj.terms.length;

    for (n = 0; n < patternObj.termcount; n++) {
        alpha = patternObj.alphas[n];
        num = Number(patternObj.nums[n]);
        if ( patternObj.alpha[alpha] === undefined ){
        	patternObj.alpha[alpha] = {};
        	patternObj.alpha[alpha].count = 0;
        	patternObj.unique.push(alpha);
        }
        patternObj.alpha[alpha].count += num;
        numSum += num;
    }
    patternObj.sum = numSum;

    return patternObj;

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

// Compress binary string
function compressBinary(str){
	str = str.replace(/[^01]/g, "");
	
}