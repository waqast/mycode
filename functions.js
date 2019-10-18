// -------------------------------------------------------------
// Clone 1D Array ----------------------------------------------
// -------------------------------------------------------------
function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function isBetween(v, min, max){
	return v >= min && v <= max; 
}

// -------------------------------------------------------------
// Get Random whole nubmer between two numbers -----------------
// -------------------------------------------------------------
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// ----------------------------------------------------------------------------------
// Get Random Integer including Limits
// ----------------------------------------------------------------------------------
function getRandomInt(min, max) {
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Flip 0 Based Index Number on canvas 
function flipIndex(num, height){
	return height - num - 1;
}

function lookup(item, itemArr, resultArr, notMatchVal = false){

	var index = itemArr.indexOf(item);
	if ( index !== -1 && resultArr[index] !== undefined ){
		return resultArr[index];
	} else {
		return notMatchVal;
	}

}

function smallerRatio(a, b){

	//console.log([a, b, a/b, b/a]);

	return a > b ? b/a : a/b;
}

// -------------------------------------------------------------
// Get Elements Group Size in Array ----------------------------
// -------------------------------------------------------------
function getGroupSizeAt(index, array){

	if ( array.length > index ){
		var value = array[index];
		var leftPart = array.slice(0, index).reverse();
		var rightPart = array.slice(index+1, array.length);
		var searchLeftPart = true;
		var searchRightPart = true;
		var n = 0;
		var count = 1;
		while (searchLeftPart || searchRightPart){
			if ( leftPart[n] == value && searchLeftPart){
				count++;
			} else {
				 searchLeftPart = false;
			}
			if ( rightPart[n] == value && searchRightPart){
				count++;
			} else {
				 searchRightPart = false;
			}
			n++;
		}
		return count;
	} else {
		return false;
	}

}

// -------------------------------------------------------------
// Get Stripe Data in Array at Index ---------------------------
// -------------------------------------------------------------
function getStripeData(array, index){
  
  	var i;

	if (  index < array.length ){
		var value = array[index];
		var leftPart = array.slice(0, index).reverse();
		var rightPart = array.slice(index+1, array.length);

		var start = leftPart.length;
		
		for (i = 0; i < leftPart.length; i++) {
		    if (leftPart[i] == value) {
		    		start--;
		    } else {
		    	break;
		    }
		}

		var end = index;

		for (i = 0; i < rightPart.length; i++) {
		    if (rightPart[i] == value) {
		    		end++;
		    } else {
		    	break;
		    }
		}

		var size = end - start + 1;
		var val = array[index];

		return [start, end, size, val];

	} else {

		return false;

	}

}

// -------------------------------------------------------------
// Unique Array ------------------------------------------------
// -------------------------------------------------------------
Array.prototype.unique = function() {
    var o = {}, i, l = this.length, r = [];
    for(i=0; i<l;i+=1) o[this[i]] = this[i];
    for(i in o) r.push(o[i]);
    return r;
};

Array.prototype.countOf = function(item) {
    var i, count = 0;
    for (i = 0; i < this.length; ++i){
    	if (this[i] == item){
    		count++;
    	}
    }
    return count;
};

// -------------------------------------------------------------
// Same Arrays with or without same arrangement-----------------
// -------------------------------------------------------------
Array.prototype.equalTo = function(what) {
    if(this.length !== what.length) return false;
    var cA = this.slice().sort().join(","); 
    var cB = what.slice().sort().join(",");

    return cA===cB;
};

// -------------------------------------------------------------
// Array Union -------------------------------------------------
// -------------------------------------------------------------
Array.prototype.union = function(arr) {
    return this.concat(arr).unique();
};

// -------------------------------------------------------------
// Least Common Multiple in an Array ---------------------------
// -------------------------------------------------------------
Array.prototype.lcm = function() {  
    var n = this.length;
	var a = Math.abs(this[0]);
    for (var i = 1; i < n; i++){
		var b = Math.abs(this[i]), c = a;
		while (a && b){
			a > b ? a %= b : b %= a;
		} 
       a = Math.abs(c*this[i])/(a+b);
     }
    return a;
};

// ----------------------------------------------------------------------------------
// Array Functions
// ----------------------------------------------------------------------------------
Array.prototype.rotate2D = function(direction) {

	var arr = this.clone();
	var x, y;
	var arrW = arr.length;
	var arrH = arr[0].length;
	var rotated = [];
	for (x = 0; x < arrH; ++x){
		rotated[x] = [];
		for (y = 0; y < arrW; ++y){
			if (direction === "anticlockwise"){
				rotated[x][y] = arr[y][arrH-x-1];
			} else if (direction === "clockwise"){
				rotated[x][y] = arr[arrW-y-1][x];
			}
		}
	}	
	return rotated;
};

Array.prototype.rotate2D8 = function(dir) {
	return this.transform2D8(6, "rotate"+dir);
};

Array.prototype.flip2D8 = function(dir) {
	return this.transform2D8(7, "flip"+dir);
};

// Clone Object or Array
Array.prototype.clone = function() {
    return recursiveDeepCopy(this);
};

Array.prototype.copy2D8 = function(sx = 0, sy = 0, lx = 0, ly = 0, overflowX = "trim", overflowY = "trim", blank = 0) {
    	
	let canvas = this.clone2D8();
	canvasW = canvas.length;
	canvasH = canvas[0].length;

	let result = canvas.clone2D8();

	if ( sx > lx ){
		[sx, lx] = [sx, lx];
	}

	if ( overflowX == "trim" ){

		sx = limitNumber(sx, 0, canvasW);
		lx = limitNumber(lx, 0, canvasW);
		copyW = lx + 1;
		result = canvas.slice(sx, copyW);

	} else if ( overflowX == "loop" ){

		copyW = lx - sx + 1;
		canvas = canvas.shift1D(-sx);
		result = [blank].repeat(copyW);
		result = paste1D(canvas, result, 0, "repeat");

	} else if ( overflowX == "extend" ){

		var leftIndent = sx < 0 ? -sx : 0;
		resultW = lx - sx + 1;
		sx = limitNumber(sx, 0, canvasW);
		lx = limitNumber(lx, 0, canvasW);
		canvas = canvas.slice(sx, lx +1);
		result = newArray2D8(36, resultW, canvasH);
		result = paste1D(canvas, result, leftIndent, "trim");

	}

	result = result.map(a => a.copy1D8(sy, ly, overflowY, blank));

	return result;

};

function recursiveDeepCopy(obj) {
	var nObj, i;
	if (typeof obj !== "object") { return obj; }
	if (!obj) { return obj; }
	if ("[object Array]" === Object.prototype.toString.apply(obj)) {
		nObj = [];
		for (i = 0; i < obj.length; i += 1) { nObj[i] = recursiveDeepCopy(obj[i]); }
		return nObj;
	}
	nObj = {};
	for (i in obj) { if (obj.hasOwnProperty(i)) { nObj[i] = recursiveDeepCopy(obj[i]); } }
	return nObj;
}

Array.prototype.flip2D = function(dir) {
	if (dir == "h") {
		return this.clone().reverse();
	} else {
		return this.clone().map(e => e.reverse());
	}
};

Array.prototype.shift2D = function(x, y) { 
	var popped, i, modArr = this.clone(), xAmount = Math.abs(x), yAmount = Math.abs(y);
	if ( x < 0 ){ for (i = 0; i < xAmount; i++) { popped = modArr.shift(); modArr.push(popped); } }
	if ( x > 0 ){ for (i = 0; i < xAmount ; i++) { popped = modArr.pop(); modArr.unshift(popped); } }
	if ( y < 0 ){ for (i = 0; i < yAmount; i++) { for (x = 0; x < this.length; x++) { popped = modArr[x].shift(); modArr[x].push(popped); } } }
	if ( y > 0 ){ for (i = 0; i < yAmount; i++) { for (x = 0; x < this.length; x++) { popped = modArr[x].pop(); modArr[x].unshift(popped); } } }
	return modArr;
};

Array.prototype.insertAt = function(index, itm) { 
	var modArray = this.slice(0);
	modArray.splice(index, 0, itm);
	return modArray;
};

Array.prototype.insertArrayAt = function(index, itm) {
	var leftArray = this.slice(0, index);
	var rightArray = this.slice(index);
	var modArray = leftArray.concat(itm, rightArray);
	return modArray;
};

Array.prototype.insert = function(index) {
    index = Math.min(index, this.length);
    arguments.length > 1
        && this.splice.apply(this, [index, 0].concat([].pop.call(arguments)))
        && this.insert.apply(this, arguments);
    return this;
};

Array.prototype.removeAt = function(index) { 
	var modArray = this.slice(0);
	modArray.splice(index, 1);
	return modArray;
};

Array.prototype.replaceAll = function(what, withThis) { 
	return this.map(a => a == what ? withThis : a);
};

function removeItem(array, item) {
    return array.filter(i => i !== item);
}

Array.prototype.random = function(num = false) {
	if (!num){
		num = this.length;
	}
	var modArray = this.slice(0);
	modArray = modArray.shuffle();
	modArray = modArray.slice(0, num);
	return modArray;
};


// Replace whatArr Elements with withArr Elements in an Array index wise
Array.prototype.replaceElements = function(whatArr, withArr) { 
	return this.map( e => {
		let i = whatArr.indexOf(e);
		return i == -1 ? e : withArr[i];
	});
};

// -------------------------------------------------------------	
// Get Sum of Array Elements -----------------------------------
// -------------------------------------------------------------
Array.prototype.sum = function(selector) {
	if (typeof selector !== "function") {
		selector = function(item) {
			return item;
		};
	}
	var sum = 0;
	for (var i = 0; i < this.length; i++) {
		sum += parseFloat(selector(this[i]));
	}
	return sum;
};
	
// -------------------------------------------------------------	
// Get Array of elements Greater than and Smaller including limits
// -------------------------------------------------------------
Array.prototype.filterInRange = function(min, max) {
	return this.filter(function(item) {
		return item >= min && item <= max;
	});
};
	
// -------------------------------------------------------------	
// Min and Max value in an array
// -------------------------------------------------------------
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

// -------------------------------------------------------------	
// Shuffle Array -----------------------------------------------
// -------------------------------------------------------------
Array.prototype.shuffle = function() {
	var newArray = this.slice(0);
	var i = newArray.length, j, temp;
	if ( i === 0 ) return newArray;
	while ( --i ) {
		j = Math.floor( Math.random() * ( i + 1 ) );
		temp = newArray[i];
		newArray[i] = newArray[j];
		newArray[j] = temp;
	}
	return newArray;
};

// -------------------------------------------------------------
// Repeat 1D Array ---------------------------------------------
// -------------------------------------------------------------
Array.prototype.repeat = function(count) {
	var a = [], i;
	for( i = 0; i < count; i++) {
		a = a.concat(this);
	}
	return a;
};

// ----------------------------------------------------------------------------------
// Remove One Array from Other
// ----------------------------------------------------------------------------------
Array.prototype.removeArray = function(arr) { 
  	return this.filter(function(obj) { return arr.indexOf(obj) == -1; });
};

// ----------------------------------------------------------------------------------
// Remove One Array from Other
// ----------------------------------------------------------------------------------
Array.prototype.removeArray = function(toRemove) {
	toRemove = Array.isArray(toRemove) ? toRemove : [toRemove];
  	return this.filter( function( el ) {
	  return !toRemove.includes( el );
	});
};

// -------------------------------------------------------------
// Correct the File Name ---------------------------------------
// -------------------------------------------------------------
function goodFileName(fileName, requireExt, AlternateName){

	fileName = fileName.toLowerCase();
	fileName = fileName.replace(/\s/g, "");	
	if (fileName === ""){
		fileName = AlternateName + "-weavedesigner-" + $.now() + "." + requireExt;
	}
	var fileExt = fileName.substring(fileName.lastIndexOf(".")+1);
	if (fileExt != requireExt){
		fileName = fileName + "." + requireExt;
	}
	return fileName;

}

// -------------------------------------------------------------
// Removes All Occurence of an element from array --------------
// -------------------------------------------------------------
Array.prototype.remove = function(what) { 
    return this.filter(e => e !== what);
};

Array.prototype.removeItem = function(what) { 
    return this.filter(e => e !== what);
};

// -------------------------------------------------------------
// Factor Array ------------------------------------------------
// -------------------------------------------------------------
function getFactors(number, multiplierLimit){
	var factorArray = [];
	for (var i = 2; i < number; i++){
		if ( number % i === 0){
			if (multiplierLimit){
				if (number/i >= multiplierLimit){
					factorArray.push(i);
				}
			} else {
				factorArray.push(i);
			}
		}
	}
	return factorArray;
}

// ----------------------------------------------------------------------------------
// Convert Pattern Short Code String to Pattern Array
// ----------------------------------------------------------------------------------
function unZipPattern(patternString) {
 var patternArray, re, m, n;
  patternArray = [];
  if (patternString !== ""){
   re = /(\d+)([a-zA-Z]+)/g; 
    while ((m = re.exec(patternString)) !== null) {
     if (m.index === re.lastIndex) { re.lastIndex++; }
     for (n = 0; n < m[1]; n++){ patternArray.push(m[2]); }
    }
   }
  return patternArray;
}

function forEachZipPatternMember(pattern, call){
	var re, m;
	re = /(\d+)([a-zA-Z]+)/g; 
	while ((m = re.exec(pattern)) !== null) {
		if (m.index === re.lastIndex) { re.lastIndex++; }
		call(m[1], m[2]);
	}
}

// -------------------------------------------------------------
// Zip Pattern -------------------------------------------------
// -------------------------------------------------------------
function zipPattern(patternArray){
	var patternSize, currentLetter, previousLetter, letterCount, zippedPattern, n;
	patternSize = patternArray.length;
	zippedPattern = "";
	
	if ( patternSize > 0 ){

		previousLetter = patternArray[0];
		letterCount = 0;
		
		for (n = 0; n < patternSize; n++){
			
			currentLetter = patternArray[n];
			if (currentLetter == previousLetter){
				letterCount++;
				if (n == patternSize - 1){
					zippedPattern += letterCount + previousLetter;
				}	
							
			} else {
				
				zippedPattern += letterCount + previousLetter;
				letterCount = 1;
				if (n == patternSize - 1){
					zippedPattern += letterCount + currentLetter;
				}	
			}
			previousLetter = currentLetter;
			
		}
	
	}
	return zippedPattern;
}

// -------------------------------------------------------------
// Pattern Group Array -----------------------------------------
// -------------------------------------------------------------
function getPatternGroupArray(patternArray){
	var patternSize, currentLetter, previousLetter, letterCount, groupPattern, n;
	patternSize = patternArray.length;
	groupPattern = [];
	
	if ( patternSize > 0 ){

		previousLetter = patternArray[0];
		letterCount = 0;
		
		for (n = 0; n < patternSize; n++){
			
			currentLetter = patternArray[n];
			if (currentLetter == previousLetter){
				letterCount++;
				if (n == patternSize - 1){
					groupPattern.push([previousLetter,letterCount]);
				}	
							
			} else {
				
				groupPattern.push([previousLetter,letterCount]);
				letterCount = 1;
				if (n == patternSize - 1){
					groupPattern.push([previousLetter,letterCount]);
				}	
			}
			previousLetter = currentLetter;
			
		}
	
	}
	return groupPattern;
}

// ----------------------------------------------------------------------------------
// Expand Weave Array to String
// ----------------------------------------------------------------------------------
function unZipWeave2(zipStr){
	var weaveArrayInitial, weaveEnds, weaveArray, x, endArray;
	weaveArrayInitial = zipStr.split("x");
	weaveEnds = weaveArrayInitial.length;
	weaveArray = [];
	for (x = 0; x < weaveEnds; x++){
		endArray = unZipPattern(weaveArrayInitial[x]);
		weaveArray[x] = endArray;
	}
	return weaveArray;
}

function unZipWeave(weaveString){
	return weaveString.split("x").map(e => unZipPattern(e));
}

// ----------------------------------------------------------------------------------
// Search Item in Array
// ----------------------------------------------------------------------------------
Array.prototype.contains = function(obj) {
    return this.indexOf(obj) > -1;
};

// ----------------------------------------------------------------------------------
// Download Text As File
// ----------------------------------------------------------------------------------
function downloadTextAsFile(text, filename) {
	var blob = new Blob([text], { type: "text/plain" });
	var link = document.createElement("a");
	link.download = filename;
	link.href = window.URL.createObjectURL(blob);
	link.click();
}

// ----------------------------------------------------------------------------------
// Shrink Weave Array to String
// ----------------------------------------------------------------------------------
function zipWeave(weaveArray){
	var weaveString, modWeaveArray, x;
	weaveString = "";
	modWeaveArray = [];
	for (x = 0; x < weaveArray.length; x++){ modWeaveArray.push(zipPattern(weaveArray[x])); }
	weaveString = modWeaveArray.join("x");
	return weaveString;
}

// ----------------------------------------------------------------------------------
// Get Difference of 2 Arrays as Array
// ----------------------------------------------------------------------------------
function getArrayDiff(arr1, arr2) {
  	//return arr1.filter(function(obj) { return arr2.indexOf(obj) == -1; });
  	var unionArray = arr1.concat(arr2);
  	var commonArray = getCommonElements(arr1, arr2);
  	var finalArray = unionArray.removeArray(commonArray);
  	return finalArray;
}

// ----------------------------------------------------------------------------------
// Get Common Elements of 2 Arrays as Array
// ----------------------------------------------------------------------------------
function getCommonElements(array1, array2){
	var common = $.grep(array1, function(element) {
		return $.inArray(element, array2 ) !== -1;
	});
	return common;
}

// ----------------------------------------------------------------------------------
// Hash Code
// ----------------------------------------------------------------------------------	
function djb2Code(str){
	var i, chr, hsh = 5381;
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hsh = ((hsh << 5) + hsh) + chr; /* hash * 33 + c */
	}
	return hsh;
}

// -------------------------------------------------------------	
// Variable Null or Undefined-----------------------------------
// -------------------------------------------------------------	
function valOf(cVar){
	if ( typeof(cVar) === "undefined" || cVar === null ){
		return true;
	} else {
		return cVar;
	}		
}

Array.prototype.indexOfArray = function(search){
  var searchJson = JSON.stringify(search);
  var arrJson = this.map(JSON.stringify);
  return arrJson.indexOf(searchJson);
};

Array.prototype.indicesOf = function(search){
	var x;
	var arrayL = this.length;
	var indices = []; 
	for (x = 0; x < arrayL; x++) {
		if ( search == this[x] ){
			indices.push(x);
		}
	}
	return indices;
};

function mapNumberToRange(num, minIn, maxIn, minOut, maxOut, rounded = true, limit = true){
	var out, ratio;
	if ( minIn == maxIn ){
		out = minOut + (maxOut - minOut)/2;
	} else {
		ratio = (maxOut - minOut) / (maxIn - minIn);
		out = minOut + (num - minIn) * ratio;
	}
	out = limit ? limitNumber(out, minOut, maxOut) : out;
	out = rounded ? Math.round(out) : out;
	return out;
}

function mapNumber(num, start, end){
	return num - Math.floor((num - start) / end) * end;
}

// reset to 0 if more than or equat to divisor. MOD operation
function loopNumber(num, divisor){
	return ((num % divisor) + divisor) % divisor;
	//return num & (divisor - 1);
}

// gives number between limits.
function limitNumber(num, min, max){
	if ( max < min ){
		[min, max] = [max, min];
	}
	return	num < min ? min : num > max ? max : num;
}



// -------------------------------------------------------------	
// Get Array of Repeating Element ------------------------------
// -------------------------------------------------------------
function filledArray(value, len) {
  var arr = [];
  for (var i = 0; i < len; i++) {
	arr.push(value);
  }
  return arr;
}

function getDate(format){
	var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var date = new Date();
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	if ( format == "short"){
		return monthNames[monthIndex].substring(0,3) + " "+ day + ", " + year;
	} else {
		return monthNames[monthIndex] + " "+ day + ", " + year;
	}
	
	
}

function removeEmptyEnds(weave){
	return weave.filter(a => !a.allEqual("D"));
}


function weave2Array(arr){
	let arr2D = arr;
	arr.forEach(function(e, x) {
		e.forEach(function(p, y) {
			arr2D[x][y] = p == "U" ? 1 : 0;
		});
	});
	return arr2D;
}

function array2weave(arr){
	let arr2D = arr;
	arr.forEach(function(e, x) {
		e.forEach(function(p, y) {
			arr2D[x][y] = p ? "U" : "D";
		});
	});
	return arr2D;
}

function unique2D_old(array2D){
	let str, pos, n = 0;		
	var posIndex = [];
	var uniques = [];
	var uniqueStrs = [];
	array2D.forEach(function(e, i) {
		str = e.join("");
		pos = uniqueStrs.indexOf(str);		
		if ( pos == -1 ){
			uniqueStrs[n] = str;
			uniques[n] = e;
			pos = n;
			n++;
		}
		posIndex[i] = pos;
	});
	return {
		uniques : uniques,
		posIndex : posIndex
	};
}

function unique2D(array2D, maxLimit = 0){
	let n = 0, e, str, pos, inLimit = true;		
	var arrW = array2D.length;
	var posIndex = [];
	var uniques = [];
	var uniqueStrings = [];
	for (var x = 0; x < arrW; ++x) {
		if ( maxLimit && n >= maxLimit){
			inLimit = false;
			break;
		}
		e = array2D[x];
		str = e.join("");
		pos = uniqueStrings.indexOf(str);		
		if ( pos == -1 ){
			uniqueStrings[n] = str;
			uniques[n] = e;
			pos = n;
			n++;
		}
		posIndex[x] = pos;
	}
	return {
		inLimit : inLimit,
		uniques : uniques,
		posIndex : posIndex
	};
}

// Color HSL (degrees, %, %) to HEX 
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// -------------------------------------------------------------
// Paste 1D Array -------------------------------------------
// -------------------------------------------------------------
function paste1D_old(source, target, pasteIndex, loop = true, blank = "") {

	var x, pos;

	source = source.clone();
	target = target.clone();

	var targetW = target.length;
	var sourceW = source.length;

	var newW = !loop ? Math.max(pasteIndex + sourceW, targetW) : targetW;
	if ( newW > targetW ){
		target = target.concat([blank].repeat(newW-targetW));
		targetW = newW;
	}

	for (x = 0; x < sourceW; x++) {
		pos = x + pasteIndex;
		pos = loop ? loopNumber(pos, targetW) : pos;
		target[pos] = source[x];
	}

	return target;
}

function copy1D(canvas, startX = 0 , lastX, overflow = "trim", blank = ""){

	canvas = canvas.clone();
	canvasW = canvas.length;

	let result = canvas.clone();

	if ( startX > lastX ){
		[startX, lastX] = [lastX, startX];
	}

	if ( overflow == "trim" ){

		startX = limitNumber(startX, 0, canvasW);
		lastX = limitNumber(lastX, 0, canvasW);
		copyW = lastX + 1;
		result = canvas.slice(startX, copyW);

	} else if ( overflow == "loop" ){

		copyW = lastX - startX + 1;
		canvas = canvas.shift1D(-startX);
		result = [blank].repeat(copyW);
		result = paste1D(canvas, result, 0, "repeat");
		//result = result.shift1D(startX);

	} else if ( overflow == "extend" ){

		var leftIndent = startX < 0 ? -startX : 0;
		resultW = lastX - startX + 1;
		startX = limitNumber(startX, 0, canvasW);
		lastX = limitNumber(lastX, 0, canvasW);
		copyW = lastX + 1;
		canvas = canvas.slice(startX, copyW);
		result = [blank].repeat(resultW);
		result = paste1D(canvas, result, leftIndent, "extend", blank);

	}

	return result;

}


function copy2D(canvas, startX, startY, lastX, lastY, overflowX = "trim", overflowY = "trim", blank = ""){

	canvas = canvas.clone();
	canvasW = canvas.length;
	canvasH = canvas[0].length;

	let result = canvas.clone();

	if ( startX > lastX ){
		[startX, lastX] = [lastX, startX];
	}

	if ( overflowX == "trim" ){

		startX = limitNumber(startX, 0, canvasW);
		lastX = limitNumber(lastX, 0, canvasW);
		copyW = lastX + 1;
		result = canvas.slice(startX, copyW);

	} else if ( overflowX == "loop" ){

		copyW = lastX - startX + 1;
		canvas = canvas.shift1D(-startX);
		result = [blank].repeat(copyW);
		result = paste1D(canvas, result, 0, "repeat");

	} else if ( overflowX == "extend" ){

		resultW = lastX - startX + 1;
		//startX = limitNumber(startX, 0, canvasW);
		lastX = limitNumber(lastX, 0, canvasW);
		copyW = lastX + 1;
		result = [blank].repeat(resultW);

	}

	result = result.map(a => copy1D(a, startY, lastY, overflowY, blank));

	return result;

}

function paste1D8(tile, canvas, pasteX = 0, overflow = "trim", blank = "") {

	let x, result, resultW, pasteW, canvasW, canvasX, tileW, tileX;

	canvas = canvas.slice();
	canvasW = canvas.length;

	tile = tile.slice();
	tileW = tile.length;

	result = canvas.slice();
	resultW = canvasW;

	if ( overflow == "trim" ){

		pasteW = Math.min(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		pasteW = pasteW < 0 ? 0 : pasteW;
		canvasX = limitNumber(pasteX, 0, canvasW-1);
		tileX = canvasX - pasteX;
		for (x = 0; x < pasteW; ++x) {
			result[x + canvasX] = tile[x + tileX];
		}

	} else if ( overflow == "loop" ){

		pasteW = limitNumber(tileW, 0, canvasW);
		pasteX = loopNumber(pasteX, canvasW);
		result = result.shift1D8(-pasteX);
		for (x = 0; x < pasteW; ++x) {
			result[x] = tile[x];
		}
		result = result.shift1D8(pasteX);

	} else if ( overflow == "extend" ){

		resultW = Math.max(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		result = new Uint8Array(resultW);
		canvasX = pasteX >= 0 ? 0 : -pasteX;
		for (x = 0; x < canvasW; ++x) {
			result[x+canvasX] = canvas[x];
		}
		pasteX = pasteX >= 0 ? pasteX : 0;
		for (x = 0; x < tileW; x++) {
			result[x+pasteX] = tile[x];
		}

	} else if ( overflow == "repeat" ){

		result = result.shift1D8(-pasteX);
		for (x = 0; x < resultW; ++x) {
			result[x] = tile[loopNumber(x, tileW)];
		}
		result = result.shift1D8(pasteX);
	}	

	return result;
}

function paste1D(tile, canvas, pasteX = 0, overflow = "trim", blank = "") {

	let x, pasteW, canvasX;

	canvas = canvas.slice();
	var canvasW = canvas.length;

	var tile = tile.slice();
	var tileW = tile.length;

	var result = canvas.slice();
	var resultW = canvasW;

	if ( overflow == "trim" ){

		pasteW = Math.min(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		pasteW = pasteW < 0 ? 0 : pasteW;
		canvasX = limitNumber(pasteX, 0, canvasW-1);
		var tileX = canvasX - pasteX;
		for (x = 0; x < pasteW; ++x) {
			result[x + canvasX] = tile[x + tileX];
		}

	} else if ( overflow == "loop" ){

		pasteW = limitNumber(tileW, 0, canvasW);
		pasteX = loopNumber(pasteX, canvasW);
		result = result.shift1D(-pasteX);
		for (x = 0; x < pasteW; ++x) {
			result[x] = tile[x];
		}
		result = result.shift1D(pasteX);

	} else if ( overflow == "extend" ){

		resultW = Math.max(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		result = [blank].repeat(resultW);
		canvasX = pasteX >= 0 ? 0 : -pasteX;
		for (x = 0; x < canvasW; ++x) {
			result[x+canvasX] = canvas[x];
		}
		pasteW = tileW;
		pasteX = pasteX >= 0 ? pasteX : 0;
		for (x = 0; x < pasteW; x++) {
			result[x+pasteX] = tile[x];
		}

	// fill canvas with tile from pasteX 
	} else if ( overflow == "repeat" ){

		result = result.shift1D(-pasteX);
		for (x = 0; x < resultW; ++x) {
			result[x] = tile[loopNumber(x, tileW)];
		}
		result = result.shift1D(pasteX);
	}	

	return result;
}

function paste2D(tile, canvas, pasteX = 0, pasteY = 0, xOverflow = "trim", yOverflow = "trim", blank = "") {

	let x, result, resultW, pasteW, canvasW, canvasX, tileW, tileX;

	canvas = canvas.clone();
	canvasW = canvas.length;
	canvasH = canvas[0].length;

	tile = tile.clone();
	tileW = tile.length;
	tileH = tile[0].length;

	resultW = xOverflow == "extend" ? Math.max(canvasW, tileW, canvasW - pasteX, tileW + pasteX) : canvasW;
	resultH = yOverflow == "extend" ? Math.max(canvasH, tileH, canvasH - pasteY, tileH + pasteY) : canvasH;

	result = empty2DArray(resultW, resultH, blank);
	canvasX = pasteX >= 0 ? 0 : -pasteX;
	canvasY = pasteY >= 0 ? 0 : -pasteY;
	for (x = 0; x < canvasW; x++) {
		result[x+canvasX] = paste1D(canvas[x], result[x+canvasX], canvasY, "trim", blank);
	}

	if ( xOverflow == "trim" ){

		pasteW = Math.min(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		pasteW = pasteW < 0 ? 0 : pasteW;
		canvasX = limitNumber(pasteX, 0, canvasW-1);
		tileX = canvasX - pasteX;
		for (x = 0; x < pasteW; x++) {
			result[x + canvasX] = paste1D(tile[x + tileX], result[x + canvasX], pasteY, yOverflow, blank);
		}

	} else if ( xOverflow == "loop" ){

		pasteW = limitNumber(tileW, 0, canvasW);
		pasteX = loopNumber(pasteX, canvasW);
		result = result.shift1D(-pasteX);
		for (x = 0; x < pasteW; x++) {
			result[x] = paste1D(tile[x], result[x], pasteY, yOverflow, blank);
		}
		result = result.shift1D(pasteX);

	} else if ( xOverflow == "extend" ){

		pasteW = tileW;
		pasteX = pasteX >= 0 ? pasteX : 0;
		for (x = 0; x < pasteW; x++) {
			result[x+pasteX] = paste1D(tile[x], result[x+pasteX], pasteY, yOverflow, blank);
		}

	}

	return result;
}

function paste2D8(tile, canvas, pasteX = 0, pasteY = 0, xOverflow = "trim", yOverflow = "trim", blank) {

	//console.log([tile, canvas, pasteX, pasteY, xOverflow, yOverflow]);

	let x, result, resultW, pasteW, canvasW, canvasX, tileW, tileX;

	canvas = canvas.clone2D8();
	canvasW = canvas.length;
	canvasH = canvas[0].length;

	tile = tile.clone2D8();
	tileW = tile.length;
	tileH = tile[0].length;

	resultW = xOverflow == "extend" ? Math.max(canvasW, tileW, canvasW - pasteX, tileW + pasteX) : canvasW;
	resultH = yOverflow == "extend" ? Math.max(canvasH, tileH, canvasH - pasteY, tileH + pasteY) : canvasH;

	result = newArray2D8(37, resultW, resultH);
	canvasX = pasteX >= 0 ? 0 : -pasteX;
	canvasY = pasteY >= 0 ? 0 : -pasteY;
	for (x = 0; x < canvasW; x++) {
		result[x+canvasX] = paste1D8(canvas[x], result[x+canvasX], canvasY, "trim", blank);
	}

	if ( xOverflow == "trim" ){

		pasteW = Math.min(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		pasteW = pasteW < 0 ? 0 : pasteW;
		canvasX = limitNumber(pasteX, 0, canvasW-1);
		tileX = canvasX - pasteX;
		for (x = 0; x < pasteW; x++) {
			result[x + canvasX] = paste1D8(tile[x + tileX], result[x + canvasX], pasteY, yOverflow, blank);
		}

	} else if ( xOverflow == "loop" ){

		pasteW = limitNumber(tileW, 0, canvasW);
		pasteX = loopNumber(pasteX, canvasW);
		result = result.shift1D(-pasteX);
		for (x = 0; x < pasteW; x++) {
			result[x] = paste1D8(tile[x], result[x], pasteY, yOverflow, blank);
		}
		result = result.shift1D(pasteX);

	} else if ( xOverflow == "extend" ){

		pasteW = tileW;
		pasteX = pasteX >= 0 ? pasteX : 0;
		for (x = 0; x < pasteW; x++) {
			result[x+pasteX] = paste1D8(tile[x], result[x+pasteX], pasteY, yOverflow, blank);
		}

	}

	return result;
}

function empty2DArray(ends, picks, filler = "") {
	return [...Array(ends)].map(x=>Array(picks).fill(filler)); 
}

function newArray2D(w, h, filler = false){
	var x, y;
	var arr2D = [];
	arr2D.length = w;
	for (x = 0; x < w; ++x) {
		arr2D[x] = [];
		arr2D[x].length = h;
		if ( filler ){
			for (y = 0; y < h; ++y) {
				arr2D[x][y] = filler;
			}
		}
	}
	return arr2D;
}

function newArray2D8(instanceId, w, h){

	// console.log(["newArray2D8", instanceId, w, h]);

	var arr2D8 = [];
	arr2D8.length = w;
	for (var x = 0; x < w; ++x) {
		arr2D8[x] = new Uint8Array(h);
	}
	return arr2D8;
}

function paste2D_old(tile, canvas, pasteX = 0, pasteY = 0, xOverflow = "trim", yOverflow = "trim", blank = "") {

  var x, y, posx, posy;
  
	tile = tile.clone();
	canvas = canvas.clone();

	var canvasW = canvas.length;
	var tileW = tile.length;

	var canvasH = canvas[0].length;
	var tileH = tile[0].length;

	var resultW = canvasW;
	var resultH = canvasH;

	if ( xOverflow == "trim" ){
		var pasteW = Math.min(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
		pasteW = limitNumber(pasteW, 0, canvasW);
	} else if ( xOverflow == "loop" ){

	} else if ( xOverflow == "extend" ){
		resultW = Math.max(canvasW, tileW, canvasW - pasteX, tileW + pasteX);
	}

	if ( yOverflow == "trim" ){
		var pasteH = Math.min(canvasH, tileH, canvasH - pasteY, tileH + pasteY);
		pasteH = limitNumber(pasteH, 0, canvasH);
	} else if ( yOverflow == "loop" ){

	} else if ( yOverflow == "extend" ){
		resultH = Math.max(canvasH, tileH, canvasH - pasteY, tileH + pasteY);
	}

	var result = empty2DArray(resultW, resultH, blank);
	var canvasX = pasteX >= 0 ? 0 : -pasteX;

	// Paste Canvas on Result
	for (x = 0; x < canvasW; x++) {
		for (y = 0; y < canvasH; y++) {
			result[x+canvasX][y+canvasX] = canvas[x][y];
		}
	}

	// Paste Tile
	for (x = 0; x < tileW; x++) {
		for (y = 0; y < tileH; y++) {

			posx = x + pasteX;
			posx = xloop ? loopNumber(posx, resultW) : posx;

			posy = y + pasteY;
			posy = yloop ? loopNumber(posy, resultH) : posy;

			result[posx][posy] = tile[x][y];
		}
	}

	return result;
	
}

function getFnName(fn) {
  var f = typeof fn == "function";
  var s = f && ((fn.name && ["", fn.name]) || fn.toString().match(/function ([^\(]+)/));
  return (!f && "not a function") || (s && s[1] || "anonymous");
}

function strToArr(item){
	if ( !Array.isArray(item) ){
		return item.split(",");
	} else {
		return item;
	}
}

Array.prototype.is2DArray = function(arr) {
	return arr.length && arr[0].length;
};

Array.prototype.occurrence = function(val) {
  return this.filter(e => e === val).length;
};

// Shift 1D array n positive to right, n negative to left
Array.prototype.shift1D = function(n) {
	return this.slice(-n, this.length).concat(this.slice(0, -n));
};

Uint8Array.prototype.shift1D8 = function(n) {

	return this.slice(-n, this.length).concat(this.slice(0, -n));
};

Uint8Array.prototype.concat = function(b) {
    var c = new this.constructor(this.length + b.length);
    c.set(this.slice());
    c.set(b, this.length);
    return c;
};

Array.prototype.allEqual = function(value = this[0]){
	return this.every((val, i, arr) => val === value);
};

// If All Elements of An Array Are Same
function allElementsSame(arr, val){
	var i, res = true;
	if (val !== undefined){
		for (i = 0; i < arr.length; ++i) {
			res = (arr[i] == val) && res;
		}
	} else {
		for (i = 0; i < arr.length; ++i) {
			res = (arr[i] == arr[0]) && res;
		}
	}
	return res;
}

Uint8Array.prototype.allEqual = function(val){
	if (val == undefined){ val = this[0]; }
	for (var i = 0; i < this.length; i++) {
		if ( this[i] !== val ){
			return false;
		}
	}
	return true;
};

Uint8Array.prototype.convertToArray2D = function(w, h){
	var i, x, y;
	var array2D = newArray2D(w, h);
	for (i = 0; i < this.length; ++i ) {
		x = i % w;
		y = h - Math.floor(i/w) - 1;
		array2D[x][y] = this[i] ? "U" : "D";
	}
	return array2D;
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hexToRgba1(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
    } : null;
}

function hexToRgba255(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;
}

function hexToColor32(hex, alpha = 255) {
	var color = hexToRgb(hex);
    return rgbaToColor32(color.r, color.g, color.b, alpha);
}

function colorHexShade(hex, percent){
	var rgba = hexToRgb(hex);
	var R = rgba.r;
	var G = rgba.g;
	var B = rgba.b;
	if ( percent < 0 ){
		R = parseInt(R - (256 - R) * percent / 100);
		G = parseInt(G - (256 - G) * percent / 100);
		B = parseInt(B - (256 - B) * percent / 100);
	} else if ( percent > 0 ){
		R = parseInt(R - R * percent / 100);
		G = parseInt(G - G * percent / 100);
		B = parseInt(B - B * percent / 100);
	}
    R = limitNumber(R, 0, 255);
    G = limitNumber(G, 0, 255);
    B = limitNumber(B, 0, 255);
    return RGBToHex(R, G, B);
}

function colorShade(rgba, percent){
	var R = rgba.r;
	var G = rgba.g;
	var B = rgba.b;
	var A = rgba.a;
	if ( percent < 0 ){
		R = parseInt(R - (256 - R) * percent / 100);
		G = parseInt(G - (256 - G) * percent / 100);
		B = parseInt(B - (256 - B) * percent / 100);
	} else if ( percent > 0 ){
		R = parseInt(R - R * percent / 100);
		G = parseInt(G - G * percent / 100);
		B = parseInt(B - B * percent / 100);
	}
    R = limitNumber(R, 0, 255);
    G = limitNumber(G, 0, 255);
    B = limitNumber(B, 0, 255);
    return { r : R, g : G, b : B, a : A };
}

function color32Shade(rgb, percent){
	var R = rgb.r;
	var G = rgb.g;
	var B = rgb.b;
	if ( percent < 0 ){
		R = parseInt(R - (256 - R) * percent / 100);
		G = parseInt(G - (256 - G) * percent / 100);
		B = parseInt(B - (256 - B) * percent / 100);
	} else if ( percent > 0 ){
		R = parseInt(R - R * percent / 100);
		G = parseInt(G - G * percent / 100);
		B = parseInt(B - B * percent / 100);
	}
    R = limitNumber(R, 0, 255);
    G = limitNumber(G, 0, 255);
    B = limitNumber(B, 0, 255);
    return colorRGBTo32BitSolid(R, G, B);
}

// Color to Gradient Array, start = shading -100~100; -100 lighter, +100 darker in percentage.
function getGradient(width, rgba, start, end, type = "linear"){
	let gradient = [], px;
	if ( type == "linear" || width == 2){
		for (px = 0; px < width; ++px) {
			gradient[px] = colorShade(rgba, mapNumberToRange(px, 0, width-1, start, end));
		}
	} else if ( type == "3d" ){
		[start, end] = [end,start];
		let half = Math.ceil(width/2)-1;
		let right = width - half;
		for (px = 0; px < right; ++px) {
			gradient[width-px-1] = colorShade(rgba, mapNumberToRange(px, 0, right-1, start, end));
		}
		for (px = 0; px < half; ++px) {
			gradient[px] = gradient[width-px-1];
		}
	}
	return gradient;
}

// Color to Gradient Array, start = shading -100~100; -100 lighter, +100 darker in percentage.
function getGradient32(width, rgba, start, end, type = "linear"){

	let gradient = [], px;
	if ( type == "linear" || width == 2){
		for (px = 0; px < width; ++px) {
			gradient[px] = color32Shade(rgba, mapNumberToRange(px, 0, width-1, start, end));
		}
	} else if ( type == "3d" ){
		[start, end] = [end,start];
		let half = Math.ceil(width/2)-1;
		let right = width - half;
		for (px = 0; px < right; ++px) {
			gradient[width-px-1] = color32Shade(rgba, mapNumberToRange(px, 0, right-1, start, end));
		}
		for (px = 0; px < half; ++px) {
			gradient[px] = gradient[width-px-1];
		}
	}
	return gradient;
}

// String Functions
String.prototype.in = function (...args) {
    return args.indexOf(this.toString()) > -1;
};

// Number Functions
Number.prototype.in = function (...args) {
    return args.indexOf(this) > -1;
};

function rgba32_rgba(uint32){

	var a = uint32 >> 24 & 255;
	var b = uint32 >> 16 & 255;
	var g = uint32 >> 8 & 255;
	var r = uint32 >> 0 & 255;
	return [r, g, b, a];

}

function rgba32_tinyColor(uint32){
	var a = uint32 >> 24 & 255;
	var b = uint32 >> 16 & 255;
	var g = uint32 >> 8 & 255;
	var r = uint32 >> 0 & 255;
	a = mapLimit(a, 0, 255, 0, 100);
	return tinycolor({ r:r, g:g, b:b}).lighten(100-a);
}

function rgba_rgba32(arr){
	var r = arr[0];
	var g = arr[1];
	var b = arr[2];
	var a = arr[3];
	console.log(arr);
	console.log(a << 24 | b << 16 | g << 8 | r << 0);
	console.log(rgba32_rgba(a << 24 | b << 16 | g << 8 | r << 0));
	return a << 24 | b << 16 | g << 8 | r << 0;
}

function mapLimit(input, minInput, maxInput, minOutput, maxOutput){
	if ( input < minInput){
		output = minOutput;
	} else if ( input > maxInput){
		output = maxOutput;
	} else {
		output = minOutput + (input - minInput) * ( maxOutput - minOutput ) / ( maxInput - minInput );
	}

	return output;
}

// color brightness 0-255 255 is brightest
function colorBrightness(r, g, b){
	return (r * 299 + g * 587 + b * 114) / 1000;
}

function colorBrightness32(rgba32){
	var a = rgba32 >> 24 & 255;
	var b = rgba32 >> 16 & 255;
	var g = rgba32 >> 8 & 255;
	var r = rgba32 >> 0 & 255;
	return (r * 299 + g * 587 + b * 114 ) / 1000 * a / 255;
}

function color32ToRGB(uint32){
	var [a,b,g,r] = convertNumberBase([uint32], 32, 256);
	var amt = a - 255;
    r = r-amt > 255 ? 255 : r-amt;
    g = g-amt > 255 ? 255 : g-amt;
    b = b-amt > 255 ? 255 : b-amt;
    return [r, g, b];
}

// RGBA with Alpha 0-255
function color32ToRGBA(uint32){
	var [a,b,g,r] = convertNumberBase([uint32], 32, 256);
    return [r, g, b, a];
}

// RGBA with Alpha 0-1
function color32ToRGBA2(uint32){
	var [a,b,g,r] = convertNumberBase([uint32], 32, 256);
    return [r, g, b, Math.floor(a/255)];
}

function colorRGBTo32BitSolid(r, g, b){
	return Number(convertNumberBase([255,b,g,r], 256, 10).join(""));
}

function rgbaToColor32(r, g, b, a = 255){
	return Number(convertNumberBase([a,b,g,r], 256, 10).join(""));
}

function color32BitAlphaTo32BitSolid(uint32){
	var [r,g,b] = color32ToRGB(uint32);
    return Number(convertNumberBase([255,b,g,r], 256, 10).join(""));
}

function color32ToTinyColor(uint32){
	var [r,g,b] = color32ToRGB(uint32);
	return tinycolor({ r:r, g:g, b:b});

}

function RGBToHex(r,g,b) {
	r = r.toString(16);
	g = g.toString(16);
	b = b.toString(16);
	if (r.length == 1)
		r = "0" + r;
	if (g.length == 1)
		g = "0" + g;
	if (b.length == 1)
		b = "0" + b;
	return "#" + r + g + b;
}

// divide array to array of chunk arrays of specified lengs
function chunk(a, l) { 
    if (a.length == 0) return []; 
    else return [a.slice(0, l)].concat(chunk(a.slice(l), l)); 
}


// -------------------------------------------------------------
// Return Context ----------------------------------------------
// -------------------------------------------------------------
function getCtx(instanceId, parentId, canvasId, canvasW, canvasH, visible = true){

	var pixelRatio = 1;
	var parent = $("#"+parentId);
	if ( parent.has("#"+canvasId).length == 0 ){
		$("<canvas/>", {"id":canvasId}).appendTo(parent);
	}
	var canvas = $("#"+canvasId);
	var ctx = canvas[0].getContext("2d");
	window[canvasId] = document.getElementById(canvasId);
	if ( visible ){
		pixelRatio = wd_getPixelRatio();
		parent.addClass("graph-container");
		canvas.addClass("graph-canvas");
		canvas.width = canvasW + "px";
	    canvas.height = canvasH + "px";
	}
	canvas[0].width = Math.floor(canvasW * pixelRatio);
	canvas[0].height = Math.floor(canvasH * pixelRatio);
	return ctx;
}

// Gradient (20, 0, "#FFF", 0.5, "#000", 1, "#FF0000")
function gradient32Arr(w, ...colorStop){
	var ctx = getCtx(200,"noshow", "g_tempCanvas", w, 1);
	var gradient = ctx.createLinearGradient(0,0,w,0);
	if ( w == 2){
		gradient.addColorStop(0, colorStop[3]);
		gradient.addColorStop(1, colorStop[1]);
	} else {
		for (var i = 0; i < colorStop.length; i += 2) {
			gradient.addColorStop(colorStop[i], colorStop[i+1]);
		}
	}
	ctx.fillStyle = gradient;
	ctx.fillRect(0,0,w,1);
	var imagedata = ctx.getImageData(0, 0, w, 1);
	return new Uint32Array(imagedata.data.buffer);
}

// Gradient (20, 0, "#FFF", 0.5, "#000", 1, "#FF0000")
function getGradientData(w, ...colorStop){
	var ctx = getCtx(200,"noshow", "g_tempCanvas", w, 1);
	var gradient = ctx.createLinearGradient(0,0,w,0);
	if ( w == 2){
		gradient.addColorStop(0, colorStop[3]);
		gradient.addColorStop(1, colorStop[1]);
	} else {
		for (var i = 0; i < colorStop.length; i += 2) {
			gradient.addColorStop(colorStop[i], colorStop[i+1]);
		}
	}
	ctx.fillStyle = gradient;
	ctx.fillRect(0,0,w,1);
	var imagedata = ctx.getImageData(0, 0, w, 1);
	return imagedata.data;
}

//
function getPixelRGBA(data, index){
	index = index * 4;
	return {r:data[index], g:data[index+1], b:data[index+2], a:data[index+3]};
}

function getPixelData(data, index){
	index = index * 4;
	return [data[index], data[index+1], data[index+2], data[index+3]];
}

// Gradient (20, 0, "#FFF", 0.5, "#000", 1, "#FF0000")
function gradient32Arr2(w, ...colorStop){
	console.log(arguments);
	var ctx = getCtx(200,"noshow", "g_tempCanvas", w, 1);
	var gradient = ctx.createLinearGradient(0,0,w,0);
	if ( w == 2){
		gradient.addColorStop(0, colorStop[3]);
		gradient.addColorStop(1, colorStop[1]);
	} else {
		for (var i = 0; i < colorStop.length; i += 2) {
			gradient.addColorStop(colorStop[i], colorStop[i+1]);
		}
	}
	ctx.fillStyle = gradient;
	ctx.fillRect(0,0,w,1);
	var imagedata = ctx.getImageData(0, 0, w, 1);
	return new Uint32Array(imagedata.data.buffer);
}

// -------------------------------------------------------------
// Weave Functions ---------------------------------------------
// -------------------------------------------------------------
function threading1D_threading2D8(threading1D){
	var ends = threading1D.length;
	var shafts = Math.max(...threading1D);
	var threading2D8 = newArray2D8(33, ends, shafts);
	threading1D.forEach(function(shaft, i) {
		threading2D8[i][shaft - 1] = 1;
	});
	return threading2D8;
}

function threading2D8_threading1D(threading2D8){
	return threading2D8.map(a => a.indexOf(1)+1);
}

function treadling2D8_treadling1D(treadling2D8){
	return treadling2D8.rotate2D8("r").flip2D8("y").map(a => a.indexOf(1)+1);
}

function countPlainPoints(weave2D8){
	var l, r, b, t, tl, bl, tr, br, state, lx, rx, ty, by;
	var w = weave2D8.length;
	var h = weave2D8[0].length;
	var counter = 0;
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {

			state = weave2D8[x][y];
			lx = loopNumber(x-1, w);
			rx = loopNumber(x+1, w);
			ty = loopNumber(y+1, h);
			by = loopNumber(y-1, h);

			l = weave2D8[lx][y];
			r = weave2D8[rx][y];
			t = weave2D8[x][ty];
			b = weave2D8[x][by];
			tl = weave2D8[lx][ty];
			bl = weave2D8[lx][by];
			tr = weave2D8[rx][ty];
			br = weave2D8[rx][by];

			if ( state == tl && state == tr && state == bl && state == br && state !== l && state !== r && state !== b && state !== t){
				counter++
			}
		}
	}
	return Math.round(counter / (w * h) * 100);
}

function getWeaveFromParts(tieup, threading, lifting){
	// console.log("getWeaveFromParts");
	var x, y, shaft, treadle;
	var ends = threading.length;
	var picks = lifting[0].length;
	var threading1D = threading2D8_threading1D(threading);
	var weave = newArray2D8(34, ends, picks);

	if ( tieup ){
		var treadling1D = treadling2D8_treadling1D(lifting);
		for (var x = 0; x < ends; x++) {
			shaft = threading1D[x];
			for (var y = 0; y < picks; y++) {
				treadle = treadling1D[y];
				if ( shaft && treadle && tieup[treadle-1] !== undefined && tieup[treadle-1][shaft-1] !== undefined ){
					weave[x][y] = tieup[treadle-1][shaft-1];
				}
			}
		}
	} else {
		threading1D.forEach(function(v, i) {
			if ( v && lifting[v-1] == undefined ){
				weave[i] = new Uint8Array(picks);
			} else {
				weave[i] = lifting[v-1];
			}
		});
	}
	return weave;
}

function wd_getPixelRatio(){
	return window.devicePixelRatio;
}

function averageHex(hex1, hex2){

	// Keep helper stuff in closures
	var reSegment = /[\da-z]{2}/gi;

	// If speed matters, put these in for loop below
	function dec2hex(v) {return v.toString(16);}
	function hex2dec(v) {return parseInt(v,16);}

	// Split into parts
	var b1 = hex1.match(reSegment);
	var b2 = hex2.match(reSegment);
	var t, c = [];

	// Average each set of hex numbers going via dec
	// always rounds down
	for (var i=b1.length; i;) {
	  t = dec2hex( (hex2dec(b1[--i]) + hex2dec(b2[i])) >> 1 );

	  // Add leading zero if only one character
	  c[i] = t.length == 2? "" + t : "0" + t; 
	}
	return  c.join("");

}

Array.prototype.tileFill = function(canvasW, canvasH = false, xOffset = 0, yOffset = 0) {

	//console.log(["xOffset", xOffset, "yOffset", yOffset]);

	var x, y, res;
	var tile = this;
	var tileW = tile !== undefined ? tile.length : 0;
	var translatedx, translatedy;

	// offsetx -1 will shift weave to left
	
	// if 2D Array
	if(canvasH){

		res = tile[0] !== undefined && tile[0] instanceof Uint8Array ? newArray2D8(35, canvasW, canvasH) : newArray2D(canvasW, canvasH);
		var tileH = tile[0] !== undefined ? tile[0].length : 0;
		for (x = 0; x < canvasW; x++) {
			for (y = 0; y < canvasH; y++) {
				translatedx = loopNumber(x-xOffset, tileW);
				translatedy = loopNumber(y-yOffset, tileH);
				res[x][y] = tile[translatedx][translatedy];
			}
		}

	// if 1D Array
	} else {

		res = tile !== undefined && tile instanceof Uint8Array ? new Uint8Array(canvasW) : [];
		for (x = 0; x < canvasW; x++) {
			res.push(tile[x % tileW]);
		}

	}
	return res;
}

function nearestPow2(num){
  return Math.pow(2, Math.round(Math.log(num)/Math.log(2))); 
}

function getSubGradient(sourceGradient32, width, style = "linear"){

	var shadeIndex;
	var resultGradient32 = new Uint32Array(width);
	var sourceGradient32L = sourceGradient32.length;
	if ( style == "linear"){
		for (var n = 0; n < width; n++) {
			shadeIndex = Math.ceil(sourceGradient32L/(width+1)*(n+1))-1;
			resultGradient32[n] = sourceGradient32[shadeIndex];
		}
	} else if ( style == "3d"){
		for (var n = 0; n < width; n++) {
			shadeIndex = Math.ceil(sourceGradient32L/(width+1)*(n+1))-1;
			resultGradient32[n] = sourceGradient32[shadeIndex];
		}
	}
	return resultGradient32;

}

function getSubGradientData(src, width, style = "linear"){
	var shadei;
	var res = new Uint8ClampedArray(width*4);
	var srcL = src.length/4;
	for (var n = 0; n < width; n++) {
		shadei = Math.ceil(srcL/(width+1)*(n+1))-1;
		res.set(getPixelData(src, shadei), n*4);
	}
	return res;
}

function arrayMin(arr) {
  var len = arr.length, min = Infinity;
  while (len--) {
    if (arr[len] < min) {
      min = arr[len];
    }
  }
  return min;
};

function arrayMax(arr) {
  var len = arr.length, max = -Infinity;
  while (len--) {
    if (arr[len] > max) {
      max = arr[len];
    }
  }
  return max;
};

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

function rgbToHsl(rgba) {
  var r = rgba.r/255, g = rgba.g/255, b = rgba.b/255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  //return new Array(h * 360, s * 100, l * 100);
  return {h: h*360, s: s*100, l: l*100};
}

function saveFile( blob, filename ) {
	var link = document.createElement("a");
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
	// URL.revokeObjectURL( url ); breaks Firefox...
}
function saveStringAsFile( text, filename ) {
	saveFile( new Blob( [ text ], { type: 'text/plain' } ), filename );
}
function saveArrayBufferAsFile( buffer, filename ) {
	saveFile( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}

function getObjProp(obj, key, def = null ){
	return obj && key && obj.hasOwnProperty(key) ? obj[key] : def;
}

function normalizeToNearestRotation(radians){
	
	var dir = radians >= 0 ? 1 : -1;
	var val = loopNumber(Math.abs(radians), Math.PI * 2);
	if ( val > Math.PI ){
		val = Math.PI * 2 - val;
		dir *= -1;
	}
	return val * dir;
}

function drawImageToCanvas(url, canvas, options, callback){

	var ctx = canvas.getContext("2d");
	var cw = canvas.width;
	var ch = canvas.height;

	options.repeat = getObjProp(options, "repeat", "no-repeat");

	var img = new Image();
	img.onload = function() {

		var pattern = ctx.createPattern(img, options.repeat);
		ctx.rect(0, 0, cw, ch);
		ctx.fillStyle = pattern;
		ctx.fill();

		if (typeof callback === "function" ) { 
			callback(img);
		}
	};
	img.onerror = function() {};
	img.src = url;

}

function ev(input){
	var v;
	var e = $(input);
	var t = e.prop("type");
	if ( t == "checkbox" ){
		v = e.prop("checked");
	} else {
		v = e.val();
		v = isNumeric(v) ? Number(v) : v;
	}
	return v;
}

Array.prototype.scale = function(len) {
	var srci;
    var res = Array(Number(len)).fill(0);
    var ratio = this.length / len;
    for (var i = 0; i < len; i++) {
    	srci = Math.floor(ratio*i);
    	res[i] = this[srci];
    }
    return res;
};

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

